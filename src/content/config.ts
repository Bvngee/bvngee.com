import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        tags: z.array(z.string()).optional(),
        publishedDate: z.string(), // relies on manual date str formatting
        // publishedDate: z.string().transform((str) => new Date(str)),
        // publishedDate: z.date(),

        // TODO: make this an array of objects, mapping date to a short description of the edits
        updatedDate: z.array(z.string()),
        draft: z.boolean(),
    })
})

export const collections = {
    'blog': blogCollection,
}
