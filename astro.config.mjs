import { defineConfig } from "astro/config";
import { execSync } from "child_process";
import gruvboxMaterialDark from "./gruvbox_syntax_highlighting_theme.json";

import rehypeExternalLinks from "rehype-external-links";
import rehypeAutolinkHeadings from "rehype-autolink-headings/lib";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import remarkSupersub from "remark-supersub";
import remarkSmartypants from "remark-smartypants";
// todo: remake this as custom thing?
// import "remark-collapse" as remarkCollapse;

// https://astro.build/config
export default defineConfig({
    vite: {
        define: {
            TIME_OF_LAST_COMMIT: (
                execSync("git log -1 --pretty=format:'%at'") * 1000
            ).toString(),
            LAST_COMMIT_HASH: new String(
                execSync("git log -1 --pretty=format:'%H'"),
            ),
        },
    },
    markdown: {
        shikiConfig: {
            theme: gruvboxMaterialDark,
        },
        remarkPlugins: [
            // Autofills heading titled "contents" with links if it exists
            [remarkToc, { heading: "contents" }],
            //
            // [
            //     remarkCollapse,
            //     {
            //         test: "(contents|collapse)",
            //         summary: (s) => s,
            //     },
            // ],
            // Adds <sup>/<sub> to text formatted like ^sup^ and ~sub~
            remarkSupersub,
            // Github Flavored Markdown: tables, todo-lists, footnotes, etc
            [
                remarkGfm,
                {
                    // (singleTilde conflicts with remarkSupersub)
                    singleTilde: false,
                },
            ],
            // Smart typography: automatic em-dashes, curly quotes, etc
            [
                remarkSmartypants,
                {
                    backticks: false, // no weird `` or '' transformation
                    dashes: "oldschool", // -- == en-dash, --- == em-dash
                },
            ],
        ],
        rehypePlugins: [
            // Makes links open in separate tabs
            [
                rehypeExternalLinks,
                { target: "_blank", rel: "noopener noreferrer" },
            ],

            // Autogenerates `id` tags for h1-6 html blocks based on their text
            [rehypeSlug, {}],

            // Inserts icons elements to h1-6 html tags that reference their ids
            [rehypeAutolinkHeadings, { behavior: "append" }],

            // 'rehype-toc'
        ],

        // Default plugins provided by astro. Disabled so we can customize
        gfm: false,
        smartypants: false,

        // https://shiki.style
        syntaxHighlight: "shiki",
    },
});

// TODO:
