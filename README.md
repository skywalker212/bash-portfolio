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
