import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeProviders } from '../src/utils/analyticsProviders.js';

test('initializes providers independently when one fails', async () => {
  const providers = {
    ga4: async () => { throw new Error('blocked'); },
    clarity: async () => true,
  };
  const result = await initializeProviders({}, providers);
  assert.deepEqual(result, { ga4: false, clarity: true });
});

test('reports inactive providers without treating them as initialized', async () => {
  const providers = { ga4: async () => false, clarity: async () => false };
  const result = await initializeProviders({}, providers);
  assert.deepEqual(result, { ga4: false, clarity: false });
});

test('tags Clarity session with ga4_loaded when GA4 fails or loads', async () => {
  const calls = [];
  globalThis.window = { clarity: (...args) => calls.push(args) };
  try {
    await initializeProviders({}, { ga4: async () => { throw new Error('blocked'); }, clarity: async () => true });
    await initializeProviders({}, { ga4: async () => true, clarity: async () => true });
    await initializeProviders({}, { ga4: async () => false, clarity: async () => true });
  } finally {
    delete globalThis.window;
  }
  assert.deepEqual(calls, [['set', 'ga4_loaded', 'false'], ['set', 'ga4_loaded', 'true']]);
});
