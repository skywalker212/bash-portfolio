# Bash Portfolio

A portfolio that boots its own Linux terminal in the browser.

## Run locally

Use Node.js 24.

```sh
npm ci
npm run dev
```

Open [the local portfolio](http://localhost:3000) and type `about` for experience and links to LinkedIn and GitHub. The shell runs as `skywalker212` on the Linux guest `akash.is`.

The homepage connects xterm.js to the guest's PTY. The build bundles the shell startup and portfolio programs in [data/linux](data/linux) into the WASM boot image. Run `npm run build-guest` after editing those files with the dev server running. Guest networking is disabled.

## Browser storage

Linux mounts a 32 MiB ext4 filesystem at `/home/skywalker212`. The browser keeps the disk in its origin-private filesystem (OPFS) or in IndexedDB when OPFS is unavailable. Files, permissions, and symlinks survive reloads in the same browser profile and origin. One tab can open the saved home at a time. Clearing site data clears the home.

If both storage APIs are unavailable, the terminal marks the home as temporary. Browsers without [WebAssembly JSPI support](https://web-platform-dx.github.io/web-features-explorer/features/wasm-jspi/) show a readable portfolio with experience and contact links.

The bundled [home disk template](data/linux/home.kwsparse.gz) keeps the build independent of local disk tools. To regenerate it with e2fsprogs installed, run `node scripts/build-home-image.mjs` with `mke2fs` on your path.

The site uses [unkernel v0.2.0-261124-c08e977](https://github.com/pithings/unkernel/tree/v0.2.0-261124-c08e977) with its bundled BusyBox system. [Release notices](https://github.com/pithings/unkernel/releases/download/v0.2.0-261124-c08e977/THIRD-PARTY.md)

## Add a guest command

Put a static Linux ARM64 executable in [data/linux/bin](data/linux/bin) and name the file after the command. A gzip-compressed executable can use a `.gz` suffix, which the build removes when it installs the program. Scripts with a shebang also work if the guest has their interpreter. The guest adds this directory to its shell path.

Use [data/linux/libexec](data/linux/libexec) for executables that a command calls by absolute path. The `catsay` wrapper uses this layout to pass text to the [upstream v2.0.0 binary](https://github.com/LiTLiTschi/catsay/releases/tag/v2.0.0). Its [license notices](data/linux/share/catsay-NOTICES) ship with the guest. The upstream Linux ARM64 release archive has SHA-256 `73ed549ba17c90ab9931c714f74f76af83e90c6bb2eafbce9dbdaef6f173e1a6`.

Run `npm run build-guest` and reload the terminal to try a new command.
