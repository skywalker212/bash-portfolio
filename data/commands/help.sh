#!/bin/sh

docs=${0%/*}/../help
if [ "$#" -eq 0 ]; then
    exec cat "$docs/.list"
fi

case "$1" in
    ''|*[!a-z0-9-]*) exit 1 ;;
esac

[ -f "$docs/$1" ] || exit 1
exec cat "$docs/$1"
