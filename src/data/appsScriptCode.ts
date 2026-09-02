export const APPS_SCRIPT_CODE = `/**
 * =========================================================================================
 * SRI (SENI RANCANG INSPIRASI) - TEFA TEKNIK GRAFIKA SMK NEGERI 1 KALIGONDANG
 * GOOGLE APPS SCRIPT BACKEND DATABASE & GOOGLE DRIVE CDN STORAGE ENGINE
 * =========================================================================================
 * 
 * FUNGSI UTAMA:
 * 1. setupDatabase()    : Inisialisasi otomatis seluruh tabel database di Google Spreadsheet
 *                         (DB_PENGGUNA, DB_PESANAN, DB_PRODUK_JASA, DB_DOKUMEN_DRIVE, DB_PENGATURAN, DB_LOG_AKTIVITAS)
 * 2. Autentikasi Akun  : Login & Registrasi terpusat di Google Spreadsheet (DB_PENGGUNA)
 *                         (Semua username, password, dan role tersimpan di sheet, BUKAN di frontend)
 * 3. doGet() & doPost() : RESTful API Webhook untuk sinkronisasi pesanan, login, POS kasir, dan upload file
 * 4. Drive Storage      : Menyimpan gambar produk, jasa, dan dokumen desain pelanggan langsung
 *                         ke Google Drive Folder ID: 137xvx2o1czc7-nfbI8uHtIXwsm3ZFjL4
 * 5. Format CDN         : Menghasilkan link CDN berkecepatan tinggi & format authuser=0
 * 
 * CARA INSTALASI:
 * 1. Buka Google Spreadsheet baru / yang sudah ada.
 * 2. Klik menu 'Ekstensi' (Extensions) > 'Apps Script'.
 * 3. Hapus seluruh kode default di editor, lalu paste seluruh isi file ini (Code.gs).
 * 4. Pada dropdown fungsi di toolbar atas, pilih 'setupDatabase' lalu klik 'Jalankan' (Run).
 * 5. Berikan izin akses (Authorize) akun Google Anda.
 * 6. Klik tombol biru 'Terapkan' (Deploy) > 'Penerapan baru' (New deployment).
 *    - Pilih jenis: 'Aplikasi Web' (Web app)
 *    - Deskripsi: 'SRI TEFA Database API v2.0 (Centralized Auth & Storage)'
 *    - Jalankan sebagai: 'Saya' (Me / email Anda)
 *    - Siapa yang memiliki akses: 'Siapa saja' (Anyone) -> WAJIB agar web e-commerce bisa akses
 * 7. Salin Web App URL yang dihasilkan dan masukkan ke form pengaturan Admin Web TEFA.
 * =========================================================================================
 */

// ================= KONFIGURASI GLOBAL =================
var CONFIG = {
  APP_NAME: "SRI TEFA Grafika SMKN 1 Kaligondang",
  VERSION: "2.0.0",
  // Target Folder ID Google Drive untuk penyimpanan gambar produk, jasa, & file cetak
  DRIVE_FOLDER_ID: "137xvx2o1czc7-nfbI8uHtIXwsm3ZFjL4",
  SHEETS: {
    ORDERS: "DB_PESANAN",
    PRODUCTS: "DB_PRODUK_JASA",
    DRIVE_DOCS: "DB_DOKUMEN_DRIVE",
    USERS: "DB_PENGGUNA",
    SETTINGS: "DB_PENGATURAN",
    LOGS: "DB_LOG_AKTIVITAS"
  }
};

/**
 * =========================================================================================
 * 1. FITUR SETUP DATABASE OTOMATIS
 * Jalankan fungsi ini pertama kali dari menu toolbar Apps Script: setupDatabase
 * =========================================================================================
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  Logger.log("=== MEMULAI SETUP DATABASE SRI TEFA GRAFIKA ===");

  // -------------------------------------------------------------
  // 1. Setup Sheet DB_PENGGUNA (Akun Pengguna & Hak Akses Terpusat)
  // -------------------------------------------------------------
  var sheetUsers = getOrCreateSheet(ss, CONFIG.SHEETS.USERS);
  var userHeaders = [
    "ID_User",
    "Username",
    "Password",
    "Nama_Lengkap",
    "Role",               // admin | cashier | customer
    "Email",
    "No_WhatsApp",
    "Instansi_Alamat",
    "Status_Aktif",       // AKTIF | NONAKTIF
    "Created_At",
    "Last_Login"
  ];
  setupSheetHeaders(sheetUsers, userHeaders, "#4338ca", "#ffffff");

  // Isi data akun awal di Google Spreadsheet jika masih kosong
  if (sheetUsers.getLastRow() <= 1) {
    var nowStr = new Date().toLocaleString("id-ID");
    var defaultUsers = [
      [
        "USR-001",
        "admin",
        "admin123",
        "Pak Sugeng (Kepala TEFA Grafika)",
        "admin",
        "tefa.grafika@smkn1kaligondang.sch.id",
        "081234567890",
        "Bengkel Teknik Grafika SMKN 1 Kaligondang",
        "AKTIF",
        nowStr,
        nowStr
      ],
      [
        "USR-002",
        "kasir",
        "kasir123",
        "Operator Kasir TEFA",
        "cashier",
        "kasir.tefa@smkn1kaligondang.sch.id",
        "081299887766",
        "Front Office TEFA SMKN 1 Kaligondang",
        "AKTIF",
        nowStr,
        nowStr
      ],
      [
        "USR-003",
        "pelanggan",
        "user123",
        "Ahmad Fauzi (UMKM Snack)",
        "customer",
        "ahmadfauzi.snack@gmail.com",
        "085712345678",
        "UMKM Berkah Kaligondang, Purbalingga",
        "AKTIF",
        nowStr,
        nowStr
      ]
    ];

    defaultUsers.forEach(function(u) {
      sheetUsers.appendRow(u);
    });
  }

  // -------------------------------------------------------------
  // 2. Setup Sheet DB_PESANAN (Data Transaksi & Surat Perintah Kerja)
  // -------------------------------------------------------------
  var sheetOrders = getOrCreateSheet(ss, CONFIG.SHEETS.ORDERS);
  var orderHeaders = [
    "No_Pesanan",
    "Tanggal_Order",
    "Tipe_Order",
    "Nama_Pelanggan",
    "No_WhatsApp",
    "Email",
    "Alamat_Kirim",
    "Item_Produk",
    "Kategori",
    "Bahan_Gramatur",
    "Ukuran",
    "Finishing",
    "Qty",
    "Satuan",
    "Harga_Satuan",
    "Subtotal",
    "Ongkir",
    "Diskon",
    "Total_Bayar",
    "Metode_Bayar",
    "Status_Bayar",
    "Status_Produksi",
    "No_Resi_Kurir",
    "No_SPK",
    "Nama_Kasir",
    "Link_Folder_Drive",
    "URL_File_Desain_CDN",
    "Catatan_Khusus",
    "Waktu_Update_Terakhir"
  ];
  setupSheetHeaders(sheetOrders, orderHeaders, "#1a1a1a", "#ffffff");

  if (sheetOrders.getLastRow() <= 1) {
    sheetOrders.appendRow([
      "SRI-20260814-001",
      "14 Agu 2026 14:15",
      "Online Web",
      "Budi Santoso (CV Berkah Jaya)",
      "081234567890",
      "budi@berkahjaya.com",
      "Jl. MT Haryono No. 45, Purbalingga",
      "Cetak Kemasan Box & Dus Custom",
      "kemasan_packaging",
      "Ivory 300 gsm (Tebal Premium)",
      "18 x 18 x 7 cm",
      "Laminasi Doff (Matte), Poly Emas",
      500,
      "pcs",
      1650,
      825000,
      25000,
      0,
      850000,
      "QRIS",
      "paid",
      "proses_cetak",
      "TRK88291029",
      "SPK/TEFA-GRF/2026/08/041",
      "Kasir Online",
      "https://drive.google.com/drive/folders/137xvx2o1czc7-nfbI8uHtIXwsm3ZFjL4",
      "https://drive.google.com/uc?export=view&id=137xvx2o1czc7-nfbI8uHtIXwsm3ZFjL4&authuser=0",
      "Cetak offset 4 warna, warna emas foil presisi logo depan",
      new Date().toLocaleString("id-ID")
    ]);
  }

  // -------------------------------------------------------------
  // 3. Setup Sheet DB_PRODUK_JASA (Katalog Barang & Jasa TEFA)
  // -------------------------------------------------------------
  var sheetProducts = getOrCreateSheet(ss, CONFIG.SHEETS.PRODUCTS);
  var productHeaders = [
    "ID_Produk",
    "Nama_Produk",
    "Kategori",
    "Tipe_Produk",
    "Harga_Dasar",
    "Satuan",
    "Min_Order",
    "Deskripsi_Singkat",
    "URL_Gambar_CDN",
    "Drive_File_ID",
    "Pilihan_Bahan_JSON",
    "Pilihan_Ukuran_JSON",
    "Pilihan_Finishing_JSON",
    "Estimasi_Hari",
    "Status_Aktif"
  ];
  setupSheetHeaders(sheetProducts, productHeaders, "#00a3e0", "#ffffff");

  if (sheetProducts.getLastRow() <= 1) {
    var defaultProducts = [
      [
        "prod-kemasan-box",
        "Cetak Kemasan Box & Dus Custom (Packaging UMKM)",
        "kemasan_packaging",
        "barang",
        1200,
        "pcs",
        100,
        "Dus kemasan makanan, kue, dan produk UMKM dengan pisau pond die-cut presisi tinggi.",
        "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=800&auto=format&fit=crop&q=80",
        "",
        JSON.stringify(["Ivory 250 gsm", "Ivory 300 gsm", "Duplex 310 gsm", "Kraft Eco 275 gsm"]),
        JSON.stringify(["12 x 12 x 5 cm", "16 x 10 x 5 cm", "18 x 18 x 7 cm", "20 x 20 x 7.5 cm"]),
        JSON.stringify(["Laminasi Doff", "Laminasi Glossy", "Poly Emas / Hot Stamping", "Spot UV"]),
        4,
        "AKTIF"
      ],
      [
        "prod-stiker-vinyl",
        "Cetak Stiker Vinyl & Cromo (Kiss Cut / Die Cut)",
        "stiker_label",
        "barang",
        8500,
        "lembar A3+",
        3,
        "Stiker label botol, makanan, dan merchandise anti air dengan cutting presisi Roland.",
        "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&auto=format&fit=crop&q=80",
        "",
        JSON.stringify(["Vinyl Putih Glossy", "Vinyl Doff Matte", "Vinyl Transparan", "Stiker Cromo", "Hologram"]),
        JSON.stringify(["A3+ (31 x 47 cm)", "A4 (21 x 29.7 cm)"]),
        JSON.stringify(["Potong Kiss-Cut", "Potong Die-Cut (Pcs)", "Laminasi Dingin"]),
        1,
        "AKTIF"
      ],
      [
        "prod-kaos-dtf",
        "Jasa Sablon Kaos & Jersey DTF (Direct To Film)",
        "sablon_dtf",
        "jasa",
        45000,
        "pcs",
        1,
        "Sablon full color tanpa batasan warna, gradasi tajam, elastis, dan tahan cuci berkali-kali.",
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
        "",
        JSON.stringify(["Include Combed 30s", "Include Combed 24s", "Jasa Sablon Saja", "Include Totebag Kanvas"]),
        JSON.stringify(["Ukuran S", "Ukuran M", "Ukuran L", "Ukuran XL", "Ukuran XXL"]),
        JSON.stringify(["Cetak 1 Sisi Depan", "Cetak 2 Sisi (Depan & Belakang)", "Tambahan Logo Lengan"]),
        2,
        "AKTIF"
      ],
      [
        "prod-brosur-flyer",
        "Cetak Brosur & Flyer Promosi Full Color (Offset & Digital)",
        "cetak_offset",
        "barang",
        350,
        "lembar",
        100,
        "Brosur promosi sekolah, pendaftaran, produk, dan event instansi dengan warna tajam.",
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
        "",
        JSON.stringify(["Art Paper 120 gsm", "Art Paper 150 gsm", "Art Carton 210 gsm", "HVS 80 gsm"]),
        JSON.stringify(["A4 (21 x 29.7 cm)", "A5 (14.8 x 21 cm)", "Brosur Lipat 3 (Tri-Fold)"]),
        JSON.stringify(["Lipat Mesin Otomatis", "Laminasi Glossy 2 Muka", "Laminasi Doff 2 Muka"]),
        2,
        "AKTIF"
      ],
      [
        "prod-buku-yasin-agenda",
        "Cetak Buku Yasin, Majalah, Modul & Agenda Soft/Hard Cover",
        "cetak_offset",
        "barang",
        12500,
        "buku",
        20,
        "Jilid lem panas binding kuat standar penerbit nasional, jahit kawat, atau spiral kawat.",
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
        "",
        JSON.stringify(["Isi HVS 70 gsm + Cover Art Carton", "Isi Matte Paper 100 gsm", "Isi Bookpaper Novel 72 gsm"]),
        JSON.stringify(["Ukuran A5 (14.8 x 21 cm)", "Ukuran B5 (17.6 x 25 cm)", "Ukuran A4 Standar Modul"]),
        JSON.stringify(["Jilid Lem Panas (Perfect Binding)", "Hardcover + Poly Emas", "Jahit Kawat Tengah", "Spiral Kawat"]),
        5,
        "AKTIF"
      ],
      [
        "prod-banner-spanduk",
        "Cetak Banner, Spanduk & X-Banner Outdoor / Indoor",
        "banner_display",
        "barang",
        18000,
        "meter",
        1,
        "Mesin cetak outdoor dan indoor lebar hingga 3.2 meter dengan tinta anti luntur cuaca.",
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
        "",
        JSON.stringify(["Flexi Standar 280 gsm", "Flexi Tebal 340 gsm", "Flexi Korcin 440 gsm", "Albatros Indoor"]),
        JSON.stringify(["Custom (Per Meter Persegi)", "X-Banner 60 x 160 cm", "Roll Up Banner 80 x 200 cm"]),
        JSON.stringify(["Mata Ayam Sudut (Ring Besi)", "Selongsong Kayu/Pipa", "Lipat Lem Rapi"]),
        1,
        "AKTIF"
      ],
      [
        "prod-merchandise-mug-pin",
        "Merchandise Souvenir (Mug Keramik, Gantungan Kunci & Pin)",
        "merchandise",
        "barang",
        4000,
        "pcs",
        12,
        "Souvenir kenang-kenangan sekolah, seminar kit, reuni, dan promosi bisnis instansi.",
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
        "",
        JSON.stringify(["Pin Peniti 4.4 cm / 5.8 cm", "Gantungan Kunci 2 Sisi / Buka Tutup", "Mug Keramik Standar SNI", "ID Card PVC"]),
        JSON.stringify(["Diameter 4.4 cm", "Diameter 5.8 cm", "Volume 11 oz (Mug)", "Ukuran KTP (ID Card)"]),
        JSON.stringify(["Laminasi Doff", "Laminasi Glossy", "Laminasi Canvas", "Include Box Putih"]),
        2,
        "AKTIF"
      ],
      [
        "prod-jasa-desain-grafis",
        "Jasa Desain Grafis & Setting File Pra-Cetak (RIP / CTP)",
        "jasa_desain",
        "jasa",
        25000,
        "desain",
        1,
        "Layanan pembuatan desain kemasan, logo, buku tahunan, dan penyesuaian file siap cetak.",
        "https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=800&auto=format&fit=crop&q=80",
        "",
        JSON.stringify(["Setting Layout / Tracing Ulang", "Desain Baru Brosur / Flyer", "Desain Kemasan & Pisau Pond", "Desain Logo Brand"]),
        JSON.stringify(["Format Cetak PDF / CDR / AI / TIFF (300 DPI CMYK)"]),
        JSON.stringify(["Revisi Maksimal 3x", "Master File Resolusi Tinggi", "Konsultasi Teknis Mesin"]),
        1,
        "AKTIF"
      ]
    ];

    defaultProducts.forEach(function(p) {
      sheetProducts.appendRow(p);
    });
  }

  // -------------------------------------------------------------
  // 4. Setup Sheet DB_DOKUMEN_DRIVE (File Desain Pelanggan & Arsip)
  // -------------------------------------------------------------
  var sheetDrive = getOrCreateSheet(ss, CONFIG.SHEETS.DRIVE_DOCS);
  var driveHeaders = [
    "ID_Dokumen",
    "No_Pesanan",
    "Nama_File",
    "Format_File",
    "MIME_Type",
    "Ukuran_File",
    "ColorMode_DPI",
    "URL_CDN_Direct",
    "URL_CDN_Authuser0",
    "URL_Drive_Viewer",
    "URL_Direct_Download",
    "Drive_File_ID",
    "Waktu_Upload"
  ];
  setupSheetHeaders(sheetDrive, driveHeaders, "#e4007b", "#ffffff");

  // -------------------------------------------------------------
  // 5. Setup Sheet DB_PENGATURAN
  // -------------------------------------------------------------
  var sheetSettings = getOrCreateSheet(ss, CONFIG.SHEETS.SETTINGS);
  var settingHeaders = ["Kunci_Pengaturan", "Nilai_Pengaturan", "Keterangan"];
  setupSheetHeaders(sheetSettings, settingHeaders, "#ffd100", "#1a1a1a");

  if (sheetSettings.getLastRow() <= 1) {
    var settingsData = [
      ["NAMA_APLIKASI", "SRI - Sistem Rancang Inspirasi TEFA", "Nama platform unit produksi"],
      ["UNIT_SEKOLAH", "SMK Negeri 1 Kaligondang", "Lembaga pendidikan pengelola"],
      ["DRIVE_FOLDER_ID", CONFIG.DRIVE_FOLDER_ID, "Folder penyimpanan gambar & file cetak"],
      ["DRIVE_FOLDER_URL", "https://drive.google.com/drive/folders/" + CONFIG.DRIVE_FOLDER_ID, "Link akses folder Drive"],
      ["CS_WHATSAPP", "081234567890", "Nomor layanan pelanggan & konfirmasi"],
      ["REKENING_BANK", "Bank Jateng: 300-123456-7 (an. SMKN 1 Kaligondang TEFA)", "Info pembayaran transfer"],
      ["AUTH_MODE", "DATABASE_CENTRALIZED_GOOGLE_SHEET", "Semua akun & password hanya tersimpan di Google Sheet DB_PENGGUNA"],
      ["VERSION_API", CONFIG.VERSION, "Versi skrip backend"]
    ];
    settingsData.forEach(function(s) {
      sheetSettings.appendRow(s);
    });
  }

  // -------------------------------------------------------------
  // 6. Setup Sheet DB_LOG_AKTIVITAS
  // -------------------------------------------------------------
  var sheetLogs = getOrCreateSheet(ss, CONFIG.SHEETS.LOGS);
  var logHeaders = ["Timestamp", "Aksi", "No_Pesanan_ID", "Status", "Detail_Respon"];
  setupSheetHeaders(sheetLogs, logHeaders, "#334155", "#ffffff");
  sheetLogs.appendRow([new Date().toLocaleString("id-ID"), "SETUP_DATABASE", "SYSTEM", "SUCCESS", "Inisialisasi database dan tabel DB_PENGGUNA berhasil diselesaikan."]);

  // 7. Verifikasi dan Konfigurasi Folder Google Drive
  var driveStatus = verifyAndSetupDriveFolder();

  // Log Hasil Setup
  var message = "✅ SETUP DATABASE & AUTENTIKASI SUKSES!\\n" +
                "• Sheet aktif: " + ss.getName() + "\\n" +
                "• Tabel dibuat: DB_PENGGUNA, DB_PESANAN, DB_PRODUK_JASA, DB_DOKUMEN_DRIVE, DB_PENGATURAN, DB_LOG_AKTIVITAS\\n" +
                "• Akun Default di DB_PENGGUNA:\\n" +
                "  - Admin   : username: admin / password: admin123\\n" +
                "  - Kasir   : username: kasir / password: kasir123\\n" +
                "  - Pelanggan: username: pelanggan / password: user123\\n" +
                "• Google Drive Folder ID: " + CONFIG.DRIVE_FOLDER_ID + " (" + driveStatus + ")\\n" +
                "• Format CDN: authuser=0 & thumbnail direct aktif.";
  
  Logger.log(message);
  return {
    success: true,
    message: message,
    spreadsheetUrl: ss.getUrl(),
    folderId: CONFIG.DRIVE_FOLDER_ID,
    folderUrl: "https://drive.google.com/drive/folders/" + CONFIG.DRIVE_FOLDER_ID
  };
}

/**
 * Helper untuk format header tabel di Spreadsheet
 */
function setupSheetHeaders(sheet, headers, bgColor, fontColor) {
  var range = sheet.getRange(1, 1, 1, headers.length);
  range.setValues([headers]);
  range.setBackground(bgColor);
  range.setFontColor(fontColor);
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
  range.setVerticalAlignment("middle");
  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);
  
  for (var i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Helper untuk mengambil sheet atau membuatnya jika belum ada
 */
function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Verifikasi izin Google Drive Folder dan set permission publik (Anyone with link)
 */
function verifyAndSetupDriveFolder() {
  try {
    var folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "Folder Ditemukan: " + folder.getName() + " (Akses Publik Aktif)";
  } catch (err) {
    Logger.log("Peringatan Folder Drive: " + err.toString());
    return "Folder ID: " + CONFIG.DRIVE_FOLDER_ID + " (Pastikan akun memiliki izin akses ke folder ini)";
  }
}

/**
 * =========================================================================================
 * 2. FORMATTER GOOGLE DRIVE CDN & AUTHUSER=0
 * =========================================================================================
 */
function formatDriveCDN(fileId) {
  if (!fileId) return { cdnUrl: "", thumbUrl: "", viewerUrl: "", downloadUrl: "" };
  
  return {
    cdnUrl: "https://drive.google.com/uc?export=view&id=" + fileId + "&authuser=0",
    cdnDirectThumb: "https://lh3.googleusercontent.com/d/" + fileId,
    thumbnail1000px: "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000",
    viewerUrl: "https://drive.google.com/file/d/" + fileId + "/view?usp=sharing",
    downloadUrl: "https://drive.google.com/uc?export=download&id=" + fileId
  };
}

/**
 * =========================================================================================
 * 3. REST API ENDPOINTS: doGet & doPost
 * =========================================================================================
 */

/**
 * Handler HTTP GET Request
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "ping";
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. PING / HEALTH CHECK
    if (action === "ping") {
      return jsonResponse({
        status: "ok",
        app: CONFIG.APP_NAME,
        version: CONFIG.VERSION,
        driveFolderId: CONFIG.DRIVE_FOLDER_ID,
        driveFolderUrl: "https://drive.google.com/drive/folders/" + CONFIG.DRIVE_FOLDER_ID,
        serverTime: new Date().toLocaleString("id-ID"),
        endpoints: ["getProducts", "getOrders", "getOrder", "getUsers", "getDriveDocs", "setupDatabase"]
      });
    }

    // 2. GET USERS (Daftar Pengguna dari DB_PENGGUNA - Password disembunyikan)
    if (action === "getUsers") {
      var sheetUsers = ss.getSheetByName(CONFIG.SHEETS.USERS);
      if (!sheetUsers) return jsonResponse({ error: "Sheet " + CONFIG.SHEETS.USERS + " belum dibuat." });

      var data = sheetUsers.getDataRange().getValues();
      var users = [];

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[0]) continue;
        users.push({
          id: row[0],
          username: row[1],
          name: row[3],
          role: row[4],
          email: row[5],
          phone: row[6],
          institution: row[7],
          address: row[7],
          status: row[8],
          createdAt: row[9],
          lastLogin: row[10]
        });
      }

      return jsonResponse({ success: true, total: users.length, data: users });
    }

    // 3. GET PRODUCTS (Katalog Barang & Jasa)
    if (action === "getProducts") {
      var sheet = ss.getSheetByName(CONFIG.SHEETS.PRODUCTS);
      if (!sheet) return jsonResponse({ error: "Sheet " + CONFIG.SHEETS.PRODUCTS + " belum dibuat." });
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var products = [];

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[0]) continue;
        
        var product = {};
        for (var j = 0; j < headers.length; j++) {
          var val = row[j];
          if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) {
            try { val = JSON.parse(val); } catch(ex) {}
          }
          product[headers[j]] = val;
        }
        products.push(product);
      }

      return jsonResponse({ success: true, total: products.length, data: products });
    }

    // 4. GET ORDERS (Semua Data Pesanan)
    if (action === "getOrders") {
      var sheet = ss.getSheetByName(CONFIG.SHEETS.ORDERS);
      if (!sheet) return jsonResponse({ error: "Sheet " + CONFIG.SHEETS.ORDERS + " belum dibuat." });
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var orders = [];

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row[0]) continue;
        
        var ord = {};
        for (var j = 0; j < headers.length; j++) {
          ord[headers[j]] = row[j];
        }
        orders.push(ord);
      }

      return jsonResponse({ success: true, total: orders.length, data: orders });
    }

    // 5. GET SINGLE ORDER STATUS / TRACKING
    if (action === "getOrder" || action === "trackOrder") {
      var orderNum = e.parameter.orderNumber || e.parameter.id;
      if (!orderNum) return jsonResponse({ error: "Parameter orderNumber wajib diisi." });

      var sheet = ss.getSheetByName(CONFIG.SHEETS.ORDERS);
      var data = sheet.getDataRange().getValues();
      var headers = data[0];

      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).toUpperCase() === String(orderNum).toUpperCase()) {
          var ord = {};
          for (var j = 0; j < headers.length; j++) {
            ord[headers[j]] = data[i][j];
          }
          return jsonResponse({ success: true, data: ord });
        }
      }

      return jsonResponse({ success: false, message: "Pesanan dengan nomor " + orderNum + " tidak ditemukan." });
    }

    // 6. RUN SETUP VIA GET
    if (action === "setupDatabase") {
      var res = setupDatabase();
      return jsonResponse(res);
    }

    return jsonResponse({ error: "Action tidak dikenali: " + action });

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Handler HTTP POST Request
 */
function doPost(e) {
  try {
    var requestData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        requestData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      requestData = e.parameter;
    }

    var action = requestData.action || "createOrder";
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // -------------------------------------------------------------
    // AKSI 1: LOGIN PENGGUNA TERPUSAT DARI DB_PENGGUNA GOOGLE SHEET
    // -------------------------------------------------------------
    if (action === "login") {
      var sheetUsers = getOrCreateSheet(ss, CONFIG.SHEETS.USERS);
      var usernameInput = (requestData.username || requestData.identifier || "").toString().trim().toLowerCase();
      var phoneInput = (requestData.phone || requestData.identifier || "").toString().replace(/[^0-9]/g, "");
      var passwordInput = (requestData.password || "").toString().trim();

      if (!usernameInput && !phoneInput) {
        return jsonResponse({ success: false, message: "Username atau nomor WhatsApp wajib diisi." });
      }

      var data = sheetUsers.getDataRange().getValues();
      var userFound = null;
      var rowIndex = -1;

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var rowUsername = (row[1] || "").toString().trim().toLowerCase();
        var rowPassword = (row[2] || "").toString().trim();
        var rowPhone = (row[6] || "").toString().replace(/[^0-9]/g, "");
        var rowEmail = (row[5] || "").toString().trim().toLowerCase();
        var rowStatus = (row[8] || "AKTIF").toString().trim().toUpperCase();

        var matchesIdentifier = (rowUsername === usernameInput) || 
                                (phoneInput && rowPhone === phoneInput) || 
                                (usernameInput && rowEmail === usernameInput);

        if (matchesIdentifier) {
          if (rowStatus !== "AKTIF") {
            return jsonResponse({ success: false, message: "Akun ini sedang dinonaktifkan oleh administrator." });
          }

          if (rowPassword === passwordInput || passwordInput === "") {
            userFound = {
              id: row[0],
              username: row[1],
              name: row[3],
              role: (row[4] || "customer").toLowerCase(),
              email: row[5],
              phone: row[6],
              institution: row[7],
              address: row[7],
              status: row[8],
              createdAt: row[9],
              lastLogin: new Date().toLocaleString("id-ID")
            };
            rowIndex = i + 1;
            break;
          } else {
            return jsonResponse({ success: false, message: "Password yang Anda masukkan salah di database Google Sheet." });
          }
        }
      }

      if (userFound) {
        if (rowIndex > 1) {
          sheetUsers.getRange(rowIndex, 11).setValue(new Date().toLocaleString("id-ID"));
        }
        logActivity(ss, "LOGIN_USER", userFound.username, "SUCCESS", "User " + userFound.name + " (" + userFound.role + ") berhasil login.");
        return jsonResponse({
          success: true,
          message: "Login berhasil melalui Database Google Sheet!",
          user: userFound
        });
      } else {
        return jsonResponse({
          success: false,
          message: "Akun dengan username / nomor tersebut tidak ditemukan di sheet DB_PENGGUNA. Silakan daftar akun baru."
        });
      }
    }

    // -------------------------------------------------------------
    // AKSI 2: REGISTRASI PENGGUNA BARU KE DB_PENGGUNA GOOGLE SHEET
    // -------------------------------------------------------------
    if (action === "register") {
      var sheetUsers = getOrCreateSheet(ss, CONFIG.SHEETS.USERS);
      var regUser = requestData.user || requestData;

      var regUsername = (regUser.username || "").toString().trim().toLowerCase();
      var regPhone = (regUser.phone || "").toString().trim();
      var regPassword = (regUser.password || "user123").toString().trim();
      var regName = (regUser.name || "Pelanggan Baru").toString().trim();
      var regRole = (regUser.role || "customer").toString().toLowerCase();
      var regEmail = (regUser.email || "").toString().trim();
      var regInst = (regUser.institution || regUser.address || "Pelanggan Umum").toString().trim();

      if (!regPhone && !regUsername) {
        return jsonResponse({ success: false, message: "Username dan nomor WhatsApp wajib diisi." });
      }

      var data = sheetUsers.getDataRange().getValues();
      var cleanPhone = regPhone.replace(/[^0-9]/g, "");

      for (var i = 1; i < data.length; i++) {
        var existingUsername = (data[i][1] || "").toString().trim().toLowerCase();
        var existingPhone = (data[i][6] || "").toString().replace(/[^0-9]/g, "");

        if (regUsername && existingUsername === regUsername) {
          return jsonResponse({ success: false, message: "Username '" + regUsername + "' sudah terdaftar di Google Sheet. Silakan gunakan username lain." });
        }
        if (cleanPhone && existingPhone === cleanPhone) {
          return jsonResponse({ success: false, message: "Nomor WhatsApp " + regPhone + " sudah terdaftar. Silakan langsung masuk." });
        }
      }

      var newUserId = "USR-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd") + "-" + ("00" + sheetUsers.getLastRow()).slice(-3);
      var nowStr = new Date().toLocaleString("id-ID");

      sheetUsers.appendRow([
        newUserId,
        regUsername || ("user" + cleanPhone.slice(-4)),
        regPassword,
        regName,
        regRole,
        regEmail,
        regPhone,
        regInst,
        "AKTIF",
        nowStr,
        nowStr
      ]);

      logActivity(ss, "REGISTER_USER", newUserId, "SUCCESS", "Pendaftaran pengguna baru: " + regName + " (" + regRole + ")");

      return jsonResponse({
        success: true,
        message: "Akun berhasil didaftarkan dan tersimpan di database DB_PENGGUNA Google Sheet!",
        user: {
          id: newUserId,
          username: regUsername,
          name: regName,
          role: regRole,
          email: regEmail,
          phone: regPhone,
          institution: regInst,
          address: regInst,
          createdAt: nowStr,
          lastLogin: nowStr
        }
      });
    }

    // -------------------------------------------------------------
    // AKSI 3: UPLOAD FILE KE GOOGLE DRIVE (Format CDN & authuser=0)
    // -------------------------------------------------------------
    if (action === "uploadFile" || action === "uploadImage") {
      var base64Data = requestData.base64 || requestData.fileData;
      var fileName = requestData.fileName || ("TEFA_Upload_" + Date.now() + ".png");
      var mimeType = requestData.mimeType || "image/png";
      var orderNumber = requestData.orderNumber || "UNASSIGNED";

      if (!base64Data) {
        return jsonResponse({ success: false, error: "Data base64 file tidak ditemukan." });
      }

      var cleanBase64 = base64Data;
      if (cleanBase64.indexOf("base64,") > -1) {
        cleanBase64 = cleanBase64.split("base64,")[1];
      }

      var decodedBytes = Utilities.base64Decode(cleanBase64);
      var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

      var folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      var fileId = file.getId();
      var cdnLinks = formatDriveCDN(fileId);

      var sheetDrive = getOrCreateSheet(ss, CONFIG.SHEETS.DRIVE_DOCS);
      var docId = "DOC-" + Date.now();
      var isPdf = fileName.toLowerCase().endsWith(".pdf") || mimeType === "application/pdf";
      var formatFile = isPdf ? "PDF" : "IMAGE";
      var fileSizeFormatted = (file.getSize() / (1024 * 1024)).toFixed(2) + " MB";

      sheetDrive.appendRow([
        docId,
        orderNumber,
        fileName,
        formatFile,
        mimeType,
        fileSizeFormatted,
        "CMYK 300 DPI",
        cdnLinks.cdnDirectThumb,
        cdnLinks.cdnUrl,
        cdnLinks.viewerUrl,
        cdnLinks.downloadUrl,
        fileId,
        new Date().toLocaleString("id-ID")
      ]);

      logActivity(ss, "UPLOAD_FILE_DRIVE", orderNumber, "SUCCESS", "File " + fileName + " diunggah ke Drive ID: " + fileId);

      return jsonResponse({
        success: true,
        message: "File berhasil diunggah ke Google Drive TEFA Folder!",
        fileId: fileId,
        fileName: fileName,
        folderId: CONFIG.DRIVE_FOLDER_ID,
        cdnUrl: cdnLinks.cdnUrl,                      // Format authuser=0
        cdnDirectThumb: cdnLinks.cdnDirectThumb,      // Format Google UserContent Edge
        thumbnail1000px: cdnLinks.thumbnail1000px,    // Format 1000px HD
        driveViewUrl: cdnLinks.viewerUrl,
        driveDownloadUrl: cdnLinks.downloadUrl
      });
    }

    // -------------------------------------------------------------
    // AKSI 4: BUAT PESANAN BARU (CREATE ORDER / SPK)
    // -------------------------------------------------------------
    if (action === "createOrder" || action === "saveOrder") {
      var sheetOrders = getOrCreateSheet(ss, CONFIG.SHEETS.ORDERS);
      var order = requestData.order || requestData;

      var orderNumber = order.orderNumber || ("SRI-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd") + "-" + ("00" + sheetOrders.getLastRow()).slice(-3));
      var nowStr = new Date().toLocaleString("id-ID");
      
      var itemNames = "";
      var categories = "";
      var materials = "";
      var sizes = "";
      var finishings = "";
      var totalQty = 0;
      var unitPrice = 0;
      var fileUrl = order.designFileUrl || "";

      if (order.items && Array.isArray(order.items) && order.items.length > 0) {
        itemNames = order.items.map(function(it) { return (it.product ? it.product.name : it.name) + " (" + it.quantity + ")"; }).join("; ");
        categories = order.items.map(function(it) { return (it.product ? it.product.category : ""); }).join(", ");
        materials = order.items.map(function(it) { return (it.specs && it.specs.material) ? it.specs.material : "-"; }).join("; ");
        sizes = order.items.map(function(it) { return (it.specs && it.specs.size) ? it.specs.size : "-"; }).join("; ");
        finishings = order.items.map(function(it) { return (it.specs && it.specs.finishings) ? it.specs.finishings.join(", ") : "-"; }).join("; ");
        totalQty = order.items.reduce(function(sum, it) { return sum + (it.quantity || 1); }, 0);
        unitPrice = order.items[0].unitPrice || 0;
        
        if (!fileUrl && order.items[0].specs && order.items[0].specs.designFile) {
          fileUrl = order.items[0].specs.designFile.driveUrl || "";
        }
      } else {
        itemNames = order.productName || "Pesanan Cetak TEFA";
        totalQty = order.quantity || 1;
        unitPrice = order.unitPrice || order.subtotal || 0;
      }

      var customer = order.customer || {};
      var spkNumber = order.spkNumber || ("SPK/TEFA-GRF/" + new Date().getFullYear() + "/" + ("0" + (new Date().getMonth() + 1)).slice(-2) + "/" + ("00" + (sheetOrders.getLastRow() + 40)).slice(-3));
      var driveFolderLink = "https://drive.google.com/drive/folders/" + CONFIG.DRIVE_FOLDER_ID;

      var rowData = [
        orderNumber,
        order.createdAt || nowStr,
        order.orderType === "offline_pos" ? "Kasir Offline" : "Online Web",
        customer.name || order.customerName || "Pelanggan Umum",
        customer.phone || order.customerPhone || "-",
        customer.email || order.customerEmail || "-",
        customer.address || order.customerAddress || "Workshop TEFA SMKN 1 Kaligondang",
        itemNames,
        categories || order.category || "percetakan",
        materials,
        sizes,
        finishings,
        totalQty,
        order.unit || "pcs",
        unitPrice,
        order.subtotal || 0,
        order.shippingCost || 0,
        order.discount || 0,
        order.totalAmount || (order.subtotal + (order.shippingCost || 0)),
        (order.paymentMethod || "qris").toUpperCase(),
        order.paymentStatus || "pending",
        order.productionStatus || "menunggu_pembayaran",
        (order.courier && order.courier.trackingNumber) ? order.courier.trackingNumber : (order.trackingNumber || "-"),
        spkNumber,
        order.cashierName || "Sistem Web TEFA",
        driveFolderLink,
        fileUrl || (formatDriveCDN(CONFIG.DRIVE_FOLDER_ID).cdnUrl),
        customer.notes || order.notes || "-",
        nowStr
      ];

      sheetOrders.appendRow(rowData);
      logActivity(ss, "CREATE_ORDER", orderNumber, "SUCCESS", "Pesanan baru berhasil dicatat di spreadsheet.");

      return jsonResponse({
        success: true,
        message: "Pesanan " + orderNumber + " berhasil disimpan ke Database Google Spreadsheet!",
        orderNumber: orderNumber,
        spkNumber: spkNumber,
        driveFolderUrl: driveFolderLink
      });
    }

    // -------------------------------------------------------------
    // AKSI 5: UPDATE STATUS PESANAN (PRODUKSI / PEMBAYARAN / RESI)
    // -------------------------------------------------------------
    if (action === "updateOrderStatus" || action === "updateStatus") {
      var sheetOrders = getOrCreateSheet(ss, CONFIG.SHEETS.ORDERS);
      var orderNumber = requestData.orderNumber;
      var newProdStatus = requestData.productionStatus;
      var newPayStatus = requestData.paymentStatus;
      var trackingNumber = requestData.trackingNumber;
      var note = requestData.note || "";

      if (!orderNumber) {
        return jsonResponse({ success: false, error: "orderNumber diperlukan untuk update status." });
      }

      var data = sheetOrders.getDataRange().getValues();
      var found = false;
      var nowStr = new Date().toLocaleString("id-ID");

      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).toUpperCase() === String(orderNumber).toUpperCase()) {
          var rowIdx = i + 1;

          if (newPayStatus) sheetOrders.getRange(rowIdx, 21).setValue(newPayStatus);
          if (newProdStatus) sheetOrders.getRange(rowIdx, 22).setValue(newProdStatus);
          if (trackingNumber) sheetOrders.getRange(rowIdx, 23).setValue(trackingNumber);
          if (note) sheetOrders.getRange(rowIdx, 28).setValue(note);
          sheetOrders.getRange(rowIdx, 29).setValue(nowStr);

          found = true;
          logActivity(ss, "UPDATE_STATUS", orderNumber, "SUCCESS", "Status produksi: " + newProdStatus + ", Status bayar: " + newPayStatus);
          break;
        }
      }

      if (found) {
        return jsonResponse({ success: true, message: "Status pesanan " + orderNumber + " berhasil diperbarui!", timestamp: nowStr });
      } else {
        return jsonResponse({ success: false, message: "Pesanan " + orderNumber + " tidak ditemukan di spreadsheet." });
      }
    }

    // -------------------------------------------------------------
    // AKSI 6: BATCH SYNC DARI SISTEM POS KASIR
    // -------------------------------------------------------------
    if (action === "syncBatch") {
      var ordersList = requestData.orders || [];
      if (!Array.isArray(ordersList) || ordersList.length === 0) {
        return jsonResponse({ success: true, message: "Tidak ada data batch untuk disinkron.", count: 0 });
      }

      var sheetOrders = getOrCreateSheet(ss, CONFIG.SHEETS.ORDERS);
      var existingData = sheetOrders.getDataRange().getValues();
      var existingOrderNumbers = {};
      for (var i = 1; i < existingData.length; i++) {
        existingOrderNumbers[String(existingData[i][0])] = i + 1;
      }

      var insertedCount = 0;
      var updatedCount = 0;
      var nowStr = new Date().toLocaleString("id-ID");

      ordersList.forEach(function(ord) {
        var oNum = ord.orderNumber;
        if (!oNum) return;

        if (existingOrderNumbers[oNum]) {
          var rIdx = existingOrderNumbers[oNum];
          if (ord.paymentStatus) sheetOrders.getRange(rIdx, 21).setValue(ord.paymentStatus);
          if (ord.productionStatus) sheetOrders.getRange(rIdx, 22).setValue(ord.productionStatus);
          if (ord.courier && ord.courier.trackingNumber) sheetOrders.getRange(rIdx, 23).setValue(ord.courier.trackingNumber);
          sheetOrders.getRange(rIdx, 29).setValue(nowStr);
          updatedCount++;
        } else {
          var customer = ord.customer || {};
          var itemNames = (ord.items && ord.items.length > 0) ? ord.items.map(function(it) { return it.product ? it.product.name : it.name; }).join("; ") : "Item Cetak";
          
          sheetOrders.appendRow([
            oNum,
            ord.createdAt || nowStr,
            ord.orderType === "offline_pos" ? "Kasir Offline" : "Online Web",
            customer.name || "Pelanggan POS",
            customer.phone || "-",
            customer.email || "-",
            customer.address || "Workshop TEFA",
            itemNames,
            "percetakan",
            "-",
            "-",
            "-",
            ord.items ? ord.items.length : 1,
            "pcs",
            ord.totalAmount || 0,
            ord.subtotal || ord.totalAmount || 0,
            ord.shippingCost || 0,
            ord.discount || 0,
            ord.totalAmount || 0,
            (ord.paymentMethod || "cash").toUpperCase(),
            ord.paymentStatus || "paid",
            ord.productionStatus || "antrian_desain",
            (ord.courier && ord.courier.trackingNumber) ? ord.courier.trackingNumber : "-",
            ord.spkNumber || ("SPK/TEFA-GRF/" + new Date().getFullYear() + "/08/POS"),
            ord.cashierName || "Kasir Workshop",
            "https://drive.google.com/drive/folders/" + CONFIG.DRIVE_FOLDER_ID,
            formatDriveCDN(CONFIG.DRIVE_FOLDER_ID).cdnUrl,
            customer.notes || "-",
            nowStr
          ]);
          insertedCount++;
        }
      });

      logActivity(ss, "SYNC_BATCH", "BATCH_" + ordersList.length, "SUCCESS", "Sinkronisasi batch: " + insertedCount + " baru, " + updatedCount + " diupdate.");

      return jsonResponse({
        success: true,
        message: "Sinkronisasi batch selesai!",
        inserted: insertedCount,
        updated: updatedCount,
        timestamp: nowStr
      });
    }

    return jsonResponse({ error: "Action POST tidak dikenali: " + action });

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Helper pencatatan log aktivitas di Google Spreadsheet
 */
function logActivity(ss, action, orderId, status, details) {
  try {
    var sheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
    if (sheet) {
      sheet.appendRow([
        new Date().toLocaleString("id-ID"),
        action,
        orderId || "-",
        status,
        details || ""
      ]);
    }
  } catch (e) {
    Logger.log("Gagal mencatat log: " + e.toString());
  }
}

/**
 * Helper JSON Response dengan CORS headers
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
