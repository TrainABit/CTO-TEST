(function () {
  const STORAGE_KEY = "capital-dashboard-state-v1";
  const START_DATE = new Date(Date.UTC(2025, 0, 1));
  const ASSUMPTIONS = {
    conservativeAnnual: 0.075,
    aggressiveAnnual: 0.22,
    allocationAlpha: 0.0025,
  };

  const milestoneOptions = [
    {
      id: "2025-03-31",
      label: "March 2025 · Q1 checkpoint",
    },
    {
      id: "2025-06-30",
      label: "June 2025 · Midyear recalibration",
    },
    {
      id: "2025-09-30",
      label: "September 2025 · Q3 acceleration",
    },
    {
      id: "2025-12-31",
      label: "December 2025 · Year-end target",
    },
  ];

  const defaultState = {
    startingCapital: 500000,
    targetCapital: 10000000,
    timelineMilestone: milestoneOptions[milestoneOptions.length - 1].id,
    aggressiveAllocation: 50,
  };

  const elements = {
    startingCapital: document.getElementById("startingCapital"),
    targetCapital: document.getElementById("targetCapital"),
    timelineSelector: document.getElementById("timelineMilestone"),
    allocationSlider: document.getElementById("allocationSlider"),
    conservativeValue: document.getElementById("conservativeValue"),
    aggressiveValue: document.getElementById("aggressiveValue"),
    planStatus: document.getElementById("planStatus"),
    reset: document.getElementById("resetState"),
    chartInsight: document.getElementById("chartInsight"),
    stats: {
      timeToGoal: document.getElementById("timeToGoal"),
      timeToGoalDetail: document.getElementById("timeToGoalDetail"),
      projectedIrr: document.getElementById("projectedIrr"),
      projectedMoic: document.getElementById("projectedMoic"),
      planBias: document.getElementById("planBias"),
      planBiasDetail: document.getElementById("planBiasDetail"),
    },
  };

  milestoneOptions.forEach((milestone) => {
    const option = document.createElement("option");
    option.value = milestone.id;
    option.textContent = milestone.label;
    elements.timelineSelector.appendChild(option);
  });

  const state = loadState();
  syncInputs();

  let chart;
  const initialProjection = buildProjection(state);
  initChart(initialProjection);
  renderAllocation();
  renderSummary(initialProjection);
  renderInsight(initialProjection);
  persistState();

  elements.startingCapital.addEventListener("input", handleNumericInput("startingCapital", 10000));
  elements.startingCapital.addEventListener("blur", () => {
    elements.startingCapital.value = sanitizeNumber(state.startingCapital);
  });

  elements.targetCapital.addEventListener("input", handleNumericInput("targetCapital", 100000));
  elements.targetCapital.addEventListener("blur", () => {
    elements.targetCapital.value = sanitizeNumber(state.targetCapital);
  });

  elements.timelineSelector.addEventListener("change", (event) => {
    state.timelineMilestone = event.target.value;
    refresh();
  });

  elements.allocationSlider.addEventListener("input", (event) => {
    state.aggressiveAllocation = Number(event.target.value);
    renderAllocation();
    refresh();
  });

  elements.reset.addEventListener("click", () => {
    Object.assign(state, { ...defaultState });
    syncInputs();
    refresh();
  });

  const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  darkModeQuery.addEventListener("change", () => {
    applyChartTheme();
    if (chart) {
      chart.update("none");
    }
  });

  function handleNumericInput(key, minValue) {
    return (event) => {
      if (event.target.value === "") {
        return;
      }
      const parsed = Number(event.target.value);
      if (Number.isNaN(parsed)) {
        return;
      }
      state[key] = Math.max(minValue, Math.round(parsed));
      refresh();
    };
  }

  function sanitizeNumber(value) {
    return Math.round(Number(value) || 0);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ...defaultState };
      }
      const parsed = JSON.parse(raw);
      const hydrated = { ...defaultState, ...parsed };
      if (!milestoneOptions.some((m) => m.id === hydrated.timelineMilestone)) {
        hydrated.timelineMilestone = defaultState.timelineMilestone;
      }
      hydrated.startingCapital = sanitizeNumber(hydrated.startingCapital);
      hydrated.targetCapital = sanitizeNumber(hydrated.targetCapital);
      hydrated.aggressiveAllocation = clamp(Number(hydrated.aggressiveAllocation) || defaultState.aggressiveAllocation, 0, 100);
      return hydrated;
    } catch (error) {
      console.warn("Unable to load dashboard state", error);
      return { ...defaultState };
    }
  }

  function syncInputs() {
    elements.startingCapital.value = sanitizeNumber(state.startingCapital);
    elements.targetCapital.value = sanitizeNumber(state.targetCapital);
    elements.timelineSelector.value = state.timelineMilestone;
    elements.allocationSlider.value = state.aggressiveAllocation;
    renderAllocation();
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function calculateMonthlyReturn(allocationPercentage) {
    const weight = clamp(allocationPercentage / 100, 0, 1);
    const conservativeMonthly = Math.pow(1 + ASSUMPTIONS.conservativeAnnual, 1 / 12) - 1;
    const aggressiveMonthly = Math.pow(1 + ASSUMPTIONS.aggressiveAnnual, 1 / 12) - 1;
    const blended = conservativeMonthly * (1 - weight) + aggressiveMonthly * weight;
    const alphaAdjustment = (weight - 0.5) * ASSUMPTIONS.allocationAlpha;
    return Math.max(blended + alphaAdjustment, 0.0005);
  }

  function buildProjection(currentState) {
    const milestone = milestoneOptions.find((m) => m.id === currentState.timelineMilestone) || milestoneOptions[0];
    const milestoneDate = new Date(`${milestone.id}T00:00:00Z`);
    const totalMonths = Math.max(0, monthsBetween(START_DATE, milestoneDate));
    const monthlyReturn = calculateMonthlyReturn(currentState.aggressiveAllocation);

    const labels = [];
    const values = [];
    const targetLine = [];

    let value = currentState.startingCapital;
    for (let monthIndex = 0; monthIndex <= totalMonths; monthIndex += 1) {
      const labelDate = addMonths(START_DATE, monthIndex);
      labels.push(formatLabel(labelDate));
      targetLine.push(currentState.targetCapital);
      if (monthIndex > 0) {
        value = value * (1 + monthlyReturn);
      }
      values.push(Number(value.toFixed(2)));
    }

    return {
      labels,
      values,
      targetLine,
      monthlyReturn,
      milestone,
    };
  }

  function refresh() {
    const projection = buildProjection(state);
    updateChart(projection);
    renderSummary(projection);
    renderInsight(projection);
    persistState();
  }

  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Unable to persist dashboard state", error);
    }
  }

  function renderAllocation() {
    const conservative = 100 - clamp(state.aggressiveAllocation, 0, 100);
    const aggressive = clamp(state.aggressiveAllocation, 0, 100);
    elements.conservativeValue.textContent = `${conservative}%`;
    elements.aggressiveValue.textContent = `${aggressive}%`;
    const planDescriptor = describePlanBias(aggressive);
    elements.planStatus.textContent = planDescriptor.detail;
    elements.stats.planBias.textContent = planDescriptor.label;
    elements.stats.planBiasDetail.textContent = planDescriptor.caption;
  }

  function describePlanBias(aggressiveShare) {
    if (aggressiveShare <= 25) {
      return {
        label: "Capital preservation",
        detail: "Weighted toward conservative deployments with modest alpha exposure.",
        caption: "Focus on resilient, income-oriented sleeves.",
      };
    }
    if (aggressiveShare <= 60) {
      return {
        label: "Balanced growth",
        detail: "Evenly balanced barbell mix targeting blended growth and protection.",
        caption: "Disciplined diversification with targeted growth bets.",
      };
    }
    return {
      label: "Aggressive expansion",
      detail: "High-growth tilt chasing outsized upside with higher volatility.",
      caption: "Dialed toward momentum and innovation strategies.",
    };
  }

  function renderSummary(projection) {
    const { values, labels, milestone, monthlyReturn } = projection;
    const finalValue = values[values.length - 1];
    const ratioToTarget = finalValue / state.targetCapital;
    const goalHitIndex = values.findIndex((value) => value >= state.targetCapital);

    if (goalHitIndex >= 0) {
      const monthsToGoal = goalHitIndex;
      elements.stats.timeToGoal.textContent = formatTimeframe(monthsToGoal);
      elements.stats.timeToGoalDetail.textContent = `Reaches ${formatCurrency(state.targetCapital)} by ${labels[goalHitIndex]}.`;
    } else {
      elements.stats.timeToGoal.textContent = ratioToTarget >= 1 ? "On milestone" : "Beyond milestone";
      const percentage = (ratioToTarget * 100).toFixed(1);
      elements.stats.timeToGoalDetail.textContent = `Tracks to ${formatCurrency(finalValue)} (${percentage}% of goal) by ${labels[labels.length - 1]}.`;
    }

    const annualReturn = Math.pow(1 + monthlyReturn, 12) - 1;
    const spread = 0.04 + (state.aggressiveAllocation / 100) * 0.06;
    const irrLow = Math.max(annualReturn - spread / 2, 0);
    const irrHigh = annualReturn + spread / 2;
    elements.stats.projectedIrr.textContent = `${formatPercentage(irrLow)}–${formatPercentage(irrHigh)}`;

    const moic = finalValue / state.startingCapital;
    elements.stats.projectedMoic.textContent = `${moic.toFixed(2)}×`;
  }

  function renderInsight(projection) {
    const { values, milestone } = projection;
    const finalValue = values[values.length - 1];
    const progress = Math.min((finalValue / state.targetCapital) * 100, 400);
    const milestoneDate = new Date(`${milestone.id}T00:00:00Z`);
    elements.chartInsight.textContent = `Projected capital at ${formatLongDate(milestoneDate)}: ${formatCurrency(finalValue)} (${progress.toFixed(1)}% of target).`;
  }

  function initChart(projection) {
    const ctx = document.getElementById("progressChart");
    const palette = getChartPalette();
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: projection.labels,
        datasets: [
          {
            label: "Projected value",
            data: projection.values,
            borderColor: palette.primary,
            backgroundColor: palette.fill,
            borderWidth: 3,
            tension: 0.35,
            fill: true,
            pointRadius: 2,
            pointHoverRadius: 5,
          },
          {
            label: "Target goal",
            data: projection.targetLine,
            borderColor: palette.target,
            borderDash: [6, 6],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: palette.text,
              font: {
                family: "Inter",
              },
            },
          },
          tooltip: {
            backgroundColor: palette.tooltipBg,
            titleColor: palette.tooltipText,
            bodyColor: palette.tooltipText,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || "";
                const value = context.parsed.y || 0;
                return `${label}: ${formatCurrency(value)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: palette.grid,
            },
            ticks: {
              color: palette.textMuteds,
            },
          },
          y: {
            grid: {
              color: palette.grid,
            },
            ticks: {
              color: palette.textMuteds,
              callback: (val) => formatCurrencyShort(val),
            },
          },
        },
      },
    });
  }

  function getChartPalette() {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (dark) {
      return {
        primary: "#60a5fa",
        fill: "rgba(96, 165, 250, 0.18)",
        target: "#f59e0b",
        text: "#e2e8f0",
        textMuteds: "#cbd5f5",
        grid: "rgba(148, 163, 184, 0.15)",
        tooltipBg: "rgba(15, 23, 42, 0.85)",
        tooltipText: "#e2e8f0",
      };
    }
    return {
      primary: "#2563eb",
      fill: "rgba(37, 99, 235, 0.18)",
      target: "#f97316",
      text: "#1e293b",
      textMuteds: "#475569",
      grid: "rgba(148, 163, 184, 0.2)",
      tooltipBg: "rgba(255, 255, 255, 0.92)",
      tooltipText: "#1e293b",
    };
  }

  function applyChartTheme() {
    if (!chart) return;
    const palette = getChartPalette();
    const [projectionDataset, targetDataset] = chart.data.datasets;
    projectionDataset.borderColor = palette.primary;
    projectionDataset.backgroundColor = palette.fill;
    targetDataset.borderColor = palette.target;
    chart.options.plugins.legend.labels.color = palette.text;
    chart.options.plugins.tooltip.backgroundColor = palette.tooltipBg;
    chart.options.plugins.tooltip.titleColor = palette.tooltipText;
    chart.options.plugins.tooltip.bodyColor = palette.tooltipText;
    chart.options.scales.x.grid.color = palette.grid;
    chart.options.scales.x.ticks.color = palette.textMuteds;
    chart.options.scales.y.grid.color = palette.grid;
    chart.options.scales.y.ticks.color = palette.textMuteds;
  }

  function updateChart(projection) {
    if (!chart) {
      initChart(projection);
      return;
    }
    chart.data.labels = projection.labels;
    chart.data.datasets[0].data = projection.values;
    chart.data.datasets[1].data = projection.targetLine;
    applyChartTheme();
    chart.update();
  }

  function monthsBetween(start, end) {
    const years = end.getUTCFullYear() - start.getUTCFullYear();
    const months = end.getUTCMonth() - start.getUTCMonth();
    return Math.max(years * 12 + months, 0);
  }

  function addMonths(date, count) {
    const cloned = new Date(date.getTime());
    cloned.setUTCMonth(cloned.getUTCMonth() + count);
    return cloned;
  }

  function formatLabel(date) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  }

  function formatLongDate(date) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatCurrencyShort(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  function formatPercentage(value) {
    return `${(value * 100).toFixed(1)}%`;
  }

  function formatTimeframe(months) {
    if (months <= 0) {
      return "Immediate";
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const segments = [];
    if (years > 0) {
      segments.push(`${years} yr${years > 1 ? "s" : ""}`);
    }
    if (remainingMonths > 0) {
      segments.push(`${remainingMonths} mo${remainingMonths > 1 ? "s" : ""}`);
    }
    return segments.join(" ");
  }
})();
