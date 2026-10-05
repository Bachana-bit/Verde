'use strict';

const API_URL = 'https://raw.githubusercontent.com/tyavadzed/restaurant-api/refs/heads/main/menu.json';


const KNOWN_IMAGES = {
  'ivan-torres-MQUqbmszGGM-unsplash.jpg':
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
    
  'charlesdeluvio-D-vDQMTfAAU-unsplash.jpg':
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=800&auto=format&fit=crop',
    
  'homescreenify-sA3wymYqyaI-unsplash.jpg':
    'https://images.unsplash.com/photo-1622973536968-3ead9e780960?q=80&w=800&auto=format&fit=crop',
    
  'no-revisions-gA81ZTsql68-unsplash.jpg':
    'https://images.unsplash.com/photo-1609951651556-5334e2706168?q=80&w=800&auto=format&fit=crop',
  
  'anh-nguyen-kcA-c3f_3FE-unsplash.jpg':
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    
  'anna-tukhfatullina-food-photographer-stylist-Mzy-OjtCI70-unsplash.jpg':
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',

  'victoria-shes-UC0HZdUitWY-unsplash.jpg':
    'https://images.unsplash.com/photo-1544025162-83111f122557?q=80&w=800&auto=format&fit=crop',

  'chad-montano--GFCYhoRe48-unsplash.jpg':
    'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop',

  'alex-munsell-auIbTAcSH6E-unsplash.jpg':
    'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=800&auto=format&fit=crop'


};

const CATEGORY_ICONS = {
  Meat: 'i-cloche',
  Drinks: 'i-wine-glass',
  Vegan: 'i-salad',
  Dessert: 'i-cupcake',
};
const DEFAULT_CATEGORY_ICON = 'i-grid';
const ALL_CATEGORIES = 'all';

const categoryListEl = document.getElementById('categoryList');
const menuGroupsEl = document.getElementById('menuGroups');
const menuTitleEl = document.getElementById('menuTitle');
const loadMoreWrapEl = document.getElementById('loadMoreWrap');

let dishes = [];
let activeCategory = ALL_CATEGORIES;

loadMenu();

async function loadMenu() {
  renderState('Loading the menu…');

  try {
    const response = await fetch(API_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Menu data is empty');

    dishes = data;
    renderSidebar();
    renderDishes();

    if (loadMoreWrapEl) loadMoreWrapEl.style.display = 'none';
  } catch (error) {
    console.error('Menu could not be loaded:', error);
    renderState("We couldn't load the menu right now. Please try again shortly.", true);
  }
}

function renderSidebar() {

  const categories = [...new Set(dishes.map(dish => dish.category).filter(Boolean))];

  categoryListEl.innerHTML = '';
  categoryListEl.appendChild(createCategoryItem(ALL_CATEGORIES, 'All Dishes', DEFAULT_CATEGORY_ICON));

  categories.forEach(category => {
    const icon = CATEGORY_ICONS[category] || DEFAULT_CATEGORY_ICON;
    categoryListEl.appendChild(createCategoryItem(category, category, icon));
  });
}

function createCategoryItem(value, label, iconId) {
  const li = document.createElement('li');
  const link = document.createElement('a');

  link.href = '#';
  if (value === activeCategory) link.classList.add('is-active');
  link.innerHTML = `<svg class="icon"><use href="#${iconId}"></use></svg>`;
  link.append(' ' + label);

  link.addEventListener('click', event => {
    event.preventDefault();
    activeCategory = value;
    menuTitleEl.textContent = label;
    categoryListEl.querySelectorAll('a').forEach(a => a.classList.toggle('is-active', a === link));
    renderDishes();
  });

  li.appendChild(link);
  return li;
}

function renderDishes() {
  const visible = activeCategory === ALL_CATEGORIES
    ? dishes
    : dishes.filter(dish => dish.category === activeCategory);

  menuGroupsEl.innerHTML = '';
  groupByCategory(visible).forEach(({ category, items }) => {
    menuGroupsEl.appendChild(createMenuGroup(category, items));
  });
}

function groupByCategory(list) {
  const order = [];
  const byCategory = new Map();

  list.forEach(dish => {
    
    const cat = dish.category || 'Other'; 
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
      order.push(cat);
    }
    byCategory.get(cat).push(dish);
  });

  return order.map(category => ({ category, items: byCategory.get(category) }));
}

function createMenuGroup(category, items) {
  const group = document.createElement('div');
  group.className = 'menu-group';

  const label = document.createElement('span');
  label.className = 'menu-group__label';
  label.textContent = category;
  group.appendChild(label);

  items.forEach(dish => group.appendChild(createDishRow(dish)));
  return group;
}

function createDishRow(dish) {
  const row = document.createElement('div');
  row.className = 'dish-row';
  row.appendChild(createDishMedia(dish));
  row.appendChild(createDishBody(dish));

  const price = document.createElement('span');
  price.className = 'dish-row__price';
  price.textContent = formatPrice(dish.price);
  row.appendChild(price);

  return row;
}


function createDishMedia(dish) {
  const media = document.createElement('div');
  media.className = 'dish-row__media';

  const img = document.createElement('img');

  const imageUrl = KNOWN_IMAGES[dish.img];

  if (imageUrl) {
    img.src = imageUrl;
  } else {
    showImageFallback(media);
  }
  
  img.alt = dish.name;
  img.loading = 'lazy';
  img.addEventListener('error', () => showImageFallback(media), { once: true });

  media.appendChild(img);
  return media;
}

function showImageFallback(mediaEl) {
  mediaEl.classList.add('is-fallback');
  mediaEl.innerHTML = '<svg class="icon"><use href="#i-cloche"></use></svg>';
}

function createDishBody(dish) {
  const body = document.createElement('div');
  body.className = 'dish-row__body';

  const name = document.createElement('h3');
  name.className = 'dish-row__name';
  name.append(dish.name);
  if (dish.category === 'Vegan') {
    name.insertAdjacentHTML('beforeend', ' <svg class="icon"><use href="#i-leaf"></use></svg>');
  }
  body.appendChild(name);

  const desc = document.createElement('p');
  desc.className = 'dish-row__desc';
  desc.textContent = dish.description;
  body.appendChild(desc);

  return body;
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

function renderState(message, isError = false) {
  categoryListEl.innerHTML = '';
  menuGroupsEl.innerHTML = '';

  const p = document.createElement('p');
  p.className = isError ? 'menu-state menu-state--error' : 'menu-state';
  p.textContent = message;
  menuGroupsEl.appendChild(p);
}