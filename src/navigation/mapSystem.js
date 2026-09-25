import {CONFIG} from "../core/config.js";import {state} from "../core/state.js";
const DETECTION_RADIUS=700,WAYPOINT_REACHED_RADIUS=55;
export const MapSystem={
 worldToNormalized(x,y){return{x:Math.max(0,Math.min(1,x/CONFIG.world.width)),y:Math.max(0,Math.min(1,y/CONFIG.world.height))}},
 normalizedToWorld(x,y){return{x:Math.max(0,Math.min(CONFIG.world.width,x*CONFIG.world.width)),y:Math.max(0,Math.min(CONFIG.world.height,y*CONFIG.world.height))}},
 playerPosition(){return{x:state.player.x,y:state.player.y}},
 playerNormalized(){return this.worldToNormalized(state.player.x,state.player.y)},
 worldSize(){return{width:CONFIG.world.width,height:CONFIG.world.height}},
 nearbyMarkers(){const p=state.player,within=e=>Math.hypot(e.x-p.x,e.y-p.y)<=DETECTION_RADIUS;return[
  ...state.mobs.filter(within).map(m=>({type:"mob",x:m.x,y:m.y})),
  ...state.deathBags.filter(within).map(b=>({type:"deathBag",x:b.x,y:b.y}))
 ]},
 setWaypoint(x,y){state.navigation.waypoint=this.normalizedToWorld(x,y)},
 clearWaypoint(){state.navigation.waypoint=null},
 waypoint(){return state.navigation.waypoint},
 updateWaypoint(){const w=state.navigation.waypoint;if(w&&Math.hypot(w.x-state.player.x,w.y-state.player.y)<=WAYPOINT_REACHED_RADIUS)this.clearWaypoint()},
 waypointDirection(){const w=state.navigation.waypoint;if(!w)return null;return Math.atan2(w.y-state.player.y,w.x-state.player.x)}
};