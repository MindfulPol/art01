/* A subtle, reversible displacement of the decorative background. No dependencies. */
(()=>{
 const canvas=document.querySelector('.abstract-canvas');
 if(!canvas)return;
 const image=document.querySelector('.scene-imaginary .creatures-photo');
 const journey=document.querySelector('.journey');
 const pause=document.querySelector('.flow-pause');let paused=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
 if(!gl)return;
 const vertex=`attribute vec2 position; varying vec2 uv; void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
 const fragment=`precision mediump float;
 varying vec2 uv; uniform sampler2D artwork; uniform vec2 viewport; uniform vec2 imageSize; uniform float time; uniform float progress;
 void main(){
  vec2 st=vec2(uv.x,1.-uv.y);
  float aspect=viewport.x/viewport.y;
  float source=imageSize.x/imageSize.y;
  vec2 cover=vec2(min(1.,aspect/source),min(1.,source/aspect));
  vec2 q=(st-.5)*vec2(aspect,1.);
  // Coherent slow currents: broad distortion, with quieter ripples at the edges.
  vec2 flow=vec2(sin(q.y*4.1+time*.21)+.45*sin(q.x*3.2-q.y*2.7-time*.14),
                 cos(q.x*3.7+time*.17)+.4*sin(q.y*5.3+q.x*2.-time*.19));
  vec2 sampleUV=(st-.5)*cover/(1.055+progress*.10)+.5;
  sampleUV+=flow*vec2(.016,.022)*cover;
  sampleUV.x+=sin(time*.11)*.008*cover.x;
  gl_FragColor=texture2D(artwork,clamp(sampleUV,vec2(.001),vec2(.999)));
 }`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);throw Error('Background shader unavailable');}return s;}
 let program;
 try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;}catch{return;}
 gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const uniforms=Object.fromEntries(['viewport','imageSize','time','progress'].map(k=>[k,gl.getUniformLocation(program,k)]));
 let ready=false,active=false,raf=0,last=0,elapsed=0,previous=0,progress=0;
 function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(uniforms.viewport,canvas.width,canvas.height);}
 function tick(now){raf=0;if(!active)return;if(now-last>=1000/30){elapsed+=previous?Math.min(now-previous,80)/1000:0;previous=now;last=now;gl.uniform1f(uniforms.time,elapsed);gl.uniform1f(uniforms.progress,progress);gl.drawArrays(gl.TRIANGLES,0,6);canvas.classList.add('is-ready');}raf=requestAnimationFrame(tick);}
 function update(){const r=journey.getBoundingClientRect();progress=Math.max(0,-r.top/Math.max(1,journey.offsetHeight-innerHeight));pause.hidden=!ready||reduced.matches;active=ready&&!paused&&!reduced.matches&&!document.hidden&&r.top<=innerHeight&&progress<.36;if(active&&!raf){previous=0;raf=requestAnimationFrame(tick);}if(!active&&raf){cancelAnimationFrame(raf);raf=0;}if(reduced.matches)canvas.classList.remove('is-ready');}
 function load(){if(ready||!image.naturalWidth)return;try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);}catch{return;}gl.uniform2f(uniforms.imageSize,image.naturalWidth,image.naturalHeight);ready=true;resize();update();}
 pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Animar fondo':'Pausar fondo';update();});
 image.addEventListener('load',load,{once:true});if(image.complete)load();
 addEventListener('scroll',update,{passive:true});addEventListener('resize',()=>{resize();update();},{passive:true});document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();ready=false;canvas.classList.remove('is-ready');update();});
})();
