---
title: A Website? Explained.
tags: []
publishedDate: June 17th, 2023
updatedDate: ['lol']
draft: true
---

# Why a Website?

I'll be honest, I didn't want to make a website at first.

When it comes to design, I almost never feel satisfied without knowing how the thing I'm building works under the hood. I knew I wouldn't be happy if I used something too structured and automatic, and I never felt like I had the time to indulge in learning all of the details.

I had never properly worked with the web before, and there is a lot to learn. I've never had more than just a small understanding of website design, let alone how they're hosted, how JavaScript frameworks work, what a web server is, or how SSL certificates are granted, for just a few examples.

That being said, I knew eventually the time would come for me to learn. As my desire for a website kept growing, I finally decided to make it official, and dive into the process. This article attempts to server as a documentation of my process, an explanation for the choices I made, and a resource to anyone that many find it useful.

# The Backend

I started with the backend, figuring out how I would host the website, and learning the basics of how web hosting works in the process. I knew I didn't want to use Vercel or anything automatic with too many details hidden, so I opted to find a cloud server that I could get access to for free (no temporary trials) on which I could host my website files. After some searching, I found that the [Oracle Cloud](https://www.oracle.com/cloud/) Always Free tier has the best free options out of any cloud provider. So I got a VM of the shape that was available, and began installing software. 

I opted for using the Nginx webserver, as it offers very low level and complete control over the webhosting, and is very efficient (and seemingly better than Apache at this point). **I know it's absolutely overkill for a blog - that's the point. There's nothing to learn by deploying on Vercel!**

For SSL certs, I chose to use [CertBot](https://certbot.eff.org/) which uses the LetsEncrypt certificate authority. It was a relatively simple process, but it involved installing more software and many specific steps, commands, and configurations.

In the back of my head, as I continued to make all these small changes and additions that are impossible to remember, I knew I would regret not using some form of reproducable build system (Docker, Nix, Bash scripts, etc). I knew that if I ever had to switch server prodivers or rebuild the system from scratch for any reason, I would have to relearn and remember it all over again. But I continued on for the time being, to at least get to the point of hosting a webpage. I'll get back to this later.

After many many days of:

- configuring firewalls, iptables and DNS records
- learning the Nginx syntax and all of its capabilities
- furthering my understanding of file permissions in Linux
- many failed attempts at fixing the SELinux security layer before I finally gave up and disabled it

I finally had a default landing page hosted on my domain. The next order of business:

# The Frontend

I have only ever worked with raw HTML and JavaScript, and barely even any CSS. I knew however that I would want to write blogs in Markdown, and that I would want at least *some* extra capabilities and QOL features than what you get from just those basics. So I began to search for Static Site Generators (SSGs) and frameworks that I might want to use. Some things I looked for:

- I don't *need* lots of functionality, but I like a high complexity ceiling (aka opt-in complexity)
- No rediculous abstractions; I still want to understand the entire system and compliation process
- Preferably lightweight, minimal to no client-side JS
- Fast compilation / build time

Out of those preferences, I found myself quite liking the approach that [Astro](https://astro.build) takes. It allows for fully opt-in client-side JavaScript, is very simple to start with but allows for unlimited complexity (even mixing and matching any other frameworks together), and has extremely well designed features, such as content collections. I spent a long long time over-analyzing and not able to make the final decision on what to use. But after too long of evaluating and getting nowhere (there are far too many options), I just decided to go for it.

During the frontend design process, I've learned that I tinkering and perfecting with tiny details is quite addicting. So much so, in fact, that it significantly increased the amount of time it took for me to finish getting the website together. It's a lot easier to mess with paddings and drop-shadows in CSS than it is to think about what to write! :p

As I continued to develop the website though, I had a realization. I now had access to a server fully capable of hosting my website, and my website design in development. But how was I going to connect them? How was I going to take the build ouput and transfer it over to the server?

# Connecting the Frontend and Backend

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

At first, it recommended me to use a simple Bash script with [NetCat](https://en.wikipedia.org/wiki/Netcat) as the "webhook server", to listen to and parse the requests. That wasn't an ideal solution though, due to many limitations and its NetCat's barebones-ness. So I began to search online for other webhook servers, and found 2, both written in Go and hosted on GitHub. One had more recent commits, but [the other](https://github.com/adnanh/webhook/) had far more stars and popularity *and* has a GitHub Webhook [configuration](https://github.com/adnanh/webhook/blob/master/docs/Hook-Examples.md#incoming-github-webhook) already built in, so I went with that one.

The webhook server I picked turned out to be very helpful and easy to work with. I copied the default GitHub Webhook configuration available in the repo, tweaked some parameters and added my secret field (basically an encrypted password), and set it to run my rebuild bash script (I would show some code, but I'm keeping it private for security reasons). All the script has to do was pull the latest updates from my websites GitHub repo, rebuild, and copy the output to the webroot folder. And bam, I had a working connection between the front end source code and the backend hosting server!

A full diagram of the setup *at this stage*:

![Website Hosting Diagram](/images/website_explanation.png)

# The Backend, Revisited

At this point, I had configured and installed more things on the Oracle Cloud server than I could count. I knew that it would become a problem, as if at any time I would have to switch the server hosting platform or rebuild the system for any reason, I would have to figure it all out again. The list of things I had done includes but is not limited to:

- Installing *tons* of packages and software
- Configuring iptables
- Installing SSL certs
- Configuring file permissions for Nginx and its webroot
- Disabling SELinux

Sensing my future regret, I decided to rebuild as much as I could of the whole setup in a Docker container, applying what I'd learned so far to make a much more reproducible and understandable setup. This of course had to begin with learning Docker and its basic usage, but that went fairly quick. Next, I had to figure out how I was going to combine the three main/difficult components of the setup:

1. Nginx, and its configuration
1. Webhook server
1. SSL Certs

I knew that Nginx has its own officially supported Docker containers, and that webhook also has one. But since the webhook container seemed a little too sketchy/3rd party, I decided I would use the officially supported Golang container to build webhook beforehand. I had also learned that Docker has Multi-Stage builds, where you utilize components from another container to build the final one, which creates a smaller final image. So by first building webhook in the golang container, and copying the binary into a fresh nginx container, all I had left to work out was SSL certs - the hardest part.

What makes the SSL certs more annoying is that you don't want to re-request the certs from the certificate authority every single time you restart the container - it's a very long process. So after some searching, I figured that I would need to use a Docker Volume to keep the certificate files persistent between runs.

I also learned that CertBot (which also forces users to install it as a Snap package :|) was not going to be ideal. So instead, I found [acme.sh](https://github.com/acmesh-official/acme.sh), a shell script that can do everything CertBot can but better, plus a *lot* more. It has two main subcommands that are needed for issuing certs: `acme.sh --issue`, and `acme.sh --install-cert`. The issue command actually contacts the CA's and requests the certs, which is the long process that you don't want to repeat. The install command just takes the certs that have already been received, and does something with them - in my case, I have configured it to simply copy them into a location where Nginx can read them.

Figuring out how to make all this work in the Docker container took *quite* a long time, but throughout the process, I learned a ton about how the certificate requesting actually works. In order to get certificates from a CA, they need to verify that you have control over the domain. There are *many* methods to do this, and `acme.sh` comes with 8, but the most common of them is called "Webroot mode." By giving `acme.sh` write-access to your webserver's webroot folder, the CA can verify that you own the domain by requesting `acme.sh` to add a file somewhere under the root. When the CA then makes a GET request for that specific file, if your webserver is set up correctly, it should receive it, and thus know that you own the domain.

This strategy works well and good, except for a problem that arises when attemtping to automate the process in Docker: My Nginx configuration is set to host the webroot under https *only*; i.e., I don't host anything without encryption. So how is Nginx supposed to host the file that acme.sh generates to request the SSL certs, without there being any SSL certs yet!

The solution (that I came up with): A super minimal, http-only Nginx configuration that is used *just* to request the SSL certs. Once they have been received and installed, Nginx will then be reloaded with the full http**s**-only configuration. The amount of complexity here made me move the logic into a separate `init_container.sh` bash script, which becomes the ENTRYPOINT of the docker container.