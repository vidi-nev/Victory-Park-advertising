var navLinks = {
    screens: [
      ['#path','Локации'],
      ['#advantages','Преимущества'],
      ['#steps','Этапы работы'],
      ['#specs','Требования'],
      ['#faq','Вопросы'],
      ['#contact','Контакты']
    ],
    benches: [
      ['#locations-benches','Локации'],
      ['#advantages-benches','Преимущества'],
      ['#steps-benches','Этапы работы'],
      ['#specs-benches','Форматы'],
      ['#faq-benches','Вопросы'],
      ['#contact-benches','Контакты']
    ]
  };
  var logoSubs = {
    screens: 'LED-экраны · Парк Победы',
    benches: 'Реклама на лавочках · Парки Ставрополя'
  };
  var currentTab = 'screens';
  var isAnimating = false;

  function moveIndicator(btn){
    var indicator = document.getElementById('tabIndicator');
    var wrap = btn.parentElement;
    var wrapRect = wrap.getBoundingClientRect();
    var btnRect = btn.getBoundingClientRect();
    indicator.style.width = btnRect.width + 'px';
    indicator.style.transform = 'translateX(' + (btnRect.left - wrapRect.left - 28) + 'px)';
  }

  function renderNav(tab){
    var nav = document.getElementById('mainNav');
    nav.innerHTML = navLinks[tab].map(function(item){
      return '<a href="'+item[0]+'">'+item[1]+'</a>';
    }).join('');
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ nav.classList.remove('open'); });
    });
  }

  function setTab(tab){
    if(tab===currentTab || isAnimating) return;
    isAnimating = true;

    var outgoing = document.getElementById('page-'+currentTab);
    var incoming = document.getElementById('page-'+tab);
    var dir = (tab==='benches') ? 1 : -1; // benches slides in from the right
    var wrap = document.getElementById('pagesWrap');

    document.getElementById('tabBtnScreens').classList.toggle('active', tab==='screens');
    document.getElementById('tabBtnBenches').classList.toggle('active', tab==='benches');
    moveIndicator(document.getElementById(tab==='screens' ? 'tabBtnScreens' : 'tabBtnBenches'));
    document.getElementById('logoSub').textContent = logoSubs[tab];
    renderNav(tab);

    // lock height during the crossfade so the page doesn't jump
    wrap.style.minHeight = outgoing.offsetHeight + 'px';

    outgoing.classList.add('anim-abs');
    incoming.classList.add('anim-abs');
    incoming.style.display = 'block';
    incoming.classList.add(dir===1 ? 'anim-in-from-right' : 'anim-in-from-left');

    // force reflow so the starting state is applied before animating
    void incoming.offsetWidth;

    outgoing.classList.add(dir===1 ? 'anim-out-to-left' : 'anim-out-to-right');
    incoming.classList.remove('anim-in-from-right','anim-in-from-left');

    window.scrollTo({top:0, behavior:'smooth'});

    setTimeout(function(){
      outgoing.classList.remove('active','anim-abs','anim-out-to-left','anim-out-to-right');
      incoming.classList.remove('anim-abs');
      incoming.classList.add('active');
      outgoing.style.display = '';
      incoming.style.display = '';
      wrap.style.minHeight = '';
      currentTab = tab;
      isAnimating = false;
    }, 300);
  }

  function openGmailCompose(to, subject, body){
    var url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(to);
    if(subject) url += '&su=' + encodeURIComponent(subject);
    if(body) url += '&body=' + encodeURIComponent(body);
    window.open(url, '_blank');
  }

  function sendToGmail(e){
    e.preventDefault();
    var name = document.getElementById('fname').value.trim();
    var phone = document.getElementById('fphone').value.trim();
    var screen = document.getElementById('fscreen').value;
    var body = 'Имя: ' + name + '\n' + 'Телефон: ' + phone + '\n' + 'Интересующий экран: ' + screen;
    openGmailCompose('vparks26@gmail.com', 'Заявка на рекламу в Парке Победы', body);
    return false;
  }

  function sendBenchToGmail(e){
    e.preventDefault();
    var name = document.getElementById('bname').value.trim();
    var phone = document.getElementById('bphone').value.trim();
    var park = document.getElementById('bpark').value;
    var format = document.getElementById('bformat').value;
    var body = 'Имя: ' + name + '\n' + 'Телефон: ' + phone + '\n' + 'Парк: ' + park + '\n' + 'Формат: ' + format;
    openGmailCompose('vparks26@gmail.com', 'Заявка на рекламу на лавочках', body);
    return false;
  }

  function fallbackCopy(text){
    var input = document.createElement('textarea');
    input.value = text;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    try{ document.execCommand('copy'); }catch(err){}
    document.body.removeChild(input);
  }

  function initCopyAndMailLinks(){
    document.querySelectorAll('a.copy-link').forEach(function(link){
      if(link.dataset.bound) return;
      link.dataset.bound = '1';
      var defaultTooltip = link.getAttribute('data-tooltip');

      if(link.classList.contains('open-mail')){
        link.addEventListener('click', function(e){
          e.preventDefault();
          openGmailCompose(link.textContent.trim());
        });
      } else {
        link.addEventListener('click', function(e){
          var text = link.textContent.trim();
          var showCopied = function(){
            link.setAttribute('data-tooltip', 'Скопировано!');
            link.classList.add('copied');
            clearTimeout(link._copyTimeout);
            link._copyTimeout = setTimeout(function(){
              link.setAttribute('data-tooltip', defaultTooltip);
              link.classList.remove('copied');
            }, 1400);
          };
          if(navigator.clipboard && navigator.clipboard.writeText){
            navigator.clipboard.writeText(text).then(showCopied).catch(function(){ fallbackCopy(text); showCopied(); });
          } else {
            fallbackCopy(text);
            showCopied();
          }
          // tel: link default action still runs (useful on mobile devices)
        });
      }
    });
  }

  renderNav('screens');
  moveIndicator(document.getElementById('tabBtnScreens'));
  initCopyAndMailLinks();
  window.addEventListener('load', function(){ moveIndicator(document.getElementById(currentTab==='screens' ? 'tabBtnScreens' : 'tabBtnBenches')); });
  window.addEventListener('resize', function(){ moveIndicator(document.getElementById(currentTab==='screens' ? 'tabBtnScreens' : 'tabBtnBenches')); });

  document.getElementById('navToggle').addEventListener('click', function(){
    document.getElementById('mainNav').classList.toggle('open');
  });

  document.querySelectorAll('.faq-item').forEach(function(item){
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function(){
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function(other){
        if(other!==item){ other.classList.remove('open'); other.querySelector('.faq-a').style.maxHeight = null; }
      });
      if(isOpen){
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });