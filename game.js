document.addEventListener('DOMContentLoaded', () => {
  const collectedItems = new Set();
  const inventoryList = document.getElementById('inventory-list');
  const sanityDisplay = document.getElementById('sanity-display'); // Create this in your HTML
  let sanity = 100; // Start with full sanity

  // Update inventory UI
  function updateInventory() {
    if (collectedItems.size === 0) {
      inventoryList.innerHTML = '<li>Nothing yet...</li>';
    } else {
      inventoryList.innerHTML = '';
      collectedItems.forEach(itemId => {
        const li = document.createElement('li');
        li.textContent = itemId.replace('item', 'Item ');
        inventoryList.appendChild(li);
      });
    }
  }

  // Update sanity UI
  function updateSanityDisplay() {
    sanityDisplay.textContent = `Sanity: ${sanity}%`;
  }

  // Trigger hallucination effects
  function triggerHallucination() {
    const sceneEl = document.querySelector('a-scene');
    // Example hallucination effect: fog and color shift
    sceneEl.setAttribute('fog', 'type: linear; color: #770077; near: 1; far: 20');
    sceneEl.setAttribute('animation__hallucinate', {
      property: 'background-color',
      to: '#550055',
      dur: 1000,
      loop: true,
      dir: 'alternate'
    });
  }

  // Flicker effect for light
  const flickerLight = document.getElementById('flicker-light');
  function flicker() {
    flickerLight.setAttribute('intensity', (0.5 + Math.random() * 0.4).toFixed(2));
    setTimeout(flicker, 150 + Math.random() * 350);
  }
  flicker();

  // Get the scene element
  const scene = document.querySelector('a-scene');

  // Click handler
  function onItemClicked(evt) {
    const el = evt.target;
    const id = el.getAttribute('id');

    if (!collectedItems.has(id)) {
      collectedItems.add(id);
      el.setAttribute('visible', 'false');
      updateInventory();

      // Decrease sanity
      sanity -= 10;
      if (sanity < 0) sanity = 0;
      updateSanityDisplay();

      alert(`You picked up ${id.replace('item', 'Item ')}! Your sanity slips...`);

      // Hallucinate if sanity is low
      if (sanity <= 50) {
        triggerHallucination();
      }
    }
  }

  // Setup listeners
  function setupListeners() {
    const items = scene.querySelectorAll('.clickable');
    items.forEach(item => {
      item.addEventListener('click', onItemClicked);
    });
  }

  if (scene.hasLoaded) {
    setupListeners();
  } else {
    scene.addEventListener('loaded', setupListeners);
  }

  updateInventory();
  updateSanityDisplay();
});
