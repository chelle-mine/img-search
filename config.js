
exports.express = {
    port: process.env.PORT || 3000,
    ip: '127.0.0.1'
};

exports.mongodb = {
    url: process.env.MONGOLAB_URI || 'mongodb://localhost:27017'
};
