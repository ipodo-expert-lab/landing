// ── FAQ accordion ──
function toggleFaq(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

// ── Stream radio highlight ──
document.querySelectorAll('.stream-opt input').forEach(radio => {
  radio.addEventListener('change', () => {
    document.querySelectorAll('.stream-opt').forEach(l => l.classList.remove('selected-opt'));
    radio.closest('.stream-opt').classList.add('selected-opt');
  });
});

// ── Scroll fade-up animations ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ══════════════════════════════════════
// SendPulse email integration
// ══════════════════════════════════════

async function submitForm() {
  const name   = document.getElementById('fname').value.trim();
  const email  = document.getElementById('femail').value.trim();
  const phone  = document.getElementById('fphone').value.trim();
  const stream = document.querySelector('input[name="stream"]:checked').value;
  const lang   = localStorage.getItem('lang') || 'ru';
  const btn    = document.getElementById('submitBtn');

  if (!name || !email) { alert('Пожалуйста, введите имя и email'); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Введите корректный email'); return; }

  btn.textContent = 'Отправляем...';
  btn.disabled = true;

  try {
    const res = await fetch('/.netlify/functions/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, stream, lang })
    });

    if (!res.ok) throw new Error();

    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('formSuccess').style.display = 'block';

  } catch (err) {
    document.getElementById('bookingForm').style.display = 'none';
    document.getElementById('formError').style.display = 'block';
  }
}
