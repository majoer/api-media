const log = require('node-log')(__filename);
const Metadata = require('../domain/metadata');
const MediaService = require('../service/media-service');

const mediaService = new MediaService();

function decodeMediaPathParams(url) {
  const urlParts = url.split('/');
  const indexOfMedia = urlParts.indexOf('media');
  const requestedMediaPath = urlParts.slice(Math.min(indexOfMedia + 1, urlParts.length), urlParts.length)
    .filter((part) => !!part)
    .map(decodeURIComponent);

  log('Requested media path: ', requestedMediaPath);

  return requestedMediaPath;
}

module.exports = (app) => {
  const mediaPath = /^\/media($|\/.*)/;

  log('Registering endpoint GET /media/*');
  app.get(mediaPath, (req, res) => {
    const pathParams = decodeMediaPathParams(req.url);

    mediaService.readMediaDirectory(pathParams).then((media) => {
      res.send(media);
    }).catch((err) => {
      log(err);
      res.sendStatus(500);
    });
  });


  log('Registering endpoint POST /media/*');
  app.post(mediaPath, (req, res) => {

    if (!req.body) {
      res.sendStatus(400);
      return;
    }

    const pathParams = decodeMediaPathParams(req.url);
    const metadata = new Metadata(req.body);

    mediaService.createMediaDirectory(pathParams, metadata).then((media) => {
      res.sendStatus(200);
    }).catch((err) => {
      log(err);
      res.sendStatus(500);
    });
  });
};
