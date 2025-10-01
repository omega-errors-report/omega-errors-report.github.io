export async function getAvailableReports() {
    try {
        const response = await fetch('data/index.json');
        const data = await response.json();
        return data.reports;
    } catch (error) {
        console.error('Ошибка при получении списка отчётов:', error);
        return [];
    }
}

export async function loadData(reportName) {
    if (!reportName) {
        throw new Error('Не выбран отчёт');
    }

    const requests = [
        fetch(`data/${reportName}/report.json`).then(res => res.json()),
        fetch(`data/${reportName}/patches.json`).then(res => res.json()),
        fetch(`data/${reportName}/autotests.json`).then(res => res.json())
    ];

    return Promise.all(requests);
}

export function saveSelectedReport(reportName) {
    localStorage.setItem('selectedReport', reportName);
}

export function getSelectedReport() {
    return localStorage.getItem('selectedReport');
}