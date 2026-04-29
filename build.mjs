import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',

  bundle: true,           // 🔥 ini yang solve masalah import
  platform: 'node',
  format: 'esm',
  target: 'node18',

  sourcemap: true,
  minify: false,

  external: [
    '@prisma/client',     // jangan di-bundle
    'prisma',
    'bcrypt'
  ],

  logLevel: 'info',
});