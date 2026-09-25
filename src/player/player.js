import {CONFIG} from "../core/config.js";import {state,nowSeconds} from "../core/state.js";
export function updatePlayer(dt){
 const p=state.player,i=state.input,v=state.viewport;
 p.attackCd=Math.max(0,p.attackCd-dt);
 if(!state.openBag&&(i.x||i.y)){const l=Math.hypot(i.x,i.y)||1,dx=i.x/l,dy=i.y/l;p.x+=dx*CONFIG.player.speed*dt;p.y+=dy*CONFIG.player.speed*dt;p.dirX=dx;p.dirY=dy}
 const hw=Math.min(v.w/2,CONFIG.world.width/2),hh=Math.min(v.h/2,CONFIG.world.height/2);
 p.x=Math.max(hw,Math.min(CONFIG.world.width-hw,p.x));p.y=Math.max(hh,Math.min(CONFIG.world.height-hh,p.y));
 const inCombat=state.mobs.some(m=>m.state==="CHASE"||m.state==="ATTACK");
 if(p.hp>0&&p.hp<p.maxHp&&!inCombat&&nowSeconds()-p.lastCombatAt>=CONFIG.player.regenDelay)p.hp=Math.min(p.maxHp,p.hp+CONFIG.player.regenRate*dt);
}
export function attack(){
 const p=state.player;if(p.attackCd>0||state.openBag)return;p.attackCd=CONFIG.player.attackCooldown;
 for(const m of state.mobs){const d=Math.hypot(m.x-p.x,m.y-p.y);if(d<CONFIG.player.attackRange){m.hp-=CONFIG.player.damage;m.hit=.12;m.state="CHASE";m.lastCombatAt=nowSeconds();p.lastCombatAt=nowSeconds();if(m.hp<=0){state.loot.push({x:m.x,y:m.y,r:9,t:CONFIG.loot.life,value:CONFIG.loot.value});m.dead=true}}}
 state.mobs=state.mobs.filter(m=>!m.dead);
}