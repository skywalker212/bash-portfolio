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
#include <system_error>

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

class FileSystemException : public std::runtime_error
{
public:
    FileSystemException(const std::string &message) : std::runtime_error(message) {}
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
            throw FileSystemException("Unable to set up the file system. Please try again or contact me@akash.is");
        }
    }

    void writeFile(const std::string &path, const std::string &data)
    {
        try
        {
            std::ofstream file(path, std::ios::app);
            if (!file)
            {
                if (!std::filesystem::exists(path))
                {
                    throw FileSystemException("The file does not exist. Please check the file path and try again.");
                }
                throw FileSystemException("Cannot open the file for writing. Please check if you have the necessary permissions.");
            }
            file << data;
            if (!file)
            {
                throw FileSystemException("An error occurred while writing to the file.");
            }
        }
        catch (const std::ios_base::failure &e)
        {
            throw FileSystemException("Unable to write to the file. Please ensure you have enough disk space and try again.");
        }
    }

    std::string readFile(const std::string &path)
    {
        try
        {
            if (!std::filesystem::exists(path))
            {
                throw FileSystemException("The file does not exist. Please check the file path and try again.");
            }
            if (!std::filesystem::is_regular_file(path))
            {
                throw FileSystemException("The specified path is not a regular file. Please provide a valid file path.");
            }
            std::ifstream file(path);
            if (!file)
            {
                throw FileSystemException("Cannot open the file for reading. Please check if you have the necessary permissions.");
            }
            return std::string((std::istreambuf_iterator<char>(file)),
                               std::istreambuf_iterator<char>());
        }
        catch (const std::ios_base::failure &e)
        {
            throw FileSystemException("An error occurred while reading the file.");
        }
    }

    std::string cwd()
    {
        try
        {
            return std::filesystem::current_path().string();
        }
        catch (const std::filesystem::filesystem_error &e)
        {
            throw FileSystemException("Unable to determine the current working directory.");
        }
    }

    std::vector<FileInfo> getDetailedDirectoryListing(const std::string &path, bool showHidden)
    {
        try
        {
            if (!std::filesystem::exists(path))
            {
                throw FileSystemException("The specified directory does not exist. Please check the path and try again.");
            }
            if (!std::filesystem::is_directory(path))
            {
                throw FileSystemException("The specified path is not a directory. Please provide a valid directory path.");
            }

            std::vector<FileInfo> files;
            for (const auto &entry : std::filesystem::directory_iterator(path))
            {
                const auto &filename = entry.path().filename().string();
                if (filename[0] == '.' && !showHidden)
                    continue;

                struct stat st;
                if (stat(entry.path().c_str(), &st) != 0)
                {
                    throw FileSystemException("Error getting file info for: " + entry.path().string());
                }

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
            return files;
        }
        catch (const std::filesystem::filesystem_error &e)
        {
            throw FileSystemException("Unable to list the contents of the directory. Please check if you have the necessary permissions.");
        }
    }

    bool unlink(const std::string &path)
    {
        try
        {
            if (!std::filesystem::exists(path))
            {
                throw FileSystemException("The file or directory does not exist. Please check the path and try again.");
            }
            return std::filesystem::remove(path);
        }
        catch (const std::filesystem::filesystem_error &e)
        {
            throw FileSystemException("Unable to delete the file or directory. Please check if you have the necessary permissions.");
        }
    }

    bool makeDirectory(const std::string &name)
    {
        try
        {
            return std::filesystem::create_directory(name);
        }
        catch (const std::filesystem::filesystem_error &e)
        {
            throw FileSystemException("Unable to create the directory. Please check if you have the necessary permissions or if a file with the same name already exists.");
        }
    }

    bool changeDirectory(const std::string &path)
    {
        try
        {
            if (!std::filesystem::exists(path))
            {
                throw FileSystemException("The specified directory does not exist. Please check the path and try again.");
            }
            if (!std::filesystem::is_directory(path))
            {
                throw FileSystemException("The specified path is not a directory. Please provide a valid directory path.");
            }
            std::filesystem::current_path(path);
            if (callbacks["onChangeDirectory"].as<bool>())
            {
                callbacks["onChangeDirectory"](cwd());
            }
            return true;
        }
        catch (const std::filesystem::filesystem_error &e)
        {
            throw FileSystemException("Unable to change the directory. Please check if you have the necessary permissions.");
        }
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