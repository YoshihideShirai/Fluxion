import { defineCollection, z } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

const gallery = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    source_manim_url: z.string().url(),
    source_example_path: z.string(),
    porting_strategy: z.enum(['faithful', 'visual_approximation', 'omitted_parts']),
    category: z.string(),
    status: z.enum(['ported', 'partial', 'blocker']),
    missing_instructions: z.string().optional(),
    blocker_reason: z.string().optional(),
    order: z.number().default(0),
  }),
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  gallery,
};
