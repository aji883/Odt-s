const db = require('../../config/db');
const Item = require('./Item'); // Kita butuh Item model

class Transaction {

    // ==========================================
    // 1. FUNGSI DATABASE MURNI (MODEL)
    // ==========================================

    /**
     * Membuat tawaran baru (buy/swap)
     */
    static async create(data) {
        const { itemId, proposerUserId, ownerUserId, type, message, shipping_address, payment_method, payment_proof_url } = data;
        const sql = `INSERT INTO transactions (item_id, proposer_user_id, owner_user_id, type, message, status, shipping_address, payment_method, payment_proof_url)
                     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`;
        const [result] = await db.execute(sql, [itemId, proposerUserId, ownerUserId, type, message, shipping_address, payment_method, payment_proof_url]);
        return result.insertId;
    }

    /**
     * Membuat detail transaksi (harga atau item barter)
     */
    static async createDetail(data) {
        const { transaction_id, offered_item_id, agreed_price } = data;
        const sql = `INSERT INTO transaction_details (transaction_id, offered_item_id, agreed_price) VALUES (?, ?, ?)`;
        await db.execute(sql, [transaction_id, offered_item_id, agreed_price]);
    }

    /**
     * Mencari tawaran yang DITERIMA user (yang tidak disembunyikan)
     */
    static async findReceivedByUserId(userId) {
        const sql = `
            SELECT t.id, t.type, t.status, t.created_at, 
                   i_main.title AS item_title, i_main.image_url, 
                   u_proposer.username AS proposer_username
            FROM transactions t
            JOIN items i_main ON t.item_id = i_main.id
            JOIN users u_proposer ON t.proposer_user_id = u_proposer.id
            WHERE t.owner_user_id = ? AND t.owner_hidden = false 
            ORDER BY t.created_at DESC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    /**
     * Mencari tawaran yang DIKIRIM user (yang tidak disembunyikan)
     */
    static async findSentByUserId(userId) {
        const sql = `
            SELECT t.id, t.type, t.status, t.created_at, 
                   i_main.title AS item_title, i_main.image_url, 
                   u_owner.username AS owner_username
            FROM transactions t
            JOIN items i_main ON t.item_id = i_main.id
            JOIN users u_owner ON t.owner_user_id = u_owner.id
            WHERE t.proposer_user_id = ? AND t.proposer_hidden = false 
            ORDER BY t.created_at DESC
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows;
    }

    /**
     * Mencari satu transaksi berdasarkan ID (data dasar)
     */
    static async findById(id) {
        const sql = `SELECT * FROM transactions WHERE id = ?`;
        const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }
    
    /**
     * Mengambil semua detail untuk halaman detail transaksi
     */
    static async getFullDetailById(id) {
        const sql = `
            SELECT 
                t.*,
                i_main.id AS item_main_id, i_main.title AS item_title, i_main.image_url AS item_image, i_main.price AS item_price,
                u_proposer.username AS proposer_username,
                u_owner.username AS owner_username,
                td.offered_item_id,
                td.agreed_price,
                i_offered.title AS offered_item_title, i_offered.image_url AS offered_item_image
            FROM transactions t
            JOIN items i_main ON t.item_id = i_main.id
            JOIN users u_proposer ON t.proposer_user_id = u_proposer.id
            JOIN users u_owner ON t.owner_user_id = u_owner.id
            LEFT JOIN transaction_details td ON t.id = td.transaction_id
            LEFT JOIN items i_offered ON td.offered_item_id = i_offered.id
            WHERE t.id = ?
        `;
         const [rows] = await db.execute(sql, [id]);
        return rows[0];
    }

    /**
     * Mengupdate status transaksi
     */
    static async updateStatus(id, newStatus) {
        const sql = 'UPDATE transactions SET status = ? WHERE id = ?';
        await db.execute(sql, [newStatus, id]);
    }

    /**
     * Menyembunyikan tawaran dari tampilan si penawar
     */
    static async hideForProposer(transactionId, userId) {
        const sql = 'UPDATE transactions SET proposer_hidden = true WHERE id = ? AND proposer_user_id = ?';
        const [result] = await db.execute(sql, [transactionId, userId]);
        return result.affectedRows > 0;
    }

    /**
     * Menyembunyikan tawaran dari tampilan si pemilik
     */
    static async hideForOwner(transactionId, userId) {
        const sql = 'UPDATE transactions SET owner_hidden = true WHERE id = ? AND owner_user_id = ?';
        const [result] = await db.execute(sql, [transactionId, userId]);
        return result.affectedRows > 0;
    }

    // ==========================================
    // 2. FUNGSI LOGIKA HTTP (CONTROLLER HANDLERS)
    // ==========================================

    /**
     * @desc    [BELI - STEP 1] Menampilkan halaman checkout
     * @route   GET /transactions/buy/:itemId
     */
    static async handleGetCheckoutPage(req, res) {
        try {
            const itemId = req.params.itemId;
            const item = await Item.findById(itemId);

            if (!item) {
                return res.status(404).send('Item tidak ditemukan.');
            }

            // Cek jika sudah terjual
            if (item.status === 'Terjual') {
                return res.status(400).send('Maaf, item ini sudah terjual.');
            }

            if (item.status !== 'Dijual') {
                return res.status(400).send('Item ini tidak sedang dijual.');
            }
            if (item.user_id === req.session.userId) {
                return res.status(400).send('Anda tidak bisa membeli item Anda sendiri.');
            }
            
            res.render('checkout', {
                title: 'Konfirmasi Pembelian',
                item: item,
                bodyClass: 'page-profile'
            });
        } catch (error) {
            console.error("Error get checkout page:", error);
            res.status(500).send('Error Server');
        }
    }

    /**
     * @desc    [BELI - STEP 2] Memproses pembelian
     * @route   POST /transactions/buy/:itemId
     */
    static async handleConfirmPurchase(req, res) {
        try {
            const itemId = req.params.itemId;
            const { shipping_address, payment_method } = req.body;
            const item = await Item.findById(itemId);

            if (!item || item.status !== 'Dijual' || item.user_id === req.session.userId) {
                return res.status(400).send('Item ini tidak bisa dibeli.');
            }
            
            // Validasi Bukti Transfer
            let paymentProofUrl = null;
            if (payment_method === 'Transfer Bank') {
                if (!req.file) {
                    return res.status(400).send('Wajib upload bukti transfer untuk metode Transfer Bank.');
                }
                paymentProofUrl = req.file.path.replace(/\\/g, "/");
            }

            const transactionId = await Transaction.create({
                itemId: item.id,
                proposerUserId: req.session.userId,
                ownerUserId: item.user_id,
                type: 'buy',
                message: "Pengajuan pembelian",
                shipping_address: shipping_address,
                payment_method: payment_method,
                payment_proof_url: paymentProofUrl
            });
            
            await Transaction.createDetail({
                transaction_id: transactionId,
                offered_item_id: null,
                agreed_price: item.price
            });
            
            res.redirect(`/transactions/${transactionId}`);
        } catch (error) {
            console.error("Error confirm purchase:", error);
            res.status(500).send('Error Server');
        }
    }

    /**
     * @desc    [SWAP - STEP 1] Memulai alur barter (langsung ke profil)
     * @route   GET /transactions/start-swap/:id
     */
    static async handleStartSwap(req, res) {
        try {
            const itemId = req.params.id;
            const item = await Item.findById(itemId);
            
            if (!item) {
                return res.status(404).send('Item tidak ditemukan.');
            }

            if (item.status === 'Terjual') {
                return res.status(400).send('Maaf, item ini sudah tidak tersedia (Terjual/Tukar).');
            }

            if (item.status !== 'Bisa di-Swap') {
                return res.status(400).send('Item ini tidak tersedia untuk barter.');
            }
            if (item.user_id === req.session.userId) {
                return res.status(400).send('Anda tidak bisa menawar item Anda sendiri.');
            }
            
            const transactionId = await Transaction.create({
                itemId: item.id,
                proposerUserId: req.session.userId,
                ownerUserId: item.user_id,
                type: 'swap',
                message: "Tawaran barter dimulai",
                shipping_address: null,
                payment_method: null,
                payment_proof_url: null
            });
            
            await Transaction.createDetail({
                transaction_id: transactionId,
                offered_item_id: null,
                agreed_price: null
            });
            
            res.redirect(`/transactions/${transactionId}/select-item`);
        } catch (error) {
            console.error("Error starting swap:", error);
            res.status(500).send('Error Server');
        }
    }
    
    /**
     * @desc    [SWAP - STEP 2] Menampilkan "etalase" LemaRI-ku
     * @route   GET /transactions/:id/select-item
     */
    static async handleSelectSwapPage(req, res) {
        try {
            const transactionId = req.params.id;
            const transaction = await Transaction.getFullDetailById(transactionId);
            
            if (!transaction || transaction.proposer_user_id !== req.session.userId) {
                return res.status(403).send('Akses ditolak.');
            }
            if (transaction.offered_item_id) {
                return res.redirect(`/transactions/${transactionId}`);
            }

            const swappableItems = await Item.findSwappableByUserId(req.session.userId);

            res.render('selectSwapItem', {
                title: 'Pilih Item untuk Ditukar',
                items: swappableItems,
                transaction: transaction,
                bodyClass: 'page-profile'
            });
        } catch (error) {
            console.error("Error get select swap page:", error);
            res.status(500).send('Error Server');
        }
    }
    
    /**
     * @desc    Menampilkan Halaman Detail Transaksi
     * @route   GET /transactions/:id
     */
    static async handleGetTransactionDetail(req, res) {
        try {
            const transactionId = req.params.id;
            const transaction = await Transaction.getFullDetailById(transactionId);
            if (!transaction) return res.status(404).send('Transaksi tidak ditemukan.');

            const isOwner = transaction.owner_user_id === req.session.userId;
            const isProposer = transaction.proposer_user_id === req.session.userId;
            if (!isOwner && !isProposer) return res.status(403).send('Akses ditolak.');
            
            let itemsForSwap = [];
            if (transaction.type === 'swap' && isProposer && !transaction.offered_item_id) {
                itemsForSwap = await Item.findSwappableByUserId(req.session.userId);
            }

            // Cek status favorit
            let isFavorited = false;
            if (req.session.userId) {
                const Favorite = require('./Favorite');
                isFavorited = await Favorite.check(req.session.userId, transaction.item_main_id);
            }

            res.render('transactionDetail', {
                title: `Detail Transaksi #${transaction.id}`,
                transaction: transaction,
                isOwner: isOwner,
                isProposer: isProposer,
                itemsForSwap: itemsForSwap,
                bodyClass: 'page-profile',
                isFavorited: isFavorited
            });
        } catch (error) {
            console.error("Error get transaction detail:", error);
            res.status(500).send('Error Server');
        }
    }
    
    /**
     * @desc    [NOTIFIKASI - PUSAT] Menampilkan Halaman Navigasi Notifikasi
     * @route   GET /transactions/received
     */
    static async handleGetOffersHub(req, res) {
        try {
            res.render('receivedOffers', {
                title: 'Notifikasi Tawaran',
                user: res.locals.user,
                bodyClass: 'page-profile'
            });
        } catch (error) {
            console.error("Error get offers hub:", error);
            res.status(500).send('Error Server');
        }
    }

    /**
     * @desc    [NOTIFIKASI - MASUK] Menampilkan daftar tawaran yang DITERIMA
     * @route   GET /transactions/received/incoming
     */
    static async handleGetIncomingOffers(req, res) {
        try {
            const offersReceived = await Transaction.findReceivedByUserId(req.session.userId);
            res.render('offerListIncoming', {
                title: 'Tawaran Diterima',
                offers: offersReceived,
                user: res.locals.user,
                bodyClass: 'page-profile'
            });
        } catch (error) {
            console.error("Error get incoming offers:", error);
            res.status(500).send('Error Server');
        }
    }

    /**
     * @desc    [NOTIFIKASI - KELUAR] Menampilkan daftar tawaran yang DIKIRIM
     * @route   GET /transactions/received/outgoing
     */
    static async handleGetOutgoingOffers(req, res) {
        try {
            const offersSent = await Transaction.findSentByUserId(req.session.userId);
            res.render('offerListOutgoing', {
                title: 'Tawaran Terkirim',
                offers: offersSent,
                user: res.locals.user,
                bodyClass: 'page-profile'
            });
        } catch (error) {
            console.error("Error get outgoing offers:", error);
            res.status(500).send('Error Server');
        }
    }

    // --- FUNGSI AKSI (KONFIRMASI) ---
    
    /**
     * @desc    [SWAP - STEP 3] Penawar memilih item untuk ditukar
     * @route   POST /transactions/:id/select-swap
     */
    static async handleSelectSwapItem(req, res) {
        try {
            const { offeredItemId } = req.body;
            const transactionId = req.params.id;

            if (!offeredItemId) {
                return res.status(400).send('Anda harus memilih salah satu item untuk ditukar.');
            }

            const sql = 'UPDATE transaction_details SET offered_item_id = ? WHERE transaction_id = ?';
            await db.execute(sql, [offeredItemId, transactionId]);
            res.redirect(`/transactions/${transactionId}`);
        } catch (error) {
             console.error("Error select swap item:", error);
             res.status(500).send('Error Server');
        }
    }

    /**
     * @desc    Pemilik menerima tawaran
     * @route   POST /transactions/:id/accept
     */
    static async handleAcceptOffer(req, res) {
        try {
            const transactionId = req.params.id;
            await Transaction.updateStatus(transactionId, 'accepted');
            res.redirect(`/transactions/${transactionId}`);
        } catch (error) {
             console.error("Error accept offer:", error);
             res.status(500).send('Error Server');
        }
    }

    /**
     * @desc    Pemilik menolak tawaran
     * @route   POST /transactions/:id/reject
     */
    static async handleRejectOffer(req, res) {
        try {
            const transactionId = req.params.id;
            await Transaction.updateStatus(transactionId, 'rejected');
            res.redirect(`/transactions/${transactionId}`);
        } catch (error) {
             console.error("Error reject offer:", error);
             res.status(500).send('Error Server');
        }
    }
    
    /**
     * @desc    Penawar membatalkan tawaran
     * @route   POST /transactions/:id/cancel
     */
    static async handleCancelOffer(req, res) {
        try {
            const transactionId = req.params.id;
            const userId = req.session.userId;

            const transaction = await Transaction.findById(transactionId);
            if (!transaction || transaction.proposer_user_id !== userId) {
                return res.status(403).send('Akses ditolak.');
            }
            if (transaction.status !== 'pending') {
                return res.status(400).send('Tidak bisa membatalkan tawaran yang sudah direspon.');
            }

            await Transaction.updateStatus(transactionId, 'cancelled');
            res.redirect('/transactions/received/outgoing');
        } catch (error) {
             console.error("Error saat membatalkan tawaran:", error);
             res.status(500).send('Error Server');
        }
    }
    
    /**
     * @desc    Penawar menghapus/menyembunyikan riwayat tawaran
     * @route   POST /transactions/:id/hide-sent
     */
    static async handleHideSentOffer(req, res) {
        try {
            const transactionId = req.params.id;
            const userId = req.session.userId;
            const transaction = await Transaction.findById(transactionId);
            if (!transaction || transaction.proposer_user_id !== userId) {
                return res.status(403).send('Akses ditolak.');
            }
            if (transaction.status === 'pending') {
                return res.status(400).send('Tidak bisa menghapus tawaran yang masih pending. Batalkan dulu.');
            }
            await Transaction.hideForProposer(transactionId, userId);
            res.redirect('/transactions/received/outgoing');
        } catch (error) {
             console.error("Error saat menyembunyikan tawaran:", error);
             res.status(500).send('Error Server');
        }
    }

    /**
     * @desc    Pemilik menghapus/menyembunyikan riwayat tawaran
     * @route   POST /transactions/:id/hide-received
     */
    static async handleHideReceivedOffer(req, res) {
        try {
            const transactionId = req.params.id;
            const userId = req.session.userId;

            const transaction = await Transaction.findById(transactionId);
            if (!transaction || transaction.owner_user_id !== userId) {
                return res.status(403).send('Akses ditolak.');
            }

            if (transaction.status === 'pending') {
                return res.status(400).send('Tidak bisa menghapus tawaran yang masih pending. Respon dulu.');
            }

            await Transaction.hideForOwner(transactionId, userId);
            res.redirect('/transactions/received/incoming');

        } catch (error) {
             console.error("Error saat menyembunyikan tawaran:", error);
             res.status(500).send('Error Server');
        }
    }
    
    /**
     * @desc    Penawar mengonfirmasi pesanan telah diterima (Menyelesaikan Transaksi)
     * @route   POST /transactions/:id/complete
     */
    static async handleCompleteTransaction(req, res) {
        try {
            const transactionId = req.params.id;
            const userId = req.session.userId;

            const transaction = await Transaction.findById(transactionId);
            if (!transaction) {
                return res.status(404).send('Transaksi tidak ditemukan.');
            }
            if (transaction.proposer_user_id !== userId) {
                return res.status(403).send('Akses ditolak.');
            }
            if (transaction.status !== 'accepted') {
                return res.status(400).send('Tawaran ini belum diterima oleh penjual.');
            }

            // 1. Update status Transaksi
            await Transaction.updateStatus(transactionId, 'completed');
            
            // 2. [BARU] Update status Item menjadi 'Terjual'
            // (Memastikan fungsi updateItemStatus ada di Item model sebelum dipanggil)
            if (Item.updateItemStatus) {
                await Item.updateItemStatus(transaction.item_id, 'Terjual');
            }
            
            res.redirect(`/transactions/${transactionId}`);

        } catch (error) {
             console.error("Error saat konfirmasi penerimaan:", error);
             res.status(500).send('Error Server');
        }
    }
}

// Salin semua fungsi handler
Object.assign(Transaction, {
    handleGetCheckoutPage: Transaction.handleGetCheckoutPage,
    handleConfirmPurchase: Transaction.handleConfirmPurchase,
    handleStartSwap: Transaction.handleStartSwap,
    handleSelectSwapPage: Transaction.handleSelectSwapPage,
    handleGetTransactionDetail: Transaction.handleGetTransactionDetail,
    handleGetOffersHub: Transaction.handleGetOffersHub,
    handleGetIncomingOffers: Transaction.handleGetIncomingOffers,
    handleGetOutgoingOffers: Transaction.handleGetOutgoingOffers,
    handleSelectSwapItem: Transaction.handleSelectSwapItem,
    handleAcceptOffer: Transaction.handleAcceptOffer,
    handleRejectOffer: Transaction.handleRejectOffer,
    handleCancelOffer: Transaction.handleCancelOffer,
    handleHideSentOffer: Transaction.handleHideSentOffer,
    handleHideReceivedOffer: Transaction.handleHideReceivedOffer,
    handleCompleteTransaction: Transaction.handleCompleteTransaction
});

module.exports = Transaction;