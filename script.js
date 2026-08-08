
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

    window.addEventListener('resize', () => drawChart());
    updateActiveRange(currentRange);
    animateGauge();
