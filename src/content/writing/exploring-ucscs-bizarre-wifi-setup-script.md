---
title: Exploring UCSC's Bizarre WiFi Setup Script
tags: []
publishedDate: "2025-09-26"
edits:
    [
        {
            date: "2025-09-27",
            desc: "Added info about JoinNow being a SecureW2 product",
        },
    ]
draft: false
showToc: true
---

<aside>
    Note: <br/>
    This post was written almost a full year ago now, all the way back when I
    first moved into the dorms at UCSC last September. For the entire year,
    finishing it has been on the back of my mind, but I couldn't find the time
    to finalize my thoughts and couldn't bring myself to publish something
    unpolished... So now, instead of letting perfection eat away at my brain,
    I'm going to focus on less perfect, more spew-of-conciousness writing 
    that encompass what I'm actively spending my time on. Hope that makes sense
    :)
</aside>

When I arrived at UC Santa Cruz went to connect to the WiFi network, I noticed
the recommended setup script seemed _awfully strange_. I was both curious and
slightly concerned, so I did some poking around before blindly running anything.
One thing led to another and I ended up knee-deep in an investigation into the
script's inner workings.

In the rest of this post I hope to summarize how it works and showcase my most
interesting discoveries. Hopefully you'll find this as entertaining as I did!

_note: the setup script was not written by UCSC, but rather by a contractor used
by many universities to automate the setup of Eduroam connections - more on that
later. I will be talking about the Linux version only._

# Innocent Shell Script

There's two methods listed on the UCSC website for connecting to WiFi on Linux:
"Preferred Setup (using JoinNow)", and "Manual Setup". I downloaded the
automated setup script just to check it out, even though I knew I'd wanna use
the manual method eventually. How bad could it be?

<details open>
<summary><em>SecureW2_JoinNow.run</em></summary>

```sh
#!/bin/sh

die () {
    [ ! -z "$1" ] && echo "Fatal: $1"
    [ ! -z "$tmpdir" -a -d "$tmpdir" ] && ${RM} -Rf "$tmpdir"
    exit 1
}

missing () {
    echo 'Executable `'$1'` seems to be missing, not executable or cannot be located with `which`.'
    echo ''
    echo 'Please install this program using your distribution-specific package manager (e.g. `apt-get` or `yum`).'
    echo 'If this does not solve the issue, you can try editing this script by hand to provide the proper'
    echo 'executable locations, or request your network administrator to contact SecureW2 Support.'
    die
}

dontrunasroot () {
    echo 'This utility is not designed to run as root.'
    echo 'Please start it as a regular user.'
    die
}

findutil () {
    for u in "$@"; do \
        p="$(${WHICH} ${WHICHPARAMS} "$u" 2> /dev/null)"
        [ ! -z "$p" ] && break
    done
    [ -z "$p" ] && missing "$1"
    return 0
}

whichdetect () {
    [ -z "${WHICH}" ] && WHICH="which"
    while true; do \
        WHICHPARAMS="$@"
        ${WHICH} ${WHICHPARAMS} which > /dev/null 2>&1
        if [ $? -eq 0 ]; then \
            findutil which && WHICH="$p"
            return 0
        fi
        [ -z "$1" ] && missing "which"
        shift
    done
}

# Call twice: make sure to get correct flags for actual binary
whichdetect --skip-functions --skip-alias
whichdetect --skip-functions --skip-alias

findutil whoami     && WHOAMI="$p"
[ "$(${WHOAMI})" = "root" ] && dontrunasroot

findutil mkdir      && MKDIR="$p"
findutil rm         && RM="$p"
findutil tar        && TAR="$p"
findutil gzip       && GZIP="$p"
findutil pwd        && PWD="$p"
findutil sed        && SED="$p"
findutil readlink   && READLINK="$p"
findutil python \
         python2 \
         python3    && PYTHON="$p"

tmpdir="/tmp/securew2-joinnow-$$.tmp"
archive="$(${READLINK} -f "$0")"

${MKDIR} -p "$tmpdir" || die "Error creating temporary directory $tmpdir"
cd $tmpdir || die "Error switching working directory to $tmpdir"
${SED} '0,/^#ARCHIVE#$/d' "$archive" | ${GZIP} -d | ${TAR} x || die "Error extracting embedded archive"
${PYTHON} main.py "$@"
retval=$?
${RM} -Rf "$tmpdir"
exit $retval

#ARCHIVE#
<àf
SecureW2_JoinNow.tar
ì=ksÛ8ó9¿3S)R3"ùI¶ND[RIò89ÇÅ¢%8æF"µ|øq[ûß¯
I¼HIq2WwuüÐºÑht7äÏÓ
Öúñ§ö´á9:8Àÿ;Çmñ,9<jïýÔ9Øß?>::nw~jw:G?YíGRùdIêÇõ¯uõ6ÿ/}Õ:SëI×~<ãFÅ[LÝÄÑÊºört`ñ¯×G2¼ðÖOnÁu^ÜúVd×ë8$ÉËÆÑMk<»Mk:;ÏVß_.ÉbÌjºqÅ<%é}ì¯s`|ç%ÁÍ-	Y?Ë	¾'×I±Zë,öR´?$é}=óCÿ¡ÉGVq´\æÕØ_Mk6>fALb5ä5ûQyÅî¦åÒ
+¦îÃ¬Q»äWò@µì>Óà&û)çâÚ_ú \ÚßXILð/Ld5ûË([LxY^3²xNV¬9À2ò^^°ªYÑ7Y
`VË[²\°´èåMðe#~c
¥Ï=;ë}ôÞNÝaïÌõ¦ÿt­®ÕÙ;¶ðùÕz³°¢ÐZùÖÞá¡uýÂ0e« übÁ($©5ZV2'¡ÝX{¼Ê5¿õc}|6_«Ge¸Sp¹ñú¶<qÇ£ÉÌs'ÑÄëNªa½ðÌN{ïrZoy^©ç9	YÞ4aXbÌ¦EØø®@Dµ¼5|°ZË§$.V].¤ P¤±CßVpcQjI
Öúñ§ö´á9:8Àÿ;Çmñ,9<jïýÔ9Øß?>::nw~jw:G?YíGRùdIêÇõ¯uõ6ÿ/}Õ:SëI×~<ãFÅ[LÝÄÑÊºört`ñ¯×G2¼ðÖOnÁu^ÜúVd×ë8$ÉËÆÑMk<»Mk:;ÏVß_.ÉbÌjºqÅ<%é}ì¯s`|ç%ÁÍ-	Y?Ë	¾'×I±Zë,öR´?$é}=óCÿ¡ÉGVq´\æÕØ_Mk6>fALb5ä5ûQyÅî¦åÒ
+¦îÃ¬Q»äWò@µì>Óà&û)çâÚ_ú \ÚßXILð/Ld5ûË([LxY^3²xNV¬9À2ò^^°ªYÑ7Y
RY²PÁ³fPrTnÎæör­ ¢¡¿µSx7ég©6³0YìS=ºñ¬ËçÉå<Ov¥nO/ö¼qï´w2òÁpæN½Óí4ZTd*TnhÂ¥Ø]N9KÎ÷Q»q~+4{{®h©í¸s>u¡´7ì»§§îÉv<êÚE'l_æ>V²¬´M«Ó9VIFý­sé£]ÿfUÞØ^6
½Ù§±ë GCWÕ|ºV»qÊ×©;õ?Lû×ªp{µpSw6t/Æ½éôb49áöká`j}sê^ö´öjáz'':;¬{Óë8ør´ÓÙh¢E×:ÞDgßÌoýÞÌá^ÕÂõÁãôLtþQw^çIo¦AÂ¸×Ì`8õNO§£·³ÐQ
¬þh8tûº¨¡§´IdÆÑÇOàíàÝù¤E°^fNS*4{
çÄáøËþXd	Ì¡[G{îyðú+âyE)}\''Ìêv­ LKúðáHCIm´Þ`8
h­ý<±U\1{n9ÈOZíÓwh½QÏú®lÍ@@A´cV1xEqeZå7%TÂ¤Yrú5	b¸[#v:ê¼HÁ®0ß$EÝ4~ù¼iò+"¹ßóØ«GyÞh
RY²PÁ³fPrTnÎæör­ ¢¡¿µSx7ég©6³0YìS=ºñ¬ËçÉå<Ov¥nO/ö¼qï´w2òÁpæN½Óí4ZTd*TnhÂ¥Ø]N9KÎ÷Q»q~+4{{®h©í¸s>u¡´7ì»§§îÉv<êÚE'l_æ>V²¬´M«Ó9VIFý­sé£]ÿfUÞØ^6


... [ 194 LINES REMOVED ] ...

```

</details>

This is the script I was greeted with.

In the beginning, it's pretty sensible! Detections for coreutils, warnings to
not run as root, error messages, etc; all things a portable bash script should
have. But wait a minute; why does it need `gzip` and `tar`? Why is it looking
for Python, and where is this supposed "`main.py`"?

Scrollisng to the bottom of the script, I saw a bunch of binary data. What, you
might be asking, is a bash script doing with binary data embedded at the end of
it? Well, lets take a closer look at these lines of the script (some omitted for
clarity):

```bash
archive="$(${READLINK} -f "$0")"
${SED} '0,/^#ARCHIVE#$/d' "$archive" | ${GZIP} -d | ${TAR} x || die "Error extracting embedded archive"
${PYTHON} main.py "$@"
```

In order of operations:

1. Firstly, `readlink -f "$0"` gets the absolute path to `"$0"`, which in Bash
   is the path to the current script.
2. Next, it calls `sed` _on that absolute path_, with the argument
   `'0,/^#ARCHIVE#$/d'`, which tells sed, "from line 0 of the file to the first
   line with the text `#ARCHIVE#`, delete everything" (it does this in memory,
   not in-place on the file).
3. It then pipes that output (the remaining text) into `gzip -d`, asking gzip (a
   compression utility) to treat the incoming data blob from stdin as a
   compressed (.gz) file and to decompress it.
4. Lastly, it pipes that output into `tar x`, asking tar (an archiving utility)
   to treat the incoming data from stdin as an archive file containing multiple
   inner files, and to extract them into the current directory (a temporary
   location).
5. Finally, it runs the extracted main.py file using the Python interpreter it
   found earlier.

In other words: **the binary data at the bottom of the SecureW2_JoinNow.run bash
script is a python script!**

Interesting. Let's check it out!

# Python Jumpscare

Not wanting to run the script blindly just yet, I executed the commands
manually. And...

![SecureW2_JoinNow-python-jumpscare](@assets/SecureW2_JoinNow-python-jumpscare.png)

Good lord, what is all this?! All you have to do is connect me to the WiFi..
right? _(exasperated emoji)_

The first thing I did, even before browsing the python, was open
`SecureW2.cloudconfig`. More binary data! This time though it was clear there
was some important text embedded, as I could clearly read fragments of what
looked to be dialog labels for some GUI:

![SecureW2_cloudconfig](@assets/SecureW2_cloudconfig_small.png)

I spent some more time digging before running anything. Following the `main.py`
entrypoint to `PaladinClient` led me straight to the first intersting thing
(simplified for clarity):

```python
class PaladinLinuxClient(object):
    """SecureW2 JoinNow Linux Client Implementation"""
    CONFIG_FILE = 'SecureW2.cloudconfig'

    @staticmethod
    def decipher(config_file):
        with open(config_file) as config:
            p = Popen('openssl smime -verify -inform der -noverify', stdin=config, stdout=PIPE, shell=True)
            config_data = p.communicate()[0]
            return bytearray(config_data).decode('utf-8')

    @staticmethod
    def strip_namespace(xml_document):
        """Removes xmlns attribute from XML file to avoid having to prefix all nodes"""
        return re.sub('xmlns="[^"]+"', '', xml_document)

    def load_config(self, xml_document):
        """Parses the XML config file"""
        root = ET.fromstring(xml_document)

        # Find organization node
        self.organization = (root.findall('organization') + [ None ])[0]
        # Find (first) deviceconfig node
        self.devicecfg = root.find('configurations/deviceConfiguration')
        ...
```

I saw that during it's \_\_init\_\_ PaladinClient...

1. runs `openssl` (straight from PATH!) in order to somehow decode
   SecureW2.cloudconfig, passing it to openssl as stdin
2. treats the resulting bytearray as an **XML document**, getting important
   information like `deviceConfiguration` and `organization` from it

# Hidden XML

Checking the filetype of SecureW2.cloudconfig revealed it to be a binary data
format (DER) that contains a certificate:

```console
$ file SecureW2.cloudconfig
SecureW2.cloudconfig: DER Encoded PKCS#7 Signed Data
```

Wikipedia says that PKCS#7 is just a standard file format for encrypted data,
and that DER is one of the specifications for how to encode data as binary into
that file.

Openssl can help prove that there is in fact a certificate hiding inside the
`SecureW2.cloudconfig` file:

```console
$ openssl pkcs7 -in SecureW2.cloudconfig -inform DER -print_certs -out cert.pem
$ cat cert.pem
subject=C=NL, ST=Overijssel, L=Enschede, O=SecureW2, OU=Development, CN=license.securew2.com
issuer=C=NL, ST=Overijssel, L=Enschede, O=SecureW2, OU=Development, CN=license.securew2.com
-----BEGIN CERTIFICATE-----
MIIDXDCCAsWgAwIBAgIJA..
```

However, the wiki page mentioned data storage too, and Openssl can also extract
it:

```console
$ openssl smime -verify -inform der -noverify < SecureW2.cloudconfig > dump.xml
$ cat dump.xml
<?xml version="1.0" encoding="UTF-8"?><paladinResponse..
```

There's the XML hiding inside `SecureW2.cloudconfig`! Looking around, it
contains both important organizational information (OAuth URLs, org name,
certificats, etc) as well as what looks to be UI dialog texts (localizations). I
verified this by also downloading the setup script for Dartmouth University (one
of the other schools contracting with Eduroam for wifi), and it produced a very
similar out.xml, except with differing `<actions>` depending on the unique
networks of each school (eg. UCSC-Guest, ResWifi).

At this point I was curious enough to try running the script. After being
prompted for login I saw that ~/.joinnow/ was created, with a file 08d..4e2.pem:

```console
$ cat ~/.joinnow/08d[..]4e2.pem
-----BEGIN CERTIFICATE-----
MIIEoTCCA4mg..
```

which matches exactly what's in the XML (simplified):

```
<action type="8">
    <certificate>
        <alias>08d..4e2</alias>
        <data>MIIEoTCCA4mg..</data>
    </certificate>
</action>
```

So clearly PaladinClient (whatever that even is) is using the XML data to figure
out how to connect you to the eduroam network and make it persist on the
machine. I still have no idea what `type="8"` means, nor where that certificate
actually comes into play during the connection process (it's not the same as the
802-1x ca-certificate!).

<aside>
    I later found out that this entire script was not written by UCSC but rather
    by a company called <a href="https://www.securew2.com/joinnow-platform" target="_blank" rel="noopener noreferrer">SecureW2</a>
    "JoinNow" is their main product, which is a "platform" for streamlining
    setup and authentication for Eduroam WiFi networks (Eduroam is an
    intra-university WiFi network complex).
</aside>

# Declarative NixOS config

As I said in the beginning, I knew I'd want to make it work manually eventually,
so I don't have to rely on stateful imperative scripts that I'll forget how to
use eventually. Here is the config that I came up with, which I've been running
for the past year:

```nix
# Hardcoded NetworkManager configurations. First created manually in nmtui (or other tools),
# then converted to nix code via https://github.com/janik-haag/nm2nix. These exist alongside
# the imperatively created networks.
# Config spec: https://networkmanager.dev/docs/api/latest/nm-settings-nmcli.html
networking.networkmanager.ensureProfiles.profiles =
let
  mkUCSCProfile = ssid: {
    wifi = {
      inherit ssid;
      mode = "infrastructure";
    };
    "802-1x" = {
      ca-cert = "${pkgs.fetchurl {
        url = "https://its.ucsc.edu/wireless/docs/ca.crt";
        hash = "sha256-[..]";
      }}";
      anonymous-identity = "anon";
      domain-suffix-match = "ucsc.edu";
      eap = "peap;";
      identity = "jnystrom@ucsc.edu";
      password-flags = 0; # Store password # TODO: this doesn't actually remember the password for you
      phase2-auth = "mschapv2";
    };
    connection = {
      id = "UCSC ${ssid} (nixconf)";
      type = "wifi";
      autoconnect = true;
    };
    wifi-security.key-mgmt = "wpa-eap";
    proxy = { };
  };
in
{
  "UCSC eduroam (nixconf)" = lib.mkIf (config.host.isMobile) (mkUCSCProfile "eduroam");
  "UCSC ResWiFi (nixconf)" = lib.mkIf (config.host.isMobile) (mkUCSCProfile "ResWiFi");
};
```

This config has an issue though that the `SecureW2_JoinNow.run` script doesn't,
which is that even though the password-flags is set to keep, Network Manager
asks me for my password every time I try to join. To be figured out eventually
:)
