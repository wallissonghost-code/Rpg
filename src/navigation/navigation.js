import {initMinimap} from "./minimap.js";import {initWorldMap} from "./worldMap.js";import {createCoordinates} from "./coordinates.js";
export function initNavigation(){const worldMap=initWorldMap(),minimap=initMinimap(worldMap.open),coordinates=createCoordinates();return{update(dt){coordinates.update(dt);minimap.draw();worldMap.draw()}}}
