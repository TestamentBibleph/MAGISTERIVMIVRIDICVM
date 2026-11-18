(function(){
  var MAG=window.MAG||{},titles=MAG.titles||[],files=MAG.files||[],loaded=false,loading=null,rows=[];
  var $=function(i){return document.getElementById(i)};
  function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f\u0345]/g,'').replace(/æ/g,'ae').replace(/œ/g,'oe').replace(/ſ/g,'s').replace(/ς/g,'σ').replace(/j/g,'i').replace(/v/g,'u')}
  function nmap(s){var o='',m=[];for(var i=0;i<s.length;i++){var c=norm(s[i]);for(var k=0;k<c.length;k++){o+=c[k];m.push(i)}}return [o,m]}
  function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  function tokens(q){var t=[],re=/"([^"]+)"|(\S+)/g,m;while((m=re.exec(q))){var w=norm(m[1]||m[2]).trim();if(w)t.push(w)}return t}
  function load(){
    if(loading)return loading;
    var n=0;
    loading=new Promise(function(res){
      files.forEach(function(f){var s=document.createElement('script');s.src='search/data/'+f+'.js';
        s.onload=s.onerror=function(){n++;$('status').textContent='Loading texts… '+n+' / '+files.length;if(n===files.length){res()}};document.head.appendChild(s)});
      if(!files.length)res()});
    return loading.then(function(){
      var D=(window.MAG&&window.MAG.d)||{};
      Object.keys(D).forEach(function(k){var c=(titles.find(function(t){return t[3]==='council'&&0})||0);
        D[k].forEach(function(r){rows.push({c:k,u:r[0],id:r[1],l:r[2],en:r[3],o:r[4],ne:null,no:null})})});
      loaded=true});
  }
  function hl(raw,toks){
    var a=nmap(raw),n=a[0],m=a[1],rg=[];
    toks.forEach(function(t){var i=0;while((i=n.indexOf(t,i))>-1){rg.push([m[i],m[i+t.length-1]+1]);i+=t.length}});
    rg.sort(function(x,y){return x[0]-y[0]});var o='',p=0;
    rg.forEach(function(r){if(r[0]<p)return;o+=esc(raw.slice(p,r[0]))+'<mark>'+esc(raw.slice(r[0],r[1]))+'</mark>';p=r[1]});
    return o+esc(raw.slice(p))}
  function snip(raw,toks){
    var n=nmap(raw),i=-1;for(var k=0;k<toks.length;k++){i=n[0].indexOf(toks[k]);if(i>-1)break}
    if(i<0)return esc(raw.slice(0,240));
    var s=Math.max(0,n[1][i]-90),e=Math.min(raw.length,n[1][i]+200),w=raw.slice(s,e);
    return (s>0?'… ':'')+hl(w,toks)+(e<raw.length?' …':'')}
  function run(){
    var q=$('q').value.trim(),scope=document.querySelector('input[name=scope]:checked').value,lg=document.querySelector('input[name=lg]:checked').value;
    var R=$('results');R.innerHTML='';$('status').textContent='';
    var toks=tokens(q);if(!toks.length)return;
    try{history.replaceState(null,'','?q='+encodeURIComponent(q))}catch(e){}
    var out='';
    if(scope!=='text'){
      var tm=titles.filter(function(t){var h=norm(t[0]+' '+t[1]);return toks.every(function(x){return h.indexOf(x)>-1})});
      if(tm.length){out+='<h3>Titles ('+tm.length+')</h3><ol>'+tm.slice(0,60).map(function(t){return '<li><a href="'+t[2]+'">'+hl(t[4],toks)+'</a><div class="where">'+esc(t[1])+'</div></li>'}).join('')+'</ol>'+(tm.length>60?'<p class="hint">Showing the first 60 titles — refine your search.</p>':'')}}
    R.innerHTML=out;
    if(scope==='titles'){if(!out)R.innerHTML='<p>No titles match.</p>';return}
    $('status').textContent='Searching…';
    load().then(function(){
      var hits=[];
      for(var i=0;i<rows.length;i++){var r=rows[i],ok=true,te='',to='';
        if(lg!=='o'){if(r.ne===null)r.ne=norm(r.en);te=r.ne}
        if(lg!=='en'){if(r.no===null)r.no=norm(r.o);to=r.no}
        var hay=te+' \u0001 '+to;
        for(var k=0;k<toks.length;k++){if(hay.indexOf(toks[k])<0){ok=false;break}}
        if(ok)hits.push(r)}
      var councils={};hits.forEach(function(r){councils[r.c]=1});
      $('status').textContent=hits.length+' paragraph'+(hits.length===1?'':'s')+' found in '+Object.keys(councils).length+' council'+(Object.keys(councils).length===1?'':'s');
      var show=0,LIM=100;
      function more(){
        var h='<ol>';var end=Math.min(hits.length,show+LIM);
        for(var i=show;i<end;i++){var r=hits[i];
          var inEn=lg!=='o'&&toks.every(function(t){return norm(r.en).indexOf(t)>-1}),useO=!inEn||lg==='o';
          var raw=inEn&&lg!=='o'?r.en:r.o,cl=inEn&&lg!=='o'?'en':'';
          if(!raw){raw=r.en||r.o}
          h+='<li><div class="where"><a href="'+r.u+'#'+r.id+'">'+(titles.length?'':'')+esc((MAG.names||{})[r.c]||r.c)+' › '+esc(r.l)+' · ¶'+r.id.slice(1)+'</a></div><p'+(cl?'':' class="o"')+'>'+snip(raw,toks)+'</p></li>'}
        h+='</ol>';R.insertAdjacentHTML('beforeend',h);show=end;
        var b=$('more');if(b)b.remove();
        if(show<hits.length){R.insertAdjacentHTML('beforeend','<p id="more"><button type="button" class="btn">Show more</button></p>');$('more').firstChild.onclick=more}}
      if(hits.length)more();else if(!out)R.innerHTML='<p>No results.</p>';
    });
  }
  $('sf').addEventListener('submit',function(e){e.preventDefault();run()});
  document.querySelectorAll('input[name=scope],input[name=lg]').forEach(function(x){x.addEventListener('change',run)});
  var p=new URLSearchParams(location.search).get('q');if(p){$('q').value=p;run()}
})();
