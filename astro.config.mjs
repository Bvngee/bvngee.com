import { defineConfig } from "astro/config";
import { execSync } from "child_process";
import gruvboxMaterialDark from "./gruvbox_syntax_highlighting_theme.json";

import rehypeExternalLinks from "rehype-external-links";
import rehypeAutolinkHeadings from "rehype-autolink-headings/lib";
import rehypeSlug from "rehype-slug";
import remarkToc from "remark-toc";

// https://astro.build/config
export default defineConfig({
    vite: {
        define: {
            TIME_OF_LAST_COMMIT: (execSync("git log -1 --pretty=format:'%at'") * 1000).toString(),
            LAST_COMMIT_HASH: new String(execSync("git log -1 --pretty=format:'%H'")),
        },
    },
    markdown: {
        shikiConfig: {
            theme: gruvboxMaterialDark,
        },
        rehypePlugins: [
            [
                rehypeExternalLinks,
                { target: "_blank", rel: "noopener noreferrer" },
            ],
            [rehypeSlug, {}],
            [rehypeAutolinkHeadings, { behavior: "append" }],
            // 'rehype-toc'
        ],
        remarkPlugins: [
            // [ remarkToc, {heading: 'contents'} ],
            // 'remark-toc'
        ],
    },
});

