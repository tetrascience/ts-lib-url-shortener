class ShortenerCollection {
  constructor({ db, collectionName, isTesting = false }) {
    if (isTesting) {
      this.collection = db;
    } else {
      this.collection = db.collection(collectionName);
    }
  }
  add({ originalUrl, urlId, shortUrl }) {
    return this.collection.findOneAndUpdate(
      { _id: urlId, originalUrl },
      {
        $setOnInsert: {
          _id: urlId,
          originalUrl,
          shortUrl
        }
      },
      {
        upsert: true,
        returnOriginal: true
      }
    );
  }

  async removeBy(query) {
    return this.collection.remove(query);
  }

  async findBy(query) {
    return this.collection.findOne(query);
  }
}
module.exports = ShortenerCollection;
