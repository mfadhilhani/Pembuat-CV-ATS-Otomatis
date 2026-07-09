import { useState, useRef } from "react";
import { Plus, Trash2, FileText, Download, Award, BookOpen, Upload, Loader2, CheckCircle2, XCircle, RotateCcw, Eye, EyeOff } from "lucide-react";

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

const SectionVisibilityToggle = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between gap-3 p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
    <span className="flex items-center gap-2 text-sm text-slate-700">
      {checked ? <Eye size={15} className="text-blue-600" /> : <EyeOff size={15} className="text-slate-400" />}
      {label}
    </span>

    <input type="checkbox" checked={checked} onChange={onChange} className="cursor-pointer" />
  </label>
);

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────

const createEmptyData = () => ({
  personalInfo: {
    fullName: "",
    targetPosition: "",
    location: "",
    phone: "",
    email: "",
    linkedin: "",
    github: "",
  },
  summary: "",
  skills: "",
  experiences: [
    {
      id: 1,
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ],
  certifications: [
    {
      id: 1,
      name: "",
      issuer: "",
      startDate: "",
      endDate: "",
      hasExpiration: true,
      description: "",
      certType: "professional",
    },
  ],
  education: [
    {
      id: 1,
      degree: "",
      university: "",
      startYear: "",
      endYear: "",
      current: false,
      gpa: "",
      details: "",
    },
  ],
  organizations: [
    {
      id: 1,
      role: "",
      organization: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ],
});

const createDefaultSections = () => ({
  summary: true,
  experiences: true,
  education: true,
  certifications: true,
  organizations: true,
  skills: true,
});

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [data, setData] = useState(createEmptyData);
  const [visibleSections, setVisibleSections] = useState(createDefaultSections);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null);
  const [prevData, setPrevData] = useState(null);
  const [importMode, setImportMode] = useState("file");
  const [pasteText, setPasteText] = useState("");
  const fileInputRef = useRef(null);

  // ─── PLACEHOLDER TEXT ───────────────────────────────────────────────────────

  const mockText = {
    fullName: "NAMA LENGKAP",
    targetPosition: "Posisi Pekerjaan atau Spesialisasi",
    location: "Kota, Provinsi",
    phone: "+62 812 3456 7890",
    email: "email@contoh.com",
    linkedin: "linkedin.com/in/contoh",
    github: "github.com/username",

    summary: "Ini adalah contoh ringkasan profesional. Tuliskan paragraf singkat yang menjelaskan latar belakang, keahlian utama, dan pencapaian terbaik Anda untuk menarik perhatian perekrut.",

    skills: "Kepemimpinan | Komunikasi Efektif | Pemecahan Masalah | Analisis Data | Manajemen Proyek",

    expTitle: "Nama Jabatan atau Posisi",
    expCompany: "PT Contoh Perusahaan Terpadu",
    expStart: "Jan 2020",
    expEnd: "Saat ini",
    expDesc: "Tuliskan poin-poin tanggung jawab atau pencapaian Anda.\nGunakan angka atau metrik untuk menunjukkan hasil kerja yang spesifik.",

    certProfName: "Nama Sertifikasi Profesional",
    certProfIssuer: "Lembaga Penerbit",
    certTrainName: "Nama Pelatihan / Program",
    certTrainIssuer: "Penyelenggara Program",
    certDate: "Sep 2025",
    certDesc: "Kompetensi atau materi yang didapat.",

    eduDegree: "Gelar / Program Studi",
    eduUniv: "Nama Universitas atau Institusi",
    eduStart: "2016",
    eduEnd: "2020",
    eduGPA: "3.85 / 4.00",
    eduDetails: "Skripsi, prestasi, atau informasi tambahan.",

    orgRole: "Ketua Divisi Hubungan Masyarakat",
    orgName: "Nama Organisasi Mahasiswa",
    orgStart: "2018",
    orgEnd: "2019",
    orgDesc: "Mengoordinasikan acara rutin kepanitiaan.\nMeningkatkan partisipasi anggota hingga 20%.",
  };

  // ─── FORMAT DATE ────────────────────────────────────────────────────────────

  const formatDate = (dateString) => {
    if (!dateString) return "";

    if (/^\d{4}-\d{2}$/.test(dateString)) {
      const [year, month] = dateString.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

      const monthIndex = Number(month) - 1;

      if (monthIndex < 0 || monthIndex > 11) return dateString;

      return `${months[monthIndex]} ${year}`;
    }

    return dateString;
  };

  // ─── STANDARD HANDLERS ──────────────────────────────────────────────────────

  const handlePersonalInfoChange = (e) => {
    setData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleSimpleChange = (e, field) => {
    setData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleArrayChange = (category, index, field, value) => {
    setData((prev) => ({
      ...prev,
      [category]: prev[category].map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addItem = (category, template) => {
    setData((prev) => ({
      ...prev,
      [category]: [...prev[category], { id: Date.now(), ...template }],
    }));
  };

  const removeItem = (category, id) => {
    setData((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== id),
    }));
  };

  const handleSectionToggle = (sectionName) => {
    setVisibleSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const handlePrint = () => window.print();

  // ─── NORMALIZE IMPORTED DATA ────────────────────────────────────────────────

  const normalizeExperience = (x, id) => ({
    id,
    title: x?.title || "",
    company: x?.company || "",
    startDate: x?.startDate || "",
    endDate: x?.endDate || "",
    current: x?.current || false,
    description: x?.description || "",
  });

  const normalizeCertification = (x, id) => ({
    id,
    name: x?.name || "",
    issuer: x?.issuer || "",
    startDate: x?.startDate || "",
    endDate: x?.endDate || "",
    hasExpiration: x?.hasExpiration ?? true,
    description: x?.description || "",
    certType: x?.certType || "professional",
  });

  const normalizeEducation = (x, id) => ({
    id,
    degree: x?.degree || "",
    university: x?.university || "",
    startYear: x?.startYear || "",
    endYear: x?.endYear || "",
    current: x?.current || false,
    gpa: x?.gpa || "",
    details: x?.details || "",
  });

  const normalizeOrganization = (x, id) => ({
    id,
    role: x?.role || "",
    organization: x?.organization || "",
    startDate: x?.startDate || "",
    endDate: x?.endDate || "",
    current: x?.current || false,
    description: x?.description || "",
  });

  // ─── SHARED PARSE LOGIC ────────────────────────────────────────────────────

  const applyParsed = (parsed, sourceName) => {
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Format JSON tidak valid.");
    }

    setPrevData(data);

    const stamp = Date.now();
    const emptyData = createEmptyData();

    setData({
      personalInfo: {
        fullName: parsed.personalInfo?.fullName || "",
        targetPosition: parsed.personalInfo?.targetPosition || "",
        location: parsed.personalInfo?.location || "",
        phone: parsed.personalInfo?.phone || "",
        email: parsed.personalInfo?.email || "",
        linkedin: parsed.personalInfo?.linkedin || "",
        github: parsed.personalInfo?.github || "",
      },

      summary: parsed.summary || "",
      skills: parsed.skills || "",

      experiences: parsed.experiences?.length ? parsed.experiences.map((x, i) => normalizeExperience(x, stamp + i)) : emptyData.experiences,

      certifications: parsed.certifications?.length ? parsed.certifications.map((x, i) => normalizeCertification(x, stamp + 100 + i)) : emptyData.certifications,

      education: parsed.education?.length ? parsed.education.map((x, i) => normalizeEducation(x, stamp + 200 + i)) : emptyData.education,

      organizations: parsed.organizations?.length ? parsed.organizations.map((x, i) => normalizeOrganization(x, stamp + 300 + i)) : emptyData.organizations,
    });

    setImportMsg({
      type: "success",
      text: `✓ Berhasil diimpor dari ${sourceName}. Periksa hasilnya lalu simpan PDF.`,
    });
  };

  // ─── PARSE RAW TEXT ─────────────────────────────────────────────────────────

  const parseRawText = (text, ext = "json") => {
    if (ext === "json") {
      const clean = text.replace(/^```json|^```|```$/gm, "").trim();
      return JSON.parse(clean);
    }

    const jsonMatch = text.match(/```json([\s\S]*?)```/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }

    const clean = text.trim();

    if (clean.startsWith("{")) {
      return JSON.parse(clean);
    }

    throw new Error("Tidak ditemukan blok JSON. Pastikan konten mengandung JSON valid atau blok ```json...```");
  };

  // ─── IMPORT HANDLER — FILE UPLOAD ──────────────────────────────────────────

  const handleImport = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImporting(true);
    setImportMsg(null);

    try {
      const ext = file.name.split(".").pop().toLowerCase();

      if (!["json", "md", "txt"].includes(ext)) {
        setImportMsg({
          type: "error",
          text: `Format .${ext} tidak didukung. Gunakan file .json atau .md/.txt yang berisi JSON.`,
        });

        setImporting(false);
        e.target.value = "";
        return;
      }

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

      setImportMsg({
        type: "error",
        text: msg,
      });
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  // ─── UNDO IMPORT ────────────────────────────────────────────────────────────

  const handleUndo = () => {
    if (prevData) {
      setData(prevData);
      setPrevData(null);
      setImportMsg(null);
    }
  };

  // ─── IMPORT HANDLER — PASTE JSON ───────────────────────────────────────────

  const handlePasteImport = () => {
    if (!pasteText.trim()) {
      setImportMsg({
        type: "error",
        text: "Teks kosong. Paste JSON kamu terlebih dahulu.",
      });

      return;
    }

    setImportMsg(null);

    try {
      const parsed = parseRawText(pasteText.trim(), "json");

      applyParsed(parsed, "teks yang di-paste");
      setPasteText("");
    } catch (err) {
      console.error(err);

      setImportMsg({
        type: "error",
        text: "JSON tidak valid. Pastikan strukturnya benar dan tidak ada karakter yang hilang.",
      });
    }
  };

  // ─── PREVIEW LOGIC ──────────────────────────────────────────────────────────

  const isFilled = (value) => typeof value === "string" && value.trim() !== "";

  const placeholderClass = "text-slate-400";
  const normalClass = "text-black";

  const previewTextClass = (value) => (isFilled(value) ? normalClass : placeholderClass);

  const previewVal = (value, placeholder) => (isFilled(value) ? value : placeholder);

  const hasHeaderContent = [data.personalInfo.fullName, data.personalInfo.targetPosition, data.personalInfo.location, data.personalInfo.phone, data.personalInfo.email, data.personalInfo.linkedin, data.personalInfo.github].some(isFilled);

  const contactItems = [data.personalInfo.location, data.personalInfo.phone, data.personalInfo.email].filter(isFilled);

  const linkItems = [data.personalInfo.linkedin, data.personalInfo.github].filter(isFilled);

  const filledExperiences = data.experiences.filter((exp) => isFilled(exp.title) || isFilled(exp.company) || isFilled(exp.startDate) || isFilled(exp.endDate) || isFilled(exp.description));

  const filledCertifications = data.certifications.filter((cert) => isFilled(cert.name) || isFilled(cert.issuer) || isFilled(cert.startDate) || isFilled(cert.endDate) || isFilled(cert.description));

  const filledEducation = data.education.filter((edu) => isFilled(edu.degree) || isFilled(edu.university) || isFilled(edu.startYear) || isFilled(edu.endYear) || isFilled(edu.gpa) || isFilled(edu.details));

  const filledOrganizations = data.organizations.filter((org) => isFilled(org.role) || isFilled(org.organization) || isFilled(org.startDate) || isFilled(org.endDate) || isFilled(org.description));

  const professionalCerts = filledCertifications.filter((cert) => cert.certType === "professional");

  const trainingCerts = filledCertifications.filter((cert) => cert.certType === "training");

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <style>{`
        @media print {
          body * { visibility: hidden; }

          #cv-preview,
          #cv-preview * {
            visibility: visible;
          }

          #cv-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 100%;
            padding: 0;
            margin: 0;
            background: white;
            font-family: 'Calibri', 'Arial', sans-serif;
            color: black;
          }

          .no-print {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 2.54cm;
          }

          .print-clean {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* ═══ KIRI: FORM EDITOR ═══════════════════════════════════════════════ */}

      <div className="w-full md:w-1/2 p-6 overflow-y-auto h-screen border-r bg-white no-print">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-blue-600" /> Editor CV ATS
            </h1>

            <p className="text-sm text-slate-500 mt-0.5">Font: Calibri | Margin: 1 Inch | Spasi: 1.15</p>
          </div>

          <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors">
            <Download size={18} /> Simpan PDF
          </button>
        </div>

        {/* IMPORT PANEL */}

        <div className="border border-dashed border-slate-300 rounded-xl p-4 mb-5 bg-slate-50">
          <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Upload size={15} className="text-blue-500" /> Import CV dari JSON
          </p>

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

          {importMode === "file" && (
            <div>
              <p className="text-xs text-slate-500 mb-3">
                Upload file <strong>.json</strong> atau <strong>.md/.txt</strong> yang berisi blok JSON.
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

          {importMode === "paste" && (
            <div>
              <p className="text-xs text-slate-500 mb-2">
                Copy JSON, paste langsung di bawah ini, lalu klik <strong>Terapkan</strong>.
              </p>

              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`Paste JSON kamu di sini...\n\n{\n  "personalInfo": {\n    "fullName": "",\n    "targetPosition": ""\n  }\n}`}
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
          <strong>Petunjuk:</strong> Placeholder tampil di preview sebelum kolom diisi. Jika ada bagian yang tidak diperlukan, matikan melalui checklist bagian CV di bawah ini.
        </div>

        {/* PENGATURAN BAGIAN CV */}

        <SectionHeader title="Pengaturan Bagian CV" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
          <SectionVisibilityToggle label="Ringkasan Profesional" checked={visibleSections.summary} onChange={() => handleSectionToggle("summary")} />

          <SectionVisibilityToggle label="Pengalaman Kerja" checked={visibleSections.experiences} onChange={() => handleSectionToggle("experiences")} />

          <SectionVisibilityToggle label="Pendidikan" checked={visibleSections.education} onChange={() => handleSectionToggle("education")} />

          <SectionVisibilityToggle label="Sertifikasi & Pelatihan" checked={visibleSections.certifications} onChange={() => handleSectionToggle("certifications")} />

          <SectionVisibilityToggle label="Pengalaman Organisasi" checked={visibleSections.organizations} onChange={() => handleSectionToggle("organizations")} />

          <SectionVisibilityToggle label="Keahlian Utama" checked={visibleSections.skills} onChange={() => handleSectionToggle("skills")} />
        </div>

        {/* 1. Header */}

        <SectionHeader title="1. Header & Kontak" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <InputField label="Nama Lengkap" name="fullName" value={data.personalInfo.fullName} onChange={handlePersonalInfoChange} placeholder="Contoh: Muhammad Fadhil Hani" />

          <InputField label="Posisi / Pekerjaan" name="targetPosition" value={data.personalInfo.targetPosition} onChange={handlePersonalInfoChange} placeholder="Contoh: IT Support" />

          <InputField label="Kota Domisili" name="location" value={data.personalInfo.location} onChange={handlePersonalInfoChange} placeholder="Contoh: Makassar, Indonesia" />

          <InputField label="No. HP" name="phone" value={data.personalInfo.phone} onChange={handlePersonalInfoChange} placeholder="Contoh: 082253851511" />

          <InputField label="Email Profesional" name="email" value={data.personalInfo.email} onChange={handlePersonalInfoChange} placeholder="Contoh: email@gmail.com" />

          <InputField label="LinkedIn URL" name="linkedin" value={data.personalInfo.linkedin} onChange={handlePersonalInfoChange} placeholder="linkedin.com/in/username" />

          <InputField label="GitHub / Portofolio" name="github" value={data.personalInfo.github} onChange={handlePersonalInfoChange} placeholder="github.com/username" />
        </div>

        {/* 2. Profil */}

        <SectionHeader title="2. Ringkasan Profesional" />

        <TextAreaField label="Ringkasan Profesional" value={data.summary} onChange={(e) => handleSimpleChange(e, "summary")} placeholder={mockText.summary} hint="Jika kosong, preview menampilkan contoh berwarna abu-abu." />

        {/* 3. Pengalaman */}

        <SectionHeader title="3. Pengalaman Kerja" />

        {data.experiences.map((exp, index) => (
          <div key={exp.id} className="border border-slate-200 rounded-md p-4 mb-4 bg-slate-50 relative">
            <button onClick={() => removeItem("experiences", exp.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField label="Jabatan / Posisi" value={exp.title} onChange={(e) => handleArrayChange("experiences", index, "title", e.target.value)} placeholder="Contoh: Front-End Web Developer Intern" />

              <InputField label="Nama Perusahaan" value={exp.company} onChange={(e) => handleArrayChange("experiences", index, "company", e.target.value)} placeholder="Contoh: PT Digikreatif Teknologi Indonesia" />

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
              label="Deskripsi"
              value={exp.description}
              onChange={(e) => handleArrayChange("experiences", index, "description", e.target.value)}
              placeholder={mockText.expDesc}
              hint="Enter akan menjadi bullet point baru di preview."
            />
          </div>
        ))}

        <button
          onClick={() =>
            addItem("experiences", {
              title: "",
              company: "",
              startDate: "",
              endDate: "",
              current: false,
              description: "",
            })
          }
          className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800"
        >
          <Plus size={16} /> Tambah Pengalaman
        </button>

        {/* 4. Pendidikan */}

        <SectionHeader title="4. Pendidikan" />

        {data.education.map((edu, index) => (
          <div key={edu.id} className="border border-slate-200 rounded-md p-4 mb-4 bg-slate-50 relative">
            <button onClick={() => removeItem("education", edu.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField label="Gelar & Program Studi" value={edu.degree} onChange={(e) => handleArrayChange("education", index, "degree", e.target.value)} placeholder="Contoh: S1 Pendidikan Teknik Informatika dan Komputer" />

              <InputField label="Nama Universitas" value={edu.university} onChange={(e) => handleArrayChange("education", index, "university", e.target.value)} placeholder="Contoh: Universitas Negeri Makassar" />

              <InputField type="text" label="Tahun Masuk" value={edu.startYear} onChange={(e) => handleArrayChange("education", index, "startYear", e.target.value)} placeholder="Contoh: 2022" />

              <div>
                <InputField type="text" label="Tahun Lulus" value={edu.current ? "" : edu.endYear} disabled={edu.current} onChange={(e) => handleArrayChange("education", index, "endYear", e.target.value)} placeholder="Contoh: 2025" />

                <div className="flex items-center gap-2 mt-[-10px] mb-3">
                  <input type="checkbox" id={`edu-cur-${index}`} checked={edu.current} onChange={(e) => handleArrayChange("education", index, "current", e.target.checked)} className="cursor-pointer" />

                  <label htmlFor={`edu-cur-${index}`} className="text-xs text-slate-600 cursor-pointer font-medium">
                    Masih menempuh studi
                  </label>
                </div>
              </div>

              <InputField label="IPK" value={edu.gpa} onChange={(e) => handleArrayChange("education", index, "gpa", e.target.value)} placeholder="Contoh: 3.93 / 4.00" />
            </div>

            <InputField label="Info Tambahan" value={edu.details} onChange={(e) => handleArrayChange("education", index, "details", e.target.value)} placeholder="Contoh: Skripsi, prestasi, atau informasi tambahan" />
          </div>
        ))}

        <button
          onClick={() =>
            addItem("education", {
              degree: "",
              university: "",
              startYear: "",
              endYear: "",
              current: false,
              gpa: "",
              details: "",
            })
          }
          className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800"
        >
          <Plus size={16} /> Tambah Pendidikan
        </button>

        {/* 5. Sertifikasi */}

        <SectionHeader title="5. Sertifikasi & Pelatihan" />

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

            <InputField label="Kompetensi / Deskripsi Singkat" value={cert.description} onChange={(e) => handleArrayChange("certifications", index, "description", e.target.value)} placeholder={mockText.certDesc} />
          </div>
        ))}

        <button
          onClick={() =>
            addItem("certifications", {
              name: "",
              issuer: "",
              startDate: "",
              endDate: "",
              hasExpiration: true,
              description: "",
              certType: "professional",
            })
          }
          className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800"
        >
          <Plus size={16} /> Tambah Sertifikasi / Pelatihan
        </button>

        {/* 6. Organisasi */}

        <SectionHeader title="6. Organisasi / Kepanitiaan / Proyek" />

        {data.organizations.map((org, index) => (
          <div key={org.id} className="border border-slate-200 rounded-md p-4 mb-4 bg-slate-50 relative">
            <button onClick={() => removeItem("organizations", org.id)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField label="Peran / Posisi" value={org.role} onChange={(e) => handleArrayChange("organizations", index, "role", e.target.value)} placeholder="Contoh: Ketua Bidang" />

              <InputField label="Nama Organisasi / Proyek" value={org.organization} onChange={(e) => handleArrayChange("organizations", index, "organization", e.target.value)} placeholder="Contoh: KPMKB" />

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

            <TextAreaField label="Kontribusi / Dampak" value={org.description} onChange={(e) => handleArrayChange("organizations", index, "description", e.target.value)} placeholder={mockText.orgDesc} />
          </div>
        ))}

        <button
          onClick={() =>
            addItem("organizations", {
              role: "",
              organization: "",
              startDate: "",
              endDate: "",
              current: false,
              description: "",
            })
          }
          className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800"
        >
          <Plus size={16} /> Tambah Organisasi
        </button>

        {/* 7. Keahlian */}

        <SectionHeader title="7. Keahlian Utama" />

        <TextAreaField
          label="Daftar Keahlian"
          value={data.skills}
          onChange={(e) => handleSimpleChange(e, "skills")}
          placeholder="Contoh: HTML | CSS | JavaScript | React.js | IT Support"
          hint="Pisahkan keahlian dengan tanda | agar lebih rapi."
        />
      </div>

      {/* ═══ KANAN: LIVE PREVIEW ══════════════════════════════════════════════ */}

      <div className="w-full md:w-1/2 bg-gray-200 p-8 overflow-y-auto h-screen flex justify-center">
        <div
          id="cv-preview"
          className="bg-white shadow-xl print-clean"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "2.54cm",
            boxSizing: "border-box",
            fontFamily: '"Calibri","Arial",sans-serif',
            lineHeight: "1.15",
          }}
        >
          {/* HEADER - garis bawah sudah dihapus */}

          <div className="text-center pb-4 mb-2">
            {hasHeaderContent ? (
              <>
                {isFilled(data.personalInfo.fullName) && <h1 className="text-[22pt] font-bold uppercase tracking-wide leading-tight text-black mb-1">{data.personalInfo.fullName}</h1>}

                {isFilled(data.personalInfo.targetPosition) && <div className="text-[12pt] font-medium text-black mb-2">{data.personalInfo.targetPosition}</div>}

                {contactItems.length > 0 && (
                  <div className="text-[11pt] text-black">
                    {contactItems.map((item, index) => (
                      <span key={index}>
                        {index > 0 && <span className="mx-2">|</span>}
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                )}

                {linkItems.length > 0 && (
                  <div className="text-[11pt] text-black mt-0.5">
                    {linkItems.map((item, index) => (
                      <span key={index}>
                        {index > 0 && <span className="mx-2">|</span>}
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <h1 className="text-[22pt] font-bold uppercase tracking-wide leading-tight text-slate-400 mb-1">{mockText.fullName}</h1>

                <div className="text-[12pt] font-medium text-slate-400 mb-2">{mockText.targetPosition}</div>

                <div className="text-[11pt] text-slate-400">
                  <span>{mockText.location}</span>
                  <span className="mx-2 text-black">|</span>
                  <span>{mockText.phone}</span>
                  <span className="mx-2 text-black">|</span>
                  <span>{mockText.email}</span>
                  <span className="mx-2 text-black">|</span>
                  <span>{mockText.linkedin}</span>
                </div>
              </>
            )}
          </div>

          {/* 1. RINGKASAN PROFESIONAL */}

          {visibleSections.summary && (
            <div className="mb-3">
              <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-1 text-black">Ringkasan Profesional</h2>

              <p className={`text-[11pt] text-justify ${previewTextClass(data.summary)}`}>{previewVal(data.summary, mockText.summary)}</p>
            </div>
          )}

          {/* 2. PENGALAMAN KERJA */}

          {visibleSections.experiences && (
            <div className="mb-3">
              <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-2 text-black">Pengalaman Kerja</h2>

              {filledExperiences.length > 0 ? (
                filledExperiences.map((exp, index) => {
                  const titleLine = [exp.title, exp.company].filter(isFilled).join(" | ");

                  const startDate = formatDate(exp.startDate);
                  const endDate = exp.current ? "Saat Ini" : formatDate(exp.endDate);

                  const dateLine = startDate ? `${startDate}${endDate ? ` – ${endDate}` : ""}` : "";

                  return (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between items-baseline mb-0.5 text-black">
                        {titleLine && <span className="text-[11pt] font-bold">{titleLine}</span>}

                        {dateLine && <span className="text-[11pt] italic whitespace-nowrap ml-2">{dateLine}</span>}
                      </div>

                      {isFilled(exp.description) && (
                        <ul className="list-disc pl-5 text-[11pt] text-black">
                          {exp.description
                            .split("\n")
                            .filter((line) => line.trim())
                            .map((bullet, i) => (
                              <li key={i} className="mb-0.5 text-justify">
                                {bullet}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="mb-2 text-slate-400">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[11pt] font-bold">{mockText.expCompany}</span>

                    <span className="text-[11pt] italic whitespace-nowrap ml-2">
                      {mockText.expStart} - {mockText.expEnd}
                    </span>
                  </div>

                  <div className="text-[11pt] italic mb-1">{mockText.expTitle}</div>

                  <ul className="list-disc pl-5 text-[11pt]">
                    {mockText.expDesc.split("\n").map((bullet, i) => (
                      <li key={i} className="mb-0.5 text-justify">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 3. PENDIDIKAN */}

          {visibleSections.education && (
            <div className="mb-3">
              <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-2 text-black">Pendidikan</h2>

              {filledEducation.length > 0 ? (
                filledEducation.map((edu, index) => {
                  const titleLine = [edu.degree, edu.university].filter(isFilled).join(" — ");

                  const endYear = edu.current ? "Saat Ini" : edu.endYear;

                  const yearLine = edu.startYear ? `${edu.startYear}${endYear ? ` – ${endYear}` : ""}` : "";

                  return (
                    <div key={index} className="mb-1 text-black">
                      <div className="flex justify-between items-baseline mb-0.5">
                        {titleLine && <span className="text-[11pt] font-bold">{titleLine}</span>}

                        {yearLine && <span className="text-[11pt] italic whitespace-nowrap ml-2">{yearLine}</span>}
                      </div>

                      {(isFilled(edu.gpa) || isFilled(edu.details)) && (
                        <div className="text-[11pt]">
                          {isFilled(edu.gpa) && <span className="font-semibold mr-2">IPK: {edu.gpa}</span>}

                          {isFilled(edu.details) && (
                            <span>
                              {isFilled(edu.gpa) && "| "}
                              {edu.details}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="mb-1 text-slate-400">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[11pt] font-bold">{mockText.eduUniv}</span>

                    <span className="text-[11pt] italic whitespace-nowrap ml-2">
                      {mockText.eduStart} - {mockText.eduEnd}
                    </span>
                  </div>

                  <div className="text-[11pt]">{mockText.eduDegree}</div>
                </div>
              )}
            </div>
          )}

          {/* 4. SERTIFIKASI & PELATIHAN */}

          {visibleSections.certifications && (
            <div className="mb-3">
              <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-2 text-black">Sertifikasi &amp; Pelatihan</h2>

              {filledCertifications.length > 0 ? (
                <>
                  {professionalCerts.length > 0 && (
                    <>
                      <div className="text-[10pt] font-semibold text-black italic mb-1 mt-1">Sertifikasi Profesional</div>

                      {professionalCerts.map((cert, index) => {
                        const dateDisplay = cert.startDate ? (cert.hasExpiration && cert.endDate ? `${formatDate(cert.startDate)} – ${formatDate(cert.endDate)}` : `Diterbitkan: ${formatDate(cert.startDate)}`) : "";

                        return (
                          <div key={index} className="mb-1.5 text-black">
                            <div className="flex justify-between items-baseline mb-0.5">
                              {isFilled(cert.name) && <span className="text-[11pt] font-bold">{cert.name}</span>}

                              {dateDisplay && <span className="text-[11pt] italic whitespace-nowrap ml-2">{dateDisplay}</span>}
                            </div>

                            {(isFilled(cert.issuer) || isFilled(cert.description)) && (
                              <div className="text-[11pt]">
                                {isFilled(cert.issuer) && cert.issuer}
                                {isFilled(cert.issuer) && isFilled(cert.description) && " — "}
                                {isFilled(cert.description) && cert.description}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}

                  {trainingCerts.length > 0 && (
                    <>
                      <div className={`text-[10pt] font-semibold text-black italic mb-1 ${professionalCerts.length > 0 ? "mt-2" : "mt-1"}`}>Pelatihan &amp; Program</div>

                      {trainingCerts.map((cert, index) => {
                        const dateDisplay = cert.startDate ? (cert.hasExpiration && cert.endDate ? `${formatDate(cert.startDate)} – ${formatDate(cert.endDate)}` : formatDate(cert.startDate)) : "";

                        return (
                          <div key={index} className="mb-1.5 text-black">
                            <div className="flex justify-between items-baseline mb-0.5">
                              {isFilled(cert.name) && <span className="text-[11pt] font-bold">{cert.name}</span>}

                              {dateDisplay && <span className="text-[11pt] italic whitespace-nowrap ml-2">{dateDisplay}</span>}
                            </div>

                            {(isFilled(cert.issuer) || isFilled(cert.description)) && (
                              <div className="text-[11pt]">
                                {isFilled(cert.issuer) && cert.issuer}
                                {isFilled(cert.issuer) && isFilled(cert.description) && " — "}
                                {isFilled(cert.description) && cert.description}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}
                </>
              ) : (
                <div className="text-slate-400">
                  <div className="text-[10pt] font-semibold italic mb-1 mt-1">Sertifikasi Profesional</div>

                  <div className="mb-1.5">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-[11pt] font-bold">{mockText.certProfName}</span>

                      <span className="text-[11pt] italic whitespace-nowrap ml-2">{mockText.certDate}</span>
                    </div>

                    <div className="text-[11pt]">
                      {mockText.certProfIssuer} — {mockText.certDesc}
                    </div>
                  </div>

                  <div className="text-[10pt] font-semibold italic mb-1 mt-2">Pelatihan &amp; Program</div>

                  <div className="mb-1.5">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-[11pt] font-bold">{mockText.certTrainName}</span>

                      <span className="text-[11pt] italic whitespace-nowrap ml-2">{mockText.certDate}</span>
                    </div>

                    <div className="text-[11pt]">{mockText.certTrainIssuer}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. PENGALAMAN ORGANISASI */}

          {visibleSections.organizations && (
            <div className="mb-3">
              <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-2 text-black">Pengalaman Organisasi</h2>

              {filledOrganizations.length > 0 ? (
                filledOrganizations.map((org, index) => {
                  const titleLine = [org.organization, org.role].filter(isFilled).join(" | ");

                  const startDate = formatDate(org.startDate);
                  const endDate = org.current ? "Saat Ini" : formatDate(org.endDate);

                  const dateLine = startDate ? `${startDate}${endDate ? ` – ${endDate}` : ""}` : "";

                  return (
                    <div key={index} className="mb-2 text-black">
                      <div className="flex justify-between items-baseline mb-0.5">
                        {titleLine && <span className="text-[11pt] font-bold">{titleLine}</span>}

                        {dateLine && <span className="text-[11pt] italic whitespace-nowrap ml-2">{dateLine}</span>}
                      </div>

                      {isFilled(org.description) && (
                        <ul className="list-disc pl-5 text-[11pt] text-black">
                          {org.description
                            .split("\n")
                            .filter((line) => line.trim())
                            .map((bullet, i) => (
                              <li key={i} className="mb-0.5 text-justify">
                                {bullet}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="mb-2 text-slate-400">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[11pt] font-bold">{mockText.orgName}</span>

                    <span className="text-[11pt] italic whitespace-nowrap ml-2">
                      {mockText.orgStart} - {mockText.orgEnd}
                    </span>
                  </div>

                  <div className="text-[11pt] italic mb-1">{mockText.orgRole}</div>

                  <ul className="list-disc pl-5 text-[11pt]">
                    {mockText.orgDesc.split("\n").map((bullet, i) => (
                      <li key={i} className="mb-0.5 text-justify">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 6. KEAHLIAN UTAMA */}

          {visibleSections.skills && (
            <div className="mb-3">
              <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-1 text-black">Keahlian Utama (Skills)</h2>

              <p className={`text-[11pt] ${previewTextClass(data.skills)}`}>{previewVal(data.skills, mockText.skills)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
