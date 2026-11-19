/* ==========================================================================
   APLIKASI DEMO — PESANTREN KADER NAZHIR PUTRI JALALUDDIN
   Arsitektur Modular Vanilla ES6+ (Disiapkan untuk Migrasi ke Laravel Blade)
   - Lapisan: Config -> Storage/IndexedDB -> Validation -> Store -> UI -> Router -> Views
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. KONFIGURASI & SEED DATA FALLBACK
     ------------------------------------------------------------------------ */
  const CONFIG = {
    STORAGE_KEY: 'pknj_demo_content_v1',
    INIT_KEY: 'pknj_demo_initialized_v1',
    IDB_NAME: 'pknj_demo_files_db',
    IDB_VERSION: 1,
    IDB_STORE: 'files',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
    ALLOWED_DOC_EXTS: ['pdf', 'ppt', 'pptx'],
    DOC_CATEGORIES: ['Profil', 'Kurikulum', 'Kajian Wakaf', 'Kepemimpinan', 'Panduan', 'Lainnya'],
    VIDEO_CATEGORIES: ['Profil', 'Kajian Wakaf', 'Tahfidz', 'Kepemimpinan', 'Dokumentasi', 'Lainnya']
  };

  // Fallback jika dibuka langsung lewat file:// (ketika fetch data.json diblokir CORS browser)
  const DEFAULT_SEED_DATA = {
    meta: {
      institution: 'Pesantren Kader Nazhir Putri Jalaluddin',
      version: '2.1.0',
      schemaVersion: '2.1.0'
    },
    documents: [
      {
        id: 'doc-001',
        title: 'Profil Pesantren Kader Nazhir Putri Jalaluddin',
        description: 'Dokumen pengenalan visi, misi, dan program pendidikan terpadu pesantren putri serta kaderisasi nazhir wakaf.',
        category: 'Profil',
        type: 'pdf',
        fileId: null,
        fileName: null,
        fileSize: 0,
        demo: true,
        status: 'published',
        createdAt: '2026-11-01T08:00:00+07:00'
      },
      {
        id: 'doc-002',
        title: "Silabus Tahfidz Al-Qur'an & Ilmu Turats",
        description: "Rancangan kurikulum pembinaan hafalan Al-Qur'an, adab thalibul ilmi, serta kajian kitab keislaman dasar hingga menengah.",
        category: 'Kurikulum',
        type: 'pdf',
        fileId: null,
        fileName: null,
        fileSize: 0,
        demo: true,
        status: 'published',
        createdAt: '2026-11-04T09:30:00+07:00'
      },
      {
        id: 'doc-003',
        title: 'Modul Pengantar Manajemen Wakaf Produktif',
        description: 'Materi presentasi pembekalan dasar tata kelola aset wakaf, amanah kenazhiran, dan literasi kebermanfaatan umat.',
        category: 'Kajian Wakaf',
        type: 'pptx',
        fileId: null,
        fileName: null,
        fileSize: 0,
        demo: true,
        status: 'published',
        createdAt: '2026-11-08T10:15:00+07:00'
      },
      {
        id: 'doc-004',
        title: 'Panduan Kepemimpinan Muslimah & Organisasi Santriwati',
        description: 'Bahan ajar pembinaan karakter kepemimpinan, komunikasi efektif, dan manajemen kegiatan kesantrian.',
        category: 'Kepemimpinan',
        type: 'ppt',
        fileId: null,
        fileName: null,
        fileSize: 0,
        demo: true,
        status: 'draft',
        createdAt: '2026-11-12T14:00:00+07:00'
      }
    ],
    videos: [
      {
        id: 'vid-001',
        title: 'Pengenalan Program Pendidikan & Kaderisasi Nazhir',
        description: "Gambaran umum pembinaan harian santriwati dalam memadukan tahfidz Al-Qur'an, ilmu keislaman, dan wawasan wakaf.",
        category: 'Profil',
        youtubeId: null,
        youtubeUrl: null,
        demo: true,
        status: 'published',
        createdAt: '2026-11-02T08:00:00+07:00'
      },
      {
        id: 'vid-002',
        title: 'Kajian Dasar Fiqih Wakaf dan Peran Nazhir Muslimah',
        description: 'Rekaman materi pengantar tentang peran strategis nazhir dalam menjaga dan mengembangkan amanah wakaf.',
        category: 'Kajian Wakaf',
        youtubeId: null,
        youtubeUrl: null,
        demo: true,
        status: 'draft',
        createdAt: '2026-11-10T11:20:00+07:00'
      }
    ]
  };

  /* ------------------------------------------------------------------------
     2. UTILITAS UMUM
     ------------------------------------------------------------------------ */
  const Utils = {
    escapeHtml(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },

    formatDate(isoString) {
      if (!isoString) return '-';
      const date = new Date(isoString);
      if (Number.isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(date);
    },

    formatBytes(bytes) {
      if (!bytes || bytes <= 0) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB'];
      const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
      const val = bytes / Math.pow(1024, idx);
      return `${val.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
    },

    generateId(prefix) {
      const rand = Math.random().toString(36).slice(2, 7);
      return `${prefix}-${Date.now().toString(36)}-${rand}`;
    },

    getCategoryBadgeClass(category) {
      const map = {
        'Profil': 'badge--green',
        'Kurikulum': 'badge--teal',
        'Kajian Wakaf': 'badge--orange',
        'Kepemimpinan': 'badge--purple',
        'Tahfidz': 'badge--green',
        'Panduan': 'badge--warm',
        'Dokumentasi': 'badge--teal'
      };
      return map[category] || 'badge--neutral';
    },

    icon(name, size = 18, extraClass = '') {
      return `<i data-lucide="${Utils.escapeHtml(name)}" class="${Utils.escapeHtml(extraClass)}" style="width:${size}px;height:${size}px;" aria-hidden="true"></i>`;
    },

    clone(obj) {
      return JSON.parse(JSON.stringify(obj));
    }
  };

  /* ------------------------------------------------------------------------
     3. VALIDATION SERVICE (Siap dipetakan ke FormRequest Laravel)
     ------------------------------------------------------------------------ */
  const ValidationService = {
    validateDocumentFile(file) {
      if (!file) {
        return { valid: false, error: 'Silakan pilih file dokumen terlebih dahulu.' };
      }

      const name = file.name || '';
      const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
      if (!CONFIG.ALLOWED_DOC_EXTS.includes(ext)) {
        return {
          valid: false,
          error: 'Format file tidak didukung. Hanya menerima file PDF, PPT, atau PPTX.'
        };
      }

      if (file.size <= 0) {
        return { valid: false, error: 'File tampak kosong (0 byte). Silakan pilih file yang valid.' };
      }

      if (file.size > CONFIG.MAX_FILE_SIZE) {
        return {
          valid: false,
          error: `Ukuran file (${Utils.formatBytes(file.size)}) melebihi batas maksimal demo 10 MB.`
        };
      }

      return {
        valid: true,
        type: ext,
        fileName: name,
        fileSize: file.size
      };
    },

    parseYouTubeUrl(rawUrl) {
      const trimmed = (rawUrl || '').trim();
      if (!trimmed) {
        return { valid: false, error: 'URL YouTube wajib diisi.' };
      }

      let normalized = trimmed;
      if (!/^https?:\/\//i.test(normalized)) {
        normalized = 'https://' + normalized;
      }

      let parsed;
      try {
        parsed = new URL(normalized);
      } catch {
        return {
          valid: false,
          error: 'Format URL tidak valid. Gunakan tautan lengkap seperti https://www.youtube.com/watch?v=...'
        };
      }

      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return { valid: false, error: 'Protokol URL harus http atau https.' };
      }

      const host = parsed.hostname.toLowerCase();
      const allowedYouTubeHosts = [
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'youtube-nocookie.com',
        'www.youtube-nocookie.com'
      ];
      const isShortHost = host === 'youtu.be' || host === 'www.youtu.be';
      const isStandardHost = allowedYouTubeHosts.includes(host);

      if (!isShortHost && !isStandardHost) {
        return {
          valid: false,
          error: 'Domain harus berasal dari YouTube resmi (youtube.com atau youtu.be).'
        };
      }

      let videoId = '';
      const segments = parsed.pathname.split('/').filter(Boolean);

      if (isShortHost) {
        videoId = segments[0] || '';
      } else if (parsed.pathname === '/watch') {
        videoId = parsed.searchParams.get('v') || '';
      } else if (segments[0] === 'embed' || segments[0] === 'shorts') {
        videoId = segments[1] || '';
      }

      const idPattern = /^[a-zA-Z0-9_-]{11}$/;
      if (!idPattern.test(videoId)) {
        return {
          valid: false,
          error: 'ID video YouTube tidak ditemukan atau tidak valid. Pastikan memakai format watch?v=, youtu.be/, embed/, atau shorts/.'
        };
      }

      return {
        valid: true,
        videoId,
        canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      };
    }
  };

  /* ------------------------------------------------------------------------
     4. INDEXEDDB SERVICE (Penyimpanan File Lokal Browser untuk Demo)
     ------------------------------------------------------------------------ */
  const IndexedDBService = {
    dbPromise: null,

    isSupported() {
      return typeof window !== 'undefined' && 'indexedDB' in window;
    },

    openDB() {
      if (!this.isSupported()) {
        return Promise.reject(new Error('Browser ini tidak mendukung IndexedDB untuk penyimpanan file lokal.'));
      }
      if (this.dbPromise) return this.dbPromise;

      this.dbPromise = new Promise((resolve, reject) => {
        try {
          const req = window.indexedDB.open(CONFIG.IDB_NAME, CONFIG.IDB_VERSION);
          req.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(CONFIG.IDB_STORE)) {
              db.createObjectStore(CONFIG.IDB_STORE, { keyPath: 'id' });
            }
          };
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => {
            this.dbPromise = null;
            reject(new Error('Gagal membuka penyimpanan lokal IndexedDB.'));
          };
        } catch (err) {
          this.dbPromise = null;
          reject(err);
        }
      });

      return this.dbPromise;
    },

    readFileWithProgress(file, onProgress) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onprogress = (ev) => {
          if (ev.lengthComputable && typeof onProgress === 'function') {
            const pct = Math.min(80, Math.round((ev.loaded / ev.total) * 80));
            onProgress(pct);
          }
        };
        reader.onload = () => {
          if (typeof onProgress === 'function') onProgress(85);
          resolve(reader.result);
        };
        reader.onerror = () => reject(new Error('Gagal membaca berkas dari perangkat Anda.'));
        reader.readAsArrayBuffer(file);
      });
    },

    async saveFile(fileId, file, onProgress) {
      const arrayBuffer = await this.readFileWithProgress(file, onProgress);
      const mimeMap = {
        pdf: 'application/pdf',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      };
      const ext = (file.name.split('.').pop() || '').toLowerCase();
      const mimeType = file.type || mimeMap[ext] || 'application/octet-stream';
      const blob = new Blob([arrayBuffer], { type: mimeType });

      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([CONFIG.IDB_STORE], 'readwrite');
        const store = tx.objectStore(CONFIG.IDB_STORE);
        const record = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: mimeType,
          blob,
          savedAt: new Date().toISOString()
        };

        const req = store.put(record);
        req.onerror = () => {
          if (req.error && req.error.name === 'QuotaExceededError') {
            reject(new Error('Kapasitas penyimpanan browser tidak mencukupi. Hapus beberapa file lama atau kurangi ukuran file.'));
          } else {
            reject(new Error('Gagal menyimpan file ke IndexedDB.'));
          }
        };

        tx.oncomplete = () => {
          if (typeof onProgress === 'function') onProgress(100);
          resolve(record);
        };
        tx.onerror = () => {
          const err = tx.error;
          if (err && err.name === 'QuotaExceededError') {
            reject(new Error('Kapasitas penyimpanan browser tidak mencukupi.'));
          } else {
            reject(new Error('Transaksi penyimpanan file lokal gagal.'));
          }
        };
      });
    },

    async getFile(fileId) {
      if (!fileId) return null;
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([CONFIG.IDB_STORE], 'readonly');
        const store = tx.objectStore(CONFIG.IDB_STORE);
        const req = store.get(fileId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(new Error('Gagal mengambil file dari IndexedDB.'));
      });
    },

    async deleteFile(fileId) {
      if (!fileId || !this.isSupported()) return;
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([CONFIG.IDB_STORE], 'readwrite');
        const store = tx.objectStore(CONFIG.IDB_STORE);
        store.delete(fileId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(new Error('Gagal menghapus file dari IndexedDB.'));
      });
    },

    async clearAll() {
      if (!this.isSupported()) return;
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([CONFIG.IDB_STORE], 'readwrite');
        tx.objectStore(CONFIG.IDB_STORE).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(new Error('Gagal membersihkan IndexedDB.'));
      });
    },

    async estimateStorage() {
      if (navigator.storage && typeof navigator.storage.estimate === 'function') {
        try {
          const est = await navigator.storage.estimate();
          return {
            supported: true,
            usage: est.usage || 0,
            quota: est.quota || 0
          };
        } catch {
          return { supported: false };
        }
      }
      return { supported: false };
    }
  };

  /* ------------------------------------------------------------------------
     5. STORAGE SERVICE (localStorage Metadata + Load Awal dari data.json)
     ------------------------------------------------------------------------ */
  const StorageService = {
    getLmsFallback() {
      return Utils.clone(CONFIG.LMS_SEED || {
        subjects: [],
        chapters: [],
        tests: [],
        questions: [],
        attempts: [],
        inProgress: {},
        learningProgress: { completedChapterIds: [] }
      });
    },

    ensureLmsFields(data, seedSource = null) {
      const fallback = seedSource || this.getLmsFallback();
      const merged = { ...data };
      if (!Array.isArray(merged.subjects)) merged.subjects = Utils.clone(fallback.subjects || []);
      if (!Array.isArray(merged.chapters)) merged.chapters = Utils.clone(fallback.chapters || []);
      if (!Array.isArray(merged.tests)) merged.tests = Utils.clone(fallback.tests || []);
      if (!Array.isArray(merged.questions)) merged.questions = Utils.clone(fallback.questions || []);
      if (!Array.isArray(merged.attempts)) merged.attempts = Utils.clone(fallback.attempts || []);
      if (!merged.inProgress || typeof merged.inProgress !== 'object') merged.inProgress = Utils.clone(fallback.inProgress || {});
      if (!merged.learningProgress || !Array.isArray(merged.learningProgress.completedChapterIds)) {
        merged.learningProgress = Utils.clone(fallback.learningProgress || { completedChapterIds: [] });
      }
      return merged;
    },

    async fetchSeedJson() {
      try {
        const res = await fetch('./data.json', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP error');
        const json = await res.json();
        if (Array.isArray(json.documents) && Array.isArray(json.videos)) {
          return this.ensureLmsFields(json);
        }
      } catch {
        // Fallback aman saat dijalankan via file:// atau offline
      }
      return this.ensureLmsFields(Utils.clone(DEFAULT_SEED_DATA));
    },

    async init() {
      try {
        const isInit = localStorage.getItem(CONFIG.INIT_KEY) === '1';
        const raw = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (isInit && raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.documents) && Array.isArray(parsed.videos)) {
            const needsLmsMigration = !Array.isArray(parsed.subjects) || !Array.isArray(parsed.tests);
            if (needsLmsMigration) {
              const seed = await this.fetchSeedJson();
              const migrated = this.ensureLmsFields(parsed, seed);
              this.save(migrated);
              return migrated;
            }
            return this.ensureLmsFields(parsed);
          }
        }
      } catch {
        // Jika JSON korup, muat ulang seed
      }

      const seed = await this.fetchSeedJson();
      this.save(seed);
      localStorage.setItem(CONFIG.INIT_KEY, '1');
      return seed;
    },

    save(data) {
      try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(CONFIG.INIT_KEY, '1');
      } catch (err) {
        if (err && err.name === 'QuotaExceededError') {
          throw new Error('Penyimpanan localStorage browser penuh.');
        }
        throw err;
      }
    },

    async resetDemo() {
      await IndexedDBService.clearAll();
      const seed = await this.fetchSeedJson();
      this.save(seed);
      return seed;
    }
  };

  /* ------------------------------------------------------------------------
     6. DATA STORE (Single Source of Truth untuk Publik & Admin)
     ------------------------------------------------------------------------ */
  const DataStore = {
    state: {
      meta: { ...DEFAULT_SEED_DATA.meta },
      documents: [],
      videos: [],
      subjects: [],
      chapters: [],
      tests: [],
      questions: [],
      attempts: [],
      inProgress: {},
      learningProgress: { completedChapterIds: [] }
    },

    async bootstrap() {
      const data = await StorageService.init();
      this.applyState(data);
      if (typeof window.PKNJ?.migrateStateV21 === 'function') {
        window.PKNJ.migrateStateV21();
      }
    },

    applyState(data) {
      this.state.meta = data.meta ? Utils.clone(data.meta) : { ...DEFAULT_SEED_DATA.meta };
      this.state.documents = data.documents || [];
      this.state.videos = data.videos || [];
      this.state.subjects = data.subjects || [];
      this.state.chapters = data.chapters || [];
      this.state.tests = data.tests || [];
      this.state.questions = data.questions || [];
      this.state.attempts = data.attempts || [];
      this.state.inProgress = data.inProgress || {};
      this.state.learningProgress = data.learningProgress || { completedChapterIds: [] };
    },

    persist() {
      StorageService.save({
        meta: { ...DEFAULT_SEED_DATA.meta, ...(this.state.meta || {}), version: '2.1.0' },
        documents: this.state.documents,
        videos: this.state.videos,
        subjects: this.state.subjects,
        chapters: this.state.chapters,
        tests: this.state.tests,
        questions: this.state.questions,
        attempts: this.state.attempts,
        inProgress: this.state.inProgress,
        learningProgress: this.state.learningProgress
      });
    },

    getDocuments() {
      return [...this.state.documents].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },

    getPublishedDocuments() {
      return this.getDocuments().filter((d) => d.status === 'published');
    },

    getDocumentById(id) {
      return this.state.documents.find((d) => d.id === id) || null;
    },

    async addDocument(payload, file, onProgress) {
      const fileCheck = ValidationService.validateDocumentFile(file);
      if (!fileCheck.valid) {
        throw new Error(fileCheck.error);
      }

      const fileId = Utils.generateId('file');
      await IndexedDBService.saveFile(fileId, file, onProgress);

      const newDoc = {
        id: Utils.generateId('doc'),
        title: payload.title.trim(),
        description: (payload.description || '').trim(),
        category: payload.category || 'Profil',
        type: fileCheck.type,
        fileId,
        fileName: fileCheck.fileName,
        fileSize: fileCheck.fileSize,
        demo: false,
        status: payload.status === 'published' ? 'published' : 'draft',
        createdAt: new Date().toISOString()
      };

      this.state.documents.unshift(newDoc);
      this.persist();
      return newDoc;
    },

    async updateDocument(id, payload, newFile, onProgress) {
      const idx = this.state.documents.findIndex((d) => d.id === id);
      if (idx === -1) throw new Error('Dokumen tidak ditemukan.');
      const existing = this.state.documents[idx];

      let updatedFileFields = {
        type: existing.type,
        fileId: existing.fileId,
        fileName: existing.fileName,
        fileSize: existing.fileSize,
        demo: existing.demo
      };

      if (newFile) {
        const fileCheck = ValidationService.validateDocumentFile(newFile);
        if (!fileCheck.valid) throw new Error(fileCheck.error);

        const newFileId = Utils.generateId('file');
        await IndexedDBService.saveFile(newFileId, newFile, onProgress);

        if (existing.fileId) {
          await IndexedDBService.deleteFile(existing.fileId).catch(() => {});
        }

        updatedFileFields = {
          type: fileCheck.type,
          fileId: newFileId,
          fileName: fileCheck.fileName,
          fileSize: fileCheck.fileSize,
          demo: false
        };
      }

      const updated = {
        ...existing,
        ...updatedFileFields,
        title: payload.title.trim(),
        description: (payload.description || '').trim(),
        category: payload.category || existing.category,
        status: payload.status === 'published' ? 'published' : 'draft'
      };

      this.state.documents[idx] = updated;
      this.persist();
      return updated;
    },

    toggleDocumentStatus(id) {
      const doc = this.getDocumentById(id);
      if (!doc) return null;
      doc.status = doc.status === 'published' ? 'draft' : 'published';
      this.persist();
      return doc;
    },

    async deleteDocument(id) {
      const idx = this.state.documents.findIndex((d) => d.id === id);
      if (idx === -1) return;
      const [removed] = this.state.documents.splice(idx, 1);
      if (removed && removed.fileId) {
        await IndexedDBService.deleteFile(removed.fileId).catch(() => {});
      }
      this.persist();
    },

    getVideos() {
      return [...this.state.videos].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },

    getPublishedVideos() {
      return this.getVideos().filter((v) => v.status === 'published');
    },

    getVideoById(id) {
      return this.state.videos.find((v) => v.id === id) || null;
    },

    addVideo(payload) {
      const parsed = ValidationService.parseYouTubeUrl(payload.youtubeUrl);
      if (!parsed.valid) throw new Error(parsed.error);

      const newVideo = {
        id: Utils.generateId('vid'),
        title: payload.title.trim(),
        description: (payload.description || '').trim(),
        category: payload.category || 'Profil',
        youtubeId: parsed.videoId,
        youtubeUrl: parsed.canonicalUrl,
        demo: false,
        status: payload.status === 'published' ? 'published' : 'draft',
        createdAt: new Date().toISOString()
      };

      this.state.videos.unshift(newVideo);
      this.persist();
      return newVideo;
    },

    updateVideo(id, payload) {
      const idx = this.state.videos.findIndex((v) => v.id === id);
      if (idx === -1) throw new Error('Video tidak ditemukan.');
      const existing = this.state.videos[idx];

      let youtubeId = existing.youtubeId;
      let youtubeUrl = existing.youtubeUrl;
      let demo = existing.demo;

      const inputUrl = (payload.youtubeUrl || '').trim();
      if (inputUrl) {
        const parsed = ValidationService.parseYouTubeUrl(inputUrl);
        if (!parsed.valid) throw new Error(parsed.error);
        youtubeId = parsed.videoId;
        youtubeUrl = parsed.canonicalUrl;
        demo = false;
      } else if (!existing.youtubeId) {
        throw new Error('URL YouTube wajib diisi untuk melengkapi video ini.');
      }

      const updated = {
        ...existing,
        title: payload.title.trim(),
        description: (payload.description || '').trim(),
        category: payload.category || existing.category,
        youtubeId,
        youtubeUrl,
        demo,
        status: payload.status === 'published' ? 'published' : 'draft'
      };

      this.state.videos[idx] = updated;
      this.persist();
      return updated;
    },

    toggleVideoStatus(id) {
      const vid = this.getVideoById(id);
      if (!vid) return null;
      vid.status = vid.status === 'published' ? 'draft' : 'published';
      this.persist();
      return vid;
    },

    deleteVideo(id) {
      this.state.videos = this.state.videos.filter((v) => v.id !== id);
      this.persist();
    },

    getStats() {
      const docs = this.state.documents;
      const vids = this.state.videos;
      const all = [
        ...docs.map((d) => ({ ...d, kind: 'document' })),
        ...vids.map((v) => ({ ...v, kind: 'video' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const publishedCount = all.filter((item) => item.status === 'published').length;
      const draftCount = all.length - publishedCount;

      const tests = this.state.tests || [];
      const questions = this.state.questions || [];
      const attempts = this.state.attempts || [];
      const questionsByTest = new Map();
      questions.forEach((q) => {
        if (!questionsByTest.has(q.testId)) questionsByTest.set(q.testId, []);
        questionsByTest.get(q.testId).push(q);
      });
      const testsNeedingAdjustmentCount = tests.filter((t) => {
        const qs = questionsByTest.get(t.id) || [];
        return qs.some((q) => q.type !== 'multiple_choice');
      }).length;

      return {
        totalDocuments: docs.length,
        totalVideos: vids.length,
        publishedDocuments: docs.filter((d) => d.status === 'published').length,
        publishedVideos: vids.filter((v) => v.status === 'published').length,
        publishedCount,
        draftCount,
        totalAll: all.length,
        recentItems: all.slice(0, 6),
        totalPreTests: tests.filter((t) => t.type === 'pre_test').length,
        totalPostTests: tests.filter((t) => t.type === 'post_test').length,
        totalQuestions: questions.length,
        totalAttempts: attempts.length,
        testsNeedingAdjustmentCount
      };
    },

    async resetDemo() {
      const fresh = await StorageService.resetDemo();
      this.applyState(fresh);
      if (typeof window.PKNJ?.migrateStateV21 === 'function') {
        window.PKNJ.migrateStateV21();
      }
    }
  };

  /* ------------------------------------------------------------------------
     7. KOMPONEN UI (Toast, Modal, Confirm Dialog, Reveal, Icons)
     ------------------------------------------------------------------------ */
  const UI = {
    refreshIcons() {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
        return;
      }
      // Fallback ringan jika CDN Lucide tidak terjangkau (offline)
      const fallbackPaths = {
        menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
        x: '<path d="M18 6L6 18M6 6l12 12"/>',
        eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
        download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
        pencil: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
        'trash-2': '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
        play: '<polygon points="6 3 20 12 6 21 6 3"/>',
        'panel-left': '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>',
        search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'
      };
      document.querySelectorAll('i[data-lucide]').forEach((el) => {
        const name = el.getAttribute('data-lucide');
        const path = fallbackPaths[name] || '<circle cx="12" cy="12" r="4"/>';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('style', el.getAttribute('style') || 'width:18px;height:18px;');
        svg.setAttribute('aria-hidden', 'true');
        svg.innerHTML = path;
        el.replaceWith(svg);
      });
    },

    Toast: {
      show(message, type = 'info', duration = 3800) {
        const root = document.getElementById('toast-root');
        if (!root) return;

        const iconMap = {
          success: 'check-circle-2',
          error: 'alert-circle',
          info: 'info'
        };
        const colorMap = {
          success: 'var(--green-600)',
          error: 'var(--danger-main)',
          info: 'var(--teal-main)'
        };

        const el = document.createElement('div');
        el.className = `toast toast--${type}`;
        el.setAttribute('role', 'status');
        el.innerHTML = `
          <span style="color:${colorMap[type] || colorMap.info};flex-shrink:0;margin-top:2px;">
            ${Utils.icon(iconMap[type] || 'info', 18)}
          </span>
          <div style="flex:1;min-width:0;">${Utils.escapeHtml(message)}</div>
          <button type="button" class="icon-btn" style="width:28px;height:28px;border:none;" aria-label="Tutup notifikasi">
            ${Utils.icon('x', 15)}
          </button>
        `;

        const closeBtn = el.querySelector('button');
        const remove = () => {
          if (el.parentNode) el.parentNode.removeChild(el);
        };
        closeBtn.addEventListener('click', remove);

        root.appendChild(el);
        UI.refreshIcons();
        window.setTimeout(remove, duration);
      }
    },

    Modal: {
      lastFocused: null,
      activeBlobUrls: [],
      onCloseCallback: null,

      registerBlobUrl(url) {
        this.activeBlobUrls.push(url);
      },

      cleanupResources() {
        while (this.activeBlobUrls.length) {
          const url = this.activeBlobUrls.pop();
          try {
            URL.revokeObjectURL(url);
          } catch {
            // abaikan
          }
        }
        const root = document.getElementById('modal-root');
        if (root) {
          root.querySelectorAll('iframe').forEach((frame) => {
            frame.src = 'about:blank';
          });
        }
      },

      open({ title, bodyHtml, footerHtml = '', size = 'md', onClose = null }) {
        const root = document.getElementById('modal-root');
        if (!root) return;

        this.cleanupResources();
        this.lastFocused = document.activeElement;
        this.onCloseCallback = onClose;

        const sizeClass = size === 'lg' ? 'modal-dialog--lg' : size === 'sm' ? 'modal-dialog--sm' : '';
        root.innerHTML = `
          <div class="modal-backdrop" data-modal-close></div>
          <div class="modal-dialog ${sizeClass}" role="dialog" aria-modal="true" aria-labelledby="modal-title-heading">
            <div class="modal-header">
              <h2 id="modal-title-heading" class="modal-title">${Utils.escapeHtml(title)}</h2>
              <button type="button" class="icon-btn" data-modal-close aria-label="Tutup jendela">
                ${Utils.icon('x', 18)}
              </button>
            </div>
            <div class="modal-body">${bodyHtml}</div>
            ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
          </div>
        `;

        root.classList.add('is-open');
        root.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        root.querySelectorAll('[data-modal-close]').forEach((el) => {
          el.addEventListener('click', () => this.close());
        });

        UI.refreshIcons();

        const focusTarget = root.querySelector('input, select, textarea, button:not([data-modal-close])') ||
          root.querySelector('[data-modal-close]');
        if (focusTarget) focusTarget.focus();
      },

      close() {
        const root = document.getElementById('modal-root');
        if (!root || !root.classList.contains('is-open')) return;

        this.cleanupResources();
        root.classList.remove('is-open');
        root.setAttribute('aria-hidden', 'true');
        root.innerHTML = '';

        if (!document.getElementById('confirm-root')?.classList.contains('is-open')) {
          document.body.style.overflow = '';
        }

        if (typeof this.onCloseCallback === 'function') {
          this.onCloseCallback();
          this.onCloseCallback = null;
        }

        if (this.lastFocused && typeof this.lastFocused.focus === 'function') {
          this.lastFocused.focus();
          this.lastFocused = null;
        }
      }
    },

    Confirm: {
      lastFocused: null,

      open({ title, message, confirmLabel = 'Ya, Lanjutkan', danger = true, onConfirm }) {
        const root = document.getElementById('confirm-root');
        if (!root) return;

        this.lastFocused = document.activeElement;
        root.innerHTML = `
          <div class="modal-backdrop" data-confirm-cancel></div>
          <div class="modal-dialog modal-dialog--sm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title-heading">
            <div class="modal-header">
              <h2 id="confirm-title-heading" class="modal-title">${Utils.escapeHtml(title)}</h2>
              <button type="button" class="icon-btn" data-confirm-cancel aria-label="Batal">
                ${Utils.icon('x', 18)}
              </button>
            </div>
            <div class="modal-body">
              <p style="font-size:0.93rem;color:var(--text-secondary);">${Utils.escapeHtml(message)}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn--outline" data-confirm-cancel>Batal</button>
              <button type="button" class="btn ${danger ? 'btn--danger' : 'btn--primary'}" id="confirm-accept-btn">
                ${Utils.escapeHtml(confirmLabel)}
              </button>
            </div>
          </div>
        `;

        root.classList.add('is-open');
        root.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        root.querySelectorAll('[data-confirm-cancel]').forEach((el) => {
          el.addEventListener('click', () => this.close());
        });

        const acceptBtn = document.getElementById('confirm-accept-btn');
        acceptBtn.addEventListener('click', async () => {
          acceptBtn.disabled = true;
          try {
            await onConfirm();
          } finally {
            this.close();
          }
        });

        UI.refreshIcons();
        acceptBtn.focus();
      },

      close() {
        const root = document.getElementById('confirm-root');
        if (!root || !root.classList.contains('is-open')) return;

        root.classList.remove('is-open');
        root.setAttribute('aria-hidden', 'true');
        root.innerHTML = '';

        if (!document.getElementById('modal-root')?.classList.contains('is-open')) {
          document.body.style.overflow = '';
        }

        if (this.lastFocused && typeof this.lastFocused.focus === 'function') {
          this.lastFocused.focus();
          this.lastFocused = null;
        }
      }
    },

    initRevealObserver() {
      const items = document.querySelectorAll('.reveal');
      if (!items.length) return;

      const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced || !('IntersectionObserver' in window)) {
        items.forEach((el) => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
      );

      items.forEach((el) => observer.observe(el));
    }
  };

  /* ------------------------------------------------------------------------
     8. AKSI PREVIEW & DOWNLOAD DOKUMEN + PEMUTAR VIDEO
     ------------------------------------------------------------------------ */
  const MediaActions = {
    async previewDocument(docId) {
      const doc = DataStore.getDocumentById(docId);
      if (!doc) {
        UI.Toast.show('Dokumen tidak ditemukan.', 'error');
        return;
      }

      if (!doc.fileId) {
        UI.Modal.open({
          title: doc.title,
          size: 'sm',
          bodyHtml: `
            <div style="display:flex;flex-direction:column;gap:1rem;">
              <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                <span class="badge ${Utils.getCategoryBadgeClass(doc.category)}">${Utils.escapeHtml(doc.category)}</span>
                <span class="badge badge--neutral">${Utils.escapeHtml(doc.type.toUpperCase())}</span>
                <span class="badge badge--demo">Contoh Demo</span>
              </div>
              <p style="font-size:0.93rem;color:var(--text-secondary);">${Utils.escapeHtml(doc.description || 'Tidak ada deskripsi tambahan.')}</p>
              <div class="alert-box alert-box--info">
                ${Utils.icon('info', 18)}
                <div>
                  Dokumen ini adalah <strong>data contoh</strong> tanpa berkas terlampir. Anda dapat mengunggah file PDF, PPT, atau PPTX asli melalui menu Manajemen Dokumen (Mode Demo).
                </div>
              </div>
            </div>
          `,
          footerHtml: `
            <button type="button" class="btn btn--outline" data-modal-close>Tutup</button>
            <a href="#/admin/dokumen" class="btn btn--primary" data-goto-admin>Kelola di Admin</a>
          `
        });
        document.querySelector('[data-goto-admin]')?.addEventListener('click', () => {
          UI.Modal.close();
        });
        return;
      }

      try {
        const record = await IndexedDBService.getFile(doc.fileId);
        if (!record || !record.blob) {
          UI.Toast.show('File lokal tidak ditemukan di IndexedDB browser ini.', 'error');
          return;
        }

        const blobUrl = URL.createObjectURL(record.blob);
        UI.Modal.registerBlobUrl(blobUrl);

        if (doc.type === 'pdf') {
          UI.Modal.open({
            title: doc.title,
            size: 'lg',
            bodyHtml: `
              <div style="display:flex;flex-direction:column;gap:0.9rem;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:0.5rem;font-size:0.84rem;color:var(--text-muted);">
                  <span>${Utils.escapeHtml(doc.fileName)} &bull; ${Utils.formatBytes(doc.fileSize)}</span>
                  <span>Dipublikasikan ${Utils.formatDate(doc.createdAt)}</span>
                </div>
                <iframe class="pdf-viewer-frame" src="${blobUrl}" title="Pratinjau PDF ${Utils.escapeHtml(doc.title)}"></iframe>
              </div>
            `,
            footerHtml: `
              <button type="button" class="btn btn--outline" data-modal-close>Tutup</button>
              <button type="button" class="btn btn--primary" id="modal-download-doc-btn">
                ${Utils.icon('download', 17)} Unduh PDF
              </button>
            `
          });
        } else {
          UI.Modal.open({
            title: doc.title,
            size: 'sm',
            bodyHtml: `
              <div style="display:flex;flex-direction:column;gap:1rem;">
                <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                  <span class="badge badge--teal">${Utils.escapeHtml(doc.type.toUpperCase())}</span>
                  <span class="badge ${Utils.getCategoryBadgeClass(doc.category)}">${Utils.escapeHtml(doc.category)}</span>
                </div>
                <p style="font-size:0.92rem;color:var(--text-secondary);">${Utils.escapeHtml(doc.description || 'Tidak ada deskripsi.')}</p>
                <div style="padding:0.9rem;border-radius:var(--radius-md);background:var(--bg-subtle);font-size:0.86rem;display:flex;flex-direction:column;gap:0.35rem;">
                  <div><strong>Nama Berkas:</strong> ${Utils.escapeHtml(doc.fileName)}</div>
                  <div><strong>Format:</strong> Presentasi ${Utils.escapeHtml(doc.type.toUpperCase())}</div>
                  <div><strong>Ukuran:</strong> ${Utils.formatBytes(doc.fileSize)}</div>
                  <div><strong>Tanggal:</strong> ${Utils.formatDate(doc.createdAt)}</div>
                </div>
                <div class="alert-box alert-box--info">
                  ${Utils.icon('info', 18)}
                  <div>Pratinjau slide PPT/PPTX tidak dirender di browser tanpa server konversi. Silakan unduh berkas untuk membukanya.</div>
                </div>
              </div>
            `,
            footerHtml: `
              <button type="button" class="btn btn--outline" data-modal-close>Tutup</button>
              <button type="button" class="btn btn--primary" id="modal-download-doc-btn">
                ${Utils.icon('download', 17)} Unduh ${Utils.escapeHtml(doc.type.toUpperCase())}
              </button>
            `
          });
        }

        document.getElementById('modal-download-doc-btn')?.addEventListener('click', () => {
          this.triggerDownload(blobUrl, doc.fileName || `${doc.title}.${doc.type}`);
        });
      } catch (err) {
        UI.Toast.show(err.message || 'Gagal membuka berkas.', 'error');
      }
    },

    async downloadDocument(docId) {
      const doc = DataStore.getDocumentById(docId);
      if (!doc || !doc.fileId) {
        UI.Toast.show('Dokumen contoh ini belum memiliki berkas fisik untuk diunduh.', 'info');
        return;
      }

      try {
        const record = await IndexedDBService.getFile(doc.fileId);
        if (!record || !record.blob) {
          UI.Toast.show('File tidak ditemukan di penyimpanan lokal browser.', 'error');
          return;
        }
        const blobUrl = URL.createObjectURL(record.blob);
        this.triggerDownload(blobUrl, doc.fileName || `${doc.title}.${doc.type}`);
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
      } catch (err) {
        UI.Toast.show(err.message || 'Gagal mengunduh dokumen.', 'error');
      }
    },

    triggerDownload(blobUrl, fileName) {
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      UI.Toast.show(`Mengunduh "${fileName}"...`, 'success');
    },

    playVideo(videoId) {
      const video = DataStore.getVideoById(videoId);
      if (!video) {
        UI.Toast.show('Video tidak ditemukan.', 'error');
        return;
      }

      if (!video.youtubeId) {
        UI.Toast.show('Video contoh ini belum memiliki tautan YouTube yang valid.', 'info');
        return;
      }

      const embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(video.youtubeId)}?autoplay=1&rel=0`;
      const watchUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(video.youtubeId)}`;

      UI.Modal.open({
        title: video.title,
        size: 'lg',
        bodyHtml: `
          <div style="display:flex;flex-direction:column;gap:1rem;">
            <div class="video-player-frame">
              <iframe
                src="${embedUrl}"
                title="Pemutar YouTube: ${Utils.escapeHtml(video.title)}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                referrerpolicy="strict-origin-when-cross-origin">
              </iframe>
            </div>
            <div style="display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:1rem;">
              <div style="flex:1;min-width:240px;">
                <div style="display:flex;gap:0.45rem;flex-wrap:wrap;margin-bottom:0.45rem;">
                  <span class="badge ${Utils.getCategoryBadgeClass(video.category)}">${Utils.escapeHtml(video.category)}</span>
                  <span class="badge badge--neutral">${Utils.formatDate(video.createdAt)}</span>
                </div>
                <p style="font-size:0.91rem;color:var(--text-secondary);">${Utils.escapeHtml(video.description || '')}</p>
              </div>
              <a href="${watchUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--outline btn--sm">
                ${Utils.icon('external-link', 15)} Buka di YouTube
              </a>
            </div>
            <p class="form-hint">Jika pemutar video dibatasi oleh pemilik kanal atau jaringan, gunakan tombol "Buka di YouTube" di atas.</p>
          </div>
        `
      });
    }
  };

  /* ------------------------------------------------------------------------
     9. PUBLIC VIEWS (Beranda, Daftar Dokumen, Galeri Video, Kontak)
     ------------------------------------------------------------------------ */
  const PublicViews = {
    pendingScrollSection: null,

    brandLogoSvg() {
      return `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 19.5C4 18.1 5.1 17 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M6.5 2H20V22H6.5C5.1 22 4 20.9 4 19.5V4.5C4 3.1 5.1 2 6.5 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          <path d="M12 6.5C13.7 8 14.5 9.8 14.5 11.5C14.5 13 13.4 14 12 14C10.6 14 9.5 13 9.5 11.5C9.5 9.8 10.3 8 12 6.5Z" fill="#ffbf4d"/>
        </svg>
      `;
    },

    heroIllustrationSvg() {
      return `
        <svg viewBox="0 0 540 400" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ilustrasi arsitektur edukasi Islam modern">
          <rect width="540" height="400" fill="#F8FCF8"/>
          <circle cx="430" cy="86" r="56" fill="#FFEBBE" opacity="0.85"/>
          <circle cx="430" cy="86" r="34" fill="#FFA826" opacity="0.35"/>
          <path d="M0 320C110 292 195 304 285 322C375 340 455 316 540 296V400H0V320Z" fill="#E1F4E1"/>
          <path d="M0 348C135 328 265 352 540 328V400H0V348Z" fill="#BDE4BD" opacity="0.65"/>

          <!-- Gerbang Lengkungan Editorial -->
          <rect x="110" y="92" width="320" height="248" rx="18" fill="#FFFFFF" stroke="#D7E8D7" stroke-width="2"/>
          <path d="M150 340V200C150 144.772 194.772 100 250 100H290C345.228 100 390 144.772 390 200V340H150Z" fill="#F3FAF3" stroke="#8FCD8F" stroke-width="2"/>
          <path d="M188 340V212C188 171.131 221.131 138 262 138H278C318.869 138 352 171.131 352 212V340H188Z" fill="#FFFFFF" stroke="#3F8F3F" stroke-width="2.5"/>

          <!-- Ornamen Geometris Halus -->
          <circle cx="270" cy="184" r="20" fill="#FFF7E6" stroke="#FF8A00" stroke-width="2"/>
          <path d="M270 171L274.2 179.8L283 184L274.2 188.2L270 197L265.8 188.2L257 184L265.8 179.8L270 171Z" fill="#FF8A00"/>

          <!-- Simbol Kitab / Al-Qur'an Terbuka -->
          <path d="M214 252C233 243 253 246 270 257C287 246 307 243 326 252V298C307 289 287 292 270 303C253 292 233 289 214 298V252Z" fill="#3F8F3F"/>
          <path d="M221 257C237 250 254 253 270 262V296C254 287 237 285 221 291V257Z" fill="#F3FAF3"/>
          <path d="M319 257C303 250 286 253 270 262V296C286 287 303 285 319 291V257Z" fill="#FFFFFF"/>

          <!-- Elemen Daun -->
          <ellipse cx="92" cy="296" rx="26" ry="44" fill="#5FAB5F" opacity="0.85"/>
          <ellipse cx="448" cy="288" rx="30" ry="50" fill="#3F8F3F" opacity="0.85"/>
          <rect x="89" y="302" width="6" height="44" rx="3" fill="#1F4220"/>
          <rect x="445" y="294" width="6" height="52" rx="3" fill="#1F4220"/>
        </svg>
      `;
    },

    renderHeader(activeRoute) {
      return `
        <header class="public-header" id="public-header">
          <div class="container navbar">
            <a href="#/" class="brand-mark" aria-label="Beranda Pesantren Kader Nazhir Putri Jalaluddin">
              <span class="brand-mark__logo">${this.brandLogoSvg()}</span>
              <span class="brand-mark__text">
                <span class="brand-mark__title">Pesantren Kader Nazhir Putri Jalaluddin</span>
                <span class="brand-mark__subtitle">Pendidikan Qur'ani &amp; Kaderisasi Wakaf</span>
              </span>
            </a>

            <nav class="nav-links" aria-label="Navigasi utama">
              <a href="#/" class="nav-link ${activeRoute === '#/' ? 'is-active' : ''}">Beranda</a>
              <button type="button" class="nav-link" style="background:none;border:none;cursor:pointer;" data-scroll-section="profil">Profil</button>
              <a href="#/pembelajaran" class="nav-link ${activeRoute.startsWith('#/pembelajaran') || activeRoute.startsWith('#/tes') ? 'is-active' : ''}">Pembelajaran</a>
              <a href="#/dokumen" class="nav-link ${activeRoute === '#/dokumen' ? 'is-active' : ''}">Dokumen</a>
              <a href="#/video" class="nav-link ${activeRoute === '#/video' ? 'is-active' : ''}">Video</a>
              <button type="button" class="nav-link" style="background:none;border:none;cursor:pointer;" data-scroll-section="kontak">Kontak</button>
            </nav>

            <div class="nav-actions">
              <a href="#/admin" class="nav-demo-link" title="Masuk ke Dashboard Admin Simulasi">
                ${Utils.icon('layout-dashboard', 15)}
                <span>Admin (Mode Demo)</span>
              </a>
              <button type="button" class="btn btn--primary btn--sm" data-open-contact>
                ${Utils.icon('message-circle', 16)}
                <span>Hubungi Kami</span>
              </button>
            </div>

            <button type="button" class="nav-toggle" id="mobile-nav-open" aria-label="Buka menu navigasi" aria-expanded="false">
              ${Utils.icon('menu', 22)}
            </button>
          </div>
        </header>

        <div class="mobile-nav" id="mobile-nav" aria-hidden="true">
          <div class="mobile-nav__backdrop" data-mobile-close></div>
          <div class="mobile-nav__panel" role="dialog" aria-modal="true" aria-label="Menu Navigasi Mobile">
            <div class="mobile-nav__header">
              <strong style="color:var(--green-800);font-size:0.95rem;">Menu Navigasi</strong>
              <button type="button" class="icon-btn" data-mobile-close aria-label="Tutup menu">
                ${Utils.icon('x', 18)}
              </button>
            </div>
            <div class="mobile-nav__list">
              <a href="#/" class="nav-link ${activeRoute === '#/' ? 'is-active' : ''}" data-mobile-close>Beranda</a>
              <button type="button" class="nav-link" style="background:none;border:none;text-align:left;cursor:pointer;" data-scroll-section="profil" data-mobile-close>Profil Pesantren</button>
              <a href="#/pembelajaran" class="nav-link ${activeRoute.startsWith('#/pembelajaran') || activeRoute.startsWith('#/tes') ? 'is-active' : ''}" data-mobile-close>Pembelajaran (Mini LMS)</a>
              <a href="#/dokumen" class="nav-link ${activeRoute === '#/dokumen' ? 'is-active' : ''}" data-mobile-close>Perpustakaan Dokumen</a>
              <a href="#/video" class="nav-link ${activeRoute === '#/video' ? 'is-active' : ''}" data-mobile-close>Galeri Video</a>
              <button type="button" class="nav-link" style="background:none;border:none;text-align:left;cursor:pointer;" data-scroll-section="kontak" data-mobile-close>Kontak</button>
            </div>
            <div class="mobile-nav__footer">
              <a href="#/admin" class="btn btn--outline" data-mobile-close>
                ${Utils.icon('layout-dashboard', 17)} Dashboard Admin (Mode Demo)
              </a>
              <button type="button" class="btn btn--primary" data-open-contact data-mobile-close>
                ${Utils.icon('message-circle', 17)} Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      `;
    },

    renderDocumentCard(doc) {
      const typeUpper = (doc.type || 'pdf').toUpperCase();
      const hasFile = Boolean(doc.fileId);

      const actionButtons = hasFile
        ? `
          <button type="button" class="btn btn--outline btn--sm" data-preview-doc="${Utils.escapeHtml(doc.id)}">
            ${Utils.icon(doc.type === 'pdf' ? 'eye' : 'info', 15)}
            <span>${doc.type === 'pdf' ? 'Lihat' : 'Info File'}</span>
          </button>
          <button type="button" class="btn btn--primary btn--sm" data-download-doc="${Utils.escapeHtml(doc.id)}">
            ${Utils.icon('download', 15)}
            <span>Unduh</span>
          </button>
        `
        : `
          <button type="button" class="btn btn--outline btn--sm" data-preview-doc="${Utils.escapeHtml(doc.id)}">
            ${Utils.icon('file-text', 15)}
            <span>Lihat Detail (Contoh)</span>
          </button>
        `;

      return `
        <article class="doc-card reveal">
          <div class="doc-card__top">
            <div class="doc-type-icon doc-type-icon--${Utils.escapeHtml(doc.type)}">
              ${Utils.escapeHtml(typeUpper)}
            </div>
            <div class="doc-card__badges">
              <span class="badge ${Utils.getCategoryBadgeClass(doc.category)}">${Utils.escapeHtml(doc.category)}</span>
              ${!hasFile ? '<span class="badge badge--demo">Contoh</span>' : ''}
            </div>
          </div>
          <h3 class="doc-card__title">${Utils.escapeHtml(doc.title)}</h3>
          <p class="doc-card__desc">${Utils.escapeHtml(doc.description || 'Dokumen edukasi dan dokumentasi program pesantren.')}</p>
          <div class="doc-card__meta">
            <span>${Utils.icon('calendar', 14)} ${Utils.formatDate(doc.createdAt)}</span>
            <span>${hasFile ? Utils.formatBytes(doc.fileSize) : `${Utils.escapeHtml(typeUpper)} &bull; Contoh`}</span>
          </div>
          <div class="doc-card__actions">${actionButtons}</div>
        </article>
      `;
    },

    renderVideoCard(video) {
      const hasYouTube = Boolean(video.youtubeId);
      const thumbUrl = hasYouTube ? `https://i.ytimg.com/vi/${encodeURIComponent(video.youtubeId)}/hqdefault.jpg` : '';

      return `
        <article class="video-card reveal">
          <div class="video-card__thumb">
            ${hasYouTube ? `
              <img src="${thumbUrl}" alt="Thumbnail video ${Utils.escapeHtml(video.title)}" loading="lazy">
              <button type="button" class="video-card__play-overlay" data-play-video="${Utils.escapeHtml(video.id)}" aria-label="Putar video ${Utils.escapeHtml(video.title)}">
                <span class="video-card__play-btn">${Utils.icon('play', 24)}</span>
              </button>
            ` : `
              <div class="video-card__placeholder">
                ${Utils.icon('video-off', 28)}
                <strong style="font-size:0.86rem;color:var(--green-800);">Contoh Konten Video</strong>
                <span style="font-size:0.78rem;">Tautan YouTube belum ditambahkan di Mode Demo.</span>
              </div>
            `}
          </div>
          <div class="video-card__body">
            <div class="video-card__badges">
              <span class="badge ${Utils.getCategoryBadgeClass(video.category)}">${Utils.escapeHtml(video.category)}</span>
              ${!hasYouTube ? '<span class="badge badge--demo">Contoh</span>' : ''}
            </div>
            <h3 class="video-card__title">${Utils.escapeHtml(video.title)}</h3>
            <p class="video-card__desc">${Utils.escapeHtml(video.description || 'Dokumentasi kegiatan dan kajian pesantren.')}</p>
            <div class="video-card__footer">
              <span>${Utils.formatDate(video.createdAt)}</span>
              ${hasYouTube ? `
                <button type="button" class="btn btn--primary btn--sm" data-play-video="${Utils.escapeHtml(video.id)}">
                  ${Utils.icon('play-circle', 15)} Putar Video
                </button>
              ` : `
                <a href="#/admin/video" class="btn btn--outline btn--sm">
                  ${Utils.icon('plus-circle', 15)} Tambah URL
                </a>
              `}
            </div>
          </div>
        </article>
      `;
    },

    renderFooter() {
      const year = new Date().getFullYear();
      return `
        <footer class="public-footer">
          <div class="container">
            <div class="footer-grid">
              <div>
                <div class="brand-mark" style="margin-bottom:1rem;">
                  <span class="brand-mark__logo">${this.brandLogoSvg()}</span>
                  <span class="brand-mark__text">
                    <span class="brand-mark__title" style="color:var(--white);">Pesantren Kader Nazhir Putri Jalaluddin</span>
                    <span class="brand-mark__subtitle" style="color:var(--green-200);">Bogor, Jawa Barat</span>
                  </span>
                </div>
                <p style="font-size:0.9rem;color:var(--green-200);max-width:420px;">
                  Prototype website edukasi dan repositori publikasi untuk memperkenalkan program tahfidz, ilmu keislaman, serta kaderisasi nazhir wakaf putri.
                </p>
                <div class="social-row">
                  <button type="button" class="social-btn" data-social-placeholder="Instagram">${Utils.icon('instagram', 14)} Instagram</button>
                  <button type="button" class="social-btn" data-social-placeholder="YouTube">${Utils.icon('youtube', 14)} YouTube</button>
                  <button type="button" class="social-btn" data-social-placeholder="Portal Informasi">${Utils.icon('globe', 14)} Portal</button>
                </div>
              </div>

              <div>
                <h3 class="footer-title">Navigasi Cepat</h3>
                <div class="footer-links">
                  <a href="#/">Beranda</a>
                  <button type="button" data-scroll-section="profil">Profil Pesantren</button>
                  <a href="#/pembelajaran">Pembelajaran (Mini LMS)</a>
                  <a href="#/dokumen">Perpustakaan Dokumen</a>
                  <a href="#/video">Galeri Video</a>
                  <a href="#/admin">Dashboard Admin (Mode Demo)</a>
                </div>
              </div>

              <div>
                <h3 class="footer-title">Informasi &amp; Lokasi</h3>
                <div class="footer-links" style="color:var(--green-200);font-size:0.88rem;">
                  <div>Lokasi: Bogor, Jawa Barat</div>
                  <div>Status Situs: Prototype Demonstrasi Klien</div>
                  <div style="margin-top:0.5rem;">
                    <button type="button" class="btn btn--primary btn--sm" data-open-contact>
                      ${Utils.icon('mail', 15)} Formulir Kontak Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="footer-bottom">
              <span>&copy; ${year} Pesantren Kader Nazhir Putri Jalaluddin. Hak cipta dilindungi.</span>
              <span>Mode Demo Frontend &bull; Data tersimpan lokal di browser</span>
            </div>
          </div>
        </footer>
      `;
    },

    renderHome() {
      const pubDocs = DataStore.getPublishedDocuments();
      const pubVideos = DataStore.getPublishedVideos();
      const latestDocs = pubDocs.slice(0, 3);
      const latestVideos = pubVideos.slice(0, 3);

      return `
        ${this.renderHeader('#/')}
        <main id="main-content">
          <!-- HERO SECTION -->
          <section class="hero">
            <div class="container hero__grid">
              <div>
                <div class="eyebrow">
                  ${Utils.icon('sparkles', 14)}
                  <span>Pendidikan Putri &amp; Kaderisasi Nazhir Wakaf</span>
                </div>
                <h1 class="hero__headline">
                  Membentuk Muslimah <span>Berilmu, Beradab,</span> dan Siap Memimpin.
                </h1>
                <p class="hero__desc">
                  Pesantren Kader Nazhir Putri Jalaluddin memadukan pendidikan Al-Qur'an, khazanah keilmuan Islam, dan kepemimpinan nazhir untuk mempersiapkan generasi muslimah masa depan.
                </p>
                <div class="hero__actions">
                  <button type="button" class="btn btn--primary btn--lg" data-scroll-section="profil">
                    <span>Jelajahi Program</span>
                    ${Utils.icon('arrow-down-right', 18)}
                  </button>
                  <a href="#/dokumen" class="btn btn--outline btn--lg">
                    ${Utils.icon('book-open', 18)}
                    <span>Lihat Dokumentasi</span>
                  </a>
                </div>

                <div class="hero__meta">
                  <div>
                    <div class="hero__stat-value">3 Pilar</div>
                    <div class="hero__stat-label">Qur'ani, Turats &amp; Kenazhiran</div>
                  </div>
                  <div>
                    <div class="hero__stat-value">${pubDocs.length} Dokumen</div>
                    <div class="hero__stat-label">Materi &amp; panduan terbit</div>
                  </div>
                  <div>
                    <div class="hero__stat-value">${pubVideos.length} Video</div>
                    <div class="hero__stat-label">Kajian &amp; dokumentasi terbit</div>
                  </div>
                </div>
              </div>

              <div class="hero-visual">
                <div class="hero-visual__frame">
                  <div class="hero-visual__art">
                    ${this.heroIllustrationSvg()}
                  </div>
                  <div class="hero-visual__caption">
                    <span>Ilustrasi visual pendidikan Islam (Placeholder Demo)</span>
                    <span class="badge badge--green">Bogor, Jawa Barat</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- PROFIL SINGKAT -->
          <section id="profil" class="section section--tint">
            <div class="container">
              <div class="profil-layout">
                <div class="reveal">
                  <div class="eyebrow">${Utils.icon('compass', 14)} <span>Profil Lembaga</span></div>
                  <h2 class="section-title">Memadukan Kedalaman Ilmu dan Amanah Kepemimpinan</h2>
                  <p class="section-subtitle">
                    Pesantren Kader Nazhir Putri Jalaluddin dirancang sebagai ruang tumbuh bagi santriwati agar kokoh dalam hafalan Al-Qur'an, matang dalam pemahaman keislaman, serta cakap mengelola program kebermanfaatan berbasis wakaf.
                  </p>
                  <blockquote class="profil-editorial__quote">
                    "Menyiapkan kader muslimah yang tidak hanya kuat menjaga nilai keilmuan, tetapi juga amanah dan terampil menggerakkan kemaslahatan umat."
                  </blockquote>
                </div>

                <div class="pillars-grid">
                  <article class="pillar-card reveal">
                    <div class="pillar-card__icon pillar-card__icon--green">
                      ${Utils.icon('book-open-check', 24)}
                    </div>
                    <div>
                      <h3 class="pillar-card__title">Al-Qur'an &amp; Tahfidz</h3>
                      <p class="pillar-card__desc">
                        Pembinaan tahsin, hafalan Al-Qur'an yang terstruktur, serta pembiasaan adab dan tilawah dalam kehidupan harian santriwati.
                      </p>
                    </div>
                  </article>

                  <article class="pillar-card reveal">
                    <div class="pillar-card__icon pillar-card__icon--teal">
                      ${Utils.icon('library', 24)}
                    </div>
                    <div>
                      <h3 class="pillar-card__title">Ilmu Keislaman &amp; Turats</h3>
                      <p class="pillar-card__desc">
                        Kajian fiqih, aqidah, akhlak, bahasa Arab, dan khazanah kitab klasik untuk membangun nalar keislaman yang jernih dan berimbang.
                      </p>
                    </div>
                  </article>

                  <article class="pillar-card reveal">
                    <div class="pillar-card__icon pillar-card__icon--purple">
                      ${Utils.icon('award', 24)}
                    </div>
                    <div>
                      <h3 class="pillar-card__title">Kepemimpinan &amp; Manajemen Wakaf</h3>
                      <p class="pillar-card__desc">
                        Kaderisasi kepemimpinan muslimah, tata kelola organisasi, serta pemahaman dasar manajemen wakaf yang amanah dan produktif.
                      </p>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </section>

          ${typeof this.renderLmsHomeSection === 'function' ? this.renderLmsHomeSection() : ''}

          <!-- PERPUSTAKAAN DOKUMEN TERBARU -->
          <section class="section">
            <div class="container">
              <div class="section-header">
                <div class="section-header__text">
                  <div class="eyebrow">${Utils.icon('folder-open', 14)} <span>Perpustakaan Dokumen</span></div>
                  <h2 class="section-title">Materi &amp; Publikasi Terbaru</h2>
                  <p class="section-subtitle">
                    Kumpulan profil program, silabus, serta modul pembelajaran dalam format PDF dan presentasi yang telah diterbitkan.
                  </p>
                </div>
                <a href="#/dokumen" class="btn btn--outline">
                  <span>Semua Dokumen</span>
                  ${Utils.icon('arrow-right', 16)}
                </a>
              </div>

              ${latestDocs.length ? `
                <div class="cards-grid">
                  ${latestDocs.map((doc) => this.renderDocumentCard(doc)).join('')}
                </div>
              ` : `
                <div class="empty-state">
                  <div class="empty-state__icon">${Utils.icon('file-x', 26)}</div>
                  <h3 class="empty-state__title">Belum Ada Dokumen Terbit</h3>
                  <p class="empty-state__desc">Dokumen berstatus terbit akan muncul di sini secara otomatis. Silakan tambahkan atau terbitkan melalui Dashboard Admin.</p>
                  <a href="#/admin/dokumen" class="btn btn--primary btn--sm">Kelola di Admin Demo</a>
                </div>
              `}
            </div>
          </section>

          <!-- GALERI VIDEO -->
          <section class="section section--tint">
            <div class="container">
              <div class="section-header">
                <div class="section-header__text">
                  <div class="eyebrow eyebrow--orange">${Utils.icon('play-circle', 14)} <span>Galeri Video</span></div>
                  <h2 class="section-title">Kajian &amp; Dokumentasi Video</h2>
                  <p class="section-subtitle">
                    Saksikan pengenalan program, kajian keilmuan, dan dokumentasi kegiatan yang dikurasi melalui kanal YouTube.
                  </p>
                </div>
                <a href="#/video" class="btn btn--outline">
                  <span>Semua Video</span>
                  ${Utils.icon('arrow-right', 16)}
                </a>
              </div>

              ${latestVideos.length ? `
                <div class="cards-grid">
                  ${latestVideos.map((vid) => this.renderVideoCard(vid)).join('')}
                </div>
              ` : `
                <div class="empty-state">
                  <div class="empty-state__icon">${Utils.icon('video', 26)}</div>
                  <h3 class="empty-state__title">Belum Ada Video Terbit</h3>
                  <p class="empty-state__desc">Video YouTube dengan status Terbit akan tampil otomatis di bagian ini.</p>
                  <a href="#/admin/video" class="btn btn--primary btn--sm">Tambah Video di Admin</a>
                </div>
              `}
            </div>
          </section>

          <!-- KONTAK SECTION -->
          <section id="kontak" class="section">
            <div class="container">
              <div class="contact-panel reveal">
                <div>
                  <div class="badge badge--orange" style="margin-bottom:0.9rem;">Lokasi &amp; Konsultasi</div>
                  <h2>Terhubung dengan Pesantren Kader Nazhir Putri Jalaluddin</h2>
                  <p>
                    Tertarik mengenal lebih lanjut mengenai program kaderisasi atau dokumentasi lembaga? Gunakan simulasi formulir kontak demo atau jelajahi panel admin untuk mencoba pengelolaan konten.
                  </p>
                  <div style="display:flex;flex-wrap:wrap;gap:0.75rem;">
                    <button type="button" class="btn btn--primary" data-open-contact>
                      ${Utils.icon('send', 16)} Kirim Pesan (Simulasi)
                    </button>
                    <a href="#/admin" class="btn btn--outline" style="background:rgba(255,255,255,0.1);color:var(--white);border-color:rgba(255,255,255,0.28);">
                      ${Utils.icon('layout-dashboard', 16)} Buka Dashboard Admin
                    </a>
                  </div>
                </div>

                <div class="contact-info-list">
                  <div class="contact-info-item">
                    ${Utils.icon('map-pin', 20)}
                    <div>
                      <strong>Wilayah Lembaga</strong>
                      <span>Bogor, Jawa Barat (alamat rinci tidak dicantumkan pada prototype demo)</span>
                    </div>
                  </div>
                  <div class="contact-info-item">
                    ${Utils.icon('shield-check', 20)}
                    <div>
                      <strong>Transparansi Prototype</strong>
                      <span>Seluruh data dokumen &amp; video dijalankan secara lokal di browser (localStorage &amp; IndexedDB).</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        ${this.renderFooter()}
      `;
    },

    docFilterState: { query: '', type: 'all' },

    renderDocumentsPage() {
      return `
        ${this.renderHeader('#/dokumen')}
        <main id="main-content">
          <section class="page-hero">
            <div class="container page-hero__inner">
              <div>
                <div class="eyebrow">${Utils.icon('folder-open', 14)} <span>Repositori Terbit</span></div>
                <h1 class="section-title" style="margin-bottom:0.35rem;">Perpustakaan Dokumen</h1>
                <p class="section-subtitle">Telusuri dokumen profil, kurikulum, serta modul pembelajaran dalam format PDF, PPT, dan PPTX.</p>
              </div>
              <a href="#/admin/dokumen" class="btn btn--outline btn--sm">
                ${Utils.icon('settings', 15)} Kelola Dokumen (Admin)
              </a>
            </div>
          </section>

          <section class="section">
            <div class="container">
              <div class="toolbar">
                <div class="search-box">
                  <span class="search-box__icon">${Utils.icon('search', 17)}</span>
                  <input type="search" id="public-doc-search" class="input" placeholder="Cari judul dokumen..." value="${Utils.escapeHtml(this.docFilterState.query)}" aria-label="Cari judul dokumen">
                </div>
                <div class="filter-pills" role="group" aria-label="Filter format dokumen">
                  ${['all', 'pdf', 'ppt', 'pptx'].map((t) => `
                    <button type="button" class="filter-pill ${this.docFilterState.type === t ? 'is-active' : ''}" data-doc-type="${t}">
                      ${t === 'all' ? 'Semua Format' : t.toUpperCase()}
                    </button>
                  `).join('')}
                </div>
              </div>
              <div id="public-doc-grid-container"></div>
            </div>
          </section>
        </main>
        ${this.renderFooter()}
      `;
    },

    renderDocumentsGridOnly() {
      const container = document.getElementById('public-doc-grid-container');
      if (!container) return;

      const q = this.docFilterState.query.trim().toLowerCase();
      const type = this.docFilterState.type;
      const items = DataStore.getPublishedDocuments().filter((doc) => {
        const matchesQuery = !q || doc.title.toLowerCase().includes(q) || (doc.description || '').toLowerCase().includes(q);
        const matchesType = type === 'all' || doc.type === type;
        return matchesQuery && matchesType;
      });

      if (!items.length) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state__icon">${Utils.icon('search-x', 26)}</div>
            <h2 class="empty-state__title">Dokumen Tidak Ditemukan</h2>
            <p class="empty-state__desc">Tidak ada dokumen terbit yang sesuai dengan kata kunci atau filter format yang dipilih.</p>
            <button type="button" class="btn btn--outline btn--sm" id="reset-public-doc-filter">Reset Pencarian &amp; Filter</button>
          </div>
        `;
        document.getElementById('reset-public-doc-filter')?.addEventListener('click', () => {
          this.docFilterState = { query: '', type: 'all' };
          const input = document.getElementById('public-doc-search');
          if (input) input.value = '';
          document.querySelectorAll('[data-doc-type]').forEach((btn) => {
            btn.classList.toggle('is-active', btn.dataset.docType === 'all');
          });
          this.renderDocumentsGridOnly();
        });
      } else {
        container.innerHTML = `<div class="cards-grid">${items.map((d) => this.renderDocumentCard(d)).join('')}</div>`;
      }

      UI.refreshIcons();
      UI.initRevealObserver();
      this.bindMediaButtons(container);
    },

    videoFilterState: { query: '' },

    renderVideosPage() {
      return `
        ${this.renderHeader('#/video')}
        <main id="main-content">
          <section class="page-hero">
            <div class="container page-hero__inner">
              <div>
                <div class="eyebrow eyebrow--orange">${Utils.icon('video', 14)} <span>Dokumentasi Video</span></div>
                <h1 class="section-title" style="margin-bottom:0.35rem;">Galeri Video Pesantren</h1>
                <p class="section-subtitle">Putar video kajian dan pengenalan program yang telah diterbitkan melalui YouTube.</p>
              </div>
              <a href="#/admin/video" class="btn btn--outline btn--sm">
                ${Utils.icon('settings', 15)} Kelola Video (Admin)
              </a>
            </div>
          </section>

          <section class="section">
            <div class="container">
              <div class="toolbar">
                <div class="search-box">
                  <span class="search-box__icon">${Utils.icon('search', 17)}</span>
                  <input type="search" id="public-video-search" class="input" placeholder="Cari judul video..." value="${Utils.escapeHtml(this.videoFilterState.query)}" aria-label="Cari judul video">
                </div>
              </div>
              <div id="public-video-grid-container"></div>
            </div>
          </section>
        </main>
        ${this.renderFooter()}
      `;
    },

    renderVideosGridOnly() {
      const container = document.getElementById('public-video-grid-container');
      if (!container) return;

      const q = this.videoFilterState.query.trim().toLowerCase();
      const items = DataStore.getPublishedVideos().filter((vid) => {
        return !q || vid.title.toLowerCase().includes(q) || (vid.description || '').toLowerCase().includes(q);
      });

      if (!items.length) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state__icon">${Utils.icon('video-off', 26)}</div>
            <h2 class="empty-state__title">Video Tidak Ditemukan</h2>
            <p class="empty-state__desc">Belum ada video terbit yang cocok dengan pencarian Anda.</p>
          </div>
        `;
      } else {
        container.innerHTML = `<div class="cards-grid">${items.map((v) => this.renderVideoCard(v)).join('')}</div>`;
      }

      UI.refreshIcons();
      UI.initRevealObserver();
      this.bindMediaButtons(container);
    },

    openContactModal() {
      UI.Modal.open({
        title: 'Hubungi Kami (Simulasi Demo)',
        size: 'sm',
        bodyHtml: `
          <form id="contact-demo-form" class="form-stack">
            <div class="alert-box alert-box--info">
              ${Utils.icon('info', 18)}
              <div>Ini adalah formulir simulasi pada prototype frontend. Pesan tidak dikirim ke server eksternal.</div>
            </div>
            <div class="form-field">
              <label class="form-label" for="contact-name">Nama Lengkap <span>*</span></label>
              <input id="contact-name" class="input" type="text" required placeholder="Contoh: Siti Rahmawati">
            </div>
            <div class="form-field">
              <label class="form-label" for="contact-email">Email / Kontak <span>*</span></label>
              <input id="contact-email" class="input" type="text" required placeholder="Contoh: nama@email.com">
            </div>
            <div class="form-field">
              <label class="form-label" for="contact-msg">Pesan <span>*</span></label>
              <textarea id="contact-msg" class="textarea" rows="3" required placeholder="Tuliskan pertanyaan atau kebutuhan informasi..."></textarea>
            </div>
          </form>
        `,
        footerHtml: `
          <button type="button" class="btn btn--outline" data-modal-close>Batal</button>
          <button type="submit" form="contact-demo-form" class="btn btn--primary">
            ${Utils.icon('send', 16)} Kirim Pesan Demo
          </button>
        `
      });

      document.getElementById('contact-demo-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        UI.Modal.close();
        UI.Toast.show('Terima kasih! Pesan simulasi Anda telah dicatat pada mode demo.', 'success');
      });
    },

    bindMediaButtons(scope = document) {
      scope.querySelectorAll('[data-preview-doc]').forEach((btn) => {
        btn.addEventListener('click', () => MediaActions.previewDocument(btn.dataset.previewDoc));
      });
      scope.querySelectorAll('[data-download-doc]').forEach((btn) => {
        btn.addEventListener('click', () => MediaActions.downloadDocument(btn.dataset.downloadDoc));
      });
      scope.querySelectorAll('[data-play-video]').forEach((btn) => {
        btn.addEventListener('click', () => MediaActions.playVideo(btn.dataset.playVideo));
      });
    },

    scrollHandler: null,

    bindCommonInteractions(route) {
      // Sticky navbar effect (dikelola satu listener agar tidak menumpuk saat pindah rute)
      if (this.scrollHandler) {
        window.removeEventListener('scroll', this.scrollHandler);
      }
      this.scrollHandler = () => {
        const header = document.getElementById('public-header');
        if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
      };
      this.scrollHandler();
      window.addEventListener('scroll', this.scrollHandler, { passive: true });

      // Mobile drawer
      const mobileNav = document.getElementById('mobile-nav');
      const openBtn = document.getElementById('mobile-nav-open');
      const closeMobile = () => {
        if (!mobileNav) return;
        mobileNav.classList.remove('is-open');
        mobileNav.setAttribute('aria-hidden', 'true');
        openBtn?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      };

      openBtn?.addEventListener('click', () => {
        mobileNav.classList.add('is-open');
        mobileNav.setAttribute('aria-hidden', 'false');
        openBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      });

      document.querySelectorAll('[data-mobile-close]').forEach((el) => {
        el.addEventListener('click', closeMobile);
      });

      // Scroll section buttons
      document.querySelectorAll('[data-scroll-section]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const targetId = btn.dataset.scrollSection;
          if (window.location.hash !== '#/' && window.location.hash !== '') {
            this.pendingScrollSection = targetId;
            Router.navigate('#/');
          } else {
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
          }
        });
      });

      if (this.pendingScrollSection) {
        const target = this.pendingScrollSection;
        this.pendingScrollSection = null;
        window.setTimeout(() => {
          document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }

      // Contact modal triggers
      document.querySelectorAll('[data-open-contact]').forEach((btn) => {
        btn.addEventListener('click', () => this.openContactModal());
      });

      // Social placeholder feedback
      document.querySelectorAll('[data-social-placeholder]').forEach((btn) => {
        btn.addEventListener('click', () => {
          UI.Toast.show(`Tautan ${btn.dataset.socialPlaceholder} masih bersifat placeholder pada prototype demo.`, 'info');
        });
      });

      this.bindMediaButtons(document);

      if (route === '#/dokumen') {
        this.renderDocumentsGridOnly();
        document.getElementById('public-doc-search')?.addEventListener('input', (e) => {
          this.docFilterState.query = e.target.value;
          this.renderDocumentsGridOnly();
        });
        document.querySelectorAll('[data-doc-type]').forEach((btn) => {
          btn.addEventListener('click', () => {
            this.docFilterState.type = btn.dataset.docType;
            document.querySelectorAll('[data-doc-type]').forEach((b) => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            this.renderDocumentsGridOnly();
          });
        });
      }

      if (route === '#/video') {
        this.renderVideosGridOnly();
        document.getElementById('public-video-search')?.addEventListener('input', (e) => {
          this.videoFilterState.query = e.target.value;
          this.renderVideosGridOnly();
        });
      }
    }
  };

  /* ------------------------------------------------------------------------
     10. ADMIN VIEWS (Dashboard, Manajemen Dokumen, Manajemen Video)
     ------------------------------------------------------------------------ */
  const AdminViews = {
    sidebarCollapsed: false,
    docFilters: { query: '', type: 'all', status: 'all' },
    videoFilters: { query: '', status: 'all' },

    renderShell(activeRoute, breadcrumbText, contentHtml) {
      return `
        <div class="admin-shell ${this.sidebarCollapsed ? 'is-collapsed' : ''}" id="admin-shell">
          <div class="admin-sidebar-backdrop" id="admin-sidebar-backdrop"></div>
          <aside class="admin-sidebar" aria-label="Menu Admin">
            <div class="admin-sidebar__brand">
              <div class="admin-sidebar__logo">${PublicViews.brandLogoSvg()}</div>
              <div class="sidebar-hide" style="min-width:0;">
                <div class="admin-sidebar__name">Jalaluddin CMS</div>
                <div class="admin-sidebar__role">Mode Demo Lokal</div>
              </div>
            </div>

            <nav class="admin-nav">
              <a href="#/admin" class="admin-nav__item ${activeRoute === '#/admin' ? 'is-active' : ''}">
                ${Utils.icon('layout-dashboard', 19)}
                <span class="sidebar-hide">Dashboard</span>
              </a>
              <a href="#/admin/pembelajaran" class="admin-nav__item ${activeRoute.startsWith('#/admin/pembelajaran') ? 'is-active' : ''}">
                ${Utils.icon('graduation-cap', 19)}
                <span class="sidebar-hide">Pembelajaran &amp; Kuis</span>
              </a>
              <a href="#/admin/dokumen" class="admin-nav__item ${activeRoute === '#/admin/dokumen' ? 'is-active' : ''}">
                ${Utils.icon('file-text', 19)}
                <span class="sidebar-hide">Manajemen Dokumen</span>
              </a>
              <a href="#/admin/video" class="admin-nav__item ${activeRoute === '#/admin/video' ? 'is-active' : ''}">
                ${Utils.icon('youtube', 19)}
                <span class="sidebar-hide">Manajemen Video</span>
              </a>
              <a href="#/" class="admin-nav__item">
                ${Utils.icon('external-link', 19)}
                <span class="sidebar-hide">Lihat Website</span>
              </a>
            </nav>

            <div class="admin-sidebar__footer sidebar-hide">
              <div class="demo-notice-box">
                <strong>Catatan Simulasi:</strong> Perubahan disimpan lokal di browser (localStorage &amp; IndexedDB) tanpa backend server.
              </div>
              <button type="button" class="btn btn--outline btn--sm" id="reset-demo-btn" style="background:rgba(255,255,255,0.08);color:var(--white);border-color:rgba(255,255,255,0.2);">
                ${Utils.icon('rotate-ccw', 15)} Reset Data Demo
              </button>
            </div>
          </aside>

          <div class="admin-main">
            <header class="admin-topbar">
              <div class="admin-topbar__left">
                <button type="button" class="icon-btn" id="admin-sidebar-toggle" aria-label="Buka atau lipat sidebar">
                  ${Utils.icon('panel-left', 18)}
                </button>
                <nav class="breadcrumb" aria-label="Breadcrumb">
                  <a href="#/admin">Admin</a>
                  <span>/</span>
                  <span class="breadcrumb__current">${Utils.escapeHtml(breadcrumbText)}</span>
                </nav>
              </div>
              <div class="admin-topbar__right">
                <span class="badge badge--demo">Mode Demo</span>
                <div class="admin-profile-pill">
                  <span class="admin-profile-pill__avatar">AD</span>
                  <span>Admin Demo</span>
                </div>
              </div>
            </header>

            <main id="main-content" class="admin-content">
              ${contentHtml}
            </main>
          </div>
        </div>
      `;
    },

    renderDashboard() {
      const stats = DataStore.getStats();
      const pubPct = stats.totalAll > 0 ? Math.round((stats.publishedCount / stats.totalAll) * 100) : 0;
      const draftPct = stats.totalAll > 0 ? 100 - pubPct : 0;

      const body = `
        <div class="admin-page-head">
          <div>
            <h1>Ringkasan Dashboard</h1>
            <p class="form-hint">Statistik dihitung langsung dari data JSON &amp; penyimpanan lokal browser Anda.</p>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:0.65rem;">
            <a href="#/admin/pembelajaran" class="btn btn--outline btn--sm">
              ${Utils.icon('graduation-cap', 16)} Kelola Pembelajaran
            </a>
            <button type="button" class="btn btn--primary btn--sm" id="quick-add-doc">
              ${Utils.icon('file-plus', 16)} Tambah Dokumen
            </button>
            <button type="button" class="btn btn--green btn--sm" id="quick-add-video">
              ${Utils.icon('video', 16)} Tambah Video
            </button>
          </div>
        </div>

        ${stats.testsNeedingAdjustmentCount > 0 ? `
          <div class="alert-box alert-box--warn" style="margin-bottom:1.25rem;justify-content:space-between;align-items:center;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:0.65rem;">
              ${Utils.icon('alert-triangle', 19)}
              <div>
                <strong>Perhatian Penyesuaian V2.1:</strong> Terdapat <strong>${stats.testsNeedingAdjustmentCount}</strong> tes lama yang masih memiliki soal non-pilihan-ganda dan berstatus <em>Perlu Penyesuaian</em>.
              </div>
            </div>
            <a href="#/admin/pembelajaran" class="btn btn--primary btn--sm">
              ${Utils.icon('sliders', 15)} Sesuaikan di Quiz Builder
            </a>
          </div>
        ` : ''}

        <div class="stats-grid">
          <article class="stat-card">
            <div>
              <div class="stat-card__label">Total Dokumen</div>
              <div class="stat-card__value">${stats.totalDocuments}</div>
            </div>
            <div class="stat-card__icon" style="background:var(--teal-light);color:var(--teal-main);">
              ${Utils.icon('files', 24)}
            </div>
          </article>
          <article class="stat-card">
            <div>
              <div class="stat-card__label">Total Video</div>
              <div class="stat-card__value">${stats.totalVideos}</div>
            </div>
            <div class="stat-card__icon" style="background:var(--purple-light);color:var(--purple-main);">
              ${Utils.icon('film', 24)}
            </div>
          </article>
          <article class="stat-card">
            <div>
              <div class="stat-card__label">Konten Terbit</div>
              <div class="stat-card__value">${stats.publishedCount}</div>
            </div>
            <div class="stat-card__icon" style="background:var(--green-100);color:var(--green-700);">
              ${Utils.icon('check-circle-2', 24)}
            </div>
          </article>
          <article class="stat-card">
            <div>
              <div class="stat-card__label">Konten Draft</div>
              <div class="stat-card__value">${stats.draftCount}</div>
            </div>
            <div class="stat-card__icon" style="background:var(--orange-100);color:var(--orange-800);">
              ${Utils.icon('clock', 24)}
            </div>
          </article>
        </div>

        <h2 style="font-size:1.05rem;margin-bottom:0.85rem;">Statistik Evaluasi &amp; Mini LMS</h2>
        <div class="stats-grid">
          <article class="stat-card">
            <div>
              <div class="stat-card__label">Total Pre-Test</div>
              <div class="stat-card__value">${stats.totalPreTests}</div>
            </div>
            <div class="stat-card__icon" style="background:var(--teal-light);color:var(--teal-main);">
              ${Utils.icon('clipboard-list', 22)}
            </div>
          </article>
          <article class="stat-card">
            <div>
              <div class="stat-card__label">Total Post-Test</div>
              <div class="stat-card__value">${stats.totalPostTests}</div>
            </div>
            <div class="stat-card__icon" style="background:var(--orange-50);color:var(--orange-800);">
              ${Utils.icon('award', 22)}
            </div>
          </article>
          <article class="stat-card">
            <div>
              <div class="stat-card__label">Total Soal</div>
              <div class="stat-card__value">${stats.totalQuestions}</div>
            </div>
            <div class="stat-card__icon" style="background:var(--green-100);color:var(--green-700);">
              ${Utils.icon('help-circle', 22)}
            </div>
          </article>
          <article class="stat-card">
            <div>
              <div class="stat-card__label">Total Pengerjaan</div>
              <div class="stat-card__value">${stats.totalAttempts}</div>
            </div>
            <div class="stat-card__icon" style="background:var(--purple-light);color:var(--purple-main);">
              ${Utils.icon('users', 22)}
            </div>
          </article>
        </div>

        <div class="admin-grid-2">
          <section class="panel">
            <div class="panel__head">
              <h2 class="panel__title">Konten Terbaru</h2>
              <a href="#/admin/dokumen" class="btn btn--ghost btn--sm">Kelola Semua</a>
            </div>
            ${stats.recentItems.length ? `
              <div class="recent-list">
                ${stats.recentItems.map((item) => `
                  <div class="recent-item">
                    <div class="recent-item__info">
                      <div class="recent-item__title">${Utils.escapeHtml(item.title)}</div>
                      <div class="recent-item__meta">
                        ${item.kind === 'document' ? `Dokumen (${Utils.escapeHtml((item.type || '').toUpperCase())})` : 'Video YouTube'}
                        &bull; ${Utils.formatDate(item.createdAt)}
                      </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:0.5rem;flex-shrink:0;">
                      <span class="badge ${item.status === 'published' ? 'badge--green' : 'badge--neutral'}">
                        ${item.status === 'published' ? 'Terbit' : 'Draft'}
                      </span>
                      <a href="${item.kind === 'document' ? '#/admin/dokumen' : '#/admin/video'}" class="icon-btn" aria-label="Buka di manajemen">
                        ${Utils.icon('arrow-right', 15)}
                      </a>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <p class="form-hint">Belum ada konten tersimpan.</p>
            `}
          </section>

          <section class="panel">
            <div class="panel__head">
              <h2 class="panel__title">Ringkasan Publikasi</h2>
            </div>

            <div class="summary-metric">
              <div class="summary-metric__row">
                <span>Terbit di Website Publik</span>
                <strong>${stats.publishedCount} dari ${stats.totalAll} (${pubPct}%)</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width:${pubPct}%"></div>
              </div>
            </div>

            <div class="summary-metric">
              <div class="summary-metric__row">
                <span>Tersimpan sebagai Draft</span>
                <strong>${stats.draftCount} dari ${stats.totalAll} (${draftPct}%)</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill progress-fill--orange" style="width:${draftPct}%"></div>
              </div>
            </div>

            <div style="margin-top:1.4rem;padding-top:1rem;border-top:1px solid var(--border-light);font-size:0.84rem;color:var(--text-secondary);display:flex;flex-direction:column;gap:0.45rem;">
              <div><strong>Dokumen Terbit:</strong> ${stats.publishedDocuments} / ${stats.totalDocuments}</div>
              <div><strong>Video Terbit:</strong> ${stats.publishedVideos} / ${stats.totalVideos}</div>
              <div id="storage-usage-line"><strong>Penyimpanan Browser:</strong> Memeriksa...</div>
            </div>
          </section>
        </div>
      `;

      return this.renderShell('#/admin', 'Dashboard', body);
    },

    renderDocumentManager() {
      const body = `
        <div class="admin-page-head">
          <div>
            <h1>Manajemen Dokumen</h1>
            <p class="form-hint">Unggah berkas PDF, PPT, atau PPTX (maksimal 10 MB per berkas) ke penyimpanan lokal IndexedDB.</p>
          </div>
          <button type="button" class="btn btn--primary" id="btn-add-document">
            ${Utils.icon('file-plus', 17)} Tambah Dokumen
          </button>
        </div>

        <div class="panel">
          <div class="toolbar" style="margin-bottom:1.25rem;">
            <div class="search-box">
              <span class="search-box__icon">${Utils.icon('search', 17)}</span>
              <input type="search" id="admin-doc-search" class="input" placeholder="Cari judul dokumen..." value="${Utils.escapeHtml(this.docFilters.query)}">
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:0.6rem;">
              <select id="admin-doc-type" class="select" style="width:auto;min-width:140px;" aria-label="Filter jenis file">
                <option value="all" ${this.docFilters.type === 'all' ? 'selected' : ''}>Semua Format</option>
                <option value="pdf" ${this.docFilters.type === 'pdf' ? 'selected' : ''}>PDF</option>
                <option value="ppt" ${this.docFilters.type === 'ppt' ? 'selected' : ''}>PPT</option>
                <option value="pptx" ${this.docFilters.type === 'pptx' ? 'selected' : ''}>PPTX</option>
              </select>
              <select id="admin-doc-status" class="select" style="width:auto;min-width:140px;" aria-label="Filter status">
                <option value="all" ${this.docFilters.status === 'all' ? 'selected' : ''}>Semua Status</option>
                <option value="published" ${this.docFilters.status === 'published' ? 'selected' : ''}>Terbit</option>
                <option value="draft" ${this.docFilters.status === 'draft' ? 'selected' : ''}>Draft</option>
              </select>
            </div>
          </div>

          <div id="admin-doc-table-wrap"></div>
        </div>
      `;

      return this.renderShell('#/admin/dokumen', 'Manajemen Dokumen', body);
    },

    renderDocumentTable() {
      const wrap = document.getElementById('admin-doc-table-wrap');
      if (!wrap) return;

      const q = this.docFilters.query.trim().toLowerCase();
      const rows = DataStore.getDocuments().filter((doc) => {
        const matchQ = !q || doc.title.toLowerCase().includes(q) || (doc.category || '').toLowerCase().includes(q);
        const matchType = this.docFilters.type === 'all' || doc.type === this.docFilters.type;
        const matchStatus = this.docFilters.status === 'all' || doc.status === this.docFilters.status;
        return matchQ && matchType && matchStatus;
      });

      if (!rows.length) {
        wrap.innerHTML = `
          <div class="empty-state">
            <div class="empty-state__icon">${Utils.icon('folder-x', 26)}</div>
            <h2 class="empty-state__title">Tidak Ada Dokumen</h2>
            <p class="empty-state__desc">Belum ada dokumen yang sesuai filter saat ini, atau Anda belum menambahkan dokumen.</p>
          </div>
        `;
        UI.refreshIcons();
        return;
      }

      wrap.innerHTML = `
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Judul Dokumen</th>
                <th>Jenis</th>
                <th>Ukuran</th>
                <th>Tanggal Dibuat</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((doc) => `
                <tr>
                  <td>
                    <div style="font-weight:600;color:var(--green-800);">${Utils.escapeHtml(doc.title)}</div>
                    <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.25rem;">
                      <span class="badge ${Utils.getCategoryBadgeClass(doc.category)}">${Utils.escapeHtml(doc.category)}</span>
                      ${!doc.fileId ? '<span class="badge badge--demo">Contoh (Tanpa File)</span>' : `<span class="form-hint">${Utils.escapeHtml(doc.fileName)}</span>`}
                    </div>
                  </td>
                  <td><span class="badge badge--neutral">${Utils.escapeHtml((doc.type || '').toUpperCase())}</span></td>
                  <td>${doc.fileId ? Utils.formatBytes(doc.fileSize) : '<span class="form-hint">Contoh</span>'}</td>
                  <td>${Utils.formatDate(doc.createdAt)}</td>
                  <td>
                    <button type="button" class="status-toggle ${doc.status === 'published' ? 'status-toggle--published' : 'status-toggle--draft'}" data-toggle-doc="${Utils.escapeHtml(doc.id)}" title="Klik untuk ubah status">
                      ${Utils.icon(doc.status === 'published' ? 'check-circle-2' : 'file-edit', 14)}
                      <span>${doc.status === 'published' ? 'Terbit' : 'Draft'}</span>
                    </button>
                  </td>
                  <td>
                    <div class="table-actions">
                      <button type="button" class="icon-btn" data-admin-preview-doc="${Utils.escapeHtml(doc.id)}" title="Lihat / Pratinjau" aria-label="Lihat dokumen">
                        ${Utils.icon('eye', 16)}
                      </button>
                      ${doc.fileId ? `
                        <button type="button" class="icon-btn" data-admin-download-doc="${Utils.escapeHtml(doc.id)}" title="Unduh Berkas" aria-label="Unduh dokumen">
                          ${Utils.icon('download', 16)}
                        </button>
                      ` : ''}
                      <button type="button" class="icon-btn" data-edit-doc="${Utils.escapeHtml(doc.id)}" title="Edit Dokumen" aria-label="Edit dokumen">
                        ${Utils.icon('pencil', 16)}
                      </button>
                      <button type="button" class="icon-btn icon-btn--danger" data-delete-doc="${Utils.escapeHtml(doc.id)}" title="Hapus Dokumen" aria-label="Hapus dokumen">
                        ${Utils.icon('trash-2', 16)}
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      UI.refreshIcons();

      wrap.querySelectorAll('[data-toggle-doc]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const updated = DataStore.toggleDocumentStatus(btn.dataset.toggleDoc);
          if (updated) {
            UI.Toast.show(`Status dokumen diubah menjadi "${updated.status === 'published' ? 'Terbit' : 'Draft'}".`, 'success');
            this.renderDocumentTable();
          }
        });
      });

      wrap.querySelectorAll('[data-admin-preview-doc]').forEach((btn) => {
        btn.addEventListener('click', () => MediaActions.previewDocument(btn.dataset.adminPreviewDoc));
      });

      wrap.querySelectorAll('[data-admin-download-doc]').forEach((btn) => {
        btn.addEventListener('click', () => MediaActions.downloadDocument(btn.dataset.adminDownloadDoc));
      });

      wrap.querySelectorAll('[data-edit-doc]').forEach((btn) => {
        btn.addEventListener('click', () => this.openDocumentFormModal(btn.dataset.editDoc));
      });

      wrap.querySelectorAll('[data-delete-doc]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const doc = DataStore.getDocumentById(btn.dataset.deleteDoc);
          if (!doc) return;
          UI.Confirm.open({
            title: 'Hapus Dokumen?',
            message: `Dokumen "${doc.title}" beserta berkas lokalnya di IndexedDB (jika ada) akan dihapus permanen dari browser ini dan tidak lagi tampil di website publik.`,
            confirmLabel: 'Ya, Hapus Permanen',
            danger: true,
            onConfirm: async () => {
              await DataStore.deleteDocument(doc.id);
              UI.Toast.show('Dokumen berhasil dihapus.', 'success');
              this.renderDocumentTable();
            }
          });
        });
      });
    },

    openDocumentFormModal(docId = null) {
      const existing = docId ? DataStore.getDocumentById(docId) : null;
      const isEdit = Boolean(existing);
      let selectedFile = null;

      UI.Modal.open({
        title: isEdit ? 'Edit Dokumen' : 'Tambah Dokumen Baru',
        size: 'md',
        bodyHtml: `
          <form id="doc-form" class="form-stack" novalidate>
            <div class="alert-box alert-box--info">
              ${Utils.icon('hard-drive', 18)}
              <div>Berkas disimpan secara lokal di browser ini melalui <strong>IndexedDB</strong> (bukan diunggah ke server). Data hanya tersedia di perangkat dan browser ini.</div>
            </div>

            <div class="form-field">
              <label class="form-label" for="doc-title">Judul Dokumen <span>*</span></label>
              <input id="doc-title" class="input" type="text" required value="${Utils.escapeHtml(existing?.title || '')}" placeholder="Contoh: Modul Kaderisasi Nazhir Wakaf 2026">
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="doc-category">Kategori</label>
                <select id="doc-category" class="select">
                  ${CONFIG.DOC_CATEGORIES.map((c) => `<option value="${c}" ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-field">
                <label class="form-label" for="doc-status">Status Publikasi</label>
                <select id="doc-status" class="select">
                  <option value="draft" ${existing?.status === 'draft' ? 'selected' : ''}>Draft (Disembunyikan)</option>
                  <option value="published" ${existing?.status === 'published' ? 'selected' : ''}>Terbit (Tampil Publik)</option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" for="doc-desc">Deskripsi</label>
              <textarea id="doc-desc" class="textarea" rows="3" placeholder="Ringkasan singkat isi dokumen...">${Utils.escapeHtml(existing?.description || '')}</textarea>
            </div>

            <div class="form-field">
              <label class="form-label">Upload File (PDF, PPT, PPTX &bull; Maks 10 MB) ${isEdit ? '' : '<span>*</span>'}</label>
              <div class="dropzone" id="doc-dropzone">
                <input type="file" id="doc-file-input" class="dropzone__input" accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation">
                <div class="dropzone__icon">${Utils.icon('upload-cloud', 22)}</div>
                <div style="font-weight:600;color:var(--green-800);font-size:0.93rem;">
                  Seret &amp; lepas file ke sini, atau klik untuk memilih
                </div>
                <div class="form-hint" style="margin-top:0.25rem;">
                  ${isEdit && existing.fileId ? `File saat ini: ${Utils.escapeHtml(existing.fileName)} (${Utils.formatBytes(existing.fileSize)}). Pilih file baru jika ingin mengganti.` : 'Mendukung format .pdf, .ppt, .pptx hingga 10 MB.'}
                </div>
                <div id="doc-file-preview"></div>
              </div>
              <div id="doc-file-error" class="form-error" style="display:none;"></div>
              <div id="doc-upload-progress" style="display:none;margin-top:0.5rem;">
                <div class="summary-metric__row">
                  <span>Menyimpan ke IndexedDB lokal...</span>
                  <strong id="doc-progress-pct">0%</strong>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" id="doc-progress-bar" style="width:0%"></div>
                </div>
              </div>
            </div>
          </form>
        `,
        footerHtml: `
          <button type="button" class="btn btn--outline" data-modal-close>Batal</button>
          <button type="submit" form="doc-form" id="doc-submit-btn" class="btn btn--primary">
            ${Utils.icon('save', 16)} ${isEdit ? 'Simpan Perubahan' : 'Simpan Dokumen'}
          </button>
        `
      });

      const dropzone = document.getElementById('doc-dropzone');
      const fileInput = document.getElementById('doc-file-input');
      const previewEl = document.getElementById('doc-file-preview');
      const errorEl = document.getElementById('doc-file-error');

      const handlePickedFile = (file) => {
        if (!file) return;
        const check = ValidationService.validateDocumentFile(file);
        if (!check.valid) {
          selectedFile = null;
          errorEl.textContent = check.error;
          errorEl.style.display = 'block';
          previewEl.innerHTML = '';
          return;
        }
        errorEl.style.display = 'none';
        selectedFile = file;
        previewEl.innerHTML = `
          <div class="file-preview-box">
            <div style="min-width:0;">
              <div style="font-weight:600;font-size:0.87rem;color:var(--green-800);word-break:break-all;">${Utils.escapeHtml(check.fileName)}</div>
              <div class="form-hint">${check.type.toUpperCase()} &bull; ${Utils.formatBytes(check.fileSize)}</div>
            </div>
            <span class="badge badge--green">Siap</span>
          </div>
        `;
      };

      fileInput?.addEventListener('change', (e) => handlePickedFile(e.target.files[0]));
      dropzone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('is-dragover');
      });
      dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('is-dragover'));
      dropzone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('is-dragover');
        if (e.dataTransfer?.files?.length) {
          handlePickedFile(e.dataTransfer.files[0]);
        }
      });

      document.getElementById('doc-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('doc-title').value.trim();
        const category = document.getElementById('doc-category').value;
        const status = document.getElementById('doc-status').value;
        const description = document.getElementById('doc-desc').value;

        if (!title) {
          UI.Toast.show('Judul dokumen wajib diisi.', 'error');
          document.getElementById('doc-title').focus();
          return;
        }

        if (!isEdit && !selectedFile) {
          errorEl.textContent = 'Upload berkas wajib dilakukan saat menambah dokumen baru.';
          errorEl.style.display = 'block';
          return;
        }

        const submitBtn = document.getElementById('doc-submit-btn');
        const progBox = document.getElementById('doc-upload-progress');
        const progBar = document.getElementById('doc-progress-bar');
        const progPct = document.getElementById('doc-progress-pct');

        submitBtn.disabled = true;
        if (selectedFile) progBox.style.display = 'block';

        const onProgress = (pct) => {
          if (progBar) progBar.style.width = `${pct}%`;
          if (progPct) progPct.textContent = `${pct}%`;
        };

        try {
          if (isEdit) {
            await DataStore.updateDocument(existing.id, { title, category, status, description }, selectedFile, onProgress);
            UI.Toast.show('Perubahan dokumen berhasil disimpan.', 'success');
          } else {
            await DataStore.addDocument({ title, category, status, description }, selectedFile, onProgress);
            UI.Toast.show('Dokumen baru berhasil disimpan secara lokal.', 'success');
          }
          UI.Modal.close();
          Router.renderCurrent();
        } catch (err) {
          submitBtn.disabled = false;
          errorEl.textContent = err.message || 'Gagal menyimpan dokumen.';
          errorEl.style.display = 'block';
          UI.Toast.show(err.message || 'Gagal menyimpan dokumen.', 'error');
        }
      });
    },

    renderVideoManager() {
      const body = `
        <div class="admin-page-head">
          <div>
            <h1>Manajemen Video YouTube</h1>
            <p class="form-hint">Kelola tautan video YouTube dengan validasi URL otomatis dan kontrol status publikasi.</p>
          </div>
          <button type="button" class="btn btn--primary" id="btn-add-video">
            ${Utils.icon('video', 17)} Tambah Video
          </button>
        </div>

        <div class="panel">
          <div class="toolbar" style="margin-bottom:1.25rem;">
            <div class="search-box">
              <span class="search-box__icon">${Utils.icon('search', 17)}</span>
              <input type="search" id="admin-video-search" class="input" placeholder="Cari judul video..." value="${Utils.escapeHtml(this.videoFilters.query)}">
            </div>
            <select id="admin-video-status" class="select" style="width:auto;min-width:150px;" aria-label="Filter status video">
              <option value="all" ${this.videoFilters.status === 'all' ? 'selected' : ''}>Semua Status</option>
              <option value="published" ${this.videoFilters.status === 'published' ? 'selected' : ''}>Terbit</option>
              <option value="draft" ${this.videoFilters.status === 'draft' ? 'selected' : ''}>Draft</option>
            </select>
          </div>

          <div id="admin-video-table-wrap"></div>
        </div>
      `;

      return this.renderShell('#/admin/video', 'Manajemen Video', body);
    },

    renderVideoTable() {
      const wrap = document.getElementById('admin-video-table-wrap');
      if (!wrap) return;

      const q = this.videoFilters.query.trim().toLowerCase();
      const rows = DataStore.getVideos().filter((vid) => {
        const matchQ = !q || vid.title.toLowerCase().includes(q) || (vid.category || '').toLowerCase().includes(q);
        const matchStatus = this.videoFilters.status === 'all' || vid.status === this.videoFilters.status;
        return matchQ && matchStatus;
      });

      if (!rows.length) {
        wrap.innerHTML = `
          <div class="empty-state">
            <div class="empty-state__icon">${Utils.icon('video-off', 26)}</div>
            <h2 class="empty-state__title">Tidak Ada Video</h2>
            <p class="empty-state__desc">Belum ada video yang cocok dengan filter atau belum ada video yang ditambahkan.</p>
          </div>
        `;
        UI.refreshIcons();
        return;
      }

      wrap.innerHTML = `
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Judul Video</th>
                <th>URL YouTube</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((vid) => `
                <tr>
                  <td>
                    <div class="thumb-mini">
                      ${vid.youtubeId
                        ? `<img src="https://i.ytimg.com/vi/${encodeURIComponent(vid.youtubeId)}/hqdefault.jpg" alt="Thumbnail ${Utils.escapeHtml(vid.title)}">`
                        : Utils.icon('video-off', 18)}
                    </div>
                  </td>
                  <td>
                    <div style="font-weight:600;color:var(--green-800);">${Utils.escapeHtml(vid.title)}</div>
                    <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.25rem;">
                      <span class="badge ${Utils.getCategoryBadgeClass(vid.category)}">${Utils.escapeHtml(vid.category)}</span>
                      ${!vid.youtubeId ? '<span class="badge badge--demo">Contoh (Belum Ada URL)</span>' : ''}
                    </div>
                  </td>
                  <td>
                    ${vid.youtubeUrl
                      ? `<a href="${Utils.escapeHtml(vid.youtubeUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--teal-main);font-size:0.83rem;text-decoration:underline;">${Utils.escapeHtml(vid.youtubeUrl)}</a>`
                      : '<span class="form-hint">Belum diisi</span>'}
                  </td>
                  <td>${Utils.formatDate(vid.createdAt)}</td>
                  <td>
                    <button type="button" class="status-toggle ${vid.status === 'published' ? 'status-toggle--published' : 'status-toggle--draft'}" data-toggle-vid="${Utils.escapeHtml(vid.id)}">
                      ${Utils.icon(vid.status === 'published' ? 'check-circle-2' : 'file-edit', 14)}
                      <span>${vid.status === 'published' ? 'Terbit' : 'Draft'}</span>
                    </button>
                  </td>
                  <td>
                    <div class="table-actions">
                      ${vid.youtubeId ? `
                        <button type="button" class="icon-btn" data-admin-play-vid="${Utils.escapeHtml(vid.id)}" title="Putar Video" aria-label="Putar video">
                          ${Utils.icon('play', 16)}
                        </button>
                      ` : ''}
                      <button type="button" class="icon-btn" data-edit-vid="${Utils.escapeHtml(vid.id)}" title="Edit Video" aria-label="Edit video">
                        ${Utils.icon('pencil', 16)}
                      </button>
                      <button type="button" class="icon-btn icon-btn--danger" data-delete-vid="${Utils.escapeHtml(vid.id)}" title="Hapus Video" aria-label="Hapus video">
                        ${Utils.icon('trash-2', 16)}
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      UI.refreshIcons();

      wrap.querySelectorAll('[data-toggle-vid]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const updated = DataStore.toggleVideoStatus(btn.dataset.toggleVid);
          if (updated) {
            UI.Toast.show(`Status video diubah menjadi "${updated.status === 'published' ? 'Terbit' : 'Draft'}".`, 'success');
            this.renderVideoTable();
          }
        });
      });

      wrap.querySelectorAll('[data-admin-play-vid]').forEach((btn) => {
        btn.addEventListener('click', () => MediaActions.playVideo(btn.dataset.adminPlayVid));
      });

      wrap.querySelectorAll('[data-edit-vid]').forEach((btn) => {
        btn.addEventListener('click', () => this.openVideoFormModal(btn.dataset.editVid));
      });

      wrap.querySelectorAll('[data-delete-vid]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const vid = DataStore.getVideoById(btn.dataset.deleteVid);
          if (!vid) return;
          UI.Confirm.open({
            title: 'Hapus Video?',
            message: `Video "${vid.title}" akan dihapus dari daftar lokal dan tidak lagi muncul di website publik.`,
            confirmLabel: 'Ya, Hapus',
            danger: true,
            onConfirm: () => {
              DataStore.deleteVideo(vid.id);
              UI.Toast.show('Video berhasil dihapus.', 'success');
              this.renderVideoTable();
            }
          });
        });
      });
    },

    openVideoFormModal(videoId = null) {
      const existing = videoId ? DataStore.getVideoById(videoId) : null;
      const isEdit = Boolean(existing);

      UI.Modal.open({
        title: isEdit ? 'Edit Video YouTube' : 'Tambah Video YouTube',
        size: 'md',
        bodyHtml: `
          <form id="video-form" class="form-stack" novalidate>
            <div class="form-field">
              <label class="form-label" for="vid-title">Judul Video <span>*</span></label>
              <input id="vid-title" class="input" type="text" required value="${Utils.escapeHtml(existing?.title || '')}" placeholder="Contoh: Kajian Fiqih Wakaf Produktif">
            </div>

            <div class="form-field">
              <label class="form-label" for="vid-url">URL YouTube <span>*</span></label>
              <input id="vid-url" class="input" type="url" value="${Utils.escapeHtml(existing?.youtubeUrl || '')}" placeholder="https://www.youtube.com/watch?v=VIDEO_ID">
              <span class="form-hint">Mendukung format youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/..., dan youtube.com/shorts/...</span>
              <div id="vid-url-error" class="form-error" style="display:none;"></div>
              <div id="vid-thumb-preview"></div>
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="vid-category">Kategori</label>
                <select id="vid-category" class="select">
                  ${CONFIG.VIDEO_CATEGORIES.map((c) => `<option value="${c}" ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
              <div class="form-field">
                <label class="form-label" for="vid-status">Status Publikasi</label>
                <select id="vid-status" class="select">
                  <option value="draft" ${existing?.status === 'draft' ? 'selected' : ''}>Draft (Disembunyikan)</option>
                  <option value="published" ${existing?.status === 'published' ? 'selected' : ''}>Terbit (Tampil Publik)</option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" for="vid-desc">Deskripsi</label>
              <textarea id="vid-desc" class="textarea" rows="3" placeholder="Penjelasan singkat mengenai isi video...">${Utils.escapeHtml(existing?.description || '')}</textarea>
            </div>
          </form>
        `,
        footerHtml: `
          <button type="button" class="btn btn--outline" data-modal-close>Batal</button>
          <button type="submit" form="video-form" class="btn btn--primary">
            ${Utils.icon('save', 16)} ${isEdit ? 'Simpan Perubahan' : 'Simpan Video'}
          </button>
        `
      });

      const urlInput = document.getElementById('vid-url');
      const urlErr = document.getElementById('vid-url-error');
      const thumbBox = document.getElementById('vid-thumb-preview');

      const updatePreview = (showErrorWhenEmpty = false) => {
        const val = urlInput.value.trim();
        if (!val) {
          thumbBox.innerHTML = '';
          if (showErrorWhenEmpty) {
            urlErr.textContent = 'URL YouTube wajib diisi.';
            urlErr.style.display = 'block';
          } else {
            urlErr.style.display = 'none';
          }
          return null;
        }
        const parsed = ValidationService.parseYouTubeUrl(val);
        if (!parsed.valid) {
          thumbBox.innerHTML = '';
          urlErr.textContent = parsed.error;
          urlErr.style.display = 'block';
          return null;
        }
        urlErr.style.display = 'none';
        thumbBox.innerHTML = `
          <div class="yt-preview-box">
            <img src="${parsed.thumbnailUrl}" alt="Pratinjau thumbnail YouTube">
            <div class="yt-preview-box__meta">
              ${Utils.icon('check-circle-2', 15)}
              <span>URL Valid &bull; ID Video: <strong>${Utils.escapeHtml(parsed.videoId)}</strong></span>
            </div>
          </div>
        `;
        UI.refreshIcons();
        return parsed;
      };

      updatePreview(false);
      urlInput?.addEventListener('input', () => updatePreview(false));

      document.getElementById('video-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('vid-title').value.trim();
        const category = document.getElementById('vid-category').value;
        const status = document.getElementById('vid-status').value;
        const description = document.getElementById('vid-desc').value;
        const youtubeUrl = urlInput.value.trim();

        if (!title) {
          UI.Toast.show('Judul video wajib diisi.', 'error');
          document.getElementById('vid-title').focus();
          return;
        }

        const parsed = updatePreview(true);
        if (!parsed) {
          urlInput.focus();
          return;
        }

        try {
          if (isEdit) {
            DataStore.updateVideo(existing.id, { title, category, status, description, youtubeUrl });
            UI.Toast.show('Perubahan video berhasil disimpan.', 'success');
          } else {
            DataStore.addVideo({ title, category, status, description, youtubeUrl });
            UI.Toast.show('Video YouTube berhasil ditambahkan.', 'success');
          }
          UI.Modal.close();
          Router.renderCurrent();
        } catch (err) {
          urlErr.textContent = err.message;
          urlErr.style.display = 'block';
          UI.Toast.show(err.message, 'error');
        }
      });
    },

    async bindInteractions(route) {
      const shell = document.getElementById('admin-shell');
      const toggleBtn = document.getElementById('admin-sidebar-toggle');
      const backdrop = document.getElementById('admin-sidebar-backdrop');

      toggleBtn?.addEventListener('click', () => {
        if (window.innerWidth < 960) {
          shell?.classList.toggle('is-mobile-open');
        } else {
          this.sidebarCollapsed = !this.sidebarCollapsed;
          shell?.classList.toggle('is-collapsed', this.sidebarCollapsed);
        }
      });

      backdrop?.addEventListener('click', () => {
        shell?.classList.remove('is-mobile-open');
      });

      document.getElementById('reset-demo-btn')?.addEventListener('click', () => {
        UI.Confirm.open({
          title: 'Reset Data Demo?',
          message: 'Seluruh dokumen unggahan di IndexedDB dan perubahan metadata di browser ini akan dihapus serta dikembalikan ke data contoh awal.',
          confirmLabel: 'Ya, Reset Data Demo',
          danger: true,
          onConfirm: async () => {
            await DataStore.resetDemo();
            UI.Toast.show('Data demo berhasil dikembalikan ke kondisi awal.', 'success');
            Router.renderCurrent();
          }
        });
      });

      if (route === '#/admin') {
        document.getElementById('quick-add-doc')?.addEventListener('click', () => {
          this.openDocumentFormModal();
        });
        document.getElementById('quick-add-video')?.addEventListener('click', () => {
          this.openVideoFormModal();
        });
        const usageEl = document.getElementById('storage-usage-line');
        if (usageEl) {
          const est = await IndexedDBService.estimateStorage();
          usageEl.innerHTML = est.supported
            ? `<strong>Penyimpanan Browser:</strong> ${Utils.formatBytes(est.usage)} terpakai`
            : `<strong>Penyimpanan Browser:</strong> Lokal (IndexedDB &amp; localStorage)`;
        }
      }

      if (route === '#/admin/dokumen') {
        this.renderDocumentTable();
        document.getElementById('btn-add-document')?.addEventListener('click', () => this.openDocumentFormModal());
        document.getElementById('admin-doc-search')?.addEventListener('input', (e) => {
          this.docFilters.query = e.target.value;
          this.renderDocumentTable();
        });
        document.getElementById('admin-doc-type')?.addEventListener('change', (e) => {
          this.docFilters.type = e.target.value;
          this.renderDocumentTable();
        });
        document.getElementById('admin-doc-status')?.addEventListener('change', (e) => {
          this.docFilters.status = e.target.value;
          this.renderDocumentTable();
        });
      }

      if (route === '#/admin/video') {
        this.renderVideoTable();
        document.getElementById('btn-add-video')?.addEventListener('click', () => this.openVideoFormModal());
        document.getElementById('admin-video-search')?.addEventListener('input', (e) => {
          this.videoFilters.query = e.target.value;
          this.renderVideoTable();
        });
        document.getElementById('admin-video-status')?.addEventListener('change', (e) => {
          this.videoFilters.status = e.target.value;
          this.renderVideoTable();
        });
      }
    }
  };

  /* ------------------------------------------------------------------------
     11. ROUTER (Hash Routing Tanpa Backend + Mendukung Tombol Kembali Browser)
     ------------------------------------------------------------------------ */
  const Router = {
    routes: {
      '#/': () => PublicViews.renderHome(),
      '#/dokumen': () => PublicViews.renderDocumentsPage(),
      '#/video': () => PublicViews.renderVideosPage(),
      '#/admin': () => AdminViews.renderDashboard(),
      '#/admin/dokumen': () => AdminViews.renderDocumentManager(),
      '#/admin/video': () => AdminViews.renderVideoManager()
    },

    dynamicRoutes: [],

    registerDynamicRoute(pattern, renderFn, bindFn = null) {
      this.dynamicRoutes.push({ pattern, renderFn, bindFn });
    },

    matchDynamic(cleanHash) {
      for (const entry of this.dynamicRoutes) {
        const match = cleanHash.match(entry.pattern);
        if (match) return { entry, match };
      }
      return null;
    },

    normalizeHash(rawHash) {
      if (!rawHash || rawHash === '#') return '#/';
      const clean = rawHash.replace(/\/+$/, '');
      if (clean === '#') return '#/';
      if (this.routes[clean] || this.matchDynamic(clean)) return clean;
      return '#/';
    },

    navigate(hash) {
      if (window.location.hash === hash) {
        this.renderCurrent();
      } else {
        window.location.hash = hash;
      }
    },

    async renderCurrent() {
      const app = document.getElementById('app');
      if (!app) return;

      const route = this.normalizeHash(window.location.hash);
      if (window.location.hash !== route) {
        history.replaceState(null, '', route);
      }

      const dynamicMatch = this.routes[route] ? null : this.matchDynamic(route);
      if (dynamicMatch) {
        app.innerHTML = dynamicMatch.entry.renderFn(dynamicMatch.match, route);
      } else {
        const renderer = this.routes[route];
        app.innerHTML = renderer();
      }
      window.scrollTo({ top: 0, behavior: 'auto' });

      UI.refreshIcons();

      if (route.startsWith('#/admin')) {
        await AdminViews.bindInteractions(route);
      } else {
        PublicViews.bindCommonInteractions(route);
        UI.initRevealObserver();
      }

      if (dynamicMatch && typeof dynamicMatch.entry.bindFn === 'function') {
        await dynamicMatch.entry.bindFn(dynamicMatch.match, route);
      }
    },

    init() {
      window.addEventListener('hashchange', () => {
        UI.Modal.close();
        UI.Confirm.close();
        this.renderCurrent();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (document.getElementById('confirm-root')?.classList.contains('is-open')) {
            UI.Confirm.close();
            return;
          }
          if (document.getElementById('modal-root')?.classList.contains('is-open')) {
            UI.Modal.close();
            return;
          }
          const mobileNav = document.getElementById('mobile-nav');
          if (mobileNav?.classList.contains('is-open')) {
            mobileNav.classList.remove('is-open');
            mobileNav.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
          }
        }
      });

      this.renderCurrent();
    }
  };

  /* ------------------------------------------------------------------------
     12. EKSPOS API MODUL & BOOTSTRAP APLIKASI
     ------------------------------------------------------------------------ */
  window.PKNJ = {
    CONFIG,
    Utils,
    ValidationService,
    IndexedDBService,
    StorageService,
    DataStore,
    UI,
    MediaActions,
    PublicViews,
    AdminViews,
    Router
  };

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      await DataStore.bootstrap();
      Router.init();
    } catch (err) {
      const app = document.getElementById('app');
      if (app) {
        app.innerHTML = `
          <div class="container section">
            <div class="empty-state">
              <h1 class="empty-state__title">Gagal Memuat Aplikasi Demo</h1>
              <p class="empty-state__desc">${Utils.escapeHtml(err.message || 'Terjadi kesalahan saat inisialisasi penyimpanan lokal.')}</p>
            </div>
          </div>
        `;
      }
    }
  });
})();
