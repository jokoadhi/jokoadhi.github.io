// 1. Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyChZAF70ZcKWupl7z4Jb82lxxIG7KxcGGk",
  authDomain: "blog-d8645.firebaseapp.com",
  projectId: "blog-d8645",
  storageBucket: "blog-d8645.firebasestorage.app",
  messagingSenderId: "675107353854",
  appId: "1:675107353854:web:b53ba3a030e52ba0e821af",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let paymentModal;

document.addEventListener("DOMContentLoaded", function () {
  // --- A. FUNGSI MAINTENANCE ---
  const maintenanceLinks = document.querySelectorAll(".link-under-maintenance");
  maintenanceLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      Swal.fire({
        icon: "info",
        title: "Maintenance",
        text: "⚠️ Modul ini sedang dalam proses pembenahan...",
        confirmButtonColor: "#ffc107",
        confirmButtonText: "Oke, Saya Mengerti",
      });
    });
  });

  // --- B. TOAST NOTIFICATION ---
  const toastEl = document.getElementById("projectNotification");
  if (typeof bootstrap !== "undefined" && toastEl) {
    const toast = new bootstrap.Toast(toastEl, { autohide: true });
    setTimeout(() => {
      toast.show();
    }, 2000);
  }

  // --- C. CEK STATUS AKSES VIP ---
  const modalEl = document.getElementById("paymentModal");
  // PRIORITAS: Cari main-content-vip dulu, jika tidak ada baru main-content biasa
  const mainContent =
    document.querySelector(".main-content-vip") ||
    document.querySelector(".main-content");

  if (modalEl && mainContent) {
    paymentModal = new bootstrap.Modal(modalEl);
    const isUnlocked = localStorage.getItem("is_isolir_unlocked");

    // Hanya jalankan logika penguncian jika halaman memiliki class 'main-content-vip'
    if (mainContent.classList.contains("main-content-vip")) {
      if (isUnlocked === "true") {
        handleAlreadyUnlocked(mainContent);
      } else {
        mainContent.style.display = "none";
        paymentModal.show();
      }
    } else {
      // Jika halaman modul biasa (bukan VIP), pastikan konten tampil
      mainContent.style.display = "block";
    }
  }
});

// --- FUNGSI: Loading Otomatis untuk User Terdaftar ---
function handleAlreadyUnlocked(mainContent) {
  const overlay = document.getElementById("loadingOverlay");
  const loaderStatus = document.getElementById("loaderStatus");
  const loadingText = document.getElementById("loadingText");

  if (overlay) {
    mainContent.style.display = "none";
    overlay.style.display = "flex";
    if (loadingText) loadingText.innerHTML = "Memverifikasi Lisensi VIP...";

    setTimeout(() => {
      if (loaderStatus)
        loaderStatus.innerHTML =
          '<div class="success-icon" style="font-size: 50px; color: #28a745; margin-bottom: 20px;">✔️</div>';
      if (loadingText) {
        loadingText.innerHTML = "Akses Lisensi Diizinkan!";
        loadingText.style.color = "#28a745";
      }

      setTimeout(() => {
        overlay.style.display = "none";
        mainContent.style.display = "block";

        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
        Toast.fire({
          icon: "success",
          title: "Selamat Datang Kembali!",
        });
      }, 1000);
    }, 1500);
  } else {
    mainContent.style.display = "block";
  }
}

// --- D. LOGIKA VERIFIKASI ID TRANSAKSI ---
const btnVerify = document.getElementById("btnVerify");
if (btnVerify) {
  btnVerify.onclick = async function () {
    const invoiceInput = document.getElementById("invoiceInput");
    const invoiceId = invoiceInput ? invoiceInput.value.trim() : "";

    if (!invoiceId) {
      return Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Silakan masukkan ID Transaksi terlebih dahulu!",
        confirmButtonColor: "#212529",
      });
    }

    btnVerify.disabled = true;
    btnVerify.innerText = "Memproses...";

    let deviceId = localStorage.getItem("v_device_id");
    if (!deviceId) {
      deviceId = "dev-" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("v_device_id", deviceId);
    }

    try {
      const docRef = db.collection("vip_access").doc(invoiceId);
      const doc = await docRef.get();

      if (doc.exists) {
        let data = doc.data();
        let devices = data.registered_devices || [];

        if (devices.includes(deviceId)) {
          unlockWithAnimation();
        } else if (devices.length < 2) {
          devices.push(deviceId);
          await docRef.update({ registered_devices: devices });
          unlockWithAnimation();
        } else {
          Swal.fire({
            icon: "error",
            title: "Limit Tercapai",
            text: "Gagal! Kode ini sudah mencapai batas maksimal 2 perangkat.",
            confirmButtonColor: "#dc3545",
          });
        }
      } else {
        Swal.fire({
          icon: "question",
          title: "Tidak Ditemukan",
          text: "ID Transaksi tidak ditemukan. Pastikan Anda sudah membayar atau tunggu aktivasi manual dari Admin.",
          confirmButtonColor: "#212529",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan jaringan atau izin database.",
      });
    } finally {
      btnVerify.disabled = false;
      btnVerify.innerText = "Buka Akses";
    }
  };
}

// --- E. FUNGSI UNLOCK DENGAN ANIMASI (Untuk Pembelian Baru) ---
function unlockWithAnimation() {
  const overlay = document.getElementById("loadingOverlay");
  const loaderStatus = document.getElementById("loaderStatus");
  const loadingText = document.getElementById("loadingText");
  const mainContent =
    document.querySelector(".main-content-vip") ||
    document.querySelector(".main-content");

  if (paymentModal) paymentModal.hide();

  if (overlay) {
    overlay.style.display = "flex";

    setTimeout(() => {
      if (loaderStatus)
        loaderStatus.innerHTML =
          '<div class="success-icon" style="font-size: 50px; color: #28a745; margin-bottom: 20px;">✔️</div>';
      if (loadingText) {
        loadingText.innerHTML = "Pembayaran Berhasil Diverifikasi!";
        loadingText.style.color = "#28a745";
      }

      setTimeout(() => {
        overlay.style.display = "none";
        localStorage.setItem("is_isolir_unlocked", "true");
        if (mainContent) mainContent.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });

        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
        Toast.fire({
          icon: "success",
          title: "Selamat membaca modul VIP!",
        });
      }, 1500);
    }, 2000);
  } else {
    localStorage.setItem("is_isolir_unlocked", "true");
    if (mainContent) mainContent.style.display = "block";
  }
}

// --- G. LOGIKA TOMBOL BAYAR ---
const payBtn = document.getElementById("paySaweria");
if (payBtn) {
  payBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const urlTujuan = this.getAttribute("href");
    Swal.fire({
      title: "Instruksi Pembayaran",
      html: `
          <div class="text-start" style="font-size: 0.95rem;">
            <p>Setelah mengklik tombol di bawah:</p>
            <ol>
              <li>Selesaikan pembayaran di halaman <b>Saweria</b>.</li>
              <li><b>PENTING:</b> Simpan/Salin <b>ID Transaksi</b> yang muncul di layar sukses atau email (Contoh: SWR-2026XXX).</li>
              <li>Kembali ke sini dan masukkan ID tersebut untuk membuka modul.</li>
            </ol>
          </div>`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#ffc107",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Lanjut ke Pembayaran",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(urlTujuan, "_blank");
      }
    });
  });
}
