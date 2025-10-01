export function renderAutotests(autotests, period) {
  document.getElementById('header').innerHTML = `АВТОЕТСТЫ (${period.current})`;

  let html = ``;

  const groups = [
    { id: 'kdGroup', name: 'Группа КД' },
    { id: 'tppGroup', name: 'Группа ТПП' },
    { id: 'planGroup', name: 'Группа Планирование' }
  ];

  groups.forEach(group => {
    html += renderAutotestGroup(autotests[group.id], group.id, group.name, formatNumber);
  });

  const container = document.getElementById('autotests');
  if (container) {
    container.innerHTML = html;
  }
}

function renderAutotestGroup(groupData, groupId, groupName) {
  if (!groupData || groupData.length === 0) {
    return `
            <div class="module-section">
                <h2 id="${groupId}">${groupName}</h2>
                <p>Нет данных для отображения</p>
            </div>
        `;
  }

  const uniqueModules = [...new Set(groupData.map(item => item.module))];
  let modulesHTML = '';

  uniqueModules.forEach((moduleName, index) => {
    const anchorId = `${groupId}_${index + 1}`;
    const tasksForModule = groupData.filter(item => item.module === moduleName);

    modulesHTML += `
            <div class="module-section">
                <h3 id="${anchorId}">${moduleName}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Задача и описание</th>
                            <th>Статус</th>
                            <th>Примечание</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tasksForModule.map(task => `
                            <tr>
                                <td>${escapeHtml(task.task || '')}</td>
                                <td>${escapeHtml(task.status || '')}</td>
                                <td>${escapeHtml(task.note || '')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
  });

  return `
        <div class="pdf-section">
            <h2 id="${groupId}">${groupName}</h2>
            ${modulesHTML}
        </div>
    `;
}

function hasHoursData(tasks) {
  return tasks.some(task => task.hours != null);
}

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}