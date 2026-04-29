import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',

  bundle: true,
  platform: 'node',
  format: 'cjs',          // 🔥 UBAH INI
  target: 'node18',

  sourcemap: true,

  external: [
    'express',
    '@prisma/client',
    'prisma',
    'bcrypt',
    'passport'
  ],

  logLevel: 'info',
});