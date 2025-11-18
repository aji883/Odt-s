const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
const upload = require('../utils/fileUploader'); // Pastikan ini diimpor

router.use(isLoggedIn);

// --- RUTE ALUR BELI ---
// STEP 1: Tampilkan halaman checkout
router.get('/buy/:itemId', Transaction.handleGetCheckoutPage);

// STEP 2: Proses data (PERBAIKAN DI SINI: Tambahkan upload.single)
router.post('/buy/:itemId', upload.single('paymentProof'), Transaction.handleConfirmPurchase);

// --- RUTE ALUR SWAP ---
router.get('/start-swap/:id', Transaction.handleStartSwap);
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
router.post('/:id/complete', Transaction.handleCompleteTransaction);

module.exports = router;