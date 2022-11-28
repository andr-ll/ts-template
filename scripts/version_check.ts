/* eslint-disable @typescript-eslint/no-var-requires */
import { IncomingMessage } from 'http';
import * as https from 'https';

const updatedVersion = require('../package.json').version as string;
const MASTER_PACKAGE_JSON_URL =
  'https://raw.githubusercontent.com/andr-ll/cryl/master/package.json';

const semanticVersions = ['major', 'minor', 'patch'];

https.get(MASTER_PACKAGE_JSON_URL, async (res: IncomingMessage) => {
  let rawData = '';

  res.on('data', (chunk: string) => {
    rawData += chunk;
  });

  res.on('end', () => {
    try {
      const { version } = JSON.parse(rawData) as { version: string };

      if (version === updatedVersion) {
        throw new Error('Please update semantic version before merging!');
      }

      const masterVersionArr = version.split('.').map((numb) => Number(numb));
      const updatedVersionArr = updatedVersion
        .split('.')
        .map((numb) => Number(numb));

      for (let i = 0; i < 3; i++) {
        const masterValue = masterVersionArr[i];
        const updatedValue = updatedVersionArr[i];
        const semanticVersion = semanticVersions[i];

        if (updatedValue !== masterValue) {
          if (updatedValue < masterValue) {
            throw new Error(
              `The ${semanticVersion} version must not be less than ${masterValue}.`,
            );
          }

          if (updatedValue !== masterValue + 1) {
            throw new Error(
              `The ${semanticVersion} version must be equal to ${
                masterValue + 1
              }.`,
            );
          } else {
            for (let j = i + 1; j < 3; j++) {
              if (updatedVersionArr[j] !== 0) {
                throw new Error(
                  `The ${semanticVersions[j]} version should be equal to 0 after updating ${semanticVersions[i]} version.`,
                );
              }
            }

            break;
          }
        }
      }

      console.log('Semantic versioning is valid.');
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
  });
});
