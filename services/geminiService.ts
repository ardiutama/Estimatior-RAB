import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProjectDetails, RABResult, BuildingType } from "../types";

export const generateRABEstimate = async (details: ProjectDetails, userApiKey?: string): Promise<RABResult> => {
  // Prioritaskan API Key dari user input, jika kosong gunakan env var
  const apiKey = userApiKey || process.env.API_KEY || '';
  
  if (!apiKey) {
    throw new Error("API Key belum diisi. Silakan masukkan Google Gemini API Key Anda.");
  }

  // Inisialisasi client di dalam fungsi agar bisa menggunakan dynamic key
  const ai = new GoogleGenAI({ apiKey });
  const modelId = "gemini-2.5-flash";

  // Determine the actual building type description to send to AI
  const effectiveBuildingType = details.buildingType === BuildingType.OTHER && details.customBuildingType
    ? details.customBuildingType
    : details.buildingType;

  const prompt = `
    PERAN:
    Anda adalah Senior Quantity Surveyor (QS) dan Ahli Teknik Sipil profesional yang berdomisili di Bali, Indonesia.

    TUGAS:
    Buatlah Rencana Anggaran Biaya (RAB) detail untuk proyek konstruksi berikut.

    DATA PROYEK:
    - Nama: ${details.projectName}
    - Lokasi: ${details.location} (Bali)
    - Luas Tanah: ${details.landArea} m2
    - Luas Bangunan: ${details.buildingArea} m2
    - Lantai: ${details.floors}
    - Tipe: ${effectiveBuildingType}
    - Kualitas Material: ${details.quality}
    - Catatan: ${details.notes}

    LANDASAN TEORITIS & REFERENSI HARGA (WAJIB):
    1.  **Analisa:** Gunakan SNI 2835:2023 dan AHSP (Analisa Harga Satuan Pekerjaan) PUPR terbaru.
    2.  **Harga Dasar (HSD):** Gunakan database harga pasar material dan upah riil di Bali saat ini (Contoh: Semen Gresik/Tiga Roda, Pasir Lumajang/Muntilan, Batu Kali lokal, Upah Tukang Bali).
    3.  **Formula Dasar:** Harga Satuan Pekerjaan (HSP) = (Koefisien x Harga Satuan Bahan) + (Koefisien x Upah Tenaga) + (Koefisien x Harga Alat).

    LOGIKA PERHITUNGAN BIAYA (STEP-BY-STEP):
    
    1.  **Tentukan HSD Dasar:** Estimasi harga dasar material & upah.
    
    2.  **Terapkan FAKTOR LOKASI (Location Adjustment):**
        - Jika Lokasi = "Badung" atau "Denpasar": Tambahkan markup **+10%** pada harga dasar (biaya hidup & logistik tinggi).
        - Jika Lokasi = "Gianyar" atau "Tabanan": Tambahkan markup **+5%**.
        - Jika Kabupaten lain (Bangli, Klungkung, Karangasem, Buleleng, Jembrana): **+0%** (Harga standar).
    
    3.  **Tambahkan OVERHEAD & PROFIT:**
        - Tambahkan Margin Kontraktor sebesar **15%** (Overhead 5% + Profit 10%) ke dalam Harga Satuan Jadi.
        - Rumus Unit Price di JSON = (HSP Dasar x Faktor Lokasi) + 15%.
    
    4.  **Hitung PAJAK (PPN):**
        - Total biaya fisik konstruksi = Sum(Volume x Unit Price).
        - Grand Total = Total Biaya Fisik + **PPN 11%**.

    INSTRUKSI OUTPUT JSON:
    1.  **Detail Item:** Breakdown pekerjaan harus mendetail sesuai tahapan konstruksi (Persiapan, Tanah, Pondasi, Beton, Dinding, Lantai, Atap, Plafon, Pintu/Jendela, Pengecatan, Sanitasi, Elektrikal).
    2.  **Volume:** Hitung volume secara logis berdasarkan Luas Bangunan dan Jumlah Lantai.
        - *PENTING:* Untuk Dinding, Plafon, dan Lantai, gunakan rasio teknik sipil yang akurat terhadap luas bangunan, bukan angka acak.
    3.  **Unit Price:** Pastikan harga satuan yang ditampilkan SUDAH termasuk Material, Upah, Alat, Faktor Lokasi, Overhead, dan Profit.
    4.  **Project Summary:** Jelaskan secara naratif singkat:
        - Spesifikasi struktur utama.
        - **Asumsi Harga Utama:** Sebutkan harga Semen/sak dan Upah Tukang yang digunakan sebagai acuan perhitungan agar user bisa memvalidasi.
        - Persentase penyesuaian harga daerah yang diterapkan.

    Format Output JSON harus sesuai skema berikut.
  `;

  const rabSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      projectSummary: {
        type: Type.STRING,
        description: "Ringkasan teknis, asumsi harga material utama (Semen/Pasir) yang digunakan, dan faktor lokasi.",
      },
      estimatedDuration: {
        type: Type.STRING,
        description: "Estimasi waktu pengerjaan (contoh: 6 Bulan).",
      },
      grandTotal: {
        type: Type.NUMBER,
        description: "Total biaya keseluruhan proyek (Termasuk PPN 11%).",
      },
      categories: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            categoryName: {
              type: Type.STRING,
              description: "Kategori (I. Pekerjaan Persiapan, II. Pekerjaan Tanah & Pondasi, dst).",
            },
            subtotal: {
              type: Type.NUMBER,
              description: "Total biaya kategori ini.",
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING, description: "Uraian pekerjaan sesuai nomenklatur SNI/AHSP." },
                  unit: { type: Type.STRING, description: "Satuan (m2, m3, kg, bh, ls, unit)." },
                  volume: { type: Type.NUMBER, description: "Volume pekerjaan." },
                  unitPrice: { type: Type.NUMBER, description: "Harga Satuan Jadi (Termasuk Mat+Upah+Alat+Overhead+Profit)." },
                  totalPrice: { type: Type.NUMBER, description: "Total harga (Volume x Unit Price)." },
                },
                required: ["description", "unit", "volume", "unitPrice", "totalPrice"],
              },
            },
          },
          required: ["categoryName", "subtotal", "items"],
        },
      },
    },
    required: ["projectSummary", "estimatedDuration", "grandTotal", "categories"],
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: rabSchema,
        temperature: 0.2, // Low temperature for precise calculation
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data returned from AI");
    }

    const parsedData = JSON.parse(text) as RABResult;
    return parsedData;
  } catch (error) {
    console.error("Error generating RAB:", error);
    throw error;
  }
};