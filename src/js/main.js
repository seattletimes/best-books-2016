// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var $ = require("./lib/qsa");

var categories = {};
var years = {};

var books = $(".book").map(function(b, i) {
  var data = {};
  for (var i = 0; i < b.attributes.length; i++) {
    var attr = b.attributes[i];
    if (attr.name.match(/^data-/)) {
      data[attr.name.replace("data-", "")] = attr.value;
    }
  }
  data.genre = data.genre.split(/;\s*/);
  data.genres = {};

  data.genre.forEach(g => {
    categories[g] = categories[g] ? categories[g] + 1 : 1;
    data.genres[g] = true;
  });
  years[data.year] = years[data.year] ? years[data.year] + 1 : 1;

  data.element = b;
  b.setAttribute("data-index", i);
  return data;
});

var catFilter = document.querySelector(".filters ul.category");
catFilter.innerHTML = Object.keys(categories).sort().map(c => `
  <li>
    <input type="checkbox" id="${c}" value="${c}">
    <label for="${c}">${c} (${categories[c]})</label>
  </li>`).join("");

var yearFilter = document.querySelector(".filters ul.year");
yearFilter.innerHTML = Object.keys(years).sort().reverse().map(c => `
  <li>
    <input type="checkbox" id="${c}" value="${c}">
    <label for="${c}">${c} (${years[c]})</label>
  </li>`).join("");

var filterElement = document.querySelector(".filters");

filterElement.addEventListener("change", function(e) {
  var cats = $("input:checked", catFilter).map(el => el.value);
  var years = $("input:checked", yearFilter).map(el => el.value);

  books.forEach(function(b) {
    var show = true;
    if (cats.length && !cats.some(c => c in b.genres)) show = false;
    if (years.length && years.indexOf(b.year) < 0) show = false;

    b.element.classList[show ? "remove" : "add"]("hidden");
  })

});