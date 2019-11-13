jest.mock("nanoid");
const nanoid = require("nanoid");

const { MongoMemoryServer } = require("mongodb-memory-server");
const setupUrlShortener = require("../setupUrlShortener");
const errorMessages = require("../shortenerErrorMessages");

describe("UrlShortener:", function() {
  beforeAll(async () => {
    this.mongod = new MongoMemoryServer({
      instance: {
        dbName: "testDB"
      }
    });














    

    this.domain = "https://someDomain.com";

    const mongoUrl = await this.mongod.getConnectionString();
    const { urlShortener, rawCollection } = await setupUrlShortener({
      dbOpts: {
        url: mongoUrl,
        dbName: "testDB",
        collectionName: "urlMappings"
      },
      shortenerOpts: { domain: this.domain }
    });
    this.urlShortener = urlShortener;
    this.rawCollection = rawCollection;

    this.longUrl = "http://tetrascience.com/this/is/some/super/extra/awesome/link?isIt=true&isSure=true";
  });

  afterAll(() => {
    this.mongod && this.mongod.stop();
    nanoid.mockRestore();
  });

  describe("shorten", () => {
    afterEach(async () => {
      await this.rawCollection.remove({});
      nanoid.mockReset();
    });
    it("should generate a new url mapping if it doesn't exist and return the shortUrl", async () => {
      const uniqueId = "doesNotMatter";
      nanoid.mockReturnValue(uniqueId);

      const shortUrl = await this.urlShortener.shorten(this.longUrl);
      const mapping = await this.rawCollection.findOne({
        originalUrl: this.longUrl
      });

      const expectedShortUrl = `${this.domain}/${uniqueId}`;
      const expectedMapping = {
        _id: uniqueId,
        originalUrl: this.longUrl,
        shortUrl: expectedShortUrl
      };

      expect(shortUrl).toEqual(expectedShortUrl);
      expect(mapping).toMatchObject(expectedMapping);
    });
    it("should just return the shortUrl if the mapping already exists", async () => {
      const uniqueId = "doesNotMatter";
      const expectedShortUrl = "something";
      const existingMapping = {
        _id: uniqueId,
        originalUrl: this.longUrl,
        shortUrl: expectedShortUrl
      };
      await this.rawCollection.insertOne(existingMapping);
      const shortUrl = await this.urlShortener.shorten(this.longUrl);
      expect(shortUrl).toEqual(expectedShortUrl);
    });
    it("should try shortening until it works (max 10 attempts)", async () => {
      // handling unlikely collisions for short ids
      const uniqueId = "uniqueId";
      const duplicateId = "duplicateId";
      const existingMapping = {
        _id: duplicateId,
        originalUrl: "someOtherLongUrl",
        shortUrl: "someUrl"
      };
      await this.rawCollection.insertOne(existingMapping);

      // 5 id collisions initially and then a unique id on the 6th attempt - it will generate a bunch of errors in the console; this is normal
      nanoid
        .mockReturnValueOnce(duplicateId)
        .mockReturnValueOnce(duplicateId)
        .mockReturnValueOnce(duplicateId)
        .mockReturnValueOnce(duplicateId)
        .mockReturnValueOnce(duplicateId)
        .mockReturnValue(uniqueId);

      const shortUrl = await this.urlShortener.shorten(this.longUrl);
      const mapping = await this.rawCollection.findOne({
        originalUrl: this.longUrl
      });

      const expectedShortUrl = `${this.domain}/${uniqueId}`;
      const expectedMapping = {
        _id: uniqueId,
        originalUrl: this.longUrl,
        shortUrl: expectedShortUrl
      };

      expect(shortUrl).toEqual(expectedShortUrl);
      expect(mapping).toMatchObject(expectedMapping);
    });
    it("should break if shortening doesn't work 10 times", async () => {
      const duplicateId = "duplicateId";
      const existingMapping = {
        _id: duplicateId,
        originalUrl: "someOtherLongUrl",
        shortUrl: "someUrl"
      };
      await this.rawCollection.insertOne(existingMapping);

      // set up id collisions - it will generate a bunch of errors in the console; this is normal
      nanoid.mockReturnValue(duplicateId);

      await expect(this.urlShortener.shorten(this.longUrl)).rejects.toEqual(new Error(errorMessages.TOO_MANY_ATTEMPTS));
    });
    it("should add custom routes if specified", async () => {
      const uniqueId = "doesNotMatter";
      nanoid.mockReturnValue(uniqueId);
      const customRoute = "/this/is/some/route";
      const shortUrl = await this.urlShortener.shorten(this.longUrl, customRoute);
      const mapping = await this.rawCollection.findOne({
        originalUrl: this.longUrl
      });

      const expectedShortUrl = `${this.domain}${customRoute}/${uniqueId}`;
      const expectedMapping = {
        _id: uniqueId,
        originalUrl: this.longUrl,
        shortUrl: expectedShortUrl
      };

      expect(shortUrl).toEqual(expectedShortUrl);
      expect(mapping).toMatchObject(expectedMapping);
    });
    it("should break if trying to shorten an invalid url", async () => {
      await expect(this.urlShortener.shorten("")).rejects.toEqual(new Error(errorMessages.INVALID_URL));
    });
  });
  describe("getOriginalUrlFrom", () => {
    afterEach(async () => {
      await this.rawCollection.remove({});
    });
    it("should find an existing mapping by shortUrl", async () => {
      const uniqueId = "uniqShortId";
      const shortUrl = `${this.domain}/${uniqueId}`;
      const existingMapping = {
        _id: uniqueId,
        originalUrl: this.longUrl,
        shortUrl
      };
      await this.rawCollection.insertOne(existingMapping);

      const originalUrl = await this.urlShortener.getOriginalUrlFrom(shortUrl);

      expect(originalUrl).toEqual(this.longUrl);
    });
    it("should break when trying to find a long url associated with the provided short url without any associations", async () => {
      const uniqueId = "uniqShortId";
      const shortUrl = `${this.domain}/${uniqueId}`;
      await expect(this.urlShortener.getOriginalUrlFrom(shortUrl)).rejects.toEqual(
        new Error(errorMessages.MISSING_MAPPING)
      );
    });
  });
  describe("remove", () => {
    afterEach(async () => {
      await this.rawCollection.remove({});
    });
    it("should remove an existing mapping by shortUrl", async () => {
      const uniqueId = "uniqShortId";
      const shortUrl = `${this.domain}/${uniqueId}`;
      const existingMapping = {
        _id: uniqueId,
        originalUrl: this.longUrl,
        shortUrl
      };
      await this.rawCollection.insertOne(existingMapping);

      const numberOfMappingsBeforeDeleting = await this.rawCollection.find().count();
      expect(numberOfMappingsBeforeDeleting).toEqual(1);
      await this.urlShortener.remove(shortUrl);
      const numberOfMappingsAfterDeleting = await this.rawCollection.find().count();

      expect(numberOfMappingsAfterDeleting).toEqual(0);
    });
  });
});
