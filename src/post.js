const core = require('@actions/core');
const exec = require('@actions/exec');

async function cleanup() {
  try {
    const cleanup = core.getState('cleanup') === 'true';
    const name = core.getState('builderName');

    if (cleanup && name) {
      await exec.exec('docker', ['buildx', 'rm', name]);
    }
  } catch (e) {
    core.warning(e.message);
  }
}

cleanup();
