import {
  canRunAnalytics,
  hasValidClarityId,
  hasValidGa4Id,
} from './analyticsConfig.js';
import { ensureGoogleQueue, updateClarityConsent, updateGoogleConsent } from './consentMode.js';

export const loadScript = (id, src) => new Promise((resolve, reject) => {
  if (document.getElementById(id)) return resolve();
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  script.onload = resolve;
  script.onerror = reject;
  document.head.appendChild(script);
});

export const initializeGoogleAnalytics = async config => {
  if (!canRunAnalytics(config) || !hasValidGa4Id(config.ga4MeasurementId)) return false;
  updateGoogleConsent(config, true);
  ensureGoogleQueue();
  window.gtag('js', new Date());
  window.gtag('config', config.ga4MeasurementId, {
    send_page_view: false,
    debug_mode: config.environment === 'test',
    anonymize_ip: true,
  });
  const id = encodeURIComponent(config.ga4MeasurementId);
  await loadScript('blog-ga4', `https://www.googletagmanager.com/gtag/js?id=${id}`);
  return true;
};

export const initializeClarity = async config => {
  if (!canRunAnalytics(config) || !hasValidClarityId(config.clarityProjectId)) return false;
  window.clarity = window.clarity || function clarity() {
    (window.clarity.q = window.clarity.q || []).push(arguments);
  };
  updateClarityConsent(true);
  const id = encodeURIComponent(config.clarityProjectId);
  await loadScript('blog-clarity', `https://www.clarity.ms/tag/${id}`);
  window.clarity('set', 'environment', config.environment);
  return true;
};

// Lets Clarity sessions be filtered by whether gtag.js loaded (e.g. blocked by ad blockers).
const tagGa4LoadInClarity = (ga4Result, clarityActive) => {
  if (!clarityActive || typeof globalThis.window?.clarity !== 'function') return;
  if (ga4Result.status === 'fulfilled' && ga4Result.value !== true) return;
  window.clarity('set', 'ga4_loaded', ga4Result.status === 'fulfilled' ? 'true' : 'false');
};

export const initializeProviders = async (config, providers = {}) => {
  const ga4 = providers.ga4 || initializeGoogleAnalytics;
  const clarity = providers.clarity || initializeClarity;
  const results = await Promise.allSettled([ga4(config), clarity(config)]);
  const status = {
    ga4: results[0].status === 'fulfilled' && results[0].value === true,
    clarity: results[1].status === 'fulfilled' && results[1].value === true,
  };
  tagGa4LoadInClarity(results[0], status.clarity);
  return status;
};
