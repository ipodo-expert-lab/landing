let sliderIndex = 0;
const TOTAL_CARDS = 8;

function initSlider() {
  const dots = document.getElementById('sliderDots');
  if (!dots) return;
  dots.innerHTML = '';
  for (let i = 0; i < TOTAL_CARDS; i++) {
    const d = document.createElement('div');
    d.className = 'slider-dot' + (i === 0 ? ' active' : '');
    d.onclick = () => goToSlide(i);
    dots.appendChild(d);
  }
  updateSlider();
  initTouch();
}

function slideCases(dir) {
  sliderIndex = Math.max(0, Math.min(TOTAL_CARDS - 1, sliderIndex + dir));
  updateSlider();
}

function goToSlide(i) {
  sliderIndex = i;
  updateSlider();
}

function updateSlider() {
  const slider = document.getElementById('casesSlider');
  if (!slider) return;
  const cardWidth = slider.children[0].offsetWidth + 12;
  slider.style.transform = `translateX(-${sliderIndex * cardWidth}px)`;
  document.querySelectorAll('.slider-dot').forEach((d, i) => d.classList.toggle('active', i === sliderIndex));
  document.getElementById('sliderPrev').disabled = sliderIndex === 0;
  document.getElementById('sliderNext').disabled = sliderIndex === TOTAL_CARDS - 1;
}

function initTouch() {
  const slider = document.getElementById('casesSlider');
  if (!slider) return;

  let startX = 0;
  let startY = 0;
  let isDragging = false;

  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = true;
  }, { passive: true });

  slider.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const diffX = startX - e.touches[0].clientX;
    const diffY = Math.abs(startY - e.touches[0].clientY);
    // Only prevent scroll if horizontal swipe
    if (Math.abs(diffX) > diffY) {
      e.preventDefault();
    }
  }, { passive: false });

  slider.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    const diffX = startX - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 40) {
      slideCases(diffX > 0 ? 1 : -1);
    }
    isDragging = false;
  }, { passive: true });
}

window.addEventListener('load', initSlider);
window.addEventListener('resize', updateSlider);
