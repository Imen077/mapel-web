// ============================================================
// MAPEL - data/antrian-proposal.js
// Service Antrian Proposal PL. Sumber datanya sama persis dengan
// Monitoring Proposal PL (SEED_PROPOSALS + PROPOSAL_STATUS_META
// di data/proposal.js) lewat factory generik createSubmissionService()
// -- bedanya cuma di CARA PAKAI-nya: halaman Antrian (js/pages/
// antrian.js) selalu manggil getFiltered() dengan includeDraft:
// true, supaya item draft (yang disembunyikan dari Monitoring)
// tetap ikut tampil di sini. Lihat data/antrian-konsep.js buat
// versi Konsep PL-nya.
// ============================================================

import { PROPOSAL_STATUS_META, SEED_PROPOSALS } from './proposal.js';
import { createSubmissionService } from './submission-service.js';

export const antrianProposalService = createSubmissionService({
  statusMeta: PROPOSAL_STATUS_META,
  items: SEED_PROPOSALS
});