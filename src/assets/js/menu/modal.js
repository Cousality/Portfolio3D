const open = document.getElementById('open');
const modal_container = document.getElementById('modal-container');
const close= document.getElementById('close');

open.addEventListener('click', () => {
   modal_container.classList.add('show'); 
});

close.addEventListener('click', () => {
   modal_container.classList.remove('show'); 
});


document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal_container.classList.contains('show')){
    modal_container.classList.remove('show'); 
  };
});

