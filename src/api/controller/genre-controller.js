const log = require('node-log')(__filename);
const GenreService = require('../service/genre-service');

const genreService = new GenreService();

module.exports = (app) => {

  log('Registering endpoint GET /media/genres/series');
  app.get('/media/genres/series', (req, res) => {
    genreService.getAllSeriesGenres().then((genres) => {
      res.send(genres);
    }).catch((err) => {
      log(err);
      res.sendStatus(500);
    });
  });
};
