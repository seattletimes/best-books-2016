// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var $ = require("./lib/qsa");

var books = $(".book").map(function(b, i) {
  var data = {};
  for (var i = 0; i < b.attributes.length; i++) {
    var attr = b.attributes[i];
    if (attr.name.match(/^data-/)) {
      data[attr.name.replace("data-", "")] = attr.value;
    }
  }
  data.genre = data.genre.split(/;\s*/);
  data.element = b;
  b.setAttribute("data-index", i);
  return data;
});

console.log(books);