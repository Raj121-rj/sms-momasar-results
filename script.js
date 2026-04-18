const MAX_MARKS = 60;
let STUDENTS = [];
const RANK_BY_ROLL = {};

function computeRanks() {
    const sorted = [...STUDENTS].sort((a, b) => b.marks - a.marks);
    let prevMarks = null, prevRank = 0;
    sorted.forEach((s, i) => {
        const rank = (s.marks === prevMarks) ? prevRank : i + 1;
        RANK_BY_ROLL[s.roll] = rank;
        prevMarks = s.marks;
        prevRank = rank;
    });
}

function maskMobile(m) {
    if (!m) return '—';
    const digits = m.replace(/\D/g, '');
    if (digits.length < 5) return '—';
    return '•'.repeat(Math.max(0, digits.length - 5)) + digits.slice(-5);
}

function performanceLabel(percent) {
    if (percent >= 90) return 'Excellent';
    if (percent >= 75) return 'Very Good';
    if (percent >= 60) return 'Good';
    if (percent >= 40) return 'Average';
    return 'Needs Improvement';
}

function animateNumber(el, target, duration = 1400) {
    const start = performance.now();
    function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

const TROPHY_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0 0 12 0V3H6v6Z"/><path d="M6 4H3v2a3 3 0 0 0 3 3"/><path d="M18 4h3v2a3 3 0 0 1-3 3"/><path d="M12 15v4"/><path d="M8 21h8"/></svg>`;
const MEDAL_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l-3 7H9L6 3Z"/><circle cx="12" cy="15" r="6"/><path d="M10 14l2 2 2-2"/></svg>`;
const STAR_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 9 22 10 17 15 18 22 12 18 6 22 7 15 2 10 9 9 12 2"/></svg>`;

function updateCelebration(rank, prize) {
    const cel = document.getElementById('celebration');
    const icon = document.getElementById('celebrationIcon');
    const kicker = document.getElementById('celebrationKicker');
    const title = document.getElementById('celebrationTitle');

    cel.className = 'celebration';
    if (rank === 1) {
        cel.classList.add('tier-gold');
        icon.innerHTML = TROPHY_SVG;
        kicker.textContent = 'Top Ranker!';
        title.textContent = `You secured Rank 1 — ${prize.feeWaiver}% Fee Waiver + Trophy + Medal`;
    } else if (rank === 2) {
        cel.classList.add('tier-silver');
        icon.innerHTML = TROPHY_SVG;
        kicker.textContent = 'Silver Tier!';
        title.textContent = `You secured Rank 2 — ${prize.feeWaiver}% Fee Waiver + Trophy + Medal`;
    } else if (rank === 3) {
        cel.classList.add('tier-bronze');
        icon.innerHTML = TROPHY_SVG;
        kicker.textContent = 'Bronze Tier!';
        title.textContent = `You secured Rank 3 — ${prize.feeWaiver}% Fee Waiver + Trophy + Medal`;
    } else if (rank <= 10) {
        cel.classList.add('tier-top10');
        icon.innerHTML = MEDAL_SVG;
        kicker.textContent = `Top ${rank <= 5 ? '5' : '10'} Achiever!`;
        title.textContent = `You secured Rank ${rank} — ${prize.feeWaiver}% Fee Waiver + Trophy + Medal`;
    } else if (rank <= 100) {
        cel.classList.add('tier-scholarship');
        icon.innerHTML = STAR_SVG;
        kicker.textContent = 'Scholarship Winner!';
        title.textContent = `You secured Rank ${rank} — ${prize.feeWaiver}% Fee Waiver + Scholarship Certificate`;
    } else {
        cel.classList.add('hidden');
        return;
    }
}

const CONFETTI_PALETTES = {
    gold: ['#fbbf24', '#f59e0b', '#fef08a', '#fff', '#d97706'],
    silver: ['#cbd5e1', '#94a3b8', '#f1f5f9', '#fff', '#64748b'],
    bronze: ['#fdba74', '#fb923c', '#fed7aa', '#fff', '#c2410c'],
    top10: ['#93c5fd', '#3b82f6', '#1d4ed8', '#c7d2fe', '#fff'],
    scholarship: ['#c4b5fd', '#8b5cf6', '#ddd6fe', '#fff', '#a78bfa']
};

function launchConfetti(palette, intensity = 80) {
    document.querySelectorAll('.confetti-container').forEach(n => n.remove());
    const container = document.createElement('div');
    container.className = 'confetti-container';
    for (let i = 0; i < intensity; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti';
        piece.style.background = palette[i % palette.length];
        piece.style.left = Math.random() * 100 + '%';
        piece.style.animationDelay = (Math.random() * 0.6) + 's';
        piece.style.animationDuration = (2.2 + Math.random() * 1.8) + 's';
        piece.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
        piece.style.setProperty('--rot', (Math.random() * 720 + 360) + 'deg');
        if (Math.random() > 0.6) piece.classList.add('confetti-round');
        container.appendChild(piece);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 5000);
}

function celebrateFor(rank) {
    if (rank === 1) launchConfetti(CONFETTI_PALETTES.gold, 120);
    else if (rank === 2) launchConfetti(CONFETTI_PALETTES.silver, 100);
    else if (rank === 3) launchConfetti(CONFETTI_PALETTES.bronze, 100);
    else if (rank <= 10) launchConfetti(CONFETTI_PALETTES.top10, 80);
    else if (rank <= 100) launchConfetti(CONFETTI_PALETTES.scholarship, 50);
}

function renderResult(student) {
    const rank = RANK_BY_ROLL[student.roll];
    const prize = getPrizeForRank(rank);
    const percent = Math.round((student.marks / MAX_MARKS) * 100);

    document.getElementById('res-name').textContent = student.name;
    document.getElementById('res-roll').textContent = student.roll;
    document.getElementById('res-father').textContent = student.father;
    document.getElementById('res-class').textContent = student.class;
    document.getElementById('res-mobile').textContent = maskMobile(student.mobile);
    document.getElementById('res-address').textContent = student.address;
    document.getElementById('res-rank').textContent = '#' + rank;
    document.getElementById('res-waiver').textContent = prize.feeWaiver + '%';
    document.getElementById('res-percent').textContent = percent + '% • ' + performanceLabel(percent);

    const bar = document.getElementById('res-bar-fill');
    bar.style.width = '0%';

    const rankEl = document.getElementById('res-rank');
    rankEl.className = 'score-stat-value' + (rank <= 3 ? ' rank-1' : '');

    const badge = document.getElementById('res-badge');
    badge.textContent = prize.badgeText;
    badge.className = 'status-badge ' + prize.badgeClass + (rank <= 3 ? ' shimmer' : '');

    document.getElementById('res-prize-headline').textContent =
        rank <= 100 ? 'Congratulations!' : 'Thank you for participating!';
    document.getElementById('res-prize-hi').innerHTML = prize.prizeHindi;
    document.getElementById('res-prize-en').innerHTML = prize.prizeEnglish;

    updateCelebration(rank, prize);

    document.getElementById('notFound').classList.add('hidden');
    const resultSection = document.getElementById('resultSection');
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(() => {
        animateNumber(document.getElementById('res-marks'), student.marks, 1200);
        bar.style.width = percent + '%';
        celebrateFor(rank);
    }, 350);
}

function showNotFound(roll) {
    document.getElementById('notFoundRoll').textContent = roll;
    document.getElementById('resultSection').classList.add('hidden');
    const nf = document.getElementById('notFound');
    nf.classList.remove('hidden');
    nf.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function handleSearch(e) {
    e.preventDefault();
    const input = document.getElementById('rollInput');
    const roll = input.value.trim();
    if (!roll) { input.focus(); return; }
    const student = STUDENTS.find(s => String(s.roll) === roll);
    if (student) renderResult(student);
    else showNotFound(roll);
}

function resetSearch() {
    document.getElementById('resultSection').classList.add('hidden');
    document.getElementById('notFound').classList.add('hidden');
    const input = document.getElementById('rollInput');
    input.value = '';
    document.querySelector('.hero').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => input.focus(), 400);
}

document.addEventListener('DOMContentLoaded', () => {
    STUDENTS = window.STUDENTS_DATA || [];
    computeRanks();
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
    document.querySelectorAll('[data-action="reset"]').forEach(el => {
        el.addEventListener('click', resetSearch);
    });
});

function getPrizeForRank(rank) {
    if (rank === 1) {
        return {
            rank: 1,
            tier: 'Gold',
            feeWaiver: 100,
            extras: 'Attractive Trophy + Medal',
            badgeClass: 'status-gold',
            badgeText: 'Rank 1 • Gold Tier',
            prizeHindi: 'पूरे साल की 100% स्कूल फीस माफ + आकर्षक ट्रॉफी + मेडल',
            prizeEnglish: 'Full-year 100% School Fee Waiver + Trophy + Medal'
        };
    }
    if (rank === 2) {
        return {
            rank: 2,
            tier: 'Silver',
            feeWaiver: 90,
            extras: 'Trophy + Medal',
            badgeClass: 'status-silver',
            badgeText: 'Rank 2 • Silver Tier',
            prizeHindi: 'पूरे साल की 90% स्कूल फीस माफ + ट्रॉफी + मेडल',
            prizeEnglish: 'Full-year 90% School Fee Waiver + Trophy + Medal'
        };
    }
    if (rank === 3) {
        return {
            rank: 3,
            tier: 'Bronze',
            feeWaiver: 80,
            extras: 'Trophy + Medal',
            badgeClass: 'status-bronze',
            badgeText: 'Rank 3 • Bronze Tier',
            prizeHindi: 'पूरे साल की 80% स्कूल फीस माफ + ट्रॉफी + मेडल',
            prizeEnglish: 'Full-year 80% School Fee Waiver + Trophy + Medal'
        };
    }
    if (rank >= 4 && rank <= 5) {
        return {
            rank,
            tier: 'Top 5',
            feeWaiver: 50,
            extras: 'Trophy + Medal',
            badgeClass: 'status-merit',
            badgeText: `Rank ${rank} • Top 5`,
            prizeHindi: 'पूरे साल की 50% स्कूल फीस माफ + ट्रॉफी + मेडल',
            prizeEnglish: 'Full-year 50% School Fee Waiver + Trophy + Medal'
        };
    }
    if (rank >= 6 && rank <= 10) {
        return {
            rank,
            tier: 'Top 10',
            feeWaiver: 30,
            extras: 'Trophy + Medal',
            badgeClass: 'status-merit',
            badgeText: `Rank ${rank} • Top 10`,
            prizeHindi: 'पूरे साल की 30% स्कूल फीस माफ + ट्रॉफी + मेडल',
            prizeEnglish: 'Full-year 30% School Fee Waiver + Trophy + Medal'
        };
    }
    if (rank >= 11 && rank <= 100) {
        return {
            rank,
            tier: 'Scholarship',
            feeWaiver: 10,
            extras: 'Scholarship Certificate',
            badgeClass: 'status-scholarship',
            badgeText: `Rank ${rank} • Scholarship`,
            prizeHindi: 'पूरे साल की 10% स्कूल फीस माफ (Scholarship Certificate)',
            prizeEnglish: 'Full-year 10% School Fee Waiver (Scholarship Certificate)'
        };
    }
    return {
        rank,
        tier: 'Participated',
        feeWaiver: 0,
        extras: 'Participation Certificate',
        badgeClass: 'status-merit',
        badgeText: `Rank ${rank} • Participated`,
        prizeHindi: 'प्रतियोगिता में भाग लेने का प्रमाण पत्र',
        prizeEnglish: 'Certificate of Participation'
    };
}
