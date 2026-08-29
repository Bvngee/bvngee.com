---
title: Self-Hosting DNS and DHCP
tags: []
publishedDate: "2025-11-27"
edits: []
draft: true
showToc: true
---

Some time ago I experimented with running my own recursive DNS server. This
grants you exciting special powers, such as being able to take control of any
real domain names of your choice, create new local-only domains, and customize a
[captive portal](https://en.wikipedia.org/wiki/Captive_portal) for users of your
local network.

I'll briefly cover how I did that, what it gave me, and some more fun things
about captive portals.

## What is a Recursive DNS Server?

When you go to a website, your computer looks up the IP address associated with
a given domain name. Eg. google.com -> `142.251.46.238`. Hosting your own
recursive DNS server essentially means becoming a middle-man in this process,
intercepting all DNS lookup requests and overriding any of your choice. If the
recursive DNS server is not told to do anything special for a given domain name,
then it will simply pass it on to whatever the backup server is, caching the
result.

This can be useful for two _main_ reasons, that being caching DNS queries made
in your local network onto a server that is local and therefore faster, and
overriding domain names of your choosing to an IP address of your choosing.

The tool I used for this purpose is called
[dnsmasq](https://thekelleys.org.uk/dnsmasq/doc.html).

## Setting Up Dnsmasq
