# Startup file for the interactive BusyBox shell.
export PATH="/opt/portfolio/bin:$PATH"

escape=$(printf '\033')
PS1="\[$escape[32m\]$(id -un)@$(hostname):\w$\[$escape[0m\] "
export PS1

cat /opt/portfolio/banner
printf "\n\nType 'help' for available commands.\n"
