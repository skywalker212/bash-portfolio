#include <emscripten.h>

int main()
{
    EM_ASM(
        FS.mount(IDBFS, {
#ifdef IDBFS_AUTO_PERSIST
            autoPersist : true
#endif
        },
                 '/home');

        FS.syncfs(true, function(err) { assert(!err); }););

    return 0;
}