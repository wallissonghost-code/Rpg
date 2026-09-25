import {CONFIG} from "../core/config.js";import {state} from "../core/state.js";
export const MapSystem={
 worldToNormalized(x,y){return{x:Math.max(0,Math.min(1,x/CONFIG.world.width)),y:Math.max(0,Math.min(1,y/CONFIG.world.height))}},
 playerPosition(){return{x:state.player.x,y:state.player.y}},
 playerNormalized(){return this.worldToNormalized(state.player.x,state.player.y)},
 worldSize(){return{width:CONFIG.world.width,height:CONFIG.world.height}},
 markers(){return[]} // Future registry: mobs, players, NPCs, cities, bosses, quests, portals and POIs.
};