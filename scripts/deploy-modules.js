const { spawn } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');

async function executeCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const commandExecution = spawn(command, args || [], {
      stdio: undefined,
      shell: options.shell === undefined ? true : options.shell,
      ...options
    });

    let outputResult = '';

    commandExecution.stdout?.on('data', (data) => {
      const outputStr = data.toString();

      outputResult += outputStr;
      if (options.stream) {
        console.log(outputStr);
      }
    });

    commandExecution.stderr?.on('data', (data) => {
      const outputStr = data.toString();
      // console.error('e --> ', outputStr);
      outputResult += outputStr;
      if (options.stream) {
        console.log(outputStr);
      }

      if (options.shouldThrow) {
        console.error(outputStr);
        throw new Error('Exec error');
      }
    });

    commandExecution.on('error', (error) => {
      console.error('Error! running command', error);
      console.error(error);

      reject(error);
    });

    commandExecution.on('close', (code) => {
      if (outputResult[outputResult.length - 1] === '\n') {
        outputResult = outputResult.substring(0, outputResult.length - 1);
      }
      resolve(outputResult);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const isProd = args[0] === 'prod';

  let allChangedFolders = process.argv.slice(3);

  // Only folders under modules/
  allChangedFolders = allChangedFolders.filter((folder) => !!folder.startsWith('modules/'));

  // Only top-module folders
  allChangedFolders = allChangedFolders.map((folder) => folder.split('/')[1]);

  // Remove duplicates
  allChangedFolders = allChangedFolders.filter(
    (folder, index) => allChangedFolders.indexOf(folder) === index
  );

  console.log('Modules to deploy:', allChangedFolders);

  for (const moduleToDeploy of allChangedFolders) {
    if (!isProd) {
      // modify meta to change display name for designers
      const metaFileContent = JSON.parse(
        readFileSync('./modules/' + moduleToDeploy + '/meta.json', 'utf-8')
      );
      metaFileContent.label = 'DEV-' + metaFileContent.label;

      writeFileSync(
        './modules/' + moduleToDeploy + '/meta.json',
        JSON.stringify(metaFileContent, null, 2)
      );
    } else {
      // make it available to use if PROD, in case of dev, this should be done manually
      const metaFileContent = JSON.parse(
        readFileSync('./modules/' + moduleToDeploy + '/meta.json', 'utf-8')
      );
      metaFileContent.is_available_for_new_content = true;

      writeFileSync(
        './modules/' + moduleToDeploy + '/meta.json',
        JSON.stringify(metaFileContent, null, 2)
      );
    }

    await executeCommand(
      'hs',
      [
        'upload',
        '--mode',
        'publish',
        './modules/' + moduleToDeploy,
        'modules/' + (isProd ? '' : args[0] + '/') + moduleToDeploy
      ],
      { stream: true }
    );
  }
}

main();
