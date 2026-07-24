import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',

  bundle: true,
  platform: 'node',
  format: 'cjs',          // 🔥 UBAH INI
  target: 'node26',

  sourcemap: true,

  external: [
    'express',
    '@prisma/client',
    'prisma',
    'passport'
  ],

  logLevel: 'info',
});