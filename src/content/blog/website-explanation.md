---
title: A Website? Explained.
tags: []
publishedDate: June 17th, 2023
updatedDate: []
---

## Why?

I'll be honest, I didn't want to do it at first.

I've had a growing amount of reasons to want a website for a long time, but I never got myself to make one. When it comes to design, I almost never feel satisfied without knowing what I'm building, and how it works under the hood. I knew I wouldn't want to use something too structured and automatic, and I didn't have the time to indulge in learning all of the details; I've never properly worked with the web before, and there is a lot to learn. I've never had more than just a small understanding of website design, let alone how they're hosted, how JavaScript frameworks work, what a web server is, or how SSL certificates are granted.

That being said, I knew eventually the time would come for me to learn. So as my desire for a website kept growing, I finally decided to make it official, and dive into the process. This article attempts to server as a documentation of my process, an explanation for the choices I made, and a resource to anyone that many find it useful.

## The Backend

I started with the backend, figuring out how I would host the website, and learning the basics of how web hosting works in the process. I knew I didn't want to use Vercel or anything automatic with too many details hidden, so I opted to find a cloud server that I could get access to for free (no temporary trials) on which I could host my website files. After some searching, I found that the [Oracle Cloud](https://www.oracle.com/cloud/) Always Free tier has the best free options out of any cloud provider. So I got a VM of the shape that was available, and began installing software. 

I opted for using the Nginx webserver, as it offers very low level and complete control over the webhosting, and is very efficient (and seemingly better than Apache at this point). **I know it's absolutely overkill for a blog - that's the point. There's nothing to learn by deploying on Vercel!**

In the back of my head, I knew I would regret not using some form of reproducable build system (Docker, Nix, Bash scripts, etc), as I kept making small system tweaks that I knew I wouldn't remember. But I continued on for the time being, to at least get to a point of solid understanding. I'll get back to this later.

After many many days of:

- configuring firewalls, iptables and DNS records
- learning Nginx syntax and its capabilities
- furthering my understanding of file permissions in Linux
- many failed attempts at fixing the SELinux security layer before I finally gave up and disabled it

I finally had a default landing page on my domain. The next order of business:

## The Frontend

I have only ever worked with raw HTML and JavaScript, and barely even any CSS. I knew however that I would want to write blogs in Markdown, and that I would want at least *some* extra capabilities and QOL features than what you get from just those basics. So I began to search for Static Site Generators (SSGs) and frameworks that I might want to use. Some things I looked for:

- I don't *need* lots of functionality, but I like a high complexity ceiling (aka opt-in complexity)
- No rediculous abstractions; I still want to understand the entire system and compliation process
- Preferably lightweight, minimal to no client-side JS
- Fast compilation / build time

Out of those preferences, I found myself quite liking the approach that [Astro](https://astro.build) takes. It allows for fully opt-in client-side JavaScript, is very simple to start with but allows for unlimited complexity (even mixing and matching any other frameworks together), and has extremely well designed features, such as content collections. I spent a long long time over-analyzing and not able to make the final decision on what to use. But after too long of evaluating and getting nowhere (there are far too many options), I just decided to go for it.

During the frontend design process, I've learned that I tinkering and perfecting with tiny details is quite addicting. So much so, in fact, that it significantly increased the amount of time it took for me to finish getting the website together. It's a lot easier to mess with paddings and drop-shadows in CSS than it is to think about what to write! :p

As I continued to develop the website though, I had a realization. I now had access to a server fully capable of hosting my website, and my website design in development. But how was I going to connect them? How was I going to take the build ouput and transfer it over to the server?

## Connecting the Frontend and Backend

I had to figure out how to transfer the website files to the server. Should I build the site locally or on another platform and copy that output to the server's web-root directory manually after every update? Should I build the website on the server itself and constantly poll for updates in a loop?

After some thinking, I came up with these desires:

- Source code for the website should be hosted on GitHub, but the build process should NOT tied into it
    - Simple webhooks requests are OK - all source code hosting platforms should have them
    - GitHub Actions are NOT OK - they're too rooted into GitHub, and hides too much of the process
- The website is built separately from my computer, on the server itself
- All I should have to do to trigger the rebuild and deploy process is a `git push`

I found out that GitHub (not surprisingly) provides a quite convenient webhook interface, allowing reposity owners to configure webhooks that get triggered upon different events that occur within the repository (such as a new commit or a push). This works perfectly for my case, as I can have the hosting server listen for said webhooks and begin the rebuild process when they're received, which only requires me to run a `git push` to start the process! The only difficult part left is figuring out how to make the webhosting server actually listen for those webhooks.

A GitHub webhook can send to any IP or URL on any port, as a POST request with specific data and headers. Coming into this, I had absolutely no idea how I could make a computer listen for requests, or what that even really looked like or meant. Do you need a separate application for it? Is it common to have a public-facing server listen for random POST requests on an open port?

What I did know is that I already had an Nginx server running that was listening for POST requests, *but for the website*. So naturally, that was the first place my brain went to look for potential answers. But as I was too impatient to scour StackOverflow to decide if this was a good train of thought, I decided to have what turned out to be a very very long and detailed [conversation with ChatGPT](https://chat.openai.com/share/56285e44-ed8b-43f0-9cdd-fdec62fd3506) about it! (that link contains a large portion of the conversation)

I was quite blown away by ChatGTP's ability to understand my problem, and especially with its knowledge surrounding Nginx and its syntax. After a lot of conversation with it, I ended up with another Nginx server block--in the same config file I was already using for webhosting--to listen for the webhook POST requests and pass them to a "webhook server" running on port 3000 (something that parses the requests and can then execute commands depending on them): `proxy_pass http://localhost:3000;`. 

At first, it recommended me to use a simple Bash script utilizing [NetCat](https://en.wikipedia.org/wiki/Netcat) as the "webhook server", to listen to and parse the requests. But after fiddling with NetCat and its options for a while, I realized that it wasn't an ideal solution due to certain limitations and its barebones-ness. So I began to search online for other webhook servers, and found 2, both written in Go and hosted on GitHub. One had more recent commits, but [the other](https://github.com/adnanh/webhook/) had far more stars and popularity *and* has a GitHub Webhook [configuration](https://github.com/adnanh/webhook/blob/master/docs/Hook-Examples.md#incoming-github-webhook) already built in, so I went with that one.

The webhook server I picked turned out to be very helpful and easy to work with; I copied the default GitHub Webhook configuration available in the repo, tweaked some parameters and added a secret field (basically an encrypted password), and set it to run my rebuild script which I wrote in bash (I would show some code, but I'm keeping it private for security reasons). All the script has to do was pull the latest updates from my websites GitHub repo, rebuild, and copy the output to the webroot folder. And bam, I had a working connection between the front end source code and the backend hosting server!

A full diagram of the final setup *at this stage*:

![Website Hosting Diagram](/assets/website_explanation.png)

## The Backend, Revisited


(this blog post is incomplete. It was uploaded for testing sake)