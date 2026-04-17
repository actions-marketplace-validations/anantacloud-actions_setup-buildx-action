const core = require('@actions/core');
const exec = require('@actions/exec');

function resolveCache() {
  const type = core.getInput('cache-type');
  let from = core.getInput('cache-from');
  let to = core.getInput('cache-to');

  if (from && to) {
    return { from, to };
  }

  if (type === 'gha') {
    return {
      from: 'type=gha',
      to: 'type=gha,mode=max'
    };
  }

  if (type === 'registry') {
    const image = core.getInput('cache-image');
    if (!image) {
      throw new Error('cache-image required for registry cache');
    }

    return {
      from: `type=registry,ref=${image}`,
      to: `type=registry,ref=${image},mode=max`
    };
  }

  if (type === 'local') {
    const dir = core.getInput('cache-dir');
    return {
      from: `type=local,src=${dir}`,
      to: `type=local,dest=${dir},mode=max`
    };
  }

  throw new Error(`Unsupported cache type: ${type}`);
}

async function run() {
  try {
    const name = core.getInput('name');
    const driver = core.getInput('driver');
    const platforms = core.getInput('platforms');
    const qemu = core.getInput('qemu') === 'true';
    const use = core.getInput('use') === 'true';
    const install = core.getInput('install') === 'true';
    const cleanup = core.getInput('cleanup') === 'true';

    const cache = resolveCache();

    core.startGroup('Docker info');
    await exec.exec('docker', ['version']);
    core.endGroup();

    if (qemu) {
      core.startGroup('Enable QEMU');
      await exec.exec('docker', [
        'run',
        '--rm',
        '--privileged',
        'tonistiigi/binfmt',
        '--install',
        'all'
      ]);
      core.endGroup();
    }

    let exists = false;
    try {
      await exec.exec('docker', ['buildx', 'inspect', name]);
      exists = true;
    } catch (_) {}

    if (!exists) {
      core.startGroup('Creating builder');

      const args = ['buildx', 'create', '--name', name, '--driver', driver];

      if (platforms) {
        args.push('--platform', platforms);
      }

      if (use) {
        args.push('--use');
      }

      await exec.exec('docker', args);
      core.endGroup();
    } else {
      core.info(`Builder ${name} already exists`);
      if (use) {
        await exec.exec('docker', ['buildx', 'use', name]);
      }
    }

    core.startGroup('Bootstrapping builder');
    await exec.exec('docker', ['buildx', 'inspect', '--bootstrap']);
    core.endGroup();

    if (install) {
      await exec.exec('docker', ['buildx', 'install']);
    }

    // Export cache
    core.exportVariable('BUILDX_CACHE_FROM', cache.from);
    core.exportVariable('BUILDX_CACHE_TO', cache.to);

    core.setOutput('name', name);
    core.setOutput('cache-from', cache.from);
    core.setOutput('cache-to', cache.to);

    if (cleanup) {
      core.saveState('cleanup', 'true');
      core.saveState('builderName', name);
    }

    core.info(`Cache FROM: ${cache.from}`);
    core.info(`Cache TO: ${cache.to}`);
    core.info('Buildx setup complete ✅');

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
