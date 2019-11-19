const setupUrlShortener = require("./src/setupUrlShortener");

exports.handler = async function(event) {
  const response = {
    statusCode: 200,
  };
  const { urlShortener } = await setupUrlShortener({
    dbOpts: {
      url: process.env.MONGO_URL,
      dbName: process.env.DB_NAME,
      collectionName: process.env.COLLECTION_NAME
    },
    shortenerOpts: { domain: process.env.URL_PREFIX, shortenedLength: 12 }
  });
  switch (event.type) {
    case "set":
      if (!event.longUrl) {
        throw new Error("Missing longUrl.");
      }
      const shortUrl = await urlShortener.shorten(event.longUrl);
      response.body = {
        shortUrl
      };
      break;
    case "get":
      if (!event.shortUrl) {
        throw new Error("Missing shortUrl.");
      }
      const longUrl = await urlShortener.getOriginalUrlFrom(event.shortUrl);
      response.body = {
        longUrl
      };
      break;
    case "delete":
      await urlShortener.remove(event.shortUrl);
      break;
    default:
      response.statusCode = 404;
  }
};
