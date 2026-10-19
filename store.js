// Ключи для localStorage
const STORAGE_KEY_FLIGHTS = 'airport_flights_data';
const STORAGE_KEY_TICKER = 'airport_ticker_data';
const STORAGE_KEY_AUTH = 'airport_auth_session';

// Текст по умолчанию для бегущей строки
const DEFAULT_TICKER = "Уважаемые пассажиры! Регистрация на рейсы заканчивается за 40 минут до времени вылета по расписанию. Не оставляйте свои вещи без присмотра.";

// Векторные SVG-логотипы авиакомпаний (автономные, без внешних ссылок)
const AIRLINE_SVGS = {
  'аэрофлот': `
    <svg class="airline-logo-img" viewBox="0 0 160 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 22 C25 8, 45 6, 75 14 C55 13, 35 15, 20 25 Z" fill="#0055a5"/>
      <path d="M18 20 C32 10, 52 9, 82 16 C60 16, 42 18, 28 27 Z" fill="#e31b23"/>
      <circle cx="28" cy="18" r="4" fill="#ffd700"/>
      <text x="50" y="24" fill="#ffffff" font-size="14" font-weight="900" letter-spacing="1.5" font-family="Arial, sans-serif">АЭРОФЛОТ</text>
    </svg>`,
  's7': `
    <svg class="airline-logo-img" viewBox="0 0 140 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="14" fill="#c4d600"/>
      <text x="18" y="23" fill="#004831" font-size="14" font-weight="900" text-anchor="middle" font-family="Arial, sans-serif">S7</text>
      <text x="42" y="24" fill="#c4d600" font-size="15" font-weight="800" font-family="Arial, sans-serif">AIRLINES</text>
    </svg>`,
  'победа': `
    <svg class="airline-logo-img" viewBox="0 0 140 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="18" r="4" fill="#0080ff"/>
      <circle cx="26" cy="18" r="4" fill="#0080ff"/>
      <circle cx="38" cy="18" r="4" fill="#0080ff"/>
      <text x="48" y="24" fill="#00a8e8" font-size="16" font-weight="900" font-family="Arial, sans-serif">ПОБЕДА</text>
    </svg>`,
  'уральские авиалинии': `
    <svg class="airline-logo-img" viewBox="0 0 160 36" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,26 28,10 40,26" fill="#003399"/>
      <polygon points="24,26 36,14 46,26" fill="#cc0000"/>
      <text x="52" y="23" fill="#ffffff" font-size="13" font-weight="800" font-family="Arial, sans-serif">URAL AIR</text>
    </svg>`,
  'ютэйр': `
    <svg class="airline-logo-img" viewBox="0 0 140 36" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 10 L22 10 L22 20 C22 24 18 26 12 26 Z" fill="#003399"/>
      <path d="M26 10 L36 10 L36 26 L26 26 Z" fill="#003399"/>
      <text x="42" y="24" fill="#003399" font-size="16" font-weight="900" font-family="Arial, sans-serif" style="filter: drop-shadow(0 0 1px #fff);">UTAIR</text>
    </svg>`
};

// Функция отрисовки SVG-логотипа без текстового названия
function getAirlineLogoHTML(airlineName) {
  if (!airlineName) return '-';
  const clean = airlineName.toLowerCase().trim();

  for (const key in AIRLINE_SVGS) {
    if (clean.includes(key) || key.includes(clean)) {
      return AIRLINE_SVGS[key];
    }
  }
  return `<span class="airline-badge-fallback">${airlineName}</span>`;
}

// Начальный массив рейсов с секторами, стойками и окном регистрации
const INITIAL_FLIGHTS = [
  {
    id: 'f1',
    type: 'departure',
    time: '14:30',
    flight: 'SU 102',
    city: 'Москва (SVO)',
    airline: 'Аэрофлот',
    sector: 'B',
    checkinDesks: '11–18',
    checkinTime: '12:00–13:50',
    gate: 'B01',
    status: 'Вылетел',
    statusClass: 'status-departed',
    auto: true
  },
  {
    id: 'f2',
    type: 'departure',
    time: '15:00',
    flight: 'S7 204',
    city: 'Новосибирск',
    airline: 'S7 Airlines',
    sector: 'A',
    checkinDesks: '01–06',
    checkinTime: '12:30–14:20',
    gate: 'A03',
    status: 'Вылетел',
    statusClass: 'status-departed',
    auto: true
  },
  {
    id: 'f3',
    type: 'departure',
    time: '15:45',
    flight: 'DP 440',
    city: 'Сочи (AER)',
    airline: 'Победа',
    sector: 'A',
    checkinDesks: '07–10',
    checkinTime: '13:15–15:05',
    gate: 'A05',
    status: 'Задержан до 16:30',
    statusClass: 'status-delayed',
    auto: false
  },
  {
    id: 'f4',
    type: 'departure',
    time: '23:55',
    flight: 'U6 280',
    city: 'Екатеринбург',
    airline: 'Уральские Авиалинии',
    sector: 'C',
    checkinDesks: '21–25',
    checkinTime: '21:30–23:15',
    gate: 'C02',
    status: 'Посадка',
    statusClass: 'status-boarding',
    auto: true
  },
  {
    id: 'f5',
    type: 'arrival',
    time: '14:15',
    flight: 'SU 115',
    city: 'Санкт-Петербург',
    airline: 'Аэрофлот',
    sector: 'A',
    checkinDesks: '-',
    checkinTime: '-',
    gate: 'Лента 1',
    status: 'Совершил посадку',
    statusClass: 'status-arrived',
    auto: true
  },
  {
    id: 'f6',
    type: 'arrival',
    time: '23:45',
    flight: 'UT 380',
    city: 'Сургут',
    airline: 'ЮТэйр',
    sector: 'B',
    checkinDesks: '-',
    checkinTime: '-',
    gate: 'Лента 2',
    status: 'Ожидается',
    statusClass: 'status-scheduled',
    auto: true
  }
];

// 1. Получение рейсов с автоматической инициализацией
function getFlights() {
  const data = localStorage.getItem(STORAGE_KEY_FLIGHTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_FLIGHTS, JSON.stringify(INITIAL_FLIGHTS));
    return INITIAL_FLIGHTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_FLIGHTS;
  }
}

// 2. Сохранение рейсов в localStorage
function saveFlights(flights) {
  localStorage.setItem(STORAGE_KEY_FLIGHTS, JSON.stringify(flights));
}

// 3. Получение и сохранение текста бегущей строки (с защитой от null)
function getTickerText() {
  const data = localStorage.getItem(STORAGE_KEY_TICKER);
  if (!data || data.trim() === '') {
    localStorage.setItem(STORAGE_KEY_TICKER, DEFAULT_TICKER);
    return DEFAULT_TICKER;
  }
  return data;
}

function saveTickerText(text) {
  localStorage.setItem(STORAGE_KEY_TICKER, text);
}

// 4. Алгоритм авто-расчета статусов рейсов
function recalculateAutoStatuses(flights) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  let modified = false;

  const updated = flights.map(flight => {
    if (flight.auto === false) return flight;
    if (!flight.time || !flight.time.includes(':')) return flight;

    const [fHours, fMinutes] = flight.time.split(':').map(Number);
    const flightTotalMinutes = fHours * 60 + fMinutes;
    const delta = flightTotalMinutes - currentMinutes;

    const isDep = isDepartureType(flight.type);
    let newStatus = flight.status;
    let newClass = flight.statusClass;

    if (isDep) {
      if (delta > 120) {
        newStatus = 'По расписанию';
        newClass = 'status-scheduled';
      } else if (delta > 40) {
        newStatus = 'Регистрация';
        newClass = 'status-checkin';
      } else if (delta > 15) {
        newStatus = 'Посадка';
        newClass = 'status-boarding';
      } else if (delta > 0) {
        newStatus = 'Посадка окончена';
        newClass = 'status-closed';
      } else {
        newStatus = 'Вылетел';
        newClass = 'status-departed';
      }
    } else {
      if (delta > 30) {
        newStatus = 'По расписанию';
        newClass = 'status-scheduled';
      } else if (delta > 0) {
        newStatus = 'Ожидается';
        newClass = 'status-boarding';
      } else {
        newStatus = 'Совершил посадку';
        newClass = 'status-arrived';
      }
    }

    if (newStatus !== flight.status || newClass !== flight.statusClass) {
      modified = true;
      return { ...flight, status: newStatus, statusClass: newClass };
    }
    return flight;
  });

  if (modified) saveFlights(updated);
  return updated;
}

function isDepartureType(type) {
  const t = String(type).toLowerCase().trim();
  return t === 'departure' || t === 'вылет';
}

function isArrivalType(type) {
  const t = String(type).toLowerCase().trim();
  return t === 'arrival' || t === 'прилет' || t === 'прилёт';
}

// 5. Отрисовка табло (departures.html и arrivals.html)
function renderBoard(boardType) {
  const tableBody = document.getElementById('flightsTableBody');
  if (!tableBody) return;

  let flights = getFlights();
  flights = recalculateAutoStatuses(flights);

  const isDep = boardType === 'departure';
  const filtered = flights.filter(f => isDep ? isDepartureType(f.type) : isArrivalType(f.type));
  filtered.sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  tableBody.innerHTML = '';
  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="${isDep ? 9 : 6}" style="text-align:center; padding:30px; color:#8b949e;">Рейсов не найдено</td></tr>`;
    return;
  }

  filtered.forEach(flight => {
    const tr = document.createElement('tr');
    const logoHtml = getAirlineLogoHTML(flight.airline);

    if (isDep) {
      tr.innerHTML = `
        <td class="time-col">${flight.time || '--:--'}</td>
        <td class="flight-col">${flight.flight || ''}</td>
        <td class="airline-logo-cell">${logoHtml}</td>
        <td class="city-col">${flight.city || ''}</td>
        <td class="sector-col">${flight.sector || 'A'}</td>
        <td>${flight.checkinDesks || '11–18'}</td>
        <td class="checkin-col">${flight.checkinTime || '--:--'}</td>
        <td>${flight.gate || '-'}</td>
        <td><span class="status-badge ${flight.statusClass || ''}">${flight.status || 'По расписанию'}</span></td>
      `;
    } else {
      tr.innerHTML = `
        <td class="time-col">${flight.time || '--:--'}</td>
        <td class="flight-col">${flight.flight || ''}</td>
        <td class="airline-logo-cell">${logoHtml}</td>
        <td class="city-col">${flight.city || ''}</td>
        <td>${flight.gate || 'Лента 1'}</td>
        <td><span class="status-badge ${flight.statusClass || ''}">${flight.status || 'По расписанию'}</span></td>
      `;
    }
    tableBody.appendChild(tr);
  });

  updateTickerDisplay();
}

// 6. Обновление текста бегущей строки
function updateTickerDisplay() {
  const tickerEl = document.getElementById('tickerText');
  if (tickerEl) {
    tickerEl.textContent = getTickerText();
  }
}

// 7. Часы в реальном времени
function startClock() {
  const clockEl = document.getElementById('clock');
  function update() {
    if (clockEl) clockEl.textContent = new Date().toLocaleTimeString('ru-RU');
  }
  update();
  setInterval(update, 1000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  updateTickerDisplay();
});

// Синхронизация между вкладками при изменении данных
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY_FLIGHTS || e.key === STORAGE_KEY_TICKER) {
    const p = window.location.pathname.toLowerCase();
    if (p.includes('departures')) renderBoard('departure');
    if (p.includes('arrivals')) renderBoard('arrival');
    if (typeof renderAdminTable === 'function') renderAdminTable();
  }
});

// Периодический пересчет статусов каждую минуту
setInterval(() => {
  const p = window.location.pathname.toLowerCase();
  if (p.includes('departures')) renderBoard('departure');
  if (p.includes('arrivals')) renderBoard('arrival');
}, 60000);

// =========================================================
// КРИПТОГРАФИЧЕСКАЯ ЗАЩИТА ДИСПЕТЧЕРОВ (SHA-256)
// =========================================================
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_salt_airport_2024");
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}