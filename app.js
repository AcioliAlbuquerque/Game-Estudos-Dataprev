/* ==========================================================================
   OPERAÇÃO DATAPREV — app.js
   Painel gamificado do cronograma de estudos (Cargo 4 / Dataprev 2026)
   Todo o progresso é salvo em localStorage — nada é enviado para fora.
   ========================================================================== */
(function(){
  "use strict";

  /* ------------------------------------------------------------------ */
  /* DADOS                                                               */
  /* ------------------------------------------------------------------ */

  const EXAM_DATE = new Date("2026-10-11T13:00:00-03:00");
  const CAMPAIGN_START = new Date("2026-08-01T00:00:00-03:00");
  const XP_PER_LEVEL = 150;
  const XP_TASK = 20;
  const XP_RULE = 10;
  const XP_TOOL = 15;
  const XP_BOSS = 500;

  const DISCIPLINES = {
    portugues:     { label: "Português",            module: "I" },
    ingles:        { label: "Inglês",                module: "I" },
    raciocinio:    { label: "Raciocínio Lógico-Mat.", module: "I" },
    atualidades:   { label: "Atualidades e IA",       module: "I" },
    legislacao:    { label: "Legislação / LGPD",      module: "I" },
    matematica:    { label: "Matemática",             module: "II" },
    estatistica:   { label: "Estatística",            module: "II" },
    ciencia_dados: { label: "Ciência de Dados",       module: "II" },
    linguagens:    { label: "Linguagens / Big Data",  module: "II" },
    banco_dados:   { label: "Banco de Dados",         module: "II" },
  };

  const RANKS = [
    "Recruta de Dados", "Analista Júnior", "Operador de Queries",
    "Engenheiro de Features", "Caçador de Outliers", "Arquiteto de Modelos",
    "Especialista em Redes Neurais", "Mestre do Deep Learning",
    "Guardião do Módulo II", "Veterano da FGV", "Lenda do QConcursos",
    "Sobrevivente da Prova", "Aprovado(a) Dataprev — Cargo 4"
  ];

  const WEEKS = [
    {
      id: "s1", label: "S1", title: "Fundamentos", dates: "03–09/08",
      proportion: "70/30 teoria/questões",
      focus: "Fundamentos de Estatística/Probabilidade e Banco de Dados (modelagem conceitual/lógica), com Português e Inglês diários em paralelo. Álgebra linear/cálculo pesado foi cortado — ver alerta estratégico no topo da página.",
      tasks: [
        { t: "Revisar estatística descritiva e probabilidade básica (fundamentos)", tag: "estatistica" },
        { t: "Estudar modelagem conceitual e lógica de Banco de Dados", tag: "banco_dados" },
        { t: "Resolver questões de Estatística/Probabilidade (filtro banca FGV)", tag: "estatistica" },
        { t: "Resolver questões de Banco de Dados (filtro banca FGV)", tag: "banco_dados" },
        { t: "Rotina diária de Português", tag: "portugues" },
        { t: "Rotina diária de Inglês", tag: "ingles" },
      ]
    },
    {
      id: "s2", label: "S2", title: "Probabilidade & Dados", dates: "10–16/08",
      proportion: "65/35 teoria/questões",
      focus: "Estatística (probabilidade, distribuições, MV, inferência bayesiana, correlação, outliers) e Banco de Dados (normalização, SQL DDL/DML). Início do Raciocínio Lógico.",
      tasks: [
        { t: "Estudar probabilidade, distribuições e máxima verossimilhança", tag: "estatistica" },
        { t: "Estudar inferência bayesiana, correlação e outliers/boxplot", tag: "estatistica" },
        { t: "Estudar normalização e SQL DDL/DML", tag: "banco_dados" },
        { t: "Resolver questões de Estatística (banca FGV)", tag: "estatistica" },
        { t: "Resolver questões de Banco de Dados (banca FGV)", tag: "banco_dados" },
        { t: "Iniciar rotina diária de Raciocínio Lógico-Matemático", tag: "raciocinio" },
      ]
    },
    {
      id: "s3", label: "S3", title: "Ciência de Dados I", dates: "17–23/08",
      proportion: "60/40 teoria/questões",
      focus: "Supervisionado x não supervisionado, overfitting/underfitting, regularização, validação cruzada e métricas, com prática em Python/Pandas/NumPy.",
      tasks: [
        { t: "Estudar supervisionado x não supervisionado, overfitting/underfitting", tag: "ciencia_dados" },
        { t: "Estudar regularização, validação cruzada e métricas", tag: "ciencia_dados" },
        { t: "Praticar Python + Pandas + NumPy", tag: "linguagens" },
        { t: "Resolver questões de Ciência de Dados (banca FGV)", tag: "ciencia_dados" },
        { t: "Revisão espaçada de Banco de Dados (semanas 1–2)", tag: "banco_dados" },
        { t: "Revisão espaçada de Português", tag: "portugues" },
      ]
    },
    {
      id: "s4", label: "S4", title: "Ciência de Dados II", dates: "24–30/08",
      proportion: "55/45 teoria/questões",
      focus: "KNN, SVM, K-Means, árvores, PCA e redução de dimensionalidade, com prática em Scikit-learn. Início da Legislação (LGPD).",
      tasks: [
        { t: "Estudar KNN, SVM, K-Means e árvores de decisão", tag: "ciencia_dados" },
        { t: "Estudar PCA e redução de dimensionalidade", tag: "ciencia_dados" },
        { t: "Praticar com Scikit-learn", tag: "linguagens" },
        { t: "Iniciar estudo de Legislação de Segurança da Informação / LGPD", tag: "legislacao" },
        { t: "Resolver questões de Ciência de Dados (banca FGV)", tag: "ciencia_dados" },
        { t: "Revisão espaçada de Inglês", tag: "ingles" },
      ]
    },
    {
      id: "s5", label: "S5", title: "Deep Learning I", dates: "31/08–06/09",
      proportion: "60/40 teoria/questões",
      focus: "Redes neurais, backpropagation e CNN, com introdução a TensorFlow/Keras/PyTorch — o maior gargalo identificado no cronograma.",
      tasks: [
        { t: "Estudar redes neurais e backpropagation", tag: "ciencia_dados" },
        { t: "Estudar CNN (redes neurais convolucionais)", tag: "ciencia_dados" },
        { t: "Introdução a TensorFlow / Keras / PyTorch", tag: "linguagens" },
        { t: "Revisão espaçada de Estatística", tag: "estatistica" },
        { t: "Resolver questões de Deep Learning (banca FGV)", tag: "ciencia_dados" },
        { t: "Revisão espaçada de Raciocínio Lógico", tag: "raciocinio" },
      ]
    },
    {
      id: "s6", label: "S6", title: "Deep Learning II & Big Data", dates: "07–13/09",
      proportion: "45/55 teoria/questões",
      focus: "Continuação de Deep Learning, NLP e sistemas de recomendação, Big Data (Hadoop/Spark) e panorama de R/Scala/SAS.",
      tasks: [
        { t: "Continuar Deep Learning (pontos ainda fracos)", tag: "ciencia_dados" },
        { t: "Estudar NLP e sistemas de recomendação", tag: "ciencia_dados" },
        { t: "Estudar Big Data — Hadoop/Spark", tag: "linguagens" },
        { t: "Fazer panorama de R, Scala e SAS", tag: "linguagens" },
        { t: "Questões intensivas de Ciência de Dados", tag: "ciencia_dados" },
      ]
    },
    {
      id: "s7", label: "S7", title: "Revisão do Módulo II", dates: "14–20/09",
      proportion: "30/70 teoria/questões",
      focus: "Revisão geral do Módulo II via questões temáticas. Atualidades e IA (ética, IA generativa, setor público) e LGPD aprofundada.",
      tasks: [
        { t: "Revisão geral do Módulo II via questões temáticas", tag: "ciencia_dados" },
        { t: "Estudar Atualidades e IA — ética, IA generativa, setor público", tag: "atualidades" },
        { t: "Aprofundar LGPD", tag: "legislacao" },
        { t: "Revisão espaçada de Português", tag: "portugues" },
        { t: "Revisão espaçada de Inglês", tag: "ingles" },
      ]
    },
    {
      id: "s8", label: "S8", title: "Simulados por bloco", dates: "21–27/09",
      proportion: "20/80 teoria/questões",
      focus: "Um dia só de Módulo I, outro só de Módulo II, reforçando os pontos fracos indicados pelo painel de estatísticas do QConcursos.",
      tasks: [
        { t: "Simulado por bloco — somente Módulo I", tag: "geral" },
        { t: "Simulado por bloco — somente Módulo II", tag: "geral" },
        { t: "Analisar estatísticas de desempenho por assunto (QConcursos)", tag: "geral" },
        { t: "Reforçar os pontos fracos identificados no painel", tag: "geral" },
        { t: "Revisão espaçada de Raciocínio Lógico", tag: "raciocinio" },
        { t: "Rede de segurança: matemática básica para concursos (sem álgebra linear/cálculo pesado)", tag: "matematica" },
      ]
    },
    {
      id: "s9", label: "S9", title: "Simulados completos", dates: "28/09–04/10",
      proportion: "15/85 teoria/questões",
      focus: "Simulados completos cronometrados (70 questões, 4h) no sábado e no domingo, com revisão diária dos erros e reforço pontual de Português/Inglês.",
      tasks: [
        { t: "Simulado completo cronometrado — sábado (70 questões, 4h)", tag: "geral" },
        { t: "Simulado completo cronometrado — domingo (70 questões, 4h)", tag: "geral" },
        { t: "Revisão diária dos erros do caderno", tag: "geral" },
        { t: "Reforço pontual de Português", tag: "portugues" },
        { t: "Reforço pontual de Inglês", tag: "ingles" },
      ]
    },
    {
      id: "s10", label: "S10", title: "Revisão final", dates: "05–09/10",
      proportion: "revisão ativa",
      focus: "Revisão ativa de resumos e mapas mentais, simulados leves (não completos) e revisão leve geral de todas as disciplinas.",
      tasks: [
        { t: "Revisão ativa de resumos e mapas mentais", tag: "geral" },
        { t: "Simulados leves (não completos)", tag: "geral" },
        { t: "Revisão leve geral de todas as disciplinas", tag: "geral" },
        { t: "Revisão final de Estatística e Probabilidade", tag: "estatistica" },
        { t: "Revisão final de Atualidades e IA", tag: "atualidades" },
      ]
    },
    {
      id: "vespera", label: "Véspera", title: "Descanso ativo", dates: "10/10",
      proportion: "zero conteúdo novo",
      focus: "Regra de ouro da reta final: nada de conteúdo novo e nada de simulado pesado. Só revisão relâmpago e descanso.",
      tasks: [
        { t: "Revisão relâmpago — nada de conteúdo novo", tag: "geral" },
        { t: "Descanso ativo — nada de simulado pesado", tag: "geral" },
        { t: "Organizar material e horário do dia da prova", tag: "geral" },
      ]
    },
    {
      id: "boss", label: "BOSS", title: "Prova Dataprev", dates: "11/10 · 13h–17h",
      proportion: "70 questões · 4h",
      focus: "O chefe final da campanha. Módulo I (40 questões, peso 1) + Módulo II (30 questões, peso 2,5). Nota mínima: 57,5/115, nenhuma disciplina zerada.",
      isBoss: true,
      tasks: [
        { t: "Realizar a prova — Cargo 4, Inteligência da Informação", tag: "geral", xp: XP_BOSS },
      ]
    },
  ];

  const RULES = [
    { t: "Nunca deixar uma disciplina do Módulo I a zero de atenção — disciplina zerada elimina o candidato, mesmo com peso 1." },
    { t: "Revisão espaçada: nas 2 primeiras semanas de cada mês, revisar rapidamente o assunto da semana anterior." },
    { t: "Manter o caderno de erros sempre atualizado — é o que transforma questão errada em ponto ganho depois." },
    { t: "Se Deep Learning/TensorFlow exigir mais tempo, tirar das semanas 7–8 (reforço/revisão) — nunca do Módulo I." },
    { t: "Sábado antes da prova (10/10): zero conteúdo novo. Só revisão leve e descanso." },
  ];

  const TOOLKIT = [
    { t: "Montar um caderno personalizado seguindo exatamente o Anexo I do edital (Cargo 4) — um por disciplina." },
    { t: "Filtrar questões pela banca FGV desde a semana 1 — o estilo de enunciado é diferente de CESPE/CESGRANRIO." },
    { t: "Priorizar a prova anterior da Dataprev (2024) — mesma banca, mesma empresa." },
    { t: "Acompanhar as estatísticas de desempenho por assunto toda semana no painel do QConcursos." },
    { t: "A partir da semana 9, treinar com simulados cronometrados completos (70 questões, 4h, sem consulta)." },
  ];

  /* ------------------------------------------------------------------ */
  /* ESTADO / STORAGE                                                    */
  /* ------------------------------------------------------------------ */

  const STORAGE_KEY = "dataprev-quest-save-v1";

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return { completed:{}, streak:{ count:0, lastDate:null } };
      const parsed = JSON.parse(raw);
      return {
        completed: parsed.completed || {},
        streak: parsed.streak || { count:0, lastDate:null }
      };
    }catch(e){
      console.warn("Save corrompido, iniciando novo.", e);
      return { completed:{}, streak:{ count:0, lastDate:null } };
    }
  }

  let state = loadState();

  function saveState(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function todayISO(){
    const d = new Date();
    return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  }

  function bumpStreak(){
    const today = todayISO();
    const last = state.streak.lastDate;
    if(last === today) return;
    if(last){
      const diffDays = Math.round((new Date(today) - new Date(last)) / 86400000);
      state.streak.count = (diffDays === 1) ? state.streak.count + 1 : 1;
    } else {
      state.streak.count = 1;
    }
    state.streak.lastDate = today;
  }

  /* ------------------------------------------------------------------ */
  /* MODELO DERIVADO                                                     */
  /* ------------------------------------------------------------------ */

  // gera IDs únicos e uma lista plana de todas as tasks (semanas + regras + kit)
  const ALL_TASKS = [];
  WEEKS.forEach(w=>{
    w.tasks.forEach((task, i)=>{
      const id = w.id+"-"+i;
      task.id = id;
      task.xp = task.xp || XP_TASK;
      task.week = w.id;
      ALL_TASKS.push(task);
    });
  });
  RULES.forEach((r,i)=>{ r.id = "rule-"+i; r.xp = XP_RULE; ALL_TASKS.push(r); });
  TOOLKIT.forEach((r,i)=>{ r.id = "tool-"+i; r.xp = XP_TOOL; ALL_TASKS.push(r); });

  const TOTAL_XP_POSSIBLE = ALL_TASKS.reduce((sum,t)=>sum+t.xp,0);

  function isDone(id){ return !!state.completed[id]; }

  function currentXP(){
    return ALL_TASKS.reduce((sum,t)=> sum + (isDone(t.id) ? t.xp : 0), 0);
  }

  function levelFromXP(xp){
    const level = Math.min(RANKS.length, Math.floor(xp / XP_PER_LEVEL) + 1);
    return level;
  }

  function disciplineProgress(key){
    const tasks = ALL_TASKS.filter(t=>t.tag === key);
    if(tasks.length === 0) return { done:0, total:0, pct:0 };
    const done = tasks.filter(t=>isDone(t.id)).length;
    return { done, total: tasks.length, pct: Math.round((done/tasks.length)*100) };
  }

  function weekProgress(week){
    const tasks = week.tasks;
    const done = tasks.filter(t=>isDone(t.id)).length;
    return { done, total: tasks.length, pct: tasks.length ? Math.round((done/tasks.length)*100) : 0 };
  }

  /* ------------------------------------------------------------------ */
  /* RENDER — HUD                                                        */
  /* ------------------------------------------------------------------ */

  const $ = sel => document.querySelector(sel);

  function renderHUD(){
    const xp = currentXP();
    const level = levelFromXP(xp);
    const rankName = RANKS[level-1];
    const xpIntoLevel = xp - (level-1)*XP_PER_LEVEL;
    const xpForNext = level >= RANKS.length ? xpIntoLevel : XP_PER_LEVEL;
    const pct = level >= RANKS.length ? 100 : Math.min(100, Math.round((xpIntoLevel/XP_PER_LEVEL)*100));

    $("#levelBadge").textContent = "LV " + level;
    $("#rankName").textContent = rankName;
    $("#xpLabel").textContent = (level>=RANKS.length ? xp+" XP · MÁXIMO" : xpIntoLevel+" / "+xpForNext+" XP");
    $("#xpBar").style.width = pct+"%";
    $("#xpBarWrap").setAttribute("aria-valuenow", pct);

    // progresso geral de missões
    const totalTasks = ALL_TASKS.length;
    const doneTasks = ALL_TASKS.filter(t=>isDone(t.id)).length;
    $("#questPct").textContent = doneTasks+" / "+totalTasks;
    $("#questBar").style.width = Math.round((doneTasks/totalTasks)*100)+"%";

    // progresso de campanha (tempo decorrido)
    const now = new Date();
    const totalSpan = EXAM_DATE - CAMPAIGN_START;
    const elapsed = Math.min(Math.max(now - CAMPAIGN_START, 0), totalSpan);
    const campaignPct = Math.round((elapsed/totalSpan)*100);
    $("#campaignBar").style.width = campaignPct+"%";
    $("#campaignPct").textContent = campaignPct+"%";

    // streak
    $("#streakCount").textContent = "🔥 " + state.streak.count + (state.streak.count===1 ? " dia" : " dias");
  }

  function renderCountdown(){
    const now = new Date();
    let diff = EXAM_DATE - now;
    if(diff < 0) diff = 0;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    $("#cdDays").textContent = String(days).padStart(2,"0");
    $("#cdHours").textContent = String(hours).padStart(2,"0");
    $("#cdMins").textContent = String(mins).padStart(2,"0");
    $("#cdSecs").textContent = String(secs).padStart(2,"0");
  }

  /* ------------------------------------------------------------------ */
  /* RENDER — DISCIPLINAS                                                */
  /* ------------------------------------------------------------------ */

  function renderDisciplines(){
    const boxI = $("#barsModuleI");
    const boxII = $("#barsModuleII");
    boxI.innerHTML = "";
    boxII.innerHTML = "";

    Object.entries(DISCIPLINES).forEach(([key, meta])=>{
      const prog = disciplineProgress(key);
      const row = document.createElement("div");
      row.className = "bar-row" + (prog.done === 0 && prog.total > 0 ? " is-zero" : "");
      row.innerHTML = `
        <div class="bar-row-top">
          <span class="discipline-name">${meta.label} ${prog.done===0 && prog.total>0 ? '<span class="zero-flag">risco</span>' : ''}</span>
          <span class="discipline-pct">${prog.done}/${prog.total} · ${prog.pct}%</span>
        </div>
        <div class="bar-track"><div class="bar-fill${meta.module==="II"?" bar-fill--purple":""}" style="width:${prog.pct}%"></div></div>
      `;
      (meta.module === "I" ? boxI : boxII).appendChild(row);
    });
  }

  /* ------------------------------------------------------------------ */
  /* RENDER — MAPA                                                       */
  /* ------------------------------------------------------------------ */

  function renderMap(){
    const path = $("#mapPath");
    path.innerHTML = "";
    WEEKS.forEach(w=>{
      const prog = weekProgress(w);
      const wrap = document.createElement("div");
      wrap.className = "node-wrap" + (prog.pct===100 ? " is-done" : "") + (w.isBoss ? " is-boss" : "") + (w.id==="vespera" ? " is-vespera" : "");
      wrap.innerHTML = `
        <button class="node-btn" style="--pct:${prog.pct}" data-week="${w.id}" aria-label="Abrir missões de ${w.title}, ${prog.done} de ${prog.total} concluídas">
          <span class="node-inner">
            <span class="node-week">${w.label}</span>
            <span class="node-label">${prog.pct===100 ? "✓" : (w.isBoss ? "☠" : prog.pct+"%")}</span>
            <span class="node-dates">${w.dates}</span>
          </span>
        </button>
      `;
      path.appendChild(wrap);
    });
    path.querySelectorAll(".node-btn").forEach(btn=>{
      btn.addEventListener("click", ()=> openDrawer(btn.dataset.week));
    });
  }

  /* ------------------------------------------------------------------ */
  /* RENDER — REGRAS / KIT                                               */
  /* ------------------------------------------------------------------ */

  function renderChecklist(container, items){
    container.innerHTML = "";
    items.forEach(item=>{
      const li = document.createElement("li");
      li.className = "quest-row" + (isDone(item.id) ? " is-checked" : "");
      li.innerHTML = `
        <input type="checkbox" id="${item.id}" ${isDone(item.id)?"checked":""}>
        <label for="${item.id}">${item.t}</label>
        <span class="xp-tag">+${item.xp} XP</span>
      `;
      container.appendChild(li);
    });
    container.querySelectorAll("input[type=checkbox]").forEach(cb=>{
      cb.addEventListener("change", ()=> toggleTask(cb.id));
    });
  }

  function renderRules(){ renderChecklist($("#rulesList"), RULES); }
  function renderToolkit(){ renderChecklist($("#toolkitList"), TOOLKIT); }

  /* ------------------------------------------------------------------ */
  /* DRAWER DE MISSÃO                                                    */
  /* ------------------------------------------------------------------ */

  let currentWeekId = null;
  const backdrop = $("#drawerBackdrop");
  const drawer = $("#questDrawer");

  function openDrawer(weekId){
    currentWeekId = weekId;
    const w = WEEKS.find(x=>x.id===weekId);
    if(!w) return;
    $("#drawerEyebrow").textContent = w.isBoss ? "BOSS FINAL" : "SEMANA " + w.label.replace("S","");
    $("#drawerTitle").textContent = w.title;
    $("#drawerDates").textContent = w.dates;
    $("#drawerProportion").textContent = w.proportion;
    $("#drawerFocus").textContent = w.focus;
    renderDrawerTasks();
    drawer.classList.add("open");
    backdrop.classList.add("open");
    drawer.setAttribute("aria-hidden","false");
    $("#drawerClose").focus();
  }

  function closeDrawer(){
    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    drawer.setAttribute("aria-hidden","true");
  }

  function renderDrawerTasks(){
    const w = WEEKS.find(x=>x.id===currentWeekId);
    if(!w) return;
    const list = $("#drawerTasks");
    list.innerHTML = "";
    w.tasks.forEach(task=>{
      const li = document.createElement("li");
      li.className = "quest-row" + (isDone(task.id) ? " is-checked" : "");
      li.innerHTML = `
        <input type="checkbox" id="drawer-${task.id}" ${isDone(task.id)?"checked":""}>
        <div>
          <label for="drawer-${task.id}">${task.t}</label><br>
          <span class="tag">${DISCIPLINES[task.tag] ? DISCIPLINES[task.tag].label : "geral"}</span>
        </div>
        <span class="xp-tag">+${task.xp} XP</span>
      `;
      list.appendChild(li);
    });
    list.querySelectorAll("input[type=checkbox]").forEach(cb=>{
      cb.addEventListener("change", ()=> toggleTask(cb.id.replace("drawer-","")));
    });

    const prog = weekProgress(w);
    $("#drawerProgressCount").textContent = prog.done+"/"+prog.total;
    $("#drawerProgressFill").style.width = prog.pct+"%";
  }

  /* ------------------------------------------------------------------ */
  /* AÇÕES                                                                */
  /* ------------------------------------------------------------------ */

  let toastTimer = null;
  function showToast(msg){
    const el = $("#xpToast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> el.classList.remove("show"), 1800);
  }

  function toggleTask(id){
    const task = ALL_TASKS.find(t=>t.id===id);
    if(!task) return;
    const willBeDone = !isDone(id);
    state.completed[id] = willBeDone;
    if(willBeDone){
      bumpStreak();
      showToast((task.xp===XP_BOSS ? "🏆 BOSS DERROTADO! +" : "+ ") + task.xp + " XP");
    }
    saveState();
    renderAll();
    if(drawer.classList.contains("open")) renderDrawerTasks();
  }

  function resetProgress(){
    if(!confirm("Isso vai apagar TODO o progresso salvo neste navegador. Tem certeza?")) return;
    state = { completed:{}, streak:{ count:0, lastDate:null } };
    saveState();
    renderAll();
    closeDrawer();
    showToast("Save reiniciado");
  }

  function exportProgress(){
    const blob = new Blob([JSON.stringify(state, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dataprev-quest-save.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importProgress(file){
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const parsed = JSON.parse(reader.result);
        if(!parsed || typeof parsed !== "object") throw new Error("formato inválido");
        state = {
          completed: parsed.completed || {},
          streak: parsed.streak || { count:0, lastDate:null }
        };
        saveState();
        renderAll();
        showToast("Progresso importado");
      }catch(e){
        alert("Não foi possível ler esse arquivo de save.");
      }
    };
    reader.readAsText(file);
  }

  /* ------------------------------------------------------------------ */
  /* INIT                                                                 */
  /* ------------------------------------------------------------------ */

  function renderAll(){
    renderHUD();
    renderDisciplines();
    renderMap();
    renderRules();
    renderToolkit();
  }

  function init(){
    renderAll();
    renderCountdown();
    setInterval(renderCountdown, 1000);

    $("#drawerClose").addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeDrawer(); });

    $("#resetBtn").addEventListener("click", resetProgress);
    $("#exportBtn").addEventListener("click", exportProgress);
    $("#importInput").addEventListener("change", e=>{
      if(e.target.files[0]) importProgress(e.target.files[0]);
      e.target.value = "";
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();