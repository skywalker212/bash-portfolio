#include <emscripten.h>

int main() {
    EM_ASM(
        FS.mount(IDBFS, {}, '/home');
        FS.syncfs(true, function (err) {
            if (err) {
                throw err;
            }
        });
    );
    return 0;
}