#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
extern "C" {
    void setup_filesystem() {
        EM_ASM({
            const home_dir = '/home/skywalker212';
            FS.rmdir('/home/web_user');
            FS.mkdir(home_dir);
            FS.symlink('/bin/projects', `${home_dir}/projects`);
            FS.symlink('/bin/skills', `${home_dir}/skills`);
            FS.chdir(home_dir);
        });
    }
}