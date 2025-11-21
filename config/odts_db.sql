-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 21 Nov 2025 pada 02.56
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `odts_db`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `favorites`
--

CREATE TABLE `favorites` (
  `user_id` int(11) UNSIGNED NOT NULL COMMENT 'ID User yang Like',
  `item_id` int(11) UNSIGNED NOT NULL COMMENT 'ID Item yang Di-like',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `favorites`
--

INSERT INTO `favorites` (`user_id`, `item_id`, `created_at`) VALUES
(1, 25, '2025-11-11 03:34:26'),
(1, 26, '2025-11-13 04:33:38'),
(1, 33, '2025-11-07 17:30:51'),
(1, 35, '2025-11-18 14:03:00'),
(1, 40, '2025-11-18 16:30:06'),
(2, 14, '2025-11-07 15:34:10');

-- --------------------------------------------------------

--
-- Struktur dari tabel `items`
--

CREATE TABLE `items` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `category` varchar(50) NOT NULL COMMENT 'Contoh: Atasan, Bawahan dan pernak-pernik',
  `size` varchar(20) NOT NULL COMMENT 'Contoh: S, M, L, All Size',
  `status` enum('Hanya Pamer','Bisa di-Swap','Dijual','Terjual') NOT NULL DEFAULT 'Hanya Pamer',
  `price` decimal(10,2) DEFAULT NULL COMMENT 'Hanya diisi jika statusnya Dijual',
  `image_url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `items`
--

INSERT INTO `items` (`id`, `user_id`, `title`, `description`, `category`, `size`, `status`, `price`, `image_url`, `created_at`) VALUES
(5, 1, 'y2k', 'ootd', 'Atasan', 'L', 'Hanya Pamer', NULL, 'uploads/itemImage-1760042474376-339513719.jpg', '2025-10-09 20:41:14'),
(6, 1, 'clean', 'ootd', 'Atasan', 'L', 'Hanya Pamer', NULL, 'uploads/itemImage-1760042500581-642516256.jpg', '2025-10-09 20:41:40'),
(7, 1, 'school', 'ootd', 'Atasan', 'L', 'Hanya Pamer', NULL, 'uploads/itemImage-1760042559466-24616594.jpg', '2025-10-09 20:42:39'),
(9, 1, 'Fanel', 'dijual atasan bahan fanel #jualbeli', 'Atasan', 'L', 'Terjual', 15000.00, 'uploads/itemImage-1761493125019-843552790.jpg', '2025-10-26 15:38:45'),
(10, 1, 'You Green', 'barter minat??', 'Jaket', 'L', 'Hanya Pamer', NULL, 'uploads/itemImage-1761493352062-392197065.jpg', '2025-10-26 15:42:32'),
(14, 1, 'On My Way', 'see u guys', 'Aksesoris', 'L', 'Hanya Pamer', NULL, 'uploads/itemImage-1761661987674-845205856.jpg', '2025-10-28 14:33:07'),
(22, 6, 'YOO!!', 'tukar', 'Atasan', 'L', 'Terjual', NULL, 'uploads/itemImage-1762158896780-695952757.jpg', '2025-11-03 08:34:56'),
(25, 10, 'school', 'yup yupp', 'Atasan', 'L', 'Hanya Pamer', NULL, 'uploads/itemImage-1762531298641-166148778.jpg', '2025-11-07 16:01:38'),
(26, 2, 'Mountain', '2329mdpl', 'Atasan', 'L', 'Hanya Pamer', NULL, 'uploads/itemImage-1762531862118-171488350.jpg', '2025-11-07 16:11:02'),
(31, 1, 'tp tp', 'healing timee', 'Atasan', 'L', 'Hanya Pamer', NULL, 'uploads/itemImage-1762532688994-73312776.jpg', '2025-11-07 16:24:49'),
(32, 1, 'Year Book', 'Clean', 'Atasan', 'L', 'Hanya Pamer', NULL, 'uploads/itemImage-1762533336965-521984710.jpg', '2025-11-07 16:35:36'),
(33, 2, 'The Winner Take It Alllll', 'yummy', 'Atasan', 'L', 'Hanya Pamer', NULL, 'uploads/itemImage-1762533538246-242439889.jpg', '2025-11-07 16:38:58'),
(35, 6, 'di jual', '', 'Atasan', 'L', 'Dijual', 150000.00, 'uploads/itemImage-1762954215802-395514233.jpg', '2025-11-12 13:30:15'),
(36, 9, 'Jual Hodie', 'dijual cepat', 'Jaket', 'L', 'Dijual', 200000.00, 'uploads/itemImage-1762968883111-192206547.jpg', '2025-11-12 17:34:43'),
(37, 9, 'Swap Sweater', 'tukarr', 'Atasan', 'L', 'Bisa di-Swap', NULL, 'uploads/itemImage-1762968977776-743515945.jpg', '2025-11-12 17:36:17'),
(38, 6, 'late', 'huftt', 'Bawahan', 'M', 'Dijual', 190000.00, 'uploads/itemImage-1763482727000-151807514.jpg', '2025-11-18 16:18:47'),
(39, 1, 'alone', 'lovely lovely...', 'Aksesoris', '-', 'Terjual', NULL, 'uploads/itemImage-1763482890957-792890539.jpg', '2025-11-18 16:21:30'),
(40, 2, 'oke', 'swtch', 'Bawahan', 'M', 'Terjual', NULL, 'uploads/itemImage-1763482965849-133843518.jpg', '2025-11-18 16:22:45'),
(43, 11, 'barter', 'secepatnya', 'Atasan', 'L', 'Terjual', NULL, 'uploads/itemImage-1763689378395-948720974.jpg', '2025-11-21 01:42:58'),
(44, 9, 'barter', 'secepatnya', 'Atasan', 'L', 'Terjual', NULL, 'uploads/itemImage-1763689470287-73575663.jpg', '2025-11-21 01:44:30'),
(45, 9, 'jual', '', 'Dress', 'M', 'Dijual', 150000.00, 'uploads/itemImage-1763689601941-886678578.jpg', '2025-11-21 01:46:41');

-- --------------------------------------------------------

--
-- Struktur dari tabel `item_photos`
--

CREATE TABLE `item_photos` (
  `id` int(10) UNSIGNED NOT NULL,
  `item_id` int(10) UNSIGNED NOT NULL,
  `photo_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `item_tags`
--

CREATE TABLE `item_tags` (
  `item_id` int(10) UNSIGNED NOT NULL,
  `tag_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tags`
--

CREATE TABLE `tags` (
  `id` int(10) UNSIGNED NOT NULL,
  `tag_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) UNSIGNED NOT NULL,
  `item_id` int(11) UNSIGNED NOT NULL COMMENT 'Item yang ditawar',
  `proposer_user_id` int(11) UNSIGNED NOT NULL COMMENT 'User yang mengajukan tawaran',
  `owner_user_id` int(11) UNSIGNED NOT NULL COMMENT 'User pemilik item',
  `type` enum('buy','swap') NOT NULL COMMENT 'Jenis tawaran',
  `status` enum('pending','accepted','rejected','completed','cancelled') NOT NULL DEFAULT 'pending',
  `message` text DEFAULT NULL COMMENT 'Pesan awal dari penawar',
  `shipping_address` text DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_proof_url` varchar(255) DEFAULT NULL,
  `proposer_hidden` tinyint(1) NOT NULL DEFAULT 0,
  `owner_hidden` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `transactions`
--

INSERT INTO `transactions` (`id`, `item_id`, `proposer_user_id`, `owner_user_id`, `type`, `status`, `message`, `shipping_address`, `payment_method`, `payment_proof_url`, `proposer_hidden`, `owner_hidden`, `created_at`, `updated_at`) VALUES
(1, 35, 1, 6, 'buy', 'rejected', 'as', NULL, NULL, NULL, 1, 1, '2025-11-12 13:31:46', '2025-11-12 17:31:29'),
(2, 35, 1, 6, 'buy', 'cancelled', 'as', NULL, NULL, NULL, 1, 1, '2025-11-12 13:31:56', '2025-11-12 16:54:35'),
(3, 35, 1, 6, 'buy', 'cancelled', 'Pengajuan pembelian', NULL, NULL, NULL, 1, 1, '2025-11-12 13:43:13', '2025-11-12 16:54:32'),
(4, 35, 1, 6, 'buy', 'cancelled', 'Pengajuan pembelian', NULL, NULL, NULL, 1, 1, '2025-11-12 13:50:29', '2025-11-12 16:54:29'),
(5, 22, 1, 6, 'swap', 'rejected', 'Tawaran barter dimulai', NULL, NULL, NULL, 1, 1, '2025-11-12 13:51:36', '2025-11-12 17:31:33'),
(6, 35, 1, 6, 'buy', 'cancelled', 'Pengajuan pembelian', 'sumenep,block c 21', 'COD (Bayar di Tempat)', NULL, 1, 1, '2025-11-12 14:14:41', '2025-11-12 16:54:26'),
(7, 9, 6, 1, 'buy', 'completed', 'Pengajuan pembelian', 'sumenep ', 'COD (Bayar di Tempat)', NULL, 1, 1, '2025-11-12 16:56:02', '2025-11-18 16:08:12'),
(8, 10, 2, 1, 'swap', 'cancelled', 'Tawaran barter dimulai', NULL, NULL, NULL, 1, 1, '2025-11-12 17:25:19', '2025-11-12 17:32:24'),
(9, 10, 2, 1, 'swap', 'cancelled', 'Tawaran barter dimulai', NULL, NULL, NULL, 1, 1, '2025-11-12 17:26:47', '2025-11-12 17:32:29'),
(10, 10, 2, 1, 'swap', 'cancelled', 'Tawaran barter dimulai', NULL, NULL, NULL, 1, 1, '2025-11-12 17:28:46', '2025-11-12 17:32:26'),
(11, 22, 1, 6, 'swap', 'accepted', 'Tawaran barter dimulai', NULL, NULL, NULL, 1, 1, '2025-11-12 17:30:12', '2025-11-18 16:09:51'),
(12, 37, 1, 9, 'swap', 'cancelled', 'Tawaran barter dimulai', NULL, NULL, NULL, 1, 1, '2025-11-12 17:37:50', '2025-11-12 18:10:44'),
(13, 37, 1, 9, 'swap', 'rejected', 'Tawaran barter dimulai', NULL, NULL, NULL, 1, 1, '2025-11-12 18:03:04', '2025-11-18 16:00:48'),
(14, 36, 1, 9, 'buy', 'accepted', 'Pengajuan pembelian', 'sdfghj', 'COD (Bayar di Tempat)', NULL, 1, 1, '2025-11-12 18:07:45', '2025-11-18 16:00:46'),
(15, 22, 1, 6, 'swap', 'cancelled', 'Tawaran barter dimulai', NULL, NULL, NULL, 1, 1, '2025-11-13 04:48:05', '2025-11-13 17:02:31'),
(16, 36, 1, 9, 'buy', 'cancelled', 'Pengajuan pembelian', 'batuan', 'Transfer Bank', NULL, 1, 1, '2025-11-13 04:59:49', '2025-11-18 16:00:43'),
(17, 37, 1, 9, 'swap', 'cancelled', 'Tawaran barter dimulai', NULL, NULL, NULL, 1, 1, '2025-11-13 05:05:00', '2025-11-18 16:00:40'),
(18, 35, 1, 6, 'buy', 'rejected', 'Pengajuan pembelian', 'hib', 'Transfer Bank', NULL, 1, 1, '2025-11-13 15:22:02', '2025-11-18 16:09:48'),
(19, 37, 6, 9, 'swap', 'cancelled', 'Tawaran barter dimulai', NULL, NULL, NULL, 1, 1, '2025-11-13 17:00:17', '2025-11-20 14:02:20'),
(20, 36, 1, 9, 'buy', 'accepted', 'Pengajuan pembelian', 'perum batuan', 'Transfer Bank', NULL, 1, 1, '2025-11-14 02:04:44', '2025-11-18 16:09:46'),
(21, 9, 2, 1, 'buy', 'completed', 'Pengajuan pembelian', 'gh', 'COD (Bayar di Tempat)', NULL, 0, 1, '2025-11-18 15:44:42', '2025-11-18 15:58:31'),
(22, 9, 9, 1, 'buy', 'cancelled', 'Pengajuan pembelian', 'ef', 'COD (Bayar di Tempat)', NULL, 1, 1, '2025-11-18 15:49:09', '2025-11-18 15:58:28'),
(23, 9, 9, 1, 'buy', 'completed', 'Pengajuan pembelian', 'qwe', 'COD (Bayar di Tempat)', NULL, 1, 0, '2025-11-18 15:57:55', '2025-11-20 14:02:29'),
(24, 22, 1, 6, 'swap', 'completed', 'Tawaran barter dimulai', NULL, NULL, NULL, 0, 0, '2025-11-18 16:08:47', '2025-11-18 16:10:29'),
(25, 40, 1, 2, 'swap', 'completed', 'Tawaran barter dimulai', NULL, NULL, NULL, 0, 0, '2025-11-20 13:25:53', '2025-11-20 13:26:33'),
(27, 43, 9, 11, 'swap', 'completed', 'Tawaran barter dimulai', NULL, NULL, NULL, 0, 0, '2025-11-21 01:44:39', '2025-11-21 01:45:53');

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaction_details`
--

CREATE TABLE `transaction_details` (
  `id` int(11) UNSIGNED NOT NULL,
  `transaction_id` int(11) UNSIGNED NOT NULL COMMENT 'Merujuk ke ID di tabel transactions',
  `offered_item_id` int(11) UNSIGNED DEFAULT NULL COMMENT 'Item yg ditawarkan (jika swap)',
  `agreed_price` decimal(10,2) DEFAULT NULL COMMENT 'Harga yg ditawar/disepakati (jika buy)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `transaction_details`
--

INSERT INTO `transaction_details` (`id`, `transaction_id`, `offered_item_id`, `agreed_price`) VALUES
(1, 1, NULL, 0.00),
(2, 2, NULL, 0.00),
(3, 3, NULL, 0.00),
(4, 4, NULL, 0.00),
(5, 5, NULL, NULL),
(6, 7, NULL, 15000.00),
(7, 8, NULL, NULL),
(8, 9, NULL, NULL),
(9, 10, NULL, NULL),
(10, 11, 10, NULL),
(11, 12, 10, NULL),
(12, 13, 10, NULL),
(13, 14, NULL, 200000.00),
(14, 15, NULL, NULL),
(15, 16, NULL, 200000.00),
(16, 17, NULL, NULL),
(17, 18, NULL, 150000.00),
(18, 19, 22, NULL),
(19, 20, NULL, 200000.00),
(20, 21, NULL, 15000.00),
(21, 22, NULL, 15000.00),
(22, 23, NULL, 15000.00),
(23, 24, 10, NULL),
(24, 25, 39, NULL),
(26, 27, 44, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Password disimpan dalam bentuk hash',
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `status` enum('active','banned') NOT NULL DEFAULT 'active',
  `profile_picture_url` varchar(255) DEFAULT 'default_avatar.png',
  `bio` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_active` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `phone_number`, `password`, `role`, `status`, `profile_picture_url`, `bio`, `created_at`, `last_active`) VALUES
(1, 'AJ', 'ajilltan@gmail.com', '085211626', '$2a$10$gnl4K48AyzciqTOrgnbtaOqwE5R07pbQYf1zbvTc2A5qkJISDbFi2', 'user', 'active', 'uploads/profilePicture-1762536615860-603147635.jpg', NULL, '2025-10-09 17:07:31', '2025-11-20 13:26:24'),
(2, 'reo', 'reo@gmail.com', '08217494858', '$2a$10$ySx9ZZDdH5UKoGABmeMkPOvsJBlK5faDiH7V6d.nfJ2TSCLfV/xi.', 'user', 'active', 'uploads/profilePicture-1762531459734-800613183.jpg', NULL, '2025-10-13 04:33:05', '2025-11-20 13:26:06'),
(5, 'admin', 'admin@gmail.com', NULL, '$2a$10$pYXlRkR58ifn/E0xWlsokezSbKAIMcAoHMxIDOJXIpYOB90ROoDAq', 'admin', 'active', 'default_avatar.png', NULL, '2025-11-03 08:02:29', '2025-11-21 01:48:12'),
(6, 'petter', 'petter@gmail.com', '911', '$2a$10$IkTVtmDlT9r2MrCDr1kQZu.5JGQwPPQml1pK4RTXE6yweGVH6tVri', 'user', 'active', 'uploads/profilePicture-1762536828576-787688089.jpg', NULL, '2025-11-03 08:34:13', '2025-11-18 16:18:11'),
(7, 'panca', 'panca@gmail.com', NULL, '$2a$10$J8BhyeemctAmZn.LWjZse.W.p2R1XLRUDzWoY6TxYwX5Y5tMq5Dh2', 'user', 'active', 'default_avatar.png', NULL, '2025-11-04 02:21:29', NULL),
(9, 'darwin', 'darwin@gmail.com', '0987634', '$2a$10$s3m5KFPKqchESyUUULciR.Zp4zp3u4RkZr.S4BzArvQKufU9DRiOS', 'user', 'active', 'uploads/profilePicture-1762523380803-828915378.jpg', NULL, '2025-11-07 13:49:41', '2025-11-21 01:46:53'),
(10, 'ihsan', 'ihsan@gmail.com', '2381864', '$2a$10$S7gHkfIW6u8e8KXBLfmGzO2thw15F9WLp4jYm.Pp10l9yyFwzbqIu', 'user', 'active', 'uploads/profilePicture-1762531206053-187323548.jpg', NULL, '2025-11-07 14:40:39', NULL),
(11, 'miaww', 'miaw@gmail.com', '0852771', '$2a$10$cDBGxrvjy5oPTNnjMvT6hOAs605VD8E1m3Q9UI2UJ2lqrLprSi33m', 'user', 'active', 'uploads/profilePicture-1763647109498-774391894.jpg', NULL, '2025-11-20 13:57:21', '2025-11-21 01:47:03');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`user_id`,`item_id`),
  ADD KEY `fav_item_id_foreign` (`item_id`);

--
-- Indeks untuk tabel `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `item_photos`
--
ALTER TABLE `item_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indeks untuk tabel `item_tags`
--
ALTER TABLE `item_tags`
  ADD PRIMARY KEY (`item_id`,`tag_id`),
  ADD KEY `tag_id` (`tag_id`);

--
-- Indeks untuk tabel `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tag_name` (`tag_name`);

--
-- Indeks untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trans_item_id_foreign` (`item_id`),
  ADD KEY `trans_proposer_id_foreign` (`proposer_user_id`),
  ADD KEY `trans_owner_id_foreign` (`owner_user_id`);

--
-- Indeks untuk tabel `transaction_details`
--
ALTER TABLE `transaction_details`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`),
  ADD KEY `detail_offered_item_id_foreign` (`offered_item_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `items`
--
ALTER TABLE `items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT untuk tabel `item_photos`
--
ALTER TABLE `item_photos`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT untuk tabel `transaction_details`
--
ALTER TABLE `transaction_details`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `fav_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fav_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `item_photos`
--
ALTER TABLE `item_photos`
  ADD CONSTRAINT `item_photos_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `item_tags`
--
ALTER TABLE `item_tags`
  ADD CONSTRAINT `item_tags_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `item_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `trans_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trans_owner_id_foreign` FOREIGN KEY (`owner_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `trans_proposer_id_foreign` FOREIGN KEY (`proposer_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transaction_details`
--
ALTER TABLE `transaction_details`
  ADD CONSTRAINT `detail_offered_item_id_foreign` FOREIGN KEY (`offered_item_id`) REFERENCES `items` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `detail_transaction_id_foreign` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
