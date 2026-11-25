bindkey -e
bindkey -M emacs '^[' redisplay
KEYTIMEOUT=5

if [[ $TERM == xterm* ]]; then
    _portfolio_default_cursor() {
        printf '\033[0 q'
    }

    _portfolio_zle_cursor() {
        if [[ $KEYMAP == vicmd ]]; then
            printf '\033[2 q'
            zle -M 'Normal mode. Press i to type.'
        else
            _portfolio_default_cursor
        fi
    }

    autoload -Uz add-zle-hook-widget
    add-zle-hook-widget line-init _portfolio_zle_cursor
    add-zle-hook-widget keymap-select _portfolio_zle_cursor
    add-zle-hook-widget line-finish _portfolio_default_cursor
fi
