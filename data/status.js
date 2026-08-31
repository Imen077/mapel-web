// ============================================================
// MAPEL - data/status.js
// Katalog 11 tahap status yang sama-sama dipakai flow Proposal
// PL & Konsep PL (keduanya memang identik strukturnya -- cuma
// beda judul objeknya, lihat DISPOSISI_CHAIN/REVIU_CHAIN di
// core/role.js). Warna tint di sini dipakai bareng oleh badge
// status di tabel maupun "blob" dekoratif kartu ringkasan.
// ============================================================

export const SUBMISSION_STATUS = {
  DRAFT: 'draft',
  MENUNGGU_PERSETUJUAN: 'menunggu-persetujuan',
  DIKIRIM: 'dikirim',
  KOREKSI_SATKER: 'koreksi-satker',
  DITOLAK_KASATKER: 'ditolak-kasatker',
  PROSES_REVIU: 'proses-reviu',
  FINAL: 'final',
  KOREKSI_ORTALA: 'koreksi-ortala',
  PENGESAHAN_SATKER: 'pengesahan-satker',
  LEGISLASI: 'legislasi',
  INDEKSASI: 'indeksasi',
  // Ditolak final oleh Kepala Biro Ortala di UJUNG rantai reviu --
  // beda dari DITOLAK_KASATKER yang gugur di awal (tahap disposisi,
  // sebelum sempat masuk rantai reviu Ortala sama sekali).
  TIDAK_DISETUJUI: 'tidak-disetujui',
  // Rantai REVIU_CHAIN sudah kelar dibolak-balik (Previu -> Kasubbag
  // -> Kabag -> balik ke Kabiro), tinggal nunggu keputusan akhir
  // Kabiro Ortala (disetujui/tidak). Cuma dipakai di kartu ringkasan
  // Monitoring Proposal PL milik role-role Ortala (Kabiro/Kabag/dst,
  // lihat *_CARD_GROUPS di js/pages/monitoring.js).
  SELESAI_REVIU: 'selesai-reviu'
};

/**
 * Bikin katalog status buat satu jenis objek (Proposal PL /
 * Konsep PL) -- satu-satunya yang beda cuma label tahap draft
 * paling awal ("Proposal" vs "Konsep"), sisanya identik.
 * @param {string} draftLabel - label kartu status paling awal, mis. 'Proposal' atau 'Konsep'
 */
export function buildStatusMeta(draftLabel) {
  return [
    { key: SUBMISSION_STATUS.DRAFT, label: draftLabel, bg: '#EDEAE0', text: '#6E6759', blob: '#DCD5C2' },
    { key: SUBMISSION_STATUS.MENUNGGU_PERSETUJUAN, label: 'Menunggu Persetujuan', bg: '#F7ECD8', text: '#8A641F', blob: '#F0D9A0' },
    { key: SUBMISSION_STATUS.DIKIRIM, label: 'Dikirim', bg: '#E1EAF6', text: '#2B5C89', blob: '#C2D8F0' },
    { key: SUBMISSION_STATUS.KOREKSI_SATKER, label: 'Koreksi Satker', bg: '#FBE7D6', text: '#B5601E', blob: '#F5C89B' },
    { key: SUBMISSION_STATUS.DITOLAK_KASATKER, label: 'Ditolak Kasatker', bg: '#F6E2DE', text: '#C0392B', blob: '#F0BEB4' },
    { key: SUBMISSION_STATUS.PROSES_REVIU, label: 'Proses Reviu', bg: '#EFE7FA', text: '#6C3FB5', blob: '#D9C6F2' },
    { key: SUBMISSION_STATUS.FINAL, label: 'Final', bg: '#E1EFE7', text: '#3C7A5C', blob: '#B9DDC7' },
    { key: SUBMISSION_STATUS.KOREKSI_ORTALA, label: 'Koreksi Ortala', bg: '#FCE4EF', text: '#B03A6E', blob: '#F5B8D3' },
    { key: SUBMISSION_STATUS.PENGESAHAN_SATKER, label: 'Pengesahan Satker', bg: '#E4E8F9', text: '#3B4F9E', blob: '#C2CCF0' },
    { key: SUBMISSION_STATUS.LEGISLASI, label: 'Legislasi', bg: '#F1E4F7', text: '#7A3FA0', blob: '#DFC0EF' },
    { key: SUBMISSION_STATUS.INDEKSASI, label: 'Indeksasi', bg: '#DEF5EA', text: '#1F8A63', blob: '#A9E8C7' },
    // hidden: true -- status ini cuma dipakai lewat kartu gabungan
    // "Tidak Disetujui" di Monitoring Proposal PL (lihat
    // PROPOSAL_CARD_GROUPS di js/pages/monitoring.js), jadi tidak
    // ikut nongol di daftar kartu/filter default (dipakai apa
    // adanya oleh Monitoring Konsep PL).
    { key: SUBMISSION_STATUS.TIDAK_DISETUJUI, label: 'Tidak Disetujui', bg: '#F8DCD6', text: '#A93226', blob: '#EFAFA1', hidden: true }
  ];
}

/** @param {{key:string}[]} statusMeta @param {string} key */
export function findStatusMeta(statusMeta, key) {
  return statusMeta.find((s) => s.key === key) || statusMeta[0];
}