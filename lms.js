/* ==========================================================================
   MODUL V2 — MINI LMS, MIXED QUESTION QUIZ BUILDER & GRADING SYSTEM
   Pesantren Kader Nazhir Putri Jalaluddin
   Mendukung: Pilihan Ganda, Benar/Salah (boolean), dan Essay (Penilaian Manual)
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
  CONFIG.ESSAY_MAX_CHARS = 5000;

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
        description: 'Evaluasi akhir Bab 1 terdiri atas soal Pilihan Ganda, Benar/Salah, dan Essay uraian.',
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
        type: 'true_false',
        question: 'Wakaf hanya dapat dilakukan dalam bentuk tanah dan bangunan, tidak dapat berbentuk uang atau aset bergerak lainnya. (Soal Contoh)',
        correctAnswer: false,
        points: 5,
        explanation: 'Pernyataan tersebut salah. Selain tanah dan bangunan, fikih dan regulasi wakaf modern juga mengenal wakaf uang dan aset bergerak produktif.',
        order: 2
      },
      {
        id: 'q-003',
        testId: 'test-001',
        type: 'essay',
        question: 'Jelaskan secara singkat apa peran penting seorang nazhir dalam menjaga amanah wakaf! (Soal Contoh)',
        modelAnswer: 'Nazhir berperan menjaga keutuhan pokok aset wakaf, mengelola secara produktif sesuai syariah dan ikrar wakaf, serta menyalurkan hasil manfaat secara transparan kepada penerima manfaat (mauquf alaih).',
        rubric: 'Menyebutkan minimal 2 peran: menjaga pokok aset (10 poin) dan mengelola/menyalurkan manfaat secara amanah (10 poin).',
        instructions: 'Tuliskan jawaban dengan bahasa yang ringkas dan jelas (maksimal 5.000 karakter).',
        points: 20,
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
        type: 'true_false',
        question: 'Hasil pengelolaan wakaf boleh digunakan untuk kepentingan pribadi pengelola tanpa batas selama aset utamanya masih ada. (Soal Contoh)',
        correctAnswer: false,
        points: 10,
        explanation: 'Hasil pengelolaan wakaf wajib disalurkan kepada mauquf alaih sesuai ketentuan syariah dan peraturan yang berlaku.',
        order: 3
      },
      {
        id: 'q-007',
        testId: 'test-002',
        type: 'essay',
        question: 'Uraikan perbedaan mendasar antara wakaf dengan sedekah biasa serta dampaknya bagi pemberdayaan umat! (Soal Contoh)',
        modelAnswer: 'Sedekah biasa dapat langsung habis dikonsumsi penerima, sedangkan wakaf menahan pokok hartanya agar tetap ada dan hanya menyalurkan hasil atau manfaatnya secara berkelanjutan sehingga menciptakan dampak jangka panjang bagi pendidikan, dakwah, dan ekonomi umat.',
        rubric: 'Ketepatan pembedaan pokok vs manfaat (10 poin), penjelasan keberlanjutan dampak umat (10 poin).',
        instructions: 'Berikan contoh sederhana jika diperlukan.',
        points: 20,
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
        type: 'true_false',
        question: 'Transparansi pelaporan merupakan bagian dari akuntabilitas nazhir terhadap wakif dan masyarakat. (Soal Contoh)',
        correctAnswer: true,
        points: 10,
        explanation: 'Benar, pelaporan yang jelas menjaga kepercayaan dan akuntabilitas amanah wakaf.',
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
        type: 'true_false',
        question: 'Nazhir diperbolehkan mengurangi nilai pokok wakaf untuk menutup biaya operasional rutin tanpa perencanaan pemulihan. (Soal Contoh)',
        correctAnswer: false,
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
        type: 'true_false',
        question: 'Menghormati guru dan menjaga kebersihan majelis ilmu merupakan bagian dari adab thalibul ilmi. (Soal Contoh)',
        correctAnswer: true,
        points: 5,
        explanation: 'Benar, adab terhadap guru dan majelis ilmu mendahului penyampaian ilmu.',
        order: 2
      },
      {
        id: 'q-014',
        testId: 'test-005',
        type: 'essay',
        question: 'Bagaimana hubungan antara adab penuntut ilmu dengan kualitas kepemimpinan seorang muslimah? (Soal Contoh)',
        modelAnswer: 'Adab membentuk kerendahan hati, tanggung jawab, kejujuran, dan keteladanan sehingga kepemimpinan berjalan dengan amanah dan dihormati oleh lingkungan sekitar.',
        rubric: 'Keterkaitan adab dengan amanah/keteladanan (10 poin) dan kejelasan penyampaian (10 poin).',
        instructions: 'Jelaskan dalam 2–4 kalimat yang runtut.',
        points: 20,
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
        type: 'true_false',
        question: 'Kepemimpinan yang baik selalu disertai kesediaan untuk bermusyawarah dan menerima nasihat. (Soal Contoh)',
        correctAnswer: true,
        points: 10,
        explanation: 'Musyawarah (syura) merupakan prinsip utama kepemimpinan Islam.',
        order: 2
      }
    ],
    attempts: [
      {
        id: 'attempt-demo-001',
        testId: 'test-005',
        participantId: 'demo-participant-01',
        answers: {
          'q-012': 0,
          'q-013': true,
          'q-014': 'Adab membentuk sikap amanah, rendah hati, dan keteladanan bagi seorang muslimah sehingga kepemimpinannya membawa keberkahan serta dipercaya oleh jamaah.'
        },
        questionSnapshots: [
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
            type: 'true_false',
            question: 'Menghormati guru dan menjaga kebersihan majelis ilmu merupakan bagian dari adab thalibul ilmi. (Soal Contoh)',
            correctAnswer: true,
            points: 5,
            explanation: 'Benar, adab terhadap guru dan majelis ilmu mendahului penyampaian ilmu.',
            order: 2
          },
          {
            id: 'q-014',
            testId: 'test-005',
            type: 'essay',
            question: 'Bagaimana hubungan antara adab penuntut ilmu dengan kualitas kepemimpinan seorang muslimah? (Soal Contoh)',
            modelAnswer: 'Adab membentuk kerendahan hati, tanggung jawab, kejujuran, dan keteladanan sehingga kepemimpinan berjalan dengan amanah dan dihormati oleh lingkungan sekitar.',
            rubric: 'Keterkaitan adab dengan amanah/keteladanan (10 poin) dan kejelasan penyampaian (10 poin).',
            instructions: 'Jelaskan dalam 2–4 kalimat yang runtut.',
            points: 20,
            order: 3
          }
        ],
        testSnapshot: {
          id: 'test-005',
          chapterId: 'chap-003',
          type: 'pre_test',
          title: 'Pre-Test Bab 1: Adab Penuntut Ilmu',
          passingScore: 70
        },
        grading: {
          objectivePoints: 15,
          maxObjectivePoints: 15,
          maxEssayPoints: 20,
          totalMaxPoints: 35,
          essayGrades: {},
          manualPoints: null,
          finalPoints: null,
          finalScore: null,
          passed: null,
          status: 'pending_review'
        },
        submittedAt: '2026-11-18T10:00:00+07:00'
      }
    ],
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
        true_false: 'Benar / Salah',
        essay: 'Essay'
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
      const question = (payload.question || '').trim();
      if (!question) {
        return { valid: false, error: 'Teks pertanyaan / pernyataan wajib diisi.' };
      }

      const points = Number(payload.points);
      if (!Number.isFinite(points) || points <= 0) {
        return { valid: false, error: 'Bobot poin harus berupa angka lebih besar dari 0.' };
      }

      if (payload.type === 'multiple_choice') {
        const opts = Array.isArray(payload.options) ? payload.options.map((o) => String(o || '').trim()) : [];
        if (opts.length !== 4 || opts.some((o) => !o)) {
          return { valid: false, error: 'Keempat pilihan jawaban (A, B, C, dan D) wajib diisi.' };
        }
        const correctIdx = Number(payload.correctAnswer);
        if (!Number.isInteger(correctIdx) || correctIdx < 0 || correctIdx > 3) {
          return { valid: false, error: 'Pilih tepat satu jawaban benar (A, B, C, atau D).' };
        }
      } else if (payload.type === 'true_false') {
        if (typeof payload.correctAnswer !== 'boolean') {
          return { valid: false, error: 'Pilih jawaban benar (Benar atau Salah).' };
        }
      } else if (payload.type === 'essay') {
        if (!(payload.modelAnswer || '').trim()) {
          return { valid: false, error: 'Pedoman / contoh jawaban essay wajib diisi untuk acuan pengajar.' };
        }
        if (!(payload.rubric || '').trim()) {
          return { valid: false, error: 'Rubrik penilaian essay wajib diisi.' };
        }
      } else {
        return { valid: false, error: 'Jenis soal tidak dikenal.' };
      }

      return { valid: true };
    },

    evaluateSubmission(test, orderedQuestions, rawAnswers) {
      const snapshots = Utils.clone(orderedQuestions);
      const sanitizedAnswers = {};

      let objectivePoints = 0;
      let maxObjectivePoints = 0;
      let maxEssayPoints = 0;
      let totalMaxPoints = 0;
      let hasEssay = false;

      for (const q of snapshots) {
        const pts = Number(q.points) || 0;
        totalMaxPoints += pts;
        const ans = rawAnswers[q.id];

        if (q.type === 'multiple_choice') {
          maxObjectivePoints += pts;
          if (typeof ans === 'number' && Number.isInteger(ans) && ans >= 0 && ans <= 3) {
            sanitizedAnswers[q.id] = ans;
            if (ans === q.correctAnswer) {
              objectivePoints += pts;
            }
          } else {
            sanitizedAnswers[q.id] = null;
          }
        } else if (q.type === 'true_false') {
          maxObjectivePoints += pts;
          if (typeof ans === 'boolean') {
            sanitizedAnswers[q.id] = ans;
            if (ans === q.correctAnswer) {
              objectivePoints += pts;
            }
          } else {
            sanitizedAnswers[q.id] = null;
          }
        } else if (q.type === 'essay') {
          hasEssay = true;
          maxEssayPoints += pts;
          const textAns = typeof ans === 'string' ? ans.slice(0, CONFIG.ESSAY_MAX_CHARS) : '';
          sanitizedAnswers[q.id] = textAns;
        }
      }

      const passingScore = Math.max(0, Math.min(100, Number(test.passingScore) || 0));

      let grading;
      if (!hasEssay) {
        const finalPoints = objectivePoints;
        const finalScore = totalMaxPoints > 0 ? this.roundScore((finalPoints / totalMaxPoints) * 100) : 0;
        grading = {
          objectivePoints,
          maxObjectivePoints,
          maxEssayPoints: 0,
          totalMaxPoints,
          essayGrades: {},
          manualPoints: 0,
          finalPoints,
          finalScore,
          passed: finalScore >= passingScore,
          status: 'graded'
        };
      } else {
        grading = {
          objectivePoints,
          maxObjectivePoints,
          maxEssayPoints,
          totalMaxPoints,
          essayGrades: {},
          manualPoints: null,
          finalPoints: null,
          finalScore: null,
          passed: null,
          status: 'pending_review'
        };
      }

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

    applyManualEssayGrades(attempt, essayGradesInput) {
      const snapshots = attempt.questionSnapshots || [];
      const essayQuestions = snapshots.filter((q) => q.type === 'essay');
      const cleanedGrades = {};

      let manualPointsSum = 0;
      let allGraded = true;

      for (const q of essayQuestions) {
        const entry = essayGradesInput[q.id];
        const maxPts = Number(q.points) || 0;

        if (!entry || entry.awardedPoints === '' || entry.awardedPoints === null || entry.awardedPoints === undefined) {
          allGraded = false;
          continue;
        }

        const pts = Number(entry.awardedPoints);
        if (!Number.isFinite(pts) || pts < 0 || pts > maxPts) {
          throw new Error(`Poin untuk soal essay "${q.question.slice(0, 40)}..." harus antara 0 dan ${maxPts}.`);
        }

        const roundedPts = Math.round(pts * 100) / 100;
        cleanedGrades[q.id] = {
          awardedPoints: roundedPts,
          feedback: (entry.feedback || '').trim()
        };
        manualPointsSum += roundedPts;
      }

      const objectivePoints = Number(attempt.grading?.objectivePoints) || 0;
      const totalMaxPoints = Number(attempt.grading?.totalMaxPoints) || 0;
      const passingScore = Number(attempt.testSnapshot?.passingScore ?? 70);

      if (allGraded) {
        const manualPoints = Math.round(manualPointsSum * 100) / 100;
        const finalPoints = Math.round((objectivePoints + manualPoints) * 100) / 100;
        const finalScore = totalMaxPoints > 0 ? this.roundScore((finalPoints / totalMaxPoints) * 100) : 0;
        return {
          ...attempt.grading,
          essayGrades: cleanedGrades,
          manualPoints,
          finalPoints,
          finalScore,
          passed: finalScore >= passingScore,
          status: 'graded'
        };
      }

      return {
        ...attempt.grading,
        essayGrades: cleanedGrades,
        manualPoints: null,
        finalPoints: null,
        finalScore: null,
        passed: null,
        status: 'pending_review'
      };
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

    addQuestion(testId, payload) {
      const check = GradingService.validateQuestionPayload(payload);
      if (!check.valid) throw new Error(check.error);

      const current = this.getQuestionsByTest(testId);
      const base = {
        id: Utils.generateId('q'),
        testId,
        type: payload.type,
        question: payload.question.trim(),
        points: Math.round(Number(payload.points) * 100) / 100,
        order: current.length + 1
      };

      if (payload.type === 'multiple_choice') {
        base.options = payload.options.map((o) => o.trim());
        base.correctAnswer = Number(payload.correctAnswer);
        base.explanation = (payload.explanation || '').trim();
      } else if (payload.type === 'true_false') {
        base.correctAnswer = Boolean(payload.correctAnswer);
        base.explanation = (payload.explanation || '').trim();
      } else {
        base.modelAnswer = (payload.modelAnswer || '').trim();
        base.rubric = (payload.rubric || '').trim();
        base.instructions = (payload.instructions || '').trim();
      }

      DataStore.state.questions.push(base);
      DataStore.persist();
      return base;
    },

    updateQuestion(questionId, payload) {
      const idx = DataStore.state.questions.findIndex((q) => q.id === questionId);
      if (idx === -1) throw new Error('Soal tidak ditemukan.');
      const check = GradingService.validateQuestionPayload(payload);
      if (!check.valid) throw new Error(check.error);

      const existing = DataStore.state.questions[idx];
      const updated = {
        id: existing.id,
        testId: existing.testId,
        type: payload.type,
        question: payload.question.trim(),
        points: Math.round(Number(payload.points) * 100) / 100,
        order: existing.order
      };

      if (payload.type === 'multiple_choice') {
        updated.options = payload.options.map((o) => o.trim());
        updated.correctAnswer = Number(payload.correctAnswer);
        updated.explanation = (payload.explanation || '').trim();
      } else if (payload.type === 'true_false') {
        updated.correctAnswer = Boolean(payload.correctAnswer);
        updated.explanation = (payload.explanation || '').trim();
      } else {
        updated.modelAnswer = (payload.modelAnswer || '').trim();
        updated.rubric = (payload.rubric || '').trim();
        updated.instructions = (payload.instructions || '').trim();
      }

      DataStore.state.questions[idx] = updated;
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
          return { key: 'pending_review', label: 'Menunggu Penilaian', badge: 'badge--warm', attempt };
        }
        return { key: 'graded', label: 'Selesai Dinilai', badge: 'badge--green', attempt };
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
      const questions = this.getQuestionsByTest(testId);
      if (!questions.length) throw new Error('Tes ini belum memiliki soal.');

      const evalResult = GradingService.evaluateSubmission(test, questions, rawAnswers);
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

    gradeAttemptEssays(attemptId, essayGradesInput) {
      const attempt = this.getAttemptById(attemptId);
      if (!attempt) throw new Error('Data pengerjaan tidak ditemukan.');
      const updatedGrading = GradingService.applyManualEssayGrades(attempt, essayGradesInput);
      attempt.grading = updatedGrading;
      DataStore.persist();
      return attempt;
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
      const totalPublishedChapters = subjects.reduce((acc, s) => acc + LmsStore.getChaptersBySubject(s.id, false).length, 0);
      const completedCount = (DataStore.state.learningProgress?.completedChapterIds || []).length;

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
        scoreLine = `<div class="form-hint">Poin objektif sementara: <strong>${attempt.grading.objectivePoints} / ${attempt.grading.maxObjectivePoints}</strong> (Essay menunggu penilaian pengajar)</div>`;
      }

      const actionBtn = totals.questionCount === 0
        ? `<span class="form-hint">Belum ada soal pada tes ini.</span>`
        : attempt
          ? `<a href="#/tes/${Utils.escapeHtml(test.id)}/hasil" class="btn btn--outline btn--sm">${Utils.icon('bar-chart-2', 15)} Lihat Hasil Tes</a>`
          : `<a href="#/tes/${Utils.escapeHtml(test.id)}" class="btn ${variant === 'pre' ? 'btn--green' : 'btn--primary'} btn--sm">${Utils.icon('play', 15)} ${statusInfo?.key === 'in_progress' ? 'Lanjutkan Tes' : `Kerjakan ${GradingService.testTypeLabel(test.type)}`}</a>`;

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
              Selisih nilai final akan dihitung setelah kedua tes selesai dinilai (Pre-Test: <strong>${preStatusText}</strong>, Post-Test: <strong>${postStatusText}</strong>).
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
      const questions = LmsStore.getQuestionsByTest(test.id);

      if (!questions.length) {
        return `
          ${PublicViews.renderHeader('#/pembelajaran')}
          <main id="main-content" class="section">
            <div class="container">
              <div class="empty-state">
                <h1 class="empty-state__title">${Utils.escapeHtml(test.title)}</h1>
                <p class="empty-state__desc">Belum ada pertanyaan pada tes ini. Silakan tambahkan soal melalui Quiz Builder Admin.</p>
                <a href="#/pembelajaran/${Utils.escapeHtml(subject?.id || '')}/${Utils.escapeHtml(chapter?.id || '')}" class="btn btn--outline">Kembali ke Bab</a>
              </div>
            </div>
          </main>
          ${PublicViews.renderFooter()}
        `;
      }

      const draft = LmsStore.getInProgress(test.id) || { answers: {}, currentIndex: 0 };
      const currentIdx = Math.max(0, Math.min(questions.length - 1, Number(draft.currentIndex) || 0));

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
                  <span class="badge badge--neutral">${questions.length} Soal</span>
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
      const questions = LmsStore.getQuestionsByTest(testId);
      if (!test || !questions.length) return;

      const saved = LmsStore.getInProgress(testId) || { answers: {}, currentIndex: 0 };
      const answers = { ...(saved.answers || {}) };
      let currentIndex = Math.max(0, Math.min(questions.length - 1, Number(saved.currentIndex) || 0));

      const isQuestionAnswered = (q) => {
        const val = answers[q.id];
        if (q.type === 'multiple_choice') return typeof val === 'number' && val >= 0 && val <= 3;
        if (q.type === 'true_false') return typeof val === 'boolean';
        if (q.type === 'essay') return typeof val === 'string' && val.trim().length > 0;
        return false;
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

        let inputHtml = '';
        if (q.type === 'multiple_choice') {
          const letters = ['A', 'B', 'C', 'D'];
          inputHtml = `
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
        } else if (q.type === 'true_false') {
          const currentVal = answers[q.id];
          inputHtml = `
            <div class="quiz-option-list" role="radiogroup" aria-label="Pilihan Benar atau Salah">
              <label class="quiz-option ${currentVal === true ? 'is-selected' : ''}">
                <input type="radio" name="q-tf-${Utils.escapeHtml(q.id)}" value="true" ${currentVal === true ? 'checked' : ''}>
                <span><strong>Benar</strong></span>
              </label>
              <label class="quiz-option ${currentVal === false ? 'is-selected' : ''}">
                <input type="radio" name="q-tf-${Utils.escapeHtml(q.id)}" value="false" ${currentVal === false ? 'checked' : ''}>
                <span><strong>Salah</strong></span>
              </label>
            </div>
          `;
        } else if (q.type === 'essay') {
          const currentText = typeof answers[q.id] === 'string' ? answers[q.id] : '';
          inputHtml = `
            <div class="form-field" style="margin-top:1.1rem;">
              ${q.instructions ? `<div class="alert-box alert-box--info" style="margin-bottom:0.5rem;">${Utils.icon('info', 16)}<div>${Utils.escapeHtml(q.instructions)}</div></div>` : ''}
              <label class="form-label" for="quiz-essay-input">Jawaban Uraian Anda</label>
              <textarea id="quiz-essay-input" class="textarea" rows="7" maxlength="${CONFIG.ESSAY_MAX_CHARS}" placeholder="Tuliskan jawaban uraian Anda secara jelas dan runtut...">${Utils.escapeHtml(currentText)}</textarea>
              <div style="display:flex;justify-content:space-between;font-size:0.79rem;color:var(--text-muted);">
                <span>Essay diperiksa secara manual oleh pengajar setelah pengiriman.</span>
                <strong id="essay-char-counter">${currentText.length} / ${CONFIG.ESSAY_MAX_CHARS.toLocaleString('id-ID')} karakter</strong>
              </div>
            </div>
          `;
        }

        const slot = document.getElementById('quiz-question-slot');
        if (slot) {
          slot.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap;margin-bottom:1rem;">
              <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                <span class="badge badge--green">Nomor ${currentIndex + 1}</span>
                <span class="badge ${GradingService.questionTypeBadgeClass(q.type)}">${GradingService.questionTypeLabel(q.type)}</span>
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

        // Bind answer inputs
        if (q.type === 'multiple_choice') {
          slot.querySelectorAll(`input[name="q-radio-${q.id}"]`).forEach((radio) => {
            radio.addEventListener('change', (e) => {
              answers[q.id] = Number(e.target.value);
              LmsStore.saveInProgress(testId, answers, currentIndex);
              renderRunnerStep();
            });
          });
        } else if (q.type === 'true_false') {
          slot.querySelectorAll(`input[name="q-tf-${q.id}"]`).forEach((radio) => {
            radio.addEventListener('change', (e) => {
              // Simpan nilai boolean murni
              answers[q.id] = e.target.value === 'true';
              LmsStore.saveInProgress(testId, answers, currentIndex);
              renderRunnerStep();
            });
          });
        } else if (q.type === 'essay') {
          const ta = document.getElementById('quiz-essay-input');
          const counter = document.getElementById('essay-char-counter');
          ta?.addEventListener('input', (e) => {
            const val = e.target.value.slice(0, CONFIG.ESSAY_MAX_CHARS);
            if (e.target.value !== val) e.target.value = val;
            answers[q.id] = val;
            if (counter) {
              counter.textContent = `${val.length.toLocaleString('id-ID')} / ${CONFIG.ESSAY_MAX_CHARS.toLocaleString('id-ID')} karakter`;
            }
            LmsStore.saveInProgress(testId, answers, currentIndex);
            // Update answered state on pill & progress bar without losing textarea focus
            const answeredNow = questions.filter(isQuestionAnswered).length;
            const pctNow = Math.round((answeredNow / questions.length) * 100);
            const pill = pillsSlot?.querySelector(`[data-jump-q="${currentIndex}"]`);
            if (pill) pill.classList.toggle('is-answered', val.trim().length > 0);
            if (progEl) {
              const strongEl = progEl.querySelector('strong');
              const barEl = progEl.querySelector('.progress-fill');
              if (strongEl) strongEl.textContent = `${answeredNow} / ${questions.length} terjawab (${pctNow}%)`;
              if (barEl) barEl.style.width = `${pctNow}%`;
            }
          });
        }

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
          ? `Masih ada ${unansweredCount} soal yang belum dijawab. Apakah Anda yakin ingin mengirim jawaban? Pastikan seluruh jawaban telah diperiksa.`
          : 'Apakah Anda yakin ingin mengirim jawaban? Pastikan seluruh jawaban telah diperiksa.';

        UI.Confirm.open({
          title: 'Kirim Jawaban Tes?',
          message: msg,
          confirmLabel: 'Ya, Kirim Jawaban',
          danger: false,
          onConfirm: () => {
            try {
              LmsStore.submitTest(testId, answers);
              UI.Toast.show('Jawaban tes berhasil dikirim.', 'success');
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
      const grading = attempt.grading;
      const isGraded = grading.status === 'graded';
      const questions = attempt.questionSnapshots || [];

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
              <div class="score-gauge" role="img" aria-label="${isGraded ? `Nilai akhir ${GradingService.formatScore(grading.finalScore)}` : 'Menunggu penilaian pengajar'}">
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
                    <div style="color:var(--warm-orange-main);margin-bottom:0.2rem;">${Utils.icon('clock', 30)}</div>
                    <div class="score-gauge__label" style="font-weight:600;color:var(--orange-800);padding-inline:0.8rem;">Menunggu Penilaian</div>
                  `}
                </div>
              </div>

              <div>
                <div style="display:flex;gap:0.45rem;flex-wrap:wrap;margin-bottom:0.6rem;">
                  <span class="badge ${snapTest.type === 'pre_test' ? 'badge--teal' : 'badge--orange'}">${GradingService.testTypeLabel(snapTest.type)}</span>
                  <span class="badge ${isGraded ? 'badge--green' : 'badge--warm'}">${isGraded ? 'Selesai Dinilai' : 'Menunggu Penilaian'}</span>
                  ${isGraded ? `<span class="badge ${grading.passed ? 'badge--green' : 'badge--orange'}">${grading.passed ? 'Lulus' : 'Belum Lulus'}</span>` : ''}
                </div>

                <h1 style="font-size:clamp(1.25rem,2.3vw,1.7rem);margin-bottom:0.35rem;">${Utils.escapeHtml(snapTest.title || 'Hasil Tes')}</h1>
                <p class="form-hint" style="margin-bottom:1rem;">
                  ${Utils.escapeHtml(subject?.title || '')} &bull; ${Utils.escapeHtml(chapter?.title || '')} &bull; Dikirim ${Utils.formatDate(attempt.submittedAt)}
                </p>

                ${!isGraded ? `
                  <div class="alert-box alert-box--warn" style="margin-bottom:1rem;">
                    ${Utils.icon('clock', 18)}
                    <div>
                      Jawaban berhasil dikirim. Soal pilihan ganda dan benar/salah telah diperiksa otomatis. Jawaban essay masih menunggu penilaian pengajar.
                    </div>
                  </div>
                ` : ''}

                <div class="stats-grid" style="grid-template-columns:repeat(auto-fit,minmax(145px,1fr));margin-bottom:0;">
                  <div style="padding:0.75rem;border-radius:var(--radius-md);background:var(--bg-subtle);">
                    <div class="form-hint">Jumlah Soal</div>
                    <strong>${questions.length} Soal (${grading.totalMaxPoints} Poin)</strong>
                  </div>
                  <div style="padding:0.75rem;border-radius:var(--radius-md);background:var(--bg-subtle);">
                    <div class="form-hint">${isGraded ? 'Poin Objektif' : 'Skor Objektif Sementara'}</div>
                    <strong>${grading.objectivePoints} / ${grading.maxObjectivePoints} Poin</strong>
                  </div>
                  ${grading.maxEssayPoints > 0 ? `
                    <div style="padding:0.75rem;border-radius:var(--radius-md);background:var(--bg-subtle);">
                      <div class="form-hint">Poin Essay</div>
                      <strong>${isGraded ? `${grading.manualPoints} / ${grading.maxEssayPoints} Poin` : 'Menunggu Pengajar'}</strong>
                    </div>
                  ` : ''}
                  ${isGraded ? `
                    <div style="padding:0.75rem;border-radius:var(--radius-md);background:var(--green-50);">
                      <div class="form-hint">Total &amp; KKM</div>
                      <strong>${grading.finalPoints} / ${grading.totalMaxPoints} (KKM ${snapTest.passingScore})</strong>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- Rincian Jawaban Per Soal -->
            <div class="panel">
              <div class="panel__head">
                <h2 class="panel__title">Rincian Jawaban</h2>
                ${!isGraded ? `<a href="#/admin/penilaian/${Utils.escapeHtml(attempt.id)}" class="btn btn--outline btn--sm">${Utils.icon('clipboard-check', 15)} Nilai di Admin Demo</a>` : ''}
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
     5. ADMIN LMS VIEWS (Mata Pelajaran, Bab, Quiz Builder & Penilaian Essay)
     ------------------------------------------------------------------------ */
  const LmsAdminViews = {
    activeBuilderTab: 'pre_test',

    renderSubjectsManager() {
      const subjects = LmsStore.getSubjects(true);
      const body = `
        <div class="admin-page-head">
          <div>
            <h1>Pembelajaran &amp; Quiz Builder</h1>
            <p class="form-hint">Kelola mata pelajaran, bab materi, serta susun Pre-Test &amp; Post-Test campuran (Pilihan Ganda, Benar/Salah, Essay).</p>
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
                        return `
                          <div class="recent-item" style="flex-wrap:wrap;">
                            <div class="recent-item__info" style="flex:1;min-width:240px;">
                              <div class="recent-item__title">${Utils.escapeHtml(ch.title)}</div>
                              <div class="recent-item__meta">
                                Pre-Test: ${preTotals.questionCount} soal (${preTotals.totalPoints} poin) &bull;
                                Post-Test: ${postTotals.questionCount} soal (${postTotals.totalPoints} poin)
                              </div>
                            </div>
                            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
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
              <p class="form-hint">Kelola pengaturan tes dan pertanyaan Pilihan Ganda, Benar/Salah, serta Essay secara terpisah untuk Pre-Test dan Post-Test.</p>
            </div>
          </div>

          <div class="qb-tabs" role="tablist">
            <button type="button" class="qb-tab ${activeTest.type === 'pre_test' ? 'is-active' : ''}" data-qb-tab="pre_test">
              ${Utils.icon('clipboard-list', 16)}
              <span>Pre-Test (${LmsStore.getTestTotals(preTest.id).questionCount} Soal)</span>
            </button>
            <button type="button" class="qb-tab ${activeTest.type === 'post_test' ? 'is-active' : ''}" data-qb-tab="post_test">
              ${Utils.icon('award', 16)}
              <span>Post-Test (${LmsStore.getTestTotals(postTest.id).questionCount} Soal)</span>
            </button>
          </div>

          <!-- Pengaturan Tes -->
          <form id="test-settings-form" class="form-stack" style="padding:1.15rem;border-radius:var(--radius-md);background:var(--bg-subtle);border:1px solid var(--border-light);margin-bottom:1.5rem;">
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.75rem;">
              <strong style="color:var(--green-800);">Pengaturan ${GradingService.testTypeLabel(activeTest.type)}</strong>
              <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                <span class="badge badge--green">${totals.questionCount} Soal</span>
                <span class="badge badge--orange">Total ${totals.totalPoints} Poin</span>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="test-title">Judul Tes <span>*</span></label>
                <input id="test-title" class="input" type="text" required value="${Utils.escapeHtml(activeTest.title)}">
              </div>
              <div class="form-row-2">
                <div class="form-field">
                  <label class="form-label" for="test-passing">KKM (0–100)</label>
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
              ${Utils.icon('plus', 16)} + Tambah Soal
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
              <p class="empty-state__desc">Klik tombol "+ Tambah Soal" untuk menambahkan soal Pilihan Ganda, Benar/Salah, atau Essay.</p>
            </div>
          `}
        </section>
      `;

      return AdminViews.renderShell('#/admin/pembelajaran', 'Quiz Builder', body);
    },

    renderBuilderQuestionCard(q, idx, total) {
      let detailSummary = '';
      if (q.type === 'multiple_choice') {
        const letters = ['A', 'B', 'C', 'D'];
        detailSummary = `Kunci: <strong>${letters[q.correctAnswer]}. ${Utils.escapeHtml(q.options?.[q.correctAnswer] || '')}</strong>`;
      } else if (q.type === 'true_false') {
        detailSummary = `Kunci: <strong>${q.correctAnswer === true ? 'Benar' : 'Salah'}</strong>`;
      } else {
        detailSummary = `Penilaian Manual &bull; Rubrik: ${Utils.escapeHtml((q.rubric || '').slice(0, 90))}`;
      }

      return `
        <article class="qb-question-card">
          <div class="qb-question-card__head">
            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
              <span class="badge badge--neutral">#${idx + 1}</span>
              <span class="badge ${GradingService.questionTypeBadgeClass(q.type)}">${GradingService.questionTypeLabel(q.type)}</span>
              <span class="badge badge--green">${q.points} Poin</span>
            </div>
            <div class="table-actions">
              <button type="button" class="icon-btn" data-move-q="up" data-q-id="${Utils.escapeHtml(q.id)}" ${idx === 0 ? 'disabled' : ''} title="Naikkan urutan" aria-label="Naikkan urutan">${Utils.icon('arrow-up', 15)}</button>
              <button type="button" class="icon-btn" data-move-q="down" data-q-id="${Utils.escapeHtml(q.id)}" ${idx === total - 1 ? 'disabled' : ''} title="Turunkan urutan" aria-label="Turunkan urutan">${Utils.icon('arrow-down', 15)}</button>
              <button type="button" class="icon-btn" data-preview-q="${Utils.escapeHtml(q.id)}" title="Preview Soal" aria-label="Preview soal">${Utils.icon('eye', 15)}</button>
              <button type="button" class="icon-btn" data-edit-q="${Utils.escapeHtml(q.id)}" title="Edit Soal" aria-label="Edit soal">${Utils.icon('pencil', 15)}</button>
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

      document.getElementById('btn-add-question')?.addEventListener('click', () => {
        this.openQuestionTypeSelector(activeTest.id);
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
          if (q) this.openQuestionFormModal(q.testId, q.type, q);
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

    openQuestionTypeSelector(testId) {
      UI.Modal.open({
        title: 'Pilih Jenis Soal',
        size: 'md',
        bodyHtml: `
          <p class="form-hint" style="margin-bottom:1rem;">Pilih tipe pertanyaan yang ingin ditambahkan ke dalam tes:</p>
          <div class="qtype-cards">
            <button type="button" class="qtype-card" data-pick-qtype="multiple_choice">
              <div class="qtype-card__icon" style="background:var(--teal-light);color:var(--teal-main);">
                ${Utils.icon('list-checks', 22)}
              </div>
              <strong style="color:var(--green-800);">Pilihan Ganda</strong>
              <span class="form-hint">4 opsi (A–D) dengan 1 jawaban benar dan penilaian otomatis.</span>
            </button>
            <button type="button" class="qtype-card" data-pick-qtype="true_false">
              <div class="qtype-card__icon" style="background:var(--purple-light);color:var(--purple-main);">
                ${Utils.icon('toggle-left', 22)}
              </div>
              <strong style="color:var(--green-800);">Benar / Salah</strong>
              <span class="form-hint">Pernyataan dengan pilihan Benar atau Salah (boolean) dan penilaian otomatis.</span>
            </button>
            <button type="button" class="qtype-card" data-pick-qtype="essay">
              <div class="qtype-card__icon" style="background:var(--orange-50);color:var(--orange-800);">
                ${Utils.icon('file-pen-line', 22)}
              </div>
              <strong style="color:var(--green-800);">Essay</strong>
              <span class="form-hint">Jawaban uraian hingga 5.000 karakter dengan rubrik &amp; penilaian manual pengajar.</span>
            </button>
          </div>
        `,
        footerHtml: `<button type="button" class="btn btn--outline" data-modal-close>Batal</button>`
      });

      document.querySelectorAll('[data-pick-qtype]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.openQuestionFormModal(testId, btn.dataset.pickQtype, null);
        });
      });
    },

    openQuestionFormModal(testId, initialType, existingQuestion = null) {
      let currentType = initialType;
      const isEdit = Boolean(existingQuestion);

      const renderFormFieldsForType = (type, vals = {}) => {
        if (type === 'multiple_choice') {
          const opts = vals.options || ['', '', '', ''];
          const correct = typeof vals.correctAnswer === 'number' ? vals.correctAnswer : 0;
          return `
            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="q-opt-0">Pilihan A <span>*</span></label>
                <input id="q-opt-0" class="input" type="text" required value="${Utils.escapeHtml(opts[0] || '')}">
              </div>
              <div class="form-field">
                <label class="form-label" for="q-opt-1">Pilihan B <span>*</span></label>
                <input id="q-opt-1" class="input" type="text" required value="${Utils.escapeHtml(opts[1] || '')}">
              </div>
              <div class="form-field">
                <label class="form-label" for="q-opt-2">Pilihan C <span>*</span></label>
                <input id="q-opt-2" class="input" type="text" required value="${Utils.escapeHtml(opts[2] || '')}">
              </div>
              <div class="form-field">
                <label class="form-label" for="q-opt-3">Pilihan D <span>*</span></label>
                <input id="q-opt-3" class="input" type="text" required value="${Utils.escapeHtml(opts[3] || '')}">
              </div>
            </div>
            <div class="form-field">
              <label class="form-label" for="q-mc-correct">Jawaban Benar <span>*</span></label>
              <select id="q-mc-correct" class="select">
                <option value="0" ${correct === 0 ? 'selected' : ''}>Pilihan A</option>
                <option value="1" ${correct === 1 ? 'selected' : ''}>Pilihan B</option>
                <option value="2" ${correct === 2 ? 'selected' : ''}>Pilihan C</option>
                <option value="3" ${correct === 3 ? 'selected' : ''}>Pilihan D</option>
              </select>
            </div>
            <div class="form-field">
              <label class="form-label" for="q-explanation">Penjelasan Jawaban (Opsional)</label>
              <textarea id="q-explanation" class="textarea" rows="2">${Utils.escapeHtml(vals.explanation || '')}</textarea>
            </div>
          `;
        }

        if (type === 'true_false') {
          const isTrue = vals.correctAnswer === true;
          return `
            <div class="form-field">
              <label class="form-label">Jawaban Benar <span>*</span></label>
              <div style="display:flex;gap:1.25rem;padding:0.5rem 0;">
                <label style="display:flex;align-items:center;gap:0.45rem;cursor:pointer;">
                  <input type="radio" name="q-tf-correct" value="true" ${isTrue ? 'checked' : ''}>
                  <span>Benar</span>
                </label>
                <label style="display:flex;align-items:center;gap:0.45rem;cursor:pointer;">
                  <input type="radio" name="q-tf-correct" value="false" ${!isTrue ? 'checked' : ''}>
                  <span>Salah</span>
                </label>
              </div>
            </div>
            <div class="form-field">
              <label class="form-label" for="q-explanation">Penjelasan Jawaban (Opsional)</label>
              <textarea id="q-explanation" class="textarea" rows="2">${Utils.escapeHtml(vals.explanation || '')}</textarea>
            </div>
          `;
        }

        return `
          <div class="form-field">
            <label class="form-label" for="q-model-answer">Contoh / Pedoman Jawaban Pengajar <span>*</span></label>
            <textarea id="q-model-answer" class="textarea" rows="3" required>${Utils.escapeHtml(vals.modelAnswer || '')}</textarea>
          </div>
          <div class="form-field">
            <label class="form-label" for="q-rubric">Rubrik Penilaian <span>*</span></label>
            <textarea id="q-rubric" class="textarea" rows="2" required placeholder="Contoh: Ketepatan konsep (10 poin), kejelasan uraian (10 poin).">${Utils.escapeHtml(vals.rubric || '')}</textarea>
          </div>
          <div class="form-field">
            <label class="form-label" for="q-instructions">Petunjuk Pengerjaan (Opsional)</label>
            <input id="q-instructions" class="input" type="text" value="${Utils.escapeHtml(vals.instructions || '')}" placeholder="Contoh: Jawab dalam 2–4 kalimat yang jelas.">
          </div>
        `;
      };

      UI.Modal.open({
        title: isEdit ? 'Edit Soal' : `Tambah Soal (${GradingService.questionTypeLabel(currentType)})`,
        size: 'lg',
        bodyHtml: `
          <form id="question-editor-form" class="form-stack" novalidate>
            <div class="form-row-2">
              <div class="form-field">
                <label class="form-label" for="q-type-select">Jenis Soal</label>
                <select id="q-type-select" class="select">
                  <option value="multiple_choice" ${currentType === 'multiple_choice' ? 'selected' : ''}>Pilihan Ganda</option>
                  <option value="true_false" ${currentType === 'true_false' ? 'selected' : ''}>Benar / Salah</option>
                  <option value="essay" ${currentType === 'essay' ? 'selected' : ''}>Essay</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label" for="q-points">Bobot Poin <span>*</span></label>
                <input id="q-points" class="input" type="number" min="1" step="0.5" required value="${existingQuestion?.points ?? (currentType === 'essay' ? 20 : currentType === 'true_false' ? 5 : 10)}">
              </div>
            </div>

            <div class="form-field">
              <label class="form-label" for="q-text">${currentType === 'true_false' ? 'Pernyataan' : 'Teks Pertanyaan'} <span>*</span></label>
              <textarea id="q-text" class="textarea" rows="3" required>${Utils.escapeHtml(existingQuestion?.question || '')}</textarea>
            </div>

            <div id="q-type-specific-fields" class="form-stack">
              ${renderFormFieldsForType(currentType, existingQuestion || {})}
            </div>
            <div id="q-form-error" class="form-error" style="display:none;"></div>
          </form>
        `,
        footerHtml: `
          <button type="button" class="btn btn--outline" data-modal-close>Batal</button>
          <button type="submit" form="question-editor-form" class="btn btn--primary">
            ${Utils.icon('save', 16)} ${isEdit ? 'Simpan Perubahan' : 'Simpan Soal'}
          </button>
        `
      });

      const typeSelect = document.getElementById('q-type-select');
      const specificContainer = document.getElementById('q-type-specific-fields');

      typeSelect?.addEventListener('change', (e) => {
        const nextType = e.target.value;
        if (nextType === currentType) return;

        // Kembalikan sementara hingga pengguna mengonfirmasi perubahan jenis soal
        typeSelect.value = currentType;

        UI.Confirm.open({
          title: 'Ubah Jenis Soal?',
          message: 'Mengubah jenis soal akan mengatur ulang konfigurasi jawaban sebelumnya karena format jawaban berbeda. Lanjutkan?',
          confirmLabel: 'Ya, Ubah Jenis Soal',
          danger: false,
          onConfirm: () => {
            currentType = nextType;
            typeSelect.value = nextType;
            const qLabel = document.querySelector('label[for="q-text"]');
            if (qLabel) {
              qLabel.innerHTML = `${currentType === 'true_false' ? 'Pernyataan' : 'Teks Pertanyaan'} <span>*</span>`;
            }
            specificContainer.innerHTML = renderFormFieldsForType(currentType, {});
            UI.refreshIcons();
          }
        });
      });

      document.getElementById('question-editor-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const errBox = document.getElementById('q-form-error');
        const payload = {
          type: currentType,
          question: document.getElementById('q-text').value,
          points: document.getElementById('q-points').value
        };

        if (currentType === 'multiple_choice') {
          payload.options = [0, 1, 2, 3].map((i) => document.getElementById(`q-opt-${i}`).value);
          payload.correctAnswer = Number(document.getElementById('q-mc-correct').value);
          payload.explanation = document.getElementById('q-explanation').value;
        } else if (currentType === 'true_false') {
          const checked = document.querySelector('input[name="q-tf-correct"]:checked');
          payload.correctAnswer = checked ? checked.value === 'true' : null;
          payload.explanation = document.getElementById('q-explanation').value;
        } else {
          payload.modelAnswer = document.getElementById('q-model-answer').value;
          payload.rubric = document.getElementById('q-rubric').value;
          payload.instructions = document.getElementById('q-instructions').value;
        }

        try {
          if (isEdit) {
            LmsStore.updateQuestion(existingQuestion.id, payload);
            UI.Toast.show('Soal berhasil diperbarui.', 'success');
          } else {
            LmsStore.addQuestion(testId, payload);
            UI.Toast.show('Soal baru berhasil ditambahkan.', 'success');
          }
          UI.Modal.close();
          Router.renderCurrent();
        } catch (err) {
          errBox.textContent = err.message;
          errBox.style.display = 'block';
        }
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
            <div class="essay-answer-box"><strong>Pedoman Jawaban:</strong><br>${Utils.escapeHtml(q.modelAnswer || '')}</div>
            <div class="essay-answer-box"><strong>Rubrik:</strong><br>${Utils.escapeHtml(q.rubric || '')}</div>
          </div>
        `;
      }

      UI.Modal.open({
        title: `Preview Soal (${GradingService.questionTypeLabel(q.type)})`,
        size: 'md',
        bodyHtml: `
          <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;">
            <span class="badge ${GradingService.questionTypeBadgeClass(q.type)}">${GradingService.questionTypeLabel(q.type)}</span>
            <span class="badge badge--green">${q.points} Poin</span>
          </div>
          <p style="font-weight:600;color:var(--text-primary);">${Utils.escapeHtml(q.question)}</p>
          ${bodyPreview}
        `,
        footerHtml: `<button type="button" class="btn btn--outline" data-modal-close>Tutup</button>`
      });
    },

    /* ---------------- PENILAIAN ESSAY MANUAL ---------------- */
    gradingFilterStatus: 'all',

    renderEssayGradingList() {
      const allAttempts = [...(DataStore.state.attempts || [])]
        .filter((a) => (a.questionSnapshots || []).some((q) => q.type === 'essay'))
        .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      const filtered = allAttempts.filter((a) => {
        if (this.gradingFilterStatus === 'all') return true;
        return a.grading?.status === this.gradingFilterStatus;
      });

      const body = `
        <div class="admin-page-head">
          <div>
            <h1>Penilaian Essay Pengajar</h1>
            <p class="form-hint">Periksa jawaban uraian peserta secara manual, berikan poin sesuai rubrik, dan tambahkan umpan balik.</p>
          </div>
        </div>

        <div class="panel">
          <div class="toolbar" style="margin-bottom:1.25rem;">
            <div class="filter-pills">
              <button type="button" class="filter-pill ${this.gradingFilterStatus === 'all' ? 'is-active' : ''}" data-grade-filter="all">Semua (${allAttempts.length})</button>
              <button type="button" class="filter-pill ${this.gradingFilterStatus === 'pending_review' ? 'is-active' : ''}" data-grade-filter="pending_review">Menunggu Penilaian</button>
              <button type="button" class="filter-pill ${this.gradingFilterStatus === 'graded' ? 'is-active' : ''}" data-grade-filter="graded">Selesai Dinilai</button>
            </div>
          </div>

          ${filtered.length ? `
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID Peserta Demo</th>
                    <th>Mata Pelajaran &amp; Bab</th>
                    <th>Jenis Tes</th>
                    <th>Tanggal Pengerjaan</th>
                    <th>Essay Belum Diperiksa</th>
                    <th>Status Penilaian</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  ${filtered.map((att) => {
                    const testSnap = att.testSnapshot || LmsStore.getTestById(att.testId) || {};
                    const chap = LmsStore.getChapterById(testSnap.chapterId);
                    const subj = chap ? LmsStore.getSubjectById(chap.subjectId) : null;
                    const essayQs = (att.questionSnapshots || []).filter((q) => q.type === 'essay');
                    const grades = att.grading?.essayGrades || {};
                    const ungradedCount = essayQs.filter((q) => typeof grades[q.id]?.awardedPoints !== 'number').length;
                    const isPending = att.grading?.status === 'pending_review';

                    return `
                      <tr>
                        <td>
                          <strong>${CONFIG.PARTICIPANT_LABEL}</strong>
                          <div class="form-hint">${Utils.escapeHtml(att.participantId)}</div>
                        </td>
                        <td>
                          <div style="font-weight:600;color:var(--green-800);">${Utils.escapeHtml(subj?.title || '-')}</div>
                          <div class="form-hint">${Utils.escapeHtml(chap?.title || '-')}</div>
                        </td>
                        <td><span class="badge ${testSnap.type === 'pre_test' ? 'badge--teal' : 'badge--orange'}">${GradingService.testTypeLabel(testSnap.type)}</span></td>
                        <td>${Utils.formatDate(att.submittedAt)}</td>
                        <td>
                          ${ungradedCount > 0
                            ? `<span class="badge badge--warm">${ungradedCount} dari ${essayQs.length} soal</span>`
                            : `<span class="badge badge--green">0 (Semua diperiksa)</span>`}
                        </td>
                        <td>
                          <span class="badge ${isPending ? 'badge--warm' : 'badge--green'}">
                            ${isPending ? 'Menunggu Penilaian' : `Selesai Dinilai (${GradingService.formatScore(att.grading.finalScore)})`}
                          </span>
                        </td>
                        <td>
                          <a href="#/admin/penilaian/${Utils.escapeHtml(att.id)}" class="btn btn--primary btn--sm">
                            ${Utils.icon('clipboard-check', 15)} Periksa Jawaban
                          </a>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div class="empty-state">
              <div class="empty-state__icon">${Utils.icon('clipboard-check', 26)}</div>
              <h2 class="empty-state__title">Tidak Ada Pengerjaan Essay</h2>
              <p class="empty-state__desc">Belum ada jawaban essay pada filter yang dipilih.</p>
            </div>
          `}
        </div>
      `;

      return AdminViews.renderShell('#/admin/penilaian', 'Penilaian Essay', body);
    },

    bindEssayGradingList() {
      document.querySelectorAll('[data-grade-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
          this.gradingFilterStatus = btn.dataset.gradeFilter;
          Router.renderCurrent();
        });
      });
    },

    renderEssayGradingDetail(attemptId) {
      const attempt = LmsStore.getAttemptById(attemptId);
      if (!attempt) return this.renderEssayGradingList();

      const snap = attempt.testSnapshot || {};
      const chap = LmsStore.getChapterById(snap.chapterId);
      const subj = chap ? LmsStore.getSubjectById(chap.subjectId) : null;
      const essayQuestions = (attempt.questionSnapshots || []).filter((q) => q.type === 'essay');
      const isGraded = attempt.grading?.status === 'graded';

      const body = `
        <div class="admin-page-head">
          <div>
            <div class="breadcrumb" style="margin-bottom:0.35rem;">
              <a href="#/admin/penilaian">Penilaian Essay</a>
              <span>/</span>
              <span>Pemeriksaan Jawaban</span>
            </div>
            <h1>${Utils.escapeHtml(snap.title || 'Pemeriksaan Essay')}</h1>
            <p class="form-hint">
              ${CONFIG.PARTICIPANT_LABEL} (${Utils.escapeHtml(attempt.participantId)}) &bull;
              ${Utils.escapeHtml(subj?.title || '')} &bull; ${Utils.escapeHtml(chap?.title || '')}
            </p>
          </div>
          <a href="#/admin/penilaian" class="btn btn--outline btn--sm">${Utils.icon('arrow-left', 15)} Kembali ke Daftar</a>
        </div>

        <div class="stats-grid" style="margin-bottom:1.5rem;">
          <div class="stat-card">
            <div>
              <div class="stat-card__label">Status Penilaian</div>
              <div style="font-weight:700;color:var(--green-800);">${isGraded ? 'Selesai Dinilai' : 'Menunggu Penilaian'}</div>
            </div>
            <span class="badge ${isGraded ? 'badge--green' : 'badge--warm'}">${isGraded ? 'Final' : 'Pending'}</span>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-card__label">Skor Objektif (PG + B/S)</div>
              <div class="stat-card__value" style="font-size:1.5rem;">${attempt.grading.objectivePoints} / ${attempt.grading.maxObjectivePoints}</div>
            </div>
          </div>
          <div class="stat-card">
            <div>
              <div class="stat-card__label">Nilai Akhir</div>
              <div class="stat-card__value" style="font-size:1.5rem;">
                ${isGraded ? `${GradingService.formatScore(attempt.grading.finalScore)} / 100` : 'Belum Ditetapkan'}
              </div>
            </div>
            ${isGraded ? `<span class="badge ${attempt.grading.passed ? 'badge--green' : 'badge--orange'}">${attempt.grading.passed ? 'Lulus' : 'Belum Lulus'}</span>` : ''}
          </div>
        </div>

        <form id="essay-grading-form" class="form-stack">
          ${essayQuestions.map((q, idx) => {
            const existingGrade = attempt.grading?.essayGrades?.[q.id] || {};
            const ansText = attempt.answers?.[q.id];
            const valPts = typeof existingGrade.awardedPoints === 'number' ? existingGrade.awardedPoints : '';

            return `
              <section class="essay-grade-card">
                <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap;">
                  <strong style="color:var(--green-800);">Soal Essay #${idx + 1}</strong>
                  <span class="badge badge--orange">Bobot Maksimal: ${q.points} Poin</span>
                </div>

                <div>
                  <div class="form-label" style="margin-bottom:0.35rem;">Pertanyaan</div>
                  <p style="font-weight:500;">${Utils.escapeHtml(q.question)}</p>
                </div>

                <div>
                  <div class="form-label" style="margin-bottom:0.35rem;">Jawaban Peserta</div>
                  <div class="essay-answer-box">${Utils.escapeHtml((typeof ansText === 'string' && ansText.trim()) ? ansText : 'Tidak dijawab oleh peserta.')}</div>
                </div>

                <div class="form-row-2">
                  <div class="alert-box alert-box--info" style="flex-direction:column;gap:0.25rem;">
                    <strong>Pedoman Jawaban</strong>
                    <span>${Utils.escapeHtml(q.modelAnswer || '-')}</span>
                  </div>
                  <div class="alert-box alert-box--warn" style="flex-direction:column;gap:0.25rem;">
                    <strong>Rubrik Penilaian</strong>
                    <span>${Utils.escapeHtml(q.rubric || '-')}</span>
                  </div>
                </div>

                <div class="form-row-2">
                  <div class="form-field">
                    <label class="form-label" for="grade-pts-${Utils.escapeHtml(q.id)}">Poin Diberikan (0 – ${q.points}) <span>*</span></label>
                    <input
                      id="grade-pts-${Utils.escapeHtml(q.id)}"
                      class="input"
                      type="number"
                      min="0"
                      max="${q.points}"
                      step="0.5"
                      required
                      data-essay-pts="${Utils.escapeHtml(q.id)}"
                      data-max-pts="${q.points}"
                      value="${valPts}"
                      placeholder="Masukkan nilai 0 s.d. ${q.points}"
                    >
                  </div>
                  <div class="form-field">
                    <label class="form-label" for="grade-fb-${Utils.escapeHtml(q.id)}">Komentar / Umpan Balik (Opsional)</label>
                    <input
                      id="grade-fb-${Utils.escapeHtml(q.id)}"
                      class="input"
                      type="text"
                      data-essay-fb="${Utils.escapeHtml(q.id)}"
                      value="${Utils.escapeHtml(existingGrade.feedback || '')}"
                      placeholder="Catatan evaluasi untuk peserta..."
                    >
                  </div>
                </div>
              </section>
            `;
          }).join('')}

          <div id="essay-grade-error" class="form-error" style="display:none;"></div>

          <div style="display:flex;justify-content:flex-end;gap:0.75rem;flex-wrap:wrap;">
            <a href="#/admin/penilaian" class="btn btn--outline">Batal</a>
            <button type="submit" class="btn btn--primary">
              ${Utils.icon('check-circle-2', 17)} Simpan Penilaian &amp; Hitung Nilai Akhir
            </button>
          </div>
        </form>
      `;

      return AdminViews.renderShell('#/admin/penilaian', 'Pemeriksaan Essay', body);
    },

    bindEssayGradingDetail(attemptId) {
      document.getElementById('essay-grading-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('essay-grade-error');
        const gradesMap = {};

        try {
          document.querySelectorAll('[data-essay-pts]').forEach((input) => {
            const qId = input.dataset.essayPts;
            const maxPts = Number(input.dataset.maxPts);
            const rawVal = input.value.trim();

            if (rawVal === '') {
              throw new Error('Seluruh jawaban essay wajib diberi poin sebelum disimpan.');
            }
            const num = Number(rawVal);
            if (!Number.isFinite(num) || num < 0 || num > maxPts) {
              input.focus();
              throw new Error(`Nilai poin harus berada di antara 0 dan ${maxPts}.`);
            }

            const fbInput = document.querySelector(`[data-essay-fb="${qId}"]`);
            gradesMap[qId] = {
              awardedPoints: num,
              feedback: fbInput ? fbInput.value : ''
            };
          });

          const updated = LmsStore.gradeAttemptEssays(attemptId, gradesMap);
          errEl.style.display = 'none';
          UI.Toast.show(
            `Penilaian tersimpan! Nilai akhir: ${GradingService.formatScore(updated.grading.finalScore)} (${updated.grading.passed ? 'Lulus' : 'Belum Lulus'}).`,
            'success'
          );
          Router.renderCurrent();
        } catch (err) {
          errEl.textContent = err.message;
          errEl.style.display = 'block';
          UI.Toast.show(err.message, 'error');
        }
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

  Router.registerDynamicRoute(
    /^#\/admin\/penilaian$/,
    () => LmsAdminViews.renderEssayGradingList(),
    () => LmsAdminViews.bindEssayGradingList()
  );

  Router.registerDynamicRoute(
    /^#\/admin\/penilaian\/([^/]+)$/,
    (match) => LmsAdminViews.renderEssayGradingDetail(match[1]),
    (match) => LmsAdminViews.bindEssayGradingDetail(match[1])
  );

  PKNJ.GradingService = GradingService;
  PKNJ.LmsStore = LmsStore;
})();
