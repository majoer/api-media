const log = require('node-log')(__filename);
const path = require('path');
const environmentVariables = require('../../environment-variables');
const MediaReadService = require('./media-read-service');
const MediaWriteService = require('./media-write-service');

class MediaService {

  constructor() {
    this.mediaReadService = new MediaReadService();
    this.mediaWriteService = new MediaWriteService();
  }

  getAbsolutePath(relativePath) {
    return path.join(environmentVariables.DIRECTORY_BASE_MEDIA, ...relativePath);
  }

  readMediaDirectory(relativePath) {
    const absolutePath = this.getAbsolutePath(relativePath);

    return this.mediaReadService.readMediaDirectory(absolutePath);
  }

  createMediaDirectory(relativePath, metadata) {
    const absolutePath = this.getAbsolutePath(relativePath);

    return this.mediaWriteService.createMediaDirectory(absolutePath, metadata);
  }
}

module.exports = MediaService;
