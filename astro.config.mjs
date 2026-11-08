import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://minhyuk94.github.io',
  // React는 편집 페이지(/admin)에서만 쓴다. 이력서 화면은 순수 HTML로 미리 만들어져 빠르다
  integrations: [react()],
  // 예전 주소(Jekyll 시절)로 들어와도 새 페이지로 보내 준다
  redirects: {
    '/profile/ko': '/ko/',
    '/profile/ja': '/ja/',
    '/profile/en': '/en/',
    '/profile': '/',
  },
});
