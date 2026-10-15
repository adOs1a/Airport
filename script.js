// Тестовая база рейсов
const flights = [
  { type: 'departure', time: '14:30', flight: 'SU 102', destination: 'Москва (SVO)', airline: 'Аэрофлот', gate: 'A12', status: 'Посадка', statusClass: 'status-boarding' },
  { type: 'departure', time: '15:00', flight: 'S7 204', destination: 'Новосибирск', airline: 'S7 Airlines', gate: 'B04', status: 'Регистрация', statusClass: 'status-on-time' },
  { type: 'departure', time: '15:45', flight: 'DP 440', destination: 'Сочи (AER)', airline: 'Победа', gate: 'A08', status: 'Задержан до 16:30', statusClass: 'status-delayed' },
  { type: 'arrival', time: '14:15', flight: 'SU 115', destination: 'Санкт-Петербург', airline: 'Аэрофлот', gate: 'Выход 1', status: 'Совершил посадку', statusClass: 'status-departed' },
  { type: 'arrival', time: '15:10', flight: 'UT 380', destination: 'Сургут', airline: 'Utair', gate: 'Выход 2', status: 'Ожидается', statusClass: 'status-on-time' }
];

let currentMode = 'departure'; // Текущий режим: вылет или прилет

// Функция живых часов
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('ru-RU');
  document.getElementById('current-time').textContent = timeString;
}
setInterval(updateClock, 1000);
updateClock();

// Функция отрисовки таблицы
function renderFlights() {
  const tbody = document.getElementById('flights-body');
  tbody.innerHTML = '';

  const filteredFlights = flights.filter(f => f.type === currentMode);

  filteredFlights.forEach(flight => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${flight.time}</td>
      <td><strong>${flight.flight}</strong></td>
      <td>${flight.destination}</td>
      <td>${flight.airline}</td>
      <td>${flight.gate}</td>
      <td class="${flight.statusClass}">${flight.status}</td>
    `;
    tbody.appendChild(row);
  });
}

// Настройка переключателей "Вылет" / "Прилет"
const btnDep = document.getElementById('btn-departures');
const btnArr = document.getElementById('btn-arrivals');

btnDep.addEventListener('click', () => {
  currentMode = 'departure';
  btnDep.classList.add('active');
  btnArr.classList.remove('active');
  renderFlights();
});

btnArr.addEventListener('click', () => {
  currentMode = 'arrival';
  btnArr.classList.add('active');
  btnDep.classList.remove('active');
  renderFlights();
});

// Первичная отрисовка при загрузке
renderFlights();