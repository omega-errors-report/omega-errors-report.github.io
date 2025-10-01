export function renderSUUPAutotests(autotests, period) {
  document.getElementById('header').innerHTML = `АВТОТЕСТЫ ГРУППЫ СУ+УП (${period.current})`

  let html = ``;

  const colors = {
    common: '#E9EBF5',
    notAll: '#FFE699',
    ready: '#A9D18E',
    new: '#9DC3E6',
    notReady: '#FFCCCC'
  };

  const coverageWeights = {
    notAll: 75,
    notReady: 0,
    new: 25,
    ready: 100,
  };

  const tocList = document.getElementById('tocList');
  let suupGroupTocItem = null;

  if (tocList) {
    const inactiveSpans = tocList.querySelectorAll('span.inactive');
    for (let span of inactiveSpans) {
      if (span.textContent.includes('ГРУППА СУ+УП')) {
        suupGroupTocItem = span.closest('li');
        break;
      }
    }
  }

  const modulesList = document.createElement('ul');
  modulesList.className = 'suup-modules-list';

  if (!autotests.suupGroup || autotests.suupGroup.length === 0) {
    html += `<p>Нет данных по автотестам группы СУ+УП</p>`;
  } else {
    autotests.suupGroup.forEach((module, moduleIndex) => {
      const moduleId = `module_${moduleIndex + 1}`;

      let totalModuleCoverage = 0;
      let totalActionsCount = 0;

      module.units.forEach(unit => {
        unit.actions.forEach(action => {
          const weight = coverageWeights[action.color] || 0;
          totalModuleCoverage += weight;
          totalActionsCount++;
        });
      });

      const moduleCoveragePercent = totalActionsCount > 0 ? Math.round(totalModuleCoverage / totalActionsCount) : 0;

      let moduleHtml = `
                <div class="module-section">
                    <h2 id="${moduleId}">${escapeHtml(module.module)} <span class="coverage-percent">(Покрытие: ${moduleCoveragePercent}%)</span></h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Что нужно проверять</th>
                                <th>Наброски на сценарий</th>
                                <th>Автотест</th>
                                <th>Примечания</th>
                            </tr>
                        </thead>
                        <tbody>`;

      module.units.forEach(unit => {
        unit.actions.forEach((action, actionIndex) => {
          moduleHtml += `
                        <tr>
                            ${actionIndex === 0 ?
              `<td rowspan="${unit.actions.length}" style="background-color: ${colors[unit.color] || colors.common};">${escapeHtml(unit.unit)}</td>`
              : ''}
                            <td style="background-color: ${colors[action.color] || colors.common};">${escapeHtml(action.script || '')}</td>
                            <td style="background-color: ${colors[action.color] || colors.common};">${escapeHtml(action.autotest || '')}</td>
                            <td style="background-color: ${colors[action.color] || colors.common};">${escapeHtml(action.note || '')}</td>
                        </tr>`;
        });
      });

      moduleHtml += `</tbody></table></div>`;
      html += moduleHtml;

      const moduleItem = document.createElement('li');
      const moduleLink = document.createElement('a');
      moduleLink.href = `#${moduleId}`;
      moduleLink.textContent = module.module;
      moduleLink.className = 'pdf-link';
      moduleItem.appendChild(moduleLink);
      modulesList.appendChild(moduleItem);
    });
  }

  if (suupGroupTocItem && modulesList.children.length > 0) {
    let existingList = suupGroupTocItem.querySelector('ul');
    if (!existingList) {
      existingList = document.createElement('ul');
      suupGroupTocItem.appendChild(existingList);
    }
    existingList.appendChild(modulesList);
  }

  const container = document.getElementById('suup-autotests');
  if (container) {
    container.innerHTML = html;
  } else {
    console.error('Элемент suup-autotests не найден в DOM');
  }
}

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}