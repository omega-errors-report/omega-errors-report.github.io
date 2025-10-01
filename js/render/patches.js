export function renderPatches(patches, period) {
  document.getElementById('header').innerHTML = `ПАТЧИ/РЕЛИЗЫ (${period.current})`;

  if (!patches || patches.length === 0) {
    const container = document.getElementById('patches');
    if (container) {
      container.innerHTML = '<p>Нет данных о патчах и релизах</p>';
    }
    return;
  }

  const html = `
            <table>
                <thead>
                    <tr>
                        <th>Проект</th>
                        <th>Патчи</th>
                        <th>Релизы</th>
                    </tr>
                </thead>
                <tbody>
                    ${patches.map(patch => `
                        <tr>
                            <td>${escapeHtml(patch.project || '')}</td>
                            <td>${patch.patches !== undefined ? patch.patches : ''}</td>
                            <td>${patch.releases !== undefined ? patch.releases : ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
    `;

  const container = document.getElementById('patches');
  if (container) {
    container.innerHTML = html;
  } else {
    console.error('Элемент patches не найден в DOM');
  }
}

function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}