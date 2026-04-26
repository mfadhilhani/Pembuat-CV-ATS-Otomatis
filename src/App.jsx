import { useState } from "react";
import { Plus, Trash2, FileText, Download } from "lucide-react";

// --- HELPER COMPONENT UNTUK FORM ---
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
      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm ${disabled ? "bg-slate-100 cursor-not-allowed text-slate-400" : ""}`}
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

export default function App() {
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState({
    personalInfo: {
      fullName: "NAMA LENGKAP",
      location: "Kota Domisili (Misal: Jakarta Selatan)",
      phone: "081234567890",
      email: "email.profesional@gmail.com",
      linkedin: "linkedin.com/in/username",
      github: "github.com/username (Opsional)",
    },
    summary:
      "[Status/Pendidikan saat ini]. Memiliki pengalaman dalam [Bidang/Skill utama 1] dan [Bidang/Skill utama 2]. Terbiasa menggunakan alat seperti [Alat/Software 1] dan [Alat/Software 2]. Memiliki kemampuan [Soft skill 1] dan [Soft skill 2] yang baik, serta siap berkontribusi pada posisi [Posisi yang dilamar].",
    skills: "Skill Hard 1 (Misal: Microsoft Excel) | Skill Hard 2 (Misal: SQL) | Skill Soft 1 (Misal: Komunikasi) | Skill Soft 2 (Misal: Manajemen Waktu)",
    experiences: [
      {
        id: 1,
        title: "Posisi / Jabatan Pekerjaan",
        company: "Nama Perusahaan",
        startDate: "2023-01",
        endDate: "2024-01",
        current: false,
        description:
          "[Kata Kerja Aktif] [Apa yang Anda lakukan] menggunakan [Alat/Metode] sehingga menghasilkan [Hasil Terukur/Angka/Dampak].\n[Kata Kerja Aktif] [Tugas kedua] yang melibatkan [Kontekstual Tugas] dan meningkatkan [Metrik/Hasil].",
      },
    ],
    certifications: [
      {
        id: 1,
        name: "Nama Sertifikasi / Pelatihan",
        issuer: "Lembaga Penerbit",
        validity: "2025-12",
        description: "Penjelasan singkat tentang kompetensi yang didapat (Opsional).",
      },
    ],
    education: [
      {
        id: 1,
        degree: "Gelar dan Jurusan (Misal: S1 Ilmu Komunikasi)",
        university: "Nama Universitas",
        startDate: "2019-08",
        endDate: "2023-09",
        current: false,
        gpa: "3.85 / 4.00",
        details: "Skripsi: [Judul Skripsi jika relevan] | Prestasi: [Sebutkan jika ada]",
      },
    ],
    organizations: [
      {
        id: 1,
        role: "Peran dalam Organisasi (Misal: Ketua Divisi)",
        organization: "Nama Organisasi",
        startDate: "2021-02",
        endDate: "2022-02",
        current: false,
        description: "Mengelola dan memimpin [Jumlah] anggota dalam divisi [Nama Divisi].\nMenyelenggarakan [Nama Acara] yang dihadiri oleh [Jumlah] peserta secara sukses.",
      },
    ],
  });

  // --- HELPER FORMAT DATE ---
  const formatDate = (dateString) => {
    if (!dateString) return "";
    if (dateString.includes("-") && dateString.length === 7) {
      const [year, month] = dateString.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      return `${months[parseInt(month, 10) - 1]} ${year}`;
    }
    return dateString;
  };

  // --- HANDLERS ---
  const handlePersonalInfoChange = (e) => {
    setData({
      ...data,
      personalInfo: { ...data.personalInfo, [e.target.name]: e.target.value },
    });
  };

  const handleSimpleChange = (e, field) => {
    setData({ ...data, [field]: e.target.value });
  };

  const handleArrayChange = (category, index, field, value) => {
    const newData = { ...data };
    newData[category][index][field] = value;
    setData(newData);
  };

  const addItem = (category, template) => {
    setData({
      ...data,
      [category]: [...data[category], { id: Date.now(), ...template }],
    });
  };

  const removeItem = (category, id) => {
    setData({
      ...data,
      [category]: data[category].filter((item) => item.id !== id),
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* CSS KHUSUS UNTUK PRINT / RENDER PDF */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #cv-preview, #cv-preview * {
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
            font-family: 'Times New Roman', Times, serif;
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

      {/* --- BAGIAN KIRI: EDITOR FORM (Disembunyikan saat print) --- */}
      <div className="w-full md:w-1/2 p-6 overflow-y-auto h-screen border-r bg-white no-print">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <FileText className="text-blue-600" /> Editor CV ATS
            </h1>
            <p className="text-sm text-slate-500 mt-1">Font: Times New Roman | Margin: 1 Inch | Spasi: 1.15</p>
          </div>
          <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-colors">
            <Download size={18} /> Download PDF
          </button>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-md text-sm text-blue-800">
          <strong>Tips Pengisian:</strong> Ganti teks bawaan dengan data asli Anda. Gunakan poin singkat yang mengandung angka dan kata kerja aktif.
        </div>

        {/* 1. Header & Kontak */}
        <SectionHeader title="1. Header & Kontak" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <InputField label="Nama Lengkap" name="fullName" value={data.personalInfo.fullName} onChange={handlePersonalInfoChange} />
          <InputField label="Kota Domisili (Cth: Jakarta Selatan)" name="location" value={data.personalInfo.location} onChange={handlePersonalInfoChange} />
          <InputField label="No. HP" name="phone" value={data.personalInfo.phone} onChange={handlePersonalInfoChange} />
          <InputField label="Email Profesional" name="email" value={data.personalInfo.email} onChange={handlePersonalInfoChange} />
          <InputField label="LinkedIn URL" name="linkedin" value={data.personalInfo.linkedin} onChange={handlePersonalInfoChange} />
          <InputField label="GitHub/Portofolio (Opsional)" name="github" value={data.personalInfo.github} onChange={handlePersonalInfoChange} />
        </div>

        {/* 2. Profil Profesional */}
        <SectionHeader title="2. Profil Profesional (Summary)" />
        <TextAreaField label="Ringkasan (Maks 5 Kalimat)" value={data.summary} onChange={(e) => handleSimpleChange(e, "summary")} hint="Formula: [Status/Jurusan] + [Pengalaman relevan] + [Keahlian teknis] + [Nilai yg ditawarkan]." />

        {/* 3. Keahlian */}
        <SectionHeader title="3. Keahlian (Skills)" />
        <TextAreaField
          label="Daftar Keahlian (Gunakan pemisah | atau koma)"
          value={data.skills}
          onChange={(e) => handleSimpleChange(e, "skills")}
          hint="Campurkan Hard Skills (Tools/Software), Hard Skills Non-Teknis, dan Soft Skills terukur."
        />

        {/* 4. Pengalaman Kerja */}
        <SectionHeader title="4. Pengalaman Kerja" />
        {data.experiences.map((exp, index) => (
          <div key={exp.id} className="border border-slate-200 rounded-md p-4 mb-4 bg-slate-50 relative">
            <button onClick={() => removeItem("experiences", exp.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField label="Jabatan/Posisi" value={exp.title} onChange={(e) => handleArrayChange("experiences", index, "title", e.target.value)} />
              <InputField label="Nama Perusahaan" value={exp.company} onChange={(e) => handleArrayChange("experiences", index, "company", e.target.value)} />
              <InputField type="month" label="Mulai" value={exp.startDate} onChange={(e) => handleArrayChange("experiences", index, "startDate", e.target.value)} />
              <div>
                <InputField type="month" label="Selesai" value={exp.current ? "" : exp.endDate} disabled={exp.current} onChange={(e) => handleArrayChange("experiences", index, "endDate", e.target.value)} />
                <div className="flex items-center gap-2 mt-[-10px] mb-3">
                  <input type="checkbox" id={`exp-current-${index}`} checked={exp.current} onChange={(e) => handleArrayChange("experiences", index, "current", e.target.checked)} className="cursor-pointer" />
                  <label htmlFor={`exp-current-${index}`} className="text-xs text-slate-600 cursor-pointer font-medium">
                    Masih bekerja di sini
                  </label>
                </div>
              </div>
            </div>
            <TextAreaField
              label="Deskripsi (Gunakan Enter untuk setiap Bullet Point)"
              value={exp.description}
              onChange={(e) => handleArrayChange("experiences", index, "description", e.target.value)}
              hint="Format PAR: Problem/Context -> Action (Kata Kerja Aktif) -> Result (Angka/Dampak)."
            />
          </div>
        ))}
        <button onClick={() => addItem("experiences", { title: "", company: "", startDate: "", endDate: "", current: false, description: "" })} className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800">
          <Plus size={16} /> Tambah Pengalaman
        </button>

        {/* 5. Sertifikasi */}
        <SectionHeader title="5. Sertifikasi" />
        {data.certifications.map((cert, index) => (
          <div key={cert.id} className="border border-slate-200 rounded-md p-4 mb-4 bg-slate-50 relative">
            <button onClick={() => removeItem("certifications", cert.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField label="Nama Sertifikasi" value={cert.name} onChange={(e) => handleArrayChange("certifications", index, "name", e.target.value)} />
              <InputField label="Lembaga Penerbit" value={cert.issuer} onChange={(e) => handleArrayChange("certifications", index, "issuer", e.target.value)} />
              <InputField type="month" label="Bulan/Tahun Berlaku" value={cert.validity} onChange={(e) => handleArrayChange("certifications", index, "validity", e.target.value)} />
            </div>
            <InputField label="Deskripsi Singkat (Opsional)" value={cert.description} onChange={(e) => handleArrayChange("certifications", index, "description", e.target.value)} />
          </div>
        ))}
        <button onClick={() => addItem("certifications", { name: "", issuer: "", validity: "", description: "" })} className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800">
          <Plus size={16} /> Tambah Sertifikasi
        </button>

        {/* 6. Pendidikan */}
        <SectionHeader title="6. Pendidikan" />
        {data.education.map((edu, index) => (
          <div key={edu.id} className="border border-slate-200 rounded-md p-4 mb-4 bg-slate-50 relative">
            <button onClick={() => removeItem("education", edu.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField label="Gelar & Program Studi" value={edu.degree} onChange={(e) => handleArrayChange("education", index, "degree", e.target.value)} />
              <InputField label="Nama Universitas" value={edu.university} onChange={(e) => handleArrayChange("education", index, "university", e.target.value)} />
              <InputField type="month" label="Mulai" value={edu.startDate} onChange={(e) => handleArrayChange("education", index, "startDate", e.target.value)} />
              <div>
                <InputField type="month" label="Lulus" value={edu.current ? "" : edu.endDate} disabled={edu.current} onChange={(e) => handleArrayChange("education", index, "endDate", e.target.value)} />
                <div className="flex items-center gap-2 mt-[-10px] mb-3">
                  <input type="checkbox" id={`edu-current-${index}`} checked={edu.current} onChange={(e) => handleArrayChange("education", index, "current", e.target.checked)} className="cursor-pointer" />
                  <label htmlFor={`edu-current-${index}`} className="text-xs text-slate-600 cursor-pointer font-medium">
                    Masih menempuh studi
                  </label>
                </div>
              </div>
              <InputField label="IPK" value={edu.gpa} onChange={(e) => handleArrayChange("education", index, "gpa", e.target.value)} />
            </div>
            <InputField label="Info Tambahan (Skripsi/Prestasi)" value={edu.details} onChange={(e) => handleArrayChange("education", index, "details", e.target.value)} />
          </div>
        ))}
        <button
          onClick={() => addItem("education", { degree: "", university: "", startDate: "", endDate: "", current: false, gpa: "", details: "" })}
          className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800"
        >
          <Plus size={16} /> Tambah Pendidikan
        </button>

        {/* 7. Organisasi/Proyek */}
        <SectionHeader title="7. Organisasi / Kepanitiaan / Proyek" />
        {data.organizations.map((org, index) => (
          <div key={org.id} className="border border-slate-200 rounded-md p-4 mb-4 bg-slate-50 relative">
            <button onClick={() => removeItem("organizations", org.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <InputField label="Peran/Posisi" value={org.role} onChange={(e) => handleArrayChange("organizations", index, "role", e.target.value)} />
              <InputField label="Nama Organisasi/Proyek" value={org.organization} onChange={(e) => handleArrayChange("organizations", index, "organization", e.target.value)} />
              <InputField type="month" label="Mulai" value={org.startDate} onChange={(e) => handleArrayChange("organizations", index, "startDate", e.target.value)} />
              <div>
                <InputField type="month" label="Selesai" value={org.current ? "" : org.endDate} disabled={org.current} onChange={(e) => handleArrayChange("organizations", index, "endDate", e.target.value)} />
                <div className="flex items-center gap-2 mt-[-10px] mb-3">
                  <input type="checkbox" id={`org-current-${index}`} checked={org.current} onChange={(e) => handleArrayChange("organizations", index, "current", e.target.checked)} className="cursor-pointer" />
                  <label htmlFor={`org-current-${index}`} className="text-xs text-slate-600 cursor-pointer font-medium">
                    Masih aktif
                  </label>
                </div>
              </div>
            </div>
            <TextAreaField label="Kontribusi/Dampak (Gunakan Enter untuk Bullet Point)" value={org.description} onChange={(e) => handleArrayChange("organizations", index, "description", e.target.value)} />
          </div>
        ))}
        <button
          onClick={() => addItem("organizations", { role: "", organization: "", startDate: "", endDate: "", current: false, description: "" })}
          className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:text-blue-800 pb-10"
        >
          <Plus size={16} /> Tambah Organisasi
        </button>
      </div>

      {/* --- BAGIAN KANAN: LIVE PREVIEW & ATS OUTPUT --- */}
      <div className="w-full md:w-1/2 bg-gray-200 p-8 overflow-y-auto h-screen flex justify-center">
        {/* Kertas Preview */}
        <div
          id="cv-preview"
          className="bg-white shadow-xl print-clean"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "2.54cm",
            boxSizing: "border-box",
            fontFamily: '"Times New Roman", Times, serif',
            lineHeight: "1.15",
          }}
        >
          {/* Header Kontak */}
          <div className="text-center border-b-[1.5px] border-black pb-3 mb-3">
            <h1 className="text-[22pt] font-bold uppercase tracking-wide leading-tight text-black mb-1">{data.personalInfo.fullName || "NAMA LENGKAP"}</h1>
            <div className="text-[11pt] text-black">
              {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
              {data.personalInfo.location && data.personalInfo.phone && <span className="mx-2">|</span>}
              {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
              {data.personalInfo.phone && data.personalInfo.email && <span className="mx-2">|</span>}
              {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
            </div>
            <div className="text-[11pt] text-black mt-0.5">
              {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
              {data.personalInfo.linkedin && data.personalInfo.github && <span className="mx-2">|</span>}
              {data.personalInfo.github && <span>{data.personalInfo.github}</span>}
            </div>
          </div>

          {/* Profil */}
          {data.summary && (
            <div className="mb-3">
              <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-1 text-black">Profil Profesional</h2>
              <p className="text-[11pt] text-justify text-black">{data.summary}</p>
            </div>
          )}

          {/* Keahlian */}
          {data.skills && (
            <div className="mb-3">
              <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-1 text-black">Keahlian Inti</h2>
              <p className="text-[11pt] text-black">{data.skills}</p>
            </div>
          )}

          {/* Pengalaman Kerja */}
          {data.experiences.length > 0 && data.experiences.some((e) => e.title) && (
            <div className="mb-3">
              <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-2 text-black">Pengalaman Kerja</h2>
              {data.experiences.map((exp, index) => {
                if (!exp.title) return null;
                const dateDisplay = exp.startDate ? `${formatDate(exp.startDate)} – ${exp.current ? "Saat Ini" : formatDate(exp.endDate)}` : "";
                return (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between items-baseline mb-0.5 text-black">
                      <span className="text-[11pt] font-bold">
                        {exp.title} | {exp.company}
                      </span>
                      <span className="text-[11pt] italic whitespace-nowrap ml-2">{dateDisplay}</span>
                    </div>
                    {exp.description && (
                      <ul className="list-disc pl-5 text-[11pt] text-black">
                        {exp.description
                          .split("\n")
                          .filter((line) => line.trim() !== "")
                          .map((bullet, idx) => (
                            <li key={idx} className="mb-0.5 text-justify">
                              {bullet}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Sertifikasi */}
          {data.certifications.length > 0 && data.certifications.some((c) => c.name) && (
            <div className="mb-3">
              <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-2 text-black">Sertifikasi Profesional</h2>
              {data.certifications.map((cert, index) => {
                if (!cert.name) return null;
                return (
                  <div key={index} className="mb-1.5 text-black">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-[11pt] font-bold">{cert.name}</span>
                      <span className="text-[11pt] italic whitespace-nowrap ml-2">{formatDate(cert.validity)}</span>
                    </div>
                    <div className="text-[11pt]">
                      {cert.issuer} {cert.description ? `— ${cert.description}` : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pendidikan */}
          {data.education.length > 0 && data.education.some((e) => e.degree) && (
            <div className="mb-3">
              <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-2 text-black">Pendidikan</h2>
              {data.education.map((edu, index) => {
                if (!edu.degree) return null;
                const dateDisplay = edu.startDate ? `${formatDate(edu.startDate)} – ${edu.current ? "Saat Ini" : formatDate(edu.endDate)}` : "";
                return (
                  <div key={index} className="mb-1 text-black">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-[11pt] font-bold">
                        {edu.degree} — {edu.university}
                      </span>
                      <span className="text-[11pt] italic whitespace-nowrap ml-2">{dateDisplay}</span>
                    </div>
                    {(edu.gpa || edu.details) && (
                      <div className="text-[11pt]">
                        {edu.gpa && <span className="font-semibold mr-2">IPK: {edu.gpa}</span>}
                        {edu.details && (
                          <span>
                            {edu.gpa && "| "} {edu.details}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Organisasi */}
          {data.organizations.length > 0 && data.organizations.some((o) => o.role) && (
            <div className="mb-3">
              <h2 className="text-[13pt] font-bold uppercase border-b border-black mb-2 text-black">Organisasi & Kepanitiaan</h2>
              {data.organizations.map((org, index) => {
                if (!org.role) return null;
                const dateDisplay = org.startDate ? `${formatDate(org.startDate)} – ${org.current ? "Saat Ini" : formatDate(org.endDate)}` : "";
                return (
                  <div key={index} className="mb-2 text-black">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-[11pt] font-bold">
                        {org.role} | {org.organization}
                      </span>
                      <span className="text-[11pt] italic whitespace-nowrap ml-2">{dateDisplay}</span>
                    </div>
                    {org.description && (
                      <ul className="list-disc pl-5 text-[11pt] text-black">
                        {org.description
                          .split("\n")
                          .filter((line) => line.trim() !== "")
                          .map((bullet, idx) => (
                            <li key={idx} className="mb-0.5 text-justify">
                              {bullet}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
