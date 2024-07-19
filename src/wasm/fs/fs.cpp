#include <emscripten.h>
#include <stdio.h>

int main() {
    EM_ASM(FS.mount(IDBFS, {}, '/home'));
    printf("mounted");
    return 0;
}