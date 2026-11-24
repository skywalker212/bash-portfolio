#!/bin/sh

if [ "$#" -eq 0 ]; then
    text=Meow
elif [ "$#" -eq 1 ]; then
    text=$1
else
    printf 'usage: %s [text]\n' "$0" >&2
    exit 2
fi

LC_ALL=C
export LC_ALL

CATSAY_TEXT=$text awk '
function repeat(s, n, result) {
    result = ""
    while (n-- > 0)
        result = result s
    return result
}

BEGIN {
    text = ENVIRON["CATSAY_TEXT"]
    wrap_width = 36
    max_width = 40
    max_height = 5

    n = split(text, words, /[[:space:]]+/)
    count = 0
    line = ""

    for (i = 1; i <= n; i++) {
        word = words[i]
        if (word == "")
            continue

        if (length(line) + length(word) > wrap_width) {
            if (line != "") {
                count++
                lines[count] = line
                line = ""
            }
            while (length(word) > wrap_width) {
                count++
                lines[count] = substr(word, 1, wrap_width)
                word = substr(word, wrap_width + 1)
            }
        }

        if (line != "")
            line = line " "
        line = line word
    }

    if (line != "") {
        count++
        lines[count] = line
    }

    if (count == 0)
        bubble_width = 20
    else {
        bubble_width = length(lines[1]) + 4
        if (bubble_width < 20)
            bubble_width = 20
        if (bubble_width > max_width)
            bubble_width = max_width
    }

    bubble_height = count < max_height ? count : max_height

    for (i = 1; i <= bubble_height; i++) {
        if (bubble_width - length(lines[i]) - 3 < 0)
            exit 1
    }

    printf " %s\n", repeat("_", bubble_width)

    for (i = 1; i <= bubble_height; i++) {
        if (bubble_height == 1) {
            prefix = "< "
            suffix = " >"
        } else if (i == 1) {
            prefix = "/ "
            suffix = " \\"
        } else if (i == bubble_height) {
            prefix = "\\ "
            suffix = " /"
        } else {
            prefix = "| "
            suffix = " |"
        }

        pad = bubble_width - length(lines[i]) - 3
        printf "%s%s%s%s\n", prefix, lines[i], repeat(" ", pad), suffix
    }

    printf " %s\n", repeat("-", bubble_width)
    printf "     /\n"
    printf "    /\n"
    printf "  /\\_/\\  (\n"
    printf " ( ^.^ ) _)\n"
    printf "   \\\"/  (\n"
    printf " ( | | )\n"
    printf "(__d b__)\n"
}
'
