#!/bin/sh

projects() {
    cat <<'PROJECTS'
bash-portfolio	Bash Portfolio	A bash-style portfolio website built with Next.js and TypeScript	WebAssembly, Next.js	https://github.com/skywalker212/bash-portfolio
tweeter	Tweeter	A light-weight twitter clone written in Erlang	Erlang, Cowboy	https://github.com/skywalker212/tweeter
js-argparse	JS-Argparse	A lightweight, client-side JavaScript argparse library	TypeScript	https://www.npmjs.com/package/js-argparse
shadowfax	Shadowfax	A programming language compiler	Java, ASM, JUnit	https://github.com/skywalker212/shadowfax
hpa-classification	HPA Classification	Human Protein Atlas - Cell Atlas protein localization using Machine Learning	Python, Tensorflow	https://github.com/skywalker212/hpa-classification
tiny-shell	Tiny Shell	A bash-like shell	C	https://github.com/skywalker212/tiny-shell
fitopsy	fitopsY	A Spotify-like Music Recommandation Engine	Python, NumPy	https://github.com/skywalker212/fitopsY
PROJECTS
}

if [ "$#" -eq 0 ]; then
    projects
else
    projects | PROJECT_NAME="$1" awk -F '\t' '
        $1 == ENVIRON["PROJECT_NAME"] { print; found = 1; exit }
        END { if (!found) exit 1 }
    '
fi
