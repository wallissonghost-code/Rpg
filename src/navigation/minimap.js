import {MapSystem} from "./mapSystem.js";
const VIEW_RADIUS=700;
export function initMinimap(onOpen){const canvas=document.querySelector("#minimapCanvas"),ctx=canvas.getContext("2d"),button=document.querySelector("#minimap");button.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();onOpen()});
 function localPoint(x,y,w,h){const p=MapSystem.playerPosition();return{x:w/2+(x-p.x)/VIEW_RADIUS*w/2,y:h/2+(y-p.y)/VIEW_RADIUS*h/2}}
 function draw(){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle="#17271f";ctx.fillRect(0,0,w,h);ctx.strokeStyle="#ffffff12";ctx.lineWidth=1;for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(w*i/4,0);ctx.lineTo(w*i/4,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,h*i/4);ctx.lineTo(w,h*i/4);ctx.stroke()}
  for(const m of MapSystem.nearbyMarkers()){const q=localPoint(m.x,m.y,w,h);ctx.fillStyle=m.type==="mob"?"#ff5b57":"#e6bd72";ctx.beginPath();ctx.arc(q.x,q.y,m.type==="mob"?3.5:4.5,0,Math.PI*2);ctx.fill()}
  const wp=MapSystem.waypoint();if(wp){const q=localPoint(wp.x,wp.y,w,h);ctx.fillStyle="#ffd75a";ctx.beginPath();ctx.arc(Math.max(6,Math.min(w-6,q.x)),Math.max(6,Math.min(h-6,q.y)),4,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle="#72b8ff";ctx.beginPath();ctx.arc(w/2,h/2,5,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke()}
 return{draw}}
