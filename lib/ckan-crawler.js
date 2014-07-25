var util = require('util');
var extend = util._extend;
var url = require('url');
var querystring = require('querystring');
var EventEmitter = require('events').EventEmitter;
var Crawler = require('crawler').Crawler;
var _ = require('lodash');
var logger = require('./logger')('CKANCrawler').log;

logger = function () {}; // comment out to show debug logs

var DEFAULT_ROWS_PER_REQUEST = 10;

var CKANCrawler = function (opts) {
  EventEmitter.call(this);

  var onContent = function (error, result, $) {
    var onEndParse = function (error, body) {
      if (error) {
        logger('Error', error);
        this.emit('error', error);
        return;
      }

      this.emit('content', result, body);

      // no further results
      if (!body || !body.result || !body.result.results || body.result.results.length === 0) return;

      var nextUrl = generateNextCrawlLink(result.uri);
      this.queue(nextUrl);

    }.bind(this);
    parseCKANPackageSearchResponse(error, result, $, onEndParse);
  }.bind(this);

  var onDrain = function () {
    this.emit('drain');
  };

  var defaultOpts = {
    maxConnections: 10,
    skipDuplicates: true,
    rowsPerRequest: DEFAULT_ROWS_PER_REQUEST
  };

  var optOverride = {
    callback: onContent,
    onDrain: onDrain
  };

  this.opts = extend(defaultOpts, opts || {});
  this.opts = extend(opts, optOverride);

  this.crawler = new Crawler(this.opts);

};

util.inherits(CKANCrawler, EventEmitter);

CKANCrawler.prototype.queueSite = function (item) {

  if (_.isArray(item)) {
    for (var i = 0; i < item.length; i++) this.queue(item[i]);
    return;
  }
  if (!_.isString(item)) return;

  var url = generateSeedCrawlLink(item, this.opts);
  this.queue(url);

};

CKANCrawler.prototype.queue = function (url) {

  var beforeQueueCallback = function (res) {
    if (res === true) {
      logger('Queue', url);
      this.crawler.queue(url);

      this.emit('queued', url);
    } else {
      logger('Skipped queue', url);
    }
  }.bind(this);

  if (this.listeners('beforeQueue').length > 0) {
    this.emit('beforeQueue', url, beforeQueueCallback);
  } else {
    beforeQueueCallback(true);
  }
};

var parseCKANPackageSearchResponse = function (error, result, $, done) {
  if (error) return done(error, []);

  var body = {};
  try {
    body = JSON.parse(result.body);
  } catch (e) {
    return done(e, []);
  }

  if (body.error) return done(body.error, []);
  if (!body.result) return done(new Error('Unexpected empty result body'), []);
  if (!body.result.results) return done(new Error('Unexpected empty result.results body'), []);

  done(null, body);

};

var generateSeedCrawlLink = function (base_url, opts) {
  var api_base = '/api/action/package_search?q=&sort=metadata_created+asc';
  var uri = url.parse(url.resolve(base_url, api_base));
  var qs = querystring.parse(uri.query);
  qs.rows = opts.rowsPerRequest;
  qs.start = 0;
  uri.search = '?' + querystring.stringify(qs).replace('%20', '+');
  return url.format(uri);
};

var generateNextCrawlLink = function (uri) {
  uri = url.parse(uri);
  var qs = querystring.parse(uri.query);
  qs.start = parseInt(qs.rows) + parseInt(qs.start);
  uri.search = '?' + querystring.stringify(qs).replace('%20', '+');
  return url.format(uri);
};

module.exports = CKANCrawler;