import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY?.split('/') ?? [];
const base = process.env.GITHUB_ACTIONS && repoName ? `/${repoName}` : '/';
const site = repoOwner && repoName ? `https://${repoOwner}.github.io/${repoName}/` : 'http://localhost:4321';

export default defineConfig({
  base,
  site,
  integrations: [
    starlight({
      title: { ja: 'Fluxion', en: 'Fluxion' },
      description:
        'Editable animation IR generated from Python and Text DSLs, rendered by a browser SVG runtime.',
      locales: {
        root: { label: '日本語', lang: 'ja' },
        en: { label: 'English', lang: 'en' },
      },
      defaultLocale: 'root',
      customCss: ['./src/styles/starlight.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/' + (process.env.GITHUB_REPOSITORY ?? 'your-org/Fluxion'),
        },
      ],
      sidebar: [
        {
          label: 'はじめに',
          translations: { en: 'Start Here' },
          items: [
            { label: '概要', translations: { en: 'Overview' }, slug: 'overview' },
            { label: 'はじめる', translations: { en: 'Getting Started' }, slug: 'guides/getting-started' },
          ],
        },
        {
          label: 'コンセプト',
          translations: { en: 'Concepts' },
          items: [
            { label: 'アーキテクチャ', translations: { en: 'Architecture' }, slug: 'concepts/architecture' },
            { label: 'MVP 範囲', translations: { en: 'MVP Scope' }, slug: 'concepts/mvp' },
          ],
        },
        {
          label: 'リファレンス',
          translations: { en: 'Reference' },
          items: [
            { label: 'Text DSL', slug: 'reference/text-dsl' },
            { label: 'Web Runtime', slug: 'reference/runtime' },
          ],
        },
      ],
    }),
  ],
});
