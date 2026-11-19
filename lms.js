/* ==========================================================================
   MODUL V2.1 — MINI LMS, QUIZ BUILDER PILIHAN GANDA & AUTO-GRADING SYSTEM
   Pesantren Kader Nazhir Putri Jalaluddin
   Soal aktif: Pilihan Ganda (A–D) dengan penilaian otomatis 100%.
   Menjaga kompatibilitas baca-saja untuk arsip riwayat V2 lama.
   ========================================================================== */

(() => {
  'use strict';

  const PKNJ = window.PKNJ;
  if (!PKNJ) return;

  const { CONFIG, Utils, DataStore, UI, MediaActions, PublicViews, AdminViews, Router } = PKNJ;

  /* ------------------------------------------------------------------------
     1. SEED DATA LMS FALLBACK (Sinkron dengan data.json untuk mode file://)
     ------------------------------------------------------------------------ */
  CONFIG.PARTICIPANT_ID = 'demo-participant-01';
  CONFIG.PARTICIPANT_LABEL = 'Peserta Demo 01';

  CONFIG.LMS_SEED = {
    subjects: [
      {
        id: 'subj-001',
        title: 'Dasar-Dasar Kenazhiran & Fiqih Wakaf',
        code: 'WKF-101',
        category: 'Kajian Wakaf',
        description: 'Mata pelajaran inti untuk memahami prinsip fiqih wakaf, amanah nazhir, serta pengelolaan aset wakaf produktif secara profesional.',
        instructor: 'Ustadzah Pengampu (Contoh Demo)',
        demo: true,
        status: 'published',
        order: 1,
        createdAt: '2026-11-01T08:00:00+07:00'
      },
      {
        id: 'subj-002',
        title: 'Adab Thalibul Ilmi & Kepemimpinan Muslimah',
        code: 'KPM-102',
        category: 'Kepemimpinan',
        description: "Pembinaan adab penuntut ilmu Al-Qur'an, kedisiplinan amanah, dan keterampilan memimpin kegiatan sosial keumatan.",
        instructor: 'Ustadzah Pembina (Contoh Demo)',
        demo: true,
        status: 'published',
        order: 2,
        createdAt: '2026-11-03T08:00:00+07:00'
      }
    ],
    chapters: [
      {
        id: 'chap-001',
        subjectId: 'subj-001',
        title: 'Bab 1: Hakikat Wakaf dan Amanah Nazhir',
        summary: 'Pengantar konsep wakaf dalam Islam, perbedaan wakaf dengan sedekah biasa, serta tugas utama nazhir.',
        content: 'Wakaf merupakan penyerahan harta benda yang bersifat tahan lama untuk diambil manfaatnya bagi kemaslahatan umat secara berkelanjutan. Dalam tata kelola wakaf, seorang nazhir memikul amanah menjaga pokok aset (ashl) agar tidak berkurang nilainya sekaligus mengelola hasilnya agar tepat sasaran bagi mauquf alaih.\n\nPada bab ini santriwati mempelajari rukun wakaf (wakif, mauquf bih, mauquf alaih, dan shighat), prinsip kehati-hatian syariah, serta karakter amanah dan profesionalitas yang wajib dimiliki kader nazhir muslimah.',
        documentIds: ['doc-001', 'doc-003'],
        videoIds: ['vid-001'],
        demo: true,
        order: 1,
        status: 'published',
        createdAt: '2026-11-01T08:30:00+07:00'
      },
      {
        id: 'chap-002',
        subjectId: 'subj-001',
        title: 'Bab 2: Wakaf Produktif & Pelaporan Amanah',
        summary: 'Mengenal model pengembangan aset wakaf produktif dan akuntabilitas pelaporan nazhir.',
        content: 'Wakaf produktif mendorong aset wakaf agar dikelola secara ekonomis dan berkesinambungan sehingga menghasilkan surplus manfaat untuk pendidikan, kesehatan, dan pemberdayaan masyarakat.\n\nKader nazhir dibekali pemahaman dasar perencanaan program, pemisahan antara pokok wakaf dengan hasil pengelolaan, serta transparansi pelaporan kepada wakif dan pemangku kepentingan.',
        documentIds: ['doc-003'],
        videoIds: [],
        demo: true,
        order: 2,
        status: 'published',
        createdAt: '2026-11-05T09:00:00+07:00'
      },
      {
        id: 'chap-003',
        subjectId: 'subj-002',
        title: 'Bab 1: Adab Penuntut Ilmu & Keteladanan Muslimah',
        summary: "Landasan akhlak penuntut ilmu Al-Qur'an dan peran keteladanan dalam memimpin.",
        content: "Keberkahan ilmu berawal dari kelurusan niat, penghormatan terhadap guru dan Al-Qur'an, serta kesungguhan dalam mengamalkan ilmu yang dipelajari.\n\nDalam kepemimpinan muslimah, keteladanan adab menjadi fondasi kepercayaan sebelum menjalankan peran organisasi dan pengabdian masyarakat.",
        documentIds: ['doc-002'],
        videoIds: [],
        demo: true,
        order: 1,
        status: 'published',
        createdAt: '2026-11-06T09:00:00+07:00'
      }
    ],
    tests: [
      {
        id: 'test-001',
        chapterId: 'chap-001',
        type: 'pre_test',
        title: 'Pre-Test Bab 1: Hakikat Wakaf & Amanah Nazhir',
        description: 'Tes diagnostik awal untuk mengukur pemahaman sebelum mempelajari materi Bab 1. Tidak memblokir akses materi.',
        passingScore: 70,
        demo: true,
        status: 'published',
        createdAt: '2026-11-01T09:00:00+07:00'
      },
      {
        id: 'test-002',
        chapterId: 'chap-001',
        type: 'post_test',
        title: 'Post-Test Bab 1: Hakikat Wakaf & Amanah Nazhir',
        description: 'Evaluasi akhir Bab 1 menggunakan soal Pilihan Ganda dengan penilaian otomatis.',
        passingScore: 75,
        demo: true,
        status: 'published',
        createdAt: '2026-11-01T09:15:00+07:00'
      },
      {
        id: 'test-003',
        chapterId: 'chap-002',
        type: 'pre_test',
        title: 'Pre-Test Bab 2: Wakaf Produktif',
        description: 'Tes pemetaan awal sebelum mempelajari pengelolaan wakaf produktif.',
        passingScore: 70,
        demo: true,
        status: 'published',
        createdAt: '2026-11-05T09:15:00+07:00'
      },
      {
        id: 'test-004',
        chapterId: 'chap-002',
        type: 'post_test',
        title: 'Post-Test Bab 2: Wakaf Produktif',
        description: 'Evaluasi pemahaman model wakaf produktif dan akuntabilitas nazhir.',
        passingScore: 75,
        demo: true,
        status: 'published',
        createdAt: '2026-11-05T09:30:00+07:00'
      },
      {
        id: 'test-005',
        chapterId: 'chap-003',
        type: 'pre_test',
        title: 'Pre-Test Bab 1: Adab Penuntut Ilmu',
        description: 'Evaluasi awal pemahaman adab thalibul ilmi dan kepemimpinan muslimah.',
        passingScore: 70,
        demo: true,
        status: 'published',
        createdAt: '2026-11-06T09:15:00+07:00'
      },
      {
        id: 'test-006',
        chapterId: 'chap-003',
        type: 'post_test',
        title: 'Post-Test Bab 1: Adab Penuntut Ilmu',
        description: 'Evaluasi akhir materi Adab Penuntut Ilmu & Keteladanan Muslimah.',
        passingScore: 75,
        demo: true,
        status: 'published',
        createdAt: '2026-11-06T09:30:00+07:00'
      }
    ],
    questions: [
      {
        id: 'q-001',
        testId: 'test-001',
        type: 'multiple_choice',
        question: 'Apa prinsip utama harta yang diwakafkan dalam Islam? (Soal Contoh)',
        options: [
          'Pokok harta dijaga kelestariannya dan manfaatnya disalurkan',
          'Harta langsung dihabiskan seluruhnya dalam satu kali pembagian',
          'Harta hanya boleh digunakan untuk kepentingan pribadi nazhir',
          'Harta harus dijual kembali setelah satu bulan diterima'
        ],
        correctAnswer: 0,
        points: 10,
        explanation: "Prinsip wakaf adalah menahan pokok harta (habsul ashl) dan menyalurkan manfaatnya (tasbilul manfa'ah) secara berkelanjutan.",
        order: 1
      },
      {
        id: 'q-002',
        testId: 'test-001',
        type: 'multiple_choice',
        question: 'Selain tanah dan bangunan, bentuk aset apakah yang juga dikenal dalam fikih dan regulasi wakaf modern? (Soal Contoh)',
        options: [
          'Wakaf uang dan aset bergerak produktif',
          'Barang sekali pakai yang langsung habis',
          'Harta hasil pinjaman berbunga tinggi',
          'Hak milik sementara selama satu hari'
        ],
        correctAnswer: 0,
        points: 10,
        explanation: 'Selain tanah dan bangunan, fikih dan regulasi wakaf modern juga mengenal wakaf uang dan aset bergerak produktif.',
        order: 2
      },
      {
        id: 'q-003',
        testId: 'test-001',
        type: 'multiple_choice',
        question: 'Apakah peran utama seorang nazhir dalam menjaga amanah wakaf? (Soal Contoh)',
        options: [
          'Menjaga pokok aset, mengelola secara produktif sesuai syariah, dan menyalurkan manfaatnya',
          'Menjual seluruh aset wakaf ketika harga pasar sedang turun',
          'Menggunakan seluruh hasil wakaf untuk keperluan pribadi tanpa pencatatan',
          'Mengubah peruntukan wakaf sesuka hati tanpa dasar ikrar wakaf'
        ],
        correctAnswer: 0,
        points: 10,
        explanation: 'Nazhir berperan menjaga keutuhan pokok aset wakaf, mengelolanya secara produktif sesuai syariah dan ikrar wakaf, serta menyalurkan manfaat kepada mauquf alaih.',
        order: 3
      },
      {
        id: 'q-004',
        testId: 'test-002',
        type: 'multiple_choice',
        question: 'Siapakah pihak yang menerima amanah untuk mengelola dan mengembangkan harta wakaf? (Soal Contoh)',
        options: ['Wakif', 'Nazhir', 'Mauquf alaih', 'Saksi akad'],
        correctAnswer: 1,
        points: 10,
        explanation: 'Nazhir adalah pihak pengelola harta benda wakaf sesuai peruntukan dalam ikrar wakaf.',
        order: 1
      },
      {
        id: 'q-005',
        testId: 'test-002',
        type: 'multiple_choice',
        question: 'Manakah yang termasuk unsur rukun wakaf dalam kajian fiqih? (Soal Contoh)',
        options: [
          'Wakif, mauquf bih, mauquf alaih, dan shighat',
          'Pembeli, penjual, akad jual beli, dan harga',
          'Debitur, kreditur, bunga, dan jaminan',
          'Pengawas proyek dan kontraktor bangunan'
        ],
        correctAnswer: 0,
        points: 10,
        explanation: 'Empat rukun wakaf mencakup wakif (pemberi wakaf), mauquf bih (harta wakaf), mauquf alaih (penerima manfaat), dan shighat (ikrar).',
        order: 2
      },
      {
        id: 'q-006',
        testId: 'test-002',
        type: 'multiple_choice',
        question: 'Kepada siapakah hasil pengelolaan harta benda wakaf wajib disalurkan? (Soal Contoh)',
        options: [
          'Penerima manfaat (mauquf alaih) sesuai ikrar dan ketentuan syariah',
          'Pengelola pribadi tanpa batas dan tanpa laporan',
          'Pihak luar yang tidak terkait dengan tujuan wakaf',
          'Disimpan selamanya tanpa pernah disalurkan'
        ],
        correctAnswer: 0,
        points: 10,
        explanation: 'Hasil pengelolaan wakaf wajib disalurkan kepada mauquf alaih sesuai ketentuan syariah dan peraturan yang berlaku.',
        order: 3
      },
      {
        id: 'q-007',
        testId: 'test-002',
        type: 'multiple_choice',
        question: 'Manakah perbedaan mendasar antara wakaf dengan sedekah biasa? (Soal Contoh)',
        options: [
          'Wakaf menahan pokok hartanya agar tetap lestari dan hanya menyalurkan manfaatnya secara berkelanjutan',
          'Wakaf hanya boleh diberikan satu kali dan langsung habis dikonsumsi',
          'Sedekah biasa wajib berupa tanah bersertifikat resmi',
          'Wakaf tidak memiliki aturan penyaluran manfaat bagi umat'
        ],
        correctAnswer: 0,
        points: 20,
        explanation: 'Sedekah biasa dapat langsung habis dikonsumsi penerima, sedangkan wakaf menahan pokok hartanya agar tetap ada dan menyalurkan manfaatnya secara berkelanjutan.',
        order: 4
      },
      {
        id: 'q-008',
        testId: 'test-003',
        type: 'multiple_choice',
        question: 'Apa tujuan utama dari pengelolaan wakaf secara produktif? (Soal Contoh)',
        options: [
          'Menyimpan aset agar tidak pernah digunakan',
          'Menghasilkan surplus manfaat yang berkelanjutan bagi mauquf alaih',
          'Mengalihkan kepemilikan aset menjadi milik pribadi',
          'Menghapus kewajiban pencatatan keuangan'
        ],
        correctAnswer: 1,
        points: 10,
        explanation: 'Wakaf produktif mengoptimalkan aset agar menghasilkan nilai tambah berkelanjutan.',
        order: 1
      },
      {
        id: 'q-009',
        testId: 'test-003',
        type: 'multiple_choice',
        question: 'Mengapa transparansi pelaporan penting dalam pengelolaan wakaf oleh nazhir? (Soal Contoh)',
        options: [
          'Untuk menjaga kepercayaan dan akuntabilitas kepada wakif serta masyarakat',
          'Agar laporan tidak dapat diperiksa oleh pihak mana pun',
          'Untuk menyembunyikan jumlah hasil manfaat wakaf',
          'Supaya tugas pengawasan tidak perlu dilakukan'
        ],
        correctAnswer: 0,
        points: 10,
        explanation: 'Pelaporan yang jelas dan transparan menjaga kepercayaan serta akuntabilitas amanah wakaf.',
        order: 2
      },
      {
        id: 'q-010',
        testId: 'test-004',
        type: 'multiple_choice',
        question: 'Dalam pelaporan wakaf produktif, apa yang harus dipisahkan secara jelas oleh nazhir? (Soal Contoh)',
        options: [
          'Pokok aset wakaf dan hasil/surplus pengelolaannya',
          'Nama santri dan jadwal piket harian',
          'Warna sampul dokumen dan ukuran kertas',
          'Catatan pribadi dengan jadwal libur'
        ],
        correctAnswer: 0,
        points: 15,
        explanation: 'Pemisahan pokok aset wakaf dan hasil pengelolaan penting agar nilai pokok wakaf tetap terjaga.',
        order: 1
      },
      {
        id: 'q-011',
        testId: 'test-004',
        type: 'multiple_choice',
        question: 'Bagaimanakah sikap nazhir yang tepat terhadap nilai pokok aset wakaf? (Soal Contoh)',
        options: [
          'Menjaga keutuhan pokok wakaf agar tidak tergerus untuk biaya operasional rutin tanpa pemulihan',
          'Mengurangi pokok wakaf setiap bulan untuk belanja konsumtif',
          'Membagikan pokok wakaf hingga habis pada tahun pertama',
          'Mengabaikan pencatatan nilai pokok aset wakaf'
        ],
        correctAnswer: 0,
        points: 10,
        explanation: 'Pokok wakaf wajib dijaga keutuhannya dan tidak boleh tergerus.',
        order: 2
      },
      {
        id: 'q-012',
        testId: 'test-005',
        type: 'multiple_choice',
        question: 'Apa langkah pertama yang ditekankan dalam adab menuntut ilmu? (Soal Contoh)',
        options: [
          "Meluruskan niat ikhlas karena Allah Ta'ala",
          'Membeli perlengkapan paling mahal',
          'Berdebat dengan teman sebaya',
          'Menunda mengulang pelajaran'
        ],
        correctAnswer: 0,
        points: 10,
        explanation: 'Keikhlasan niat adalah fondasi utama keberkahan ilmu.',
        order: 1
      },
      {
        id: 'q-013',
        testId: 'test-005',
        type: 'multiple_choice',
        question: 'Manakah sikap yang termasuk bagian dari adab thalibul ilmi di majelis ilmu? (Soal Contoh)',
        options: [
          'Menghormati guru dan menjaga kebersihan serta ketertiban majelis ilmu',
          'Memotong penjelasan guru saat pelajaran berlangsung',
          'Datang terlambat secara sengaja tanpa uzur',
          'Mengabaikan catatan dan nasihat pengajar'
        ],
        correctAnswer: 0,
        points: 10,
        explanation: 'Adab terhadap guru dan majelis ilmu mendahului penyampaian ilmu agar ilmu membawa keberkahan.',
        order: 2
      },
      {
        id: 'q-014',
        testId: 'test-005',
        type: 'multiple_choice',
        question: 'Bagaimana hubungan antara adab penuntut ilmu dengan kualitas kepemimpinan seorang muslimah? (Soal Contoh)',
        options: [
          'Adab membentuk kerendahan hati, tanggung jawab, kejujuran, dan keteladanan dalam memimpin',
          'Adab membuat seorang pemimpin enggan bermusyawarah',
          'Adab hanya diperlukan saat belajar dan tidak relevan dalam kepemimpinan',
          'Kepemimpinan hanya ditentukan oleh suara keras tanpa akhlak'
        ],
        correctAnswer: 0,
        points: 15,
        explanation: 'Adab membentuk kerendahan hati, tanggung jawab, kejujuran, dan keteladanan sehingga kepemimpinan berjalan dengan amanah.',
        order: 3
      },
      {
        id: 'q-015',
        testId: 'test-006',
        type: 'multiple_choice',
        question: 'Nilai apakah yang menjadi dasar kepercayaan terhadap seorang pemimpin muslimah? (Soal Contoh)',
        options: [
          'Keteladanan adab dan konsistensi menjaga amanah',
          'Kemampuan berbicara keras tanpa mendengar',
          'Sikap menutup diri dari masukan',
          'Mengutamakan kepentingan pribadi'
        ],
        correctAnswer: 0,
        points: 15,
        explanation: 'Keteladanan dan amanah adalah fondasi kepemimpinan dalam Islam.',
        order: 1
      },
      {
        id: 'q-016',
        testId: 'test-006',
        type: 'multiple_choice',
        question: 'Prinsip apakah yang selalu menyertai kepemimpinan Islam yang baik dalam mengambil keputusan bersama? (Soal Contoh)',
        options: [
          'Kesediaan untuk bermusyawarah (syura) dan menerima nasihat yang baik',
          'Menolak seluruh masukan dari anggota',
          'Memutuskan persoalan sepihak tanpa pertimbangan',
          'Menghindari tanggung jawab saat terjadi masalah'
        ],
        correctAnswer: 0,
        points: 10,
        explanation: 'Musyawarah (syura) merupakan prinsip utama kepemimpinan Islam.',
        order: 2
      }
    ],
    attempts: [],
    inProgress: {},
    learningProgress: { completedChapterIds: [] }
  };

  /* ------------------------------------------------------------------------
     2. GRADING & VALIDATION ENGINE (Deterministik & Siap Migrasi Laravel)
     ------------------------------------------------------------------------ */
  const GradingService = {
    questionTypeLabel(type) {
      const map = {
        multiple_choice: 'Pilihan Ganda',
        true_false: 'Benar / Salah (Arsip V2)',
        essay: 'Essay (Arsip V2)'
      };
      return map[type] || 'Soal';
    },

    questionTypeBadgeClass(type) {
      const map = {
        multiple_choice: 'badge--teal',
        true_false: 'badge--purple',
        essay: 'badge--orange'
      };
      return map[type] || 'badge--neutral';
    },

    testTypeLabel(type) {
      return type === 'pre_test' ? 'Pre-Test' : 'Post-Test';
    },

    roundScore(raw) {
      if (!Number.isFinite(raw)) return 0;
      const clamped = Math.max(0, Math.min(100, raw));
      return Math.round(clamped * 100) / 100;
    },

    formatScore(score) {
      if (score === null || score === undefined || Number.isNaN(score)) return '-';
      return Number.isInteger(score) ? String(score) : score.toFixed(2).replace(/\.?0+$/, '');
    },

    validateQuestionPayload(payload) {
      if (!payload || payload.type !== 'multiple_choice') {
        return { valid: false, error: 'Semua soal aktif wajib bertipe Pilihan Ganda (A, B, C, D).' };
      }

      const question = (payload.question || '').trim();
      if (!question) {
        return { valid: false, error: 'Teks pertanyaan wajib diisi.' };
      }

      const points = Number(payload.points);
      if (!Number.isFinite(points) || points <= 0) {
        return { valid: false, error: 'Bobot poin harus berupa angka positif lebih dari 0.' };
      }

      const opts = Array.isArray(payload.options) ? payload.options.map((o) => String(o || '').trim()) : [];
      if (opts.length !== 4 || opts.some((o) => !o)) {
        return { valid: false, error: 'Keempat pilihan jawaban (A, B, C, dan D) wajib diisi.' };
      }

      const rawCorrect = payload.correctAnswer;
      if (rawCorrect === '' || rawCorrect === null || rawCorrect === undefined) {
        return { valid: false, error: 'Pilih tepat satu jawaban benar (A, B, C, atau D).' };
      }
      const correctIdx = Number(rawCorrect);
      if (!Number.isInteger(correctIdx) || correctIdx < 0 || correctIdx > 3) {
        return { valid: false, error: 'Pilih tepat satu jawaban benar (A, B, C, atau D).' };
      }

      return { valid: true };
    },

    evaluateSubmission(test, orderedQuestions, rawAnswers = {}) {
      if (!Array.isArray(orderedQuestions) || !orderedQuestions.length) {
        throw new Error('Tes ini belum memiliki soal yang valid.');
      }

      for (const q of orderedQuestions) {
        const check = this.validateQuestionPayload(q);
        if (!check.valid) {
          throw new Error('Tes ini masih memiliki soal yang belum valid atau perlu penyesuaian ke Pilihan Ganda.');
        }
      }

      const snapshots = Utils.clone(orderedQuestions);
      const sanitizedAnswers = {};

      let earnedPoints = 0;
      let totalMaxPoints = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      for (const q of snapshots) {
        const pts = Number(q.points) || 0;
        totalMaxPoints += pts;
        const ans = rawAnswers[q.id];

        if (typeof ans === 'number' && Number.isInteger(ans) && ans >= 0 && ans <= 3) {
          sanitizedAnswers[q.id] = ans;
          if (ans === q.correctAnswer) {
            earnedPoints += pts;
            correctCount += 1;
          } else {
            wrongCount += 1;
          }
        } else {
          sanitizedAnswers[q.id] = null;
          unansweredCount += 1;
        }
      }

      const finalPoints = Math.round(earnedPoints * 100) / 100;
      const roundedMax = Math.round(totalMaxPoints * 100) / 100;
      const passingScore = Math.max(0, Math.min(100, Number(test.passingScore) || 0));
      const finalScore = roundedMax > 0 ? this.roundScore((finalPoints / roundedMax) * 100) : 0;

      const grading = {
        objectivePoints: finalPoints,
        maxObjectivePoints: roundedMax,
        totalMaxPoints: roundedMax,
        finalPoints,
        finalScore,
        passed: finalScore >= passingScore,
        status: 'graded',
        correctCount,
        wrongCount,
        unansweredCount
      };

      return {
        answers: sanitizedAnswers,
        questionSnapshots: snapshots,
        testSnapshot: {
          id: test.id,
          chapterId: test.chapterId,
          type: test.type,
          title: test.title,
          passingScore
        },
        grading
      };
    },

    getAttemptBreakdownStats(attempt) {
      const grading = attempt?.grading || {};
      const snapshots = attempt?.questionSnapshots || [];
      const answers = attempt?.answers || {};

      const hasPrecomputed =
        typeof grading.correctCount === 'number' &&
        typeof grading.wrongCount === 'number' &&
        typeof grading.unansweredCount === 'number';

      if (hasPrecomputed && snapshots.every((q) => q.type === 'multiple_choice')) {
        return {
          correctCount: grading.correctCount,
          wrongCount: grading.wrongCount,
          unansweredCount: grading.unansweredCount,
          essayCount: 0
        };
      }

      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;
      let essayCount = 0;

      for (const q of snapshots) {
        const ans = answers[q.id];
        if (q.type === 'multiple_choice') {
          if (typeof ans === 'number' && Number.isInteger(ans) && ans >= 0 && ans <= 3) {
            if (ans === q.correctAnswer) correctCount += 1;
            else wrongCount += 1;
          } else {
            unansweredCount += 1;
          }
        } else if (q.type === 'true_false') {
          if (typeof ans === 'boolean') {
            if (ans === q.correctAnswer) correctCount += 1;
            else wrongCount += 1;
          } else {
            unansweredCount += 1;
          }
        } else if (q.type === 'essay') {
          essayCount += 1;
          if (typeof ans !== 'string' || !ans.trim()) {
            unansweredCount += 1;
          }
        }
      }

      return { correctCount, wrongCount, unansweredCount, essayCount };
    }
  };

  /* ------------------------------------------------------------------------
     3. LMS STORE (CRUD Mata Pelajaran, Bab, Tes, Soal, Pengerjaan & Progres)
     ------------------------------------------------------------------------ */
  const LmsStore = {
    getSubjects(includeDraft = true) {
      const list = [...(DataStore.state.subjects || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
      return includeDraft ? list : list.filter((s) => s.status === 'published');
    },

    getSubjectById(id) {
      return (DataStore.state.subjects || []).find((s) => s.id === id) || null;
    },

    saveSubject(id, payload) {
      const title = (payload.title || '').trim();
      if (!title) throw new Error('Judul mata pelajaran wajib diisi.');

      if (id) {
        const subj = this.getSubjectById(id);
        if (!subj) throw new Error('Mata pelajaran tidak ditemukan.');
        subj.title = title;
        subj.code = (payload.code || '').trim().toUpperCase() || subj.code;
        subj.category = payload.category || subj.category;
        subj.instructor = (payload.instructor || '').trim() || 'Pengajar Demo';
        subj.description = (payload.description || '').trim();
        subj.status = payload.status === 'published' ? 'published' : 'draft';
        DataStore.persist();
        return subj;
      }

      const newSubj = {
        id: Utils.generateId('subj'),
        title,
        code: (payload.code || '').trim().toUpperCase() || `MP-${(DataStore.state.subjects.length + 1).toString().padStart(2, '0')}`,
        category: payload.category || 'Kajian Wakaf',
        instructor: (payload.instructor || '').trim() || 'Ustadzah Pengampu (Demo)',
        description: (payload.description || '').trim(),
        demo: false,
        status: payload.status === 'published' ? 'published' : 'draft',
        order: (DataStore.state.subjects?.length || 0) + 1,
        createdAt: new Date().toISOString()
      };
      DataStore.state.subjects.push(newSubj);
      DataStore.persist();
      return newSubj;
    },

    countAttemptsForSubject(subjectId) {
      const chaps = this.getChaptersBySubject(subjectId, true);
      return chaps.reduce((sum, ch) => sum + this.countAttemptsForChapter(ch.id), 0);
    },

    deleteSubject(subjectId) {
      const chaps = this.getChaptersBySubject(subjectId, true);
      chaps.forEach((ch) => this.deleteChapter(ch.id, false));
      DataStore.state.subjects = DataStore.state.subjects.filter((s) => s.id !== subjectId);
      DataStore.persist();
    },

    getChaptersBySubject(subjectId, includeDraft = true) {
      const list = (DataStore.state.chapters || [])
        .filter((c) => c.subjectId === subjectId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      return includeDraft ? list : list.filter((c) => c.status === 'published');
    },

    getChapterById(id) {
      return (DataStore.state.chapters || []).find((c) => c.id === id) || null;
    },

    createChapter(subjectId, payload) {
      const title = (payload.title || '').trim();
      if (!title) throw new Error('Judul bab pembelajaran wajib diisi.');

      const existingCount = this.getChaptersBySubject(subjectId, true).length;
      const chap = {
        id: Utils.generateId('chap'),
        subjectId,
        title,
        summary: (payload.summary || '').trim(),
        content: (payload.content || '').trim(),
        documentIds: Array.isArray(payload.documentIds) ? payload.documentIds : [],
        videoIds: Array.isArray(payload.videoIds) ? payload.videoIds : [],
        demo: false,
        order: existingCount + 1,
        status: payload.status === 'published' ? 'published' : 'draft',
        createdAt: new Date().toISOString()
      };
      DataStore.state.chapters.push(chap);
      this.ensureChapterTests(chap.id, false);
      DataStore.persist();
      return chap;
    },

    updateChapter(chapterId, payload) {
      const chap = this.getChapterById(chapterId);
      if (!chap) throw new Error('Bab pembelajaran tidak ditemukan.');
      const title = (payload.title || '').trim();
      if (!title) throw new Error('Judul bab wajib diisi.');

      chap.title = title;
      chap.summary = (payload.summary || '').trim();
      chap.content = (payload.content || '').trim();
      chap.status = payload.status === 'published' ? 'published' : 'draft';
      if (Array.isArray(payload.documentIds)) chap.documentIds = payload.documentIds;
      if (Array.isArray(payload.videoIds)) chap.videoIds = payload.videoIds;
      DataStore.persist();
      return chap;
    },

    countAttemptsForChapter(chapterId) {
      const tests = (DataStore.state.tests || []).filter((t) => t.chapterId === chapterId);
      const testIds = new Set(tests.map((t) => t.id));
      return (DataStore.state.attempts || []).filter((a) => testIds.has(a.testId)).length;
    },

    deleteChapter(chapterId, shouldPersist = true) {
      const tests = (DataStore.state.tests || []).filter((t) => t.chapterId === chapterId);
      const testIds = new Set(tests.map((t) => t.id));
      DataStore.state.questions = DataStore.state.questions.filter((q) => !testIds.has(q.testId));
      DataStore.state.attempts = DataStore.state.attempts.filter((a) => !testIds.has(a.testId));
      tests.forEach((t) => {
        if (DataStore.state.inProgress && DataStore.state.inProgress[t.id]) {
          delete DataStore.state.inProgress[t.id];
        }
      });
      DataStore.state.tests = DataStore.state.tests.filter((t) => t.chapterId !== chapterId);
      DataStore.state.chapters = DataStore.state.chapters.filter((c) => c.id !== chapterId);
      if (DataStore.state.learningProgress?.completedChapterIds) {
        DataStore.state.learningProgress.completedChapterIds =
          DataStore.state.learningProgress.completedChapterIds.filter((id) => id !== chapterId);
      }
      if (shouldPersist) DataStore.persist();
    },

    ensureChapterTests(chapterId, shouldPersist = true) {
      const chap = this.getChapterById(chapterId);
      const tests = DataStore.state.tests || [];
      let preTest = tests.find((t) => t.chapterId === chapterId && t.type === 'pre_test');
      let postTest = tests.find((t) => t.chapterId === chapterId && t.type === 'post_test');
      let changed = false;

      if (!preTest) {
        preTest = {
          id: Utils.generateId('test'),
          chapterId,
          type: 'pre_test',
          title: `Pre-Test: ${chap ? chap.title : 'Bab Baru'}`,
          description: 'Tes diagnostik awal sebelum mempelajari materi bab ini.',
          passingScore: 70,
          demo: false,
          status: 'draft',
          createdAt: new Date().toISOString()
        };
        DataStore.state.tests.push(preTest);
        changed = true;
      }

      if (!postTest) {
        postTest = {
          id: Utils.generateId('test'),
          chapterId,
          type: 'post_test',
          title: `Post-Test: ${chap ? chap.title : 'Bab Baru'}`,
          description: 'Evaluasi akhir setelah mempelajari seluruh materi bab ini.',
          passingScore: 75,
          demo: false,
          status: 'draft',
          createdAt: new Date().toISOString()
        };
        DataStore.state.tests.push(postTest);
        changed = true;
      }

      if (changed && shouldPersist) DataStore.persist();
      return { preTest, postTest };
    },

    getTestById(testId) {
      return (DataStore.state.tests || []).find((t) => t.id === testId) || null;
    },

    updateTestSettings(testId, payload) {
      const test = this.getTestById(testId);
      if (!test) throw new Error('Tes tidak ditemukan.');
      const title = (payload.title || '').trim();
      if (!title) throw new Error('Judul tes wajib diisi.');

      const passing = Number(payload.passingScore);
      if (!Number.isFinite(passing) || passing < 0 || passing > 100) {
        throw new Error('Nilai minimum kelulusan harus antara 0 hingga 100.');
      }

      test.title = title;
      test.description = (payload.description || '').trim();
      test.passingScore = Math.round(passing);
      test.status = payload.status === 'published' ? 'published' : 'draft';
      DataStore.persist();
      return test;
    },

    getQuestionsByTest(testId) {
      return (DataStore.state.questions || [])
        .filter((q) => q.testId === testId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    },

    getQuestionById(questionId) {
      return (DataStore.state.questions || []).find((q) => q.id === questionId) || null;
    },

    getTestTotals(testId) {
      const qs = this.getQuestionsByTest(testId);
      const totalPoints = qs.reduce((sum, q) => sum + (Number(q.points) || 0), 0);
      return {
        questionCount: qs.length,
        totalPoints: Math.round(totalPoints * 100) / 100
      };
    },

    getTestCompatibilityInfo(testId) {
      const questions = this.getQuestionsByTest(testId);
      const nonMcQuestions = questions.filter((q) => q.type !== 'multiple_choice');
      const invalidMcQuestions = questions.filter(
        (q) => q.type === 'multiple_choice' && !GradingService.validateQuestionPayload(q).valid
      );
      const needsAdjustment = nonMcQuestions.length > 0 || invalidMcQuestions.length > 0;
      const hasQuestions = questions.length > 0;
      const canTakeTest = hasQuestions && !needsAdjustment;

      let reason = '';
      if (nonMcQuestions.length > 0) {
        reason = `Tes ini masih memiliki ${nonMcQuestions.length} soal format lama (Benar/Salah atau Essay) dan berstatus Perlu Penyesuaian.`;
      } else if (invalidMcQuestions.length > 0) {
        reason = `Tes ini memiliki ${invalidMcQuestions.length} soal pilihan ganda yang belum lengkap dan berstatus Perlu Penyesuaian.`;
      } else if (!hasQuestions) {
        reason = 'Tes ini belum memiliki soal.';
      }

      return {
        questions,
        nonMcQuestions,
        invalidMcQuestions,
        needsAdjustment,
        hasQuestions,
        canTakeTest,
        reason
      };
    },

    syncTestAdjustmentFlag(testId) {
      const test = this.getTestById(testId);
      if (!test) return;
      const compat = this.getTestCompatibilityInfo(testId);
      test.needsAdjustment = compat.needsAdjustment;
    },

    migrateStateV21() {
      const meta = DataStore.state.meta || {};
      if (meta.v21Migrated === true) return false;

      // Migrasi satu kali V2 -> V2.1 tanpa menghapus atau mengubah riwayat, snapshot, nilai, atau soal lama
      (DataStore.state.tests || []).forEach((test) => {
        const compat = this.getTestCompatibilityInfo(test.id);
        test.needsAdjustment = compat.needsAdjustment;
        if (compat.needsAdjustment) {
          test.legacyMixedTypes = true;
        }
      });

      DataStore.state.meta = {
        ...meta,
        version: '2.1.0',
        schemaVersion: '2.1.0',
        v21Migrated: true,
        v21MigratedAt: new Date().toISOString()
      };
      DataStore.persist();
      return true;
    },

    addQuestion(testId, payload) {
      const normalizedPayload = { ...payload, type: 'multiple_choice' };
      const check = GradingService.validateQuestionPayload(normalizedPayload);
      if (!check.valid) throw new Error(check.error);

      const current = this.getQuestionsByTest(testId);
      const base = {
        id: Utils.generateId('q'),
        testId,
        type: 'multiple_choice',
        question: normalizedPayload.question.trim(),
        options: normalizedPayload.options.map((o) => String(o).trim()),
        correctAnswer: Number(normalizedPayload.correctAnswer),
        points: Math.round(Number(normalizedPayload.points) * 100) / 100,
        explanation: (normalizedPayload.explanation || '').trim(),
        order: current.length + 1
      };

      DataStore.state.questions.push(base);
      this.syncTestAdjustmentFlag(testId);
      DataStore.persist();
      return base;
    },

    updateQuestion(questionId, payload) {
      const idx = DataStore.state.questions.findIndex((q) => q.id === questionId);
      if (idx === -1) throw new Error('Soal tidak ditemukan.');
      const normalizedPayload = { ...payload, type: 'multiple_choice' };
      const check = GradingService.validateQuestionPayload(normalizedPayload);
      if (!check.valid) throw new Error(check.error);

      const existing = DataStore.state.questions[idx];
      const updated = {
        id: existing.id,
        testId: existing.testId,
        type: 'multiple_choice',
        question: normalizedPayload.question.trim(),
        options: normalizedPayload.options.map((o) => String(o).trim()),
        correctAnswer: Number(normalizedPayload.correctAnswer),
        points: Math.round(Number(normalizedPayload.points) * 100) / 100,
        explanation: (normalizedPayload.explanation || '').trim(),
        order: existing.order
      };

      DataStore.state.questions[idx] = updated;
      this.syncTestAdjustmentFlag(existing.testId);
      DataStore.persist();
      return updated;
    },

    deleteQuestion(questionId) {
      const target = this.getQuestionById(questionId);
      if (!target) return;
      DataStore.state.questions = DataStore.state.questions.filter((q) => q.id !== questionId);
      const remaining = this.getQuestionsByTest(target.testId);
      remaining.forEach((q, idx) => {
        q.order = idx + 1;
      });
      this.syncTestAdjustmentFlag(target.testId);
      DataStore.persist();
    },

    moveQuestion(questionId, direction) {
      const target = this.getQuestionById(questionId);
      if (!target) return;
      const list = this.getQuestionsByTest(target.testId);
      const idx = list.findIndex((q) => q.id === questionId);
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (idx === -1 || swapIdx < 0 || swapIdx >= list.length) return;

      const temp = list[idx].order;
      list[idx].order = list[swapIdx].order;
      list[swapIdx].order = temp;
      DataStore.persist();
    },

    /* Progres Belajar */
    isChapterCompleted(chapterId) {
      const ids = DataStore.state.learningProgress?.completedChapterIds || [];
      return ids.includes(chapterId);
    },

    markChapterCompleted(chapterId, shouldPersist = true) {
      if (!chapterId) return;
      if (!DataStore.state.learningProgress) {
        DataStore.state.learningProgress = { completedChapterIds: [] };
      }
      const list = DataStore.state.learningProgress.completedChapterIds;
      if (!list.includes(chapterId)) {
        list.push(chapterId);
        if (shouldPersist) DataStore.persist();
      }
    },

    toggleChapterCompleted(chapterId) {
      if (!DataStore.state.learningProgress) {
        DataStore.state.learningProgress = { completedChapterIds: [] };
      }
      const list = DataStore.state.learningProgress.completedChapterIds;
      const idx = list.indexOf(chapterId);
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        list.push(chapterId);
      }
      DataStore.persist();
      return idx === -1;
    },

    getSubjectProgress(subjectId) {
      const chapters = this.getChaptersBySubject(subjectId, false);
      const completed = chapters.filter((c) => this.isChapterCompleted(c.id)).length;
      const pct = chapters.length > 0 ? Math.round((completed / chapters.length) * 100) : 0;
      return { total: chapters.length, completed, pct };
    },

    /* Attempts & InProgress */
    getAttemptByTestId(testId) {
      return (DataStore.state.attempts || []).find((a) => a.testId === testId) || null;
    },

    getAttemptsByTestId(testId) {
      return (DataStore.state.attempts || [])
        .filter((a) => a.testId === testId)
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    },

    getAttemptById(attemptId) {
      return (DataStore.state.attempts || []).find((a) => a.id === attemptId) || null;
    },

    getInProgress(testId) {
      return (DataStore.state.inProgress && DataStore.state.inProgress[testId]) || null;
    },

    saveInProgress(testId, answers, currentIndex) {
      if (!DataStore.state.inProgress) DataStore.state.inProgress = {};
      DataStore.state.inProgress[testId] = {
        answers,
        currentIndex,
        updatedAt: new Date().toISOString()
      };
      DataStore.persist();
    },

    getTestStatusInfo(testId) {
      const attempt = this.getAttemptByTestId(testId);
      if (attempt) {
        if (attempt.grading?.status === 'pending_review') {
          return { key: 'pending_review', label: 'Menunggu Penilaian (Arsip V2)', badge: 'badge--warm', attempt };
        }
        return { key: 'graded', label: 'Selesai Dinilai', badge: 'badge--green', attempt };
      }
      const compat = this.getTestCompatibilityInfo(testId);
      if (compat.needsAdjustment) {
        return { key: 'needs_adjustment', label: 'Perlu Penyesuaian', badge: 'badge--warm', attempt: null };
      }
      const draft = this.getInProgress(testId);
      if (draft && Object.keys(draft.answers || {}).length > 0) {
        return { key: 'in_progress', label: 'Sedang Dikerjakan', badge: 'badge--teal', attempt: null };
      }
      return { key: 'unstarted', label: 'Belum Dikerjakan', badge: 'badge--neutral', attempt: null };
    },

    submitTest(testId, rawAnswers) {
      const existing = this.getAttemptByTestId(testId);
      if (existing) {
        throw new Error('Tes ini sudah pernah dikirim pada percobaan demo. Gunakan Reset Percobaan jika ingin mengulang.');
      }
      const test = this.getTestById(testId);
      if (!test) throw new Error('Tes tidak ditemukan.');

      const compat = this.getTestCompatibilityInfo(testId);
      if (!compat.canTakeTest) {
        throw new Error(compat.reason || 'Tes ini belum siap dikerjakan.');
      }

      const evalResult = GradingService.evaluateSubmission(test, compat.questions, rawAnswers);
      const attempt = {
        id: Utils.generateId('attempt'),
        testId,
        participantId: CONFIG.PARTICIPANT_ID,
        ...evalResult,
        submittedAt: new Date().toISOString()
      };

      DataStore.state.attempts.unshift(attempt);
      if (DataStore.state.inProgress && DataStore.state.inProgress[testId]) {
        delete DataStore.state.inProgress[testId];
      }
      if (test.type === 'post_test' && evalResult.grading.status === 'graded') {
        this.markChapterCompleted(test.chapterId, false);
      }
      DataStore.persist();
      return attempt;
    },

    resetTestAttempt(testId) {
      DataStore.state.attempts = (DataStore.state.attempts || []).filter((a) => a.testId !== testId);
      if (DataStore.state.inProgress && DataStore.state.inProgress[testId]) {
        delete DataStore.state.inProgress[testId];
      }
      DataStore.persist();
    },

    getChapterComparison(chapterId) {
      const tests = (DataStore.state.tests || []).filter((t) => t.chapterId === chapterId && t.status === 'published');
      const preTest = tests.find((t) => t.type === 'pre_test') || null;
      const postTest = tests.find((t) => t.type === 'post_test') || null;
      const preInfo = preTest ? this.getTestStatusInfo(preTest.id) : null;
      const postInfo = postTest ? this.getTestStatusInfo(postTest.id) : null;

      const bothGraded = Boolean(
        preInfo?.key === 'graded' &&
        postInfo?.key === 'graded' &&
        typeof preInfo.attempt?.grading?.finalScore === 'number' &&
        typeof postInfo.attempt?.grading?.finalScore === 'number'
      );

      let diff = null;
      if (bothGraded) {
        diff = Math.round((postInfo.attempt.grading.finalScore - preInfo.attempt.grading.finalScore) * 100) / 100;
      }

      return { preTest, postTest, preInfo, postInfo, bothGraded, diff };
    }
  };

  /* ------------------------------------------------------------------------
     4. PUBLIC LMS VIEWS (Kelas, Bab, Quiz Runner, Halaman Hasil Tes)
     ------------------------------------------------------------------------ */
  const LmsPublicViews = {
    renderHomeSection() {
      const subjects = LmsStore.getSubjects(false);
      if (!subjects.length) return '';

      return `
        <section class="section">
          <div class="container">
            <div class="section-header">
              <div class="section-header__text">
                <div class="eyebrow">${Utils.icon('graduation-cap', 14)} <span>Mini LMS &amp; Evaluasi</span></div>
                <h2 class="section-title">Kelas Pembelajaran Kader Nazhir</h2>
                <p class="section-subtitle">
                  Pelajari modul terstruktur per bab lengkap dengan video kajian, dokumen bacaan, serta evaluasi Pre-Test dan Post-Test interaktif.
                </p>
              </div>
              <a href="#/pembelajaran" class="btn btn--primary">
                <span>Buka Ruang Belajar</span>
                ${Utils.icon('arrow-right', 16)}
              </a>
            </div>

            <div class="cards-grid">
              ${subjects.slice(0, 3).map((subj) => this.renderSubjectCard(subj)).join('')}
            </div>
          </div>
        </section>
      `;
    },

    renderSubjectCard(subj) {
      const prog = LmsStore.getSubjectProgress(subj.id);
      return `
        <article class="doc-card reveal">
          <div class="doc-card__top">
            <div class="doc-type-icon doc-type-icon--ppt" style="width:auto;padding-inline:0.75rem;">
              ${Utils.escapeHtml(subj.code || 'LMS')}
            </div>
            <div class="doc-card__badges">
              <span class="badge ${Utils.getCategoryBadgeClass(subj.category)}">${Utils.escapeHtml(subj.category)}</span>
              ${subj.demo ? '<span class="badge badge--demo">Contoh</span>' : ''}
            </div>
          </div>
          <h3 class="doc-card__title">${Utils.escapeHtml(subj.title)}</h3>
          <p class="doc-card__desc">${Utils.escapeHtml(subj.description || '')}</p>
          <div style="margin-top:auto;margin-bottom:1rem;">
            <div class="summary-metric__row" style="font-size:0.8rem;color:var(--text-muted);">
              <span>Progres Belajar (${prog.completed}/${prog.total} bab)</span>
              <strong>${prog.pct}%</strong>
            </div>
            <div class="progress-track" style="height:8px;">
              <div class="progress-fill" style="width:${prog.pct}%"></div>
            </div>
          </div>
          <div class="doc-card__actions">
            <a href="#/pembelajaran/${Utils.escapeHtml(subj.id)}" class="btn btn--green btn--sm">
              ${Utils.icon('book-open', 15)} Mulai Belajar
            </a>
          </div>
        </article>
      `;
    },

    renderSubjectsPage() {
      const subjects = LmsStore.getSubjects(false);
      const publishedChapterIds = new Set(
        subjects.flatMap((s) => LmsStore.getChaptersBySubject(s.id, false).map((c) => c.id))
      );
      const totalPublishedChapters = publishedChapterIds.size;
      const completedCount = (DataStore.state.learningProgress?.completedChapterIds || [])
        .filter((id) => publishedChapterIds.has(id)).length;

      return `
        ${PublicViews.renderHeader('#/pembelajaran')}
        <main id="main-content">
          <section class="page-hero">
            <div class="container page-hero__inner">
              <div>
                <div class="eyebrow">${Utils.icon('graduation-cap', 14)} <span>Mini LMS &bull; ${CONFIG.PARTICIPANT_LABEL}</span></div>
                <h1 class="section-title" style="margin-bottom:0.35rem;">Program Pembelajaran Santriwati</h1>
                <p class="section-subtitle">Pilih mata pelajaran untuk mengakses materi bab, video, dokumen PDF/PPT, serta Pre-Test dan Post-Test.</p>
              </div>
              <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
                <span class="badge badge--green">${completedCount} / ${totalPublishedChapters} Bab Selesai</span>
                <a href="#/admin/pembelajaran" class="btn btn--outline btn--sm">${Utils.icon('settings', 15)} Kelola di Admin</a>
              </div>
            </div>
          </section>

          <section class="section">
            <div class="container">
              ${subjects.length ? `
                <div class="cards-grid">
                  ${subjects.map((s) => this.renderSubjectCard(s)).join('')}
                </div>
              ` : `
                <div class="empty-state">
                  <div class="empty-state__icon">${Utils.icon('book-x', 26)}</div>
                  <h2 class="empty-state__title">Belum Ada Mata Pelajaran Terbit</h2>
                  <p class="empty-state__desc">Tambahkan dan terbitkan mata pelajaran melalui Dashboard Admin.</p>
                </div>
              `}
            </div>
          </section>
        </main>
        ${PublicViews.renderFooter()}
      `;
    },

    renderChapterWorkspace(subjectId, chapterId = null) {
      const subject = LmsStore.getSubjectById(subjectId);
      if (!subject || subject.status !== 'published') {
        return this.renderSubjectsPage();
      }

      const chapters = LmsStore.getChaptersBySubject(subject.id, false);
      if (!chapters.length) {
        return `
          ${PublicViews.renderHeader('#/pembelajaran')}
          <main id="main-content" class="section">
            <div class="container">
              <div class="empty-state">
                <h1 class="empty-state__title">${Utils.escapeHtml(subject.title)}</h1>
                <p class="empty-state__desc">Belum ada bab pembelajaran yang diterbitkan untuk mata pelajaran ini.</p>
                <a href="#/pembelajaran" class="btn btn--outline">Kembali ke Daftar Kelas</a>
              </div>
            </div>
          </main>
          ${PublicViews.renderFooter()}
        `;
      }

      const activeChapter = (chapterId && chapters.find((c) => c.id === chapterId)) || chapters[0];
      const activeIndex = chapters.findIndex((c) => c.id === activeChapter.id);
      const prevChapter = activeIndex > 0 ? chapters[activeIndex - 1] : null;
      const nextChapter = activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : null;
      const isCompleted = LmsStore.isChapterCompleted(activeChapter.id);
      const prog = LmsStore.getSubjectProgress(subject.id);

      const attachedDocs = (activeChapter.documentIds || [])
        .map((id) => DataStore.getDocumentById(id))
        .filter((d) => d && d.status === 'published');
      const attachedVideos = (activeChapter.videoIds || [])
        .map((id) => DataStore.getVideoById(id))
        .filter((v) => v && v.status === 'published');

      const comp = LmsStore.getChapterComparison(activeChapter.id);

      return `
        ${PublicViews.renderHeader('#/pembelajaran')}
        <main id="main-content">
          <section class="page-hero" style="padding-block:1.6rem;">
            <div class="container page-hero__inner">
              <div>
                <div class="breadcrumb" style="margin-bottom:0.45rem;">
                  <a href="#/pembelajaran">Pembelajaran</a>
                  <span>/</span>
                  <span class="breadcrumb__current">${Utils.escapeHtml(subject.title)}</span>
                </div>
                <h1 style="font-size:clamp(1.35rem,2.4vw,1.9rem);">${Utils.escapeHtml(subject.title)}</h1>
                <p class="form-hint">${Utils.escapeHtml(subject.instructor || '')} &bull; ${CONFIG.PARTICIPANT_LABEL}</p>
              </div>
              <a href="#/pembelajaran" class="btn btn--outline btn--sm">${Utils.icon('arrow-left', 15)} Semua Mata Pelajaran</a>
            </div>
          </section>

          <section class="section" style="padding-block:2.2rem;">
            <div class="container lms-layout">
              <!-- Sidebar Navigasi Bab & Progres -->
              <aside class="lms-sidebar" aria-label="Daftar Bab Pembelajaran">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                  <strong style="color:var(--green-800);font-size:0.95rem;">Daftar Bab</strong>
                  <span class="badge badge--green">${prog.completed}/${prog.total} Selesai</span>
                </div>
                <div class="progress-track" style="height:8px;margin-top:0.65rem;">
                  <div class="progress-fill" style="width:${prog.pct}%"></div>
                </div>
                <div class="lms-chapter-nav">
                  ${chapters.map((ch) => {
                    const done = LmsStore.isChapterCompleted(ch.id);
                    const isActive = ch.id === activeChapter.id;
                    return `
                      <a href="#/pembelajaran/${Utils.escapeHtml(subject.id)}/${Utils.escapeHtml(ch.id)}" class="lms-chapter-link ${isActive ? 'is-active' : ''}">
                        <span>${Utils.escapeHtml(ch.title)}</span>
                        <span style="color:${done ? 'var(--green-600)' : 'var(--text-muted)'};flex-shrink:0;">
                          ${Utils.icon(done ? 'check-circle-2' : 'circle', 17)}
                        </span>
                      </a>
                    `;
                  }).join('')}
                </div>
              </aside>

              <!-- Konten Bab, Materi & Evaluasi Pre-Test / Post-Test -->
              <div class="lms-article">
                <div style="display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:1rem;padding-bottom:1rem;border-bottom:1px solid var(--border-light);">
                  <div>
                    <div style="display:flex;gap:0.45rem;flex-wrap:wrap;margin-bottom:0.45rem;">
                      <span class="badge badge--green">Bab ${activeIndex + 1} dari ${chapters.length}</span>
                      ${activeChapter.demo ? '<span class="badge badge--demo">Materi Contoh</span>' : ''}
                    </div>
                    <h2 style="font-size:clamp(1.25rem,2.2vw,1.65rem);">${Utils.escapeHtml(activeChapter.title)}</h2>
                    ${activeChapter.summary ? `<p class="form-hint" style="margin-top:0.3rem;">${Utils.escapeHtml(activeChapter.summary)}</p>` : ''}
                  </div>
                  <button type="button" class="btn ${isCompleted ? 'btn--green' : 'btn--outline'} btn--sm" id="toggle-chapter-done" data-chapter-id="${Utils.escapeHtml(activeChapter.id)}">
                    ${Utils.icon(isCompleted ? 'check-circle-2' : 'circle-check', 16)}
                    <span>${isCompleted ? 'Selesai Dipelajari' : 'Tandai Bab Selesai'}</span>
                  </button>
                </div>

                <!-- Materi Teks -->
                <div class="lms-reading-body">${Utils.escapeHtml(activeChapter.content || 'Materi ringkasan bab belum ditambahkan.')}</div>

                <!-- Video & Dokumen Pendukung Bab -->
                ${attachedVideos.length || attachedDocs.length ? `
                  <div style="margin-top:1.75rem;padding-top:1.35rem;border-top:1px solid var(--border-light);">
                    <h3 style="font-size:1.05rem;margin-bottom:1rem;">Materi Pendukung Bab</h3>
                    ${attachedVideos.length ? `
                      <div class="cards-grid" style="margin-bottom:1.25rem;">
                        ${attachedVideos.map((v) => PublicViews.renderVideoCard(v)).join('')}
                      </div>
                    ` : ''}
                    ${attachedDocs.length ? `
                      <div class="cards-grid">
                        ${attachedDocs.map((d) => PublicViews.renderDocumentCard(d)).join('')}
                      </div>
                    ` : ''}
                  </div>
                ` : ''}

                <!-- Evaluasi Pre-Test & Post-Test -->
                <div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border-light);">
                  <h3 style="font-size:1.1rem;margin-bottom:0.3rem;">Evaluasi Pemahaman (Pre-Test &amp; Post-Test)</h3>
                  <p class="form-hint">Pre-Test bersifat diagnostik dan tidak memblokir akses materi. Anda tetap dapat mempelajari seluruh bab kapan saja.</p>

                  <div class="lms-tests-grid">
                    ${this.renderChapterTestCard(comp.preTest, comp.preInfo, 'pre')}
                    ${this.renderChapterTestCard(comp.postTest, comp.postInfo, 'post')}
                  </div>

                  ${this.renderPrePostComparisonCard(comp)}
                </div>

                <!-- Navigasi Antar Bab -->
                <div style="margin-top:2rem;padding-top:1.25rem;border-top:1px solid var(--border-light);display:flex;flex-wrap:wrap;justify-content:space-between;gap:0.75rem;">
                  ${prevChapter
                    ? `<a href="#/pembelajaran/${Utils.escapeHtml(subject.id)}/${Utils.escapeHtml(prevChapter.id)}" class="btn btn--outline btn--sm">${Utils.icon('arrow-left', 15)} Bab Sebelumnya</a>`
                    : '<span></span>'}
                  ${nextChapter
                    ? `<a href="#/pembelajaran/${Utils.escapeHtml(subject.id)}/${Utils.escapeHtml(nextChapter.id)}" class="btn btn--primary btn--sm">Bab Selanjutnya ${Utils.icon('arrow-right', 15)}</a>`
                    : `<a href="#/pembelajaran" class="btn btn--outline btn--sm">${Utils.icon('list', 15)} Kembali ke Daftar Mata Pelajaran</a>`}
                </div>
              </div>
            </div>
          </section>
        </main>
        ${PublicViews.renderFooter()}
      `;
    },

    renderChapterTestCard(test, statusInfo, variant) {
      if (!test) {
        return `
          <div class="test-summary-card test-summary-card--${variant}">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="badge ${variant === 'pre' ? 'badge--teal' : 'badge--orange'}">${variant === 'pre' ? 'Pre-Test' : 'Post-Test'}</span>
              <span class="badge badge--neutral">Belum Diterbitkan</span>
            </div>
            <p class="form-hint">Tes belum diterbitkan oleh pengajar.</p>
          </div>
        `;
      }

      const totals = LmsStore.getTestTotals(test.id);
      const compat = LmsStore.getTestCompatibilityInfo(test.id);
      const attempt = statusInfo?.attempt;
      let scoreLine = '';

      if (statusInfo?.key === 'graded' && attempt) {
        const passBadge = variant === 'post'
          ? `<span class="badge ${attempt.grading.passed ? 'badge--green' : 'badge--orange'}">${attempt.grading.passed ? 'Lulus' : 'Belum Lulus'}</span>`
          : '';
        scoreLine = `
          <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
            <strong style="font-size:1.1rem;color:var(--green-800);">Nilai: ${GradingService.formatScore(attempt.grading.finalScore)} / 100</strong>
            ${passBadge}
          </div>
        `;
      } else if (statusInfo?.key === 'pending_review' && attempt) {
        scoreLine = `<div class="form-hint">Arsip V2 (baca-saja) &bull; Poin objektif historis: <strong>${attempt.grading.objectivePoints ?? 0} / ${attempt.grading.maxObjectivePoints ?? 0}</strong></div>`;
      }

      let actionBtn = '';
      if (attempt) {
        actionBtn = `<a href="#/tes/${Utils.escapeHtml(test.id)}/hasil" class="btn btn--outline btn--sm">${Utils.icon('bar-chart-2', 15)} ${statusInfo?.key === 'pending_review' ? 'Lihat Arsip Hasil' : 'Lihat Hasil Tes'}</a>`;
      } else if (compat.needsAdjustment) {
        actionBtn = `<div class="form-hint" style="color:var(--orange-800);"><strong>Perlu Penyesuaian:</strong> Tes ini masih mengandung soal non-pilihan-ganda dan belum dapat dikerjakan.</div>`;
      } else if (totals.questionCount === 0) {
        actionBtn = `<span class="form-hint">Belum ada soal pada tes ini.</span>`;
      } else {
        actionBtn = `<a href="#/tes/${Utils.escapeHtml(test.id)}" class="btn ${variant === 'pre' ? 'btn--green' : 'btn--primary'} btn--sm">${Utils.icon('play', 15)} ${statusInfo?.key === 'in_progress' ? 'Lanjutkan Tes' : `Kerjakan ${GradingService.testTypeLabel(test.type)}`}</a>`;
      }

      return `
        <div class="test-summary-card test-summary-card--${variant}">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;">
            <span class="badge ${variant === 'pre' ? 'badge--teal' : 'badge--orange'}">${GradingService.testTypeLabel(test.type)}</span>
            <span class="badge ${statusInfo?.badge || 'badge--neutral'}">${statusInfo?.label || 'Belum Dikerjakan'}</span>
          </div>
          <div>
            <h4 style="font-size:1rem;color:var(--green-800);margin-bottom:0.25rem;">${Utils.escapeHtml(test.title)}</h4>
            <p class="form-hint">${Utils.escapeHtml(test.description || '')}</p>
          </div>
          <div style="font-size:0.82rem;color:var(--text-secondary);">
            ${totals.questionCount} Soal &bull; Total ${totals.totalPoints} Poin
            ${variant === 'post' ? ` &bull; KKM ${test.passingScore}` : ''}
          </div>
          ${scoreLine}
          <div style="margin-top:auto;padding-top:0.4rem;">${actionBtn}</div>
        </div>
      `;
    },

    renderPrePostComparisonCard(comp) {
      if (!comp.preTest && !comp.postTest) return '';

      if (comp.bothGraded) {
        const preScore = comp.preInfo.attempt.grading.finalScore;
        const postScore = comp.postInfo.attempt.grading.finalScore;
        const diff = comp.diff;
        const diffLabel = diff > 0
          ? `+${GradingService.formatScore(diff)} poin (Peningkatan)`
          : diff < 0
            ? `${GradingService.formatScore(diff)} poin (Penurunan)`
            : '0 poin (Tetap)';
        const badgeClass = diff > 0 ? 'badge--green' : diff < 0 ? 'badge--orange' : 'badge--neutral';

        return `
          <div class="comparison-card">
            <div>
              <div style="font-size:0.82rem;font-weight:600;color:var(--green-700);margin-bottom:0.25rem;">Ringkasan Perbandingan Pre-Test &amp; Post-Test</div>
              <div class="comparison-metrics">
                <div>
                  <div class="comparison-metric__label">Nilai Pre-Test</div>
                  <div class="comparison-metric__val">${GradingService.formatScore(preScore)}</div>
                </div>
                <div>${Utils.icon('arrow-right', 18)}</div>
                <div>
                  <div class="comparison-metric__label">Nilai Post-Test</div>
                  <div class="comparison-metric__val">${GradingService.formatScore(postScore)}</div>
                </div>
              </div>
            </div>
            <div>
              <span class="badge ${badgeClass}" style="font-size:0.88rem;padding:0.45rem 0.9rem;">
                ${Utils.icon(diff >= 0 ? 'trending-up' : 'trending-down', 16)}
                <span>${diffLabel}</span>
              </span>
            </div>
          </div>
        `;
      }

      const preStatusText = comp.preInfo ? comp.preInfo.label : 'Tidak tersedia';
      const postStatusText = comp.postInfo ? comp.postInfo.label : 'Tidak tersedia';

      return `
        <div class="comparison-card" style="background:var(--bg-subtle);border-color:var(--border-light);">
          <div>
            <strong style="font-size:0.9rem;color:var(--green-800);">Perbandingan Pre-Test &amp; Post-Test</strong>
            <p class="form-hint" style="margin-top:0.2rem;">
              Selisih nilai final dalam poin akan ditampilkan setelah kedua tes selesai dinilai (Pre-Test: <strong>${preStatusText}</strong>, Post-Test: <strong>${postStatusText}</strong>).
            </p>
          </div>
        </div>
      `;
    },

    /* ---------------- HALAMAN PENGERJAAN TES (QUIZ RUNNER) ---------------- */
    renderQuizRunner(testId) {
      const test = LmsStore.getTestById(testId);
      if (!test || test.status !== 'published') {
        return `
          ${PublicViews.renderHeader('#/pembelajaran')}
          <main id="main-content" class="section">
            <div class="container">
              <div class="empty-state">
                <h1 class="empty-state__title">Tes Tidak Tersedia</h1>
                <p class="empty-state__desc">Tes ini belum diterbitkan atau tidak ditemukan.</p>
                <a href="#/pembelajaran" class="btn btn--outline">Kembali ke Pembelajaran</a>
              </div>
            </div>
          </main>
          ${PublicViews.renderFooter()}
        `;
      }

      const existingAttempt = LmsStore.getAttemptByTestId(test.id);
      if (existingAttempt) {
        return this.renderTestResult(test.id);
      }

      const chapter = LmsStore.getChapterById(test.chapterId);
      const subject = chapter ? LmsStore.getSubjectById(chapter.subjectId) : null;
      const compat = LmsStore.getTestCompatibilityInfo(test.id);
      const questions = compat.questions;

      if (compat.needsAdjustment) {
        return `
          ${PublicViews.renderHeader('#/pembelajaran')}
          <main id="main-content" class="section">
            <div class="container">
              <div class="empty-state">
                <div class="empty-state__icon">${Utils.icon('alert-triangle', 28)}</div>
                <h1 class="empty-state__title">Tes Perlu Penyesuaian</h1>
                <p class="empty-state__desc">${Utils.escapeHtml(compat.reason)} Admin perlu mengonversi atau mengganti soal lama menjadi Pilihan Ganda terlebih dahulu.</p>
                <a href="#/pembelajaran/${Utils.escapeHtml(subject?.id || '')}/${Utils.escapeHtml(chapter?.id || '')}" class="btn btn--outline">Kembali ke Bab</a>
              </div>
            </div>
          </main>
          ${PublicViews.renderFooter()}
        `;
      }

      if (!questions.length) {
        return `
          ${PublicViews.renderHeader('#/pembelajaran')}
          <main id="main-content" class="section">
            <div class="container">
              <div class="empty-state">
                <h1 class="empty-state__title">${Utils.escapeHtml(test.title)}</h1>
                <p class="empty-state__desc">Belum ada pertanyaan pilihan ganda pada tes ini. Silakan tambahkan soal melalui Quiz Builder Admin.</p>
                <a href="#/pembelajaran/${Utils.escapeHtml(subject?.id || '')}/${Utils.escapeHtml(chapter?.id || '')}" class="btn btn--outline">Kembali ke Bab</a>
              </div>
            </div>
          </main>
          ${PublicViews.renderFooter()}
        `;
      }

      return `
        ${PublicViews.renderHeader('#/pembelajaran')}
        <main id="main-content" class="section" style="padding-block:2rem;background:var(--bg-subtle);min-height:calc(100vh - 220px);">
          <div class="container quiz-runner-wrap" id="quiz-runner-root" data-test-id="${Utils.escapeHtml(test.id)}">
            <div class="quiz-header-card">
              <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:0.75rem;margin-bottom:0.85rem;">
                <div>
                  <div class="form-hint" style="margin-bottom:0.25rem;">
                    ${Utils.escapeHtml(subject?.title || '')} &bull; ${Utils.escapeHtml(chapter?.title || '')}
                  </div>
                  <h1 style="font-size:clamp(1.2rem,2.2vw,1.6rem);">${Utils.escapeHtml(test.title)}</h1>
                </div>
                <div style="display:flex;gap:0.45rem;flex-wrap:wrap;">
                  <span class="badge ${test.type === 'pre_test' ? 'badge--teal' : 'badge--orange'}">${GradingService.testTypeLabel(test.type)}</span>
                  <span class="badge badge--neutral">${questions.length} Soal Pilihan Ganda</span>
                </div>
              </div>
              ${test.description ? `<p class="form-hint" style="margin-bottom:0.85rem;">${Utils.escapeHtml(test.description)}</p>` : ''}
              <div id="quiz-progress-meta"></div>
            </div>

            <div class="quiz-runner-grid">
              <div class="quiz-question-card" id="quiz-question-slot"></div>
              <aside class="quiz-nav-panel">
                <strong style="font-size:0.9rem;color:var(--green-800);">Navigasi Soal</strong>
                <p class="form-hint" style="margin-top:0.2rem;">Hijau menandakan soal sudah dijawab.</p>
                <div class="quiz-pills-grid" id="quiz-pills-slot"></div>
                <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--border-light);display:flex;flex-direction:column;gap:0.55rem;">
                  <button type="button" class="btn btn--primary" id="quiz-submit-trigger" style="width:100%;">
                    ${Utils.icon('send', 16)} Kirim Jawaban
                  </button>
                  <a href="#/pembelajaran/${Utils.escapeHtml(subject?.id || '')}/${Utils.escapeHtml(chapter?.id || '')}" class="btn btn--ghost btn--sm" style="width:100%;">
                    Kembali ke Bab (Simpan Draft)
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </main>
        ${PublicViews.renderFooter()}
      `;
    },

    bindQuizRunner(testId) {
      const root = document.getElementById('quiz-runner-root');
      if (!root) return;

      const test = LmsStore.getTestById(testId);
      const compat = LmsStore.getTestCompatibilityInfo(testId);
      if (!test || !compat.canTakeTest) return;

      const questions = compat.questions;
      const saved = LmsStore.getInProgress(testId) || { answers: {}, currentIndex: 0 };
      const answers = { ...(saved.answers || {}) };
      let currentIndex = Math.max(0, Math.min(questions.length - 1, Number(saved.currentIndex) || 0));

      const isQuestionAnswered = (q) => {
        const val = answers[q.id];
        return typeof val === 'number' && Number.isInteger(val) && val >= 0 && val <= 3;
      };

      const renderRunnerStep = () => {
        const q = questions[currentIndex];
        const answeredCount = questions.filter(isQuestionAnswered).length;
        const pct = Math.round((answeredCount / questions.length) * 100);

        const progEl = document.getElementById('quiz-progress-meta');
        if (progEl) {
          progEl.innerHTML = `
            <div class="summary-metric__row">
              <span>Soal ${currentIndex + 1} dari ${questions.length}</span>
              <strong>${answeredCount} / ${questions.length} terjawab (${pct}%)</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${pct}%"></div>
            </div>
          `;
        }

        const letters = ['A', 'B', 'C', 'D'];
        const inputHtml = `
          <div class="quiz-option-list" role="radiogroup" aria-label="Pilihan Jawaban">
            ${(q.options || []).map((opt, idx) => {
              const selected = answers[q.id] === idx;
              return `
                <label class="quiz-option ${selected ? 'is-selected' : ''}">
                  <input type="radio" name="q-radio-${Utils.escapeHtml(q.id)}" value="${idx}" ${selected ? 'checked' : ''}>
                  <span><strong>${letters[idx]}.</strong> ${Utils.escapeHtml(opt)}</span>
                </label>
              `;
            }).join('')}
          </div>
        `;

        const slot = document.getElementById('quiz-question-slot');
        if (slot) {
          slot.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap;margin-bottom:1rem;">
              <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                <span class="badge badge--green">Nomor ${currentIndex + 1}</span>
                <span class="badge badge--teal">Pilihan Ganda</span>
              </div>
              <span class="badge badge--neutral">${q.points} Poin</span>
            </div>
            <h2 style="font-size:1.12rem;line-height:1.55;color:var(--text-primary);font-weight:600;">${Utils.escapeHtml(q.question)}</h2>
            ${inputHtml}
            <div style="margin-top:1.75rem;padding-top:1.15rem;border-top:1px solid var(--border-light);display:flex;justify-content:space-between;gap:0.75rem;flex-wrap:wrap;">
              <button type="button" class="btn btn--outline" id="quiz-prev-btn" ${currentIndex === 0 ? 'disabled' : ''}>
                ${Utils.icon('arrow-left', 16)} Sebelumnya
              </button>
              ${currentIndex < questions.length - 1
                ? `<button type="button" class="btn btn--green" id="quiz-next-btn">Selanjutnya ${Utils.icon('arrow-right', 16)}</button>`
                : `<button type="button" class="btn btn--primary" id="quiz-finish-inline-btn">${Utils.icon('send', 16)} Kirim Jawaban</button>`}
            </div>
          `;
        }

        const pillsSlot = document.getElementById('quiz-pills-slot');
        if (pillsSlot) {
          pillsSlot.innerHTML = questions.map((item, idx) => `
            <button type="button" class="quiz-num-pill ${isQuestionAnswered(item) ? 'is-answered' : ''} ${idx === currentIndex ? 'is-current' : ''}" data-jump-q="${idx}">
              ${idx + 1}
            </button>
          `).join('');

          pillsSlot.querySelectorAll('[data-jump-q]').forEach((btn) => {
            btn.addEventListener('click', () => {
              currentIndex = Number(btn.dataset.jumpQ);
              LmsStore.saveInProgress(testId, answers, currentIndex);
              renderRunnerStep();
            });
          });
        }

        slot?.querySelectorAll(`input[name="q-radio-${q.id}"]`).forEach((radio) => {
          radio.addEventListener('change', (e) => {
            answers[q.id] = Number(e.target.value);
            LmsStore.saveInProgress(testId, answers, currentIndex);
            renderRunnerStep();
          });
        });

        document.getElementById('quiz-prev-btn')?.addEventListener('click', () => {
          if (currentIndex > 0) {
            currentIndex -= 1;
            LmsStore.saveInProgress(testId, answers, currentIndex);
            renderRunnerStep();
          }
        });

        document.getElementById('quiz-next-btn')?.addEventListener('click', () => {
          if (currentIndex < questions.length - 1) {
            currentIndex += 1;
            LmsStore.saveInProgress(testId, answers, currentIndex);
            renderRunnerStep();
          }
        });

        document.getElementById('quiz-finish-inline-btn')?.addEventListener('click', handleConfirmSubmit);

        UI.refreshIcons();
      };

      const handleConfirmSubmit = () => {
        const unansweredCount = questions.filter((q) => !isQuestionAnswered(q)).length;
        const msg = unansweredCount > 0
          ? `Masih ada ${unansweredCount} soal yang belum dijawab (soal kosong bernilai 0 poin). Apakah Anda yakin ingin mengirim jawaban?`
          : 'Apakah Anda yakin ingin mengirim jawaban? Nilai akan langsung dihitung secara otomatis.';

        UI.Confirm.open({
          title: 'Kirim Jawaban Tes?',
          message: msg,
          confirmLabel: 'Ya, Kirim Jawaban',
          danger: false,
          onConfirm: () => {
            try {
              LmsStore.submitTest(testId, answers);
              UI.Toast.show('Jawaban tes berhasil dikirim dan dinilai otomatis.', 'success');
              Router.navigate(`#/tes/${testId}/hasil`);
            } catch (err) {
              UI.Toast.show(err.message || 'Gagal mengirim jawaban.', 'error');
            }
          }
        });
      };

      document.getElementById('quiz-submit-trigger')?.addEventListener('click', handleConfirmSubmit);
      renderRunnerStep();
    },

    /* ---------------- HALAMAN HASIL TES PESERTA ---------------- */
    renderTestResult(testId) {
      const attempt = LmsStore.getAttemptByTestId(testId);
      const test = LmsStore.getTestById(testId);
      if (!attempt) {
        return `
          ${PublicViews.renderHeader('#/pembelajaran')}
          <main id="main-content" class="section">
            <div class="container">
              <div class="empty-state">
                <h1 class="empty-state__title">Belum Ada Pengerjaan</h1>
                <p class="empty-state__desc">Anda belum mengerjakan tes ini.</p>
                <a href="#/tes/${Utils.escapeHtml(testId)}" class="btn btn--primary">Mulai Kerjakan Tes</a>
              </div>
            </div>
          </main>
          ${PublicViews.renderFooter()}
        `;
      }

      const snapTest = attempt.testSnapshot || test || {};
      const chapter = LmsStore.getChapterById(snapTest.chapterId);
      const subject = chapter ? LmsStore.getSubjectById(chapter.subjectId) : null;
      const grading = attempt.grading || {};
      const isGraded = grading.status === 'graded';
      const questions = attempt.questionSnapshots || [];
      const breakdown = GradingService.getAttemptBreakdownStats(attempt);
      const isLegacySnapshot = questions.some((q) => q.type !== 'multiple_choice');

      const comp = chapter ? LmsStore.getChapterComparison(chapter.id) : null;
      const subjProg = subject ? LmsStore.getSubjectProgress(subject.id) : null;

      const radius = 74;
      const circumference = 2 * Math.PI * radius;
      const scoreVal = isGraded ? grading.finalScore : 0;
      const dashOffset = isGraded ? circumference - (Math.max(0, Math.min(100, scoreVal)) / 100) * circumference : circumference * 0.75;
      const gaugeColor = !isGraded ? 'var(--warm-orange-main)' : grading.passed ? 'var(--green-500)' : 'var(--orange-500)';

      return `
        ${PublicViews.renderHeader('#/pembelajaran')}
        <main id="main-content" class="section" style="background:var(--bg-subtle);min-height:calc(100vh - 220px);">
          <div class="container quiz-runner-wrap">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
              <a href="#/pembelajaran/${Utils.escapeHtml(subject?.id || '')}/${Utils.escapeHtml(chapter?.id || '')}" class="btn btn--outline btn--sm">
                ${Utils.icon('arrow-left', 15)} Kembali ke Bab Pembelajaran
              </a>
              <button type="button" class="btn btn--danger-soft btn--sm" id="reset-attempt-btn" data-test-id="${Utils.escapeHtml(testId)}">
                ${Utils.icon('rotate-ccw', 15)} Reset Percobaan Demo
              </button>
            </div>

            <!-- Ringkasan & Visualisasi Skor -->
            <div class="result-hero-card">
              <div class="score-gauge" role="img" aria-label="${isGraded ? `Nilai akhir ${GradingService.formatScore(grading.finalScore)}` : 'Arsip V2 menunggu penilaian'}">
                <svg viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="${radius}" fill="none" stroke="var(--bg-subtle)" stroke-width="14" />
                  <circle
                    cx="90" cy="90" r="${radius}" fill="none"
                    stroke="${gaugeColor}" stroke-width="14" stroke-linecap="round"
                    stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}"
                  />
                </svg>
                <div class="score-gauge__center">
                  ${isGraded ? `
                    <div class="score-gauge__value">${GradingService.formatScore(grading.finalScore)}</div>
                    <div class="score-gauge__label">Nilai Akhir</div>
                  ` : `
                    <div style="color:var(--warm-orange-main);margin-bottom:0.2rem;">${Utils.icon('archive', 28)}</div>
                    <div class="score-gauge__label" style="font-weight:600;color:var(--orange-800);padding-inline:0.8rem;">Arsip V2</div>
                  `}
                </div>
              </div>

              <div>
                <div style="display:flex;gap:0.45rem;flex-wrap:wrap;margin-bottom:0.6rem;">
                  <span class="badge ${snapTest.type === 'pre_test' ? 'badge--teal' : 'badge--orange'}">${GradingService.testTypeLabel(snapTest.type)}</span>
                  <span class="badge ${isGraded ? 'badge--green' : 'badge--warm'}">${isGraded ? 'Selesai Dinilai Otomatis' : 'Arsip V2 (Menunggu Penilaian)'}</span>
                  ${isGraded ? `<span class="badge ${grading.passed ? 'badge--green' : 'badge--orange'}">${grading.passed ? 'Lulus' : 'Belum Lulus'}</span>` : ''}
                </div>

                <h1 style="font-size:clamp(1.25rem,2.3vw,1.7rem);margin-bottom:0.35rem;">${Utils.escapeHtml(snapTest.title || 'Hasil Tes')}</h1>
                <p class="form-hint" style="margin-bottom:1rem;">
                  ${Utils.escapeHtml(subject?.title || '')} &bull; ${Utils.escapeHtml(chapter?.title || '')} &bull; Dikirim ${Utils.formatDate(attempt.submittedAt)}
                </p>

                ${!isGraded ? `
                  <div class="alert-box alert-box--warn" style="margin-bottom:1rem;">
                    ${Utils.icon('archive', 18)}
                    <div>
                      <strong>Arsip Riwayat V2 (Baca-Saja):</strong> Pengerjaan ini berasal dari versi V2 sebelum pembaruan Pilihan Ganda. Nilai dan status historis (Menunggu Penilaian) dipertahankan tanpa diubah secara otomatis.
                    </div>
                  </div>
                ` : ''}

                <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(135px,1fr));margin-bottom:0;">
                  <div style="padding:0.75rem;border-radius:var(--radius-md);background:var(--bg-subtle);">
                    <div class="form-hint">Jawaban Benar</div>
                    <strong style="color:var(--green-700);">${breakdown.correctCount} Soal</strong>
                  </div>
                  <div style="padding:0.75rem;border-radius:var(--radius-md);background:var(--bg-subtle);">
                    <div class="form-hint">Jawaban Salah</div>
                    <strong style="color:var(--orange-800);">${breakdown.wrongCount} Soal</strong>
                  </div>
                  <div style="padding:0.75rem;border-radius:var(--radius-md);background:var(--bg-subtle);">
                    <div class="form-hint">Tidak Dijawab</div>
                    <strong>${breakdown.unansweredCount} Soal</strong>
                  </div>
                  <div style="padding:0.75rem;border-radius:var(--radius-md);background:var(--green-50);">
                    <div class="form-hint">${isGraded ? 'Poin &amp; KKM' : 'Poin Objektif'}</div>
                    <strong>
                      ${isGraded
                        ? `${grading.finalPoints ?? grading.objectivePoints ?? 0} / ${grading.totalMaxPoints ?? 0} (KKM ${snapTest.passingScore ?? 70})`
                        : `${grading.objectivePoints ?? 0} / ${grading.maxObjectivePoints ?? 0} Poin`}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            ${isGraded && snapTest.type === 'pre_test' && chapter ? `
              <div class="panel" style="margin-bottom:1.5rem;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;">
                <div>
                  <strong style="color:var(--green-800);">Pre-Test Selesai</strong>
                  <p class="form-hint" style="margin-top:0.15rem;">Lanjutkan mempelajari video kajian dan dokumen materi pada bab ini, lalu kerjakan Post-Test.</p>
                </div>
                <a href="#/pembelajaran/${Utils.escapeHtml(subject?.id || '')}/${Utils.escapeHtml(chapter.id)}" class="btn btn--green">
                  ${Utils.icon('play-circle', 16)} Lanjutkan ke Video &amp; Materi
                </a>
              </div>
            ` : ''}

            ${isGraded && snapTest.type === 'post_test' && chapter ? `
              <div class="panel" style="margin-bottom:1.5rem;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;">
                  <div style="flex:1;min-width:220px;">
                    <strong style="color:var(--green-800);">Progres Pembelajaran Diperbarui</strong>
                    <p class="form-hint" style="margin-top:0.15rem;">
                      Bab "${Utils.escapeHtml(chapter.title)}" telah tercatat selesai pada progres belajar Anda (${subjProg ? `${subjProg.completed}/${subjProg.total} bab • ${subjProg.pct}%` : '100%'}).
                    </p>
                  </div>
                  <a href="#/pembelajaran/${Utils.escapeHtml(subject?.id || '')}/${Utils.escapeHtml(chapter.id)}" class="btn btn--primary btn--sm">
                    ${Utils.icon('book-open', 15)} Kembali ke Materi Bab
                  </a>
                </div>
                ${comp && comp.bothGraded ? this.renderPrePostComparisonCard(comp) : ''}
              </div>
            ` : ''}

            ${isGraded && snapTest.type === 'pre_test' && comp && comp.bothGraded ? `
              <div style="margin-bottom:1.5rem;">
                ${this.renderPrePostComparisonCard(comp)}
              </div>
            ` : ''}

            <!-- Rincian Jawaban Per Soal -->
            <div class="panel">
              <div class="panel__head">
                <h2 class="panel__title">Rincian Jawaban${isLegacySnapshot ? ' (Arsip Snapshot)' : ''}</h2>
              </div>
              <div style="display:flex;flex-direction:column;gap:0.9rem;">
                ${questions.map((q, idx) => this.renderResultQuestionItem(q, idx, attempt)).join('')}
              </div>
            </div>
          </div>
        </main>
        ${PublicViews.renderFooter()}
      `;
    },

    renderResultQuestionItem(q, idx, attempt) {
      const userAns = attempt.answers?.[q.id];

      if (q.type === 'multiple_choice') {
        const letters = ['A', 'B', 'C', 'D'];
        const isCorrect = typeof userAns === 'number' && userAns === q.correctAnswer;
        const userText = typeof userAns === 'number' ? `${letters[userAns]}. ${q.options?.[userAns] || ''}` : 'Tidak dijawab';
        const correctText = `${letters[q.correctAnswer]}. ${q.options?.[q.correctAnswer] || ''}`;

        return `
          <div class="result-breakdown-item">
            <div style="display:flex;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.5rem;">
              <div style="display:flex;gap:0.4rem;align-items:center;">
                <strong>Soal ${idx + 1}</strong>
                <span class="badge badge--teal">Pilihan Ganda</span>
              </div>
              <span class="badge ${isCorrect ? 'badge--green' : 'badge--orange'}">${isCorrect ? `Benar (+${q.points} poin)` : 'Salah / Kosong (0 poin)'}</span>
            </div>
            <p style="font-weight:500;margin-bottom:0.5rem;">${Utils.escapeHtml(q.question)}</p>
            <div class="form-hint"><strong>Jawaban Anda:</strong> ${Utils.escapeHtml(userText)}</div>
            ${!isCorrect ? `<div class="form-hint" style="color:var(--green-700);"><strong>Kunci Jawaban:</strong> ${Utils.escapeHtml(correctText)}</div>` : ''}
            ${q.explanation ? `<div class="form-hint" style="margin-top:0.35rem;"><em>Pembahasan: ${Utils.escapeHtml(q.explanation)}</em></div>` : ''}
          </div>
        `;
      }

      if (q.type === 'true_false') {
        const isCorrect = typeof userAns === 'boolean' && userAns === q.correctAnswer;
        const userText = typeof userAns === 'boolean' ? (userAns ? 'Benar' : 'Salah') : 'Tidak dijawab';
        const correctText = q.correctAnswer === true ? 'Benar' : 'Salah';

        return `
          <div class="result-breakdown-item">
            <div style="display:flex;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.5rem;">
              <div style="display:flex;gap:0.4rem;align-items:center;">
                <strong>Soal ${idx + 1}</strong>
                <span class="badge badge--purple">Benar / Salah</span>
              </div>
              <span class="badge ${isCorrect ? 'badge--green' : 'badge--orange'}">${isCorrect ? `Benar (+${q.points} poin)` : 'Salah / Kosong (0 poin)'}</span>
            </div>
            <p style="font-weight:500;margin-bottom:0.5rem;">${Utils.escapeHtml(q.question)}</p>
            <div class="form-hint"><strong>Jawaban Anda:</strong> ${userText}</div>
            ${!isCorrect ? `<div class="form-hint" style="color:var(--green-700);"><strong>Kunci Jawaban:</strong> ${correctText}</div>` : ''}
            ${q.explanation ? `<div class="form-hint" style="margin-top:0.35rem;"><em>Pembahasan: ${Utils.escapeHtml(q.explanation)}</em></div>` : ''}
          </div>
        `;
      }

      const essayGrade = attempt.grading?.essayGrades?.[q.id];
      const hasGrade = essayGrade && typeof essayGrade.awardedPoints === 'number';
      return `
        <div class="result-breakdown-item">
          <div style="display:flex;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.5rem;">
            <div style="display:flex;gap:0.4rem;align-items:center;">
              <strong>Soal ${idx + 1}</strong>
              <span class="badge badge--orange">Essay</span>
            </div>
            <span class="badge ${hasGrade ? 'badge--green' : 'badge--warm'}">
              ${hasGrade ? `Nilai: ${essayGrade.awardedPoints} / ${q.points} poin` : `Menunggu Penilaian (Maks ${q.points} poin)`}
            </span>
          </div>
          <p style="font-weight:500;margin-bottom:0.5rem;">${Utils.escapeHtml(q.question)}</p>
          <div class="essay-answer-box">${Utils.escapeHtml((typeof userAns === 'string' && userAns.trim()) ? userAns : 'Tidak dijawab')}</div>
          ${hasGrade && essayGrade.feedback ? `
            <div class="alert-box alert-box--info" style="margin-top:0.65rem;">
              ${Utils.icon('message-square', 16)}
              <div><strong>Umpan Balik Pengajar:</strong> ${Utils.escapeHtml(essayGrade.feedback)}</div>
            </div>
          ` : ''}
        </div>
      `;
    },

    bindChapterWorkspace() {
      document.getElementById('toggle-chapter-done')?.addEventListener('click', (e) => {
        const chapId = e.currentTarget.dataset.chapterId;
        const nowDone = LmsStore.toggleChapterCompleted(chapId);
        UI.Toast.show(nowDone ? 'Bab ditandai selesai dipelajari.' : 'Status selesai bab dibatalkan.', 'success');
        Router.renderCurrent();
      });
    },

    bindTestResult() {
      document.getElementById('reset-attempt-btn')?.addEventListener('click', (e) => {
        const testId = e.currentTarget.dataset.testId;
        UI.Confirm.open({
          title: 'Reset Percobaan Demo?',
          message: 'Hasil pengerjaan dan nilai untuk tes ini akan dihapus agar Anda dapat mencoba mengerjakan tes kembali dari awal.',
          confirmLabel: 'Ya, Reset Percobaan',
          danger: true,
          onConfirm: () => {
            LmsStore.resetTestAttempt(testId);
            UI.Toast.show('Percobaan tes telah direset.', 'success');
            Router.navigate(`#/tes/${testId}`);
          }
        });
      });
    }
  };

  /* ------------------------------------------------------------------------
     5. ADMIN LMS VIEWS (Mata Pelajaran, Bab & Quiz Builder Pilihan Ganda)
     ------------------------------------------------------------------------ */
  const LmsAdminViews = {
    activeBuilderTab: 'pre_test',

    renderSubjectsManager() {
      const subjects = LmsStore.getSubjects(true);
      const body = `
        <div class="admin-page-head">
          <div>
            <h1>Pembelajaran &amp; Quiz Builder</h1>
            <p class="form-hint">Kelola mata pelajaran, bab materi, serta susun Pre-Test &amp; Post-Test Pilihan Ganda dengan penilaian otomatis.</p>
          </div>
          <button type="button" class="btn btn--primary" id="btn-add-subject">
            ${Utils.icon('plus', 17)} Tambah Mata Pelajaran
          </button>
        </div>

        ${subjects.length ? `
          <div style="display:flex;flex-direction:column;gap:1.25rem;">
            ${subjects.map((subj) => {
              const chapters = LmsStore.getChaptersBySubject(subj.id, true);
              return `
                <section class="panel">
                  <div class="panel__head" style="border-bottom:1px solid var(--border-light);padding-bottom:0.9rem;">
                    <div>
                      <div style="display:flex;align-items:center;gap:0.45rem;flex-wrap:wrap;margin-bottom:0.35rem;">
                        <span class="badge badge--teal">${Utils.escapeHtml(subj.code)}</span>
                        <span class="badge ${subj.status === 'published' ? 'badge--green' : 'badge--neutral'}">${subj.status === 'published' ? 'Terbit' : 'Draft'}</span>
                        <span class="badge ${Utils.getCategoryBadgeClass(subj.category)}">${Utils.escapeHtml(subj.category)}</span>
                      </div>
                      <h2 style="font-size:1.15rem;">${Utils.escapeHtml(subj.title)}</h2>
                      <p class="form-hint">${Utils.escapeHtml(subj.description || '')}</p>
                    </div>
                    <div style="display:flex;gap:0.45rem;flex-wrap:wrap;">
                      <button type="button" class="btn btn--green btn--sm" data-add-chapter="${Utils.escapeHtml(subj.id)}">
                        ${Utils.icon('plus', 15)} Tambah Bab
                      </button>
                      <button type="button" class="icon-btn" data-edit-subject="${Utils.escapeHtml(subj.id)}" title="Edit Mata Pelajaran" aria-label="Edit mata pelajaran">
                        ${Utils.icon('pencil', 16)}
                      </button>
                      <button type="button" class="icon-btn icon-btn--danger" data-delete-subject="${Utils.escapeHtml(subj.id)}" title="Hapus Mata Pelajaran" aria-label="Hapus mata pelajaran">
                        ${Utils.icon('trash-2', 16)}
                      </button>
                    </div>
                  </div>

                  ${chapters.length ? `
                    <div class="recent-list">
                      ${chapters.map((ch) => {
                        const { preTest, postTest } = LmsStore.ensureChapterTests(ch.id, false);
                        const preTotals = LmsStore.getTestTotals(preTest.id);
                        const postTotals = LmsStore.getTestTotals(postTest.id);
                        const preCompat = LmsStore.getTestCompatibilityInfo(preTest.id);
                        const postCompat = LmsStore.getTestCompatibilityInfo(postTest.id);
                        const chapterNeedsAdjustment = preCompat.needsAdjustment || postCompat.needsAdjustment;
                        return `
                          <div class="recent-item" style="flex-wrap:wrap;">
                            <div class="recent-item__info" style="flex:1 1 200px;min-width:0;">
                              <div class="recent-item__title" style="white-space:normal;">${Utils.escapeHtml(ch.title)}</div>
                              <div class="recent-item__meta">
                                Pre-Test: ${preTotals.questionCount} soal (${preTotals.totalPoints} poin) &bull;
                                Post-Test: ${postTotals.questionCount} soal (${postTotals.totalPoints} poin)
                              </div>
                            </div>
                            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                              ${chapterNeedsAdjustment ? '<span class="badge badge--warm">Perlu Penyesuaian</span>' : ''}
                              <span class="badge ${ch.status === 'published' ? 'badge--green' : 'badge--neutral'}">${ch.status === 'published' ? 'Terbit' : 'Draft'}</span>
                              <a href="#/admin/pembelajaran/${Utils.escapeHtml(ch.id)}" class="btn btn--primary btn--sm">
                                ${Utils.icon('sliders', 15)} Editor Bab &amp; Quiz Builder
                              </a>
                              <button type="button" class="icon-btn icon-btn--danger" data-delete-chapter="${Utils.escapeHtml(ch.id)}" title="Hapus Bab" aria-label="Hapus bab">
                                ${Utils.icon('trash-2', 16)}
                              </button>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  ` : `<p class="form-hint">Belum ada bab pembelajaran pada mata pelajaran ini.</p>`}
                </section>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <h2 class="empty-state__title">Belum Ada Mata Pelajaran</h2>
            <p class="empty-state__desc">Buat mata pelajaran pertama untuk mulai menyusun bab dan kuis.</p>
          </div>
        `}
      `;

      return AdminViews.renderShell('#/admin/pembelajaran', 'Pembelajaran & Kuis', body);
    },

    bindSubjectsManager() {
      document.getElementById('btn-add-subject')?.addEventListener('click', () => this.openSubjectModal());
      document.querySelectorAll('[data-edit-subject]').forEach((btn) => {
        btn.addEventListener('click', () => this.openSubjectModal(btn.dataset.editSubject));
      });
      document.querySelectorAll('[data-delete-subject]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const subj = LmsStore.getSubjectById(btn.dataset.deleteSubject);
          if (!subj) return;
          const attemptCount = LmsStore.countAttemptsForSubject(subj.id);
          const warnText = attemptCount > 0
            ? ` PERINGATAN: Mata pelajaran ini memiliki ${attemptCount} riwayat pengerjaan tes yang juga akan ikut terhapus.`
            : '';
          UI.Confirm.open({
            title: 'Hapus Mata Pelajaran?',
            message: `Mata pelajaran "${subj.title}" beserta seluruh bab dan soal di dalamnya akan dihapus.${warnText}`,
            confirmLabel: 'Ya, Hapus',
            danger: true,
            onConfirm: () => {
              LmsStore.deleteSubject(subj.id);
              UI.Toast.show('Mata pelajaran berhasil dihapus.', 'success');
              Router.renderCurrent();
            }
          });
        });
      });

      document.querySelectorAll('[data-add-chapter]').forEach((btn) => {
        btn.addEventListener('click', () => this.openCreateChapterModal(btn.dataset.addChapter));
      });

      document.querySelectorAll('[data-delete-chapter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const chap = LmsStore.getChapterById(btn.dataset.deleteChapter);
          if (!chap) return;
          const attemptCount = LmsStore.countAttemptsForChapter(chap.id);
          const warnText = attemptCount > 0
            ? ` PERINGATAN: Bab ini memiliki ${attemptCount} hasil pengerjaan tes yang akan ikut terhapus.`
            : '';
          UI.Confirm.open({
            title: 'Hapus Bab Pembelajaran?',
            message: `Bab "${chap.title}" beserta Pre-Test dan Post-Test di dalamnya akan dihapus.${warnText}`,
            confirmLabel: 'Ya, Hapus Bab',
            danger: true,
            onConfirm: () => {
              LmsStore.deleteChapter(chap.id);
              UI.Toast.show('Bab pembelajaran berhasil dihapus.', 'success');
              Router.renderCurrent();
            }
          });
        });
      });
    },

    openSubjectModal(subjectId = null) {
      const existing = subjectId ? LmsStore.getSubjectById(subjectId) : null;
      UI.Modal.open({
        title: existing ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran',
        size: 'md',
        bodyHtml: `
          <form id="subject-form" class="form-stack">
            <div class="form-field">
              <label class="form-label" for="subj-title">Judul Mata Pelajaran <span>*</span></label>
              <input id="subj-title" class="input" type="text" required value="${Utils.escapeHtml(existing?.title || '')}" placeholder="Contoh: Manajemen Wakaf Produktif">
            </div>
            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="subj-code">Kode</label>
                <input id="subj-code" class="input" type="text" value="${Utils.escapeHtml(existing?.code || '')}" placeholder="WKF-101">
              </div>
              <div class="form-field">
                <label class="form-label" for="subj-category">Kategori</label>
                <select id="subj-category" class="select">
                  ${CONFIG.DOC_CATEGORIES.map((c) => `<option value="${c}" ${existing?.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="subj-instructor">Pengampu</label>
                <input id="subj-instructor" class="input" type="text" value="${Utils.escapeHtml(existing?.instructor || '')}" placeholder="Ustadzah Pengampu (Contoh)">
              </div>
              <div class="form-field">
                <label class="form-label" for="subj-status">Status</label>
                <select id="subj-status" class="select">
                  <option value="published" ${existing?.status === 'published' ? 'selected' : ''}>Terbit</option>
                  <option value="draft" ${existing?.status === 'draft' ? 'selected' : ''}>Draft</option>
                </select>
              </div>
            </div>
            <div class="form-field">
              <label class="form-label" for="subj-desc">Deskripsi</label>
              <textarea id="subj-desc" class="textarea" rows="3">${Utils.escapeHtml(existing?.description || '')}</textarea>
            </div>
          </form>
        `,
        footerHtml: `
          <button type="button" class="btn btn--outline" data-modal-close>Batal</button>
          <button type="submit" form="subject-form" class="btn btn--primary">${Utils.icon('save', 16)} Simpan</button>
        `
      });

      document.getElementById('subject-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          LmsStore.saveSubject(subjectId, {
            title: document.getElementById('subj-title').value,
            code: document.getElementById('subj-code').value,
            category: document.getElementById('subj-category').value,
            instructor: document.getElementById('subj-instructor').value,
            status: document.getElementById('subj-status').value,
            description: document.getElementById('subj-desc').value
          });
          UI.Modal.close();
          UI.Toast.show('Mata pelajaran berhasil disimpan.', 'success');
          Router.renderCurrent();
        } catch (err) {
          UI.Toast.show(err.message, 'error');
        }
      });
    },

    openCreateChapterModal(subjectId) {
      UI.Modal.open({
        title: 'Tambah Bab Pembelajaran',
        size: 'md',
        bodyHtml: `
          <form id="new-chap-form" class="form-stack">
            <div class="form-field">
              <label class="form-label" for="new-chap-title">Judul Bab <span>*</span></label>
              <input id="new-chap-title" class="input" type="text" required placeholder="Contoh: Bab 3: Tata Kelola Nadzir">
            </div>
            <div class="form-field">
              <label class="form-label" for="new-chap-summary">Ringkasan</label>
              <input id="new-chap-summary" class="input" type="text" placeholder="Ringkasan singkat materi bab...">
            </div>
            <div class="form-field">
              <label class="form-label" for="new-chap-status">Status</label>
              <select id="new-chap-status" class="select">
                <option value="published">Terbit</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </form>
        `,
        footerHtml: `
          <button type="button" class="btn btn--outline" data-modal-close>Batal</button>
          <button type="submit" form="new-chap-form" class="btn btn--primary">${Utils.icon('plus', 16)} Buat Bab &amp; Buka Quiz Builder</button>
        `
      });

      document.getElementById('new-chap-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const chap = LmsStore.createChapter(subjectId, {
            title: document.getElementById('new-chap-title').value,
            summary: document.getElementById('new-chap-summary').value,
            status: document.getElementById('new-chap-status').value
          });
          UI.Modal.close();
          UI.Toast.show('Bab baru beserta Pre-Test & Post-Test siap disusun.', 'success');
          Router.navigate(`#/admin/pembelajaran/${chap.id}`);
        } catch (err) {
          UI.Toast.show(err.message, 'error');
        }
      });
    },

    /* ---------------- EDITOR BAB & QUIZ BUILDER ---------------- */
    renderChapterQuizBuilder(chapterId) {
      const chap = LmsStore.getChapterById(chapterId);
      if (!chap) return this.renderSubjectsManager();
      const subj = LmsStore.getSubjectById(chap.subjectId);
      const { preTest, postTest } = LmsStore.ensureChapterTests(chap.id, true);
      const activeTest = this.activeBuilderTab === 'post_test' ? postTest : preTest;
      const questions = LmsStore.getQuestionsByTest(activeTest.id);
      const totals = LmsStore.getTestTotals(activeTest.id);
      const preCompat = LmsStore.getTestCompatibilityInfo(preTest.id);
      const postCompat = LmsStore.getTestCompatibilityInfo(postTest.id);
      const activeCompat = activeTest.id === postTest.id ? postCompat : preCompat;
      const archiveAttempts = LmsStore.getAttemptsByTestId(activeTest.id);

      const allDocs = DataStore.getDocuments();
      const allVideos = DataStore.getVideos();

      const body = `
        <div class="admin-page-head">
          <div>
            <div class="breadcrumb" style="margin-bottom:0.35rem;">
              <a href="#/admin/pembelajaran">Pembelajaran</a>
              <span>/</span>
              <span>${Utils.escapeHtml(subj?.title || '')}</span>
            </div>
            <h1>${Utils.escapeHtml(chap.title)}</h1>
          </div>
          <div style="display:flex;gap:0.6rem;flex-wrap:wrap;">
            <a href="#/pembelajaran/${Utils.escapeHtml(subj?.id || '')}/${Utils.escapeHtml(chap.id)}" class="btn btn--outline btn--sm">
              ${Utils.icon('eye', 15)} Lihat di Halaman Belajar
            </a>
            <a href="#/admin/pembelajaran" class="btn btn--ghost btn--sm">Kembali</a>
          </div>
        </div>

        <!-- Editor Informasi & Materi Bab -->
        <section class="panel" style="margin-bottom:1.5rem;">
          <div class="panel__head">
            <h2 class="panel__title">Informasi &amp; Materi Bab</h2>
            <span class="badge ${chap.status === 'published' ? 'badge--green' : 'badge--neutral'}">${chap.status === 'published' ? 'Terbit' : 'Draft'}</span>
          </div>
          <form id="chapter-editor-form" class="form-stack">
            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="chap-title">Judul Bab <span>*</span></label>
                <input id="chap-title" class="input" type="text" required value="${Utils.escapeHtml(chap.title)}">
              </div>
              <div class="form-field">
                <label class="form-label" for="chap-status">Status Bab</label>
                <select id="chap-status" class="select">
                  <option value="published" ${chap.status === 'published' ? 'selected' : ''}>Terbit</option>
                  <option value="draft" ${chap.status === 'draft' ? 'selected' : ''}>Draft</option>
                </select>
              </div>
            </div>
            <div class="form-field">
              <label class="form-label" for="chap-summary">Ringkasan Singkat</label>
              <input id="chap-summary" class="input" type="text" value="${Utils.escapeHtml(chap.summary || '')}">
            </div>
            <div class="form-field">
              <label class="form-label" for="chap-content">Isi Materi Teks</label>
              <textarea id="chap-content" class="textarea" rows="4">${Utils.escapeHtml(chap.content || '')}</textarea>
            </div>
            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label">Tautkan Dokumen Pendukung</label>
                <div style="display:flex;flex-direction:column;gap:0.35rem;max-height:140px;overflow-y:auto;padding:0.6rem;border:1px solid var(--border-light);border-radius:var(--radius-sm);">
                  ${allDocs.map((d) => `
                    <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.84rem;cursor:pointer;">
                      <input type="checkbox" name="chap-doc-ids" value="${Utils.escapeHtml(d.id)}" ${(chap.documentIds || []).includes(d.id) ? 'checked' : ''}>
                      <span>${Utils.escapeHtml(d.title)} (${d.type.toUpperCase()})</span>
                    </label>
                  `).join('') || '<span class="form-hint">Belum ada dokumen.</span>'}
                </div>
              </div>
              <div class="form-field">
                <label class="form-label">Tautkan Video Pendukung</label>
                <div style="display:flex;flex-direction:column;gap:0.35rem;max-height:140px;overflow-y:auto;padding:0.6rem;border:1px solid var(--border-light);border-radius:var(--radius-sm);">
                  ${allVideos.map((v) => `
                    <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.84rem;cursor:pointer;">
                      <input type="checkbox" name="chap-vid-ids" value="${Utils.escapeHtml(v.id)}" ${(chap.videoIds || []).includes(v.id) ? 'checked' : ''}>
                      <span>${Utils.escapeHtml(v.title)}</span>
                    </label>
                  `).join('') || '<span class="form-hint">Belum ada video.</span>'}
                </div>
              </div>
            </div>
            <div style="display:flex;justify-content:flex-end;">
              <button type="submit" class="btn btn--green btn--sm">${Utils.icon('save', 15)} Simpan Materi Bab</button>
            </div>
          </form>
        </section>

        <!-- QUIZ BUILDER PRE-TEST & POST-TEST -->
        <section class="panel">
          <div class="panel__head">
            <div>
              <h2 class="panel__title">Quiz Builder Bab</h2>
              <p class="form-hint">Kelola pengaturan tes dan pertanyaan Pilihan Ganda (A–D) secara terpisah untuk Pre-Test dan Post-Test.</p>
            </div>
          </div>

          <div class="qb-tabs" role="tablist">
            <button type="button" class="qb-tab ${activeTest.type === 'pre_test' ? 'is-active' : ''}" data-qb-tab="pre_test">
              ${Utils.icon('clipboard-list', 16)}
              <span>Pre-Test (${LmsStore.getTestTotals(preTest.id).questionCount} Soal)</span>
              ${preCompat.needsAdjustment ? '<span class="badge badge--warm">Perlu Penyesuaian</span>' : ''}
            </button>
            <button type="button" class="qb-tab ${activeTest.type === 'post_test' ? 'is-active' : ''}" data-qb-tab="post_test">
              ${Utils.icon('award', 16)}
              <span>Post-Test (${LmsStore.getTestTotals(postTest.id).questionCount} Soal)</span>
              ${postCompat.needsAdjustment ? '<span class="badge badge--warm">Perlu Penyesuaian</span>' : ''}
            </button>
          </div>

          ${activeCompat.needsAdjustment ? `
            <div class="alert-box alert-box--warn" style="margin-bottom:1.25rem;">
              ${Utils.icon('alert-triangle', 19)}
              <div>
                <strong>Perlu Penyesuaian:</strong> ${Utils.escapeHtml(activeCompat.reason)} Pengerjaan baru oleh peserta dinonaktifkan hingga seluruh soal lama dikonversi ke Pilihan Ganda atau dihapus secara manual.
              </div>
            </div>
          ` : ''}

          <!-- Pengaturan Tes -->
          <form id="test-settings-form" class="form-stack" style="padding:1.15rem;border-radius:var(--radius-md);background:var(--bg-subtle);border:1px solid var(--border-light);margin-bottom:1.5rem;">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem;">
              <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                <strong style="color:var(--green-800);">Pengaturan ${GradingService.testTypeLabel(activeTest.type)}</strong>
                ${activeCompat.needsAdjustment ? '<span class="badge badge--warm">Perlu Penyesuaian</span>' : ''}
              </div>
              <div style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:center;">
                <span class="badge badge--green">${totals.questionCount} Soal</span>
                <span class="badge badge--orange">Total ${totals.totalPoints} Poin</span>
                ${archiveAttempts.length ? `
                  <button type="button" class="btn btn--outline btn--sm" id="btn-view-test-archive" data-test-id="${Utils.escapeHtml(activeTest.id)}">
                    ${Utils.icon('archive', 14)} Arsip Riwayat (${archiveAttempts.length})
                  </button>
                ` : ''}
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="test-title">Judul Tes <span>*</span></label>
                <input id="test-title" class="input" type="text" required value="${Utils.escapeHtml(activeTest.title)}">
              </div>
              <div class="form-row-2">
                <div class="form-field">
                  <label class="form-label" for="test-passing">Nilai Minimum Kelulusan (0–100)</label>
                  <input id="test-passing" class="input" type="number" min="0" max="100" value="${activeTest.passingScore}">
                </div>
                <div class="form-field">
                  <label class="form-label" for="test-status">Status Tes</label>
                  <select id="test-status" class="select">
                    <option value="published" ${activeTest.status === 'published' ? 'selected' : ''}>Terbit</option>
                    <option value="draft" ${activeTest.status === 'draft' ? 'selected' : ''}>Draft</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" for="test-desc">Deskripsi / Instruksi Pengerjaan</label>
              <textarea id="test-desc" class="textarea" rows="2">${Utils.escapeHtml(activeTest.description || '')}</textarea>
            </div>

            <div style="display:flex;justify-content:flex-end;">
              <button type="submit" class="btn btn--outline btn--sm">${Utils.icon('save', 15)} Simpan Pengaturan Tes</button>
            </div>
          </form>

          <!-- Daftar Soal & Tombol Tambah Soal -->
          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem;margin-bottom:1rem;">
            <h3 style="font-size:1.02rem;">Daftar Pertanyaan (${questions.length})</h3>
            <button type="button" class="btn btn--primary btn--sm" id="btn-add-question" data-test-id="${Utils.escapeHtml(activeTest.id)}">
              ${Utils.icon('plus', 16)} Tambah Soal Pilihan Ganda
            </button>
          </div>

          ${questions.length ? `
            <div style="display:flex;flex-direction:column;gap:0.85rem;">
              ${questions.map((q, idx) => this.renderBuilderQuestionCard(q, idx, questions.length)).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state__icon">${Utils.icon('help-circle', 26)}</div>
              <h3 class="empty-state__title">Belum Ada Pertanyaan</h3>
              <p class="empty-state__desc">Klik tombol "Tambah Soal Pilihan Ganda" untuk menambahkan pertanyaan.</p>
            </div>
          `}
        </section>
      `;

      return AdminViews.renderShell('#/admin/pembelajaran', 'Quiz Builder', body);
    },

    renderBuilderQuestionCard(q, idx, total) {
      const isLegacy = q.type !== 'multiple_choice';
      let detailSummary = '';
      if (q.type === 'multiple_choice') {
        const letters = ['A', 'B', 'C', 'D'];
        detailSummary = `Kunci: <strong>${letters[q.correctAnswer]}. ${Utils.escapeHtml(q.options?.[q.correctAnswer] || '')}</strong>`;
      } else if (q.type === 'true_false') {
        detailSummary = `Soal V2 (Benar/Salah) &bull; Kunci lama: <strong>${q.correctAnswer === true ? 'Benar' : 'Salah'}</strong> &mdash; perlu dikonversi manual ke Pilihan Ganda.`;
      } else {
        detailSummary = `Soal V2 (Essay) &bull; Rubrik lama: ${Utils.escapeHtml((q.rubric || '-').slice(0, 90))} &mdash; perlu dikonversi manual ke Pilihan Ganda.`;
      }

      return `
        <article class="qb-question-card ${isLegacy ? 'qb-question-card--legacy' : ''}">
          <div class="qb-question-card__head">
            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
              <span class="badge badge--neutral">#${idx + 1}</span>
              <span class="badge ${GradingService.questionTypeBadgeClass(q.type)}">${GradingService.questionTypeLabel(q.type)}</span>
              ${isLegacy ? '<span class="badge badge--warm">Perlu Penyesuaian</span>' : ''}
              <span class="badge badge--green">${q.points} Poin</span>
            </div>
            <div class="table-actions">
              <button type="button" class="icon-btn" data-move-q="up" data-q-id="${Utils.escapeHtml(q.id)}" ${idx === 0 ? 'disabled' : ''} title="Naikkan urutan" aria-label="Naikkan urutan">${Utils.icon('arrow-up', 15)}</button>
              <button type="button" class="icon-btn" data-move-q="down" data-q-id="${Utils.escapeHtml(q.id)}" ${idx === total - 1 ? 'disabled' : ''} title="Turunkan urutan" aria-label="Turunkan urutan">${Utils.icon('arrow-down', 15)}</button>
              <button type="button" class="icon-btn" data-preview-q="${Utils.escapeHtml(q.id)}" title="Preview Soal" aria-label="Preview soal">${Utils.icon('eye', 15)}</button>
              ${isLegacy
                ? `<button type="button" class="btn btn--primary btn--sm" data-edit-q="${Utils.escapeHtml(q.id)}" title="Konversi ke Pilihan Ganda">${Utils.icon('refresh-cw', 14)} Konversi ke PG</button>`
                : `<button type="button" class="icon-btn" data-edit-q="${Utils.escapeHtml(q.id)}" title="Edit Soal" aria-label="Edit soal">${Utils.icon('pencil', 15)}</button>`}
              <button type="button" class="icon-btn icon-btn--danger" data-delete-q="${Utils.escapeHtml(q.id)}" title="Hapus Soal" aria-label="Hapus soal">${Utils.icon('trash-2', 15)}</button>
            </div>
          </div>
          <div class="qb-question-card__body">
            <div style="font-weight:600;color:var(--text-primary);margin-bottom:0.35rem;">${Utils.escapeHtml(q.question)}</div>
            <div class="form-hint">${detailSummary}</div>
          </div>
        </article>
      `;
    },

    bindChapterQuizBuilder(chapterId) {
      const { preTest, postTest } = LmsStore.ensureChapterTests(chapterId, false);
      const activeTest = this.activeBuilderTab === 'post_test' ? postTest : preTest;

      document.getElementById('chapter-editor-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const docIds = Array.from(document.querySelectorAll('input[name="chap-doc-ids"]:checked')).map((el) => el.value);
          const vidIds = Array.from(document.querySelectorAll('input[name="chap-vid-ids"]:checked')).map((el) => el.value);
          LmsStore.updateChapter(chapterId, {
            title: document.getElementById('chap-title').value,
            status: document.getElementById('chap-status').value,
            summary: document.getElementById('chap-summary').value,
            content: document.getElementById('chap-content').value,
            documentIds: docIds,
            videoIds: vidIds
          });
          UI.Toast.show('Materi & informasi bab berhasil disimpan.', 'success');
          Router.renderCurrent();
        } catch (err) {
          UI.Toast.show(err.message, 'error');
        }
      });

      document.querySelectorAll('[data-qb-tab]').forEach((tab) => {
        tab.addEventListener('click', () => {
          this.activeBuilderTab = tab.dataset.qbTab;
          Router.renderCurrent();
        });
      });

      document.getElementById('test-settings-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          LmsStore.updateTestSettings(activeTest.id, {
            title: document.getElementById('test-title').value,
            passingScore: document.getElementById('test-passing').value,
            status: document.getElementById('test-status').value,
            description: document.getElementById('test-desc').value
          });
          UI.Toast.show('Pengaturan tes berhasil diperbarui.', 'success');
          Router.renderCurrent();
        } catch (err) {
          UI.Toast.show(err.message, 'error');
        }
      });

      document.getElementById('btn-view-test-archive')?.addEventListener('click', (e) => {
        this.openAttemptArchiveModal(e.currentTarget.dataset.testId);
      });

      document.getElementById('btn-add-question')?.addEventListener('click', () => {
        this.openQuestionFormModal(activeTest.id, null);
      });

      document.querySelectorAll('[data-move-q]').forEach((btn) => {
        btn.addEventListener('click', () => {
          LmsStore.moveQuestion(btn.dataset.qId, btn.dataset.moveQ);
          Router.renderCurrent();
        });
      });

      document.querySelectorAll('[data-preview-q]').forEach((btn) => {
        btn.addEventListener('click', () => this.openQuestionPreviewModal(btn.dataset.previewQ));
      });

      document.querySelectorAll('[data-edit-q]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const q = LmsStore.getQuestionById(btn.dataset.editQ);
          if (q) this.openQuestionFormModal(q.testId, q);
        });
      });

      document.querySelectorAll('[data-delete-q]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const q = LmsStore.getQuestionById(btn.dataset.deleteQ);
          if (!q) return;
          UI.Confirm.open({
            title: 'Hapus Soal?',
            message: 'Soal ini akan dihapus dari daftar pertanyaan tes (riwayat pengerjaan sebelumnya tetap aman melalui snapshot).',
            confirmLabel: 'Ya, Hapus Soal',
            danger: true,
            onConfirm: () => {
              LmsStore.deleteQuestion(q.id);
              UI.Toast.show('Soal berhasil dihapus.', 'success');
              Router.renderCurrent();
            }
          });
        });
      });
    },

    openQuestionFormModal(testId, existingQuestion = null) {
      const isEdit = Boolean(existingQuestion);
      const isLegacyConversion = Boolean(existingQuestion && existingQuestion.type !== 'multiple_choice');
      const opts = existingQuestion?.type === 'multiple_choice'
        ? (existingQuestion.options || ['', '', '', ''])
        : ['', '', '', ''];
      const hasValidMcCorrect =
        existingQuestion?.type === 'multiple_choice' &&
        typeof existingQuestion.correctAnswer === 'number' &&
        existingQuestion.correctAnswer >= 0 &&
        existingQuestion.correctAnswer <= 3;
      const selectedCorrect = hasValidMcCorrect ? String(existingQuestion.correctAnswer) : '';

      let legacyRefHtml = '';
      if (isLegacyConversion) {
        const refBody = existingQuestion.type === 'true_false'
          ? `Kunci lama (Benar/Salah): <strong>${existingQuestion.correctAnswer === true ? 'Benar' : 'Salah'}</strong>`
          : `Pedoman jawaban lama: ${Utils.escapeHtml(existingQuestion.modelAnswer || '-')}<br>Rubrik lama: ${Utils.escapeHtml(existingQuestion.rubric || '-')}`;
        legacyRefHtml = `
          <div class="alert-box alert-box--warn">
            ${Utils.icon('info', 18)}
            <div>
              <strong>Konversi Manual dari ${GradingService.questionTypeLabel(existingQuestion.type)}:</strong><br>
              ${refBody}
            </div>
          </div>
        `;
      }

      const modalTitle = isLegacyConversion
        ? 'Konversi Soal ke Pilihan Ganda'
        : isEdit
          ? 'Edit Soal Pilihan Ganda'
          : 'Tambah Soal Pilihan Ganda';

      UI.Modal.open({
        title: modalTitle,
        size: 'lg',
        bodyHtml: `
          <form id="question-editor-form" class="form-stack" novalidate>
            ${legacyRefHtml}

            <div class="form-field">
              <label class="form-label" for="q-text">Teks Pertanyaan <span>*</span></label>
              <textarea id="q-text" class="textarea" rows="3" required placeholder="Tuliskan pertanyaan pilihan ganda...">${Utils.escapeHtml(existingQuestion?.question || '')}</textarea>
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="q-opt-0">Pilihan A <span>*</span></label>
                <input id="q-opt-0" class="input" type="text" required value="${Utils.escapeHtml(opts[0] || '')}" placeholder="Isi pilihan A...">
              </div>
              <div class="form-field">
                <label class="form-label" for="q-opt-1">Pilihan B <span>*</span></label>
                <input id="q-opt-1" class="input" type="text" required value="${Utils.escapeHtml(opts[1] || '')}" placeholder="Isi pilihan B...">
              </div>
              <div class="form-field">
                <label class="form-label" for="q-opt-2">Pilihan C <span>*</span></label>
                <input id="q-opt-2" class="input" type="text" required value="${Utils.escapeHtml(opts[2] || '')}" placeholder="Isi pilihan C...">
              </div>
              <div class="form-field">
                <label class="form-label" for="q-opt-3">Pilihan D <span>*</span></label>
                <input id="q-opt-3" class="input" type="text" required value="${Utils.escapeHtml(opts[3] || '')}" placeholder="Isi pilihan D...">
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="q-mc-correct">Jawaban Benar <span>*</span></label>
                <select id="q-mc-correct" class="select" required>
                  <option value="" ${selectedCorrect === '' ? 'selected' : ''}>-- Pilih Jawaban Benar --</option>
                  <option value="0" ${selectedCorrect === '0' ? 'selected' : ''}>Pilihan A</option>
                  <option value="1" ${selectedCorrect === '1' ? 'selected' : ''}>Pilihan B</option>
                  <option value="2" ${selectedCorrect === '2' ? 'selected' : ''}>Pilihan C</option>
                  <option value="3" ${selectedCorrect === '3' ? 'selected' : ''}>Pilihan D</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label" for="q-points">Bobot Poin <span>*</span></label>
                <input id="q-points" class="input" type="number" min="0.5" step="any" required value="${existingQuestion?.points ?? 10}">
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" for="q-explanation">Penjelasan Jawaban (Opsional)</label>
              <textarea id="q-explanation" class="textarea" rows="2" placeholder="Penjelasan atau pembahasan singkat jawaban benar...">${Utils.escapeHtml(existingQuestion?.explanation || '')}</textarea>
            </div>

            <div id="q-form-error" class="form-error" style="display:none;"></div>
          </form>
        `,
        footerHtml: `
          <button type="button" class="btn btn--outline" data-modal-close>Batal</button>
          <button type="submit" form="question-editor-form" class="btn btn--primary">
            ${Utils.icon('save', 16)} ${isLegacyConversion ? 'Simpan sebagai Pilihan Ganda' : isEdit ? 'Simpan Perubahan' : 'Simpan Soal'}
          </button>
        `
      });

      document.getElementById('question-editor-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const errBox = document.getElementById('q-form-error');
        const rawCorrectVal = document.getElementById('q-mc-correct').value;
        const payload = {
          type: 'multiple_choice',
          question: document.getElementById('q-text').value,
          options: [0, 1, 2, 3].map((i) => document.getElementById(`q-opt-${i}`).value),
          correctAnswer: rawCorrectVal === '' ? null : Number(rawCorrectVal),
          points: document.getElementById('q-points').value,
          explanation: document.getElementById('q-explanation').value
        };

        try {
          if (isEdit) {
            LmsStore.updateQuestion(existingQuestion.id, payload);
            UI.Toast.show(
              isLegacyConversion ? 'Soal berhasil dikonversi ke Pilihan Ganda.' : 'Soal berhasil diperbarui.',
              'success'
            );
          } else {
            LmsStore.addQuestion(testId, payload);
            UI.Toast.show('Soal pilihan ganda baru berhasil ditambahkan.', 'success');
          }
          UI.Modal.close();
          Router.renderCurrent();
        } catch (err) {
          errBox.textContent = err.message;
          errBox.style.display = 'block';
        }
      });
    },

    openAttemptArchiveModal(testId) {
      const test = LmsStore.getTestById(testId);
      const attempts = LmsStore.getAttemptsByTestId(testId);
      UI.Modal.open({
        title: `Arsip Riwayat Pengerjaan (Baca-Saja)`,
        size: 'lg',
        bodyHtml: `
          <p class="form-hint" style="margin-bottom:1rem;">
            Menampilkan riwayat pengerjaan untuk <strong>${Utils.escapeHtml(test?.title || '')}</strong>. Nilai dan status historis (termasuk arsip V2) dipertahankan secara baca-saja.
          </p>
          ${attempts.length ? `
            <div style="display:flex;flex-direction:column;gap:0.85rem;">
              ${attempts.map((att) => {
                const isGraded = att.grading?.status === 'graded';
                const snapQs = att.questionSnapshots || [];
                const hasLegacy = snapQs.some((q) => q.type !== 'multiple_choice');
                return `
                  <div class="qb-question-card">
                    <div class="qb-question-card__head">
                      <div>
                        <strong>${Utils.escapeHtml(att.participantId || CONFIG.PARTICIPANT_ID)}</strong>
                        <span class="form-hint"> &bull; ${Utils.formatDate(att.submittedAt)}</span>
                      </div>
                      <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
                        ${hasLegacy ? '<span class="badge badge--neutral">Arsip V2</span>' : ''}
                        <span class="badge ${isGraded ? 'badge--green' : 'badge--warm'}">
                          ${isGraded ? `Nilai: ${GradingService.formatScore(att.grading.finalScore)} / 100` : 'Menunggu Penilaian (Historis)'}
                        </span>
                      </div>
                    </div>
                    <div class="qb-question-card__body">
                      <div>${snapQs.length} soal snapshot &bull; Poin objektif: ${att.grading?.objectivePoints ?? 0} / ${att.grading?.maxObjectivePoints ?? 0}</div>
                      <div style="margin-top:0.5rem;">
                        <a href="#/tes/${Utils.escapeHtml(att.testId)}/hasil" class="btn btn--outline btn--sm" data-modal-close>
                          ${Utils.icon('eye', 14)} Buka Halaman Hasil
                        </a>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : '<p class="form-hint">Belum ada riwayat pengerjaan untuk tes ini.</p>'}
        `,
        footerHtml: `<button type="button" class="btn btn--outline" data-modal-close>Tutup</button>`
      });
    },

    openQuestionPreviewModal(questionId) {
      const q = LmsStore.getQuestionById(questionId);
      if (!q) return;

      let bodyPreview = '';
      if (q.type === 'multiple_choice') {
        const letters = ['A', 'B', 'C', 'D'];
        bodyPreview = `
          <div class="quiz-option-list">
            ${(q.options || []).map((opt, idx) => `
              <div class="quiz-option ${idx === q.correctAnswer ? 'is-selected' : ''}">
                <strong>${letters[idx]}.</strong>
                <span>${Utils.escapeHtml(opt)}</span>
                ${idx === q.correctAnswer ? '<span class="badge badge--green" style="margin-left:auto;">Kunci Benar</span>' : ''}
              </div>
            `).join('')}
          </div>
          ${q.explanation ? `<div class="alert-box alert-box--info" style="margin-top:0.9rem;">${Utils.icon('info', 16)}<div><strong>Pembahasan:</strong> ${Utils.escapeHtml(q.explanation)}</div></div>` : ''}
        `;
      } else if (q.type === 'true_false') {
        bodyPreview = `
          <div class="quiz-option-list">
            <div class="quiz-option ${q.correctAnswer === true ? 'is-selected' : ''}">
              <strong>Benar</strong>
              ${q.correctAnswer === true ? '<span class="badge badge--green" style="margin-left:auto;">Kunci Benar</span>' : ''}
            </div>
            <div class="quiz-option ${q.correctAnswer === false ? 'is-selected' : ''}">
              <strong>Salah</strong>
              ${q.correctAnswer === false ? '<span class="badge badge--green" style="margin-left:auto;">Kunci Benar</span>' : ''}
            </div>
          </div>
        `;
      } else {
        bodyPreview = `
          <div class="form-stack" style="margin-top:0.9rem;">
            <div class="essay-answer-box"><strong>Pedoman Jawaban (Arsip V2):</strong><br>${Utils.escapeHtml(q.modelAnswer || '')}</div>
            <div class="essay-answer-box"><strong>Rubrik (Arsip V2):</strong><br>${Utils.escapeHtml(q.rubric || '')}</div>
          </div>
        `;
      }

      UI.Modal.open({
        title: `Preview Soal (${GradingService.questionTypeLabel(q.type)})`,
        size: 'md',
        bodyHtml: `
          <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap;">
            <span class="badge ${GradingService.questionTypeBadgeClass(q.type)}">${GradingService.questionTypeLabel(q.type)}</span>
            <span class="badge badge--green">${q.points} Poin</span>
          </div>
          <p style="font-weight:600;color:var(--text-primary);">${Utils.escapeHtml(q.question)}</p>
          ${bodyPreview}
        `,
        footerHtml: `<button type="button" class="btn btn--outline" data-modal-close>Tutup</button>`
      });
    }
  };

  /* ------------------------------------------------------------------------
     6. INTEGRASI KE PUBLIC VIEWS, ADMIN VIEWS & ROUTER
     ------------------------------------------------------------------------ */
  PublicViews.renderLmsHomeSection = () => LmsPublicViews.renderHomeSection();

  Router.registerDynamicRoute(/^#\/pembelajaran$/, () => LmsPublicViews.renderSubjectsPage());

  Router.registerDynamicRoute(
    /^#\/pembelajaran\/([^/]+)(?:\/([^/]+))?$/,
    (match) => LmsPublicViews.renderChapterWorkspace(match[1], match[2] || null),
    () => LmsPublicViews.bindChapterWorkspace()
  );

  Router.registerDynamicRoute(
    /^#\/tes\/([^/]+)\/hasil$/,
    (match) => LmsPublicViews.renderTestResult(match[1]),
    () => LmsPublicViews.bindTestResult()
  );

  Router.registerDynamicRoute(
    /^#\/tes\/([^/]+)$/,
    (match) => LmsPublicViews.renderQuizRunner(match[1]),
    (match) => {
      if (LmsStore.getAttemptByTestId(match[1])) {
        LmsPublicViews.bindTestResult();
      } else {
        LmsPublicViews.bindQuizRunner(match[1]);
      }
    }
  );

  Router.registerDynamicRoute(
    /^#\/admin\/pembelajaran$/,
    () => LmsAdminViews.renderSubjectsManager(),
    () => LmsAdminViews.bindSubjectsManager()
  );

  Router.registerDynamicRoute(
    /^#\/admin\/pembelajaran\/([^/]+)$/,
    (match) => LmsAdminViews.renderChapterQuizBuilder(match[1]),
    (match) => LmsAdminViews.bindChapterQuizBuilder(match[1])
  );

  PKNJ.GradingService = GradingService;
  PKNJ.LmsStore = LmsStore;
  PKNJ.migrateStateV21 = () => LmsStore.migrateStateV21();
})();
