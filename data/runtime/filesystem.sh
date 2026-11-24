#!/bin/sh

# The runtime directory also contains BusyBox and the portfolio command scripts.
tools=${0%/*}
box=$tools/busybox
cd -- "$1" || exit 1
operation=$2
shift 2
umask 000

# Exit codes 10 and 11 distinguish a missing path from the wrong file type.
check_directory() {
    [ -e "$1" ] || exit 10
    [ -d "$1" ] || exit 11
}

list_directory() {
    check_directory "$1"
    cd -- "$1" || exit 1
    if [ "$2" = 1 ]; then
        set -- . .. .[!.]* ..?* *
    else
        set -- *
    fi

    for name do
        [ -e "$name" ] || [ -L "$name" ] || continue
        [ "$PWD/$name" != "$tools" ] || continue
        info=$("$box" stat -c '%A %h %u %g %s %Y' -- "$name") || exit 1
        printf '%s\0%s\0' "$name" "$info"
        if [ -L "$name" ]; then
            "$box" readlink -n -- "$name" || exit 1
        fi
        printf '\0'
    done
}

case "$operation" in
    command)
        name=$1
        shift
        exec "$box" sh "$tools/commands/$name.sh" "$@"
        ;;
    append)
        "$box" cat >> "$1" && exit 0
        [ -e "$1" ] || exit 10
        exit 1
        ;;
    read)
        [ -e "$1" ] || exit 10
        [ -f "$1" ] || exit 11
        exec "$box" cat -- "$1"
        ;;
    list)
        list_directory "$@"
        ;;
    unlink)
        [ -e "$1" ] || exit 10
        if [ -d "$1" ] && ! [ -L "$1" ]; then
            exec "$box" rmdir -- "$1"
        fi
        exec "$box" rm -- "$1"
        ;;
    mkdir)
        [ -d "$1" ] || "$box" mkdir -- "$1"
        ;;
    chdir)
        check_directory "$1"
        cd -- "$1" && pwd -P
        ;;
    *)
        exit 2
        ;;
esac
