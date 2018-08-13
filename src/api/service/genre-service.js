const log = require('node-log')(__filename);
const path = require('path');
const MediaReadService = require('./media-read-service');
const MediaWriteService = require('./media-write-service');
const _ = require('lodash');

const DIRECTORY_SERIES_BASE = path.join(process.env.DIRECTORY_BASE_MEDIA, 'series');

class GenreService {

  constructor() {
    this.mediaReadService = new MediaReadService();
  }

  getAllSeriesGenres() {
    return this.mediaReadService.readChildrenWithMetadata(DIRECTORY_SERIES_BASE).then((children) => {
      return _.chain(children)
        .flatMap(child => child.metadata.imdb.genres)
        .uniq();
    });
  }
}

module.exports = GenreService;
