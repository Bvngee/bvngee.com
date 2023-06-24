import { defineConfig } from 'astro/config';
import gruvboxMaterialDark from './gruvbox_syntax_highlighting_theme.json';

import rehypeExternalLinks from 'rehype-external-links';
import rehypeAutolinkHeadings from 'rehype-autolink-headings/lib';
import rehypeSlug from 'rehype-slug';
import remarkToc from 'remark-toc';

// https://astro.build/config
export default defineConfig({
    markdown: {
        shikiConfig: {
            theme: gruvboxMaterialDark
        },
        rehypePlugins: [
            [ rehypeExternalLinks, {target: "_blank", rel: "noopener noreferrer"} ],
            [ rehypeSlug, {} ],
            [ rehypeAutolinkHeadings, {behavior: "append"} ],
            // 'rehype-toc'
        ],
        remarkPlugins: [
            // [ remarkToc, {heading: 'contents'} ],
            // 'remark-toc'
        ]
    }
});