# API - Media

Requires Node 10

## NPM Scripts

- `npm start` - Starts the development server
- `npm run start-production` - Starts the production server

## Endpoints

- GET /media/series
  - GET /media/series/:series
  - GET /media/series/:series/seasons
  - GET /media/series/:series/seasons/:season
  - GET /media/series/:series/seasons/:season/episodes
  - GET /media/series/:series/seasons/:season/episodes/:episode
  - GET /media/series/:series/seasons/:season/episodes/:episode/:fileName
  - GET /media/series/:series/seasons/:season/episodes/:episode/:file
  - GET /media/genres/series
  - POST /media/imdb/series
  - POST /media/imdb/series/:series
  - PUT /media/imdb/series
