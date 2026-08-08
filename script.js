
    const chartCanvas = document.getElementById('studioChart');
    const tooltip = document.getElementById('chartTooltip');
    const rangeButtons = document.querySelectorAll('.range-btn');

    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      ranges: {
        '1D': [11800, 11950, 11740, 12020, 12230, 12110, 12304],
        '1W': [10400, 10720, 10980, 11250, 11500, 11780, 12304],
        '1M': [9800, 10120, 10400, 10680, 10950, 11180, 12304],
        '6M': [8200, 8600, 9000, 9450, 9800, 10400, 12304],
        '1Y': [6700, 7200, 7800, 8400, 9200, 9800, 10450, 11020, 11500, 11840, 12180, 12304],
      },
    };

    const ctx = chartCanvas.getContext('2d');
    let currentRange = '1Y';
    let dataPoints = chartData.ranges[currentRange];
    let chartPoints = [];

    const chartConfig = {
      padding: 36,
      pointRadius: 6,
      lineWidth: 3,
      gradientColors: ['rgba(139, 92, 246, 0.88)', 'rgba(236, 72, 153, 0.98)'],
      fillColors: ['rgba(139, 92, 246, 0.22)', 'rgba(236, 72, 153, 0.06)'],
    };

    function resizeCanvas() {
      const rect = chartCanvas.getBoundingClientRect();
      chartCanvas.width = rect.width * window.devicePixelRatio;
      chartCanvas.height = rect.height * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    }

    function drawChart() {
      resizeCanvas();
      const width = chartCanvas.width / window.devicePixelRatio;
      const height = chartCanvas.height / window.devicePixelRatio;
      const { padding, pointRadius, lineWidth, gradientColors, fillColors } = chartConfig;
      const values = dataPoints;
      const max = Math.max(...values) * 1.04;
      const min = Math.min(...values) * 0.98;
      const range = max - min;
      const points = values.length;
      const plotWidth = width - padding * 2;
      const plotHeight = height - padding * 2;

      chartPoints = [];
      ctx.clearRect(0, 0, width, height);

      // grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const y = padding + (plotHeight / 3) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // chart line path
      ctx.beginPath();
      values.forEach((value, index) => {
        const x = padding + (plotWidth / (points - 1)) * index;
        const y = padding + plotHeight - ((value - min) / range) * plotHeight;
        chartPoints.push({ x, y, value });
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = `linear-gradient(90deg, ${gradientColors[0]}, ${gradientColors[1]})`;
      const lineGradient = ctx.createLinearGradient(padding, 0, width - padding, 0);
      lineGradient.addColorStop(0, gradientColors[0]);
      lineGradient.addColorStop(1, gradientColors[1]);
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = lineWidth;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.stroke();

      // fill area
      ctx.lineTo(width - padding, height - padding);
      ctx.lineTo(padding, height - padding);
      ctx.closePath();
      const fillGradient = ctx.createLinearGradient(0, padding, 0, height - padding);
      fillGradient.addColorStop(0, fillColors[0]);
      fillGradient.addColorStop(1, fillColors[1]);
      ctx.fillStyle = fillGradient;
      ctx.fill();

      // data points
      chartPoints.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#14141a';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // x-axis labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      chartData.labels.slice(0, values.length).forEach((label, index) => {
        const x = padding + (plotWidth / (points - 1)) * index;
        ctx.fillText(label, x, height - 12);
      });
    }

    function updateActiveRange(rangeKey) {
      currentRange = rangeKey;
      dataPoints = chartData.ranges[rangeKey];
      rangeButtons.forEach((button) => {
        button.classList.toggle('active', button.dataset.range === rangeKey);
      });
      drawChart();
    }

    chartCanvas.addEventListener('mousemove', (event) => {
      const rect = chartCanvas.getBoundingClientRect();
      const x = (event.clientX - rect.left);
      const closest = chartPoints.reduce((prev, curr) => {
        return Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev;
      });
      if (!closest) return;

      tooltip.style.left = `${closest.x}px`;
      tooltip.style.top = `${closest.y - 16}px`;
      tooltip.innerHTML = `<strong>${closest.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })}</strong><span>${chartData.labels[chartPoints.indexOf(closest)] || ''}</span>`;
      tooltip.classList.add('visible');
    });

    chartCanvas.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });

    rangeButtons.forEach((button) => {
      button.addEventListener('click', () => updateActiveRange(button.dataset.range));
    });

    function animateGauge() {
      const gaugeRing = document.querySelector('.gauge-ring');
      const gaugeValue = document.querySelector('.gauge-value');
      if (!gaugeRing || !gaugeValue) return;
      const targetProgress = Number(gaugeRing.dataset.progress || 76);
      let currentProgress = 0;

      function step() {
        currentProgress += 1;
        gaugeRing.style.setProperty('--progress', currentProgress);
        gaugeValue.textContent = `${currentProgress}%`;
        if (currentProgress < targetProgress) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');

    function closeSidebar() {
      sidebar?.classList.remove('open');
      sidebarOverlay?.setAttribute('aria-hidden', 'true');
    }

    function openSidebar() {
      sidebar?.classList.add('open');
      sidebarOverlay?.setAttribute('aria-hidden', 'false');
    }

    menuToggle?.addEventListener('click', () => {
      if (!sidebar || !sidebarOverlay) return;
      sidebar.classList.toggle('open');
      const isOpen = sidebar.classList.contains('open');
      sidebarOverlay.setAttribute('aria-hidden', String(!isOpen));
    });

    sidebarOverlay?.addEventListener('click', closeSidebar);

    const openAiChat = document.getElementById('openAiChat');
    const closeAiChat = document.getElementById('closeAiChat');
    const aiChatDrawer = document.getElementById('aiChatDrawer');
    const aiChatOverlay = document.getElementById('aiChatOverlay');
    const aiChatForm = document.getElementById('aiChatForm');
    const aiChatInput = document.getElementById('aiChatInput');
    const aiChatMessages = document.getElementById('aiChatMessages');

    function openAiDrawer() {
      aiChatDrawer?.classList.add('open');
      aiChatOverlay?.classList.add('open');
      aiChatDrawer?.setAttribute('aria-hidden', 'false');
      aiChatOverlay?.setAttribute('aria-hidden', 'false');
      aiChatInput?.focus();
    }

    function closeAiDrawer() {
      aiChatDrawer?.classList.remove('open');
      aiChatOverlay?.classList.remove('open');
      aiChatDrawer?.setAttribute('aria-hidden', 'true');
      aiChatOverlay?.setAttribute('aria-hidden', 'true');
    }

    function appendAiMessage(role, text) {
      if (!aiChatMessages) return;
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${role}`;
      bubble.innerHTML = `<span>${role === 'user' ? 'You' : 'Devcore AI'}</span><p>${text}</p>`;
      aiChatMessages.appendChild(bubble);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }

    function getAiResponse(question) {
      const value = question.trim().toLowerCase();
      if (value.includes('progress') || value.includes('sprint')) {
        return 'Current sprint progress is 76%. We have 9 of 12 milestones complete and the risk level is low.';
      }
      if (value.includes('tasks') || value.includes('today')) {
        return 'There are 7 tasks left today and 18 tasks have already been completed.';
      }
      if (value.includes('risk')) {
        return 'Risk level remains low, with no major blockers reported for this sprint.';
      }
      return 'I can help with sprint progress, milestones, tasks, and risk level. Try asking something like “What is the sprint progress?”.';
    }

    openAiChat?.addEventListener('click', openAiDrawer);
    closeAiChat?.addEventListener('click', closeAiDrawer);
    aiChatOverlay?.addEventListener('click', closeAiDrawer);

    aiChatForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!aiChatInput) return;
      const question = aiChatInput.value.trim();
      if (!question) return;
      appendAiMessage('user', question);
      aiChatInput.value = '';
      setTimeout(() => {
        appendAiMessage('assistant', getAiResponse(question));
      }, 320);
    });

    window.addEventListener('resize', () => drawChart());
    updateActiveRange(currentRange);
    animateGauge();

    // Meeting widget: ICS import, local storage sync, and milestone detection
    function generateId() {
      return 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2,8);
    }

    function parseICSText(icsText) {
      const events = [];
      const vevents = icsText.split(/BEGIN:VEVENT/gi).slice(1);
      vevents.forEach(block => {
        const get = (key) => {
          const m = block.match(new RegExp(key + ":([^\r\n]+)", 'i'));
          return m ? m[1].trim() : '';
        };
        const summary = get('SUMMARY');
        const dtstart = get('DTSTART');
        const dtend = get('DTEND');
        const desc = get('DESCRIPTION');
        const location = get('LOCATION');
        let start = null;
        if (dtstart) {
          const s = dtstart.replace(/\\r|\\n/g, '');
          const iso = s.includes('T') ? s.replace(/Z$/, '') : s + 'T000000';
          const year = iso.slice(0,4), month = iso.slice(4,6), day = iso.slice(6,8);
          const time = iso.slice(9,15) || '000000';
          const formatted = `${year}-${month}-${day}T${time.slice(0,2)}:${time.slice(2,4)}:${time.slice(4,6)}`;
          const d = new Date(formatted);
          if (!isNaN(d)) start = d.toISOString();
        }
        if (start) {
          events.push({ id: generateId(), summary, start, end: dtend, description: desc, location });
        }
      });
      return events;
    }

    function loadEvents() {
      try {
        const raw = localStorage.getItem('events:v1');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }

    function saveEvents(arr) {
      localStorage.setItem('events:v1', JSON.stringify(arr));
    }

    function renderCalendarList() {
      const events = loadEvents() || [];
      // ensure events have id and ISO start
      const normalized = events.map(e=> ({ ...e, id: e.id || generateId(), start: (typeof e.start === 'string') ? e.start : (e.start ? new Date(e.start).toISOString() : null) })).filter(e=>e.start);
      saveEvents(normalized);
      renderMonthCalendar();
      renderAgenda(normalized);
      renderNotifications(normalized);
      detectNextMilestone(normalized);
    }

    // Calendar grid rendering
    let calendarState = { year: new Date().getFullYear(), month: new Date().getMonth() };

    function renderMonthCalendar() {
      const grid = document.getElementById('calendarGrid');
      const monthLabel = document.getElementById('monthLabel');
      if (!grid) return;
      const { year, month } = calendarState;
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      monthLabel.textContent = first.toLocaleString(undefined, { month: 'long', year: 'numeric' });
      grid.innerHTML = '';
      // header weekdays
      const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      weekdays.forEach(w => {
        const h = document.createElement('div');
        h.className = 'wkhead';
        h.textContent = w;
        grid.appendChild(h);
      });
      // fill blanks
      for (let i=0;i<first.getDay();i++) {
        const blank = document.createElement('div'); blank.className='day-cell blank'; grid.appendChild(blank);
      }
      const events = loadEvents();
      for (let d=1; d<= last.getDate(); d++) {
        const day = new Date(year, month, d);
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        cell.dataset.date = day.toISOString();
        const num = document.createElement('div'); num.className='day-num'; num.textContent = d; cell.appendChild(num);
        const evs = (events||[]).filter(e => {
          const es = new Date(e.start);
          return es.getFullYear()===day.getFullYear() && es.getMonth()===day.getMonth() && es.getDate()===day.getDate();
        });
        evs.slice(0,3).forEach(ev=>{
          const dot = document.createElement('div'); dot.className='day-ev'; dot.title = ev.summary || 'Event'; dot.textContent = ev.summary ? ev.summary.slice(0,12) : 'Event'; cell.appendChild(dot);
        });
        if (evs.length>3) {
          const more = document.createElement('div'); more.className='day-more'; more.textContent = `+${evs.length-3}`; cell.appendChild(more);
        }
        grid.appendChild(cell);
      }
    }

    document.getElementById('prevMonth')?.addEventListener('click', ()=>{ calendarState.month--; if (calendarState.month<0){calendarState.month=11;calendarState.year--;} renderMonthCalendar(); });
    document.getElementById('nextMonth')?.addEventListener('click', ()=>{ calendarState.month++; if (calendarState.month>11){calendarState.month=0;calendarState.year++;} renderMonthCalendar(); });

    function renderAgenda(events) {
      const wrap = document.getElementById('agendaItems');
      if (!wrap) return;
      const now = new Date();
      const upcoming = (events||[]).filter(e=> new Date(e.start) >= now).sort((a,b)=> new Date(a.start)-new Date(b.start)).slice(0,6);
      if (!upcoming.length) { wrap.innerHTML = '<p class="muted">No upcoming events</p>'; return; }
      wrap.innerHTML = upcoming.map(ev=> `<div class="agenda-row"><strong>${ev.summary||'Event'}</strong><div class="agenda-time">${new Date(ev.start).toLocaleString()}</div></div>`).join('');
    }

    function renderNotifications(events) {
      const node = document.getElementById('notificationsList');
      if (!node) return;
      const now = new Date();
      const upcoming = (events||[]).filter(e=> new Date(e.start) >= now).sort((a,b)=> new Date(a.start)-new Date(b.start)).slice(0,8);
      if (!upcoming.length) { node.innerHTML = '<p class="muted">No notifications yet.</p>'; return; }
      node.innerHTML = '';
      upcoming.forEach(ev=>{
        const div = document.createElement('div'); div.className='notification-item';
        div.innerHTML = `<div class="notif-body"><strong>${ev.summary||'Event'}</strong><div class="notif-time">${new Date(ev.start).toLocaleString()}</div><div class="notif-person">${ev.description||ev.location||'Developer'}</div></div><div class="notif-actions"><button class="reschedule-btn" data-id="${ev.id}">Reschedule</button></div>`;
        node.appendChild(div);
      });
      // attach reschedule handlers
      node.querySelectorAll('.reschedule-btn').forEach(b=> b.addEventListener('click',(e)=>{
        const id = e.currentTarget.dataset.id; openRescheduleModal(id);
      }));
    }

    // Reschedule modal and logic
    const modal = document.getElementById('rescheduleModal');
    const freeSlotsEl = document.getElementById('freeSlots');
    const modalEventTitle = document.getElementById('modalEventTitle');
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    modal?.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);

    function closeModal(){ if(!modal) return; modal.setAttribute('aria-hidden','true'); modal.classList.remove('open'); freeSlotsEl.innerHTML=''; }

    function openRescheduleModal(eventId){
      const events = loadEvents();
      const ev = events.find(x=>x.id===eventId);
      if(!ev) return alert('Event not found');
      modalEventTitle.textContent = ev.summary || 'Reschedule event';
      const slots = computeFreeSlots(events, ev);
      freeSlotsEl.innerHTML = '';
      if(!slots.length) freeSlotsEl.innerHTML = '<p class="muted">No free slots available nearby.</p>';
      slots.forEach(s=>{
        const btn = document.createElement('button'); btn.className='slot-button'; btn.textContent = new Date(s).toLocaleString(); btn.addEventListener('click', ()=>{ rescheduleEvent(eventId, s); });
        freeSlotsEl.appendChild(btn);
      });
      modal.setAttribute('aria-hidden','false'); modal.classList.add('open');
    }

    function computeFreeSlots(events, targetEvent){
      // consider next 14 days, slots at 09,11,14,16
      const hours = [9,11,14,16];
      const slots = [];
      const now = new Date();
      for(let i=0;i<14;i++){
        const day = new Date(now.getFullYear(), now.getMonth(), now.getDate()+i);
        hours.forEach(h=>{
          const slot = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, 0, 0);
          if (slot <= new Date()) return;
          // ignore if same as current event
          if (targetEvent && new Date(targetEvent.start).getTime() === slot.getTime()) return;
          const conflict = events.some(ev=> Math.abs(new Date(ev.start).getTime() - slot.getTime()) < (60*60*1000));
          if (!conflict) slots.push(slot.toISOString());
        });
      }
      return slots.slice(0,12);
    }

    function rescheduleEvent(eventId, newIso) {
      const events = loadEvents();
      const idx = events.findIndex(e=>e.id===eventId);
      if (idx === -1) return alert('Event not found');
      events[idx].start = newIso;
      saveEvents(events);
      closeModal();
      renderCalendarList();
      alert('Event rescheduled to ' + new Date(newIso).toLocaleString());
    }

    function detectNextMilestone(events) {
      const now = new Date();
      const found = (events||[]).find(ev => (ev.summary || '').toLowerCase().includes('milestone') && new Date(ev.start) > now);
      const notif = document.getElementById('notificationsList');
      if (!notif) return;
      if (found) {
        const existing = notif.querySelector('.milestone-pin');
        if (existing) existing.remove();
        const pin = document.createElement('div');
        pin.className = 'notification-item milestone-pin';
        pin.innerHTML = `<div class="notif-body"><strong>Milestone: ${found.summary}</strong><div class="notif-time">${new Date(found.start).toLocaleString()}</div><div class="notif-person">${found.description||found.location||''}</div></div>`;
        notif.prepend(pin);
      }
    }

    document.getElementById('importIcs')?.addEventListener('click', () => {
      const fileInput = document.getElementById('icsFile');
      if (!fileInput || !fileInput.files || !fileInput.files[0]) return alert('Select an .ics file first');
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const events = parseICSText(reader.result);
        const stored = loadEvents();
        const merged = stored.concat(events).filter((v,i,a)=> a.findIndex(x=>x.summary===v.summary && x.start===v.start)===i);
        saveEvents(merged);
        renderCalendarList();
        alert('Imported ' + events.length + ' events');
      };
      reader.readAsText(file);
    });

    document.getElementById('clearEvents')?.addEventListener('click', () => {
      localStorage.removeItem('events:v1');
      renderCalendarList();
    });

    document.getElementById('callButton')?.addEventListener('click', () => {
      const events = loadEvents();
      const next = events.find(e=> new Date(e.start) > new Date());
      const subject = next ? (next.summary || 'Scheduled call') : 'Team meeting';
      if (confirm('Start call for: ' + subject + '?')) {
        const w = window.open('', '_blank', 'width=400,height=300');
        if (w) {
          w.document.write('<p style="font-family:system-ui, sans-serif;padding:16px">Calling: ' + subject + '</p>');
        }
      }
    });

    // initial render
    renderCalendarList();
