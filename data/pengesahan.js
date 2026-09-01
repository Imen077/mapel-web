// ============================================================
// MAPEL - data/pengesahan.js
// "Pengesahan PL" nge-track tahap AKHIR Konsep PL yang sudah
// disetujui (Final -> Pengesahan Satker -> Legislasi -> Indeksasi)
// sampai resmi diterbitkan -- reuse SEED_KONSEP yang sama (bukan
// dataset baru), cuma difilter ke 4 status ini saja.
// ============================================================

import { SUBMISSION_STATUS, buildStatusMeta } from './status.js';
import { createSubmissionService } from './submission-service.js';
import { SEED_KONSEP } from './konsep.js';

const PENGESAHAN_STAGES = [
  SUBMISSION_STATUS.FINAL,
  SUBMISSION_STATUS.PENGESAHAN_SATKER,
  SUBMISSION_STATUS.LEGISLASI,
  SUBMISSION_STATUS.INDEKSASI
];

export const PENGESAHAN_STATUS_META = buildStatusMeta('Konsep').filter((meta) =>
  PENGESAHAN_STAGES.includes(meta.key)
);

export const SEED_PENGESAHAN = SEED_KONSEP.filter((item) => PENGESAHAN_STAGES.includes(item.status));

export const pengesahanService = createSubmissionService({
  statusMeta: PENGESAHAN_STATUS_META,
  items: SEED_PENGESAHAN
});