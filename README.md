# Nuwara Chart Editor 🎵⚔️
**Web-based Digital Audio Workstation (DAW) & Partitur Chart Editor untuk Game 2D Action-Rhythm "Nuwara: Resonance"**

Editor partitur lagu (chart editor) berbasis web berkinerja tinggi yang dirancang dengan antarmuka profesional Dark Theme ala DAW (Slate & Zinc Theme). Aplikasi ini mengekspor dan mengimpor struktur data JSON murni yang 100% presisi dan kompatibel langsung dengan engine game Unity C#.

---

## 🚀 Fitur Utama

### 1. Header & Metadata Manager
- **Form Metadata**: Konfigurasi `songTitle`, `artist`, `bpm`, `audioOffset` (detik), dan `approachRateBeats` (default: 4.0).
- **Audio Uploader**: Unggah file audio lokal (.mp3, .wav, .ogg, .flac).
- **Built-in Synth Demo Track**: Generator musik ritmik sintetis 120 BPM in-browser otomatis sehingga editor langsung dapat dicoba tanpa perlu mengunggah file terlebih dahulu.
- **Import & Export JSON**:
  - **Export JSON**: Unduh file `.json` atau salin ke clipboard dengan format Unity C# murni tanpa komentar.
  - **Import JSON**: Muat dan validasi chart JSON yang sudah ada.

### 2. Waveform & Timeline Grid Interaktif (2 Lane)
- **Visualisasi Waveform**: Menggunakan Wavesurfer.js yang tersinkronisasi presisi dengan playhead time.
- **Timeline 2 Jalur (2-Lane Track)**:
  - **Lane 0 (Atas / Air)**: Aksi udara (lompat/serang udara) - Aksen Cyan Glow.
  - **Lane 1 (Bawah / Ground)**: Aksi darat (tebas/dash darat) - Aksen Amber Glow.
- **Beat Snapping Grid**: Pilihan pembagian beat: `1/4` (Quarter Note), `1/8`, `1/12` (Triplets), `1/16`, `1/32`, atau `Free Snap` (bebas).
- **Interaksi Mouse Tingkat Lanjut**:
  - Klik pada grid lane untuk menambahkan note baru (otomatis snap ke beat terdekat).
  - Drag & drop badan note untuk memindahkan `targetTime` dan antar lane.
  - Drag ujung kanan blok note untuk mengubah `duration` (otomatis mengubah `durationBeats` dan set `entityType = 2`).
  - Klik kanan pada note atau tekan `Delete` / `Backspace` untuk menghapus note.
- **Transport & Playback Controls**:
  - Play / Pause (`Spacebar`).
  - Kecepatan pemutaran (`0.25x`, `0.5x`, `0.75x`, `1.0x`, `1.25x`, `1.5x`).
  - Horizontal zoom (`Alt + Scroll` atau zoom slider dari 60px/s hingga 800px/s).
  - Built-in **Metronome** & **Hitsounds** (umpan balik audio saat playhead menyentuh note).
  - Fitur **Follow Playhead** (auto-scroll timeline).

### 3. Live Tapping Mode (Perekaman Real-time)
- Rekam partitur lagu secara interaktif saat lagu diputar:
  - Tekan <kbd>F</kbd>: Tambah note pada **Lane 0 (Air)** di `audioCurrentTime`.
  - Tekan <kbd>J</kbd>: Tambah note pada **Lane 1 (Ground)** di `audioCurrentTime`.
  - Tahan <kbd>F</kbd> atau <kbd>J</kbd>: Otomatis membuat **Hold Note** (durasi bertambah secara real-time selama tombol ditahan).
- Dilengkapi Animated HUD Pad di bagian bawah layar dengan feedback visual dan audio hitsound instan.

### 4. Inspector & Property Panel (Sidebar Kanan)
- **Note Properties**:
  - Panel edit presisi untuk note yang dipilih: `id`, `entityType`, `lane`, `targetTime`, `targetBeat`, `duration`, `durationBeats`, dan `tickRate`.
  - Sinkronisasi matematis otomatis: Mengubah `targetTime` otomatis mengkalkulasi `targetBeat` dan sebaliknya. Mengubah `duration` otomatis mengkalkulasi `durationBeats` dan `entityType`.
  - Tombol duplikasi note dan lompat ke waktu note pada timeline.
- **Notes List & Filter**:
  - Tabel daftar seluruh note terurut berdasarkan `targetTime`.
  - Filter berdasarkan Lane (Air/Ground) atau Tipe (Single/Hold), serta pencarian ID/waktu.
  - Statistik partitur: Total Notes, Single count, Hold count, dan NPS (*Notes Per Second*).
  - Tombol **Quantize All** untuk meratakan posisi seluruh note ke grid snap aktif.

---

## ⌨️ Shortcut Keyboard

| Shortcut | Fungsi |
|---|---|
| <kbd>Space</kbd> | Play / Pause audio |
| <kbd>F</kbd> | Tap note pada **Lane 0 (Air)** |
| <kbd>J</kbd> | Tap note pada **Lane 1 (Ground)** |
| <kbd>Tahan F / J</kbd> | Membuat **Hold Note** selama tombol ditahan |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Hapus note yang sedang dipilih |
| <kbd>Ctrl + Z</kbd> | Undo |
| <kbd>Ctrl + Y</kbd> | Redo |
| <kbd>Alt + Scroll</kbd> | Zoom in / Zoom out timeline horizontal |
| <kbd>Klik Kanan Note</kbd> | Hapus note langsung |

---

## 📐 Formula Perhitungan Otomatis
```javascript
targetBeat = targetTime * (bpm / 60.0)
durationBeats = duration * (bpm / 60.0)

// entityType:
// 0: Single Note (jika duration == 0.0)
// 2: Hold Note (jika duration > 0.0)
```

---

## 📦 Struktur Data JSON (Unity C# Engine)
```json
{
  "songTitle": "Resonance Pulse",
  "artist": "Nuwara Sound Team",
  "bpm": 120.0,
  "audioOffset": 0.0,
  "approachRateBeats": 4.0,
  "notes": [
    {
      "id": 1,
      "entityType": 0,
      "lane": 0,
      "targetTime": 2.0,
      "targetBeat": 4.0,
      "duration": 0.0,
      "durationBeats": 0.0,
      "tickRate": 4
    },
    {
      "id": 2,
      "entityType": 2,
      "lane": 1,
      "targetTime": 3.302083333333315,
      "targetBeat": 6.60416666666663,
      "duration": 2.000000000000027,
      "durationBeats": 4.000000000000054,
      "tickRate": 4
    }
  ]
}
```

### Model C# Unity yang Cocok:
```csharp
[System.Serializable]
public class NuwaraChartData
{
    public string songTitle;
    public string artist;
    public float bpm;
    public float audioOffset;
    public float approachRateBeats;
    public List<NuwaraNoteData> notes;
}

[System.Serializable]
public class NuwaraNoteData
{
    public int id;
    public int entityType; // 0 = Single, 2 = Hold
    public int lane;       // 0 = Air, 1 = Ground
    public float targetTime;
    public float targetBeat;
    public float duration;
    public float durationBeats;
    public int tickRate;
}
```

---

## 🛠️ Cara Menjalankan Aplikasi

1. **Jalankan Development Server**:
```bash
npm run dev
```
2. Buka browser pada alamat yang tertera (biasanya `http://localhost:3000` atau `http://localhost:5173`).
3. Tekan <kbd>Space</kbd> untuk memutar lagu demo dan coba tekan <kbd>F</kbd> atau <kbd>J</kbd> untuk merekam note secara langsung!

