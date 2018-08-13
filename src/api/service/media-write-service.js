const log = require('node-log')(__filename);
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const rmf = require('rimraf');
const { DIRECTORY_NAME_METADATA } = require('../constants');

class MediaWriteService {

  createMediaDirectory(absolutePath, metadata) {

    if (fs.existsSync(absolutePath)) {
      return Promise.reject(new Error(`Directory ${absolutePath} already exists`));
    }

    const data = JSON.stringify(metadata, null, 4);
    const metadataDirectoryPath = path.join(absolutePath, DIRECTORY_NAME_METADATA);
    const metadataPath = path.join(metadataDirectoryPath, 'metadata.json');

    return fsPromises.mkdir(absolutePath)
      .then(() => fsPromises.mkdir(metadataDirectoryPath))
      .then(() => fsPromises.writeFile(metadataPath, data).catch(() => rmf(absolutePath)))
  }

  writeMetadata(absolutePath, newMetadata) {
    const metadataDirectory = path.join(absolutePath, DIRECTORY_NAME_METADATA);

    log(`Attempting to get stat for ${metadataDirectory}`);

    return fsPromises.stat(metadataDirectory).then(stat => {
      if (!stat.isDirectory()) {
        return Promise.reject(new Error('metadata was not a directory'));
      }

      log('Writing to metadata directory:', metadataDirectory);

      return fsPromises.writeFile(`${metadataDirectory}/metadata.json`, JSON.stringify(newMetadata, null, 4));
    });
  }
}

module.exports = MediaWriteService;
