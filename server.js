const app = require('./index');
const config = require('./config');

const dbUtil = require('./db');

dbUtil.startConnection(config.mongodb.url, (err) => {
    // handle error some other way

    app.listen(config.express.port, () => {
        console.log('Listening on port ' + config.express.port + '...');
    });
    
});
