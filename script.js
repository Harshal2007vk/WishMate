/* =====================================================
   WISHMATE — Personal Occasion & Gifting Assistant
   script.js — Complete MVP Logic
   ===================================================== */

'use strict';

/* ─── CONSTANTS ──────────────────────────────────── */

const STORAGE_KEY = 'wishmate_v2';

const OCCASION_EMOJI = {
    'birthday':       '🎂',
    'anniversary':    '💍',
    'graduation':     '🎓',
    'work-anniversary':'💼',
    'baby-shower':    '👶',
    'housewarming':   '🏠',
    'custom':         '🎉',
};

const OCCASION_LABEL = {
    'birthday':        'Birthday',
    'anniversary':     'Anniversary',
    'graduation':      'Graduation',
    'work-anniversary':'Work Anniversary',
    'baby-shower':     'Baby Shower',
    'housewarming':    'Housewarming',
    'custom':          'Custom',
};

const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ─── STATE ──────────────────────────────────────── */

let occasions = load();
let currentView   = 'dashboard';
let currentFilter = 'all';
let searchQuery   = '';

/* ─── PERSISTENCE ────────────────────────────────── */

function load() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedData();
    } catch {
        return seedData();
    }
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(occasions));
}

/** Demo data so the app looks non-empty on first load */
function seedData() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = today.getDate();

    function nextDate(daysAhead, birthYear) {
        const t = new Date(today);
        t.setDate(d + daysAhead);
        return `${birthYear}-${pad(t.getMonth()+1)}-${pad(t.getDate())}`;
    }

    const data = [
        {
            id: 1001,
            name: 'Aditi Sharma',
            occasionType: 'birthday',
            date: nextDate(0, y - 22),   /* TODAY */
            relationship: 'Best Friend',
            importance: 'vip',
            budget: 2000,
            location: 'Delhi',
            notes: 'Loves books and coffee. Colour: pastel blue.',
            spent: 0,
        },
        {
            id: 1002,
            name: 'Rahul Verma',
            occasionType: 'birthday',
            date: nextDate(4, y - 21),
            relationship: 'Friend',
            importance: 'important',
            budget: 1500,
            location: 'Mumbai',
            notes: 'Into gaming and tech. Size: M.',
            spent: 0,
        },
        {
            id: 1003,
            name: 'Mom & Dad',
            occasionType: 'anniversary',
            date: nextDate(12, y - 30),
            relationship: 'Family',
            importance: 'vip',
            budget: 3000,
            location: 'Pune',
            notes: '',
            spent: 1200,
        },
        {
            id: 1004,
            name: 'Suyash Patil',
            occasionType: 'birthday',
            date: nextDate(27, y - 20),
            relationship: 'Friend',
            importance: 'normal',
            budget: 800,
            location: '',
            notes: '',
            spent: 0,
        },
        {
            id: 1005,
            name: 'Priya Nair',
            occasionType: 'graduation',
            date: nextDate(41, y - 22),
            relationship: 'Colleague',
            importance: 'important',
            budget: 1200,
            location: 'Bangalore',
            notes: 'Graduating from IIM.',
            spent: 0,
        },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
}

function pad(n) { return String(n).padStart(2, '0'); }

/* ─── DATE HELPERS ───────────────────────────────── */

function today0() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Returns the next occurrence of the occasion's month/day.
 * If already passed this year → returns next year.
 */
function nextOccurrence(dateString) {
    const orig = new Date(dateString + 'T00:00:00');
    const t    = today0();

    let next = new Date(t.getFullYear(), orig.getMonth(), orig.getDate());
    if (next < t) {
        next = new Date(t.getFullYear() + 1, orig.getMonth(), orig.getDate());
    }
    return next;
}

function daysUntil(dateString) {
    const diff = nextOccurrence(dateString).getTime() - today0().getTime();
    return Math.round(diff / 86400000);
}

function isToday(dateString) {
    const orig = new Date(dateString + 'T00:00:00');
    const t    = today0();
    return orig.getMonth() === t.getMonth() && orig.getDate() === t.getDate();
}

function isThisMonth(dateString) {
    return nextOccurrence(dateString).getMonth() === today0().getMonth();
}

function isThisWeek(dateString) {
    return daysUntil(dateString) <= 7;
}

/** How many years since the original date (turning age / anniversary years) */
function yearsSince(dateString) {
    const orig  = new Date(dateString + 'T00:00:00');
    const t     = today0();
    let years   = t.getFullYear() - orig.getFullYear();
    const thisYr = new Date(t.getFullYear(), orig.getMonth(), orig.getDate());
    if (thisYr > t) years--;
    return years + 1;   /* the age/year they'll be TURNING */
}

function formatDisplayDate(dateString) {
    const d = new Date(dateString + 'T00:00:00');
    return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function formatNextDate(dateString) {
    const d = nextOccurrence(dateString);
    return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function ordinal(n) {
    const s = ['th','st','nd','rd'];
    const v = n % 100;
    return n + (s[(v-20)%10] || s[v] || s[0]);
}

/* ─── ESCAPE ─────────────────────────────────────── */

function esc(str) {
    return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
}

/* ─── ELEMENTS ───────────────────────────────────── */

const $ = id => document.getElementById(id);

/* ─── GREETING ───────────────────────────────────── */

function setGreeting() {
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good morning! 👋'
                : h < 17 ? 'Good afternoon! ☀️'
                :           'Good evening! 🌙';
    $('heroGreeting').textContent = greet;

    const t = today0();
    $('heroDate').textContent = t.toLocaleDateString('en-IN', {
        weekday:'long', day:'2-digit', month:'long', year:'numeric'
    });

    /* budget month label */
    $('budgetMonthLabel').textContent = MONTHS[t.getMonth()];
}

/* ─── VIEW SWITCHING ─────────────────────────────── */

document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        switchView(btn.dataset.view);
    });
});

$('homeBtn').addEventListener('click',    () => switchView('dashboard'));
$('homeBtn').addEventListener('keydown',  e => { if(e.key==='Enter') switchView('dashboard'); });
$('viewAllBtn').addEventListener('click', () => switchView('occasions'));

function switchView(view) {
    currentView = view;

    document.querySelectorAll('.view').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));

    $(`view${view.charAt(0).toUpperCase() + view.slice(1)}`).classList.add('active');

    const tabBtn = document.querySelector(`.nav-tab[data-view="${view}"]`);
    if (tabBtn) tabBtn.classList.add('active');

    render();
}

/* ─── SEARCH ─────────────────────────────────────── */

$('searchInput').addEventListener('input', () => {
    searchQuery = $('searchInput').value.trim().toLowerCase();
    if (searchQuery) switchView('occasions');
    render();
});

/* ─── FILTERS ────────────────────────────────────── */

document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.dataset.filter;
        render();
    });
});

/* ─── RENDER MASTER ──────────────────────────────── */

function render() {
    renderDashboard();
    renderOccasions();
    renderBudget();
}

/* ─── DASHBOARD ──────────────────────────────────── */

function renderDashboard() {
    setGreeting();
    renderTodayBanner();
    renderStats();
    renderUpcoming();
    renderBudgetSnapshot();
}

function renderTodayBanner() {
    const banner = $('todayBanner');
    const celebs = occasions.filter(o => isToday(o.date));

    if (celebs.length === 0) {
        banner.classList.add('hidden');
        return;
    }

    banner.classList.remove('hidden');

    const html = celebs.map(o => {
        const years  = yearsSince(o.date);
        const emoji  = OCCASION_EMOJI[o.occasionType] || '🎉';
        const isAnni = o.occasionType === 'anniversary';
        const sub    = isAnni
            ? `${ordinal(years)} Anniversary! 🥂`
            : `Turning ${years}! 🎂`;

        return `
            <div class="today-label">🎉 TODAY</div>
            <div class="today-name">${emoji} Happy ${OCCASION_LABEL[o.occasionType] || 'Day'}, ${esc(o.name)}!</div>
            <div class="today-sub">${sub} ${o.budget ? `• Gift Budget: ₹${Number(o.budget).toLocaleString('en-IN')}` : ''}</div>
            <div class="today-actions">
                <button class="today-btn today-btn-primary" onclick="openGiftModal(${o.id})">🎁 Plan Gift</button>
                <button class="today-btn today-btn-secondary" onclick="openMessageModal(${o.id})">💌 Write Message</button>
            </div>
        `;
    }).join('<hr style="border:none;border-top:1px solid rgba(255,255,255,0.2);margin:16px 0;">');

    banner.innerHTML = html;
}

function renderStats() {
    const t   = today0();
    const mth = t.getMonth();

    $('statTotal').textContent  = occasions.length;
    $('statToday').textContent  = occasions.filter(o => isToday(o.date)).length;
    $('statMonth').textContent  = occasions.filter(o => nextOccurrence(o.date).getMonth() === mth).length;

    const monthBudget = occasions
        .filter(o => nextOccurrence(o.date).getMonth() === mth)
        .reduce((s, o) => s + Number(o.budget || 0), 0);

    $('statMonthBudget').textContent = '₹' + monthBudget.toLocaleString('en-IN');
}

function renderUpcoming() {
    const list = $('upcomingList');
    const sorted = [...occasions]
        .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
        .slice(0, 8);

    if (sorted.length === 0) {
        list.innerHTML = '<div class="empty-mini">No occasions yet. Add one! 🎊</div>';
        return;
    }

    list.innerHTML = sorted.map(o => {
        const days   = daysUntil(o.date);
        const emoji  = OCCASION_EMOJI[o.occasionType] || '🎉';
        const label  = OCCASION_LABEL[o.occasionType] || 'Occasion';
        const today  = days === 0;
        const years  = yearsSince(o.date);
        const isAnni = o.occasionType === 'anniversary';
        const meta   = isAnni
            ? `${label} • ${ordinal(years)}`
            : `${label} • Turning ${years}`;

        const daysText = today  ? '🎉 TODAY'
                       : days === 1 ? 'Tomorrow'
                       : `${days} days`;

        return `
            <div class="upcoming-item ${today ? 'is-today' : ''}" onclick="switchView('occasions')">
                <span class="upcoming-emoji">${emoji}</span>
                <div class="upcoming-info">
                    <div class="upcoming-name">${esc(o.name)}</div>
                    <div class="upcoming-meta">${esc(meta)}</div>
                </div>
                <div class="upcoming-days ${today ? 'today' : ''}">${daysText}</div>
            </div>
        `;
    }).join('');
}

function renderBudgetSnapshot() {
    const mth = today0().getMonth();
    const monthOccasions = occasions.filter(o => nextOccurrence(o.date).getMonth() === mth);

    const planned  = monthOccasions.reduce((s, o) => s + Number(o.budget || 0), 0);
    const spent    = monthOccasions.reduce((s, o) => s + Number(o.spent || 0), 0);
    const remaining = Math.max(0, planned - spent);

    $('snapPlanned').textContent   = '₹' + planned.toLocaleString('en-IN');
    $('snapSpent').textContent     = '₹' + spent.toLocaleString('en-IN');
    $('snapRemaining').textContent = '₹' + remaining.toLocaleString('en-IN');

    const pct = planned > 0 ? Math.min(100, Math.round((spent / planned) * 100)) : 0;
    $('budgetBarFill').style.width = pct + '%';

    /* Annual estimate */
    const annual = occasions.reduce((s, o) => s + Number(o.budget || 0), 0);
    $('annualEstimate').textContent = '₹' + annual.toLocaleString('en-IN');
}

/* ─── OCCASIONS ──────────────────────────────────── */

function getFilteredOccasions() {
    let list = [...occasions];

    if (searchQuery) {
        list = list.filter(o => o.name.toLowerCase().includes(searchQuery));
    }

    switch (currentFilter) {
        case 'birthday':    list = list.filter(o => o.occasionType === 'birthday');    break;
        case 'anniversary': list = list.filter(o => o.occasionType === 'anniversary'); break;
        case 'today':       list = list.filter(o => isToday(o.date));                  break;
        case 'week':        list = list.filter(o => isThisWeek(o.date));               break;
        case 'month':       list = list.filter(o => isThisMonth(o.date));              break;
    }

    list.sort((a, b) => daysUntil(a.date) - daysUntil(b.date));
    return list;
}

function renderOccasions() {
    const grid  = $('occasionGrid');
    const empty = $('emptyState');
    const list  = getFilteredOccasions();

    $('occasionsSubtext').textContent =
        `${list.length} occasion${list.length !== 1 ? 's' : ''} • sorted by nearest date`;

    if (list.length === 0) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        empty.classList.remove('hidden');
        return;
    }

    grid.style.display = 'grid';
    empty.classList.add('hidden');
    grid.innerHTML = list.map(buildCard).join('');
}

function buildCard(o) {
    const days     = daysUntil(o.date);
    const todayBd  = days === 0;
    const emoji    = OCCASION_EMOJI[o.occasionType] || '🎉';
    const label    = OCCASION_LABEL[o.occasionType] || 'Occasion';
    const years    = yearsSince(o.date);
    const isAnni   = o.occasionType === 'anniversary';
    const isBday   = o.occasionType === 'birthday';

    /* Badge for occasion type */
    const typeBadge = todayBd
        ? `<span class="badge-type badge-today">🎉 TODAY</span>`
        : `<span class="badge-type badge-${o.occasionType}">${emoji} ${label}</span>`;

    /* Importance badge */
    const impBadge = o.importance === 'vip'
        ? '<span class="badge-importance-vip">👑</span>'
        : o.importance === 'important'
        ? '<span class="badge-importance-important">⭐</span>'
        : '';

    /* Age / Anniversary line */
    let turningLine = '';
    if (isBday) {
        turningLine = `<div class="info-item">
            <div class="info-label">Turning</div>
            <div class="info-value">${years} 🎂</div>
        </div>`;
    } else if (isAnni) {
        turningLine = `<div class="info-item">
            <div class="info-label">Year</div>
            <div class="info-value">${ordinal(years)} 💍</div>
        </div>`;
    }

    /* Celebration message for today */
    const celebBlock = todayBd ? `
        <div class="card-celebrate">
            <div class="celebrate-emoji">🥳</div>
            <div class="celebrate-text">
                ${isAnni ? `Happy ${ordinal(years)} Anniversary!` : `Happy ${years}${isBday?'th':''} Birthday!`}
            </div>
        </div>
    ` : '';

    /* Countdown text */
    const daysText = todayBd  ? '🎉 TODAY!'
                   : days === 1 ? 'Tomorrow'
                   : `${days} days away`;

    /* Reminder timeline (only if ≤14 days) */
    let timeline = '';
    if (!todayBd && days <= 14 && days > 0) {
        timeline = buildTimeline(days);
    }

    /* Budget display */
    const budgetText = o.budget
        ? `₹${Number(o.budget).toLocaleString('en-IN')}`
        : '—';

    return `
    <article class="occasion-card ${todayBd ? 'is-today' : ''} importance-${o.importance}" data-id="${o.id}">
        <div class="card-top">
            <div class="card-badge">
                ${typeBadge}
                ${impBadge}
            </div>
            <div class="card-actions">
                <button class="icon-btn" title="Edit" onclick="editOccasion(${o.id})">✏️</button>
                <button class="icon-btn btn-delete" title="Delete" onclick="deleteOccasion(${o.id})">🗑️</button>
            </div>
        </div>

        <div class="card-name">${esc(o.name)}</div>
        <div class="card-relationship">
            <span>${esc(o.relationship || 'Person')}</span>
            ${o.location ? `<span>• 📍 ${esc(o.location)}</span>` : ''}
        </div>

        ${celebBlock}

        <div class="card-info">
            <div class="info-item">
                <div class="info-label">Date</div>
                <div class="info-value">${formatDisplayDate(o.date)}</div>
            </div>
            ${turningLine}
            <div class="info-item">
                <div class="info-label">Next Date</div>
                <div class="info-value">${formatNextDate(o.date)}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Gift Budget</div>
                <div class="info-value">${budgetText}</div>
            </div>
        </div>

        <div class="card-countdown">
            <span class="countdown-label">${daysText}</span>
            <span class="countdown-days ${todayBd ? 'today-pill' : ''}">${todayBd ? '🎉 TODAY' : days + ' days'}</span>
        </div>

        ${timeline}

        ${o.notes ? `<div class="timeline" style="font-size:12px;color:var(--text-dim);margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">📝 ${esc(o.notes)}</div>` : ''}

        <div class="card-btns">
            <button class="card-btn card-btn-gift" onclick="openGiftModal(${o.id})">🎁 Plan Gift</button>
            <button class="card-btn card-btn-msg"  onclick="openMessageModal(${o.id})">💌 Write Message</button>
        </div>
    </article>
    `;
}

function buildTimeline(days) {
    const steps = [];

    if (days > 10) steps.push({ label: '💡 Start gift planning', active: false });
    if (days <= 10 && days > 7) steps.push({ label: '💡 Start gift planning now!', active: true });
    if (days <= 7  && days > 3) steps.push({ label: '🎁 Buy the gift today', active: true });
    if (days <= 3  && days > 1) steps.push({ label: '📦 Check order delivery', active: true });
    if (days === 1)              steps.push({ label: '💌 Prepare your message', active: true });

    if (steps.length === 0) return '';

    return `<div class="timeline">
        ${steps.map(s => `
            <div class="timeline-row">
                <div class="timeline-dot ${s.active ? 'active' : ''}"></div>
                <span>${s.label}</span>
            </div>
        `).join('')}
    </div>`;
}

/* ─── BUDGET VIEW ────────────────────────────────── */

function renderBudget() {
    renderMonthly();
    renderTopSpends();
    renderByRelationship();
}

function renderMonthly() {
    const breakdown = $('monthlyBreakdown');
    const currentMth = today0().getMonth();
    const max = Math.max(...MONTHS.map((_,i) => monthTotal(i))) || 1;
    const yearly = occasions.reduce((s, o) => s + Number(o.budget||0), 0);

    $('annualBadge').textContent  = 'Yearly: ₹' + yearly.toLocaleString('en-IN');

    breakdown.innerHTML = MONTHS.map((name, i) => {
        const total = monthTotal(i);
        const count = monthCount(i);
        const pct   = Math.round((total / max) * 70); /* max 70% fill for aesthetics */
        const isCur = i === currentMth;

        return `
            <div class="month-col ${isCur ? 'current-month' : ''}" style="--fill-h:${pct}%">
                <div class="month-name">${MONTH_SHORT[i]}</div>
                <div class="month-amount">${total ? '₹'+total.toLocaleString('en-IN') : '—'}</div>
                <div class="month-count">${count ? count+' event'+(count>1?'s':'') : ''}</div>
            </div>
        `;
    }).join('');
}

function monthTotal(mth) {
    return occasions
        .filter(o => new Date(o.date+'T00:00:00').getMonth() === mth)
        .reduce((s,o) => s + Number(o.budget||0), 0);
}

function monthCount(mth) {
    return occasions.filter(o => new Date(o.date+'T00:00:00').getMonth() === mth).length;
}

function renderTopSpends() {
    const container = $('topSpends');
    const sorted = [...occasions]
        .filter(o => o.budget > 0)
        .sort((a,b) => Number(b.budget) - Number(a.budget))
        .slice(0, 5);

    if (sorted.length === 0) {
        container.innerHTML = '<div class="empty-mini">No budget data yet.</div>';
        return;
    }

    container.innerHTML = sorted.map((o, i) => `
        <div class="top-spend-item">
            <div class="top-spend-rank">${i+1}</div>
            <div class="top-spend-name">${esc(o.name)}</div>
            <div class="top-spend-amount">₹${Number(o.budget).toLocaleString('en-IN')}</div>
        </div>
    `).join('');
}

function renderByRelationship() {
    const container = $('byRelationship');
    const map = {};

    occasions.forEach(o => {
        const rel = o.relationship || 'Other';
        if (!map[rel]) map[rel] = 0;
        map[rel] += Number(o.budget || 0);
    });

    const entries = Object.entries(map).sort((a,b) => b[1]-a[1]);
    const maxVal  = entries[0]?.[1] || 1;

    if (entries.length === 0) {
        container.innerHTML = '<div class="empty-mini">No data yet.</div>';
        return;
    }

    container.innerHTML = entries.map(([rel, total]) => `
        <div class="rel-row">
            <div class="rel-head">
                <span class="rel-name">${esc(rel)}</span>
                <span class="rel-amount">₹${total.toLocaleString('en-IN')}</span>
            </div>
            <div class="rel-bar">
                <div class="rel-bar-fill" style="width:${Math.round((total/maxVal)*100)}%"></div>
            </div>
        </div>
    `).join('');
}

/* ─── ADD / EDIT MODAL ───────────────────────────── */

const occasionModal = $('occasionModal');
const occasionForm  = $('occasionForm');

function openAddModal() {
    $('modalHeading').textContent = 'Add Occasion';
    $('formSave').textContent     = 'Save Occasion';
    $('editId').value = '';
    occasionForm.reset();
    document.querySelector('input[name="occasionType"][value="birthday"]').checked = true;
    clearFormErrors();
    occasionModal.classList.add('show');
    $('fieldName').focus();
}

function editOccasion(id) {
    const o = occasions.find(x => x.id === id);
    if (!o) return;

    $('modalHeading').textContent = 'Edit Occasion';
    $('formSave').textContent     = 'Save Changes';
    $('editId').value = id;

    $('fieldName').value         = o.name;
    $('fieldRelationship').value = o.relationship || 'Friend';
    $('fieldDate').value         = o.date;
    $('fieldImportance').value   = o.importance || 'normal';
    $('fieldBudget').value       = o.budget || '';
    $('fieldLocation').value     = o.location || '';
    $('fieldNotes').value        = o.notes || '';

    const radio = document.querySelector(`input[name="occasionType"][value="${o.occasionType}"]`);
    if (radio) radio.checked = true;

    clearFormErrors();
    occasionModal.classList.add('show');
    $('fieldName').focus();
}

function clearFormErrors() {
    ['errName','errDate','errBudget'].forEach(id => { $(id).textContent = ''; });
}

function closeModal(modalEl) {
    modalEl.classList.remove('show');
}

$('addOccasionBtn').addEventListener('click', openAddModal);
$('emptyAddBtn').addEventListener('click',    openAddModal);
$('modalClose').addEventListener('click',    () => closeModal(occasionModal));
$('formCancel').addEventListener('click',    () => closeModal(occasionModal));

occasionModal.addEventListener('click', e => {
    if (e.target === occasionModal) closeModal(occasionModal);
});

occasionForm.addEventListener('submit', e => {
    e.preventDefault();
    clearFormErrors();

    const name      = $('fieldName').value.trim();
    const date      = $('fieldDate').value;
    const budget    = Number($('fieldBudget').value || 0);
    const type      = document.querySelector('input[name="occasionType"]:checked')?.value || 'birthday';

    let valid = true;

    if (name.length < 2) {
        $('errName').textContent = 'Please enter a valid name (min 2 chars).';
        valid = false;
    }

    if (!date) {
        $('errDate').textContent = 'Please select a date.';
        valid = false;
    }

    if (budget < 0) {
        $('errBudget').textContent = 'Budget cannot be negative.';
        valid = false;
    }

    if (!valid) return;

    const editId = $('editId').value;

    if (editId) {
        const o = occasions.find(x => x.id === Number(editId));
        if (o) {
            o.name         = name;
            o.occasionType = type;
            o.date         = date;
            o.relationship = $('fieldRelationship').value;
            o.importance   = $('fieldImportance').value;
            o.budget       = budget;
            o.location     = $('fieldLocation').value.trim();
            o.notes        = $('fieldNotes').value.trim();
        }
        showToast('✅ Occasion updated!');
    } else {
        occasions.push({
            id:           Date.now(),
            name,
            occasionType: type,
            date,
            relationship: $('fieldRelationship').value,
            importance:   $('fieldImportance').value,
            budget,
            location:     $('fieldLocation').value.trim(),
            notes:        $('fieldNotes').value.trim(),
            spent:        0,
        });
        showToast('🎊 Occasion added!');
    }

    save();
    closeModal(occasionModal);
    render();
});

/* ─── DELETE ─────────────────────────────────────── */

function deleteOccasion(id) {
    const o = occasions.find(x => x.id === id);
    if (!o) return;
    if (!confirm(`Delete "${o.name}"'s occasion? This cannot be undone.`)) return;
    occasions = occasions.filter(x => x.id !== id);
    save();
    render();
    showToast('🗑️ Occasion removed.');
}

/* ─── GIFT PLAN MODAL ────────────────────────────── */

const giftModal = $('giftModal');

function openGiftModal(id) {
    const o = occasions.find(x => x.id === id);
    if (!o) return;

    const budget = Number(o.budget || 0);
    const days   = daysUntil(o.date);
    const emoji  = OCCASION_EMOJI[o.occasionType] || '🎉';
    const label  = OCCASION_LABEL[o.occasionType] || 'Occasion';

    /* Smart gift suggestions based on budget */
    const suggestions = generateGiftPlan(budget, o);
    const totalCost   = suggestions.reduce((s, g) => s + g.price, 0);
    const remaining   = budget - totalCost;

    const itemsHTML = suggestions.map(g => `
        <div class="gift-item">
            <span class="gift-item-emoji">${g.emoji}</span>
            <span class="gift-item-name">${esc(g.name)}</span>
            <span class="gift-item-price">₹${g.price.toLocaleString('en-IN')}</span>
        </div>
    `).join('');

    $('giftModalBody').innerHTML = `
        <div class="gift-person-name">${emoji} ${esc(o.name)}</div>
        <div class="gift-occasion-meta">${label} • ${days === 0 ? 'TODAY! 🎉' : days + ' days away'}</div>

        <div class="gift-budget-label">
            Budget: <span class="gift-budget-total">₹${budget.toLocaleString('en-IN')}</span>
        </div>

        <div class="gift-items">
            ${itemsHTML}
            <div class="gift-separator"></div>
        </div>

        <div class="gift-total-row">
            <strong>Total</strong>
            <span>₹${totalCost.toLocaleString('en-IN')}</span>
        </div>
        <div class="gift-remaining-row">
            <span>Remaining</span>
            <strong>₹${Math.max(0, remaining).toLocaleString('en-IN')}</strong>
        </div>

        <div style="margin-top:20px;padding:14px;background:rgba(255,255,255,0.03);border-radius:12px;font-size:13px;color:var(--text-muted);">
            💡 These are smart suggestions based on budget. Prices are estimates.
            ${o.notes ? `<br><br>📝 Notes: ${esc(o.notes)}` : ''}
        </div>
    `;

    giftModal.classList.add('show');
}

function generateGiftPlan(budget, o) {
    /* Curated gift packs by budget range */
    if (budget <= 500) {
        return [
            { emoji:'🍫', name:'Premium Chocolates', price: Math.min(250, budget * 0.5) },
            { emoji:'💌', name:'Personalized Card',  price: 99 },
            { emoji:'🌸', name:'Flowers',            price: Math.min(150, budget * 0.3) },
        ].map(g => ({ ...g, price: Math.round(g.price / 10) * 10 }));
    }

    if (budget <= 1000) {
        return [
            { emoji:'🧣', name:'Scarf / Accessory',  price: Math.round(budget * 0.55) },
            { emoji:'🍫', name:'Chocolate Box',       price: 250 },
            { emoji:'💌', name:'Personalized Card',   price: 149 },
        ];
    }

    if (budget <= 2000) {
        return [
            { emoji:'🧴', name:'Skincare / Grooming Set', price: Math.round(budget * 0.6) },
            { emoji:'📚', name:'Book Set',                price: 400 },
            { emoji:'🍫', name:'Premium Chocolate Box',   price: 299 },
            { emoji:'💌', name:'Personalized Card',       price: 149 },
        ];
    }

    if (budget <= 3500) {
        return [
            { emoji:'🎧', name:'Wireless Earbuds',    price: Math.round(budget * 0.65) },
            { emoji:'🍫', name:'Premium Chocolates',  price: 299 },
            { emoji:'💌', name:'Personalized Card',   price: 149 },
            { emoji:'🚚', name:'Est. Delivery',       price: 99 },
        ];
    }

    return [
        { emoji:'📱', name:'Smart Watch / Gadget',  price: Math.round(budget * 0.75) },
        { emoji:'🎁', name:'Gift Wrap + Box',        price: 399 },
        { emoji:'🍫', name:'Premium Chocolates',     price: 499 },
        { emoji:'💌', name:'Personalized Card',      price: 149 },
        { emoji:'🚚', name:'Est. Delivery',          price: 99 },
    ];
}

$('giftModalClose').addEventListener('click', () => closeModal(giftModal));
giftModal.addEventListener('click', e => { if(e.target === giftModal) closeModal(giftModal); });

/* ─── MESSAGE MODAL ──────────────────────────────── */

const messageModal = $('messageModal');
let selectedTone = 'funny';
let currentMsgPerson = null;

const messages = {
    funny: {
        'Friend':      (n, occ) => `Happy ${occ}, ${n}! 🎉 Hope this year brings you success, crazy memories and fewer bad decisions 😂❤️`,
        'Best Friend': (n, occ) => `Happy ${occ} bestie! 🎉 Another year older, still no idea what we're doing with our lives — perfect! 😂💛`,
        'Family':      (n, occ) => `Happy ${occ}! 🎊 The family is legally required to love you, but we actually do 😄❤️`,
        'Partner':     (n, occ) => `Happy ${occ} my love! 🥰 Another year with my favourite weirdo — wouldn't have it any other way 😘`,
        'Colleague':   (n, occ) => `Happy ${occ}, ${n}! 🎊 Wishing you a day as productive as a Monday morning… just kidding, enjoy! 😄`,
        'Other':       (n, occ) => `Happy ${occ}, ${n}! 🎉 Wishing you a wonderful day full of joy and surprises! 😄`,
    },
    emotional: {
        'Friend':      (n, occ) => `Happy ${occ}, ${n} 🥺 You mean the world to me. Wishing you all the happiness you deserve ❤️`,
        'Best Friend': (n, occ) => `Happy ${occ} 💛 You've been my rock and my safe place. I'm so grateful you exist in my life 🥹`,
        'Family':      (n, occ) => `Happy ${occ} ❤️ Every moment spent with you is a gift. I love you more than words can say 🥺`,
        'Partner':     (n, occ) => `Happy ${occ} my love 💍 Every day with you is a blessing. You make my world brighter 🥹❤️`,
        'Colleague':   (n, occ) => `Happy ${occ}, ${n} 😊 So grateful to work alongside someone as wonderful as you 🌟`,
        'Other':       (n, occ) => `Happy ${occ}, ${n} ❤️ Wishing you joy, love and everything beautiful today 🥹`,
    },
    short: {
        'Friend':      (n, occ) => `Happy ${occ} ${n}! 🎉 Have an amazing day! 🎊`,
        'Best Friend': (n, occ) => `Happy ${occ} bestie! 💛🎊`,
        'Family':      (n, occ) => `Happy ${occ}! Lots of love ❤️🎊`,
        'Partner':     (n, occ) => `Happy ${occ} my love 💕🎊`,
        'Colleague':   (n, occ) => `Happy ${occ}, ${n}! 🎊`,
        'Other':       (n, occ) => `Happy ${occ}, ${n}! 🎉`,
    },
    hinglish: {
        'Friend':      (n, occ) => `Happy ${occ} yaar ${n}! 🎉 Aaj toh full mazze karo, party tonight! 😎🔥`,
        'Best Friend': (n, occ) => `Aye bestie! Happy ${occ}! 🎊 Tu best hai bhai/didi, seriously ❤️😂`,
        'Family':      (n, occ) => `Happy ${occ}! ❤️ Bahut zyada pyaar aata hai aap se! Dil se! 🥺`,
        'Partner':     (n, occ) => `Happy ${occ} janu! 💕 Tujhse zyada kuch nahi chahiye zindagi mein 🥰`,
        'Colleague':   (n, occ) => `Happy ${occ} ${n} bhai/didi! 🎊 Office life thodi aur bekar hoti tujhke bina 😂🙌`,
        'Other':       (n, occ) => `Happy ${occ}, ${n}! 🎉 Bahut badhaiyaan! Mazze karo aaj! 😄`,
    },
    professional: {
        'Friend':      (n, occ) => `Wishing you a wonderful ${occ}, ${n}. I hope today brings you everything you deserve! 🎊`,
        'Best Friend': (n, occ) => `Happy ${occ}! Wishing you a day filled with joy and wonderful memories. You truly deserve the best! 🎊`,
        'Family':      (n, occ) => `Warmest wishes on your ${occ}. May this special day bring you happiness and all that you wish for ❤️`,
        'Partner':     (n, occ) => `Happy ${occ}, my dearest. Thank you for making every day so wonderful 💕`,
        'Colleague':   (n, occ) => `Dear ${n}, wishing you a very happy ${occ}. It's a pleasure working with such a wonderful colleague! 🎊`,
        'Other':       (n, occ) => `Best wishes on your ${occ}, ${n}. May this occasion bring you immense joy and happiness! 🎊`,
    },
};

function openMessageModal(id) {
    const o = occasions.find(x => x.id === id);
    if (!o) return;

    currentMsgPerson = o;
    selectedTone     = 'funny';

    renderMessageModal();
    messageModal.classList.add('show');
}

function renderMessageModal() {
    const o     = currentMsgPerson;
    const label = OCCASION_LABEL[o.occasionType] || 'Occasion';
    const rel   = o.relationship || 'Friend';

    const tones = ['funny','emotional','short','hinglish','professional'];

    const msgFn    = messages[selectedTone]?.[rel] || messages[selectedTone]?.['Other'];
    const msgText  = msgFn ? msgFn(o.name, label) : `Happy ${label}, ${o.name}! 🎊`;

    $('messageModalBody').innerHTML = `
        <div class="msg-options">
            <div class="msg-option-group">
                <label>Tone</label>
                <div class="msg-chips">
                    ${tones.map(t => `
                        <button class="msg-chip ${t === selectedTone ? 'active' : ''}" data-tone="${t}">
                            ${{ funny:'😂 Funny', emotional:'🥹 Emotional', short:'⚡ Short', hinglish:'🇮🇳 Hinglish', professional:'💼 Professional' }[t]}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="msg-output" id="msgOutput">${esc(msgText)}</div>

        <div class="msg-actions">
            <button class="btn-ghost" id="copyMsgBtn">📋 Copy</button>
        </div>
    `;

    /* Tone chips */
    $('messageModalBody').querySelectorAll('.msg-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            selectedTone = chip.dataset.tone;
            renderMessageModal();
        });
    });

    /* Copy */
    $('copyMsgBtn')?.addEventListener('click', () => {
        navigator.clipboard.writeText(msgText).then(() => showToast('📋 Message copied!'));
    });
}

$('messageModalClose').addEventListener('click', () => closeModal(messageModal));
messageModal.addEventListener('click', e => { if(e.target === messageModal) closeModal(messageModal); });

/* ─── TOAST ──────────────────────────────────────── */

let toastTimer;

function showToast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ─── KEYBOARD ───────────────────────────────────── */

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        [occasionModal, giftModal, messageModal].forEach(m => m.classList.remove('show'));
    }
});

/* ─── INIT ───────────────────────────────────────── */

render();