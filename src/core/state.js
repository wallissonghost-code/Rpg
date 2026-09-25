import {CONFIG} from "./config.js";
export const state={
 viewport:{w:innerWidth,h:innerHeight,dpr:1},
 player:{x:CONFIG.world.width/2,y:CONFIG.world.height/2,r:CONFIG.player.radius,hp:CONFIG.player.maxHp,maxHp:CONFIG.player.maxHp,dirX:1,dirY:0,attackCd:0,lastCombatAt:-Infinity},
 camera:{x:0,y:0},input:{x:0,y:0},mobs:[],loot:[],deathBags:[],coins:0,drops:0,openBag:null,mapOpen:false
};
export const nowSeconds=()=>performance.now()/1000;