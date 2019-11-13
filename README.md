# ts-lib-url-shortener
ts-url-shortener is a module for shortening long links.

## Installation
```sh
$ npm install tetrascience/ts-lib-url-shortener --save
```

## Setup

#### Import and initialize the UrlShortener

- `const setupUrlShortener = require("ts-url-shortener")` OR `import setupURlShortener from "ts-url-shortener"`
- Get a UrlShortener instance: 

`const { urlShortener } = await setupUrlShortener({ dbOpts, shortenerOpts });`

`setupUrlShortener` returns a promise. This function establishes a connection with an existing mongo database
and then initializes `UrlShortener` with that connection.


####Available options

```$xslt
const { urlShortener } = await setupUrlShortener({ 
    dbOpts: {
        url: string, // connection string to an existing mongo database; by default "mongodb://localhost:27017"
        dbName: string, // name of an existing mongo database; by default "shortener-test"
        collectionName: string, // name of the collection where url mappings will be saved; by default "shortener"
    }, 
    shortenerOpts: {
        domain: string, // short url prefix (can include protocol, subdomain, domain, port, path) but must be a valid url; by default "https://tetrascience.com"
        shortenedLength: integer, // length of short ids; by default 12 (see Considerations for discussion on uniqueness)
    } 
});
```

## Usage

#### Shorten urls

```$xslt
    const { urlShortener } = await setupUrlShortener({ dbOpts: {}, shortenerOpts: {} });
    const longUrl = "http://dashboard.ci.dev.tetrascience.com/dashboard#/dashboard?filter=deviceName&page=1";
    const shortUrl = await urlShortener.shorten(longUrl);
    // shortUrl: https://tetrascience.com/uniq12chars

    // with custom route
    const otherLongUrl = "http://localhost:8081/triggers/ack?ackCode=P2QtDUt7H&user=developers%40tetrascience.com&alert=5dc5d4f941fc83e9e5f40ed7&method=text";
    const otherShortUrl = await urlShortener.shorten(otherLongUrl, "/some/custom/route");
    // otherShortUrl: https://tetrascience.com/some/custom/route/uniq12chars
```

#### Retrieve original url using a short url
```$xslt
    // originalUrl: "http://dashboard.ci.dev.tetrascience.com/dashboard#/dashboard?filter=deviceName&page=1"
    const shortUrl = "https://tetrascience.com/uniq12chars";
    const longUrl = await urlShortener.getOriginalUrlFrom(shortUrl);
    // longUrl:     "http://dashboard.ci.dev.tetrascience.com/dashboard#/dashboard?filter=deviceName&page=1"
```

#### Remove url mappings
```
    const shortUrl = "https://tetrascience.com/uniq12chars";
    await urlShortener.remove(shortUrl);
```

## Uniqueness Considerations

By default UrlShortener is generating short ids of length 12 from a pool of 64 possible characters ([A-Za-z0-9-_]). 
According to [this calculator](https://zelark.github.io/nano-id-cc/), if we generate ids at a rate 1,000 per hour it will take ~1,000 years 
to have ~1% probability of a single collision. Nevertheless, UrlShortener can handle collisions reasonably well. 
Every time a url is being shortened, it will attempt the operation 10 times before throwing an error.
If this ever becomes an issue, we can increase the id length. 
