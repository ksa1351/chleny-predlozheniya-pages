// js/app_chleny_predlozheniya.js
(() => {
  const TASKS = window.TASKS_CHLENY || [];

  const els = {
    taskNum: document.getElementById('taskNum'),
    taskTotal: document.getElementById('taskTotal'),
    title: document.getElementById('title'),
    textBox: document.getElementById('textBox'),
    options: document.getElementById('options'),
    result: document.getElementById('result'),
    answerBox: document.getElementById('answerBox'),
    showAnswer: document.getElementById('toggleShowAnswer'),
    btnPrev: document.getElementById('btnPrev'),
    btnNext: document.getElementById('btnNext'),
    btnRandom: document.getElementById('btnRandom'),
    btnClearHL: document.getElementById('btnClearHL'),
    btnCheck: document.getElementById('btnCheck'),
    btnReset: document.getElementById('btnReset'),
  };

  let idx = 0;
  els.taskTotal.textContent = String(TASKS.length || 1);

  function normalizeAnswer(s){
    return (s || "")
      .toString()
      .replace(/[^\d]/g,'')
      .split('')
      .filter((v,i,a)=>a.indexOf(v)===i)
      .sort()
      .join('');
  }

  function renderText(sentences){
    const container = document.createElement('div');
    sentences.forEach((s, i) => {
      const p = document.createElement('p');
      p.className = 'sent';

      const num = document.createElement('small');
      num.textContent = `(${i+1}) `;
      p.appendChild(num);

      const tokens = s.match(/[\p{L}\p{N}ЁёА-Яа-я\-]+|[^\s]/gu) || [];
      tokens.forEach(t => {
        if (/[\p{L}\p{N}ЁёА-Яа-я\-]+/u.test(t)) {
          const w = document.createElement('span');
          w.className = 'w';
          w.textContent = t;
          w.addEventListener('click', () => w.classList.toggle('hl'));
          p.appendChild(w);
        } else {
          const span = document.createElement('span');
          span.textContent = t;
          p.appendChild(span);
        }
        p.appendChild(document.createTextNode(' '));
      });

      container.appendChild(p);
    });
    return container.innerHTML;
  }

  function renderOptions(options){
    els.options.innerHTML = '';
    options.forEach((txt, i) => {
      const div = document.createElement('label');
      div.className = 'opt';
      div.innerHTML = `
        <input type="checkbox" data-n="${i+1}">
        <div><b>${i+1}.</b> <span>${txt}</span></div>
      `;
      els.options.appendChild(div);
    });
  }

  function getUserAnswer(){
    return [...els.options.querySelectorAll('input[type="checkbox"]:checked')]
      .map(x => x.getAttribute('data-n'))
      .sort()
      .join('');
  }

  function clearHighlights(){
    els.textBox.querySelectorAll('.w.hl').forEach(w => w.classList.remove('hl'));
  }

  function resetChoice(){
    els.options.querySelectorAll('input[type="checkbox"]').forEach(ch => ch.checked = false);
    els.result.style.display = 'none';
    els.answerBox.style.display = 'none';
  }

  function renderTask(){
    if (!TASKS.length) return;

    const t = TASKS[idx];
    els.taskNum.textContent = String(idx + 1);
    els.title.textContent = t.title;

    els.textBox.innerHTML = renderText(t.sentences);
    renderOptions(t.options);

    els.result.style.display = 'none';
    els.btnPrev.disabled = (idx === 0);
    els.btnNext.disabled = (idx === TASKS.length - 1);

    if (els.showAnswer.checked){
      els.answerBox.style.display = 'block';
      els.answerBox.innerHTML = `Правильный ответ: <span class="ok">${normalizeAnswer(t.answer)}</span>`;
    } else {
      els.answerBox.style.display = 'none';
    }
  }

  els.btnPrev.addEventListener('click', () => { if(idx>0){ idx--; renderTask(); }});
  els.btnNext.addEventListener('click', () => { if(idx<TASKS.length-1){ idx++; renderTask(); }});
  els.btnRandom.addEventListener('click', () => { idx = Math.floor(Math.random() * TASKS.length); renderTask(); });

  els.btnClearHL.addEventListener('click', clearHighlights);
  els.btnReset.addEventListener('click', resetChoice);

  els.btnCheck.addEventListener('click', () => {
    const t = TASKS[idx];
    const user = normalizeAnswer(getUserAnswer());
    const right = normalizeAnswer(t.answer);

    els.result.style.display = 'block';

    if (!user){
      els.result.classList.remove('ok','bad');
      els.result.innerHTML = `Отметьте хотя бы один вариант.`;
      return;
    }

    if (user === right){
      els.result.classList.remove('bad');
      els.result.classList.add('ok');
      els.result.innerHTML = `Верно! ✅ Ваш ответ: <span class="ok">${user}</span>`;
    } else {
      els.result.classList.remove('ok');
      els.result.classList.add('bad');
      els.result.innerHTML = `Неверно ❌ Ваш ответ: <span class="bad">${user}</span>`;
    }

    if (els.showAnswer.checked){
      els.answerBox.style.display = 'block';
      els.answerBox.innerHTML = `Правильный ответ: <span class="ok">${right}</span>`;
    }
  });

  els.showAnswer.addEventListener('change', renderTask);

  renderTask();
})();
