const https = require('https');
const API_KEY = process.env.GOOG_API || null;
const CX = process.env.GOOG_CX || null;
const URI = 'https://www.googleapis.com/customsearch/v1?';

module.exports = (searchTerm, offset, cb) => {
    // if both keys are present, proceed with request
    if (API_KEY && CX) {
        // parameters to pass into google api request
        const params = 'start=' + (offset + 1)
                     + '&q=' + encodeURI(searchTerm) 
                     + '&searchType=image' 
                     + '&fields=items(link,snippet,image/thumbnailLink,image/contextLink)'
                     + '&client=google-csbe'
                     + '&cx=' + CX
                     + '&key=' + API_KEY;

        const url = URI + params;
        https.get(url, (res) => {
            let raw = '';
            res.on('data', (chunk) => { raw += chunk; });
            res.on('end', () => {
                cb(raw);
            });
        }).on('error', (e) => console.error(e.message));
    }
    else {
        // how to handle lack of keys?
        cb();
    }
};
