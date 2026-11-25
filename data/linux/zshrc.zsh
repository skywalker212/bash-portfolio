bindkey -e
bindkey -M emacs '^[' redisplay
KEYTIMEOUT=5

_portfolio_apply_prompt() {
    local theme format
    {
        IFS= read -r theme && IFS= read -r format
    } < /opt/portfolio/settings/prompt || return 0

    local previous=${_portfolio_prompt_theme:-portfolio}
    [[ $theme == $previous && ($theme != custom || $format == $_portfolio_prompt_format) ]] && return 0

    (( ${+parameters[prompt_themes]} )) || promptinit
    if [[ $theme != portfolio && $theme != custom && ( $theme == restore || -z ${prompt_themes[(r)$theme]} ) ]]; then
        return 0
    fi

    if [[ $previous != portfolio ]]; then
        prompt restore
    fi

    case $theme in
        portfolio) ;;
        custom)
            prompt off
            PROMPT=$format
            setopt prompt_percent
            unsetopt prompt_subst prompt_bang
            ;;
        *) prompt "$theme" ;;
    esac
    _portfolio_prompt_theme=$theme
    _portfolio_prompt_format=$format
}

if [[ -r /opt/portfolio/settings/prompt ]]; then
    autoload -Uz add-zsh-hook promptinit
    add-zsh-hook precmd _portfolio_apply_prompt
fi

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
