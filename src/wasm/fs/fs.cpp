#include <emscripten.h>

int main() {
    EM_ASM(FS.mount(IDBFS, {}, '/home'));
    return 0;
}