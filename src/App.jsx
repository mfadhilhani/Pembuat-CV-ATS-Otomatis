import { useState, useRef } from "react";
import { Plus, Trash2, FileText, Download, Award, BookOpen, Upload, Loader2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

const SectionHeader = ({ title }) => <h2 className="text-lg font-semibold text-slate-800 border-b pb-2 mb-4 mt-6">{title}</h2>;

const InputField = ({ label, name, value, onChange, placeholder, type = "text", disabled = false }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm
        ${disabled ? "bg-slate-100 cursor-not-allowed text-slate-400" : ""}`}
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, hint }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={4} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
    {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
  </div>
);

const TypeToggle = ({ value, onChange }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium text-slate-600 mb-1">Jenis</label>
    <div className="flex rounded-md overflow-hidden border border-slate-200 w-fit">
      <button
        type="button"
        onClick={() => onChange("professional")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors
          ${value === "professional" ? "bg-emerald-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
      >
        <Award size={12} /> Sertifikasi Profesional
      </button>
      <button
        type="button"
        onClick={() => onChange("training")}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-slate-200
          ${value === "training" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
      >
        <BookOpen size={12} /> Pelatihan / Program
      </button>
    </div>
    <p className="text-xs text-slate-400 mt-1">{value === "professional" ? "Contoh: BNSP, AWS, Alibaba Cloud, Google Professional" : "Contoh: Workshop, Prakerja, GNIK, Bootcamp, Kursus online"}</p>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const emptyData = {
    personalInfo: { fullName: "", location: "", phone: "", email: "", linkedin: "", github: "" },
    summary: "",
    skills: "",
    experiences: [{ id: 1, title: "", company: "", startDate: "", endDate: "", current: false, description: "" }],
    certifications: [{ id: 1, name: "", issuer: "", startDate: "", endDate: "", hasExpiration: true, description: "", certType: "professional" }],
    education: [{ id: 1, degree: "", university: "", startYear: "", endYear: "", current: false, gpa: "", details: "" }],
    organizations: [{ id: 1, role: "", organization: "", startDate: "", endDate: "", current: false, description: "" }],
  };

  const [data, setData] = useState(emptyData);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null); // { type: 'success'|'error', text }
  const [prevData, setPrevData] = useState(null); // untuk fitur undo
  const [importMode, setImportMode] = useState("file"); // 'file' | 'paste'
  const [pasteText, setPasteText] = useState("");
  const fileInputRef = useRef(null);

  // ─── FORMAT DATE ────────────────────────────────────────────────────────────
  const formatDate = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes("-") && dateString.length === 7) {
      const [year, month] = dateString.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      return `${months[parseInt(month, 10) - 1]} ${year}`;
    }
    return dateString;
  };

  // ─── STANDARD HANDLERS ──────────────────────────────────────────────────────
  const handlePersonalInfoChange = (e) => setData({ ...data, personalInfo: { ...data.personalInfo, [e.target.name]: e.target.value } });
  const handleSimpleChange = (e, field) => setData({ ...data, [field]: e.target.value });
  const handleArrayChange = (category, index, field, value) => {
    const newData = { ...data };
    newData[category][index][field] = value;
    setData(newData);
  };
  const addItem = (category, template) => setData({ ...data, [category]: [...data[category], { id: Date.now(), ...template }] });
  const removeItem = (category, id) => setData({ ...data, [category]: data[category].filter((item) => item.id !== id) });
  const handlePrint = () => window.print();
  const displayVal = (userValue, mockValue) => (userValue && userValue.trim() !== "" ? userValue : mockValue);

  // ─── SHARED PARSE LOGIC ────────────────────────────────────────────────────
  const applyParsed = (parsed, sourceName) => {
    if (!parsed || typeof parsed !== "object") throw new Error("Format JSON tidak valid.");
    setPrevData(data);
    const stamp = Date.now();
    setData({
      personalInfo: {
        fullName: parsed.personalInfo?.fullName || "",
        location: parsed.personalInfo?.location || "",
        phone: parsed.personalInfo?.phone || "",
        email: parsed.personalInfo?.email || "",
        linkedin: parsed.personalInfo?.linkedin || "",
        github: parsed.personalInfo?.github || "",
      },
      summary: parsed.summary || "",
      skills: parsed.skills || "",
      experiences: parsed.experiences?.length ? parsed.experiences.map((x, i) => ({ id: stamp + i, ...x })) : emptyData.experiences,
      certifications: parsed.certifications?.length ? parsed.certifications.map((x, i) => ({ id: stamp + 100 + i, ...x })) : emptyData.certifications,
      education: parsed.education?.length ? parsed.education.map((x, i) => ({ id: stamp + 200 + i, ...x })) : emptyData.education,
      organizations: parsed.organizations?.length ? parsed.organizations.map((x, i) => ({ id: stamp + 300 + i, ...x })) : emptyData.organizations,
    });
    setImportMsg({ type: "success", text: `✓ Berhasil diimpor dari ${sourceName}. Periksa hasilnya lalu download PDF.` });
  };

  // ─── PARSE RAW TEXT (JSON atau MD dengan blok ```json```) ────────────────
  const parseRawText = (text, ext = "json") => {
    if (ext === "json") {
      const clean = text.replace(/^```json|^```|```$/gm, "").trim();
      return JSON.parse(clean);
    }
    const jsonMatch = text.match(/```json([\s\S]*?)```/);
    if (jsonMatch) return JSON.parse(jsonMatch[1].trim());
    // Coba parse langsung jika teks ternyata JSON murni
    const clean = text.trim();
    if (clean.startsWith("{")) return JSON.parse(clean);
    throw new Error("Tidak ditemukan blok JSON. Pastikan konten mengandung JSON valid atau blok ```json...```");
  };

  // ─── IMPORT HANDLER — FILE UPLOAD ───────────────────────────────────────
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    setImportMsg(null);

    try {
      const ext = file.name.split(".").pop().toLowerCase();

      if (!["json", "md", "txt"].includes(ext)) {
        setImportMsg({ type: "error", text: `Format .${ext} tidak didukung. Gunakan file .json atau .md/.txt yang dihasilkan dari prompt Claude.` });
        setImporting(false);
        e.target.value = "";
        return;
      }

      // Baca file sebagai teks
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file, "utf-8");
      });

      const parsed = parseRawText(text, ext);

      applyParsed(parsed, `"${file.name}"`);
    } catch (err) {
      console.error(err);
      const msg = err.message.includes("JSON") || err.message.includes("parse") ? "Format file tidak valid. Pastikan file JSON tidak rusak dan strukturnya sesuai template." : err.message || "Gagal membaca file. Coba lagi.";
      setImportMsg({ type: "error", text: msg });
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleUndo = () => {
    if (prevData) {
      setData(prevData);
      setPrevData(null);
      setImportMsg(null);
    }
  };

  // ─── IMPORT HANDLER — PASTE JSON ────────────────────────────────────────
  const handlePasteImport = () => {
    if (!pasteText.trim()) {
      setImportMsg({ type: "error", text: "Teks kosong. Paste JSON kamu terlebih dahulu." });
      return;
    }
    setImportMsg(null);
    try {
      const parsed = parseRawText(pasteText.trim(), "json");
      applyParsed(parsed, "teks yang di-paste");
      setPasteText("");
    } catch (err) {
      console.error(err);
      setImportMsg({ type: "error", text: "JSON tidak valid. Pastikan strukturnya benar dan tidak ada karakter yang hilang." });
    }
  };

  // ─── DERIVED STATE ───────────────────────────────────────────────────────────
  const professionalCerts = data.certifications.filter((c) => c.certType === "professional");
  const trainingCerts = data.certifications.filter((c) => c.certType === "training");
  const hasAnyCertContent = data.certifications.some((c) => c.name.trim() !== "" || c.issuer.trim() !== "");
  const showMockCert = !hasAnyCertContent;

  // ─── MOCK TEXT ───────────────────────────────────────────────────────────────
  const mockText = {
    fullName: "NAMA LENGKAP",
    location: "Kota Domisili",
    phone: "081234567890",
    email: "email.profesional@gmail.com",
    linkedin: "linkedin.com/in/username",
    github: "github.com/username",
    summary: "[Status/Pendidikan]. Memiliki pengalaman dalam [Bidang/Skill utama]. Terbiasa menggunakan [Alat/Software]. Memiliki kemampuan [Soft skill] yang baik dan siap berkontribusi pada posisi [Posisi yang dilamar].",
    skills: "Microsoft Office (Excel, Word, PPT) | Analisis Data | Pengelolaan Dokumen | SQL | Figma | Komunikasi Lintas Tim | Berpikir Analitis",
    expTitle: "Jabatan / Posisi Pekerjaan",
    expCompany: "Nama Perusahaan",
    expStart: "Jan 2024",
    expEnd: "Mar 2025",
    expDesc: "[Kata Kerja Aktif] [apa yang dilakukan] menggunakan [alat/metode] sehingga menghasilkan [hasil terukur/angka].\n[Kata Kerja Aktif] [tugas kedua] yang melibatkan [konteks] dan meningkatkan [metrik/dampak].",
    certProfName: "Nama Sertifikasi Profesional",
    certProfIssuer: "Lembaga Penerbit (misal: BNSP, AWS, Google)",
    certTrainName: "Nama Pelatihan / Program",
    certTrainIssuer: "Penyelenggara (misal: Coursera, GNIK, Prakerja)",
    certDate: "Sep 2025",
    certDesc: "Kompetensi atau materi yang didapat (opsional).",
    eduDegree: "S1 Jurusan / Program Studi",
    eduUniv: "Nama Universitas",
    eduStart: "2020",
    eduEnd: "2024",
    eduGPA: "3.85 / 4.00",
    eduDetails: "Skripsi: [Judul jika relevan] | Prestasi: [Sebutkan jika ada]",
    orgRole: "Peran / Posisi",
    orgName: "Nama Organisasi / Proyek",
    orgStart: "Feb 2022",
    orgEnd: "Feb 2023",
    orgDesc: "Mengelola [X] anggota dalam divisi [Nama Divisi] dan memastikan [target/hasil].\nMenyelenggarakan [acara] yang dihadiri oleh [jumlah] peserta secara sukses.",
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #cv-preview, #cv-preview * { visibility: visible; }
          #cv-preview {
            position: absolute; left: 0; top: 0;
            width: 100%; max-width: 100%; padding: 0; margin: 0;
            background: white; font-family: 'Calibri', 'Arial', sans-serif; color: black;
          }
          .no-print { display: none !important; }
          @page { size: A4; margin: 2.54cm; }
          .print-clean { box-shadow: none !important; border: none !important; padding: 0 !important; }
        }
      `}</style>

      {/* ═══ KIRI: FORM EDITOR ═══════════════════════════════════════════════ */}
      <div className="w-full md:w-1/2 p-6 overflow-y-auto h-screen border-r bg-white no-print">
        {/* Topbar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-blue-600" /> Editor CV ATS
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Font: Calibri | Margin: 1 Inch | Spasi: 1.15</p>
          </div>
          <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors">
            <Download size={18} /> Download PDF
          </button>
        </div>

        {/* ── IMPORT PANEL ── */}
        <div className="border border-dashed border-slate-300 rounded-xl p-4 mb-5 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Upload size={15} className="text-blue-500" /> Import CV dari JSON
          </p>

          {/* Tab toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-200 w-fit mb-4">
            <button
              onClick={() => {
                setImportMode("file");
                setImportMsg(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors
                ${importMode === "file" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              <Upload size={12} /> Upload File
            </button>
            <button
              onClick={() => {
                setImportMode("paste");
                setImportMsg(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-slate-200
                ${importMode === "paste" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              <FileText size={12} /> Paste JSON
            </button>
          </div>

          {/* ── MODE: UPLOAD FILE ── */}
          {importMode === "file" && (
            <div>
              <p className="text-xs text-slate-500 mb-3">
                Upload file <strong>.json</strong> atau <strong>.md/.txt</strong> yang berisi blok JSON — semua kolom terisi otomatis.
              </p>
              <input ref={fileInputRef} type="file" accept=".json,.md,.txt" onChange={handleImport} className="hidden" />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!importing) fileInputRef.current?.click();
                  }}
                  disabled={importing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${importing ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"}`}
                >
                  {importing ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Memproses...
                    </>
                  ) : (
                    <>
                      <Upload size={15} /> Pilih File
                    </>
                  )}
                </button>
                {prevData && (
                  <button onClick={handleUndo} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                    <RotateCcw size={14} /> Batalkan
                  </button>
                )}
              </div>
              {importing && (
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  Membaca dan memproses file...
                </div>
              )}
            </div>
          )}

          {/* ── MODE: PASTE JSON ── */}
          {importMode === "paste" && (
            <div>
              <p className="text-xs text-slate-500 mb-2">
                Copy hasil JSON dari Claude chat, paste langsung di bawah ini, lalu klik <strong>Terapkan</strong>.
              </p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={'Paste JSON kamu di sini...\n\n{\n  "personalInfo": { ... },\n  "summary": "...",\n  ...\n}'}
                rows={8}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs font-mono bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-y"
              />
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={handlePasteImport}
                  disabled={!pasteText.trim()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${!pasteText.trim() ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"}`}
                >
                  <CheckCircle2 size={15} /> Terapkan
                </button>
                {pasteText.trim() && (
                  <button
                    onClick={() => {
                      setPasteText("");
                      setImportMsg(null);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Bersihkan
                  </button>
                )}
                {prevData && (
                  <button onClick={handleUndo} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                    <RotateCcw size={14} /> Batalkan
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Status message — muncul di kedua mode */}
          {importMsg && (
            <div
              className={`mt-3 flex items-start gap-2 p-3 rounded-lg text-sm
              ${importMsg.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}
            >
              {importMsg.type === "success" ? <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" /> : <XCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />}
              <span>{importMsg.text}</span>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-5 rounded-r-md text-sm text-blue-800">
          <strong>Petunjuk:</strong> Ketik di form atau gunakan Import CV di atas. Preview kanan otomatis berubah. Teks abu-abu adalah <em>panduan</em> yang hilang saat mulai mengetik.
        </div>

        {/* 1. Header */}
        <SectionHeader title="1. Header & Kontak" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <InputField label="Nama Lengkap" name="fullName" value={data.personalInfo.fullName} onChange={handlePersonalInfoChange} placeholder={mockText.fullName} />
          <InputField label="Kota Domisili" name="location" value={data.personalInfo.location} onChange={handlePersonalInfoChange} placeholder={mockText.location} />
          <InputField label="No. HP" name="phone" value={data.personalInfo.phone} onChange={handlePersonalInfoChange} placeholder={mockText.phone} />
          <InputField label="Email Profesional" name="email" value={data.personalInfo.email} onChange={handlePersonalInfoChange} placeholder={mockText.email} />
          <InputField label="LinkedIn URL" name="linkedin" value={data.personalInfo.linkedin} onChange={handlePersonalInfoChange} placeholder={mockText.linkedin} />
          <InputField label="GitHub / Portofolio (Opsional)" name="github" value={data.personalInfo.github} onChange={handlePersonalInfoChange} placeholder={mockText.github} />
        </div>

        {/* 2. Profil */}
        <SectionHeader title="2. Profil" />
        <TextAreaField
          label="Ringkasan (Maks 5 Kalimat)"
          value={data.summary}
          onChange={(e) => handleSimpleChange(e, "summary")}
          placeholder={mockText.summary}
          hint="Formula: [Status/Jurusan + IPK] + [Pengalaman relevan] + [Keahlian teknis] + [Nilai yang ditawarkan]."
        />

        {/* 3. Keahlian */}
        <SectionHeader title="3. Keahlian" />
        <TextAreaField
          label="Daftar Keahlian (pisahkan dengan |)"
          value={data.skills}
          onChange={(e) => handleSimpleChange(e, "skills")}
          placeholder={mockText.skills}
          hint="Campurkan: Hard Skills teknis, Hard Skills non-teknis, dan Soft Skills yang bisa dibuktikan."
        />

        {/* 4. Pengalaman */}
        <SectionHeader title="4. Pengalaman Kerja" />
        {data.experiences.map((exp, index) => (
          <div key={exp.id} className="border border-slate-200 rounded-md p-4 mb-4 bg-slate-50 relative">
            <button onClick={() => removeItem("experiences", exp.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField label="Jabatan / Posisi" value={exp.title} onChange={(e) => handleArrayChange("experiences", index, "title", e.target.value)} placeholder={mockText.expTitle} />
              <InputField label="Nama Perusahaan" value={exp.company} onChange={(e) => handleArrayChange("experiences", index, "company", e.target.value)} placeholder={mockText.expCompany} />
              <InputField type="month" label="Mulai" value={exp.startDate} onChange={(e) => handleArrayChange("experiences", index, "startDate", e.target.value)} />
              <div>
                <InputField type="month" label="Selesai" value={exp.current ? "" : exp.endDate} disabled={exp.current} onChange={(e) => handleArrayChange("experiences", index, "endDate", e.target.value)} />
                <div className="flex items-center gap-2 mt-[-10px] mb-3">
                  <input type="checkbox" id={`exp-cur-${index}`} checked={exp.current} onChange={(e) => handleArrayChange("experiences", index, "current", e.target.checked)} className="cursor-pointer" />
                  <label htmlFor={`exp-cur-${index}`} className="text-xs text-slate-600 cursor-pointer font-medium">
                    Masih bekerja di sini
                  </label>
                </div>
              </div>
            </div>
            <TextAreaField
              label="Deskripsi (Enter = bullet point baru)"
              value={exp.description}
              onChange={(e) => handleArrayChange("experiences", index, "description", e.target.value)}
              placeholder={mockText.expDesc}
              hint="Formula PAR: Kata Kerja Aktif + Konteks/Skala + Hasil Terukur."
            />
          </div>
        ))}
        <button onClick={() => addItem("experiences", { title: "", company: "", startDate: "", endDate: "", current: false, description: "" })} className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800">
          <Plus size={16} /> Tambah Pengalaman
        </button>

        {/* 5. Sertifikasi & Pelatihan */}
        <SectionHeader title="5. Sertifikasi & Pelatihan" />
        <div className="bg-slate-50 border border-slate-200 rounded-md p-3 mb-4 text-xs text-slate-600">
          <p className="font-medium text-slate-700 mb-1">Panduan pengisian:</p>
          <p>
            • <span className="font-medium text-emerald-700">Sertifikasi Profesional</span> — ujian resmi, diakui industri, ada masa berlaku. Contoh: BNSP, Alibaba Cloud, AWS.
          </p>
          <p className="mt-1">
            • <span className="font-medium text-blue-700">Pelatihan / Program</span> — sertifikat kehadiran/penyelesaian kursus, workshop, Prakerja, MSIB, GNIK.
          </p>
        </div>
        {data.certifications.map((cert, index) => (
          <div key={cert.id} className={`border rounded-md p-4 mb-4 relative ${cert.certType === "professional" ? "border-emerald-200 bg-emerald-50/40" : "border-blue-200 bg-blue-50/40"}`}>
            <button onClick={() => removeItem("certifications", cert.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
            <TypeToggle value={cert.certType} onChange={(val) => handleArrayChange("certifications", index, "certType", val)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField
                label="Nama Sertifikasi / Pelatihan"
                value={cert.name}
                onChange={(e) => handleArrayChange("certifications", index, "name", e.target.value)}
                placeholder={cert.certType === "professional" ? mockText.certProfName : mockText.certTrainName}
              />
              <InputField
                label={cert.certType === "professional" ? "Lembaga Penerbit" : "Penyelenggara"}
                value={cert.issuer}
                onChange={(e) => handleArrayChange("certifications", index, "issuer", e.target.value)}
                placeholder={cert.certType === "professional" ? mockText.certProfIssuer : mockText.certTrainIssuer}
              />
              <InputField type="month" label="Terbit / Mulai" value={cert.startDate} onChange={(e) => handleArrayChange("certifications", index, "startDate", e.target.value)} />
              <div>
                <InputField type="month" label="Kedaluwarsa / Selesai" value={!cert.hasExpiration ? "" : cert.endDate} disabled={!cert.hasExpiration} onChange={(e) => handleArrayChange("certifications", index, "endDate", e.target.value)} />
                <div className="flex items-center gap-2 mt-[-10px] mb-3">
                  <input type="checkbox" id={`cert-exp-${index}`} checked={cert.hasExpiration} onChange={(e) => handleArrayChange("certifications", index, "hasExpiration", e.target.checked)} className="cursor-pointer" />
                  <label htmlFor={`cert-exp-${index}`} className="text-xs text-slate-600 cursor-pointer font-medium">
                    Ada masa kedaluwarsa
                  </label>
                </div>
              </div>
            </div>
            <InputField label="Kompetensi / Deskripsi Singkat (Opsional)" value={cert.description} onChange={(e) => handleArrayChange("certifications", index, "description", e.target.value)} placeholder={mockText.certDesc} />
          </div>
        ))}
        <button
          onClick={() => addItem("certifications", { name: "", issuer: "", startDate: "", endDate: "", hasExpiration: true, description: "", certType: "professional" })}
          className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800"
        >
          <Plus size={16} /> Tambah Sertifikasi / Pelatihan
        </button>

        {/* 6. Pendidikan */}
        <SectionHeader title="6. Pendidikan" />
        {data.education.map((edu, index) => (
          <div key={edu.id} className="border border-slate-200 rounded-md p-4 mb-4 bg-slate-50 relative">
            <button onClick={() => removeItem("education", edu.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField label="Gelar & Program Studi" value={edu.degree} onChange={(e) => handleArrayChange("education", index, "degree", e.target.value)} placeholder={mockText.eduDegree} />
              <InputField label="Nama Universitas" value={edu.university} onChange={(e) => handleArrayChange("education", index, "university", e.target.value)} placeholder={mockText.eduUniv} />
              <InputField type="text" label="Tahun Masuk" value={edu.startYear} onChange={(e) => handleArrayChange("education", index, "startYear", e.target.value)} placeholder={mockText.eduStart} />
              <div>
                <InputField type="text" label="Tahun Lulus" value={edu.current ? "" : edu.endYear} disabled={edu.current} onChange={(e) => handleArrayChange("education", index, "endYear", e.target.value)} placeholder={mockText.eduEnd} />
                <div className="flex items-center gap-2 mt-[-10px] mb-3">
                  <input type="checkbox" id={`edu-cur-${index}`} checked={edu.current} onChange={(e) => handleArrayChange("education", index, "current", e.target.checked)} className="cursor-pointer" />
                  <label htmlFor={`edu-cur-${index}`} className="text-xs text-slate-600 cursor-pointer font-medium">
                    Masih menempuh studi
                  </label>
                </div>
              </div>
              <InputField label="IPK" value={edu.gpa} onChange={(e) => handleArrayChange("education", index, "gpa", e.target.value)} placeholder={mockText.eduGPA} />
            </div>
            <InputField label="Info Tambahan (Skripsi / Prestasi)" value={edu.details} onChange={(e) => handleArrayChange("education", index, "details", e.target.value)} placeholder={mockText.eduDetails} />
          </div>
        ))}
        <button
          onClick={() => addItem("education", { degree: "", university: "", startYear: "", endYear: "", current: false, gpa: "", details: "" })}
          className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800"
        >
          <Plus size={16} /> Tambah Pendidikan
        </button>

        {/* 7. Organisasi */}
        <SectionHeader title="7. Organisasi / Kepanitiaan / Proyek" />
        {data.organizations.map((org, index) => (
          <div key={org.id} className="border border-slate-200 rounded-md p-4 mb-4 bg-slate-50 relative">
            <button onClick={() => removeItem("organizations", org.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField label="Peran / Posisi" value={org.role} onChange={(e) => handleArrayChange("organizations", index, "role", e.target.value)} placeholder={mockText.orgRole} />
              <InputField label="Nama Organisasi / Proyek" value={org.organization} onChange={(e) => handleArrayChange("organizations", index, "organization", e.target.value)} placeholder={mockText.orgName} />
              <InputField type="month" label="Mulai" value={org.startDate} onChange={(e) => handleArrayChange("organizations", index, "startDate", e.target.value)} />
              <div>
                <InputField type="month" label="Selesai" value={org.current ? "" : org.endDate} disabled={org.current} onChange={(e) => handleArrayChange("organizations", index, "endDate", e.target.value)} />
                <div className="flex items-center gap-2 mt-[-10px] mb-3">
                  <input type="checkbox" id={`org-cur-${index}`} checked={org.current} onChange={(e) => handleArrayChange("organizations", index, "current", e.target.checked)} className="cursor-pointer" />
                  <label htmlFor={`org-cur-${index}`} className="text-xs text-slate-600 cursor-pointer font-medium">
                    Masih aktif
                  </label>
                </div>
              </div>
            </div>
            <TextAreaField label="Kontribusi / Dampak (Enter = bullet point baru)" value={org.description} onChange={(e) => handleArrayChange("organizations", index, "description", e.target.value)} placeholder={mockText.orgDesc} />
          </div>
        ))}
        <button
          onClick={() => addItem("organizations", { role: "", organization: "", startDate: "", endDate: "", current: false, description: "" })}
          className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800 pb-10"
        >
          <Plus size={16} /> Tambah Organisasi
        </button>
      </div>

      {/* ═══ KANAN: LIVE PREVIEW ══════════════════════════════════════════════ */}
      <div className="w-full md:w-1/2 bg-gray-200 p-8 overflow-y-auto h-screen flex justify-center">
        <div id="cv-preview" className="bg-white shadow-xl print-clean" style={{ width: "210mm", minHeight: "297mm", padding: "2.54cm", boxSizing: "border-box", fontFamily: '"Calibri","Arial",sans-serif', lineHeight: "1.15" }}>
          {/* HEADER */}
          <div className="text-center border-b-[1.5px] border-black pb-3 mb-3">
            <h1 className="text-[22pt] font-bold uppercase tracking-wide leading-tight text-black mb-1">{displayVal(data.personalInfo.fullName, mockText.fullName)}</h1>
            <div className="text-[11pt] text-black">
              <span>{displayVal(data.personalInfo.location, mockText.location)}</span>
              <span className="mx-2">|</span>
              <span>{displayVal(data.personalInfo.phone, mockText.phone)}</span>
              <span className="mx-2">|</span>
              <span>{displayVal(data.personalInfo.email, mockText.email)}</span>
            </div>
            {(data.personalInfo.linkedin.trim() || data.personalInfo.github.trim()) && (
              <div className="text-[11pt] text-black mt-0.5">
                {data.personalInfo.linkedin.trim() && <span>{data.personalInfo.linkedin.trim()}</span>}
                {data.personalInfo.linkedin.trim() && data.personalInfo.github.trim() && <span className="mx-2">|</span>}
                {data.personalInfo.github.trim() && <span>{data.personalInfo.github.trim()}</span>}
              </div>
            )}
          </div>

          {/* PROFIL */}
          <div className="mb-3">
            <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-1 text-black">Profil</h2>
            <p className="text-[11pt] text-justify text-black">{displayVal(data.summary, mockText.summary)}</p>
          </div>

          {/* KEAHLIAN */}
          <div className="mb-3">
            <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-1 text-black">Keahlian</h2>
            <p className="text-[11pt] text-black">{displayVal(data.skills, mockText.skills)}</p>
          </div>

          {/* PENGALAMAN */}
          <div className="mb-3">
            <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-2 text-black">Pengalaman Kerja</h2>
            {data.experiences.map((exp, index) => {
              const isEmpty = index === 0 && !exp.title && !exp.company;
              if (!exp.title && !isEmpty) return null;
              const title = isEmpty ? mockText.expTitle : exp.title;
              const company = isEmpty ? mockText.expCompany : exp.company;
              const startDate = isEmpty ? mockText.expStart : formatDate(exp.startDate);
              const endDate = isEmpty ? mockText.expEnd : exp.current ? "Saat Ini" : formatDate(exp.endDate);
              const description = isEmpty ? mockText.expDesc : exp.description;
              return (
                <div key={index} className="mb-2">
                  <div className="flex justify-between items-baseline mb-0.5 text-black">
                    <span className="text-[11pt] font-bold">
                      {title} | {company}
                    </span>
                    <span className="text-[11pt] italic whitespace-nowrap ml-2">{startDate && `${startDate} – ${endDate}`}</span>
                  </div>
                  {description && (
                    <ul className="list-disc pl-5 text-[11pt] text-black">
                      {description
                        .split("\n")
                        .filter((l) => l.trim())
                        .map((b, i) => (
                          <li key={i} className="mb-0.5 text-justify">
                            {b}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* SERTIFIKASI & PELATIHAN */}
          <div className="mb-3">
            <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-2 text-black">Sertifikasi &amp; Pelatihan</h2>
            {showMockCert ? (
              <>
                <div className="text-[10pt] font-semibold text-black italic mb-1 mt-1">Sertifikasi Profesional</div>
                <div className="mb-1.5 text-black">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[11pt] font-bold">{mockText.certProfName}</span>
                    <span className="text-[11pt] italic whitespace-nowrap ml-2">{mockText.certDate}</span>
                  </div>
                  <div className="text-[11pt]">
                    {mockText.certProfIssuer} — {mockText.certDesc}
                  </div>
                </div>
                <div className="text-[10pt] font-semibold text-black italic mb-1 mt-2">Pelatihan &amp; Program</div>
                <div className="mb-1.5 text-black">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[11pt] font-bold">{mockText.certTrainName}</span>
                    <span className="text-[11pt] italic whitespace-nowrap ml-2">{mockText.certDate}</span>
                  </div>
                  <div className="text-[11pt]">{mockText.certTrainIssuer}</div>
                </div>
              </>
            ) : (
              <>
                {professionalCerts.length > 0 && (
                  <>
                    <div className="text-[10pt] font-semibold text-black italic mb-1 mt-1">Sertifikasi Profesional</div>
                    {professionalCerts.map((cert, i) => {
                      if (!cert.name && !cert.issuer) return null;
                      const dateDisplay = cert.startDate ? (cert.hasExpiration && cert.endDate ? `${formatDate(cert.startDate)} – ${formatDate(cert.endDate)}` : `Diterbitkan: ${formatDate(cert.startDate)}`) : "";
                      return (
                        <div key={i} className="mb-1.5 text-black">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className="text-[11pt] font-bold">{cert.name}</span>
                            <span className="text-[11pt] italic whitespace-nowrap ml-2">{dateDisplay}</span>
                          </div>
                          <div className="text-[11pt]">
                            {cert.issuer}
                            {cert.description ? ` — ${cert.description}` : ""}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
                {trainingCerts.length > 0 && (
                  <>
                    <div className={`text-[10pt] font-semibold text-black italic mb-1 ${professionalCerts.length > 0 ? "mt-2" : "mt-1"}`}>Pelatihan &amp; Program</div>
                    {trainingCerts.map((cert, i) => {
                      if (!cert.name && !cert.issuer) return null;
                      const dateDisplay = cert.startDate ? (cert.hasExpiration && cert.endDate ? `${formatDate(cert.startDate)} – ${formatDate(cert.endDate)}` : formatDate(cert.startDate)) : "";
                      return (
                        <div key={i} className="mb-1.5 text-black">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className="text-[11pt] font-bold">{cert.name}</span>
                            <span className="text-[11pt] italic whitespace-nowrap ml-2">{dateDisplay}</span>
                          </div>
                          <div className="text-[11pt]">
                            {cert.issuer}
                            {cert.description ? ` — ${cert.description}` : ""}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </>
            )}
          </div>

          {/* PENDIDIKAN */}
          <div className="mb-3">
            <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-2 text-black">Pendidikan</h2>
            {data.education.map((edu, index) => {
              const isEmpty = index === 0 && !edu.degree && !edu.university;
              if (!edu.degree && !isEmpty) return null;
              const degree = isEmpty ? mockText.eduDegree : edu.degree;
              const university = isEmpty ? mockText.eduUniv : edu.university;
              const startYear = isEmpty ? mockText.eduStart : edu.startYear;
              const endYear = isEmpty ? mockText.eduEnd : edu.current ? "Saat Ini" : edu.endYear;
              const gpa = isEmpty ? mockText.eduGPA : edu.gpa;
              const details = isEmpty ? mockText.eduDetails : edu.details;
              return (
                <div key={index} className="mb-1 text-black">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[11pt] font-bold">
                      {degree} — {university}
                    </span>
                    <span className="text-[11pt] italic whitespace-nowrap ml-2">{startYear && `${startYear} – ${endYear}`}</span>
                  </div>
                  {(gpa || details) && (
                    <div className="text-[11pt]">
                      {gpa && <span className="font-semibold mr-2">IPK: {gpa}</span>}
                      {details && (
                        <span>
                          {gpa && "| "}
                          {details}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ORGANISASI */}
          <div className="mb-3">
            <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-2 text-black">Organisasi &amp; Kepanitiaan</h2>
            {data.organizations.map((org, index) => {
              const isEmpty = index === 0 && !org.role && !org.organization;
              if (!org.role && !isEmpty) return null;
              const role = isEmpty ? mockText.orgRole : org.role;
              const organization = isEmpty ? mockText.orgName : org.organization;
              const startDate = isEmpty ? mockText.orgStart : formatDate(org.startDate);
              const endDate = isEmpty ? mockText.orgEnd : org.current ? "Saat Ini" : formatDate(org.endDate);
              const description = isEmpty ? mockText.orgDesc : org.description;
              return (
                <div key={index} className="mb-2 text-black">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[11pt] font-bold">
                      {role} | {organization}
                    </span>
                    <span className="text-[11pt] italic whitespace-nowrap ml-2">{startDate && `${startDate} – ${endDate}`}</span>
                  </div>
                  {description && (
                    <ul className="list-disc pl-5 text-[11pt] text-black">
                      {description
                        .split("\n")
                        .filter((l) => l.trim())
                        .map((b, i) => (
                          <li key={i} className="mb-0.5 text-justify">
                            {b}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
