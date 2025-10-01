import { loadData, getAvailableReports, saveSelectedReport, getSelectedReport } from './services/data-loader.js';
import { renderSummary } from './render/summary.js';
import { renderPatches } from './render/patches.js';
import { renderAutotests } from './render/autotests.js';
import { renderSUUPAutotests } from './render/suup-autotests.js';
import { renderErrorStats } from './render/error-stats.js';
import { renderErrorCategories } from './render/error-categories.js';
import { renderGroupErrors } from './render/group-errors.js';

function formatNumber(num) {
    return Math.round(num * 100) / 100;
}

class ReportApp {
    constructor() {
        this.currentPage = this.detectPage();
        this.formatNumber = formatNumber;
        this.reportData = null;
        this.patchesData = null;
        this.autotestsData = null;
        this.reportName = '';
        this.period = null;
        this.selectedReport = null;
        this.availableReports = [];
    }

    detectPage() {
        const path = window.location.pathname.split('/').pop();
        const pageMap = {
            'index.html': 'index',
            '': 'index',
            'patches.html': 'patches',
            'autotests.html': 'autotests',
            'suup-autotests.html': 'suup-autotests',
            'errors.html': 'errors',
            'error-categories.html': 'error-categories',
            'zakazchik-errors.html': 'zakazchik-errors',
            'zakazchik-errors-kd.html': 'zakazchik-errors-kd',
            'zakazchik-errors-tpp.html': 'zakazchik-errors-tpp',
            'zakazchik-errors-plan.html': 'zakazchik-errors-plan',
            'zakazchik-errors-suup.html': 'zakazchik-errors-suup',
            'zakazchik-errors-admin.html': 'zakazchik-errors-admin',
            'int-errors.html': 'int-errors',
            'int-errors-kd.html': 'int-errors-kd',
            'int-errors-tpp.html': 'int-errors-tpp',
            'int-errors-plan.html': 'int-errors-plan',
            'int-errors-suup.html': 'int-errors-suup',
            'int-errors-admin.html': 'int-errors-admin'
        };

        return pageMap[path] || 'index';
    }

    getGroupConfig(pageType) {
        const pageToTypeMap = {
            'zakazchik-errors-kd': { type: 'zakazchik', group: 'kd', pageName: `ОШИБКИ ЗАКАЗЧИКОВ. ГРУППА КД<br>(${this.period.prev} - ${this.period.current})` },
            'zakazchik-errors-tpp': { type: 'zakazchik', group: 'tpp', pageName: `ОШИБКИ ЗАКАЗЧИКОВ. ГРУППА ТПП<br>(${this.period.prev} - ${this.period.current})` },
            'zakazchik-errors-plan': { type: 'zakazchik', group: 'plan', pageName: `ОШИБКИ ЗАКАЗЧИКОВ. ГРУППА ПЛАНИРОВАНИЕ<br>(${this.period.prev} - ${this.period.current})` },
            'zakazchik-errors-suup': { type: 'zakazchik', group: 'suup', pageName: `ОШИБКИ ЗАКАЗЧИКОВ. ГРУППА СУ+УП<br>(${this.period.prev} - ${this.period.current})` },
            'zakazchik-errors-admin': { type: 'zakazchik', group: 'admin', pageName: `ОШИБКИ ЗАКАЗЧИКОВ. ГРУППА АДМИНИСТРИРОВАНИЕ<br>(${this.period.prev} - ${this.period.current})` },
            'int-errors-kd': { type: 'int', group: 'kd', pageName: `ОШИБКИ ВНУТРЕННИЕ. ГРУППА КД<br>(${this.period.prev} - ${this.period.current})` },
            'int-errors-tpp': { type: 'int', group: 'tpp', pageName: `ОШИБКИ ВНУТРЕННИЕ. ГРУППА ТПП<br>(${this.period.prev} - ${this.period.current})` },
            'int-errors-plan': { type: 'int', group: 'plan', pageName: `ОШИБКИ ВНУТРЕННИЕ. ГРУППА ПЛАНИРОВАНИЕ<br>(${this.period.prev} - ${this.period.current})` },
            'int-errors-suup': { type: 'int', group: 'suup', pageName: `ОШИБКИ ВНУТРЕННИЕ. ГРУППА СУ+УП<br>(${this.period.prev} - ${this.period.current})` },
            'int-errors-admin': { type: 'int', group: 'admin', pageName: `ОШИБКИ ВНУТРЕННИЕ. ГРУППА АДМИНИСТРИРОВАНИЕ<br>(${this.period.prev} - ${this.period.current})` }
        };

        return pageToTypeMap[pageType];
    }

    getDataByPath(obj, path) {
        return path.split('.').reduce((acc, key) => acc?.[key], obj);
    }

    showNotification(message, type = 'error') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#ff4757' : '#2ed573'};
            color: white;
            border-radius: 5px;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    async init() {
        try {
            this.availableReports = await getAvailableReports();

            if (this.availableReports.length === 0) {
                this.showNotification('Нет доступных отчётов для отображения');
                return;
            }

            if (this.currentPage === 'index') {
                await this.handleIndexPage();
            } else {
                await this.handleOtherPages();
            }

        } catch (error) {
            console.error('Ошибка при инициализации:', error);
            this.showNotification('Ошибка при загрузке данных');
        }
    }

    async handleIndexPage() {
        const selectElement = document.getElementById('reportSelect');
        const selectButton = document.getElementById('selectReportBtn');
        const mainContent = document.getElementById('main-content');

        this.availableReports.forEach(report => {
            const option = document.createElement('option');
            option.value = report;
            option.textContent = report;
            selectElement.appendChild(option);
        });

        selectElement.addEventListener('change', (event) => {
            selectButton.disabled = !event.target.value;
        });

        selectButton.addEventListener('click', async () => {
            if (!selectElement.value) return;

            this.selectedReport = selectElement.value;
            saveSelectedReport(this.selectedReport);

            mainContent.classList.remove('hidden');
            setTimeout(() => mainContent.classList.add('visible'), 10);

            await this.loadAndRenderData();
        });

        const savedReport = getSelectedReport();
        if (savedReport && this.availableReports.includes(savedReport)) {
            selectElement.value = savedReport;
            this.selectedReport = savedReport;
            selectButton.disabled = false;

            mainContent.classList.remove('hidden');
            setTimeout(() => {
                mainContent.classList.add('visible');
                this.loadAndRenderData();
            }, 10);
        }
    }

    async handleOtherPages() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.add('hidden');
            mainContent.classList.remove('visible');
        }

        const urlParams = new URLSearchParams(window.location.search);
        const reportFromUrl = urlParams.get('report');

        if (reportFromUrl && this.availableReports.includes(reportFromUrl)) {
            this.selectedReport = reportFromUrl;
            saveSelectedReport(this.selectedReport);
        } else {
            this.selectedReport = getSelectedReport();
        }

        if (!this.selectedReport || !this.availableReports.includes(this.selectedReport)) {
            this.showNotification('Пожалуйста, выберите отчёт на главной странице');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return;
        }

        if (mainContent) {
            mainContent.classList.remove('hidden');
            setTimeout(() => mainContent.classList.add('visible'), 10);
        }

        await this.loadAndRenderData();
    }

    async loadAndRenderData() {
        if (!this.selectedReport) return;

        try {
            const [report, patches, autotests] = await loadData(this.selectedReport);

            this.reportData = report;
            this.patchesData = patches;
            this.autotestsData = autotests;
            this.reportName = `Отчет по ошибкам (${report.name})`;
            this.period = {
                prev: report.prev,
                current: report.current
            };

            const renderOptions = {
                formatNumber: this.formatNumber,
                reportName: this.selectedReport
            };

            this.updateNavigationLinks();

            await this.renderPageContent(renderOptions);

            this.addSaveButtonHandler();

        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            this.showNotification('Ошибка при загрузке данных отчёта');
        }
    }

    async renderPageContent(renderOptions) {
        switch (this.currentPage) {
            case 'index':
                document.getElementById('header').innerHTML = this.reportName;
                renderSummary(this.reportData.total, '', this.period, renderOptions);
                break;
            case 'patches':
                renderPatches(this.patchesData, this.period);
                break;
            case 'autotests':
                await renderAutotests(this.autotestsData, this.period);
                break;
            case 'suup-autotests':
                await renderSUUPAutotests(this.autotestsData, this.period);
                break;
            case 'errors':
                renderErrorStats(this.reportData, this.period, renderOptions);
                break;
            case 'error-categories':
                renderErrorCategories(this.reportData, this.period, renderOptions);
                break;
            case 'zakazchik-errors':
                document.getElementById('header').innerHTML = `ОШИБКИ ЗАКАЗЧИКОВ (${this.period.prev} - ${this.period.current})`;
                renderSummary(this.reportData.zakazchik, 'zakazchik', this.period, renderOptions);
                break;
            case 'int-errors':
                document.getElementById('header').innerHTML = `ОШИБКИ ВНУТРЕННИЕ (${this.period.prev} - ${this.period.current})`;
                renderSummary(this.reportData.int, 'int', this.period, renderOptions);
                break;
            default:
                const groupConfig = this.getGroupConfig(this.currentPage);
                if (groupConfig) {
                    const { type, group, pageName } = groupConfig;

                    document.getElementById('header').innerHTML = pageName;

                    const groupData = this.getDataByPath(this.reportData, `${type}Errors.${group}Group`);
                    const groupName = type === 'zakazchik'
                        ? `Группа ${group.toUpperCase()}`
                        : `Группа ${group.toUpperCase()}`;

                    renderSummary(groupData, group, this.period, renderOptions);
                    renderGroupErrors(groupData, groupName, this.period, renderOptions);
                }
                break;
        }
    }

    updateNavigationLinks() {
        const links = document.querySelectorAll('a.pdf-link');
        links.forEach(link => {
            const url = new URL(link.href, window.location.origin);
            url.searchParams.set('report', this.selectedReport);
            link.href = url.toString();
        });

        document.title = `Отчёт по ошибкам - ${this.selectedReport}`;
    }

    addSaveButtonHandler() {
        const saveButton = document.getElementById('saveReport');
        if (saveButton) {
            saveButton.replaceWith(saveButton.cloneNode(true));
            const newSaveButton = document.getElementById('saveReport');

            newSaveButton.addEventListener('click', () => {
                this.exportToPDFWithIframe();
            });
        }
    }

    exportToPDFWithIframe() {
        console.log('Экспорт отчёта:', this.selectedReport);
        this.showNotification('Функция экспорта в разработке', 'info');
    }
}

window.formatNumber = formatNumber;

document.addEventListener('DOMContentLoaded', () => {
    const app = new ReportApp();
    app.init();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ReportApp, formatNumber };
}