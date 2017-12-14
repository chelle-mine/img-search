const { MongoClient } = require('mongodb');

let _db;

module.exports = {
    startConnection: (url, cb) => {
        MongoClient.connect(url, (err, client) => {
            _db = client.db('imgsearchdb');
            return cb(err);
        });
    },
    getDb: () => _db
}
