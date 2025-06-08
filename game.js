document.addEventListener('DOMContentLoaded', () => {
  const collectedItems = new Set();
  const inventoryList = document.getElementById('inventory-list');
  const sanityDisplay = document.getElementById('sanity-display');
  let sanity = 100;
  const scene = document.querySelector('a-scene');
  const player = document.getElementById('player');
  const flickerLight = document.getElementById('flicker-light');

  // INVENTORY SYSTEM
  function updateInventory() {
    inventoryList.innerHTML = collectedItems.size === 0
      ? '<li>Nothing yet...</li>'
      : Array.from(collectedItems)
          .map(id => `<li>${id.replace('item', 'Item ')}</li>`)
          .join('');
  }

  // SANITY SYSTEM
  function updateSanityDisplay() {
    sanityDisplay.textContent = `Sanity: ${sanity}%`;
  }

  // TRIPPY HALLUCINATION EFFECT
  function triggerHallucination() {
    scene.setAttribute('fog', 'type: exponential; color: #330033; density: 0.4');
    flickerLight.setAttribute('color', '#ff66ff');

    // Camera shake effect
    let shakeTime = 1000;
    const interval = 50;
    const originalPosition = player.getAttribute('position');
    const shake = setInterval(() => {
      const x = originalPosition.x + (Math.random() - 0.5) * 0.05;
      const y = originalPosition.y + (Math.random() - 0.5) * 0.05;
      const z = originalPosition.z + (Math.random() - 0.5) * 0.05;
      player.setAttribute('position', `${x} ${y} ${z}`);
    }, interval);

    setTimeout(() => {
      clearInterval(shake);
      player.setAttribute('position', originalPosition); // Reset
    }, shakeTime);
  }

  // FLICKERING LIGHT LOOP
  function flicker() {
    if (flickerLight) {
      flickerLight.setAttribute('intensity', (0.4 + Math.random() * 0.5).toFixed(2));
    }
    setTimeout(flicker, 150 + Math.random() * 300);
  }
  flicker();

  // ITEM COLLECTION
  function onItemClicked(evt) {
    const el = evt.target;
    const id = el.getAttribute('id');

    if (!collectedItems.has(id)) {
      collectedItems.add(id);
      el.setAttribute('visible', 'false');
      updateInventory();

      // Lower sanity
      sanity = Math.max(0, sanity - 10);
      updateSanityDisplay();

      alert(`You picked up ${id.replace('item', 'Item ')}. Your sanity slips...`);

      if (sanity <= 50) {
        triggerHallucination();
      }
    }
  }

  // ADD CLICK LISTENERS
  function setupListeners() {
    const items = scene.querySelectorAll('.clickable');
    items.forEach(item => item.addEventListener('click', onItemClicked));
  }

  if (scene.hasLoaded) {
    setupListeners();
  } else {
    scene.addEventListener('loaded', setupListeners);
  }

  updateInventory();
  updateSanityDisplay();

  // HEAD BOBBING ANIMATION
  let isMoving = false;
  let bobAmount = 0;
  function animateBobbing() {
    const pos = player.getAttribute('position');
    const newY = 1.6 + Math.sin(bobAmount) * 0.03;
    player.setAttribute('position', `${pos.x} ${newY} ${pos.z}`);
    if (isMoving) bobAmount += 0.2;
    requestAnimationFrame(animateBobbing);
  }
  animateBobbing();

  // DETECT WASD MOVEMENT KEYS
  const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD']);
  document.addEventListener('keydown', e => {
    if (movementKeys.has(e.code)) isMoving = true;
  });
  document.addEventListener('keyup', e => {
    if (movementKeys.has(e.code)) isMoving = false;
  });
});
