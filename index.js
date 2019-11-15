const setupUrlShortener = require("./src/setupUrlShortener");

exports.handler = async function(event) {
  const response = {
    statusCode: 200,
  };
  const { urlShortener } = await setupUrlShortener({
    dbOpts: {
      url: "FILL",
      dbName: "FILL",
      collectionName: "FILL"
    },
    shortenerOpts: { domain: "FILL", shortenedLength: 12 }
  });
  switch (event.type) {
    case "set":
      if (event.longUrl) {
        throw new Error("Missing longUrl.");
      }
      const shortUrl = await urlShortener.shorten(event.longUrl);
      response.body = {
        shortUrl
      };
      break;
    case "get":
      if (event.shortUrl) {
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
