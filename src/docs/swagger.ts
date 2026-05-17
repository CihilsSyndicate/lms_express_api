type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
type Role = 'admin' | 'tutor' | 'siswa';

const bearerSecurity = [{ BearerAuth: [] }];

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (schema: object) => ({ type: 'array', items: schema });

const idParam = (name: string, description: string, example: string) => ({
  name,
  in: 'path',
  required: true,
  description,
  schema: { type: 'string' },
  example,
});

const paginationParams = [
  {
    name: 'limit',
    in: 'query',
    required: false,
    description: 'Maximum number of items to return.',
    schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
    example: 10,
  },
  {
    name: 'cursor',
    in: 'query',
    required: false,
    description: 'Opaque cursor returned from the previous page.',
    schema: { type: 'string', nullable: true },
    example: null,
  },
];

const requestBody = (schemaName: string, example?: object) => ({
  required: true,
  content: {
    'application/json': {
      schema: ref(schemaName),
      ...(example ? { example } : {}),
    },
  },
});

const response = (schemaName: string, description = 'Success', example?: object) => ({
  description,
  content: {
    'application/json': {
      schema: ref(schemaName),
      ...(example ? { example } : {}),
    },
  },
});

const arrayResponse = (schemaName: string, description = 'Success') => ({
  description,
  content: {
    'application/json': {
      schema: arrayOf(ref(schemaName)),
    },
  },
});

const errorResponses = {
  400: response('ErrorResponse', 'Bad Request'),
  401: response('ErrorResponse', 'Unauthorized'),
  403: response('ErrorResponse', 'Forbidden'),
  404: response('ErrorResponse', 'Not Found'),
  422: response('ValidationErrorResponse', 'Validation Error'),
  500: response('ErrorResponse', 'Internal Server Error'),
};

const op = (
  method: HttpMethod,
  tag: string,
  summary: string,
  options: {
    role?: Role;
    public?: boolean;
    description?: string;
    parameters?: object[];
    requestSchema?: string;
    requestExample?: object;
    responseSchema?: string;
    responseDescription?: string;
    responseExample?: object;
    responseIsArray?: boolean;
    successStatus?: number;
  } = {},
) => {
  const roleDescription = options.role ? `Required role: ${options.role}.` : undefined;
  const description = [roleDescription, options.description]
    .filter(Boolean)
    .join(' ');
  const successStatus = options.successStatus ?? (options.requestSchema ? 201 : 200);

  const successResponse = options.responseIsArray
    ? arrayResponse(options.responseSchema ?? 'ObjectResponse', options.responseDescription)
    : response(
        options.responseSchema ?? 'ObjectResponse',
        options.responseDescription,
        options.responseExample,
      );

  return {
    [method]: {
      tags: [tag],
      summary,
      description: description || undefined,
      security: options.public ? undefined : bearerSecurity,
      parameters: options.parameters,
      requestBody: options.requestSchema
        ? requestBody(options.requestSchema, options.requestExample)
        : undefined,
      responses: {
        [successStatus]: successResponse,
        ...errorResponses,
      },
      ...(options.role ? { 'x-required-role': options.role } : {}),
    },
  };
};

const merge = (...items: object[]) => Object.assign({}, ...items);

const moduleCrud = (basePath: string, tag: string, role: 'admin' | 'tutor') => ({
  [basePath]: merge(
    op('get', tag, 'Get modules with cursor pagination', {
      role,
      parameters: paginationParams,
      responseSchema: 'PaginatedModulesResponse',
    }),
    op('post', tag, 'Create module', {
      role,
      requestSchema: 'ModuleCreateRequest',
      requestExample: examples.moduleCreate,
      responseSchema: 'Module',
    }),
  ),
  [`${basePath}/{id}`]: merge(
    op('get', tag, 'Get module by ID', {
      role,
      parameters: [idParam('id', 'Module ID.', 'modul_123')],
      responseSchema: 'Module',
    }),
    op('put', tag, 'Update module', {
      role,
      parameters: [idParam('id', 'Module ID.', 'modul_123')],
      requestSchema: 'ModuleUpdateRequest',
      requestExample: examples.moduleUpdate,
      responseSchema: 'Module',
      successStatus: 200,
    }),
    op('delete', tag, 'Delete module', {
      role,
      parameters: [idParam('id', 'Module ID.', 'modul_123')],
      responseSchema: 'MessageResponse',
    }),
  ),
});

const adminModuleCrud = (basePath: string) => ({
  ...moduleCrud(basePath, 'Admin - Modul', 'admin'),
  [`${basePath}/assign`]: merge(
    op('post', 'Admin - Modul', 'Assign student to module', {
      role: 'admin',
      requestSchema: 'AssignModuleRequest',
      requestExample: examples.assignModule,
      responseSchema: 'Progress',
    }),
    op('delete', 'Admin - Modul', 'Unassign student from module', {
      role: 'admin',
      requestSchema: 'AssignModuleRequest',
      requestExample: examples.assignModule,
      responseSchema: 'MessageResponse',
      successStatus: 200,
    }),
  ),
});

const accountManagement = (
  basePath: string,
  tag: string,
  roleName: 'siswa' | 'tutor',
) => {
  const requestSchema = roleName === 'siswa' ? 'SiswaRegisterRequest' : 'TutorRegisterRequest';
  const updateSchema = roleName === 'siswa' ? 'SiswaUpdateRequest' : 'TutorUpdateRequest';
  const responseSchema = roleName === 'siswa' ? 'Siswa' : 'Tutor';
  const example = roleName === 'siswa' ? examples.siswaRegister : examples.tutorRegister;

  return {
    [basePath]: op('post', tag, `Register ${roleName}`, {
      role: 'admin',
      requestSchema,
      requestExample: example,
      responseSchema,
    }),
    [`${basePath}/{id}`]: merge(
      op('put', tag, `Update ${roleName}`, {
        role: 'admin',
        parameters: [idParam('id', `${roleName} ID.`, `${roleName}_123`)],
        requestSchema: updateSchema,
        requestExample: example,
        responseSchema,
        successStatus: 200,
      }),
      op('delete', tag, `Delete ${roleName}`, {
        role: 'admin',
        parameters: [idParam('id', `${roleName} ID.`, `${roleName}_123`)],
        responseSchema: 'MessageResponse',
      }),
    ),
    [`${basePath}/{id}/deactivate`]: op('patch', tag, `Deactivate ${roleName}`, {
      role: 'admin',
      parameters: [idParam('id', `${roleName} ID.`, `${roleName}_123`)],
      responseSchema,
    }),
  };
};

const topicCrud = (basePath: string, tag: string, role: 'admin' | 'tutor') => ({
  [`${basePath}/{modulId}`]: op('get', tag, 'Get topics by module', {
    role,
    parameters: [idParam('modulId', 'Module ID.', 'modul_123')],
    responseSchema: 'Topic',
    responseIsArray: true,
  }),
  [basePath]: op('post', tag, 'Create topic', {
    role,
    requestSchema: 'TopicCreateRequest',
    requestExample: examples.topicCreate,
    responseSchema: 'Topic',
  }),
  [`${basePath}/{id}`]: merge(
    op('put', tag, 'Update topic', {
      role,
      parameters: [idParam('id', 'Topic ID.', 'topik_123')],
      requestSchema: 'TopicUpdateRequest',
      requestExample: examples.topicUpdate,
      responseSchema: 'Topic',
      successStatus: 200,
    }),
    op('delete', tag, 'Delete topic', {
      role,
      parameters: [idParam('id', 'Topic ID.', 'topik_123')],
      responseSchema: 'MessageResponse',
    }),
  ),
});

const materialCrud = (basePath: string, tag: string, role: 'admin' | 'tutor') => ({
  [`${basePath}/{modulId}`]: op('get', tag, 'Get materials by module', {
    role,
    parameters: [idParam('modulId', 'Module ID.', 'modul_123')],
    responseSchema: 'Material',
    responseIsArray: true,
  }),
  [basePath]: op('post', tag, 'Create material', {
    role,
    requestSchema: 'MaterialCreateRequest',
    requestExample: examples.materialCreate,
    responseSchema: 'Material',
  }),
  [`${basePath}/{id}`]: merge(
    op('put', tag, 'Update material', {
      role,
      parameters: [idParam('id', 'Material ID.', 'materi_123')],
      requestSchema: 'MaterialUpdateRequest',
      requestExample: examples.materialUpdate,
      responseSchema: 'Material',
      successStatus: 200,
    }),
    op('delete', tag, 'Delete material', {
      role,
      parameters: [idParam('id', 'Material ID.', 'materi_123')],
      responseSchema: 'MessageResponse',
    }),
  ),
});

const submaterialCrud = (basePath: string, tag: string) => ({
  [`${basePath}/materi/{materiId}`]: op('get', tag, 'Get submaterials by material', {
    role: 'tutor',
    parameters: [idParam('materiId', 'Material ID.', 'materi_123')],
    responseSchema: 'Submaterial',
    responseIsArray: true,
  }),
  [`${basePath}/{id}`]: merge(
    op('get', tag, 'Get submaterial detail', {
      role: 'tutor',
      parameters: [idParam('id', 'Submaterial ID.', 'submateri_123')],
      responseSchema: 'Submaterial',
    }),
    op('put', tag, 'Update submaterial', {
      role: 'tutor',
      parameters: [idParam('id', 'Submaterial ID.', 'submateri_123')],
      requestSchema: 'SubmaterialUpdateRequest',
      requestExample: examples.submaterialUpdate,
      responseSchema: 'Submaterial',
      successStatus: 200,
    }),
    op('delete', tag, 'Delete submaterial', {
      role: 'tutor',
      parameters: [idParam('id', 'Submaterial ID.', 'submateri_123')],
      responseSchema: 'MessageResponse',
    }),
  ),
  [basePath]: op('post', tag, 'Create submaterial', {
    role: 'tutor',
    requestSchema: 'SubmaterialCreateRequest',
    requestExample: examples.submaterialCreate,
    responseSchema: 'Submaterial',
  }),
});

const testManagement = (
  basePath: string,
  tag: string,
  type: 'pretest' | 'posttest',
) => {
  const responseSchema = type === 'pretest' ? 'Pretest' : 'Posttest';
  const questionSchema = type === 'pretest' ? 'PretestQuestionRequest' : 'PosttestQuestionRequest';

  return {
    [`${basePath}/{modulId}`]: op('get', tag, `Get ${type} by module`, {
      role: 'tutor',
      parameters: [idParam('modulId', 'Module ID.', 'modul_123')],
      responseSchema,
    }),
    [basePath]: op('post', tag, `Create ${type}`, {
      role: 'tutor',
      requestSchema: 'TestCreateRequest',
      requestExample: examples.testCreate,
      responseSchema,
    }),
    [`${basePath}/soal`]: op('post', tag, `Add ${type} question`, {
      role: 'tutor',
      requestSchema: questionSchema,
      requestExample: type === 'pretest' ? examples.pretestQuestion : examples.posttestQuestion,
      responseSchema: type === 'pretest' ? 'PretestQuestion' : 'PosttestQuestion',
    }),
  };
};

const examples = {
  login: { email: 'siswa@example.com', password: 'secret123' },
  siswaRegister: {
    role: 'siswa',
    email: 'siswa@example.com',
    password: 'secret123',
    nama_lengkap: 'Budi Santoso',
    jenjang: 'SMA',
    kelas_sekolah: '10',
  },
  tutorRegister: {
    role: 'tutor',
    email: 'tutor@example.com',
    password: 'secret123',
    fullName: 'Dr. Tutor',
    gender: 'L',
    pekerjaan: 'Guru',
    whatsappNumber: '6281234567890',
    lastEducation: 'S2',
    institution: 'Universitas Contoh',
    prodi: 'Pendidikan Matematika',
    cvPathUrl: 'https://example.com/cv.pdf',
  },
  moduleCreate: {
    nama_modul: 'Algoritma Dasar',
    subtitle: 'Pengantar algoritma',
    deskripsi: 'Materi dasar algoritma untuk pemula.',
    target_waktu: 120,
    tingkat_kesulitan: 'Beginner',
    is_berbayar: false,
    harga_modul: null,
    jenjang: 'SMA',
    kelas_sekolah: '10',
    tutor_id: 'tutor_123',
  },
  moduleUpdate: {
    nama_modul: 'Algoritma Dasar Revisi',
    deskripsi: 'Materi dasar algoritma yang diperbarui.',
  },
  assignModule: { moduleId: 'modul_123', studentId: 'siswa_123' },
  materialCreate: {
    topik_id: 'topik_123',
    is_video: false,
    article: 'Isi materi pembelajaran.',
  },
  materialUpdate: { article: 'Isi materi yang diperbarui.' },
  topicCreate: { modul_id: 'modul_123', nama: 'Pengenalan Algoritma' },
  topicUpdate: { nama: 'Pengenalan Algoritma Revisi' },
  submaterialCreate: {
    materi_id: 'materi_123',
    judul: 'Konsep Dasar',
    konten: 'Konten submateri.',
  },
  submaterialUpdate: { judul: 'Konsep Dasar Revisi', konten: 'Konten baru.' },
  testCreate: { modul_id: 'modul_123' },
  pretestQuestion: {
    pretest_id: 'pretest_123',
    pertanyaan: 'Apa itu algoritma?',
    pilihan: ['Urutan langkah', 'Bahasa markup', 'Database'],
    jawaban_benar: 'Urutan langkah',
    skor: 10,
  },
  posttestQuestion: {
    posttest_id: 'posttest_123',
    pertanyaan: 'Apa tujuan algoritma?',
    pilihan: ['Memecahkan masalah', 'Menghapus data'],
    jawaban_benar: 'Memecahkan masalah',
    skor: 10,
  },
  submitAnswers: {
    answers: [{ questionId: 'question_123', answer: 'Urutan langkah' }],
  },
  rating: { rating: 5, komentar: 'Materinya mudah dipahami.' },
};

const componentSchemas = {
  ObjectResponse: {
    type: 'object',
    additionalProperties: true,
    example: { id: 'record_123' },
  },
  ErrorResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Internal server error.' },
      error: { nullable: true },
    },
    required: ['message'],
  },
  ValidationErrorResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Validation error' },
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: { type: 'string', example: 'email' },
            message: { type: 'string', example: 'Invalid email' },
          },
        },
      },
    },
  },
  MessageResponse: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Operation completed successfully' },
    },
    required: ['message'],
  },
  LoginRequest: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email', example: 'siswa@example.com' },
      password: { type: 'string', example: 'secret123' },
    },
    required: ['email', 'password'],
  },
  LoginResponse: {
    type: 'object',
    description: 'JWT access and refresh tokens are set as HTTP-only cookies by the implementation.',
    properties: {
      user: { $ref: '#/components/schemas/UserSession' },
      role: { type: 'string', enum: ['siswa', 'tutor', 'admin'], example: 'siswa' },
    },
    required: ['user', 'role'],
  },
  UserSession: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'siswa_123' },
      email: { type: 'string', format: 'email', example: 'siswa@example.com' },
      role: { type: 'string', enum: ['siswa', 'tutor', 'admin'], example: 'siswa' },
      nama_lengkap: { type: 'string', example: 'Budi Santoso' },
      fullName: { type: 'string', example: 'Dr. Tutor' },
    },
  },
  SiswaRegisterRequest: {
    type: 'object',
    properties: {
      role: { type: 'string', enum: ['siswa'], default: 'siswa', example: 'siswa' },
      nama_lengkap: { type: 'string', example: 'Budi Santoso' },
      email: { type: 'string', format: 'email', example: 'siswa@example.com' },
      password: { type: 'string', minLength: 6, example: 'secret123' },
      jenjang: { type: 'string', example: 'SMA' },
      kelas_sekolah: { type: 'string', example: '10' },
      profile_img: { type: 'string', nullable: true, example: null },
      push_notification_enabled: { type: 'boolean', default: true, example: true },
    },
    required: ['role', 'nama_lengkap', 'email', 'password', 'jenjang', 'kelas_sekolah'],
  },
  SiswaUpdateRequest: {
    type: 'object',
    properties: {
      role: { type: 'string', enum: ['siswa'], default: 'siswa', example: 'siswa' },
      nama_lengkap: { type: 'string', example: 'Budi Santoso' },
      password: { type: 'string', minLength: 6, example: 'secret123' },
      jenjang: { type: 'string', example: 'SMA' },
      kelas_sekolah: { type: 'string', example: '10' },
      profile_img: { type: 'string', nullable: true, example: null },
      push_notification_enabled: { type: 'boolean', default: true, example: true },
    },
  },
  TutorRegisterRequest: {
    type: 'object',
    properties: {
      role: { type: 'string', enum: ['tutor'], default: 'tutor', example: 'tutor' },
      fullName: { type: 'string', example: 'Dr. Tutor' },
      email: { type: 'string', format: 'email', example: 'tutor@example.com' },
      password: { type: 'string', example: 'secret123' },
      gender: { type: 'string', example: 'L' },
      pekerjaan: { type: 'string', example: 'Guru' },
      whatsappNumber: { type: 'string', example: '6281234567890' },
      lastEducation: { type: 'string', example: 'S2' },
      institution: { type: 'string', example: 'Universitas Contoh' },
      biografi: { type: 'string', nullable: true, example: 'Pengajar algoritma.' },
      prodi: { type: 'string', example: 'Pendidikan Matematika' },
      cvPathUrl: { type: 'string', example: 'https://example.com/cv.pdf' },
      profileImg: { type: 'string', nullable: true, example: null },
    },
    required: [
      'role',
      'fullName',
      'email',
      'password',
      'gender',
      'pekerjaan',
      'whatsappNumber',
      'lastEducation',
      'institution',
      'prodi',
      'cvPathUrl',
    ],
  },
  TutorUpdateRequest: {
    type: 'object',
    properties: {
      role: { type: 'string', enum: ['tutor'], default: 'tutor', example: 'tutor' },
      fullName: { type: 'string', example: 'Dr. Tutor' },
      password: { type: 'string', example: 'secret123' },
      gender: { type: 'string', example: 'L' },
      pekerjaan: { type: 'string', example: 'Guru' },
      whatsappNumber: { type: 'string', example: '6281234567890' },
      lastEducation: { type: 'string', example: 'S2' },
      institution: { type: 'string', example: 'Universitas Contoh' },
      biografi: { type: 'string', nullable: true, example: 'Pengajar algoritma.' },
      prodi: { type: 'string', example: 'Pendidikan Matematika' },
      cvPathUrl: { type: 'string', example: 'https://example.com/cv.pdf' },
      profileImg: { type: 'string', nullable: true, example: null },
    },
  },
  PublicRegisterRequest: {
    oneOf: [
      { $ref: '#/components/schemas/SiswaRegisterRequest' },
      { $ref: '#/components/schemas/TutorRegisterRequest' },
    ],
    discriminator: { propertyName: 'role' },
  },
  ModuleCreateRequest: {
    type: 'object',
    properties: {
      nama_modul: { type: 'string', example: 'Algoritma Dasar' },
      subtitle: { type: 'string', example: 'Pengantar algoritma' },
      deskripsi: { type: 'string', example: 'Materi dasar algoritma untuk pemula.' },
      target_waktu: { type: 'integer', example: 120 },
      tingkat_kesulitan: { type: 'string', example: 'Beginner' },
      is_berbayar: { type: 'boolean', default: false, example: false },
      harga_modul: { type: 'number', nullable: true, example: null },
      jenjang: { type: 'string', example: 'SMA' },
      kelas_sekolah: { type: 'string', example: '10' },
      tutor_id: { type: 'string', example: 'tutor_123' },
    },
    required: [
      'nama_modul',
      'subtitle',
      'deskripsi',
      'target_waktu',
      'tingkat_kesulitan',
      'jenjang',
      'kelas_sekolah',
      'tutor_id',
    ],
  },
  ModuleUpdateRequest: {
    type: 'object',
    properties: {
      nama_modul: { type: 'string', example: 'Algoritma Dasar Revisi' },
      subtitle: { type: 'string', example: 'Pengantar algoritma' },
      deskripsi: { type: 'string', example: 'Materi dasar algoritma revisi.' },
      target_waktu: { type: 'integer', example: 90 },
      tingkat_kesulitan: { type: 'string', example: 'Intermediate' },
      is_berbayar: { type: 'boolean', example: false },
      harga_modul: { type: 'number', nullable: true, example: null },
      jenjang: { type: 'string', example: 'SMA' },
      kelas_sekolah: { type: 'string', example: '10' },
    },
  },
  AssignModuleRequest: {
    type: 'object',
    properties: {
      moduleId: { type: 'string', example: 'modul_123' },
      studentId: { type: 'string', example: 'siswa_123' },
    },
    required: ['moduleId', 'studentId'],
  },
  MaterialCreateRequest: {
    type: 'object',
    properties: {
      topik_id: { type: 'string', example: 'topik_123' },
      is_video: { type: 'boolean', default: false, example: false },
      video_url: { type: 'string', nullable: true, example: null },
      article: { type: 'string', nullable: true, example: 'Isi materi pembelajaran.' },
    },
    required: ['topik_id'],
  },
  MaterialUpdateRequest: {
    type: 'object',
    properties: {
      is_video: { type: 'boolean', example: false },
      video_url: { type: 'string', nullable: true, example: null },
      article: { type: 'string', nullable: true, example: 'Isi materi diperbarui.' },
    },
  },
  TopicCreateRequest: {
    type: 'object',
    properties: {
      modul_id: { type: 'string', example: 'modul_123' },
      nama: { type: 'string', example: 'Pengenalan Algoritma' },
    },
    required: ['modul_id', 'nama'],
  },
  TopicUpdateRequest: {
    type: 'object',
    properties: {
      nama: { type: 'string', example: 'Pengenalan Algoritma Revisi' },
    },
  },
  SubmaterialCreateRequest: {
    type: 'object',
    properties: {
      materi_id: { type: 'string', example: 'materi_123' },
      judul: { type: 'string', example: 'Konsep Dasar' },
      konten: { type: 'string', example: 'Konten submateri.' },
    },
    required: ['materi_id', 'judul', 'konten'],
  },
  SubmaterialUpdateRequest: {
    type: 'object',
    properties: {
      judul: { type: 'string', example: 'Konsep Dasar Revisi' },
      konten: { type: 'string', example: 'Konten baru.' },
    },
  },
  TestCreateRequest: {
    type: 'object',
    properties: {
      modul_id: { type: 'string', example: 'modul_123' },
    },
    required: ['modul_id'],
  },
  PretestQuestionRequest: {
    type: 'object',
    properties: {
      pretest_id: { type: 'string', example: 'pretest_123' },
      pertanyaan: { type: 'string', example: 'Apa itu algoritma?' },
      pilihan: { type: 'array', items: { type: 'string' }, example: ['Urutan langkah', 'Bahasa markup'] },
      jawaban_benar: { type: 'string', example: 'Urutan langkah' },
      skor: { type: 'integer', default: 10, example: 10 },
    },
    required: ['pretest_id', 'pertanyaan', 'pilihan', 'jawaban_benar'],
  },
  PosttestQuestionRequest: {
    type: 'object',
    properties: {
      posttest_id: { type: 'string', example: 'posttest_123' },
      pertanyaan: { type: 'string', example: 'Apa tujuan algoritma?' },
      pilihan: { type: 'array', items: { type: 'string' }, example: ['Memecahkan masalah', 'Menghapus data'] },
      jawaban_benar: { type: 'string', example: 'Memecahkan masalah' },
      skor: { type: 'integer', default: 10, example: 10 },
    },
    required: ['posttest_id', 'pertanyaan', 'pilihan', 'jawaban_benar'],
  },
  SubmitAnswersRequest: {
    type: 'object',
    properties: {
      answers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            questionId: { type: 'string', example: 'question_123' },
            answer: { type: 'string', example: 'Urutan langkah' },
          },
          required: ['questionId', 'answer'],
        },
      },
    },
    required: ['answers'],
  },
  RatingRequest: {
    type: 'object',
    properties: {
      rating: { type: 'integer', minimum: 1, maximum: 5, example: 5 },
      komentar: { type: 'string', nullable: true, example: 'Materinya mudah dipahami.' },
    },
    required: ['rating'],
  },
  QuizPayloadRequest: {
    type: 'object',
    properties: {
      quiz: { $ref: '#/components/schemas/QuizCreateRequest' },
      answerOptions: {
        type: 'array',
        items: { $ref: '#/components/schemas/QuizAnswerOptionRequest' },
      },
      setting: { $ref: '#/components/schemas/QuizSettingRequest' },
    },
    required: ['quiz', 'answerOptions', 'setting'],
  },
  QuizCreateRequest: {
    type: 'object',
    properties: {
      materiId: { type: 'string', example: 'materi_123' },
      quizImgQuestionUrl: { type: 'string', nullable: true, example: null },
      question: { type: 'string', example: 'Apa output dari algoritma ini?' },
      correctAnswer: { type: 'string', example: 'A' },
      skor: { type: 'integer', default: 10, example: 10 },
    },
    required: ['materiId', 'question', 'correctAnswer'],
  },
  QuizAnswerOptionRequest: {
    type: 'object',
    properties: {
      option: { type: 'string', example: 'A' },
    },
    required: ['option'],
  },
  QuizSettingRequest: {
    type: 'object',
    properties: {
      quizId: { type: 'string', example: 'quiz_123' },
      timeLimit: { type: 'integer', nullable: true, example: 60 },
      allowMultipleAttempts: { type: 'boolean', default: false, example: false },
      isComputationalThinkingEnabled: { type: 'boolean', default: false, example: false },
      minScoreTreshold: { type: 'integer', nullable: true, example: 70 },
      standardScorePerQuestion: { type: 'integer', default: 100, example: 100 },
    },
  },
  QuizUpdateRequest: {
    type: 'object',
    properties: {
      quizImgQuestionUrl: { type: 'string', nullable: true, example: null },
      question: { type: 'string', example: 'Pertanyaan diperbarui?' },
      correctAnswer: { type: 'string', example: 'B' },
      skor: { type: 'integer', example: 10 },
    },
  },
  Module: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'modul_123' },
      moduleName: { type: 'string', example: 'Algoritma Dasar' },
      subtitle: { type: 'string', example: 'Pengantar algoritma' },
      description: { type: 'string', example: 'Materi dasar algoritma.' },
      targetTime: { type: 'integer', example: 120 },
      difficulty: { type: 'string', example: 'Beginner' },
      isPaid: { type: 'boolean', example: false },
      modulPrice: { type: 'number', nullable: true, example: null },
      level: { type: 'string', nullable: true, example: 'SMA' },
      class: { type: 'string', nullable: true, example: '10' },
      tutorId: { type: 'string', example: 'tutor_123' },
      isDraft: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  Topic: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'topik_123' },
      nama: { type: 'string', example: 'Pengenalan Algoritma' },
      modulId: { type: 'string', example: 'modul_123' },
      isComputationalThinking: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  Material: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'materi_123' },
      tutorId: { type: 'string', example: 'tutor_123' },
      topikId: { type: 'string', example: 'topik_123' },
      isVideo: { type: 'boolean', example: false },
      videoUrl: { type: 'string', nullable: true, example: null },
      article: { type: 'string', nullable: true, example: 'Isi materi.' },
      submateris: { type: 'array', items: { $ref: '#/components/schemas/Submaterial' } },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  Submaterial: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'submateri_123' },
      materiId: { type: 'string', example: 'materi_123' },
      judul: { type: 'string', example: 'Konsep Dasar' },
      konten: { type: 'string', example: 'Konten submateri.' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  Quiz: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'quiz_123' },
      materiId: { type: 'string', example: 'materi_123' },
      question: { type: 'string', example: 'Apa output dari algoritma ini?' },
      correctAnswer: { type: 'string', example: 'A' },
      skor: { type: 'integer', example: 10 },
      quizImgQuestionUrl: { type: 'string', nullable: true, example: null },
      quizAnswerOptions: {
        type: 'array',
        items: { $ref: '#/components/schemas/QuizAnswerOption' },
      },
      quizSetting: { type: 'object', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  QuizAnswerOption: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'option_123' },
      quizId: { type: 'string', example: 'quiz_123' },
      option: { type: 'string', example: 'A' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },
  Pretest: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'pretest_123' },
      pretestName: { type: 'string', example: 'Pretest Algoritma Dasar' },
      pretestQuestions: {
        type: 'array',
        items: { $ref: '#/components/schemas/PretestQuestion' },
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  Posttest: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'posttest_123' },
      soals: {
        type: 'array',
        items: { $ref: '#/components/schemas/PosttestQuestion' },
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  PretestQuestion: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'question_123' },
      pretestId: { type: 'string', example: 'pretest_123' },
      pertanyaan: { type: 'string', example: 'Apa itu algoritma?' },
      correctAnswer: { type: 'string', example: 'Urutan langkah' },
      skor: { type: 'integer', example: 10 },
      answerOptions: { type: 'array', items: { type: 'object' } },
    },
  },
  PosttestQuestion: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'question_123' },
      posttestId: { type: 'string', example: 'posttest_123' },
      question: { type: 'string', example: 'Apa tujuan algoritma?' },
      pilihan: { type: 'array', items: { type: 'string' } },
      correctAnswer: { type: 'string', example: 'Memecahkan masalah' },
      skor: { type: 'integer', example: 10 },
    },
  },
  PretestSubmitResponse: {
    type: 'object',
    properties: {
      score: { type: 'number', example: 80 },
    },
    required: ['score'],
  },
  PosttestSubmitResponse: {
    type: 'object',
    properties: {
      score: { type: 'number', example: 90 },
      certificate: { oneOf: [{ $ref: '#/components/schemas/Certificate' }, { type: 'null' }] },
    },
    required: ['score', 'certificate'],
  },
  Rating: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'rating_123' },
      rating: { type: 'integer', example: 5 },
      komentar: { type: 'string', nullable: true, example: 'Materinya mudah dipahami.' },
      siswaId: { type: 'string', example: 'siswa_123' },
      modulId: { type: 'string', nullable: true, example: 'modul_123' },
    },
  },
  Siswa: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'siswa_123' },
      nama_lengkap: { type: 'string', example: 'Budi Santoso' },
      email: { type: 'string', example: 'siswa@example.com' },
      jenjang: { type: 'string', example: 'SMA' },
      kelas_sekolah: { type: 'string', example: '10' },
      role: { type: 'string', example: 'siswa' },
      isActive: { type: 'boolean', example: true },
    },
  },
  Tutor: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'tutor_123' },
      fullName: { type: 'string', example: 'Dr. Tutor' },
      email: { type: 'string', example: 'tutor@example.com' },
      role: { type: 'string', example: 'tutor' },
      isActive: { type: 'boolean', example: true },
    },
  },
  Progress: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'progress_123' },
      siswaId: { type: 'string', example: 'siswa_123' },
      modulId: { type: 'string', example: 'modul_123' },
      pretestScore: { type: 'integer', nullable: true, example: 70 },
      posttestScore: { type: 'integer', nullable: true, example: 90 },
      finalScore: { type: 'number', nullable: true, example: 85 },
      status: { type: 'string', example: 'IN_PROGRESS' },
      isGraduated: { type: 'boolean', example: false },
      progressPercentage: { type: 'number', example: 50 },
    },
  },
  ProgressByStudent: {
    type: 'object',
    properties: {
      siswaId: { type: 'string', example: 'siswa_123' },
      siswaName: { type: 'string', example: 'Budi Santoso' },
      email: { type: 'string', example: 'siswa@example.com' },
      progress: { type: 'array', items: { type: 'object' } },
    },
  },
  DashboardStats: {
    type: 'object',
    properties: {
      activeStudents: { type: 'integer', example: 20 },
      activeQuizzes: { type: 'integer', example: 12 },
      activeTutors: { type: 'integer', example: 5 },
      activeModules: { type: 'integer', example: 8 },
      countAllUsers: { type: 'integer', example: 25 },
      activeClass: { type: 'integer', example: 8 },
    },
  },
  TutorDashboard: {
    type: 'object',
    properties: {
      countPublishedModules: { type: 'integer', example: 4 },
      countDraftModules: { type: 'integer', example: 2 },
      countRegisteredSiswa: { type: 'integer', example: 30 },
      countSiswaLulus: { type: 'integer', example: 12 },
      nominatedModules: { type: 'array', items: { $ref: '#/components/schemas/Module' } },
      getDraftModules: { type: 'array', items: { $ref: '#/components/schemas/Module' } },
      getRatingsFromSiswa: { type: 'array', items: { $ref: '#/components/schemas/Rating' } },
    },
  },
  SiswaDashboard: {
    type: 'object',
    properties: {
      latestProgress: { type: 'array', items: { $ref: '#/components/schemas/Progress' } },
      certificateData: { type: 'array', items: { $ref: '#/components/schemas/Certificate' } },
      accessibleModules: { type: 'array', items: { $ref: '#/components/schemas/Module' } },
      lastActivity: { oneOf: [{ $ref: '#/components/schemas/Progress' }, { type: 'null' }] },
    },
  },
  Certificate: {
    type: 'object',
    properties: {
      id: { type: 'string', example: 'cert_123' },
      siswaId: { type: 'string', example: 'siswa_123' },
      modulId: { type: 'string', example: 'modul_123' },
      kode_sertif: { type: 'string', example: 'CERT-0001' },
      issued_at: { type: 'string', format: 'date-time' },
      certificateUrl: { type: 'string', example: 'https://example.com/cert/CERT-0001' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },
  PaginatedModulesResponse: {
    type: 'object',
    properties: {
      items: { type: 'array', items: { $ref: '#/components/schemas/Module' } },
      next_cursor: { type: 'string', nullable: true, example: null },
    },
    required: ['items', 'next_cursor'],
  },
  PaginatedQuizzesResponse: {
    type: 'object',
    properties: {
      items: { type: 'array', items: { type: 'object' } },
      next_cursor: { type: 'string', nullable: true, example: null },
    },
    required: ['items', 'next_cursor'],
  },
  PaginatedProgressResponse: {
    type: 'object',
    properties: {
      items: { type: 'array', items: { $ref: '#/components/schemas/ProgressByStudent' } },
      next_cursor: { type: 'string', nullable: true, example: null },
    },
    required: ['items', 'next_cursor'],
  },
  PaginatedStudentProgressResponse: {
    type: 'object',
    properties: {
      items: { type: 'array', items: { $ref: '#/components/schemas/Progress' } },
      next_cursor: { type: 'string', nullable: true, example: null },
    },
    required: ['items', 'next_cursor'],
  },
  PaginatedCertificatesResponse: {
    type: 'object',
    properties: {
      items: { type: 'array', items: { $ref: '#/components/schemas/Certificate' } },
      next_cursor: { type: 'string', nullable: true, example: null },
    },
    required: ['items', 'next_cursor'],
  },
};

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'LMS Express API',
    description:
      'Learning Management System API documentation synchronized with active Express routes, RBAC, request payloads, response bodies, and cursor pagination.',
    version: '1.0.0',
  },
  servers: [{ url: '/', description: 'Current Server' }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: componentSchemas,
  },
  tags: [
    { name: 'Auth' },
    { name: 'Admin - Dashboard' },
    { name: 'Admin - Kuis' },
    { name: 'Admin - Materi' },
    { name: 'Admin - Modul' },
    { name: 'Admin - Progress' },
    { name: 'Admin - Siswa' },
    { name: 'Admin - Topik' },
    { name: 'Admin - Tutor' },
    { name: 'Tutor - Dashboard' },
    { name: 'Tutor - Modul' },
    { name: 'Tutor - Materi' },
    { name: 'Tutor - Topik' },
    { name: 'Tutor - Submateri' },
    { name: 'Tutor - Pretest' },
    { name: 'Tutor - Posttest' },
    { name: 'Tutor - Progress' },
    { name: 'Siswa - Dashboard' },
    { name: 'Siswa - Progress' },
    { name: 'Siswa - Certificates' },
    { name: 'Siswa - Materi' },
    { name: 'Siswa - Modul' },
    { name: 'Siswa - Posttest' },
    { name: 'Siswa - Pretest' },
    { name: 'Siswa - Rating' },
    { name: 'Siswa - Submateri' },
    { name: 'Siswa - Topik' },
  ],
  paths: {
    '/auth/register': op('post', 'Auth', 'Register a new siswa or tutor', {
      public: true,
      requestSchema: 'PublicRegisterRequest',
      requestExample: examples.siswaRegister,
      responseSchema: 'UserSession',
    }),
    '/auth/login': op('post', 'Auth', 'Login user', {
      public: true,
      requestSchema: 'LoginRequest',
      requestExample: examples.login,
      responseSchema: 'LoginResponse',
      successStatus: 200,
      description: 'The implementation sets access and refresh tokens as HTTP-only cookies.',
    }),
    '/auth/logout': op('post', 'Auth', 'Logout', {
      responseSchema: 'MessageResponse',
      successStatus: 200,
    }),
    '/auth/refresh': op('post', 'Auth', 'Refresh token', {
      responseSchema: 'MessageResponse',
      successStatus: 200,
      description: 'Requires a valid refreshToken cookie and sets a new access-token cookie.',
    }),
    '/auth/me': op('get', 'Auth', 'Get current user', {
      responseSchema: 'UserSession',
    }),
    '/auth/update': op('put', 'Auth', 'Update current user profile', {
      requestSchema: 'PublicRegisterRequest',
      responseSchema: 'UserSession',
      successStatus: 200,
    }),

    '/admin/dashboard': op('get', 'Admin - Dashboard', 'Get dashboard statistics', {
      role: 'admin',
      responseSchema: 'DashboardStats',
    }),
    '/admin/kuis': merge(
      op('get', 'Admin - Kuis', 'Get all quizzes with cursor pagination', {
        role: 'admin',
        parameters: paginationParams,
        responseSchema: 'PaginatedQuizzesResponse',
      }),
      op('post', 'Admin - Kuis', 'Create quiz', {
        role: 'admin',
        requestSchema: 'QuizPayloadRequest',
        responseSchema: 'Quiz',
      }),
    ),
    '/admin/kuis/{id}': merge(
      op('get', 'Admin - Kuis', 'Get quiz by ID', {
        role: 'admin',
        parameters: [idParam('id', 'Quiz ID.', 'quiz_123')],
        responseSchema: 'Quiz',
      }),
      op('put', 'Admin - Kuis', 'Update quiz', {
        role: 'admin',
        parameters: [idParam('id', 'Quiz ID.', 'quiz_123')],
        requestSchema: 'QuizUpdateRequest',
        responseSchema: 'Quiz',
        successStatus: 200,
      }),
      op('delete', 'Admin - Kuis', 'Delete quiz', {
        role: 'admin',
        parameters: [idParam('id', 'Quiz ID.', 'quiz_123')],
        responseSchema: 'MessageResponse',
      }),
    ),
    ...materialCrud('/admin/materi', 'Admin - Materi', 'admin'),
    ...adminModuleCrud('/admin/modul'),
    ...adminModuleCrud('/admin/manage/module'),
    '/admin/progress': op('get', 'Admin - Progress', 'Get student progress grouped by module', {
      role: 'admin',
      parameters: paginationParams,
      responseSchema: 'PaginatedProgressResponse',
    }),
    '/admin/progress/{studentId}': op('get', 'Admin - Progress', 'Get student progress by ID', {
      role: 'admin',
      parameters: [idParam('studentId', 'Student ID.', 'siswa_123')],
      responseSchema: 'ProgressByStudent',
    }),
    '/admin/progress/{studentId}/analyze': op('get', 'Admin - Progress', 'Analyze student computational thinking', {
      role: 'admin',
      parameters: [idParam('studentId', 'Student ID.', 'siswa_123')],
      responseSchema: 'ObjectResponse',
      responseIsArray: true,
    }),
    ...accountManagement('/admin/siswa', 'Admin - Siswa', 'siswa'),
    ...accountManagement('/admin/manage/siswa', 'Admin - Siswa', 'siswa'),
    ...topicCrud('/admin/topik', 'Admin - Topik', 'admin'),
    ...accountManagement('/admin/tutor', 'Admin - Tutor', 'tutor'),
    ...accountManagement('/admin/manage/tutor', 'Admin - Tutor', 'tutor'),

    '/tutor/dashboard': op('get', 'Tutor - Dashboard', 'Get tutor dashboard', {
      role: 'tutor',
      responseSchema: 'TutorDashboard',
    }),
    ...moduleCrud('/tutor/modul', 'Tutor - Modul', 'tutor'),
    ...materialCrud('/tutor/materi', 'Tutor - Materi', 'tutor'),
    ...topicCrud('/tutor/topik', 'Tutor - Topik', 'tutor'),
    ...submaterialCrud('/tutor/submateri', 'Tutor - Submateri'),
    ...testManagement('/tutor/pretest', 'Tutor - Pretest', 'pretest'),
    ...testManagement('/tutor/posttest', 'Tutor - Posttest', 'posttest'),
    '/tutor/progress': op('get', 'Tutor - Progress', 'Get student progress grouped by module', {
      role: 'tutor',
      parameters: paginationParams,
      responseSchema: 'PaginatedProgressResponse',
    }),
    '/tutor/progress/{studentId}': op('get', 'Tutor - Progress', 'Get student progress by ID', {
      role: 'tutor',
      parameters: [idParam('studentId', 'Student ID.', 'siswa_123')],
      responseSchema: 'ProgressByStudent',
    }),
    '/tutor/progress/{studentId}/analyze': op('get', 'Tutor - Progress', 'Analyze student computational thinking', {
      role: 'tutor',
      parameters: [idParam('studentId', 'Student ID.', 'siswa_123')],
      responseSchema: 'ObjectResponse',
      responseIsArray: true,
    }),

    '/siswa/dashboard': op('get', 'Siswa - Dashboard', 'Get student dashboard', {
      role: 'siswa',
      responseSchema: 'SiswaDashboard',
    }),
    '/siswa/progress': op('get', 'Siswa - Progress', 'Get all personal progress with cursor pagination', {
      role: 'siswa',
      parameters: paginationParams,
      responseSchema: 'PaginatedStudentProgressResponse',
    }),
    '/siswa/progress/{modulId}': op('get', 'Siswa - Progress', 'Get progress by module', {
      role: 'siswa',
      parameters: [idParam('modulId', 'Module ID.', 'modul_123')],
      responseSchema: 'Progress',
    }),
    '/siswa/progress/submateri/{submateriId}/complete': op('post', 'Siswa - Progress', 'Mark submaterial completed', {
      role: 'siswa',
      parameters: [idParam('submateriId', 'Submaterial ID.', 'submateri_123')],
      responseSchema: 'MessageResponse',
      successStatus: 200,
    }),
    '/siswa/certificates': op('get', 'Siswa - Certificates', 'Get personal certificates with cursor pagination', {
      role: 'siswa',
      parameters: paginationParams,
      responseSchema: 'PaginatedCertificatesResponse',
    }),
    '/siswa/certificates/{id}': op('get', 'Siswa - Certificates', 'Get certificate by ID', {
      role: 'siswa',
      parameters: [idParam('id', 'Certificate ID.', 'cert_123')],
      responseSchema: 'Certificate',
    }),
    '/siswa/materi/{modulId}': op('get', 'Siswa - Materi', 'Get materials by module', {
      role: 'siswa',
      parameters: [idParam('modulId', 'Module ID.', 'modul_123')],
      responseSchema: 'Material',
      responseIsArray: true,
    }),
    '/siswa/modul': op('get', 'Siswa - Modul', 'Get available modules', {
      role: 'siswa',
      parameters: paginationParams,
      responseSchema: 'PaginatedModulesResponse',
    }),
    '/siswa/modul/{id}': op('get', 'Siswa - Modul', 'Get module by ID', {
      role: 'siswa',
      parameters: [idParam('id', 'Module ID.', 'modul_123')],
      responseSchema: 'Module',
    }),
    '/siswa/posttest/{modulId}': op('get', 'Siswa - Posttest', 'Get posttest by module', {
      role: 'siswa',
      parameters: [idParam('modulId', 'Module ID.', 'modul_123')],
      responseSchema: 'Posttest',
    }),
    '/siswa/posttest/{modulId}/submit': op('post', 'Siswa - Posttest', 'Submit posttest answers', {
      role: 'siswa',
      parameters: [idParam('modulId', 'Module ID.', 'modul_123')],
      requestSchema: 'SubmitAnswersRequest',
      requestExample: examples.submitAnswers,
      responseSchema: 'PosttestSubmitResponse',
      successStatus: 200,
    }),
    '/siswa/pretest/{modulId}': op('get', 'Siswa - Pretest', 'Get pretest by module', {
      role: 'siswa',
      parameters: [idParam('modulId', 'Module ID.', 'modul_123')],
      responseSchema: 'Pretest',
    }),
    '/siswa/pretest/{modulId}/submit': op('post', 'Siswa - Pretest', 'Submit pretest answers', {
      role: 'siswa',
      parameters: [idParam('modulId', 'Module ID.', 'modul_123')],
      requestSchema: 'SubmitAnswersRequest',
      requestExample: examples.submitAnswers,
      responseSchema: 'PretestSubmitResponse',
      successStatus: 200,
    }),
    '/siswa/rating/{id}': op('post', 'Siswa - Rating', 'Rate module', {
      role: 'siswa',
      parameters: [idParam('id', 'Module ID.', 'modul_123')],
      requestSchema: 'RatingRequest',
      requestExample: examples.rating,
      responseSchema: 'Rating',
    }),
    '/siswa/submateri/materi/{materiId}': op('get', 'Siswa - Submateri', 'Get submaterials by material', {
      role: 'siswa',
      parameters: [idParam('materiId', 'Material ID.', 'materi_123')],
      responseSchema: 'Submaterial',
      responseIsArray: true,
    }),
    '/siswa/submateri/{id}': op('get', 'Siswa - Submateri', 'Get submaterial detail', {
      role: 'siswa',
      parameters: [idParam('id', 'Submaterial ID.', 'submateri_123')],
      responseSchema: 'Submaterial',
    }),
    '/siswa/topik/{modulId}': op('get', 'Siswa - Topik', 'Get topics by module', {
      role: 'siswa',
      parameters: [idParam('modulId', 'Module ID.', 'modul_123')],
      responseSchema: 'Topic',
      responseIsArray: true,
    }),
  },
};

export default swaggerSpec;
