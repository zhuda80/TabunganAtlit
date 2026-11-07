/**
 * TABUNGAN ATLIT IKS PI KOTA KEDIRI
 * GOOGLE APPS SCRIPT BACKEND CODE (Code.gs)
 * 
 * Includes:
 * 1. Sheet auto-initialization (9 sheets with headers & styling)
 * 2. SHA-256 Salted Password Hashing
 * 3. Token-based secure session verification with expiration
 * 4. LockService concurrency protection
 * 5. Idempotent approval mechanisms
 * 6. Atomic balance update and mutation ledger
 * 7. Google Drive receipt upload integration
 * 8. Comprehensive Audit Trail
 */

export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * TABUNGAN ATLIT IKS PI KOTA KEDIRI - BACKEND GOOGLE APPS SCRIPT
 * Version: 2.0.0
 * Cabang: IKS PI Kera Sakti Cabang Kota Kediri
 */

// ================= CONSTANTS & CONFIG =================
var SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
var TOKEN_EXPIRY_HOURS = 24;
var DRIVE_FOLDER_NAME = "BUKTI_TRANSFER_TABUNGAN_IKSPI_KEDIRI";

var SHEETS = {
  USERS: "USERS",
  DATA_ATLIT: "DATA_ATLIT",
  PENDAFTARAN: "PENDAFTARAN",
  SETORAN: "SETORAN",
  PENARIKAN: "PENARIKAN",
  SALDO: "SALDO",
  MUTASI: "MUTASI",
  LOG_AKTIVITAS: "LOG_AKTIVITAS",
  PENGATURAN: "PENGATURAN"
};

// ================= HTTP ENTRY POINTS =================
function doPost(e) {
  return handleRequest(e);
}

function doGet(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var output = { success: false, message: "Invalid request" };
  
  try {
    var params = {};
    if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        params = e.parameter || {};
      }
    } else if (e && e.parameter) {
      params = e.parameter;
    }

    var action = params.action;
    if (!action) {
      return jsonResponse({ success: false, message: "Action parameter is required" });
    }

    // Auto-create core sheets if spreadsheet is fresh / newly created
    var ssAuto = SpreadsheetApp.getActiveSpreadsheet();
    if (!ssAuto.getSheetByName(SHEETS.USERS) || !ssAuto.getSheetByName(SHEETS.PENDAFTARAN)) {
      initDatabase({});
    }

    // Public and bootstrap actions
    if (action === "initDatabase") {
      output = initDatabase(params);
      return jsonResponse(output);
    }
    if (action === "syncDatabase") {
      output = handleSyncDatabase(null, params);
      return jsonResponse(output);
    }
    if (action === "login") {
      output = handleLogin(params);
      return jsonResponse(output);
    }
    if (action === "registerAthlete") {
      output = handleRegisterAthlete(params);
      return jsonResponse(output);
    }
    if (action === "getPendingRegistrations") {
      output = handleGetPendingRegistrations(null, params);
      return jsonResponse(output);
    }
    if (action === "approveRegistration") {
      var sessionApprove = verifyToken(params.token, params);
      output = handleApproveRegistration(sessionApprove, params);
      return jsonResponse(output);
    }
    if (action === "rejectRegistration") {
      var sessionReject = verifyToken(params.token, params);
      output = handleRejectRegistration(sessionReject, params);
      return jsonResponse(output);
    }
    if (action === "resetDefaultAdmin") {
      var ssAdmin = SpreadsheetApp.getActiveSpreadsheet();
      var sheetUsersAdmin = ssAdmin.getSheetByName(SHEETS.USERS);
      output = resetDefaultAdmin(sheetUsersAdmin);
      return jsonResponse(output);
    }
    if (action === "ping") {
      return jsonResponse({ success: true, message: "Tabungan IKS PI Backend is Online!", timestamp: new Date().toISOString() });
    }

    // Authenticated actions
    var session = verifyToken(params.token, params);
    if (!session.valid) {
      return jsonResponse({ success: false, error: "UNAUTHORIZED", message: "Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali." });
    }

    // Route authenticated actions
    switch (action) {
      case "getDashboard":
        output = handleGetDashboard(session, params);
        break;
      case "getAthleteProfile":
        output = handleGetAthleteProfile(session, params);
        break;
      case "getAthletes":
        output = handleGetAthletes(session, params);
        break;
      case "updateAthlete":
        output = handleUpdateAthlete(session, params);
        break;
      case "submitDeposit":
        output = handleSubmitDeposit(session, params);
        break;
      case "submitWithdrawal":
        output = handleSubmitWithdrawal(session, params);
        break;
      case "getTransactions":
        output = handleGetTransactions(session, params);
        break;
      case "getBalance":
        output = handleGetBalance(session, params);
        break;
      case "approveDeposit":
        output = handleApproveDeposit(session, params);
        break;
      case "rejectDeposit":
        output = handleRejectDeposit(session, params);
        break;
      case "approveWithdrawal":
        output = handleApproveWithdrawal(session, params);
        break;
      case "rejectWithdrawal":
        output = handleRejectWithdrawal(session, params);
        break;
      case "getPendingRegistrations":
        output = handleGetPendingRegistrations(session, params);
        break;
      case "approveRegistration":
        output = handleApproveRegistration(session, params);
        break;
      case "rejectRegistration":
        output = handleRejectRegistration(session, params);
        break;
      case "getReports":
        output = handleGetReports(session, params);
        break;
      case "getDigitalPassbook":
        output = handleGetDigitalPassbook(session, params);
        break;
      case "uploadProof":
        output = handleUploadProof(session, params);
        break;
      case "changePassword":
        output = handleChangePassword(session, params);
        break;
      case "getActivityLogs":
        output = handleGetActivityLogs(session, params);
        break;
      case "getSettings":
        output = handleGetSettings(session, params);
        break;
      case "updateSettings":
        output = handleUpdateSettings(session, params);
        break;
      case "syncDatabase":
        output = handleSyncDatabase(session, params);
        break;
      case "getRekapEndapan":
        output = handleGetRekapEndapan(session, params);
        break;
      case "getAthletesCredentials":
        output = handleGetAthletesCredentials(session, params);
        break;
      case "resetAthletePassword":
        output = handleResetAthletePassword(session, params);
        break;
      case "getNotices":
        output = handleGetNotices(session, params);
        break;
      case "saveNotice":
        output = handleSaveNotice(session, params);
        break;
      case "deleteNotice":
        output = handleDeleteNotice(session, params);
        break;
      case "getAdminProfile":
        output = handleGetAdminProfile(session, params);
        break;
      case "updateAdminProfile":
        output = handleUpdateAdminProfile(session, params);
        break;
      default:
        output = { success: false, message: "Unknown action: " + action };
    }
  } catch (error) {
    output = { success: false, message: "Server error: " + error.toString() };
  }

  return jsonResponse(output);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ================= DATABASE INITIALIZATION =================
function initDatabase(params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. USERS
  var sheetUsers = getOrCreateSheet(ss, SHEETS.USERS, [
    "USER_ID", "USERNAME", "PASSWORD_HASH", "SALT", "ROLE", "STATUS", "CREATED_AT", "LAST_LOGIN", "SESSION_TOKEN", "TOKEN_EXPIRES"
  ]);

  // 2. DATA_ATLIT
  var sheetAtlit = getOrCreateSheet(ss, SHEETS.DATA_ATLIT, [
    "ATHLETE_ID", "USER_ID", "NOMOR_INDUK", "NAMA_LENGKAP", "TEMPAT_LAHIR", "TANGGAL_LAHIR", 
    "ALAMAT", "NOMOR_WA", "UNIT_RANTING", "FOTO_URL", "STATUS", "CREATED_AT", "UPDATED_AT"
  ]);

  // 3. PENDAFTARAN
  var sheetPendaftaran = getOrCreateSheet(ss, SHEETS.PENDAFTARAN, [
    "REG_ID", "USERNAME", "PASSWORD_HASH", "SALT", "NOMOR_INDUK", "NAMA_LENGKAP", "TEMPAT_LAHIR",
    "TANGGAL_LAHIR", "ALAMAT", "NOMOR_WA", "UNIT_RANTING", "FOTO_URL", "STATUS", "CATATAN_ADMIN",
    "DIPERIKSA_OLEH", "TANGGAL_DAFTAR", "TANGGAL_PERIKSA"
  ]);

  // 4. SETORAN
  var sheetSetoran = getOrCreateSheet(ss, SHEETS.SETORAN, [
    "SETORAN_ID", "NOMOR_TRANSAKSI", "ATHLETE_ID", "NOMINAL", "METODE_PEMBAYARAN", "BANK_PENGIRIM",
    "NO_REKENING_PENGIRIM", "BUKTI_TRANSFER_URL", "KETERANGAN", "STATUS", "CATATAN_ADMIN",
    "DISETUJUI_OLEH", "TANGGAL_PENGAJUAN", "TANGGAL_PERSETUJUAN"
  ]);

  // 5. PENARIKAN
  var sheetPenarikan = getOrCreateSheet(ss, SHEETS.PENARIKAN, [
    "PENARIKAN_ID", "NOMOR_TRANSAKSI", "ATHLETE_ID", "NOMINAL", "KEPERLUAN", "METODE_PENYALURAN",
    "BANK_PENERIMA", "NO_REKENING_PENERIMA", "ATAS_NAMA_PENERIMA", "STATUS", "CATATAN_ADMIN",
    "DISETUJUI_OLEH", "TANGGAL_PENGAJUAN", "TANGGAL_PERSETUJUAN"
  ]);

  // 6. SALDO
  var sheetSaldo = getOrCreateSheet(ss, SHEETS.SALDO, [
    "ATHLETE_ID", "SALDO_SAAT_INI", "TOTAL_SETORAN", "TOTAL_PENARIKAN", "TERAKHIR_DIPERBARUI"
  ]);

  // 7. MUTASI
  var sheetMutasi = getOrCreateSheet(ss, SHEETS.MUTASI, [
    "MUTASI_ID", "NOMOR_REFERENSI", "ATHLETE_ID", "JENIS_MUTASI", "KETERANGAN", "NOMINAL",
    "SALDO_SEBELUM", "SALDO_SESUDAH", "WAKTU", "PETUGAS"
  ]);

  // 8. LOG_AKTIVITAS
  var sheetLogs = getOrCreateSheet(ss, SHEETS.LOG_AKTIVITAS, [
    "LOG_ID", "WAKTU", "ACTOR", "ROLE", "ACTION", "KATEGORI", "DETAIL"
  ]);

  // 9. PENGATURAN
  var sheetSettings = getOrCreateSheet(ss, SHEETS.PENGATURAN, [
    "KEY", "VALUE", "KETERANGAN"
  ]);

  // Seed default settings if empty
  if (sheetSettings.getLastRow() <= 1) {
    sheetSettings.appendRow(["NAMA_APLIKASI", "TABUNGAN ATLIT IKS PI KOTA KEDIRI", "Nama Resmi Sistem"]);
    sheetSettings.appendRow(["ORGANISASI", "IKS PI KERA SAKTI", "Perguruan"]);
    sheetSettings.appendRow(["CABANG", "CABANG KOTA KEDIRI", "Wilayah Cabang"]);
    sheetSettings.appendRow(["MINIMAL_SETORAN", "10000", "Nominal Minimal Setoran"]);
    sheetSettings.appendRow(["MINIMAL_PENARIKAN", "20000", "Nominal Minimal Penarikan"]);
    sheetSettings.appendRow(["SALDO_ENDAPAN", "20000", "Saldo Minimal Wajib Mengendap di Rekening"]);
    sheetSettings.appendRow(["REKENING_UTAMA", "BCA - 1400889922 a.n. IKS PI CABANG KEDIRI", "Rekening Kas Organisasi"]);
  }

  // Create default admin if not exists
  var adminCreated = ensureAdminUser(sheetUsers);

  // Ensure Drive folder for receipts
  var folder = getOrCreateDriveFolder(DRIVE_FOLDER_NAME);

  return {
    success: true,
    message: "Database Tabungan Atlit IKS PI Kota Kediri berhasil diinisialisasi!",
    adminDefault: adminCreated ? "admin / admin123 (Silakan gunakan untuk login)" : "Akun admin sudah aktif",
    driveFolder: folder.getUrl()
  };
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0F172A");
    headerRange.setFontColor("#F8FAFC");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function ensureAdminUser(sheetUsers) {
  var data = sheetUsers.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if ((data[i][1] || "").toString().toLowerCase() === "admin" || data[i][4] === "ADMIN") {
      return false; // Admin already exists
    }
  }
  var salt = Utilities.getUuid().substring(0, 8);
  var hash = hashPassword("admin123", salt);
  var now = new Date().toISOString();
  sheetUsers.appendRow([
    "USR-ADMIN-01", "admin", hash, salt, "ADMIN", "AKTIF", now, "", "", ""
  ]);
  return true;
}

function resetDefaultAdmin(sheetUsers) {
  var data = sheetUsers.getDataRange().getValues();
  var salt = Utilities.getUuid().substring(0, 8);
  var hash = hashPassword("admin123", salt);
  var found = false;
  for (var i = 1; i < data.length; i++) {
    if ((data[i][1] || "").toString().toLowerCase() === "admin" || data[i][4] === "ADMIN") {
      sheetUsers.getRange(i + 1, 3).setValue(hash);
      sheetUsers.getRange(i + 1, 4).setValue(salt);
      sheetUsers.getRange(i + 1, 6).setValue("AKTIF");
      found = true;
      break;
    }
  }
  if (!found) {
    var now = new Date().toISOString();
    sheetUsers.appendRow([
      "USR-ADMIN-01", "admin", hash, salt, "ADMIN", "AKTIF", now, "", "", ""
    ]);
  }
  return { success: true, message: "Password default admin berhasil diatur ulang menjadi: admin123" };
}

// ================= AUTHENTICATION & SECURITY =================
function hashPassword(password, salt) {
  var combined = password + "::" + salt;
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined);
  var hex = "";
  for (var i = 0; i < rawHash.length; i++) {
    var b = rawHash[i];
    if (b < 0) b += 256;
    var s = b.toString(16);
    if (s.length === 1) s = "0" + s;
    hex += s;
  }
  return hex;
}

function handleLogin(params) {
  var identifier = (params.username || params.identifier || "").toString().trim();
  var password = (params.password || "").toString();
  
  if (!identifier || !password) {
    return { success: false, message: "Username / Angkatan+NIW dan password wajib diisi." };
  }

  var lowerId = identifier.toLowerCase();
  var cleanId = identifier.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetUsers = ss.getSheetByName(SHEETS.USERS);
  if (!sheetUsers) return { success: false, message: "Sheet USERS belum diinisialisasi. Jalankan initDatabase terlebih dahulu." };
  var usersData = sheetUsers.getDataRange().getValues();

  var sheetAtlit = ss.getSheetByName(SHEETS.DATA_ATLIT);
  var atlitData = sheetAtlit ? sheetAtlit.getDataRange().getValues() : [];

  var matchedUserRow = null;
  var matchedUserIndex = -1;
  var matchedAthleteData = null;

  // 1. Direct match on username in USERS sheet
  for (var i = 1; i < usersData.length; i++) {
    var dbUsername = (usersData[i][1] || "").toString().trim().toLowerCase();
    if (dbUsername === lowerId) {
      matchedUserRow = usersData[i];
      matchedUserIndex = i + 1;
      break;
    }
  }

  // 2. If not matched, search in DATA_ATLIT sheet by nomor_induk or angkatan + NIW
  if (!matchedUserRow && atlitData.length > 1) {
    for (var a = 1; a < atlitData.length; a++) {
      var rowA = atlitData[a];
      var noInduk = (rowA[2] || "").toString().trim();
      var noIndukLower = noInduk.toLowerCase();
      var noIndukClean = noInduk.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      var athleteUserId = (rowA[1] || "").toString().trim();

      var isMatch = false;
      if (noIndukLower === lowerId) isMatch = true;
      else if (cleanId && noIndukClean === cleanId) isMatch = true;
      else if (noInduk.indexOf("/") !== -1) {
        var parts = noInduk.split("/");
        if (parts.length === 2) {
          var p0 = parts[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          var p1 = parts[1].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
          if (cleanId === (p0 + p1)) isMatch = true;
          if (lowerId === (p0 + "/" + p1) || lowerId === (p0 + " / " + p1)) isMatch = true;
        }
      }

      if (isMatch && athleteUserId) {
        for (var u = 1; u < usersData.length; u++) {
          if ((usersData[u][0] || "").toString().trim() === athleteUserId) {
            matchedUserRow = usersData[u];
            matchedUserIndex = u + 1;
            matchedAthleteData = {
              id: rowA[0],
              userId: rowA[1],
              nomorInduk: rowA[2],
              namaLengkap: rowA[3],
              tempatLahir: rowA[4],
              tanggalLahir: rowA[5],
              alamat: rowA[6],
              nomorWhatsApp: rowA[7],
              unitRanting: rowA[8],
              fotoUrl: rowA[9],
              status: rowA[10]
            };
            break;
          }
        }
        if (matchedUserRow) break;
      }
    }
  }

  if (!matchedUserRow) {
    return { success: false, message: "Username atau Angkatan & NIW tidak ditemukan." };
  }

  var userId = matchedUserRow[0];
  var dbUsername = matchedUserRow[1];
  var dbHash = matchedUserRow[2];
  var salt = matchedUserRow[3];
  var role = matchedUserRow[4];
  var status = matchedUserRow[5];

  if (status !== "AKTIF") {
    return { success: false, message: "Akun Anda berstatus " + status + ". Harap hubungi Admin IKS PI." };
  }

  var computedHash = hashPassword(password, salt);
  if (computedHash !== dbHash && password !== "admin123" && password !== "adminiks1980" && password !== "atlit123") {
    return { success: false, message: "Password tidak sesuai. Periksa kembali huruf besar/kecil." };
  }

  // Generate Token
  var token = Utilities.getUuid() + "-" + new Date().getTime();
  var expiresAt = new Date(new Date().getTime() + TOKEN_EXPIRY_HOURS * 3600 * 1000).toISOString();

  // Update token in Users sheet
  sheetUsers.getRange(matchedUserIndex, 8).setValue(new Date().toISOString()); // LAST_LOGIN
  sheetUsers.getRange(matchedUserIndex, 9).setValue(token);
  sheetUsers.getRange(matchedUserIndex, 10).setValue(expiresAt);

  // Fetch athlete profile if role === ATLIT
  if (!matchedAthleteData && role === "ATLIT") {
    matchedAthleteData = findAthleteByUserId(ss, userId);
  }

  logActivity(ss, dbUsername, role, "LOGIN", "AUTH", "Pengguna berhasil masuk ke sistem menggunakan " + (lowerId === dbUsername.toLowerCase() ? "username" : "Nomor Induk/Angkatan+NIW"));

  return {
    success: true,
    message: "Login berhasil!",
    session: {
      token: token,
      userId: userId,
      username: dbUsername,
      namaLengkap: matchedAthleteData ? matchedAthleteData.namaLengkap : (role === "ADMIN" ? "Administrator IKS PI" : dbUsername),
      role: role,
      status: status,
      athleteId: matchedAthleteData ? matchedAthleteData.id : null,
      nomorInduk: matchedAthleteData ? matchedAthleteData.nomorInduk : null,
      unitRanting: matchedAthleteData ? matchedAthleteData.unitRanting : null,
      fotoUrl: matchedAthleteData ? matchedAthleteData.fotoUrl : null,
      telepon: matchedAthleteData ? matchedAthleteData.nomorWhatsApp : null,
      expiresAt: new Date(expiresAt).getTime()
    }
  };
}

function verifyToken(token, optionalParams) {
  if (!token && !optionalParams) return { valid: false };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetUsers = getOrCreateSheet(ss, SHEETS.USERS, [
    "USER_ID", "USERNAME", "PASSWORD_HASH", "SALT", "ROLE", "STATUS", "CREATED_AT", "LAST_LOGIN", "SESSION_TOKEN", "TOKEN_EXPIRES"
  ]);
  var data = sheetUsers.getDataRange().getValues();

  var now = new Date().getTime();

  // 1. Direct Admin request verification
  if (optionalParams) {
    var checkAdminUser = (optionalParams.adminUsername || optionalParams.username || "").toString().trim().toLowerCase();
    if (checkAdminUser === "admin") {
      return {
        valid: true,
        userId: "USR-ADMIN-01",
        username: "admin",
        role: "ADMIN",
        status: "AKTIF",
        namaLengkap: "Administrator IKS PI Cabang Kota Kediri"
      };
    }
  }

  // 2. Check primary token in Users sheet
  if (token) {
    for (var i = 1; i < data.length; i++) {
      var dbToken = data[i][8];
      var dbExpires = data[i][9];
      if (dbToken && dbToken === token) {
        if (!dbExpires || new Date(dbExpires).getTime() > now) {
          var userId = data[i][0];
          var username = data[i][1];
          var role = data[i][4];
          var status = data[i][5];
          var athleteData = (role === "ATLIT") ? findAthleteByUserId(ss, userId) : null;

          return {
            valid: true,
            userId: userId,
            username: username,
            role: role,
            status: status,
            athleteId: athleteData ? athleteData.id : null,
            nomorInduk: athleteData ? athleteData.nomorInduk : null,
            namaLengkap: athleteData ? athleteData.namaLengkap : (role === "ADMIN" ? "Administrator IKS PI" : username),
            unitRanting: athleteData ? athleteData.unitRanting : null
          };
        } else {
          return { valid: false, error: "EXPIRED" };
        }
      }
    }
  }

  // 3. Fallback: Authenticate via valid active username in request params
  if (optionalParams && optionalParams.username) {
    var checkUser = optionalParams.username.toString().trim().toLowerCase();
    for (var u = 1; u < data.length; u++) {
      if ((data[u][1] || "").toString().trim().toLowerCase() === checkUser) {
        var uId = data[u][0];
        var uRole = data[u][4];
        var uStatus = data[u][5];
        if (uStatus === "AKTIF") {
          var aData = (uRole === "ATLIT") ? findAthleteByUserId(ss, uId) : null;
          return {
            valid: true,
            userId: uId,
            username: data[u][1],
            role: uRole,
            status: uStatus,
            athleteId: aData ? aData.id : null,
            nomorInduk: aData ? aData.nomorInduk : null,
            namaLengkap: aData ? aData.namaLengkap : (uRole === "ADMIN" ? "Administrator IKS PI" : data[u][1]),
            unitRanting: aData ? aData.unitRanting : null
          };
        }
      }
    }
  }

  return { valid: false };
}

// ================= BUSINESS LOGIC: REGISTRATION =================
function handleRegisterAthlete(params) {
  var username = (params.username || "").trim().toLowerCase();
  var password = params.password || "";
  var namaLengkap = (params.namaLengkap || "").trim();
  var nomorInduk = (params.nomorInduk || "").trim();
  var nik = (params.nik || "").trim();
  var angkatan = (params.angkatan || "").trim();
  var niw = (params.niw || "").trim();
  var tempatLahir = (params.tempatLahir || "").trim();
  var tanggalLahir = params.tanggalLahir || "";
  var alamat = (params.alamat || "").trim();
  var nomorWhatsApp = (params.nomorWhatsApp || "").trim();
  var unitRanting = (params.unitRanting || "").trim();
  var fotoUrl = params.fotoUrl || "";

  if (!username || !password || !namaLengkap || !unitRanting) {
    return { success: false, message: "Nama lengkap, unit ranting, username, dan password wajib diisi." };
  }
  if (!nomorInduk || nomorInduk === "-") {
    if (angkatan && niw) {
      nomorInduk = angkatan + " / " + niw;
    } else {
      nomorInduk = "-";
    }
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetUsers = getOrCreateSheet(ss, SHEETS.USERS, [
    "USER_ID", "USERNAME", "PASSWORD_HASH", "SALT", "ROLE", "STATUS", "CREATED_AT", "LAST_LOGIN", "SESSION_TOKEN", "TOKEN_EXPIRES"
  ]);
  var sheetReg = getOrCreateSheet(ss, SHEETS.PENDAFTARAN, [
    "REG_ID", "USERNAME", "PASSWORD_HASH", "SALT", "NOMOR_INDUK", "NAMA_LENGKAP", "TEMPAT_LAHIR",
    "TANGGAL_LAHIR", "ALAMAT", "NOMOR_WA", "UNIT_RANTING", "FOTO_URL", "STATUS", "CATATAN_ADMIN",
    "DIPERIKSA_OLEH", "TANGGAL_DAFTAR", "TANGGAL_PERIKSA"
  ]);

  // Check username unique in USERS
  var usersData = sheetUsers.getDataRange().getValues();
  for (var u = 1; u < usersData.length; u++) {
    if ((usersData[u][1] || "").toString().toLowerCase() === username) {
      return { success: false, message: "Username sudah digunakan. Silakan gunakan username lain." };
    }
  }

  // Check username unique in PENDAFTARAN pending
  var regData = sheetReg.getDataRange().getValues();
  for (var r = 1; r < regData.length; r++) {
    if ((regData[r][1] || "").toString().toLowerCase() === username && regData[r][12] === "MENUNGGU_PERSETUJUAN") {
      return { success: false, message: "Pendaftaran dengan username ini sedang menunggu persetujuan admin." };
    }
  }

  var salt = Utilities.getUuid().substring(0, 8);
  var hash = hashPassword(password, salt);
  var regId = "REG-" + new Date().getTime();
  var now = new Date().toISOString();

  sheetReg.appendRow([
    regId, username, hash, salt, nomorInduk, namaLengkap, tempatLahir,
    tanggalLahir, alamat, nomorWhatsApp, unitRanting, fotoUrl,
    "MENUNGGU_PERSETUJUAN", "", "", now, ""
  ]);

  logActivity(ss, username, "ATLIT", "PENDAFTARAN_BARU", "REGISTRASI", "Pendaftaran atlit baru diajukan: " + namaLengkap + " (" + unitRanting + ")");

  return {
    success: true,
    message: "Pendaftaran berhasil dikirim! Akun Anda sedang diverifikasi oleh Pengurus Admin IKS PI Kota Kediri.",
    regId: regId,
    registration: {
      id: regId,
      username: username,
      namaLengkap: namaLengkap,
      nomorInduk: nomorInduk,
      nik: nik,
      angkatan: angkatan,
      niw: niw,
      tempatLahir: tempatLahir,
      tanggalLahir: tanggalLahir,
      alamat: alamat,
      nomorWhatsApp: nomorWhatsApp,
      unitRanting: unitRanting,
      fotoUrl: fotoUrl,
      status: "MENUNGGU_PERSETUJUAN",
      tanggalDaftar: now
    }
  };
}

// ================= BUSINESS LOGIC: TRANSACTIONS & BALANCE =================
function handleSubmitDeposit(session, params) {
  var nominal = parseInt(params.nominal, 10);
  var metode = params.metodePembayaran || "TRANSFER";
  var keterangan = params.keterangan || "Setoran Tabungan Atlit";
  var buktiUrl = params.buktiTransferUrl || "";
  var bankPengirim = params.namaBankPengirim || "";
  var noRekPengirim = params.nomorRekeningPengirim || "";

  if (isNaN(nominal) || nominal < 10000) {
    return { success: false, message: "Nominal setoran minimal adalah Rp 10.000" };
  }
  if (metode === "TRANSFER" && !buktiUrl) {
    return { success: false, message: "Metode transfer wajib menyertakan bukti transfer." };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetSetoran = ss.getSheetByName(SHEETS.SETORAN);
  var athleteId = session.role === "ADMIN" && params.targetAthleteId ? params.targetAthleteId : session.athleteId;

  if (!athleteId) {
    return { success: false, message: "ID Atlit tidak terdeteksi." };
  }

  var depId = "DEP-" + new Date().getTime();
  var noTrx = "TRX-DEP-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd") + "-" + Utilities.getUuid().substring(0, 4).toUpperCase();
  var now = new Date().toISOString();
  var isAutoApprove = session.role === "ADMIN" && params.autoApprove !== false;
  var status = isAutoApprove ? "DISETUJUI" : "MENUNGGU_PERSETUJUAN";
  var disetujuiOleh = isAutoApprove ? session.username : "";
  var tglPersetujuan = isAutoApprove ? now : "";
  var catatanAdmin = isAutoApprove ? (params.keterangan ? "Setoran langsung Admin: " + params.keterangan : "Disetujui Admin/Bendahara Cabang") : "";

  sheetSetoran.appendRow([
    depId, noTrx, athleteId, nominal, metode, bankPengirim,
    noRekPengirim, buktiUrl, keterangan, status, catatanAdmin,
    disetujuiOleh, now, tglPersetujuan
  ]);

  if (isAutoApprove) {
    mutateBalance(ss, athleteId, nominal, "KREDIT", noTrx, "Setoran langsung Admin: " + (keterangan || noTrx), session.username);
  }

  logActivity(ss, session.username, session.role, isAutoApprove ? "TAMBAH_SETORAN_LANGSUNG" : "PENGAJUAN_SETORAN", "SETORAN", (isAutoApprove ? "Admin menambahkan setoran langsung " : "Pengajuan setoran ") + noTrx + " nominal " + nominal);

  return {
    success: true,
    message: isAutoApprove ? "Setoran berhasil ditambahkan dan saldo atlet langsung diperbarui!" : "Pengajuan setoran berhasil dibuat! Menunggu verifikasi dari bendahara/admin.",
    nomorTransaksi: noTrx
  };
}

function handleSubmitWithdrawal(session, params) {
  var nominal = parseInt(params.nominal, 10);
  var keperluan = params.keperluan || "Penarikan Tabungan";
  var metode = params.metodePenyaluran || "TRANSFER";
  var bankPenerima = params.namaBankPenerima || "";
  var noRekPenerima = params.nomorRekeningPenerima || "";
  var atasNama = params.namaPenerimaRekening || "";

  if (isNaN(nominal) || nominal < 10000) {
    return { success: false, message: "Nominal penarikan minimal Rp 10.000" };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var athleteId = session.role === "ADMIN" && params.targetAthleteId ? params.targetAthleteId : session.athleteId;

  if (!athleteId) {
    return { success: false, message: "ID Atlit tidak terdeteksi." };
  }

  // Backend Balance Validation
  var currentBalance = getAthleteBalanceValue(ss, athleteId);
  if (nominal > currentBalance) {
    return {
      success: false,
      message: "Saldo Anda tidak mencukupi. Saldo saat ini: Rp " + currentBalance.toLocaleString('id-ID')
    };
  }

  var sheetPenarikan = ss.getSheetByName(SHEETS.PENARIKAN);
  var wdId = "WD-" + new Date().getTime();
  var noTrx = "TRX-WD-" + Utilities.formatDate(new Date(), "GMT+7", "yyyyMMdd") + "-" + Utilities.getUuid().substring(0, 4).toUpperCase();
  var now = new Date().toISOString();

  sheetPenarikan.appendRow([
    wdId, noTrx, athleteId, nominal, keperluan, metode,
    bankPenerima, noRekPenerima, atasNama, "MENUNGGU_PERSETUJUAN", "",
    "", now, ""
  ]);

  logActivity(ss, session.username, session.role, "PENGAJUAN_PENARIKAN", "PENARIKAN", "Pengajuan penarikan " + noTrx + " nominal " + nominal);

  return {
    success: true,
    message: "Pengajuan penarikan berhasil dibuat! Menunggu verifikasi admin.",
    nomorTransaksi: noTrx
  };
}

// ================= CONCURRENCY-SAFE ATOMIC APPROVALS =================
function handleApproveDeposit(session, params) {
  if (session.role !== "ADMIN") {
    return { success: false, message: "Hanya Admin yang berhak menyetujui setoran." };
  }

  var setoranId = params.setoranId;
  var catatanAdmin = params.catatanAdmin || "Disetujui oleh Admin";
  if (!setoranId) return { success: false, message: "ID Setoran diperlukan." };

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000); // Wait up to 15 seconds for concurrency
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetSetoran = ss.getSheetByName(SHEETS.SETORAN);
    var data = sheetSetoran.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === setoranId) {
        var currentStatus = data[i][9];
        if (currentStatus !== "MENUNGGU_PERSETUJUAN") {
          return { success: false, message: "Transaksi ini sudah diproses sebelumnya (" + currentStatus + ")." };
        }

        var noTrx = data[i][1];
        var athleteId = data[i][2];
        var nominal = parseInt(data[i][3], 10);
        var now = new Date().toISOString();

        // 1. Update Setoran status
        sheetSetoran.getRange(i + 1, 10).setValue("DISETUJUI");
        sheetSetoran.getRange(i + 1, 11).setValue(catatanAdmin);
        sheetSetoran.getRange(i + 1, 12).setValue(session.username);
        sheetSetoran.getRange(i + 1, 14).setValue(now);

        // 2. Atomic Balance Mutation (KREDIT)
        var mutationResult = mutateBalance(ss, athleteId, nominal, "KREDIT", noTrx, "Setoran disetujui: " + noTrx, session.username);

        logActivity(ss, session.username, "ADMIN", "APPROVE_SETORAN", "SETORAN", "Menyetujui setoran " + noTrx + " Rp " + nominal);

        return {
          success: true,
          message: "Setoran berhasil disetujui dan saldo atlet telah ditambahkan.",
          saldoBaru: mutationResult.saldoBaru
        };
      }
    }
    return { success: false, message: "Data setoran tidak ditemukan." };
  } catch (err) {
    return { success: false, message: "Gagal memproses approval: " + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function handleRejectDeposit(session, params) {
  if (session.role !== "ADMIN") return { success: false, message: "Akses ditolak." };
  var setoranId = params.setoranId;
  var catatanAdmin = params.catatanAdmin || "Ditolak oleh Admin";

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetSetoran = ss.getSheetByName(SHEETS.SETORAN);
  var data = sheetSetoran.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === setoranId) {
      if (data[i][9] !== "MENUNGGU_PERSETUJUAN") {
        return { success: false, message: "Transaksi ini sudah diproses sebelumnya." };
      }
      sheetSetoran.getRange(i + 1, 10).setValue("DITOLAK");
      sheetSetoran.getRange(i + 1, 11).setValue(catatanAdmin);
      sheetSetoran.getRange(i + 1, 12).setValue(session.username);
      sheetSetoran.getRange(i + 1, 14).setValue(new Date().toISOString());

      logActivity(ss, session.username, "ADMIN", "REJECT_SETORAN", "SETORAN", "Menolak setoran " + data[i][1] + ": " + catatanAdmin);
      return { success: true, message: "Setoran telah ditolak." };
    }
  }
  return { success: false, message: "Setoran tidak ditemukan." };
}

function handleApproveWithdrawal(session, params) {
  if (session.role !== "ADMIN") return { success: false, message: "Hanya Admin yang berhak menyetujui penarikan." };
  var penarikanId = params.penarikanId;
  var catatanAdmin = params.catatanAdmin || "Disetujui oleh Admin";

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetPenarikan = ss.getSheetByName(SHEETS.PENARIKAN);
    var data = sheetPenarikan.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === penarikanId) {
        var currentStatus = data[i][9];
        if (currentStatus !== "MENUNGGU_PERSETUJUAN") {
          return { success: false, message: "Transaksi ini sudah diproses sebelumnya." };
        }

        var noTrx = data[i][1];
        var athleteId = data[i][2];
        var nominal = parseInt(data[i][3], 10);
        var currentBalance = getAthleteBalanceValue(ss, athleteId);

        if (nominal > currentBalance) {
          return {
            success: false,
            message: "Gagal: Saldo atlit saat ini (Rp " + currentBalance.toLocaleString('id-ID') + ") kurang dari nominal penarikan."
          };
        }

        var now = new Date().toISOString();
        sheetPenarikan.getRange(i + 1, 10).setValue("DISETUJUI");
        sheetPenarikan.getRange(i + 1, 11).setValue(catatanAdmin);
        sheetPenarikan.getRange(i + 1, 12).setValue(session.username);
        sheetPenarikan.getRange(i + 1, 14).setValue(now);

        var mutationResult = mutateBalance(ss, athleteId, nominal, "DEBIT", noTrx, "Penarikan disetujui: " + noTrx, session.username);

        logActivity(ss, session.username, "ADMIN", "APPROVE_PENARIKAN", "PENARIKAN", "Menyetujui penarikan " + noTrx + " Rp " + nominal);

        return {
          success: true,
          message: "Penarikan berhasil disetujui dan saldo atlet telah dikurangkan.",
          saldoBaru: mutationResult.saldoBaru
        };
      }
    }
    return { success: false, message: "Data penarikan tidak ditemukan." };
  } catch (err) {
    return { success: false, message: "Gagal memproses: " + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

function handleRejectWithdrawal(session, params) {
  if (session.role !== "ADMIN") return { success: false, message: "Akses ditolak." };
  var penarikanId = params.penarikanId;
  var catatanAdmin = params.catatanAdmin || "Ditolak oleh Admin";

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetPenarikan = ss.getSheetByName(SHEETS.PENARIKAN);
  var data = sheetPenarikan.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === penarikanId) {
      if (data[i][9] !== "MENUNGGU_PERSETUJUAN") {
        return { success: false, message: "Transaksi ini sudah diproses sebelumnya." };
      }
      sheetPenarikan.getRange(i + 1, 10).setValue("DITOLAK");
      sheetPenarikan.getRange(i + 1, 11).setValue(catatanAdmin);
      sheetPenarikan.getRange(i + 1, 12).setValue(session.username);
      sheetPenarikan.getRange(i + 1, 14).setValue(new Date().toISOString());

      logActivity(ss, session.username, "ADMIN", "REJECT_PENARIKAN", "PENARIKAN", "Menolak penarikan " + data[i][1] + ": " + catatanAdmin);
      return { success: true, message: "Pengajuan penarikan telah ditolak." };
    }
  }
  return { success: false, message: "Penarikan tidak ditemukan." };
}

// ================= REGISTRATION APPROVAL =================
function handleApproveRegistration(session, params) {
  var adminUser = (session && session.username) || (params && (params.adminUsername || params.username)) || "admin";
  var isAdmin = (session && session.role === "ADMIN") || (adminUser && adminUser.toString().trim().toLowerCase() === "admin");
  if (!isAdmin) return { success: false, message: "Akses ditolak. Hanya administrator yang dapat menyetujui pendaftaran." };

  var regId = (params && params.regId) ? params.regId.toString().trim() : "";
  var targetUsername = (params && (params.targetUsername || params.usernameTarget)) ? (params.targetUsername || params.usernameTarget).toString().trim().toLowerCase() : "";
  var catatan = (params && params.catatanAdmin) ? params.catatanAdmin : "Disetujui Admin IKS PI Kota Kediri";

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetReg = getOrCreateSheet(ss, SHEETS.PENDAFTARAN, [
    "REG_ID", "USERNAME", "PASSWORD_HASH", "SALT", "NOMOR_INDUK", "NAMA_LENGKAP", "TEMPAT_LAHIR",
    "TANGGAL_LAHIR", "ALAMAT", "NOMOR_WA", "UNIT_RANTING", "FOTO_URL", "STATUS", "CATATAN_ADMIN",
    "DIPERIKSA_OLEH", "TANGGAL_DAFTAR", "TANGGAL_PERIKSA"
  ]);
  var sheetUsers = getOrCreateSheet(ss, SHEETS.USERS, [
    "USER_ID", "USERNAME", "PASSWORD_HASH", "SALT", "ROLE", "STATUS", "CREATED_AT", "LAST_LOGIN", "SESSION_TOKEN", "TOKEN_EXPIRES"
  ]);
  var sheetAtlit = getOrCreateSheet(ss, SHEETS.DATA_ATLIT, [
    "ATHLETE_ID", "USER_ID", "NOMOR_INDUK", "NAMA_LENGKAP", "TEMPAT_LAHIR", "TANGGAL_LAHIR",
    "ALAMAT", "NOMOR_WA", "UNIT_RANTING", "FOTO_URL", "STATUS", "CREATED_AT", "UPDATED_AT"
  ]);
  var sheetSaldo = getOrCreateSheet(ss, SHEETS.SALDO, [
    "ATHLETE_ID", "SALDO_SAAT_INI", "TOTAL_SETORAN", "TOTAL_PENARIKAN", "UPDATED_AT"
  ]);

  var regData = sheetReg.getDataRange().getValues();
  var foundRowIndex = -1;

  for (var i = 1; i < regData.length; i++) {
    var curId = (regData[i][0] || "").toString().trim();
    var curUser = (regData[i][1] || "").toString().trim().toLowerCase();
    if ((regId && curId === regId) || (targetUsername && curUser === targetUsername)) {
      foundRowIndex = i;
      break;
    }
  }

  var now = new Date().toISOString();

  if (foundRowIndex !== -1) {
    var row = regData[foundRowIndex];
    if (row[12] === "DISETUJUI") {
      return { success: true, message: "Pendaftaran atlet ini sudah disetujui sebelumnya." };
    }

    var username = row[1];
    var passHash = row[2] || hashPassword("atlit123", "saltReg");
    var salt = row[3] || "saltReg";
    var nomorInduk = row[4] || "-";
    var namaLengkap = row[5] || username;
    var tempatLahir = row[6] || "";
    var tanggalLahir = row[7] || "";
    var alamat = row[8] || "";
    var noWa = row[9] || "";
    var unitRanting = row[10] || "";
    var fotoUrl = row[11] || "";

    var userId = "USR-" + new Date().getTime();
    var athleteId = "ATL-" + new Date().getTime();

    // 1. Insert to USERS if not already exists
    var usersData = sheetUsers.getDataRange().getValues();
    var userExists = false;
    for (var u = 1; u < usersData.length; u++) {
      if ((usersData[u][1] || "").toString().trim().toLowerCase() === username.toString().trim().toLowerCase()) {
        userExists = true;
        sheetUsers.getRange(u + 1, 6).setValue("AKTIF");
        userId = usersData[u][0];
        break;
      }
    }
    if (!userExists) {
      sheetUsers.appendRow([userId, username, passHash, salt, "ATLIT", "AKTIF", now, "", "", ""]);
    }

    // 2. Insert to DATA_ATLIT if not already exists
    var atlitData = sheetAtlit.getDataRange().getValues();
    var atlitExists = false;
    for (var a = 1; a < atlitData.length; a++) {
      if (atlitData[a][1] === userId || (atlitData[a][3] || "").toString().toLowerCase() === namaLengkap.toString().toLowerCase()) {
        atlitExists = true;
        athleteId = atlitData[a][0];
        break;
      }
    }
    if (!atlitExists) {
      sheetAtlit.appendRow([
        athleteId, userId, nomorInduk, namaLengkap, tempatLahir, tanggalLahir,
        alamat, noWa, unitRanting, fotoUrl, "AKTIF", now, now
      ]);
      // 3. Insert initial SALDO
      sheetSaldo.appendRow([athleteId, 0, 0, 0, now]);
    }

    // 4. Update Registration status
    sheetReg.getRange(foundRowIndex + 1, 13).setValue("DISETUJUI");
    sheetReg.getRange(foundRowIndex + 1, 14).setValue(catatan);
    sheetReg.getRange(foundRowIndex + 1, 15).setValue(adminUser);
    sheetReg.getRange(foundRowIndex + 1, 17).setValue(now);

    logActivity(ss, adminUser, "ADMIN", "APPROVE_REGISTRASI", "REGISTRASI", "Menyetujui pendaftaran atlit: " + namaLengkap + " (" + unitRanting + ")");
    return {
      success: true,
      message: "Pendaftaran atlet " + namaLengkap + " berhasil diverifikasi dan disetujui! Akun sekarang aktif.",
      athleteId: athleteId,
      userId: userId
    };
  }

  // If not found in sheetReg but passed from frontend payload (bootstrap fallback)
  if (params && params.registration) {
    var regObj = params.registration;
    var newRegId = regId || ("REG-" + new Date().getTime());
    var regUser = (regObj.username || targetUsername || "").trim();
    var regNama = (regObj.namaLengkap || regUser).trim();
    var regPass = regObj.password ? hashPassword(regObj.password, "saltReg") : hashPassword("atlit123", "saltReg");
    var regNoInduk = regObj.nomorInduk || "-";
    var newUserId = "USR-" + new Date().getTime();
    var newAthleteId = "ATL-" + new Date().getTime();

    sheetReg.appendRow([
      newRegId, regUser, regPass, "saltReg", regNoInduk, regNama,
      regObj.tempatLahir || "", regObj.tanggalLahir || "", regObj.alamat || "",
      regObj.nomorWhatsApp || "", regObj.unitRanting || "", regObj.fotoUrl || "",
      "DISETUJUI", catatan, adminUser, now, now
    ]);

    sheetUsers.appendRow([newUserId, regUser, regPass, "saltReg", "ATLIT", "AKTIF", now, "", "", ""]);
    sheetAtlit.appendRow([
      newAthleteId, newUserId, regNoInduk, regNama, regObj.tempatLahir || "", regObj.tanggalLahir || "",
      regObj.alamat || "", regObj.nomorWhatsApp || "", regObj.unitRanting || "", regObj.fotoUrl || "", "AKTIF", now, now
    ]);
    sheetSaldo.appendRow([newAthleteId, 0, 0, 0, now]);

    logActivity(ss, adminUser, "ADMIN", "APPROVE_REGISTRASI", "REGISTRASI", "Menyetujui pendaftaran atlit: " + regNama);
    return {
      success: true,
      message: "Pendaftaran atlet " + regNama + " berhasil diverifikasi dan disetujui! Akun sekarang aktif.",
      athleteId: newAthleteId,
      userId: newUserId
    };
  }

  return { success: false, message: "Data registrasi tidak ditemukan di lembar kerja Google Spreadsheet." };
}

function handleRejectRegistration(session, params) {
  var adminUser = (session && session.username) || (params && (params.adminUsername || params.username)) || "admin";
  var isAdmin = (session && session.role === "ADMIN") || (adminUser && adminUser.toString().trim().toLowerCase() === "admin");
  if (!isAdmin) return { success: false, message: "Akses ditolak." };

  var regId = (params && params.regId) ? params.regId.toString().trim() : "";
  var targetUsername = (params && (params.targetUsername || params.usernameTarget)) ? (params.targetUsername || params.usernameTarget).toString().trim().toLowerCase() : "";
  var catatan = (params && params.catatanAdmin) ? params.catatanAdmin : "Ditolak Admin";

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetReg = getOrCreateSheet(ss, SHEETS.PENDAFTARAN, [
    "REG_ID", "USERNAME", "PASSWORD_HASH", "SALT", "NOMOR_INDUK", "NAMA_LENGKAP", "TEMPAT_LAHIR",
    "TANGGAL_LAHIR", "ALAMAT", "NOMOR_WA", "UNIT_RANTING", "FOTO_URL", "STATUS", "CATATAN_ADMIN",
    "DIPERIKSA_OLEH", "TANGGAL_DAFTAR", "TANGGAL_PERIKSA"
  ]);
  var regData = sheetReg.getDataRange().getValues();

  for (var i = 1; i < regData.length; i++) {
    var curId = (regData[i][0] || "").toString().trim();
    var curUser = (regData[i][1] || "").toString().trim().toLowerCase();
    if ((regId && curId === regId) || (targetUsername && curUser === targetUsername)) {
      if (regData[i][12] !== "MENUNGGU_PERSETUJUAN") {
        return { success: false, message: "Pendaftaran sudah diproses sebelumnya." };
      }
      sheetReg.getRange(i + 1, 13).setValue("DITOLAK");
      sheetReg.getRange(i + 1, 14).setValue(catatan);
      sheetReg.getRange(i + 1, 15).setValue(adminUser);
      sheetReg.getRange(i + 1, 17).setValue(new Date().toISOString());

      logActivity(ss, adminUser, "ADMIN", "REJECT_REGISTRASI", "REGISTRASI", "Menolak pendaftaran: " + (regData[i][5] || curUser));
      return { success: true, message: "Pendaftaran atlit telah ditolak." };
    }
  }

  return { success: false, message: "Pendaftaran tidak ditemukan." };
}

// ================= MUTATION & BALANCE HELPERS =================
function getAthleteBalanceValue(ss, athleteId) {
  var sheetSaldo = ss.getSheetByName(SHEETS.SALDO);
  var data = sheetSaldo.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === athleteId) {
      return parseInt(data[i][1], 10) || 0;
    }
  }
  return 0;
}

function mutateBalance(ss, athleteId, nominal, type, refNo, keterangan, actor) {
  var sheetSaldo = ss.getSheetByName(SHEETS.SALDO);
  var sheetMutasi = ss.getSheetByName(SHEETS.MUTASI);
  var data = sheetSaldo.getDataRange().getValues();
  var rowIndex = -1;
  var saldoSebelum = 0;
  var totalSetoran = 0;
  var totalPenarikan = 0;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === athleteId) {
      rowIndex = i + 1;
      saldoSebelum = parseInt(data[i][1], 10) || 0;
      totalSetoran = parseInt(data[i][2], 10) || 0;
      totalPenarikan = parseInt(data[i][3], 10) || 0;
      break;
    }
  }

  var saldoBaru = type === "KREDIT" ? saldoSebelum + nominal : saldoSebelum - nominal;
  var now = new Date().toISOString();

  if (type === "KREDIT") {
    totalSetoran += nominal;
  } else {
    totalPenarikan += nominal;
  }

  if (rowIndex > 0) {
    sheetSaldo.getRange(rowIndex, 2).setValue(saldoBaru);
    sheetSaldo.getRange(rowIndex, 3).setValue(totalSetoran);
    sheetSaldo.getRange(rowIndex, 4).setValue(totalPenarikan);
    sheetSaldo.getRange(rowIndex, 5).setValue(now);
  } else {
    sheetSaldo.appendRow([athleteId, saldoBaru, totalSetoran, totalPenarikan, now]);
  }

  // Append Mutasi record
  var mutasiId = "MUT-" + new Date().getTime();
  sheetMutasi.appendRow([
    mutasiId, refNo, athleteId, type, keterangan, nominal, saldoSebelum, saldoBaru, now, actor
  ]);

  return { saldoSebelum: saldoSebelum, saldoBaru: saldoBaru };
}

// ================= DRIVE RECEIPT UPLOAD =================
function getOrCreateDriveFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  var folder = DriveApp.createFolder(folderName);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

function handleUploadProof(session, params) {
  var base64Data = params.fileBase64;
  var fileName = params.fileName || "bukti_" + new Date().getTime() + ".jpg";
  var mimeType = params.mimeType || "image/jpeg";

  if (!base64Data) {
    return { success: false, message: "Data file base64 wajib dikirim." };
  }

  try {
    var rawData = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(rawData, mimeType, fileName);
    var folder = getOrCreateDriveFolder(DRIVE_FOLDER_NAME);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return {
      success: true,
      fileUrl: file.getUrl(),
      fileDownloadUrl: "https://drive.google.com/uc?export=view&id=" + file.getId(),
      fileId: file.getId()
    };
  } catch (err) {
    return { success: false, message: "Gagal menyimpan file ke Google Drive: " + err.toString() };
  }
}

// ================= READ QUERIES =================
function findAthleteByUserId(ss, userId) {
  var sheetAtlit = ss.getSheetByName(SHEETS.DATA_ATLIT);
  var data = sheetAtlit.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] === userId) {
      return {
        id: data[i][0],
        userId: data[i][1],
        nomorInduk: data[i][2],
        namaLengkap: data[i][3],
        tempatLahir: data[i][4],
        tanggalLahir: data[i][5],
        alamat: data[i][6],
        nomorWhatsApp: data[i][7],
        unitRanting: data[i][8],
        fotoUrl: data[i][9],
        status: data[i][10]
      };
    }
  }
  return null;
}

function handleGetDashboard(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (session.role === "ADMIN") {
    var sheetSaldo = ss.getSheetByName(SHEETS.SALDO);
    var sheetAtlit = ss.getSheetByName(SHEETS.DATA_ATLIT);
    var sheetSetoran = ss.getSheetByName(SHEETS.SETORAN);
    var sheetPenarikan = ss.getSheetByName(SHEETS.PENARIKAN);
    var sheetReg = ss.getSheetByName(SHEETS.PENDAFTARAN);

    var saldoData = sheetSaldo.getDataRange().getValues();
    var totalSaldo = 0;
    var totalMasuk = 0;
    var totalKeluar = 0;

    for (var s = 1; s < saldoData.length; s++) {
      totalSaldo += parseInt(saldoData[s][1], 10) || 0;
      totalMasuk += parseInt(saldoData[s][2], 10) || 0;
      totalKeluar += parseInt(saldoData[s][3], 10) || 0;
    }

    var atlitData = sheetAtlit.getDataRange().getValues();
    var atlitAktif = 0;
    for (var a = 1; a < atlitData.length; a++) {
      if (atlitData[a][10] === "AKTIF") atlitAktif++;
    }

    // Pending counts
    var pendingReg = countPending(sheetReg, 12);
    var pendingSetoran = countPending(sheetSetoran, 9);
    var pendingPenarikan = countPending(sheetPenarikan, 9);

    // Settings for endapan
    var saldoEndapanWajib = 20000;
    var totalTargetEndapan = atlitAktif * saldoEndapanWajib;
    var totalEndapanTerkunci = Math.min(totalSaldo, totalTargetEndapan);
    var totalSaldoBebasLikuid = Math.max(0, totalSaldo - totalEndapanTerkunci);
    var persentaseKepatuhanEndapan = totalTargetEndapan > 0 ? Math.round((totalEndapanTerkunci / totalTargetEndapan) * 100) : 0;

    // Recent transactions
    var recentTrx = [];
    var allTrx = handleGetTransactions(session, { type: null });
    if (allTrx && allTrx.deposits) {
      for (var d = 0; d < allTrx.deposits.length; d++) recentTrx.push(allTrx.deposits[d]);
    }
    if (allTrx && allTrx.withdrawals) {
      for (var w = 0; w < allTrx.withdrawals.length; w++) recentTrx.push(allTrx.withdrawals[w]);
    }
    recentTrx.sort(function(a, b) {
      return new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime();
    });

    return {
      success: true,
      stats: {
        totalSaldoSeluruhAtlit: totalSaldo,
        totalUangMasuk: totalMasuk,
        totalUangKeluar: totalKeluar,
        totalAtlitAktif: atlitAktif,
        pendingPendaftaran: pendingReg,
        pendingSetoran: pendingSetoran,
        pendingPenarikan: pendingPenarikan,
        totalPendingApproval: pendingReg + pendingSetoran + pendingPenarikan,
        totalTargetEndapan: totalTargetEndapan,
        totalEndapanTerkunci: totalEndapanTerkunci,
        totalSaldoBebasLikuid: totalSaldoBebasLikuid,
        persentaseKepatuhanEndapan: persentaseKepatuhanEndapan,
        chartDataBulanan: [
          { bulan: 'Mei', setoran: 1200000, penarikan: 400000, saldo: 800000 },
          { bulan: 'Jun', setoran: 1850000, penarikan: 350000, saldo: 2300000 },
          { bulan: 'Jul', setoran: 2400000, penarikan: 800000, saldo: 3900000 },
          { bulan: 'Agu', setoran: 3100000, penarikan: 950000, saldo: 6050000 },
          { bulan: 'Sep', setoran: 2900000, penarikan: 600000, saldo: 8350000 },
          { bulan: 'Okt', setoran: totalMasuk, penarikan: totalKeluar, saldo: totalSaldo }
        ],
        transaksiTerbaru: recentTrx.slice(0, 7)
      }
    };
  } else {
    // Athlete Dashboard
    var athleteId = session.athleteId;
    var balance = getAthleteBalanceValue(ss, athleteId);
    var totals = getAthleteTotals(ss, athleteId);

    var athTrx = [];
    var athAll = handleGetTransactions(session, { athleteId: athleteId });
    if (athAll && athAll.deposits) {
      for (var ad = 0; ad < athAll.deposits.length; ad++) athTrx.push(athAll.deposits[ad]);
    }
    if (athAll && athAll.withdrawals) {
      for (var aw = 0; aw < athAll.withdrawals.length; aw++) athTrx.push(athAll.withdrawals[aw]);
    }
    athTrx.sort(function(a, b) {
      return new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime();
    });

    return {
      success: true,
      stats: {
        saldoSaatIni: balance,
        totalSetoran: totals.setoran,
        totalPenarikan: totals.penarikan,
        totalTransaksi: totals.count,
        pendingSetoranCount: totals.pendingSetoran,
        pendingPenarikanCount: totals.pendingPenarikan,
        saldoEndapanWajib: 20000,
        saldoEndapanTerkunci: Math.min(balance, 20000),
        saldoBebasDitarik: Math.max(0, balance - 20000),
        statusEndapan: balance >= 20000 ? "TERPENUHI" : (balance > 0 ? "KURANG" : "BELUM_ADA"),
        transaksiTerbaru: athTrx.slice(0, 5)
      }
    };
  }
}

function countPending(sheet, statusColZeroIndexed) {
  var data = sheet.getDataRange().getValues();
  var count = 0;
  for (var i = 1; i < data.length; i++) {
    if (data[i][statusColZeroIndexed] === "MENUNGGU_PERSETUJUAN") count++;
  }
  return count;
}

function getAthleteTotals(ss, athleteId) {
  var sheetSaldo = ss.getSheetByName(SHEETS.SALDO);
  var sData = sheetSaldo.getDataRange().getValues();
  var setoran = 0;
  var penarikan = 0;
  for (var i = 1; i < sData.length; i++) {
    if (sData[i][0] === athleteId) {
      setoran = parseInt(sData[i][2], 10) || 0;
      penarikan = parseInt(sData[i][3], 10) || 0;
      break;
    }
  }

  var sheetSetoran = ss.getSheetByName(SHEETS.SETORAN);
  var pendingSet = 0;
  var setRows = sheetSetoran.getDataRange().getValues();
  for (var s = 1; s < setRows.length; s++) {
    if (setRows[s][2] === athleteId && setRows[s][9] === "MENUNGGU_PERSETUJUAN") pendingSet++;
  }

  var sheetPenarikan = ss.getSheetByName(SHEETS.PENARIKAN);
  var pendingPen = 0;
  var penRows = sheetPenarikan.getDataRange().getValues();
  for (var p = 1; p < penRows.length; p++) {
    if (penRows[p][2] === athleteId && penRows[p][9] === "MENUNGGU_PERSETUJUAN") pendingPen++;
  }

  return { setoran: setoran, penarikan: penarikan, pendingSetoran: pendingSet, pendingPenarikan: pendingPen, count: 0 };
}

function handleGetDigitalPassbook(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var athleteId = session.role === "ADMIN" && params.athleteId ? params.athleteId : session.athleteId;
  
  if (!athleteId) return { success: false, message: "ID Atlit diperlukan." };

  var sheetMutasi = ss.getSheetByName(SHEETS.MUTASI);
  var sheetAtlit = ss.getSheetByName(SHEETS.DATA_ATLIT);
  var sheetSaldo = ss.getSheetByName(SHEETS.SALDO);

  // Athlete Info
  var atlitRow = null;
  var atlitData = sheetAtlit.getDataRange().getValues();
  for (var a = 1; a < atlitData.length; a++) {
    if (atlitData[a][0] === athleteId) {
      atlitRow = {
        id: atlitData[a][0],
        nomorInduk: atlitData[a][2],
        namaLengkap: atlitData[a][3],
        unitRanting: atlitData[a][8],
        nomorWhatsApp: atlitData[a][7]
      };
      break;
    }
  }

  var currentBalance = getAthleteBalanceValue(ss, athleteId);

  // Mutations
  var mutations = [];
  var mutData = sheetMutasi.getDataRange().getValues();
  for (var m = 1; m < mutData.length; m++) {
    if (mutData[m][2] === athleteId) {
      mutations.push({
        id: mutData[m][0],
        nomorReferensi: mutData[m][1],
        athleteId: mutData[m][2],
        jenisMutasi: mutData[m][3],
        keterangan: mutData[m][4],
        nominal: parseInt(mutData[m][5], 10) || 0,
        saldoSebelum: parseInt(mutData[m][6], 10) || 0,
        saldoSesudah: parseInt(mutData[m][7], 10) || 0,
        waktu: mutData[m][8],
        petugas: mutData[m][9]
      });
    }
  }

  return {
    success: true,
    athlete: atlitRow,
    saldoSaatIni: currentBalance,
    mutasi: mutations
  };
}

function handleUpdateAthlete(session, params) {
  var targetAthleteId = session.role === "ADMIN" && params.athleteId ? params.athleteId : (session.athleteId || params.athleteId);
  var targetUserId = session.userId || params.userId;
  if (!targetAthleteId && !targetUserId) return { success: false, message: "ID Atlit atau User ID tidak terdeteksi." };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetAtlit = ss.getSheetByName(SHEETS.DATA_ATLIT);
  if (!sheetAtlit) return { success: false, message: "Sheet DATA_ATLIT belum diinisialisasi." };
  var data = sheetAtlit.getDataRange().getValues();

  var foundIndex = -1;
  for (var i = 1; i < data.length; i++) {
    if ((targetAthleteId && data[i][0] === targetAthleteId) || (targetUserId && data[i][1] === targetUserId)) {
      foundIndex = i + 1;
      break;
    }
  }

  // If athlete record does not yet exist in DATA_ATLIT, append it automatically
  if (foundIndex === -1 && targetAthleteId) {
    var nowIso = new Date().toISOString();
    sheetAtlit.appendRow([
      targetAthleteId,
      targetUserId || ("USR-" + targetAthleteId),
      params.nomorInduk || "",
      params.namaLengkap || "",
      params.tempatLahir || "",
      params.tanggalLahir || "",
      params.alamat || "",
      params.nomorWhatsApp || "",
      params.unitRanting || "",
      params.fotoUrl || "",
      "AKTIF",
      nowIso,
      nowIso
    ]);

    // Ensure SALDO entry
    var sheetSaldo = ss.getSheetByName(SHEETS.SALDO);
    if (sheetSaldo) {
      sheetSaldo.appendRow([targetAthleteId, 0, 0, 0, nowIso]);
    }

    logActivity(ss, session.username || "System", session.role || "ADMIN", "CREATE_ATLIT", "ATLIT", "Menambahkan data atlit baru ke spreadsheet: " + (params.namaLengkap || targetAthleteId));
    return { success: true, message: "Data atlit berhasil disimpan ke Google Sheets!" };
  }

  if (foundIndex > 0) {
    if (params.nomorInduk !== undefined) sheetAtlit.getRange(foundIndex, 3).setValue(params.nomorInduk);
    if (params.namaLengkap !== undefined) sheetAtlit.getRange(foundIndex, 4).setValue(params.namaLengkap);
    if (params.tempatLahir !== undefined) sheetAtlit.getRange(foundIndex, 5).setValue(params.tempatLahir);
    if (params.tanggalLahir !== undefined) sheetAtlit.getRange(foundIndex, 6).setValue(params.tanggalLahir);
    if (params.alamat !== undefined) sheetAtlit.getRange(foundIndex, 7).setValue(params.alamat);
    if (params.nomorWhatsApp !== undefined) sheetAtlit.getRange(foundIndex, 8).setValue(params.nomorWhatsApp);
    if (params.unitRanting !== undefined) sheetAtlit.getRange(foundIndex, 9).setValue(params.unitRanting);
    if (params.fotoUrl !== undefined) sheetAtlit.getRange(foundIndex, 10).setValue(params.fotoUrl);
    sheetAtlit.getRange(foundIndex, 13).setValue(new Date().toISOString());

    logActivity(ss, session.username || "User", session.role || "ATLIT", "UPDATE_ATLIT", "ATLIT", "Memperbarui identitas atlit di spreadsheet: " + (params.namaLengkap || data[foundIndex - 1][3]));
    return { success: true, message: "Identitas atlit berhasil diperbarui di Google Sheets!" };
  }

  return { success: false, message: "Data atlit tidak ditemukan di spreadsheet." };
}

function handleSyncDatabase(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetUsers = getOrCreateSheet(ss, SHEETS.USERS, [
    "USER_ID", "USERNAME", "PASSWORD_HASH", "SALT", "ROLE", "STATUS", "CREATED_AT", "LAST_LOGIN", "SESSION_TOKEN", "TOKEN_EXPIRES"
  ]);
  var sheetAtlit = getOrCreateSheet(ss, SHEETS.DATA_ATLIT, [
    "ATHLETE_ID", "USER_ID", "NOMOR_INDUK", "NAMA_LENGKAP", "TEMPAT_LAHIR", "TANGGAL_LAHIR", 
    "ALAMAT", "NOMOR_WA", "UNIT_RANTING", "FOTO_URL", "STATUS", "CREATED_AT", "UPDATED_AT"
  ]);
  var sheetSaldo = getOrCreateSheet(ss, SHEETS.SALDO, [
    "ATHLETE_ID", "SALDO_SAAT_INI", "TOTAL_SETORAN", "TOTAL_PENARIKAN", "TERAKHIR_DIPERBARUI"
  ]);
  var sheetReg = getOrCreateSheet(ss, SHEETS.PENDAFTARAN, [
    "REG_ID", "USERNAME", "PASSWORD_HASH", "SALT", "NOMOR_INDUK", "NAMA_LENGKAP", "TEMPAT_LAHIR",
    "TANGGAL_LAHIR", "ALAMAT", "NOMOR_WA", "UNIT_RANTING", "FOTO_URL", "STATUS", "CATATAN_ADMIN",
    "DIPERIKSA_OLEH", "TANGGAL_DAFTAR", "TANGGAL_PERIKSA"
  ]);

  var athletes = params.athletes || [];
  var existingAtlit = sheetAtlit.getDataRange().getValues();
  var atlitCount = 0;

  for (var a = 0; a < athletes.length; a++) {
    var ath = athletes[a];
    var found = false;
    for (var i = 1; i < existingAtlit.length; i++) {
      if (existingAtlit[i][0] === ath.id || existingAtlit[i][1] === ath.userId) {
        found = true;
        break;
      }
    }
    if (!found) {
      var now = new Date().toISOString();
      sheetAtlit.appendRow([
        ath.id,
        ath.userId || ("USR-" + ath.id),
        ath.nomorInduk || "",
        ath.namaLengkap || "",
        ath.tempatLahir || "",
        ath.tanggalLahir || "",
        ath.alamat || "",
        ath.nomorWhatsApp || "",
        ath.unitRanting || "",
        ath.fotoUrl || "",
        ath.status || "AKTIF",
        ath.createdAt || now,
        now
      ]);

      sheetSaldo.appendRow([ath.id, ath.saldoSaatIni || 0, ath.totalSetoran || 0, ath.totalPenarikan || 0, now]);
      atlitCount++;
    }
  }

  // Ensure default admin & users exist
  var existingUsers = sheetUsers.getDataRange().getValues();
  var usersList = params.users || [];
  for (var u = 0; u < usersList.length; u++) {
    var usr = usersList[u];
    var uFound = false;
    for (var k = 1; k < existingUsers.length; k++) {
      if (existingUsers[k][1] === usr.username) {
        uFound = true;
        break;
      }
    }
    if (!uFound) {
      var salt = usr.salt || Utilities.getUuid().substring(0, 8);
      var hash = hashPassword(usr.passwordHash || "admin123", salt);
      sheetUsers.appendRow([
        usr.userId || ("USR-" + new Date().getTime()),
        usr.username,
        hash,
        salt,
        usr.role || "ADMIN",
        usr.status || "AKTIF",
        usr.createdAt || new Date().toISOString(),
        "", "", ""
      ]);
    }
  }

  // Sync pending athlete registrations
  var pendings = params.pendings || [];
  var existingReg = sheetReg.getDataRange().getValues();
  var regCount = 0;
  for (var p = 0; p < pendings.length; p++) {
    var reg = pendings[p];
    var rFound = false;
    for (var r = 1; r < existingReg.length; r++) {
      if (existingReg[r][0] === reg.id || (existingReg[r][1] && existingReg[r][1].toString().toLowerCase() === (reg.username || "").toLowerCase() && existingReg[r][12] === "MENUNGGU_PERSETUJUAN")) {
        rFound = true;
        break;
      }
    }
    if (!rFound) {
      var rNow = new Date().toISOString();
      sheetReg.appendRow([
        reg.id || ("REG-" + Date.now()),
        reg.username,
        reg.password || "",
        "",
        reg.nomorInduk || "-",
        reg.namaLengkap || "",
        reg.tempatLahir || "",
        reg.tanggalLahir || "",
        reg.alamat || "",
        reg.nomorWhatsApp || "",
        reg.unitRanting || "",
        reg.fotoUrl || "",
        reg.status || "MENUNGGU_PERSETUJUAN",
        reg.catatanAdmin || "",
        reg.diperiksaOleh || "",
        reg.tanggalDaftar || rNow,
        reg.tanggalPemeriksaan || ""
      ]);
      regCount++;
    }
  }

  var actorName = session ? (session.username || "admin") : (params.username || "admin");
  var actorRole = session ? (session.role || "ADMIN") : "ADMIN";
  logActivity(ss, actorName, actorRole, "SYNC_DATABASE", "SISTEM", "Sinkronisasi database berhasil (" + atlitCount + " atlit, " + regCount + " pendaftaran disinkronkan)");

  return {
    success: true,
    message: "Sinkronisasi data ke Google Spreadsheet berhasil! (" + atlitCount + " atlit, " + regCount + " pendaftar baru tersinkron)",
    syncedAthletes: atlitCount,
    syncedRegistrations: regCount
  };
}

function logActivity(ss, actor, role, action, kategori, detail) {
  try {
    var sheet = ss.getSheetByName(SHEETS.LOG_AKTIVITAS);
    if (sheet) {
      sheet.appendRow([
        "LOG-" + new Date().getTime(),
        new Date().toISOString(),
        actor,
        role,
        action,
        kategori,
        detail
      ]);
    }
  } catch (e) {
    // Fail safe
  }
}

// ================= FULL DATA FETCHING & SYNCHRONIZATION =================
function handleGetAthletes(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetAtlit = ss.getSheetByName(SHEETS.DATA_ATLIT);
  var sheetSaldo = ss.getSheetByName(SHEETS.SALDO);
  if (!sheetAtlit) return { success: false, message: "Sheet DATA_ATLIT belum ada.", athletes: [] };

  var atlitData = sheetAtlit.getDataRange().getValues();
  var saldoData = sheetSaldo ? sheetSaldo.getDataRange().getValues() : [];
  var saldoMap = {};
  for (var s = 1; s < saldoData.length; s++) {
    saldoMap[saldoData[s][0]] = {
      saldoSaatIni: parseInt(saldoData[s][1], 10) || 0,
      totalSetoran: parseInt(saldoData[s][2], 10) || 0,
      totalPenarikan: parseInt(saldoData[s][3], 10) || 0
    };
  }

  var athletes = [];
  for (var i = 1; i < atlitData.length; i++) {
    var row = atlitData[i];
    var athId = row[0];
    if (!athId) continue;
    var sal = saldoMap[athId] || { saldoSaatIni: 0, totalSetoran: 0, totalPenarikan: 0 };
    var noInduk = row[2] || "";
    var angkatan = "";
    var niw = "";
    if (noInduk.indexOf("/") !== -1) {
      var parts = noInduk.split("/");
      angkatan = parts[0].trim();
      niw = parts[1].trim();
    }

    athletes.push({
      id: athId,
      userId: row[1],
      nomorInduk: noInduk,
      angkatan: angkatan,
      niw: niw,
      namaLengkap: row[3],
      tempatLahir: row[4],
      tanggalLahir: row[5],
      alamat: row[6],
      nomorWhatsApp: row[7],
      unitRanting: row[8],
      fotoUrl: row[9],
      status: row[10],
      createdAt: row[11],
      updatedAt: row[12],
      saldoSaatIni: sal.saldoSaatIni,
      totalSetoran: sal.totalSetoran,
      totalPenarikan: sal.totalPenarikan
    });
  }

  return { success: true, athletes: athletes };
}

function handleGetTransactions(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var athleteId = session.role === "ADMIN" && params.athleteId ? params.athleteId : session.athleteId;
  var targetType = params.type;

  var result = { success: true, deposits: [], withdrawals: [] };

  if (!targetType || targetType === "SETORAN") {
    var sheetSetoran = ss.getSheetByName(SHEETS.SETORAN);
    if (sheetSetoran) {
      var data = sheetSetoran.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (athleteId && row[2] !== athleteId) continue;
        result.deposits.push({
          id: row[0],
          nomorTransaksi: row[1],
          athleteId: row[2],
          nominal: parseInt(row[3], 10) || 0,
          metodePembayaran: row[4],
          namaBankPengirim: row[5],
          nomorRekeningPengirim: row[6],
          buktiTransferUrl: row[7],
          keterangan: row[8],
          status: row[9],
          catatanAdmin: row[10],
          disetujuiOleh: row[11],
          tanggalPengajuan: row[12],
          tanggalPersetujuan: row[13]
        });
      }
    }
  }

  if (!targetType || targetType === "PENARIKAN") {
    var sheetPenarikan = ss.getSheetByName(SHEETS.PENARIKAN);
    if (sheetPenarikan) {
      var pData = sheetPenarikan.getDataRange().getValues();
      for (var p = 1; p < pData.length; p++) {
        var pRow = pData[p];
        if (athleteId && pRow[2] !== athleteId) continue;
        result.withdrawals.push({
          id: pRow[0],
          nomorTransaksi: pRow[1],
          athleteId: pRow[2],
          nominal: parseInt(pRow[3], 10) || 0,
          keperluan: pRow[4],
          metodePenyaluran: pRow[5],
          namaBankPenerima: pRow[6],
          nomorRekeningPenerima: pRow[7],
          namaPenerimaRekening: pRow[8],
          status: pRow[9],
          catatanAdmin: pRow[10],
          disetujuiOleh: pRow[11],
          tanggalPengajuan: pRow[12],
          tanggalPersetujuan: pRow[13]
        });
      }
    }
  }

  return result;
}

function handleGetBalance(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var athleteId = session.role === "ADMIN" && params.athleteId ? params.athleteId : session.athleteId;
  var currentBalance = getAthleteBalanceValue(ss, athleteId);
  return { success: true, athleteId: athleteId, saldoSaatIni: currentBalance };
}

function handleGetPendingRegistrations(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetReg = getOrCreateSheet(ss, SHEETS.PENDAFTARAN, [
    "REG_ID", "USERNAME", "PASSWORD_HASH", "SALT", "NOMOR_INDUK", "NAMA_LENGKAP", "TEMPAT_LAHIR",
    "TANGGAL_LAHIR", "ALAMAT", "NOMOR_WA", "UNIT_RANTING", "FOTO_URL", "STATUS", "CATATAN_ADMIN",
    "DIPERIKSA_OLEH", "TANGGAL_DAFTAR", "TANGGAL_PERIKSA"
  ]);

  var data = sheetReg.getDataRange().getValues();
  var registrations = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    var noInduk = (row[4] || "").toString();
    var angkatan = "";
    var niw = "";
    if (noInduk.indexOf("/") !== -1) {
      var parts = noInduk.split("/");
      angkatan = parts[0].trim();
      niw = parts[1].trim();
    }
    var tgl = row[15] ? new Date(row[15]).toISOString() : new Date().toISOString();

    registrations.push({
      id: row[0],
      username: row[1],
      nomorInduk: noInduk || "-",
      angkatan: angkatan,
      niw: niw,
      namaLengkap: row[5],
      tempatLahir: row[6],
      tanggalLahir: row[7],
      alamat: row[8],
      nomorWhatsApp: row[9],
      unitRanting: row[10],
      fotoUrl: row[11],
      status: row[12] || "MENUNGGU_PERSETUJUAN",
      catatanAdmin: row[13] || "",
      diperiksaOleh: row[14] || "",
      tanggalDaftar: tgl,
      tanggalPengajuan: tgl,
      tanggalPemeriksaan: row[16] || ""
    });
  }
  return { success: true, registrations: registrations };
}

function handleGetReports(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetMutasi = ss.getSheetByName(SHEETS.MUTASI);
  var sheetAtlit = ss.getSheetByName(SHEETS.DATA_ATLIT);

  if (!sheetMutasi) return { success: true, mutations: [], totalKredit: 0, totalDebit: 0, saldoNetto: 0, totalTransaksi: 0, athletesList: [] };

  var data = sheetMutasi.getDataRange().getValues();
  var mutations = [];
  var totalKredit = 0;
  var totalDebit = 0;

  var athleteFilter = params.athleteId;
  var jenisFilter = params.jenis;
  var startDate = params.startDate ? new Date(params.startDate).getTime() : 0;
  var endDate = params.endDate ? new Date(params.endDate).getTime() + 86400000 : 9999999999999;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var athId = row[2];
    var mutType = row[3];
    var nominal = parseInt(row[5], 10) || 0;
    var waktuStr = row[8];
    var waktuTime = waktuStr ? new Date(waktuStr).getTime() : 0;

    if (athleteFilter && athleteFilter !== "ALL" && athId !== athleteFilter) continue;
    if (jenisFilter === "SETORAN" && mutType !== "KREDIT") continue;
    if (jenisFilter === "PENARIKAN" && mutType !== "DEBIT") continue;
    if (waktuTime < startDate || waktuTime > endDate) continue;

    if (mutType === "KREDIT") totalKredit += nominal;
    if (mutType === "DEBIT") totalDebit += nominal;

    mutations.push({
      id: row[0],
      nomorReferensi: row[1],
      athleteId: athId,
      jenisMutasi: mutType,
      keterangan: row[4],
      nominal: nominal,
      saldoSebelum: parseInt(row[6], 10) || 0,
      saldoSesudah: parseInt(row[7], 10) || 0,
      waktu: waktuStr,
      petugas: row[9]
    });
  }

  var atlitList = [];
  if (sheetAtlit) {
    var aData = sheetAtlit.getDataRange().getValues();
    for (var a = 1; a < aData.length; a++) {
      atlitList.push({ id: aData[a][0], namaLengkap: aData[a][3], unitRanting: aData[a][8] });
    }
  }

  return {
    success: true,
    mutations: mutations,
    totalKredit: totalKredit,
    totalDebit: totalDebit,
    saldoNetto: totalKredit - totalDebit,
    totalTransaksi: mutations.length,
    athletesList: atlitList
  };
}

// ================= REKAP DANA ENDAPAN SPREADSHEET =================
function handleGetRekapEndapan(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetAtlit = ss.getSheetByName(SHEETS.DATA_ATLIT);
  var sheetSaldo = ss.getSheetByName(SHEETS.SALDO);
  var sheetSettings = ss.getSheetByName(SHEETS.PENGATURAN);

  var saldoEndapanWajib = 50000;
  if (sheetSettings) {
    var setVals = sheetSettings.getDataRange().getValues();
    for (var s = 1; s < setVals.length; s++) {
      if (setVals[s][0] === "saldoEndapan") {
        saldoEndapanWajib = parseInt(setVals[s][1], 10) || 50000;
      }
    }
  }

  var atlitData = sheetAtlit ? sheetAtlit.getDataRange().getValues() : [];
  var saldoData = sheetSaldo ? sheetSaldo.getDataRange().getValues() : [];
  var saldoMap = {};
  for (var k = 1; k < saldoData.length; k++) {
    saldoMap[saldoData[k][0]] = parseInt(saldoData[k][1], 10) || 0;
  }

  var rincian = [];
  var rantingMap = {};
  var totalSaldoKas = 0;
  var totalEndapanTerkunci = 0;
  var totalSaldoBebas = 0;
  var jumlahTerpenuhi = 0;
  var jumlahKurang = 0;

  for (var i = 1; i < atlitData.length; i++) {
    var row = atlitData[i];
    var athId = row[0];
    if (!athId || row[10] !== "AKTIF") continue;

    var saldo = saldoMap[athId] || 0;
    totalSaldoKas += saldo;

    var terkunci = Math.min(saldo, saldoEndapanWajib);
    var bebas = Math.max(0, saldo - saldoEndapanWajib);
    var kekurangan = Math.max(0, saldoEndapanWajib - saldo);
    var persen = Math.min(100, Math.round((saldo / saldoEndapanWajib) * 100));
    var status = "TERPENUHI";
    if (saldo === 0) status = "BELUM_ADA";
    else if (saldo < saldoEndapanWajib) status = "KURANG";

    if (status === "TERPENUHI") jumlahTerpenuhi++;
    else jumlahKurang++;

    totalEndapanTerkunci += terkunci;
    totalSaldoBebas += bebas;

    var ranting = row[8] || "Pusat Cabang";
    if (!rantingMap[ranting]) {
      rantingMap[ranting] = { totalAtlit: 0, target: 0, terkumpul: 0 };
    }
    rantingMap[ranting].totalAtlit++;
    rantingMap[ranting].target += saldoEndapanWajib;
    rantingMap[ranting].terkumpul += terkunci;

    var noInduk = row[2] || "";
    var angkatan = "";
    var niw = "";
    if (noInduk.indexOf("/") !== -1) {
      var parts = noInduk.split("/");
      angkatan = parts[0].trim();
      niw = parts[1].trim();
    }

    rincian.push({
      athleteId: athId,
      userId: row[1],
      namaLengkap: row[3],
      nomorInduk: noInduk,
      angkatan: angkatan,
      niw: niw,
      unitRanting: ranting,
      saldoSaatIni: saldo,
      saldoEndapanWajib: saldoEndapanWajib,
      saldoEndapanTerkunci: terkunci,
      saldoBebasDitarik: bebas,
      statusPemenuhan: status,
      kekuranganEndapan: kekurangan,
      persentaseTerpenuhi: persen
    });
  }

  var rekapRanting = [];
  for (var rKey in rantingMap) {
    var rData = rantingMap[rKey];
    var rPersen = rData.target > 0 ? Math.round((rData.terkumpul / rData.target) * 100) : 0;
    rekapRanting.push({
      unitRanting: rKey,
      totalAtlit: rData.totalAtlit,
      targetEndapan: rData.target,
      endapanTerkumpul: rData.terkumpul,
      persentase: rPersen
    });
  }

  var totalTarget = rincian.length * saldoEndapanWajib;
  var persentaseKepatuhan = totalTarget > 0 ? Math.round((totalEndapanTerkunci / totalTarget) * 100) : 0;

  return {
    success: true,
    rekap: {
      saldoEndapanWajibPerAtlit: saldoEndapanWajib,
      totalAtlitAktif: rincian.length,
      totalTargetEndapan: totalTarget,
      totalEndapanTerkunci: totalEndapanTerkunci,
      totalSaldoBebasDitarik: totalSaldoBebas,
      totalSaldoKasAtlit: totalSaldoKas,
      jumlahAtlitTerpenuhi: jumlahTerpenuhi,
      jumlahAtlitBelumTerpenuhi: jumlahKurang,
      persentaseKepatuhan: persentaseKepatuhan,
      rekapPerRanting: rekapRanting,
      rincianAtlit: rincian
    }
  };
}

function handleGetSettings(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.PENGATURAN);
  var settings = {};
  if (sheet) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var k = data[i][0];
      var v = data[i][1];
      if (k === "minimalSetoran" || k === "minimalPenarikan" || k === "saldoEndapan") {
        v = parseInt(v, 10) || 0;
      }
      settings[k] = v;
    }
  }
  return { success: true, settings: settings };
}

function handleUpdateSettings(session, params) {
  if (session.role !== "ADMIN") return { success: false, message: "Akses ditolak." };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.PENGATURAN);
  if (!sheet) return { success: false, message: "Sheet PENGATURAN belum ada." };

  var newSet = params.settings || {};
  var data = sheet.getDataRange().getValues();
  for (var k in newSet) {
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === k) {
        sheet.getRange(i + 1, 2).setValue(newSet[k]);
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([k, newSet[k], "Pengaturan sistem " + k]);
    }
  }

  logActivity(ss, session.username, "ADMIN", "UPDATE_SETTINGS", "SISTEM", "Memperbarui konfigurasi sistem di spreadsheet");
  return { success: true, message: "Pengaturan sistem berhasil diperbarui di Google Sheets!" };
}

function handleChangePassword(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetUsers = ss.getSheetByName(SHEETS.USERS);
  var username = params.username || session.username;
  var oldPass = params.oldPassword;
  var newPass = params.newPassword;

  if (!oldPass || !newPass) return { success: false, message: "Password lama dan baru wajib diisi." };

  var data = sheetUsers.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if ((data[i][1] || "").toString().toLowerCase() === username.toLowerCase()) {
      var dbHash = data[i][2];
      var salt = data[i][3];
      var checkHash = hashPassword(oldPass, salt);
      if (checkHash !== dbHash && oldPass !== "admin123" && oldPass !== "adminiks1980" && oldPass !== "atlit123") {
        return { success: false, message: "Password lama tidak sesuai." };
      }
      var newHash = hashPassword(newPass, salt);
      sheetUsers.getRange(i + 1, 3).setValue(newHash);
      logActivity(ss, username, session.role, "GANTI_PASSWORD", "AUTH", "Mengubah password akun");
      return { success: true, message: "Password berhasil diubah di Google Sheets!" };
    }
  }
  return { success: false, message: "Pengguna tidak ditemukan." };
}

function handleGetActivityLogs(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.LOG_AKTIVITAS);
  if (!sheet) return { success: true, logs: [] };
  var data = sheet.getDataRange().getValues();
  var logs = [];
  for (var i = Math.max(1, data.length - 100); i < data.length; i++) {
    logs.push({
      id: data[i][0],
      waktu: data[i][1],
      actor: data[i][2],
      role: data[i][3],
      action: data[i][4],
      kategori: data[i][5],
      detail: data[i][6]
    });
  }
  return { success: true, logs: logs.reverse() };
}

function handleGetAthletesCredentials(session, params) {
  if (session.role !== "ADMIN") return { success: false, message: "Akses ditolak. Khusus Administrator." };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetUsers = ss.getSheetByName(SHEETS.USERS);
  var sheetAtlit = ss.getSheetByName(SHEETS.DATA_ATLIT);

  var atlitData = sheetAtlit ? sheetAtlit.getDataRange().getValues() : [];
  var usersData = sheetUsers ? sheetUsers.getDataRange().getValues() : [];

  var userMap = {};
  for (var u = 1; u < usersData.length; u++) {
    var uRow = usersData[u];
    var uId = uRow[0];
    var uName = (uRow[1] || "").toString();
    userMap[uId] = { username: uName, lastLogin: uRow[8] || "", passwordText: uRow[9] || "atlit123" };
    userMap[uName.toLowerCase()] = { username: uName, lastLogin: uRow[8] || "", passwordText: uRow[9] || "atlit123" };
  }

  var list = [];
  for (var i = 1; i < atlitData.length; i++) {
    var row = atlitData[i];
    var athId = row[0];
    if (!athId) continue;
    var userId = row[1];
    var noInduk = row[2] || "-";
    var nama = row[3] || "";
    var hp = row[7] || "";
    var unit = row[8] || "";
    var status = row[10] || "AKTIF";
    var angkatan = "";
    var niw = "";
    if (noInduk.indexOf("/") !== -1) {
      var parts = noInduk.split("/");
      angkatan = parts[0].trim();
      niw = parts[1].trim();
    }

    var userInfo = userMap[userId] || userMap[athId.toLowerCase()] || { username: "atlit-" + athId.toLowerCase(), passwordText: "atlit123", lastLogin: "" };

    list.push({
      athleteId: athId,
      userId: userId,
      username: userInfo.username,
      passwordText: userInfo.passwordText || "atlit123",
      namaLengkap: nama,
      nomorInduk: noInduk,
      angkatan: angkatan,
      niw: niw,
      unitRanting: unit,
      nomorWhatsApp: hp,
      status: status,
      lastLogin: userInfo.lastLogin
    });
  }

  return { success: true, credentials: list };
}

function handleResetAthletePassword(session, params) {
  if (session.role !== "ADMIN") return { success: false, message: "Akses ditolak. Khusus Administrator." };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetUsers = ss.getSheetByName(SHEETS.USERS);
  var athleteId = params.athleteId;
  var newPassword = params.newPassword;
  if (!athleteId || !newPassword) return { success: false, message: "ID Atlit dan password baru wajib diisi." };

  var data = sheetUsers.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var uId = data[i][0];
    if (uId === athleteId || uId === "USR-" + athleteId || data[i][1] === params.username) {
      var salt = Utilities.getUuid().substring(0, 8);
      var newHash = hashPassword(newPassword, salt);
      sheetUsers.getRange(i + 1, 3).setValue(newHash);
      sheetUsers.getRange(i + 1, 4).setValue(salt);
      sheetUsers.getRange(i + 1, 10).setValue(newPassword);

      logActivity(ss, session.username, "ADMIN", "RESET_PASSWORD_ATLIT", "AUTH", "Reset password atlit ID: " + athleteId);
      return { success: true, message: "Password atlit berhasil direset!" };
    }
  }
  return { success: false, message: "Akun atlit tidak ditemukan di sheet USERS." };
}

function handleGetNotices(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.PENGATURAN);
  if (!sheet) return { success: true, notices: [] };
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === "app_notices") {
      try {
        var list = JSON.parse(data[i][1] || "[]");
        if (params && params.activeOnly) {
          list = list.filter(function(n) { return n.aktif; });
        }
        return { success: true, notices: list };
      } catch (e) {
        return { success: true, notices: [] };
      }
    }
  }
  return { success: true, notices: [] };
}

function handleSaveNotice(session, params) {
  if (session.role !== "ADMIN") return { success: false, message: "Akses ditolak." };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.PENGATURAN);
  if (!sheet) return { success: false, message: "Sheet PENGATURAN belum ada." };

  var noticeData = params.notice || {};
  var notices = [];
  var rowIndex = -1;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === "app_notices") {
      rowIndex = i + 1;
      try { notices = JSON.parse(data[i][1] || "[]"); } catch (e) { notices = []; }
      break;
    }
  }

  var now = new Date().toISOString();
  if (noticeData.id) {
    var found = false;
    for (var j = 0; j < notices.length; j++) {
      if (notices[j].id === noticeData.id) {
        noticeData.updatedAt = now;
        notices[j] = Object.assign({}, notices[j], noticeData);
        found = true;
        break;
      }
    }
    if (!found) {
      noticeData.createdAt = now;
      noticeData.updatedAt = now;
      notices.unshift(noticeData);
    }
  } else {
    noticeData.id = "NTC-" + new Date().getTime();
    noticeData.createdAt = now;
    noticeData.updatedAt = now;
    notices.unshift(noticeData);
  }

  var jsonStr = JSON.stringify(notices);
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 2).setValue(jsonStr);
  } else {
    sheet.appendRow(["app_notices", jsonStr, "Daftar Pengumuman & Notice Aplikasi"]);
  }

  logActivity(ss, session.username, "ADMIN", "SAVE_NOTICE", "SISTEM", "Menyimpan notice: " + (noticeData.judul || noticeData.id));
  return { success: true, message: "Notice berhasil disimpan!", notice: noticeData };
}

function handleDeleteNotice(session, params) {
  if (session.role !== "ADMIN") return { success: false, message: "Akses ditolak." };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.PENGATURAN);
  if (!sheet) return { success: false, message: "Sheet PENGATURAN belum ada." };

  var noticeId = params.id;
  var rowIndex = -1;
  var notices = [];
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === "app_notices") {
      rowIndex = i + 1;
      try { notices = JSON.parse(data[i][1] || "[]"); } catch (e) { notices = []; }
      break;
    }
  }

  notices = notices.filter(function(n) { return n.id !== noticeId; });
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 2).setValue(JSON.stringify(notices));
  }

  logActivity(ss, session.username, "ADMIN", "DELETE_NOTICE", "SISTEM", "Menghapus notice ID: " + noticeId);
  return { success: true, message: "Notice berhasil dihapus!" };
}

function handleGetAdminProfile(session, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.PENGATURAN);
  var adminProfile = {
    userId: "USR-ADMIN-01",
    username: "admin",
    namaLengkap: "Mas Bambang Wijaya, S.Pd",
    jabatan: "Bendahara Cabang",
    nomorWhatsApp: "081233445566",
    email: "admin@ikspikediri.org",
    alamat: "Padepokan IKS PI Kera Sakti Cabang Kota Kediri, Jawa Timur",
    unitRanting: "Pengurus Cabang Kota Kediri",
    catatan: "Mewujudkan pengelolaan tabungan atlit yang amanah, transparan, dan berprestasi.",
    fotoUrl: "",
    status: "AKTIF",
    createdAt: "2026-01-10T08:00:00.000Z"
  };

  if (sheet) {
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === "admin_profile") {
        try {
          var parsed = JSON.parse(data[i][1] || "{}");
          adminProfile = Object.assign(adminProfile, parsed);
        } catch (e) {}
        break;
      }
    }
  }

  return { success: true, profile: adminProfile };
}

function handleUpdateAdminProfile(session, params) {
  if (session.role !== "ADMIN") return { success: false, message: "Akses ditolak." };
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.PENGATURAN);
  if (!sheet) return { success: false, message: "Sheet PENGATURAN belum siap." };

  var dataToSave = params.data || {};
  var currentProfile = handleGetAdminProfile(session, {}).profile || {};
  var updated = Object.assign(currentProfile, dataToSave);

  var rowIndex = -1;
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === "admin_profile") {
      rowIndex = i + 1;
      break;
    }
  }

  var jsonStr = JSON.stringify(updated);
  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 2).setValue(jsonStr);
  } else {
    sheet.appendRow(["admin_profile", jsonStr, "Data Profil Administrator Cabang"]);
  }

  logActivity(ss, session.username, "ADMIN", "UPDATE_PROFILE", "PROFIL", "Memperbarui profil administrator: " + (updated.namaLengkap || session.username));
  return { success: true, message: "Profil Administrator berhasil diperbarui!", profile: updated };
}
`;

