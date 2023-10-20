// Mobail Nav button
const navBtn = document.querySelector('.nav-button');
const menuIcon = document.querySelector('.nav-button-icon');
const nav = document.querySelector('.mobail__nav ');
const fade = document.querySelector('.mobail__nav-fade');

navBtn.onclick = function() {
   nav.classList.toggle('mobail__nav--open');
   fade.classList.toggle('mobail__nav-fade--open');
   menuIcon.classList.toggle('nav-button-icon--active');
   document.body.classList.toggle('no-scroll');
};

fade.onclick = function() {
   nav.classList.toggle('mobail__nav--open');
   fade.classList.toggle('mobail__nav-fade--open');
   menuIcon.classList.toggle('nav-button-icon--active');
   document.body.classList.toggle('no-scroll');
}