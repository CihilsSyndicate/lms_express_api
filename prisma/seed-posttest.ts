import { prisma } from '../src/lib/prisma';

// ---------------------------------------------------------------------------
// Topic-specific question banks (8 questions each, IT/CS focused)
// ---------------------------------------------------------------------------
type QuestionSeed = {
  question: string;
  options: string[];
  correctAnswer: string;
};

const Banks: Record<string, QuestionSeed[]> = {
  ALGORITHMS: [
    { question: 'Apa kompleksitas waktu dari Binary Search?', options: ['O(n)', 'O(n²)', 'O(1)', 'O(log n)'], correctAnswer: 'O(log n)' },
    { question: 'Algoritma sorting yang memiliki kompleksitas O(n²) pada kasus terburuk adalah...', options: ['Merge Sort', 'Quick Sort', 'Bubble Sort', 'Heap Sort'], correctAnswer: 'Bubble Sort' },
    { question: 'Dalam flowchart, simbol belah ketupat digunakan untuk...', options: ['Proses', 'Keputusan', 'Input/Output', 'Terminator'], correctAnswer: 'Keputusan' },
    { question: 'Teknik memecah masalah menjadi sub-masalah yang lebih kecil disebut...', options: ['Iterasi', 'Rekursi', 'Decomposition', 'Abstraksi'], correctAnswer: 'Decomposition' },
    { question: 'Notasi O(1) menunjukkan kompleksitas...', options: ['Linear', 'Konstan', 'Kuadratik', 'Logaritmik'], correctAnswer: 'Konstan' },
    { question: 'Algoritma DFS (Depth First Search) menggunakan struktur data...', options: ['Queue', 'Stack', 'Array', 'Tree'], correctAnswer: 'Stack' },
    { question: 'Metode pencarian yang membutuhkan data sudah terurut adalah...', options: ['Linear Search', 'Binary Search', 'Interpolation Search', 'Exponential Search'], correctAnswer: 'Binary Search' },
    { question: 'Algoritma greedy selalu mengambil keputusan...', options: ['Terbaik saat ini', 'Terbaik di masa depan', 'Acak', 'Berdasarkan simulasi'], correctAnswer: 'Terbaik saat ini' },
  ],

  DATA_STRUCTURES: [
    { question: 'Struktur data yang menggunakan prinsip LIFO adalah...', options: ['Queue', 'Stack', 'Array', 'Tree'], correctAnswer: 'Stack' },
    { question: 'Operasi yang dilakukan pada Queue adalah...', options: ['Push dan Pop', 'Enqueue dan Dequeue', 'Insert dan Delete', 'Add dan Remove'], correctAnswer: 'Enqueue dan Dequeue' },
    { question: 'Struktur data yang memiliki simpul akar (root) adalah...', options: ['Linked List', 'Array', 'Tree', 'Stack'], correctAnswer: 'Tree' },
    { question: 'Dalam Array, akses elemen ke-i memiliki kompleksitas...', options: ['O(n)', 'O(1)', 'O(log n)', 'O(n²)'], correctAnswer: 'O(1)' },
    { question: 'Singly Linked List memiliki pointer ke...', options: ['Node sebelumnya', 'Node berikutnya', 'Semua node', 'Node pertama'], correctAnswer: 'Node berikutnya' },
    { question: 'Data structure yang cocok untuk implementasi undo-redo adalah...', options: ['Queue', 'Stack', 'Array', 'Graph'], correctAnswer: 'Stack' },
    { question: 'Hash table menggunakan fungsi...', options: ['Rekursif', 'Hash', 'Sorting', 'Searching'], correctAnswer: 'Hash' },
    { question: 'Graph dapat direpresentasikan menggunakan...', options: ['Adjacency Matrix', 'Binary Tree', 'Stack', 'Queue'], correctAnswer: 'Adjacency Matrix' },
  ],

  WEB_DEV: [
    { question: 'Tag HTML untuk membuat hyperlink adalah...', options: ['<link>', '<a>', '<href>', '<url>'], correctAnswer: '<a>' },
    { question: 'CSS property untuk mengubah warna teks adalah...', options: ['text-color', 'font-color', 'color', 'foreground'], correctAnswer: 'color' },
    { question: 'JavaScript adalah bahasa pemrograman yang bersifat...', options: ['Compiled', 'Interpreted', 'Markup', 'Query'], correctAnswer: 'Interpreted' },
    { question: 'Fungsi untuk mencetak ke konsol di JavaScript adalah...', options: ['print()', 'echo()', 'console.log()', 'write()'], correctAnswer: 'console.log()' },
    { question: 'HTTP method yang digunakan untuk mengirim data form adalah...', options: ['GET', 'POST', 'PUT', 'DELETE'], correctAnswer: 'POST' },
    { question: 'Framework CSS yang populer adalah...', options: ['React', 'Vue', 'Bootstrap', 'Node.js'], correctAnswer: 'Bootstrap' },
    { question: 'Atribut HTML yang digunakan untuk menuliskan JavaScript inline adalah...', options: ['script', 'javascript', 'onclick', 'action'], correctAnswer: 'script' },
    { question: 'DOCTYPE html berfungsi untuk...', options: ['Menentukan judul', 'Mendeklarasikan versi HTML', 'Memuat CSS', 'Menjalankan script'], correctAnswer: 'Mendeklarasikan versi HTML' },
  ],

  DATABASES: [
    { question: 'Perintah SQL untuk menghapus tabel adalah...', options: ['DELETE TABLE', 'DROP TABLE', 'REMOVE TABLE', 'CLEAR TABLE'], correctAnswer: 'DROP TABLE' },
    { question: 'Primary key pada tabel basis data bersifat...', options: ['Boleh duplikat', 'Unik dan tidak boleh null', 'Unik tapi boleh null', 'Tidak unik'], correctAnswer: 'Unik dan tidak boleh null' },
    { question: 'Perintah SQL untuk mengambil data adalah...', options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'], correctAnswer: 'SELECT' },
    { question: 'Normalisasi basis data bertujuan untuk...', options: ['Mempercepat query', 'Menghilangkan redundansi data', 'Mengenkripsi data', 'Memperkecil ukuran'], correctAnswer: 'Menghilangkan redundansi data' },
    { question: 'Relasi one-to-many diimplementasikan dengan...', options: ['Foreign key', 'Primary key', 'Composite key', 'Index'], correctAnswer: 'Foreign key' },
    { question: 'Perintah untuk menambahkan data baru di SQL adalah...', options: ['INSERT INTO', 'ADD INTO', 'CREATE', 'APPEND'], correctAnswer: 'INSERT INTO' },
    { question: 'DBMS adalah singkatan dari...', options: ['Database Management System', 'Data Binary Management System', 'Database Modeling System', 'Data Backup Management System'], correctAnswer: 'Database Management System' },
    { question: 'Join SQL yang mengembalikan semua data dari kedua tabel adalah...', options: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'RIGHT JOIN'], correctAnswer: 'FULL OUTER JOIN' },
  ],

  PROGRAMMING: [
    { question: 'Apa output dari kode JavaScript: console.log(typeof 42)?', options: ['number', 'string', 'object', 'integer'], correctAnswer: 'number' },
    { question: 'Konsep OOP yang menyembunyikan detail implementasi disebut...', options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'], correctAnswer: 'Encapsulation' },
    { question: 'Variabel yang nilainya tidak dapat diubah setelah diinisialisasi disebut...', options: ['Variable', 'Constant', 'Mutable', 'Dynamic'], correctAnswer: 'Constant' },
    { question: 'Struktur perulangan yang pasti dijalankan minimal satu kali adalah...', options: ['For', 'While', 'Do-While', 'Foreach'], correctAnswer: 'Do-While' },
    { question: 'Dalam Python, fungsi untuk membaca input dari pengguna adalah...', options: ['scan()', 'input()', 'read()', 'get()'], correctAnswer: 'input()' },
    { question: 'Tipe data boolean hanya memiliki nilai...', options: ['0 dan 1', 'True dan False', 'Yes dan No', 'On dan Off'], correctAnswer: 'True dan False' },
    { question: 'Operator yang digunakan untuk perbandingan sama dengan di JavaScript adalah...', options: ['=', '==', '===', '!='], correctAnswer: '===' },
    { question: 'Error yang terjadi saat program sedang berjalan disebut...', options: ['Syntax Error', 'Runtime Error', 'Logical Error', 'Compile Error'], correctAnswer: 'Runtime Error' },
  ],

  MATH: [
    { question: 'Himpunan bilangan {1,2,3} jika digabung dengan {2,3,4} menghasilkan...', options: ['{1,2,3,4}', '{1,2,3}', '{2,3}', '{1,2,3,2,3,4}'], correctAnswer: '{1,2,3,4}' },
    { question: 'Bilangan biner 1010 jika dikonversi ke desimal adalah...', options: ['8', '9', '10', '12'], correctAnswer: '10' },
    { question: 'Fungsi logika AND menghasilkan TRUE jika...', options: ['Semua input TRUE', 'Salah satu input TRUE', 'Semua input FALSE', 'Input ganjil TRUE'], correctAnswer: 'Semua input TRUE' },
    { question: 'Himpunan kosong dilambangkan dengan...', options: ['{0}', '{}', '∅', 'None'], correctAnswer: '∅' },
    { question: 'Banyaknya cara menyusun 3 buku berbeda adalah...', options: ['3', '6', '9', '27'], correctAnswer: '6' },
    { question: 'Nilai probabilitas selalu berada di antara...', options: ['-1 dan 1', '0 dan 1', '0 dan 100', '-∞ dan ∞'], correctAnswer: '0 dan 1' },
    { question: 'Permutasi memperhatikan...', options: ['Urutan', 'Jenis', 'Warna', 'Ukuran'], correctAnswer: 'Urutan' },
    { question: 'Graf yang tidak memiliki sirkuit disebut...', options: ['Tree', 'Cycle', 'Complete Graph', 'Directed Graph'], correctAnswer: 'Tree' },
  ],

  ML_AI: [
    { question: 'Algoritma ML yang digunakan untuk memprediksi nilai kontinu disebut...', options: ['Klasifikasi', 'Regresi', 'Clustering', 'Asosiasi'], correctAnswer: 'Regresi' },
    { question: 'Supervised learning membutuhkan data...', options: ['Tanpa label', 'Berlabel', 'Acak', 'Tidak terstruktur'], correctAnswer: 'Berlabel' },
    { question: 'Algoritma K-Means termasuk dalam jenis...', options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Semi-supervised Learning'], correctAnswer: 'Unsupervised Learning' },
    { question: 'Fungsi aktivasi yang umum digunakan di neural network adalah...', options: ['ReLU', 'SQL', 'JSON', 'HTTP'], correctAnswer: 'ReLU' },
    { question: 'Overfitting terjadi ketika model...', options: ['Terlalu sederhana', 'Terlalu kompleks', 'Kurang data', 'Data tidak bersih'], correctAnswer: 'Terlalu kompleks' },
    { question: 'Confusion matrix digunakan untuk mengevaluasi model...', options: ['Regresi', 'Klasifikasi', 'Clustering', 'Dimensionality Reduction'], correctAnswer: 'Klasifikasi' },
    { question: 'Proses membagi dataset menjadi training dan testing bertujuan untuk...', options: ['Mempercepat training', 'Mencegah overfitting', 'Mengurangi ukuran data', 'Menambah akurasi'], correctAnswer: 'Mencegah overfitting' },
    { question: 'Natural Language Processing (NLP) berkaitan dengan...', options: ['Pengolahan bahasa alami', 'Pengolahan citra', 'Pengolahan suara', 'Pengolahan angka'], correctAnswer: 'Pengolahan bahasa alami' },
  ],

  NETWORKING: [
    { question: 'Port default untuk HTTP adalah...', options: ['21', '80', '443', '3306'], correctAnswer: '80' },
    { question: 'Protokol yang digunakan untuk mengirim email adalah...', options: ['HTTP', 'FTP', 'SMTP', 'SSH'], correctAnswer: 'SMTP' },
    { question: 'Lapisan terbawah pada model OSI adalah...', options: ['Network', 'Physical', 'Data Link', 'Transport'], correctAnswer: 'Physical' },
    { question: 'IP address 127.0.0.1 dikenal sebagai...', options: ['Gateway', 'DNS Server', 'Localhost', 'Broadcast'], correctAnswer: 'Localhost' },
    { question: 'Perangkat yang menghubungkan dua jaringan berbeda adalah...', options: ['Switch', 'Hub', 'Router', 'Modem'], correctAnswer: 'Router' },
    { question: 'Protokol yang menjamin pengiriman data reliable adalah...', options: ['UDP', 'TCP', 'IP', 'ICMP'], correctAnswer: 'TCP' },
    { question: 'Kepanjangan dari DNS adalah...', options: ['Domain Network System', 'Domain Name System', 'Data Network Service', 'Digital Name Service'], correctAnswer: 'Domain Name System' },
    { question: 'Jenis jaringan yang mencakup area geografis luas disebut...', options: ['LAN', 'MAN', 'WAN', 'PAN'], correctAnswer: 'WAN' },
  ],

  EDUCATION_MEDIA: [
    { question: 'Aplikasi untuk membuat kuis interaktif adalah...', options: ['Microsoft Word', 'Google Forms', 'Paint', 'Notepad'], correctAnswer: 'Google Forms' },
    { question: 'Platform video conference untuk pembelajaran daring adalah...', options: ['Instagram', 'Zoom', 'Twitter', 'TikTok'], correctAnswer: 'Zoom' },
    { question: 'LMS adalah singkatan dari...', options: ['Learning Management System', 'Library Management System', 'Language Modeling Software', 'Learning Module Standard'], correctAnswer: 'Learning Management System' },
    { question: 'Aplikasi presentasi interaktif adalah...', options: ['Excel', 'PowerPoint', 'Outlook', 'OneNote'], correctAnswer: 'PowerPoint' },
    { question: 'Format file untuk menyimpan dokumen portabel adalah...', options: ['DOCX', 'XLSX', 'PDF', 'PPTX'], correctAnswer: 'PDF' },
    { question: 'Canva adalah platform untuk membuat...', options: ['Spreadsheet', 'Desain grafis', 'Database', 'Aplikasi'], correctAnswer: 'Desain grafis' },
    { question: 'Moodle adalah contoh...', options: ['Sosial media', 'LMS open source', 'Aplikasi chat', 'Editor video'], correctAnswer: 'LMS open source' },
    { question: 'Green screen digunakan dalam pembuatan video untuk...', options: ['Efek chroma key', 'Pencahayaan', 'Rekaman audio', 'Editing teks'], correctAnswer: 'Efek chroma key' },
  ],

  STATISTICS: [
    { question: 'Nilai tengah dari data yang telah diurutkan disebut...', options: ['Mean', 'Median', 'Modus', 'Range'], correctAnswer: 'Median' },
    { question: 'Ukuran penyebaran data yang paling sederhana adalah...', options: ['Variansi', 'Range', 'Standar deviasi', 'Kuartil'], correctAnswer: 'Range' },
    { question: 'Nilai yang paling sering muncul dalam dataset disebut...', options: ['Mean', 'Median', 'Modus', 'Median'], correctAnswer: 'Modus' },
    { question: 'Distribusi normal memiliki bentuk...', options: ['Menceng kiri', 'Simetris seperti lonceng', 'Menceng kanan', 'Seragam'], correctAnswer: 'Simetris seperti lonceng' },
    { question: 'Uji t-test digunakan untuk membandingkan...', options: ['Dua rata-rata', 'Dua variansi', 'Tiga kelompok', 'Proporsi'], correctAnswer: 'Dua rata-rata' },
    { question: 'Korelasi Pearson mengukur hubungan...', options: ['Kausal', 'Linear', 'Non-linear', 'Kategorikal'], correctAnswer: 'Linear' },
    { question: 'Populasi dalam statistika adalah...', options: ['Sebagian data', 'Keseluruhan objek', 'Sampel data', 'Data acak'], correctAnswer: 'Keseluruhan objek' },
    { question: 'Standar deviasi adalah akar kuadrat dari...', options: ['Range', 'Mean', 'Variansi', 'Median'], correctAnswer: 'Variansi' },
  ],

  GENERAL_CS: [
    { question: 'Apa kepanjangan dari CPU?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], correctAnswer: 'Central Processing Unit' },
    { question: 'Perangkat keras yang berfungsi menyimpan data permanen adalah...', options: ['RAM', 'Hard Disk', 'Processor', 'Monitor'], correctAnswer: 'Hard Disk' },
    { question: 'Sistem operasi open source yang populer adalah...', options: ['Windows', 'macOS', 'Linux', 'iOS'], correctAnswer: 'Linux' },
    { question: 'Apa fungsi dari RAM pada komputer?', options: ['Menyimpan data permanen', 'Menyimpan data sementara', 'Memproses grafik', 'Menghubungkan internet'], correctAnswer: 'Menyimpan data sementara' },
    { question: 'Bahasa pemrograman yang sering digunakan untuk AI adalah...', options: ['PHP', 'Python', 'HTML', 'SQL'], correctAnswer: 'Python' },
    { question: 'Unit terkecil dari data digital adalah...', options: ['Byte', 'Bit', 'Kilobyte', 'Nibble'], correctAnswer: 'Bit' },
    { question: 'Firewall berfungsi untuk...', options: ['Mempercepat internet', 'Mengamankan jaringan', 'Menyimpan data', 'Mengedit dokumen'], correctAnswer: 'Mengamankan jaringan' },
    { question: 'Cloud computing memungkinkan...', options: ['Akses sumber daya via internet', 'Komputasi offline', 'Penyimpanan fisik', 'Jaringan lokal'], correctAnswer: 'Akses sumber daya via internet' },
  ],
};

// ---------------------------------------------------------------------------
// Mapping: module name keywords → bank key
// ---------------------------------------------------------------------------
function selectBank(moduleName: string): QuestionSeed[] {
  const name = moduleName.toLowerCase();
  if (name.includes('algoritma')) return Banks.ALGORITHMS;
  if (name.includes('struktur data')) return Banks.DATA_STRUCTURES;
  if (name.includes('web')) return Banks.WEB_DEV;
  if (name.includes('basis data') || name.includes('database') || name.includes('sql')) return Banks.DATABASES;
  if (name.includes('coding') || name.includes('pemrograman') || name.includes('programming')) return Banks.PROGRAMMING;
  if (name.includes('matematika') || name.includes('diskrit')) return Banks.MATH;
  if (name.includes('machine learning') || name.includes('ml') || name.includes('ai')) return Banks.ML_AI;
  if (name.includes('jaringan') || name.includes('networking')) return Banks.NETWORKING;
  if (name.includes('media') || name.includes('pembelajaran')) return Banks.EDUCATION_MEDIA;
  if (name.includes('statistika') || name.includes('statistics')) return Banks.STATISTICS;
  return Banks.GENERAL_CS;
}

// ---------------------------------------------------------------------------
// Pick N random distinct questions from a bank (3 ≤ N ≤ 5)
// ---------------------------------------------------------------------------
function pickQuestions(bank: QuestionSeed[]): QuestionSeed[] {
  const count = Math.floor(Math.random() * 3) + 3; // 3, 4, or 5
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, bank.length));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('Seeding Posttest for all Moduls...\n');

  const moduls = await prisma.modul.findMany({
    include: {
      posttest: {
        include: { soals: true },
      },
    },
    orderBy: { moduleName: 'asc' },
  });

  console.log(`Found ${moduls.length} module(s)\n`);

  let createdCount = 0;
  let skippedCount = 0;
  let addedSoalCount = 0;

  for (const modul of moduls) {
    // Idempotency: skip if posttest already exists with questions
    if (modul.posttest && modul.posttest.soals.length > 0) {
      console.log(`  ✓ Skipping "${modul.moduleName}" — already has ${modul.posttest.soals.length} question(s)`);
      skippedCount++;
      continue;
    }

    // Select bank and pick 3-5 random questions
    const bank = selectBank(modul.moduleName);
    const selected = pickQuestions(bank);

    let posttestId: string;

    if (modul.posttest) {
      // Reuse existing empty posttest
      posttestId = modul.posttest.id;
      console.log(`  ~ "${modul.moduleName}" — reusing existing Posttest (${posttestId})`);
    } else {
      // Create new posttest
      const posttest = await prisma.posttest.create({ data: {} });
      posttestId = posttest.id;
      // Link to modul
      await prisma.modul.update({
        where: { id: modul.id },
        data: { posttestId },
      });
      console.log(`  + "${modul.moduleName}" — created Posttest (${posttestId})`);
    }

    // Create soal
    for (const q of selected) {
      await prisma.soalPosttest.create({
        data: {
          posttestId,
          question: q.question,
          pilihan: q.options,
          correctAnswer: q.correctAnswer,
          skor: 10,
        },
      });
    }

    console.log(`     → ${selected.length} question(s) added`);
    createdCount++;
    addedSoalCount += selected.length;
  }

  console.log(`\n=== Summary ===`);
  console.log(`  Total modules processed : ${moduls.length}`);
  console.log(`  Created/updated         : ${createdCount}`);
  console.log(`  Skipped (already exist) : ${skippedCount}`);
  console.log(`  Total questions added   : ${addedSoalCount}`);
  console.log('\n✓ Posttest seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('✗ Posttest seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
