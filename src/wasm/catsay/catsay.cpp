#include <emscripten/emscripten.h>
#include <emscripten/bind.h>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>

using namespace emscripten;

std::string printcat();
std::vector<std::string> wrapText(const std::string& text, size_t width);

std::string say(const std::string& text) {
    const size_t maxBubbleWidth = 40;
    const size_t maxBubbleHeight = 5;
    std::string result;

    std::vector<std::string> wrappedText = wrapText(text, maxBubbleWidth - 4);
    size_t bubbleWidth = std::min(maxBubbleWidth, std::max<size_t>(wrappedText.empty() ? 0 : wrappedText[0].length() + 4, 20));
    size_t bubbleHeight = std::min(maxBubbleHeight, wrappedText.size());

    result += " " + std::string(bubbleWidth, '_') + "\n";

    for (size_t i = 0; i < bubbleHeight; ++i) {
        if (i == 0 && bubbleHeight == 1) {
            result += "< " + wrappedText[i];
        } else if (i == 0) {
            result += "/ " + wrappedText[i];
        } else if (i == bubbleHeight - 1) {
            result += "\\ " + wrappedText[i];
        } else {
            result += "| " + wrappedText[i];
        }
        result += std::string(bubbleWidth - wrappedText[i].length() - 3, ' ');
        if (i == 0 && bubbleHeight == 1) {
            result += " >\n";
        } else if (i == 0) {
            result += " \\\n";
        } else if (i == bubbleHeight - 1) {
            result += " /\n";
        } else {
            result += " |\n";
        }
    }

    result += " " + std::string(bubbleWidth, '-') + "\n";

    result += std::string(5, ' ') + "/\n";
    result += std::string(4, ' ') + "/\n";

    result += printcat();
    return result;
}

std::string printcat() {
    return R"(  /\_/\  (
 ( ^.^ ) _)
   \"/  (
 ( | | )
(__d b__)
)";
}

std::vector<std::string> wrapText(const std::string& text, size_t width) {
    std::vector<std::string> result;
    std::istringstream words(text);
    std::string word;
    std::string line;

    while (words >> word) {
        if (line.length() + word.length() > width) {
            if (!line.empty()) {
                result.push_back(line);
                line.clear();
            }
            while (word.length() > width) {
                result.push_back(word.substr(0, width));
                word = word.substr(width);
            }
        }
        if (!line.empty()) {
            line += " ";
        }
        line += word;
    }

    if (!line.empty()) {
        result.push_back(line);
    }

    return result;
}

EMSCRIPTEN_BINDINGS(module) {
    emscripten::function("say", &say);
}