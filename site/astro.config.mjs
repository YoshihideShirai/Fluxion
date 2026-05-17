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
          label: 'Start Here',
          translations: { en: 'Start Here' },
          items: [
            { label: 'Overview', translations: { en: 'Overview' }, slug: 'overview' },
            { label: 'Quickstart', translations: { en: 'Quickstart' }, slug: 'guides/getting-started' },
            { label: 'Playground tour', translations: { en: 'Playground tour' }, slug: 'guides/playground' },
          ],
        },
        {
          label: 'Authoring',
          translations: { en: 'Authoring' },
          items: [
            { label: 'Python DSL', translations: { en: 'Python DSL' }, slug: 'guides/python-dsl' },
            { label: 'Text DSL', translations: { en: 'Text DSL' }, slug: 'reference/text-dsl' },
            { label: 'Examples', translations: { en: 'Examples' }, slug: 'guides/examples' },
          ],
        },
        {
          label: 'Runtime & IR',
          translations: { en: 'Runtime & IR' },
          items: [
            { label: 'Fluxion JSON / Scene Graph', translations: { en: 'Fluxion JSON / Scene Graph' }, slug: 'reference/ir' },
            { label: 'Timeline', translations: { en: 'Timeline' }, slug: 'reference/timeline' },
            { label: 'Web Runtime', translations: { en: 'Web Runtime' }, slug: 'reference/runtime' },
          ],
        },
        {
          label: 'Design Notes',
          translations: { en: 'Design Notes' },
          items: [
            { label: 'Architecture', translations: { en: 'Architecture' }, slug: 'concepts/architecture' },
            { label: 'MVP Scope / Roadmap', translations: { en: 'MVP Scope / Roadmap' }, slug: 'concepts/mvp' },
          ],
        },
      ],
    }),
  ],
});
