import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
    type: "content",
    schema: z.object({
        title: z.string(),
        tags: z.array(z.string()).optional(),
        publishedDate: z.string(), // relies on manual date str formatting
        // publishedDate: z.string().transform((str) => new Date(str)),
        // publishedDate: z.date(),

        edits: z.array(
            z.object({
                date: z.string(),
                desc: z.string(),
            }),
        ),
        draft: z.boolean(),
    }),
});

export const collections = {
    blog: blogCollection,
};
