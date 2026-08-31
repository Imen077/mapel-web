// ============================================================
// MAPEL - app.js
// Orkestrasi startup: seed data awal -> jalankan guard router.
// Rendering shell (navbar/sidebar) & konten halaman akan
// disambungkan di sini pada tahap-tahap berikutnya, setelah
// js/pages/*.js dan js/components/* diisi.
// ============================================================

import { storage, STORAGE_KEYS } from './storage.js';
import { router } from './router.js';
import { SEED_USERS } from '../../data/users.js';
import { sidebar } from '../components/sidebar/sidebar-pegawai.js';
import { navbar } from '../components/navbar.js';

// Peta path halaman -> modul js/pages yang tahu cara render kontennya.
// Cukup daftarkan di sini tiap kali sebuah halaman baru diisi (tidak
// lagi placeholder), tidak perlu ubah router.js atau app.js lainnya.
const PAGE_MODULES = {
  dashboard: () => import('../pages/dashboard.js'),
  'antrian/proposal-pl': () => import('../pages/antrian.js'),
  'antrian/konsep-pl': () => import('../pages/antrian.js'),
  'monitoring/proposal-pl': () => import('../pages/monitoring.js'),
  'monitoring/konsep-pl': () => import('../pages/monitoring.js'),
  'pengajuan/proposal-pl': () => import('../pages/pengajuan-proposal.js'),
  pengaturan: () => import('../pages/pengaturan.js')
};

// Breadcrumb navbar per pageKey. Halaman yang tidak didaftarkan di
// sini (mis. dashboard) tetap tampil judul statis "Manajemen
// Perangkat Lunak" seperti sebelumnya (lihat navbar.render()).
const PAGE_BREADCRUMBS = {
  'antrian/proposal-pl': ['Antrian', 'Antrian Proposal PL'],
  'antrian/konsep-pl': ['Antrian', 'Antrian Konsep PL'],
  'monitoring/proposal-pl': ['Monitoring', 'Monitoring Proposal'],
  'monitoring/konsep-pl': ['Monitoring', 'Monitoring Konsep'],
  'pengajuan/proposal-pl': ['Pengajuan Proposal PL'],
  pengaturan: ['Pengaturan']
};

// Folder yang nama file di dalamnya BUKAN unik (mis. "proposal-pl"
// dipakai baik di antrian/ maupun monitoring/), jadi key-nya harus
// ikut nama foldernya juga supaya tidak saling timpa di PAGE_MODULES.
const NESTED_PAGE_FOLDERS = ['antrian', 'monitoring', 'pengajuan'];

/** Tebak "jenis" halaman dari path-nya, dipakai buat cari modul di PAGE_MODULES. */
function getPageKey(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const file = (segments.pop() || '').replace('.html', '');
  const parent = segments.pop() || '';
  return NESTED_PAGE_FOLDERS.includes(parent) ? `${parent}/${file}` : file;
}

/**
 * Bangun shell (sidebar + navbar) lalu render konten halaman yang
 * sesuai ke dalamnya. Kalau modul untuk halaman ini belum ada
 * (masih placeholder), tampilkan pemberitahuan sederhana saja.
 * @param {Session} user
 */
async function mountShell(user) {
  const app = document.getElementById('app');
  if (!app) return;

  const pageKey = getPageKey(router.getCurrentPath());
  const breadcrumb = PAGE_BREADCRUMBS[pageKey];

  app.innerHTML = `
    <div class="layout">
      ${sidebar.render(user)}
      <div class="layout__main">
        ${navbar.render(user, { breadcrumb })}
        <div class="layout__content" id="page-content"></div>
      </div>
    </div>
  `;

  sidebar.bindEvents(app);
  navbar.bindEvents(app);

  const pageContent = document.getElementById('page-content');
  const loadModule = PAGE_MODULES[pageKey];

  if (!loadModule) {
    pageContent.innerHTML = '<p class="dashboard__subtitle">Halaman ini sedang dalam pengembangan.</p>';
    return;
  }

  const mod = await loadModule();
  // Konvensi: tiap modul halaman mengekspor init<Nama>Page(root, user).
  const initFn = Object.values(mod).find((v) => typeof v === 'function');
  if (initFn) initFn(pageContent, user);
}

const App = {
  /**
   * @returns {Session|null} user yang aktif setelah guard lolos
   */
  async init() {
    storage.seed({
      [STORAGE_KEYS.USERS]: SEED_USERS
    });

    const pathname = router.getCurrentPath();

    // Halaman login ditangani terpisah: publik, dan render form-nya
    // sendiri (bukan lewat alur dashboard/sidebar halaman lain).
    if (router.isLoginPage(pathname)) {
      const shouldRenderLogin = router.guardLoginPage();
      if (!shouldRenderLogin) return null; // sedang diarahkan ke dashboard

      const { initLoginPage } = await import('../pages/login.js');
      initLoginPage();
      return null;
    }

    const user = router.guard();
    if (!user) return null; // sedang di-redirect (index/belum login/akses ditolak)

    await mountShell(user);

    return user;
  }
};

export default App;