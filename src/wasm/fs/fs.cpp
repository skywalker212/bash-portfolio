#include <emscripten/emscripten.h>
#include <emscripten/bind.h>
#include <string>
#include <filesystem>
#include <stdexcept>

using namespace emscripten;

bool setup_filesystem(std::string home_dir) {
    try {
        std::filesystem::remove_all("/home/web_user");
        std::filesystem::create_directories(home_dir);
        std::filesystem::create_symlink("/bin/projects", home_dir + "/projects");
        std::filesystem::create_symlink("/bin/skills", home_dir + "/skills");
        std::filesystem::current_path(home_dir);
        return true;
    } catch (const std::filesystem::filesystem_error& e) {
        EM_ASM({
            throw new Error('Filesystem error:', UTF8ToString($0));
        }, e.what());
        return false;
    } catch (const std::exception& e) {
        EM_ASM({
            throw new Error('Error:', UTF8ToString($0));
        }, e.what());
        return false;
    }
}

EMSCRIPTEN_BINDINGS(module) {
    emscripten::function("setup_filesystem", &setup_filesystem);
}