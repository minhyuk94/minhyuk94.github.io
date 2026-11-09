import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://minhyuk94.github.io',
  // 이력서는 https://minhyuk94.github.io/resume/ 아래에 둔다.
  // 루트(/)와 예전 주소(/ko/, /profile/… 등)는 scripts/root-pages.mjs가 /resume/… 로 보내 준다
  base: '/resume',
  outDir: './dist/resume',
  // React는 편집 페이지(/admin)에서만 쓴다. 이력서 화면은 순수 HTML로 미리 만들어져 빠르다
  integrations: [react()],
});
