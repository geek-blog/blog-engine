import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { prepareWorkspace } from '../bin/workspace/setup.js';
import { verifyEngineState } from '../bin/workspace/state.js';
import { updateWorkspace } from '../bin/workspace/update.js';
import { withWorkspaceIntegrityFixture } from '../test-support/workspaceIntegrityFixture.js';

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
