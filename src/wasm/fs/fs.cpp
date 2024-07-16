#include <emscripten.h>
#include <stdio.h>
#include <dirent.h>
#include <sys/stat.h>
#include <unistd.h>
#include <string.h>

extern "C"
{
    EMSCRIPTEN_KEEPALIVE
    int change_directory(const char *path)
    {
        return chdir(path);
    }

    EMSCRIPTEN_KEEPALIVE
    int make_directory(const char *path)
    {
        return mkdir(path, 0777);
    }

    EMSCRIPTEN_KEEPALIVE
    char *list_directory(const char *path)
    {
        DIR *dir;
        struct dirent *ent;
        char *result = NULL;
        size_t result_len = 0;

        dir = opendir(path);
        if (dir != NULL)
        {
            while ((ent = readdir(dir)) != NULL)
            {
                size_t name_len = strlen(ent->d_name);
                result = (char *)realloc(result, result_len + name_len + 2);
                strcpy(result + result_len, ent->d_name);
                result_len += name_len;
                result[result_len++] = '\n';
                result[result_len] = '\0';
            }
            closedir(dir);
        }

        return result ? result : strdup("");
    }

    EMSCRIPTEN_KEEPALIVE
    char *current_directory()
    {
        char *cwd = getcwd(NULL, 0);
        if (cwd == NULL)
        {
            return strdup("");
        }
        return cwd;
    }
}