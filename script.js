const app = document.getElementById('app');
const message = document.getElementById('message');
const popSound = new Audio('assets/pop.mp3');
let touches = {};

function handleTouchStart(e) {
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
}

function handleTouchMove(e) {
  e.preventDefault();
  for (const touch of e.touches) {
    const point = touches[touch.identifier];
    if (point) {
      point.style.left = `${touch.pageX}px`;
      point.style.top = `${touch.pageY}px`;
    }
  }
}

function handleTouchEnd(e) {
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
}

app.addEventListener('touchstart', handleTouchStart, { passive: false });
app.addEventListener('touchmove', handleTouchMove, { passive: false });
app.addEventListener('touchend', handleTouchEnd, { passive: false });

function chooseRandomFinger() {
  const keys = Object.keys(touches);
  if (keys.length === 0) return;

  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const chosen = touches[randomKey];

  popSound.currentTime = 0;
  popSound.play().catch(() => {});

  for (const id in touches) {
    touches[id].style.opacity = '0.35';
    touches[id].style.transform = 'translate(-50%, -50%) scale(1)';
  }

  chosen.style.opacity = '1';
  chosen.style.transform = 'translate(-50%, -50%) scale(1.18)';
  const bg = chosen.style.background || '#ffffff';
  chosen.style.boxShadow = `0 18px 48px ${hexToRgba(bg, 0.34)}, inset 0 -8px 24px ${hexToRgba('#000000', 0.3)}`;

  message.textContent = 'Chosen!';
}

const touchColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFBE0B',
  '#FF006E', '#8338EC', '#3A86FF', '#FB5607', '#FFFFFF'
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
  const lighterColor = hexToRgba(color, 0.55);

  point.className = 'touch-point absolute transform -translate-x-1/2 -translate-y-1/2';
  point.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${touch.pageX}px;
    top: ${touch.pageY}px;
    background: radial-gradient(circle at center, ${lighterColor} 0%, ${color} 70%);
    border-radius: 50%;
    opacity: 1;
    transition: all 160ms ease;
    pointer-events: none;
  `;
  return point;
}

const isMobile = 'ontouchstart' in window;
const keyTouches = new Map();

function createKeyPoint(key, x, y) {
  const point = createTouchPoint({ 
    identifier: key.charCodeAt(0), 
    pageX: x, 
    pageY: y 
  });
  
  const keyLabel = document.createElement('span');
  keyLabel.className = 'key-label';
  keyLabel.textContent = key.toUpperCase();
  keyLabel.style.cssText = `
    position: absolute;
    font-size: 32px;
    font-weight: bold;
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    pointer-events: none;
  `;
  point.appendChild(keyLabel);
  
  return point;
}

if (!isMobile) {
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (/^[a-z0-9]$/.test(key) && !keyTouches.has(key)) {
      const x = Math.random() * (window.innerWidth - 200) + 100;
      const y = Math.random() * (window.innerHeight - 200) + 100;
      const point = createKeyPoint(key, x, y);
      point.id = `key-${key}`;
      app.appendChild(point);
      keyTouches.set(key, point);
      touches[key] = point;

      message.textContent = 'Hold still...';
      clearTimeout(app.choiceTimeout);
      app.choiceTimeout = setTimeout(() => chooseRandomFinger(), 1000);
    }
  });

  document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keyTouches.has(key)) {
      const point = keyTouches.get(key);
      point.remove();
      keyTouches.delete(key);
      delete touches[key];
      if (keyTouches.size === 0) {
        message.textContent = 'Press any key (A-Z, 0-9)';
        clearTimeout(app.choiceTimeout);
      }
    }
  });

  message.textContent = 'Press any key (A-Z, 0-9)';
} else {
  message.textContent = 'Place your fingers on the screen';
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/pickr/service-worker.js');
}
