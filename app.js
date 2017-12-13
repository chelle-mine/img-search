const express = require('express');
const app = express();
const path = require('path');
const getSearch = require('./api');

// for deployment on Heroku
const PORT = process.env.PORT || 3000;
const URL = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/';

const MongoClient = require('mongodb').MongoClient;
let db;

// used to tailor search history to current client
let user;

// open mongodb connection
MongoClient.connect(URL, (err, client) => {
    if (err) console.error(err);

    db = client.db('imgsearchdb');
    app.listen(PORT, () => console.log('Listening on port ' + PORT + '...'));
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use((req, res, next) => {
    // store IP address in user
    user = req.ip.toString();
    next();
});

app.get('/', (req, res) => {
    res.render('home', {
        domainName: req.protocol + '://' + req.get('host')
    });
});

app.get('/api/imagesearch/*', (req, res) => {
    
    // ensure offset value is integer
    const offset = isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset);
    const term = req.params[0];

    // ensure a search term was provided
    if (!term) {
        res.end(JSON.stringify({error: 'Please enter a search term'}));
    }

    else {
        getSearch(term, offset, (result) => {
            res.end(result);

            // insert search doc into db
            db.collection('searches', (err, coll) => {
                if (err) console.error(err);
            
                coll.insertOne({
                    client: user,
                    term: term,
                    when: new Date().toISOString()
                }, (err, r) => {
                    if (err) console.error(err);
                }); 
            });
        });

    }
});

app.get('/api/latest/imagesearch', (req, res) => {
    db.collection('searches', (err, coll) => {
        if (err) console.error(err);
        coll.find({
            client: user
        }).project({
            term: 1,
            when: 1,
            _id: 0
        }).sort({when: -1}).toArray((err, coll) => {
            if (err) res.statusCode(500);
            res.end(JSON.stringify(coll));
        });
    });
});
