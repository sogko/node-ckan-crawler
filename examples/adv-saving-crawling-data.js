/**
 * An advanced example to showing how to dump the crawled packages metadata to a database.
 *
 * This example uses levelDB for persistent data storage
 *
 */
var async = require('async');
var level = require('levelup');
var CKANCrawler = require('./../index');
var url = require('url');

var cache = null;
var cacheName = './cache';
var crawler = null;

var sites = ['http://datahub.io/'];

// Crawler event handlers
var onContent = function(response, body){
  var results = (body && body.result) ? body.result.results || [] : [];

  for (var i in results) {
    results[i].__objectType = 'raw-dataset';
    results[i].__source_uri = response.uri;
  }
  batchWriteToCache(results);
};
var onDrain = function () {
  console.log('Drained crawler, exiting');
  cache.close(function(){
    process.exit();
  });
};
var onError = function (error) {
  console.log('Error:', error);
};

// kick-start crawl sequence
async.series({
  openCache: function(next){
    cache = level(cacheName, {valueEncoding: 'json'}, next);
  },
  init_crawler: function(next){
    crawler = new CKANCrawler({
      maxConnections: 11,
      rowsPerRequest: 24
    });

    // register event handlers
    crawler.on('content', onContent);
    crawler.on('drain', onDrain);
    crawler.on('error', onError);

    next();
  },
  queue_site: function (next) {
    crawler.queueSite(sites);
    next();
  }
}, function(err, results){
  console.log('Crawl started', (err)? err : '(no errors)');
});


// Helper functions
var determineCacheKey = function (object) {
  var id = object.id;
  var type = object.__objectType;
  var source_uri = object.__source_uri;

  var uri = url.parse(source_uri);
  var host = uri.host;
  if (!id || !type || !host) return null;
  return [host, '/', type, '/', id].join('');
};

var batchWriteToCache = function (objects) {

  if (!objects || !objects.length) return;

  var batch = cache.batch();

  for (var i in objects) {
    var object = objects[i];
    var key = determineCacheKey(object);
    if (key) batch.put(key, object);
  }
  batch.write(function (err) {
    console.log('_batchWriteToCache done', objects.length, (err) ? err : '(No Errors)');
  });
};