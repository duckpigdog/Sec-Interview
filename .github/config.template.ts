import { defineConfig } from 'vitepress';
import sidebar from './sidebar.mjs';

export default defineConfig({
  title: 'Sec-Interview',
  description: '安全面试笔记',
  base: '/Sec-Interview/',
  themeConfig: { sidebar }
});
