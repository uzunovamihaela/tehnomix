// Click-through: set window.clickTag before this script (ad servers do it automatically).
const EXIT_URL = window.clickTag || 'https://www.ninjakitchen.com';
// Button + dial positions on the blender image, in % (power, manual, blendsense, mode, bowl, dial)
const POINTS = [[44.1,63.5],[48.9,63.5],[54.1,63.5],[59.4,63.5],[64,63.5],[53.9,75]];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MAX_MS = 30000; // stop looping animation after 30s (ad-network limit)

function initAd(ad) {
  const items = [...ad.querySelectorAll('.rv')].filter(e => e.offsetParent), // visible reveal items, DOM order
        cta = ad.querySelector('.cta'), beacon = ad.querySelector('.beacon'),
        counters = ad.querySelectorAll('.cnt');
  let timers = [], countTimer, k = 0, blinkTimer;

  function countTo15() {                       // Detect Dial preset counter 00 → 15
    clearInterval(countTimer); let n = 0;
    counters.forEach(c => c.textContent = '00');
    countTimer = setInterval(() => {
      n++; counters.forEach(c => c.textContent = String(n).padStart(2, '0'));
      if (n >= 15) clearInterval(countTimer);
    }, 80);
  }
  function play() {                            // reveal: headline → sub → lines one by one → CTA
    timers.forEach(clearTimeout); clearInterval(countTimer);
    counters.forEach(c => c.textContent = '00');
    items.forEach(e => e.classList.remove('on'));;
    const step = ad.dataset.f === 'lb' ? 800 : 700;
    items.forEach((e, i) => timers.push(setTimeout(() => {
      e.classList.add('on');
      if (e.textContent.includes('15 preset')) countTo15();
    }, REDUCED ? 0 : 300 + i * step)));
  }
  function shift() {                           // beacon hops to the next control
    const p = POINTS[k++ % POINTS.length];
    beacon.style.left = p[0] + '%'; beacon.style.top = p[1] + '%';
  }
  shift(); blinkTimer = setInterval(shift, 900);
  setTimeout(() => { clearInterval(blinkTimer); beacon.style.display = 'none'; }, MAX_MS);

  ad.querySelector('.hs').addEventListener('mouseenter', countTo15);   // rich-media hover
  ad.addEventListener('click', e => { if (!e.target.closest('.rp')) window.open(EXIT_URL, '_blank'); });
  ad.querySelector('.rp').addEventListener('click', e => { e.stopPropagation(); beacon.style.display = ''; play(); });
  play();
}
document.querySelectorAll('.ad').forEach(initAd);
