(()=>{
 const journey=document.querySelector('.journey'),frame=document.querySelector('.story-frame');
 if(!journey||!frame)return;
 const abstractEntry=document.body.classList.contains('version-abstract');
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const intro=frame.querySelector('.scene-imaginary'),line=frame.querySelector('.scene-line'),black=frame.querySelector('.scene-blackwork');
 const mineral=frame.querySelector('.mineral-field'),creatures=frame.querySelector('.creatures-photo'),plate=frame.querySelector('.tattoo-plate'),photo=frame.querySelector('.floral-photo'),echo=frame.querySelector('.floral-echo'),arm=frame.querySelector('.black-photo-plane img');
 const paths=[...frame.querySelectorAll('.ink-drawing path')];
 paths.forEach(path=>{const b=path.getBBox();path.dataset.delay=String(Math.min(.35,Math.hypot(b.x+b.width/2-180,b.y+b.height/2-560)/2400))});
 let raf=0;
 const clamp=x=>Math.max(0,Math.min(1,x));
 const phase=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
 function draw(){
  raf=0;if(reduce.matches||document.hidden)return;
  const r=journey.getBoundingClientRect(),distance=journey.offsetHeight-innerHeight;
  if(r.bottom<0||r.top>innerHeight)return;
  const p=clamp(-r.top/Math.max(1,distance));
  const introOut=phase(.10,.34,p),lineIn=phase(.25,.36,p),lineOut=phase(.76,.94,p),reveal=phase(.52,.66,p),ink=phase(.30,.55,p),last=phase(.76,.94,p);
  // Switch text contrast as the shared gray field becomes light enough.
  frame.classList.toggle('is-light',p>=(abstractEntry ? .29 : .275));
  const fluid=abstractEntry&&intro.classList.contains('has-fluid-retreat');
  frame.style.setProperty('--intro-copy-opacity',String(1-phase(.10,.23,p)));
  frame.style.setProperty('--intro-shade-opacity',String(1-introOut));
  intro.style.opacity=fluid?(p<.40?1:0):1-introOut;
  creatures.style.transform=`translateX(${!abstractEntry&&innerWidth>700?7:0}%) scale(${1+introOut*.18})`;
  mineral.style.opacity=abstractEntry?phase(.10,.16,p):phase(.14,.34,p);
  line.style.opacity=lineIn*(1-lineOut);
  plate.style.transform=`scale(${1.16-phase(.34,.66,p)*.16})`;
  photo.style.opacity=reveal;
  frame.querySelector('.line-copy').style.opacity=innerWidth<=700?1-phase(.52,.65,p):1;
  frame.querySelector('.ink-drawing').style.opacity=1-reveal;
  echo.style.opacity=ink*.15;
  paths.forEach((path,i)=>{const stagger=Number(path.dataset.delay)||0;path.style.strokeDashoffset=1-clamp((ink-stagger)/(1-stagger))});
  black.style.opacity=last;
  black.style.pointerEvents=last>.9?'auto':'none';
  line.inert=p<.30||p>.87; black.inert=p<.87; intro.inert=p>(abstractEntry ? .23 : .33);
  arm.style.transform=`scale(${1.65-phase(.83,1,p)*.65})`;
  intro.style.pointerEvents=p<(abstractEntry ? .23 : .28)?'auto':'none';
  // Only the current scene participates in reading order.
  intro.setAttribute('aria-hidden',String(p>(abstractEntry ? .23 : .33)));line.setAttribute('aria-hidden',String(p<.30||p>.87));black.setAttribute('aria-hidden',String(p<.87));
 }
 function request(){if(!raf)raf=requestAnimationFrame(draw)}
 addEventListener('scroll',request,{passive:true});addEventListener('resize',request,{passive:true});
 document.addEventListener('visibilitychange',request);document.addEventListener('ritto-fluid-ready',request);
 reduce.addEventListener('change',()=>{if(reduce.matches)frame.classList.remove('is-light');for(const e of[intro,line,black]){e.removeAttribute('aria-hidden');e.inert=false;}request()});
 request();
})();
