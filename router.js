const router = require('express').Router();
const getSearch = require('./api');
const db = require('./db').getDb;

let user;

// get user's ip address
router.use((req, res, next) => {
    user = req.ip;
    next();
});

// render home page
router.get('/', (req, res) => {
    res.render('home', {
        domainName: req.protocol + '://' + req.get('host')
    });
});

// performing search
router.get('/api/imagesearch/*', (req, res) => {
    
    // ensure offset value is integer
    const offset = isNaN(parseInt(req.query.offset)) ? 0 : parseInt(req.query.offset);
    const term = req.params[0];

    // ensure a search term was provided
    if (!term) {
        res.end(JSON.stringify({error: 'Please enter a search term'}));
    }

    else {

        // insert search doc into db
        db().collection('history', (err, coll) => {
            if (err) console.error(err);
        
            coll.insertOne({
                client: user,
                term: term,
                when: new Date().toISOString()
            }, (err, r) => {
                if (err) console.error(err);
                // then search
                getSearch(term, offset, (result) => {
                    res.end(result);
                });
            }); 
        });

    }
});

// retrieving history
router.get('/api/latest/imagesearch', (req, res) => {
    // cannot retrieve history of unknown client
    if (!user) res.end(JSON.stringify({
        error: 'Cannot detect client'
    }));
    
    db().collection('history', (err, coll) => {
        if (err) console.error(err);
        coll.find({
            client: user
        }).project({
            term: 1,
            when: 1,
            _id: 0
        }).sort({when: -1}).toArray((err, coll) => {
            if (err) res.status(500);
            res.end(JSON.stringify(coll));
        });
    });
});

module.exports = router;
