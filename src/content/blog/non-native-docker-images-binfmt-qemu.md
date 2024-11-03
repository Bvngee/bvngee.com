---
title: Building Non-Native Docker Images with binfmt and QEMU
tags: []
publishedDate: "November 2, 2024"
edits: []
draft: false
---

So, you've finally finished the perfect Dockerfile for your project. You build
it and test it on your machine; all is working well. You export the tarball,
`scp` it over to your production server, and load it into the docker daemon -
but wait! You forgot that your server has an Arm CPU and your laptop is x86_64.
This won't work; it's an architecture mismatch!

There's 3 solutions to the problem.

1. Build the Dockerfile on your production server (or another arm64 computer).
   You'll have to move over your project's source code and dependencies for this
   too... Ew!
2. Rewrite your Dockerfile to support
   [cross compilation](https://en.wikipedia.org/wiki/Cross_compiler). That's a
   lot of work, and requires cross compilation compiler flags...
3. Simply enable _✨**magic**✨_. And by that I of course mean emulating the
   docker build process using QEMU and binfmt_misc! Keep reading to learn more.

# QEMU

As described on [its website](https://www.qemu.org/), QEMU is "a generic and
open source machine emulator and virtualizer." It's super powerful and honestly
feels like some black magic; but I'll leave that for you to discover! It has two
main modes: System Emulation and User Mode Emulation.

![QEMU Zsh autocomplete list](/images/qemu-zsh-autocomplete-list.png)

With system emulation, QEMU emulates an entire foreign computer (optionally
paired with a hypervisor like KVM/Xen to take advantage of native virtualization
features), allowing full operating systems to be run that are built for nearly
any non-native CPU architecture.

With user mode emulation, QEMU emulates only the CPU of an non-native binary,
allowing, for example, a powerpc or armv6 binary to be run on an x86_64 machine.
This uses dynamic binary translation for instruction sets, syscalls
(fixing endianness and pointer-width mismatches), signal handling and
threading emulation - in other words, basically magic. Notably it's much faster than system
emulation, which has to emulate the kernel, peripheral devices, and more.

As I mentioned earlier, our goal is to emulate the docker build process so we
can generate non-native container images; i.e., `docker build -t my-container .`
but with a different cpu architecture. User mode emulation is perfect for this!

# binfmt

Ok, so we've installed QEMU. How do we tell Docker to use it? Here's where magic
part two comes in: binfmt_misc. Straight from the Wikipedia page: "binfmt_misc
is a capability of the Linux kernel which allows arbitrary executable file
formats to be recognized and passed to certain user space applications, such as
emulators and virtual machines." Essentially, we're telling the linux kernel,
"Actually, you do know how to run this foreign-architecture binary: just feed it
into QEMU!" So we get:

```
$ ./ForeignHelloWorld
zsh: exec format error: ./ForeignHelloWorld    # before
$ ./ForeignHelloWorld
Hello, World!                                  # after
```

To set this up on most linux distributions, use one of
[multiarch/qemu-user-static](https://github.com/multiarch/qemu-user-static) or
[dbhi/qus](https://github.com/dbhi/qus) or
[tonistiigi/binfmt](https://github.com/tonistiigi/binfmt); they all do roughly
the same thing. For qemu-user-static, simply run

```
$ docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
```

You might be wondering, how does an isolated docker container install binfmt
registrations for qemu persistently on my host kernel??

## Registering qemu to binfmt_misc

These "intaller" containers utilize Docker's `--privileged` mode to mount the
`/proc/sys/fs/binfmt_misc` directory, which will be the same for the host and in
the container. They contain statically compiled builds of qemu with user mode
only (qemu-user-static), and register them directly to the mounted binfmt_misc
directory. When the container exits, the registrations persist on this host
machine. You'll end up with registrations looking like this:

```
$ cat /proc/sys/fs/binfmt_misc/qemu-arm   # host machine
enabled
interpreter /usr/bin/qemu-arm-static
flags: F
offset 0
magic 7f454c4601010100000000000000000002002800
mask ffffffffffffff00ffffffffffff00fffeffffff
```

The two important parts here are `flags` and `interpreter`. Again you might be
wondering, I don't see `/usr/bin/qemu-arm-static` on my host system, so where
where does the kernel find the qemu binary?? If you weren't wondering you
should've been, because that's a path to qemu from within the installer
container, which was then promptly removed (`--rm`) altogether. Take a look
([credit](https://stackoverflow.com/a/72890225/11424968)):

```
$ docker run --rm multiarch/qemu-user-static:x86_64-aarch64 /usr/bin/qemu-aarch64-static --version
qemu-aarch64 version 7.2.0 (Debian 1:7.2+dfsg-1~bpo11+2)
Copyright (c) 2003-2022 Fabrice Bellard and the QEMU Project developers
```

The fundamental problem is that the kernel has do a path lookup for the
registered binfmt interpreter at the time when a foreign binary is invoked. But
if it's invoked in, say, a container or chroot environment, the path to the
interpreter is obviously no longer valid. the F flag is the solution to this
problem created [by Jonathan Corbet](https://lwn.net/Articles/679308/). Instead
of locating the interpreter binary lazily (at the time of first invocation),
it's given a file descriptor _immediately_ after being registered. This way,
when the kernel needs to find the interpreter in a chroot or container where the
path doesn't exist, it just uses the preallocated, always-valid file descriptor
for it instead!

This is also why the qemu binaries have to be static; if they were dinamically
linked, the dynamic library loader lookup would obviously fail within the
chroot/container environment.

So to answer the previous question about where the kernel finds
`/usr/bin/qemu-arm-static` (I'm fairly confident about this but please somebody
correct me if I'm wrong!): when the installer container registers
qemu-arm-static to binfmt_misc, it's immediately loaded by the kernel using the
valid path from within the installer container, and the given file descriptor
for it persists after the container exits. It doesn't persist on reboot though,
which is why the best
[solution](https://github.com/multiarch/qemu-user-static/issues/160#issuecomment-1010179295)
I could find online is literally to rerun the installer on every boot with a
systemd service!

# Docker Build

Now all we have to do is make the Docker build process use QEMU from our
binfmt_misc registrations. Fortunately, this is pretty easy!

Firstly, for a multiplatform build (i.e. if you want to build your docker
container natively _and_ in one or more non-native architectures and combine
them into one multiarch build), make sure the containerd image store is enabled
for the docker daemon. Podman shouldn't have this problem; just a classic case
docker being annoying (see
[this](https://docs.docker.com/build/building/multi-platform/#enable-the-containerd-image-store)
and [this](https://github.com/docker/roadmap/issues/371), or my
[NixOS setting](https://github.com/Bvngee/nixconf/blob/3fc7c9ba4428ed631e8712a94c50cf5e7070a08e/nixos/hardware/containerization.nix#L33)).

Then, you may have to create a new docker buildx builder (especially for
multiplatform builds):

```
$ docker buildx create \
  --name my-container-builder \
  --driver docker-container \
  --driver-opt=default-load=true \
  --use --bootstrap
```

Then, just run your build and specify the platform!

```
$ docker buildx build -t my-container-image --platform=linux/arm64 .
      # or
$ docker buildx build -t my-multiplatform-container-image --platform=linux/arm64,linux/amd64,<whatever_else> .
```

You'll know it's working if you see something like this (this is a NextJS build,
emulated for aarch64 - note that NixOS paths are slightly sifferent)

![docker-qemu-binfmt.png](/images/docker-binfmt-qemu.png)

# NixOS

Of course, NixOS has a super fun and declarative way to set this all up and I
can't help but share that here as well.

Instead of needing to use container-based qemu-user-static binfmt_misc
installers (on every boot), NixOS provides a module for binfmt:
`boot.binfmt.emulatedSystems`. This sets up qemu-\* for the given systems
architectures automatically, even including wasmtime for wasm files and wine for
Window's exe's! To ensure the enterpreters are statically linked versions
(qemu-\*-static), we can use `pkgsStatic.qemu-user` (requires nixpkgs-unstable;
see [nixpkgs#314998](https://github.com/NixOS/nixpkgs/pull/314998) and
[nixpkgs#334859](https://github.com/NixOS/nixpkgs/pull/334859).) Lastly, to set
the F flag for the registrations, we can use `fixBinary = true;`. Here's what we
end up with (thanks to Ten for
[this dicourse comment](https://discourse.nixos.org/t/docker-ignoring-platform-when-run-in-nixos/21120/18?u=bvngeecord)!):

```nix
boot.binfmt.emulatedSystems =
  let
    emulationsBySystem = {
      "x86_64-linux" = [
        "aarch64-linux" # qemu
        "armv6l-linux"
        "armv7l-linux"

        "x86_64-windows" # wine
        "i686-windows"

        "riscv32-linux" # qemu
        "riscv64-linux"

        "wasm32-wasi" # wasmtime
        "wasm64-wasi"
      ];
    }
  in
  emulationsBySystem.${pkgs.system};

# backport for preferStaticEmulators nixos-24.05
boot.binfmt.registrations = lib.mergeAttrsList (system:
  {
    ${system}={
      interpreter = (pkgsUnstable.lib.systems.elaborate { inherit system; }).emulator pkgsUnstable.pkgsStatic;
      fixBinary = true;
    }
  }) config.boot.binfmt.emulatedSystems;
```

That last part is a backport of preferStaticEmulators for nixos-24.05. In
nixos-unstable and nixos-24.11 it will become just

```nix
boot.binfmt.preferStaticEmulators = true;
```

The end! Hope you learned something. Here are some resources I used:

-   https://lwn.net/Articles/679309/
-   https://dbhi.github.io/qus/context.html
-   https://github.com/NixOS/nixpkgs/issues/160300
-   https://github.com/NixOS/nixpkgs/blob/nixos-unstable/nixos/modules/system/boot/binfmt.nix
-   https://discourse.nixos.org/t/docker-ignoring-platform-when-run-in-nixos/21120/16?u=bvngeecord
-   https://docs.docker.com/build/building/multi-platform/#qemu
-   https://drpdishant.medium.com/multi-arch-images-with-docker-buildx-and-qemu-141e0b6161e7

P.S.
In one of my next posts, Ill talk about how I irradicated Dockerfiles
completely, replacing them with pure nix :) more to come!
