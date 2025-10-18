const app = document.getElementById('app');
const message = document.getElementById('message');
let touches = {};

app.addEventListener('touchstart', (e) => {
  e.preventDefault();
  for (const touch of e.touches) {
    if (!touches[touch.identifier]) {
      const dot = document.createElement('div');
      dot.className = 'absolute w-16 h-16 bg-blue-500 rounded-full opacity-70 transition-all duration-300';
      dot.style.left = `${touch.pageX - 32}px`;
      dot.style.top = `${touch.pageY - 32}px`;
      dot.id = `touch-${touch.identifier}`;
      app.appendChild(dot);
      touches[touch.identifier] = dot;
    }
  }

  message.textContent = 'Hold still...';
  
  // Wait 1 second before choosing
  clearTimeout(app.choiceTimeout);
  app.choiceTimeout = setTimeout(() => chooseRandomFinger(), 1000);
});

app.addEventListener('touchmove', (e) => {
  e.preventDefault();
  for (const touch of e.touches) {
    const dot = touches[touch.identifier];
    if (dot) {
      dot.style.left = `${touch.pageX - 32}px`;
      dot.style.top = `${touch.pageY - 32}px`;
    }
  }
});

app.addEventListener('touchend', (e) => {
  e.preventDefault();
  for (const touch of e.changedTouches) {
    const dot = touches[touch.identifier];
    if (dot) {
      dot.remove();
      delete touches[touch.identifier];
    }
  }
  message.textContent = 'Place your fingers on the screen';
});

function chooseRandomFinger() {
  const keys = Object.keys(touches);
  if (keys.length === 0) return;

  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  const chosen = touches[randomKey];

  // Highlight chosen finger
  for (const id in touches) {
    touches[id].classList.remove('bg-blue-500');
    touches[id].classList.add('bg-gray-700');
  }
  chosen.classList.remove('bg-gray-700');
  chosen.classList.add('bg-green-400', 'scale-125');
  message.textContent = 'Chosen!';
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}
