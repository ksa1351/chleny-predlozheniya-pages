// js/app_chleny_predlozheniya_student.js
(() => {
  const TASKS = window.TASKS_CHLENY || [];

  const els = {
    taskNum: document.getElementById('taskNum'),
    taskTotal: document.getElementById('taskTotal'),
    title: document.getElementById('title'),
    textBox: document.getElementById('textBox'),
    options: document.getElementById('options'),
    result: document.getElementById('result'),
    btnPrev: document.getElementById('btnPrev'),
    btnNext: document.getElementById('btnNext'),
    btnRandom: document.getElementById('btnRandom'),
    btnClearHL: document.getElementById('btnClearHL'),
    btnCheck: document.getElementById('btnCheck'),
    btnReset: document.getElementById('btnReset'),
    btnExport: document.getElementById('btnExport'),
  };

  let idx = 0;

  // Ответы ученика: по номеру задания -> строка типа "135"
  const student = {
    set: "podlezhashchee",
    createdAt: new Date().toISOString(),
    answers: {} // { "1":"135", "2":"13", ... }
  };

  els.taskTotal.textContent = String(TASKS.length || 0);

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

  function setUserAnswerForTask(taskIndex1based, ans){
    student.answers[String(taskIndex1based)] = ans;
    updateExportButton();
  }

  function restoreUserAnswerForTask(taskIndex1based){
    const saved = student.answers[String(taskIndex1based)];
    els.options.querySelectorAll('input[type="checkbox"]').forEach(ch => {
      ch.checked = saved ? saved.includes(ch.getAttribute('data-n')) : false;
    });
  }

  function clearHighlights(){
    els.textBox.querySelectorAll('.w.hl').forEach(w => w.classList.remove('hl'));
  }

  function resetChoice(){
    els.options.querySelectorAll('input[type="checkbox"]').forEach(ch => ch.checked = false);
    if (els.result) { els.result.style.display = 'none'; }
  }

  function updateExportButton(){
    // включаем выгрузку, если ученик ответил на ВСЕ задания
    const total = TASKS.length;
    const answered = Object.keys(student.answers).length;
    if (els.btnExport) els.btnExport.disabled = !(total > 0 && answered === total);
  }

  function renderTask(){
    if (!TASKS.length) return;

    const t = TASKS[idx];
    els.taskNum.textContent = String(idx + 1);
    els.title.textContent = t.title;

    els.textBox.innerHTML = renderText(t.sentences);
    renderOptions(t.options);

    if (els.result) els.result.style.display = 'none';

    els.btnPrev.disabled = (idx === 0);
    els.btnNext.disabled = (idx === TASKS.length - 1);

    restoreUserAnswerForTask(idx + 1);
    updateExportButton();
  }

  function downloadJSON(filename, obj){
    const blob = new Blob([JSON.stringify(obj, null, 2)], {type: 'application/json;charset=utf-8'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  els.btnPrev.addEventListener('click', () => { if(idx>0){ idx--; renderTask(); }});
  els.btnNext.addEventListener('click', () => { if(idx<TASKS.length-1){ idx++; renderTask(); }});
  els.btnRandom.addEventListener('click', () => { idx = Math.floor(Math.random()*TASKS.length); renderTask(); });

  els.btnClearHL.addEventListener('click', clearHighlights);
  els.btnReset.addEventListener('click', resetChoice);

  els.btnCheck.addEventListener('click', () => {
    const ans = getUserAnswer();
    if (!ans){
      if (els.result){
        els.result.style.display = 'block';
        els.result.textContent = 'Выберите хотя бы один вариант.';
      }
      return;
    }
    setUserAnswerForTask(idx + 1, ans);
    if (els.result){
      els.result.style.display = 'block';
      els.result.textContent = `Ответ сохранён: ${ans}`;
    }
  });

  els.btnExport.addEventListener('click', () => {
    // Можно добавить поле “ФИО” — скажете, сделаю
    const filename = `answers_${student.set}_${new Date().toISOString().slice(0,10)}.json`;
    downloadJSON(filename, student);
  });

  renderTask();
})();
