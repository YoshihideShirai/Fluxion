import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    source_manim_url: z.string().url(),
    source_example_path: z.string(),
    porting_strategy: z.enum(['faithful', 'visual_approximation', 'omitted_parts']),
    fidelity: z.enum(['faithful', 'visual_approximation']),
    known_gaps: z
      .array(
        z.union([
          z.string(),
          z.object({
            symptom: z.string(),
            layer: z.enum(['dsl', 'compiler', 'runtime', 'renderer', 'docs']).optional(),
            impact: z.enum(['low', 'medium', 'high']).optional(),
            workaround: z.string().optional(),
            closure_condition: z.string().optional(),
            fidelity_upgrade_condition: z.string().optional(),
          }),
        ]),
      )
      .min(1),
    category: z.string(),
    status: z.enum(['ported', 'partial', 'blocker']),
    priority: z.string().optional(),
    gap_id: z.string().optional(),
    missing_instructions: z.string().optional(),
    blocker_reason: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  gallery,
};
