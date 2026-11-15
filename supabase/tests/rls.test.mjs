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

  it('does not let a student change a source status (only the server pipeline does)', async () => {
    const linasSource = await idOf('sources', lina);
    assert.deepEqual(
      await db.asStudent(
        lina,
        `update public.sources set status = 'ready' where id = $1 returning id`,
        [linasSource],
      ),
      [],
    );
  });

  it('only accepts new sources in the uploaded state', async () => {
    await assert.rejects(
      db.asStudent(lina, `insert into public.sources (kind, status) values ('paste', 'ready')`),
      /row-level security/,
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
      'exams',
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
