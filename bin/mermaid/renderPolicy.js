import { createHash } from 'node:crypto';
import {
  MERMAID_FONT_FAMILY,
  MERMAID_FONT_IDENTITY,
} from './MermaidFont.js';

export const MERMAID_CLI_VERSION = '11.16.0';
export const MERMAID_BACKGROUND = 'transparent';
export const SVG_OUTPUT_POLICY = 'intrinsic-viewbox-v1';

export const FIXED_MERMAID_CONFIG = Object.freeze({
  securityLevel: 'strict',
  secure: [
    'secure',
    'securityLevel',
    'startOnLoad',
    'maxTextSize',
    'suppressErrorRendering',
    'maxEdges',
    'htmlLabels',
    'theme',
    'themeCSS',
    'themeVariables',
    'fontFamily',
    'deterministicIds',
    'deterministicIDSeed',
  ],
  startOnLoad: false,
  htmlLabels: false,
  theme: 'default',
  fontFamily: MERMAID_FONT_FAMILY,
  deterministicIds: true,
});

const sha256 = value => createHash('sha256').update(value).digest('hex');

export const createRenderSpec = (
  definition,
  outputPolicy = SVG_OUTPUT_POLICY,
  fontIdentity = MERMAID_FONT_IDENTITY,
) => {
  const definitionHash = sha256(definition);
  const mermaidConfig = {
    ...FIXED_MERMAID_CONFIG,
    deterministicIDSeed: definitionHash,
  };
  const policy = JSON.stringify({
    background: MERMAID_BACKGROUND,
    font: fontIdentity,
    output: outputPolicy,
    mermaidConfig,
  });
  return {
    assetHash: sha256(`${MERMAID_CLI_VERSION}\0${policy}\0${definition}`),
    mermaidConfig,
    svgId: `mermaid-${definitionHash}`,
  };
};

export const buildMermaidUrl = (basePath, assetHash) => {
  const prefix = basePath === '/' ? '' : `/${basePath.replace(/^\/|\/$/g, '')}`;
  return `${prefix}/mermaid/${assetHash}.svg`;
};
