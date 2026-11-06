import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IksPiLogo } from '../../components/common/IksPiLogo';
import {
  User,
  CreditCard,
  MapPin,
  Calendar,
  Phone,
  Shield,
  Lock,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    namaLengkap: '',
    nik: '',
    angkatan: '',
    niw: '',
    tempatLahir: 'Kediri',
    tanggalLahir: '2005-01-01',
    alamat: '',
    nomorWhatsApp: '',
    unitRanting: '',
    username: '',
    password: '',
    confirmPassword: '',
    fotoUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const rantingSuggestions = [
    'Ranting Mojoroto',
    'Ranting Pesantren',
    'Ranting Kota Kediri',
    'Komisariat UNISKA Kediri',
    'Komisariat IAIN / UIN Kediri',
    'Komisariat Polinema / Poltek Kediri',
    'Ranting Semen',
    'Ranting Banyakan',
    'Ranting Gampengrejo',
    'Ranting Ngasem',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto maksimal 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        fotoUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.nik && formData.nik.replace(/[^0-9]/g, '').length !== 16) {
      setErrorMsg('NIK harus terdiri dari 16 digit angka sesuai KTP/KK/KIA.');
      return;
    }

    if (!formData.unitRanting.trim()) {
      setErrorMsg('Unit/Ranting latihan wajib diisi.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    const angkatanTrim = formData.angkatan.trim();
    const niwTrim = formData.niw.trim();
    let combinedNomorInduk = '-';
    if (angkatanTrim && niwTrim) {
      combinedNomorInduk = `${angkatanTrim} / ${niwTrim}`;
    } else if (angkatanTrim) {
      combinedNomorInduk = `Angkatan ${angkatanTrim}`;
    } else if (niwTrim) {
      combinedNomorInduk = `NIW ${niwTrim}`;
    }

    setLoading(true);
    const result = await register({
      namaLengkap: formData.namaLengkap,
      nomorInduk: combinedNomorInduk,
      nik: formData.nik.trim(),
      angkatan: formData.angkatan.trim(),
      niw: formData.niw.trim(),
      tempatLahir: formData.tempatLahir,
      tanggalLahir: formData.tanggalLahir,
      alamat: formData.alamat,
      nomorWhatsApp: formData.nomorWhatsApp,
      unitRanting: formData.unitRanting.trim(),
      username: formData.username,
      password: formData.password,
      fotoUrl: formData.fotoUrl,
    });
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 relative">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Login
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <IksPiLogo size="md" showSubtitle={true} />
          </div>
          <h2 className="text-2xl font-black text-white font-serif">
            Formulir Pendaftaran Atlit Baru
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Daftarkan diri Anda sebagai pemegang buku tabungan atlit IKS PI Kera Sakti Cabang Kota Kediri.
          </p>
        </div>

        {/* Success Card */}
        {successMsg ? (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Pendaftaran Berhasil Dikirim!</h3>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              {successMsg}
            </p>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 text-left space-y-1">
              <p className="font-semibold text-amber-400">Ketentuan Aktivasi:</p>
              <p>• Data Anda telah masuk ke daftar tunggu persetujuan pengurus cabang.</p>
              <p>• Akun belum dapat digunakan untuk login sebelum disetujui oleh Admin / Bendahara.</p>
              <p>• Konfirmasi dapat menghubungi Sekretariat Cabang Kota Kediri via WhatsApp.</p>
            </div>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow transition"
              >
                Kembali ke Halaman Login
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form Box */
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                  1. Informasi Atlet & Perguruan
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Atlit *
                  </label>
                  <input
                    type="text"
                    name="namaLengkap"
                    required
                    value={formData.namaLengkap}
                    onChange={handleChange}
                    placeholder="Contoh: Arya Bimasena"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NIK (Nomor Induk Kependudukan - 16 Digit) *
                  </label>
                  <input
                    type="text"
                    name="nik"
                    required
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="16 digit angka KTP/KK/KIA"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                {/* Nomor Induk Atlet: Angkatan + NIW (Opsional) */}
                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-700/80 hover:border-amber-500/40 transition space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <label className="block text-xs font-bold text-amber-400">
                        Nomor Induk Atlet (Angkatan + NIW)
                      </label>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                        Opsional
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-amber-300">
                      {formData.angkatan || formData.niw ? (
                        <>Format: <strong className="text-white">{formData.angkatan || '-'} / {formData.niw || '-'}</strong></>
                      ) : (
                        <span className="text-slate-500">Boleh dikosongkan</span>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Angkatan (Opsional)</label>
                      <input
                        type="text"
                        name="angkatan"
                        value={formData.angkatan}
                        onChange={handleChange}
                        placeholder="Contoh: 135"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">NIW / Nomor Induk Warga (Opsional)</label>
                      <input
                        type="text"
                        name="niw"
                        value={formData.niw}
                        onChange={handleChange}
                        placeholder="Contoh: 0482"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    * Jika belum memiliki Nomor Induk Warga (NIW) atau belum disahkan, kolom ini dapat dikosongkan dan akan dilengkapi oleh Admin Pengurus Cabang.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tempat Lahir *
                  </label>
                  <input
                    type="text"
                    name="tempatLahir"
                    required
                    value={formData.tempatLahir}
                    onChange={handleChange}
                    placeholder="Contoh: Kediri"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Lahir *
                  </label>
                  <input
                    type="date"
                    name="tanggalLahir"
                    required
                    value={formData.tanggalLahir}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                {/* Unit / Ranting Latihan (Bisa diisi manual) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      Unit / Ranting Latihan *
                    </label>
                    <span className="text-[10px] text-amber-400 font-medium">Bisa Ketik Bebas / Manual</span>
                  </div>
                  <input
                    type="text"
                    list="ranting-suggestions"
                    name="unitRanting"
                    required
                    value={formData.unitRanting}
                    onChange={handleChange}
                    placeholder="Ketik manual ranting/komisariat..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  <datalist id="ranting-suggestions">
                    {rantingSuggestions.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    name="nomorWhatsApp"
                    required
                    value={formData.nomorWhatsApp}
                    onChange={handleChange}
                    placeholder="08123456789"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alamat Lengkap Domisili *
                </label>
                <textarea
                  name="alamat"
                  rows={2}
                  required
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Jl. / Kelurahan / Kecamatan di wilayah Kediri"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Foto Atlit (Opsional - Berseragam Sakral / Bebas Rapi)
                </label>
                <div className="flex items-center gap-4">
                  {formData.fotoUrl && (
                    <img
                      src={formData.fotoUrl}
                      alt="Preview"
                      className="w-14 h-14 rounded-xl object-cover border border-amber-400/50"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              <div className="border-b border-slate-800 pt-4 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                  2. Kredensial Akun Login
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="hurufkecil.angka"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 karakter"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ulangi Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Ulangi password"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span>Kirim Pengajuan Pendaftaran</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
