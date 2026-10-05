
(() => {
  const API_URL = 'https://raw.githubusercontent.com/tyavadzed/restaurant-api/refs/heads/main/data.json';


const KNOWN_IMAGES = {
  'ivan-torres-MQUqbmszGGM-unsplash.jpg':
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
    
  'charlesdeluvio-D-vDQMTfAAU-unsplash.jpg':
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=800&auto=format&fit=crop',
    
  'homescreenify-sA3wymYqyaI-unsplash.jpg':
    'https://images.unsplash.com/photo-1622973536968-3ead9e780960?q=80&w=800&auto=format&fit=crop',
    
  'no-revisions-gA81ZTsql68-unsplash.jpg':
    'https://images.unsplash.com/photo-1609951651556-5334e2706168?q=80&w=800&auto=format&fit=crop',
    
  // აქედან დამატებულია ის ორი ფოტო, რომელიც აკლდა:
  
  'anh-nguyen-kcA-c3f_3FE-unsplash.jpg':
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    
  'anna-tukhfatullina-food-photographer-stylist-Mzy-OjtCI70-unsplash.jpg':
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop'
};
  const FALLBACK_DISHES = [
    { img: 'ivan-torres-MQUqbmszGGM-unsplash.jpg', name: 'Pepperoni Pizza', price: 24.99, description: '6-slice pepperoni pizza (16 cm)' },
    { img: 'charlesdeluvio-D-vDQMTfAAU-unsplash.jpg', name: 'Japanese dumplings', price: 9.99, description: 'Meat dumplings (10 pieces)' },
    { img: 'homescreenify-sA3wymYqyaI-unsplash.jpg', name: 'Spaghetti with meat', price: 20.99, description: 'Spaghetti with meat, rice, and a sweet and spicy sauce.' },
    { img: 'no-revisions-gA81ZTsql68-unsplash.jpg', name: 'Carrot cocktail', price: 4.99, description: 'Carrot cocktail 250g' },
  ];

  const grid = document.getElementById('dish-grid');
  const dotsEl = document.getElementById('dish-dots');

  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

  const placeholderFor = (name) =>
    `https://placehold.co/640x480/1e1912/c9a15c?font=playfair-display&text=${encodeURIComponent(name)}`;

  const resolveImage = (dish) => KNOWN_IMAGES[dish.img] || placeholderFor(dish.name);

  function buildDishCard(dish) {
    const card = document.createElement('article');
    card.className = 'dish-card';

    const media = document.createElement('div');
    media.className = 'dish-card__media';

    const img = document.createElement('img');
    img.alt = dish.name;
    img.loading = 'lazy';
    img.src = resolveImage(dish);
    img.onerror = () => { img.onerror = null; img.src = placeholderFor(dish.name); };

    const favBtn = document.createElement('button');
    favBtn.className = 'dish-card__fav';
    favBtn.type = 'button';
    favBtn.setAttribute('aria-label', `Save ${dish.name}`);
    favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
    favBtn.addEventListener('click', () => {
      const icon = favBtn.querySelector('i');
      icon.classList.toggle('fa-regular');
      icon.classList.toggle('fa-solid');
      favBtn.classList.toggle('is-saved');
    });

    media.append(img, favBtn);

    const body = document.createElement('div');
    body.className = 'dish-card__body';

    const titleRow = document.createElement('div');
    titleRow.className = 'dish-card__title-row';
    titleRow.innerHTML = `<h3>${dish.name}</h3><span class="dish-card__price">${formatPrice(dish.price)}</span>`;

    const desc = document.createElement('p');
    desc.className = 'dish-card__desc';
    desc.textContent = dish.description;

    body.append(titleRow, desc);
    card.append(media, body);
    return card;
  }

  function renderDots(count) {
    dotsEl.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
      const dot = document.createElement('span');
      if (i === 0) dot.classList.add('is-active');
      dotsEl.appendChild(dot);
    }
  }

  function renderDishes(dishes, sourceLabel) {
    grid.innerHTML = '';
    dishes.forEach((dish) => grid.appendChild(buildDishCard(dish)));
    renderDots(dishes.length);
    console.info(`Verde menu rendered (${sourceLabel}).`);
  }

  async function loadDishes() {
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`API responded with ${res.status}`);
      const dishes = await res.json();
      if (!Array.isArray(dishes) || dishes.length === 0) throw new Error('Empty menu');
      renderDishes(dishes, 'live API');
    } catch (err) {
   
      console.warn('Live fetch failed, using bundled fallback menu:', err);
      renderDishes(FALLBACK_DISHES, 'offline fallback');
    }
  }

  if (grid) {
    loadDishes();
  }
})();





