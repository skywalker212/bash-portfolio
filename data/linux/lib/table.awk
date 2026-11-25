BEGIN {
    if (widths == "") {
        print "table.awk: pass -v widths=25,30,68" > "/dev/stderr"
        exit 2
    }
    gsub(/[[:space:]]/, "", widths)
    ncols = split(widths, parts, ",")
    for (col = 1; col <= ncols; col++) {
        if (parts[col] !~ /^[0-9]+$/ || parts[col] + 0 < 1) {
            print "table.awk: widths must be positive integers" > "/dev/stderr"
            exit 2
        }
        width[col] = parts[col] + 0
        rule_part[col] = ""
        for (i = 0; i < width[col] + 2; i++)
            rule_part[col] = rule_part[col] "-"
    }
    bordered = 1
    if (border != "" && border + 0 == 0)
        bordered = 0
}

function rule(    line, col) {
    if (!bordered)
        return
    line = ""
    for (col = 1; col <= ncols; col++)
        line = line "+" rule_part[col]
    print line "+"
}

# The data uses single-column UTF-8 characters. Skip continuation bytes.
function text_width(text,    copy) {
    copy = text
    return length(text) - gsub(/[\200-\277]/, "", copy)
}

function prefix_bytes(text, columns,    byte, count) {
    for (byte = 1; byte <= length(text); byte++) {
        if (substr(text, byte, 1) !~ /[\200-\277]/ && ++count > columns)
            return byte - 1
    }
    return length(text)
}

function pad(text, width,    missing) {
    for (missing = width - text_width(text); missing > 0; missing--)
        text = text " "
    return text
}

function wrap(text, width, lines,    words, count, current, word, i, bytes) {
    gsub(/[[:space:]]+/, " ", text)
    sub(/^ /, "", text)
    sub(/ $/, "", text)
    if (text == "") {
        lines[1] = ""
        return 1
    }

    count = 0
    current = ""
    nwords = split(text, words, " ")
    for (i = 1; i <= nwords; i++) {
        word = words[i]
        while (text_width(word) > width) {
            if (current != "") {
                lines[++count] = current
                current = ""
            }
            bytes = prefix_bytes(word, width)
            lines[++count] = substr(word, 1, bytes)
            word = substr(word, bytes + 1)
        }
        if (word == "")
            continue
        if (current == "")
            current = word
        else if (text_width(current) + 1 + text_width(word) <= width)
            current = current " " word
        else {
            lines[++count] = current
            current = word
        }
    }
    if (current != "")
        lines[++count] = current
    return count
}

{
    sub(/\r$/, "")
    fields = split($0, cell, "\t")
    height = 1
    for (col = 1; col <= ncols; col++) {
        count = wrap(col <= fields ? cell[col] : "", width[col], wrapped)
        for (line = 1; line <= count; line++)
            body[col, line] = wrapped[line]
        body_lines[col] = count
        if (count > height)
            height = count
    }

    if (!started) {
        rule()
        started = 1
    }
    for (line = 1; line <= height; line++) {
        for (col = 1; col <= ncols; col++) {
            text = line <= body_lines[col] ? body[col, line] : ""
            if (bordered)
                printf "| %s ", pad(text, width[col])
            else if (col < ncols)
                printf "%s ", pad(text, width[col])
            else
                printf "%s", text
        }
        if (bordered)
            printf "|"
        printf "\n"
    }
    rule()
}
