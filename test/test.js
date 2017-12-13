const { expect } = require('chai');
const { MongoClient } = require('mongodb');
const request = require('request');

const dbURL = 'mongodb://localhost:27017/';
const URL = 'http://localhost:3000';

describe('Accessing search history', () => {
    let dbClient,
        db;

    // empty collection before all tests
    before((done) => {
        MongoClient.connect(dbURL, (err, client) => {
            if (err) console.error(err);

            dbClient = client;
            db = client.db('imgsearchdb');
            db.collection('searches', (err, coll) => {
                if (err) console.error(err);

                coll.removeMany({}, (err, r) => {
                    // start app server
                    done();
                });
            });
        });
    });

    after((done) => {

        db.collection('searches', (err, coll) => {
            coll.removeMany({}, (err, r) => {
                dbClient.close();
                done();
            })
        });
    })

    it('Records each search', (done) => {
        const queries = [0,1,2,3,4,5,6,7,8,9,10];

        for (let i=0; i<queries.length; i++) {
             // perform a search for each element in query
             request(URL + '/api/imagesearch/' + queries[i], (err, res, body) => {

                 if (i===8) {

                     // db should be populated with 11 docs
                     db.collection('searches', (err, coll) => {
                         if (err) console.error(err);

                         coll.find().toArray((err, docs) => {
                             expect(docs.length).to.equal(11);
                             done();
                         });

                     });
                 }
             });
         }

    });

    it('Retrieves queries only from requesting client in order of most recent', (done) => {
        db.collection('searches', (err, coll) => {
            if (err) console.error(err);

            // insert a dummy doc from different IP address
            // total of 12 docs
            db.collection('searches', (err, coll) => {
                if (err) console.error(err);

                const dummyDoc = {
                    'client': 'a:dummy:client::ip',
                    'term': 11,
                    'when': new Date().toISOString()
                };

                coll.insertOne(dummyDoc, (err, r) => {
                    expect(err).to.equal(null);
                    coll.find().toArray((err, docs) => {
                        expect(docs.length).to.equal(12);
                    });

                    // make GET request to '/latest' endpoint
                    request(URL + '/api/latest/imagesearch/', (err, res, body) => {
                        expect(err).to.equal(null);
                        expect(res.statusCode).to.equal(200);
                        const parsedBody = JSON.parse(res.body);
                        // res body should be an array of 12 elements
                        expect(parsedBody.length).to.equal(12);
                        // res body should not include dummyDoc
                        expect(parsedBody).to.not.deep.include(dummyDoc);
                        done();
                    });
                });
            });

        });
    });

});
