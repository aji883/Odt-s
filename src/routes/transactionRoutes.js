const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');

router.use(isLoggedIn);

// --- RUTE ALUR BELI ---
router.get('/buy/:itemId', Transaction.handleGetCheckoutPage);
router.post('/buy/:itemId', Transaction.handleConfirmPurchase);

// --- RUTE ALUR SWAP ---
router.get('/start-swap/:id', Transaction.handleStartSwap);
// PERBAIKAN: Tambahkan rute untuk halaman "Pilih Item"
router.get('/:id/select-item', Transaction.handleSelectSwapPage); 

// --- RUTE NOTIFIKASI ---
router.get('/received', Transaction.handleGetOffersHub);
router.get('/received/incoming', Transaction.handleGetIncomingOffers);
router.get('/received/outgoing', Transaction.handleGetOutgoingOffers);

// Halaman Detail Transaksi
router.get('/:id', Transaction.handleGetTransactionDetail);

// --- AKSI POST ---
router.post('/:id/select-swap', Transaction.handleSelectSwapItem);
router.post('/:id/accept', Transaction.handleAcceptOffer);
router.post('/:id/reject', Transaction.handleRejectOffer);
router.post('/:id/cancel', Transaction.handleCancelOffer);
router.post('/:id/hide-sent', Transaction.handleHideSentOffer);
router.post('/:id/hide-received', Transaction.handleHideReceivedOffer);

module.exports = router;