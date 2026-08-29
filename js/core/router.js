// ============================================================
// MAPEL - router.js
// MAPEL bukan SPA murni -- tiap role punya file .html sendiri
// (multi-page). router.js jalan di SETIAP halaman lewat main.js
// dan tugasnya:
//   1. Guard: pastikan yang buka halaman ini sudah login &
//      memang berhak akses halaman ini (sesuai role-nya).
//   2. Nyediain helper navigate() buat pindah halaman dari JS.
//
// Rendering konten halaman (dashboard, monitoring, dst) akan
// di-handle modul di js/pages/*.js pada tahap berikutnya --
// router.js cuma nyiapin "gerbang"-nya di sini.
// ============================================================

import { auth } from './auth.js';
import { roleService } from './role.js';

const LOGIN_PATH = '/pages/auth/login.html';
const ROOT_PATHS = ['/', '/index.html'];

/** Samain path relatif ('../../pages/x.html') jadi absolut dari root situs. */
function getCurrentPath() {
  return window.location.pathname;
}

function isLoginPage(pathname) {
  return pathname.endsWith(LOGIN_PATH);
}

function isRootPage(pathname) {
  return ROOT_PATHS.some((p) => pathname.endsWith(p)) || pathname === '';
}

/**
 * Hitung path relatif dari halaman saat ini ke root situs,
 * supaya redirect tetap benar walau halamannya nested
 * (misal /pages/lo-biro-ti/antrian/proposal-pl.html).
 */
function pathToRoot() {
  const segments = getCurrentPath().split('/').filter(Boolean);
  // -1 karena segmen terakhir adalah nama file, bukan folder
  const depth = Math.max(segments.length - 1, 0);
  return depth === 0 ? './' : '../'.repeat(depth);
}

/** Pindah halaman. `absolutePath` diawali '/', misal '/pages/pegawai/dashboard.html'. */
function navigate(absolutePath) {
  const cleanPath = absolutePath.replace(/^\//, '');
  window.location.href = pathToRoot() + cleanPath;
}

/**
 * Jalankan proteksi akses untuk halaman TERPROTEKSI (bukan
 * login, bukan index). Panggil ini paling awal, sebelum render
 * apa pun ke #app.
 * @returns {Session|null} user yang lolos guard, atau null kalau di-redirect
 */
function guard() {
  const pathname = getCurrentPath();
  const user = auth.getCurrentUser();

  // Halaman index.html cuma jadi "gerbang": lempar ke login atau dashboard.
  if (isRootPage(pathname)) {
    navigate(user ? roleService.getDefaultRoute(user.role) : LOGIN_PATH);
    return null;
  }

  if (!user) {
    navigate(LOGIN_PATH);
    return null;
  }

  // Sudah login tapi buka halaman di luar folder role-nya sendiri.
  if (!roleService.canAccessPath(user.role, pathname)) {
    navigate(roleService.getDefaultRoute(user.role));
    return null;
  }

  return user;
}

/**
 * Guard khusus halaman login (publik). Kalau ternyata user
 * sudah login, lempar ke dashboard-nya alih-alih nampilin form
 * login lagi.
 * @returns {boolean} true kalau boleh lanjut render form login
 */
function guardLoginPage() {
  const user = auth.getCurrentUser();
  if (!user) return true;

  const target = roleService.getDefaultRoute(user.role);

  // Kalau role di sesi ternyata tidak valid, getDefaultRoute() akan
  // fallback ke LOGIN_PATH -- yaitu halaman yang sedang kita buka
  // sekarang. Kalau ini di-navigate() begitu saja, hasilnya reload
  // ke diri sendiri terus-menerus (loop tak berhenti). Jadi di
  // sini kita anggap sesi itu rusak, hapus, lalu render form login
  // seperti biasa.
  if (target === LOGIN_PATH) {
    auth.logout();
    return true;
  }

  navigate(target);
  return false;
}

export const router = { guard, guardLoginPage, navigate, getCurrentPath, isLoginPage, pathToRoot };