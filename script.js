const app = document.getElementById('app');
const message = document.getElementById('message');
const popSound = new Audio('assets/pop.mp3');
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
  for (const id in touches) {
    touches[id].classList.add('bouncing');
  }

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
  for (const id in touches) {
    touches[id].classList.remove('bouncing');
  }
  const keys = Object.keys(touches);
  if (keys.length === 0) return;

  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const chosen = touches[randomKey];

  // Play the pop sound
  popSound.currentTime = 0; // Reset the audio to start
  popSound.play().catch(error => {
    // Silently handle any autoplay restrictions
    console.log('Could not play sound:', error);
  });

  for (const id in touches) {
    touches[id].style.opacity = '0.35';
    touches[id].style.transform = 'translate(-50%, -50%) scale(1)';
    touches[id].style.boxShadow = touches[id].style.boxShadow.replace(/rgba\([^)]*\)/g, (m) => m); // keep as-is
  }

  chosen.style.opacity = '1';
  chosen.style.transition = 'transform 0.35s ease-out, opacity 0.35s ease-out, box-shadow 0.35s ease-out';
  chosen.style.transform = 'translate(-50%, -50%) scale(1.18)';
  
  const bg = chosen.style.background || '#ffffff';
  
  chosen.style.boxShadow = `0 18px 48px ${hexToRgba(bg, 0.34)}, inset 0 -8px 24px ${hexToRgba('#000000', 0.3)}`;
  chosen.style.outline = '8px solid rgba(255, 255, 255, 0.7)';
  chosen.style.outlineOffset = '0px';
  chosen.style.transition = 'transform 0.35s ease-out, opacity 0.35s ease-out, box-shadow 0.35s ease-out, outline 0.25s ease-out';


  setTimeout(() => {
    chosen.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 700);



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
  const lighterColor = hexToRgba(color, 0.55); // Changed to 0.55 for 45% lighter

  point.className = 'touch-point absolute transform -translate-x-1/2 -translate-y-1/2';
  point.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${touch.pageX}px;
    top: ${touch.pageY}px;
    background: radial-gradient(circle at center, ${lighterColor} 0%, ${color} 70%);
    border-radius: 50%;
    opacity: 1;
    transition: all 0.6s ease-out;
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
        for (const id in touches) {
          touches[id].classList.add('bouncing');
        }      

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

  // Desktop msg:
  message.textContent = 'Press any key (A-Z, 0-9)';
} else {
  // Mobile msg
  message.textContent = 'Place your fingers on the screen';
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/pickr/service-worker.js');
}
