const log = require('node-log')(__filename);
const express = require('express');
const seriesController = require('./controller/series-controller');
const genreController = require('./controller/genre-controller');
const imdbController = require('./controller/imdb-controller');
const cors = require('cors');
const bodyParser = require('body-parser');

const INTERFACE = process.env.EXPRESS_INTERFACE;
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

    log(`Listening on ${INTERFACE}:${PORT}`);
    this.app.listen(PORT, INTERFACE);
  }

}

module.exports = Api;
