const validUrl = require("valid-url");
const mongo = require("./mongo");
const UrlShortener = require("./UrlShortener");
const errorMessages = require("./shortenerErrorMessages");

async function setupUrlShortener({ dbOpts = {}, shortenerOpts = {} } = {}) {
  if (shortenerOpts.domain && !validUrl.isUri(shortenerOpts.domain)) {
    throw new Error(errorMessages.INVALID_DOMAIN);
  }
  const { collection: ShortenerCollection, rawCollection } = await mongo.init({
    ...dbOpts
  });
  return {
    urlShortener: new UrlShortener({
      domain: "https://tetrascience.com",
      shortenedLength: 12,
      collection: ShortenerCollection,
      ...shortenerOpts
    }),
    ShortenerCollection,
    rawCollection
  };
}

module.exports = setupUrlShortener;
