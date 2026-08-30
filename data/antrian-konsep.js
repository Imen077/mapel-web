// ============================================================
// MAPEL - data/antrian-konsep.js
// Service Antrian Konsep PL. Sumber datanya sama persis dengan
// Monitoring Konsep PL (SEED_KONSEP + KONSEP_STATUS_META di
// data/konsep.js) lewat factory generik createSubmissionService()
// -- bedanya cuma di CARA PAKAI-nya: halaman Antrian (js/pages/
// antrian.js) selalu manggil getFiltered() dengan includeDraft:
// true, supaya item draft (yang disembunyikan dari Monitoring)
// tetap ikut tampil di sini.
// ============================================================

import { KONSEP_STATUS_META, SEED_KONSEP } from './konsep.js';
import { createSubmissionService } from './submission-service.js';

export const antrianKonsepService = createSubmissionService({
  statusMeta: KONSEP_STATUS_META,
  items: SEED_KONSEP
});