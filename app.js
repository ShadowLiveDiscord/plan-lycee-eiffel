// ============================================================
// APP.JS — Moteur principal Plan Interactif Lycée Gustave Eiffel
// ============================================================

// ── État global ──────────────────────────────────────────────
const STATE = {
  floor: 'rdc',       // 'rdc' | 'etage1' | 'both'
  view: '2d',         // '2d' | '3d'
  zoom: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  dragStart: { x: 0, y: 0 },
  panStart: { x: 0, y: 0 },
  highlight: null,    // id salle surlignée
  route: null,        // résultat findPath
  routeFrom: null,
  routeTo: null,
  adminMode: false,
  adminSelected: null,
  view3dMode: 'interior', // 'exterior' | 'interior'
  view3dAngle: 0.55,
  view3dRotY: 0.4,
};

// ── Chargement données depuis localStorage ────────────────────
function loadData() {
  const saved = localStorage.getItem('lycee_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.rdc) BUILDING_DATA.floors.rdc.rooms = parsed.rdc;
      if (parsed.etage1) BUILDING_DATA.floors.etage1.rooms = parsed.etage1;
    } catch(e) {}
  }
}
function saveData() {
  localStorage.setItem('lycee_data', JSON.stringify({
    rdc: BUILDING_DATA.floors.rdc.rooms,
    etage1: BUILDING_DATA.floors.etage1.rooms,
  }));
}
loadData();

// ── Canvas 2D ────────────────────────────────────────────────
const canvas2d = document.getElementById('canvas2d');
const ctx2d = canvas2d.getContext('2d');

function resizeCanvas() {
  const zone = document.querySelector('.canvas-zone');
  canvas2d.width = zone.clientWidth;
  canvas2d.height = zone.clientHeight;
  canvas3d.width = zone.clientWidth;
  canvas3d.height = zone.clientHeight;
  draw2d();
  draw3d();
}

// ── Dessin 2D ────────────────────────────────────────────────
function draw2d() {
  const c = ctx2d;
  const W = canvas2d.width, H = canvas2d.height;
  c.clearRect(0, 0, W, H);

  // Fond grille
  c.fillStyle = '#131620';
  c.fillRect(0, 0, W, H);
  drawGrid(c, W, H);

  const floors = STATE.floor === 'both'
    ? ['rdc', 'etage1']
    : [STATE.floor];

  let offsetY = 0;
  for (const fid of floors) {
    const floor = BUILDING_DATA.floors[fid];
    c.save();
    c.translate(STATE.panX, STATE.panY + offsetY * STATE.zoom);
    c.scale(STATE.zoom, STATE.zoom);
    drawFloor2d(c, floor, fid);
    c.restore();
    if (STATE.floor === 'both') offsetY += floor.height + 40;
  }

  // Dessiner route
  if (STATE.route) drawRoute2d(c);

  // Label étage si both
  if (STATE.floor === 'both') {
    let oy = 0;
    for (const fid of ['rdc', 'etage1']) {
      const lbl = BUILDING_DATA.floors[fid].label;
      c.save();
      c.font = 'bold 13px Syne, sans-serif';
      c.fillStyle = 'rgba(96,165,250,0.8)';
      c.fillText('— ' + lbl + ' —', STATE.panX + 10, STATE.panY + oy * STATE.zoom + 18);
      c.restore();
      oy += BUILDING_DATA.floors[fid].height + 40;
    }
  }
}

function drawGrid(c, W, H) {
  const step = 40 * STATE.zoom;
  const ox = ((STATE.panX % step) + step) % step;
  const oy = ((STATE.panY % step) + step) % step;
  c.strokeStyle = 'rgba(255,255,255,0.03)';
  c.lineWidth = 1;
  for (let x = ox; x < W; x += step) {
    c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke();
  }
  for (let y = oy; y < H; y += step) {
    c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
  }
}

function drawFloor2d(c, floor, fid) {
  // Couloirs
  c.fillStyle = '#d4d4d4';
  for (const cor of floor.corridors) {
    c.beginPath();
    c.roundRect(cor.x, cor.y, cor.w, cor.h, 3);
    c.fill();
  }

  // Murs extérieurs (contour)
  c.strokeStyle = '#1a1a1a';
  c.lineWidth = 4 / STATE.zoom;
  c.beginPath();
  c.roundRect(
    Math.min(...floor.rooms.map(r=>r.x)) - 12,
    Math.min(...floor.rooms.map(r=>r.y)) - 12,
    Math.max(...floor.rooms.map(r=>r.x+r.w)) - Math.min(...floor.rooms.map(r=>r.x)) + 24,
    Math.max(...floor.rooms.map(r=>r.y+r.h)) - Math.min(...floor.rooms.map(r=>r.y)) + 24,
    10
  );
  c.stroke();

  // Salles
  for (const room of floor.rooms) {
    const isHighlight = STATE.highlight === room.id;
    const isSelected  = STATE.adminSelected === room.id;
    const isRoute     = isRoomOnRoute(room.id, fid);

    c.save();

    // Ombre
    if (isHighlight || isSelected) {
      c.shadowColor = isSelected ? '#F59E0B' : '#3B82F6';
      c.shadowBlur = 18;
    }

    // Remplissage
    if (room.type === 'stair') {
      c.fillStyle = '#BCAAA4';
    } else if (room.type === 'entrance') {
      c.fillStyle = '#A5D6A7';
    } else {
      c.fillStyle = isHighlight ? '#FFF176' : (room.color || '#B8D4E8');
    }

    c.beginPath();
    c.roundRect(room.x, room.y, room.w, room.h, 5);
    c.fill();

    // Bordure
    if (isSelected) {
      c.strokeStyle = '#F59E0B';
      c.lineWidth = 2.5 / STATE.zoom;
    } else if (isHighlight) {
      c.strokeStyle = '#3B82F6';
      c.lineWidth = 2 / STATE.zoom;
    } else if (isRoute) {
      c.strokeStyle = '#3B82F6';
      c.lineWidth = 2 / STATE.zoom;
    } else {
      c.strokeStyle = 'rgba(0,0,0,0.25)';
      c.lineWidth = 1 / STATE.zoom;
    }
    c.beginPath();
    c.roundRect(room.x, room.y, room.w, room.h, 5);
    c.stroke();

    // Texte
    const fontSize = Math.max(9, Math.min(14, room.w / 3.5, room.h / 2));
    c.font = `bold ${fontSize}px Syne, sans-serif`;
    c.fillStyle = '#1a1a1a';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.shadowColor = 'transparent';
    c.shadowBlur = 0;
    const lines = room.label.split('\n');
    lines.forEach((line, i) => {
      c.fillText(line, room.x + room.w / 2, room.y + room.h / 2 + (i - (lines.length-1)/2) * (fontSize + 2));
    });

    c.restore();
  }
}

function isRoomOnRoute(roomId, floorId) {
  if (!STATE.route) return false;
  return (STATE.routeFrom?.id === roomId && STATE.routeFrom?.floor === floorId) ||
         (STATE.routeTo?.id   === roomId && STATE.routeTo?.floor   === floorId);
}

function drawRoute2d(c) {
  if (!STATE.route) return;
  let offsetY = 0;
  const floorOrder = ['rdc', 'etage1'];

  for (const segment of STATE.route) {
    const fid = segment.floor;
    const floor = BUILDING_DATA.floors[fid];
    const flIdx = STATE.floor === 'both' ? floorOrder.indexOf(fid) : 0;
    if (STATE.floor !== 'both' && fid !== STATE.floor) continue;

    const nodeMap = {};
    floor.navNodes.forEach(n => nodeMap[n.id] = n);

    c.save();
    c.translate(STATE.panX, STATE.panY + flIdx * (floor.height + 40) * STATE.zoom);
    c.scale(STATE.zoom, STATE.zoom);

    c.strokeStyle = '#3B82F6';
    c.lineWidth = 4 / STATE.zoom;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.shadowColor = '#3B82F6';
    c.shadowBlur = 10;

    const nodes = segment.nodes.map(id => nodeMap[id]).filter(Boolean);
    if (nodes.length < 2) { c.restore(); continue; }

    c.beginPath();
    c.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
      c.lineTo(nodes[i].x, nodes[i].y);
    }
    c.stroke();

    // Points sur le chemin
    nodes.forEach((n, i) => {
      c.beginPath();
      c.arc(n.x, n.y, 5 / STATE.zoom, 0, Math.PI * 2);
      c.fillStyle = i === 0 ? '#10B981' : (i === nodes.length - 1 ? '#EF4444' : '#60A5FA');
      c.shadowColor = c.fillStyle;
      c.shadowBlur = 8;
      c.fill();
    });

    c.restore();
  }
}

// ── Canvas 3D (isométrique) ───────────────────────────────────
const canvas3d = document.getElementById('canvas3d');
const ctx3d = canvas3d.getContext('2d');

function draw3d() {
  const c = ctx3d;
  const W = canvas3d.width, H = canvas3d.height;
  c.clearRect(0, 0, W, H);
  c.fillStyle = '#131620';
  c.fillRect(0, 0, W, H);

  if (STATE.view3dMode === 'exterior') {
    draw3dExterior(c, W, H);
  } else {
    draw3dInterior(c, W, H);
  }
}

function isoProject(x, y, z, W, H) {
  const angle = STATE.view3dAngle;
  const rotY  = STATE.view3dRotY;
  const rx = x * Math.cos(rotY) - y * Math.sin(rotY);
  const ry = x * Math.sin(rotY) + y * Math.cos(rotY);
  const sx = W / 2 + STATE.panX + rx * 0.7;
  const sy = H / 2 + STATE.panY + ry * angle - z * 0.55;
  return { sx, sy };
}

function draw3dBox(c, x, y, w, h, z, dz, fillTop, fillFront, fillSide) {
  // Top face
  const tl = isoProject(x,   y,   z + dz, c.canvas.width, c.canvas.height);
  const tr = isoProject(x+w, y,   z + dz, c.canvas.width, c.canvas.height);
  const br = isoProject(x+w, y+h, z + dz, c.canvas.width, c.canvas.height);
  const bl = isoProject(x,   y+h, z + dz, c.canvas.width, c.canvas.height);
  c.beginPath();
  c.moveTo(tl.sx,tl.sy); c.lineTo(tr.sx,tr.sy);
  c.lineTo(br.sx,br.sy); c.lineTo(bl.sx,bl.sy);
  c.closePath();
  c.fillStyle = fillTop; c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 0.8; c.stroke();

  // Front face
  const bl2 = isoProject(x,   y+h, z,    c.canvas.width, c.canvas.height);
  const br2 = isoProject(x+w, y+h, z,    c.canvas.width, c.canvas.height);
  c.beginPath();
  c.moveTo(bl.sx,bl.sy); c.lineTo(br.sx,br.sy);
  c.lineTo(br2.sx,br2.sy); c.lineTo(bl2.sx,bl2.sy);
  c.closePath();
  c.fillStyle = fillFront; c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.3)'; c.stroke();

  // Side face
  const tr2 = isoProject(x+w, y,   z,    c.canvas.width, c.canvas.height);
  c.beginPath();
  c.moveTo(tr.sx,tr.sy); c.lineTo(br.sx,br.sy);
  c.lineTo(br2.sx,br2.sy); c.lineTo(tr2.sx,tr2.sy);
  c.closePath();
  c.fillStyle = fillSide; c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.3)'; c.stroke();
}

function draw3dInterior(c, W, H) {
  const floors = STATE.floor === 'both'
    ? [{ fid: 'rdc', z: 0 }, { fid: 'etage1', z: 120 }]
    : [{ fid: STATE.floor, z: 0 }];

  for (const { fid, z } of floors) {
    const floor = BUILDING_DATA.floors[fid];

    // Couloirs (dalles)
    for (const cor of floor.corridors) {
      draw3dBox(c,
        cor.x - 450, cor.y - 310,
        cor.w, cor.h,
        z, 4,
        '#c8c8c8', '#aaaaaa', '#b0b0b0'
      );
    }

    // Salles
    for (const room of floor.rooms) {
      const isHL = STATE.highlight === room.id;
      const dz = room.type === 'stair' ? 30 : 28;
      let top, front, side;
      if (room.type === 'stair') {
        top='#A1887F'; front='#8D6E63'; side='#795548';
      } else if (room.type === 'entrance') {
        top='#81C784'; front='#66BB6A'; side='#4CAF50';
      } else {
        const col = room.color || '#B8D4E8';
        top   = isHL ? '#FFF176' : lighten(col, 10);
        front = darken(col, 20);
        side  = darken(col, 35);
      }
      draw3dBox(c,
        room.x - 450, room.y - 310,
        room.w, room.h,
        z, dz,
        top, front, side
      );

      // Numéro sur le dessus
      const tp = isoProject(room.x - 450 + room.w/2, room.y - 310 + room.h/2, z + dz, W, H);
      c.save();
      c.font = `bold ${Math.max(7, 10/STATE.zoom)}px Syne, sans-serif`;
      c.fillStyle = '#1a1a1a';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(room.label.replace('\n',' '), tp.sx, tp.sy);
      c.restore();
    }

    // Plancher
    draw3dBox(c, -450, -310, floor.width, floor.height, z-2, 2, '#1e2030','#191c2a','#191c2a');
  }
}

function draw3dExterior(c, W, H) {
  // Bâtiment extérieur simplifié
  const bW = 700, bH = 500, bZ = 0, bDZ = 160;
  draw3dBox(c, -350, -250, bW, bH, bZ, bDZ, '#e0e0e0', '#cfcfcf', '#bdbdbd');

  // Fenêtres
  const wins = [
    [50,0,50,30],[130,0,50,30],[210,0,50,30],[290,0,50,30],
    [50,60,50,30],[130,60,50,30],[210,60,50,30],
  ];
  for (const [wx,wy,ww,wh] of wins) {
    draw3dBox(c, -350+wx, -250+bH, ww, 8, bZ + 80 + wy, wh, '#7EC8E3','#5BA3BE','#4A8FAD');
  }

  // Porte principale
  draw3dBox(c, -350+320, -250+bH, 60, 8, bZ, 50, '#A5D6A7','#81C784','#66BB6A');

  // Toit
  c.save();
  const r1 = isoProject(-350,   -250,    bZ+bDZ, W, H);
  const r2 = isoProject(-350+bW,-250,    bZ+bDZ, W, H);
  const r3 = isoProject(-350+bW,-250+bH, bZ+bDZ, W, H);
  const r4 = isoProject(-350,   -250+bH, bZ+bDZ, W, H);
  const rp = isoProject(-350+bW/2, -250+bH/2, bZ+bDZ+50, W, H);
  c.beginPath();
  c.moveTo(r1.sx,r1.sy); c.lineTo(rp.sx,rp.sy); c.lineTo(r2.sx,r2.sy);
  c.fillStyle='#B0BEC5'; c.fill();
  c.strokeStyle='rgba(0,0,0,0.2)'; c.stroke();
  c.beginPath();
  c.moveTo(r3.sx,r3.sy); c.lineTo(rp.sx,rp.sy); c.lineTo(r4.sx,r4.sy);
  c.fillStyle='#90A4AE'; c.fill(); c.stroke();
  c.restore();

  // Label
  c.save();
  c.font = 'bold 14px Syne, sans-serif';
  c.fillStyle = '#60A5FA';
  c.textAlign = 'center';
  c.fillText('Lycée Gustave Eiffel — Ermont', W/2, H - 30);
  c.restore();
}

// Utilitaires couleur
function lighten(hex, pct) {
  return adjustColor(hex, pct);
}
function darken(hex, pct) {
  return adjustColor(hex, -pct);
}
function adjustColor(hex, pct) {
  const n = parseInt(hex.replace('#',''), 16);
  const r = Math.min(255, Math.max(0, (n>>16) + pct));
  const g = Math.min(255, Math.max(0, ((n>>8)&0xff) + pct));
  const b = Math.min(255, Math.max(0, (n&0xff) + pct));
  return `rgb(${r},${g},${b})`;
}

// ── Interactions ──────────────────────────────────────────────
function getFloorsToShow() {
  if (STATE.floor === 'both') return ['rdc', 'etage1'];
  return [STATE.floor];
}

function screenToWorld2d(sx, sy) {
  return {
    x: (sx - STATE.panX) / STATE.zoom,
    y: (sy - STATE.panY) / STATE.zoom,
  };
}

function getRoomAtScreen(sx, sy) {
  const floors = getFloorsToShow();
  let offsetY = 0;
  for (const fid of floors) {
    const floor = BUILDING_DATA.floors[fid];
    const wx = (sx - STATE.panX) / STATE.zoom;
    const wy = (sy - STATE.panY - offsetY * STATE.zoom) / STATE.zoom;
    for (const room of floor.rooms) {
      if (wx >= room.x && wx <= room.x + room.w &&
          wy >= room.y && wy <= room.y + room.h) {
        return { room, floor: fid };
      }
    }
    if (STATE.floor === 'both') offsetY += floor.height + 40;
  }
  return null;
}

// Mouse events 2D
canvas2d.addEventListener('mousedown', e => {
  STATE.isDragging = true;
  STATE.dragStart = { x: e.clientX, y: e.clientY };
  STATE.panStart = { x: STATE.panX, y: STATE.panY };
});
canvas2d.addEventListener('mousemove', e => {
  if (STATE.isDragging) {
    STATE.panX = STATE.panStart.x + e.clientX - STATE.dragStart.x;
    STATE.panY = STATE.panStart.y + e.clientY - STATE.dragStart.y;
    draw2d();
  } else {
    // Tooltip
    const hit = getRoomAtScreen(e.clientX - canvas2d.getBoundingClientRect().left,
                                 e.clientY - canvas2d.getBoundingClientRect().top);
    const tip = document.getElementById('tooltip');
    if (hit) {
      tip.style.display = 'block';
      tip.style.left = (e.clientX + 12) + 'px';
      tip.style.top  = (e.clientY + 12) + 'px';
      const typeLabels = { classroom:'Salle de cours', special:'Salle spéciale', entrance:'Entrée', stair:'Escalier' };
      tip.textContent = `Salle ${hit.room.label} — ${typeLabels[hit.room.type] || hit.room.type} (${BUILDING_DATA.floors[hit.floor].label})`;
    } else {
      tip.style.display = 'none';
    }
  }
});
canvas2d.addEventListener('mouseup', e => {
  const moved = Math.abs(e.clientX - STATE.dragStart.x) + Math.abs(e.clientY - STATE.dragStart.y);
  STATE.isDragging = false;
  if (moved < 4) {
    // Click
    const rect = canvas2d.getBoundingClientRect();
    const hit = getRoomAtScreen(e.clientX - rect.left, e.clientY - rect.top);
    if (hit) {
      if (STATE.adminMode) {
        openAdminEditor(hit.room, hit.floor);
      } else {
        STATE.highlight = hit.room.id;
        draw2d();
      }
    } else {
      STATE.highlight = null;
      draw2d();
    }
  }
});
canvas2d.addEventListener('mouseleave', () => {
  STATE.isDragging = false;
  document.getElementById('tooltip').style.display = 'none';
});

// Scroll zoom 2D
canvas2d.addEventListener('wheel', e => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.12 : 0.9;
  const rect = canvas2d.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  STATE.panX = mx - (mx - STATE.panX) * factor;
  STATE.panY = my - (my - STATE.panY) * factor;
  STATE.zoom = Math.min(4, Math.max(0.2, STATE.zoom * factor));
  draw2d();
}, { passive: false });

// Mouse events 3D (rotation)
let drag3d = false, drag3dStart = { x: 0, y: 0 }, angle3dStart = { a: 0, b: 0 };
canvas3d.addEventListener('mousedown', e => {
  drag3d = true;
  drag3dStart = { x: e.clientX, y: e.clientY };
  angle3dStart = { a: STATE.view3dAngle, b: STATE.view3dRotY };
});
canvas3d.addEventListener('mousemove', e => {
  if (!drag3d) return;
  const dx = (e.clientX - drag3dStart.x) / 200;
  const dy = (e.clientY - drag3dStart.y) / 200;
  STATE.view3dAngle = Math.max(0.2, Math.min(1, angle3dStart.a + dy));
  STATE.view3dRotY  = angle3dStart.b + dx;
  draw3d();
});
canvas3d.addEventListener('mouseup', () => drag3d = false);
canvas3d.addEventListener('mouseleave', () => drag3d = false);
canvas3d.addEventListener('wheel', e => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.1 : 0.9;
  STATE.panX = (STATE.panX) * factor;
  STATE.panY = (STATE.panY) * factor;
  draw3d();
}, { passive: false });

// ── Boutons header ────────────────────────────────────────────
document.querySelectorAll('.tab[data-floor]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab[data-floor]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    STATE.floor = btn.dataset.floor;
    draw2d(); draw3d();
  });
});
document.querySelectorAll('.tab[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab[data-view]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    STATE.view = btn.dataset.view;
    document.getElementById('view2d').classList.toggle('active', STATE.view === '2d');
    document.getElementById('view3d').classList.toggle('active', STATE.view === '3d');
    if (STATE.view === '3d') draw3d();
  });
});

document.getElementById('zoomIn').addEventListener('click', () => {
  STATE.zoom = Math.min(4, STATE.zoom * 1.25);
  draw2d();
});
document.getElementById('zoomOut').addEventListener('click', () => {
  STATE.zoom = Math.max(0.2, STATE.zoom / 1.25);
  draw2d();
});
document.getElementById('zoomReset').addEventListener('click', () => {
  STATE.zoom = 1; STATE.panX = 0; STATE.panY = 0;
  draw2d(); draw3d();
});

// Boutons 3D vue
document.getElementById('v3ext').addEventListener('click', function() {
  STATE.view3dMode = 'exterior';
  this.classList.add('active');
  document.getElementById('v3int').classList.remove('active');
  draw3d();
});
document.getElementById('v3int').addEventListener('click', function() {
  STATE.view3dMode = 'interior';
  this.classList.add('active');
  document.getElementById('v3ext').classList.remove('active');
  draw3d();
});

// ── Recherche ─────────────────────────────────────────────────
const searchInput = document.getElementById('searchInput');
const suggestionsEl = document.getElementById('suggestions');

function getAllRooms() {
  const rooms = [];
  for (const [fid, floor] of Object.entries(BUILDING_DATA.floors)) {
    for (const room of floor.rooms) {
      rooms.push({ ...room, floor: fid, floorLabel: floor.label });
    }
  }
  return rooms;
}

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  suggestionsEl.innerHTML = '';
  if (!q) return;
  const matches = getAllRooms().filter(r =>
    r.label.toLowerCase().includes(q) ||
    r.id.toLowerCase().includes(q) ||
    r.type.toLowerCase().includes(q)
  ).slice(0, 8);
  for (const r of matches) {
    const div = document.createElement('div');
    div.className = 'suggestion-item';
    div.textContent = `Salle ${r.label} — ${r.floorLabel}`;
    div.addEventListener('click', () => {
      STATE.highlight = r.id;
      STATE.floor = r.floor;
      // Centrer sur la salle
      const zone = document.querySelector('.canvas-zone');
      STATE.panX = zone.clientWidth  / 2 - (r.x + r.w / 2) * STATE.zoom;
      STATE.panY = zone.clientHeight / 2 - (r.y + r.h / 2) * STATE.zoom;
      document.querySelectorAll('.tab[data-floor]').forEach(b => {
        b.classList.toggle('active', b.dataset.floor === r.floor);
      });
      draw2d();
      suggestionsEl.innerHTML = '';
      searchInput.value = `Salle ${r.label}`;
    });
    suggestionsEl.appendChild(div);
  }
});

// ── Itinéraire ────────────────────────────────────────────────
const routeFrom = document.getElementById('routeFrom');
const routeTo   = document.getElementById('routeTo');

function populateRouteSelects() {
  const rooms = getAllRooms();
  [routeFrom, routeTo].forEach(sel => {
    const cur = sel.value;
    sel.innerHTML = '<option value="">— Choisir —</option>';
    rooms.forEach(r => {
      const opt = document.createElement('option');
      opt.value = JSON.stringify({ id: r.id, floor: r.floor });
      opt.textContent = `Salle ${r.label} (${r.floorLabel})`;
      sel.appendChild(opt);
    });
    sel.value = cur;
  });
}
populateRouteSelects();

document.getElementById('calcRoute').addEventListener('click', () => {
  if (!routeFrom.value || !routeTo.value) return;
  const from = JSON.parse(routeFrom.value);
  const to   = JSON.parse(routeTo.value);
  STATE.routeFrom = from;
  STATE.routeTo   = to;
  STATE.route = findPath(from.id, from.floor, to.id, to.floor);

  const info = document.getElementById('routeInfo');
  if (!STATE.route || !STATE.route.length) {
    info.innerHTML = '<span style="color:#EF4444">Aucun chemin trouvé.</span>';
    return;
  }

  // Calcul distance
  let totalDist = 0;
  for (const seg of STATE.route) {
    const floor = BUILDING_DATA.floors[seg.floor];
    const nodeMap = {};
    floor.navNodes.forEach(n => nodeMap[n.id] = n);
    const nodes = seg.nodes.map(id => nodeMap[id]).filter(Boolean);
    for (let i = 1; i < nodes.length; i++) {
      totalDist += Math.hypot(nodes[i].x - nodes[i-1].x, nodes[i].y - nodes[i-1].y);
    }
  }
  const distM  = Math.round(totalDist * 0.08);
  const steps  = Math.round(distM * 1.35);
  const timeS  = Math.round(distM / 1.2);

  info.innerHTML = `
    <div>📍 <b>${distM} m</b></div>
    <div>👣 <b>~${steps} pas</b></div>
    <div>⏱ <b>${timeS < 60 ? timeS + ' sec' : Math.ceil(timeS/60) + ' min'}</b></div>
    ${STATE.route.length > 1 ? '<div>🪜 Changement d\'étage requis</div>' : ''}
  `;

  // Afficher le bon étage
  if (STATE.route.length === 1) {
    STATE.floor = STATE.route[0].floor;
    document.querySelectorAll('.tab[data-floor]').forEach(b => {
      b.classList.toggle('active', b.dataset.floor === STATE.floor);
    });
  } else {
    STATE.floor = 'both';
    document.querySelectorAll('.tab[data-floor]').forEach(b => {
      b.classList.toggle('active', b.dataset.floor === 'both');
    });
  }
  draw2d();
});

document.getElementById('clearRoute').addEventListener('click', () => {
  STATE.route = null;
  STATE.routeFrom = null;
  STATE.routeTo = null;
  document.getElementById('routeInfo').innerHTML = '';
  routeFrom.value = '';
  routeTo.value = '';
  draw2d();
});

// ── Admin ─────────────────────────────────────────────────────
document.getElementById('logoBtn').addEventListener('click', () => {
  if (STATE.adminMode) {
    document.getElementById('adminPanel').classList.add('active');
  } else {
    document.getElementById('adminModal').classList.add('active');
    document.getElementById('adminLogin').value = '';
    document.getElementById('adminPass').value  = '';
    document.getElementById('adminError').textContent = '';
  }
});
document.getElementById('adminCancel').addEventListener('click', () => {
  document.getElementById('adminModal').classList.remove('active');
});
document.getElementById('adminSubmit').addEventListener('click', () => {
  const login = document.getElementById('adminLogin').value.trim();
  const pass  = document.getElementById('adminPass').value.trim();
  if (login === 'admin' && pass === '95120') {
    STATE.adminMode = true;
    document.getElementById('adminModal').classList.remove('active');
    document.getElementById('adminPanel').classList.add('active');
    document.getElementById('logoBtn').style.boxShadow = '0 0 0 3px #F59E0B';
    document.getElementById('logoBtn').title = 'Admin actif — cliquer pour panneau';
  } else {
    document.getElementById('adminError').textContent = 'Identifiants incorrects.';
  }
});
document.getElementById('adminClose').addEventListener('click', () => {
  document.getElementById('adminPanel').classList.remove('active');
});

function openAdminEditor(room, floorId) {
  STATE.adminSelected = room.id;
  document.getElementById('adminRoomEditor').style.display = 'block';
  document.getElementById('adminRoomTitle').textContent = `Salle ${room.label}`;
  document.getElementById('adminLabel').value = room.label;
  document.getElementById('adminX').value = room.x;
  document.getElementById('adminY').value = room.y;
  document.getElementById('adminW').value = room.w;
  document.getElementById('adminH').value = room.h;
  document.getElementById('adminColor').value = room.color || '#B8D4E8';
  document.getElementById('adminFloor').value = floorId;
  document.getElementById('adminPanel').classList.add('active');
  draw2d();
}

document.getElementById('adminSave').addEventListener('click', () => {
  const selId  = STATE.adminSelected;
  if (!selId) return;
  const targetFloor = document.getElementById('adminFloor').value;
  // Retirer de l'ancien étage si changé
  for (const fid of ['rdc','etage1']) {
    const idx = BUILDING_DATA.floors[fid].rooms.findIndex(r => r.id === selId);
    if (idx !== -1) {
      const room = BUILDING_DATA.floors[fid].rooms[idx];
      room.label = document.getElementById('adminLabel').value;
      room.x     = parseInt(document.getElementById('adminX').value);
      room.y     = parseInt(document.getElementById('adminY').value);
      room.w     = parseInt(document.getElementById('adminW').value);
      room.h     = parseInt(document.getElementById('adminH').value);
      room.color = document.getElementById('adminColor').value;
      if (fid !== targetFloor) {
        BUILDING_DATA.floors[fid].rooms.splice(idx, 1);
        BUILDING_DATA.floors[targetFloor].rooms.push(room);
      }
      break;
    }
  }
  saveData();
  populateRouteSelects();
  draw2d();
  document.getElementById('adminPanel').classList.remove('active');
  STATE.adminSelected = null;
});

document.getElementById('adminDelete').addEventListener('click', () => {
  const selId = STATE.adminSelected;
  if (!selId) return;
  for (const fid of ['rdc','etage1']) {
    const idx = BUILDING_DATA.floors[fid].rooms.findIndex(r => r.id === selId);
    if (idx !== -1) { BUILDING_DATA.floors[fid].rooms.splice(idx, 1); break; }
  }
  STATE.adminSelected = null;
  saveData();
  populateRouteSelects();
  draw2d();
  document.getElementById('adminPanel').classList.remove('active');
});

document.getElementById('adminAddRoom').addEventListener('click', () => {
  const fid = STATE.floor === 'both' ? 'rdc' : STATE.floor;
  const newRoom = {
    id: 'r_' + Date.now(),
    label: 'Nouveau',
    x: 300, y: 300, w: 70, h: 60,
    type: 'classroom',
    color: '#B8D4E8'
  };
  BUILDING_DATA.floors[fid].rooms.push(newRoom);
  saveData();
  populateRouteSelects();
  openAdminEditor(newRoom, fid);
  draw2d();
});

// Fermer modals en cliquant outside
document.getElementById('adminModal').addEventListener('click', e => {
  if (e.target === document.getElementById('adminModal'))
    document.getElementById('adminModal').classList.remove('active');
});
document.getElementById('adminPanel').addEventListener('click', e => {
  if (e.target === document.getElementById('adminPanel'))
    document.getElementById('adminPanel').classList.remove('active');
});

// ── Init ──────────────────────────────────────────────────────
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Centrer la vue au démarrage
function centerView() {
  const zone = document.querySelector('.canvas-zone');
  const floor = BUILDING_DATA.floors[STATE.floor === 'both' ? 'rdc' : STATE.floor];
  STATE.zoom = Math.min(
    (zone.clientWidth  * 0.85) / floor.width,
    (zone.clientHeight * 0.85) / floor.height
  );
  STATE.panX = (zone.clientWidth  - floor.width  * STATE.zoom) / 2;
  STATE.panY = (zone.clientHeight - floor.height * STATE.zoom) / 2;
  draw2d();
}
centerView();
