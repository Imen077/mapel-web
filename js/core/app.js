// ============================================================
// MAPEL - app.js
// Orkestrasi startup: seed data awal -> jalankan guard router.
// Rendering shell (navbar/sidebar) & konten halaman akan
// disambungkan di sini pada tahap-tahap berikutnya, setelah
// js/pages/*.js dan js/components/* diisi.
// ============================================================

import { storage, STORAGE_KEYS } from './storage.js';
import { auth } from './auth.js';
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
  'pengajuan/konsep-pl': () => import('../pages/pengajuan-konsep.js'),
  'pengajuan/ubah-proposal-pl': () => import('../pages/ubah-proposal.js'),
  'antrian/detail': () => import('../pages/detail.js'),
  'antrian/review': () => import('../pages/review.js'),
  // Detail Proposal dan Konsep + keputusan Revisi/Setuju (Kepala Satker),
  // lihat js/pages/review-konsep.js.
  'antrian/review-konsep': () => import('../pages/review-konsep.js'),
  'monitoring/detail': () => import('../pages/disposisi.js'),
  'monitoring/disposisi-tujuan': () => import('../pages/disposisi-tujuan.js'),
  // Halaman Detail Proposal buat Previu Biro Ortala (ujung rantai
  // disposisi) -- reuse modul yang sama kayak 'monitoring/detail' di
  // atas (js/pages/disposisi.js), initDisposisiPage sudah bisa
  // ngebedain lewat user.role (tombol "Reviu", bukan "Disposisi").
  'monitoring/review': () => import('../pages/disposisi.js'),
  'monitoring/reviu-proposal': () => import('../pages/review-proposal.js'),
  // Detail Proposal dan Konsep + Riwayat Disposisi buat dummy konsep
  // "Diterima" role Kepala Biro Ortala -- lihat resolveRowActionRoute di
  // js/pages/monitoring.js & js/pages/disposisi-konsep.js.
  'monitoring/disposisi-konsep': () => import('../pages/disposisi-konsep.js'),
  // Halaman Detail Proposal (yang sudah Disetujui + tombol "Buat Konsep
  // PL") buat dummy PO-2026-048 di Monitoring Proposal PL role LO Biro
  // TI -- lihat resolveRowActionRoute di js/pages/monitoring.js &
  // komentar di js/pages/detail-konsep.js.
  'monitoring/detail-konsep': () => import('../pages/detail-konsep.js'),
  // Halaman Detail Proposal dan Konsep Perangkat Lunak -- dibuka lewat
  // tombol "Simpan" di form Pengajuan Konsep PL (role LO Biro TI).
  'monitoring/detail-proposal-konsep': () => import('../pages/detail-proposal-konsep.js')
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
  // Form Konsep PL dianggap bagian dari menu "Pengajuan Proposal PL"
  // (satu-satunya menu pengajuan LO Biro TI), ngikutin contoh tampilan.
  'pengajuan/konsep-pl': ['Pengajuan Proposal PL'],
  'pengajuan/ubah-proposal-pl': ['Antrian', 'Ubah Proposal'],
  'antrian/detail': ['Antrian', 'Detail Proposal'],
  'antrian/review': ['Antrian', 'Review Proposal'],
  // Breadcrumb ngikutin contoh tampilan ("Monitoring > Monitoring Proposal").
  'antrian/review-konsep': ['Monitoring', 'Monitoring Proposal'],
  // Sengaja dibikin sama persis kayak breadcrumb Monitoring Proposal
  // PL (bukan "Detail Proposal") -- ngikutin desain, dianggap
  // sub-halaman dari situ, bukan bagian dari alur Antrian.
  'monitoring/detail': ['Monitoring', 'Monitoring Proposal'],
  // Ngikutin contoh tampilan ("Monitoring > Monitoring Proposal").
  'monitoring/disposisi-konsep': ['Monitoring', 'Monitoring Proposal'],
  'monitoring/disposisi-tujuan': ['Monitoring', 'Monitoring Proposal'],
  // Beda dari 'monitoring/detail' di atas -- breadcrumb Previu SENGAJA
  // "Antrian > Detail Proposal" (bukan "Monitoring > Monitoring
  // Proposal"), sesuai contoh tampilan yang dikasih, walau folder
  // URL-nya tetap di bawah monitoring/ (lihat resolveRowActionRoute
  // di js/pages/monitoring.js).
  'monitoring/review': ['Antrian', 'Detail Proposal'],
  'monitoring/reviu-proposal': ['Antrian', 'Reviu Proposal'],
  'monitoring/detail-konsep': ['Monitoring', 'Monitoring Proposal'],
  // Ngikutin contoh tampilan: breadcrumb-nya "Pengajuan Proposal PL"
  // walau folder URL-nya di bawah monitoring/ (menu Monitoring yang
  // ke-highlight di sidebar, lihat activePaths di role.js).
  'monitoring/detail-proposal-konsep': ['Pengajuan Proposal PL']
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
  // Konteks "koreksi" (lihat hand-off demo di js/pages/review-proposal.js,
  // tombol Koreksi Reviu role Kasubbag) sengaja pakai breadcrumb 1 level
  // ("Koreksi Proposal"), beda dari kunjungan normal lewat Antrian yang
  // breadcrumb-nya 2 level ("Antrian > Reviu Proposal").
  const isKoreksiContext = pageKey === 'monitoring/reviu-proposal' && new URLSearchParams(window.location.search).get('ctx') === 'koreksi';
  const breadcrumb = isKoreksiContext ? ['Koreksi Proposal'] : PAGE_BREADCRUMBS[pageKey];

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
    // Sesi lama bisa masih nyimpen username/nama versi sebelum seed
    // di-update -- samakan dulu sebelum guard & render halaman.
    auth.syncSession();

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