import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";

function dateFormats(date: Date) {
    const longDateFormatOpts: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    };
    return {
        // JS Date works internally by just storing a time in UTC since the unix
        // epoch. Therefore when creating a Date in your local time and calling
        // getMonth on it, it will immediately be wrong, because it assumes UTC
        // and converts the getMonth result to the caller's timezone. Bleh. So
        // instead of dealing with that we'll just pretend that the date
        // inputted is already UTC and then use UTC methods everywhere to avoid
        // any strange timezone conversions.
        dateObject: date,
        longFormat: date.toLocaleDateString("en-US", longDateFormatOpts),
        shortFormatSlashes: `${date.getUTCFullYear()}/${date.getUTCMonth()}/${date.getUTCDate()}`,
        shortFormatDots: `${date.getUTCFullYear()}.${date.getUTCMonth()}.${date.getUTCDate()}`,
        shortFormatDashes: `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`,
        unix: date.getTime(),
    };
}

const writingCollection = defineCollection({
    loader: glob({ pattern: "**/[^_]*.md", base: "./src/content/writing" }),
    schema: z
        .object({
            title: z.string(),
            tags: z.array(z.string()).optional(),
            publishedDate: z.iso
                .date()
                .pipe(z.coerce.date())
                .transform((date) => dateFormats(date))
                .optional(),
            edits: z.array(
                z.object({
                    date: z.iso.date(),
                    desc: z.string(),
                }),
            ),
            draft: z.boolean(),
            // whether to show a table of contents
            showToc: z.boolean().default(false),
        })
        .refine(
            (data) => data.draft == true || data.publishedDate !== undefined,
            {
                message: "publishedDate is required for non-draft posts!",
                path: ["publishedDate"],
            },
        ),
});

export const collections = {
    writing: writingCollection,
};
