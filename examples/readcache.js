var level = require('leveldown');

var leveldb = level('./cache');
var iterator = null;

leveldb.open(function(err) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  else startReading();
});

function startReading() {
  iterator = leveldb.iterator();
  next();
}

function next() {
  iterator.next(function(err, key, value) {
    if (err) {
      console.error('sd', err);
      return;
    }
    if (key && value) {
      if (key === 'undefined') console.log('asdd');
      console.log(key + '=' + value);
      next();
    }
  });
}
