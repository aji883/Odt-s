const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction'); // Impor model gabungan

// Semua rute transaksi dilindungi login
router.use(isLoggedIn);

// --- RUTE ALUR BELI ---
// STEP 1: Tampilkan halaman checkout (form alamat/pembayaran)
router.get('/buy/:itemId', Transaction.handleGetCheckoutPage);
// STEP 2: Proses data dari form checkout
router.post('/buy/:itemId', Transaction.handleConfirmPurchase);

// --- RUTE ALUR SWAP ---
// Memulai alur barter
router.get('/start-swap/:id', Transaction.handleStartSwap);
// Menampilkan halaman "etalase" untuk memilih item
router.get('/:id/select-item', Transaction.handleSelectSwapPage);

// --- RUTE NOTIFIKASI ---
// Halaman "Hub" Notifikasi (yang ada 2 tombol)
router.get('/received', Transaction.handleGetOffersHub);
// Halaman daftar Tawaran Diterima
router.get('/received/incoming', Transaction.handleGetIncomingOffers);
// Halaman daftar Tawaran Terkirim
router.get('/received/outgoing', Transaction.handleGetOutgoingOffers);

// Halaman Detail Transaksi (Status Page)
router.get('/:id', Transaction.handleGetTransactionDetail);

// --- AKSI POST ---
// Penawar memilih item untuk barter
router.post('/:id/select-swap', Transaction.handleSelectSwapItem);
// Pemilik menerima tawaran
router.post('/:id/accept', Transaction.handleAcceptOffer);
// Pemilik menolak tawaran
router.post('/:id/reject', Transaction.handleRejectOffer);
// Penawar membatalkan tawaran
router.post('/:id/cancel', Transaction.handleCancelOffer);
// Penawar menghapus riwayat
router.post('/:id/hide-sent', Transaction.handleHideSentOffer);
// Pemilik menghapus riwayat
router.post('/:id/hide-received', Transaction.handleHideReceivedOffer);
// Penawar mengonfirmasi pesanan diterima
router.post('/:id/complete', Transaction.handleCompleteTransaction);

module.exports = router;