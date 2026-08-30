// ============================================================
// MAPEL - core/format.js
// Helper format tanggal/angka yang dipakai berulang di berbagai
// halaman (Monitoring, Antrian, Detail, dst) -- disatukan di
// sini biar formatnya konsisten di seluruh app.
// ============================================================

/**
 * Format tanggal panjang ala Indonesia, mis. "Selasa, 21 Juli 2026".
 * @param {string|number|Date} dateInput - ISO string ('2026-07-21'), timestamp, atau Date
 */
export function formatDateLongID(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '-';

  const formatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);

  // Kapitalkan huruf pertama tiap kata (Intl id-ID kadang lowercase nama hari/bulan).
  return formatted.replace(/\b\p{L}/gu, (ch) => ch.toUpperCase());
}

/** @param {string|number|Date} dateInput */
export function getYear(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.getFullYear();
}

/**
 * Format tanggal + jam ala Indonesia, mis. "24 Juli 2026, 00.00".
 * Dipakai tabel Antrian yang butuh presisi jam (beda dari
 * formatDateLongID yang cuma tanggal, tanpa nama hari). Kalau
 * dateInput cuma tanggal tanpa komponen jam (mis. data dummy
 * '2026-07-24'), jamnya otomatis tampil 00.00.
 * @param {string|number|Date} dateInput
 */
export function formatDateTimeLongID(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '-';

  const datePart = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);

  const timePart = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);

  const capitalized = datePart.replace(/\b\p{L}/gu, (ch) => ch.toUpperCase());
  return `${capitalized}, ${timePart.replace(':', '.')}`;
}

/**
 * Format tanggal + nama hari + jam:menit:detik lengkap, mis.
 * "Jumat, 05 Juni 2026 16:11:29". Beda dari formatDateTimeLongID
 * (dipakai Antrian Konsep PL, cuma jam:menit + titik) -- Antrian
 * Proposal PL butuh presisi detik & nama hari sesuai desain yang
 * sudah disepakati. Jam dibangun manual (bukan lewat Intl) supaya
 * separatornya pasti titik dua, bukan titik.
 * @param {string|number|Date} dateInput
 */
export function formatDateTimeFullID(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '-';

  const datePart = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
  const capitalized = datePart.replace(/\b\p{L}/gu, (ch) => ch.toUpperCase());

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${capitalized} ${hh}:${mm}:${ss}`;
}