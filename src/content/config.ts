import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        tags: z.array(z.string()).optional(),
        publishedDate: z.string(),
        updatedDate: z.array(z.string()),
        draft: z.boolean(),
    })
})

export const collections = {
    'blog': blogCollection,
}