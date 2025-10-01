export function renderSummary(summary, suffix, period, options = {}) {
  const { formatNumber } = options;

  let section = 'summary';
  if (suffix !== '') {
    section += `-${suffix}`;
  }

  if (!summary || !summary.current || !summary.prev) {
    const container = document.getElementById(section);
    if (container) {
      container.innerHTML = '<p>Нет данных для отображения</p>';
    }
    return;
  }

  const difTasks = summary.current.totalTasks - summary.prev.totalTasks;
  const difHours = summary.current.totalHours - summary.prev.totalHours;

  const formatHours = (hours) => formatNumber ? formatNumber(hours) : Math.round(hours * 100) / 100;

  const prevHoursFormatted = formatHours(summary.prev.totalHours);
  const currentHoursFormatted = formatHours(summary.current.totalHours);
  const difHoursFormatted = formatHours(difHours);

  const html = `
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
                        <td>${summary.prev.totalTasks || 0}</td>
                        <td>${summary.current.totalTasks || 0}</td>
                        <td>${difTasks > 0 ? `+${difTasks}` : difTasks}</td>
                    </tr>
                    <tr>
                        <td>Трудозатраты, ч</td>
                        <td>${prevHoursFormatted}</td>
                        <td>${currentHoursFormatted}</td>
                        <td>${difHoursFormatted > 0 ? `+${difHoursFormatted}` : difHoursFormatted}</td>
                    </tr>
                </tbody>
            </table>
    `;

  const container = document.getElementById(section);
  if (container) {
    container.innerHTML = html;
  } else {
    console.error(`Элемент ${section} не найден в DOM`);
  }
}