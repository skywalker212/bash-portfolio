# Startup file for the guest's login shells.
export PATH="/opt/portfolio/bin:$PATH"

if [ -n "${ZSH_VERSION-}" ]; then
    PS1='%F{green}%n@%M:%~$%f '
else
    escape=$(printf '\033')
    PS1="\[$escape[32m\]$(id -un)@$(hostname):\w$\[$escape[0m\] "
fi
export PS1
