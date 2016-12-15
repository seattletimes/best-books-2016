// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

var $ = require("./lib/qsa");
var flip = require("./lib/flip");

var noop = function() {};

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

var createFilterElements = function(c) {
  return `
  <li>
    <input type="checkbox" id="${c}" value="${c}">
    <label for="${c}">${c} (${this[c]})</label>
  </li>`
};

var catFilter = document.querySelector(".filters ul.category");
catFilter.innerHTML = Object.keys(categories).sort().map(createFilterElements.bind(categories)).join("");

var yearFilter = document.querySelector(".filters ul.year");
yearFilter.innerHTML = Object.keys(years).sort().reverse().map(createFilterElements.bind(years)).join("");

var filterElement = document.querySelector(".filters");

var runFilters = function(e) {
  var cats = $("input:checked", catFilter).map(el => el.value);
  var years = $("input:checked", yearFilter).map(el => el.value);
  var local = document.querySelector(".filters .local input:checked");

  var flipping = [];

  //get initial position
  books.forEach(b => b.first = b.element.getBoundingClientRect());

  books.forEach(function(b) {
    var show = true;
    if (cats.length && !cats.some(c => c in b.genres)) show = false;
    if (years.length && years.indexOf(b.year) < 0) show = false;
    if (local && !b.local) show = false;

    b.element.classList.remove("animated");
    var isVisible = !b.element.classList.contains("hidden");
    if (show && isVisible) {
      flipping.push(b);
    }
    b.element.classList[show ? "remove" : "add"]("hidden");
    if (show && !isVisible) {
      b.element.classList.add("animated", "faded");
    }
  });

  requestAnimationFrame(function() {
    flipping.forEach(function(b) {
      var bounds = b.element.getBoundingClientRect();
      var offset = {
        x: b.first.left - bounds.left,
        y: b.first.top - bounds.top
      };
      b.element.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
      var reflow = b.element.offsetWidth;
      b.element.classList.add("animated");
      b.element.style.transform = "";
    });
    $(".faded").forEach(el => el.classList.remove("faded"));
  });

};

filterElement.addEventListener("change", runFilters);
runFilters();