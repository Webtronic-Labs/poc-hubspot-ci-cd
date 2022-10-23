const { spawn } = require('child_process');
const { readFileSync, writeFileSync, existsSync } = require('fs');

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
    // Check type (react template or default)
    let moduleLocation = './modules/' + moduleToDeploy;
    let metaFileLocation = `${moduleLocation}/meta.json`;
    let isNpm = false;

    if (existsSync(moduleLocation + '/package.json')) {
      // Treat as build required process
      isNpm = true;
      await executeCommand(`cd ${moduleLocation} && npm run build`, [], { stream: true });
      moduleLocation = './modules/' + moduleToDeploy + '/dist';
      metaFileLocation = './modules/' + moduleToDeploy + '/dist/modules/app.module/meta.json';
    }

    if (!isProd) {
      modifyJsonFile(metaFileLocation, {
        label: 'DEV-' + JSON.parse(readFileSync(metaFileLocation, 'utf-8')).label
      });
      modifyJsonFile(metaFileLocation, {
        is_available_for_new_content: false
      });
    } else {
      modifyJsonFile(metaFileLocation, {
        is_available_for_new_content: true
      });
    }

    let destination = 'modules/' + (isProd ? '' : 'dev-') + moduleToDeploy;

    console.log(destination);
    if (isNpm) {
      destination = 'modules/' + (isProd ? '' : 'dev-') + moduleToDeploy.replace('.module', '');
    }
    await executeCommand(`cd ${moduleLocation} && hs upload . ${destination}`, [], {
      stream: true
    });
  }
}

function modifyJsonFile(path, override) {
  let jsonFileContent = JSON.parse(readFileSync(path, 'utf-8'));
  jsonFileContent = {
    ...jsonFileContent,
    ...override
  };

  writeFileSync(path, JSON.stringify(jsonFileContent, null, 2));
}

main();
