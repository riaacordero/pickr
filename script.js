const app = document.getElementById('app');
const message = document.getElementById('message');
let touches = {};

app.addEventListener('touchstart', (e) => {
  e.preventDefault();
  for (const touch of e.touches) {
    if (!touches[touch.identifier]) {
      const point = createTouchPoint(touch);
      point.id = `touch-${touch.identifier}`;
      app.appendChild(point);
      touches[touch.identifier] = point;
    }
  }

  message.textContent = 'Hold still...';

  clearTimeout(app.choiceTimeout);
  app.choiceTimeout = setTimeout(() => chooseRandomFinger(), 1000);
});

app.addEventListener('touchmove', (e) => {
  e.preventDefault();
  for (const touch of e.touches) {
    const point = touches[touch.identifier];
    if (point) {
      point.style.left = `${touch.pageX}px`;
      point.style.top = `${touch.pageY}px`;
    }
  }
});

app.addEventListener('touchend', (e) => {
  e.preventDefault();
  const currentTouches = Array.from(e.touches).map(touch => touch.identifier);
  
  Object.keys(touches).forEach(id => {
    if (!currentTouches.includes(Number(id))) {
      touches[id].remove();
      delete touches[id];
    }
  });

  if (Object.keys(touches).length === 0) {
    message.textContent = 'Place your fingers on the screen';
    clearTimeout(app.choiceTimeout);
  }
});

function chooseRandomFinger() {
  const keys = Object.keys(touches);
  if (keys.length === 0) return;

  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const chosen = touches[randomKey];

  for (const id in touches) {
    touches[id].style.opacity = '0.35';
    touches[id].style.transform = 'translate(-50%, -50%) scale(1)';
    touches[id].style.boxShadow = touches[id].style.boxShadow.replace(/rgba\([^)]*\)/g, (m) => m); // keep as-is
  }

  chosen.style.opacity = '1';
  chosen.style.transform = 'translate(-50%, -50%) scale(1.18)';
  const bg = chosen.style.background || '#ffffff';
  chosen.style.boxShadow = `0 18px 48px ${hexToRgba(bg, 0.34)}, inset 0 -8px 24px ${hexToRgba('#000000', 0.3)}`;

  message.textContent = 'Chosen!';
}

const touchColors = [
  '#FF6B6B', // coral red
  '#4ECDC4', // turquoise
  '#45B7D1', // sky blue
  '#96CEB4', // sage green
  '#FFBE0B', // golden yellow
  '#FF006E', // hot pink
  '#8338EC', // purple
  '#3A86FF', // bright blue
  '#FB5607', // orange
  '#FFFFFF'  // white for any additional touches
];

function hexToRgba(hex, alpha = 1) {
  const h = hex.replace('#', '');
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0,2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2,4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4,6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function createTouchPoint(touch) {
  const point = document.createElement('div');
  const size = 120;
  const color = touchColors[touch.identifier % touchColors.length];
  const glow = hexToRgba(color, 0.22);
  const innerGlow = hexToRgba(color, 0.6);

  point.className = 'touch-point absolute transform -translate-x-1/2 -translate-y-1/2';
  point.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${touch.pageX}px;
    top: ${touch.pageY}px;
    background: ${color};
    border-radius: 50%;
    opacity: 1;
    transition: all 160ms ease;
    box-shadow: 0 8px 28px ${glow}, inset 0 -6px 18px ${hexToRgba('#000000', 0.25)};
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  `;

  const innerPoint = document.createElement('div');
  const innerSize = Math.round(size * 0.45);
  innerPoint.style.cssText = `
    width: ${innerSize}px;
    height: ${innerSize}px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, ${hexToRgba('#ffffff', 0.9)} 0%, ${innerGlow} 35%, ${hexToRgba(color, 0.15)} 70%);
    transform: translateY(-6%);
    box-shadow: 0 4px 12px ${hexToRgba('#000000', 0.25)};
    pointer-events: none;
  `;

  point.appendChild(innerPoint);
  return point;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
