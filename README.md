Source code for my personal website, [bvngee.com](https://bvngee.com/)!

As explained in a blog, I chose to use Astro to build my website. It has everything I need, allows for as much opt in complexity as one could ever want, and is fun to work with!

I will update this with more info later.

Directory structure:
```
.
├── src/
│   ├── components/
│   │   └── <reusable astro components>
│   ├── content/
│   │   └── writing/
│   │       ├── article_a.md
│   │       └── <articles>  
│   ├── layouts/
│   │   └── BasePageLayout.astro
│   └── pages/
│       ├── writing/
│       │   └── [slug].astro     // page for viewing article of writing
│       ├── about.astro
│       ├── writing.astro
│       ├── index.astro          // home page
│       └── ...
└── public/
    ├── fonts/
    │   └── ...
    ├── favicon.png
    └── ...
```
