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

  const hotelModal = document.getElementById('hotel-modal');
  const btnCloseHotel = document.getElementById('btn-close-hotel');
  const hotelDetailButtons = document.querySelectorAll('.hotel__btn-details');
  const stayNightsVal = document.getElementById('stay-nights-val');
  const stayNightsMinus = document.getElementById('stay-nights-minus');
  const stayNightsPlus = document.getElementById('stay-nights-plus');
  const hotelModalTotal = document.getElementById('hotel-modal-total');
  const bookingConfirmCard = document.getElementById('booking-confirm-card');
  const hotelModalFooter = document.getElementById('hotel-modal-footer');
  const btnBookStay = document.getElementById('btn-book-stay');

  let currentHotelKey = 'monastero';
  let selectedNights = 3;

  const currencyRates = {
    USD: { symbol: '$', rate: 1.0 },
    EUR: { symbol: '€', rate: 0.92 },
    GBP: { symbol: '£', rate: 0.79 }
  };
  let currentCurrency = localStorage.getItem('2rism_currency') || 'USD';
  const currencyChips = document.querySelectorAll('.currency-chip');

  const hotelsData = {
    monastero: {
      title: 'Monastero Santa Rosa Hotel & Spa',
      location: 'Salerno, Italy',
      basePrice: 680,
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
      basePrice: 820,
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
      basePrice: 540,
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
      basePrice: 490,
      badge: 'Contemporary Luxury',
      rating: '★★★★★',
      reviews: '(143 verified reviews)',
      image: 'image/hotels/AKA Beverly Hills.webp',
      desc: 'Exclusive serviced luxury suites steps from world-famous Rodeo Drive. Features private outdoor terraces overlooking the Hollywood Hills, personal concierge service, and discreet private residence entrances.',
      amenities: ['✓ Hollywood Hills Terrace', '✓ Private Rodeo Drive Access', '✓ Dedicated 24/7 Concierge', '✓ In-Suite Gourmet Kitchen', '✓ Private Resident Lounge']
    }
  };

  function formatPrice(baseUsd, currency) {
    const cfg = currencyRates[currency] || currencyRates.USD;
    const converted = Math.round(baseUsd * cfg.rate);
    return `${cfg.symbol}${converted.toLocaleString()}`;
  }

  function updateModalPriceCalculation() {
    const data = hotelsData[currentHotelKey];
    if (!data) return;

    const pricePerNightStr = formatPrice(data.basePrice, currentCurrency);
    const totalPriceStr = formatPrice(data.basePrice * selectedNights, currentCurrency);

    const priceEl = document.getElementById('hotel-modal-price');
    if (priceEl) priceEl.textContent = pricePerNightStr;

    if (stayNightsVal) stayNightsVal.textContent = `${selectedNights} night${selectedNights > 1 ? 's' : ''}`;
    if (hotelModalTotal) hotelModalTotal.textContent = `Total: ${totalPriceStr} for ${selectedNights} nights`;
  }

  function updatePrices(currency) {
    currentCurrency = currency;
    localStorage.setItem('2rism_currency', currency);

    currencyChips.forEach((chip) => {
      const isActive = chip.getAttribute('data-currency') === currency;
      chip.classList.toggle('is-active', isActive);
      chip.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    document.querySelectorAll('.section__card--hotel').forEach((card) => {
      const hotelId = card.getAttribute('data-hotel-id');
      const hotel = hotelsData[hotelId];
      if (hotel) {
        const priceEl = card.querySelector('.hotel__price');
        if (priceEl) {
          priceEl.innerHTML = `${formatPrice(hotel.basePrice, currency)} <small>/ night</small>`;
        }
      }
    });

    updateModalPriceCalculation();
  }

  currencyChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const curr = chip.getAttribute('data-currency');
      if (curr) updatePrices(curr);
    });
  });

  if (stayNightsMinus) {
    stayNightsMinus.addEventListener('click', () => {
      if (selectedNights > 1) {
        selectedNights -= 1;
        updateModalPriceCalculation();
      }
    });
  }

  if (stayNightsPlus) {
    stayNightsPlus.addEventListener('click', () => {
      if (selectedNights < 30) {
        selectedNights += 1;
        updateModalPriceCalculation();
      }
    });
  }

  hotelDetailButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const hotelKey = btn.getAttribute('data-hotel');
      const data = hotelsData[hotelKey];
      if (!data || !hotelModal) return;

      currentHotelKey = hotelKey;
      selectedNights = 3;

      if (bookingConfirmCard) bookingConfirmCard.style.display = 'none';
      if (hotelModalFooter) hotelModalFooter.style.display = 'flex';

      document.getElementById('hotel-modal-title').textContent = data.title;
      document.getElementById('hotel-modal-loc').textContent = data.location;
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

      updateModalPriceCalculation();
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

  if (btnBookStay && hotelModal) {
    btnBookStay.addEventListener('click', () => {
      const data = hotelsData[currentHotelKey];
      const bookingRef = `#TRV-${Math.floor(1000 + Math.random() * 9000)}`;
      const totalPriceStr = formatPrice(data.basePrice * selectedNights, currentCurrency);

      const refEl = document.getElementById('booking-ref-code');
      if (refEl) refEl.textContent = bookingRef;

      const nightsSummary = document.getElementById('booking-summary-nights');
      if (nightsSummary) nightsSummary.textContent = `${selectedNights} nights / 2 guests · ${data.title}`;

      const totalPaidSummary = document.getElementById('booking-summary-total');
      if (totalPaidSummary) totalPaidSummary.textContent = totalPriceStr;

      if (bookingConfirmCard) bookingConfirmCard.style.display = 'flex';
      if (hotelModalFooter) hotelModalFooter.style.display = 'none';

      const savedTrips = JSON.parse(localStorage.getItem('2rism_trips') || '[]');
      savedTrips.push({ ref: bookingRef, hotel: data.title, nights: selectedNights, total: totalPriceStr, date: new Date().toLocaleDateString() });
      localStorage.setItem('2rism_trips', JSON.stringify(savedTrips));

      showToast(`Reservation ${bookingRef} confirmed! Saved to your trips.`);
    });
  }

  const storiesData = {
    eastvillage: {
      eyebrow: 'Culinary Walking Route',
      title: 'East Village Ice Cream Crawl',
      desc: 'A guided 1.5-mile culinary exploration through five distinct neighborhood parlors, exploring micro-batch recipes, natural infusions, and secret flavor profiles.',
      meta: 'Duration: ~3.5 Hours · Distance: 1.5 Miles · 5 Tasting Stops',
      stops: [
        {
          time: '01:00 PM',
          title: 'Morgenstern\'s Finest Ice Cream',
          desc: 'Start with classic French-style egg custard ice creams. Must-try: Raw Milk and Burnt Honey with Black Sesame cone.'
        },
        {
          time: '02:00 PM',
          title: 'Van Leeuwen Artisan Scoop Shop',
          desc: 'Walk along St. Marks Place to taste handcrafted cashew-and-coconut milk vegan scoops featuring Sicilian Pistachio.'
        },
        {
          time: '03:15 PM',
          title: 'Sundaes and Cones',
          desc: 'Beloved local staple renowned for East Asian inspired infusions like Sweet Taro Root, Wasabi, and roasted Corn.'
        },
        {
          time: '04:30 PM',
          title: 'Ray\'s Candy Store & Tompkins Square Park',
          desc: 'Conclude with historic Avenue A egg creams and beignets while taking in the neighborhood afternoon energy.'
        }
      ]
    },
    brooklyn: {
      eyebrow: 'Photography & Skyline Itinerary',
      title: 'Brooklyn Bridge Cinematic Photo Walk',
      desc: 'An inspiring step-by-step route crafted for visual creators to capture the early morning or golden hour light along the East River piers and suspension cables.',
      meta: 'Duration: ~4.5 Hours · Distance: 2.8 Miles · 4 Scenic Vantage Points',
      stops: [
        {
          time: '06:30 AM',
          title: 'Washington Street & Water Street (DUMBO)',
          desc: 'Iconic cobblestone corridor perfectly framing the Manhattan Bridge anchorage through historic brick warehouses.'
        },
        {
          time: '07:45 AM',
          title: 'Brooklyn Bridge Pedestrian Promenade',
          desc: 'Ascend from the Brooklyn approach. Use 35mm focal length to capture leading lines of the gothic limestone arches and steel diagonal suspenders.'
        },
        {
          time: '09:15 AM',
          title: 'Fulton Ferry Landing & River Café Pier',
          desc: 'Relax with artisanal espresso while taking in unobstructed panoramic views of the Lower Manhattan skyline.'
        },
        {
          time: '10:30 AM',
          title: 'Brooklyn Bridge Park Pier 1 Promenade',
          desc: 'Finish with a peaceful stroll across the green granite prospect hills overlooking Governors Island and the harbor.'
        }
      ]
    }
  };

  const storyModal = document.getElementById('story-modal');
  const btnCloseStory = document.getElementById('btn-close-story');
  const storyTimelineContainer = document.getElementById('story-timeline-container');
  const btnSaveItinerary = document.getElementById('btn-save-itinerary');
  let activeStoryKey = 'brooklyn';

  document.querySelectorAll('.button-itinerary').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const storyKey = btn.getAttribute('data-story');
      const story = storiesData[storyKey];
      if (!story || !storyModal) return;

      activeStoryKey = storyKey;
      document.getElementById('story-modal-eyebrow').textContent = story.eyebrow;
      document.getElementById('story-modal-title').textContent = story.title;
      document.getElementById('story-modal-desc').textContent = story.desc;
      document.getElementById('story-modal-meta').textContent = story.meta;

      if (storyTimelineContainer) {
        storyTimelineContainer.innerHTML = story.stops.map(s => `
          <div class="itinerary-step">
            <span class="itinerary-step__time">${s.time}</span>
            <h4 class="itinerary-step__title">${s.title}</h4>
            <p class="itinerary-step__desc">${s.desc}</p>
          </div>
        `).join('');
      }

      storyModal.showModal();
    });
  });

  if (btnCloseStory && storyModal) {
    btnCloseStory.addEventListener('click', () => {
      storyModal.close();
    });
  }

  if (storyModal) {
    storyModal.addEventListener('click', (e) => {
      if (e.target === storyModal) {
        storyModal.close();
      }
    });
  }

  if (btnSaveItinerary && storyModal) {
    btnSaveItinerary.addEventListener('click', () => {
      storyModal.close();
      showToast(`✓ "${storiesData[activeStoryKey]?.title}" itinerary saved to your offline trips!`);
    });
  }

  updatePrices(currentCurrency);

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
