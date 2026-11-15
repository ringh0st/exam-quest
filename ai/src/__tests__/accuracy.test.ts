import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { wordAccuracy, words } from '../accuracy.ts';
import { costMicros } from '../cost.ts';

describe('wordAccuracy', () => {
  it('is 1 for a perfect transcription, ignoring case and punctuation', () => {
    assert.equal(wordAccuracy('Valo hajottaa veden.', 'valo hajottaa veden'), 1);
  });

  it('keeps Finnish letters as part of words', () => {
    assert.deepEqual(words('Yhteyttäminen tapahtuu viherhiukkasissa.'), [
      'yhteyttäminen',
      'tapahtuu',
      'viherhiukkasissa',
    ]);
    assert.equal(wordAccuracy('Yhteyttaminen tapahtuu', 'Yhteyttäminen tapahtuu'), 0.5);
  });

  it('counts missing and extra words', () => {
    assert.equal(wordAccuracy('a b c', 'a b c d'), 0.75);
    assert.equal(wordAccuracy('a b c d e', 'a b c d'), 0.75);
  });
});

describe('costMicros', () => {
  it('prices input, output and cache tokens', () => {
    assert.equal(
      costMicros('claude-opus-5-5', { input_tokens: 1_000_000, output_tokens: 0 }),
      4_000_000,
    );
    assert.equal(
      costMicros('claude-opus-5-5', {
        input_tokens: 0,
        output_tokens: 0,
        cache_read_input_tokens: 1_000_000,
        cache_creation_input_tokens: 1_000_000,
      }),
      200_000 + 5_000_000,
    );
  });

  it('refuses to guess the price of an unknown model', () => {
    assert.throws(() => costMicros('mystery-model', { input_tokens: 1, output_tokens: 1 }));
  });
});
