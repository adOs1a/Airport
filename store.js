// store.js — Единое хранилище, авто-статусы и синхронизация

const STORAGE_KEY_FLIGHTS = 'fids_flights_data';
const STORAGE_KEY_AUTH = 'fids_current_user';
const STORAGE_KEY_TICKER = 'fids_ticker_text';

// Диспетчеры
const OPERATORS = [
  { login: 'dispatcher1', pass: 'fly123', name: 'Иванов А. В.' },
  { login: 'dispatcher2', pass: 'tower456', name: 'Петрова Е. С.' },
  { login: 'admin', pass: 'admin', name: 'Главный диспетчер' }
];

// Текст бегущей строки по умолчанию
const DEFAULT_TICKER = 'Уважаемые пассажиры! Не оставляйте свои вещи без присмотра. Посадка на рейс заканчивается за 20 минут до вылета. Желаем вам приятного полёта!';

// Логотипы авиакомпаний
function getAirlineBadge(airlineName) {
  const name = airlineName.toLowerCase();
  if (name.includes('аэрофлот') || name.includes('aeroflot')) {
    return `<span class="airline-logo logo-aeroflot" title="Аэрофлот">SU</span>`;
  } else if (name.includes('s7')) {
    return `<span class="airline-logo logo-s7" title="S7 Airlines">S7</span>`;
  } else if (name.includes('победа') || name.includes('pobeda')) {
    return `<span class="airline-logo logo-pobeda" title="Победа">DP</span>`;
  } else if (name.includes('utair') || name.includes('ютейр')) {
    return `<span class="airline-logo logo-utair" title="Utair">UT</span>`;
  } else if (name.includes('урал') || name.includes('ural')) {
    return `<span class="airline-logo logo-ural" title="Уральские авиалинии">U6</span>`;
  }
  return `<span class="airline-logo logo-default">✈</span>`;
}

// Тестовые рейсы
const INITIAL_FLIGHTS = [
  { id: '1', type: 'departure', time: '14:30', flight: 'SU 102', city: 'Москва (SVO)', airline: 'Аэрофлот', gate: 'A12', status: 'По расписанию', statusClass: 'status-on-time', auto: true },
  { id: '2', type: 'departure', time: '15:00', flight: 'S7 204', city: 'Новосибирск', airline: 'S7 Airlines', gate: 'B04', status: 'По расписанию', statusClass: 'status-on-time', auto: true },
  { id: '3', type: 'departure', time: '15:45', flight: 'DP 440', city: 'Сочи (AER)', airline: 'Победа', gate: 'A08', status: 'Задержан до 16:30', statusClass: 'status-delayed', auto: false },
  { id: '4', type: 'departure', time: '16:10', flight: 'U6 280', city: 'Екатеринбург', airline: 'Уральские авиалинии', gate: 'B02', status: 'По расписанию', statusClass: 'status-on-time', auto: true },
  { id: '5', type: 'arrival', time: '14:15', flight: 'SU 115', city: 'Санкт-Петербург', airline: 'Аэрофлот', gate: 'Выход 1', status: 'Совершил посадку', statusClass: 'status-departed', auto: true },
  { id: '6', type: 'arrival', time: '15:10', flight: 'UT 380', city: 'Сургут', airline: 'Utair', gate: 'Выход 2', status: 'Ожидается', statusClass: 'status-on-time', auto: true }
];

function getFlights() {
  const data = localStorage.getItem(STORAGE_KEY_FLIGHTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEY_FLIGHTS, JSON.stringify(INITIAL_FLIGHTS));
    return INITIAL_FLIGHTS;
  }
  return JSON.parse(data);
}

function saveFlights(flights) {
  localStorage.setItem(STORAGE_KEY_FLIGHTS, JSON.stringify(flights));
}

// Функции для бегущей строки
function getTickerText() {
  return localStorage.getItem(STORAGE_KEY_TICKER) || DEFAULT_TICKER;
}

function saveTickerText(text) {
  localStorage.setItem(STORAGE_KEY_TICKER, text);
}

// Автоматический пересчет статуса рейса по текущему времени
function calculateAutoStatus(flight) {
  if (flight.auto === false) return flight;

  const now = new Date();
  const [fHours, fMinutes] = flight.time.split(':').map(Number);
  
  const flightTime = new Date();
  flightTime.setHours(fHours, fMinutes, 0, 0);

  const diffMinutes = Math.floor((flightTime - now) / 60000);

  let newStatus = flight.status;
  let newClass = flight.statusClass;

  if (flight.type === 'departure') {
    if (diffMinutes < 0) {
      newStatus = 'Вылетел';
      newClass = 'status-departed';
    } else if (diffMinutes <= 15) {
      newStatus = 'Посадка окончена';
      newClass = 'status-delayed';
    } else if (diffMinutes <= 40) {
      newStatus = 'Посадка';
      newClass = 'status-boarding';
    } else if (diffMinutes <= 120) {
      newStatus = 'Регистрация';
      newClass = 'status-on-time';
    } else {
      newStatus = 'По расписанию';
      newClass = 'status-on-time';
    }
  } else {
    if (diffMinutes < 0) {
      newStatus = 'Совершил посадку';
      newClass = 'status-departed';
    } else if (diffMinutes <= 30) {
      newStatus = 'Прибывает';
      newClass = 'status-boarding';
    } else {
      newStatus = 'Ожидается';
      newClass = 'status-on-time';
    }
  }

  return { ...flight, status: newStatus, statusClass: newClass };
}

// Фоновое обновление статусов
function runStatusEngine(callback) {
  const check = () => {
    let flights = getFlights();
    let changed = false;

    flights = flights.map(f => {
      const updated = calculateAutoStatus(f);
      if (updated.status !== f.status) {
        changed = true;
      }
      return updated;
    });

    if (changed) {
      saveFlights(flights);
      if (callback) callback();
    }
  };

  check();
  setInterval(check, 30000);
}

// Авторизация
function loginDispatcher(login, pass) {
  const operator = OPERATORS.find(op => op.login === login && op.pass === pass);
  if (operator) {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify({ name: operator.name, login: operator.login }));
    return true;
  }
  return false;
}

function getCurrentUser() {
  const u = localStorage.getItem(STORAGE_KEY_AUTH);
  return u ? JSON.parse(u) : null;
}

function logoutDispatcher() {
  localStorage.removeItem(STORAGE_KEY_AUTH);
}

function startClock(clockElementId) {
  const el = document.getElementById(clockElementId);
  if (!el) return;
  const update = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('ru-RU');
  };
  setInterval(update, 1000);
  update();
}