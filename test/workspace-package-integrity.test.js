import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { runDoctor } from '../bin/workspace/doctor.js';
import { projectPaths, writeJson } from '../bin/workspace/files.js';
import { prepareWorkspace } from '../bin/workspace/setup.js';
import { readState, verifyEngineState } from '../bin/workspace/state.js';
import { updateWorkspace } from '../bin/workspace/update.js';
import { verifyYalcPackage } from '../bin/workspace/yalc.js';
import { withWorkspaceIntegrityFixture } from '../test-support/workspaceIntegrityFixture.js';

const changeEngineState = (project, change) => {
  const state = readState(project);
  change(state.engine);
  writeJson(projectPaths(project).state, state);
};

test('setup records the package digest after npm ci', () => (
  withWorkspaceIntegrityFixture(({ installed, project, lock, source }) => {
    prepareWorkspace(project, lock, source);
    assert.ok(fs.existsSync(installed));
    assert.doesNotThrow(() => verifyEngineState(project, lock));
  })
));

test('update retains the post-install package digest', () => (
  withWorkspaceIntegrityFixture(({ installed, project, lock, source }) => {
    updateWorkspace(project, lock, source, { engine: lock.engine.commit });
    assert.ok(fs.existsSync(installed));
    assert.doesNotThrow(() => verifyEngineState(project, lock));
  })
));

test('warm state detects later nested dependency changes', () => (
  withWorkspaceIntegrityFixture(({ installed, project, lock, source }) => {
    prepareWorkspace(project, lock, source);
    fs.writeFileSync(installed, 'changed');
    assert.throws(() => verifyEngineState(project, lock), /Hydrated engine package is corrupt/);
  })
));

test('legacy state passes verification and doctor before setup upgrades it', () => (
  withWorkspaceIntegrityFixture(({ installed, project, lock, source }) => {
    prepareWorkspace(project, lock, source);
    changeEngineState(project, state => delete state.installedPackageDigest);
    fs.writeFileSync(installed, 'legacy dependency');
    assert.doesNotThrow(() => verifyEngineState(project, lock));
    assert.doesNotThrow(() => runDoctor(project, lock, source));
    prepareWorkspace(project, lock, source);
    assert.equal(fs.readFileSync(installed, 'utf8'), 'installed');
    assert.equal(typeof readState(project).engine.installedPackageDigest, 'string');
  })
));

test('legacy full-package digest passes doctor before setup upgrades it', () => (
  withWorkspaceIntegrityFixture(({ project, lock, source }) => {
    prepareWorkspace(project, lock, source);
    const installedDigest = verifyYalcPackage(project, lock.engine.package).installedDigest;
    changeEngineState(project, state => {
      delete state.installedPackageDigest;
      state.packageDigest = installedDigest;
    });
    assert.doesNotThrow(() => runDoctor(project, lock, source));
    prepareWorkspace(project, lock, source);
    assert.equal(typeof readState(project).engine.installedPackageDigest, 'string');
  })
));

test('legacy full-package digest rejects later installed changes', () => (
  withWorkspaceIntegrityFixture(({ installed, project, lock, source }) => {
    prepareWorkspace(project, lock, source);
    const installedDigest = verifyYalcPackage(project, lock.engine.package).installedDigest;
    changeEngineState(project, state => {
      delete state.installedPackageDigest;
      state.packageDigest = installedDigest;
    });
    fs.writeFileSync(installed, 'changed');
    assert.throws(() => runDoctor(project, lock, source), /Hydrated engine package is corrupt/);
  })
));

test('present but incorrect installed digest remains corrupt', () => (
  withWorkspaceIntegrityFixture(({ project, lock, source }) => {
    prepareWorkspace(project, lock, source);
    changeEngineState(project, state => {
      state.installedPackageDigest = '0'.repeat(64);
    });
    assert.throws(() => verifyEngineState(project, lock), /Hydrated engine package is corrupt/);
    assert.throws(() => runDoctor(project, lock, source), /Hydrated engine package is corrupt/);
  })
));

test('setup rejects npm changes to package-owned files', () => (
  withWorkspaceIntegrityFixture(({ project, lock, source }) => {
    assert.throws(
      () => prepareWorkspace(project, lock, source),
      /Hydrated engine package is corrupt/,
    );
  }, { corruptPackage: true })
));

test('update rejects npm changes to package-owned files', () => (
  withWorkspaceIntegrityFixture(({ project, lock, source }) => {
    assert.throws(
      () => updateWorkspace(project, lock, source, { engine: lock.engine.commit }),
      /Hydrated engine package is corrupt/,
    );
  }, { corruptPackage: true })
));
