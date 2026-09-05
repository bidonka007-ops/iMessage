const form = document.getElementById('message-form');
const input = document.getElementById('board-input');
const messages = document.getElementById('messages');

// Инициализируем массив для хранения истории из localStorage
let chatHistory = JSON.parse(localStorage.getItem('imessage_history')) || [];

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

// Функция только для отрисовки сообщения в интерфейсе
function createMessageRow(text, type) {
  const row = document.createElement('div');
  row.className = `message-row ${type}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = text;

  row.appendChild(bubble);
  messages.appendChild(row);
  scrollToBottom();
}

// Новая функция для сохранения сообщения в память браузера
function saveMessage(text, type) {
  chatHistory.push({ text, type });
  localStorage.setItem('imessage_history', JSON.stringify(chatHistory));
}

// Функция для загрузки истории при открытии страницы
function loadHistory() {
  if (chatHistory.length > 0) {
    // Если история есть, отрисовываем все сохраненные сообщения
    chatHistory.forEach(msg => {
      createMessageRow(msg.text, msg.type);
    });
  } else {
    // Если истории нет, показываем демо-сообщение и сразу сохраняем его
    renderDemoConversation();
  }
}

function sanitizeBoardNumber(value) {
  // Разрешаем вводить цифры, убрали жесткое ограничение в 6 символов, 
  // чтобы пользователь мог ввести 5 цифр (и не получить билет из-за ошибки).
  return value.replace(/\D/g, '');
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatTime(date) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function createRandomTicketNumber() {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

function buildSystemReply(boardNumber, overrideDate = null) {
  const now = overrideDate || new Date();
  const ticketNumber = createRandomTicketNumber();
  const currentDate = formatDate(now);
  const currentTime = formatTime(now);

  return [
    `Electronic ticket nr.${ticketNumber}`,
    `Date ${currentDate} hour ${currentTime}`,
    'Valid 1 hour',
    'Price 7 MDL',
    `Board number ${boardNumber}`,
  ].join('\n');
}

function sendMessage() {
  const rawValue = input.value.trim();
  const boardNumber = sanitizeBoardNumber(rawValue);

  if (!boardNumber) {
    input.focus();
    input.placeholder = 'Введите номер транспорта';
    return;
  }

  // Пользователь отправляет сообщение (синий баббл) в любом случае
  createMessageRow(boardNumber, 'outgoing');
  saveMessage(boardNumber, 'outgoing'); // Сохраняем отправленный номер

  // ЛОГИКА ВЫДАЧИ БИЛЕТА: 
  // Билет выдается ТОЛЬКО если длина номера равна ровно 4 цифрам.
  // Если введено 3 цифры ("123") или 5 цифр ("12345") - ответа от системы не будет.
  // Чтобы получить билет для "123", нужно ввести "0123" (длина станет 4).
  if (boardNumber.length === 4) {
    // Simulate a small operator/system response delay.
    window.setTimeout(() => {
      const reply = buildSystemReply(boardNumber);
      createMessageRow(reply, 'incoming');
      saveMessage(reply, 'incoming'); // Сохраняем полученный билет
    }, 700);
  }

  input.value = '';
  input.placeholder = 'Текстовое сообщение • SMS';
  input.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  sendMessage();
});

input.addEventListener('input', () => {
  const sanitized = sanitizeBoardNumber(input.value);
  if (input.value !== sanitized) {
    input.value = sanitized;
  }
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    sendMessage();
  }
});

// Запускаем загрузку истории при старте скрипта
loadHistory();