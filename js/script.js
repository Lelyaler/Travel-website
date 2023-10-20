customSelect('select');

const picker = new easepick.create({
   element: document.getElementById('date'),
   css: [
       "https://cdn.jsdelivr.net/npm/@easepick/bundle@1.2.1/dist/index.css"
   ],
   zIndex: 10,
   format: 'DD.MM.YY'
});

/* Subscribe */

const inputSubscribe = document.querySelector('.input__subscribe');
const label = document.querySelector('.input__label');

inputSubscribe.addEventListener('input', ()=>{
     if(inputSubscribe.value.trim() !=='') {
      
      label.classList.add('input__label--top');
     } else {
      label.classList.remove('input__label--top');
      }
   });

/* Menu nav toggle */

