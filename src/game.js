const canvas=document.querySelector("#canvas"),ctx=canvas.getContext("2d");
let W=0,H=0,dpr=1,last=performance.now();
const WORLD={w:12000,h:12000};
const player={x:WORLD.w/2,y:WORLD.h/2,r:20,hp:100,maxHp:100,speed:220,damage:20,dirX:1,dirY:0,attackCd:0};
const camera={x:0,y:0};
let mobs=[],loot=[],coins=0,drops=0;
const input={x:0,y:0};

function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener("resize",resize);resize();

function makeMob(x,y,pack=0){return{x,y,homeX:x,homeY:y,pack,r:19,hp:60,maxHp:60,speed:46+Math.random()*18,hit:0,aggro:false,wanderA:Math.random()*Math.PI*2,wanderT:Math.random()*4}}
function seedWorld(){
  let pack=1;
  for(let i=0;i<85;i++){
    const group=Math.random()<.55?1:2+Math.floor(Math.random()*5);
    const cx=220+Math.random()*(WORLD.w-440),cy=220+Math.random()*(WORLD.h-440);
    for(let j=0;j<group;j++){const a=Math.random()*Math.PI*2,r=Math.random()*95;mobs.push(makeMob(cx+Math.cos(a)*r,cy+Math.sin(a)*r,pack))}
    pack++;
  }
}
seedWorld();

function attack(){
  if(player.attackCd>0)return;player.attackCd=.38;
  for(const m of mobs){const dx=m.x-player.x,dy=m.y-player.y,d=Math.hypot(dx,dy);if(d<92){m.hp-=player.damage;m.hit=.12;m.aggro=true;if(m.hp<=0){loot.push({x:m.x,y:m.y,r:9,t:30,source:"mob",value:5});m.dead=true}}}
  mobs=mobs.filter(m=>!m.dead);
}
document.querySelector("#attack").addEventListener("pointerdown",e=>{e.preventDefault();attack()});

const joy=document.querySelector("#joystick"),stick=document.querySelector("#stick");let joyId=null;
function joyMove(e){const r=joy.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,len=Math.hypot(dx,dy),max=36,k=len>max?max/len:1;input.x=dx/(len||1);input.y=dy/(len||1);if(len<7)input.x=input.y=0;stick.style.transform=`translate(${dx*k}px,${dy*k}px)`}
joy.addEventListener("pointerdown",e=>{joyId=e.pointerId;joy.setPointerCapture(joyId);joyMove(e)});
joy.addEventListener("pointermove",e=>{if(e.pointerId===joyId)joyMove(e)});
function joyEnd(e){if(e.pointerId!==joyId)return;joyId=null;input.x=input.y=0;stick.style.transform=""}
joy.addEventListener("pointerup",joyEnd);joy.addEventListener("pointercancel",joyEnd);
addEventListener("keydown",e=>{if(e.key===" ")attack();if(e.key==="a"||e.key==="ArrowLeft")input.x=-1;if(e.key==="d"||e.key==="ArrowRight")input.x=1;if(e.key==="w"||e.key==="ArrowUp")input.y=-1;if(e.key==="s"||e.key==="ArrowDown")input.y=1});
addEventListener("keyup",()=>{input.x=input.y=0});

function update(dt){
  player.attackCd=Math.max(0,player.attackCd-dt);
  if(input.x||input.y){const l=Math.hypot(input.x,input.y)||1,dx=input.x/l,dy=input.y/l;player.x+=dx*player.speed*dt;player.y+=dy*player.speed*dt;player.dirX=dx;player.dirY=dy}
  player.x=Math.max(24,Math.min(WORLD.w-24,player.x));player.y=Math.max(24,Math.min(WORLD.h-24,player.y));
  for(const m of mobs){
    const dx=player.x-m.x,dy=player.y-m.y,d=Math.hypot(dx,dy)||1;
    if(d<155)m.aggro=true;
    if(m.aggro){
      if(d>360)m.aggro=false;
      else if(d>42){m.x+=dx/d*m.speed*dt;m.y+=dy/d*m.speed*dt}
      else player.hp=Math.max(0,player.hp-10*dt);
    }else{
      m.wanderT-=dt;
      if(m.wanderT<=0){m.wanderT=1.5+Math.random()*4;m.wanderA=Math.random()*Math.PI*2}
      const hd=Math.hypot(m.x-m.homeX,m.y-m.homeY);
      if(hd>130){m.wanderA=Math.atan2(m.homeY-m.y,m.homeX-m.x)}
      m.x+=Math.cos(m.wanderA)*m.speed*.18*dt;m.y+=Math.sin(m.wanderA)*m.speed*.18*dt;
    }
    m.hit=Math.max(0,m.hit-dt);
  }
  for(const l of loot){if(l.source==="mob")l.t-=dt;if(Math.hypot(player.x-l.x,player.y-l.y)<42){l.got=true;coins+=l.value||5;drops++;document.querySelector("#coins").textContent=Math.round(coins);document.querySelector("#drops").textContent=drops}}
  loot=loot.filter(l=>!l.got&&(l.source==="death"||l.t>0));
  if(player.hp<=0){
    const deathX=player.x,deathY=player.y;
    if(drops>0){const count=drops,totalValue=coins;for(let i=0;i<count;i++){const a=Math.PI*2*i/count,r=18+Math.min(i,5)*5;loot.push({x:deathX+Math.cos(a)*r,y:deathY+Math.sin(a)*r,r:9,t:Infinity,source:"death",value:count?totalValue/count:0})}}
    coins=0;drops=0;document.querySelector("#coins").textContent=0;document.querySelector("#drops").textContent=0;player.hp=100;player.x=WORLD.w/2;player.y=WORLD.h/2;
  }
  camera.x=Math.max(0,Math.min(WORLD.w-W,player.x-W/2));camera.y=Math.max(0,Math.min(WORLD.h-H,player.y-H/2));
  document.querySelector("#hp").style.width=player.hp+"%";document.querySelector("#hpText").textContent=Math.ceil(player.hp)+"/100";
}
function sx(x){return x-camera.x}function sy(y){return y-camera.y}
function visible(x,y,p=80){return x>camera.x-p&&x<camera.x+W+p&&y>camera.y-p&&y<camera.y+H+p}
function draw(){
  ctx.clearRect(0,0,W,H);ctx.fillStyle="#15231d";ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#ffffff0a";ctx.lineWidth=1;
  const gx=Math.floor(camera.x/64)*64,gy=Math.floor(camera.y/64)*64;
  for(let x=gx;x<camera.x+W+64;x+=64){ctx.beginPath();ctx.moveTo(sx(x),0);ctx.lineTo(sx(x),H);ctx.stroke()}
  for(let y=gy;y<camera.y+H+64;y+=64){ctx.beginPath();ctx.moveTo(0,sy(y));ctx.lineTo(W,sy(y));ctx.stroke()}
  for(const l of loot){if(!visible(l.x,l.y))continue;const x=sx(l.x),y=sy(l.y);ctx.fillStyle=l.source==="death"?"#ff9f43":"#f7ca4d";ctx.beginPath();ctx.arc(x,y,l.r,0,7);ctx.fill();ctx.fillStyle="#fff";ctx.font="11px sans-serif";ctx.fillText(l.source==="death"?"SEUS ITENS":"DROP",x-24,y-15)}
  for(const m of mobs){if(!visible(m.x,m.y))continue;const x=sx(m.x),y=sy(m.y);ctx.fillStyle=m.hit?"#fff":m.aggro?"#7bea68":"#6ad35d";ctx.beginPath();ctx.arc(x,y,m.r,0,7);ctx.fill();ctx.fillStyle="#000";ctx.beginPath();ctx.arc(x-7,y-3,2.5,0,7);ctx.arc(x+7,y-3,2.5,0,7);ctx.fill();ctx.fillStyle="#401b1b";ctx.fillRect(x-22,y-31,44,5);ctx.fillStyle="#e54b4b";ctx.fillRect(x-22,y-31,44*(m.hp/m.maxHp),5)}
  const px=sx(player.x),py=sy(player.y);
  if(player.attackCd>.22){ctx.strokeStyle="#ffe47a";ctx.lineWidth=7;ctx.beginPath();ctx.arc(px,py,67,-.8,.8);ctx.stroke()}
  ctx.fillStyle="#59a7ff";ctx.beginPath();ctx.arc(px,py,player.r,0,7);ctx.fill();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(px+player.dirX*11,py+player.dirY*11,4,0,7);ctx.fill();
}
function loop(now){const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);

// Mobile gesture guard: prevent pinch/double-tap zoom on iOS/Android.
document.addEventListener("gesturestart",e=>e.preventDefault(),{passive:false});
document.addEventListener("gesturechange",e=>e.preventDefault(),{passive:false});
document.addEventListener("gestureend",e=>e.preventDefault(),{passive:false});
document.addEventListener("touchmove",e=>{if(e.touches.length>1)e.preventDefault()},{passive:false});
let lastTouchEnd=0;
document.addEventListener("touchend",e=>{const now=Date.now();if(now-lastTouchEnd<=350)e.preventDefault();lastTouchEnd=now},{passive:false});
