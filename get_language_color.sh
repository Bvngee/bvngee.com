#!/usr/bin/env bash

lang="$1"

color="$(curl -s https://raw.githubusercontent.com/github-linguist/linguist/master/lib/linguist/languages.yml | yq ".\"${lang}\".color")"

if [[ $color == "null" ]]; then
    echo "color not in languages.yml"
    exit 1
fi

echo "$color"
