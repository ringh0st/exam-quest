import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { createTestDatabase } from './db.mjs';

const lina = '11111111-1111-4111-8111-111111111111';
const omar = '22222222-2222-4222-8222-222222222222';

let db;

before(async () => {
  db = await createTestDatabase();
  await db.query(
    `insert into auth.users (id, email) values ($1, 'lina@example.test'), ($2, 'omar@example.test')`,
    [lina, omar],
  );
  // Seed as the server: one exam, source, lesson, quiz item and flashcard for each student.
  for (const user of [lina, omar]) {
    const [exam] = await db.query(
      `insert into public.exams (user_id, subject_kind, subject_id, exam_date)
       values ($1, 'known', 'biology', '2026-11-20') returning id`,
      [user],
    );
    const [source] = await db.query(
      `insert into public.sources (user_id, exam_id, kind) values ($1, $2, 'scan') returning id`,
      [user, exam.id],
    );
    await db.query(
      `insert into public.source_pages (user_id, source_id, page_number, text_content)
       values ($1, $2, 1, 'Light hits the chlorophyl')`,
      [user, source.id],
    );
    const [lesson] = await db.query(
      `insert into public.lessons (user_id, source_id, level_index, title, content, model, prompt_version)
       values ($1, $2, 0, 'The two stages', '{"cards": []}', 'test-model', 'v1') returning id`,
      [user, source.id],
    );
    await db.query(
      `insert into public.quiz_items (user_id, lesson_id, position, question, choices, answer_index)
       values ($1, $2, 0, 'Where does the oxygen come from?', '["CO2", "Water"]', 1)`,
      [user, lesson.id],
    );
    await db.query(
      `insert into public.flashcards (user_id, source_id, front, back) values ($1, $2, 'Stroma', 'Fluid')`,
      [user, source.id],
    );
  }
});

after(async () => {
  await db?.close();
});

const idOf = async (table, user) =>
  (await db.query(`select id from public.${table} where user_id = $1 limit 1`, [user]))[0].id;

describe('row-level security', () => {
  it('is enabled on every table in the public schema', async () => {
    const tables = await db.query(
      `select c.relname, c.relrowsecurity from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r'`,
    );
    assert.ok(tables.length >= 12);
    for (const table of tables)
      assert.equal(table.relrowsecurity, true, `${table.relname} has RLS off`);
  });

  it('lets a student see only their own rows, in every table', async () => {
    for (const table of [
      'exams',
      'sources',
      'source_pages',
      'lessons',
      'quiz_items',
      'flashcards',
    ]) {
      const rows = await db.asStudent(lina, `select user_id from public.${table}`);
      assert.ok(rows.length > 0, `${table}: Lina sees her rows`);
      assert.ok(
        rows.every((row) => row.user_id === lina),
        `${table}: Lina sees only her rows`,
      );
    }
    const [profile] = await db.asStudent(lina, `select id from public.profiles`);
    assert.equal(profile.id, lina);
  });

  it('shows nothing to signed-out requests', async () => {
    for (const table of ['profiles', 'exams', 'sources', 'lessons', 'xp_events']) {
      assert.deepEqual(await db.asAnon(`select * from public.${table}`), [], table);
    }
  });

  it('creates a profile when someone signs up', async () => {
    const [profile] = await db.query(`select country from public.profiles where id = $1`, [omar]);
    assert.equal(profile.country, 'FI');
  });
});

describe('profiles', () => {
  it("lets a student record accepting the terms on their own profile, but not on anyone else's", async () => {
    const [accepted] = await db.asStudent(
      lina,
      `update public.profiles set terms_accepted_at = now() where id = $1 returning terms_accepted_at`,
      [lina],
    );
    assert.ok(accepted.terms_accepted_at);
    assert.deepEqual(
      await db.asStudent(
        lina,
        `update public.profiles set terms_accepted_at = now() where id = $1 returning id`,
        [omar],
      ),
      [],
    );
    const [omars] = await db.query(`select terms_accepted_at from public.profiles where id = $1`, [
      omar,
    ]);
    assert.equal(omars.terms_accepted_at, null);
  });
});

describe('exams', () => {
  it('lets a student add an exam for themselves', async () => {
    const [exam] = await db.asStudent(
      lina,
      `insert into public.exams (subject_kind, custom_subject, exam_date)
       values ('custom', 'Music', '2026-12-01') returning user_id`,
    );
    assert.equal(exam.user_id, lina);
  });

  it("does not let a student add an exam to someone else's account", async () => {
    await assert.rejects(
      db.asStudent(
        lina,
        `insert into public.exams (user_id, subject_kind, subject_id, exam_date)
         values ($1, 'known', 'math', '2026-12-01')`,
        [omar],
      ),
      /row-level security/,
    );
  });

  it("cannot change or delete another student's exam", async () => {
    const omarsExam = await idOf('exams', omar);
    assert.deepEqual(
      await db.asStudent(
        lina,
        `update public.exams set topic = 'hacked' where id = $1 returning id`,
        [omarsExam],
      ),
      [],
    );
    assert.deepEqual(
      await db.asStudent(lina, `delete from public.exams where id = $1 returning id`, [omarsExam]),
      [],
    );
  });

  it('rejects a custom subject without a name', async () => {
    await assert.rejects(
      db.asStudent(
        lina,
        `insert into public.exams (subject_kind, custom_subject, exam_date) values ('custom', '  ', '2026-12-01')`,
      ),
      /exams_subject_shape/,
    );
  });
});

describe('study material', () => {
  it("cannot link a source to another student's exam", async () => {
    const omarsExam = await idOf('exams', omar);
    await assert.rejects(
      db.asStudent(lina, `insert into public.sources (exam_id, kind) values ($1, 'scan')`, [
        omarsExam,
      ]),
      /foreign key/,
    );
  });

  it('lets a student fix the text of their own page, but not anyone else’s', async () => {
    const linasPage = await idOf('source_pages', lina);
    const omarsPage = await idOf('source_pages', omar);
    const [fixed] = await db.asStudent(
      lina,
      `update public.source_pages set text_content = 'Light hits the chlorophyll' where id = $1 returning text_content`,
      [linasPage],
    );
    assert.equal(fixed.text_content, 'Light hits the chlorophyll');
    assert.deepEqual(
      await db.asStudent(
        lina,
        `update public.source_pages set text_content = 'x' where id = $1 returning id`,
        [omarsPage],
      ),
      [],
    );
  });

  it('does not let a student change a source status or kind (only the server pipeline does)', async () => {
    const linasSource = await idOf('sources', lina);
    for (const change of [`status = 'ready'`, `kind = 'topic'`]) {
      await assert.rejects(
        db.asStudent(lina, `update public.sources set ${change} where id = $1`, [linasSource]),
        /permission denied/,
        change,
      );
    }
    const [source] = await db.query(`select status, kind from public.sources where id = $1`, [
      linasSource,
    ]);
    assert.deepEqual(source, { status: 'uploaded', kind: 'scan' });
  });

  it('only accepts new sources in the uploaded state', async () => {
    await assert.rejects(
      db.asStudent(lina, `insert into public.sources (kind, status) values ('paste', 'ready')`),
      /row-level security/,
    );
  });
});

describe('library', () => {
  // Setup runs as the server; each student query is rolled back afterwards (see db.mjs).
  const addSubject = (user, name) =>
    db
      .query(`insert into public.subjects (user_id, name) values ($1, $2) returning id`, [
        user,
        name,
      ])
      .then(([row]) => row.id);
  const addUnit = (user, subjectId, title) =>
    db
      .query(
        `insert into public.units (user_id, subject_id, title) values ($1, $2, $3) returning id`,
        [user, subjectId, title],
      )
      .then(([row]) => row.id);

  it('lets a student create subjects and units', async () => {
    const [subject] = await db.asStudent(
      lina,
      `insert into public.subjects (name, unit_label) values ('Calculus I', 'lecture')
       returning name, unit_label, level, tint`,
    );
    assert.deepEqual(subject, {
      name: 'Calculus I',
      unit_label: 'lecture',
      level: 'standard',
      tint: 'violet',
    });
    const biology = await addSubject(lina, 'Biology');
    const [unit] = await db.asStudent(
      lina,
      `insert into public.units (subject_id, title) values ($1, 'Chapter 3') returning title`,
      [biology],
    );
    assert.equal(unit.title, 'Chapter 3');
  });

  it('lets a student sort and rename their material', async () => {
    const subject = await addSubject(lina, 'Biology');
    const unit = await addUnit(lina, subject, 'Chapter 3: Photosynthesis');
    const [sorted] = await db.asStudent(
      lina,
      `update public.sources set subject_id = $1, unit_id = $2, title = 'Notes 12 Nov'
       where id = $3 returning subject_id, unit_id, title`,
      [subject, unit, await idOf('sources', lina)],
    );
    assert.deepEqual(sorted, { subject_id: subject, unit_id: unit, title: 'Notes 12 Nov' });
  });

  it("keeps each student's subjects and units private", async () => {
    const subject = await addSubject(lina, 'Secret diary of a biologist');
    await addUnit(lina, subject, 'Week 1');
    assert.deepEqual(
      await db.asStudent(omar, `select id from public.subjects where id = $1`, [subject]),
      [],
    );
    assert.deepEqual(
      await db.asStudent(omar, `select id from public.units where subject_id = $1`, [subject]),
      [],
    );
    assert.deepEqual(
      await db.asStudent(omar, `update public.subjects set name = 'x' where id = $1 returning id`, [
        subject,
      ]),
      [],
    );
  });

  it("cannot put a unit in someone else's subject or sort material into someone else's unit", async () => {
    const omarsSubject = await addSubject(omar, 'History');
    const omarsUnit = await addUnit(omar, omarsSubject, 'Week 1');
    await assert.rejects(
      db.asStudent(lina, `insert into public.units (subject_id, title) values ($1, 'Sneaky')`, [
        omarsSubject,
      ]),
    );
    await assert.rejects(
      db.asStudent(lina, `update public.sources set subject_id = $1, unit_id = $2 where id = $3`, [
        omarsSubject,
        omarsUnit,
        await idOf('sources', lina),
      ]),
    );
  });

  it("rejects a unit that doesn't belong to the material's subject", async () => {
    const biology = await addSubject(lina, 'Biology 2');
    const mathsUnit = await addUnit(lina, await addSubject(lina, 'Maths'), 'Derivatives');
    const source = await idOf('sources', lina);
    await assert.rejects(
      db.asStudent(lina, `update public.sources set subject_id = $1, unit_id = $2 where id = $3`, [
        biology,
        mathsUnit,
        source,
      ]),
    );
    const [inbox] = await db.asStudent(
      lina,
      `update public.sources set subject_id = null, unit_id = $1 where id = $2 returning unit_id`,
      [mathsUnit, source],
    );
    assert.equal(inbox.unit_id, null, 'material in the inbox has no unit');
  });

  it('accepts the new kinds of material, starting in the inbox', async () => {
    for (const kind of ['upload', 'recording']) {
      const [row] = await db.asStudent(
        lina,
        `insert into public.sources (kind) values ($1) returning kind, subject_id`,
        [kind],
      );
      assert.deepEqual(row, { kind, subject_id: null });
    }
  });

  it('moves material back to the inbox when its subject is deleted', async () => {
    const subject = await addSubject(lina, 'Chemistry');
    const unit = await addUnit(lina, subject, 'Acids');
    const [source] = await db.query(
      `insert into public.sources (user_id, kind, subject_id, unit_id)
       values ($1, 'paste', $2, $3) returning id`,
      [lina, subject, unit],
    );
    const deleted = await db.asStudent(
      lina,
      `delete from public.subjects where id = $1 returning id`,
      [subject],
    );
    assert.equal(deleted.length, 1, 'a student can delete their own subject');

    await db.query(`delete from public.subjects where id = $1`, [subject]);
    const [after] = await db.query(`select subject_id, unit_id from public.sources where id = $1`, [
      source.id,
    ]);
    assert.deepEqual(after, { subject_id: null, unit_id: null });
    assert.deepEqual(await db.query(`select id from public.units where id = $1`, [unit]), []);
  });

  it("links exams to the student's own subject and units only", async () => {
    const subject = await addSubject(lina, 'Physics');
    const unit = await addUnit(lina, subject, 'Lecture 5');
    const exam = await idOf('exams', lina);
    const [linked] = await db.asStudent(
      lina,
      `update public.exams set library_subject_id = $1 where id = $2 returning library_subject_id`,
      [subject, exam],
    );
    assert.equal(linked.library_subject_id, subject);
    const covered = await db.asStudent(
      lina,
      `insert into public.exam_units (exam_id, unit_id) values ($1, $2) returning unit_id`,
      [exam, unit],
    );
    assert.equal(covered.length, 1);

    const omarsUnit = await addUnit(omar, await addSubject(omar, 'Art'), 'Colour');
    await assert.rejects(
      db.asStudent(lina, `insert into public.exam_units (exam_id, unit_id) values ($1, $2)`, [
        exam,
        omarsUnit,
      ]),
    );
    await assert.rejects(
      db.asStudent(lina, `update public.exams set library_subject_id = $1 where id = $2`, [
        await addSubject(omar, 'Music'),
        exam,
      ]),
    );
  });
});

describe('server-only content', () => {
  it('does not let students write lessons, quiz items, flashcards, XP or AI usage', async () => {
    const linasSource = await idOf('sources', lina);
    const linasLesson = await idOf('lessons', lina);
    const attempts = [
      [
        `insert into public.lessons (user_id, source_id, level_index, title, content, model, prompt_version)
         values ($1, $2, 1, 'Fake', '{}', 'm', 'v')`,
        [lina, linasSource],
      ],
      [
        `insert into public.quiz_items (user_id, lesson_id, position, question, choices, answer_index)
         values ($1, $2, 1, 'Q', '["a","b"]', 0)`,
        [lina, linasLesson],
      ],
      [
        `insert into public.flashcards (user_id, source_id, front, back) values ($1, $2, 'f', 'b')`,
        [lina, linasSource],
      ],
      [
        `insert into public.xp_events (user_id, amount, reason) values ($1, 500, 'boss_defeated')`,
        [lina],
      ],
      [
        `insert into public.ai_usage (user_id, step, model, input_tokens, output_tokens, cost_usd_micros)
         values ($1, 'read', 'm', 0, 0, 0)`,
        [lina],
      ],
    ];
    for (const [sql, params] of attempts) {
      await assert.rejects(db.asStudent(lina, sql, params), /row-level security/, sql);
    }
    assert.deepEqual(
      await db.asStudent(lina, `update public.quiz_items set answer_index = 0 returning id`),
      [],
      'quiz answers cannot be edited',
    );
  });

  it('lets the server write them', async () => {
    const [xp] = await db.asService(
      `insert into public.xp_events (user_id, amount, reason) values ($1, 60, 'level_complete') returning amount`,
      [lina],
    );
    assert.equal(xp.amount, 60);
  });

  it('keeps moderation events away from students entirely', async () => {
    await db.query(
      `insert into public.moderation_events (user_id, category, action) values ($1, 'not_study_material', 'blocked')`,
      [lina],
    );
    assert.deepEqual(await db.asStudent(lina, `select * from public.moderation_events`), []);
  });

  it('rejects XP that is not earned (zero, negative or huge)', async () => {
    for (const amount of [0, -10, 100000]) {
      await assert.rejects(
        db.asService(
          `insert into public.xp_events (user_id, amount, reason) values ($1, $2, 'quiz_correct')`,
          [lina, amount],
        ),
        /check constraint/,
      );
    }
  });
});

describe('spaced repetition', () => {
  it('lets a student save card state and review history for their own cards only', async () => {
    const linasCard = await idOf('flashcards', lina);
    const omarsCard = await idOf('flashcards', omar);
    const [state] = await db.asStudent(
      lina,
      `insert into public.card_states (flashcard_id, due, stability, difficulty) values ($1, now(), 1, 5) returning user_id`,
      [linasCard],
    );
    assert.equal(state.user_id, lina);
    await assert.rejects(
      db.asStudent(
        lina,
        `insert into public.card_states (flashcard_id, due, stability, difficulty) values ($1, now(), 1, 5)`,
        [omarsCard],
      ),
      /foreign key/,
    );
  });

  it('keeps review history append-only', async () => {
    const linasCard = await idOf('flashcards', lina);
    await db.query(
      `insert into public.review_logs (user_id, flashcard_id, rating, state, elapsed_days, scheduled_days)
       values ($1, $2, 3, 2, 1, 2)`,
      [lina, linasCard],
    );
    assert.deepEqual(await db.asStudent(lina, `delete from public.review_logs returning id`), []);
    assert.deepEqual(
      await db.asStudent(lina, `update public.review_logs set rating = 4 returning id`),
      [],
    );
  });
});

describe('account deletion', () => {
  it('removes everything that belongs to the student', async () => {
    const tables = [
      'profiles',
      'subjects',
      'units',
      'exams',
      'exam_units',
      'sources',
      'source_pages',
      'lessons',
      'quiz_items',
      'flashcards',
      'card_states',
      'review_logs',
      'xp_events',
      'moderation_events',
    ];
    await db.query(`delete from auth.users where id = $1`, [lina]);
    for (const table of tables) {
      const column = table === 'profiles' ? 'id' : 'user_id';
      const rows = await db.query(`select 1 from public.${table} where ${column} = $1`, [lina]);
      assert.equal(rows.length, 0, `${table} still has rows`);
    }
    const omars = await db.query(`select 1 from public.exams where user_id = $1`, [omar]);
    assert.equal(omars.length, 1, "other students' data is untouched");
  });
});
