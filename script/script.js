/**
 * JOKO ADHI DOCS - MAIN SCRIPT (CLEAN VERSION)
 */

// 1. KONFIGURASI FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyChZAF70ZcKWupl7z4Jb82lxxIG7KxcGGk",
  authDomain: "blog-d8645.firebaseapp.com",
  projectId: "blog-d8645",
  storageBucket: "blog-d8645.firebasestorage.app",
  messagingSenderId: "675107353854",
  appId: "1:675107353854:web:b53ba3a030e52ba0e821af",
};

if (typeof firebase !== "undefined") {
  firebase.initializeApp(firebaseConfig);
}
const db = typeof firebase !== "undefined" ? firebase.firestore() : null;
let paymentModal;

// --- A. LOGIKA KALKULATOR KECEPATAN ---
function convertAllSpeed() {
  const valInput = document.getElementById("inputValue");
  const unitInput = document.getElementById("inputUnit");

  if (!valInput || !unitInput) return;

  const val = parseFloat(valInput.value);
  const unit = unitInput.value;

  if (isNaN(val)) {
    updateResultUI(0, 0, 0, 0, 0);
    return;
  }

  // Standarisasi ke bps
  let bps = 0;
  switch (unit) {
    case "bps":
      bps = val;
      break;
    case "mbps":
      bps = val * 1000000;
      break;
    case "mbps_byte":
      bps = val * 8000000;
      break;
    case "gbps":
      bps = val * 1000000000;
      break;
    case "gbps_byte":
      bps = val * 8000000000;
      break;
  }

  const mbps = bps / 1000000;
  const mbps_byte = mbps / 8;
  const gbps = bps / 1000000000;
  const gbps_byte = gbps / 8;

  updateResultUI(bps, mbps, mbps_byte, gbps, gbps_byte);
}

function updateResultUI(bps, mbps, mbps_byte, gbps, gbps_byte) {
  const ids = {
    "res-bps": bps.toLocaleString() + " bps",
    "res-mbps": mbps.toFixed(2) + " Mbps",
    "res-mbps-byte": mbps_byte.toFixed(2) + " MB/s",
    "res-gbps": gbps.toFixed(4) + " Gbps",
    "res-gbps-byte": gbps_byte.toFixed(4) + " GB/s",
  };

  for (const [id, text] of Object.entries(ids)) {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  }
}

// --- B. INITIALIZATION ON DOM LOAD ---
document.addEventListener("DOMContentLoaded", function () {
  // 1. Inisialisasi Kalkulator
  const inputCalc = document.getElementById("inputValue");
  const unitSelect = document.getElementById("inputUnit");

  if (inputCalc && unitSelect) {
    inputCalc.addEventListener("input", convertAllSpeed);
    unitSelect.addEventListener("change", convertAllSpeed);
    convertAllSpeed();
  }

  // 2. Maintenance Links
  document.querySelectorAll(".link-under-maintenance").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "info",
          title: "Maintenance",
          text: "⚠️ Fitur ini sedang dalam proses pembenahan...",
          confirmButtonColor: "#ffc107",
        });
      }
    });
  });

  // 3. Toast Notif
  const toastEl = document.getElementById("projectNotification");
  if (typeof bootstrap !== "undefined" && toastEl) {
    const toast = new bootstrap.Toast(toastEl, { autohide: true });
    setTimeout(() => {
      toast.show();
    }, 2000);
  }

  // 4. VIP Access Check
  const modalEl = document.getElementById("paymentModal");
  const mainContent =
    document.querySelector(".main-content-vip") ||
    document.querySelector(".main-content");

  if (modalEl && mainContent) {
    paymentModal = new bootstrap.Modal(modalEl);
    const isUnlocked = localStorage.getItem("is_isolir_unlocked");

    if (mainContent.classList.contains("main-content-vip")) {
      if (isUnlocked === "true") {
        handleAlreadyUnlocked(mainContent);
      } else {
        mainContent.style.display = "none";
        paymentModal.show();
      }
    } else {
      mainContent.style.display = "block";
    }
  }
});

// --- C. VIP FUNCTIONS ---
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
          '<div style="font-size: 50px; color: #28a745;">✔️</div>';
      if (loadingText) {
        loadingText.innerHTML = "Akses Diizinkan!";
        loadingText.style.color = "#28a745";
      }
      setTimeout(() => {
        overlay.style.display = "none";
        mainContent.style.display = "block";
      }, 1000);
    }, 1500);
  } else {
    mainContent.style.display = "block";
  }
}

const btnVerify = document.getElementById("btnVerify");
if (btnVerify) {
  btnVerify.onclick = async function () {
    const invoiceInput = document.getElementById("invoiceInput");
    const emailAkses = invoiceInput
      ? invoiceInput.value.trim().toLowerCase()
      : "";

    if (!emailAkses) {
      return Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Masukkan Email Transaksi!",
      });
    }

    btnVerify.disabled = true;
    btnVerify.innerText = "Memproses...";

    let deviceId =
      localStorage.getItem("v_device_id") ||
      "dev-" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("v_device_id", deviceId);

    try {
      const docRef = db.collection("vip_access").doc(emailAkses);
      const doc = await docRef.get();

      if (doc.exists) {
        let devices = doc.data().registered_devices || [];
        if (devices.includes(deviceId) || devices.length < 2) {
          if (!devices.includes(deviceId)) {
            devices.push(deviceId);
            await docRef.update({ registered_devices: devices });
          }
          unlockWithAnimation();
        } else {
          Swal.fire({
            icon: "error",
            title: "Limit Tercapai",
            text: "Maksimal 2 perangkat!",
          });
        }
      } else {
        Swal.fire({
          icon: "question",
          title: "Gagal",
          text: "Email tidak terdaftar.",
        });
      }
    } catch (e) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gangguan koneksi database.",
      });
    } finally {
      btnVerify.disabled = false;
      btnVerify.innerText = "Buka Akses";
    }
  };
}

const cidrSelect = document.getElementById("cidrPrefix");
if (cidrSelect) {
  for (let i = 32; i >= 1; i--) {
    let opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = `/${i}`;
    if (i === 24) opt.selected = true;
    cidrSelect.appendChild(opt);
  }
}

// LOGIKA SUBNET CALCULATOR DENGAN INDIKATOR KELAS
function calculateSubnet() {
  const ip = document.getElementById("ipAddress").value.trim();
  const prefix = parseInt(document.getElementById("cidrPrefix").value);

  // Validasi IP Sederhana
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipPattern.test(ip)) {
    if (typeof Swal !== "undefined") {
      Swal.fire("Error", "Format IP Address tidak valid!", "error");
    } else {
      alert("Format IP Address tidak valid!");
    }
    return;
  }

  const ipParts = ip.split(".").map(Number);

  // --- PENENTUAN KELAS IP ---
  let ipClass = "Unknown";
  const firstOctet = ipParts[0];

  if (firstOctet >= 1 && firstOctet <= 126) {
    ipClass = "Class A";
  } else if (firstOctet === 127) {
    ipClass = "Loopback Address";
  } else if (firstOctet >= 128 && firstOctet <= 191) {
    ipClass = "Class B";
  } else if (firstOctet >= 192 && firstOctet <= 223) {
    ipClass = "Class C";
  } else if (firstOctet >= 224 && firstOctet <= 239) {
    ipClass = "Class D (Multicast)";
  } else if (firstOctet >= 240 && firstOctet <= 255) {
    ipClass = "Class E (Experimental)";
  }

  // --- KALKULASI BINARY ---
  let ipBin =
    ((ipParts[0] << 24) |
      (ipParts[1] << 16) |
      (ipParts[2] << 8) |
      ipParts[3]) >>>
    0;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ipBin & mask) >>> 0;
  const broadcast = (network | ~mask) >>> 0;
  const totalHosts = prefix >= 31 ? 0 : Math.pow(2, 32 - prefix) - 2;

  // --- UPDATE UI ---
  const resultDiv = document.getElementById("subnetResult");
  if (resultDiv) resultDiv.classList.remove("d-none");

  document.getElementById("classRes").innerText = ipClass;
  document.getElementById("netmaskRes").innerText = numToIp(mask);
  document.getElementById("networkRes").innerText = numToIp(network);
  document.getElementById("broadcastRes").innerText = numToIp(broadcast);
  document.getElementById("firstRes").innerText =
    prefix >= 31 ? "N/A" : numToIp(network + 1);
  document.getElementById("lastRes").innerText =
    prefix >= 31 ? "N/A" : numToIp(broadcast - 1);
  document.getElementById("totalRes").innerText = totalHosts.toLocaleString();

  // Scroll otomatis ke hasil (opsional)
  resultDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// Helper: Convert Number to IP String
function numToIp(num) {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join(".");
}

let selectedImages = [];

// Event Listener untuk input gambar
document.addEventListener("change", function (e) {
  if (e.target && e.target.id === "imageInput") {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleImagePreview(files);
    }
  }
});

function handleImagePreview(files) {
  const previewContainer = document.getElementById("previewContainer");
  const actionArea = document.getElementById("actionArea");

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      selectedImages.push(event.target.result);
      const img = document.createElement("img");
      img.src = event.target.result;
      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  actionArea.classList.remove("d-none");
}

async function generatePDF() {
  if (selectedImages.length === 0) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10; // Margin 10mm

  Swal.fire({
    title: "Mengonversi...",
    text: "Menjaga kualitas & rasio foto",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  for (let i = 0; i < selectedImages.length; i++) {
    if (i > 0) doc.addPage();

    const imgData = selectedImages[i];

    // Gunakan Promise untuk mendapatkan dimensi asli gambar
    await new Promise((resolve) => {
      const img = new Image();
      img.src = imgData;
      img.onload = function () {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const ratio = imgWidth / imgHeight;

        // Hitung dimensi maksimal di dalam margin
        let maxWidth = pageWidth - margin * 2;
        let maxHeight = pageHeight - margin * 2;

        let finalWidth = maxWidth;
        let finalHeight = finalWidth / ratio;

        // Jika tinggi melebihi batas halaman, sesuaikan berdasarkan tinggi
        if (finalHeight > maxHeight) {
          finalHeight = maxHeight;
          finalWidth = finalHeight * ratio;
        }

        // Posisi tengah (Center)
        const xPos = (pageWidth - finalWidth) / 2;
        const yPos = (pageHeight - finalHeight) / 2;

        doc.addImage(
          imgData,
          "JPEG",
          xPos,
          yPos,
          finalWidth,
          finalHeight,
          undefined,
          "FAST"
        );
        resolve();
      };
    });
  }

  doc.save("JokoAdhiDocs_Final.pdf");
  Swal.fire({
    icon: "success",
    title: "Selesai!",
    text: "PDF berhasil dibuat tanpa distorsi.",
  });
}

let currentWordBuffer = null;

// Listener untuk Input File Word
document.addEventListener("change", function (e) {
  if (e.target && e.target.id === "wordInput") {
    const file = e.target.files[0];
    if (file) {
      document.getElementById("fileName").innerText = file.name;
      document.getElementById("fileSize").innerText =
        (file.size / 1024).toFixed(2) + " KB";
      document.getElementById("fileInfo").classList.remove("d-none");
      document.getElementById("btnConvert").classList.remove("d-none");

      const reader = new FileReader();
      reader.onload = function (event) {
        currentWordBuffer = event.target.result;
      };
      reader.readAsArrayBuffer(file);
    }
  }
});

async function convertToPDF() {
  const fileInput = document.getElementById("wordInput");
  if (!fileInput.files[0]) return;

  Swal.fire({
    title: "Memproses...",
    text: "Sedang dikoversi melalui Cloud Server.",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const response = await fetch(
      "https://wild-waterfall-429c.jokoadhikusumo.workers.dev",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) throw new Error("Gagal konversi di server.");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "JokoAdhiDocs_Presisi.pdf";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url); // Membersihkan memori

    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "File berhasil dikonversi",
      confirmButtonColor: "#28a745",
    });
  } catch (err) {
    console.error(err);
    Swal.fire("Gagal", "Terjadi gangguan koneksi ke Cloud Server.", "error");
  }
}

function resetConverter() {
  selectedImages = [];
  document.getElementById("previewContainer").innerHTML = "";
  document.getElementById("actionArea").classList.add("d-none");
  document.getElementById("imageInput").value = "";
}

function unlockWithAnimation() {
  const overlay = document.getElementById("loadingOverlay");
  if (paymentModal) paymentModal.hide();
  if (overlay) {
    overlay.style.display = "flex";
    setTimeout(() => {
      localStorage.setItem("is_isolir_unlocked", "true");
      location.reload();
    }, 2000);
  } else {
    localStorage.setItem("is_isolir_unlocked", "true");
    location.reload();
  }
}

const payBtn = document.getElementById("paySaweria");
if (payBtn) {
  payBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const url = this.getAttribute("href");
    Swal.fire({
      title: "Instruksi",
      text: "Selesaikan pembayaran di Saweria, lalu gunakan Email Anda untuk aktivasi.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Ke Saweria",
    }).then((res) => {
      if (res.isConfirmed) window.open(url, "_blank");
    });
  });
}
