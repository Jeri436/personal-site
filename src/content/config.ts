import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    katakana: z.string(),
    description: z.string(),
    tech: z.array(z.string()),
    year: z.number(),
    url: z.string().optional(),
    github: z.string().optional(),
    order: z.number().default(0),
  }),
});

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { projects, blog };
