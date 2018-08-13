const log = require('node-log')(__filename);
const path = require('path');
const _ = require('lodash');
const Diff = require('text-diff');
const imdb = require('imdb-api');

const MediaReadService = require('./media-read-service');
const MediaWriteService = require('./media-write-service');
const SeriesService = require('./series-service');
const ImdbSeries = require('../domain/ImdbSeries');

const DIRECTORY_SERIES_BASE = path.join(process.env.DIRECTORY_BASE_MEDIA, 'series');

class ImdbService {

  constructor() {
    this.diff = new Diff();
    this.mediaReadService = new MediaReadService();
    this.mediaWriteService = new MediaWriteService();
    this.seriesService = new SeriesService();
  }

  updateAllSeries(force) {
    return this.seriesService.getAllSeries().then(allSeries => {
      return Promise.all(allSeries.map(series => this.updateSeries(series, force)));
    }).then(() => undefined);
  }

  updateSeriesByName(seriesName, force) {
    return this.seriesService.getSeries(seriesName)
      .then(series => this.updateSeries(series, force))
      .then(() => undefined);
  }

  updateSeries(series, force) {
    let seriesPromise;

    if (series.imdbid && !force) {
      log(`ImdbId of ${series.fileName} is known, fetching series`);
      seriesPromise = this.getSeriesByImdbId(series.imdbId);
    } else {
      log(`ImdbId of ${series.fileName} is not known, searching series`);
      seriesPromise = this.searchImdbForSeries(series.fileName).then(response => {
        log(`Search result for ${series.fileName}: ${response.results.length}`);

        const mostLikelySeries = this.findMostLikelySeriesFromSearchResults(series.fileName, response.results);

        if (mostLikelySeries) {
          log(`${series.fileName} is most likely: ${mostLikelySeries.title}`);
          return this.getSeriesByImdbId(mostLikelySeries.imdbid);
        }

        log(`Could not find any match for ${series.fileName}`)

        return null;
      });
    }

    return seriesPromise.then(imdbData => this.updateImdbDataForSeries(series, imdbData)
      .catch(err => log(err)));
  }

  findMostLikelySeriesFromSearchResults(seriesName, results) {
    return results
      .filter(result => result.type === 'series')
      .sort((a, b) => {
        const aDiff = this.diff.main(seriesName, a.title);
        const bDiff = this.diff.main(seriesName, b.title);
        const aDifferences = aDiff.filter(diff => diff[0] === 1 || diff[0] === -1).length;
        const bDifferences = bDiff.filter(diff => diff[0] === 1 || diff[0] === -1).length;

        return aDifferences - bDifferences
      })[0];
  }

  updateImdbDataForSeries(series, imdbData) {

    if (imdbData) {
      log(`Found series in IMDB: ${imdbData.title}. Updating metadata...`);

      series.metadata.imdb = new ImdbSeries(imdbData);

      return this.seriesService.updateSeries(series.fileName, series.metadata);
    } else {
      return Promise.reject(`WARNING: Series ${series.fileName} not found in imdb`);
    }
  }

  searchImdbForSeries(name) {
    log(`Searching imdb for ${name}`);
    return imdb.search({ name, type: 'series' }, { apiKey: environmentVariables.API_KEY_IMDB });
  }

  getSeriesByImdbId(id) {
    log(`Getting series by imdb id: ${id}`);
    return imdb.get({ id }, { apiKey: environmentVariables.API_KEY_IMDB }).then((series) => {
      return series.episodes().then(() => {
        return series;
      });
    });

  }
}

module.exports = ImdbService;
