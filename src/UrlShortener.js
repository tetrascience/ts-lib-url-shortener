const nanoid = require("nanoid");
const validUrl = require("valid-url");
const errorMessages = require("./shortenerErrorMessages");

class UrlShortener {
  constructor({ domain, shortenedLength, collection }) {
    this.domain = domain;
    this.shortenedLength = shortenedLength;
    this.collection = collection;
    this.MAX_ATTEMPTS = 10;
  }

  async shorten(originalUrl, shortUrlRoute = "") {
    if (!validUrl.isUri(originalUrl)) {
      throw new Error(errorMessages.INVALID_URL);
    }

    let newMapping;
    let isSuccess = false;
    let attempts = 0;

    while (!isSuccess && attempts < this.MAX_ATTEMPTS) {
      const shortId = nanoid(this.shortenedLength);
      const shortUrl = `${this.domain}${shortUrlRoute}/${shortId}`;
      try {
        await this.collection.add({ originalUrl, urlId: shortId, shortUrl });
        newMapping = {
          originalUrl,
          shortUrl
        };
        isSuccess = true;
      } catch (e) {
        console.log(`${errorMessages.GENERIC} Details: ${e}`);
        attempts += 1;
      }
    }

    if (isSuccess) {
      return newMapping.shortUrl;
    } else {
      throw new Error(errorMessages.TOO_MANY_ATTEMPTS);
    }
  }

  async getOriginalUrlFrom(shortUrl) {
    const mapping = await this.collection.findBy({ shortUrl });
    if (!mapping) {
      throw new Error(errorMessages.MISSING_MAPPING);
    }
    return mapping.originalUrl;
  }

  remove(shortUrl) {
    return this.collection.removeBy({ shortUrl });
  }
}

module.exports = UrlShortener;
