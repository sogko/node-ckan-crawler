var level = require('leveldown');


level.destroy('./cache', function (err) {
  console.log('Delete cache', err);
});