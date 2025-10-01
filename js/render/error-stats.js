export function renderErrorStats(errorStats, period, options = {}) {
    const { formatNumber } = options;

    document.getElementById('header').innerHTML = `ОШИБКИ (${period.prev} - ${period.current})`

    const categories = [
        'code64', 'modification', 'new', 'not available', 'old', 'patch',
        'postanovka', 'postgre', 'refactoring', 'regressive', 'support', 'zakazchik'
    ];

    let html = ``;

    const renderSection = (type, title) => {
        const sectionId = `errors_stats_${type}`;
        const data = errorStats[type];

        if (!data || !data.current || !data.prev) {
            return `
                <div class="error-section pdf-section">
                    <h2 id="${sectionId}">${title}</h2>
                    <p>Нет данных для отображения</p>
                </div>
            `;
        }

        const difTasks = data.current.totalTasks - data.prev.totalTasks;
        const difHours = data.current.totalHours - data.prev.totalHours;

        const formatHours = (hours) => formatNumber ? formatNumber(hours) : Math.round(hours * 100) / 100;
        const prevTotalHoursFormatted = formatHours(data.prev.totalHours);
        const currentTotalHoursFormatted = formatHours(data.current.totalHours);
        const difHoursFormatted = formatHours(difHours);

        return `
            <div class="error-section pdf-section">
                <h2 id="${sectionId}">${title}</h2>
                
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
                            <td>${data.prev.totalTasks || 0}</td>
                            <td>${data.current.totalTasks || 0}</td>
                            <td>${difTasks > 0 ? `+${difTasks}` : difTasks}</td>
                        </tr>
                        <tr>
                            <td>Трудозатраты, ч</td>
                            <td>${prevTotalHoursFormatted}</td>
                            <td>${currentTotalHoursFormatted}</td>
                            <td>${difHours > 0 ? `+${difHoursFormatted}` : difHoursFormatted}</td>
                        </tr>
                    </tbody>
                </table>
                
                <table>
                    <thead>
                        <tr>
                            <th>Категория ошибки</th>
                            <th>Кол-во, шт (${period.prev})</th>
                            <th>Кол-во, шт (${period.current})</th>
                            <th>Трудозатраты, ч (${period.prev})</th>
                            <th>Трудозатраты, ч (${period.current})</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories.map(cat => {
            const prevData = data.prev.byCategory[cat] || { count: 0, hours: 0 };
            const currentData = data.current.byCategory[cat] || { count: 0, hours: 0 };

            const rowStyle = type === 'zakazchik' && currentData.increased
                ? 'background-color: #FFCCCC;'
                : '';

            return `
                                <tr style="${rowStyle}">
                                    <td>${escapeHtml(cat)}</td>
                                    <td>${prevData.count || 0}</td>
                                    <td>${currentData.count || 0}</td>
                                    <td>${formatHours(prevData.hours || 0)}</td>
                                    <td>${formatHours(currentData.hours || 0)}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    html += renderSection('zakazchik', 'Ошибки по категориям (заказчики)');
    html += renderSection('int', 'Ошибки по категориям (внутренние)');

    const container = document.getElementById('errors');
    if (container) {
        container.innerHTML = html;
    } else {
        console.error('Элемент errors не найден в DOM');
    }
}

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}