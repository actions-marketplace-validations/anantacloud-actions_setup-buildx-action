const core = require('@actions/core');
const exec = require('@actions/exec');

async function builderExists(name) {
  let output = '';

  await exec.exec('docker', ['buildx', 'ls'], {
    silent: true,
    listeners: {
      stdout: (data) => {
        output += data.toString();
      }
    }
  });

  return output.includes(name);
}

async function run() {
  try {
    const name = core.getInput('name') || 'builder';
    const driver = core.getInput('driver') || 'docker-container';
    const platforms = core.getInput('platforms');
    const use = core.getInput('use') === 'true';
    const install = core.getInput('install') === 'true';
    const qemu = core.getInput('qemu') === 'true';
    const cleanup = core.getInput('cleanup') === 'true';

    core.startGroup('🐳 Docker info');
    await exec.exec('docker', ['version']);
    core.endGroup();

    // Enable QEMU (multi-arch)
    if (qemu) {
      core.startGroup('⚙️ Enabling QEMU');
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

    const exists = await builderExists(name);

    if (!exists) {
      core.startGroup('🏗️ Creating builder');

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
      core.info(`Builder "${name}" already exists`);

      if (use) {
        await exec.exec('docker', ['buildx', 'use', name]);
      }
    }

    // Always bootstrap (important!)
    core.startGroup('🚀 Bootstrapping builder');
    await exec.exec('docker', ['buildx', 'inspect', '--bootstrap']);
    core.endGroup();

    // Optional install
    if (install) {
      await exec.exec('docker', ['buildx', 'install']);
    }

    // Save cleanup state
    if (cleanup) {
      core.saveState('cleanup', 'true');
      core.saveState('builderName', name);
    }

    core.setOutput('name', name);

    core.info('✅ Buildx setup completed successfully');

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
