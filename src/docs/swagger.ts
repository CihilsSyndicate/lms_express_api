const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'LMS Express API',
    description:
      'Learning Management System API - Express.js + TypeScript + Prisma',
    version: '1.0.0',
    contact: {
      name: 'API Support',
      url: 'https://lms-api.example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development Server',
    },
    {
      url: 'https://api.lms.example.com',
      description: 'Production Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Token via HTTP-only Cookie',
      },
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'JWT Token stored in HTTP-only cookie',
      },
    },
    schemas: {
      Message: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
        required: ['message'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
        required: ['message'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nama_lengkap: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['siswa', 'tutor'] },
        },
      },
      Modul: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nama_modul: { type: 'string' },
          deskripsi: { type: 'string' },
          target_waktu: { type: 'integer' },
          tingkat_kesulitan: { type: 'string' },
          is_berbayar: { type: 'boolean' },
          harga_modul: { type: 'number' },
          jenjang: { type: 'string' },
          kelas_sekolah: { type: 'string' },
          tutor_id: { type: 'string' },
          tutor: {
            type: 'object',
            properties: {
              nama_lengkap: { type: 'string' },
            },
          },
        },
      },
      Materi: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nama_materi: { type: 'string' },
          deskripsi: { type: 'string' },
          modul_id: { type: 'string' },
        },
      },
      Submateri: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nama_submateri: { type: 'string' },
          konten: { type: 'string' },
          urutan: { type: 'integer' },
          materi_id: { type: 'string' },
        },
      },
      Topik: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          judul_topik: { type: 'string' },
          konten: { type: 'string' },
          modul_id: { type: 'string' },
        },
      },
      Pretest: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          modul_id: { type: 'string' },
          soals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                pertanyaan: { type: 'string' },
                pilihan: { type: 'array', items: { type: 'string' } },
                jawaban_benar: { type: 'string' },
                skor: { type: 'integer' },
              },
            },
          },
        },
      },
      SoalPretest: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          pretest_id: { type: 'string' },
          pertanyaan: { type: 'string' },
          pilihan: { type: 'array', items: { type: 'string' } },
          jawaban_benar: { type: 'string' },
          skor: { type: 'integer' },
        },
      },
      Posttest: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          modul_id: { type: 'string' },
          soals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                pertanyaan: { type: 'string' },
                pilihan: { type: 'array', items: { type: 'string' } },
                jawaban_benar: { type: 'string' },
                skor: { type: 'integer' },
              },
            },
          },
        },
      },
      SoalPosttest: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          posttest_id: { type: 'string' },
          pertanyaan: { type: 'string' },
          pilihan: { type: 'array', items: { type: 'string' } },
          jawaban_benar: { type: 'string' },
          skor: { type: 'integer' },
        },
      },
      Progress: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          siswa_id: { type: 'string' },
          modul_id: { type: 'string' },
          persentase_selesai: { type: 'number' },
          status: { type: 'string' },
        },
      },
      Certificate: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          siswa_id: { type: 'string' },
          modul_id: { type: 'string' },
          tanggal_diperoleh: { type: 'string', format: 'date-time' },
          sertifikat_url: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['Root'],
        summary: 'Welcome message',
        description: 'Returns a welcome message from the API',
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Welcome to the LMS Express API',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==================== AUTH ENDPOINTS ====================
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Unified login (Siswa or Tutor)',
        description:
          'Login endpoint for both siswa and tutor. Returns JWT token via HTTP-only cookie.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'user@example.com',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'password123',
                  },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    role: { type: 'string', enum: ['siswa', 'tutor'] },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Email dan password wajib diisi',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Email atau password salah',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout',
        description: 'Clear token and refreshToken cookies',
        responses: {
          '200': {
            description: 'Logout successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
        },
      },
    },
    '/auth/siswa/register': {
      post: {
        tags: ['Auth - Siswa'],
        summary: 'Register Siswa',
        description: 'Register a new student account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nama_lengkap: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                  jenjang: { type: 'string' },
                  kelas_sekolah: { type: 'string' },
                },
                required: [
                  'nama_lengkap',
                  'email',
                  'password',
                  'jenjang',
                  'kelas_sekolah',
                ],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Siswa registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    id: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Email sudah terdaftar',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/siswa/login': {
      post: {
        tags: ['Auth - Siswa'],
        summary: 'Login Siswa (Legacy)',
        description:
          'Login endpoint specifically for siswa (legacy, use /auth/login instead)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Email atau password salah',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/siswa/google': {
      get: {
        tags: ['Auth - Siswa'],
        summary: 'Google OAuth - Siswa',
        description: 'Redirect to Google OAuth login for siswa',
        responses: {
          '302': {
            description: 'Redirect to Google OAuth',
          },
        },
      },
    },
    '/auth/siswa/google/callback': {
      get: {
        tags: ['Auth - Siswa'],
        summary: 'Google OAuth Callback - Siswa',
        description: 'Google OAuth callback endpoint for siswa',
        parameters: [
          {
            name: 'code',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Google authorization code',
          },
        ],
        responses: {
          '302': {
            description: 'Redirect to frontend with token cookie set',
          },
        },
      },
    },
    '/auth/tutor/register': {
      post: {
        tags: ['Auth - Tutor'],
        summary: 'Register Tutor',
        description:
          'Tutor registration is closed. Accounts are created by administrator.',
        responses: {
          '410': {
            description: 'Tutor registration closed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/tutor/login': {
      post: {
        tags: ['Auth - Tutor'],
        summary: 'Login Tutor (Legacy)',
        description:
          'Login endpoint specifically for tutor (legacy, use /auth/login instead)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', format: 'password' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    role: { type: 'string', example: 'tutor' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Email atau password salah',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/auth/tutor/google': {
      get: {
        tags: ['Auth - Tutor'],
        summary: 'Google OAuth - Tutor',
        description: 'Redirect to Google OAuth login for tutor',
        responses: {
          '302': {
            description: 'Redirect to Google OAuth',
          },
        },
      },
    },
    '/auth/tutor/google/callback': {
      get: {
        tags: ['Auth - Tutor'],
        summary: 'Google OAuth Callback - Tutor',
        description: 'Google OAuth callback endpoint for tutor',
        parameters: [
          {
            name: 'code',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Google authorization code',
          },
        ],
        responses: {
          '302': {
            description: 'Redirect to frontend dashboard with token cookie set',
          },
        },
      },
    },

    // ==================== MODUL ENDPOINTS ====================
    '/modul': {
      get: {
        tags: ['Modul'],
        summary: 'Get all modul',
        description: 'Retrieve list of all modul (public endpoint)',
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Modul' },
                    },
                  },
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Modul'],
        summary: 'Create modul',
        description: 'Create a new modul (tutor only)',
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nama_modul: { type: 'string' },
                  deskripsi: { type: 'string' },
                  target_waktu: { type: 'integer' },
                  tingkat_kesulitan: { type: 'string' },
                  is_berbayar: { type: 'boolean', default: false },
                  harga_modul: { type: 'number' },
                  jenjang: { type: 'string' },
                  kelas_sekolah: { type: 'string' },
                },
                required: [
                  'nama_modul',
                  'deskripsi',
                  'target_waktu',
                  'tingkat_kesulitan',
                  'jenjang',
                  'kelas_sekolah',
                ],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Modul created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Modul' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Tutor role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/modul/{id}': {
      get: {
        tags: ['Modul'],
        summary: 'Get modul by ID',
        description:
          'Retrieve a specific modul with all its related data (materi, submateri, topik)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Modul ID',
          },
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Modul' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Modul tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Modul'],
        summary: 'Update modul',
        description: 'Update a modul (tutor only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Modul ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nama_modul: { type: 'string' },
                  deskripsi: { type: 'string' },
                  target_waktu: { type: 'integer' },
                  tingkat_kesulitan: { type: 'string' },
                  is_berbayar: { type: 'boolean' },
                  harga_modul: { type: 'number' },
                  jenjang: { type: 'string' },
                  kelas_sekolah: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Modul updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Modul' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Tutor role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Modul'],
        summary: 'Delete modul',
        description: 'Delete a modul (tutor only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Modul ID',
          },
        ],
        responses: {
          '200': {
            description: 'Modul deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Tutor role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    // ==================== MATERI ENDPOINTS ====================
    '/materi/{modulId}': {
      get: {
        tags: ['Materi'],
        summary: 'Get materi by modul',
        description: 'Retrieve all materi for a specific modul',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'modulId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Modul ID',
          },
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Materi' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/materi': {
      post: {
        tags: ['Materi'],
        summary: 'Create materi',
        description: 'Create a new materi for a modul (tutor only)',
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nama_materi: { type: 'string' },
                  deskripsi: { type: 'string' },
                  modul_id: { type: 'string' },
                },
                required: ['nama_materi', 'deskripsi', 'modul_id'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Materi created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Materi' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Tutor role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/materi/{id}': {
      put: {
        tags: ['Materi'],
        summary: 'Update materi',
        description: 'Update a materi (tutor only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Materi ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nama_materi: { type: 'string' },
                  deskripsi: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Materi updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Materi' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Tutor role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Materi'],
        summary: 'Delete materi',
        description: 'Delete a materi (tutor only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Materi ID',
          },
        ],
        responses: {
          '200': {
            description: 'Materi deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Tutor role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    // ==================== SUBMATERI ENDPOINTS ====================
    '/submateri/materi/{materiId}': {
      get: {
        tags: ['Submateri'],
        summary: 'Get submateri by materi',
        description: 'Retrieve all submateri for a specific materi',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'materiId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Materi ID',
          },
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Submateri' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/submateri/{id}': {
      get: {
        tags: ['Submateri'],
        summary: 'Get submateri detail',
        description: 'Retrieve details of a specific submateri',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Submateri ID',
          },
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Submateri' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Submateri tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Submateri'],
        summary: 'Update submateri',
        description: 'Update a submateri (tutor only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Submateri ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nama_submateri: { type: 'string' },
                  konten: { type: 'string' },
                  urutan: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Submateri updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Submateri' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Tutor role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Submateri'],
        summary: 'Delete submateri',
        description: 'Delete a submateri (tutor only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Submateri ID',
          },
        ],
        responses: {
          '200': {
            description: 'Submateri deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Tutor role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/submateri': {
      post: {
        tags: ['Submateri'],
        summary: 'Create submateri',
        description: 'Create a new submateri for a materi (tutor only)',
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nama_submateri: { type: 'string' },
                  konten: { type: 'string' },
                  urutan: { type: 'integer' },
                  materi_id: { type: 'string' },
                },
                required: ['nama_submateri', 'konten', 'urutan', 'materi_id'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Submateri created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Submateri' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Tutor role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    // ==================== TOPIK ENDPOINTS ====================
    '/topik/{modulId}': {
      get: {
        tags: ['Topik'],
        summary: 'Get topik by modul',
        description: 'Retrieve all topik for a specific modul',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'modulId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Modul ID',
          },
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Topik' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/topik': {
      post: {
        tags: ['Topik'],
        summary: 'Create topik',
        description: 'Create a new topik for a modul (tutor only)',
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  judul_topik: { type: 'string' },
                  konten: { type: 'string' },
                  modul_id: { type: 'string' },
                },
                required: ['judul_topik', 'konten', 'modul_id'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Topik created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Topik' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Tutor role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/topik/{id}': {
      put: {
        tags: ['Topik'],
        summary: 'Update topik',
        description: 'Update a topik (tutor only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Topik ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  judul_topik: { type: 'string' },
                  konten: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Topik updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Topik' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Tutor role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Topik'],
        summary: 'Delete topik',
        description: 'Delete a topik (tutor only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Topik ID',
          },
        ],
        responses: {
          '200': {
            description: 'Topik deleted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Tutor role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    // ==================== PRETEST ENDPOINTS ====================
    '/pretest/{modulId}': {
      get: {
        tags: ['Pretest'],
        summary: 'Get pretest by modul',
        description:
          'Retrieve pretest for a specific modul with all its questions',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'modulId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Modul ID',
          },
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Pretest' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Pretest tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/pretest': {
      post: {
        tags: ['Pretest'],
        summary: 'Create pretest',
        description: 'Create a new pretest for a modul (tutor only)',
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  modul_id: { type: 'string' },
                },
                required: ['modul_id'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Pretest created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Pretest' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description:
              'Forbidden - Tutor role required or unauthorized modul',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/pretest/soal': {
      post: {
        tags: ['Pretest'],
        summary: 'Add pretest question',
        description: 'Add a question to a pretest (tutor only)',
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  pretest_id: { type: 'string' },
                  pertanyaan: { type: 'string' },
                  pilihan: { type: 'array', items: { type: 'string' } },
                  jawaban_benar: { type: 'string' },
                  skor: { type: 'integer', default: 10 },
                },
                required: [
                  'pretest_id',
                  'pertanyaan',
                  'pilihan',
                  'jawaban_benar',
                ],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Question added',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/SoalPretest' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/pretest/{modulId}/submit': {
      post: {
        tags: ['Pretest'],
        summary: 'Submit pretest',
        description: 'Submit answers for pretest (siswa only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'modulId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Modul ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  answers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        soal_id: { type: 'string' },
                        jawaban: { type: 'string' },
                      },
                    },
                  },
                },
                required: ['answers'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Pretest submitted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    score: { type: 'number' },
                    percentage: { type: 'number' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Siswa role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    // ==================== POSTTEST ENDPOINTS ====================
    '/posttest/{modulId}': {
      get: {
        tags: ['Posttest'],
        summary: 'Get posttest by modul',
        description:
          'Retrieve posttest for a specific modul with all its questions',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'modulId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Modul ID',
          },
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Posttest' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Posttest tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/posttest': {
      post: {
        tags: ['Posttest'],
        summary: 'Create posttest',
        description: 'Create a new posttest for a modul (tutor only)',
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  modul_id: { type: 'string' },
                },
                required: ['modul_id'],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Posttest created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Posttest' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description:
              'Forbidden - Tutor role required or unauthorized modul',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/posttest/soal': {
      post: {
        tags: ['Posttest'],
        summary: 'Add posttest question',
        description: 'Add a question to a posttest (tutor only)',
        security: [{ CookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  posttest_id: { type: 'string' },
                  pertanyaan: { type: 'string' },
                  pilihan: { type: 'array', items: { type: 'string' } },
                  jawaban_benar: { type: 'string' },
                  skor: { type: 'integer', default: 10 },
                },
                required: [
                  'posttest_id',
                  'pertanyaan',
                  'pilihan',
                  'jawaban_benar',
                ],
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Question added',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/SoalPosttest' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/posttest/{modulId}/submit': {
      post: {
        tags: ['Posttest'],
        summary: 'Submit posttest',
        description: 'Submit answers for posttest (siswa only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'modulId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Modul ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  answers: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        soal_id: { type: 'string' },
                        jawaban: { type: 'string' },
                      },
                    },
                  },
                },
                required: ['answers'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Posttest submitted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    score: { type: 'number' },
                    percentage: { type: 'number' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Siswa role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    // ==================== PROGRESS ENDPOINTS ====================
    '/progress': {
      get: {
        tags: ['Progress'],
        summary: 'Get all progress for siswa',
        description:
          'Retrieve all progress data for the current siswa (siswa only)',
        security: [{ CookieAuth: [] }],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Progress' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Siswa role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/progress/{modulId}': {
      get: {
        tags: ['Progress'],
        summary: 'Get progress by module',
        description:
          'Retrieve progress data for a specific modul for the current siswa (siswa only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'modulId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Modul ID',
          },
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Progress' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Siswa role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Progress tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/progress/submateri/{submateriId}/complete': {
      post: {
        tags: ['Progress'],
        summary: 'Mark submateri completed',
        description:
          'Mark a submateri as completed for the current siswa (siswa only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'submateriId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Submateri ID',
          },
        ],
        responses: {
          '200': {
            description: 'Submateri marked as completed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Message' },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Siswa role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    // ==================== CERTIFICATE ENDPOINTS ====================
    '/certificate': {
      get: {
        tags: ['Certificate'],
        summary: 'Get certificates for siswa',
        description:
          'Retrieve all certificates for the current siswa (siswa only)',
        security: [{ CookieAuth: [] }],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Certificate' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Siswa role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/certificate/{id}': {
      get: {
        tags: ['Certificate'],
        summary: 'Get certificate by ID',
        description: 'Retrieve details of a specific certificate (siswa only)',
        security: [{ CookieAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Certificate ID',
          },
        ],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    data: { $ref: '#/components/schemas/Certificate' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '403': {
            description: 'Forbidden - Siswa role required',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Certificate tidak ditemukan',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    // ==================== USER ENDPOINTS ====================
    '/user/me': {
      get: {
        tags: ['User'],
        summary: 'Get current user profile',
        description: 'Retrieve the profile of the currently authenticated user',
        security: [{ CookieAuth: [] }],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },

    // ==================== PROTECTED ROUTE ====================
    '/protected': {
      get: {
        tags: ['Protected'],
        summary: 'Protected test route',
        description: 'Test endpoint to verify authentication (protected route)',
        security: [{ CookieAuth: [] }],
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

export default swaggerSpec;
