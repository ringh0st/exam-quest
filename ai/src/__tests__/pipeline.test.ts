import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { applyCheck, buildQuest, PipelineError, readPages } from '../pipeline.ts';
import type { Quest } from '../schemas.ts';
import { fakeClient } from './fakeClient.ts';

const citation = { page: 1, quote: 'valo hajottaa veden' };

const quest: Quest = {
  title: 'Fotosynteesi',
  levels: [
    {
      title: 'Kaksi vaihetta',
      cards: [
        {
          heading: 'Valoreaktiot',
          body: 'Valo hajottaa veden.',
          simpler: 'Valo pilkkoo veden.',
          citation,
        },
      ],
      quiz: [
        {
          question: 'Mistä happi tulee?',
          choices: ['Hiilidioksidista', 'Vedestä'],
          answerIndex: 1,
          explanation: 'Vedestä.',
          citation,
        },
        {
          question: 'Missä Calvinin kierto tapahtuu?',
          choices: ['Tylakoideissa', 'Stroomassa'],
          answerIndex: 0,
          explanation: '…',
          citation,
        },
        {
          question: 'Väärä kysymys',
          choices: ['A', 'B'],
          answerIndex: 0,
          explanation: '…',
          citation,
        },
      ],
    },
  ],
  flashcards: [{ front: 'Strooma', back: 'Viherhiukkasen neste', citation }],
};

describe('readPages', () => {
  it('sends each photo as an image block with the cached reading prompt', async () => {
    const { client, requests } = fakeClient([
      {
        parsed_output: { isStudyMaterial: true, rejectionReason: null, language: 'fi', pages: [] },
      },
    ]);
    const result = await readPages(client, [
      { mediaType: 'image/jpeg', data: 'AAAA' },
      { mediaType: 'image/jpeg', data: 'BBBB' },
    ]);

    const request = requests[0] as {
      model: string;
      fallbacks: string;
      betas: string[];
      system: { text: string; cache_control: unknown }[];
      output_config: { effort: string; format: unknown };
      messages: { content: { type: string; source?: { data: string } }[] }[];
    };
    assert.equal(request.model, 'claude-opus-5-5');
    assert.equal(request.fallbacks, 'default');
    assert.deepEqual(request.betas, ['server-side-fallback-2026-07-01']);
    assert.deepEqual(request.system[0]?.cache_control, { type: 'ephemeral' });
    assert.equal(request.output_config.effort, 'high');
    assert.ok(request.output_config.format);
    const images = request.messages[0]?.content.filter((block) => block.type === 'image') ?? [];
    assert.deepEqual(
      images.map((block) => block.source?.data),
      ['AAAA', 'BBBB'],
    );
    assert.equal(result.usage.promptVersion, 'read-v1');
    assert.equal(result.usage.costMicros, 14_000); // 1000 × $4/M + 500 × $20/M = $0.014
  });

  it('refuses to run without pages', () => {
    const { client } = fakeClient([]);
    assert.throws(() => readPages(client, []));
  });

  it('turns a refusal into a clear error instead of reading the output', async () => {
    const { client } = fakeClient([{ parsed_output: null, stop_reason: 'refusal' }]);
    await assert.rejects(readPages(client, [{ mediaType: 'image/png', data: 'x' }]), (error) => {
      assert.ok(error instanceof PipelineError);
      assert.equal(error.reason, 'refusal');
      return true;
    });
  });

  it('reports cut-off and invalid output', async () => {
    const cut = fakeClient([{ parsed_output: null, stop_reason: 'max_tokens' }]);
    await assert.rejects(readPages(cut.client, [{ mediaType: 'image/png', data: 'x' }]), /cut off/);
    const invalid = fakeClient([{ parsed_output: { pages: 'nope' } }]);
    await assert.rejects(
      readPages(invalid.client, [{ mediaType: 'image/png', data: 'x' }]),
      /schema/,
    );
  });
});

describe('applyCheck', () => {
  it('keeps verified questions, corrects fixable ones and removes the rest', () => {
    const verified = applyCheck(quest, {
      items: [
        { level: 0, question: 0, supported: true, correctAnswerIndex: null, note: '' },
        { level: 0, question: 1, supported: false, correctAnswerIndex: 1, note: 'Stroma' },
        {
          level: 0,
          question: 2,
          supported: false,
          correctAnswerIndex: null,
          note: 'Not in material',
        },
      ],
    });
    const quiz = verified.levels[0]?.quiz ?? [];
    assert.equal(quiz.length, 2);
    assert.equal(quiz[1]?.answerIndex, 1);
    assert.equal(verified.correctedQuestions, 1);
    assert.equal(verified.removedQuestions, 1);
  });

  it('removes questions the checker did not return a verdict for', () => {
    const verified = applyCheck(quest, { items: [] });
    assert.equal(verified.levels[0]?.quiz.length, 0);
    assert.equal(verified.removedQuestions, 3);
  });

  it('ignores an out-of-range correction', () => {
    const verified = applyCheck(quest, {
      items: [{ level: 0, question: 0, supported: false, correctAnswerIndex: 7, note: '' }],
    });
    assert.equal(verified.levels[0]?.quiz.length, 0);
  });
});

describe('buildQuest', () => {
  it('writes, then checks every question against the pages', async () => {
    const { client, requests } = fakeClient([
      { parsed_output: quest },
      {
        parsed_output: {
          items: [0, 1, 2].map((question) => ({
            level: 0,
            question,
            supported: true,
            correctAnswerIndex: null,
            note: '',
          })),
        },
      },
    ]);
    const pages = [{ page: 1, text: 'Valoreaktioissa valo hajottaa veden.' }];
    const result = await buildQuest(client, pages, { lessonLanguage: 'source', level: 'lukio' });

    assert.equal(result.quest.levels[0]?.quiz.length, 3);
    assert.deepEqual(
      result.usage.map((usage) => usage.step),
      ['write', 'check'],
    );
    const checkRequest = JSON.stringify(requests[1]);
    assert.match(checkRequest, /Mistä happi tulee\?/, 'question text is sent to the checker');
    assert.match(checkRequest, /markedAnswerIndex/);
    assert.match(JSON.stringify(requests[0]), /same language as the material/);
  });
});
