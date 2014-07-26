var CKANCrawler = require('./../index');

var crawler = new CKANCrawler({
  maxConnections: 10,
  rowsPerRequest: 15
});

crawler.queueSite('http://datahub.io/');

crawler.on('content', function(response, body){
  var results = (body && body.result) ? body.result.results || [] : [];
  console.log('onContent: Retrieved ', results.length, 'packages');
});

crawler.on('beforeQueue', function(url, next){
  console.log('beforeQueue', url);
  next(true);
});

crawler.on('queued', function(url){
  console.log('queued', url);
});
