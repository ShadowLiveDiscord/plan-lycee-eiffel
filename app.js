// ================================================================
// APP.JS — Plan Interactif Lycée Gustave Eiffel
// ================================================================

const S = {
  floor:'rdc', view:'2d', zoom:1, panX:0, panY:0,
  isDrag:false, dragStart:{x:0,y:0}, panStart:{x:0,y:0},
  highlight:null, filter:'all',
  route:null, routeFrom:null, routeTo:null,
  routeAnim:0,
  admin:false, adminSel:null,
  v3mode:'interior', v3pitch:0.55, v3yaw:0.4,
  theme:'dark',
  velX:0, velY:0, lastDragX:0, lastDragY:0,
};

// ── LocalStorage ─────────────────────────────────────────────
function saveRooms(){localStorage.setItem('lycee_rooms',JSON.stringify({rdc:BD.floors.rdc.rooms,etage1:BD.floors.etage1.rooms}));}
function loadRooms(){
  try{
    const d=JSON.parse(localStorage.getItem('lycee_rooms')||'null');
    if(d){if(d.rdc)BD.floors.rdc.rooms=d.rdc;if(d.etage1)BD.floors.etage1.rooms=d.etage1;}
  }catch(e){}
}
loadRooms();

// ── Canvases ─────────────────────────────────────────────────
const c2=document.getElementById('canvas2d').getContext('2d');
const c3=document.getElementById('canvas3d').getContext('2d');
const cm=document.getElementById('minimapCanvas').getContext('2d');

// ── Thème ────────────────────────────────────────────────────
function applyTheme(t,skipDraw){
  S.theme=t;
  document.body.classList.toggle('light',t==='light');
  document.getElementById('themeBtn').textContent=t==='light'?'🌙':'☀';
  localStorage.setItem('lycee_theme',t);
  if(!skipDraw)redraw();
}
document.getElementById('themeBtn').addEventListener('click',()=>applyTheme(S.theme==='dark'?'light':'dark'));
const savedTheme=localStorage.getItem('lycee_theme')||'dark';
applyTheme(savedTheme,true);

function getCanvasSize(){
  if(isMobile()){
    const headerH=document.querySelector('.header').offsetHeight||54;
    const bottomH=document.getElementById('mobileBottom').offsetHeight||56;
    return{W:window.innerWidth,H:window.innerHeight-headerH-bottomH};
  }
  const z=document.querySelector('.canvas-zone');
  return{W:z.clientWidth,H:z.clientHeight};
}

function resize(){
  const{W,H}=getCanvasSize();
  [c2,c3].forEach(c=>{c.canvas.width=Math.max(W,100);c.canvas.height=Math.max(H,100);});
  cm.canvas.width=150;cm.canvas.height=100;
  redraw();
}
window.addEventListener('resize',resize);

// ── Helpers couleur ──────────────────────────────────────────
function adjCol(hex,n){
  const v=parseInt(hex.replace('#',''),16);
  const r=Math.min(255,Math.max(0,(v>>16)+n));
  const g=Math.min(255,Math.max(0,((v>>8)&0xff)+n));
  const b=Math.min(255,Math.max(0,(v&0xff)+n));
  return`rgb(${r},${g},${b})`;
}
function isDark(){return S.theme==='dark';}

// ── Dessin 2D ────────────────────────────────────────────────
function redraw(){
  if(!c2||!c3||!cm)return;
  draw2d();if(S.view==='3d')draw3d();drawMinimap();
}

function draw2d(){
  const c=c2,W=c.canvas.width,H=c.canvas.height;
  c.clearRect(0,0,W,H);
  c.fillStyle=isDark()?'#161b22':'#e8ecf0';
  c.fillRect(0,0,W,H);
  drawGrid(c,W,H);
  const floors=S.floor==='both'?['rdc','etage1']:[S.floor];
  let oy=0;
  for(const fid of floors){
    const fl=BD.floors[fid];
    c.save();
    c.translate(S.panX,S.panY+oy*S.zoom);
    c.scale(S.zoom,S.zoom);
    drawFloor(c,fl,fid);
    c.restore();
    if(S.floor==='both')oy+=fl.h+60;
  }
  if(S.route)drawRoute(c);
  // Labels étages
  if(S.floor==='both'){
    let oy2=0;
    for(const fid of['rdc','etage1']){
      const fl=BD.floors[fid];
      c.save();
      c.font=`700 12px Syne,sans-serif`;
      c.fillStyle=isDark()?'rgba(88,166,255,0.7)':'rgba(9,105,218,0.7)';
      c.fillText('── '+fl.label+' ──',S.panX+12,S.panY+oy2*S.zoom+20);
      c.restore();
      oy2+=fl.h+60;
    }
  }
}

function drawGrid(c,W,H){
  const step=50*S.zoom;
  const ox=((S.panX%step)+step)%step,oy=((S.panY%step)+step)%step;
  c.strokeStyle=isDark()?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.05)';
  c.lineWidth=1;
  for(let x=ox;x<W;x+=step){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
  for(let y=oy;y<H;y+=step){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
}

function drawFloor(c,floor,fid){
  // Fond du bâtiment
  c.fillStyle=isDark()?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.03)';
  c.fillRect(90,50,floor.w-100,floor.h-80);

  // Couloirs
  c.fillStyle=isDark()?'#4a5568':'#c8cdd3';
  for(const cor of floor.corridors){
    c.beginPath();c.roundRect(cor.x,cor.y,cor.w,cor.h,3);c.fill();
  }

  // Murs intérieurs
  c.fillStyle=isDark()?'#2d333b':'#444c56';
  for(const w of(floor.walls||[])){
    c.fillRect(w.x,w.y,w.w,w.h);
  }

  // Murs extérieurs épais
  c.strokeStyle=isDark()?'#e6edf3':'#1c2128';
  c.lineWidth=5/S.zoom;
  c.lineJoin='round';
  const xs=floor.rooms.map(r=>r.x),ys=floor.rooms.map(r=>r.y);
  const x2s=floor.rooms.map(r=>r.x+r.w),y2s=floor.rooms.map(r=>r.y+r.h);
  const mx=Math.min(...xs)-18,my=Math.min(...ys)-18;
  const mw=Math.max(...x2s)-mx+18,mh=Math.max(...y2s)-my+18;
  c.beginPath();c.roundRect(mx,my,mw,mh,12);c.stroke();

  // Salles
  for(const room of floor.rooms){
    const show=S.filter==='all'||S.filter===room.type;
    if(!show){c.save();c.globalAlpha=0.2;drawRoom(c,room,fid);c.restore();}
    else drawRoom(c,room,fid);
  }
}

function drawRoom(c,room,fid){
  const isHL=S.highlight===room.id;
  const isSel=S.adminSel===room.id;
  const isRoute=S.routeFrom?.id===room.id||S.routeTo?.id===room.id;

  c.save();

  // Ombre
  if(isHL||isSel||isRoute){
    c.shadowColor=isSel?'#d29922':isRoute?'#2f81f7':'#58a6ff';
    c.shadowBlur=20/S.zoom;
  }

  // Fill
  let fill=room.color||'#6BB5D6';
  if(room.type==='stair')fill='#A0522D';
  else if(room.type==='entrance')fill='#3DB56A';
  if(isHL)fill='#ffd700';

  // Dégradé subtil
  const grd=c.createLinearGradient(room.x,room.y,room.x,room.y+room.h);
  grd.addColorStop(0,adjCol(fill,20));
  grd.addColorStop(1,adjCol(fill,-10));
  c.fillStyle=grd;
  c.beginPath();c.roundRect(room.x,room.y,room.w,room.h,6);c.fill();

  // Bordure
  c.shadowBlur=0;
  if(isSel){c.strokeStyle='#d29922';c.lineWidth=2.5/S.zoom;}
  else if(isHL||isRoute){c.strokeStyle='#2f81f7';c.lineWidth=2/S.zoom;}
  else{c.strokeStyle=isDark()?'rgba(0,0,0,0.4)':'rgba(0,0,0,0.2)';c.lineWidth=1/S.zoom;}
  c.beginPath();c.roundRect(room.x,room.y,room.w,room.h,6);c.stroke();

  // Icône + texte
  const fs=Math.max(8,Math.min(13,room.w/4,room.h/2.5));
  c.textAlign='center';c.textBaseline='middle';
  const cx=room.x+room.w/2,cy=room.y+room.h/2;

  if(room.icon&&room.type!=='classroom'&&room.w>50){
    c.font=`${fs*1.6}px serif`;
    c.fillText(room.icon,cx,cy-fs*0.6);
    c.font=`700 ${fs}px Syne,sans-serif`;
    c.fillStyle='#1a1a1a';
    c.fillText(room.label,cx,cy+fs*0.9);
  } else {
    c.font=`700 ${fs}px Syne,sans-serif`;
    c.fillStyle='#1a1a1a';
    const lines=room.label.split('\n');
    lines.forEach((ln,i)=>c.fillText(ln,cx,cy+(i-(lines.length-1)/2)*(fs+2)));
  }

  c.restore();
}

// ── Route 2D ─────────────────────────────────────────────────
let routeAnimFrame=0;
function drawRoute(c){
  if(!S.route)return;
  const floorOrder=['rdc','etage1'];
  for(const seg of S.route){
    const fid=seg.floor,floor=BD.floors[fid];
    const flIdx=S.floor==='both'?floorOrder.indexOf(fid):0;
    if(S.floor!=='both'&&fid!==S.floor)continue;
    const nm={};floor.navNodes.forEach(n=>nm[n.id]=n);
    const nodes=seg.nodes.map(id=>nm[id]).filter(Boolean);
    if(nodes.length<2)continue;

    c.save();
    c.translate(S.panX,S.panY+flIdx*(floor.h+60)*S.zoom);
    c.scale(S.zoom,S.zoom);

    // Halo
    c.strokeStyle='rgba(47,129,247,0.2)';
    c.lineWidth=14/S.zoom;c.lineCap='round';c.lineJoin='round';
    c.beginPath();c.moveTo(nodes[0].x,nodes[0].y);
    nodes.slice(1).forEach(n=>c.lineTo(n.x,n.y));c.stroke();

    // Ligne principale
    c.strokeStyle='#2f81f7';c.lineWidth=4/S.zoom;
    c.setLineDash([12/S.zoom,6/S.zoom]);
    c.lineDashOffset=-routeAnimFrame/S.zoom;
    c.beginPath();c.moveTo(nodes[0].x,nodes[0].y);
    nodes.slice(1).forEach(n=>c.lineTo(n.x,n.y));c.stroke();
    c.setLineDash([]);

    // Points étapes
    nodes.forEach((n,i)=>{
      c.save();
      const isFirst=i===0,isLast=i===nodes.length-1;
      const col=isFirst?'#3fb950':isLast?'#f85149':'#58a6ff';
      c.shadowColor=col;c.shadowBlur=10/S.zoom;
      c.beginPath();c.arc(n.x,n.y,isFirst||isLast?7/S.zoom:4/S.zoom,0,Math.PI*2);
      c.fillStyle=col;c.fill();
      if(isFirst||isLast){
        c.font=`700 ${9/S.zoom}px Syne,sans-serif`;
        c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';
        c.fillText(isFirst?'D':'A',n.x,n.y);
      }
      c.restore();
    });

    c.restore();
  }
}

// Animation route
function animateRoute(){
  if(S.route){
    routeAnimFrame=(routeAnimFrame+0.5)%18;
    draw2d();
    if(S.view==='3d')draw3d();
  }
  requestAnimationFrame(animateRoute);
}
animateRoute();

// ── Inertie pan ───────────────────────────────────────────────
function applyInertia(){
  if(!S.isDrag&&(Math.abs(S.velX)>0.1||Math.abs(S.velY)>0.1)){
    S.panX+=S.velX;S.panY+=S.velY;
    S.velX*=0.88;S.velY*=0.88;
    draw2d();drawMinimap();
  }
  requestAnimationFrame(applyInertia);
}
applyInertia();

// ── Événements canvas 2D ─────────────────────────────────────
const cv2=document.getElementById('canvas2d');

cv2.addEventListener('mousedown',e=>{
  S.isDrag=true;S.velX=0;S.velY=0;
  S.dragStart={x:e.clientX,y:e.clientY};
  S.panStart={x:S.panX,y:S.panY};
  S.lastDragX=e.clientX;S.lastDragY=e.clientY;
});
cv2.addEventListener('mousemove',e=>{
  if(S.isDrag){
    S.velX=e.clientX-S.lastDragX;S.velY=e.clientY-S.lastDragY;
    S.lastDragX=e.clientX;S.lastDragY=e.clientY;
    S.panX=S.panStart.x+e.clientX-S.dragStart.x;
    S.panY=S.panStart.y+e.clientY-S.dragStart.y;
    draw2d();drawMinimap();
  } else {
    const hit=roomAt(e.clientX-cv2.getBoundingClientRect().left,e.clientY-cv2.getBoundingClientRect().top);
    const tip=document.getElementById('tooltip');
    if(hit){
      tip.style.display='block';
      tip.style.left=(e.clientX+14)+'px';tip.style.top=(e.clientY+14)+'px';
      const tl={classroom:'Salle de cours',special:'Salle spéciale',entrance:'Entrée',stair:'Escalier'};
      tip.innerHTML=`<strong>${hit.room.icon||''} Salle ${hit.room.label}</strong><br>${tl[hit.room.type]||''}<br><small>${BD.floors[hit.floor].label}</small>`;
    } else tip.style.display='none';
  }
});
cv2.addEventListener('mouseup',e=>{
  const moved=Math.hypot(e.clientX-S.dragStart.x,e.clientY-S.dragStart.y);
  S.isDrag=false;
  if(moved<5){
    const rect=cv2.getBoundingClientRect();
    const hit=roomAt(e.clientX-rect.left,e.clientY-rect.top);
    if(hit){
      if(S.admin)openAdminEditor(hit.room,hit.floor);
      else{S.highlight=hit.room.id;showRoomDetail(hit.room,hit.floor);centerOn(hit.room,hit.floor);draw2d();}
    } else {
      S.highlight=null;
      document.getElementById('roomDetailBlock').style.display='none';
      draw2d();
    }
  }
});
cv2.addEventListener('mouseleave',()=>{S.isDrag=false;document.getElementById('tooltip').style.display='none';});
cv2.addEventListener('dblclick',e=>{
  const rect=cv2.getBoundingClientRect();
  const hit=roomAt(e.clientX-rect.left,e.clientY-rect.top);
  if(hit)zoomTo(hit.room,hit.floor,2.5);
});
cv2.addEventListener('wheel',e=>{
  e.preventDefault();
  const f=e.deltaY<0?1.15:0.87;
  const rect=cv2.getBoundingClientRect();
  const mx=e.clientX-rect.left,my=e.clientY-rect.top;
  S.panX=mx-(mx-S.panX)*f;S.panY=my-(my-S.panY)*f;
  S.zoom=Math.min(5,Math.max(0.15,S.zoom*f));
  draw2d();drawMinimap();
},{passive:false});

function roomAt(sx,sy){
  const floors=S.floor==='both'?['rdc','etage1']:[S.floor];
  let oy=0;
  for(const fid of floors){
    const floor=BD.floors[fid];
    const wx=(sx-S.panX)/S.zoom,wy=(sy-S.panY-oy*S.zoom)/S.zoom;
    for(const room of floor.rooms){
      if(wx>=room.x&&wx<=room.x+room.w&&wy>=room.y&&wy<=room.y+room.h)return{room,floor:fid};
    }
    if(S.floor==='both')oy+=floor.h+60;
  }
  return null;
}

function centerOn(room,fid){
  const W=c2.canvas.width,H=c2.canvas.height;
  const floors=S.floor==='both'?['rdc','etage1']:[S.floor];
  let oy=0;
  for(const f of floors){if(f===fid)break;oy+=BD.floors[f].h+60;}
  S.panX=W/2-(room.x+room.w/2)*S.zoom;
  S.panY=H/2-(room.y+room.h/2+oy)*S.zoom;
  draw2d();drawMinimap();
}

function zoomTo(room,fid,targetZoom){
  const W=c2.canvas.width,H=c2.canvas.height;
  S.zoom=targetZoom;
  const floors=S.floor==='both'?['rdc','etage1']:[S.floor];
  let oy=0;
  for(const f of floors){if(f===fid)break;oy+=BD.floors[f].h+60;}
  S.panX=W/2-(room.x+room.w/2)*S.zoom;
  S.panY=H/2-(room.y+room.h/2+oy)*S.zoom;
  draw2d();drawMinimap();
}

// ── Détail salle ─────────────────────────────────────────────
const typeInfo={
  classroom:{label:'Salle de cours',cap:30,mat:'Matières générales'},
  special:{label:'Salle spéciale',cap:25,mat:'Activités spécialisées'},
  entrance:{label:'Entrée principale',cap:0,mat:'—'},
  stair:{label:'Escalier',cap:0,mat:'—'},
};
function showRoomDetail(room,fid){
  const block=document.getElementById('roomDetailBlock');
  const el=document.getElementById('roomDetail');
  const info=typeInfo[room.type]||typeInfo.classroom;
  block.style.display='block';
  el.innerHTML=`
    <div class="rd-header">
      <div class="rd-icon">${room.icon||'📖'}</div>
      <div><div class="rd-name">Salle ${room.label}</div><div class="rd-floor">${BD.floors[fid].label}</div></div>
    </div>
    <div class="rd-grid">
      <div class="rd-item"><strong>${info.label}</strong><span>Type</span></div>
      <div class="rd-item"><strong>${info.cap||'—'}</strong><span>Capacité</span></div>
    </div>
    <button class="rd-goto" onclick="setRouteDestination('${room.id}','${fid}')">→ Aller ici</button>
  `;
}

function setRouteDestination(roomId,fid){
  const sel=document.getElementById('routeTo');
  const val=JSON.stringify({id:roomId,floor:fid});
  for(const opt of sel.options){if(opt.value===val){sel.value=val;break;}}
}

// ── 3D ───────────────────────────────────────────────────────
function isoP(x,y,z){
  const W=c3.canvas.width,H=c3.canvas.height;
  const rx=x*Math.cos(S.v3yaw)-y*Math.sin(S.v3yaw);
  const ry=x*Math.sin(S.v3yaw)+y*Math.cos(S.v3yaw);
  return{sx:W/2+S.panX+rx*0.72,sy:H/2+S.panY+ry*S.v3pitch-z*0.58};
}

function box3d(x,y,w,h,z,dz,top,front,side){
  const tl=isoP(x,y,z+dz),tr=isoP(x+w,y,z+dz);
  const br=isoP(x+w,y+h,z+dz),bl=isoP(x,y+h,z+dz);
  const bl2=isoP(x,y+h,z),br2=isoP(x+w,y+h,z),tr2=isoP(x+w,y,z);
  const c=c3;
  // top
  c.beginPath();c.moveTo(tl.sx,tl.sy);c.lineTo(tr.sx,tr.sy);c.lineTo(br.sx,br.sy);c.lineTo(bl.sx,bl.sy);c.closePath();
  c.fillStyle=top;c.fill();c.strokeStyle='rgba(0,0,0,0.25)';c.lineWidth=0.7;c.stroke();
  // front
  c.beginPath();c.moveTo(bl.sx,bl.sy);c.lineTo(br.sx,br.sy);c.lineTo(br2.sx,br2.sy);c.lineTo(bl2.sx,bl2.sy);c.closePath();
  c.fillStyle=front;c.fill();c.strokeStyle='rgba(0,0,0,0.25)';c.stroke();
  // side
  c.beginPath();c.moveTo(tr.sx,tr.sy);c.lineTo(br.sx,br.sy);c.lineTo(br2.sx,br2.sy);c.lineTo(tr2.sx,tr2.sy);c.closePath();
  c.fillStyle=side;c.fill();c.strokeStyle='rgba(0,0,0,0.25)';c.stroke();
}

function draw3d(){
  const c=c3,W=c.canvas.width,H=c.canvas.height;
  c.clearRect(0,0,W,H);
  // Fond dégradé
  const grd=c.createLinearGradient(0,0,0,H);
  grd.addColorStop(0,isDark()?'#0d1117':'#dce3ea');
  grd.addColorStop(1,isDark()?'#161b22':'#c8d0d8');
  c.fillStyle=grd;c.fillRect(0,0,W,H);
  if(S.v3mode==='exterior')draw3dExt();
  else{draw3dInt();if(S.route)drawRoute3d();}
}

function drawRoute3d(){
  if(!S.route)return;
  const floorZMap={rdc:0,etage1:160};
  const ox=450,oy=320;
  for(const seg of S.route){
    const fid=seg.floor;
    const floor=BD.floors[fid];
    const z=(floorZMap[fid]||0)+38;
    const nm={};floor.navNodes.forEach(n=>nm[n.id]=n);
    const nodes=seg.nodes.map(id=>nm[id]).filter(Boolean);
    if(nodes.length<2)continue;
    const pts=nodes.map(n=>isoP(n.x-ox,n.y-oy,z));
    c3.save();
    // Halo
    c3.strokeStyle='rgba(47,129,247,0.3)';
    c3.lineWidth=14;c3.lineCap='round';c3.lineJoin='round';
    c3.beginPath();c3.moveTo(pts[0].sx,pts[0].sy);
    pts.slice(1).forEach(p=>c3.lineTo(p.sx,p.sy));c3.stroke();
    // Ligne animée
    c3.strokeStyle='#58a6ff';c3.lineWidth=5;
    c3.setLineDash([12,7]);c3.lineDashOffset=-routeAnimFrame*2;
    c3.shadowColor='#2f81f7';c3.shadowBlur=8;
    c3.beginPath();c3.moveTo(pts[0].sx,pts[0].sy);
    pts.slice(1).forEach(p=>c3.lineTo(p.sx,p.sy));c3.stroke();
    c3.setLineDash([]);c3.shadowBlur=0;
    // Points D / A
    pts.forEach((p,i)=>{
      if(i!==0&&i!==pts.length-1)return;
      const isFirst=i===0;
      const col=isFirst?'#3fb950':'#f85149';
      c3.beginPath();c3.arc(p.sx,p.sy,9,0,Math.PI*2);
      c3.fillStyle=col;c3.shadowColor=col;c3.shadowBlur=15;c3.fill();
      c3.shadowBlur=0;
      c3.font='bold 9px sans-serif';c3.fillStyle='#fff';
      c3.textAlign='center';c3.textBaseline='middle';
      c3.fillText(isFirst?'D':'A',p.sx,p.sy);
    });
    c3.restore();
  }
}

function draw3dInt(){
  const FLOOR_H=160; // hauteur entre étages
  const ROOM_H=42;   // hauteur des blocs salles
  const WALL_H=48;   // hauteur des murs
  const CORR_H=6;    // hauteur des couloirs
  const ox=450,oy=320;

  const floors=S.floor==='both'
    ?[{fid:'rdc',z:0},{fid:'etage1',z:FLOOR_H}]
    :[{fid:S.floor,z:0}];

  for(const{fid,z}of floors){
    const floor=BD.floors[fid];

    // Plancher
    const floorTop=isDark()?'#1a2030':'#c8d4e0';
    const floorFront=isDark()?'#141820':'#b8c4d0';
    box3d(-ox,-oy,floor.w,floor.h,z-4,4,floorTop,floorFront,floorFront);

    // Couloirs (surélevés légèrement)
    for(const cor of floor.corridors){
      const ct=isDark()?'#3a4255':'#a8b4c0';
      const cf=isDark()?'#2e3548':'#98a4b0';
      box3d(cor.x-ox,cor.y-oy,cor.w,cor.h,z,CORR_H,ct,cf,adjCol(cf,-10));
    }

    // Murs intérieurs
    for(const w of(floor.walls||[])){
      const wt=isDark()?'#2a2f3a':'#7a8290';
      const wf=isDark()?'#1e2330':'#6a7280';
      box3d(w.x-ox,w.y-oy,w.w,w.h,z,WALL_H,wt,wf,adjCol(wf,-10));
    }

    // Salles — dessinées avec vraies couleurs et bonne hauteur
    for(const room of floor.rooms){
      const isHL=S.highlight===room.id;
      const isRoute=S.routeFrom?.id===room.id||S.routeTo?.id===room.id;
      let col=room.color||'#6BB5D6';
      if(room.type==='stair') col='#8B5E3C';
      else if(room.type==='entrance') col='#2E8B57';
      if(isHL||isRoute) col='#FFD700';
      const dz=room.type==='stair'?ROOM_H+8:ROOM_H;
      const topCol=adjCol(col,30);
      const frontCol=adjCol(col,-5);
      const sideCol=adjCol(col,-20);
      box3d(room.x-ox,room.y-oy,room.w,room.h,z,dz,topCol,frontCol,sideCol);

      // Label sur le dessus
      const tp=isoP(room.x-ox+room.w/2,room.y-oy+room.h/2,z+dz+1);
      c3.save();
      c3.font=`bold ${Math.max(8,Math.min(11,room.w/5))}px Syne,sans-serif`;
      c3.fillStyle='rgba(0,0,0,0.85)';
      c3.textAlign='center';c3.textBaseline='middle';
      c3.fillText(room.label.split('\n')[0],tp.sx,tp.sy);
      c3.restore();
    }

    // Murs extérieurs épais
    const xs=floor.rooms.map(r=>r.x),ys=floor.rooms.map(r=>r.y);
    const x2s=floor.rooms.map(r=>r.x+r.w),y2s=floor.rooms.map(r=>r.y+r.h);
    const mx=Math.min(...xs)-14,my=Math.min(...ys)-14;
    const mw=Math.max(...x2s)-mx+14,mh=Math.max(...y2s)-my+14;
    const wallCol=isDark()?'#2d333b':'#8c959f';
    const wallDark=isDark()?'#1c2128':'#6e7681';
    // Mur avant bas
    const pa1=isoP(mx-ox,my+mh-oy,z),pa2=isoP(mx+mw-ox,my+mh-oy,z);
    const pa3=isoP(mx+mw-ox,my+mh-oy,z+WALL_H),pa4=isoP(mx-ox,my+mh-oy,z+WALL_H);
    c3.beginPath();c3.moveTo(pa1.sx,pa1.sy);c3.lineTo(pa2.sx,pa2.sy);c3.lineTo(pa3.sx,pa3.sy);c3.lineTo(pa4.sx,pa4.sy);c3.closePath();
    c3.fillStyle=wallCol;c3.fill();c3.strokeStyle='rgba(0,0,0,0.3)';c3.lineWidth=0.8;c3.stroke();
    // Mur droit
    const pb1=isoP(mx+mw-ox,my-oy,z),pb2=isoP(mx+mw-ox,my+mh-oy,z);
    const pb3=isoP(mx+mw-ox,my+mh-oy,z+WALL_H),pb4=isoP(mx+mw-ox,my-oy,z+WALL_H);
    c3.beginPath();c3.moveTo(pb1.sx,pb1.sy);c3.lineTo(pb2.sx,pb2.sy);c3.lineTo(pb3.sx,pb3.sy);c3.lineTo(pb4.sx,pb4.sy);c3.closePath();
    c3.fillStyle=wallDark;c3.fill();c3.strokeStyle='rgba(0,0,0,0.3)';c3.stroke();

    // Label étage flottant
    const labelP=isoP(-ox+floor.w/2,-oy-30,z+WALL_H+10);
    c3.save();
    c3.font='700 13px Syne,sans-serif';
    c3.fillStyle=isDark()?'rgba(88,166,255,0.8)':'rgba(9,105,218,0.8)';
    c3.textAlign='center';c3.textBaseline='middle';
    c3.fillText(floor.label,labelP.sx,labelP.sy);
    c3.restore();
  }
}

function draw3dExt(){
  const W=c3.canvas.width,H=c3.canvas.height;
  // Corps principal bâtiment
  box3d(-360,-240,720,480,0,170,'#d6dde4','#c4ccd4','#b0bac4');
  // Aile gauche
  box3d(-360,-100,100,280,0,130,'#cdd4db','#bcc4cc','#aab4bc');
  // Aile haute
  box3d(-80,-240,160,170,0,130,'#cdd4db','#bcc4cc','#aab4bc');

  // Fenêtres façade
  const wins=[[-280,50],[-180,50],[-80,50],[20,50],[120,50],[-280,130],[-180,130],[-80,130],[20,130]];
  for(const[wx,wy]of wins){
    box3d(wx,-240+480,40,8,80+wy,30,'#7EC8E3','#5BA3BE','#4A8FAD');
  }

  // Porte principale
  box3d(-40,-240+480,80,8,0,55,'#3DB56A','#228B22','#1a6b1a');

  // Toit
  const r1=isoP(-360,-240,170),r2=isoP(360,-240,170);
  const r3=isoP(360,240,170),r4=isoP(-360,240,170);
  const rp=isoP(0,0,230);
  c3.beginPath();c3.moveTo(r1.sx,r1.sy);c3.lineTo(rp.sx,rp.sy);c3.lineTo(r2.sx,r2.sy);
  c3.fillStyle='#90A4AE';c3.fill();c3.strokeStyle='rgba(0,0,0,0.2)';c3.lineWidth=0.8;c3.stroke();
  c3.beginPath();c3.moveTo(r3.sx,r3.sy);c3.lineTo(rp.sx,rp.sy);c3.lineTo(r4.sx,r4.sy);
  c3.fillStyle='#78909C';c3.fill();c3.stroke();
  c3.beginPath();c3.moveTo(r1.sx,r1.sy);c3.lineTo(rp.sx,rp.sy);c3.lineTo(r4.sx,r4.sy);
  c3.fillStyle='#B0BEC5';c3.fill();c3.stroke();

  // Logo GE sur façade
  const logoP=isoP(0,-240+480,120);
  c3.save();c3.font='bold 16px Syne,sans-serif';c3.fillStyle='rgba(47,129,247,0.8)';
  c3.textAlign='center';c3.fillText('GE',logoP.sx,logoP.sy);c3.restore();

  // Label
  c3.save();c3.font='700 14px Syne,sans-serif';c3.fillStyle=isDark()?'#58a6ff':'#0550ae';
  c3.textAlign='center';c3.fillText('Lycée Gustave Eiffel — Ermont',W/2,H-25);c3.restore();
}

// 3D drag
let d3={on:false,x:0,y:0,pa:0,pb:0};
const cv3=document.getElementById('canvas3d');
cv3.addEventListener('mousedown',e=>{d3={on:true,x:e.clientX,y:e.clientY,pa:S.v3pitch,pb:S.v3yaw};});
cv3.addEventListener('mousemove',e=>{if(!d3.on)return;S.v3pitch=Math.max(0.2,Math.min(1,d3.pa+(e.clientY-d3.y)/200));S.v3yaw=d3.pb+(e.clientX-d3.x)/200;draw3d();});
cv3.addEventListener('mouseup',()=>d3.on=false);
cv3.addEventListener('mouseleave',()=>d3.on=false);
cv3.addEventListener('wheel',e=>{e.preventDefault();const f=e.deltaY<0?1.1:0.9;S.panX*=f;S.panY*=f;draw3d();},{passive:false});

// 3D touch
let d3t={on:false,x:0,y:0,pa:0,pb:0};
cv3.addEventListener('touchstart',e=>{e.preventDefault();const t=e.touches[0];d3t={on:true,x:t.clientX,y:t.clientY,pa:S.v3pitch,pb:S.v3yaw};},{passive:false});
cv3.addEventListener('touchmove',e=>{e.preventDefault();if(!d3t.on)return;const t=e.touches[0];S.v3pitch=Math.max(0.2,Math.min(1,d3t.pa+(t.clientY-d3t.y)/200));S.v3yaw=d3t.pb+(t.clientX-d3t.x)/200;draw3d();},{passive:false});
cv3.addEventListener('touchend',()=>d3t.on=false,{passive:true});

document.getElementById('v3ext').addEventListener('click',function(){S.v3mode='exterior';this.classList.add('active');document.getElementById('v3int').classList.remove('active');draw3d();});
document.getElementById('v3int').addEventListener('click',function(){S.v3mode='interior';this.classList.add('active');document.getElementById('v3ext').classList.remove('active');draw3d();});

// ── Minimap ───────────────────────────────────────────────────
function drawMinimap(){
  const c=cm,W=150,H=100;
  c.clearRect(0,0,W,H);
  c.fillStyle=isDark()?'#1a1d26':'#f0f2f5';c.fillRect(0,0,W,H);
  const fid=S.floor==='both'?'rdc':S.floor;
  const floor=BD.floors[fid];
  const sc=Math.min(W/floor.w,H/floor.h)*0.85;
  const ox=(W-floor.w*sc)/2,oy=(H-floor.h*sc)/2;

  // Couloirs
  c.fillStyle=isDark()?'#4a5568':'#b0bac4';
  for(const cor of floor.corridors){
    c.fillRect(ox+cor.x*sc,oy+cor.y*sc,cor.w*sc,cor.h*sc);
  }

  // Salles
  for(const room of floor.rooms){
    c.fillStyle=room.color||'#6BB5D6';
    c.fillRect(ox+room.x*sc,oy+room.y*sc,room.w*sc,room.h*sc);
  }

  // Viewport actuel
  const vx=(-S.panX/S.zoom)*sc+ox;
  const vy=(-S.panY/S.zoom)*sc+oy;
  const vw=(c2.canvas.width/S.zoom)*sc;
  const vh=(c2.canvas.height/S.zoom)*sc;
  c.strokeStyle='#2f81f7';c.lineWidth=1.5;c.strokeRect(vx,vy,vw,vh);

  document.getElementById('minimapLabel').textContent=BD.floors[fid].label;
}

// ── Contrôles header ─────────────────────────────────────────
document.querySelectorAll('.tab[data-floor]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab[data-floor]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');S.floor=btn.dataset.floor;redraw();drawMinimap();
  });
});
document.querySelectorAll('.tab[data-view]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab[data-view]').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');S.view=btn.dataset.view;
    document.getElementById('view2d').classList.toggle('active',S.view==='2d');
    document.getElementById('view3d').classList.toggle('active',S.view==='3d');
    if(S.view==='3d')draw3d();
  });
});
document.getElementById('zoomIn').addEventListener('click',()=>{S.zoom=Math.min(5,S.zoom*1.3);draw2d();drawMinimap();});
document.getElementById('zoomOut').addEventListener('click',()=>{S.zoom=Math.max(0.15,S.zoom/1.3);draw2d();drawMinimap();});
document.getElementById('zoomReset').addEventListener('click',()=>{centerView();});

// ── Recherche ─────────────────────────────────────────────────
function allRooms(){
  const r=[];
  for(const[fid,fl]of Object.entries(BD.floors))
    for(const room of fl.rooms)r.push({...room,floor:fid,floorLabel:fl.label});
  return r;
}

document.getElementById('searchInput').addEventListener('input',function(){
  const q=this.value.trim().toLowerCase();
  const el=document.getElementById('suggestions');
  el.innerHTML='';if(!q)return;
  allRooms().filter(r=>r.label.toLowerCase().includes(q)||r.id.includes(q)).slice(0,8).forEach(r=>{
    const d=document.createElement('div');d.className='sug-item';
    d.innerHTML=`<span>${r.icon||'📖'}</span><span>Salle ${r.label} — ${r.floorLabel}</span>`;
    d.addEventListener('click',()=>{
      S.highlight=r.id;S.floor=r.floor;
      document.querySelectorAll('.tab[data-floor]').forEach(b=>b.classList.toggle('active',b.dataset.floor===r.floor));
      centerOn(r,r.floor);showRoomDetail(r,r.floor);
      el.innerHTML='';this.value='Salle '+r.label;
    });
    el.appendChild(d);
  });
});

// ── Filtre ────────────────────────────────────────────────────
document.querySelectorAll('.filter-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');S.filter=btn.dataset.filter;draw2d();
  });
});

// ── Itinéraire ────────────────────────────────────────────────
function fillSelects(){
  const rooms=allRooms();
  [document.getElementById('routeFrom'),document.getElementById('routeTo')].forEach(sel=>{
    const cur=sel.value;sel.innerHTML='<option value="">— Choisir —</option>';
    rooms.forEach(r=>{
      const o=document.createElement('option');
      o.value=JSON.stringify({id:r.id,floor:r.floor});
      o.textContent=`${r.icon||''} Salle ${r.label} (${r.floorLabel})`;
      sel.appendChild(o);
    });
    sel.value=cur;
  });
}
fillSelects();

document.getElementById('calcRoute').addEventListener('click',()=>{
  const fv=document.getElementById('routeFrom').value;
  const tv=document.getElementById('routeTo').value;
  if(!fv||!tv)return;
  const from=JSON.parse(fv),to=JSON.parse(tv);
  S.routeFrom=from;S.routeTo=to;
  S.route=findPath(from.id,from.floor,to.id,to.floor);
  const ri=document.getElementById('routeInfo');
  if(!S.route||!S.route.length){ri.innerHTML='<span style="color:var(--red)">Aucun chemin trouvé.</span>';ri.classList.add('show');return;}

  const distM=calcDist(S.route);
  const tNorm=Math.round(distM/BD.walkSpeed);
  const tFast=Math.round(distM/1.6);
  const tLate=Math.round(distM/2.2);
  const steps=Math.round(distM*1.4);
  const multiFloor=S.route.length>1;
  const tNormTotal=tNorm+(multiFloor?BD.stairTime:0);
  const tFastTotal=tFast+(multiFloor?10:0);

  // Instructions
  let instructions='';
  const floorOrder=['rdc','etage1'];
  S.route.forEach((seg,si)=>{
    const floor=BD.floors[seg.floor];
    const nm={};floor.navNodes.forEach(n=>nm[n.id]=n);
    const nodes=seg.nodes.map(id=>nm[id]).filter(Boolean);
    if(si===0)instructions+=`<div class="ri-step"><div class="ri-step-num">1</div><span>Départ depuis <b>Salle ${from.id.replace('r','')}</b> (${BD.floors[from.floor].label})</span></div>`;
    nodes.forEach((n,i)=>{
      if(n.stair)instructions+=`<div class="ri-step"><div class="ri-step-num">${i+2}</div><span>🪜 Prendre l'escalier vers <b>${seg.floor==='rdc'?'Étage 1':'RDC'}</b></span></div>`;
    });
    if(si===S.route.length-1)instructions+=`<div class="ri-step"><div class="ri-step-num">🎯</div><span>Arrivée à <b>Salle ${to.id.replace('r','')}</b> (${BD.floors[to.floor].label})</span></div>`;
  });

  ri.innerHTML=`
    <div class="ri-title">Résultats du trajet</div>
    <div class="ri-cards">
      <div class="ri-card"><strong>${Math.round(distM)} m</strong><span>Distance</span></div>
      <div class="ri-card"><strong>~${steps}</strong><span>Pas estimés</span></div>
      <div class="ri-card"><strong>${tNormTotal < 60 ? tNormTotal+'s' : Math.ceil(tNormTotal/60)+'min'}</strong><span>🚶 Normal</span></div>
      <div class="ri-card"><strong>${tFastTotal < 60 ? tFastTotal+'s' : Math.ceil(tFastTotal/60)+'min'}</strong><span>🏃 Pressé</span></div>
    </div>
    ${multiFloor?'<div style="font-size:0.75rem;color:var(--orange);margin-bottom:0.4rem">⚠️ Changement d\'étage requis (+'+BD.stairTime+'s)</div>':''}
    <div class="ri-steps">${instructions}</div>
  `;
  ri.classList.add('show');

  if(S.route.length===1){S.floor=S.route[0].floor;document.querySelectorAll('.tab[data-floor]').forEach(b=>b.classList.toggle('active',b.dataset.floor===S.floor));}
  else{S.floor='both';document.querySelectorAll('.tab[data-floor]').forEach(b=>b.classList.toggle('active',b.dataset.floor==='both'));}
  draw2d();drawMinimap();
});

document.getElementById('clearRoute').addEventListener('click',()=>{
  S.route=null;S.routeFrom=null;S.routeTo=null;
  document.getElementById('routeInfo').classList.remove('show');
  document.getElementById('routeFrom').value='';
  document.getElementById('routeTo').value='';
  draw2d();
});

// ── Admin ─────────────────────────────────────────────────────
document.getElementById('logoBtn').addEventListener('click',()=>{
  if(S.admin)document.getElementById('modalAdmin').classList.add('show');
  else document.getElementById('modalLogin').classList.add('show');
});
document.getElementById('loginCancel').addEventListener('click',()=>document.getElementById('modalLogin').classList.remove('show'));
document.getElementById('loginOk').addEventListener('click',()=>{
  if(document.getElementById('adminUser').value==='admin'&&document.getElementById('adminPass').value==='95120'){
    S.admin=true;
    document.getElementById('modalLogin').classList.remove('show');
    document.getElementById('modalAdmin').classList.add('show');
    document.querySelector('.logo').style.boxShadow='0 0 0 3px #d29922';
  } else document.getElementById('loginErr').textContent='Identifiants incorrects.';
});
document.getElementById('adminClose').addEventListener('click',()=>document.getElementById('modalAdmin').classList.remove('show'));

function openAdminEditor(room,fid){
  S.adminSel=room.id;
  document.getElementById('adminEditor').style.display='block';
  document.getElementById('adminTitle').textContent='Modifier : Salle '+room.label;
  document.getElementById('aLabel').value=room.label;
  document.getElementById('aX').value=room.x;
  document.getElementById('aY').value=room.y;
  document.getElementById('aW').value=room.w;
  document.getElementById('aH').value=room.h;
  document.getElementById('aColor').value=room.color||'#6BB5D6';
  document.getElementById('aFloor').value=fid;
  document.getElementById('modalAdmin').classList.add('show');
  draw2d();
}
document.getElementById('aSave').addEventListener('click',()=>{
  const sid=S.adminSel;if(!sid)return;
  const tf=document.getElementById('aFloor').value;
  for(const fid of['rdc','etage1']){
    const idx=BD.floors[fid].rooms.findIndex(r=>r.id===sid);
    if(idx!==-1){
      const r=BD.floors[fid].rooms[idx];
      r.label=document.getElementById('aLabel').value;
      r.x=+document.getElementById('aX').value;
      r.y=+document.getElementById('aY').value;
      r.w=+document.getElementById('aW').value;
      r.h=+document.getElementById('aH').value;
      r.color=document.getElementById('aColor').value;
      if(fid!==tf){BD.floors[fid].rooms.splice(idx,1);BD.floors[tf].rooms.push(r);}
      break;
    }
  }
  saveRooms();fillSelects();draw2d();
  document.getElementById('modalAdmin').classList.remove('show');S.adminSel=null;
});
document.getElementById('aDel').addEventListener('click',()=>{
  const sid=S.adminSel;if(!sid)return;
  for(const fid of['rdc','etage1']){
    const idx=BD.floors[fid].rooms.findIndex(r=>r.id===sid);
    if(idx!==-1){BD.floors[fid].rooms.splice(idx,1);break;}
  }
  S.adminSel=null;saveRooms();fillSelects();draw2d();
  document.getElementById('modalAdmin').classList.remove('show');
});
document.getElementById('aAdd').addEventListener('click',()=>{
  const fid=S.floor==='both'?'rdc':S.floor;
  const nr={id:'r_'+Date.now(),label:'?',x:300,y:300,w:70,h:65,type:'classroom',color:'#6BB5D6',icon:'📖'};
  BD.floors[fid].rooms.push(nr);saveRooms();fillSelects();openAdminEditor(nr,fid);draw2d();
});

// Fermer modals en cliquant outside
['modalLogin','modalAdmin'].forEach(id=>{
  document.getElementById(id).addEventListener('click',e=>{
    if(e.target===document.getElementById(id))document.getElementById(id).classList.remove('show');
  });
});

// ── Mobile : Drawer & Bottom Bar ─────────────────────────────
const hamburgerBtn = document.getElementById('hamburgerBtn');
const drawerOverlay = document.getElementById('drawerOverlay');
const sidebar = document.querySelector('.sidebar');

function openDrawer(){
  sidebar.classList.add('open');
  drawerOverlay.classList.add('show');
  hamburgerBtn.classList.add('open');
}
function closeDrawer(){
  sidebar.classList.remove('open');
  drawerOverlay.classList.remove('show');
  hamburgerBtn.classList.remove('open');
}
function isMobile(){return window.innerWidth<=768;}

hamburgerBtn.addEventListener('click',()=>{
  if(sidebar.classList.contains('open'))closeDrawer();
  else openDrawer();
});
drawerOverlay.addEventListener('click',closeDrawer);

// Bottom bar actions
const mbbSections = {
  search: document.querySelector('.sb:nth-child(1)'),
  route:  document.querySelector('.sb:nth-child(4)'),
};

document.querySelectorAll('.mbb').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.mbb').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const action = btn.dataset.mbb;
    if(action==='map'){
      closeDrawer();
      return;
    }
    if(action==='search'||action==='route'){
      openDrawer();
      // Scroll vers la section correspondante
      setTimeout(()=>{
        const target = action==='search'
          ? document.getElementById('searchInput')
          : document.getElementById('routeFrom');
        if(target){target.scrollIntoView({behavior:'smooth',block:'nearest'});target.focus();}
      },300);
      return;
    }
    if(action==='floor'){
      // Cycle entre les étages
      const order=['rdc','etage1','both'];
      const idx=order.indexOf(S.floor);
      S.floor=order[(idx+1)%order.length];
      document.querySelectorAll('.tab[data-floor]').forEach(b=>b.classList.toggle('active',b.dataset.floor===S.floor));
      redraw();drawMinimap();
      btn.querySelector('.mbb-icon').textContent=S.floor==='rdc'?'🏠':S.floor==='etage1'?'🏢':'🏗️';
      return;
    }
    if(action==='view'){
      S.view=S.view==='2d'?'3d':'2d';
      document.querySelectorAll('.tab[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===S.view));
      document.getElementById('view2d').classList.toggle('active',S.view==='2d');
      document.getElementById('view3d').classList.toggle('active',S.view==='3d');
      btn.querySelector('.mbb-icon').textContent=S.view==='2d'?'👁':'🗺️';
      if(S.view==='3d')draw3d();
      return;
    }
  });
});

// Fermer le drawer si on passe en desktop
window.addEventListener('resize',()=>{
  if(!isMobile())closeDrawer();
});

// ── Touch events canvas 2D ────────────────────────────────────
let touches={};
let pinchDist0=0,pinchZoom0=1,pinchPanX0=0,pinchPanY0=0;

function getTouchDist(t1,t2){
  return Math.hypot(t2.clientX-t1.clientX,t2.clientY-t1.clientY);
}
function getTouchMid(t1,t2,rect){
  return{x:(t1.clientX+t2.clientX)/2-rect.left,y:(t1.clientY+t2.clientY)/2-rect.top};
}

cv2.addEventListener('touchstart',e=>{
  e.preventDefault();
  S.velX=0;S.velY=0;
  const ts=[...e.touches];
  if(ts.length===1){
    S.isDrag=true;
    S.dragStart={x:ts[0].clientX,y:ts[0].clientY};
    S.panStart={x:S.panX,y:S.panY};
    S.lastDragX=ts[0].clientX;S.lastDragY=ts[0].clientY;
  } else if(ts.length===2){
    S.isDrag=false;
    pinchDist0=getTouchDist(ts[0],ts[1]);
    pinchZoom0=S.zoom;
    pinchPanX0=S.panX;pinchPanY0=S.panY;
    const rect=cv2.getBoundingClientRect();
    const mid=getTouchMid(ts[0],ts[1],rect);
    touches.mid0=mid;
  }
},{passive:false});

cv2.addEventListener('touchmove',e=>{
  e.preventDefault();
  const ts=[...e.touches];
  if(ts.length===1&&S.isDrag){
    S.velX=ts[0].clientX-S.lastDragX;S.velY=ts[0].clientY-S.lastDragY;
    S.lastDragX=ts[0].clientX;S.lastDragY=ts[0].clientY;
    S.panX=S.panStart.x+ts[0].clientX-S.dragStart.x;
    S.panY=S.panStart.y+ts[0].clientY-S.dragStart.y;
    draw2d();drawMinimap();
  } else if(ts.length===2){
    const dist=getTouchDist(ts[0],ts[1]);
    const scale=dist/pinchDist0;
    const newZoom=Math.min(5,Math.max(0.15,pinchZoom0*scale));
    const rect=cv2.getBoundingClientRect();
    const mid=getTouchMid(ts[0],ts[1],rect);
    const mid0=touches.mid0||mid;
    // Zoom centré sur le milieu des deux doigts
    S.panX=mid.sx!==undefined?S.panX:mid0.x-(mid0.x-pinchPanX0)*(newZoom/pinchZoom0);
    S.panY=mid0.y-(mid0.y-pinchPanY0)*(newZoom/pinchZoom0);
    S.panX=mid0.x-(mid0.x-pinchPanX0)*(newZoom/pinchZoom0);
    S.zoom=newZoom;
    draw2d();drawMinimap();
  }
},{passive:false});

cv2.addEventListener('touchend',e=>{
  e.preventDefault();
  const ts=[...e.changedTouches];
  if(e.touches.length===0&&S.isDrag){
    S.isDrag=false;
    const moved=Math.hypot(ts[0].clientX-S.dragStart.x,ts[0].clientY-S.dragStart.y);
    if(moved<8){
      const rect=cv2.getBoundingClientRect();
      const hit=roomAt(ts[0].clientX-rect.left,ts[0].clientY-rect.top);
      if(hit){
        if(S.admin)openAdminEditor(hit.room,hit.floor);
        else{
          S.highlight=hit.room.id;
          showRoomDetail(hit.room,hit.floor);
          centerOn(hit.room,hit.floor);
          draw2d();
          // Sur mobile, ouvrir le drawer pour voir le détail
          if(isMobile())openDrawer();
        }
      } else {
        S.highlight=null;
        document.getElementById('roomDetailBlock').style.display='none';
        draw2d();
      }
    }
  }
  if(e.touches.length<2){
    pinchDist0=0;
  }
},{passive:false});

// Double-tap pour zoomer
let lastTap=0;
cv2.addEventListener('touchend',e=>{
  if(e.touches.length!==0)return;
  const now=Date.now();
  if(now-lastTap<300){
    const rect=cv2.getBoundingClientRect();
    const t=e.changedTouches[0];
    const hit=roomAt(t.clientX-rect.left,t.clientY-rect.top);
    if(hit)zoomTo(hit.room,hit.floor,2.5);
  }
  lastTap=now;
},{passive:true});

// ── Init ─────────────────────────────────────────────────────
function centerView(){
  // Forcer un resize propre d'abord
  const{W,H}=getCanvasSize();
  [c2,c3].forEach(c=>{c.canvas.width=Math.max(W,100);c.canvas.height=Math.max(H,100);});
  const floor=BD.floors[S.floor==='both'?'rdc':S.floor];
  S.zoom=Math.min((W*0.82)/floor.w,(H*0.82)/floor.h);
  S.panX=(W-floor.w*S.zoom)/2;
  S.panY=(H-floor.h*S.zoom)/2;
  draw2d();drawMinimap();
}

// Splash
setTimeout(()=>{
  document.getElementById('splash').classList.add('hide');
  setTimeout(()=>document.getElementById('splash').remove(),400);
},800);

resize();
setTimeout(centerView,100);
