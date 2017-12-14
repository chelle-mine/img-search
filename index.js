const express = require('express');
const path = require('path');

const app = express();
const router = require('./router');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// use router to handle all requests
app.use(router);

// route errors
app.use((req, res, next) => {
    res.status(404).end(JSON.stringify({error: 'Page not found'}));
});

module.exports = app;
