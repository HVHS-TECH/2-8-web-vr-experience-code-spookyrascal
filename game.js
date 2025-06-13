document.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');
  const rig = document.getElementById('rig');               // Moves in x,z
  const player = document.getElementById('playerCamera');   // Camera inside rig, for bobbing
  
  if (!scene || !rig || !player) {
    console.error('Missing required A-Frame elements: scene, rig, or playerCamera');
    return;
  }

  const inventoryList = document.getElementById('inventory-list');
  const sanityDisplay = document.getElementById('sanity-display');
  const flickerLight = document.getElementById('flicker-light');

  let sanity = 100;
  let velocity = { x: 0, z: 0 };
  let direction = { x: 0, z: 0 };
  let isMoving = false;

  const speed = 0.05;
  const friction = 0.85;

  const collectedItems = new Set();

  // Dialogue arrays based on sanity thresholds
  const dialogueLines = [
    { sanityThreshold: 80, texts: ["Why are you here so late?", "I see you picking up things...", "They don't like visitors after dark..."] },
    { sanityThreshold: 50, texts: ["You're not alone...", "I watch you... always watching.", "You can't hide forever."] },
    { sanityThreshold: 20, texts: ["Closer now...", "Feel my breath behind you...", "You can't escape me."] },
    { sanityThreshold: 10, texts: ["I'm inside your mind.", "You belong to me now.", "Forever."] }
  ];

  function updateInventory() {
    if (!inventoryList) return;
    if (collectedItems.size === 0) {
      inventoryList.innerHTML = 'Nothing yet...';
    } else {
      inventoryList.innerHTML = [...collectedItems].map(id =>
        `<li style="color: #ff0044; text-shadow: 0 0 5px #ff0044, 0 0 10px #ff6699, 0 0 15px #ff003c, 0 0 20px #ff66cc; animation: glitch 1.5s infinite;">
          ${id.replace('item', 'Item ')}
        </li>`).join('');
    }
  }

  function updateSanityDisplay() {
    if (!sanityDisplay) return;
    const greenRed = Math.floor(170 * sanity / 100);
    sanityDisplay.textContent = `Sanity: ${sanity.toFixed(0)}%`;
    sanityDisplay.style.color = `rgba(255, ${greenRed}, ${greenRed}, 1)`;
  }

  // Removed dialogueBox as it doesn't exist in HTML, but you can add one if you want

  function showDialogue(text) {
    // If you want on-screen dialogue, create a <div id="dialogue-box"></div> in HTML and uncomment below
    /*
    const dialogueBox = document.getElementById('dialogue-box');
    if (!dialogueBox) return;
    dialogueBox.textContent = text;
    dialogueBox.style.opacity = 1;
    clearTimeout(dialogueBox.timeout);
    dialogueBox.timeout = setTimeout(() => {
      dialogueBox.style.opacity = 0;
    }, 4000);
    */
  }

  function stalkerDialogue() {
    if (sanity <= 0) return;
    for (let i = dialogueLines.length - 1; i >= 0; i--) {
      if (sanity <= dialogueLines[i].sanityThreshold) {
        const texts = dialogueLines[i].texts;
        const randomText = texts[Math.floor(Math.random() * texts.length)];
        showDialogue(randomText);
        break;
      }
    }
  }

  let stalkerCooldown = 0;
  function updateStalker() {
    if (stalkerCooldown > 0) {
      stalkerCooldown--;
      return;
    }

    const chance = sanity < 50 ? 0.2 : 0.05;
    if (Math.random() < chance) {
      const rigPos = rig.getAttribute('position');
      const offsetX = (Math.random() - 0.5) * 4;
      const offsetZ = (Math.random() - 0.5) * 4;

      const shadow = document.createElement('a-box');
      shadow.setAttribute('color', '#220022');
      shadow.setAttribute('opacity', '0.35');
      shadow.setAttribute('depth', '2');
      shadow.setAttribute('height', '3');
      shadow.setAttribute('width', '0.5');
      shadow.setAttribute('position', `${rigPos.x + offsetX} 0.1 ${rigPos.z + offsetZ}`);
      shadow.setAttribute('rotation', `0 45 0`);
      scene.appendChild(shadow);

      setTimeout(() => shadow.remove(), 800);

      stalkerCooldown = 50;
      stalkerDialogue();
    }
  }

  let bobAmount = 0;
  function animateBobbingAndSway() {
    const baseHeight = 1.6;
    const bobHeight = baseHeight + Math.sin(bobAmount) * 0.03;
    const swayX = Math.sin(bobAmount * 0.7) * 0.015;
    const swayZ = Math.cos(bobAmount * 0.7) * 0.015;

    player.setAttribute('position', `${swayX} ${bobHeight} ${swayZ}`);

    if (isMoving) bobAmount += 0.2;

    requestAnimationFrame(animateBobbingAndSway);
  }

  function flicker() {
    if (flickerLight) {
      flickerLight.setAttribute('intensity', (0.3 + Math.random() * 0.6).toFixed(2));
    }
    setTimeout(flicker, 150 + Math.random() * 350);
  }

  function triggerHallucination() {
    const rigPos = rig.getAttribute('position');
    scene.setAttribute('fog', 'type: exponential; color: #330033; density: 0.5');
    flickerLight.setAttribute('color', '#ff66ff');
    flickerLight.setAttribute('intensity', 1.2);

    const shake = setInterval(() => {
      const x = rigPos.x + (Math.random() - 0.5) * 0.06;
      const y = rigPos.y;
      const z = rigPos.z + (Math.random() - 0.5) * 0.06;
      rig.setAttribute('position', `${x} ${y} ${z}`);
    }, 50);

    setTimeout(() => {
      clearInterval(shake);
      rig.setAttribute('position', rigPos);
      flickerLight.setAttribute('color', '#ffffff');
      flickerLight.setAttribute('intensity', 0.9);
      scene.setAttribute('fog', 'type: exponential; color: #161311; density: 0.03');
    }, 1500);
  }

  function onItemClicked(evt) {
    const el = evt.target;
    const id = el.getAttribute('id');

    if (!collectedItems.has(id)) {
      collectedItems.add(id);
      el.setAttribute('visible', 'false');
      updateInventory();

      sanity = Math.max(0, sanity - (8 + Math.floor(Math.random() * 7)));
      updateSanityDisplay();

      alert(`You picked up ${id.replace('item', 'Item ')}. Your sanity slips...`);

      if (sanity <= 50) triggerHallucination();
    }
  }

  function setupListeners() {
    scene.querySelectorAll('.clickable').forEach(item => item.addEventListener('click', onItemClicked));
  }

  if (scene.hasLoaded) setupListeners();
  else scene.addEventListener('loaded', setupListeners);

  updateInventory();
  updateSanityDisplay();
  animateBobbingAndSway();
  flicker();

  const keysPressed = new Set();
  const movementKeys = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD']);

  document.addEventListener('keydown', e => {
    if (movementKeys.has(e.code)) keysPressed.add(e.code);
  });

  document.addEventListener('keyup', e => {
    if (movementKeys.has(e.code)) keysPressed.delete(e.code);
  });

  function movePlayer() {
    direction = { x: 0, z: 0 };
    if (keysPressed.has('KeyW')) direction.z -= 1;
    if (keysPressed.has('KeyS')) direction.z += 1;
    if (keysPressed.has('KeyA')) direction.x -= 1;
    if (keysPressed.has('KeyD')) direction.x += 1;

    const length = Math.hypot(direction.x, direction.z);
    if (length > 0) {
      direction.x /= length;
      direction.z /= length;
      velocity.x += direction.x * speed;
      velocity.z += direction.z * speed;
      isMoving = true;
    } else {
      isMoving = false;
    }

    velocity.x *= friction;
    velocity.z *= friction;

    const rigPos = rig.getAttribute('position');
    rig.setAttribute('position', `${rigPos.x + velocity.x} ${rigPos.y} ${rigPos.z + velocity.z}`);

    requestAnimationFrame(movePlayer);
  }
  movePlayer();

  setInterval(() => {
    if (sanity > 0) {
      sanity = Math.max(0, sanity - 0.05);
      updateSanityDisplay();
    }
  }, 4000);

  setInterval(updateStalker, 2000);
});

// Stalker component with player check:
AFRAME.registerComponent('stalker', {
  tick: function () {
    const player = document.querySelector('#playerCamera');
    if (!player) return;

    const playerPos = new THREE.Vector3();
    const playerDir = new THREE.Vector3();
    player.object3D.getWorldPosition(playerPos);
    player.object3D.getWorldDirection(playerDir);

    document.querySelectorAll('.mannequin').forEach(m => {
      const mannequin = m.object3D;
      const mannequinPos = new THREE.Vector3();
      mannequin.getWorldPosition(mannequinPos);

      const toPlayer = new THREE.Vector3().subVectors(playerPos, mannequinPos).normalize();
      if (toPlayer.dot(playerDir) < 0) {
        // Move mannequin a tiny bit towards player
        mannequin.position.lerp(playerPos, 0.01);
      }
    });
  }
});
