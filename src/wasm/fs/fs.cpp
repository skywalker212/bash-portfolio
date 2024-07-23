#include <emscripten.h>

EMSCRIPTEN_KEEPALIVE
extern "C" {
    void setup_filesystem() {
        EM_ASM({
            const home_dir = '/home/skywalker212';
            FS.rmdir('/home/web_user');
            FS.mkdir(home_dir);
            FS.mount(IDBFS, {autoPersist: true}, home_dir);
        });
    }
}