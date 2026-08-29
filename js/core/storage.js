// ============================================================
// MAPEL - storage.js
// Wrapper tipis di atas localStorage. Semua modul lain WAJIB
// baca/tulis data lewat file ini, jangan panggil localStorage
// langsung supaya key & error handling-nya konsisten.
// ============================================================

export const STORAGE_KEYS = {
  USERS: 'mapel_users',
  SESSION: 'mapel_session',
  PROPOSALS: 'mapel_proposals',
  KONSEP: 'mapel_konsep',
  WORKFLOW: 'mapel_workflow',
  NOTIFICATIONS: 'mapel_notifications',
  SEED_VERSION: 'mapel_seed_version'
};

// Naikkan angka ini kalau struktur data seed berubah,
// biar seed lama ke-replace otomatis pas user buka lagi.
const CURRENT_SEED_VERSION = 3;

function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (err) {
    console.error(`[storage] Gagal membaca key "${key}":`, err);
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[storage] Gagal menyimpan key "${key}":`, err);
    return false;
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`[storage] Gagal menghapus key "${key}":`, err);
    return false;
  }
}

function clearAll() {
  Object.values(STORAGE_KEYS).forEach(remove);
}

/**
 * Seed data awal (users, dsb). Dipanggil sekali tiap app.js init.
 * Kalau data sudah pernah di-seed dengan versi yang sama, tidak
 * akan menimpa data yang sudah diubah user (misal status proposal).
 * @param {Object} seedMap - { [STORAGE_KEYS.X]: dataAwal }
 */
function seed(seedMap) {
  const seededVersion = read(STORAGE_KEYS.SEED_VERSION, 0);
  const alreadySeeded = seededVersion === CURRENT_SEED_VERSION;

  Object.entries(seedMap).forEach(([key, initialValue]) => {
    const existing = read(key, undefined);
    if (existing === undefined || !alreadySeeded) {
      write(key, initialValue);
    }
  });

  if (!alreadySeeded) {
    write(STORAGE_KEYS.SEED_VERSION, CURRENT_SEED_VERSION);
  }
}

export const storage = { read, write, remove, clearAll, seed };