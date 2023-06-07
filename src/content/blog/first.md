---
title: First
publishedDate: "May 21, 2023"
updatedDate: []
---

## Title `test`
### whtas going onnnn
1
2
this is a test
`int not_so_main() {}`
```ts
import BasePageLayout from '../../layouts/BasePageLayout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
    const blogs = await getCollection('blog');
    return blogs.map(entry => ({
        params: { title: entry.slug }, props: { entry },
    }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
```

This is a paragraph. Blablablablablab posts memes on the internet and posts memes on the internet and lol thisda sdd asd asdas adsssdads example text. This is an example sentence. This sentence has no meaning, as it is mere garbage. ... This is a waste of my time isn't it

tsdasd o