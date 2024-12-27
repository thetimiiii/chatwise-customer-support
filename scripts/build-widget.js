import * as esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

esbuild.build({
  entryPoints: ['public/chat-widget.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  format: 'iife',
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
  outfile: 'public/widget.js',
  plugins: [nodeExternalsPlugin()],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  loader: {
    '.tsx': 'tsx',
    '.ts': 'tsx',
    '.jsx': 'jsx',
    '.js': 'jsx',
  },
}).catch(() => process.exit(1));
