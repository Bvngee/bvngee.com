---
title: Compiling Sway with wlroots from Source
tags: []
publishedDate: May 25, 2024
edits: [
  { date: "July 22, 2024", desc: "Made more consice" }
]
draft: false
---

I used this process when I needed to compile the latest commit of Sway to test a
new feature, and my distro (NixOS) didn't have the required wlroots version
packaged so I needed to compile that from source too. With the correct clangd
setup in your editor, autocomplete/intellisense for sway & wlroots will both
work flawlessly. **Disclaimer:** This isn't official; there may be better ways
to do it (feel free to ping me on
[the original gist](https://gist.github.com/BvngeeCord/6e7ce1cd14623870bcbd583ae1bb2725)).
With that out of the way, here are the steps I used:

## wlroots

1. Clone (`git clone https://gitlab.freedesktop.org/wlroots/wlroots`)

2. Obtain deps

Use your system's package manager to obtain all of wlroots' dependencies (listed
[here](https://gitlab.freedesktop.org/wlroots/wlroots#building)). A Nix shell
which accomplishes just that is at the bottom of this post.

3. Setup build & Compile

-   `--prefix` tells Meson to use a new `out` subdir as the prefix path (for
    `.so` and `.h` files ) instead of the default `/usr/local`
-   `-Doptimization` is to avoid compiler errors from Nix's fortify flags
    (alternatively use Nix's `hardeningDisable = [ "all" ];`)

```bash
meson setup build -Ddebug=true -Doptimization=2 --prefix=/home/<user>/dev/wlroots/build/out
ninja -C build install # installs headers and shared object files to the previously specified prefix
```

## Sway

1. Clone (`git clone https://github.com/swaywm/sway/`)

2. Obtain deps

Use your system package manager again (or the Nix shell at the end of this
post). Sway's build deps are listed
[here](https://github.com/swaywm/sway?tab=readme-ov-file#compiling-from-source)

3. Setup build & compile

The fun part:

```bash
PKG_CONFIG_LIBDIR="/home/<user>/dev/wlroots/build/out/lib/pkgconfig/" meson setup build -Ddebug=true -Doptimization=2
# ^ tells Meson to look for wlroots in our previously specified location
ninja -C build
```

## Nix shell

Running `nix-shell` (or `nix develop -f ./shell.nix`) with this `shell.nix` in
your CWD will add all of the listed dependencies to your environment without
installing them to your system.

```nix
{ pkgs ? import <nixpkgs> { }, ... }:
pkgs.mkShell {
  name = "wlroots";
  packages = with pkgs; [
    # Wlroots deps
    libdrm
    libGL
    libcap
    libinput
    libpng
    libxkbcommon
    mesa
    pixman
    seatd
    vulkan-loader
    wayland
    wayland-protocols
    xorg.libX11
    xorg.xcbutilerrors
    xorg.xcbutilimage
    xorg.xcbutilrenderutil
    xorg.xcbutilwm
    xwayland
    ffmpeg
    hwdata
    libliftoff
    libdisplay-info

    # Sway deps
    libdrm
    libGL
    wayland
    libxkbcommon
    pcre2
    json_c
    libevdev
    pango
    cairo
    libinput
    gdk-pixbuf
    librsvg
    wayland-protocols
    xorg.xcbutilwm
    wayland-scanner
    scdoc

    # Build deps
    pkg-config
    meson
    ninja
  ];
}
```
