const log = require('node-log')(__filename);
const fsPromises = require('fs').promises;
const path = require('path');
const { DIRECTORY_NAME_METADATA } = require('../constants');

class MediaReadService {

  readAllChildrenFileNames(absolutePath) {
    return fsPromises.readdir(absolutePath).then(files => files.filter(file => file !== DIRECTORY_NAME_METADATA));
  }

  readChildrenWithMetadata(absolutePath) {
    return this.readAllChildrenFileNames(absolutePath).then((fileNames) => {

      return Promise.all(fileNames.map((fileName) => this.readMetadata(`${absolutePath}/${fileName}`).then(metadata => {
        return {
          fileName,
          metadata
        };
      })));
    });
  }

  readMetadataAndChildrenWithMetadata(absolutePath) {
    return fsPromises.readdir(absolutePath)
      .then(files => {
        log(`Read files ${files}`);

        return this.readMetadata(absolutePath).then((metadata) => {
          return this.readChildrenWithMetadata(absolutePath).then((children) => {
            return {
              metadata,
              children
            };
          });
        });
      });
  }

  readMetadataAndChildren(absolutePath) {
    return fsPromises.readdir(absolutePath)
      .then(files => {
        log(`Read files ${files}`);

        return this.readMetadata(absolutePath).then((metadata) => {
          return this.readAllChildrenFileNames(absolutePath).then((fileNames) => {
            return {
              metadata,
              fileNames
            };
          });
        });
      });
  }

  readMetadata(absolutePath) {
    const metadataDirectory = path.join(absolutePath, DIRECTORY_NAME_METADATA);

    log(`Attempting to get stat for ${metadataDirectory}`);

    return fsPromises.stat(metadataDirectory).then(stat => {
      if (!stat.isDirectory()) {
        return Promise.reject(new Error('metadata was not a directory'));
      }

      log('Found metadata directory:', metadataDirectory);

      return fsPromises.readFile(`${metadataDirectory}/metadata.json`, 'utf-8').then((data) => {
        return JSON.parse(data);
      });
    });
  }
}

module.exports = MediaReadService;
