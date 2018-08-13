const log = require('node-log')(__filename);
const ImdbService = require('../service/imdb-service');

const imdbService = new ImdbService();

module.exports = (app) => {

  log('Registering endpoint POST /media/imdb/series');
  app.post('/media/imdb/series', (req, res) => {
    imdbService.updateAllSeries(true).then(() => {
      res.sendStatus(200);
    }).catch((err) => {
      log(err);
      res.sendStatus(500);
    });
  });

  log('Registering endpoint POST /media/imdb/series/:series');
  app.post('/media/imdb/series/:series', (req, res) => {
    imdbService.updateSeriesByName(req.params.series, true).then(() => {
      res.sendStatus(200);
    }).catch((err) => {
      log(err);
      res.sendStatus(500);
    });
  });

  log('Registering endpoint PUT /media/imdb/series');
  app.put('/media/imdb/series', (req, res) => {
    imdbService.updateAllSeries(false).then(() => {
      res.sendStatus(200);
    }).catch((err) => {
      log(err);
      res.sendStatus(500);
    });
  });
};
