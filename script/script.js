document.addEventListener("DOMContentLoaded", function () {
  // 1. Definisikan kelas yang akan memicu pemberitahuan
  const maintenanceClass = "link-under-maintenance";

  // 2. Definisikan pesan pemberitahuan
  const alertMessage =
    "⚠️ Modul ini sedang dalam proses pembenahan dan tidak dapat diakses saat ini. Mohon maaf atas ketidaknyamanannya.";

  // 3. Cari semua tautan dengan kelas yang ditentukan
  const maintenanceLinks = document.querySelectorAll(`.${maintenanceClass}`);

  // 4. Tambahkan event listener untuk setiap tautan
  maintenanceLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      // Mencegah tindakan default (mengikuti tautan)
      event.preventDefault();

      // Tampilkan pesan pemberitahuan kepada klien
      alert(alertMessage);
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const toastEl = document.getElementById("projectNotification");

  if (typeof bootstrap !== "undefined" && toastEl) {
    const toast = new bootstrap.Toast(toastEl, {
      autohide: true, // Masih menggunakan autohide dari data-bs-delay="10000"
    });

    // =======================================================
    // MODIFIKASI: Menunda kemunculan toast selama 2000 ms (2 detik)
    // =======================================================
    setTimeout(function () {
      // 2. Tampilkan notifikasi setelah penundaan
      toast.show();
    }, 2000); // Waktu penundaan: 2000 milidetik = 2 detik

    // 1. Event Listener untuk Animasi Masuk/Keluar (TIDAK BERUBAH)
    toastEl.addEventListener("show.bs.toast", function () {
      toastEl.classList.add("showing-slide");
    });

    toastEl.addEventListener("hide.bs.toast", function () {
      toastEl.classList.remove("showing-slide");
      toastEl.classList.add("hide-slide");
    });

    toastEl.addEventListener("hidden.bs.toast", function () {
      toastEl.classList.remove("hide-slide");
    });
  }
});
