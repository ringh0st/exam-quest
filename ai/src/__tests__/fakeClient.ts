import type Anthropic from '@anthropic-ai/sdk';

export interface FakeResponse {
  parsed_output: unknown;
  stop_reason?: string;
  model?: string;
  usage?: { input_tokens: number; output_tokens: number };
}

/** A stand-in for the Anthropic client that records requests and returns canned responses. */
export function fakeClient(responses: FakeResponse[]) {
  const requests: Record<string, unknown>[] = [];
  const client = {
    beta: {
      messages: {
        parse: (params: Record<string, unknown>) => {
          requests.push(params);
          const next = responses.shift();
          if (!next) throw new Error('No fake response left');
          return Promise.resolve({
            stop_reason: 'end_turn',
            model: params.model,
            usage: { input_tokens: 1000, output_tokens: 500 },
            ...next,
          });
        },
      },
    },
  };
  return { client: client as unknown as Anthropic, requests };
}
