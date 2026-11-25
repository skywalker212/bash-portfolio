#!/bin/sh
set -eu
umask 022

seed=$1
user=$2
host=$3
home=/home/$user
portfolio=/opt/portfolio

hostname "$host"
mkdir -p /home "$portfolio"
adduser -D -h "$home" -s /bin/sh "$user"
test -d "$home"
cp -R "$seed/bin" "$seed/lib" "$seed/share" "$portfolio/"
cp "$seed/profile.sh" "$portfolio/"
cp "$seed/motd" /etc/motd
chmod 755 "$portfolio/bin/"*
