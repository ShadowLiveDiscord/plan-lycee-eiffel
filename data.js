// ================================================================
// DATA.JS — Lycée Gustave Eiffel Ermont — Plan fidèle aux images
// ================================================================

const BD = {
  scale: 0.09, // 1px = 0.09m
  walkSpeed: 0.9, // m/s lycéen couloir
  stairTime: 15,  // secondes par étage

  floors: {
    rdc: {
      id:'rdc', label:'RDC', w:980, h:650,
      // Murs extérieurs (polygone)
      outline: [
        // Aile basse principale
        [155,390],[155,530],[820,530],[820,470],[860,470],[860,530],[1000,530],
        [1000,390],
        // Remontée droite
        [1000,140],[840,140],[840,390],
        // Salle 10/11 en haut
        [770,140],[770,60],[520,60],[520,140],
        // Retour vers gauche
        [440,140],[440,180],[410,180],[410,140],
        // Aile gauche
        [100,140],[100,530],[155,530],[155,390]
      ],
      rooms: [
        // Aile basse salles 1-8
        {id:'r1', label:'1',   x:160, y:420, w:70,  h:90,  type:'classroom', color:'#6BB5D6', icon:'📖'},
        {id:'r2', label:'2',   x:235, y:420, w:70,  h:90,  type:'classroom', color:'#6BB5D6', icon:'📖'},
        {id:'r3', label:'3',   x:310, y:420, w:70,  h:90,  type:'classroom', color:'#6BB5D6', icon:'📖'},
        {id:'r4', label:'4',   x:385, y:420, w:70,  h:90,  type:'classroom', color:'#6BB5D6', icon:'📖'},
        {id:'r5', label:'5',   x:460, y:430, w:65,  h:80,  type:'classroom', color:'#6BB5D6', icon:'📖'},
        {id:'r6', label:'6',   x:545, y:440, w:65,  h:80,  type:'classroom', color:'#6BB5D6', icon:'📖'},
        {id:'r7', label:'7',   x:650, y:450, w:75,  h:70,  type:'classroom', color:'#5BAD7A', icon:'📖'},
        {id:'r8', label:'8',   x:730, y:450, w:90,  h:70,  type:'classroom', color:'#5BAD7A', icon:'📖'},
        // Aile gauche 15-18
        {id:'r15',label:'15',  x:105, y:200, w:70,  h:70,  type:'classroom', color:'#D4607A', icon:'📖'},
        {id:'r16',label:'16',  x:105, y:275, w:65,  h:65,  type:'classroom', color:'#D4607A', icon:'📖'},
        {id:'r17',label:'17',  x:105, y:345, w:60,  h:60,  type:'classroom', color:'#D4607A', icon:'📖'},
        {id:'r18',label:'18',  x:185, y:300, w:70,  h:70,  type:'classroom', color:'#D4607A', icon:'📖'},
        // Aile centrale 13-14
        {id:'r13',label:'13',  x:295, y:195, w:65,  h:65,  type:'classroom', color:'#C8843A', icon:'📖'},
        {id:'r14',label:'14',  x:225, y:195, w:65,  h:65,  type:'classroom', color:'#C8843A', icon:'📖'},
        // Salle 12
        {id:'r12',label:'12',  x:365, y:175, w:65,  h:75,  type:'classroom', color:'#9B6BB5', icon:'📖'},
        // Salles 10-11
        {id:'r10',label:'10',  x:530, y:65,  w:70,  h:70,  type:'classroom', color:'#4BADB5', icon:'📖'},
        {id:'r11',label:'11',  x:530, y:140, w:70,  h:60,  type:'classroom', color:'#4BADB5', icon:'📖'},
        // CDI
        {id:'rcdi',label:'CDI',x:700, y:155, w:200, h:175, type:'special',   color:'#7AB55A', icon:'📚'},
        // Entrée
        {id:'rent',label:'ENTRÉE',x:650,y:140,w:55,h:40,   type:'entrance',  color:'#3DB56A', icon:'🚪'},
        // Escaliers RDC
        {id:'esc1',label:'ESC1',x:455,y:160,w:45,h:40,     type:'stair',     color:'#A0522D', icon:'▲'},
        {id:'esc2',label:'ESC2',x:615,y:155,w:40,h:40,     type:'stair',     color:'#A0522D', icon:'▲'},
      ],
      corridors: [
        // Couloir principal bas horizontal
        {x:155, y:395, w:845, h:30},
        // Couloir vertical gauche
        {x:175, y:195, w:30,  h:200},
        // Couloir central horizontal haut
        {x:290, y:175, w:175, h:28},
        // Couloir vertical central
        {x:450, y:100, w:30,  h:300},
        // Couloir horizontal haut
        {x:450, y:100, w:215, h:28},
        // Couloir droit vers CDI
        {x:640, y:155, w:65,  h:28},
      ],
      walls: [
        // Murs entre salles aile basse
        {x:230,y:420,w:5,h:90},{x:305,y:420,w:5,h:90},{x:380,y:420,w:5,h:90},
        {x:455,y:430,w:5,h:80},{x:540,y:440,w:5,h:80},{x:645,y:450,w:5,h:70},
        // Murs aile gauche
        {x:105,y:270,w:65,h:5},{x:105,y:340,w:65,h:5},
        // Mur CDI
        {x:700,y:155,w:5,h:175},{x:700,y:325,w:200,h:5},
      ],
      navNodes: [
        {id:'nc0', x:660, y:160},{id:'nc1', x:480, y:115},
        {id:'nc2', x:480, y:205},{id:'nc3', x:480, y:300},
        {id:'nc4', x:480, y:410},{id:'nc5', x:395, y:410},
        {id:'nc6', x:310, y:410},{id:'nc7', x:230, y:410},
        {id:'nc8', x:190, y:410},{id:'nc9', x:190, y:310},
        {id:'nc10',x:190, y:230},{id:'nc11',x:295, y:190},
        {id:'nc12',x:370, y:190},{id:'nc13',x:480, y:190},
        {id:'nc14',x:560, y:410},{id:'nc15',x:650, y:410},
        {id:'nc16',x:750, y:410},
        {id:'nesc1',x:475,y:180,stair:true},
        {id:'nesc2',x:635,y:170,stair:true},
      ],
      navEdges:[
        ['nc0','nesc2'],['nesc2','nc2'],['nc2','nc1'],['nc1','nesc1'],
        ['nesc1','nc13'],['nc13','nc12'],['nc12','nc11'],['nc11','nc10'],
        ['nc10','nc9'],['nc9','nc8'],['nc8','nc7'],['nc7','nc6'],
        ['nc6','nc5'],['nc5','nc4'],['nc4','nc3'],['nc3','nc2'],
        ['nc4','nc14'],['nc14','nc15'],['nc15','nc16'],
        ['nc8','nc9'],
      ],
      roomNodes:{
        'r1':'nc8','r2':'nc7','r3':'nc6','r4':'nc5','r5':'nc4',
        'r6':'nc14','r7':'nc15','r8':'nc16',
        'r15':'nc10','r16':'nc9','r17':'nc9','r18':'nc9',
        'r13':'nc11','r14':'nc11','r12':'nc12',
        'r10':'nc1','r11':'nc2',
        'rcdi':'nc0','rent':'nc0',
        'esc1':'nesc1','esc2':'nesc2',
      }
    },

    etage1: {
      id:'etage1', label:'Étage 1', w:900, h:650,
      outline:[
        [155,270],[155,560],[310,560],[310,540],[390,540],[390,560],
        [450,560],[450,370],[830,370],[830,560],[900,560],[900,270],
        [550,270],[550,60],[390,60],[390,270]
      ],
      rooms:[
        // Aile montante 31-37
        {id:'r31',label:'31', x:400, y:270, w:65, h:65, type:'classroom', color:'#4BADB5', icon:'📖'},
        {id:'r32',label:'32', x:470, y:270, w:65, h:65, type:'classroom', color:'#4BADB5', icon:'📖'},
        {id:'r33',label:'33', x:390, y:200, w:65, h:65, type:'classroom', color:'#4BADB5', icon:'📖'},
        {id:'r34',label:'34', x:460, y:200, w:65, h:65, type:'classroom', color:'#4BADB5', icon:'📖'},
        {id:'r35',label:'35', x:380, y:130, w:65, h:65, type:'classroom', color:'#C8843A', icon:'📖'},
        {id:'r36',label:'36', x:450, y:130, w:65, h:65, type:'classroom', color:'#C8843A', icon:'📖'},
        {id:'r37',label:'37', x:420, y:65,  w:70, h:65, type:'classroom', color:'#D4607A', icon:'📖'},
        // Salle 30 + salles droite
        {id:'r30',label:'30', x:540, y:280, w:65, h:65, type:'classroom', color:'#9B6BB5', icon:'📖'},
        {id:'rsinfo',label:'Info', x:620,y:275,w:110,h:75,type:'special', color:'#5BAD7A', icon:'💻'},
        {id:'rlabo',label:'Labo',  x:740,y:275,w:80, h:75,type:'special', color:'#7AB55A', icon:'🔬'},
        // Aile diagonale 20-29
        {id:'r20',label:'20', x:395, y:340, w:60, h:60, type:'classroom', color:'#6BB5D6', icon:'📖'},
        {id:'r21',label:'21', x:330, y:375, w:60, h:60, type:'classroom', color:'#6BB5D6', icon:'📖'},
        {id:'r22',label:'22', x:395, y:395, w:60, h:60, type:'classroom', color:'#6BB5D6', icon:'📖'},
        {id:'r23',label:'23', x:360, y:455, w:60, h:60, type:'classroom', color:'#6BB5D6', icon:'📖'},
        {id:'r24',label:'24', x:330, y:480, w:60, h:60, type:'classroom', color:'#C8843A', icon:'📖'},
        {id:'r25',label:'25', x:290, y:430, w:60, h:60, type:'classroom', color:'#C8843A', icon:'📖'},
        {id:'r26',label:'26', x:280, y:490, w:60, h:60, type:'classroom', color:'#C8843A', icon:'📖'},
        {id:'r27',label:'27', x:205, y:490, w:65, h:60, type:'classroom', color:'#D4607A', icon:'📖'},
        {id:'r28',label:'28', x:165, y:450, w:65, h:60, type:'classroom', color:'#D4607A', icon:'📖'},
        {id:'r29',label:'29', x:210, y:415, w:60, h:60, type:'classroom', color:'#D4607A', icon:'📖'},
        // Escaliers étage
        {id:'esc1e',label:'ESC1',x:455,y:340,w:42,h:38,type:'stair',color:'#A0522D',icon:'▲'},
        {id:'esc2e',label:'ESC2',x:370,y:340,w:38,h:38,type:'stair',color:'#A0522D',icon:'▲'},
      ],
      corridors:[
        {x:395,y:340,w:445,h:28},
        {x:395,y:100,w:28, h:270},
        {x:395,y:100,w:95, h:28},
        {x:160,y:415,w:238,h:25},
        {x:160,y:415,w:25, h:155},
      ],
      walls:[
        {x:465,y:270,w:5,h:65},{x:455,y:200,w:5,h:65},{x:445,y:130,w:5,h:65},
        {x:540,y:275,w:5,h:75},{x:620,y:275,w:5,h:75},{x:740,y:275,w:5,h:75},
      ],
      navNodes:[
        {id:'ne0', x:476,y:355,stair:true},
        {id:'ne0b',x:388,y:355,stair:true},
        {id:'ne1', x:550,y:355},{id:'ne2',x:670,y:355},{id:'ne3',x:780,y:355},
        {id:'ne4', x:476,y:285},{id:'ne5',x:476,y:215},{id:'ne6',x:476,y:145},
        {id:'ne7', x:476,y:90},
        {id:'ne8', x:388,y:390},{id:'ne9',x:340,y:430},{id:'ne10',x:310,y:455},
        {id:'ne11',x:270,y:460},{id:'ne12',x:185,y:430},
      ],
      navEdges:[
        ['ne0','ne1'],['ne1','ne2'],['ne2','ne3'],
        ['ne0','ne4'],['ne4','ne5'],['ne5','ne6'],['ne6','ne7'],
        ['ne0','ne0b'],['ne0b','ne8'],['ne8','ne9'],['ne9','ne10'],
        ['ne10','ne11'],['ne11','ne12'],
      ],
      roomNodes:{
        'r31':'ne4','r32':'ne4','r33':'ne5','r34':'ne5',
        'r35':'ne6','r36':'ne6','r37':'ne7',
        'r30':'ne1','rsinfo':'ne2','rlabo':'ne3',
        'r20':'ne0','r21':'ne8','r22':'ne8','r23':'ne9',
        'r24':'ne10','r25':'ne9','r26':'ne10','r27':'ne11',
        'r28':'ne12','r29':'ne12',
        'esc1e':'ne0','esc2e':'ne0b',
      }
    }
  },

  stairLinks:[
    {from:'rdc:nesc1', to:'etage1:ne0'},
    {from:'rdc:nesc2', to:'etage1:ne0b'},
  ]
};

// ── Algorithme A* ─────────────────────────────────────────────
function heur(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}

function astar(nodes,edges,sid,eid){
  const nm={};nodes.forEach(n=>nm[n.id]=n);
  if(!nm[sid]||!nm[eid])return[];
  const adj={};nodes.forEach(n=>adj[n.id]=[]);
  edges.forEach(([a,b])=>{
    if(!nm[a]||!nm[b])return;
    const d=heur(nm[a],nm[b]);
    adj[a].push({id:b,cost:d});adj[b].push({id:a,cost:d});
  });
  const open=new Map(),closed=new Set(),g={},prev={};
  nodes.forEach(n=>{g[n.id]=Infinity;prev[n.id]=null;});
  g[sid]=0;open.set(sid,heur(nm[sid],nm[eid]));
  while(open.size){
    let cur=[...open.entries()].sort((a,b)=>a[1]-b[1])[0][0];
    if(cur===eid){const p=[];while(cur){p.unshift(cur);cur=prev[cur];}return p;}
    open.delete(cur);closed.add(cur);
    for(const nb of adj[cur]){
      if(closed.has(nb.id))continue;
      const ng=g[cur]+nb.cost;
      if(ng<g[nb.id]){g[nb.id]=ng;prev[nb.id]=cur;open.set(nb.id,ng+heur(nm[nb.id],nm[eid]));}
    }
  }
  return[];
}

function findPath(fRoomId,fFloor,tRoomId,tFloor){
  const sf=BD.floors[fFloor],df=BD.floors[tFloor];
  const sn=sf.roomNodes[fRoomId],dn=df.roomNodes[tRoomId];
  if(!sn||!dn)return null;
  if(fFloor===tFloor){
    const p=astar(sf.navNodes,sf.navEdges,sn,dn);
    return p.length?[{floor:fFloor,nodes:p}]:null;
  }
  let best=null,bestLen=Infinity;
  for(const sl of BD.stairLinks){
    const[sf2,sn2]=sl.from.split(':');
    const[tf2,tn2]=sl.to.split(':');
    if(sf2!==fFloor||tf2!==tFloor)continue;
    const p1=astar(BD.floors[fFloor].navNodes,BD.floors[fFloor].navEdges,sn,sn2);
    const p2=astar(BD.floors[tFloor].navNodes,BD.floors[tFloor].navEdges,tn2,dn);
    if(p1.length&&p2.length&&p1.length+p2.length<bestLen){
      bestLen=p1.length+p2.length;
      best=[{floor:fFloor,nodes:p1},{floor:tFloor,nodes:p2}];
    }
  }
  return best;
}

function calcDist(path){
  let d=0;
  for(const seg of path){
    const floor=BD.floors[seg.floor];
    const nm={};floor.navNodes.forEach(n=>nm[n.id]=n);
    const nodes=seg.nodes.map(id=>nm[id]).filter(Boolean);
    for(let i=1;i<nodes.length;i++)d+=Math.hypot(nodes[i].x-nodes[i-1].x,nodes[i].y-nodes[i-1].y);
  }
  return d*BD.scale;
}
