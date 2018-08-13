const log = require('node-log')(__filename);
const path = require('path');
const fs = require('fs');
const MediaReadService = require('./media-read-service');
const MediaWriteService = require('./media-write-service');
const _ = require('lodash');

const DIRECTORY_BASE = path.join(process.env.DIRECTORY_BASE_MEDIA, 'series');
const FILE_TYPES_SUBTITLE = [];
const FILE_TYPES_EPISODE = ['.mkv', '.avi'];

function filterIf(allSeries, queryParameterValue, filterFn) {
  if (queryParameterValue) {
    return allSeries.filter(filterFn);
  }

  return allSeries;
}

function score(text, query) {
  const lowerText = text.toLocaleLowerCase();
  const lowerQuery = query.toLocaleLowerCase();

  if (lowerText.startsWith(lowerQuery)) {
    return 2;
  } else if (lowerText.includes(lowerQuery)) {
    return 1;
  } else {
    return 0;
  }
}

class SeriesService {

  constructor() {
    this.mediaReadService = new MediaReadService();
    this.mediaWriteService = new MediaWriteService();
  }

  performTextSearch(allSeries, searchQuery) {
    return allSeries.map((series) => {

      if (series.metadata.imdb) {
        return { series, score: score(series.metadata.imdb.title, searchQuery) }
      } else {
        return { series, score: score(series.fileName, searchQuery) }
      }
    })
      .filter(searchResult => searchResult.score > 0)
      .sort((searchResultA, searchResultB) => searchResultA.score - searchResultB.score)
      .map(searchResult => searchResult.series);
  }

  searchForSeries(query) {
    return this.getAllSeries().then(allSeries => {
      log(`Searching among ${allSeries.length} series.`);
      let result = filterIf(allSeries, query.genre, (series) => series.metadata.imdb && _.intersection(series.metadata.imdb.genres, query.genre.split(',')).length);

      log(`Done filtering on genre contains '${query.genre}', ${result.length} left.`);

      if (query.searchQuery) {
        result = this.performTextSearch(result, query.searchQuery);
        log(`Done filtering on searchQuery, ${result.length} left.`);
      }

      return result;
    });
  }

  getAllSeries() {
    return this.mediaReadService.readChildrenWithMetadata(DIRECTORY_BASE).then(children => {
      return children.map(child => {
        return {
          fileName: child.fileName,
          metadata: child.metadata
        };
      });
    });
  }

  getSeries(seriesFileName) {
    return this.mediaReadService.readMetadata(path.join(DIRECTORY_BASE, seriesFileName)).then(metadata => {
      return {
        fileName: seriesFileName,
        metadata
      };
    });
  }

  updateSeries(seriesFileName, metadata) {
    return this.mediaWriteService.writeMetadata(path.join(DIRECTORY_BASE, seriesFileName), metadata);
  }

  getSeasonsInSeries(seriesFileName) {
    return this.mediaReadService.readChildrenWithMetadata(path.join(DIRECTORY_BASE, seriesFileName)).then(children => {
      return children.map(child => {
        return { name: child.fileName };
      });
    });
  }

  getSeasonInSeries(seriesFileName, season) {
    return this.mediaReadService.readMetadata(path.join(DIRECTORY_BASE, seriesFileName, season)).then(metadata => {
      return { name: season };
    });
  }

  getEpisodesInSeasonInSeries(seriesFileName, season) {
    return this.mediaReadService.readChildrenWithMetadata(path.join(DIRECTORY_BASE, seriesFileName, season)).then(children => {
      return Promise.all(children.map(child => {
        return this.getEpisodeInSeasonInSeries(seriesFileName, season, child.fileName);
      }));
    });
  }

  getEpisodeInSeasonInSeries(seriesFileName, season, episode) {
    const episodePath = path.join(DIRECTORY_BASE, seriesFileName, season, episode);

    return this.mediaReadService.readMetadataAndChildren(episodePath).then(episodeMediaDirectory => {
      const fileName = episodeMediaDirectory.fileNames.find(fileName => _.some(FILE_TYPES_EPISODE, type => fileName.endsWith(type)));

      if (!fileName) {
        throw new Error(`Could not find media file in ${episodePath}`);
      }

      return {
        id: episode,
        fileName,
        subtitleFile: episodeMediaDirectory.fileNames.find(fileName => _.some(FILE_TYPES_SUBTITLE, type => fileName.endsWith(type)))
      };
    });
  }

  getVideoStreamChunk(series, season, episode, seriesFileName, range) {
    const episodePath = path.join(DIRECTORY_BASE, series, season, episode, seriesFileName);
    const stat = fs.statSync(episodePath);
    const contentType = path.extname(seriesFileName);

    if (range) {
      range.end = range.end ? range.end : stat.size - 1;

      return {
        totalSize: stat.size,
        chunkSize: (range.end - range.start) + 1,
        range: range,
        readStream: fs.createReadStream(episodePath, range),
        contentType
      };
    } else {
      return {
        totalSize: stat.size,
        readStream: fs.createReadStream(episodePath),
        contentType
      };
    }
  }
}

module.exports = SeriesService;
