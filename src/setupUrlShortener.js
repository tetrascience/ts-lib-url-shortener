const validUrl = require("valid-url");
const mongo = require("./mongo");
const UrlShortener = require("./UrlShortener");
const errorMessages = require("./shortenerErrorMessages");

/*
  By default the short id will have 12 characters.
  According to Nano ID Collision Calculator (https://zelark.github.io/nano-id-cc/) if we generate 1000 ids per hour
  it will take ~1 thousand years to have a 1% probability of at least one collision for an id this length.
  The shortener is capable of handling potential collisions by retrying up to 10 times.
 */

async function setupUrlShortener({ dbOpts = {}, shortenerOpts = {} } = {}) {
  if (shortenerOpts.domain && !validUrl.isUri(shortenerOpts.domain)) {
    throw new Error(errorMessages.INVALID_DOMAIN);
  }
  const { collection: ShortenerCollection, rawCollection } = await mongo.init({
    url: "mongodb://localhost:27017",
    dbName: "shortener-test",
    collectionName: "shortener",
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
