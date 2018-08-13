const log = require('node-log')(__filename);
const express = require('express');
const seriesController = require('./controller/series-controller');
const genreController = require('./controller/genre-controller');
const imdbController = require('./controller/imdb-controller');
const cors = require('cors');
const bodyParser = require('body-parser');

const PORT = process.env.EXPRESS_PORT;

class Api {

  constructor() {
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(cors());
  }

  start() {
    seriesController(this.app);
    genreController(this.app);
    imdbController(this.app);

    log(`Listening on 0.0.0.0:${PORT}`);
    this.app.listen(PORT, '0.0.0.0');
  }

}

module.exports = Api;
