
require("./lib/social");
require("./lib/ads");
// var track = require("./lib/tracking");

var $ = require("./lib/qsa");
var flip = require("./lib/flip");
var dot = require("./lib/dot");
// var animateScroll = require("./lib/animateScroll");
var closest = require("./lib/closest");

var modalTemplate = dot.compile(require("./_modal.html"));

var noop = function() {};

var appElement = document.querySelector(".app");
appElement.classList.add("boot");
var listingElement = document.querySelector(".listings");

var categories = {};
var years = {};

var books = $(".book").map(function(b, index) {
  var data = {};
  for (var i = 0; i < b.attributes.length; i++) {
    var attr = b.attributes[i];
    if (attr.name.match(/^data-/)) {
      data[attr.name.replace("data-", "")] = attr.value;
    }
  }

  $("[data-bound]", b).forEach(function(el) {
    var key = el.getAttribute("data-bound");
    data[key] = el.innerHTML;
  });

  data.genre = data.genre.split(/;\s*/);
  data.genres = {};

  data.genre.forEach(g => {
    categories[g] = categories[g] ? categories[g] + 1 : 1;
    data.genres[g] = true;
  });
  years[data.year] = years[data.year] ? years[data.year] + 1 : 1;

  data.cover = b.querySelector(".cover").getAttribute("src");

  data.element = b;
  data.index = index;
  b.setAttribute("data-index", index);
  return data;
});

var createFilterElements = function(c) {
  return `
  <li>
    <input type="checkbox" id="${c}" value="${c}">
    <label for="${c}">${c} <span class="count">${this[c]}</span></label>
  </li>`
};

var catFilter = document.querySelector(".filters ul.category");
catFilter.innerHTML = Object.keys(categories).sort().map(createFilterElements.bind(categories)).join("");

var yearFilter = document.querySelector(".filters ul.year");
yearFilter.innerHTML = Object.keys(years).sort().reverse().map(createFilterElements.bind(years)).join("");

var filterElement = document.querySelector(".filters");

var bookCache = [];

var runFilters = function(e) {
  appElement.classList.remove("show-modal");

  var cats = $("input:checked", catFilter).map(el => el.value);
  var years = $("input:checked", yearFilter).map(el => el.value);
  var local = document.querySelector(".filters .local input:checked");

  var flipping = [];

  //get initial position
  books.forEach(b => b.first = b.element.getBoundingClientRect());

  var found = false;

  bookCache = [];

  books.forEach(function(b) {
    var show = true;
    if (cats.length && !cats.some(c => c in b.genres)) show = false;
    if (years.length && years.indexOf(b.year) < 0) show = false;
    if (local && !b.local) show = false;

    b.element.classList.remove("animated");
    var isVisible = !b.element.classList.contains("hidden");
    if (show) {
      bookCache.push(b);
      found = true;
      if (isVisible) {
        flipping.push(b);
      } else {
        b.element.classList.add("animated", "faded");
      }
    }
    b.element.classList[show ? "remove" : "add"]("hidden");
  });

  if (!found) {
    listingElement.classList.add("empty");
  } else {
    listingElement.classList.remove("empty");
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
  }
};

filterElement.addEventListener("change", runFilters);
runFilters();

var modalContent = document.querySelector(".modal .content");
var modalID = null;

var showModal = function(book) {
  modalID = book.index;
  modalContent.innerHTML = modalTemplate(book);
  appElement.classList.add("show-modal", "transition-modal");
  var reflow = appElement.offsetWidth;
  appElement.classList.remove("transition-modal");
  // if (window.innerWidth > 768) animateScroll(appElement);
}

var clickBook = function(e) {
  var id = this.getAttribute("data-index");
  var book = books[id];
  showModal(book);
};

var closeModal = function() {
  modalID = null;
  appElement.classList.remove("show-modal");
};

var expandBlurb = function() {
  var book = closest(this, ".book");
  book.classList.add("expanded");
};

var bookSequence = function() {
  var current = books[modalID];
  var index = bookCache.indexOf(current);
  if (this.classList.contains("next")) {
    index++;
    if (index >= bookCache.length) index = 0;
  } else {
    index--
    if (index < 0) index = bookCache.length - 1;
  }
  var next = bookCache[index];
  showModal(next);
}

books.forEach(function(b) {
  b.element.addEventListener("click", clickBook);
});
document.querySelector(".close-modal").addEventListener("click", () => appElement.classList.remove("show-modal"));
$(".modal .in.sequence").forEach(el => el.addEventListener("click", bookSequence));
$(".expand-book").forEach(el => el.addEventListener("click", expandBlurb));
