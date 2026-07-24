import fs from 'node:fs';
import { digestFile, projectPaths, readJson, writeJson } from './files.js';
import { verifyYalcPackage } from './yalc.js';

export const readState = projectRoot => {
  const file = projectPaths(projectRoot).state;
  return fs.existsSync(file) ? readJson(file) : {};
};

const corruptEngine = () => new Error('Hydrated engine package is corrupt.');

export const isEngineStateComplete = projectRoot => {
  const state = readState(projectRoot).engine;
  return Boolean(state && Object.hasOwn(state, 'installedPackageDigest'));
};

const assertPackageUnchanged = (hydratedPackage, installedPackage) => {
  if (hydratedPackage.digest !== installedPackage.digest) throw corruptEngine();
};

const createEngineState = (lock, paths, hydratedPackage, installedPackage) => ({
  commit: lock.engine.commit,
  installedPackageDigest: installedPackage.installedDigest,
  packageDigest: hydratedPackage.digest,
  packageLockDigest: digestFile(paths.npmLock),
  signature: installedPackage.signature,
});

export const writeEngineState = (projectRoot, lock, hydratedPackage) => {
  const paths = projectPaths(projectRoot);
  const installedPackage = verifyYalcPackage(projectRoot, lock.engine.package);
  assertPackageUnchanged(hydratedPackage, installedPackage);
  writeJson(paths.state, {
    ...readState(projectRoot),
    engine: createEngineState(lock, paths, hydratedPackage, installedPackage),
  });
};

export const verifyEngineState = (projectRoot, lock) => {
  const paths = projectPaths(projectRoot);
  const state = readState(projectRoot).engine;
  const yalcPackage = verifyYalcPackage(projectRoot, lock.engine.package);
  if (!state || state.commit !== lock.engine.commit) throw new Error('Workspace engine state is stale.');
  if (state.packageDigest !== yalcPackage.digest) throw corruptEngine();
  if (Object.hasOwn(state, 'installedPackageDigest')) {
    if (state.installedPackageDigest !== yalcPackage.installedDigest) throw corruptEngine();
  }
  if (state.packageLockDigest !== digestFile(paths.npmLock)) throw new Error('Tracked npm lock changed after setup.');
  return yalcPackage;
};

export const writeEnhancerState = (projectRoot, lock, yalcPackage) => {
  const paths = projectPaths(projectRoot);
  const state = {
    ...readState(projectRoot),
    enhancer: {
      commit: lock.enhancer.commit,
      packageDigest: yalcPackage.digest,
      signature: yalcPackage.signature,
    },
  };
  writeJson(paths.state, state);
};
