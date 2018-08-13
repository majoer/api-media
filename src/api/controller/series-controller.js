const log = require('node-log')(__filename);
const SeriesService = require('../service/series-service');

const seriesService = new SeriesService();

module.exports = (app) => {

  log('Registering endpoint GET /media/series');
  app.get('/media/series', (req, res) => {
    if (req.query !== {}) {
      seriesService.searchForSeries(req.query).then(series => {
        res.send(series);
      }).catch((err) => {
        log(err);
        res.sendStatus(500);
      });
    } else {
      seriesService.getAllSeries().then(series => {
        res.send(series);
      }).catch((err) => {
        log(err);
        res.sendStatus(500);
      });
    }
  });

  log('Registering endpoint GET /media/series/:series');
  app.get('/media/series/:series', (req, res) => {
    seriesService.getSeries(req.params.series).then(series => {
      res.send(series);
    }).catch(err => {
      log(err);
      res.sendStatus(500);
    });
  });

  log('Registering endpoint GET /media/series/:series/seasons');
  app.get('/media/series/:series/seasons', (req, res) => {
    seriesService.getSeasonsInSeries(req.params.series).then(seasons => {
      res.send(seasons);
    }).catch(err => {
      log(err);
      res.sendStatus(500);
    });
  });

  log('Registering endpoint GET /media/series/:series/seasons/:season');
  app.get('/media/series/:series/seasons/:season', (req, res) => {
    seriesService.getSeasonInSeries(req.params.series, req.params.season).then(season => {
      res.send(season);
    }).catch(err => {
      log(err);
      res.sendStatus(500);
    });
  });

  log('Registering endpoint GET /media/series/:series/seasons/:season/episodes');
  app.get('/media/series/:series/seasons/:season/episodes', (req, res) => {
    seriesService.getEpisodesInSeasonInSeries(req.params.series, req.params.season).then(episodes => {
      res.send(episodes);
    }).catch(err => {
      log(err);
      res.sendStatus(500);
    });
  });

  log('Registering endpoint GET /media/series/:series/seasons/:season/episodes/:episode');
  app.get('/media/series/:series/seasons/:season/episodes/:episode', (req, res) => {
    const params = req.params;

    if (req.accepts('application/json')) {
      log('json')
      seriesService.getEpisodeInSeasonInSeries(params.series, params.season, params.episode).then(episode => {
        res.send(episode);
      }).catch(err => {
        log(err);
        res.sendStatus(500);
      });
    } else if (req.accepts('video/*')) {
      log('video')
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : null;

        const chunk = seriesService.getVideoStreamChunk(params.series, params.season, params.episode, {
          start,
          end
        });

        res.writeHead(206, {
          'Content-Range': `bytes ${chunk.range.start}-${chunk.range.end}/${chunk.range.total}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunk.total,
          'Content-Type': chunk.contentType
        });

        chunk.readStream.pipe(res);
      } else {
        const stream = seriesService.getVideoStreamChunk(params.series, params.season, params.episode);
        res.writeHead(200, {
          'Content-Length': stream.total,
          'Content-Type': stream.contentType
        });

        stream.readStream.pipe(res);
      }
    }
  });

  log('Registering endpoint GET /media/series/:series/seasons/:season/episodes/:episode/:fileName');
  app.get('/media/series/:series/seasons/:season/episodes/:episode/:fileName', (req, res) => {
    const params = req.params;
    log('video')
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : null;

      const chunk = seriesService.getVideoStreamChunk(params.series, params.season, params.episode, params.fileName, {
        start,
        end
      });

      res.writeHead(206, {
        'Content-Range': `bytes ${chunk.range.start}-${chunk.range.end}/${chunk.totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunk.chunkSize,
        'Content-Type': chunk.contentType
      });

      chunk.readStream.pipe(res);
    } else {
      const stream = seriesService.getVideoStreamChunk(params.series, params.season, params.episode, params.fileName);
      res.writeHead(200, {
        'Content-Length': stream.totalSize,
        'Content-Type': stream.contentType
      });

      stream.readStream.pipe(res);
    }
  });

  log('Registering endpoint GET /media/series/:series/seasons/:season/episodes/:episode/:file');
  app.get('/media/series/:series/seasons/:season/episodes/:episode', (req, res) => {
    const params = req.params;
    seriesService.getEpisodeInSeasonInSeries(params.series, params.season, params.episode).then(episode => {
      res.send(episode);
    }).catch(err => {
      log(err);
      res.sendStatus(500);
    });
  });
};
