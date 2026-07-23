/* ============================================================
   EL CAMINO REAL — hub personal (hábitos / UGOH / fitness / extra)
   Todo se guarda en localStorage. 100% offline tras la primera carga.
   ============================================================ */

/* ---------------- Utilidades ---------------- */

const $app = document.getElementById('app');
const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
const fmtDate = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function load(key, fallback) {
  try {
    const raw = localStorage.getItem('cr_' + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem('cr_' + key, JSON.stringify(value));
}

function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------------- Estado ---------------- */

const DB = {
  profile: load('profile', { name: '', onboarded: false, travelMode: false, points: 0 }),
  habits: load('habits', []), // {id,name,category,type:'bool'|'qty',target,flex,archived,goalId}
  habitLogs: load('habitLogs', {}), // {date:{habitId:value}}
  goals: load('goals', []), // {id, title, area}
  ugohIdeas: load('ugohIdeas', []),
  ugohHooks: load('ugohHooks', []),
  ugohVideos: load('ugohVideos', []), // {id,title,hook,dev,close,checklist:[{text,done}],createdAt}
  ugohSeo: load('ugohSeo', []),
  ugohStats: load('ugohStats', []), // {date, subs, views}
  ugohNotes: load('ugohNotes', []), // {id, videoTitle, text, date}
  ugohGoals: load('ugohGoals', []), // {id,label,current,target}
  ugohTimes: load('ugohTimes', []), // {id, video, record, edit, thumb}
  workouts: load('workouts', []), // {id,date,name,exercises:[{name,sets:[{reps,weight}]}],feeling,notes}
  routines: load('routines', []), // {id,name,exercises:[names]}
  bodyweight: load('bodyweight', []), // {date, kg}
  recoveryPhases: load('recoveryPhases', []), // {id,title,date,done}
  deloads: load('deloads', []), // {date}
  physicalGoals: load('physicalGoals', []), // {id,label,current,target}
  nutrition: load('nutrition', {}), // {date:{water,protein}}
  phaseTarget: load('phaseTarget', { label: 'Vuelta a serio en octubre', current: '', target: '' }),
  countdowns: load('countdowns', []), // {id,label,date}
  contacts: load('contacts', []), // {id,name,note,phone}
  rewards: load('rewards', { unlocked: [] }),
  pomodoro: load('pomodoro', { minutes: 25 }),
  moods: load('moods', {}), // {date: 'emoji'}
  mealIdeas: load('mealIdeas', []), // {id, text, type} type: desayuno/comida/cena/snack
  tasks: load('tasks', []), // {id, date, text, time, done}
  nereaEpisodes: load('nereaEpisodes', []), // {id, date, time, trigger, intensity(1-5), protocol:'si'|'medias'|'no', note}
  minimalDays: load('minimalDays', {}), // {date: [selectedIds]}
  dailyMove: load('dailyMove', {}), // {date: text}
  brainrotBank: load('brainrotBank', [
    'Estira 2 minutos',
    'Bebe un vaso de agua',
    'Escribe una idea para UGOH, aunque sea mala',
    'Manda un mensaje a tu pareja',
    'Haz 20 flexiones o sentadillas',
    'Sal a caminar 5 minutos',
    'Ordena una cosa de tu escritorio',
    'Apunta algo en tu diario',
  ]),
  brainrotLog: load('brainrotLog', []), // {id, date, time, resisted: bool}
  dayPlan: load('dayPlan', {}), // {date: [habitIds selected for that day]}
  breathingLog: load('breathingLog', []), // {id, date, time, technique, before, after, note}
};

function persist(key) {
  save(key, DB[key]);
}

/* ---------------- Frases motivacionales ---------------- */

const QUOTES = [
  'El camino real no tiene atajos, solo repeticiones.',
  'Hoy no hace falta motivación, hace falta el primer paso.',
  'Pequeño y constante gana a grande y esporádico.',
  'Nadie ve el proceso, todos ven el resultado.',
  'La disciplina es elegir entre lo que quieres ahora y lo que quieres de verdad.',
  'Un día más en el camino es un día menos en la pantalla.',
  'No necesitas sentirte listo, necesitas empezar.',
  'La versión de ti que quieres ser se construye hoy, no mañana.',
  'Cada hábito cumplido es un voto por quién quieres ser.',
  'El progreso real casi nunca se nota de un día para otro.',
];
function quoteOfDay() {
  const d = new Date();
  const idx = (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()) % QUOTES.length;
  return QUOTES[idx];
}

const IDENTITY_QUOTES = [
  'Cada hábito es un voto por la persona que quieres ser.',
  'Hoy has avanzado por EL CAMINO REAL.',
  'La constancia supera a la perfección.',
  'No busques hacerlo perfecto. Busca volver al camino.',
];
function identityToast() {
  toast(IDENTITY_QUOTES[Math.floor(Math.random() * IDENTITY_QUOTES.length)]);
}

const SHIKAMARU_QUOTES = [
  'Qué problemático... pero lo hago igual.',
  'No hace falta mover todas las piezas, solo la que importa.',
  'Pensar antes de moverte también es avanzar.',
  'Ahorra energía para lo que de verdad pesa.',
  'No todo merece tu esfuerzo completo.',
  'Un buen estratega elige sus batallas, no las libra todas.',
  'Parar a mirar las nubes no es perder el tiempo, es no perder la cabeza.',
  'Hacer poco pero justo también es avanzar por el camino.',
];
function shikamaruQuoteOfDay() {
  const d = new Date();
  const idx = (d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate() + 3) % SHIKAMARU_QUOTES.length;
  return SHIKAMARU_QUOTES[idx];
}

/* Niveles de impacto de un hábito. */
const LEVELS = [
  { id: 'nucleo', label: 'Núcleo', icon: '⭐', hint: 'Define quién quieres ser' },
  { id: 'mini', label: 'Mini hábitos', icon: '🔹', hint: 'Pequeños apoyos que sostienen lo importante' },
];
function levelMeta(id) {
  return LEVELS.find((l) => l.id === id) || LEVELS[2];
}

/* ---------------- Sheet (formulario modal) ---------------- */

function openSheet(title, bodyHtml, onMount) {
  closeSheet();
  const backdrop = document.createElement('div');
  backdrop.className = 'sheet-backdrop';
  backdrop.innerHTML = `<div class="sheet"><h3>${esc(title)}</h3><div class="sheet-body">${bodyHtml}</div></div>`;
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeSheet();
  });
  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('open'));
  if (onMount) onMount(backdrop.querySelector('.sheet-body'));
  return backdrop;
}
function closeSheet() {
  const b = document.querySelector('.sheet-backdrop');
  if (b) {
    b.classList.remove('open');
    setTimeout(() => b.remove(), 250);
  }
}

/* ---------------- Router ---------------- */

const SECTIONS = [
  { id: 'habitos', label: 'HÁBITOS', sub: 'El camino, día a día' },
  { id: 'ugoh', label: 'UGOH', sub: 'El camino real · contenido' },
  { id: 'fitness', label: 'FITNESS', sub: 'Cuerpo y disciplina' },
  { id: 'nerea', label: 'NEREA', sub: 'Confianza en acción' },
  { id: 'extra', label: 'SHIKAMARU', sub: 'Esfuerzo mínimo, movimiento justo' },
];

let activeSlide = 0;

function render() {
  if (!DB.profile.onboarded) {
    renderOnboarding();
    return;
  }
  $app.innerHTML = `
    <div class="top-greeting">
      <button id="searchBtn" style="pointer-events:auto;font-size:15px;background:var(--surface);width:32px;height:32px;border-radius:50%;border:1px solid var(--line);">🔍</button>
      <div class="name">${esc(DB.profile.name || 'Tú')}</div>
      <div class="quote">${esc(quoteOfDay())}</div>
    </div>
    <div class="home" id="home">
      ${SECTIONS.map(
        (s, i) => `
        <div class="slide" data-i="${i}">
          <div class="slide-word display">${s.label}</div>
          <div class="slide-sub">${s.sub}</div>
          <div class="slide-tap">Toca para abrir</div>
          <button class="slide-hit" data-open="${s.id}" aria-label="Abrir ${s.label}"></button>
        </div>`
      ).join('')}
    </div>
    <div class="path-wrap">
      <span class="path-label">01</span>
      <div class="path-track"><div class="path-fill" id="pathFill"></div></div>
      <span class="path-label">04</span>
    </div>
    <div id="sectionRoot"></div>
  `;

  const home = document.getElementById('home');
  home.addEventListener('scroll', () => {
    const i = Math.round(home.scrollLeft / home.clientWidth);
    activeSlide = i;
    updatePath();
  });
  updatePath();

  $app.querySelectorAll('[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => openSection(btn.dataset.open));
  });
  document.getElementById('searchBtn').addEventListener('click', globalSearch);
}

function globalSearch() {
  openSheet(
    'Buscar en todo',
    `<input id="gSearch" placeholder="Escribe para buscar..." />
     <div id="gResults" class="mt"></div>`,
    (body) => {
      const input = body.querySelector('#gSearch');
      const results = body.querySelector('#gResults');
      input.focus();
      const run = () => {
        const q = input.value.trim().toLowerCase();
        if (!q) {
          results.innerHTML = '';
          return;
        }
        const hits = [];
        DB.habits.forEach((h) => h.name.toLowerCase().includes(q) && hits.push({ cat: 'Hábito', text: h.name }));
        DB.ugohIdeas.forEach((i) => i.text.toLowerCase().includes(q) && hits.push({ cat: 'Idea UGOH', text: i.text }));
        DB.ugohHooks.forEach((h) => h.text.toLowerCase().includes(q) && hits.push({ cat: 'Hook', text: h.text }));
        DB.ugohVideos.forEach((v) => v.title.toLowerCase().includes(q) && hits.push({ cat: 'Vídeo', text: v.title }));
        DB.workouts.forEach((w) => {
          if ((w.name || '').toLowerCase().includes(q)) hits.push({ cat: 'Entreno', text: `${w.name} · ${fmtDate(w.date)}` });
          (w.exercises || []).forEach((e) => e.name.toLowerCase().includes(q) && hits.push({ cat: 'Ejercicio', text: `${e.name} · ${fmtDate(w.date)}` }));
        });
        DB.countdowns.forEach((c) => c.label.toLowerCase().includes(q) && hits.push({ cat: 'Fecha clave', text: c.label }));
        DB.contacts.forEach((c) => c.name.toLowerCase().includes(q) && hits.push({ cat: 'Contacto', text: c.name }));
        DB.mealIdeas.forEach((m) => m.text.toLowerCase().includes(q) && hits.push({ cat: 'Comida', text: m.text }));
        results.innerHTML =
          hits
            .slice(0, 30)
            .map((h) => `<div class="card"><span class="pill">${esc(h.cat)}</span><div class="mt">${esc(h.text)}</div></div>`)
            .join('') || `<div class="card-sub" style="text-align:center;">Sin resultados</div>`;
      };
      input.addEventListener('input', run);
    }
  );
}

function updatePath() {
  const fill = document.getElementById('pathFill');
  if (!fill) return;
  const pct = 100 / SECTIONS.length;
  fill.style.width = pct + '%';
  fill.style.left = activeSlide * pct + '%';
}

const SECTION_TOOLS = {
  habitos: [
    { id: 'hoy', label: 'Hoy', icon: '✓', hint: 'Marca tus hábitos de hoy' },
    { id: 'lista', label: 'Hábitos', icon: '📋', hint: 'Crea, edita y organiza' },
    { id: 'plan', label: 'Plan diario', icon: '🗒️', hint: 'Elige qué toca cada día' },
    { id: 'antibrainrot', label: 'Antibrainrot', icon: '📵', hint: 'Cuando quieras scrollear' },
    { id: 'resumen', label: 'Resumen semanal', icon: '📊', hint: 'Cómo va tu semana' },
    { id: 'calendario', label: 'Calendario', icon: '🗓️', hint: 'Vista mensual completa' },
    { id: 'stats', label: 'Estadísticas', icon: '📈', hint: 'Consistencia y ánimo' },
    { id: 'archivo', label: 'Archivo', icon: '🗄️', hint: 'Hábitos pausados' },
  ],
  ugoh: [
    { id: 'ideas', label: 'Ideas', icon: '💡', hint: 'Banco de ideas sueltas' },
    { id: 'videos', label: 'Vídeos', icon: '🎬', hint: 'Guion y producción' },
    { id: 'hooks', label: 'Hooks', icon: '🪝', hint: 'Ganchos guardados' },
    { id: 'stats', label: 'Subs / Views', icon: '📈', hint: 'Evolución del canal' },
    { id: 'seo', label: 'SEO', icon: '🏷️', hint: 'Tags y keywords' },
    { id: 'metas', label: 'Metas', icon: '🎯', hint: 'Objetivos del canal' },
    { id: 'camino', label: 'El camino real', icon: '🧭', hint: 'Misión y tiempos' },
  ],
  fitness: [
    { id: 'log', label: 'Entrenos', icon: '📝', hint: 'Registra tu sesión' },
    { id: 'carga', label: 'Sobrecarga', icon: '📶', hint: 'Qué levantar hoy' },
    { id: 'rutinas', label: 'Rutinas', icon: '🗂️', hint: 'Plantillas guardadas' },
    { id: 'peso', label: 'Peso', icon: '⚖️', hint: 'Evolución corporal' },
    { id: 'timer', label: 'Descanso', icon: '⏱️', hint: 'Cronómetro entre series' },
    { id: 'recuperacion', label: 'Recuperación', icon: '🩹', hint: 'Fases y objetivo' },
    { id: 'metas', label: 'Metas', icon: '🏆', hint: 'Marcas físicas' },
    { id: 'comidas', label: 'Comidas', icon: '🍽️', hint: 'Ideas y antiazúcar' },
  ],
  extra: [
    { id: 'mentalidad', label: 'Mentalidad', icon: '☁️', hint: 'Léelo cada día' },
    { id: 'minimo', label: 'Jugada mínima', icon: '♟️', hint: 'Modo mínimo viable' },
    { id: 'frentes', label: 'Frentes activos', icon: '📡', hint: 'Cuánto tienes abierto' },
    { id: 'jugada', label: 'Jugada del día', icon: '🀄', hint: 'Una sola cosa que importó' },
    { id: 'nubes', label: 'Mirar las nubes', icon: '🌥️', hint: 'Parar a propósito' },
    { id: 'respirar', label: 'Respirar', icon: '🫁', hint: 'Técnicas guiadas y registro' },
  ],
  nerea: [{ id: 'principal', label: 'Protocolo y registro', icon: '💙', hint: 'Todo en un sitio' }],
};

const TOOL_RENDERERS = {
  habitos: { hoy: renderHabitosHoy, lista: renderHabitosLista, plan: renderHabitosPlan, antibrainrot: renderAntibrainrot, resumen: renderHabitosResumen, calendario: renderHabitosCal, stats: renderHabitosStats, archivo: renderHabitosArchivo },
  ugoh: { ideas: renderUgohIdeas, videos: renderUgohVideos, hooks: renderUgohHooks, stats: renderUgohStats, seo: renderUgohSeo, metas: renderUgohMetas, camino: renderUgohCamino },
  fitness: { log: renderFitLog, carga: renderFitOverload, rutinas: renderFitRoutines, peso: renderFitWeight, timer: renderFitTimer, recuperacion: renderFitRecovery, metas: renderFitGoals, comidas: renderFitMeals },
  extra: { mentalidad: renderShikaMentalidad, minimo: renderShikaMinimo, frentes: renderShikaFrentes, jugada: renderShikaJugada, nubes: renderShikaNubes, respirar: renderShikaRespirar },
  nerea: { principal: renderNereaMain },
};

let currentSection = null;
let currentTool = null;

function openSection(id) {
  currentSection = id;
  const tools = SECTION_TOOLS[id];
  currentTool = tools.length === 1 ? tools[0].id : null;
  renderSectionShell(true);
}
function closeSection() {
  const v = document.getElementById('sectionView');
  if (v) {
    v.classList.remove('open');
    setTimeout(() => (document.getElementById('sectionRoot').innerHTML = ''), 400);
  }
  currentSection = null;
  currentTool = null;
}

function renderSectionShell(isFirstOpen) {
  const meta = SECTIONS.find((s) => s.id === currentSection);
  const tools = SECTION_TOOLS[currentSection];
  const singleTool = tools.length === 1;
  const atMenu = !currentTool;
  const root = document.getElementById('sectionRoot');
  const title = atMenu ? meta.label : tools.find((t) => t.id === currentTool).label;

  if (isFirstOpen) {
    root.innerHTML = `
      <div class="section-view" id="sectionView">
        <div class="section-header">
          <button class="back-btn" id="backBtn">‹</button>
          <h1 id="sectionTitle">${title}</h1>
        </div>
        <div class="section-body" id="sectionBody"></div>
      </div>
    `;
    requestAnimationFrame(() => document.getElementById('sectionView').classList.add('open'));
  } else {
    document.getElementById('sectionTitle').textContent = title;
    document.getElementById('sectionBody').scrollTop = 0;
  }
  document.getElementById('backBtn').onclick = () => {
    if (currentTool && !singleTool) {
      currentTool = null;
      renderSectionShell(false);
    } else {
      closeSection();
    }
  };
  const body = document.getElementById('sectionBody');
  if (atMenu) {
    renderToolMenu(body, tools);
  } else {
    TOOL_RENDERERS[currentSection][currentTool](body);
  }
}

function renderToolMenu(body, tools) {
  body.innerHTML = `<div class="tool-grid">${tools
    .map(
      (t) => `
    <button class="tool-btn" data-tool="${t.id}">
      <div class="tool-icon">${t.icon}</div>
      <div class="tool-label">${t.label}</div>
      <div class="tool-hint">${t.hint}</div>
    </button>`
    )
    .join('')}</div>`;
  body.querySelectorAll('[data-tool]').forEach((b) =>
    b.addEventListener('click', () => {
      currentTool = b.dataset.tool;
      renderSectionShell(false);
    })
  );
}

/* ---------------- Onboarding ---------------- */

function renderOnboarding() {
  $app.innerHTML = `
    <div class="slide" style="height:100dvh;padding:32px;">
      <div class="display" style="font-size:15vw;">EL CAMINO<br/>REAL</div>
      <div class="slide-sub mt" style="margin-bottom:30px;">Tu hub personal</div>
      <div style="width:100%;max-width:340px;" class="stack">
        <div class="field">
          <label class="field-label">¿Cómo te llamas?</label>
          <input id="obName" placeholder="Máximo" />
        </div>
        <div class="field">
          <label class="field-label">¿Cuál es tu objetivo ahora mismo?</label>
          <input id="obGoal" placeholder="Ej. volver a entrenar fuerte en octubre" />
        </div>
        <button class="btn btn-accent" id="obStart" style="padding:14px;">Empezar</button>
      </div>
    </div>
  `;
  document.getElementById('obStart').addEventListener('click', () => {
    const name = document.getElementById('obName').value.trim() || 'Tú';
    const goal = document.getElementById('obGoal').value.trim();
    DB.profile.name = name;
    DB.profile.onboarded = true;
    persist('profile');
    if (goal) {
      DB.goals.push({ id: uid(), title: goal, area: 'general' });
      persist('goals');
    }
    render();
  });
}

/* ============================================================
   HÁBITOS
   ============================================================ */

let habitosTab = 'hoy';

function renderHabitos(el) {
  const tools = [
    { id: 'hoy', label: 'Hoy' },
    { id: 'lista', label: 'Hábitos' },
    { id: 'resumen', label: 'Resumen semanal' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'stats', label: 'Estadísticas' },
    { id: 'archivo', label: 'Archivo' },
  ];
  el.innerHTML = `
    ${tabsHtml(tools, habitosTab)}
    <div id="habitosPanel"></div>
  `;
  wireTabs(el, tools, (t) => {
    habitosTab = t;
    renderHabitos(el);
  });
  const panel = document.getElementById('habitosPanel');
  ({
    hoy: renderHabitosHoy,
    lista: renderHabitosLista,
    resumen: renderHabitosResumen,
    calendario: renderHabitosCal,
    stats: renderHabitosStats,
    archivo: renderHabitosArchivo,
  }[habitosTab])(panel);
}

function activeHabits() {
  return DB.habits.filter((h) => !h.archived);
}
function habitsAtLevel(levelId, list) {
  return (list || activeHabits()).filter((h) => (h.level || 'mini') === levelId);
}

// Migración: vuelta al sistema de 2 niveles. 'importante' y 'complementario' pasan a 'mini'.
(function migrateLevels() {
  let changed = false;
  DB.habits.forEach((h) => {
    if (h.level === 'importante' || h.level === 'complementario' || !h.level) {
      h.level = h.level === 'nucleo' ? 'nucleo' : 'mini';
      changed = true;
    }
    if ('points' in h) {
      delete h.points;
      changed = true;
    }
  });
  if (changed) persist('habits');
})();

function habitStreak(h) {
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const d = daysAgo(i);
    const plan = DB.dayPlan[d];
    if (plan && !plan.includes(h.id)) continue; // no estaba en el plan de ese día, no cuenta ni rompe
    const minimalSelection = DB.minimalDays[d];
    if (minimalSelection && !minimalSelection.includes(h.id)) continue; // en pausa por modo mínimo ese día, no cuenta ni rompe
    const log = DB.habitLogs[d];
    const done = log && log[h.id] && (h.type === 'bool' ? log[h.id] === true : log[h.id] >= (h.target || 1));
    if (done) streak++;
    else {
      if (i === 0) continue; // no penalizar el día de hoy si aún no se ha marcado
      break;
    }
  }
  return streak;
}

let hoyCollapse = { nucleo: false, mini: false };

function taskForm(existing) {
  const isEdit = !!existing;
  openSheet(
    isEdit ? 'Editar tarea' : 'Nueva tarea de hoy',
    `
    <div class="field"><label class="field-label">¿Qué tienes que hacer?</label><input id="tText" placeholder="Llamar al médico, responder email..." value="${esc(existing?.text || '')}" /></div>
    <div class="field"><label class="field-label">Hora (opcional)</label><input id="tTime" type="time" value="${esc(existing?.time || '')}" /></div>
    <button class="btn btn-accent" id="tSave" style="width:100%;padding:12px;">${isEdit ? 'Guardar' : 'Añadir'}</button>
  `,
    (body) =>
      body.querySelector('#tSave').addEventListener('click', () => {
        const text = body.querySelector('#tText').value.trim();
        if (!text) return toast('Escribe qué tienes que hacer');
        const time = body.querySelector('#tTime').value;
        if (isEdit) {
          existing.text = text;
          existing.time = time;
        } else {
          DB.tasks.push({ id: uid(), date: todayStr(), text, time, done: false });
        }
        persist('tasks');
        closeSheet();
        renderHabitosHoy(document.getElementById('sectionBody'));
      })
  );
}

function renderHabitosHoy(el) {
  const allActive = activeHabits();
  const today = todayStr();
  const log = DB.habitLogs[today] || {};
  const quote = quoteOfDay();
  const moodOptions = ['😴', '😐', '🙂', '🔥', '😤'];
  const currentMood = DB.moods[today];
  const todayTasks = DB.tasks.filter((t) => t.date === today);
  const nowHM = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
  const minimalSelection = DB.minimalDays[today];
  const todayPlan = DB.dayPlan[today];
  const afterPlan = todayPlan ? allActive.filter((h) => todayPlan.includes(h.id)) : allActive;
  const list = minimalSelection ? afterPlan.filter((h) => minimalSelection.includes(h.id)) : afterPlan;
  const pausedCount = minimalSelection ? afterPlan.length - list.length : 0;
  const notPlannedCount = todayPlan ? allActive.length - afterPlan.length : 0;

  function isDone(h) {
    const val = log[h.id];
    return h.type === 'bool' ? val === true : (val || 0) >= (h.target || 1);
  }

  const scheduledHabits = list.filter((h) => h.time);
  const unscheduledHabits = list.filter((h) => !h.time);
  const scheduledTasks = todayTasks.filter((t) => t.time);
  const unscheduledTasks = todayTasks.filter((t) => !t.time);

  const timeline = [
    ...scheduledHabits.map((h) => ({ kind: 'habit', time: h.time, ref: h })),
    ...scheduledTasks.map((t) => ({ kind: 'task', time: t.time, ref: t })),
  ].sort((a, b) => (a.time < b.time ? -1 : 1));

  let nowInserted = false;
  const timelineRows = [];
  timeline.forEach((item) => {
    if (!nowInserted && item.time >= nowHM) {
      timelineRows.push({ nowMarker: true });
      nowInserted = true;
    }
    timelineRows.push(item);
  });
  if (!nowInserted) timelineRows.push({ nowMarker: true });

  function timelineRow(item) {
    if (item.nowMarker) return `<div class="timeline-now"><span></span>ahora · ${nowHM}<span></span></div>`;
    if (item.kind === 'habit') {
      const h = item.ref;
      const done = isDone(h);
      return `
        <div class="timeline-item">
          <div class="timeline-time">${h.time}</div>
          <div class="timeline-dot ${done ? 'done' : ''}"></div>
          <div class="card ${h.level === 'nucleo' ? 'core-card' : 'mini-card'}" style="flex:1;">
            <div class="row between">
              <div class="row" style="gap:12px;">
                <button class="checkbox ${done ? 'checked' : ''}" data-toggle="${h.id}">${done ? '✓' : ''}</button>
                <div>
                  <div class="card-title" data-detail="${h.id}" style="cursor:pointer;">${esc(h.name)} <span style="color:var(--muted);font-size:11px;">ⓘ</span></div>
                  <div class="card-sub">${h.category ? esc(h.category) : (h.level === 'nucleo' ? 'Núcleo' : 'Mini')}</div>
                </div>
              </div>
              ${h.type === 'qty' ? `<button class="btn" data-qty="${h.id}">+${h.step || 1}</button>` : ''}
            </div>
          </div>
        </div>`;
    }
    const t = item.ref;
    return `
      <div class="timeline-item">
        <div class="timeline-time">${t.time}</div>
        <div class="timeline-dot ${t.done ? 'done' : ''}"></div>
        <div class="card" style="flex:1;">
          <div class="row between">
            <div class="row" style="gap:12px;">
              <button class="checkbox ${t.done ? 'checked' : ''}" data-tasktoggle="${t.id}">${t.done ? '✓' : ''}</button>
              <div class="card-title">${esc(t.text)}</div>
            </div>
            <button class="btn-ghost" data-taskdel="${t.id}">✕</button>
          </div>
        </div>
      </div>`;
  }

  function habitCard(h) {
    const done = isDone(h);
    const streak = habitStreak(h);
    return `
    <div class="card ${h.level === 'nucleo' ? 'core-card' : 'mini-card'}" data-habit="${h.id}">
      <div class="row between">
        <div class="row" style="gap:12px;">
          <button class="checkbox ${done ? 'checked' : ''}" data-toggle="${h.id}">${done ? '✓' : ''}</button>
          <div>
            <div class="card-title" data-detail="${h.id}" style="cursor:pointer;">${esc(h.name)} <span style="color:var(--muted);font-size:11px;">ⓘ</span></div>
            <div class="card-sub">${h.category ? esc(h.category) + ' · ' : ''}${
      h.type === 'qty' ? `${log[h.id] || 0}/${h.target} ${esc(h.unit || '')}` : streak > 0 ? `🔥 ${streak} días seguidos` : 'empieza hoy tu racha'
    }</div>
            ${h.notes ? `<div class="card-sub" style="font-style:italic;margin-top:2px;">${esc(h.notes)}</div>` : ''}
          </div>
        </div>
        ${h.type === 'qty' ? `<button class="btn" data-qty="${h.id}">+${h.step || 1}</button>` : ''}
      </div>
    </div>`;
  }

  function levelSection(level) {
    const habits = habitsAtLevel(level.id, unscheduledHabits);
    const collapsed = hoyCollapse[level.id];
    const doneCount = habits.filter(isDone).length;
    return `
      <button class="section-toggle" data-collapse="${level.id}">
        <span class="section-label" style="margin:0;">${level.icon} ${level.label}</span>
        <span class="row" style="gap:8px;">
          <span class="card-sub">${doneCount}/${habits.length}</span>
          <span class="chevron ${collapsed ? '' : 'open'}">▾</span>
        </span>
      </button>
      <div class="card-sub" style="margin:-2px 0 8px;">${level.hint}</div>
      <div class="${collapsed ? 'collapsed' : ''}">
        ${habits.map(habitCard).join('') || `<div class="card-sub mb">Sin hábitos en este nivel.</div>`}
      </div>
    `;
  }

  el.innerHTML = `
    <div class="card" style="text-align:center;border-color:var(--accent);">
      <div class="card-sub" style="font-style:italic;">"${esc(quote)}"</div>
    </div>
    ${
      minimalSelection
        ? `<div class="card row between" style="border-color:var(--accent);background:rgba(255,90,31,0.08);">
      <div><div class="card-title">♟️ Modo mínimo activo</div><div class="card-sub">${pausedCount} hábito${pausedCount === 1 ? '' : 's'} en pausa hoy, sin romper racha.</div></div>
      <button class="btn" id="deactivateMinimal">Desactivar</button>
    </div>`
        : ''
    }
    ${
      todayPlan && notPlannedCount > 0
        ? `<div class="card"><div class="card-sub">🗒️ Plan de hoy: ${notPlannedCount} hábito${notPlannedCount === 1 ? '' : 's'} no toca${notPlannedCount === 1 ? '' : 'n'} hoy según lo que planificaste.</div></div>`
        : ''
    }
    <div class="card">
      <div class="card-sub mb" style="text-align:center;">¿Cómo llegas hoy?</div>
      <div class="row" style="justify-content:center;gap:10px;">
        ${moodOptions
          .map(
            (m) =>
              `<button data-mood="${m}" style="font-size:26px;padding:6px 10px;border-radius:12px;background:${m === currentMood ? 'var(--surface-2)' : 'transparent'};border:1px solid ${m === currentMood ? 'var(--accent)' : 'transparent'};">${m}</button>`
          )
          .join('')}
      </div>
    </div>

    <div class="row between">
      <span class="section-label" style="margin-top:14px;">Tu día</span>
      <button class="btn" id="addTask" style="margin-top:10px;">+ Tarea</button>
    </div>
    ${
      timeline.length
        ? `<div class="timeline">${timelineRows.map(timelineRow).join('')}</div>`
        : `<div class="card-sub mb">Sin nada programado a una hora concreta. Añade una tarea o ponle hora a un hábito desde "Editar".</div>`
    }

    ${
      unscheduledTasks.length
        ? `<div class="section-label">Tareas sin hora</div>${unscheduledTasks
            .map(
              (t) => `
      <div class="card row between">
        <div class="row" style="gap:12px;"><button class="checkbox ${t.done ? 'checked' : ''}" data-tasktoggle="${t.id}">${t.done ? '✓' : ''}</button><span>${esc(t.text)}</span></div>
        <button class="btn-ghost" data-taskdel="${t.id}">✕</button>
      </div>`
            )
            .join('')}`
        : ''
    }

    ${LEVELS.map(levelSection).join('')}
  `;
  document.getElementById('addTask').addEventListener('click', () => taskForm());
  if (document.getElementById('deactivateMinimal')) {
    document.getElementById('deactivateMinimal').addEventListener('click', () => {
      delete DB.minimalDays[today];
      persist('minimalDays');
      toast('Modo mínimo desactivado');
      renderHabitosHoy(el);
    });
  }
  el.querySelectorAll('[data-mood]').forEach((b) =>
    b.addEventListener('click', () => {
      DB.moods[today] = b.dataset.mood;
      persist('moods');
      renderHabitosHoy(el);
    })
  );
  el.querySelectorAll('[data-collapse]').forEach((b) =>
    b.addEventListener('click', () => {
      hoyCollapse[b.dataset.collapse] = !hoyCollapse[b.dataset.collapse];
      renderHabitosHoy(el);
    })
  );
  el.querySelectorAll('[data-detail]').forEach((b) =>
    b.addEventListener('click', () => habitDetailSheet(DB.habits.find((x) => x.id === b.dataset.detail)))
  );
  el.querySelectorAll('[data-tasktoggle]').forEach((b) =>
    b.addEventListener('click', () => {
      const t = DB.tasks.find((x) => x.id === b.dataset.tasktoggle);
      t.done = !t.done;
      persist('tasks');
      renderHabitosHoy(el);
    })
  );
  el.querySelectorAll('[data-taskdel]').forEach((b) =>
    b.addEventListener('click', () => {
      DB.tasks = DB.tasks.filter((x) => x.id !== b.dataset.taskdel);
      persist('tasks');
      renderHabitosHoy(el);
    })
  );
  function afterComplete() {
    const nowLog = DB.habitLogs[today] || {};
    const core = habitsAtLevel('nucleo', list);
    const allCoreDone = core.length > 0 && core.every((h) => (h.type === 'bool' ? nowLog[h.id] === true : (nowLog[h.id] || 0) >= (h.target || 1)));
    if (allCoreDone) toast('Hoy has avanzado por EL CAMINO REAL.');
    else identityToast();
  }
  el.querySelectorAll('[data-toggle]').forEach((b) =>
    b.addEventListener('click', () => {
      const id = b.dataset.toggle;
      DB.habitLogs[today] = DB.habitLogs[today] || {};
      const cur = DB.habitLogs[today][id];
      const willComplete = !(cur === true);
      DB.habitLogs[today][id] = willComplete ? true : false;
      if (willComplete) afterComplete();
      persist('habitLogs');
      renderHabitosHoy(el);
    })
  );
  el.querySelectorAll('[data-qty]').forEach((b) =>
    b.addEventListener('click', () => {
      const id = b.dataset.qty;
      const h = DB.habits.find((x) => x.id === id);
      DB.habitLogs[today] = DB.habitLogs[today] || {};
      const cur = DB.habitLogs[today][id] || 0;
      const wasComplete = cur >= (h.target || 1);
      DB.habitLogs[today][id] = cur + (h.step || 1);
      const nowComplete = DB.habitLogs[today][id] >= (h.target || 1);
      if (nowComplete && !wasComplete) afterComplete();
      persist('habitLogs');
      renderHabitosHoy(el);
    })
  );
}

function renderHabitosLista(el) {
  function row(h) {
    return `
      <div class="card">
        <div class="row between">
          <div>
            <div class="card-title" data-detail="${h.id}" style="cursor:pointer;">${esc(h.name)} <span style="color:var(--muted);font-size:11px;">ⓘ</span></div>
            <div class="card-sub">${esc(h.category || 'General')} · ${h.type === 'qty' ? `objetivo ${h.target} ${esc(h.unit || '')}` : h.flex ? 'flexible' : 'todo o nada'}${h.time ? ` · ⏰ ${h.time}` : ''}</div>
            ${h.notes ? `<div class="card-sub mt" style="font-style:italic;">${esc(h.notes)}</div>` : ''}
          </div>
        </div>
        <div class="row between mt">
          <div class="move-btns">
            ${LEVELS.map((l) => `<button class="move-btn ${h.level === l.id ? 'current' : ''}" data-move="${h.id}" data-level="${l.id}" title="Mover a ${l.label}">${l.icon}</button>`).join('')}
          </div>
          <div class="row" style="gap:6px;">
            <button class="btn" data-edit="${h.id}">Editar</button>
            <button class="btn-ghost" data-archive="${h.id}">Archivar</button>
            <button class="btn-ghost" data-delete="${h.id}" style="color:var(--warn);">Borrar</button>
          </div>
        </div>
      </div>`;
  }
  el.innerHTML = `
    <button class="btn btn-accent mb" id="addHabit" style="width:100%;padding:12px;">+ Nuevo hábito</button>
    <div class="card-sub mb">Toca uno de los iconos de cada tarjeta para moverla de categoría al instante.</div>
    <div class="level-board">
      ${LEVELS.map(
        (l) => `
        <div>
          <div class="level-column-header">
            <span class="section-label" style="margin-top:0;">${l.icon} ${l.label}</span>
            <span class="card-sub">${habitsAtLevel(l.id).length}</span>
          </div>
          <div class="card-sub mb" style="margin-top:-4px;">${l.hint}</div>
          ${habitsAtLevel(l.id).map(row).join('') || `<div class="card-sub mb">Sin hábitos aquí todavía.</div>`}
        </div>`
      ).join('')}
    </div>
  `;
  document.getElementById('addHabit').addEventListener('click', () => habitForm());
  el.querySelectorAll('[data-detail]').forEach((b) =>
    b.addEventListener('click', () => habitDetailSheet(DB.habits.find((x) => x.id === b.dataset.detail)))
  );
  el.querySelectorAll('[data-edit]').forEach((b) =>
    b.addEventListener('click', () => habitForm(DB.habits.find((x) => x.id === b.dataset.edit)))
  );
  el.querySelectorAll('[data-move]').forEach((b) =>
    b.addEventListener('click', () => {
      const h = DB.habits.find((x) => x.id === b.dataset.move);
      h.level = b.dataset.level;
      persist('habits');
      renderHabitosLista(el);
    })
  );
  el.querySelectorAll('[data-archive]').forEach((b) =>
    b.addEventListener('click', () => {
      const h = DB.habits.find((x) => x.id === b.dataset.archive);
      h.archived = true;
      persist('habits');
      renderHabitosLista(el);
    })
  );
  el.querySelectorAll('[data-delete]').forEach((b) =>
    b.addEventListener('click', () => {
      const h = DB.habits.find((x) => x.id === b.dataset.delete);
      if (!confirm(`¿Borrar "${h.name}" definitivamente? No se puede deshacer.`)) return;
      DB.habits = DB.habits.filter((x) => x.id !== h.id);
      Object.keys(DB.habitLogs).forEach((date) => delete DB.habitLogs[date][h.id]);
      persist('habits');
      persist('habitLogs');
      toast('Hábito borrado');
      renderHabitosLista(el);
    })
  );
}

function habitForm(existing) {
  const isEdit = !!existing;
  openSheet(
    isEdit ? 'Editar hábito' : 'Nuevo hábito — un voto por quien quieres ser',
    `
    <div class="field"><label class="field-label">Nombre</label><input id="hName" placeholder="Leer, beber agua, gym..." value="${esc(existing?.name || '')}" /></div>
    <div class="field"><label class="field-label">Categoría</label><input id="hCat" placeholder="Fitness, mente, contenido..." value="${esc(existing?.category || '')}" /></div>
    <div class="field"><label class="field-label">Nivel de impacto</label>
      <select id="hLevel">
        ${LEVELS.map((l) => `<option value="${l.id}" ${(existing?.level || 'mini') === l.id ? 'selected' : ''}>${l.icon} ${l.label} — ${l.hint}</option>`).join('')}
      </select>
    </div>
    <div class="field"><label class="field-label">Tipo</label>
      <select id="hType">
        <option value="bool" ${existing?.type !== 'qty' ? 'selected' : ''}>Sí / No</option>
        <option value="qty" ${existing?.type === 'qty' ? 'selected' : ''}>Cuantificable (número)</option>
      </select>
    </div>
    <div class="field" id="qtyFields" style="display:${existing?.type === 'qty' ? 'block' : 'none'};">
      <label class="field-label">Objetivo diario y unidad</label>
      <div class="row"><input id="hTarget" type="number" placeholder="5" style="width:50%;" value="${existing?.target || ''}" /><input id="hUnit" placeholder="páginas, L, min..." value="${esc(existing?.unit || '')}" /></div>
    </div>
    <div class="row" style="margin-bottom:12px;">
      <label class="row" style="gap:8px;font-size:14px;"><input type="checkbox" id="hFlex" style="width:auto;" ${existing?.flex ? 'checked' : ''} /> Flexible (puedo saltarme 1 vez/semana)</label>
    </div>
    <div class="field"><label class="field-label">Hora del día (opcional)</label><input id="hTime" type="time" value="${esc(existing?.time || '')}" /></div>
    <div class="field"><label class="field-label">Descripción / notas</label><textarea id="hNotes" placeholder="De qué va este hábito, por qué lo haces, notas importantes...">${esc(existing?.notes || '')}</textarea></div>
    <button class="btn btn-accent" id="hSave" style="width:100%;padding:12px;">${isEdit ? 'Guardar cambios' : 'Crear hábito'}</button>
  `,
    (body) => {
      body.querySelector('#hType').addEventListener('change', (e) => {
        body.querySelector('#qtyFields').style.display = e.target.value === 'qty' ? 'block' : 'none';
      });
      body.querySelector('#hSave').addEventListener('click', () => {
        const name = body.querySelector('#hName').value.trim();
        if (!name) return toast('Ponle un nombre');
        const data = {
          name,
          category: body.querySelector('#hCat').value.trim(),
          level: body.querySelector('#hLevel').value,
          type: body.querySelector('#hType').value,
          target: Number(body.querySelector('#hTarget').value) || 1,
          unit: body.querySelector('#hUnit').value.trim(),
          step: 1,
          flex: body.querySelector('#hFlex').checked,
          time: body.querySelector('#hTime').value,
          notes: body.querySelector('#hNotes').value.trim(),
        };
        if (isEdit) {
          Object.assign(existing, data);
        } else {
          DB.habits.push({ id: uid(), archived: false, ...data });
        }
        persist('habits');
        closeSheet();
        toast(isEdit ? 'Hábito actualizado' : 'Hábito añadido');
        habitosTab = 'lista';
        renderHabitos(document.getElementById('sectionBody'));
      });
    }
  );
}

function habitDetailSheet(h) {
  const streak = habitStreak(h);
  let totalDone = 0;
  let totalTracked = 0;
  Object.keys(DB.habitLogs).forEach((date) => {
    const val = DB.habitLogs[date][h.id];
    if (val === undefined) return;
    totalTracked++;
    if (h.type === 'bool' ? val === true : val >= (h.target || 1)) totalDone++;
  });
  const days30 = [];
  for (let i = 29; i >= 0; i--) {
    const iso = daysAgo(i);
    const val = (DB.habitLogs[iso] || {})[h.id];
    const done = h.type === 'bool' ? val === true : (val || 0) >= (h.target || 1);
    days30.push(done);
  }
  openSheet(
    `${h.level === 'nucleo' ? '⭐' : '🔹'} ${h.name}`,
    `
    <div class="row" style="gap:8px;flex-wrap:wrap;">
      <span class="pill ${h.level === 'nucleo' ? 'accent' : ''}">${h.level === 'nucleo' ? 'Núcleo' : 'Mini'}</span>
      ${h.category ? `<span class="pill">${esc(h.category)}</span>` : ''}
      ${h.time ? `<span class="pill">⏰ ${h.time}</span>` : ''}
      ${h.flex ? `<span class="pill">flexible</span>` : ''}
    </div>
    ${
      h.notes
        ? `<div class="section-label">Tu porqué</div><div class="card"><div class="card-sub" style="font-style:italic;">"${esc(h.notes)}"</div></div>`
        : `<div class="card-sub mt">Sin notas todavía — edítalo para escribir por qué haces este hábito.</div>`
    }
    <div class="section-label">Racha actual</div>
    <div class="card row between"><span class="card-title">🔥 ${streak} días seguidos</span></div>
    <div class="section-label">Últimos 30 días</div>
    <div class="row" style="flex-wrap:wrap;gap:4px;">
      ${days30.map((d) => `<div style="width:16px;height:16px;border-radius:4px;background:${d ? 'var(--accent)' : 'var(--surface-2)'};"></div>`).join('')}
    </div>
    <div class="card-sub mt">${totalDone} veces cumplido de ${totalTracked} días registrados en total.</div>
    <button class="btn btn-accent mt" id="dhEdit" style="width:100%;padding:12px;">Editar este hábito</button>
  `,
    (body) => {
      body.querySelector('#dhEdit').addEventListener('click', () => {
        closeSheet();
        setTimeout(() => habitForm(h), 260);
      });
    }
  );
}

function renderHabitosResumen(el) {
  const list = activeHabits();
  if (!list.length) return (el.innerHTML = emptyState('Sin hábitos todavía', 'El resumen aparecerá cuando tengas hábitos activos.'));

  // Semana actual, de lunes a hoy.
  const now = new Date();
  const dow = (now.getDay() + 6) % 7; // lunes = 0
  const daysElapsed = dow + 1;

  const rows = list.map((h) => {
    let done = 0;
    for (let i = 0; i < daysElapsed; i++) {
      const iso = daysAgo(i);
      const dayLog = DB.habitLogs[iso] || {};
      if (h.type === 'bool' ? dayLog[h.id] === true : (dayLog[h.id] || 0) >= (h.target || 1)) done++;
    }
    return { h, done, pct: Math.round((done / daysElapsed) * 100) };
  });

  const core = rows.filter((r) => r.h.level === 'nucleo');
  const best = rows.slice().sort((a, b) => b.pct - a.pct)[0];
  const hardest = rows.slice().sort((a, b) => a.pct - b.pct)[0];
  const coreAvg = core.length ? Math.round(core.reduce((s, r) => s + r.pct, 0) / core.length) : null;

  let narrative = '';
  if (coreAvg !== null) {
    if (coreAvg >= 80) narrative = `Esta semana has sostenido tus hábitos núcleo casi al completo (${coreAvg}% de media). Eso es identidad construida, no suerte.`;
    else if (coreAvg >= 50) narrative = `Vas a mitad de camino con tus hábitos núcleo (${coreAvg}% de media). No ha sido perfecto, pero has vuelto al camino más veces de las que lo has dejado.`;
    else narrative = `Esta semana ha costado sostener los hábitos núcleo (${coreAvg}% de media). No es un fracaso, es información: quizás toca ajustar algo, no rendirte.`;
  }

  const weekEpisodes = DB.nereaEpisodes.filter((e) => e.date >= daysAgo(daysElapsed - 1));
  const prevWeekEpisodes = DB.nereaEpisodes.filter((e) => e.date >= daysAgo(daysElapsed - 1 + 7) && e.date < daysAgo(daysElapsed - 1));
  let nereaLine = '';
  if (weekEpisodes.length || prevWeekEpisodes.length) {
    const avgThis = weekEpisodes.length ? weekEpisodes.reduce((s, e) => s + Number(e.intensity), 0) / weekEpisodes.length : 0;
    const avgPrev = prevWeekEpisodes.length ? prevWeekEpisodes.reduce((s, e) => s + Number(e.intensity), 0) / prevWeekEpisodes.length : 0;
    let trend = 'estable';
    if (weekEpisodes.length && prevWeekEpisodes.length) {
      if (avgThis < avgPrev - 0.3) trend = 'bajando';
      else if (avgThis > avgPrev + 0.3) trend = 'subiendo';
    }
    nereaLine = `Con Nerea: ${weekEpisodes.length} episodio${weekEpisodes.length === 1 ? '' : 's'} esta semana, intensidad ${trend}.`;
  }

  el.innerHTML = `
    <div class="card" style="text-align:center;border-color:var(--accent);">
      <div class="card-sub">Semana en curso · día ${daysElapsed} de 7</div>
      <div class="card-title mt" style="font-size:16px;">${esc(narrative || 'Aún no hay datos suficientes esta semana.')}</div>
      ${nereaLine ? `<div class="card-sub mt">${esc(nereaLine)}</div>` : ''}
    </div>

    ${
      best
        ? `<div class="card">
      <div class="card-sub">Lo que mejor te ha salido</div>
      <div class="card-title mt">${best.h.level === 'nucleo' ? '⭐' : '🔹'} ${esc(best.h.name)} — ${best.pct}%</div>
    </div>`
        : ''
    }
    ${
      hardest && hardest.h.id !== best?.h.id
        ? `<div class="card">
      <div class="card-sub">Lo que más te ha costado</div>
      <div class="card-title mt">${hardest.h.level === 'nucleo' ? '⭐' : '🔹'} ${esc(hardest.h.name)} — ${hardest.pct}%</div>
      <div class="card-sub mt">Sin culpa: mañana es otra oportunidad de volver al camino.</div>
    </div>`
        : ''
    }

    <div class="section-label">Todos los hábitos esta semana</div>
    ${rows
      .slice()
      .sort((a, b) => b.pct - a.pct)
      .map(
        (r) => `
      <div class="card">
        <div class="row between"><span class="card-title">${r.h.level === 'nucleo' ? '⭐' : '🔹'} ${esc(r.h.name)}</span><span class="card-sub">${r.done}/${daysElapsed} días</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${r.pct}%"></div></div>
      </div>`
      )
      .join('')}

    <div class="card-sub mt" style="text-align:center;">Repasa esta pantalla los domingos para cerrar tu semana con perspectiva, no con nota.</div>
  `;
}

function renderHabitosCal(el) {
  const list = activeHabits();
  if (!list.length) return (el.innerHTML = emptyState('Sin hábitos', ''));
  const now = new Date();
  const year = now.getFullYear(),
    month = now.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // lunes=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let cells = '';
  for (let i = 0; i < startOffset; i++) cells += `<div class="cal-cell"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const log = DB.habitLogs[iso] || {};
    const doneCount = list.filter((h) => (h.type === 'bool' ? log[h.id] === true : (log[h.id] || 0) >= (h.target || 1))).length;
    const pct = doneCount / list.length;
    let cls = '';
    if (pct === 1) cls = 'filled-full';
    else if (pct > 0) cls = 'filled-partial';
    if (iso === todayStr()) cls += ' today';
    cells += `<div class="cal-cell ${cls}">${d}</div>`;
  }
  el.innerHTML = `
    <div class="card-title mb">${now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</div>
    <div class="cal-grid">${cells}</div>
    <div class="row mt" style="gap:16px;font-size:11px;color:var(--muted);">
      <span class="row" style="gap:5px;"><span class="cal-cell filled-full" style="width:14px;height:14px;"></span> completo</span>
      <span class="row" style="gap:5px;"><span class="cal-cell filled-partial" style="width:14px;height:14px;"></span> parcial</span>
    </div>
  `;
}

function renderHabitosStats(el) {
  const list = activeHabits();
  if (!list.length) return (el.innerHTML = emptyState('Sin hábitos', ''));
  function weekPct(offsetWeeks) {
    let total = 0,
      done = 0;
    for (let i = 0; i < 7; i++) {
      const iso = daysAgo(i + offsetWeeks * 7);
      const log = DB.habitLogs[iso] || {};
      list.forEach((h) => {
        total++;
        if (h.type === 'bool' ? log[h.id] === true : (log[h.id] || 0) >= (h.target || 1)) done++;
      });
    }
    return total ? Math.round((done / total) * 100) : 0;
  }
  const thisWeek = weekPct(0);
  const lastWeek = weekPct(1);
  const diff = thisWeek - lastWeek;
  const bars = [3, 2, 1, 0].map((w) => weekPct(w));
  el.innerHTML = `
    <div class="card">
      <div class="row between">
        <div>
          <div class="card-sub">Esta semana</div>
          <div class="display" style="font-size:36px;">${thisWeek}%</div>
        </div>
        <div class="pill ${diff >= 0 ? 'good' : 'warn'}">${diff >= 0 ? '↑' : '↓'} ${Math.abs(diff)}% vs semana pasada</div>
      </div>
      <div class="chart">${bars.map((b) => `<div class="chart-bar ${b === Math.max(...bars) ? 'hi' : ''}" style="height:${Math.max(b, 3)}%"></div>`).join('')}</div>
      <div class="chart-labels"><span>hace 3sem</span><span>hace 2sem</span><span>pasada</span><span>esta</span></div>
    </div>
    <div class="section-label">Ánimo últimos 7 días</div>
    <div class="card row" style="justify-content:space-between;">
      ${[6, 5, 4, 3, 2, 1, 0]
        .map((i) => {
          const d = daysAgo(i);
          const m = DB.moods[d];
          return `<div style="text-align:center;"><div style="font-size:20px;">${m || '·'}</div><div class="card-sub" style="font-size:9px;">${fmtDate(d)}</div></div>`;
        })
        .join('')}
    </div>
    <div class="section-label">Consistencia por nivel esta semana</div>
    ${LEVELS.map((l) => {
      const habits = habitsAtLevel(l.id);
      if (!habits.length) return '';
      let total = 0, done = 0;
      for (let i = 0; i < 7; i++) {
        const iso = daysAgo(i);
        const dayLog = DB.habitLogs[iso] || {};
        habits.forEach((h) => {
          total++;
          if (h.type === 'bool' ? dayLog[h.id] === true : (dayLog[h.id] || 0) >= (h.target || 1)) done++;
        });
      }
      const pct = total ? Math.round((done / total) * 100) : 0;
      return `<div class="card"><div class="row between"><span class="card-title">${l.icon} ${l.label}</span><span class="card-sub">${pct}%</span></div><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div></div>`;
    }).join('')}
    <div class="section-label">Objetivos vinculados</div>
    ${
      DB.goals.map((g) => `<div class="card"><div class="card-title">${esc(g.title)}</div></div>`).join('') ||
      `<div class="card-sub">Aún no has vinculado objetivos.</div>`
    }
  `;
}

function renderHabitosArchivo(el) {
  const arch = DB.habits.filter((h) => h.archived);
  el.innerHTML =
    arch
      .map(
        (h) => `
    <div class="card row between">
      <div class="card-title">${esc(h.name)}</div>
      <div class="row">
        <button class="btn" data-restore="${h.id}">Restaurar</button>
        <button class="btn-ghost" data-delete2="${h.id}" style="color:var(--warn);">Borrar</button>
      </div>
    </div>`
      )
      .join('') || emptyState('Archivo vacío', 'Los hábitos que archives aparecerán aquí.');
  el.querySelectorAll('[data-delete2]').forEach((b) =>
    b.addEventListener('click', () => {
      const h = DB.habits.find((x) => x.id === b.dataset.delete2);
      if (!confirm(`¿Borrar "${h.name}" definitivamente? No se puede deshacer.`)) return;
      DB.habits = DB.habits.filter((x) => x.id !== h.id);
      Object.keys(DB.habitLogs).forEach((date) => delete DB.habitLogs[date][h.id]);
      persist('habits');
      persist('habitLogs');
      toast('Hábito borrado');
      renderHabitosArchivo(el);
    })
  );
  el.querySelectorAll('[data-restore]').forEach((b) =>
    b.addEventListener('click', () => {
      DB.habits.find((h) => h.id === b.dataset.restore).archived = false;
      persist('habits');
      renderHabitosArchivo(el);
    })
  );
}

function emptyState(title, sub) {
  return `<div class="empty-state"><div class="display">·</div><div class="card-title">${esc(title)}</div><div class="card-sub mt">${esc(sub)}</div></div>`;
}

/* ============================================================
   UGOH
   ============================================================ */

let ugohTab = 'ideas';

function renderUgoh(el) {
  const tools = [
    { id: 'ideas', label: 'Ideas' },
    { id: 'videos', label: 'Vídeos' },
    { id: 'hooks', label: 'Hooks' },
    { id: 'stats', label: 'Subs/Views' },
    { id: 'seo', label: 'SEO' },
    { id: 'metas', label: 'Metas' },
    { id: 'camino', label: 'El camino real' },
  ];
  el.innerHTML = `${tabsHtml(tools, ugohTab)}<div id="ugohPanel"></div>`;
  wireTabs(el, tools, (t) => {
    ugohTab = t;
    renderUgoh(el);
  });
  const panel = document.getElementById('ugohPanel');
  ({
    ideas: renderUgohIdeas,
    videos: renderUgohVideos,
    hooks: renderUgohHooks,
    stats: renderUgohStats,
    seo: renderUgohSeo,
    metas: renderUgohMetas,
    camino: renderUgohCamino,
  }[ugohTab])(panel);
}

function renderUgohIdeas(el) {
  el.innerHTML = `
    <div class="row mb"><input id="newIdea" placeholder="Nueva idea de vídeo..." /><button class="btn btn-accent" id="addIdea">+</button></div>
    ${
      DB.ugohIdeas
        .map(
          (i) => `<div class="card row between"><div>${esc(i.text)}</div><button class="btn-ghost" data-del="${i.id}">✕</button></div>`
        )
        .join('') || emptyState('Sin ideas todavía', 'Apunta lo que se te ocurra, sin filtrar.')
    }
  `;
  document.getElementById('addIdea').addEventListener('click', () => {
    const v = document.getElementById('newIdea').value.trim();
    if (!v) return;
    DB.ugohIdeas.unshift({ id: uid(), text: v });
    persist('ugohIdeas');
    renderUgohIdeas(el);
  });
  el.querySelectorAll('[data-del]').forEach((b) =>
    b.addEventListener('click', () => {
      DB.ugohIdeas = DB.ugohIdeas.filter((i) => i.id !== b.dataset.del);
      persist('ugohIdeas');
      renderUgohIdeas(el);
    })
  );
}

function renderUgohHooks(el) {
  el.innerHTML = `
    <div class="row mb"><input id="newHook" placeholder="Nuevo hook / gancho..." /><button class="btn btn-accent" id="addHook">+</button></div>
    ${
      DB.ugohHooks
        .map((h) => `<div class="card row between"><div>${esc(h.text)}</div><button class="btn-ghost" data-del="${h.id}">✕</button></div>`)
        .join('') || emptyState('Banco vacío', 'Guarda las frases de apertura que mejor funcionen.')
    }
  `;
  document.getElementById('addHook').addEventListener('click', () => {
    const v = document.getElementById('newHook').value.trim();
    if (!v) return;
    DB.ugohHooks.unshift({ id: uid(), text: v });
    persist('ugohHooks');
    renderUgohHooks(el);
  });
  el.querySelectorAll('[data-del]').forEach((b) =>
    b.addEventListener('click', () => {
      DB.ugohHooks = DB.ugohHooks.filter((h) => h.id !== b.dataset.del);
      persist('ugohHooks');
      renderUgohHooks(el);
    })
  );
}

function renderUgohVideos(el) {
  el.innerHTML = `
    <button class="btn btn-accent mb" id="addVideo" style="width:100%;padding:12px;">+ Nuevo vídeo</button>
    ${
      DB.ugohVideos
        .map((v) => {
          const doneSteps = (v.checklist || []).filter((c) => c.done).length;
          return `
        <div class="card" data-video="${v.id}">
          <div class="row between">
            <div class="card-title">${esc(v.title)}</div>
            <button class="btn-ghost" data-delv="${v.id}">✕</button>
          </div>
          <div class="card-sub mb">${doneSteps}/${(v.checklist || []).length} producción</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${((v.checklist || []).length ? doneSteps / v.checklist.length : 0) * 100}%"></div></div>
          <button class="btn mt" data-openv="${v.id}" style="width:100%;">Abrir guion y checklist</button>
        </div>`;
        })
        .join('') || emptyState('Sin vídeos en marcha', 'Crea uno para escribir guion y trackear producción.')
    }
  `;
  document.getElementById('addVideo').addEventListener('click', () => videoForm());
  el.querySelectorAll('[data-delv]').forEach((b) =>
    b.addEventListener('click', () => {
      DB.ugohVideos = DB.ugohVideos.filter((v) => v.id !== b.dataset.delv);
      persist('ugohVideos');
      renderUgohVideos(el);
    })
  );
  el.querySelectorAll('[data-openv]').forEach((b) => b.addEventListener('click', () => videoDetail(b.dataset.openv)));
}

function videoForm() {
  openSheet(
    'Nuevo vídeo',
    `<div class="field"><label class="field-label">Título</label><input id="vTitle" placeholder="Título de trabajo" /></div>
     <button class="btn btn-accent" id="vSave" style="width:100%;padding:12px;">Crear</button>`,
    (body) =>
      body.querySelector('#vSave').addEventListener('click', () => {
        const title = body.querySelector('#vTitle').value.trim();
        if (!title) return toast('Ponle un título');
        DB.ugohVideos.unshift({
          id: uid(),
          title,
          hook: '',
          dev: '',
          close: '',
          checklist: [
            { text: 'Grabar', done: false },
            { text: 'Editar', done: false },
            { text: 'Miniatura', done: false },
            { text: 'Subir', done: false },
          ],
        });
        persist('ugohVideos');
        closeSheet();
        renderUgohVideos(document.getElementById('ugohPanel'));
      })
  );
}

function videoDetail(id) {
  const v = DB.ugohVideos.find((x) => x.id === id);
  openSheet(
    v.title,
    `
    <div class="field"><label class="field-label">Hook (apertura)</label><textarea id="dHook">${esc(v.hook)}</textarea></div>
    <div class="field"><label class="field-label">Desarrollo</label><textarea id="dDev">${esc(v.dev)}</textarea></div>
    <div class="field"><label class="field-label">Cierre</label><textarea id="dClose">${esc(v.close)}</textarea></div>
    <div class="section-label">Checklist de producción</div>
    <div id="dChecklist">${v.checklist
      .map(
        (c, i) => `<div class="row" style="gap:10px;margin-bottom:8px;"><button class="checkbox ${c.done ? 'checked' : ''}" data-ci="${i}">${c.done ? '✓' : ''}</button><span>${esc(c.text)}</span></div>`
      )
      .join('')}</div>
    <button class="btn btn-accent mt" id="dSave" style="width:100%;padding:12px;">Guardar</button>
  `,
    (body) => {
      body.querySelectorAll('[data-ci]').forEach((b) =>
        b.addEventListener('click', () => {
          const i = Number(b.dataset.ci);
          v.checklist[i].done = !v.checklist[i].done;
          persist('ugohVideos');
          b.classList.toggle('checked');
          b.textContent = v.checklist[i].done ? '✓' : '';
        })
      );
      body.querySelector('#dSave').addEventListener('click', () => {
        v.hook = body.querySelector('#dHook').value;
        v.dev = body.querySelector('#dDev').value;
        v.close = body.querySelector('#dClose').value;
        persist('ugohVideos');
        closeSheet();
        renderUgohVideos(document.getElementById('ugohPanel'));
      });
    }
  );
}

function renderUgohStats(el) {
  const sorted = [...DB.ugohStats].sort((a, b) => (a.date < b.date ? -1 : 1));
  const last = sorted.slice(-8);
  const max = Math.max(1, ...last.map((s) => s.subs));
  el.innerHTML = `
    <div class="card">
      <div class="row" style="gap:8px;">
        <input id="statSubs" type="number" placeholder="Subs" />
        <input id="statViews" type="number" placeholder="Views" />
        <button class="btn btn-accent" id="statAdd">+</button>
      </div>
    </div>
    ${
      last.length
        ? `<div class="card"><div class="card-sub mb">Evolución de subscriptores</div>
      <div class="chart">${last.map((s) => `<div class="chart-bar hi" style="height:${(s.subs / max) * 100}%"></div>`).join('')}</div>
      <div class="chart-labels">${last.map((s) => `<span>${fmtDate(s.date)}</span>`).join('')}</div></div>`
        : emptyState('Sin registros', 'Anota tus números cada semana para ver la curva.')
    }
  `;
  document.getElementById('statAdd').addEventListener('click', () => {
    const subs = Number(document.getElementById('statSubs').value) || 0;
    const views = Number(document.getElementById('statViews').value) || 0;
    DB.ugohStats.push({ date: todayStr(), subs, views });
    persist('ugohStats');
    renderUgohStats(el);
  });
}

function renderUgohSeo(el) {
  el.innerHTML = `
    <div class="row mb"><input id="newTag" placeholder="tag o keyword..." /><button class="btn btn-accent" id="addTag">+</button></div>
    <div class="row" style="flex-wrap:wrap;gap:8px;">
      ${DB.ugohSeo.map((t) => `<span class="pill accent" data-tag="${t.id}" style="cursor:pointer;">${esc(t.text)} ✕</span>`).join('') || ''}
    </div>
    ${!DB.ugohSeo.length ? emptyState('Sin tags guardados', 'Toca un tag para copiarlo o borrarlo.') : ''}
  `;
  document.getElementById('addTag').addEventListener('click', () => {
    const v = document.getElementById('newTag').value.trim();
    if (!v) return;
    DB.ugohSeo.push({ id: uid(), text: v });
    persist('ugohSeo');
    renderUgohSeo(el);
  });
  el.querySelectorAll('[data-tag]').forEach((tag) =>
    tag.addEventListener('click', () => {
      const t = DB.ugohSeo.find((x) => x.id === tag.dataset.tag);
      if (navigator.clipboard) navigator.clipboard.writeText(t.text).then(() => toast('Copiado: ' + t.text));
      DB.ugohSeo = DB.ugohSeo.filter((x) => x.id !== tag.dataset.tag);
      persist('ugohSeo');
      renderUgohSeo(el);
    })
  );
}

function renderUgohMetas(el) {
  el.innerHTML = `
    <button class="btn btn-accent mb" id="addGoal" style="width:100%;padding:12px;">+ Nueva meta de canal</button>
    ${
      DB.ugohGoals
        .map(
          (g) => `
      <div class="card">
        <div class="row between"><span class="card-title">${esc(g.label)}</span><span class="card-sub">${g.current}/${g.target}</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, (g.current / g.target) * 100)}%"></div></div>
      </div>`
        )
        .join('') || emptyState('Sin metas', 'Ej. llegar a 1.000 suscriptores.')
    }
  `;
  document.getElementById('addGoal').addEventListener('click', () => {
    openSheet(
      'Nueva meta',
      `<div class="field"><label class="field-label">Meta</label><input id="gLabel" placeholder="1.000 suscriptores" /></div>
       <div class="row"><input id="gCurrent" type="number" placeholder="Actual" /><input id="gTarget" type="number" placeholder="Objetivo" /></div>
       <button class="btn btn-accent mt" id="gSave" style="width:100%;padding:12px;">Guardar</button>`,
      (body) =>
        body.querySelector('#gSave').addEventListener('click', () => {
          DB.ugohGoals.push({
            id: uid(),
            label: body.querySelector('#gLabel').value.trim() || 'Meta',
            current: Number(body.querySelector('#gCurrent').value) || 0,
            target: Number(body.querySelector('#gTarget').value) || 1,
          });
          persist('ugohGoals');
          closeSheet();
          renderUgohMetas(el);
        })
    );
  });
}

function renderUgohCamino(el) {
  el.innerHTML = `
    <div class="card" style="text-align:center;padding:30px 16px;border-color:var(--accent);">
      <div class="display" style="font-size:34px;color:var(--accent);">EL CAMINO REAL</div>
      <div class="card-sub mt">Ayudar a chavales de 18 a 25 a salir del modo pantalla y hacer cambios pequeños que de verdad cambien su vida.</div>
    </div>
    <div class="section-label">Tiempo por vídeo</div>
    <div class="row mb"><input id="tVideo" placeholder="Vídeo" /></div>
    <div class="row mb" style="gap:8px;">
      <input id="tRec" type="number" placeholder="Grabar (min)" />
      <input id="tEd" type="number" placeholder="Editar (min)" />
      <button class="btn btn-accent" id="tAdd">+</button>
    </div>
    ${
      DB.ugohTimes
        .map((t) => `<div class="card row between"><span>${esc(t.video)}</span><span class="card-sub">${t.record}min grabar · ${t.edit}min editar</span></div>`)
        .join('') || ''
    }
  `;
  document.getElementById('tAdd').addEventListener('click', () => {
    const video = document.getElementById('tVideo').value.trim() || 'Sin título';
    const record = Number(document.getElementById('tRec').value) || 0;
    const edit = Number(document.getElementById('tEd').value) || 0;
    DB.ugohTimes.unshift({ id: uid(), video, record, edit });
    persist('ugohTimes');
    renderUgohCamino(el);
  });
}

/* ============================================================
   FITNESS
   ============================================================ */

let fitnessTab = 'log';

function renderFitness(el) {
  const tools = [
    { id: 'log', label: 'Entrenos' },
    { id: 'carga', label: 'Sobrecarga' },
    { id: 'rutinas', label: 'Rutinas' },
    { id: 'peso', label: 'Peso' },
    { id: 'timer', label: 'Descanso' },
    { id: 'recuperacion', label: 'Recuperación' },
    { id: 'metas', label: 'Metas' },
    { id: 'comidas', label: 'Comidas' },
  ];
  el.innerHTML = `${tabsHtml(tools, fitnessTab)}<div id="fitPanel"></div>`;
  wireTabs(el, tools, (t) => {
    fitnessTab = t;
    renderFitness(el);
  });
  const panel = document.getElementById('fitPanel');
  ({
    log: renderFitLog,
    carga: renderFitOverload,
    rutinas: renderFitRoutines,
    peso: renderFitWeight,
    timer: renderFitTimer,
    recuperacion: renderFitRecovery,
    metas: renderFitGoals,
    comidas: renderFitMeals,
  }[fitnessTab])(panel);
}

/* ---- Sobrecarga progresiva ---- */

function computeOverloadSuggestions() {
  const byExercise = {};
  DB.workouts
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .forEach((w) => {
      (w.exercises || []).forEach((e) => {
        const key = e.name.trim().toLowerCase();
        if (!key) return;
        const weight = parseFloat(e.weight) || 0;
        const reps = parseInt(e.reps) || 0;
        if (!byExercise[key]) byExercise[key] = [];
        byExercise[key].push({ date: w.date, displayName: e.name, weight, reps });
      });
    });
  return Object.values(byExercise).map((entries) => {
    const last = entries[entries.length - 1];
    const prev = entries[entries.length - 2];
    let suggestedWeight = last.weight;
    let suggestedReps = last.reps;
    let note = 'Consolida esta carga antes de subir.';
    if (last.weight > 0) {
      if (last.reps >= 10) {
        suggestedWeight = Math.round((last.weight + (last.weight >= 40 ? 2.5 : 1) ) * 10) / 10;
        suggestedReps = 8;
        note = 'Llegaste a 10+ reps: toca subir peso.';
      } else if (last.reps >= 6) {
        suggestedReps = last.reps + 1;
        note = 'Mismo peso, busca una repetición más.';
      } else if (prev && prev.weight === last.weight && prev.reps >= last.reps) {
        note = 'Llevas 2 sesiones igual: mantén el peso y enfócate en técnica.';
      }
    }
    return { name: last.displayName, lastWeight: last.weight, lastReps: last.reps, suggestedWeight, suggestedReps, note, date: last.date };
  });
}

function renderFitOverload(el) {
  const sug = computeOverloadSuggestions();
  el.innerHTML = `
    <div class="card-sub mb">Basado en tu último registro de cada ejercicio, con sobrecarga progresiva simple.</div>
    ${
      sug
        .map(
          (s) => `
      <div class="card">
        <div class="row between">
          <span class="card-title">${esc(s.name)}</span>
          <span class="card-sub">último: ${s.lastWeight}kg × ${s.lastReps}</span>
        </div>
        <div class="row between mt">
          <span class="pill accent">Hoy: ${s.suggestedWeight}kg × ${s.suggestedReps}</span>
        </div>
        <div class="card-sub mt">${esc(s.note)}</div>
      </div>`
        )
        .join('') || emptyState('Sin datos suficientes', 'Registra algún entreno con peso y reps para ver sugerencias aquí.')
    }
  `;
}

/* ---- Comidas ---- */

const MEAL_BANK = [
  { type: 'Desayuno', text: 'Huevos revueltos + tostada integral + fruta' },
  { type: 'Desayuno', text: 'Yogur griego + avena + frutos secos' },
  { type: 'Desayuno', text: 'Tortilla francesa de claras + aguacate' },
  { type: 'Comida', text: 'Pechuga de pollo a la plancha + arroz + verdura al vapor' },
  { type: 'Comida', text: 'Salmón al horno + patata + ensalada' },
  { type: 'Comida', text: 'Lentejas con verduras + huevo duro' },
  { type: 'Comida', text: 'Ternera picada + pasta integral + tomate' },
  { type: 'Cena', text: 'Tortilla de un huevo + atún + ensalada' },
  { type: 'Cena', text: 'Pavo a la plancha + verduras salteadas' },
  { type: 'Cena', text: 'Revuelto de champiñones + queso fresco' },
  { type: 'Snack', text: 'Yogur natural + un puñado de nueces' },
  { type: 'Snack', text: 'Queso fresco batido + fruta' },
  { type: 'Snack', text: 'Puñado de almendras + una pieza de fruta' },
  { type: 'Snack', text: 'Batido de proteína + plátano' },
];

const SUGAR_SWAPS = [
  'Fruta entera en vez de zumo o dulce envasado',
  'Yogur natural con canela en vez de yogur azucarado',
  'Un puñado de dátiles si el antojo es fuerte, en vez de bollería',
  'Infusión o café en vez de refresco',
  'Chocolate negro (85%+) en vez de chocolate con leche',
  'Fruta congelada (tipo uvas) como si fuera un helado',
];

function renderFitMeals(el) {
  el.innerHTML = `
    <div class="section-label">¿Qué como hoy?</div>
    <button class="btn btn-accent mb" id="mealShuffle" style="width:100%;padding:12px;">🎲 Dame una idea</button>
    <div id="mealSuggestion"></div>

    <div class="section-label">Si te entra el antojo de azúcar</div>
    ${SUGAR_SWAPS.map((s) => `<div class="card"><div class="card-sub">${esc(s)}</div></div>`).join('')}

    <div class="section-label">Tus comidas guardadas</div>
    <div class="row mb" style="gap:6px;">
      <input id="newMeal" placeholder="Añade tu propia comida..." />
      <select id="newMealType" style="width:110px;">
        <option>Desayuno</option><option>Comida</option><option>Cena</option><option>Snack</option>
      </select>
      <button class="btn btn-accent" id="addMeal">+</button>
    </div>
    ${
      DB.mealIdeas
        .map((m) => `<div class="card row between"><div><span class="pill">${esc(m.type)}</span> <span class="mt">${esc(m.text)}</span></div><button class="btn-ghost" data-delm="${m.id}">✕</button></div>`)
        .join('') || ''
    }
  `;
  document.getElementById('mealShuffle').addEventListener('click', () => {
    const all = [...MEAL_BANK, ...DB.mealIdeas.map((m) => ({ type: m.type, text: m.text }))];
    const pick = all[Math.floor(Math.random() * all.length)];
    document.getElementById('mealSuggestion').innerHTML = `<div class="card" style="border-color:var(--accent);"><span class="pill accent">${esc(pick.type)}</span><div class="card-title mt">${esc(pick.text)}</div></div>`;
  });
  document.getElementById('addMeal').addEventListener('click', () => {
    const text = document.getElementById('newMeal').value.trim();
    if (!text) return;
    const type = document.getElementById('newMealType').value;
    DB.mealIdeas.unshift({ id: uid(), text, type });
    persist('mealIdeas');
    renderFitMeals(el);
  });
  el.querySelectorAll('[data-delm]').forEach((b) =>
    b.addEventListener('click', () => {
      DB.mealIdeas = DB.mealIdeas.filter((m) => m.id !== b.dataset.delm);
      persist('mealIdeas');
      renderFitMeals(el);
    })
  );
}

function gymStreak() {
  let streak = 0;
  const dates = new Set(DB.workouts.map((w) => w.date));
  for (let i = 0; i < 400; i++) {
    const d = daysAgo(i);
    if (dates.has(d)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function lastDeloadWeeksAgo() {
  if (!DB.deloads.length) return 999;
  const last = [...DB.deloads].sort().pop();
  const diffDays = Math.round((Date.now() - new Date(last).getTime()) / 86400000);
  return Math.floor(diffDays / 7);
}

function renderFitLog(el) {
  const streak = gymStreak();
  const deloadWeeks = lastDeloadWeeksAgo();
  el.innerHTML = `
    <div class="row mb" style="gap:8px;">
      <div class="pill ${streak > 0 ? 'good' : ''}">🔥 racha: ${streak} días</div>
      ${deloadWeeks >= 6 ? `<div class="pill warn">Sin deload hace ${deloadWeeks} sem.</div>` : `<div class="pill">Deload ok</div>`}
    </div>
    <button class="btn btn-accent mb" id="addWorkout" style="width:100%;padding:12px;">+ Registrar entreno</button>
    <button class="btn-ghost mb" id="markDeload">Marcar deload / descanso hoy</button>
    ${
      DB.workouts
        .slice()
        .reverse()
        .slice(0, 30)
        .map(
          (w) => `
      <div class="card">
        <div class="row between"><span class="card-title">${esc(w.name || 'Entreno')}</span><span class="card-sub">${fmtDate(w.date)}</span></div>
        <div class="card-sub">${(w.exercises || []).map((e) => esc(e.name)).join(', ')}</div>
        ${w.notes ? `<div class="card-sub mt">"${esc(w.notes)}"</div>` : ''}
      </div>`
        )
        .join('') || emptyState('Sin entrenos registrados', '')
    }
  `;
  document.getElementById('addWorkout').addEventListener('click', () => workoutForm());
  document.getElementById('markDeload').addEventListener('click', () => {
    DB.deloads.push(todayStr());
    persist('deloads');
    toast('Deload registrado');
    renderFitLog(el);
  });
}

function workoutForm() {
  let exercises = [{ name: '', weight: '', reps: '' }];
  const body = openSheet(
    'Nuevo entreno',
    `
    <div class="field"><label class="field-label">Nombre del entreno</label><input id="wName" placeholder="Push, pierna, full body..." /></div>
    <div id="exList"></div>
    <button class="btn mb" id="addEx">+ Ejercicio</button>
    <div class="field"><label class="field-label">¿Cómo te sentiste?</label><textarea id="wNotes" placeholder="Energía, dolores, sensaciones..."></textarea></div>
    <button class="btn btn-accent" id="wSave" style="width:100%;padding:12px;">Guardar</button>
  `,
    (b) => {
      const list = b.querySelector('#exList');
      function draw() {
        list.innerHTML = exercises
          .map(
            (e, i) => `
          <div class="row mb" style="gap:6px;">
            <input data-exn="${i}" placeholder="Ejercicio" value="${esc(e.name)}" />
            <input data-exw="${i}" placeholder="kg" style="width:70px;" value="${esc(e.weight)}" />
            <input data-exr="${i}" placeholder="reps" style="width:70px;" value="${esc(e.reps)}" />
          </div>`
          )
          .join('');
        list.querySelectorAll('[data-exn]').forEach((inp) => inp.addEventListener('input', (e) => (exercises[inp.dataset.exn].name = e.target.value)));
        list.querySelectorAll('[data-exw]').forEach((inp) => inp.addEventListener('input', (e) => (exercises[inp.dataset.exw].weight = e.target.value)));
        list.querySelectorAll('[data-exr]').forEach((inp) => inp.addEventListener('input', (e) => (exercises[inp.dataset.exr].reps = e.target.value)));
      }
      draw();
      b.querySelector('#addEx').addEventListener('click', () => {
        exercises.push({ name: '', weight: '', reps: '' });
        draw();
      });
      b.querySelector('#wSave').addEventListener('click', () => {
        DB.workouts.push({
          id: uid(),
          date: todayStr(),
          name: b.querySelector('#wName').value.trim(),
          exercises: exercises.filter((e) => e.name.trim()),
          notes: b.querySelector('#wNotes').value.trim(),
        });
        persist('workouts');
        closeSheet();
        toast('Entreno guardado');
        renderFitLog(document.getElementById('fitPanel'));
      });
    }
  );
}

function renderFitRoutines(el) {
  el.innerHTML = `
    <button class="btn btn-accent mb" id="addRoutine" style="width:100%;padding:12px;">+ Nueva plantilla</button>
    ${
      DB.routines
        .map(
          (r) => `<div class="card"><div class="card-title">${esc(r.name)}</div><div class="card-sub">${esc(r.exercises)}</div></div>`
        )
        .join('') || emptyState('Sin plantillas', 'Guarda tus rutinas fijas (push/pull/legs...) para reutilizarlas.')
    }
  `;
  document.getElementById('addRoutine').addEventListener('click', () => {
    openSheet(
      'Nueva plantilla',
      `<div class="field"><label class="field-label">Nombre</label><input id="rName" placeholder="Push day" /></div>
       <div class="field"><label class="field-label">Ejercicios (separados por coma)</label><textarea id="rEx" placeholder="Press banca, fondos, elevaciones..."></textarea></div>
       <button class="btn btn-accent" id="rSave" style="width:100%;padding:12px;">Guardar</button>`,
      (b) =>
        b.querySelector('#rSave').addEventListener('click', () => {
          DB.routines.push({ id: uid(), name: b.querySelector('#rName').value.trim(), exercises: b.querySelector('#rEx').value.trim() });
          persist('routines');
          closeSheet();
          renderFitRoutines(el);
        })
    );
  });
}

function renderFitWeight(el) {
  const sorted = [...DB.bodyweight].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-10);
  const max = Math.max(1, ...sorted.map((s) => s.kg));
  const min = Math.min(...sorted.map((s) => s.kg), max);
  el.innerHTML = `
    <div class="row mb"><input id="wKg" type="number" step="0.1" placeholder="Peso hoy (kg)" /><button class="btn btn-accent" id="wAdd">+</button></div>
    ${
      sorted.length
        ? `<div class="card"><div class="chart">${sorted
            .map((s) => `<div class="chart-bar hi" style="height:${(((s.kg - min) / (max - min || 1)) * 80 + 15)}%"></div>`)
            .join('')}</div><div class="chart-labels">${sorted.map((s) => `<span>${fmtDate(s.date)}</span>`).join('')}</div></div>`
        : emptyState('Sin registros de peso', '')
    }
  `;
  document.getElementById('wAdd').addEventListener('click', () => {
    const kg = Number(document.getElementById('wKg').value);
    if (!kg) return;
    DB.bodyweight.push({ date: todayStr(), kg });
    persist('bodyweight');
    renderFitWeight(el);
  });
}

let pomoState = { running: false, remaining: 0, interval: null, mode: 'gym' };

function renderFitTimer(el) {
  el.innerHTML = `
    <div class="row mb" style="gap:8px;">
      <input id="restSecs" type="number" placeholder="Segundos de descanso" value="90" />
      <button class="btn btn-accent" id="startRest">Iniciar</button>
    </div>
    <div class="timer-display" id="restDisplay">--:--</div>
    <div class="row" style="justify-content:center;gap:10px;"><button class="btn" id="stopRest">Detener</button></div>
  `;
  let interval;
  document.getElementById('startRest').addEventListener('click', () => {
    let secs = Number(document.getElementById('restSecs').value) || 60;
    clearInterval(interval);
    const disp = document.getElementById('restDisplay');
    const tick = () => {
      const m = String(Math.floor(secs / 60)).padStart(2, '0');
      const s = String(secs % 60).padStart(2, '0');
      disp.textContent = `${m}:${s}`;
      if (secs <= 0) {
        clearInterval(interval);
        toast('Descanso terminado 💪');
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
      secs--;
    };
    tick();
    interval = setInterval(tick, 1000);
  });
  document.getElementById('stopRest').addEventListener('click', () => {
    clearInterval(interval);
    document.getElementById('restDisplay').textContent = '--:--';
  });
}

function renderFitRecovery(el) {
  el.innerHTML = `
    <div class="card" style="border-color:var(--accent);">
      <div class="card-title">${esc(DB.phaseTarget.label)}</div>
      <div class="row mt" style="gap:8px;">
        <input id="pCurrent" placeholder="Situación actual" value="${esc(DB.phaseTarget.current)}" />
        <input id="pTarget" placeholder="Objetivo" value="${esc(DB.phaseTarget.target)}" />
      </div>
      <button class="btn mt" id="pSave">Guardar</button>
    </div>
    <div class="section-label">Fases</div>
    <button class="btn mb" id="addPhase">+ Nueva fase / hito</button>
    ${
      DB.recoveryPhases
        .map(
          (p) => `
      <div class="card row between">
        <div class="row" style="gap:10px;"><button class="checkbox ${p.done ? 'checked' : ''}" data-phdone="${p.id}">${p.done ? '✓' : ''}</button>
          <div><div class="card-title">${esc(p.title)}</div><div class="card-sub">${esc(p.date)}</div></div>
        </div>
      </div>`
        )
        .join('') || emptyState('Sin fases definidas', 'Divide tu recuperación en hitos con fecha.')
    }
  `;
  document.getElementById('pSave').addEventListener('click', () => {
    DB.phaseTarget.current = document.getElementById('pCurrent').value;
    DB.phaseTarget.target = document.getElementById('pTarget').value;
    persist('phaseTarget');
    toast('Guardado');
  });
  document.getElementById('addPhase').addEventListener('click', () => {
    openSheet(
      'Nueva fase',
      `<div class="field"><label class="field-label">Título</label><input id="phT" placeholder="Fase 1: movilidad" /></div>
       <div class="field"><label class="field-label">Fecha objetivo</label><input id="phD" type="date" /></div>
       <button class="btn btn-accent" id="phSave" style="width:100%;padding:12px;">Guardar</button>`,
      (b) =>
        b.querySelector('#phSave').addEventListener('click', () => {
          DB.recoveryPhases.push({ id: uid(), title: b.querySelector('#phT').value.trim() || 'Fase', date: b.querySelector('#phD').value, done: false });
          persist('recoveryPhases');
          closeSheet();
          renderFitRecovery(el);
        })
    );
  });
  el.querySelectorAll('[data-phdone]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const p = DB.recoveryPhases.find((x) => x.id === btn.dataset.phdone);
      p.done = !p.done;
      persist('recoveryPhases');
      renderFitRecovery(el);
    })
  );
}

function renderFitGoals(el) {
  el.innerHTML = `
    <button class="btn btn-accent mb" id="addPGoal" style="width:100%;padding:12px;">+ Nueva meta física</button>
    ${
      DB.physicalGoals
        .map(
          (g) => `
      <div class="card">
        <div class="row between"><span class="card-title">${esc(g.label)}</span><span class="card-sub">${g.current}/${g.target}kg</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, (g.current / g.target) * 100)}%"></div></div>
      </div>`
        )
        .join('') || emptyState('Sin metas físicas', 'Ej. sentadilla 100kg.')
    }
    <div class="section-label">Nutrición básica de hoy</div>
    <div class="card row" style="gap:10px;">
      <input id="nutWater" type="number" placeholder="Agua (L)" value="${(DB.nutrition[todayStr()] || {}).water || ''}" />
      <input id="nutProtein" type="number" placeholder="Proteína aprox (g)" value="${(DB.nutrition[todayStr()] || {}).protein || ''}" />
      <button class="btn" id="nutSave">Guardar</button>
    </div>
  `;
  document.getElementById('addPGoal').addEventListener('click', () => {
    openSheet(
      'Nueva meta física',
      `<div class="field"><label class="field-label">Meta</label><input id="pgLabel" placeholder="Sentadilla" /></div>
       <div class="row"><input id="pgCurrent" type="number" placeholder="Actual (kg)" /><input id="pgTarget" type="number" placeholder="Objetivo (kg)" /></div>
       <button class="btn btn-accent mt" id="pgSave" style="width:100%;padding:12px;">Guardar</button>`,
      (b) =>
        b.querySelector('#pgSave').addEventListener('click', () => {
          DB.physicalGoals.push({
            id: uid(),
            label: b.querySelector('#pgLabel').value.trim() || 'Meta',
            current: Number(b.querySelector('#pgCurrent').value) || 0,
            target: Number(b.querySelector('#pgTarget').value) || 1,
          });
          persist('physicalGoals');
          closeSheet();
          renderFitGoals(el);
        })
    );
  });
  document.getElementById('nutSave').addEventListener('click', () => {
    DB.nutrition[todayStr()] = {
      water: document.getElementById('nutWater').value,
      protein: document.getElementById('nutProtein').value,
    };
    persist('nutrition');
    toast('Guardado');
  });
}

/* ============================================================
   EXTRA
   ============================================================ */

let extraTab = 'countdown';

function renderExtra(el) {
  const tools = [
    { id: 'countdown', label: 'Fechas clave' },
    { id: 'viaje', label: 'Modo viaje' },
    { id: 'pomodoro', label: 'Enfoque' },
    { id: 'contactos', label: 'Apoyo' },
  ];
  el.innerHTML = `${tabsHtml(tools, extraTab)}<div id="extraPanel"></div>`;
  wireTabs(el, tools, (t) => {
    extraTab = t;
    renderExtra(el);
  });
  const panel = document.getElementById('extraPanel');
  ({
    countdown: renderCountdowns,
    viaje: renderTravelMode,
    pomodoro: renderPomodoro,
    contactos: renderContacts,
  }[extraTab])(panel);
}

function renderCountdowns(el) {
  const sorted = [...DB.countdowns].sort((a, b) => (a.date < b.date ? -1 : 1));
  el.innerHTML = `
    <div class="field"><input id="cLabel" placeholder="Evento (ej. curso de azafato)" class="mb" /></div>
    <div class="row mb"><input id="cDate" type="date" /><button class="btn btn-accent" id="cAdd">+</button></div>
    ${
      sorted
        .map((c) => {
          const days = Math.ceil((new Date(c.date) - new Date(todayStr())) / 86400000);
          return `<div class="card row between"><div><div class="card-title">${esc(c.label)}</div><div class="card-sub">${c.date}</div></div><span class="pill ${days <= 7 ? 'accent' : ''}">${days >= 0 ? days + 'd' : 'pasado'}</span></div>`;
        })
        .join('') || emptyState('Sin fechas guardadas', '')
    }
  `;
  document.getElementById('cAdd').addEventListener('click', () => {
    const label = document.getElementById('cLabel').value.trim();
    const date = document.getElementById('cDate').value;
    if (!label || !date) return toast('Rellena evento y fecha');
    DB.countdowns.push({ id: uid(), label, date });
    persist('countdowns');
    renderCountdowns(el);
  });
}

function renderTravelMode(el) {
  el.innerHTML = `
    <div class="card row between">
      <div>
        <div class="card-title">Modo viaje</div>
        <div class="card-sub">Simplifica la app mientras estás fuera</div>
      </div>
      <button class="checkbox ${DB.profile.travelMode ? 'checked' : ''}" id="travelToggle" style="border-radius:20px;width:46px;">${DB.profile.travelMode ? 'ON' : 'OFF'}</button>
    </div>
    <div class="card-sub mt">Con el modo viaje activo, cuando vuelvas a abrir "Hoy" en Hábitos solo verás lo esencial. (Ajusta manualmente qué hábitos son esenciales archivando el resto mientras viajas.)</div>
  `;
  document.getElementById('travelToggle').addEventListener('click', () => {
    DB.profile.travelMode = !DB.profile.travelMode;
    persist('profile');
    renderTravelMode(el);
  });
}

function renderPomodoro(el) {
  el.innerHTML = `
    <div class="row mb" style="gap:8px;"><input id="pomoMin" type="number" value="${DB.pomodoro.minutes}" placeholder="Minutos" /><button class="btn btn-accent" id="pomoStart">Empezar sesión de enfoque</button></div>
    <div class="timer-display" id="pomoDisplay">--:--</div>
    <div class="card-sub" style="text-align:center;">Si cancelas antes de tiempo, se pedirá confirmación y se pierde la racha de enfoque.</div>
  `;
  let interval, remaining, running = false;
  const disp = document.getElementById('pomoDisplay');
  document.getElementById('pomoStart').addEventListener('click', () => {
    const mins = Number(document.getElementById('pomoMin').value) || 25;
    DB.pomodoro.minutes = mins;
    persist('pomodoro');
    remaining = mins * 60;
    running = true;
    clearInterval(interval);
    const tick = () => {
      const m = String(Math.floor(remaining / 60)).padStart(2, '0');
      const s = String(remaining % 60).padStart(2, '0');
      disp.textContent = `${m}:${s}`;
      if (remaining <= 0) {
        clearInterval(interval);
        running = false;
        toast('Sesión de enfoque completada 🔥');
      }
      remaining--;
    };
    tick();
    interval = setInterval(tick, 1000);
  });
  disp.addEventListener('click', () => {
    if (!running) return;
    if (confirm('¿Seguro que quieres romper tu sesión de enfoque?')) {
      clearInterval(interval);
      running = false;
      disp.textContent = '--:--';
      toast('Sesión cancelada');
    }
  });
}

function renderContacts(el) {
  el.innerHTML = `
    <button class="btn btn-accent mb" id="addContact" style="width:100%;padding:12px;">+ Añadir persona</button>
    ${
      DB.contacts
        .map(
          (c) => `
      <div class="card row between">
        <div><div class="card-title">${esc(c.name)}</div><div class="card-sub">${esc(c.note || '')}</div></div>
        ${c.phone ? `<a class="btn" href="tel:${esc(c.phone)}">Llamar</a>` : ''}
      </div>`
        )
        .join('') || emptyState('Sin contactos', 'Gente clave a la que recurrir en fases intensas.')
    }
  `;
  document.getElementById('addContact').addEventListener('click', () => {
    openSheet(
      'Nueva persona',
      `<div class="field"><label class="field-label">Nombre</label><input id="ctName" /></div>
       <div class="field"><label class="field-label">Nota</label><input id="ctNote" placeholder="Por qué es importante" /></div>
       <div class="field"><label class="field-label">Teléfono (opcional)</label><input id="ctPhone" type="tel" /></div>
       <button class="btn btn-accent" id="ctSave" style="width:100%;padding:12px;">Guardar</button>`,
      (b) =>
        b.querySelector('#ctSave').addEventListener('click', () => {
          DB.contacts.push({
            id: uid(),
            name: b.querySelector('#ctName').value.trim() || 'Sin nombre',
            note: b.querySelector('#ctNote').value.trim(),
            phone: b.querySelector('#ctPhone').value.trim(),
          });
          persist('contacts');
          closeSheet();
          renderContacts(el);
        })
    );
  });
}

/* ============================================================
   NEREA — protocolo de confianza en acción
   ============================================================ */

const nereaExpanded = new Set();

function nereaStreak() {
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const iso = daysAgo(i);
    const dayEpisodes = DB.nereaEpisodes.filter((e) => e.date === iso);
    const hadFailure = dayEpisodes.some((e) => e.protocol === 'no');
    if (hadFailure) {
      if (i === 0) continue; // no cortar la racha por el día de hoy si aún puede mejorar
      break;
    }
    streak++;
  }
  return streak;
}

function renderNereaMain(el) {
  const episodes = DB.nereaEpisodes.slice().sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  const total = episodes.length;
  const solved = episodes.filter((e) => e.protocol === 'si' || e.protocol === 'medias').length;
  const pctSolved = total ? Math.round((solved / total) * 100) : null;
  const streak = nereaStreak();

  function avgIntensity(days) {
    const cutoff = daysAgo(days - 1);
    const inRange = episodes.filter((e) => e.date >= cutoff);
    if (!inRange.length) return null;
    return (inRange.reduce((s, e) => s + Number(e.intensity), 0) / inRange.length).toFixed(1);
  }
  const avg7 = avgIntensity(7);
  const avg30 = avgIntensity(30);

  const days30 = [];
  for (let i = 29; i >= 0; i--) {
    const iso = daysAgo(i);
    const dayEpisodes = episodes.filter((e) => e.date === iso);
    const maxIntensity = dayEpisodes.length ? Math.max(...dayEpisodes.map((e) => Number(e.intensity))) : 0;
    days30.push(maxIntensity);
  }

  const protocolIcon = { si: '✅', medias: '🟡', no: '🔴' };
  const protocolLabel = { si: 'Sí, lo apliqué', medias: 'A medias', no: 'No lo logré' };

  el.innerHTML = `
    <div class="card" style="border-color:var(--accent);">
      <div class="card-title" style="font-size:16px;">Protocolo</div>
      <div class="card-sub mt">Dispara con: sale con amigas, tarda en responder, habla con otro chico, plan suyo sin ti.</div>

      <div class="section-label" style="margin-top:14px;">En el momento (0-10 seg)</div>
      <div class="card-sub">· Responder normal y corto, sin preguntas de control<br>· Soltar el móvil de la mano</div>

      <div class="section-label">Cuando vuelve el pensamiento</div>
      <div class="card-sub">· Detecta "estoy rumiando"<br>· Pregúntate: ¿hecho nuevo o imaginación?<br>· Si no hay hecho nuevo: ocupa las manos (gym, UGOH), nada de scroll pasivo</div>

      <div class="card mt" style="background:var(--surface-2);border-color:var(--accent);">
        <div class="card-sub" style="font-style:italic;">"Confiar no es sentir cero duda, es actuar como si confiara aunque la duda aparezca. El ok del mensaje y el ok de la cabeza tienen que ser el mismo."</div>
      </div>
    </div>

    <div class="section-label">Estadísticas</div>
    <div class="card">
      <div class="row between">
        <span class="card-title">🔥 ${streak} días seguidos sosteniendo el protocolo</span>
      </div>
    </div>
    <div class="grid-2">
      <div class="card" style="text-align:center;">
        <div class="card-sub">Soltado (sí + a medias)</div>
        <div class="display" style="font-size:28px;">${pctSolved === null ? '—' : pctSolved + '%'}</div>
      </div>
      <div class="card" style="text-align:center;">
        <div class="card-sub">Episodios totales</div>
        <div class="display" style="font-size:28px;">${total}</div>
      </div>
      <div class="card" style="text-align:center;">
        <div class="card-sub">Intensidad media 7 días</div>
        <div class="display" style="font-size:28px;">${avg7 ?? '—'}</div>
      </div>
      <div class="card" style="text-align:center;">
        <div class="card-sub">Intensidad media 30 días</div>
        <div class="display" style="font-size:28px;">${avg30 ?? '—'}</div>
      </div>
    </div>
    <div class="card">
      <div class="card-sub mb">Intensidad, últimos 30 días</div>
      <div class="row" style="flex-wrap:wrap;gap:4px;">
        ${days30
          .map(
            (v) =>
              `<div style="width:16px;height:16px;border-radius:4px;background:${v === 0 ? 'var(--surface-2)' : `rgba(255,90,31,${0.25 + (v / 5) * 0.75})`};"></div>`
          )
          .join('')}
      </div>
    </div>

    <div class="row between">
      <span class="section-label" style="margin-top:14px;">Registro de episodios</span>
      <button class="btn btn-accent" id="addEpisode" style="margin-top:10px;">+ Nuevo episodio</button>
    </div>
    ${
      episodes
        .map((e) => {
          const expanded = nereaExpanded.has(e.id);
          return `
      <div class="card">
        <button class="row between" data-expand="${e.id}" style="width:100%;">
          <div class="row" style="gap:10px;">
            <span>${protocolIcon[e.protocol]}</span>
            <div style="text-align:left;">
              <div class="card-title">${esc(e.trigger)}</div>
              <div class="card-sub">${fmtDate(e.date)} · ${esc(e.time)} · intensidad ${e.intensity}/5</div>
            </div>
          </div>
          <span class="chevron ${expanded ? 'open' : ''}">▾</span>
        </button>
        <div class="${expanded ? '' : 'collapsed'} mt">
          <div class="card-sub">${protocolLabel[e.protocol]}</div>
          ${e.note ? `<div class="card-sub mt" style="font-style:italic;">"${esc(e.note)}"</div>` : ''}
          <button class="btn-ghost mt" data-delep="${e.id}" style="color:var(--warn);">Borrar episodio</button>
        </div>
      </div>`;
        })
        .join('') || emptyState('Sin episodios registrados', 'Cuando aparezca uno, regístralo aquí para ver el patrón con el tiempo.')
    }
  `;

  document.getElementById('addEpisode').addEventListener('click', () => nereaEpisodeForm());
  el.querySelectorAll('[data-expand]').forEach((b) =>
    b.addEventListener('click', () => {
      const id = b.dataset.expand;
      if (nereaExpanded.has(id)) nereaExpanded.delete(id);
      else nereaExpanded.add(id);
      renderNereaMain(el);
    })
  );
  el.querySelectorAll('[data-delep]').forEach((b) =>
    b.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (!confirm('¿Borrar este episodio?')) return;
      DB.nereaEpisodes = DB.nereaEpisodes.filter((x) => x.id !== b.dataset.delep);
      persist('nereaEpisodes');
      renderNereaMain(el);
    })
  );
}

function nereaEpisodeForm() {
  const now = new Date();
  openSheet(
    'Nuevo episodio',
    `
    <div class="field"><label class="field-label">Disparador</label><input id="epTrigger" placeholder="Salió de fiesta, tardó en responder..." /></div>
    <div class="field">
      <label class="field-label">Intensidad de la ansiedad (1-5)</label>
      <input id="epIntensity" type="range" min="1" max="5" value="3" style="width:100%;" />
      <div class="row between"><span class="card-sub">1 · leve</span><span class="card-sub" id="epIntensityVal">3</span><span class="card-sub">5 · fuerte</span></div>
    </div>
    <div class="field"><label class="field-label">¿Logré aplicar el protocolo?</label>
      <select id="epProtocol">
        <option value="si">✅ Sí</option>
        <option value="medias">🟡 A medias</option>
        <option value="no">🔴 No</option>
      </select>
    </div>
    <div class="field"><label class="field-label">Nota (opcional)</label><textarea id="epNote" placeholder="Qué pasó, qué pensé..."></textarea></div>
    <button class="btn btn-accent" id="epSave" style="width:100%;padding:12px;">Guardar</button>
  `,
    (body) => {
      body.querySelector('#epIntensity').addEventListener('input', (e) => {
        body.querySelector('#epIntensityVal').textContent = e.target.value;
      });
      body.querySelector('#epSave').addEventListener('click', () => {
        const trigger = body.querySelector('#epTrigger').value.trim();
        if (!trigger) return toast('Escribe el disparador');
        DB.nereaEpisodes.push({
          id: uid(),
          date: todayStr(),
          time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          trigger,
          intensity: Number(body.querySelector('#epIntensity').value),
          protocol: body.querySelector('#epProtocol').value,
          note: body.querySelector('#epNote').value.trim(),
        });
        persist('nereaEpisodes');
        closeSheet();
        toast('Episodio registrado');
        renderNereaMain(document.getElementById('sectionBody'));
      });
    }
  );
}

/* ============================================================
   SHIKAMARU — esfuerzo mínimo, movimiento justo
   ============================================================ */

function renderShikaMentalidad(el) {
  const quote = shikamaruQuoteOfDay();
  el.innerHTML = `
    <div class="card" style="text-align:center;border-color:var(--accent);">
      <div class="card-title" style="font-size:18px;">"${esc(quote)}"</div>
    </div>
    <div class="section-label">La mentalidad</div>
    <div class="card">
      <div class="card-sub">Shikamaru no es vago de verdad — odia gastar energía en cosas que no valen la pena. Cuando algo le importa, lo hace sin dudar. El resto del tiempo, piensa antes de moverse, como en el shogi: mover todas las piezas a la vez es la forma más rápida de perder.</div>
    </div>
    <div class="section-label">Aplicado a ti</div>
    <div class="card">
      <div class="card-sub">No tienes pereza real. Tienes demasiados frentes abiertos a la vez, y eso agota aunque cada cosa sea pequeña. No hace falta sostener todo perfecto cada día — elige 1-2 movimientos que de verdad importan y deja que el resto avance más despacio, sin culpa.</div>
    </div>
    <div class="card" style="background:var(--surface-2);border-color:var(--accent);">
      <div class="card-sub" style="font-style:italic;">Un buen estratega no juega todas las piezas. Juega la que mueve la partida.</div>
    </div>
  `;
}

function renderShikaMinimo(el) {
  const today = todayStr();
  const active = today && DB.minimalDays[today];
  const habits = activeHabits();
  if (active) {
    const selectedHabits = habits.filter((h) => active.includes(h.id));
    el.innerHTML = `
      <div class="card" style="border-color:var(--accent);">
        <div class="card-title">♟️ Modo mínimo activo hoy</div>
        <div class="card-sub mt">Solo cuenta esto, el resto está en pausa sin penalizar racha:</div>
      </div>
      ${selectedHabits.map((h) => `<div class="card"><div class="card-title">${h.level === 'nucleo' ? '⭐' : '🔹'} ${esc(h.name)}</div></div>`).join('')}
      <button class="btn btn-accent mt" id="deactivateMin2" style="width:100%;padding:12px;">Desactivar modo mínimo</button>
    `;
    document.getElementById('deactivateMin2').addEventListener('click', () => {
      delete DB.minimalDays[today];
      persist('minimalDays');
      toast('Modo mínimo desactivado');
      renderShikaMinimo(el);
    });
    return;
  }
  el.innerHTML = `
    <div class="card-sub mb">Días de agobio, no de perfección. Elige hasta 3 cosas que de verdad vas a sostener hoy — el resto queda en pausa sin romper ninguna racha.</div>
    <div id="minList">
      ${habits
        .map(
          (h) => `<div class="card row between" data-min="${h.id}" style="cursor:pointer;">
        <div class="row" style="gap:10px;"><span>${h.level === 'nucleo' ? '⭐' : '🔹'}</span><span class="card-title">${esc(h.name)}</span></div>
        <button class="checkbox" data-mincheck="${h.id}"></button>
      </div>`
        )
        .join('') || emptyState('Sin hábitos', 'Crea alguno primero en Hábitos.')}
    </div>
    <button class="btn btn-accent mt" id="activateMin" style="width:100%;padding:12px;">Activar modo mínimo</button>
  `;
  const selected = new Set();
  function toggleSelect(id) {
    if (selected.has(id)) selected.delete(id);
    else {
      if (selected.size >= 3) return toast('Máximo 3 — esa es la idea');
      selected.add(id);
    }
    el.querySelector(`[data-mincheck="${id}"]`).classList.toggle('checked', selected.has(id));
    el.querySelector(`[data-mincheck="${id}"]`).textContent = selected.has(id) ? '✓' : '';
  }
  el.querySelectorAll('[data-min]').forEach((card) =>
    card.addEventListener('click', () => toggleSelect(card.dataset.min))
  );
  document.getElementById('activateMin').addEventListener('click', () => {
    if (!selected.size) return toast('Elige al menos una cosa');
    DB.minimalDays[today] = Array.from(selected);
    persist('minimalDays');
    toast('Modo mínimo activado para hoy');
    renderShikaMinimo(el);
  });
}

function renderShikaFrentes(el) {
  const habits = activeHabits();
  const core = habits.filter((h) => h.level === 'nucleo').length;
  const mini = habits.filter((h) => h.level !== 'nucleo').length;
  const pendingTasks = DB.tasks.filter((t) => t.date === todayStr() && !t.done).length;
  const activeVideos = DB.ugohVideos.filter((v) => (v.checklist || []).some((c) => !c.done)).length;
  const total = core + mini + pendingTasks + activeVideos;

  let message = '';
  if (total <= 5) message = 'Pocos frentes abiertos. Margen para meter algo nuevo si quieres.';
  else if (total <= 10) message = 'Nivel manejable. Vigila que no crezca mucho más esta semana.';
  else message = 'Tienes muchos frentes a la vez. No es momento de añadir más — es momento de cerrar alguno o pausarlo con el Modo mínimo.';

  el.innerHTML = `
    <div class="card" style="text-align:center;border-color:var(--accent);">
      <div class="display" style="font-size:44px;">${total}</div>
      <div class="card-sub">frentes abiertos ahora mismo</div>
    </div>
    <div class="grid-2">
      <div class="card" style="text-align:center;"><div class="card-title">${core}</div><div class="card-sub">⭐ Núcleo</div></div>
      <div class="card" style="text-align:center;"><div class="card-title">${mini}</div><div class="card-sub">🔹 Mini hábitos</div></div>
      <div class="card" style="text-align:center;"><div class="card-title">${pendingTasks}</div><div class="card-sub">Tareas de hoy</div></div>
      <div class="card" style="text-align:center;"><div class="card-title">${activeVideos}</div><div class="card-sub">Vídeos en marcha</div></div>
    </div>
    <div class="card mt">
      <div class="card-sub">${esc(message)}</div>
    </div>
  `;
}

function renderShikaJugada(el) {
  const today = todayStr();
  const history = Object.entries(DB.dailyMove)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 14);
  el.innerHTML = `
    <div class="card-sub mb">Cada día, una sola jugada — la cosa que de verdad movió la aguja, no la lista entera de lo que hiciste.</div>
    <div class="field"><textarea id="moveText" placeholder="¿Cuál fue tu jugada de hoy?">${esc(DB.dailyMove[today] || '')}</textarea></div>
    <button class="btn btn-accent mb" id="moveSave" style="width:100%;padding:12px;">Guardar jugada de hoy</button>
    <div class="section-label">Historial</div>
    ${
      history
        .filter(([d]) => d !== today)
        .map(([d, text]) => `<div class="card"><div class="card-sub">${fmtDate(d)}</div><div class="card-title mt">${esc(text)}</div></div>`)
        .join('') || `<div class="card-sub">Aún no hay jugadas anteriores.</div>`
    }
  `;
  document.getElementById('moveSave').addEventListener('click', () => {
    const text = document.getElementById('moveText').value.trim();
    if (!text) return toast('Escribe algo, aunque sea corto');
    DB.dailyMove[today] = text;
    persist('dailyMove');
    toast('Jugada guardada');
    renderShikaJugada(el);
  });
}

let nubesInterval = null;
function renderShikaNubes(el) {
  el.innerHTML = `
    <div class="card-sub mb" style="text-align:center;">Parar a propósito no es procrastinar. Es pensar con calma antes de moverte.</div>
    <div class="row" style="justify-content:center;gap:8px;">
      <button class="btn" data-nubes="5">5 min</button>
      <button class="btn" data-nubes="10">10 min</button>
      <button class="btn" data-nubes="15">15 min</button>
    </div>
    <div class="timer-display" id="nubesDisplay">--:--</div>
    <div class="row" style="justify-content:center;"><button class="btn" id="nubesStop">Detener</button></div>
  `;
  el.querySelectorAll('[data-nubes]').forEach((b) =>
    b.addEventListener('click', () => {
      let secs = Number(b.dataset.nubes) * 60;
      clearInterval(nubesInterval);
      const disp = document.getElementById('nubesDisplay');
      const tick = () => {
        const m = String(Math.floor(secs / 60)).padStart(2, '0');
        const s = String(secs % 60).padStart(2, '0');
        disp.textContent = `${m}:${s}`;
        if (secs <= 0) {
          clearInterval(nubesInterval);
          toast('Vuelve con la cabeza más clara.');
          if (navigator.vibrate) navigator.vibrate(200);
        }
        secs--;
      };
      tick();
      nubesInterval = setInterval(tick, 1000);
    })
  );
  document.getElementById('nubesStop').addEventListener('click', () => {
    clearInterval(nubesInterval);
    document.getElementById('nubesDisplay').textContent = '--:--';
  });
}

function dayPlanForm(date, onSaved) {
  const habits = activeHabits();
  const existing = DB.dayPlan[date];
  const isTomorrow = date === daysAgo(-1);
  openSheet(
    `Plan para ${isTomorrow ? 'mañana' : fmtDate(date)}`,
    `
    <div class="card-sub mb">Marca los hábitos que tocan ese día. Si no planificas nada, se asume que tocan todos por defecto.</div>
    <div id="planList">
      ${habits
        .map((h) => {
          const checked = existing ? existing.includes(h.id) : true;
          return `<div class="card row between" data-plancard="${h.id}" style="cursor:pointer;">
          <div class="row" style="gap:10px;"><span>${h.level === 'nucleo' ? '⭐' : '🔹'}</span><span class="card-title">${esc(h.name)}</span></div>
          <button class="checkbox ${checked ? 'checked' : ''}" data-plancheck="${h.id}">${checked ? '✓' : ''}</button>
        </div>`;
        })
        .join('') || emptyState('Sin hábitos', 'Crea alguno primero en Hábitos.')}
    </div>
    <button class="btn btn-accent mt" id="planSave" style="width:100%;padding:12px;">Guardar plan</button>
    ${existing ? `<button class="btn-ghost mt" id="planReset" style="width:100%;">Quitar plan (volver a todos por defecto)</button>` : ''}
  `,
    (body) => {
      const selected = new Set(existing ? existing : habits.map((h) => h.id));
      function toggle(id) {
        if (selected.has(id)) selected.delete(id);
        else selected.add(id);
        const btn = body.querySelector(`[data-plancheck="${id}"]`);
        btn.classList.toggle('checked', selected.has(id));
        btn.textContent = selected.has(id) ? '✓' : '';
      }
      body.querySelectorAll('[data-plancard]').forEach((card) => card.addEventListener('click', () => toggle(card.dataset.plancard)));
      body.querySelector('#planSave').addEventListener('click', () => {
        DB.dayPlan[date] = Array.from(selected);
        persist('dayPlan');
        closeSheet();
        toast('Plan guardado');
        if (onSaved) onSaved();
      });
      if (body.querySelector('#planReset')) {
        body.querySelector('#planReset').addEventListener('click', () => {
          delete DB.dayPlan[date];
          persist('dayPlan');
          closeSheet();
          toast('Plan eliminado, vuelve a todos por defecto');
          if (onSaved) onSaved();
        });
      }
    }
  );
}

function renderHabitosPlan(el) {
  const tomorrow = daysAgo(-1);
  const habits = activeHabits();
  function dayRow(offset) {
    const d = daysAgo(-offset);
    const plan = DB.dayPlan[d];
    const label = offset === 0 ? 'Hoy' : offset === 1 ? 'Mañana' : new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
    return `
      <div class="card row between" data-editday="${d}" style="cursor:pointer;">
        <div><div class="card-title" style="text-transform:capitalize;">${label}</div><div class="card-sub">${plan ? `${plan.length}/${habits.length} planificados` : 'Todos por defecto'}</div></div>
        <span class="card-sub">Editar ›</span>
      </div>`;
  }
  el.innerHTML = `
    <div class="card-sub mb">Planifica la noche de antes qué toca mañana — así no tienes que decidirlo con la cabeza cansada.</div>
    <button class="btn btn-accent mb" id="planTomorrow" style="width:100%;padding:12px;">🗒️ Planificar mañana</button>
    <div class="section-label">Próximos días</div>
    ${[0, 1, 2, 3, 4, 5, 6].map(dayRow).join('')}
  `;
  document.getElementById('planTomorrow').addEventListener('click', () => dayPlanForm(tomorrow, () => renderHabitosPlan(el)));
  el.querySelectorAll('[data-editday]').forEach((card) =>
    card.addEventListener('click', () => dayPlanForm(card.dataset.editday, () => renderHabitosPlan(el)))
  );
}

function renderAntibrainrot(el) {
  el.innerHTML = `
    <div class="card" style="text-align:center;border-color:var(--accent);">
      <div class="card-title" style="font-size:18px;">¿Sientes ganas de scrollear o perder el tiempo?</div>
      <div class="card-sub mt">Antes de abrir esa app, prueba esto.</div>
    </div>
    <button class="btn btn-accent mb" id="brainrotGo" style="width:100%;padding:14px;">Dame una alternativa</button>
    <div id="brainrotResult"></div>
  `;
  document.getElementById('brainrotGo').addEventListener('click', () => {
    const pick = DB.brainrotBank[Math.floor(Math.random() * DB.brainrotBank.length)];
    document.getElementById('brainrotResult').innerHTML = `
      <div class="card" style="border-color:var(--accent);text-align:center;">
        <div class="card-title" style="font-size:17px;">${esc(pick)}</div>
      </div>
    `;
  });
}

/* ---- Respirar ---- */

const BREATHING_TECHNIQUES = [
  {
    id: 'box',
    name: 'Respiración de caja',
    pattern: [4, 4, 4, 4],
    phases: ['Inhala', 'Sostén', 'Exhala', 'Sostén'],
    benefit: 'Ritmo parejo en 4 tiempos. La usan equipos de operaciones especiales y atletas para bajar la activación rápido antes de algo exigente.',
  },
  {
    id: '478',
    name: 'Respiración 4-7-8',
    pattern: [4, 7, 8],
    phases: ['Inhala', 'Sostén', 'Exhala'],
    benefit: 'Popularizada por el Dr. Andrew Weil. La exhalación larga fuerza una bajada notable del ritmo, útil antes de dormir o en picos de tensión.',
  },
  {
    id: 'coherente',
    name: 'Respiración coherente',
    pattern: [5, 5],
    phases: ['Inhala', 'Exhala'],
    benefit: 'Unas 6 respiraciones por minuto, sin pausas. Se asocia a mejor variabilidad de la frecuencia cardiaca y un estado más estable durante el día.',
  },
  {
    id: 'suspiro',
    name: 'Suspiro fisiológico',
    pattern: [2, 1, 6],
    phases: ['Inhala', 'Inhala extra corta', 'Exhala larga'],
    benefit: 'Doble inhalación por la nariz + exhalación larga por la boca. Estudiado en Stanford como una de las formas más rápidas de bajar la activación en el momento.',
  },
];

const breathingExpanded = new Set();

function renderShikaRespirar(el) {
  const log = DB.breathingLog.slice().sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  const recent = log.slice(0, 10);
  const last30 = log.filter((e) => e.date >= daysAgo(29));
  const avgDrop = last30.length ? (last30.reduce((s, e) => s + (e.before - e.after), 0) / last30.length).toFixed(1) : null;

  el.innerHTML = `
    <div class="card">
      <div class="card-title" style="font-size:16px;">Por qué funciona</div>
      <div class="card-sub mt">Respirar despacio y de forma controlada activa el sistema nervioso parasimpático — el que baja pulsaciones y activación cuando el cuerpo está en modo alerta constante. No sustituye ayuda profesional si el estrés es continuo o muy intenso, pero es una herramienta real para el momento.</div>
    </div>

    <div class="section-label">Técnicas</div>
    ${BREATHING_TECHNIQUES.map((t) => {
      const expanded = breathingExpanded.has(t.id);
      return `
      <div class="card">
        <button class="row between" data-texp="${t.id}" style="width:100%;">
          <span class="card-title">${esc(t.name)}</span>
          <span class="chevron ${expanded ? 'open' : ''}">▾</span>
        </button>
        <div class="${expanded ? '' : 'collapsed'} mt">
          <div class="card-sub">${esc(t.benefit)}</div>
          <div class="card-sub mt">Patrón: ${t.pattern.map((s, i) => `${t.phases[i]} ${s}s`).join(' · ')}</div>
        </div>
        <button class="btn btn-accent mt" data-practice="${t.id}" style="width:100%;">Practicar</button>
      </div>`;
    }).join('')}

    ${
      avgDrop !== null
        ? `<div class="section-label">Últimos 30 días</div><div class="card"><div class="card-sub">Bajada media de tensión por sesión</div><div class="display" style="font-size:28px;">${avgDrop}</div></div>`
        : ''
    }

    <div class="section-label">Sesiones recientes</div>
    ${
      recent
        .map(
          (e) => `
      <div class="card row between">
        <div><div class="card-title">${esc(e.technique)}</div><div class="card-sub">${fmtDate(e.date)} · ${e.time}</div>${e.note ? `<div class="card-sub mt" style="font-style:italic;">"${esc(e.note)}"</div>` : ''}</div>
        <span class="pill ${e.after < e.before ? 'good' : ''}">${e.before} → ${e.after}</span>
      </div>`
        )
        .join('') || emptyState('Sin sesiones todavía', 'Practica una técnica para empezar tu registro.')
    }
  `;
  el.querySelectorAll('[data-texp]').forEach((b) =>
    b.addEventListener('click', () => {
      const id = b.dataset.texp;
      if (breathingExpanded.has(id)) breathingExpanded.delete(id);
      else breathingExpanded.add(id);
      renderShikaRespirar(el);
    })
  );
  el.querySelectorAll('[data-practice]').forEach((b) =>
    b.addEventListener('click', () => breathingSession(BREATHING_TECHNIQUES.find((t) => t.id === b.dataset.practice)))
  );
}

function breathingSession(technique) {
  openSheet(technique.name, `<div id="breathBody"></div>`, (sheetBody) => {
    const body = sheetBody.querySelector('#breathBody');
    renderBeforeStep();

    function renderBeforeStep() {
      body.innerHTML = `
        <div class="card-sub mb">${esc(technique.benefit)}</div>
        <div class="field">
          <label class="field-label">Nivel de tensión ahora (1-5)</label>
          <input type="range" min="1" max="5" value="3" id="beforeRange" style="width:100%;" />
          <div class="row between"><span class="card-sub">1 relajado</span><span class="card-sub" id="beforeVal">3</span><span class="card-sub">5 muy tenso</span></div>
        </div>
        <div class="field">
          <label class="field-label">Rondas</label>
          <select id="roundsSelect"><option value="4">4 (rápido)</option><option value="6" selected>6</option><option value="8">8 (más largo)</option></select>
        </div>
        <button class="btn btn-accent" id="startBreath" style="width:100%;padding:12px;">Empezar</button>
      `;
      body.querySelector('#beforeRange').addEventListener('input', (e) => (body.querySelector('#beforeVal').textContent = e.target.value));
      body.querySelector('#startBreath').addEventListener('click', () => {
        runAnimation(Number(body.querySelector('#beforeRange').value), Number(body.querySelector('#roundsSelect').value));
      });
    }

    function runAnimation(before, rounds) {
      let round = 0;
      let phaseIdx = 0;
      let stopped = false;
      body.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;padding:16px 0;">
          <div id="breathCircle" style="width:110px;height:110px;border-radius:50%;background:var(--accent);opacity:0.25;transform:scale(1);transition:transform 1s linear, opacity 1s linear;"></div>
          <div id="breathLabel" class="card-title mt" style="font-size:19px;"></div>
          <div id="breathCount" class="display mt" style="font-size:38px;"></div>
          <div class="card-sub mt">Ronda <span id="roundNum">1</span>/${rounds}</div>
          <button class="btn mt" id="stopBreath">Detener</button>
        </div>
      `;
      const circle = body.querySelector('#breathCircle');
      const label = body.querySelector('#breathLabel');
      const countEl = body.querySelector('#breathCount');
      const roundEl = body.querySelector('#roundNum');
      body.querySelector('#stopBreath').addEventListener('click', () => {
        stopped = true;
        renderAfterStep(before);
      });

      function phaseStep() {
        if (stopped) return;
        if (round >= rounds) {
          renderAfterStep(before);
          return;
        }
        const phaseName = technique.phases[phaseIdx];
        const duration = technique.pattern[phaseIdx];
        label.textContent = phaseName;
        roundEl.textContent = round + 1;
        const lower = phaseName.toLowerCase();
        circle.style.transitionDuration = duration + 's';
        if (lower.includes('inhala')) {
          circle.style.transform = 'scale(1.6)';
          circle.style.opacity = '0.55';
        } else if (lower.includes('exhala')) {
          circle.style.transform = 'scale(1)';
          circle.style.opacity = '0.25';
        }
        let remaining = duration;
        countEl.textContent = remaining;
        const tick = setInterval(() => {
          if (stopped) return clearInterval(tick);
          remaining--;
          if (remaining <= 0) {
            clearInterval(tick);
            phaseIdx++;
            if (phaseIdx >= technique.phases.length) {
              phaseIdx = 0;
              round++;
            }
            phaseStep();
          } else {
            countEl.textContent = remaining;
          }
        }, 1000);
      }
      phaseStep();
    }

    function renderAfterStep(before) {
      body.innerHTML = `
        <div class="card-sub mb" style="text-align:center;">Sesión completada.</div>
        <div class="field">
          <label class="field-label">Nivel de tensión ahora (1-5)</label>
          <input type="range" min="1" max="5" value="${before}" id="afterRange" style="width:100%;" />
          <div class="row between"><span class="card-sub">1 relajado</span><span class="card-sub" id="afterVal">${before}</span><span class="card-sub">5 muy tenso</span></div>
        </div>
        <div class="field"><label class="field-label">Nota (opcional)</label><textarea id="breathNote" placeholder="Qué notaste..."></textarea></div>
        <button class="btn btn-accent" id="saveBreath" style="width:100%;padding:12px;">Guardar</button>
      `;
      body.querySelector('#afterRange').addEventListener('input', (e) => (body.querySelector('#afterVal').textContent = e.target.value));
      body.querySelector('#saveBreath').addEventListener('click', () => {
        const after = Number(body.querySelector('#afterRange').value);
        const note = body.querySelector('#breathNote').value.trim();
        const now = new Date();
        DB.breathingLog.push({
          id: uid(),
          date: todayStr(),
          time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          technique: technique.name,
          before,
          after,
          note,
        });
        persist('breathingLog');
        closeSheet();
        toast(after < before ? 'Bajó la tensión. Buen trabajo.' : 'Sesión guardada.');
        renderShikaRespirar(document.getElementById('sectionBody'));
      });
    }
  });
}

/* ---------------- Init ---------------- */

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
  let refreshed = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshed) return;
    refreshed = true;
    window.location.reload();
  });
}
