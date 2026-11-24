;(()=>{
const status=document.getElementById("renderStatus"),viewport=document.getElementById("viewport");
let canvas3=null,view=null,wanted=true;
const btn=(id,fn)=>document.getElementById(id).onclick=fn;
function fallback(){window.city3DActive=false;if(canvas3)canvas3.hidden=true;status.textContent="CITY VIEW · 2D MODE";document.getElementById("viewToggle").textContent="Enable 3D"}
btn("viewToggle",()=>{wanted=!wanted;if(view){if(wanted){canvas3.hidden=false;window.city3DActive=true;status.textContent="ATLAS BAY · REALTIME 3D";document.getElementById("viewToggle").textContent="2D view"}else fallback()}else{wanted=true;status.textContent="3D unavailable · 2D mode"}});
async function boot(){
let T;
try{T=await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js")}catch(e){try{T=await import("https://unpkg.com/three@0.170.0/build/three.module.js")}catch(e2){fallback();return}}
try{
const scene=new T.Scene(), camera=new T.PerspectiveCamera(43,1,.1,180);
const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});
canvas3=renderer.domElement;canvas3.id="city3d";canvas3.setAttribute("aria-label","Interactive 3D city, drag to orbit or click to inspect");canvas3.tabIndex=0;viewport.insertBefore(canvas3,viewport.children[1]);
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
scene.background=new T.Color("#9dbccd");scene.fog=new T.FogExp2("#9dbccd",.013);
const sky=new T.HemisphereLight("#d8edff","#64765e",2.15);scene.add(sky);
const sun=new T.DirectionalLight("#fff1d2",3.1);sun.position.set(-12,24,15);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-13;sun.shadow.camera.right=13;sun.shadow.camera.top=13;sun.shadow.camera.bottom=-13;sun.shadow.camera.near=1;sun.shadow.camera.far=65;sun.shadow.normalBias=.035;sun.shadow.bias=-.0001;scene.add(sun);
const fill=new T.DirectionalLight("#8bb8ff",.6);fill.position.set(10,6,-12);scene.add(fill);
const mat=(color,opts={})=>new T.MeshStandardMaterial({color,roughness:.83,...opts});
const materials={land:mat("#8a9b79"),lawn:mat("#74936b"),grass:mat("#91a57c"),pavement:mat("#b2b1a2"),road:mat("#555e65"),line:mat("#e2d9b8"),white:mat("#f2f0e5"),soil:mat("#8a7e6d"),rock:mat("#8c9998"),sand:mat("#c3b493"),roof:mat("#595e67"),roofRed:mat("#ad6552"),roofBlue:mat("#567786"),wall:mat("#cfc7b5"),cream:mat("#e7d9bf"),stone:mat("#a7adae"),concrete:mat("#a8b4ba"),glass:mat("#4b788a",{roughness:.28,metalness:.35}),glass2:mat("#79a7bc",{roughness:.32,metalness:.3}),darkglass:mat("#384d58",{roughness:.4,metalness:.2}),window:mat("#a9c7ce",{roughness:.36,metalness:.12,emissive:"#233941",emissiveIntensity:.18}),lit:mat("#f1d9aa",{emissive:"#ffba65",emissiveIntensity:.25}),frame:mat("#52626b"),shop:mat("#cba36d"),clinic:mat("#dce6e5"),red:mat("#b95555"),tree:mat("#50774e"),tree2:mat("#6a9559"),trunk:mat("#665443"),metal:mat("#899499",{metalness:.45,roughness:.48}),solar:mat("#254b65",{metalness:.5,roughness:.28}),water:mat("#42839f",{metalness:.32,roughness:.35}),wave:mat("#a6d9e4",{transparent:true,opacity:.26}),carRed:mat("#bf5352"),carWhite:mat("#f2f1e8"),carBlue:mat("#527faa"),carBlack:mat("#363e49"),person:mat("#edd4a9"),personWork:mat("#537db0"),personShop:mat("#d6a451"),personPark:mat("#599b72"),marker:mat("#fbe095",{emissive:"#ffb951",emissiveIntensity:1.1})};
const geos={box:new T.BoxGeometry(1,1,1),tree:new T.IcosahedronGeometry(1,1),sphere:new T.SphereGeometry(1,8,6),cone:new T.ConeGeometry(1,1,5),cylinder:new T.CylinderGeometry(1,1,1,8)};
const dummy=new T.Object3D(), city=new T.Group();scene.add(city);
let batches=new Map(),signature="",agentMesh=null,carMeshes=[],waves=[],n=13,center=n/2;
const rnd=(id,k=0)=>{let v=Math.sin(id*127.1+k*311.7+2.4)*43758.5453;return v-Math.floor(v)};
function add(key,x,y,z,sx,sy,sz,ry=0,geometry="box",rx=0){const k=key+"|"+geometry;if(!batches.has(k))batches.set(k,{key,geometry,items:[]});batches.get(k).items.push([x-center,y,z-center,sx,sy,sz,ry,rx])}
function bake(){for(let b of batches.values()){const mesh=new T.InstancedMesh(geos[b.geometry],materials[b.key],b.items.length);let i=0;for(let a of b.items){dummy.position.set(a[0],a[1],a[2]);dummy.scale.set(a[3],a[4],a[5]);dummy.rotation.set(a[7],a[6],0);dummy.updateMatrix();mesh.setMatrixAt(i++,dummy.matrix)}mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=!["window","lit","line","wave","water","land","pavement","road","lawn","grass","sand"].includes(b.key);mesh.receiveShadow=!["window","lit","wave"].includes(b.key);city.add(mesh)}batches.clear()}
function tree(x,z,id,size=.21){add("trunk",x,.11,z,.035,.22,.035,0,"cylinder");add(id%2?"tree":"tree2",x,.27,z,size,.22+size*.5,size,rnd(id)*6,"tree");add("tree2",x-.07,.34,z,size*.6,.16,size*.6,0,"tree")}
function windows(x,z,h,w,d,id,office=false){const floors=Math.max(1,Math.floor(h/.19));const cols=office?5:3;for(let j=0;j<floors;j++){let y=.16+j*.18;if(y>h-.07)continue;for(let i=0;i<cols;i++){let pos=-w*.39+i*w*.78/Math.max(1,cols-1),zz=-d*.39+i*d*.78/Math.max(1,cols-1),k=rnd(id,j*19+i+10)>.72?"lit":"window";add(k,x+pos,y,z+d/2+.006,w/(cols+1)*.78,.105,.014);add(k,x+pos,y,z-d/2-.006,w/(cols+1)*.78,.105,.014);add(k,x+w/2+.006,y,z+zz,.014,.105,d/(cols+1)*.78);add(k,x-w/2-.006,y,z+zz,.014,.105,d/(cols+1)*.78)}}}
function building(t){let x=t.x+.5,z=t.y+.5,id=t.id,k=t.type,r=t.style||rnd(id),w=.68,d=.68,h=.55+r*.35;let wall=id%3===0?"cream":id%3===1?"wall":"concrete";
add("pavement",x,.012,z,.94,.045,.94);
if(k==="home"){
 if(r>.57){h=.89+r*.66;w=.73;d=.62;add(wall,x,h/2+.045,z,w,h,d);windows(x,z,h,w,d,id);for(let j=1;j<Math.floor(h/.19);j++)add("stone",x,j*.19,z+d/2+.035,w+.025,.025,.075);add("roof",x,h+.065,z,w+.06,.065,d+.07);add("metal",x+.12,h+.13,z-.13,.18,.12,.18)}
 else{w=.67;d=.66;h=.43+r*.44;add(wall,x,h/2+.04,z,w,h,d);windows(x,z,h,w,d,id);const roof=id%2?"roofRed":"roofBlue";add(roof,x-.17,h+.105,z,.40,.055,d+.12,0,"box",0);add(roof,x+.17,h+.105,z,.40,.055,d+.12);add(roof,x,h+.16,z,.11,.13,d+.10);add("darkglass",x,.13,z+d/2+.015,.12,.22,.025);add("stone",x+.19,h+.18,z-.2,.08,.20,.08);tree(x-.38,z+.34,id,.11)}
} else if(k==="office"){
 h=1.2+r*1.95;w=.66;d=.70;add("stone",x,.15,z,.83,.26,.83);add("glass",x,h/2+.18,z,w,h,d);windows(x,z,h+.10,w,d,id,true);for(let j=1;j<Math.floor(h/.23);j++){add("frame",x,j*.23+.12,z,w+.018,.018,d+.018)}for(let i=-2;i<=2;i++){add("concrete",x+i*.125,h/2+.19,z+d/2+.013,.019,h,.024);add("concrete",x+w/2+.013,h/2+.19,z+i*.125,.024,h,.019)}add("concrete",x,h+.19,z,w+.025,.10,d+.025);add("roof",x+.08,h+.30,z-.04,.33,.20,.31);if(r>.7)add("metal",x,h+.52,z,.025,.45,.025);add("glass2",x,.13,z+d/2+.015,.28,.24,.025);
} else if(k==="shop"){
 h=.38+r*.34;w=.75;d=.72;add("shop",x,h/2+.04,z,w,h,d);windows(x,z,h,w,d,id);add("roof",x,h+.05,z,w+.06,.055,d+.06);add("darkglass",x,.17,z+d/2+.015,w*.85,.25,.022);for(let i=0;i<6;i++)add(i%2?"white":"red",x-w*.42+i*w*.17,.32,z+d/2+.09,w*.17,.045,.18);add("cream",x,h+.025,z+d/2+.025,.45,.12,.04);
} else if(k==="clinic"){
 h=.73+r*.25;w=.77;d=.69;add("clinic",x,h/2+.04,z,w,h,d);windows(x,z,h,w,d,id,true);add("stone",x,h+.055,z,w+.055,.065,d+.055);add("red",x,h*.7,z+d/2+.025,.055,.22,.035);add("red",x,h*.7,z+d/2+.025,.22,.055,.035);add("glass",x,.14,z+d/2+.035,.23,.24,.04);
} else if(k==="factory"){
 h=.40+r*.22;w=.75;d=.76;add("concrete",x,h/2+.04,z,w,h,d);add("roof",x,h+.045,z,w+.03,.07,d+.03);for(let i=0;i<3;i++)add("solar",x-.22+i*.22,h+.09,z,.17,.026,.37);add("darkglass",x,.18,z+d/2+.014,.34,.30,.025);add("stone",x+.26,h+.21,z-.26,.105,.43,.105,0,"cylinder");add("metal",x+.26,h+.45,z-.26,.13,.045,.13,0,"cylinder");windows(x,z,h,w,d,id);
}}
function road(t){let x=t.x+.5,z=t.y+.5,ns=t.x===3||t.x===8,ew=t.y===3||t.y===8;add("road",x,.008,z,1,.025,1);
if(ns&&!ew){for(let j=-1;j<=1;j++)add("line",x,.025,z+j*.33,.019,.006,.16);for(let a of [-.43,.43])add("pavement",x+a,.035,z,.09,.055,1)}
if(ew&&!ns){for(let j=-1;j<=1;j++)add("line",x+j*.33,.025,z,.16,.006,.019);for(let a of [-.43,.43])add("pavement",x,.035,z+a,1,.055,.09)}
if(ns&&ew){for(let i=0;i<6;i++){add("white",x-.29+i*.115,.028,z-.40,.055,.006,.12);add("white",x-.40,.028,z-.29+i*.115,.12,.006,.055)}}
if(t.id%3===0){add("metal",x+.43,.25,z+.42,.023,.50,.023);add("metal",x+.36,.49,z+.42,.16,.025,.03);add("lit",x+.31,.465,z+.42,.08,.025,.05)}}
function rebuild(){
while(city.children.length){const obj=city.children[0];city.remove(obj);if(obj.isInstancedMesh)obj.dispose()}
batches.clear();
add("water",6.5,-.49,6.5,135,.15,135);add("rock",6.5,-.27,6.5,14.05,.40,14.05);add("sand",6.5,-.08,6.5,13.72,.15,13.72);add("land",6.5,-.04,6.5,13.02,.09,13.02);
for(let k=0;k<52;k++){let x=-12+rnd(k,41)*37,z=-12+rnd(k,42)*37;if(x>-1&&x<14&&z>-1&&z<14)continue;add("wave",x,-.405,z,.4+rnd(k,43)*1.5,.009,.025)}
for(let i=0;i<13;i++){add("pavement",i+.5,.007,13.22,.96,.045,.28);add("pavement",-.22,.007,i+.5,.28,.045,.96);if(i%2===0){tree(i+.5,13.23,i+200,.13);tree(-.23,i+.5,i+210,.13)}}
for(let t of game.state.tiles){let x=t.x+.5,z=t.y+.5;if(t.type==="road")road(t);else if(t.type==="park"){add("lawn",x,.018,z,.96,.035,.96);add("pavement",x,.041,z,.13,.015,.86);add("pavement",x,.041,z,.85,.015,.13);for(let j=0;j<3;j++)tree(x+(-1+j)*.28,z+(j%2?.28:-.28),t.id*3+j,.16);add("stone",x+.22,.08,z+.12,.20,.06,.08);if(t.id%3===0)add("water",x-.25,.048,z+.25,.27,.018,.27,0,"cylinder")}
else if(t.type==="empty"){add("grass",x,.016,z,.96,.035,.96);if(t.style>.55)tree(x+.25,z-.18,t.id,.14);add("pavement",x,.021,z-.44,.9,.014,.045)}
else building(t)}
// A small marina, promenade and offshore landforms are scenic, not buildable plots.
for(let i=0;i<3;i++){add("soil",2.7+i*.8,-.10,14.0,.12,.15,1.2);add("pavement",2.7+i*.8,-.025,14,.22,.07,1.2);add("white",3.0+i*.8,-.21,14.12,.22,.13,.54);add("darkglass",3.0+i*.8,-.12,14.12,.15,.10,.23)}
for(let i=0;i<18;i++){let x=-25+i*3.6,z=-27+rnd(i,9)*4;add("tree",x,-1,z,3+rnd(i,5)*3,2+rnd(i,8)*4,4,0,"tree")}
bake();signature=game.state.tiles.map(t=>t.type+":"+t.style).join("|");
}
rebuild();
const agentCapacity=3000;
agentMesh=new T.InstancedMesh(geos.sphere,mat("#ffffff",{roughness:.8}),agentCapacity);agentMesh.count=0;agentMesh.frustumCulled=false;agentMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);scene.add(agentMesh);
const colors={Working:new T.Color("#88b8ff"),Shopping:new T.Color("#ffd078"),Socializing:new T.Color("#80e0a0"),Resting:new T.Color("#c8d8de"),Healthcare:new T.Color("#f29da9")};const defaultColor=new T.Color("#f4e2bc");
const marker=new T.Mesh(new T.RingGeometry(.27,.32,40),materials.marker);marker.rotation.x=-Math.PI/2;marker.position.y=.065;marker.visible=false;scene.add(marker);
for(let i=0;i<20;i++){const group=new T.Group(),body=new T.Mesh(geos.box,materials[["carRed","carWhite","carBlue","carBlack"][i%4]]);body.scale.set(.16,.085,.31);body.position.y=.085;body.castShadow=true;group.add(body);const cabin=new T.Mesh(geos.box,materials.darkglass);cabin.scale.set(.125,.065,.15);cabin.position.set(0,.15,-.015);group.add(cabin);for(let k of [-1,1]){const lamp=new T.Mesh(geos.box,materials.lit);lamp.scale.set(.045,.028,.014);lamp.position.set(k*.05,.09,.161);group.add(lamp)}scene.add(group);carMeshes.push(group)}
let az=Math.PI*.23,elev=.68,dist=22,tx=0,tz=0,drag=null,last=performance.now(),trafficTime=0,lightMode=document.getElementById("lightMode"),ray=new T.Raycaster(),plane=new T.Plane(new T.Vector3(0,1,0),-.025),hit=new T.Vector3(),v=new T.Vector3();
function cameraUpdate(){camera.position.set(tx+Math.cos(az)*Math.cos(elev)*dist,Math.sin(elev)*dist,tz+Math.sin(az)*Math.cos(elev)*dist);camera.lookAt(tx,0,tz)}
function resetCamera(){az=Math.PI*.23;elev=.68;dist=renderer.domElement.clientWidth<560?28:22;tx=0;tz=0}
function zoom(f){dist=Math.max(7,Math.min(43,dist*f))}
btn("camLeft",()=>az-=Math.PI/6);btn("camRight",()=>az+=Math.PI/6);btn("camReset",resetCamera);btn("camPlus",()=>zoom(.82));btn("camMinus",()=>zoom(1.22));
canvas3.addEventListener("wheel",e=>{e.preventDefault();zoom(Math.exp(e.deltaY*.001))},{passive:false});
canvas3.addEventListener("contextmenu",e=>e.preventDefault());
canvas3.addEventListener("pointerdown",e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,pan:e.button===2||e.shiftKey};canvas3.setPointerCapture(e.pointerId)});
canvas3.addEventListener("pointermove",e=>{if(!drag)return;let dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(drag.pan){tx+=(-Math.sin(az)*dx+Math.cos(az)*dy)*dist*.0017;tz+=(Math.cos(az)*dx+Math.sin(az)*dy)*dist*.0017;tx=Math.max(-8,Math.min(8,tx));tz=Math.max(-8,Math.min(8,tz))}else{az-=dx*.008;elev=Math.max(.22,Math.min(1.35,elev+dy*.006))}drag.x=e.clientX;drag.y=e.clientY});
canvas3.addEventListener("pointercancel",()=>drag=null);
canvas3.addEventListener("pointerup",e=>{if(!drag)return;let d=drag;drag=null;if(d.pan||Math.hypot(e.clientX-d.sx,e.clientY-d.sy)>5)return;let rect=canvas3.getBoundingClientRect(),px=e.clientX-rect.left,py=e.clientY-rect.top;ray.setFromCamera({x:px/rect.width*2-1,y:-(py/rect.height)*2+1},camera);if(!ray.ray.intersectPlane(plane,hit))return;let x=Math.floor(hit.x+center),z=Math.floor(hit.z+center);let id=x>=0&&z>=0&&x<n&&z<n?z*n+x:null;
if(buildMode){if(id!==null){if(game.build(id,buildMode)){selected={type:"tile",id};notify("Construction complete.");refresh()}else notify("Choose a vacant plot with sufficient funds.")}return}
let near=null,best=11;for(let a of game.state.agents){v.set(a.x-center,.16,a.y-center).project(camera);if(v.z>1)continue;let delta=Math.hypot((v.x+1)*rect.width/2-px,(1-v.y)*rect.height/2-py);if(delta<best){best=delta;near=a}}
if(near)selected={type:"agent",id:near.id};else{let closest=Infinity,picked=null;const box=new T.Box3(),p=new T.Vector3();for(const t of game.state.tiles){let r=t.style||rnd(t.id),height=t.type==="office"?1.5+r*1.95:t.type==="home"?(r>.57?.99+r*.66:.66+r*.44):t.type==="shop"?.50+r*.34:t.type==="clinic"?.84+r*.25:t.type==="factory"?.9+r*.22:0;if(!height)continue;box.min.set(t.x+.10-center,0,t.y+.10-center);box.max.set(t.x+.90-center,height,t.y+.90-center);if(ray.ray.intersectBox(box,p)){let d=ray.ray.origin.distanceTo(p);if(d<closest){closest=d;picked=t.id}}}if(picked!==null||id!==null)selected={type:"tile",id:picked!==null?picked:id}}refresh()});
const daySky=new T.Color("#a6c7db"),nightSky=new T.Color("#132039"),goldSky=new T.Color("#e8b795"),targetSky=new T.Color();
function animate(now){requestAnimationFrame(animate);if(!window.city3DActive){last=now;return}try{
let dt=Math.min(.06,(now-last)/1000);last=now;let rect=viewport.getBoundingClientRect();let W=Math.max(1,rect.width),H=Math.max(1,rect.height);if(renderer.domElement.clientWidth!==Math.round(W)||renderer.domElement.clientHeight!==Math.round(H)||Math.abs(camera.aspect-W/H)>.005){renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix()}
let sig=game.state.tiles.map(t=>t.type+":"+t.style).join("|");if(sig!==signature)rebuild();
let hour=lightMode.value==="day"?13:lightMode.value==="night"?23:game.state.hour;let daylight=Math.max(0,Math.sin((hour-6)/12*Math.PI)),twilight=Math.max(0,1-Math.min(Math.abs(hour-6),Math.abs(hour-18))/2.5);targetSky.copy(nightSky).lerp(daySky,Math.min(1,daylight*1.7+.15*twilight)).lerp(goldSky,twilight*.48);scene.background.lerp(targetSky,.055);scene.fog.color.copy(scene.background);sky.intensity=.5+daylight*1.65;sun.intensity=.06+daylight*3.1+twilight*.8;sun.color.set("#fff1d5").lerp(new T.Color("#ff9a5e"),twilight*.6);sun.position.set(Math.cos((hour-6)/12*Math.PI)*18,5+daylight*23,12);materials.lit.emissiveIntensity=.25+(1-daylight)*2.3;materials.window.emissiveIntensity=.08+(1-daylight)*.35;materials.water.color.set("#244961").lerp(new T.Color("#5b9cb7"),daylight);fill.intensity=.35+daylight*.35;
let aa=game.state.agents;agentMesh.count=Math.min(aa.length,agentCapacity);
for(let i=0;i<agentMesh.count;i++){let a=aa[i],t=game.state.tiles[a.target];if(!t)continue;let ox=.18+(a.id*17%67)/100,oz=.17+(a.id*31%63)/100;let q=1-Math.exp(-dt*5);a.x+=(t.x+ox-a.x)*q;a.y+=(t.y+oz-a.y)*q;dummy.position.set(a.x-center,.095,a.y-center);dummy.rotation.set(0,0,0);dummy.scale.set(.047,.10,.047);dummy.updateMatrix();agentMesh.setMatrixAt(i,dummy.matrix);agentMesh.setColorAt(i,colors[a.action]||defaultColor)}agentMesh.instanceMatrix.needsUpdate=true;if(agentMesh.instanceColor)agentMesh.instanceColor.needsUpdate=true;
trafficTime+=dt*(speed?Math.min(speed,3):0);carMeshes.forEach((c,i)=>{let horizontal=i%2===0,lane=i%4<2?3:8,dir=i%3===0?-1:1,p=((trafficTime*(.42+i%3*.09)+i*1.71)%13);if(dir<0)p=13-p;if(horizontal){c.position.set(p-center,.03,lane+.5-center+dir*.19);c.rotation.y=dir*Math.PI/2}else{c.position.set(lane+.5-center-dir*.19,.03,p-center);c.rotation.y=dir<0?Math.PI:0}});
marker.visible=!!selected;if(selected){if(selected.type==="tile"){let t=game.state.tiles[selected.id];if(t)marker.position.set(t.x+.5-center,.065,t.y+.5-center)}else{let a=aa.find(x=>x.id===selected.id);if(a)marker.position.set(a.x-center,.065,a.y-center);else marker.visible=false}}
cameraUpdate();renderer.render(scene,camera)
}catch(e){console.warn("3D rendering fell back to 2D",e);fallback()}}
view={renderer};resetCamera();window.city3DActive=wanted;canvas3.hidden=!wanted;status.textContent=wanted?"ATLAS BAY · REALTIME 3D":"CITY VIEW · 2D MODE";document.getElementById("viewToggle").textContent=wanted?"2D view":"Enable 3D";canvas3.addEventListener("webglcontextlost",e=>{e.preventDefault();fallback()});requestAnimationFrame(animate)
}catch(e){console.warn("3D initialization failed",e);fallback()}
}
boot()
})();
