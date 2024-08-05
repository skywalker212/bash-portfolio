#include <emscripten/bind.h>
#include <string>
#include <vector>
#include <filesystem>
#include <fstream>
#include <stdexcept>

emscripten::val vector_string_to_js(const std::vector<std::string> &vec)
{
    emscripten::val result = emscripten::val::array();
    for (const auto &s : vec)
    {
        result.call<void>("push", emscripten::val(s));
    }
    return result;
}

class FileSystem
{
private:
    std::string home_dir;
    emscripten::val callbacks;

public:
    FileSystem(const std::string &home_dir, emscripten::val callbacks)
        : home_dir(home_dir), callbacks(callbacks)
    {
        try
        {
            std::filesystem::remove_all("/home/web_user");
            std::filesystem::create_directories(home_dir);
            std::filesystem::create_symlink("/bin/projects", home_dir + "/projects");
            std::filesystem::create_symlink("/bin/skills", home_dir + "/skills");
            std::filesystem::current_path(home_dir);
        }
        catch (const std::filesystem::filesystem_error &e)
        {
            throw std::runtime_error("Filesystem error: " + std::string(e.what()));
        }
    }

    void writeFile(const std::string &path, const std::string &data)
    {
        std::ofstream file(path, std::ios::app);
        if (!file)
        {
            throw std::runtime_error("Unable to open file for writing");
        }
        file << data;
    }

    std::string readFile(const std::string &path)
    {
        if (!std::filesystem::is_regular_file(path))
        {
            throw std::runtime_error("Not a file");
        }
        std::ifstream file(path);
        if (!file)
        {
            throw std::runtime_error("Unable to open file for reading");
        }
        return std::string((std::istreambuf_iterator<char>(file)),
                           std::istreambuf_iterator<char>());
    }

    std::string cwd()
    {
        return std::filesystem::current_path().string();
    }

    emscripten::val listDirectory(const std::string &path)
    {
        std::vector<std::string> files;

        files.push_back(".");
        files.push_back("..");

        for (const auto &entry : std::filesystem::directory_iterator(path))
        {
            files.push_back(entry.path().filename().string());
        }

        std::sort(files.begin(), files.end());

        return vector_string_to_js(files);
    }

    bool unlink(const std::string &path)
    {
        return std::filesystem::remove(path);
    }

    bool makeDirectory(const std::string &name)
    {
        return std::filesystem::create_directory(name);
    }

    bool changeDirectory(const std::string &path)
    {
        std::filesystem::current_path(path);
        if (callbacks["onChangeDirectory"].as<bool>())
        {
            callbacks["onChangeDirectory"](cwd());
        }
        return true;
    }
};

EMSCRIPTEN_BINDINGS(filesystem_module)
{
    emscripten::class_<FileSystem>("FileSystem")
        .constructor<std::string, emscripten::val>()
        .function("writeFile", &FileSystem::writeFile)
        .function("readFile", &FileSystem::readFile)
        .function("cwd", &FileSystem::cwd)
        .function("listDirectory", &FileSystem::listDirectory)
        .function("unlink", &FileSystem::unlink)
        .function("makeDirectory", &FileSystem::makeDirectory)
        .function("changeDirectory", &FileSystem::changeDirectory);
}