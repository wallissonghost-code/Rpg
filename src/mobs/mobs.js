import {CONFIG} from "../core/config.js";import {state,nowSeconds} from "../core/state.js";
function makeMob(x,y,pack){return{x,y,homeX:x,homeY:y,pack,r:CONFIG.mob.radius,hp:CONFIG.mob.maxHp,maxHp:CONFIG.mob.maxHp,speed:CONFIG.mob.minSpeed+Math.random()*(CONFIG.mob.maxSpeed-CONFIG.mob.minSpeed),hit:0,state:"IDLE",attackCd:0,lastCombatAt:-Infinity,wanderA:Math.random()*Math.PI*2,wanderT:Math.random()*4}}
export function seedWorld(){let pack=1;for(let i=0;i<CONFIG.spawn.encounters;i++){const group=Math.random()<.55?1:2+Math.floor(Math.random()*(CONFIG.spawn.maxGroup-1)),cx=220+Math.random()*(CONFIG.world.width-440),cy=220+Math.random()*(CONFIG.world.height-440);for(let j=0;j<group;j++){const a=Math.random()*Math.PI*2,r=Math.random()*95;state.mobs.push(makeMob(cx+Math.cos(a)*r,cy+Math.sin(a)*r,pack))}pack++}}
export function updateMobs(dt){
 if(state.openBag||state.mapOpen||state.inventoryOpen)return;const p=state.player,t=nowSeconds();
 for(const m of state.mobs){m.attackCd=Math.max(0,m.attackCd-dt);m.hit=Math.max(0,m.hit-dt);const dx=p.x-m.x,dy=p.y-m.y,d=Math.hypot(dx,dy)||1,homeDist=Math.hypot(m.x-m.homeX,m.y-m.homeY);
  if((m.state==="IDLE"||m.state==="REGEN")&&d<CONFIG.mob.aggroRange){m.state="CHASE";m.lastCombatAt=t;p.lastCombatAt=t}
  if(m.state==="CHASE"||m.state==="ATTACK"){
   if(homeDist>CONFIG.mob.maxChaseFromHome||d>CONFIG.mob.disengageRange){m.state="RETURN"}
   else if(d>CONFIG.mob.attackRange){m.state="CHASE";m.x+=dx/d*m.speed*dt;m.y+=dy/d*m.speed*dt}
   else{m.state="ATTACK";if(m.attackCd<=0){p.hp=Math.max(0,p.hp-CONFIG.mob.attackDamage);m.attackCd=CONFIG.mob.attackCooldown;m.lastCombatAt=t;p.lastCombatAt=t}}
  }else if(m.state==="RETURN"){
   const hx=m.homeX-m.x,hy=m.homeY-m.y,hd=Math.hypot(hx,hy)||1;
   if(hd<5){m.x=m.homeX;m.y=m.homeY;m.state=m.hp<m.maxHp?"REGEN":"IDLE"}
   else{m.x+=hx/hd*m.speed*CONFIG.mob.returnSpeedMultiplier*dt;m.y+=hy/hd*m.speed*CONFIG.mob.returnSpeedMultiplier*dt}
  }else{
   if(m.hp<m.maxHp&&t-m.lastCombatAt>=CONFIG.mob.regenDelay){m.state="REGEN";m.hp=Math.min(m.maxHp,m.hp+CONFIG.mob.regenRate*dt)}
   if(m.hp>=m.maxHp&&m.state==="REGEN")m.state="IDLE";
   m.wanderT-=dt;if(m.wanderT<=0){m.wanderT=1.5+Math.random()*4;m.wanderA=Math.random()*Math.PI*2}
   if(Math.hypot(m.x-m.homeX,m.y-m.homeY)>CONFIG.mob.wanderRadius)m.wanderA=Math.atan2(m.homeY-m.y,m.homeX-m.x);
   m.x+=Math.cos(m.wanderA)*m.speed*.18*dt;m.y+=Math.sin(m.wanderA)*m.speed*.18*dt;
  }
 }
}