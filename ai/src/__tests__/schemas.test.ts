import assert from 'node:assert/strict';
import { it } from 'node:test';

import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';

import { checkResultSchema, questSchema, readResultSchema } from '../schemas.ts';

it('converts every schema to a structured-output format without network access', () => {
  for (const schema of [readResultSchema, questSchema, checkResultSchema]) {
    const format = betaZodOutputFormat(schema) as unknown as { type: string; schema: object };
    assert.equal(format.type, 'json_schema');
    assert.ok(format.schema);
  }
});
