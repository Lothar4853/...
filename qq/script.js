let subjectPriorities = {
  "CDV": "ALTA",
  "FM": "ALTA",
  "QG": "MEDIA",
  "ARP": "BAJA"
};

let rawTasks = [
  { id: 1, subject: "CDV", title: "Proyecto Integrador Parte 1", desc: "Modelado tridimensional y superficies cuadráticas.", date: "2026-08-15" },
  { id: 2, subject: "FM", title: "Guía de Ejercicios N° 4", desc: "Leyes de Newton, fricción y cantidad de movimiento.", date: "2026-08-18" },
  { id: 3, subject: "ARP", title: "Cuestionario de Control 2", desc: "Estructuras condicionales y ciclos de repetición.", date: "2026-08-20" }
];

let allNotifications = [
  { type: "tareas", title: "Entrega de CDV", desc: "Proyecto Integrador vence hoy a las 23:59." },
  { type: "lecturas", title: "Control de Lectura FM", desc: "Capítulo 5: Dinámica Rotacional." },
  { type: "lecciones", title: "Próxima Lección QG", desc: "Lección sobre Soluciones y Concentraciones el Martes." },
  { type: "anuncios", title: "Aviso Decanato", desc: "Mantenimiento programado en SidWeb este Domingo." }
];

const calendarEvents = {
  "2026-08-15": [{ time: '07:30', title: 'Cálculo Vectorial', desc: 'Entrega Proyecto Integrador' }],
  "2026-08-18": [{ time: '23:59', title: 'Física Mecánica', desc: 'Entrega Guía de Ejercicios N° 4' }]
};

let currentDate = new Date(2026, 7, 15);
let selectedDayFormatted = "2026-08-15";

// LÓGICA DE DESPLIZAMIENTO/TOGGLE DEL BOTTOM SHEET
function toggleSheetPosition() {
  const sheet = document.getElementById('draggableSheet');
  if (sheet) {
    sheet.classList.toggle('collapsed');
  }
}

function setupSheetGestures() {
  const sheet = document.getElementById('draggableSheet');
  if (!sheet) return;

  let startY = 0;
  let currentY = 0;

  sheet.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  sheet.addEventListener('touchmove', (e) => {
    currentY = e.touches[0].clientY;
  }, { passive: true });

  sheet.addEventListener('touchend', () => {
    let diff = currentY - startY;
    if (diff > 50) {
      // Arrastrar hacia abajo
      sheet.classList.add('collapsed');
    } else if (diff < -50) {
      // Arrastrar hacia arriba
      sheet.classList.remove('collapsed');
    }
  });
}

// TAREAS Y PRIORIDADES
function renderTasks() {
  const container = document.getElementById('taskListContainer');
  if (!container) return;
  container.innerHTML = '';

  const priorityOrder = { "ALTA": 1, "MEDIA": 2, "BAJA": 3 };
  let sortedTasks = [...rawTasks].sort((a, b) => {
    let pA = priorityOrder[subjectPriorities[a.subject]] || 2;
    let pB = priorityOrder[subjectPriorities[b.subject]] || 2;
    return pA - pB;
  });

  sortedTasks.forEach(task => {
    const priority = subjectPriorities[task.subject] || "MEDIA";
    let badgeClass = priority === "ALTA" ? "red" : (priority === "MEDIA" ? "yellow" : "green");
    let borderClass = priority === "ALTA" ? "border-red" : (priority === "MEDIA" ? "border-yellow" : "border-green");

    const card = document.createElement('div');
    card.className = `dark-task-card ${borderClass}`;
    card.innerHTML = `
      <div class="card-head">
        <span class="subject">${task.subject}</span>
        <span class="diff-badge ${badgeClass}">${priority}</span>
      </div>
      <h4>${task.title}</h4>
      <p>${task.desc}</p>
      <div class="card-foot">
        <span><i class="fa-regular fa-clock"></i> Entrega: ${task.date}</span>
        <button class="btn-sidweb">SidWeb</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function cyclePriority(btn) {
  const subj = btn.getAttribute('data-subject');
  if (btn.classList.contains('p-alta')) {
    btn.className = 'priority-badge-btn p-media';
    btn.textContent = 'MEDIA';
    subjectPriorities[subj] = 'MEDIA';
  } else if (btn.classList.contains('p-media')) {
    btn.className = 'priority-badge-btn p-baja';
    btn.textContent = 'BAJA';
    subjectPriorities[subj] = 'BAJA';
  } else {
    btn.className = 'priority-badge-btn p-alta';
    btn.textContent = 'ALTA';
    subjectPriorities[subj] = 'ALTA';
  }
}

function applyPriorityChanges() {
  renderTasks();
  renderSchedule();
  showToast('¡Prioridades aplicadas en Tareas y Horario!');
}

function renderSchedule() {
  const container = document.getElementById('scheduleListContainer');
  if (!container) return;
  
  let cdvPriority = subjectPriorities["CDV"] === "ALTA" ? "tag-red" : "tag-yellow";
  let fmPriority = subjectPriorities["FM"] === "ALTA" ? "tag-red" : "tag-yellow";

  container.innerHTML = `
    <div class="schedule-item">
      <div class="time-col">07:30<br><span>09:30</span></div>
      <div class="class-col">
        <h4>Cálculo Vectorial</h4>
        <p>Aula 302 - FCNM | Par. 2</p>
        <div class="task-tag ${cdvPriority}" onclick="openSection('tareas')">
          <i class="fa-solid fa-triangle-exclamation"></i> Prioridad ${subjectPriorities["CDV"]}
        </div>
      </div>
    </div>
    <div class="schedule-item">
      <div class="time-col">09:30<br><span>11:30</span></div>
      <div class="class-col">
        <h4>Física Mecánica</h4>
        <p>Aula 101 - FIMCP | Par. 1</p>
        <div class="task-tag ${fmPriority}" onclick="openSection('tareas')">
          <i class="fa-solid fa-clock"></i> Prioridad ${subjectPriorities["FM"]}
        </div>
      </div>
    </div>
  `;
}

// NOTIFICACIONES
function updateNotificationsFilter() {
  const chkTareas = document.getElementById('chk-tareas').checked;
  const chkLecturas = document.getElementById('chk-lecturas').checked;
  const chkLecciones = document.getElementById('chk-lecciones').checked;
  const chkAnuncios = document.getElementById('chk-anuncios').checked;

  const activeNotifs = allNotifications.filter(n => {
    if (n.type === 'tareas' && chkTareas) return true;
    if (n.type === 'lecturas' && chkLecturas) return true;
    if (n.type === 'lecciones' && chkLecciones) return true;
    if (n.type === 'anuncios' && chkAnuncios) return true;
    return false;
  });

  const badge = document.getElementById('notifBadge');
  badge.textContent = activeNotifs.length;
  badge.style.display = activeNotifs.length > 0 ? 'inline-block' : 'none';

  const drawerList = document.getElementById('notifListContainer');
  drawerList.innerHTML = '';

  if (activeNotifs.length === 0) {
    drawerList.innerHTML = '<div style="color:#8e8e93; font-size:11px; text-align:center; padding:10px;">Sin notificaciones.</div>';
  } else {
    activeNotifs.forEach(n => {
      const card = document.createElement('div');
      card.className = 'notif-card-item';
      card.innerHTML = `<h6>${n.title}</h6><p>${n.desc}</p>`;
      drawerList.appendChild(card);
    });
  }
}

function toggleNotificationDrawer() {
  document.getElementById('notificationDrawer').classList.toggle('open');
}

function saveNotificationTypes() {
  updateNotificationsFilter();
  showToast('Filtro de notificaciones guardado');
}

// RECORDATORIOS Y MANEJO DE INTERVALOS
let alarmInterval = null;
let currentSecondsLeft = 0;
let audioContext = null;
let alarmOscillator = null;

function setAlarmLedState(active, text) {
  const ledBox = document.getElementById('alarmLedStatus');
  const ledText = document.getElementById('alarmLedText');
  if (active) {
    ledBox.classList.add('active');
    ledText.textContent = text;
  } else {
    ledBox.classList.remove('active');
    ledText.textContent = text;
  }
}

function updateDigitalDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  document.getElementById('alarmDigitalDisplay').textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function quickSetAlarm(sec) {
  document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active-pill'));
  if (event) event.target.classList.add('active-pill');
  startAlarmCountdown(sec);
}

function setCustomAlarm() {
  const mins = parseInt(document.getElementById('alarmCustomMins').value) || 1;
  startAlarmCountdown(mins * 60);
}

function startAlarmCountdown(seconds) {
  cancelAlarm();

  currentSecondsLeft = seconds;
  updateDigitalDisplay(currentSecondsLeft);
  setAlarmLedState(true, "RECORDATORIO PROGRAMADO");
  
  document.getElementById('btnCancelAlarm').classList.remove('hidden');
  document.getElementById('alarmSubtext').textContent = `Recordatorio activo en ${currentSecondsLeft}s`;

  alarmInterval = setInterval(() => {
    currentSecondsLeft--;
    updateDigitalDisplay(currentSecondsLeft);
    document.getElementById('alarmSubtext').textContent = `Recordatorio activo en ${currentSecondsLeft}s`;

    if (currentSecondsLeft <= 0) {
      clearInterval(alarmInterval);
      triggerRealAlarmSound();
    }
  }, 1000);

  showToast(`Recordatorio activado en ${seconds}s`);
}

function cancelAlarm() {
  if (alarmInterval) clearInterval(alarmInterval);
  setAlarmLedState(false, "SIN RECORDATORIO");
  updateDigitalDisplay(0);
  document.getElementById('btnCancelAlarm').classList.hidden = true;
  document.getElementById('btnCancelAlarm').classList.add('hidden');
  document.getElementById('alarmSubtext').textContent = "Configure su próximo recordatorio académico";
}

function triggerRealAlarmSound() {
  setAlarmLedState(false, "¡RECORDATORIO ACTIVO!");
  
  const intervalMins = document.getElementById('intervalSelect').value;
  document.getElementById('modalIntervalNotice').textContent = `Recordatorio académico. Si lo pospones, volverá a sonar en ${intervalMins} min.`;
  document.getElementById('alarmTriggerModal').classList.add('active');

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    
    alarmOscillator = setInterval(() => {
      if (audioContext && audioContext.state !== 'closed') {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(750, audioContext.currentTime);
        gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start();
        osc.stop(audioContext.currentTime + 0.25);
      }
    }, 450);
  } catch (e) {
    console.log("Audio no soportado", e);
  }
}

function stopActiveSoundAndModal(snooze = false) {
  if (alarmOscillator) clearInterval(alarmOscillator);
  if (audioContext) audioContext.close();
  
  document.getElementById('alarmTriggerModal').classList.remove('active');

  if (snooze) {
    const intervalMins = parseInt(document.getElementById('intervalSelect').value) || 5;
    startAlarmCountdown(intervalMins * 60);
    showToast(`Pospuesto por ${intervalMins} minutos`);
  } else {
    cancelAlarm();
    showToast('Recordatorio finalizado');
  }
}

// AGENDAR TAREA
function addNewTask(event) {
  event.preventDefault();
  const title = document.getElementById('newTaskTitle').value;
  const dateStr = document.getElementById('newTaskDate').value;
  const subject = document.getElementById('newTaskSubject').value;

  rawTasks.unshift({
    id: Date.now(),
    subject: subject,
    title: title,
    desc: "Agendada manualmente por el estudiante.",
    date: dateStr
  });

  if (!calendarEvents[dateStr]) calendarEvents[dateStr] = [];
  calendarEvents[dateStr].push({ time: '23:59', title: subject, desc: title });

  renderTasks();
  renderCalendar();

  showToast('Tarea agendada exitosamente');
  document.getElementById('newTaskTitle').value = '';
  document.getElementById('newTaskDate').value = '';
  openSection('tareas');
}

// CALENDARIO
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  document.getElementById('currentMonthYear').textContent = `${monthNames[month]} ${year}`;

  const grid = document.getElementById('calendarDaysGrid');
  grid.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startingIndex = (firstDay === 0) ? 6 : firstDay - 1;

  for (let i = startingIndex - 1; i >= 0; i--) {
    const cell = document.createElement('div');
    cell.className = 'day-cell other-month';
    grid.appendChild(cell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';
    cell.textContent = day;

    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

    if (day === 15 && month === 7 && year === 2026) cell.classList.add('today');
    if (dateKey === selectedDayFormatted) cell.classList.add('selected-day');

    if (calendarEvents[dateKey] && calendarEvents[dateKey].length > 0) {
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'event-dots';
      calendarEvents[dateKey].forEach(() => {
        const dot = document.createElement('span');
        dot.className = 'e-dot';
        dotsContainer.appendChild(dot);
      });
      cell.appendChild(dotsContainer);
    }

    cell.onclick = () => selectCalendarDay(dateKey, cell, day, monthNames[month]);
    grid.appendChild(cell);
  }

  renderEventsForDate(selectedDayFormatted);
}

function selectCalendarDay(dateKey, cellElement, dayNumber, monthName) {
  document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('selected-day'));
  cellElement.classList.add('selected-day');
  selectedDayFormatted = dateKey;
  document.getElementById('selectedDayTitle').textContent = `Actividades para el ${dayNumber} de ${monthName}`;
  renderEventsForDate(dateKey);
}

function renderEventsForDate(dateKey) {
  const eventsList = document.getElementById('eventsList');
  eventsList.innerHTML = '';

  if (calendarEvents[dateKey] && calendarEvents[dateKey].length > 0) {
    calendarEvents[dateKey].forEach(ev => {
      const item = document.createElement('div');
      item.className = 'event-item';
      item.innerHTML = `
        <div class="event-time">${ev.time}</div>
        <div class="event-details">
          <h5>${ev.title}</h5>
          <p>${ev.desc}</p>
        </div>
      `;
      eventsList.appendChild(item);
    });
  } else {
    eventsList.innerHTML = '<div style="color:#8e8e93; font-size:12px; padding:10px 0;">No hay entregas para este día.</div>';
  }
}

function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
}

function openSection(sectionId) {
  document.querySelectorAll('.app-page').forEach(page => page.classList.remove('active-page'));
  const targetPage = document.getElementById(sectionId);
  if (targetPage) targetPage.classList.add('active-page');

  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const currentNavBtn = document.getElementById('btn-' + sectionId);
  if (currentNavBtn) currentNavBtn.classList.add('active');
}

function showToast(message) {
  const toast = document.getElementById('saveToast');
  document.getElementById('toastMsg').textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  renderTasks();
  renderSchedule();
  updateNotificationsFilter();
  renderCalendar();
  setupSheetGestures();
})
function updateLiveClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('liveClock').textContent = `${hours}:${mins}`;
}
setInterval(updateLiveClock, 1000);
updateLiveClock()
document.querySelector('.btn-share-qr').addEventListener('click', () => {
  const link = document.createElement('a');
  link.href = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=202614061-AIDHAN-CEDENO';
  link.download = 'QR_Estudiantil_ESPOL.png';
  link.click();
})
if ('vibrate' in navigator) {
  navigator.vibrate(12); // Vibración rápida de 12ms
};