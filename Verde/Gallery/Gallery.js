/* =========================================================
   Verde Restaurant — Gallery (dynamic)
   Fetches photos + categories from Gallery.json and builds
   the filter pills and the photo grid from that data.
   ========================================================= */

const GALLERY_API_URL =
  "https://raw.githubusercontent.com/tyavadzed/restaurant-api/refs/heads/main/Gallery.json";

// Gallery.json only stores each photo's file name
// (e.g. "ivan-torres-MQUqbmszGGM-unsplash.jpg"), not a full URL —
// Data.json (the menu) uses the exact same file names, so both
// pages are meant to share one local images folder. Put the files
// in an "images" folder next to this page, or change the constant
// below if they live somewhere else.
const IMAGE_BASE = "images/";

const grid = document.getElementById("gallery-grid");
const filtersList = document.getElementById("filters-list");

let items = [];
let activeCategory = "all";

init();

async function init() {
  try {
    const response = await fetch(GALLERY_API_URL);
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    items = await response.json();

    buildFilters(items);
    renderGrid();
  } catch (error) {
    console.error("Verde gallery: could not load Gallery.json", error);
    grid.innerHTML = `<p class="gallery__status">Sorry, the gallery couldn't be loaded right now.</p>`;
  }
}

// One pill per unique category found in the data. Matching is
// case-insensitive ("Food" / "food" collapse into one pill); the
// first spelling encountered is used as the visible label.
function buildFilters(data) {
  const categories = new Map();

  data.forEach((item) => {
    const raw = (item.category || "").trim();
    if (!raw) return;
    const key = raw.toLowerCase();
    if (!categories.has(key)) categories.set(key, raw);
  });

  categories.forEach((label, key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-pill";
    button.dataset.category = key;
    button.textContent = label.charAt(0).toUpperCase() + label.slice(1);
    filtersList.appendChild(button);
  });
}

// A single listener on the container covers the static "All" pill
// and every pill buildFilters() adds afterwards.
filtersList.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-pill");
  if (!button) return;

  activeCategory = button.dataset.category;

  filtersList
    .querySelectorAll(".filter-pill")
    .forEach((pill) => pill.classList.remove("is-active"));
  button.classList.add("is-active");

  renderGrid();
});

function renderGrid() {
  const visible =
    activeCategory === "all"
      ? items
      : items.filter(
          (item) => (item.category || "").trim().toLowerCase() === activeCategory
        );

  if (visible.length === 0) {
    grid.innerHTML = `<p class="gallery__status">No photos in this category yet.</p>`;
    return;
  }

  grid.innerHTML = visible
    .map(
      (item) => `
        <figure class="gallery__item">
          <img src="${IMAGE_BASE}${item.img}" alt="${fileNameToAlt(item.img)}" loading="lazy" />
        </figure>`
    )
    .join("");
}

// Gallery.json has no separate title field, so this turns
// "ivan-torres-MQUqbmszGGM-unsplash.jpg" into a readable fallback
// alt text such as "Verde gallery photo — ivan torres".
function fileNameToAlt(fileName) {
  const withoutExt = fileName.replace(/\.[a-z0-9]+$/i, "");
  const withoutId = withoutExt.replace(/-[a-zA-Z0-9_]{6,}-unsplash$/i, "");
  const words = withoutId.replace(/[-_]+/g, " ").trim();
  return words ? `Verde gallery photo — ${words}` : "Verde gallery photo";
}