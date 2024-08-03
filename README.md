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
│   │   └── blog/
│   │       ├── a_post.md
│   │       └── <blog posts>  
│   ├── layouts/
│   │   └── BasePageLayout.astro
│   └── pages/
│       ├── blogs/
│       │   └── [slug].astro    //page for viewing blog posts
│       ├── about.astro
│       ├── blogs.astro
│       ├── index.astro          //home page
│       └── ...
└── public/
    ├── fonts/
    │   └── ...
    ├── favicon.png
    └── ...
```
