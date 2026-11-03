document.addEventListener('DOMContentLoaded', () => {
  const navBtn = document.querySelector('.nav-button');
  const menuIcon = document.querySelector('.nav-button-icon');
  const nav = document.getElementById('mobile-nav');
  const fade = document.getElementById('nav-fade');
  const closeBtn = document.getElementById('btn-close-mobile-nav');
  const navLinks = document.querySelectorAll('.mobail__nav-list a');

  function openMenu() {
    if (!nav || !fade) return;
    nav.classList.add('mobail__nav--open');
    fade.classList.add('mobail__nav-fade--open');
    if (menuIcon) menuIcon.classList.add('nav-button-icon--active');
    if (navBtn) navBtn.setAttribute('aria-expanded', 'true');
    nav.setAttribute('aria-hidden', 'false');
    fade.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeMenu() {
    if (!nav || !fade) return;
    nav.classList.remove('mobail__nav--open');
    fade.classList.remove('mobail__nav-fade--open');
    if (menuIcon) menuIcon.classList.remove('nav-button-icon--active');
    if (navBtn) navBtn.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
    fade.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  if (navBtn) {
    navBtn.addEventListener('click', () => {
      const isOpen = nav && nav.classList.contains('mobail__nav--open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  if (fade) {
    fade.addEventListener('click', closeMenu);
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.forEach((l) => l.classList.remove('active'));
      link.classList.add('active');
      closeMenu();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav && nav.classList.contains('mobail__nav--open')) {
      closeMenu();
    }
  });
});
