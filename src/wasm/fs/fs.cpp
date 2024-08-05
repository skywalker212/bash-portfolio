#include <emscripten.h>
#include <emscripten/bind.h>
#include <string>
#include <vector>
#include <filesystem>
#include <fstream>
#include <stdexcept>
#include <ctime>
#include <sys/stat.h>
#include <pwd.h>
#include <grp.h>
#include <algorithm>
#include <iostream>

struct FileInfo
{
    std::string name;
    std::string permissions;
    std::string owner;
    std::string group;
    int size;
    std::string modTime;
    bool isDirectory;
};

class FileSystem
{
private:
    std::string home_dir;
    emscripten::val callbacks;

    std::string getPermissionsString(mode_t mode)
    {
        std::string perms;
        perms += (S_ISDIR(mode)) ? 'd' : '-';
        perms += (mode & S_IRUSR) ? 'r' : '-';
        perms += (mode & S_IWUSR) ? 'w' : '-';
        perms += (mode & S_IXUSR) ? 'x' : '-';
        perms += (mode & S_IRGRP) ? 'r' : '-';
        perms += (mode & S_IWGRP) ? 'w' : '-';
        perms += (mode & S_IXGRP) ? 'x' : '-';
        perms += (mode & S_IROTH) ? 'r' : '-';
        perms += (mode & S_IWOTH) ? 'w' : '-';
        perms += (mode & S_IXOTH) ? 'x' : '-';
        return perms;
    }

    std::string getOwnerName(uid_t uid)
    {
        struct passwd *pw = getpwuid(uid);
        return pw ? pw->pw_name : std::to_string(uid);
    }

    std::string getGroupName(gid_t gid)
    {
        struct group *gr = getgrgid(gid);
        return gr ? gr->gr_name : std::to_string(gid);
    }

    std::string getModificationTime(time_t mtime)
    {
        char buffer[20];
        struct tm *timeinfo = localtime(&mtime);
        strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", timeinfo);
        return std::string(buffer);
    }

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

    std::vector<FileInfo> getDetailedDirectoryListing(const std::string &path, bool showHidden)
    {
        std::vector<FileInfo> files;
        for (const auto &entry : std::filesystem::directory_iterator(path))
        {
            const auto &filename = entry.path().filename().string();
            if (filename[0] == '.' && !showHidden)
                continue;

            struct stat st;
            if (stat(entry.path().c_str(), &st) == 0)
            {
                FileInfo info;
                info.name = filename;
                info.permissions = getPermissionsString(st.st_mode);
                info.owner = getOwnerName(st.st_uid);
                info.group = getGroupName(st.st_gid);
                info.size = st.st_size;
                info.modTime = getModificationTime(st.st_mtime);
                info.isDirectory = S_ISDIR(st.st_mode);
                files.push_back(info);
            }
        }
        return files;
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
    emscripten::value_object<FileInfo>("FileInfo")
        .field("name", &FileInfo::name)
        .field("permissions", &FileInfo::permissions)
        .field("owner", &FileInfo::owner)
        .field("group", &FileInfo::group)
        .field("size", &FileInfo::size)
        .field("modTime", &FileInfo::modTime)
        .field("isDirectory", &FileInfo::isDirectory);

    emscripten::register_vector<FileInfo>("FileInfoVector");

    emscripten::class_<FileSystem>("FileSystem")
        .constructor<std::string, emscripten::val>()
        .function("writeFile", &FileSystem::writeFile)
        .function("readFile", &FileSystem::readFile)
        .function("cwd", &FileSystem::cwd)
        .function("getDetailedDirectoryListing", &FileSystem::getDetailedDirectoryListing)
        .function("unlink", &FileSystem::unlink)
        .function("makeDirectory", &FileSystem::makeDirectory)
        .function("changeDirectory", &FileSystem::changeDirectory);
}