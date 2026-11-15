import { parseBackendConfig } from '../backend';

const url = 'https://example.supabase.co';
const publishableKey = 'sb_publishable_abc123';

describe('parseBackendConfig', () => {
  it('accepts an https URL and a publishable key', () => {
    expect(parseBackendConfig({ url, publishableKey })).toEqual({
      supabaseUrl: url,
      supabasePublishableKey: publishableKey,
    });
  });

  it('rejects a secret key so it can never ship in the app', () => {
    expect(() => parseBackendConfig({ url, publishableKey: 'sb_secret_abc123' })).toThrow();
  });

  it('rejects missing values and plain http', () => {
    expect(() => parseBackendConfig({ url: undefined, publishableKey })).toThrow();
    expect(() =>
      parseBackendConfig({ url: 'http://example.supabase.co', publishableKey }),
    ).toThrow();
  });
});
