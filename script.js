(function(){
'use strict';
var MAIL='vparks26@gmail.com', CLAIM_MAIL='vidinevsupport26@gmail.com';
var navLinks={
  screens:[['#path','Локации'],['#advantages','Преимущества'],['#steps','Этапы работы'],['#specs','Требования'],['#faq','Вопросы'],['#contact','Контакты']],
  benches:[['#locations-benches','Локации'],['#advantages-benches','Преимущества'],['#steps-benches','Этапы работы'],['#specs-benches','Форматы'],['#faq-benches','Вопросы'],['#contact-benches','Контакты']]
};
var logoSubs={screens:'LED-экраны · Парк Победы',benches:'Реклама на лавочках · Парки Ставрополя'};
var currentTab='screens', isAnimating=false;
var reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(id){return document.getElementById(id);};
var btnFor=function(t){return $(t==='screens'?'tabBtnScreens':'tabBtnBenches');};

function setHeaderVar(){
  var hd=document.querySelector('header');
  if(hd) document.documentElement.style.setProperty('--header-h',hd.offsetHeight+'px');
}
function moveIndicator(){
  var b=btnFor(currentTab), i=$('tabIndicator');
  if(!b||!i) return;
  i.style.width=b.offsetWidth+'px';
  i.style.height=b.offsetHeight+'px';
  i.style.top=b.offsetTop+'px';
  i.style.transform='translateX('+b.offsetLeft+'px)';
}
function renderNav(tab){
  var nav=$('mainNav'); nav.textContent='';
  navLinks[tab].forEach(function(it){
    var a=document.createElement('a'); a.href=it[0]; a.textContent=it[1];
    a.addEventListener('click',closeNav); nav.appendChild(a);
  });
}
function closeNav(){
  $('mainNav').classList.remove('open');
  $('navToggle').setAttribute('aria-expanded','false');
}
function markTab(tab){
  ['screens','benches'].forEach(function(t){
    var b=btnFor(t), on=(t===tab);
    b.classList.toggle('active',on); b.setAttribute('aria-selected',on?'true':'false');
  });
  $('logoSub').textContent=logoSubs[tab];
  renderNav(tab); closeNav();
}
function setTab(tab,instant){
  if(tab===currentTab||isAnimating) return;
  var out=$('page-'+currentTab), inc=$('page-'+tab);
  if(instant||reduceMotion){
    out.classList.remove('active'); inc.classList.add('active');
    currentTab=tab; markTab(tab); moveIndicator(); return;
  }
  isAnimating=true;
  var dir=(tab==='benches')?1:-1, wrap=$('pagesWrap');
  currentTab=tab; markTab(tab); moveIndicator();
  wrap.style.minHeight=out.offsetHeight+'px';
  out.classList.add('anim-abs'); inc.classList.add('anim-abs');
  inc.style.display='block';
  inc.classList.add(dir===1?'anim-in-from-right':'anim-in-from-left');
  void inc.offsetWidth;
  out.classList.add(dir===1?'anim-out-to-left':'anim-out-to-right');
  inc.classList.remove('anim-in-from-right','anim-in-from-left');
  window.scrollTo({top:0,behavior:'smooth'});
  setTimeout(function(){
    out.classList.remove('active','anim-abs','anim-out-to-left','anim-out-to-right');
    inc.classList.remove('anim-abs'); inc.classList.add('active');
    out.style.display=''; inc.style.display=''; wrap.style.minHeight='';
    isAnimating=false;
  },300);
}

/* ---- safe external opening ---- */
function openExternal(url){
  var a=document.createElement('a');
  a.href=url; a.target='_blank'; a.rel='noopener noreferrer';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
function gmailUrl(to,subject,body){
  var u='https://mail.google.com/mail/?view=cm&fs=1&to='+encodeURIComponent(to);
  if(subject) u+='&su='+encodeURIComponent(subject);
  if(body) u+='&body='+encodeURIComponent(body);
  return u;
}
function isIOS(){
  return /iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
}
function isAndroid(){ return /Android/i.test(navigator.userAgent); }
function mailtoUrl(to,subject,body){
  var u='mailto:'+to, q=[];
  if(subject) q.push('subject='+encodeURIComponent(subject));
  if(body) q.push('body='+encodeURIComponent(body));
  return u+(q.length?'?'+q.join('&'):'');
}
/* телефон: открыть именно приложение Gmail; компьютер: Gmail в браузере */
function openMail(to,subject,body){
  if(isIOS()){
    location.href='googlegmail:///co?to='+encodeURIComponent(to)+(subject?'&subject='+encodeURIComponent(subject):'')+(body?'&body='+encodeURIComponent(body):'');
    return;
  }
  if(isAndroid()){
    var web=gmailUrl(to,subject,body);
    location.href='intent:'+mailtoUrl(to,subject,body)+'#Intent;action=android.intent.action.SENDTO;package=com.google.android.gm;S.browser_fallback_url='+encodeURIComponent(web)+';end';
    return;
  }
  openExternal(gmailUrl(to,subject,body));
}
function clean(s,max){
  return String(s||'').replace(/[\u0000-\u001F\u007F<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
}
var lastSend=0;
function handleForm(form){
  var status=form.querySelector('.form-status');
  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(form.elements.website&&form.elements.website.value) return; // honeypot
    var say=function(t){ if(status){ status.textContent=t; } };
    if(!form.elements.consent.checked){ say('Для отправки необходимо согласие на обработку персональных данных.'); return; }
    var name=clean(form.elements.name.value,60), phone=clean(form.elements.phone.value,20);
    var digits=phone.replace(/\D/g,'');
    if(name.length<2){ say('Укажите имя.'); return; }
    if(digits.length<10||digits.length>12){ say('Проверьте номер телефона.'); return; }
    if(Date.now()-lastSend<20000){ say('Заявка уже формируется. Подождите несколько секунд.'); return; }
    lastSend=Date.now();
    var body,subj,to=MAIL;
    if(form.dataset.kind==='claim'){
      var msg=clean(form.elements.message.value,1500);
      if(msg.length<10){ lastSend=0; say('Опишите обращение подробнее.'); return; }
      to=CLAIM_MAIL; subj='Претензия / обращение с сайта';
      body='Имя: '+name+'\nТелефон: '+phone+'\nТекст: '+msg;
    } else if(form.dataset.kind==='screens'){
      subj='Заявка на рекламу в Парке Победы';
      body='Имя: '+name+'\nТелефон: '+phone+'\nИнтересующий экран: '+clean(form.elements.fscreen.value,100);
    } else {
      subj='Заявка на рекламу на лавочках';
      body='Имя: '+name+'\nТелефон: '+phone+'\nПарк: '+clean(form.elements.bpark.value,100)+'\nФормат: '+clean(form.elements.bformat.value,100);
    }
    openMail(to,subj,body);
    status.textContent='Откроется письмо с заявкой — нажмите «Отправить». Не открылось? Напишите на ';
    var m=document.createElement('a'); m.href='mailto:'+to; m.textContent=to;
    status.appendChild(m); status.appendChild(document.createTextNode(' или позвоните нам.'));
  });
}

/* ---- copy / mail links ---- */
function fallbackCopy(text){
  var t=document.createElement('textarea');
  t.value=text; t.style.position='fixed'; t.style.opacity='0';
  document.body.appendChild(t); t.select();
  try{document.execCommand('copy');}catch(err){}
  document.body.removeChild(t);
}
function initCopyAndMailLinks(){
  document.querySelectorAll('a.copy-link').forEach(function(link){
    var tip=link.getAttribute('data-tooltip');
    if(link.classList.contains('open-mail')){
      link.addEventListener('click',function(e){
        e.preventDefault(); openMail(link.textContent.trim());
      });
      return;
    }
    link.addEventListener('click',function(){
      var text=link.textContent.trim();
      var done=function(){
        link.setAttribute('data-tooltip','Скопировано!'); link.classList.add('copied');
        clearTimeout(link._t);
        link._t=setTimeout(function(){link.setAttribute('data-tooltip',tip);link.classList.remove('copied');},1400);
      };
      if(navigator.clipboard&&navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(done).catch(function(){fallbackCopy(text);done();});
      } else { fallbackCopy(text); done(); }
    });
  });
}

/* ---- FAQ ---- */
function initFaq(){
  var items=document.querySelectorAll('.faq-item');
  items.forEach(function(item){
    var q=item.querySelector('.faq-q'), a=item.querySelector('.faq-a');
    q.setAttribute('aria-expanded','false');
    q.addEventListener('click',function(){
      var open=item.classList.contains('open');
      items.forEach(function(o){
        o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight=null;
        o.querySelector('.faq-q').setAttribute('aria-expanded','false');
      });
      if(!open){
        item.classList.add('open'); a.style.maxHeight=a.scrollHeight+'px';
        q.setAttribute('aria-expanded','true');
      }
    });
  });
}
function refit(){
  setHeaderVar(); moveIndicator();
  document.querySelectorAll('.faq-item.open .faq-a').forEach(function(a){a.style.maxHeight=a.scrollHeight+'px';});
}

/* ---- claim dialog ---- */
function initClaim(){
  var dlg=$('claimDialog'); if(!dlg) return;
  var open=function(){ if(dlg.showModal){ if(!dlg.open) dlg.showModal(); } else dlg.setAttribute('open',''); };
  var close=function(){ if(dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
  document.querySelectorAll('[data-open-claim]').forEach(function(a){
    a.addEventListener('click',function(e){ e.preventDefault(); open(); });
  });
  dlg.querySelector('.modal-close').addEventListener('click',close);
  dlg.addEventListener('click',function(e){ if(e.target===dlg) close(); });
  if(location.hash==='#claim') open();
}

/* ---- init ---- */
document.querySelectorAll('.tab-btn').forEach(function(b){
  b.addEventListener('click',function(){setTab(b.getAttribute('data-tab'));});
});
$('navToggle').addEventListener('click',function(){
  var open=$('mainNav').classList.toggle('open');
  $('navToggle').setAttribute('aria-expanded',open?'true':'false');
});
document.addEventListener('keydown',function(e){if(e.key==='Escape') closeNav();});
document.addEventListener('click',function(e){
  if(!e.target.closest('header')) closeNav();
});
document.querySelectorAll('form[data-kind]').forEach(handleForm);
renderNav('screens'); initClaim(); initCopyAndMailLinks(); initFaq(); setHeaderVar(); moveIndicator();
window.addEventListener('load',function(){
  refit();
  var id=decodeURIComponent((location.hash||'').slice(1)), el=id&&document.getElementById(id);
  if(el){ var pg=el.closest('.page'); if(pg&&pg.id==='page-benches') setTab('benches',true); setTimeout(function(){el.scrollIntoView();},50); }
});
window.addEventListener('resize',refit);
if(document.fonts&&document.fonts.ready) document.fonts.ready.then(refit);
})();
