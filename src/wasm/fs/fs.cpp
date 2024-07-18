#include <emscripten.h>

int main() {
    EM_ASM(FS.mount(IDBFS, {autoPersist: true}, '/home'));
    return 0;
}