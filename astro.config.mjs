import { defineConfig } from 'astro/config';
import gruvbox_material_dark from './gruvbox_material_dark.json';

// https://astro.build/config
export default defineConfig({
    markdown: {
        shikiConfig: {
            theme: gruvbox_material_dark
        }
    }
});