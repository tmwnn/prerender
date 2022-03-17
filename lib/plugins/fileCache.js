var cacheManager = require('cache-manager');
const fsStore = require('./cache-manager-fs-hash/index.js');

const diskCache = cacheManager.caching({
    store: fsStore,
    options: {
        path: 'diskcache', //path for cached files
        ttl: 24 * 60 * 60, //time to life in seconds
        subdirs: true,     //create subdirectories to reduce the
                           //files in a single dir (default: false)
        zip: true,         //zip files to save diskspace (default: false)
    }
});


module.exports = {
    init: function() {
        this.cache = cacheManager.caching(diskCache);
    },

    requestReceived: function(req, res, next) {
        this.cache.get(req.prerender.url, function (err, result) {
            if (!err && result) {
                req.prerender.cacheHit = true;
                res.send(200, result);
            } else {
                next();
            }
        });
    },

    beforeSend: function(req, res, next) {
        if (!req.prerender.cacheHit && req.prerender.statusCode == 200) {
            this.cache.set(req.prerender.url, req.prerender.content);
        }
        next();
    }
}
