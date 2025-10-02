const { getTasksData } = require('./fileService');
const fs = require('fs');
const path = require('path');

const prevTasks = getTasksData('prev_quarter.csv');
const currTasks = getTasksData('current_quarter.csv');

const currentQuarter = '3 квартал 2025';
const prevQuarter = '2 квартал 2025';

// Категории ошибок
const categories = [
    'code64', 'modification', 'new', 'not available', 'old', 'patch',
    'postanovka', 'postgre', 'refactoring', 'regressive', 'support', 'zakazchik'
];

// Группы и их модули
const groups = {
    kdGroup: [
        'Базовые справочники', 'Бизнес-объекты', 'Каталоги', 'Классификаторы',
        'Констр. ИИ', 'Констр. объекты', 'Модели', 'Объекты системы',
        'Потоки работ', 'Сервисное обслуживание', 'Стандарты предприятия', 'Оснастка'
    ],
    tppGroup: [
        'FOP/FOS', 'Маршруты', 'Мат. нормативы', 'Металлург. пр-во',
        'Оборудование', 'Технологические нужды', 'Техпроцессы', 'ТПП', 'Трудовые нормативы'
    ],
    planGroup: [
        'Заказы', 'Кадры', 'Нормативные затраты', 'Планирование заводское',
        'Планирование проектное', 'Статистика', 'Финансы', 'Цены'
    ],
    suupGroup: [
        'Договоры', 'Оперативный учет', 'Планирование цеховое', 'Templates Editor',
        'Сбыт', 'Складской учет', 'Снабжение', 'Упр. качеством', 'Учет в производстве', 'Номерной учет'
    ],
    adminGroup: [
        'Разное', 'Сервер', 'Тонкий клиент'
    ]
};

function getSummaryStats(tasks) {
    return {
        totalTasks: tasks.length,
        totalHours: tasks.reduce((sum, t) => sum + t.hours, 0),
    };
}

function filterZakazchikTasks(tasks) {
    return tasks.filter(t => !/\[int\]/i.test(t.taskTitle));
}

function filterIntTasks(tasks) {
    return tasks.filter(t => /\[int\]/i.test(t.taskTitle));
}

function countByCategory(tasks, includeTasks = false) {
    const stats = {};
    categories.forEach(cat => {
        stats[cat] = {
            count: 0,
            hours: 0,
            tasks: includeTasks ? [] : undefined
        };
    });

    tasks.forEach(t => {
        const cat = t.category.toLowerCase();
        if (categories.includes(cat)) {
            stats[cat].count += 1;
            stats[cat].hours += t.hours;
            if (includeTasks) {
                stats[cat].tasks.push({
                    taskNum: t.taskNum,
                    module: t.module,
                    hours: t.hours,
                    title: t.taskTitle,
                    category: cat
                });
            }
        }
    });

    return stats;
}

function processGroupTasks(prevTasks, currTasks, groupModules) {
    const prevGroupTasks = prevTasks.filter(t => groupModules.includes(t.module));
    const currGroupTasks = currTasks.filter(t => groupModules.includes(t.module));

    const byModule = {};
    groupModules.forEach(module => {
        const moduleTasks = currGroupTasks.filter(t => t.module === module);
        if (moduleTasks.length > 0) {
            byModule[module] = {
                prevCount: 0,
                currCount: moduleTasks.length,
                prevHours: 0,
                currHours: moduleTasks.reduce((sum, t) => sum + t.hours, 0),
                tasks: moduleTasks.map(t => ({
                    taskNum: t.taskNum,
                    hours: t.hours,
                    category: t.category,
                    title: t.taskTitle
                }))
            };
        }
    });

    return {
        prev: {
            totalTasks: prevGroupTasks.length,
            totalHours: prevGroupTasks.reduce((sum, t) => sum + t.hours, 0)
        },
        current: {
            totalTasks: currGroupTasks.length,
            totalHours: currGroupTasks.reduce((sum, t) => sum + t.hours, 0)
        },
        byModule: byModule
    };
}

const prevZakazchik = filterZakazchikTasks(prevTasks);
const currZakazchik = filterZakazchikTasks(currTasks);
const prevInt = filterIntTasks(prevTasks);
const currInt = filterIntTasks(currTasks);

const prevZakazchikStats = countByCategory(prevZakazchik);
const currZakazchikStats = countByCategory(currZakazchik, true);

categories.forEach(cat => {
    const increased = currZakazchikStats[cat].count > prevZakazchikStats[cat].count;
    currZakazchikStats[cat].increased = increased;

    if (!increased) {
        delete currZakazchikStats[cat].tasks;
    }
});

const zakazchikErrors = {};
Object.keys(groups).forEach(group => {
    zakazchikErrors[group] = processGroupTasks(prevZakazchik, currZakazchik, groups[group]);

    const prevGroupTasks = prevZakazchik.filter(t => groups[group].includes(t.module));
    Object.keys(zakazchikErrors[group].byModule).forEach(module => {
        const prevModuleTasks = prevGroupTasks.filter(t => t.module === module);
        zakazchikErrors[group].byModule[module].prevCount = prevModuleTasks.length;
        zakazchikErrors[group].byModule[module].prevHours = prevModuleTasks.reduce((sum, t) => sum + t.hours, 0);

        if (zakazchikErrors[group].byModule[module].prevCount === 0 &&
            zakazchikErrors[group].byModule[module].currCount === 0) {
            delete zakazchikErrors[group].byModule[module];
        }
    });
});

const intErrors = {};
Object.keys(groups).forEach(group => {
    intErrors[group] = processGroupTasks(prevInt, currInt, groups[group]);

    const prevGroupTasks = prevInt.filter(t => groups[group].includes(t.module));
    intErrors[group].prevTotalTasks = prevGroupTasks.length;
    intErrors[group].prevTotalHours = prevGroupTasks.reduce((sum, t) => sum + t.hours, 0);

    Object.keys(intErrors[group].byModule).forEach(module => {
        const prevModuleTasks = prevGroupTasks.filter(t => t.module === module);
        intErrors[group].byModule[module].prevCount = prevModuleTasks.length;
        intErrors[group].byModule[module].prevHours = prevModuleTasks.reduce((sum, t) => sum + t.hours, 0);

        if (intErrors[group].byModule[module].prevCount === 0 &&
            intErrors[group].byModule[module].currCount === 0) {
            delete intErrors[group].byModule[module];
        }
    });
});

const report = {
    name: `${prevQuarter} - ${currentQuarter}`,
    prev: prevQuarter,
    current: currentQuarter,
    total: {
        prev: getSummaryStats(prevTasks),
        current: getSummaryStats(currTasks)
    },
    zakazchik: {
        prev: {
            ...getSummaryStats(prevZakazchik),
            byCategory: prevZakazchikStats
        },
        current: {
            ...getSummaryStats(currZakazchik),
            byCategory: currZakazchikStats
        }
    },
    int: {
        prev: {
            ...getSummaryStats(prevInt),
            byCategory: countByCategory(prevInt)
        },
        current: {
            ...getSummaryStats(currInt),
            byCategory: countByCategory(currInt)
        }
    },
    zakazchikErrors,
    intErrors
};

const filePath = path.join(__dirname, '..', 'data', `${prevQuarter} - ${currentQuarter}`, 'report.json');
fs.writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
console.log(`Отчёт сохранён в data/${prevQuarter} - ${currentQuarter}/report.json`);