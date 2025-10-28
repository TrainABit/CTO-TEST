(() => {
  const storageKeys = {
    allocations: 'investmentTracker.allocations',
    scenario: 'investmentTracker.scenarioConfig',
    tbills: 'investmentTracker.tbillConfig'
  };

  const assetClasses = ['Cash', 'T-Bills', 'Bond ETFs', 'Equities', 'Private Bets', 'Reserve'];
  const assetColors = {
    Cash: '#4c8bf5',
    'T-Bills': '#6d5dfc',
    'Bond ETFs': '#b068f7',
    Equities: '#4fd1c5',
    'Private Bets': '#f6c85f',
    Reserve: '#ef6f6c'
  };

  const numberFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const percentFormatter = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  const state = {
    allocations: [],
    scenario: {
      target: 10000000,
      years: 30,
      contribution: 0,
      useReserve: false,
      exitPlans: []
    },
    tbills: {
      capital: 25000,
      rungs: 4,
      intervalWeeks: 13,
      reinvest: true,
      rates: [5.0, 5.1, 5.2, 5.3]
    },
    charts: {
      stacked: null,
      pie: null,
      active: 'stacked'
    },
    editingRow: null,
    scenarioResult: null
  };

  const dom = {};

  function formatCurrency(value) {
    if (Number.isNaN(value) || value == null) return '$0.00';
    return numberFormatter.format(value);
  }

  function formatPercent(value) {
    if (Number.isNaN(value) || value == null) return '0%';
    return percentFormatter.format(value / 100);
  }

  function safeParseNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function loadAllocations() {
    try {
      const raw = localStorage.getItem(storageKeys.allocations);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Unable to load allocations', error);
      return [];
    }
  }

  function persistAllocations() {
    localStorage.setItem(storageKeys.allocations, JSON.stringify(state.allocations));
  }

  function loadScenario() {
    try {
      const raw = localStorage.getItem(storageKeys.scenario);
      if (!raw) return { ...state.scenario };
      const parsed = JSON.parse(raw);
      return {
        ...state.scenario,
        ...parsed,
        exitPlans: Array.isArray(parsed?.exitPlans) ? parsed.exitPlans : []
      };
    } catch (error) {
      console.warn('Unable to load scenario config', error);
      return { ...state.scenario };
    }
  }

  function persistScenario() {
    localStorage.setItem(storageKeys.scenario, JSON.stringify(state.scenario));
  }

  function loadTbillConfig() {
    try {
      const raw = localStorage.getItem(storageKeys.tbills);
      if (!raw) return { ...state.tbills };
      const parsed = JSON.parse(raw);
      const rates = Array.isArray(parsed?.rates) && parsed.rates.length
        ? parsed.rates.map((rate) => safeParseNumber(rate))
        : [...state.tbills.rates];
      return {
        ...state.tbills,
        ...parsed,
        rates
      };
    } catch (error) {
      console.warn('Unable to load T-bill config', error);
      return { ...state.tbills };
    }
  }

  function persistTbillConfig() {
    localStorage.setItem(storageKeys.tbills, JSON.stringify(state.tbills));
  }

  function setText(id, value) {
    if (dom[id]) {
      dom[id].textContent = value;
    }
  }

  function initialiseDomReferences() {
    dom.allocationForm = document.getElementById('allocationForm');
    dom.allocationName = document.getElementById('allocationName');
    dom.allocationClass = document.getElementById('allocationClass');
    dom.allocationAmount = document.getElementById('allocationAmount');
    dom.allocationReturn = document.getElementById('allocationReturn');
    dom.allocationNotes = document.getElementById('allocationNotes');
    dom.clearAllocationForm = document.getElementById('clearAllocationForm');
    dom.allocationsTableBody = document.getElementById('allocationsTableBody');
    dom.allocationsEmptyState = document.getElementById('allocationsEmptyState');

    dom.summaryTotal = document.getElementById('summaryTotal');
    dom.summaryDeployed = document.getElementById('summaryDeployed');
    dom.summaryReserve = document.getElementById('summaryReserve');
    dom.summaryBlended = document.getElementById('summaryBlended');

    dom.chartButtons = document.querySelectorAll('.chart-toggle button');
    dom.chartEmptyState = document.getElementById('chartEmptyState');
    dom.stackedCanvas = document.getElementById('allocationStackedChart');
    dom.pieCanvas = document.getElementById('allocationPieChart');

    dom.scenarioForm = document.getElementById('scenarioForm');
    dom.scenarioTarget = document.getElementById('scenarioTarget');
    dom.scenarioYears = document.getElementById('scenarioYears');
    dom.scenarioContribution = document.getElementById('scenarioContribution');
    dom.scenarioUseReserve = document.getElementById('scenarioUseReserve');
    dom.scenarioBlended = document.getElementById('scenarioBlended');
    dom.scenarioStarting = document.getElementById('scenarioStarting');
    dom.runScenario = document.getElementById('runScenario');
    dom.scenarioSummary = document.getElementById('scenarioSummary');
    dom.scenarioTableBody = document.getElementById('scenarioTableBody');
    dom.scenarioEmptyState = document.getElementById('scenarioEmptyState');

    dom.exitPlanForm = document.getElementById('exitPlanForm');
    dom.exitAssetSelect = document.getElementById('exitAssetSelect');
    dom.exitYear = document.getElementById('exitYear');
    dom.exitMultiple = document.getElementById('exitMultiple');
    dom.exitPlansTable = document.getElementById('exitPlansTable');
    dom.exitEmptyState = document.getElementById('exitEmptyState');

    dom.resetAllData = document.getElementById('resetAllData');

    dom.tbillForm = document.getElementById('tbillForm');
    dom.tbillCapital = document.getElementById('tbillCapital');
    dom.tbillRungs = document.getElementById('tbillRungs');
    dom.tbillInterval = document.getElementById('tbillInterval');
    dom.tbillReinvest = document.getElementById('tbillReinvest');
    dom.tbillRatesContainer = document.getElementById('tbillRatesContainer');
    dom.tbillCalculate = document.getElementById('tbillCalculate');
    dom.tbillSummary = document.getElementById('tbillSummary');
    dom.tbillTableBody = document.getElementById('tbillTableBody');
    dom.tbillEmptyState = document.getElementById('tbillEmptyState');

    dom.currentYear = document.getElementById('currentYear');
  }

  function addAllocation(allocation) {
    state.allocations.push(allocation);
    persistAllocations();
    reconcileExitPlans();
    renderAllocations();
    updateSummaryAndScenarioMetrics();
    renderCharts();
    refreshExitAssetOptions();
  }

  function reconcileExitPlans() {
    const validIds = new Set(state.allocations.map((a) => a.id));
    const filtered = state.scenario.exitPlans.filter((plan) => validIds.has(plan.assetId));
    if (filtered.length !== state.scenario.exitPlans.length) {
      state.scenario.exitPlans = filtered;
      persistScenario();
      renderExitPlans();
    }
  }

  function removeAllocation(id) {
    state.allocations = state.allocations.filter((allocation) => allocation.id !== id);
    persistAllocations();
    if (state.editingRow === id) {
      state.editingRow = null;
    }
    reconcileExitPlans();
    renderAllocations();
    updateSummaryAndScenarioMetrics();
    renderCharts();
    refreshExitAssetOptions();
  }

  function startEditing(id) {
    state.editingRow = id;
    renderAllocations();
  }

  function cancelEditing() {
    state.editingRow = null;
    renderAllocations();
  }

  function saveEditedAllocation(id, updates) {
    state.allocations = state.allocations.map((allocation) =>
      allocation.id === id ? { ...allocation, ...updates } : allocation
    );
    state.editingRow = null;
    persistAllocations();
    reconcileExitPlans();
    renderAllocations();
    updateSummaryAndScenarioMetrics();
    renderCharts();
    refreshExitAssetOptions();
  }

  function renderAllocations() {
    dom.allocationsTableBody.innerHTML = '';
    const hasAllocations = state.allocations.length > 0;
    dom.allocationsEmptyState.classList.toggle('hidden', hasAllocations);

    state.allocations.forEach((allocation) => {
      const isEditing = state.editingRow === allocation.id;
      const row = document.createElement('tr');
      row.dataset.id = allocation.id;

      if (isEditing) {
        row.classList.add('editing');
        row.innerHTML = `
          <td><input type="text" value="${allocation.name || ''}" /></td>
          <td>
            <select>
              ${assetClasses
                .map((cls) => `
                  <option value="${cls}" ${cls === allocation.assetClass ? 'selected' : ''}>${cls}</option>
                `)
                .join('')}
            </select>
          </td>
          <td class="numeric"><input type="number" min="0" step="0.01" value="${allocation.amount}" /></td>
          <td class="numeric"><input type="number" step="0.1" value="${allocation.expectedReturn}" /></td>
          <td><textarea rows="2">${allocation.notes || ''}</textarea></td>
          <td>
            <div class="table-actions">
              <button class="primary" data-action="save">Save</button>
              <button class="ghost" data-action="cancel">Cancel</button>
            </div>
          </td>
        `;

        const [nameInput, classSelect, amountInput, returnInput, notesInput] = row.querySelectorAll(
          'input, select, textarea'
        );

        row.querySelector('[data-action="save"]').addEventListener('click', () => {
          const updated = {
            name: nameInput.value.trim() || allocation.name,
            assetClass: classSelect.value,
            amount: safeParseNumber(amountInput.value),
            expectedReturn: safeParseNumber(returnInput.value),
            notes: notesInput.value.trim()
          };
          saveEditedAllocation(allocation.id, updated);
        });

        row.querySelector('[data-action="cancel"]').addEventListener('click', cancelEditing);
      } else {
        const nameCell = document.createElement('td');
        nameCell.textContent = allocation.name || '—';
        const classCell = document.createElement('td');
        classCell.textContent = allocation.assetClass;
        const amountCell = document.createElement('td');
        amountCell.classList.add('numeric');
        amountCell.textContent = formatCurrency(allocation.amount);
        const returnCell = document.createElement('td');
        returnCell.classList.add('numeric');
        returnCell.textContent = `${allocation.expectedReturn.toFixed(2)}%`;
        const notesCell = document.createElement('td');
        notesCell.textContent = allocation.notes || '—';
        const actionsCell = document.createElement('td');
        const actionsWrap = document.createElement('div');
        actionsWrap.className = 'table-actions';

        const editButton = document.createElement('button');
        editButton.className = 'ghost';
        editButton.type = 'button';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => startEditing(allocation.id));

        const deleteButton = document.createElement('button');
        deleteButton.className = 'ghost';
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => removeAllocation(allocation.id));

        actionsWrap.append(editButton, deleteButton);
        actionsCell.append(actionsWrap);

        row.append(nameCell, classCell, amountCell, returnCell, notesCell, actionsCell);
      }

      dom.allocationsTableBody.append(row);
    });
  }

  function aggregateAllocations() {
    const summary = assetClasses.reduce((acc, cls) => {
      acc[cls] = { amount: 0, expectedReturn: 0, count: 0 };
      return acc;
    }, {});

    state.allocations.forEach((allocation) => {
      const record = summary[allocation.assetClass] || { amount: 0, expectedReturn: 0, count: 0 };
      record.amount += allocation.amount;
      record.expectedReturn += allocation.expectedReturn * allocation.amount;
      record.count += allocation.amount;
      summary[allocation.assetClass] = record;
    });

    return summary;
  }

  function computeSummaryMetrics() {
    const totals = aggregateAllocations();
    let totalCapital = 0;
    let reserve = 0;
    let weightedReturnNumerator = 0;
    let deployed = 0;

    assetClasses.forEach((cls) => {
      const record = totals[cls];
      const amount = record?.amount || 0;
      totalCapital += amount;
      if (cls === 'Reserve') {
        reserve += amount;
      } else {
        deployed += amount;
        weightedReturnNumerator += amount * (record.count > 0 ? record.expectedReturn / record.count : 0);
      }
    });

    const blendedReturn = deployed > 0 ? weightedReturnNumerator / deployed : 0;

    return {
      totalCapital,
      reserve,
      deployed,
      blendedReturn: blendedReturn || 0
    };
  }

  function updateSummaryAndScenarioMetrics() {
    const { totalCapital, reserve, deployed, blendedReturn } = computeSummaryMetrics();

    setText('summaryTotal', formatCurrency(totalCapital));
    setText('summaryDeployed', formatCurrency(deployed));
    setText('summaryReserve', formatCurrency(reserve));
    setText('summaryBlended', `${blendedReturn.toFixed(2)}%`);

    dom.scenarioBlended.textContent = `${blendedReturn.toFixed(2)}%`;
    const startingCapital = deployed;
    dom.scenarioStarting.textContent = formatCurrency(startingCapital);

    // Update exit asset options and scenario view as allocations change
    refreshExitAssetOptions();
    if (state.scenarioResult) {
      runScenarioSimulation();
    }
  }

  function colorsForAssets(assets) {
    return assets.map((asset) => assetColors[asset] || '#ffffff');
  }

  function renderCharts() {
    const totals = aggregateAllocations();
    const activeAssets = assetClasses.filter((cls) => (totals[cls]?.amount || 0) > 0);
    const hasData = activeAssets.length > 0;

    dom.chartEmptyState.classList.toggle('hidden', hasData);
    dom.stackedCanvas.classList.toggle('hidden', !hasData || state.charts.active !== 'stacked');
    dom.pieCanvas.classList.toggle('hidden', !hasData || state.charts.active !== 'pie');

    if (!hasData) {
      if (state.charts.stacked) {
        state.charts.stacked.destroy();
        state.charts.stacked = null;
      }
      if (state.charts.pie) {
        state.charts.pie.destroy();
        state.charts.pie = null;
      }
      return;
    }

    const amountsByAsset = activeAssets.map((asset) => totals[asset].amount);

    if (!state.charts.pie) {
      state.charts.pie = new Chart(dom.pieCanvas, {
        type: 'doughnut',
        data: {
          labels: activeAssets,
          datasets: [
            {
              data: amountsByAsset,
              backgroundColor: colorsForAssets(activeAssets),
              borderWidth: 1,
              borderColor: '#0c111d'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#f4f6fb'
              }
            }
          }
        }
      });
    } else {
      state.charts.pie.data.labels = activeAssets;
      state.charts.pie.data.datasets[0].data = amountsByAsset;
      state.charts.pie.data.datasets[0].backgroundColor = colorsForAssets(activeAssets);
      state.charts.pie.update();
    }

    const stackedDatasets = activeAssets.map((asset) => ({
      label: asset,
      data: [totals[asset].amount],
      backgroundColor: assetColors[asset] || '#ffffff',
      stack: 'allocation'
    }));

    if (!state.charts.stacked) {
      state.charts.stacked = new Chart(dom.stackedCanvas, {
        type: 'bar',
        data: {
          labels: ['Capital Allocation'],
          datasets: stackedDatasets
        },
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true,
              ticks: { color: '#f4f6fb' },
              grid: { color: 'rgba(255,255,255,0.08)' }
            },
            y: {
              stacked: true,
              ticks: {
                color: '#f4f6fb',
                callback: (value) => formatCurrency(value)
              },
              grid: { color: 'rgba(255,255,255,0.08)' }
            }
          },
          plugins: {
            legend: {
              labels: {
                color: '#f4f6fb'
              }
            }
          }
        }
      });
    } else {
      state.charts.stacked.data.datasets = stackedDatasets;
      state.charts.stacked.update();
    }
  }

  function handleAllocationSubmit(event) {
    event.preventDefault();

    const name = dom.allocationName.value.trim();
    const assetClass = dom.allocationClass.value;
    const amount = safeParseNumber(dom.allocationAmount.value);
    const expectedReturn = safeParseNumber(dom.allocationReturn.value);
    const notes = dom.allocationNotes.value.trim();

    if (!name || !assetClass || amount < 0) {
      return;
    }

    const allocation = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      name,
      assetClass,
      amount,
      expectedReturn,
      notes
    };

    addAllocation(allocation);
    dom.allocationForm.reset();
    dom.allocationName.focus();
  }

  function setChartToggleState(button) {
    dom.chartButtons.forEach((btn) => {
      btn.classList.toggle('primary', btn === button);
      btn.classList.toggle('ghost', btn !== button);
    });
  }

  function handleChartToggle(event) {
    const button = event.currentTarget;
    const chartType = button.dataset.chart;
    if (state.charts.active === chartType) return;
    state.charts.active = chartType;
    setChartToggleState(button);
    renderCharts();
  }

  function refreshExitAssetOptions() {
    if (!dom.exitAssetSelect) return;

    dom.exitAssetSelect.innerHTML = '';
    const eligible = state.allocations.filter((allocation) => allocation.assetClass !== 'Reserve');

    if (eligible.length === 0) {
      const option = document.createElement('option');
      option.textContent = 'No deployable assets';
      option.disabled = true;
      option.selected = true;
      dom.exitAssetSelect.append(option);
      dom.exitAssetSelect.disabled = true;
    } else {
      eligible.forEach((allocation) => {
        const option = document.createElement('option');
        option.value = allocation.id;
        option.textContent = `${allocation.name} (${allocation.assetClass})`;
        dom.exitAssetSelect.append(option);
      });
      dom.exitAssetSelect.disabled = false;
    }
  }

  function renderExitPlans() {
    dom.exitPlansTable.innerHTML = '';
    const hasPlans = state.scenario.exitPlans.length > 0;
    dom.exitEmptyState.classList.toggle('hidden', hasPlans);

    state.scenario.exitPlans
      .slice()
      .sort((a, b) => a.year - b.year)
      .forEach((plan) => {
        const row = document.createElement('tr');
        const assetCell = document.createElement('td');
        assetCell.textContent = plan.assetName;
        const yearCell = document.createElement('td');
        yearCell.classList.add('numeric');
        yearCell.textContent = plan.year;
        const multipleCell = document.createElement('td');
        multipleCell.classList.add('numeric');
        multipleCell.textContent = plan.multiple.toFixed(2);
        const payoutCell = document.createElement('td');
        payoutCell.classList.add('numeric');
        payoutCell.textContent = formatCurrency(plan.payout);
        const actionsCell = document.createElement('td');
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'ghost';
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => removeExitPlan(plan.id));
        actionsCell.append(removeButton);
        row.append(assetCell, yearCell, multipleCell, payoutCell, actionsCell);
        dom.exitPlansTable.append(row);
      });
  }

  function addExitPlan(event) {
    event.preventDefault();
    if (dom.exitAssetSelect.disabled) return;

    const assetId = dom.exitAssetSelect.value;
    const year = Math.max(1, Math.floor(safeParseNumber(dom.exitYear.value)));
    const multiple = Math.max(0, safeParseNumber(dom.exitMultiple.value));
    const allocation = state.allocations.find((item) => item.id === assetId);
    if (!allocation) return;

    const payout = allocation.amount * multiple;
    const plan = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      assetId,
      assetName: `${allocation.name} (${allocation.assetClass})`,
      year,
      multiple,
      payout
    };

    state.scenario.exitPlans.push(plan);
    persistScenario();
    renderExitPlans();
  }

  function removeExitPlan(id) {
    state.scenario.exitPlans = state.scenario.exitPlans.filter((plan) => plan.id !== id);
    persistScenario();
    renderExitPlans();
  }

  function updateScenarioConfig() {
    state.scenario = {
      ...state.scenario,
      target: Math.max(0, safeParseNumber(dom.scenarioTarget.value)),
      years: Math.max(1, Math.min(60, Math.floor(safeParseNumber(dom.scenarioYears.value)))),
      contribution: Math.max(0, safeParseNumber(dom.scenarioContribution.value)),
      useReserve: dom.scenarioUseReserve.checked,
      exitPlans: state.scenario.exitPlans
    };
    persistScenario();
  }

  function runScenarioSimulation() {
    updateScenarioConfig();
    const { blendedReturn, deployed, reserve } = computeSummaryMetrics();

    const target = state.scenario.target || 0;
    const years = state.scenario.years || 1;
    const contribution = state.scenario.contribution || 0;
    let reserveBalance = reserve;
    const useReserve = state.scenario.useReserve;
    let investedBalance = deployed;

    const growthRate = blendedReturn / 100;
    const exitPlansByYear = state.scenario.exitPlans.reduce((acc, plan) => {
      acc[plan.year] = acc[plan.year] || [];
      acc[plan.year].push(plan);
      return acc;
    }, {});

    const resultRows = [];
    let achievedYear = null;

    for (let year = 1; year <= years; year += 1) {
      const start = investedBalance;
      const growth = investedBalance * growthRate;
      investedBalance += growth;

      let contributionApplied = contribution;
      if (useReserve) {
        const available = Math.min(reserveBalance, contributionApplied);
        contributionApplied = available;
        reserveBalance -= available;
      }
      investedBalance += contributionApplied;

      const exits = exitPlansByYear[year] || [];
      const payout = exits.reduce((total, plan) => total + plan.payout, 0);
      investedBalance += payout;

      const ending = investedBalance;
      if (achievedYear == null && ending >= target) {
        achievedYear = year;
      }

      resultRows.push({
        year,
        start,
        growth,
        contribution: contributionApplied,
        payout,
        end: ending
      });
    }

    state.scenarioResult = {
      rows: resultRows,
      achievedYear,
      finalBalance: investedBalance,
      target,
      reserveRemaining: reserveBalance
    };

    renderScenarioResult();
  }

  function renderScenarioResult() {
    const result = state.scenarioResult;
    if (!result) return;

    const hasRows = result.rows.length > 0;
    dom.scenarioEmptyState.classList.toggle('hidden', hasRows);
    dom.scenarioTableBody.innerHTML = '';

    result.rows.forEach((row) => {
      const tr = document.createElement('tr');
      const yearCell = document.createElement('td');
      yearCell.textContent = row.year;
      const startCell = document.createElement('td');
      startCell.classList.add('numeric');
      startCell.textContent = formatCurrency(row.start);
      const growthCell = document.createElement('td');
      growthCell.classList.add('numeric');
      growthCell.textContent = formatCurrency(row.growth);
      const contributionCell = document.createElement('td');
      contributionCell.classList.add('numeric');
      contributionCell.textContent = formatCurrency(row.contribution);
      const payoutCell = document.createElement('td');
      payoutCell.classList.add('numeric');
      payoutCell.textContent = formatCurrency(row.payout);
      const endCell = document.createElement('td');
      endCell.classList.add('numeric');
      endCell.textContent = formatCurrency(row.end);
      tr.append(yearCell, startCell, growthCell, contributionCell, payoutCell, endCell);
      dom.scenarioTableBody.append(tr);
    });

    if (result.achievedYear) {
      dom.scenarioSummary.textContent = `Target reached in year ${result.achievedYear}. Final balance: ${formatCurrency(
        result.finalBalance
      )}. Reserve remaining: ${formatCurrency(result.reserveRemaining)}.`;
    } else {
      const shortfall = Math.max(0, result.target - result.finalBalance);
      dom.scenarioSummary.textContent = `Target not reached. Final balance ${formatCurrency(
        result.finalBalance
      )}, shortfall ${formatCurrency(shortfall)}. Reserve remaining: ${formatCurrency(
        result.reserveRemaining
      )}.`;
    }
  }

  function renderTbillRateInputs() {
    dom.tbillRatesContainer.innerHTML = '';
    const rates = Array.from({ length: state.tbills.rungs }, (_, index) => {
      const existing = state.tbills.rates[index];
      return Number.isFinite(existing) ? existing : 5;
    });
    state.tbills.rates = rates;

    state.tbills.rates.forEach((rate, index) => {
      const card = document.createElement('div');
      card.className = 'tbill-rate-card';
      const title = document.createElement('h4');
      title.textContent = `Rung ${index + 1}`;
      const rateControl = document.createElement('div');
      rateControl.className = 'form-control';
      const label = document.createElement('label');
      label.textContent = 'Rate (%)';
      const input = document.createElement('input');
      input.type = 'number';
      input.step = '0.01';
      input.value = rate;
      input.min = '0';
      input.addEventListener('input', () => {
        state.tbills.rates[index] = safeParseNumber(input.value);
        persistTbillConfig();
      });
      rateControl.append(label, input);
      card.append(title, rateControl);
      dom.tbillRatesContainer.append(card);
    });
  }

  function prepareTbillInputs() {
    dom.tbillCapital.value = state.tbills.capital;
    dom.tbillRungs.value = state.tbills.rungs;
    dom.tbillInterval.value = state.tbills.intervalWeeks;
    dom.tbillReinvest.checked = state.tbills.reinvest;
    renderTbillRateInputs();
  }

  function calculateTbillSchedule() {
    state.tbills.capital = Math.max(0, safeParseNumber(dom.tbillCapital.value));
    state.tbills.rungs = Math.max(1, Math.min(24, Math.floor(safeParseNumber(dom.tbillRungs.value))));
    state.tbills.intervalWeeks = Math.max(1, Math.floor(safeParseNumber(dom.tbillInterval.value)));
    state.tbills.reinvest = dom.tbillReinvest.checked;

    if (state.tbills.rates.length !== state.tbills.rungs) {
      state.tbills.rates = Array.from({ length: state.tbills.rungs }, (_, index) => state.tbills.rates[index] || 5);
      renderTbillRateInputs();
    }

    const principalPerRung = state.tbills.capital / state.tbills.rungs;
    const today = new Date();
    const schedule = [];
    let totalInterest = 0;

    state.tbills.rates.forEach((rate, index) => {
      const termWeeks = state.tbills.intervalWeeks * (index + 1);
      const interest = principalPerRung * (rate / 100) * (termWeeks / 52);
      const maturity = new Date(today.getTime() + termWeeks * 7 * 24 * 60 * 60 * 1000);
      totalInterest += interest;

      schedule.push({
        rung: index + 1,
        principal: principalPerRung,
        rate,
        termWeeks,
        interest,
        maturityValue: principalPerRung + interest,
        maturityDate: maturity
      });
    });

    const ladderDurationWeeks = state.tbills.intervalWeeks * state.tbills.rungs;
    const simpleYield = state.tbills.capital > 0 ? totalInterest / state.tbills.capital : 0;
    const annualisedYield = ladderDurationWeeks > 0
      ? (state.tbills.reinvest
          ? Math.pow(1 + simpleYield, 52 / ladderDurationWeeks) - 1
          : simpleYield * (52 / ladderDurationWeeks))
      : 0;

    persistTbillConfig();
    renderTbillResults(schedule, annualisedYield, totalInterest);
  }

  function renderTbillResults(schedule, annualisedYield, totalInterest) {
    const hasRows = schedule.length > 0;
    dom.tbillEmptyState.classList.toggle('hidden', hasRows);
    dom.tbillTableBody.innerHTML = '';

    schedule.forEach((item) => {
      const row = document.createElement('tr');
      const rungCell = document.createElement('td');
      rungCell.textContent = item.rung;
      const principalCell = document.createElement('td');
      principalCell.classList.add('numeric');
      principalCell.textContent = formatCurrency(item.principal);
      const rateCell = document.createElement('td');
      rateCell.classList.add('numeric');
      rateCell.textContent = item.rate.toFixed(2);
      const termCell = document.createElement('td');
      termCell.classList.add('numeric');
      termCell.textContent = item.termWeeks;
      const maturityCell = document.createElement('td');
      maturityCell.textContent = item.maturityDate.toLocaleDateString();
      const interestCell = document.createElement('td');
      interestCell.classList.add('numeric');
      interestCell.textContent = formatCurrency(item.interest);
      const valueCell = document.createElement('td');
      valueCell.classList.add('numeric');
      valueCell.textContent = formatCurrency(item.maturityValue);
      row.append(rungCell, principalCell, rateCell, termCell, maturityCell, interestCell, valueCell);
      dom.tbillTableBody.append(row);
    });

    dom.tbillSummary.textContent = `Projected total interest ${formatCurrency(totalInterest)} · Annualised yield ${percentFormatter.format(
      annualisedYield
    )}`;
  }

  function resetAllData() {
    if (!window.confirm('This will clear all saved data. Continue?')) return;
    localStorage.removeItem(storageKeys.allocations);
    localStorage.removeItem(storageKeys.scenario);
    localStorage.removeItem(storageKeys.tbills);
    state.allocations = [];
    state.scenario = {
      target: 10000000,
      years: 30,
      contribution: 0,
      useReserve: false,
      exitPlans: []
    };
    state.tbills = {
      capital: 25000,
      rungs: 4,
      intervalWeeks: 13,
      reinvest: true,
      rates: [5.0, 5.1, 5.2, 5.3]
    };
    state.scenarioResult = null;
    state.editingRow = null;

    dom.scenarioSummary.textContent = '';
    dom.scenarioTableBody.innerHTML = '';
    dom.scenarioEmptyState.classList.remove('hidden');
    state.charts.stacked?.destroy();
    state.charts.pie?.destroy();
    state.charts.stacked = null;
    state.charts.pie = null;

    dom.allocationForm.reset();
    dom.exitPlanForm.reset();
    renderAllocations();
    updateSummaryAndScenarioMetrics();
    renderCharts();
    renderExitPlans();
    prepareTbillInputs();
    dom.tbillSummary.textContent = '';
    dom.tbillTableBody.innerHTML = '';
    dom.tbillEmptyState.classList.remove('hidden');
  }

  function bindEvents() {
    dom.allocationForm.addEventListener('submit', handleAllocationSubmit);
    dom.clearAllocationForm.addEventListener('click', () => dom.allocationForm.reset());

    dom.chartButtons.forEach((button, index) => {
      if ((state.charts.active === 'stacked' && button.dataset.chart === 'stacked') ||
          (state.charts.active === 'pie' && button.dataset.chart === 'pie')) {
        button.classList.remove('ghost');
        button.classList.add('primary');
      } else if (index === 0 && !state.charts.active) {
        state.charts.active = button.dataset.chart;
        button.classList.add('primary');
      }
      button.addEventListener('click', handleChartToggle);
    });

    dom.scenarioTarget.addEventListener('input', () => {
      updateScenarioConfig();
      if (state.scenarioResult) runScenarioSimulation();
    });
    dom.scenarioYears.addEventListener('input', () => {
      updateScenarioConfig();
      if (state.scenarioResult) runScenarioSimulation();
    });
    dom.scenarioContribution.addEventListener('input', () => {
      updateScenarioConfig();
      if (state.scenarioResult) runScenarioSimulation();
    });
    dom.scenarioUseReserve.addEventListener('change', () => {
      updateScenarioConfig();
      if (state.scenarioResult) runScenarioSimulation();
    });

    dom.exitPlanForm.addEventListener('submit', addExitPlan);
    dom.runScenario.addEventListener('click', runScenarioSimulation);

    dom.tbillRungs.addEventListener('input', () => {
      state.tbills.rungs = Math.max(1, Math.min(24, Math.floor(safeParseNumber(dom.tbillRungs.value))));
      if (state.tbills.rates.length !== state.tbills.rungs) {
        state.tbills.rates = Array.from({ length: state.tbills.rungs }, (_, index) => state.tbills.rates[index] || 5);
      }
      renderTbillRateInputs();
      persistTbillConfig();
    });

    dom.tbillCapital.addEventListener('input', () => {
      state.tbills.capital = safeParseNumber(dom.tbillCapital.value);
      persistTbillConfig();
    });
    dom.tbillInterval.addEventListener('input', () => {
      state.tbills.intervalWeeks = Math.max(1, Math.floor(safeParseNumber(dom.tbillInterval.value)));
      persistTbillConfig();
    });
    dom.tbillReinvest.addEventListener('change', () => {
      state.tbills.reinvest = dom.tbillReinvest.checked;
      persistTbillConfig();
    });
    dom.tbillCalculate.addEventListener('click', calculateTbillSchedule);

    dom.resetAllData.addEventListener('click', resetAllData);
  }

  function hydrateFromStorage() {
    state.allocations = loadAllocations();
    const savedScenario = loadScenario();
    state.scenario = {
      ...state.scenario,
      ...savedScenario,
      exitPlans: Array.isArray(savedScenario.exitPlans) ? savedScenario.exitPlans : []
    };
    state.tbills = loadTbillConfig();
    if (!state.tbills.rates || state.tbills.rates.length === 0) {
      state.tbills.rates = Array.from({ length: state.tbills.rungs }, () => 5);
    }
  }

  function populateScenarioForm() {
    dom.scenarioTarget.value = state.scenario.target;
    dom.scenarioYears.value = state.scenario.years;
    dom.scenarioContribution.value = state.scenario.contribution;
    dom.scenarioUseReserve.checked = state.scenario.useReserve;
  }

  function init() {
    initialiseDomReferences();
    hydrateFromStorage();
    populateScenarioForm();
    prepareTbillInputs();
    renderAllocations();
    updateSummaryAndScenarioMetrics();
    renderCharts();
    refreshExitAssetOptions();
    renderExitPlans();
    bindEvents();

    if (state.scenario.exitPlans.length > 0) {
      runScenarioSimulation();
    }

    dom.tbillSummary.textContent = '';
    dom.scenarioSummary.textContent = '';
    dom.currentYear.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
