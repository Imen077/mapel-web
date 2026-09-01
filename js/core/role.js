// ============================================================
// MAPEL - role.js
// Sumber kebenaran tunggal soal: daftar role, label tampilan,
// menu sidebar tiap role, dan halaman default (dashboard) tiap
// role. router.js pakai file ini buat cek hak akses.
// ============================================================

export const ROLES = {
  PEGAWAI: 'pegawai',
  LO_BIRO_TI: 'lo-biro-ti',
  KEPALA_SATKER_BIRO_TI: 'kepala-satker-biro-ti',
  KEPALA_BIRO_ORTALA: 'kepala-biro-ortala',
  KEPALA_BAGIAN_ORTALA: 'kepala-bagian-ortala',
  KEPALA_SUBBAGIAN_ORTALA: 'kepala-subbagian-ortala',
  PREVIU_BIRO_ORTALA: 'previu-biro-ortala'
};

export const ROLE_LABELS = {
  [ROLES.PEGAWAI]: 'Pegawai',
  [ROLES.LO_BIRO_TI]: 'LO Biro TI',
  [ROLES.KEPALA_SATKER_BIRO_TI]: 'Kepala Satker Biro TI',
  [ROLES.KEPALA_BIRO_ORTALA]: 'Kepala Biro Ortala',
  [ROLES.KEPALA_BAGIAN_ORTALA]: 'Kepala Bagian Ortala',
  [ROLES.KEPALA_SUBBAGIAN_ORTALA]: 'Kepala Subbagian Ortala',
  [ROLES.PREVIU_BIRO_ORTALA]: 'Previu Biro Ortala'
};

// Urutan tahap 1 (disposisi), dari yang mengajukan sampai Previu.
// Dipakai nanti oleh workflow.js buat nentuin "lempar ke siapa
// selanjutnya". Ditaruh di sini karena sifatnya konfigurasi role,
// bukan logic.
export const DISPOSISI_CHAIN = [
  ROLES.LO_BIRO_TI,
  ROLES.KEPALA_SATKER_BIRO_TI,
  ROLES.KEPALA_BIRO_ORTALA,
  ROLES.KEPALA_BAGIAN_ORTALA,
  ROLES.KEPALA_SUBBAGIAN_ORTALA,
  ROLES.PREVIU_BIRO_ORTALA
];

// Tahap 2 (reviu) = jalan balik dari Previu sampai Kepala Biro
// Ortala (final approver). Dihitung dari kebalikan chain di atas
// minus LO Biro TI (LO cuma pengaju, bukan reviewer).
export const REVIU_CHAIN = [...DISPOSISI_CHAIN]
  .slice(1) // buang LO_BIRO_TI
  .reverse(); // Previu -> Kasubbag -> Kabag -> Kabiro (final)

export const FINAL_APPROVER_ROLE = ROLES.KEPALA_BIRO_ORTALA;

// Halaman yang didarati user setelah login, per role.
export const ROLE_DEFAULT_ROUTE = {
  [ROLES.PEGAWAI]: '/pages/pegawai/dashboard.html',
  [ROLES.LO_BIRO_TI]: '/pages/lo-biro-ti/dashboard.html',
  [ROLES.KEPALA_SATKER_BIRO_TI]: '/pages/kepala-satker-biro-ti/dashboard.html',
  [ROLES.KEPALA_BIRO_ORTALA]: '/pages/kepala-biro-ortala/dashboard.html',
  [ROLES.KEPALA_BAGIAN_ORTALA]: '/pages/kepala-bagian-ortala/dashboard.html',
  [ROLES.KEPALA_SUBBAGIAN_ORTALA]: '/pages/kepala-subbagian-ortala/dashboard.html',
  [ROLES.PREVIU_BIRO_ORTALA]: '/pages/previu-biro-ortala/dashboard.html'
};

// Menu sidebar tiap role, sesuai spesifikasi:
// - Pegawai: Dashboard, Library (baca-baca doang)
// - LO Biro TI: + Pengajuan Proposal PL, Monitoring, Antrian, Pengaturan
// - Sisanya (Kasatker, Kabiro, Kabag, Kasubbag, Previu): Dashboard, Monitoring, Antrian
//
// Item dengan "children" dirender sebagai grup yang bisa
// dibuka/tutup (accordion) di sidebar, bukan link langsung --
// dipakai buat Monitoring (punya 2 sub-halaman: Proposal PL &
// Konsep PL, mengikuti 2 flow yang sama-sama dipantau role ini).
export const ROLE_MENUS = {
  [ROLES.PEGAWAI]: [
    { label: 'Dashboard', path: '/pages/pegawai/dashboard.html', icon: 'home' },
    { label: 'Library', path: '/pages/pegawai/library.html', icon: 'book' }
  ],
  [ROLES.LO_BIRO_TI]: [
    { label: 'Dashboard', path: '/pages/lo-biro-ti/dashboard.html', icon: 'home' },
    { label: 'Pengajuan Proposal PL', path: '/pages/lo-biro-ti/pengajuan/proposal-pl.html', icon: 'file-plus' },
    {
      label: 'Monitoring',
      icon: 'activity',
      children: [
        { label: 'Monitoring Proposal PL', path: '/pages/lo-biro-ti/monitoring/proposal-pl.html' },
        { label: 'Monitoring Konsep PL', path: '/pages/lo-biro-ti/monitoring/konsep-pl.html' },
        { label: 'Monitoring Pengesahan PL', path: '/pages/lo-biro-ti/monitoring/pengesahan-pl.html' }
      ]
    },
    {
      label: 'Antrian',
      icon: 'list-checks',
      children: [
        { label: 'Antrian Proposal PL', path: '/pages/lo-biro-ti/antrian/proposal-pl.html' },
        { label: 'Antrian Konsep PL', path: '/pages/lo-biro-ti/antrian/konsep-pl.html' }
      ]
    },
    { label: 'Pengaturan', path: '/pages/lo-biro-ti/pengaturan.html', icon: 'settings' }
  ],
  [ROLES.KEPALA_SATKER_BIRO_TI]: [
    { label: 'Dashboard', path: '/pages/kepala-satker-biro-ti/dashboard.html', icon: 'home' },
    {
      label: 'Monitoring',
      icon: 'activity',
      children: [
        { label: 'Monitoring Proposal PL', path: '/pages/kepala-satker-biro-ti/monitoring/proposal-pl.html' },
        { label: 'Monitoring Konsep PL', path: '/pages/kepala-satker-biro-ti/monitoring/konsep-pl.html' },
        { label: 'Monitoring Pengesahan PL', path: '/pages/kepala-satker-biro-ti/monitoring/pengesahan-pl.html' }
      ]
    },
    {
      label: 'Antrian',
      icon: 'list-checks',
      children: [
        { label: 'Antrian Proposal PL', path: '/pages/kepala-satker-biro-ti/antrian/proposal-pl.html' },
        { label: 'Antrian Konsep PL', path: '/pages/kepala-satker-biro-ti/antrian/konsep-pl.html' }
      ]
    }
  ],
  [ROLES.KEPALA_BIRO_ORTALA]: [
    { label: 'Dashboard', path: '/pages/kepala-biro-ortala/dashboard.html', icon: 'home' },
    {
      label: 'Monitoring',
      icon: 'activity',
      children: [
        { label: 'Monitoring Proposal PL', path: '/pages/kepala-biro-ortala/monitoring/proposal-pl.html' },
        { label: 'Monitoring Konsep PL', path: '/pages/kepala-biro-ortala/monitoring/konsep-pl.html' },
        { label: 'Monitoring Pengesahan PL', path: '/pages/kepala-biro-ortala/monitoring/pengesahan-pl.html' }
      ]
    },
    {
      label: 'Antrian',
      icon: 'list-checks',
      children: [
        { label: 'Antrian Proposal PL', path: '/pages/kepala-biro-ortala/antrian/proposal-pl.html' },
        { label: 'Antrian Konsep PL', path: '/pages/kepala-biro-ortala/antrian/konsep-pl.html' }
      ]
    }
  ],
  [ROLES.KEPALA_BAGIAN_ORTALA]: [
    { label: 'Dashboard', path: '/pages/kepala-bagian-ortala/dashboard.html', icon: 'home' },
    {
      label: 'Monitoring',
      icon: 'activity',
      children: [
        { label: 'Monitoring Proposal PL', path: '/pages/kepala-bagian-ortala/monitoring/proposal-pl.html' },
        { label: 'Monitoring Konsep PL', path: '/pages/kepala-bagian-ortala/monitoring/konsep-pl.html' },
        { label: 'Monitoring Pengesahan PL', path: '/pages/kepala-bagian-ortala/monitoring/pengesahan-pl.html' }
      ]
    },
    {
      label: 'Antrian',
      icon: 'list-checks',
      children: [
        { label: 'Antrian Proposal PL', path: '/pages/kepala-bagian-ortala/antrian/proposal-pl.html' },
        { label: 'Antrian Konsep PL', path: '/pages/kepala-bagian-ortala/antrian/konsep-pl.html' }
      ]
    }
  ],
  [ROLES.KEPALA_SUBBAGIAN_ORTALA]: [
    { label: 'Dashboard', path: '/pages/kepala-subbagian-ortala/dashboard.html', icon: 'home' },
    {
      label: 'Monitoring',
      icon: 'activity',
      children: [
        { label: 'Monitoring Proposal PL', path: '/pages/kepala-subbagian-ortala/monitoring/proposal-pl.html' },
        { label: 'Monitoring Konsep PL', path: '/pages/kepala-subbagian-ortala/monitoring/konsep-pl.html' },
        { label: 'Monitoring Pengesahan PL', path: '/pages/kepala-subbagian-ortala/monitoring/pengesahan-pl.html' }
      ]
    },
    {
      label: 'Antrian',
      icon: 'list-checks',
      children: [
        { label: 'Antrian Proposal PL', path: '/pages/kepala-subbagian-ortala/antrian/proposal-pl.html' },
        { label: 'Antrian Konsep PL', path: '/pages/kepala-subbagian-ortala/antrian/konsep-pl.html' }
      ]
    }
  ],
  [ROLES.PREVIU_BIRO_ORTALA]: [
    { label: 'Dashboard', path: '/pages/previu-biro-ortala/dashboard.html', icon: 'home' },
    {
      label: 'Monitoring',
      icon: 'activity',
      children: [
        { label: 'Monitoring Proposal PL', path: '/pages/previu-biro-ortala/monitoring/proposal-pl.html' },
        { label: 'Monitoring Konsep PL', path: '/pages/previu-biro-ortala/monitoring/konsep-pl.html' },
        { label: 'Monitoring Pengesahan PL', path: '/pages/previu-biro-ortala/monitoring/pengesahan-pl.html' }
      ]
    },
    {
      label: 'Antrian',
      icon: 'list-checks',
      children: [
        { label: 'Antrian Proposal PL', path: '/pages/previu-biro-ortala/antrian/proposal-pl.html' },
        { label: 'Antrian Konsep PL', path: '/pages/previu-biro-ortala/antrian/konsep-pl.html' }
      ]
    }
  ]
};

// Role yang punya dashboard "lengkap" (library + grafik + data PL),
// bukan dashboard ringkas kayak Pegawai/LO Biro TI.
export const ROLES_WITH_FULL_DASHBOARD = [
  ROLES.KEPALA_BIRO_ORTALA,
  ROLES.KEPALA_BAGIAN_ORTALA,
  ROLES.KEPALA_SUBBAGIAN_ORTALA,
  ROLES.PREVIU_BIRO_ORTALA
];

function isValidRole(role) {
  return Object.values(ROLES).includes(role);
}

function getLabel(role) {
  return ROLE_LABELS[role] || role;
}

function getMenu(role) {
  return ROLE_MENUS[role] || [];
}

function getDefaultRoute(role) {
  return ROLE_DEFAULT_ROUTE[role] || '/pages/auth/login.html';
}

function hasFullDashboard(role) {
  return ROLES_WITH_FULL_DASHBOARD.includes(role);
}

/**
 * Cek apakah sebuah role boleh mengakses sebuah path halaman.
 * Aturan: role hanya boleh akses halaman di dalam folder
 * /pages/{role}/nya sendiri.
 * @param {string} role
 * @param {string} pathname - path absolut, misal '/pages/lo-biro-ti/dashboard.html'
 */
function canAccessPath(role, pathname) {
  if (!isValidRole(role)) return false;
  const ownFolder = `/pages/${role}/`;
  return pathname.includes(ownFolder);
}

export const roleService = {
  isValidRole,
  getLabel,
  getMenu,
  getDefaultRoute,
  hasFullDashboard,
  canAccessPath
};