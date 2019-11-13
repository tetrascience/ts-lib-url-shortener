const { MongoClient } = require("mongodb");
const ShortenerCollection = require("./ShortenerCollection");
const errorMessages = require("./shortenerErrorMessages");

class MongoInitializer {
  async init({ url, collectionName, dbName, connectionOpts = { useUnifiedTopology: true } }) {
    this.client = new MongoClient(url, connectionOpts);
    await this.client.connect().catch(err => {
      throw new Error(`${errorMessages.CONNECTION}. Details: ${err}`);
    });

    const db = this.client.db(dbName);
    const collection = new ShortenerCollection({ db, collectionName });
    return {
      db,
      collection,
      rawCollection: db.collection(collectionName)
    };
  }
}

module.exports = new MongoInitializer();
