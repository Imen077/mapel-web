// ============================================================
// MAPEL - auth.js
// Login/logout & session management. Karena prototype tanpa
// backend, "login" cuma cocokin username/password ke daftar
// user di storage (hasil seed dari data/users.js).
// ============================================================

import { storage, STORAGE_KEYS } from './storage.js';

/**
 * @typedef {Object} Session
 * @property {string} userId
 * @property {string} username
 * @property {string} name
 * @property {string} role
 * @property {number} loginAt
 */

/**
 * @param {string} username
 * @param {string} password
 * @returns {{ok: true, user: Session} | {ok: false, message: string}}
 */
function login(username, password) {
  const users = storage.read(STORAGE_KEYS.USERS, []);
  const trimmedUsername = (username || '').trim();

  const found = users.find(
    (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
  );

  if (!found) {
    return { ok: false, message: 'Username tidak ditemukan.' };
  }
  if (found.password !== password) {
    return { ok: false, message: 'Password salah.' };
  }

  const session = {
    userId: found.id,
    username: found.username,
    name: found.name,
    role: found.role,
    loginAt: Date.now()
  };

  storage.write(STORAGE_KEYS.SESSION, session);
  return { ok: true, user: session };
}

function logout() {
  storage.remove(STORAGE_KEYS.SESSION);
}

/** @returns {Session | null} */
function getCurrentUser() {
  return storage.read(STORAGE_KEYS.SESSION, null);
}

function isAuthenticated() {
  return getCurrentUser() !== null;
}

export const auth = { login, logout, getCurrentUser, isAuthenticated };