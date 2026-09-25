import {CONFIG} from "../core/config.js";import {state} from "../core/state.js";
const bagUI=document.querySelector("#deathBag"),bagItems=document.querySelector("#bagItems"),bagClose=document.querySelector("#bagClose");
export function syncStats(){document.querySelector("#coins").textContent=Math.round(state.coins);document.querySelector("#drops").textContent=state.drops}
export function closeDeathBag(){state.openBag=null;bagUI.hidden=true}
function renderBag(){if(!state.openBag)return;bagItems.innerHTML="";state.openBag.items.forEach((item,i)=>{const row=document.createElement("button");row.className="bag-item";row.innerHTML=`<span>🪙 Drop recuperável</span><b>+${Math.round(item.value)}</b>`;row.onclick=()=>{state.coins+=item.value;state.drops+=item.qty;state.openBag.items.splice(i,1);syncStats();if(!state.openBag.items.length){state.deathBags=state.deathBags.filter(b=>b!==state.openBag);closeDeathBag()}else renderBag()};bagItems.appendChild(row)})}
function openDeathBag(b){state.openBag=b;state.input.x=state.input.y=0;document.querySelector("#stick").style.transform="";renderBag();bagUI.hidden=false}
bagClose.addEventListener("click",closeDeathBag);
export function updateItems(dt){
 const p=state.player;for(const l of state.loot){l.t-=dt;if(Math.hypot(p.x-l.x,p.y-l.y)<CONFIG.loot.pickupRange){l.got=true;state.coins+=l.value;state.drops++;syncStats()}}state.loot=state.loot.filter(l=>!l.got&&l.t>0);
 if(!state.openBag){const bag=state.deathBags.find(b=>Math.hypot(p.x-b.x,p.y-b.y)<CONFIG.deathBag.openRange);if(bag)openDeathBag(bag)}
}
export function handleDeath(){const p=state.player;if(p.hp>0)return;if(state.drops>0||state.coins>0){const items=[];for(let i=0;i<state.drops;i++)items.push({qty:1,value:state.drops?state.coins/state.drops:0});if(!state.drops&&state.coins>0)items.push({qty:0,value:state.coins});state.deathBags.push({x:p.x,y:p.y,items})}state.coins=state.drops=0;syncStats();p.hp=p.maxHp;p.x=CONFIG.world.width/2;p.y=CONFIG.world.height/2}