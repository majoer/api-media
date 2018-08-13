function splitByComma(commaSeparatedValues) {
  if (commaSeparatedValues) {
    return commaSeparatedValues.split(',').map(value => value.trim());
  }

  return commaSeparatedValues;
}

class ImdbSeries {

  constructor(imdbSeries) {
    Object.assign(this, imdbSeries);

    this.genres = splitByComma(this.genres);
    this.writer = splitByComma(this.writer);
    this.actors = splitByComma(this.actors);
    this.languages = splitByComma(this.languages);
    this.updated = new Date();

    delete this.opts;

    this.convertAllNAToNull();
  }

  convertAllNAToNull() {
    Object.keys(this).forEach(key => {
      if (this[key] === 'N/A') {
        this[key] = null;
      }
    });
  }
}

module.exports = ImdbSeries;