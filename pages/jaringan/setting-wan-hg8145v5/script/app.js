document
  .getElementById("xmlDownloadButton")
  .addEventListener("click", function () {
    // URL Raw Content yang Anda berikan
    const fileUrl =
      "https://raw.githubusercontent.com/jokoadhi/config-huawei-HG8145V5/refs/heads/main/config-hg8145v5.xml";
    const fileName = "config-hg8145v5.xml";

    // ⚠️ Menggunakan fetch untuk mengambil konten file
    fetch(fileUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Gagal mengambil file: " + response.statusText);
        }
        // Ambil konten sebagai teks biasa
        return response.text();
      })
      .then((textData) => {
        // Konversi konten teks menjadi Blob dengan tipe aplikasi umum (bukan XML)
        const blob = new Blob([textData], { type: "application/octet-stream" });

        // Membuat URL objek dari Blob
        const url = window.URL.createObjectURL(blob);

        // Membuat elemen link tersembunyi
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = fileName; // Atribut download yang memicu penyimpanan

        // Pemicuan download
        document.body.appendChild(a);
        a.click();

        // Membersihkan URL dan elemen setelah download
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((error) => {
        console.error("Download XML gagal secara paksa:", error);
        alert(
          "Gagal mengunduh file secara otomatis. Silakan klik kanan tautan atau periksa konsol browser."
        );
      });
  });
