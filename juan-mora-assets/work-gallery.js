/* =====================================================================
   WORK GALLERY — stationary section, horizontally draggable track
   ===================================================================== */
(function () {
  "use strict";

  var scrollSpace = document.getElementById("wg2ScrollSpace");
  var pin = document.getElementById("wg2Pin");
  var track = document.getElementById("wg2Track");
  if (!scrollSpace || !pin || !track) return;

  var sites = [
    { name:"Verum Casa", url:"verumcasa.com", href:"https://verumcasa.com/", image:"juan-mora-assets/websites/verum-casa.png" },
    { name:"Glowy", url:"glowy.ro", href:"https://glowy.ro/", image:"juan-mora-assets/websites/glowy.jpg", contain:true },
    { name:"By Marccc", url:"bymarccc.com", href:"https://bymarccc.com/", image:"juan-mora-assets/websites/bymarccc.jpg" },
    { name:"The Royal Taste of Caviar", url:"theroyaltasteofcaviar.com", href:"https://theroyaltasteofcaviar.com/", image:"juan-mora-assets/websites/royal-caviar.png" },
    { name:"Rent V Class", url:"rentvclass.com", href:"https://rentvclass.com/", image:"juan-mora-assets/websites/rent-v-class.png" },
    { name:"Dion Bakery", url:"dionbakery.ro", href:"https://dionbakery.ro/", image:"juan-mora-assets/websites/dion-bakery.png" },
    { name:"Maison Banu", url:"maisonbanu.com", href:"https://maisonbanu.com/", image:"juan-mora-assets/websites/maison-banu.png" },
    { name:"Cool Kid", url:"coolkid.ro", href:"https://coolkid.ro/", image:"juan-mora-assets/websites/cool-kid.png" },
    { name:"Ring Robin", url:"ringrobin.net", href:"https://ringrobin.net/", image:"juan-mora-assets/websites/ring-robin.jpg" },
    { name:"Ekogram", url:"ekogram.pl/en", href:"https://ekogram.pl/en", image:"juan-mora-assets/websites/ekogram.jpg" },
    { name:"Water Damage Edmond", url:"waterdamageedmond.net", href:"https://waterdamageedmond.net/", image:"juan-mora-assets/websites/waterdamageedmond.webp" },
  ];

  track.innerHTML = sites.map(function (site, i) {
    return (
      '<a class="wg2-card" href="' + site.href + '" target="_blank" rel="noopener noreferrer" style="--i:' + i + '" aria-label="' + site.name + ' \u2014 view site">' +
        '<span class="wg2-bar">' +
          '<span class="wg2-dot"></span><span class="wg2-dot"></span><span class="wg2-dot"></span>' +
          '<span class="wg2-url">' + site.url + "</span>" +
        "</span>" +
        '<span class="wg2-body wg2-body--shot">' +
          '<img class="wg2-shot' + (site.contain ? " wg2-shot--contain" : "") + '" src="' + site.image + '" alt="Screenshot of ' + site.name + ' homepage" draggable="false" loading="lazy" decoding="async">' +
          '<span class="wg2-caption">' + site.name + '<span class="wg2-caption-sub">Designed and developed independently from concept to live responsive website.</span></span>' +
          '<span class="wg2-live-btn">View live website <span class="wg2-live-arrow">↗</span></span>' +
        "</span>" +
      "</a>"
    );
  }).join("");

  var cards = Array.prototype.slice.call(track.children);
  var offsetX = 0;
  var minOffsetX = 0;
  var minOffsetY = 0;
  var stepX = 1;
  var dragging = false;
  var activePointerId = null;
  var pointerStartX = 0;
  var offsetStartX = 0;
  var moved = false;
  var suppressClick = false;

  pin.tabIndex = 0;
  pin.setAttribute("aria-label", "Drag left or right to explore selected websites");

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function render() {
    var progress = minOffsetX ? offsetX / minOffsetX : 0;
    track.style.transform = "translate3d(" + offsetX + "px, " + (progress * minOffsetY) + "px, 0)";
  }

  function measure() {
    if (!cards.length) return;
    track.style.removeProperty("--step-x");
    var styles = getComputedStyle(track);
    var cardWidth = parseFloat(styles.getPropertyValue("--card-w")) || cards[0].offsetWidth;
    var cardHeight = parseFloat(styles.getPropertyValue("--card-h")) || cards[0].offsetHeight;
    var startX = parseFloat(styles.getPropertyValue("--start-x")) || 0;
    var startY = parseFloat(styles.getPropertyValue("--start-y")) || 0;
    stepX = parseFloat(styles.getPropertyValue("--step-x")) || cardWidth;
    if (pin.clientWidth >= 760) {
      stepX = cardWidth * 0.68;
      track.style.setProperty("--step-x", stepX + "px");
    }
    var stepY = parseFloat(styles.getPropertyValue("--step-y")) || 0;
    var totalRight = startX + ((cards.length - 1) * stepX) + cardWidth;
    var totalBottom = startY + ((cards.length - 1) * stepY) + cardHeight;
    minOffsetX = Math.min(0, pin.clientWidth - totalRight - 48);
    minOffsetY = Math.min(0, pin.clientHeight - totalBottom - 48);
    offsetX = clamp(offsetX, minOffsetX, 0);
    render();
  }

  pin.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging = true;
    moved = false;
    activePointerId = event.pointerId;
    pointerStartX = event.clientX;
    offsetStartX = offsetX;
    pin.classList.add("is-dragging");
  });

  pin.addEventListener("pointermove", function (event) {
    if (!dragging || event.pointerId !== activePointerId) return;
    var distance = event.clientX - pointerStartX;
    if (Math.abs(distance) > 4 && !moved) {
      moved = true;
      pin.setPointerCapture(event.pointerId);
    }
    offsetX = clamp(offsetStartX + distance, minOffsetX, 0);
    render();
  });

  function endDrag(event) {
    if (!dragging || event.pointerId !== activePointerId) return;
    suppressClick = moved;
    dragging = false;
    activePointerId = null;
    pin.classList.remove("is-dragging");
    if (pin.hasPointerCapture(event.pointerId)) pin.releasePointerCapture(event.pointerId);
    window.setTimeout(function () { suppressClick = false; }, 0);
  }

  pin.addEventListener("pointerup", endDrag);
  pin.addEventListener("pointercancel", endDrag);
  pin.addEventListener("click", function (event) {
    if (suppressClick) event.preventDefault();
  }, true);

  pin.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    offsetX = clamp(offsetX + (event.key === "ArrowLeft" ? stepX : -stepX), minOffsetX, 0);
    render();
  });

  pin.addEventListener("wheel", function (event) {
    if (Math.abs(event.deltaY) >= Math.abs(event.deltaX)) {
      return;
    }
    event.preventDefault();
    offsetX = clamp(offsetX - event.deltaX, minOffsetX, 0);
    render();
  }, { passive: false });

  window.addEventListener("resize", measure);
  window.addEventListener("load", measure);
  measure();
})();
