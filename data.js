// ============================================================
// DATA.JS — Données du bâtiment Lycée Gustave Eiffel Ermont
// ============================================================

const BUILDING_DATA = {
  floors: {
    rdc: {
      id: 'rdc',
      label: 'RDC',
      width: 950,
      height: 620,
      rooms: [
        // Aile basse (salles 1-8)
        { id: 'r1',  label: '1',  x: 190, y: 430, w: 65,  h: 75,  type: 'classroom', color: '#B8D4E8' },
        { id: 'r2',  label: '2',  x: 270, y: 430, w: 60,  h: 75,  type: 'classroom', color: '#B8D4E8' },
        { id: 'r3',  label: '3',  x: 330, y: 430, w: 60,  h: 75,  type: 'classroom', color: '#B8D4E8' },
        { id: 'r4',  label: '4',  x: 390, y: 430, w: 65,  h: 75,  type: 'classroom', color: '#B8D4E8' },
        { id: 'r5',  label: '5',  x: 455, y: 430, w: 55,  h: 65,  type: 'classroom', color: '#B8D4E8' },
        { id: 'r6',  label: '6',  x: 530, y: 460, w: 55,  h: 75,  type: 'classroom', color: '#B8D4E8' },
        { id: 'r7',  label: '7',  x: 615, y: 490, w: 65,  h: 70,  type: 'classroom', color: '#C8E6C9' },
        { id: 'r8',  label: '8',  x: 690, y: 490, w: 80,  h: 70,  type: 'classroom', color: '#C8E6C9' },
        // Aile gauche (salles 15-18)
        { id: 'r15', label: '15', x: 130, y: 240, w: 65,  h: 65,  type: 'classroom', color: '#F8BBD0' },
        { id: 'r16', label: '16', x: 130, y: 310, w: 60,  h: 60,  type: 'classroom', color: '#F8BBD0' },
        { id: 'r17', label: '17', x: 130, y: 370, w: 55,  h: 55,  type: 'classroom', color: '#F8BBD0' },
        { id: 'r18', label: '18', x: 210, y: 330, w: 65,  h: 65,  type: 'classroom', color: '#F8BBD0' },
        // Aile centrale (salles 13-14)
        { id: 'r13', label: '13', x: 280, y: 215, w: 60,  h: 60,  type: 'classroom', color: '#FFE0B2' },
        { id: 'r14', label: '14', x: 220, y: 215, w: 58,  h: 60,  type: 'classroom', color: '#FFE0B2' },
        // Couloir central / salle 12
        { id: 'r12', label: '12', x: 355, y: 195, w: 60,  h: 70,  type: 'classroom', color: '#E1BEE7' },
        // Salles hautes 10-11
        { id: 'r10', label: '10', x: 470, y: 100, w: 60,  h: 65,  type: 'classroom', color: '#B2EBF2' },
        { id: 'r11', label: '11', x: 470, y: 165, w: 60,  h: 55,  type: 'classroom', color: '#B2EBF2' },
        // Grande salle droite (CDI/gymnase)
        { id: 'rcdi', label: 'CDI', x: 660, y: 185, w: 175, h: 140, type: 'special',    color: '#DCEDC8' },
        // Entrée
        { id: 'rentree', label: 'ENTRÉE', x: 620, y: 150, w: 80, h: 40, type: 'entrance', color: '#A5D6A7' },
        // Escaliers
        { id: 'esc1', label: '▲', x: 420, y: 165, w: 40, h: 35, type: 'stair', color: '#BCAAA4' },
        { id: 'esc2', label: '▲', x: 590, y: 165, w: 35, h: 35, type: 'stair', color: '#BCAAA4' },
      ],
      corridors: [
        // Couloir principal bas
        { x: 185, y: 405, w: 600, h: 28 },
        // Couloir aile gauche vertical
        { x: 195, y: 220, w: 28, h: 210 },
        // Couloir aile centrale
        { x: 340, y: 195, w: 140, h: 28 },
        // Couloir vertical central
        { x: 440, y: 130, w: 28, h: 280 },
        // Couloir haut
        { x: 440, y: 130, w: 200, h: 28 },
      ],
      // Nœuds du graphe de navigation
      navNodes: [
        { id: 'n_entry',   x: 660, y: 185, floor: 'rdc' },
        { id: 'n_c1',      x: 440, y: 420, floor: 'rdc' },
        { id: 'n_c2',      x: 550, y: 420, floor: 'rdc' },
        { id: 'n_c3',      x: 650, y: 420, floor: 'rdc' },
        { id: 'n_c4',      x: 340, y: 420, floor: 'rdc' },
        { id: 'n_c5',      x: 240, y: 420, floor: 'rdc' },
        { id: 'n_c6',      x: 210, y: 350, floor: 'rdc' },
        { id: 'n_c7',      x: 210, y: 270, floor: 'rdc' },
        { id: 'n_c8',      x: 360, y: 220, floor: 'rdc' },
        { id: 'n_c9',      x: 455, y: 220, floor: 'rdc' },
        { id: 'n_c10',     x: 455, y: 145, floor: 'rdc' },
        { id: 'n_esc1',    x: 440, y: 183, floor: 'rdc', stair: true },
        { id: 'n_esc2',    x: 608, y: 183, floor: 'rdc', stair: true },
      ],
      navEdges: [
        ['n_entry','n_esc2'], ['n_esc2','n_c9'], ['n_c9','n_c8'],
        ['n_c8','n_c7'], ['n_c7','n_c6'], ['n_c6','n_c5'],
        ['n_c5','n_c4'], ['n_c4','n_c1'], ['n_c1','n_c2'],
        ['n_c2','n_c3'], ['n_c9','n_esc1'], ['n_esc1','n_c10'],
        ['n_c10','n_c9'],
      ],
      // Mapping salle → nœud le plus proche
      roomNodes: {
        'r1':'n_c5','r2':'n_c4','r3':'n_c4','r4':'n_c1',
        'r5':'n_c1','r6':'n_c2','r7':'n_c3','r8':'n_c3',
        'r15':'n_c7','r16':'n_c6','r17':'n_c6','r18':'n_c6',
        'r13':'n_c8','r14':'n_c8','r12':'n_c8',
        'r10':'n_c10','r11':'n_esc1',
        'rcdi':'n_entry','rentree':'n_entry',
        'esc1':'n_esc1','esc2':'n_esc2',
      }
    },

    etage1: {
      id: 'etage1',
      label: 'Étage 1',
      width: 850,
      height: 620,
      rooms: [
        // Aile diagonale gauche-bas (20-29)
        { id: 'r20', label: '20', x: 370, y: 330, w: 60,  h: 60,  type: 'classroom', color: '#B8D4E8' },
        { id: 'r21', label: '21', x: 330, y: 385, w: 60,  h: 58,  type: 'classroom', color: '#B8D4E8' },
        { id: 'r22', label: '22', x: 380, y: 410, w: 58,  h: 58,  type: 'classroom', color: '#B8D4E8' },
        { id: 'r23', label: '23', x: 355, y: 440, w: 58,  h: 55,  type: 'classroom', color: '#B8D4E8' },
        { id: 'r24', label: '24', x: 330, y: 490, w: 58,  h: 55,  type: 'classroom', color: '#FFE0B2' },
        { id: 'r25', label: '25', x: 305, y: 425, w: 58,  h: 58,  type: 'classroom', color: '#FFE0B2' },
        { id: 'r26', label: '26', x: 305, y: 500, w: 58,  h: 55,  type: 'classroom', color: '#FFE0B2' },
        { id: 'r27', label: '27', x: 230, y: 495, w: 60,  h: 55,  type: 'classroom', color: '#F8BBD0' },
        { id: 'r28', label: '28', x: 215, y: 460, w: 60,  h: 55,  type: 'classroom', color: '#F8BBD0' },
        { id: 'r29', label: '29', x: 270, y: 455, w: 58,  h: 55,  type: 'classroom', color: '#F8BBD0' },
        // Salle 30 + grande salle droite
        { id: 'r30', label: '30', x: 480, y: 340, w: 60,  h: 60,  type: 'classroom', color: '#E1BEE7' },
        { id: 'rsalle_droite', label: 'Salle\nInfo', x: 600, y: 330, w: 180, h: 80, type: 'special', color: '#DCEDC8' },
        { id: 'rsalle_droite2', label: 'Labo', x: 720, y: 330, w: 100, h: 80, type: 'special', color: '#C8E6C9' },
        // Aile montante (31-37)
        { id: 'r31', label: '31', x: 435, y: 275, w: 58,  h: 58,  type: 'classroom', color: '#B2EBF2' },
        { id: 'r32', label: '32', x: 490, y: 275, w: 58,  h: 58,  type: 'classroom', color: '#B2EBF2' },
        { id: 'r33', label: '33', x: 415, y: 215, w: 58,  h: 58,  type: 'classroom', color: '#B2EBF2' },
        { id: 'r34', label: '34', x: 470, y: 215, w: 58,  h: 58,  type: 'classroom', color: '#B2EBF2' },
        { id: 'r35', label: '35', x: 395, y: 155, w: 58,  h: 58,  type: 'classroom', color: '#FFE0B2' },
        { id: 'r36', label: '36', x: 450, y: 155, w: 58,  h: 58,  type: 'classroom', color: '#FFE0B2' },
        { id: 'r37', label: '37', x: 460, y: 95,  w: 60,  h: 60,  type: 'classroom', color: '#F8BBD0' },
        // Escaliers
        { id: 'esc1e', label: '▲', x: 430, y: 330, w: 38, h: 35, type: 'stair', color: '#BCAAA4' },
        { id: 'esc2e', label: '▲', x: 355, y: 330, w: 38, h: 35, type: 'stair', color: '#BCAAA4' },
      ],
      corridors: [
        // Couloir diagonal principal
        { x: 355, y: 355, w: 120, h: 25 },
        { x: 330, y: 380, w: 25,  h: 120 },
        { x: 375, y: 405, w: 25,  h: 100 },
        // Couloir montant
        { x: 430, y: 130, w: 25,  h: 220 },
        { x: 455, y: 130, w: 80,  h: 25  },
        // Couloir droit
        { x: 475, y: 305, w: 280, h: 25  },
      ],
      navNodes: [
        { id: 'n_esc1e', x: 449, y: 348, floor: 'etage1', stair: true },
        { id: 'n_esc2e', x: 374, y: 348, floor: 'etage1', stair: true },
        { id: 'n_e1',    x: 370, y: 380, floor: 'etage1' },
        { id: 'n_e2',    x: 370, y: 430, floor: 'etage1' },
        { id: 'n_e3',    x: 340, y: 470, floor: 'etage1' },
        { id: 'n_e4',    x: 310, y: 460, floor: 'etage1' },
        { id: 'n_e5',    x: 250, y: 475, floor: 'etage1' },
        { id: 'n_e6',    x: 442, y: 290, floor: 'etage1' },
        { id: 'n_e7',    x: 442, y: 230, floor: 'etage1' },
        { id: 'n_e8',    x: 442, y: 170, floor: 'etage1' },
        { id: 'n_e9',    x: 442, y: 120, floor: 'etage1' },
        { id: 'n_e10',   x: 500, y: 348, floor: 'etage1' },
        { id: 'n_e11',   x: 620, y: 348, floor: 'etage1' },
        { id: 'n_e12',   x: 740, y: 348, floor: 'etage1' },
      ],
      navEdges: [
        ['n_esc1e','n_e10'],['n_e10','n_e11'],['n_e11','n_e12'],
        ['n_esc1e','n_e6'], ['n_e6','n_e7'],  ['n_e7','n_e8'],
        ['n_e8','n_e9'],    ['n_esc2e','n_e1'],['n_e1','n_e2'],
        ['n_e2','n_e3'],    ['n_e3','n_e4'],   ['n_e4','n_e5'],
        ['n_esc1e','n_esc2e'],
      ],
      roomNodes: {
        'r20':'n_esc1e','r21':'n_e1','r22':'n_e1','r23':'n_e2',
        'r24':'n_e3','r25':'n_e2','r26':'n_e3','r27':'n_e5',
        'r28':'n_e5','r29':'n_e4','r30':'n_e10',
        'rsalle_droite':'n_e11','rsalle_droite2':'n_e12',
        'r31':'n_e6','r32':'n_e6','r33':'n_e7','r34':'n_e7',
        'r35':'n_e8','r36':'n_e8','r37':'n_e9',
        'esc1e':'n_esc1e','esc2e':'n_esc2e',
      }
    }
  },

  // Connexions inter-étages
  stairConnections: [
    { from: 'rdc:n_esc1', to: 'etage1:n_esc1e' },
    { from: 'rdc:n_esc2', to: 'etage1:n_esc2e' },
  ]
};

// Algorithme A*
function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function astar(nodes, edges, startId, endId) {
  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id] = n);
  const adj = {};
  nodes.forEach(n => adj[n.id] = []);
  edges.forEach(([a, b]) => {
    if (nodeMap[a] && nodeMap[b]) {
      const d = heuristic(nodeMap[a], nodeMap[b]);
      adj[a].push({ id: b, cost: d });
      adj[b].push({ id: a, cost: d });
    }
  });
  const open = new Map();
  const closed = new Set();
  const g = {}, prev = {};
  nodes.forEach(n => { g[n.id] = Infinity; prev[n.id] = null; });
  g[startId] = 0;
  open.set(startId, g[startId] + heuristic(nodeMap[startId], nodeMap[endId]));
  while (open.size > 0) {
    let current = [...open.entries()].sort((a,b) => a[1]-b[1])[0][0];
    if (current === endId) {
      const path = [];
      while (current) { path.unshift(current); current = prev[current]; }
      return path;
    }
    open.delete(current);
    closed.add(current);
    for (const nb of adj[current]) {
      if (closed.has(nb.id)) continue;
      const ng = g[current] + nb.cost;
      if (ng < g[nb.id]) {
        g[nb.id] = ng;
        prev[nb.id] = current;
        open.set(nb.id, ng + heuristic(nodeMap[nb.id], nodeMap[endId]));
      }
    }
  }
  return [];
}

function findPath(fromRoomId, fromFloor, toRoomId, toFloor) {
  const srcFloor = BUILDING_DATA.floors[fromFloor];
  const dstFloor = BUILDING_DATA.floors[toFloor];
  const srcNode = srcFloor.roomNodes[fromRoomId];
  const dstNode = dstFloor.roomNodes[toRoomId];
  if (!srcNode || !dstNode) return null;

  if (fromFloor === toFloor) {
    const path = astar(srcFloor.navNodes, srcFloor.navEdges, srcNode, dstNode);
    return [{ floor: fromFloor, nodes: path }];
  }

  // Multi-étage : passer par escalier
  const stairs = BUILDING_DATA.stairConnections;
  let best = null, bestLen = Infinity;
  for (const sc of stairs) {
    const [sf, sn] = sc.from.split(':');
    const [tf, tn] = sc.to.split(':');
    if (sf !== fromFloor || tf !== toFloor) continue;
    const p1 = astar(srcFloor.navNodes, srcFloor.navEdges, srcNode, sn);
    const p2 = astar(dstFloor.navNodes, dstFloor.navEdges, tn, dstNode);
    if (p1.length && p2.length && p1.length + p2.length < bestLen) {
      bestLen = p1.length + p2.length;
      best = [
        { floor: fromFloor, nodes: p1 },
        { floor: toFloor,   nodes: p2 }
      ];
    }
  }
  return best;
}
