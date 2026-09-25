import {CONFIG} from "../core/config.js";
const CELL=12000,SEED=7319;
function hash(x,y,s=SEED){let n=(x*374761393+y*668265263+s*69069)|0;n=(n^(n>>>13))*1274126177;n^=n>>>16;return(n>>>0)/4294967295}
function region(cx,cy){const r=hash(cx,cy),x=cx*CELL+CELL*(.18+hash(cx,cy,41)*.64),y=cy*CELL+CELL*(.18+hash(cx,cy,97)*.64);if(Math.hypot(x-CONFIG.world.width/2,y-CONFIG.world.height/2)<3500)return null;if(r<.10)return{kind:"water",x,y,rx:1800+hash(cx,cy,7)*2600,ry:1200+hash(cx,cy,11)*1900};if(r<.46)return{kind:"highland",x,y,rx:6200+hash(cx,cy,13)*6500,ry:4800+hash(cx,cy,17)*5200,angle:hash(cx,cy,21)*Math.PI};return null}
function ellipseValue(x,y,f){const c=Math.cos(f.angle||0),s=Math.sin(f.angle||0),dx=x-f.x,dy=y-f.y,rx=dx*c+dy*s,ry=-dx*s+dy*c;return Math.sqrt((rx/f.rx)**2+(ry/f.ry)**2)}
export function terrainHeight(x,y){let h=0;const cx=Math.floor(x/CELL),cy=Math.floor(y/CELL);for(let yy=cy-2;yy<=cy+2;yy++)for(let xx=cx-2;xx<=cx+2;xx++){const f=region(xx,yy);if(!f||f.kind!=="highland")continue;const d=ellipseValue(x,y,f);if(d<1)h=Math.max(h,Math.min(1,(1-d)/.72))}return h}
export function isTerrainBlocked(x,y,pad=0){const cx=Math.floor(x/CELL),cy=Math.floor(y/CELL);for(let yy=cy-2;yy<=cy+2;yy++)for(let xx=cx-2;xx<=cx+2;xx++){const f=region(xx,yy);if(!f||f.kind!=="water")continue;const dx=(x-f.x)/(f.rx+pad),dy=(y-f.y)/(f.ry+pad);if(dx*dx+dy*dy<1)return true}return false}
export function canTraverse(x1,y1,x2,y2,pad=0){if(isTerrainBlocked(x2,y2,pad))return false;const a=terrainHeight(x1,y1),b=terrainHeight(x2,y2);return Math.abs(b-a)<.035}
function mountainPoint(f,a,k=1,jag=.04,seed=0){const n=1+(hash(Math.floor(f.x/97)+Math.floor(a*100),Math.floor(f.y/89)+seed,seed+73)-.5)*jag*2,rx=f.rx*k*n,ry=f.ry*k*n,c=Math.cos(f.angle),s=Math.sin(f.angle),lx=Math.cos(a)*rx,ly=Math.sin(a)*ry;return{x:f.x+lx*c-ly*s,y:f.y+lx*s+ly*c}}
function mountainPath(ctx,f,sx,sy,k=1,jag=.04,seed=0,dy=0){ctx.beginPath();for(let i=0;i<=72;i++){const a=i/72*Math.PI*2,p=mountainPoint(f,a,k,jag,seed),x=sx(p.x),y=sy(p.y)+dy;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath()}
function drawHighland(ctx,f,sx,sy){const cliff=46;
 // Lower cliff face: the visible vertical wall makes the plateau read as raised terrain.
 ctx.save();mountainPath(ctx,f,sx,sy,1,.045,5,cliff);ctx.fillStyle="#18231d";ctx.fill();ctx.restore();
 // Connect the front rim to its lower edge, producing an actual rock wall instead of a floating shadow.
 const rim=[];for(let i=0;i<=36;i++){const a=i/36*Math.PI,p=mountainPoint(f,a,1,.045,5);rim.push(p)}
 ctx.beginPath();for(let i=0;i<rim.length;i++){const p=rim[i];i?ctx.lineTo(sx(p.x),sy(p.y)):ctx.moveTo(sx(p.x),sy(p.y))}for(let i=rim.length-1;i>=0;i--){const p=rim[i];ctx.lineTo(sx(p.x),sy(p.y)+cliff)}ctx.closePath();ctx.fillStyle="#263129";ctx.fill();ctx.strokeStyle="#111a15";ctx.lineWidth=2;ctx.stroke();
 // Broad traversable slope bands. They remain attached to the ground plane.
 const layers=[{k:1,c:"#344536"},{k:.84,c:"#3c4e3c"},{k:.68,c:"#465845"},{k:.52,c:"#50614b"},{k:.38,c:"#596a52"}];
 for(let i=0;i<layers.length;i++){const L=layers[i];mountainPath(ctx,f,sx,sy,L.k,.04,11+i);ctx.fillStyle=L.c;ctx.fill();ctx.strokeStyle="#a6b0952d";ctx.lineWidth=i?2:3;ctx.stroke()}
 // A readable winding ascent painted into the slope.
 ctx.save();ctx.strokeStyle="#756b4c88";ctx.lineWidth=22;ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();for(let i=0;i<7;i++){const t=i/6,a=f.angle+Math.PI*.72+(i%2?-.18:.18),r=.9-i*.09,x=f.x+Math.cos(a)*f.rx*r,y=f.y+Math.sin(a)*f.ry*r;i?ctx.lineTo(sx(x),sy(y)):ctx.moveTo(sx(x),sy(y))}ctx.stroke();ctx.strokeStyle="#a69a6a44";ctx.lineWidth=5;ctx.stroke();ctx.restore();
 // Cliff striations reinforce vertical rock without touching the player sprite.
 ctx.strokeStyle="#11191488";ctx.lineWidth=3;for(let i=0;i<12;i++){const a=.08*Math.PI+i/11*.84*Math.PI,p=mountainPoint(f,a,1,.035,19);ctx.beginPath();ctx.moveTo(sx(p.x),sy(p.y)+4);ctx.lineTo(sx(p.x)+(hash(i,4,81)-.5)*8,sy(p.y)+cliff-5);ctx.stroke()}}
export function drawTerrain(ctx,camera,viewport){const sx=x=>x-camera.x,sy=y=>y-camera.y,startX=Math.floor(camera.x/CELL)-2,endX=Math.ceil((camera.x+viewport.w)/CELL)+2,startY=Math.floor(camera.y/CELL)-2,endY=Math.ceil((camera.y+viewport.h)/CELL)+2;ctx.fillStyle="#18281f";ctx.fillRect(0,0,viewport.w,viewport.h);
 for(let cy=startY;cy<=endY;cy++)for(let cx=startX;cx<=endX;cx++){const x=cx*CELL,y=cy*CELL,t=hash(cx,cy,3);ctx.fillStyle=t<.3?"#1c3023":t<.55?"#203426":t<.76?"#243629":"#1a2c21";ctx.fillRect(sx(x),sy(y),CELL+1,CELL+1)}
 for(let cy=startY;cy<=endY;cy++)for(let cx=startX;cx<=endX;cx++){const f=region(cx,cy);if(!f)continue;if(f.kind==="highland")drawHighland(ctx,f,sx,sy);else{ctx.fillStyle="#244b50";ctx.beginPath();ctx.ellipse(sx(f.x),sy(f.y),f.rx,f.ry,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#668884";ctx.lineWidth=5;ctx.stroke()}}
}

export function drawWorldMapTerrain(ctx,w,h){const cols=150,rows=Math.max(70,Math.round(cols*(CONFIG.world.height/CONFIG.world.width)*(h/w))),cw=w/cols,ch=h/rows;ctx.fillStyle="#1d3325";ctx.fillRect(0,0,w,h);
 const heightGrid=Array.from({length:rows},()=>new Float32Array(cols));const waterGrid=Array.from({length:rows},()=>new Uint8Array(cols));
 for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++){const wx=(gx+.5)/cols*CONFIG.world.width,wy=(gy+.5)/rows*CONFIG.world.height,hgt=terrainHeight(wx,wy),water=isTerrainBlocked(wx,wy,0);heightGrid[gy][gx]=hgt;waterGrid[gy][gx]=water?1:0;ctx.fillStyle=water?"#285a62":hgt>.72?"#68745c":hgt>.48?"#536348":hgt>.22?"#3d503b":hgt>.06?"#304433":"#203727";ctx.fillRect(gx*cw,gy*ch,cw+1,ch+1)}
 // Local contour edges only: never connect unrelated elevation samples.
 ctx.lineWidth=1;for(const level of [.22,.48,.72]){ctx.strokeStyle=level>.7?"#c0c7a555":"#a5b18c3d";ctx.beginPath();for(let gy=0;gy<rows-1;gy++)for(let gx=0;gx<cols-1;gx++){const a=heightGrid[gy][gx],right=heightGrid[gy][gx+1],down=heightGrid[gy+1][gx];if((a-level)*(right-level)<0){const x=(gx+1)*cw,y=(gy+.5)*ch;ctx.moveTo(x,y-ch*.45);ctx.lineTo(x,y+ch*.45)}if((a-level)*(down-level)<0){const x=(gx+.5)*cw,y=(gy+1)*ch;ctx.moveTo(x-cw*.45,y);ctx.lineTo(x+cw*.45,y)}}ctx.stroke()}
 // Smooth water borders so lakes read as coherent regions.
 ctx.strokeStyle="#6b929255";ctx.lineWidth=1.2;ctx.beginPath();for(let gy=0;gy<rows;gy++)for(let gx=0;gx<cols;gx++)if(waterGrid[gy][gx]){const x=gx*cw,y=gy*ch;if(!waterGrid[gy]?.[gx-1]){ctx.moveTo(x,y);ctx.lineTo(x,y+ch)}if(!waterGrid[gy]?.[gx+1]){ctx.moveTo(x+cw,y);ctx.lineTo(x+cw,y+ch)}if(!waterGrid[gy-1]?.[gx]){ctx.moveTo(x,y);ctx.lineTo(x+cw,y)}if(!waterGrid[gy+1]?.[gx]){ctx.moveTo(x,y+ch);ctx.lineTo(x+cw,y+ch)}}ctx.stroke()}
