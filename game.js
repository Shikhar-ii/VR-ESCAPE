(() => {
  const ROOM_PUZZLES = [
    [
      { id: 'r1-log', object: 'note', title: 'The incident log', objective: 'Recover the four-digit incident date. The handwritten note survived the wipe; the year is not required.', clue: '<div class="evidence-card">SHIFT LOG / APR 19<br>03:12 — perimeter test began<br>03:19 — <span class="redacted">[REDACTED]</span><br><br>“They pulled the power before dawn. The date is the key. Month first, then day.”</div>', label: 'ENTER DATE · MMDD', expected: '0419', hint: 'The log says April 19. Enter the month and day as four digits.', reward: 'SHIFT LOG', icon: '⌁', success: 'Incident date verified. The terminal retained its local credentials.' },
      { id: 'r1-terminal', object: 'terminal', title: 'Local credentials', objective: 'The operator left a passphrase in the terminal’s recovery buffer. Read the fragments and restore the word.', clue: '<div class="terminal-box">RECOVERY BUFFER / FRAGMENT 03<br>_ I G H T J A R<br><span class="danger">FIRST CHARACTER LOST</span><br>HINT: nocturnal bird. 8 characters.</div>', label: 'ENTER PASSPHRASE', expected: 'NIGHTJAR', hint: 'A nightjar is a nocturnal bird. The missing first character is N.', reward: 'LOCAL KEY', icon: '⌘', success: 'Local shell access restored. A staff badge is now visible in the access reader.' },
      { id: 'r1-panel', object: 'panel', title: 'Airlock override', objective: 'Use the badge reader’s four-digit override to release the airlock. Follow the marked sequence on the recovered badge.', clue: '<div class="evidence-card">BADGE // TIER 2<br>OVERRIDE SEQUENCE<br><span class="redacted">7 → 3 → 1 → 4</span><br><br>Reader mode: sequential PIN</div>', label: 'ENTER OVERRIDE PIN', expected: '7314', hint: 'Read the four marked digits from left to right: 7, 3, 1, 4.', reward: 'AIRLOCK KEY', icon: '▣', success: 'Override accepted. The airlock is open and Network Investigation is accessible.' }
    ],
    [
      { id: 'r2-logs', object: 'terminal', title: 'Failed authentication', objective: 'One external address appears repeatedly in failed login attempts just before the breach. Identify the source IP.', clue: '<div class="log-table"><span>02:41:08 · LOGIN FAIL</span><strong>10.04.2.18</strong><span>02:41:11 · LOGIN FAIL</span><strong class="bad">185.220.101.7</strong><span>02:41:12 · VPN DROP</span><strong>10.04.2.18</strong><span>02:41:14 · LOGIN FAIL</span><strong class="bad">185.220.101.7</strong><span>02:41:17 · LOGIN FAIL</span><strong class="bad">185.220.101.7</strong></div>', label: 'FLAG SUSPICIOUS IP', expected: '185.220.101.7', hint: 'Look for the address repeated on failed logins, not the internal VPN address.', reward: 'ATTACKER IP', icon: '◎', success: 'Source isolated. The attacker pivoted through a single exposed gateway.' },
      { id: 'r2-map', object: 'note', title: 'Trace the pivot', objective: 'Follow the hops from the exposed gateway. Count only the internal nodes between the edge router and the core.', clue: '<div class="topology-map"><span class="topology-node">EDGE<br>01</span><span class="topology-arrow">→</span><span class="topology-node alert">VPN<br>02</span><span class="topology-arrow">→</span><span class="topology-node">AUTH<br>03</span><span class="topology-arrow">→</span><span class="topology-node alert">CORE<br>04</span></div><p class="dialog-copy">Trace note: “The edge is the entry, the core is the destination. Count the systems crossed in between.”</p>', label: 'INTERNAL HOPS CROSSED', expected: '2', hint: 'Do not count EDGE or CORE. Only VPN and AUTH sit between them.', reward: 'PIVOT MAP', icon: '⌖', success: 'Two internal hops confirmed. The attacker reached the core through VPN and AUTH.' },
      { id: 'r2-packet', object: 'panel', title: 'Decode the payload', objective: 'The intercepted packet carries a service port. Match the port to its protocol, then enter the protocol name.', clue: '<div class="terminal-box">CAPTURED PACKET / 02:44:02<br>SRC 185.220.101.7 → CORE<br>TCP DESTINATION PORT: <b>443</b><br>PAYLOAD: 52 45 53 54 4F 52 45<br><span class="danger">TLS WRAPPED / CONTENT UNKNOWN</span></div>', label: 'PROTOCOL ON PORT 443', expected: 'HTTPS', hint: 'TCP port 443 is the standard encrypted web service. Enter its protocol name.', reward: 'PAYLOAD KEY', icon: '⌑', success: 'Payload decoded. The message contains a recovery instruction for the control room.' }
    ],
    [
      { id: 'r3-cipher', object: 'terminal', title: 'Encrypted directive', objective: 'The attacker used a Caesar shift. Move each letter three places backward to reveal the command.', clue: '<div class="cipher-box">UHVWRUH</div><p class="dialog-copy">CIPHER: CAESAR / SHIFT +3<br>DECRYPT BY MOVING EACH LETTER BACK THREE PLACES.</p>', label: 'DECRYPT THE COMMAND', expected: 'RESTORE', hint: 'U→R, H→E, V→S. Keep moving every letter back three places.', reward: 'RESTORE DIRECTIVE', icon: '↶', success: 'Directive decrypted: RESTORE. The core accepts manual recovery.' },
      { id: 'r3-power', object: 'note', title: 'Power routing', objective: 'Route power in the order shown by the maintenance note. Select the numbered switches in sequence, then submit.', clue: '<div class="evidence-card">MANUAL BYPASS / EMERGENCY BUS<br>Start at the low-load relay.<br>Follow the cable markings:<br><span class="redacted">AMBER → WHITE → BLUE → RED</span><br><br>Switch labels: 1=AMBER · 2=WHITE · 3=BLUE · 4=RED</div><div class="sequence-board" id="sequence-board"><button class="sequence-tile" type="button" data-sequence="1">1</button><button class="sequence-tile" type="button" data-sequence="2">2</button><button class="sequence-tile" type="button" data-sequence="3">3</button><button class="sequence-tile" type="button" data-sequence="4">4</button></div><p class="dialog-copy" id="sequence-readout">SELECT SWITCHES IN ORDER: _ _ _ _</p>', label: 'SWITCH SEQUENCE', expected: '1234', sequence: true, hint: 'Amber is 1, white is 2, blue is 3, red is 4. Tap them in that order.', reward: 'BYPASS CIRCUIT', icon: 'ϟ', success: 'Manual bypass engaged. Power is stable enough to reboot the core.' },
      { id: 'r3-core', object: 'panel', title: 'Restore the facility', objective: 'The recovery shell is ready. Enter the final command decrypted from the attacker’s message.', clue: '<div class="terminal-box">HELIX RECOVERY SHELL v4.1<br>POWER BUS: STABLE<br>DIRECTIVE: <b>RESTORE</b><br>PAYLOAD KEY: ACCEPTED<br><br>AWAITING FINAL COMMAND<span class="danger"> _</span></div>', label: 'FINAL RECOVERY COMMAND', expected: 'RESTORE', hint: 'The decrypted directive and the recovery shell are asking for the same command.', reward: 'CORE RESTORED', icon: '◉', success: 'Recovery command accepted. Facility systems are coming back online.' }
    ]
  ];

  const ROOMS = [
    { name: 'Access Control', zone: 'ZONE 01', location: 'ENTRANCE // LEVEL 01', state: 'LOCKDOWN ACTIVE', objects: { terminal: 'ACCESS TERMINAL', note: 'FIELD NOTE', panel: 'SECURITY PANEL', door: 'SEALED AIRLOCK', badge: 'ACCESS CARD' }, warning: 'RESTRICTED<br><b>ZONE</b>', window: 'SECURE AIRLOCK', display: 'HELIX // ACCESS NODE', screen: ['AUTH SERVICE: OFFLINE', 'ATTEMPT 03 / 05'], server: 'HX / 01', doorText: 'AIRLOCK 01' },
    { name: 'Network Investigation', zone: 'ZONE 02', location: 'NETWORK OPS // LEVEL 02', state: 'BREACH IN PROGRESS', objects: { terminal: 'AUTH LOGS', note: 'NETWORK MAP', panel: 'PACKET CAPTURE', door: 'UPLINK ROUTER', badge: 'CORE ACCESS' }, warning: 'NETWORK<br><b>OPS</b>', window: 'CORE ROUTE / DEGRADED', display: 'NETOPS // TRACE 04', screen: ['SOURCE: 185.220.101.7', 'PIVOT: VPN → AUTH'], server: 'NOC / 02', doorText: 'CORE UPLINK' },
    { name: 'System Recovery', zone: 'ZONE 03', location: 'RECOVERY CORE // LEVEL 03', state: 'MANUAL OVERRIDE', objects: { terminal: 'RECOVERY SHELL', note: 'MAINTENANCE NOTE', panel: 'CORE CONTROLS', door: 'REACTOR DOOR', badge: 'POWER BYPASS' }, warning: 'CORE<br><b>RECOVERY</b>', window: 'POWER BUS / UNSTABLE', display: 'HELIX // CORE STATUS', screen: ['RECOVERY: STANDBY', 'POWER BUS: FAILOVER'], server: 'CORE / 03', doorText: 'CORE CHAMBER' }
  ];

  const state = { started: false, paused: false, seconds: 20 * 60, room: 0, solved: new Set(), items: new Set(), badgeCollected: false, toastTimer: null, activeObject: null, audioContext: null, ambientGain: null, soundOn: false };
  const byId = (id) => document.getElementById(id);
  const intro = byId('intro-screen');
  const play = byId('play-screen');
  const dialogLayer = byId('dialog-layer');
  const toastNode = byId('toast');
  const scene = byId('room-scene');
  const timerNode = byId('timer');

  function currentPuzzles() { return ROOM_PUZZLES[state.room]; }
  function isRoomComplete(roomIndex) { return ROOM_PUZZLES[roomIndex].every((puzzle) => state.solved.has(puzzle.id)); }
  function puzzleForObject(object) { return currentPuzzles().find((puzzle) => puzzle.object === object); }
  function toast(message, error = false) {
    toastNode.textContent = message;
    toastNode.classList.toggle('error', error);
    toastNode.classList.add('show');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => toastNode.classList.remove('show'), 2600);
  }
  function addItem(item) {
    if (!state.items.has(item)) state.items.add(item);
    renderInventory();
  }
  function renderInventory() {
    const inventory = byId('inventory');
    inventory.replaceChildren();
    if (!state.items.size) {
      const empty = document.createElement('span');
      empty.className = 'inventory-empty';
      empty.textContent = 'NO EVIDENCE';
      inventory.append(empty);
      return;
    }
    for (const [index, item] of [...state.items].entries()) {
      const token = document.createElement('span');
      token.className = 'inventory-item';
      token.title = item;
      token.setAttribute('aria-label', item);
      token.textContent = ['⌁', '⌘', '▣', '◎', '⌖', '⌑', '↶', 'ϟ', '◉'][index] || '•';
      inventory.append(token);
    }
  }
  function renderProgress() {
    const allPuzzles = ROOM_PUZZLES.flat();
    const progress = byId('puzzle-progress');
    progress.replaceChildren(...allPuzzles.map((puzzle) => {
      const marker = document.createElement('i');
      if (state.solved.has(puzzle.id)) marker.classList.add('done');
      marker.title = puzzle.title;
      return marker;
    }));
    byId('progress-count').textContent = `${state.solved.size} / ${allPuzzles.length}`;
  }
  function renderNav() {
    const nav = byId('room-nav');
    nav.replaceChildren(...ROOMS.map((room, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = index === state.room ? 'active' : '';
      button.disabled = index > 0 && !isRoomComplete(index - 1);
      button.setAttribute('aria-current', index === state.room ? 'step' : 'false');
      button.innerHTML = `<span class="room-number">0${index + 1}</span><span class="room-name">${room.name}</span>${isRoomComplete(index) ? '<span class="room-check" aria-label="Complete">✓</span>' : ''}`;
      button.addEventListener('click', () => changeRoom(index));
      return button;
    }));
  }
  function renderScene() {
    const room = ROOMS[state.room];
    scene.className = `room-scene room-${['one', 'two', 'three'][state.room]}`;
    byId('room-index').textContent = room.zone;
    byId('room-title').textContent = room.name;
    byId('room-status').textContent = isRoomComplete(state.room) ? 'ZONE SECURED' : room.state;
    byId('room-status').parentElement.classList.toggle('complete', isRoomComplete(state.room));
    byId('scene-location').textContent = room.location;
    byId('scene-prompt').textContent = isRoomComplete(state.room) ? 'Zone secured. Inspect anything you missed or proceed through the open door.' : ['Scan the room. Every detail is part of the system.', 'Trace the attacker through the evidence.', 'Stabilize power, then restore the core.'][state.room];
    byId('door-caption').innerHTML = `${room.doorText} <i>${isRoomComplete(state.room) ? 'OPEN' : 'SEALED'}</i>`;
    byId('door-caption').querySelector('i').style.color = isRoomComplete(state.room) ? 'var(--green)' : '';
    scene.querySelector('.wall-warning').innerHTML = room.warning;
    scene.querySelector('.window-status').innerHTML = `<i></i>${room.window}`;
    scene.querySelector('.wall-display > span').textContent = room.display;
    const screenLines = scene.querySelector('.monitor-code');
    screenLines.innerHTML = `<i>${room.screen[0]}</i><i>${room.screen[1]}</i><b>_</b>`;
    scene.querySelector('.server-label').textContent = room.server;
    scene.querySelector('.server-light').style.background = isRoomComplete(state.room) ? 'var(--green)' : '';
    scene.querySelector('.server-light').style.boxShadow = isRoomComplete(state.room) ? '0 0 6px var(--green)' : '';
    const objects = Object.entries(room.objects);
    scene.querySelectorAll('.hotspot').forEach((hotspot, index) => {
      const [object, label] = objects[index];
      hotspot.dataset.object = object;
      hotspot.querySelector('.hotspot-label').textContent = label;
      hotspot.setAttribute('aria-label', `Inspect ${label.toLowerCase()}`);
      hotspot.hidden = false;
      const puzzle = puzzleForObject(object);
      hotspot.classList.toggle('solved-hotspot', Boolean(puzzle && state.solved.has(puzzle.id)));
    });
    byId('room-nav').querySelectorAll('button').forEach((button, index) => {
      button.classList.toggle('active', index === state.room);
      button.disabled = index > 0 && !isRoomComplete(index - 1);
    });
    renderProgress();
  }
  function renderTimer() {
    const minutes = Math.floor(state.seconds / 60).toString().padStart(2, '0');
    const seconds = (state.seconds % 60).toString().padStart(2, '0');
    timerNode.textContent = `${minutes}:${seconds}`;
    const ratio = Math.max(0, state.seconds / (20 * 60));
    byId('timer-progress').style.width = `${ratio * 100}%`;
    const urgent = state.seconds <= 120;
    timerNode.classList.toggle('urgent', urgent);
    byId('timer-progress').classList.toggle('urgent', urgent);
  }
  function dialogFrame(eyebrow, title, content, footer = '') {
    dialogLayer.innerHTML = `<section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="dialog-close" type="button" aria-label="Close">×</button><p class="dialog-eyebrow">${eyebrow}</p><h3 id="dialog-title">${title}</h3>${content}${footer}</section>`;
    dialogLayer.hidden = false;
    dialogLayer.querySelector('.dialog-close').addEventListener('click', closeDialog);
    dialogLayer.addEventListener('click', onLayerClick);
  }
  function onLayerClick(event) { if (event.target === dialogLayer) closeDialog(); }
  function closeDialog() { dialogLayer.hidden = true; dialogLayer.replaceChildren(); state.activeObject = null; }
  function showPuzzle(puzzle) {
    state.activeObject = puzzle.object;
    const done = state.solved.has(puzzle.id);
    const roomComplete = isRoomComplete(state.room);
    const content = done
      ? `<p class="dialog-copy">${puzzle.success}</p><div class="evidence-card">EVIDENCE ADDED · ${puzzle.reward}</div><div class="dialog-actions">${roomComplete ? '<button class="dialog-action" type="button" data-action="door">Proceed through open door <span>↗</span></button>' : ''}<button class="dialog-action secondary" type="button" data-action="close">Continue investigating</button></div>`
      : `<p class="dialog-copy">${puzzle.objective}</p>${puzzle.clue}<form class="puzzle-form" id="puzzle-form"><label for="puzzle-answer">${puzzle.label}</label><div class="puzzle-form-row"><input id="puzzle-answer" class="puzzle-input" type="text" autocomplete="off" spellcheck="false" placeholder="Enter solution" ${puzzle.sequence ? 'readonly' : ''} required><button class="submit-button" type="submit">Submit ↗</button></div><p id="dialog-feedback" class="dialog-feedback" aria-live="polite"></p></form><div class="dialog-footer"><span>FIELD PUZZLE · ${state.solved.size + 1}/9</span><button class="dialog-hint" type="button">Show clue ↗</button></div>`;
    dialogFrame(`HELIX // ${ROOMS[state.room].zone} · INTERACTIVE OBJECT`, puzzle.title, content);
    if (done) {
      dialogLayer.querySelector('[data-action="close"]')?.addEventListener('click', closeDialog);
      dialogLayer.querySelector('[data-action="door"]')?.addEventListener('click', enterNextRoom);
      return;
    }
    const form = byId('puzzle-form');
    const input = byId('puzzle-answer');
    const feedback = byId('dialog-feedback');
    let sequence = '';
    if (puzzle.sequence) {
      const tiles = [...dialogLayer.querySelectorAll('[data-sequence]')];
      tiles.forEach((button) => button.addEventListener('click', () => {
        if (sequence.length >= 4) sequence = '';
        sequence += button.dataset.sequence;
        tiles.forEach((tile) => tile.classList.toggle('selected', sequence.includes(tile.dataset.sequence)));
        input.value = sequence;
        byId('sequence-readout').textContent = `SELECTED: ${sequence.split('').join('  ') || '_ _ _ _'}`;
      }));
    } else {
      input.focus();
    }
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const answer = input.value.trim().toUpperCase().replace(/\s+/g, '');
      if (answer !== puzzle.expected.toUpperCase()) {
        state.seconds = Math.max(0, state.seconds - 15);
        renderTimer();
        feedback.textContent = 'Access denied. Recheck the evidence. 15 seconds deducted.';
        feedback.classList.remove('success');
        form.classList.remove('wrong-answer');
        void form.offsetWidth;
        form.classList.add('wrong-answer');
        if (state.seconds === 0) endGame(false);
        return;
      }
      state.solved.add(puzzle.id);
      addItem(puzzle.reward);
      feedback.textContent = puzzle.success;
      feedback.classList.add('success');
      renderScene();
      showPuzzle(puzzle);
      toast(`Evidence secured: ${puzzle.reward}`);
      if (state.solved.size === 9) setTimeout(() => endGame(true), 500);
    });
    dialogLayer.querySelector('.dialog-hint').addEventListener('click', () => toast(puzzle.hint));
  }
  function inspectObject(object) {
    const puzzle = puzzleForObject(object);
    if (puzzle) {
      if (state.room === 0 && object === 'panel' && !state.badgeCollected) {
        toast('The override reader needs a staff access card.', true);
        return;
      }
      showPuzzle(puzzle);
      return;
    }
    if (state.room === 0 && object === 'badge') {
      if (!state.solved.has('r1-terminal')) { toast('The badge reader is still dark. Restore the terminal first.', true); return; }
      if (!state.badgeCollected) {
        state.badgeCollected = true;
        addItem('STAFF ACCESS CARD');
        toast('Staff access card collected. Check the security panel.');
      } else toast('Staff access card is already in your evidence inventory.');
      return;
    }
    if (object === 'door' || object === 'exit') {
      if (isRoomComplete(state.room)) { enterNextRoom(); return; }
      toast('Door sealed. Complete this zone’s three challenges first.', true);
      return;
    }
    if (object === 'uplink') {
      toast('The uplink is isolated. Trace the packet and authenticate the attacker first.', true);
      return;
    }
    if (object === 'badge') toast('The core access tag is embedded in the recovered packet.');
    else if (object === 'note') toast('A maintenance note is pinned beneath the console.');
    else toast('This control is waiting for evidence from the other station.');
  }
  function changeRoom(index) {
    if (index < 0 || index > 2 || (index > 0 && !isRoomComplete(index - 1))) return;
    state.room = index;
    renderScene();
  }
  function enterNextRoom() {
    closeDialog();
    if (state.room < 2) {
      changeRoom(state.room + 1);
      toast(`Zone ${String(state.room + 1).padStart(2, '0')} unlocked.`);
    } else endGame(true);
  }
  function showHint() {
    const puzzle = currentPuzzles().find((item) => !state.solved.has(item.id));
    if (!puzzle) { toast(state.room < 2 ? 'All challenges cleared. Use the open door to proceed.' : 'All recovery steps complete.'); return; }
    toast(puzzle.hint);
  }
  function showPause() {
    if (!state.started || state.paused || !dialogLayer.hidden) return;
    state.paused = true;
    dialogFrame('FIELD AGENT 07 // SYSTEM PAUSED', 'Hold position.', '<p class="dialog-copy">Your timer is paused. The facility is still compromised.</p><div class="dialog-actions"><button class="dialog-action" type="button" data-action="resume">Resume mission <span>↗</span></button><button class="dialog-action secondary" type="button" data-action="restart">Restart operation</button></div>');
    dialogLayer.querySelector('[data-action="resume"]').addEventListener('click', () => { state.paused = false; closeDialog(); });
    dialogLayer.querySelector('[data-action="restart"]').addEventListener('click', restartGame);
  }
  function endGame(won) {
    if (state.paused && won === false) state.paused = false;
    state.paused = true;
    const title = won ? 'Signal restored.' : 'Facility lost.';
    const text = won ? 'The recovery core is online. Security is back under Helix control, the compromised uplink is isolated, and your extraction route is clear.' : 'The facility has entered a hard lockdown. Your field operation has ended, but the evidence trail is preserved for another attempt.';
    dialogFrame(won ? 'MISSION COMPLETE // EXTRACTION CLEAR' : 'MISSION FAILED // TIME EXPIRED', title, `<p class="dialog-copy">${text}</p><div class="evidence-card">TIME ${byId('timer').textContent} <span class="redacted">·</span> CHALLENGES ${state.solved.size}/9 <span class="redacted">·</span> EVIDENCE ${state.items.size}</div><button class="dialog-action" type="button" data-action="restart">${won ? 'Run the operation again' : 'Retry the mission'} <span>↻</span></button>`);
    dialogLayer.querySelector('[data-action="restart"]').addEventListener('click', restartGame);
  }
  function restartGame() {
    state.started = false;
    state.paused = false;
    state.seconds = 20 * 60;
    state.room = 0;
    state.solved.clear();
    state.items.clear();
    state.badgeCollected = false;
    closeDialog();
    renderTimer();
    renderInventory();
    renderScene();
    play.hidden = true;
    intro.hidden = false;
  }
  function startGame() {
    state.started = true;
    state.paused = false;
    intro.hidden = true;
    play.hidden = false;
    renderInventory();
    renderTimer();
    renderNav();
    renderScene();
  }

  function toggleSound() {
    if (!state.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) { toast('Ambient audio is not supported in this browser.', true); return; }
      state.audioContext = new AudioContext();
      const oscillator = state.audioContext.createOscillator();
      const filter = state.audioContext.createBiquadFilter();
      state.ambientGain = state.audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 48;
      filter.type = 'lowpass';
      filter.frequency.value = 90;
      state.ambientGain.gain.value = 0;
      oscillator.connect(filter).connect(state.ambientGain).connect(state.audioContext.destination);
      oscillator.start();
    }
    state.audioContext.resume();
    state.soundOn = !state.soundOn;
    state.ambientGain.gain.setTargetAtTime(state.soundOn ? 0.012 : 0, state.audioContext.currentTime, 0.12);
    byId('sound-toggle').setAttribute('aria-label', state.soundOn ? 'Turn ambient sound off' : 'Turn ambient sound on');
    byId('sound-toggle').title = state.soundOn ? 'Turn ambient sound off' : 'Turn ambient sound on';
    toast(state.soundOn ? 'Ambient facility hum enabled.' : 'Ambient facility hum disabled.');
  }

  byId('start-button').addEventListener('click', startGame);
  byId('pause-button').addEventListener('click', showPause);
  byId('hint-button').addEventListener('click', showHint);
  scene.addEventListener('click', (event) => {
    const hotspot = event.target.closest('.hotspot');
    if (hotspot && !hotspot.hidden) inspectObject(hotspot.dataset.object);
  });
  byId('sound-toggle').addEventListener('click', toggleSound);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !dialogLayer.hidden) {
      if (state.activeObject) closeDialog();
      else if (state.paused) { state.paused = false; closeDialog(); }
    }
    if (event.key.toLowerCase() === 'h' && dialogLayer.hidden && state.started && !state.paused) showHint();
  });
  setInterval(() => {
    if (!state.started || state.paused || state.seconds <= 0) return;
    if (!dialogLayer.hidden && !state.activeObject) return;
    state.seconds -= 1;
    renderTimer();
    if (state.seconds <= 0) endGame(false);
  }, 1000);
  renderTimer();
  renderInventory();
})();
