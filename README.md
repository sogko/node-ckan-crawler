node-ckan-crawler
=================

A simple and fast NodeJS based crawler for sites powered by CKAN [http://ckan.org](http://ckan.org)

* Uses the CKAN ```package_search``` Action.Get API to crawl packages / datasets


## Install 
```
npm install node-ckan-crawler
```

## Usage

```
var CKANCrawler = require('node-ckan-crawler');

var crawler = new CKANCrawler();

crawler.queueSite('http://datahub.io/');
crawler.on('content', function(response, content){
  console.log('content', response.uri, content.length);
});
```

### More examples
See more examples found in ```examples\```

## API

### Events
#### Event: 'content'
When response received from the site has been parsed and results ready for consumption

```response``` an [http.IncomingMessage](http://nodejs.org/api/http.html#http_http_incomingmessage) object returned from [mikeal's request()](https://github.com/mikeal/request)

```body``` a JSON object of the response.body

````
crawler.on('content', function(response, body) {
    ...
});

````

#### Event: 'beforeQueue'
When next link is ready to be added to the crawler queue.
Return a non-true value to skip the link

```url``` a string of the next link ready to be added to the crawler queue

```next``` a callback function

````
crawler.on('beforeQueue', function(url, next) {
    next(true); // to add the link to the queue
    // next(false) // to skip link
});

````


#### Event: 'queued'
After a link was added to the crawler queue.

```url``` a string of the next link ready to be added to the crawler queue

````
crawler.on('queued', function(url) {
    ...
});

````

#### Event: 'drain'
When crawler has drained its queue and has no more links to crawl

````
crawler.on('drain', function() {
    ...
});

````
#### Event: 'error'
When an error has occurred

````
crawler.on('error', function(err) {
    ...
});

````

### Methods

#### queueSite(url)
Queue a CKAN powered site by specifying its base API url 

Example: 
``` 
crawler.queueSite('http://datahub.io')
```

## Known Issues



## Credits

* [Hafiz Ismail](https://github.com/sogko) 

## Links
* [wehavefaces.net](http://wehavefaces.net)
* [twitter.com/sogko](https://twitter.com/sogko)
* [github.com/sogko](https://github.com/sogko)
* [medium.com/@sogko](https://medium.com/@sogko)

## License
Copyright (c) 2014 Hafiz Ismail. This software is licensed under the [MIT License](https://github.com/sogko/node-ckan-crawler/raw/master/LICENSE).
