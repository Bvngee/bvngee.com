Source code for [my personal website](https://bvngeecord.com/)!

As explained on the website, I chose to use Astro to build my website. It has everything I need, allows for as much opt in complexity as one could ever want, and is fun to work with!

Directory tree:
```
.
├── src/
│   ├── components/
│   │   └── <reusable astro components>
│   ├── content/
│   │   └── blog/
│   │       ├── first.md
│   │       ├── second.md
│   │       └── <blog posts>  
│   ├── layouts/
│   │   └── BasePageLayout.astro
│   └── pages/
│       ├── blogs/
│       │   └── [title].astro    //page for viewing blog posts
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

Everything I use to host the website (Nginx, docker, webhook, blah blah) is hosted in a private repo.

Yes, I know it's all overcomplicated. I know. It's more fun (and more to learn) that way :>