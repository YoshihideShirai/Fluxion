import { getCollection } from 'astro:content';

export type GalleryDemo = {
  title: string;
  description: string;
  category: string;
  status: string;
  source_manim_url: string;
  source_example_path: string;
  porting_strategy: 'faithful' | 'visual_approximation' | 'omitted_parts';
  fidelity: 'faithful' | 'visual_approximation';
  priority?: string;
  gap_id?: string;
  known_gaps: Array<
    | string
    | {
        symptom: string;
        layer?: 'dsl' | 'compiler' | 'runtime' | 'renderer' | 'docs';
        impact?: 'low' | 'medium' | 'high';
        workaround?: string;
        closure_condition?: string;
        fidelity_upgrade_condition?: string;
      }
  >;
  missing_instructions?: string;
  blocker_reason?: string;
  source: string;
};

export async function getGalleryDemos(): Promise<GalleryDemo[]> {
  return (await getCollection('gallery'))
    .sort((a, b) => a.data.order - b.data.order)
    .map((entry) => ({
      ...entry.data,
      source: entry.body.trim(),
    }));
}
