(function(){
  var K='mcr-mode',b=document.body,m='par';
  try{m=localStorage.getItem(K)||'par'}catch(e){}
  function set(v){b.setAttribute('data-mode',v);
    document.querySelectorAll('.modes button').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.m===v)});
    try{localStorage.setItem(K,v)}catch(e){}
    if(location.hash){var t=document.getElementById(location.hash.slice(1));if(t)t.scrollIntoView()}}
  document.querySelectorAll('.modes button').forEach(function(x){x.addEventListener('click',function(){set(x.dataset.m)})});
  set(m);
  var d=document.getElementById('tocd');if(d&&window.innerWidth<=820)d.open=false;
})();

(function(){
  var r=document.documentElement,b=document.querySelector('.theme');if(!b)return;
  function lab(){b.textContent=r.dataset.theme==='dark'?'☀ Day':'☾ Night';b.setAttribute('aria-pressed',r.dataset.theme==='dark')}
  b.addEventListener('click',function(){var t=r.dataset.theme==='dark'?'light':'dark';r.dataset.theme=t;try{localStorage.setItem('mcr-theme',t)}catch(e){}lab()});
  lab();
})();
