// ============================================================
// MAPEL - data/users.js
// Data dummy akun untuk tiap role. Dipakai storage.seed() saat
// pertama kali app dibuka. Password disimpan plain text karena
// ini prototype tanpa backend -- JANGAN dipakai pola ini di
// production sungguhan.
// ============================================================

// Password disamain semua jadi 'mapel123' biar gampang dites --
// ini murni buat kebutuhan demo/dummy design, bukan akun beneran.
const DUMMY_PASSWORD = 'mapel123';

export const SEED_USERS = [
  {
    id: 'u-pegawai-01',
    username: 'pegawai.bpj',
    password: DUMMY_PASSWORD,
    name: 'Pegawai Bpj',
    role: 'pegawai'
  },
  {
    id: 'u-lo-01',
    username: 'agustina.ratna',
    password: DUMMY_PASSWORD,
    name: 'Agustina Ratna Puspitasari',
    role: 'lo-biro-ti'
  },
  {
    id: 'u-lo-02',
    username: 'mohamad.gofur',
    password: DUMMY_PASSWORD,
    name: 'Mohamad Gofur',
    role: 'lo-biro-ti'
  },
  {
    id: 'u-kasatker-01',
    username: 'pingky',
    password: DUMMY_PASSWORD,
    name: 'Pingky',
    role: 'kepala-satker-biro-ti'
  },
  {
    id: 'u-kabiro-01',
    username: 'firta.moenir',
    password: DUMMY_PASSWORD,
    name: 'Firta Moenir',
    role: 'kepala-biro-ortala'
  },
  {
    id: 'u-kabag-01',
    username: 'telviani.savitri',
    password: DUMMY_PASSWORD,
    name: 'Telviani Savitri',
    role: 'kepala-bagian-ortala'
  },
  {
    id: 'u-kasubbag-01',
    username: 'arny.satyawaty',
    password: DUMMY_PASSWORD,
    name: 'Arny Satyawaty',
    role: 'kepala-subbagian-ortala'
  },
  {
    id: 'u-previu-01',
    username: 'mochammad.taufik',
    password: DUMMY_PASSWORD,
    name: 'Mochammad Taufik',
    role: 'previu-biro-ortala'
  }
];