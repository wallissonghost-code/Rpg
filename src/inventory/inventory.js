import {state} from "../core/state.js";
const CAPACITY=40;
export function initInventory(){
 const panel=document.querySelector("#inventoryPanel"),open=document.querySelector("#inventoryOpen"),close=document.querySelector("#inventoryClose"),grid=document.querySelector("#inventoryGrid"),count=document.querySelector("#inventoryCount");
 for(let i=0;i<CAPACITY;i++){const slot=document.createElement("div");slot.className="inventory-slot";slot.dataset.slot=i;grid.appendChild(slot)}
 function sync(){const slots=grid.children,used=Math.min(state.drops,CAPACITY);count.textContent=used;for(let i=0;i<CAPACITY;i++){const filled=i<used,s=slots[i];s.classList.toggle("filled",filled);s.innerHTML=filled?'<span class="item-mark"></span><b class="item-qty">1</b>':""}}
 function setOpen(value){state.inventoryOpen=value;state.input.x=state.input.y=0;document.querySelector("#stick").style.transform="";panel.hidden=!value;if(value)sync()}
 open.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();if(state.openBag||state.mapOpen)return;setOpen(true)});
 close.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();setOpen(false)});
 panel.addEventListener("pointerdown",e=>{if(e.target===panel)setOpen(false)});
 return{sync,close:()=>setOpen(false)}
}
