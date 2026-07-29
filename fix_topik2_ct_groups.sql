-- Fix topik 2 CT quiz groups: split 20 quizzes into 5 correct groups
-- Each group gets a unique ctGroupId and the correct ctStory

-- G1: Kos WiFi — story already correct, assign unique ctGroupId
UPDATE "Quiz" SET "ctGroupId" = 'ctg-fix-topik2-group1'
WHERE id IN (
  'cmrxdotp2000604l4q4zwms9v',
  'cmrxet02a000604lbdp58djmx',
  'cmrxet1qm000c04lbcjgjg7l0',
  'cmrxet3cp000i04lbbn4icb24'
);

-- G2: Andi phishing email — update ctGroupId + ctStory
UPDATE "Quiz" SET
  "ctGroupId" = 'ctg-fix-topik2-group2',
  "ctStory" = '<div>Andi menerima email yang mengatasnamakan bank tempatnya menabung. Email tersebut memintanya mengklik tautan untuk memperbarui data akun dalam waktu 24 jam, disertai ancaman penutupan rekening jika tidak segera dilakukan.</div>'
WHERE id IN (
  'cmrxet514000o04lb4tlwexx8',
  'cmrxet6va000u04lb3p4hinvs',
  'cmrxet94l001004lblumdzsuk',
  'cmrxetaw8001604lbd15wsii6'
);

-- G3: Tim IT kampus — update ctGroupId + ctStory
UPDATE "Quiz" SET
  "ctGroupId" = 'ctg-fix-topik2-group3',
  "ctStory" = '<div>Tim IT sebuah kampus mendapati bahwa koneksi WiFi di beberapa area gedung sering mengalami gangguan, terutama di dekat aula pada jam istirahat siang ketika ratusan mahasiswa mengakses jaringan secara bersamaan.</div>'
WHERE id IN (
  'cmrxetckm001c04lb9b1fj7dh',
  'cmrxeteg7001i04lbke48u2y3',
  'cmrxetg20001o04lbucmvcywy',
  'cmrxethmo001u04lb5yx6uvck'
);

-- G4: Kebijakan kata sandi organisasi — update ctGroupId + ctStory
UPDATE "Quiz" SET
  "ctGroupId" = 'ctg-fix-topik2-group4',
  "ctStory" = '<div>Sebuah organisasi mahasiswa mendapati bahwa beberapa akun media sosial resmi mereka diretas. Setelah ditelusuri, diketahui banyak anggota menggunakan kata sandi yang sederhana dan mudah ditebak, bahkan berbagi kata sandi dengan sesama anggota.</div>'
WHERE id IN (
  'cmrxetj89002004lbr6qku1in',
  'cmrxetkt1002604lb3wfx4hxz',
  'cmrxetmdj002c04lbae097ldh',
  'cmrxetnz9002i04lbhio0emwq'
);

-- G5: Serangan ransomware — update ctGroupId + ctStory
UPDATE "Quiz" SET
  "ctGroupId" = 'ctg-fix-topik2-group5',
  "ctStory" = '<div>Sebuah usaha kecil mengalami serangan ransomware yang mengenkripsi seluruh data penting perusahaan. Serangan terjadi setelah salah satu karyawan tidak sengaja mengunduh lampiran dari email tidak dikenal yang masuk ke kotak surat kerjanya.</div>'
WHERE id IN (
  'cmrxetpjd002o04lbd84ct8bf',
  'cmrxetr4b002u04lbacuxlura',
  'cmrxetspr003004lbg4ae5w8a',
  'cmrxetub6003604lb3tv7zlpm'
);
