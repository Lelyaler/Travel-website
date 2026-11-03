document.addEventListener('DOMContentLoaded', () => {
  if (typeof customSelect === 'function') {
    customSelect('select');
  }

  const dateInput = document.getElementById('date');
  let picker = null;
  if (dateInput && typeof easepick !== 'undefined') {
    try {
      picker = new easepick.create({
        element: dateInput,
        css: [
          'https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css'
        ],
        zIndex: 100,
        format: 'DD.MM.YY',
        setup(p) {
          p.on('select', (e) => {
            const date = e.detail.date;
            dateInput.value = date ? date.format('DD.MM.YY') : '';
          });
        }
      });
    } catch (e) {
      console.warn('Easepick init error', e);
    }
  }

  const toastContainer = document.getElementById('toast-container');
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3900);
  }
  window.showToast = showToast;

  const nav = document.querySelector('.nav');
  const backToTopBtn = document.getElementById('btn-back-to-top');
  const sections = document.querySelectorAll('header[id], section[id], footer[id]');
  const desktopNavLinks = document.querySelectorAll('.nav__menu-link');

  function handleScroll() {
    const scrollY = window.scrollY;

    if (nav) {
      if (scrollY > 50) {
        nav.classList.add('is-scrolled');
      } else {
        nav.classList.remove('is-scrolled');
      }
    }

    if (backToTopBtn) {
      if (scrollY > 450) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    }

    let currentId = 'home';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 160;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    desktopNavLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('nav__menu-link--active');
      } else {
        link.classList.remove('nav__menu-link--active');
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const filterTabs = document.querySelectorAll('.tab-chip');
  const destinationCards = document.querySelectorAll('#destinations-grid .section__card');

  function applyRegionFilter(region) {
    destinationCards.forEach((card) => {
      const cardRegion = card.getAttribute('data-region');
      if (region === 'all' || cardRegion === region) {
        card.classList.remove('is-filtered-out');
      } else {
        card.classList.add('is-filtered-out');
      }
    });
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      filterTabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const filter = tab.getAttribute('data-filter');
      applyRegionFilter(filter);
    });
  });

  window.filterDestinationsByQuery = function (query) {
    if (!query) return;
    const cleanQuery = query.toLowerCase().trim();
    let matches = 0;

    destinationCards.forEach((card) => {
      const name = (card.getAttribute('data-name') || '').toLowerCase();
      const country = (card.getAttribute('data-country') || '').toLowerCase();
      const text = card.textContent.toLowerCase();

      if (cleanQuery === '' || name.includes(cleanQuery) || country.includes(cleanQuery) || text.includes(cleanQuery)) {
        card.classList.remove('is-filtered-out');
        matches++;
      } else {
        card.classList.add('is-filtered-out');
      }
    });

    filterTabs.forEach((t) => t.classList.remove('is-active'));
    const allTab = document.querySelector('.tab-chip[data-filter="all"]');
    if (allTab) allTab.classList.add('is-active');

    const destSection = document.getElementById('destinations');
    if (destSection) {
      destSection.scrollIntoView({ behavior: 'smooth' });
    }

    showToast(`Found ${matches} destination${matches === 1 ? '' : 's'} matching "${query}"`);
  };

  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const locVal = document.getElementById('location')?.value.trim();
      const actVal = document.getElementById('activity')?.value;
      const guestsVal = document.getElementById('guests')?.value;

      if (locVal) {
        window.filterDestinationsByQuery(locVal);
      } else {
        const destSection = document.getElementById('destinations');
        if (destSection) {
          destSection.scrollIntoView({ behavior: 'smooth' });
        }
        showToast(`Showing all curated itineraries for ${guestsVal} guest(s) · ${actVal}`);
      }
    });
  }

  const favoriteButtons = document.querySelectorAll('.card__btn-favorite');
  let favorites = [];
  try {
    favorites = JSON.parse(localStorage.getItem('2rism_favorites') || '[]');
  } catch (err) {
    favorites = [];
  }

  favoriteButtons.forEach((btn) => {
    const id = btn.getAttribute('data-id');
    if (favorites.includes(id)) {
      btn.classList.add('is-liked');
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cardTitle = btn.closest('.section__card')?.querySelector('.section__title')?.textContent || 'Destination';

      if (favorites.includes(id)) {
        favorites = favorites.filter((fav) => fav !== id);
        btn.classList.remove('is-liked');
        showToast(`Removed ${cardTitle} from your saved escapes`);
      } else {
        favorites.push(id);
        btn.classList.add('is-liked');
        showToast(`Saved ${cardTitle} to your favorites!`);
      }

      try {
        localStorage.setItem('2rism_favorites', JSON.stringify(favorites));
      } catch (err) {}
    });
  });

  const globeModal = document.getElementById('globe-modal');
  const btnOpenGlobe = document.getElementById('btn-open-globe');
  const btnCloseGlobe = document.getElementById('btn-close-globe');
  const svgPins = document.querySelectorAll('.svg-pin');
  const mapChips = document.querySelectorAll('.map-chip');
  const cityNameEl = document.getElementById('globe-city-name');
  const countryNameEl = document.getElementById('globe-country-name');
  const tempValEl = document.getElementById('globe-temp-val');
  const seasonValEl = document.getElementById('globe-season-val');
  const vibeDescEl = document.getElementById('globe-vibe-desc');
  const spotlightImgEl = document.getElementById('globe-spotlight-img');
  const btnGlobeFilter = document.getElementById('btn-globe-filter');

  let activeCityData = 'Big Sur';

  const mapDestinationsData = {
    'Big Sur': {
      country: 'California, USA',
      temp: '21°C',
      season: 'April – October',
      img: 'image/popular/img.webp',
      desc: 'Dramatic Pacific coastal highway cliffs, secluded redwoods, and iconic Big Sur ocean lookouts.'
    },
    'Prescott': {
      country: 'Arizona, USA',
      temp: '24°C',
      season: 'May – October',
      img: 'image/popular/img-1.webp',
      desc: 'Cool mountain pine forests, pristine alpine lakes, and historic Victorian square architecture.'
    },
    'Lake Como': {
      country: 'Lombardy, Italy',
      temp: '25°C',
      season: 'May – September',
      img: 'image/hotels/Grand Hotel.webp',
      desc: 'Serene deep-blue alpine waters surrounded by Belle Époque historic villas, floating pools, and cypress gardens.'
    },
    'Madrid': {
      country: 'Central Spain',
      temp: '27°C',
      season: 'Year-round',
      img: 'image/popular/img-5.webp',
      desc: 'Vibrant capital of grand royal boulevards, world-class art collections at Prado, and sunset tapas culture.'
    },
    'Udaipur': {
      country: 'Rajasthan, India',
      temp: '29°C',
      season: 'October – March',
      img: 'image/hotels/Udaipur, India.webp',
      desc: 'The City of Lakes: majestic royal marble palaces reflecting across tranquil Lake Pichola under starlit skies.'
    }
  };

  function selectMapDestination(cityName) {
    const data = mapDestinationsData[cityName];
    if (!data) return;

    activeCityData = cityName;

    svgPins.forEach((pin) => {
      const match = pin.getAttribute('data-city') === cityName;
      pin.classList.toggle('is-active', match);
    });

    mapChips.forEach((chip) => {
      const match = chip.getAttribute('data-city') === cityName;
      chip.classList.toggle('is-active', match);
    });

    if (cityNameEl) cityNameEl.textContent = cityName;
    if (countryNameEl) countryNameEl.textContent = data.country;
    if (tempValEl) tempValEl.textContent = `${data.temp} · Sunny`;
    if (seasonValEl) seasonValEl.textContent = data.season;
    if (vibeDescEl) vibeDescEl.textContent = data.desc;
    if (spotlightImgEl) {
      spotlightImgEl.src = data.img;
      spotlightImgEl.alt = `${cityName} destination preview`;
    }
  }

  if (btnOpenGlobe && globeModal) {
    btnOpenGlobe.addEventListener('click', () => {
      globeModal.showModal();
    });
  }

  if (btnCloseGlobe && globeModal) {
    btnCloseGlobe.addEventListener('click', () => {
      globeModal.close();
    });
  }

  if (globeModal) {
    globeModal.addEventListener('click', (e) => {
      if (e.target === globeModal) {
        globeModal.close();
      }
    });
  }

  svgPins.forEach((pin) => {
    pin.addEventListener('click', () => {
      const city = pin.getAttribute('data-city');
      selectMapDestination(city);
    });
  });

  mapChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const city = chip.getAttribute('data-city');
      selectMapDestination(city);
    });
  });

  if (btnGlobeFilter && globeModal) {
    btnGlobeFilter.addEventListener('click', () => {
      globeModal.close();
      window.filterDestinationsByQuery(activeCityData);
    });
  }

  const hotelModal = document.getElementById('hotel-modal');
  const btnCloseHotel = document.getElementById('btn-close-hotel');
  const hotelDetailButtons = document.querySelectorAll('.hotel__btn-details');

  const hotelsData = {
    monastero: {
      title: 'Monastero Santa Rosa Hotel & Spa',
      location: 'Salerno, Italy',
      price: '$680',
      badge: 'Michelin Dining & Spa',
      rating: '★★★★★',
      reviews: '(214 verified reviews)',
      image: 'image/hotels/Monastero.webp',
      desc: 'Suspended between cliffs and sky over the Gulf of Salerno, this restored 17th-century monastery blends timeless architectural serenity with world-class wellness facilities and Michelin-starred culinary artistry.',
      amenities: ['✓ Heated Infinity Pool', '✓ Panoramic Sea View', '✓ Michelin Dining', '✓ Thermal Spa Suite', '✓ Cliffside Herb Gardens']
    },
    tremezzo: {
      title: 'Grand Hotel Tremezzo',
      location: 'Lake Como, Italy',
      price: '$820',
      badge: 'Lakefront Icon',
      rating: '★★★★★',
      reviews: '(189 verified reviews)',
      image: 'image/hotels/Grand Hotel.webp',
      desc: 'An authentic Art Nouveau palace on the western shores of Lake Como, offering breathtaking vistas over Bellagio, private historic gardens, three pools including a floating pool, and private water limousine transfers.',
      amenities: ['✓ Floating Lake Pool', '✓ Bellagio Panoramic View', '✓ Private Water Limousine', '✓ 100-Year Historic Park', '✓ T Spa Panoramic Suite']
    },
    oberoi: {
      title: 'The Oberoi Udaivilas, Udaipur',
      location: 'Udaipur, India',
      price: '$540',
      badge: 'Heritage Royal Palace',
      rating: '★★★★★',
      reviews: '(162 verified reviews)',
      image: 'image/hotels/Udaipur, India.webp',
      desc: 'Spread over 50 acres on the banks of Lake Pichola, The Oberoi Udaivilas stands on the 200-year-old hunting grounds of the Maharana of Mewar, with dome ceilings, hand-painted frescoes, and private reflection pools.',
      amenities: ['✓ Private Reflection Pool', '✓ Lake Pichola Boat Transfers', '✓ Royal Heritage Courtyards', '✓ Ayurvedic Wellness Spa', '✓ Peacock Sanctuary']
    },
    beverly: {
      title: 'AKA Beverly Hills',
      location: 'Los Angeles, United States',
      price: '$490',
      badge: 'Contemporary Luxury',
      rating: '★★★★★',
      reviews: '(143 verified reviews)',
      image: 'image/hotels/AKA Beverly Hills.webp',
      desc: 'Exclusive serviced luxury suites steps from world-famous Rodeo Drive. Features private outdoor terraces overlooking the Hollywood Hills, personal concierge service, and discreet private residence entrances.',
      amenities: ['✓ Hollywood Hills Terrace', '✓ Private Rodeo Drive Access', '✓ Dedicated 24/7 Concierge', '✓ In-Suite Gourmet Kitchen', '✓ Private Resident Lounge']
    }
  };

  hotelDetailButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const hotelKey = btn.getAttribute('data-hotel');
      const data = hotelsData[hotelKey];
      if (!data || !hotelModal) return;

      document.getElementById('hotel-modal-title').textContent = data.title;
      document.getElementById('hotel-modal-loc').textContent = data.location;
      document.getElementById('hotel-modal-price').textContent = data.price;
      document.getElementById('hotel-modal-badge').textContent = data.badge;
      document.getElementById('hotel-modal-desc').textContent = data.desc;
      
      const starsEl = document.getElementById('hotel-modal-stars');
      if (starsEl) starsEl.textContent = data.rating;
      
      const reviewsEl = document.getElementById('hotel-modal-reviews');
      if (reviewsEl) reviewsEl.textContent = data.reviews;

      const amenitiesEl = document.getElementById('hotel-modal-amenities');
      if (amenitiesEl && data.amenities) {
        amenitiesEl.innerHTML = data.amenities.map(a => `<span class="amenity-chip">${a}</span>`).join('');
      }

      const imgEl = document.getElementById('hotel-modal-img');
      if (imgEl) {
        imgEl.src = data.image;
        imgEl.alt = data.title;
      }

      hotelModal.showModal();
    });
  });

  if (btnCloseHotel && hotelModal) {
    btnCloseHotel.addEventListener('click', () => {
      hotelModal.close();
    });
  }

  if (hotelModal) {
    hotelModal.addEventListener('click', (e) => {
      if (e.target === hotelModal) {
        hotelModal.close();
      }
    });
  }

  const btnBookStay = document.getElementById('btn-book-stay');
  if (btnBookStay && hotelModal) {
    btnBookStay.addEventListener('click', () => {
      hotelModal.close();
      showToast('Reservation inquiry registered! Our concierge specialist will contact you shortly.');
    });
  }

  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterFeedback = document.getElementById('newsletter-feedback');
  const subscribeInput = document.getElementById('subscribe-email');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = subscribeInput?.value.trim();

      if (email && email.includes('@')) {
        if (newsletterFeedback) {
          newsletterFeedback.className = 'newsletter-feedback is-success';
          newsletterFeedback.textContent = '✓ Subscribed! Check your inbox for our latest secret hotel guide.';
        }
        showToast('✓ Welcome to 2rism! Check your inbox for exclusive travel insights.');
        newsletterForm.reset();
      } else {
        if (newsletterFeedback) {
          newsletterFeedback.className = 'newsletter-feedback is-error';
          newsletterFeedback.textContent = 'Please enter a valid email address.';
        }
      }
    });
  }

  const userProfile = document.getElementById('user-profile-trigger');
  if (userProfile) {
    userProfile.addEventListener('click', () => {
      showToast('Explorer Club: Valeriya Cherniavskaya (Level 2 · 4,200 travel miles)');
    });
  }
});
