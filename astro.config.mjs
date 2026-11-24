// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// GitHub Pages: /zafra/ vía BASE_PATH en el workflow; Vercel deja base '/'.
export default defineConfig({
  site: 'https://jesusgabri3l.github.io',
  base: process.env.BASE_PATH ?? '/',
  devToolbar: { enabled: false },
  fonts: [
    { provider: fontProviders.fontsource(), name: 'Caveat', cssVariable: '--font-hand', weights: [600], styles: ['normal'], subsets: ['latin'] },
  ],
});
