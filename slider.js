let sliderIndex = 0;
const TOTAL_CARDS = 12;

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

window.addEventListener('load', initSlider);
window.addEventListener('resize', updateSlider);