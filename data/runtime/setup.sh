#!/bin/sh

set -e
umask 000
root=$1
busybox=$2
tools=$root$3
seed=$4
home=$root$5

mkdir -p "$root/bin" "$root/dev/shm/tmp" "$root/proc/self/fd" "$root/tmp" "$tools" "$home"
mknod -m 666 "$root/dev/null" c 1 3
mknod -m 555 "$root/dev/random" c 1 8
mknod -m 555 "$root/dev/urandom" c 1 9
mknod -m 666 "$root/dev/tty" c 5 0
mknod -m 666 "$root/dev/tty1" c 4 1
ln -s /dev/tty "$root/dev/stdin"
ln -s /dev/tty "$root/dev/stdout"
ln -s /dev/tty1 "$root/dev/stderr"
ln -s /bin/projects "$home/projects"
ln -s /bin/skills "$home/skills"

cp "$seed/bin/"* "$root/bin/"
chmod 777 "$root/bin/"*
cp "$busybox" "$tools/busybox"
cp -R "$seed/commands" "$seed/help" "$tools/"
cp "$seed/runtime/filesystem.sh" "$tools/"
ln -s busybox "$tools/cat"
ln -s busybox "$tools/awk"
mount --bind "$tools" "$tools"
mount -o remount,bind,ro "$tools"
