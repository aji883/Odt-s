// Ambil elemen header
const header = document.querySelector('.main-header');
let lastScrollY = window.scrollY;

// Tambahkan event listener untuk mendeteksi scroll
window.addEventListener('scroll', () => {
    if (lastScrollY < window.scrollY && window.scrollY > 150) {
        // Jika scroll ke bawah & sudah melewati 150px dari atas
        header.classList.add('navbar--hidden');
    } else {
        // Jika scroll ke atas
        header.classList.remove('navbar--hidden');
    }

    // Update posisi scroll terakhir
    lastScrollY = window.scrollY;
});