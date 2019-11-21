class ShortenerCollection {
  constructor({ db, collectionName, isTesting = false }) {
    if (isTesting) {
      this.collection = db;
    } else {
      this.collection = db.collection(collectionName);
    }
  }
  async add({ originalUrl, urlId, shortUrl }) {
    const existingMapping = await this.collection.findOne({ _id: urlId, originalUrl });
    if (existingMapping) {
      return existingMapping;
    }

    await this.collection.insertOne({
      _id: urlId,
      originalUrl,
      shortUrl
    });
  }

  async removeBy(query) {
    return this.collection.remove(query);
  }

  async findBy(query) {
    return this.collection.findOne(query);
  }
}
module.exports = ShortenerCollection;
