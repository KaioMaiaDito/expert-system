/**
 * helpers.js
 * Uma coleção de funções utilitárias para tarefas comuns.
 */

/**
 * Formata uma data no formato 'YYYY-MM-DD HH:MM:SS' no fuso horário UTC.
 * @param {Date} date - A data a ser formatada; padrão é a data atual.
 * @returns {string} - Data formatada como string.
 */
function formatUTCDate(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Registra uma mensagem no console com um timestamp em UTC.
 * @param {string} message - A mensagem para registrar.
 */
function logWithTimestamp(message) {
  console.log(`[${formatUTCDate()}] ${message}`);
}

/**
 * Realiza uma cópia profunda (deep clone) de um objeto ou array.
 * @param {object|Array} obj - Objeto ou array a ser clonado.
 * @returns {object|Array} - Uma cópia profunda do objeto ou array.
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Gera um identificador único baseado no timestamp e um número aleatório.
 * @returns {string} - Um identificador único.
 */
function generateUniqueId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

module.exports = {
  formatUTCDate,
  logWithTimestamp,
  deepClone,
  generateUniqueId,
};
