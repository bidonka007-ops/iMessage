// iMessage-style chat mock for public transport ticket purchase.
// The app accepts only a numeric bus/board number, sends it as a blue message,
// then automatically returns a system message with the generated ticket data.

const form = document.getElementById('message-form');
const input = document.getElementById('board-input');
const messages = document.getElementById('messages');

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

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

function sanitizeBoardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 6);
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

function renderDemoConversation() {
  const boardNumber = '1234';
  createMessageRow(boardNumber, 'outgoing');

  const demoDate = new Date(2026, 8, 5, 12, 15);
  createMessageRow(buildSystemReply(boardNumber, demoDate), 'incoming');
}

function sendMessage() {
  const rawValue = input.value.trim();
  const boardNumber = sanitizeBoardNumber(rawValue);

  if (!boardNumber) {
    input.focus();
    input.placeholder = 'Введите номер транспорта';
    return;
  }

  // User's message: blue bubble with only the board number.
  createMessageRow(boardNumber, 'outgoing');

  // Simulate a small operator/system response delay.
  window.setTimeout(() => {
    createMessageRow(buildSystemReply(boardNumber), 'incoming');
  }, 700);

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

renderDemoConversation();
