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

_portfolio_close_prompt_watch() {
    [[ -n ${_portfolio_prompt_fd-} ]] || return 0
    zle -F "$_portfolio_prompt_fd"
    exec {_portfolio_prompt_fd}<&-
    if [[ ${_portfolio_prompt_pid-} == <1-> ]]; then
        kill -TERM -- "$_portfolio_prompt_pid" 2>/dev/null
    fi
    unset _portfolio_prompt_fd _portfolio_prompt_pid
}

_portfolio_refresh_prompt() {
    local event previous_theme=${_portfolio_prompt_theme-} previous_format=${_portfolio_prompt_format-}
    if ! IFS= read -r -u "$1" event; then
        unset _portfolio_prompt_pid
        _portfolio_close_prompt_watch
        return 0
    fi
    _portfolio_apply_prompt
    if [[ $previous_theme != ${_portfolio_prompt_theme-} || $previous_format != ${_portfolio_prompt_format-} ]]; then
        zle .reset-prompt
    fi
    return 0
}

_portfolio_open_prompt_watch() {
    [[ -n ${_portfolio_prompt_fd-} ]] && return 0
    local port
    IFS= read -r port < /opt/portfolio/settings/prompt-events || return 0
    exec {_portfolio_prompt_fd}< <(
        zmodload zsh/system || return
        print -r -- "$sysparams[pid]"
        exec /usr/bin/kwbox vsock connect "$port" </dev/null 2>/dev/null
    )
    if IFS= read -r -u "$_portfolio_prompt_fd" _portfolio_prompt_pid; then
        zle -F -w "$_portfolio_prompt_fd" _portfolio_refresh_prompt
    else
        _portfolio_close_prompt_watch
    fi
}

if [[ -r /opt/portfolio/settings/prompt ]]; then
    autoload -Uz add-zsh-hook add-zle-hook-widget promptinit
    add-zsh-hook precmd _portfolio_apply_prompt
    if [[ -r /opt/portfolio/settings/prompt-events ]]; then
        zle -N _portfolio_refresh_prompt
        add-zle-hook-widget line-init _portfolio_open_prompt_watch
        add-zsh-hook zshexit _portfolio_close_prompt_watch
    fi
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
