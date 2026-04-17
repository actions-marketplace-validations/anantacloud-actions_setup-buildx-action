const core = require('@actions/core');
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
    const use = core.getInput('use') === 'true';
    const install = core.getInput('install') === 'true';
    const platforms = core.getInput('platforms');
    const qemu = core.getInput('qemu') === 'true';
    const cleanup = core.getInput('cleanup') === 'true';

    const cache = resolveCache();

    core.startGroup('🔍 Docker info');
    await exec.exec('docker', ['version']);
    core.endGroup();

    if (qemu) {
      core.startGroup('⚙️ QEMU setup');
      await exec.exec('docker', ['run', '--rm', '--privileged', 'tonistiigi/binfmt', '--install', 'all']);
      core.endGroup();
    }

    let exists = false;
    await exec.exec('docker', ['buildx', 'inspect', name]).then(() => exists = true).catch(() => {});

    if (!exists) {
      let args = ['buildx', 'create', '--name', name, '--driver', driver];
      if (platforms) args.push('--platform', platforms);
      if (use) args.push('--use');
      await exec.exec('docker', args);
    } else {
      if (use) await exec.exec('docker', ['buildx', 'use', name]);
    }

    await exec.exec('docker', ['buildx', 'inspect', '--bootstrap']);

    if (install) {
      await exec.exec('docker', ['buildx', 'install']);
    }

    core.exportVariable('BUILDX_CACHE_FROM', cache.from);
    core.exportVariable('BUILDX_CACHE_TO', cache.to);

    core.info(`Cache FROM: ${cache.from}`);
    core.info(`Cache TO: ${cache.to}`);

    if (cleanup) {
      core.saveState('cleanup', 'true');
      core.saveState('builderName', name);
    }

    core.setOutput('name', name);
    core.setOutput('cache-from', cache.from);
    core.setOutput('cache-to', cache.to);

  } catch (e) {
    core.setFailed(e.message);
  }
}

run();
