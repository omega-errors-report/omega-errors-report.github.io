export function renderErrorCategories(report, period, options = {}) {
    document.getElementById('header').innerHTML = `ОШИБКИ ПО КАТЕГОРИЯМ (ЗАКАЗЧИКИ) - ВЫБОРОЧНО<br>(${period.prev} - ${period.current})`;

    const { formatNumber } = options;
    const categories = [
        'code64', 'modification', 'new', 'not available', 'old', 'patch',
        'postanovka', 'postgre', 'refactoring', 'regressive', 'support', 'zakazchik'
    ];

    let html = ``;

    const tocList = document.getElementById('tocList');
    let errorCategoriesTocItem = null;

    if (tocList) {
        const inactiveSpans = tocList.querySelectorAll('span.inactive');
        for (let span of inactiveSpans) {
            if (span.textContent.includes('ОШИБКИ ПО КАТЕГОРИЯМ (ЗАКАЗЧИКИ) - ВЫБОРОЧНО')) {
                errorCategoriesTocItem = span.closest('li');
                break;
            }
        }
    }

    const categoriesList = document.createElement('ul');
    categoriesList.className = 'error-categories-list';

    categories.forEach((category, index) => {
        const anchorId = `errorCategory_${index + 1}`;
        const currentData = report.zakazchik.current.byCategory[category];
        const prevData = report.zakazchik.prev.byCategory[category];

        if (currentData.tasks) {
            const difTasks = currentData.count - prevData.count;
            const difHours = currentData.hours - prevData.hours;

            const prevHoursFormatted = formatNumber ? formatNumber(prevData.hours) : prevData.hours.toFixed(2);
            const currentHoursFormatted = formatNumber ? formatNumber(currentData.hours) : currentData.hours.toFixed(2);
            const difHoursFormatted = formatNumber ? formatNumber(difHours) : difHours.toFixed(2);

            html += `
                <div class="category-section pdf-section">
                    <h2 id="${anchorId}">${category}</h2>
                    
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
                                <td>Количество задач, шт</td>
                                <td>${prevData.count}</td>
                                <td>${currentData.count}</td>
                                <td>${difTasks > 0 ? `+${difTasks}` : difTasks}</td>
                            </tr>
                            <tr>
                                <td>Трудозатраты, ч</td>
                                <td>${prevHoursFormatted}</td>
                                <td>${currentHoursFormatted}</td>
                                <td>${difHours > 0 ? `+${difHoursFormatted}` : difHoursFormatted}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    ${currentData.tasks && currentData.tasks.length > 0 ? `
                    <h3>Ошибки за ${period.current}:</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Номер задачи</th>
                                <th>Модуль</th>
                                <th>Трудозатраты, ч</th>
                                <th>Тема</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${currentData.tasks.map(task => `
                                <tr>
                                    <td>${task.taskNum || ''}</td>
                                    <td>${task.module || ''}</td>
                                    <td>${task.hours ? (formatNumber ? formatNumber(task.hours) : task.hours.toFixed(2)) : '0'}</td>
                                    <td style="text-align: left;">${escapeHtml(task.title || '')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ` : '<p>Нет данных о задачах</p>'}
                </div>
            `;

            const categoryItem = document.createElement('li');
            const categoryLink = document.createElement('a');
            categoryLink.href = `#${anchorId}`;
            categoryLink.textContent = `${category}`;
            categoryLink.className = 'pdf-link';
            categoryItem.appendChild(categoryLink);
            categoriesList.appendChild(categoryItem);
        }
    });

    if (errorCategoriesTocItem && categoriesList.children.length > 0) {
        const parentUl = errorCategoriesTocItem.parentNode;

        if (parentUl && parentUl.tagName === 'UL') {
            const categoriesContainer = document.createElement('li');
            categoriesContainer.appendChild(categoriesList);

            parentUl.insertBefore(categoriesContainer, errorCategoriesTocItem.nextSibling);
        }
    }

    const container = document.getElementById('errorCategories');
    if (container) {
        container.innerHTML = html;
    } else {
        console.error('Элемент errorCategories не найден в DOM');
    }
}

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}