import { defineConfig } from 'astro/config';
// import react from '@astrojs/react';
import preact from '@astrojs/preact';

// https://astro.build/config
// import image from "@astrojs/image";

export default defineConfig({
  integrations: [
    // react(),
    preact({compat: true}),
    // image(),
  ],
});
