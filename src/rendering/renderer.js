import * as THREE from "three";
import {state} from "../core/state.js";
import {terrainHeight,isTerrainBlocked} from "../world/terrain.js";
import {MapSystem} from "../navigation/mapSystem.js";

const canvas=document.querySelector("#canvas");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;

const scene=new THREE.Scene();scene.background=new THREE.Color(0x14231a);scene.fog=new THREE.Fog(0x14231a,1500,4300);
const camera=new THREE.PerspectiveCamera(42,1,10,9000);
const hemi=new THREE.HemisphereLight(0xbfd3bd,0x182019,1.65);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1cf,2.25);sun.position.set(-900,1500,700);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-1300;sun.shadow.camera.right=1300;sun.shadow.camera.top=1300;sun.shadow.camera.bottom=-1300;scene.add(sun);

const WORLD_SCALE=.72,HEIGHT_SCALE=520,PATCH=3600,SEG=42;
const groundMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.94,metalness:0});
const waterMat=new THREE.MeshStandardMaterial({color:0x285a62,roughness:.38,metalness:.05,transparent:true,opacity:.88});
let terrainMesh=null,waterMesh=null,patchCX=NaN,patchCY=NaN;
const tmpColor=new THREE.Color();
function worldHeight(x,y){return terrainHeight(x,y)*HEIGHT_SCALE}
function terrainColor(h){if(h>.72)return tmpColor.set(0x68745c);if(h>.48)return tmpColor.set(0x526348);if(h>.22)return tmpColor.set(0x3d503b);if(h>.06)return tmpColor.set(0x304433);return tmpColor.set(0x203727)}
function rebuildTerrain(force=false){const p=state.player,cx=Math.floor(p.x/700)*700,cy=Math.floor(p.y/700)*700;if(!force&&cx===patchCX&&cy===patchCY)return;patchCX=cx;patchCY=cy;
 const geo=new THREE.PlaneGeometry(PATCH*WORLD_SCALE,PATCH*WORLD_SCALE,SEG,SEG);geo.rotateX(-Math.PI/2);const pos=geo.attributes.position,colors=new Float32Array(pos.count*3);
 for(let i=0;i<pos.count;i++){const wx=cx+pos.getX(i)/WORLD_SCALE,wy=cy+pos.getZ(i)/WORLD_SCALE,h=terrainHeight(wx,wy);pos.setY(i,h*HEIGHT_SCALE);const col=terrainColor(h);colors[i*3]=col.r;colors[i*3+1]=col.g;colors[i*3+2]=col.b}
 geo.setAttribute("color",new THREE.BufferAttribute(colors,3));geo.computeVertexNormals();
 if(terrainMesh){scene.remove(terrainMesh);terrainMesh.geometry.dispose()}terrainMesh=new THREE.Mesh(geo,groundMat);terrainMesh.position.set(cx*WORLD_SCALE,0,cy*WORLD_SCALE);terrainMesh.receiveShadow=true;scene.add(terrainMesh);
 const wg=new THREE.PlaneGeometry(PATCH*WORLD_SCALE,PATCH*WORLD_SCALE,34,34);wg.rotateX(-Math.PI/2);const wp=wg.attributes.position;for(let i=0;i<wp.count;i++){const wx=cx+wp.getX(i)/WORLD_SCALE,wy=cy+wp.getZ(i)/WORLD_SCALE;wp.setY(i,isTerrainBlocked(wx,wy)?9:-80)}if(waterMesh){scene.remove(waterMesh);waterMesh.geometry.dispose()}waterMesh=new THREE.Mesh(wg,waterMat);waterMesh.position.set(cx*WORLD_SCALE,0,cy*WORLD_SCALE);scene.add(waterMesh)}

function disc(color,r=20){const g=new THREE.CylinderGeometry(r*WORLD_SCALE,r*WORLD_SCALE,30,20);const m=new THREE.MeshStandardMaterial({color,roughness:.65});const o=new THREE.Mesh(g,m);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o}
const player=disc(0x59a7ff,20);const eyeMat=new THREE.MeshBasicMaterial({color:0xffffff});const eye=new THREE.Mesh(new THREE.SphereGeometry(4,10,8),eyeMat);player.add(eye);eye.position.set(0,8,-18);
const mobObjects=new Map(),lootObjects=new Map(),bagObjects=new Map();
function syncObjects(list,map,maker,update){const alive=new Set(list);for(const obj of list){let mesh=map.get(obj);if(!mesh){mesh=maker(obj);map.set(obj,mesh)}update(mesh,obj)}for(const [obj,mesh] of map)if(!alive.has(obj)){scene.remove(mesh);mesh.geometry?.dispose();mesh.material?.dispose();map.delete(obj)}}
function place(mesh,o,lift=0){mesh.position.set(o.x*WORLD_SCALE,worldHeight(o.x,o.y)+lift,o.y*WORLD_SCALE)}

const waypoint=new THREE.Mesh(new THREE.ConeGeometry(10,24,4),new THREE.MeshBasicMaterial({color:0xffd75a}));scene.add(waypoint);
export function resize(){const v=state.viewport;v.dpr=Math.min(devicePixelRatio||1,2);v.w=innerWidth;v.h=innerHeight;renderer.setPixelRatio(v.dpr);renderer.setSize(v.w,v.h,false);camera.aspect=v.w/v.h;camera.updateProjectionMatrix();rebuildTerrain(true)}
export function draw(){rebuildTerrain();const p=state.player;place(player,p,16);player.rotation.y=Math.atan2(p.dirX,p.dirY);eye.position.set(p.dirX*11,8,p.dirY*11);
 syncObjects(state.mobs,mobObjects,()=>disc(0x6ad35d,19),(m,o)=>{place(m,o,15);m.material.color.set(o.hit?0xffffff:(o.state==="CHASE"||o.state==="ATTACK")?0x7bea68:0x6ad35d)});
 syncObjects(state.loot,lootObjects,o=>disc(o.kind==="item"?(o.item?.tone==="mystic"?0xa978d4:0x9aa19d):0xf7ca4d,7),(m,o)=>place(m,o,8));
 syncObjects(state.deathBags,bagObjects,()=>disc(0x8d5a2b,14),(m,o)=>place(m,o,12));
 const a=MapSystem.waypointDirection();if(a===null)waypoint.visible=false;else{waypoint.visible=true;waypoint.position.set((p.x+Math.cos(a)*58)*WORLD_SCALE,worldHeight(p.x,p.y)+34,(p.y+Math.sin(a)*58)*WORLD_SCALE);waypoint.rotation.x=Math.PI}
 const px=p.x*WORLD_SCALE,pz=p.y*WORLD_SCALE,py=worldHeight(p.x,p.y);camera.position.set(px,py+980,pz+1120);camera.lookAt(px,py,pz-160);sun.position.set(px-900,py+1500,pz+700);sun.target.position.set(px,py,pz);scene.add(sun.target);renderer.render(scene,camera)}
export function updateHud(){const p=state.player;document.querySelector("#hp").style.width=(p.hp/p.maxHp*100)+"%";document.querySelector("#hpText").textContent=Math.ceil(p.hp)+"/"+p.maxHp}
