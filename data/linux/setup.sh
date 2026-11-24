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
cp "$seed/profile.sh" "$seed/banner" "$portfolio/"
chmod 755 "$portfolio/bin/"*

# Put a readable copy of the command output in the home directory links.
"$portfolio/bin/projects" > "$portfolio/share/projects"
"$portfolio/bin/skills" > "$portfolio/share/skills"
ln -s "$portfolio/share/projects" "$home/projects"
ln -s "$portfolio/share/skills" "$home/skills"
