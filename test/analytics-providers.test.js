import assert from 'node:assert/strict';
import test from 'node:test';
import { initializeBetterstack, initializeProviders } from '../src/utils/analyticsProviders.js';

const noBetterstack = { betterstack: async () => false };

test('initializes providers independently when one fails', async () => {
  const providers = {
    ga4: async () => { throw new Error('blocked'); },
    clarity: async () => true,
    ...noBetterstack,
  };
  const result = await initializeProviders({}, providers);
  assert.deepEqual(result, { ga4: false, clarity: true, betterstack: false });
});

test('reports inactive providers without treating them as initialized', async () => {
  const providers = { ga4: async () => false, clarity: async () => false, ...noBetterstack };
  const result = await initializeProviders({}, providers);
  assert.deepEqual(result, { ga4: false, clarity: false, betterstack: false });
});

test('tags Clarity session with ga4_loaded when GA4 fails or loads', async () => {
  const calls = [];
  globalThis.window = { clarity: (...args) => calls.push(args) };
  try {
    const providers = { clarity: async () => true, ...noBetterstack };
    await initializeProviders({}, { ...providers, ga4: async () => { throw new Error('blocked'); } });
    await initializeProviders({}, { ...providers, ga4: async () => true });
    await initializeProviders({}, { ...providers, ga4: async () => false });
  } finally {
    delete globalThis.window;
  }
  assert.deepEqual(calls, [['set', 'ga4_loaded', 'false'], ['set', 'ga4_loaded', 'true']]);
});

test('skips Better Stack when no token is configured', async () => {
  const result = await initializeBetterstack({ enabled: true, allowedHosts: [] });
  assert.equal(result, false);
});

test('initializes Better Stack RUM when enabled with a valid token', async () => {
  globalThis.window = { location: { hostname: 'blog.example' } };
  globalThis.document = {
    getElementById: () => ({}),
    createElement: () => ({}),
    head: { appendChild: () => {} },
  };
  try {
    const config = {
      enabled: true,
      allowedHosts: ['blog.example'],
      betterstackToken: 'a'.repeat(20),
      betterstackEnvironment: 'production',
    };
    const result = await initializeBetterstack(config);
    assert.equal(result, true);
    assert.deepEqual(Array.from(window.betterstack.q[0]), ['init', { environment: 'production' }]);
  } finally {
    delete globalThis.window;
    delete globalThis.document;
  }
});
