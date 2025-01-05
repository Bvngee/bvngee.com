---
title: How to Control External Monitor Brightness in Linux
tags: []
publishedDate: "2024-05-11"
edits: []
draft: false
---

Do you have an external monitor? Do you want to change it's backlight
brightness, but hate having to reach to fiddle with it's awkwardly placed and
unintuitive button interface?

Me too! Thankfully, there's a widely supported protocol called
[Display Data Channel (DDC)](https://en.wikipedia.org/wiki/Display_Data_Channel)
based on i2c that lets us solve this problem in a nice way. It allows for
communication between a computer display and a graphics adapter - things like
setting color contrast, getting model name/date information, and of course,
setting backlight brightness.

## Control displays using ddcutil

To manually query or change monitor settings from the command line, install the
[ddcutil](https://www.ddcutil.com/) program. Use it to detect which of your
monitors are ddc-capable with:

```bash
ddcutil detect
```

or to set backlight brightness with:

```bash
ddcutil setvcp 10 $BRIGHTNESS -b $I2C_BUS
```

where 10 corresponds to the backlight brightness setting, and $I2C_BUS is the
unique i2c ID given to your monitor (`/sys/bus/i2c/devices/i2c-{n}`) which
should be reported to you by ddcutil detect.

This process is definitely not ideal though; scripting `ddcutil` is
[_quite_](https://github.com/BvngeeCord/.dotfiles/blob/main/bin/bin/ddc_backlight/backlight_setter.sh#L14-L15)
[_painful_](https://github.com/BvngeeCord/.dotfiles/blob/a04d6194c98472f2eb98f52b7890fa212e287d5c/bin/bin/ddc_backlight/bump_cache.sh#L10)
(trust me on that) and prone to errors (running multiple commands too quickly
causes "communication failed" errors!) Plus, nobody wants to manually detect and
set bus ID's!

Furthermore, none of the other cool
[brightness control software](https://wiki.archlinux.org/title/Backlight#Backlight_utilities)
or modules (like Waybar's
[backlight module](https://github.com/Alexays/Waybar/wiki/Module:-Backlight))
will work with your monitors. Thankfully, there's a better solution!

## ddcci-driver-linux

Linux has a standard "display brightness" interface (which is what's used by all
the brightness control software), in which each display is given a
`/sys/class/backlight/` entry for programs to interact with. To make this work
with external ddc-capable monitors as well as regular laptop displays, one
simply needs a program that bridges the gap between linux's interface
(`/sys/class/backlight/`) and ddc commands (`/sys/bus/i2c/devices/i2c-{n}`).
Which is exactly what the
[ddcci-driver-linux](https://gitlab.com/ddcci-driver-linux/ddcci-driver-linux)
kernel module does!

After properly installing the ddcci-driver-linux kernel module,
`/sys/class/backlight/ddcci{n}` directories will be created for each capable
external monitor. Now any backlight program will work with them!

## Nvidia sucks

Unfortunately, Nvidia graphics cards can cause some trouble. Since the graphics
adapter (in the case of an Nvidia GPU, Nvidia's drivers) is required to do the
messaging with capable monitors, it is responsible for some of the
ddc-capability detection. And of course, Nvidia's implementation of that is
known to be faulty/broken.

If ddcutil doesn't detect your monitors, try
[these workarounds](https://www.ddcutil.com/nvidia/). If the ddcci-driver-linux
kernel module doesn't create the necessary `/sys/class/backlight/` entries, try
[this workaround](https://gitlab.com/ddcci-driver-linux/ddcci-driver-linux/-/issues/7#note_151296583)
(I implemented it in my NixOS configs
[here](https://github.com/BvngeeCord/nixconf/blob/10394255db698e517e05aeec70a69e41b35997b8/nixos/hardware/backlight.nix#L29)).
