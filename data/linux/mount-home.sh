#!/bin/sh
set -eu

home=$1
owner=$2
storage=/data/portfolio-home

# /init mounts the ext4 data disk before BusyBox runs the sysinit entries.
mountpoint -q /data
mount -o remount,sync,noatime /data
if [ ! -d "$storage" ]; then
    install -d -m 0755 -o "$owner" -g "$owner" "$storage"
fi
mount --bind "$storage" "$home"
