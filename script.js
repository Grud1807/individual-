const modules = [
  { id:'light', name:'Умное освещение', price:12000, comfort:20, security:3, eco:18, rooms:['living','bedroom','kitchen'] },
  { id:'camera', name:'Видеонаблюдение', price:24000, comfort:4, security:28, eco:0, rooms:['hall','yard'] },
  { id:'climate', name:'Климат-контроль', price:30000, comfort:24, security:2, eco:20, rooms:['bedroom','living'] },
  { id:'voice', name:'Голосовой помощник', price:9000, comfort:18, security:0, eco:4, rooms:['living','kitchen'] },
  { id:'locks', name:'Умные замки', price:18000, comfort:6, security:24, eco:0, rooms:['hall'] },
  { id:'smoke', name:'Датчики дыма', price:11000, comfort:0, security:18, eco:0, rooms:['kitchen','hall'] },
  { id:'leak', name:'Датчики протечки', price:10000, comfort:3, security:16, eco:8, rooms:['bath','kitchen'] },
  { id:'sockets', name:'Умные розетки', price:8000, comfort:8, security:2, eco:22, rooms:['bedroom','living','kitchen'] }
];

const scenarios = [
  {
    title:'Отключение интернета',
    desc:'Внешнее соединение недоступно. Облачные команды и часть удалённого управления временно отключены.',
    test:(set)=>({
      score:(set.has('voice')?20:8)+(set.has('camera')?8:4)+(set.has('light')?12:6),
      needs:['sockets','light'],
      rec:'Лучше предусмотреть локальные сценарии работы, чтобы освещение и базовые автоматизации работали даже без облака.'
    })
  },
  {
    title:'Попытка взлома системы',
    desc:'Система получает подозрительные запросы на доступ к камерам и замкам.',
    test:(set)=>({
      score:(set.has('camera')?24:6)+(set.has('locks')?22:5)+(set.has('smoke')?8:0),
      needs:['camera','locks'],
      rec:'Без устройств безопасности и защищённых точек входа дом уязвим. Нужны камеры, умные замки и грамотная настройка доступа.'
    })
  },
  {
    title:'Резкое похолодание ночью',
    desc:'Температура резко падает. Дом должен быстро адаптироваться без потери комфорта.',
    test:(set)=>({
      score:(set.has('climate')?30:6)+(set.has('voice')?8:0)+(set.has('light')?6:0),
      needs:['climate'],
      rec:'Климат-контроль — один из самых полезных элементов умного дома. Он повышает комфорт и помогает экономить энергию.'
    })
  },
  {
    title:'Протечка на кухне',
    desc:'Вода обнаружена рядом с мойкой. Система должна быстро оповестить владельца.',
    test:(set)=>({
      score:(set.has('leak')?34:4)+(set.has('sockets')?8:0)+(set.has('camera')?6:0),
      needs:['leak'],
      rec:'Датчики протечки позволяют быстро заметить проблему и снизить возможный ущерб.'
    })
  },
  {
    title:'Ночной режим безопасности',
    desc:'Дом переходит в режим сна. Нужно сохранить безопасность и минимальное энергопотребление.',
    test:(set)=>({
      score:(set.has('camera')?16:4)+(set.has('locks')?16:3)+(set.has('light')?10:2)+(set.has('sockets')?14:4),
      needs:['camera','locks','sockets'],
      rec:'Хороший ночной режим требует сочетания безопасности и энергоэффективности: камеры, умные замки и сценарии отключения лишних приборов.'
    })
  }
];

function initMenu(){
  const btn=document.querySelector('.menu-btn');
  const nav=document.querySelector('.nav-links');
  if(!btn||!nav) return;
  btn.addEventListener('click',()=>nav.classList.toggle('open'));
}

function initReveal(){
  const items=[...document.querySelectorAll('.reveal')];
  if(!items.length) return;
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')});
  },{threshold:.14});
  items.forEach(i=>io.observe(i));
}

function initTop(){
  const btn=document.querySelector('.back-to-top');
  if(!btn) return;
  window.addEventListener('scroll',()=>btn.classList.toggle('show',window.scrollY>420));
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}

function initGame(){
  const moduleRoot=document.getElementById('module-list');
  if(!moduleRoot) return;
  const selected=new Set(['light','camera','climate']);

  moduleRoot.innerHTML=modules.map(m=>`
    <label class="module-item">
      <div class="module-meta">
        <strong>${m.name}</strong>
        <span>${m.price.toLocaleString('ru-RU')} ₽</span>
      </div>
      <span class="switch">
        <input type="checkbox" data-id="${m.id}" ${selected.has(m.id)?'checked':''}>
        <span class="slider"></span>
      </span>
    </label>
  `).join('');

  const comfortEl=document.getElementById('comfortVal');
  const securityEl=document.getElementById('securityVal');
  const ecoEl=document.getElementById('ecoVal');
  const costEl=document.getElementById('costVal');
  const comfortBar=document.getElementById('comfortBar');
  const securityBar=document.getElementById('securityBar');
  const ecoBar=document.getElementById('ecoBar');
  const resultText=document.getElementById('resultText');
  const resultTag=document.getElementById('resultTag');
  const roomEls=[...document.querySelectorAll('.room')];

  function evaluate(){
    let comfort=0, security=0, eco=0, cost=0;
    const activeRooms=new Set();
    modules.forEach(m=>{
      if(selected.has(m.id)){
        comfort += m.comfort;
        security += m.security;
        eco += m.eco;
        cost += m.price;
        m.rooms.forEach(r=>activeRooms.add(r));
      }
    });
    comfort=Math.min(100,comfort);
    security=Math.min(100,security);
    eco=Math.min(100,eco);
    comfortEl.textContent=comfort+'%';
    securityEl.textContent=security+'%';
    ecoEl.textContent=eco+'%';
    costEl.textContent=cost.toLocaleString('ru-RU')+' ₽';
    comfortBar.style.width=comfort+'%';
    securityBar.style.width=security+'%';
    ecoBar.style.width=eco+'%';

    roomEls.forEach(r=>r.classList.toggle('active', activeRooms.has(r.dataset.room)));

    const avg=(comfort+security+eco)/3;
    let label='Базовая конфигурация';
    let text='Система решает отдельные задачи, но ещё не даёт полноценного эффекта умного дома.';
    if(avg>=75 && cost<=120000){
      label='Сбалансированный умный дом';
      text='Хороший баланс между ценой, удобством, безопасностью и практической пользой.';
    } else if(avg>=82 && cost>120000){
      label='Премиальная система';
      text='Очень высокий уровень автоматизации, но стоимость уже выше среднего.';
    } else if(avg>=58){
      label='Продвинутый старт';
      text='Система уже полезна, но для полного эффекта не хватает отдельных модулей.';
    }
    resultTag.textContent=label;
    resultText.textContent=text;
  }

  moduleRoot.addEventListener('change',e=>{
    const id=e.target.dataset.id;
    if(!id) return;
    if(e.target.checked) selected.add(id); else selected.delete(id);
    evaluate();
  });

  const testBtn=document.getElementById('testScenarioBtn');
  const scenarioTitle=document.getElementById('scenarioTitle');
  const scenarioDesc=document.getElementById('scenarioDesc');
  const scenarioState=document.getElementById('scenarioState');
  const scenarioAdvice=document.getElementById('scenarioAdvice');
  const scenarioScore=document.getElementById('scenarioScore');

  function runScenario(){
    const scenario=scenarios[Math.floor(Math.random()*scenarios.length)];
    const result=scenario.test(selected);
    const score=Math.min(100,result.score);
    let cls='bad', text='Система уязвима';
    if(score>=72){cls='good';text='Система хорошо подготовлена';}
    else if(score>=45){cls='warn';text='Есть риски, но часть проблем покрыта';}

    scenarioTitle.textContent=scenario.title;
    scenarioDesc.textContent=scenario.desc;
    scenarioState.className='status '+cls;
    scenarioState.textContent=text;
    scenarioScore.textContent=score + ' / 100';
    scenarioAdvice.textContent=result.rec;
  }

  testBtn?.addEventListener('click', runScenario);
  evaluate();
  runScenario();
}

document.addEventListener('DOMContentLoaded',()=>{
  initMenu();
  initReveal();
  initTop();
  initGame();
});
