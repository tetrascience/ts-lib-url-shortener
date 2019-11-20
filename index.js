const setupUrlShortener = require("./src/setupUrlShortener");

let cachedUrlShortener = null;

const getUrlShortener = async () => {
  let urlShortener = cachedUrlShortener;
  if (!urlShortener) {
    ({urlShortener} = await setupUrlShortener({
      dbOpts: {
        url: process.env.MONGO_URL,
        dbName: process.env.DB_NAME,
        collectionName: process.env.COLLECTION_NAME
      },
      shortenerOpts: {domain: process.env.URL_PREFIX, shortenedLength: 12}
    }));
    cachedUrlShortener = urlShortener;
  }

  return urlShortener;
};

exports.handler = async function (event) {
  const response = {
    statusCode: 200,
  };

  const urlShortener = await getUrlShortener();

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

  return response;
};

exports.shortenHandler = async function (event) {
  const response = {};
  const requestBody = JSON.stringify(event.body || {});

  if (!requestBody.longUrl) {
    response.statusCode = 422; // Unprocessable Entity
    response.body = "Missing longUrl";
  } else {
    const urlShortener = await getUrlShortener();
    await urlShortener.shorten(requestBody.longUrl)
      .then(shortUrl => {
        response.statusCode = 200;
        response.body = shortUrl;
      })
      .catch(err => {
        response.statusCode = 500;
        response.body = err;
      });
  }

  return response;
};

exports.retrieveHandler = async function (event) {
  const response = {};
  const pathParameters = event.pathParameters || {};
  if (!pathParameters.shortId) {
    response.statusCode = 301; // redirect to TS homepage
    response.headers = {
      Location: 'https://tetrascience.com'
    }
  } else {
    const urlShortener = await getUrlShortener();
    const shortUrl = `${process.env.URL_PREFIX}/${pathParameters.shortId}`;
    await urlShortener.getOriginalUrlFrom(shortUrl)
      .then(longUrl => {
        response.statusCode = 301;
        response.headers = {
          Location: longUrl
        };
      })
      .catch(err => {
        response.statusCode = 301; // longUrl not found for the shortId provided; redirect to TS homepage
        response.headers = {
          Location: 'https://tetrascience.com'
        }
      });
  }

  return response;
};

exports.deleteHandler = async function (event) {
  const response = {};

  const urlShortener = await getUrlShortener();
  await urlShortener.remove(event.shortUrl).then(() => {
      response.statusCode = 200;
  }).catch(err => {
    response.statusCode = 500;
    response.body = err;
  });

  return response;
};
