export function renderGroupErrors(groupData, groupName, period, options = {}) {
    const { formatNumber } = options;
    let html = ``;

    const formatNum = (num) => formatNumber ? formatNumber(num) : Math.round(num * 100) / 100;

    if (groupData.byModule && Object.keys(groupData.byModule).length > 0) {
        html += `<div class="modules-section pdf-section">`;

        Object.entries(groupData.byModule).forEach(([moduleName, moduleData]) => {
            const moduleAnchorId = `module_${moduleName.replace(/\s+/g, '_').toLowerCase()}`;

            const difTasks = moduleData.currCount - moduleData.prevCount;
            const difHours = moduleData.currHours - moduleData.prevHours;

            html += `
                <div class="module-section">
                    <h2 id="${moduleAnchorId}">${escapeHtml(moduleName)}</h2>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Показатель</th>
                                <th>${period.prev}</th>
                                <th>${period.current}</th>
                                <th>Изменение</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Количество задач</td>
                                <td>${moduleData.prevCount || 0}</td>
                                <td>${moduleData.currCount || 0}</td>
                                <td>${difTasks > 0 ? `+${difTasks}` : difTasks}</td>
                            </tr>
                            <tr>
                                <td>Трудозатраты, ч</td>
                                <td>${formatNum(moduleData.prevHours || 0)}</td>
                                <td>${formatNum(moduleData.currHours || 0)}</td>
                                <td>${difHours > 0 ? `+${formatNum(difHours)}` : formatNum(difHours)}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    ${moduleData.tasks && moduleData.tasks.length > 0 ? `
                    <h3>Ошибки за ${period.current}:</h3>
                    <table class="tasks-table">
                        <thead>
                            <tr>
                                <th>Номер задачи</th>
                                <th>Категория</th>
                                <th>Трудозатраты, ч</th>
                                <th>Тема</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${moduleData.tasks.map(task => `
                                <tr>
                                    <td>${escapeHtml(task.taskNum || '')}</td>
                                    <td>${escapeHtml(task.category || '')}</td>
                                    <td>${task.hours ? formatNum(task.hours) : '0'}</td>
                                    <td style="text-align: left;">${escapeHtml(task.title || '')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ` : '<p>Нет задач в текущем квартале</p>'}
                </div>
            `;
        });

        html += `</div>`;
    } else {
        html += `<div class="pdf-section"><p>Нет данных по модулям</p></div>`;
    }

    updateTocForGroup(groupName, groupData);

    const container = document.getElementById('errors');
    if (container) {
        container.innerHTML = html;
    } else {
        console.error('Элемент errors не найден в DOM');
    }
}

function updateTocForGroup(groupName, groupData) {
    const modulesContainerId = `modules`;
    
    const modulesContainer = document.getElementById(modulesContainerId);
    
    if (!modulesContainer) {
        console.log(`Контейнер модулей с ID "${modulesContainerId}" не найден`);
        return;
    }

    modulesContainer.innerHTML = '';

    if (groupData.byModule) {
        Object.keys(groupData.byModule).forEach(moduleName => {
            const moduleAnchorId = `module_${moduleName.replace(/\s+/g, '_').toLowerCase()}`;
            
            const moduleItem = document.createElement('li');
            const moduleLink = document.createElement('a');
            
            moduleLink.href = `#${moduleAnchorId}`;
            moduleLink.textContent = moduleName;
            moduleLink.className = 'pdf-link';

            moduleItem.appendChild(moduleLink);
            modulesContainer.appendChild(moduleItem);
        });

        console.log(`Добавлено ${Object.keys(groupData.byModule).length} модулей для группы "${groupName}"`);
    } else {
        console.log('Нет данных по модулям для отображения в оглавлении');
    }
}

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}