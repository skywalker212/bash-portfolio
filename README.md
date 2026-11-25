# Bash Portfolio

A portfolio that boots its own Linux terminal in the browser.

## Run locally

Use Node.js 24 and `tar`. The first guest build downloads the pinned ARM64 packages and verifies their SHA-256 checksums. Subsequent builds reuse the files in `.cache/guest-tools/`.

```sh
npm ci
npm run dev
```

Open [the local portfolio](http://localhost:3000) and type `about` for experience and links to LinkedIn and GitHub. Zsh runs as `skywalker212` on the Linux guest `akash.is`.

The homepage connects xterm.js to the guest's PTY. The build bundles the shell startup and portfolio programs in [data/linux](data/linux) into the WASM boot image. Run `npm run build-guest` after editing those files with the dev server running. Guest networking is disabled.

## Terminal tools

- Run `duckdb` for an interactive SQL prompt or `duckdb notes.duckdb` to keep a database in your home directory. The browser downloads the CLI the first time you run it. Type `.quit` to exit.
- Run `vim notes.txt` to edit a file. Press `i` for Insert mode, `Esc` for Normal mode, `v` for Visual mode, or type `:wq` in Normal mode to save and quit. Put your Vim settings in `~/.vimrc`.
- Zsh starts with standard line editing. Run `bindkey -v` for vi-style editing, or add it to `~/.zshrc` along with any aliases and prompt settings. In vi-style editing, press `Esc` for Normal mode and `i` to resume typing. Run `sh` to open BusyBox ash.
- Open **Terminal settings** to choose a theme, font size, or default cursor shape. Vim and Zsh use a block cursor in Normal mode.
- Choose a bundled **Zsh prompt** theme or enter a custom prompt with [Zsh prompt escapes](https://zsh.sourceforge.io/Doc/Release/Prompt-Expansion.html). An idle prompt updates as you choose. During a command, the change appears when the shell prompt returns. Choose **Portfolio / .zshrc** to return to your usual prompt.
- On touch devices, tap **Open keyboard** to start typing. The key row sends **Esc**, **Tab**, and arrow keys. Tap **Ctrl**, then a character, to send a shortcut such as Ctrl+C.

Guest programs can ring the terminal bell or set the browser tab title with standard terminal control sequences.

## Browser storage

Linux mounts a 32 MiB ext4 filesystem at `/home/skywalker212`. The browser keeps the disk in its origin-private filesystem (OPFS) or in IndexedDB when OPFS is unavailable. Files, permissions, and symlinks survive reloads in the same browser profile and origin. One tab can open the saved home at a time. Clearing site data clears the home.

If both storage APIs are unavailable, the terminal marks the home as temporary. Browsers without [WebAssembly JSPI support](https://web-platform-dx.github.io/web-features-explorer/features/wasm-jspi/) show a readable portfolio with experience and contact links.

The bundled [home disk template](data/linux/home.kwsparse.gz) keeps the build independent of local disk tools. To regenerate it with e2fsprogs installed, run `node scripts/build-home-image.mjs` with `mke2fs` on your path.

## Add a guest command

Put a static Linux ARM64 executable in [data/linux/bin](data/linux/bin) and name the file after the command. A gzip-compressed executable can use a `.gz` suffix, which the build removes when it installs the program. Scripts with a shebang also work if the guest has their interpreter. The guest adds this directory to its shell path.

Use [data/linux/libexec](data/linux/libexec) for executables that a command calls by absolute path. The `catsay` wrapper uses this layout to pass text to the [upstream v2.0.0 binary](https://github.com/LiTLiTschi/catsay/releases/tag/v2.0.0). Its [license notices](data/linux/share/catsay-NOTICES) ship with the guest. The upstream Linux ARM64 release archive has SHA-256 `73ed549ba17c90ab9931c714f74f76af83e90c6bb2eafbce9dbdaef6f173e1a6`.

Run `npm run build-guest` and reload the terminal to try a new command.

## Credits

- **unkernel**, by Pooya Parsa and contributors, makes it possible to boot Linux in the browser and connect the guest's terminal to this site. [unkernel project](https://github.com/pithings/unkernel) · [Pinned source and build instructions](https://github.com/pithings/unkernel/tree/v0.2.0-261124-c08e977)
- **Linux** provides the kernel and ext4. unkernel's WebAssembly architecture builds on Joel Severin's **linux-wasm** work. [Linux](https://www.kernel.org/) · [linux-wasm](https://github.com/joelseverin/linux-wasm)
- **BusyBox** provides the Linux guest's login, `sh`, and command-line tools. unkernel bundles the static build packaged by **Alpine Linux**. [BusyBox](https://busybox.net/) · [Alpine package](https://pkgs.alpinelinux.org/package/v3.24/main/aarch64/busybox-static)
- **xterm.js** provides the browser terminal, including its Fit and Web Links add-ons. [xterm.js project](https://xtermjs.org/)
- **DuckDB** runs SQL in the guest. **Alpine Linux 3.24** provides the Vim and Zsh packages and their runtime libraries. [DuckDB release](https://github.com/duckdb/duckdb/releases/tag/v2.0.1) · [Alpine package sources](https://gitlab.alpinelinux.org/alpine/aports/-/tree/3.24-stable) · [Pinned guest packages](scripts/guest-tools.mjs)
- **catsay**, by Liu (LiTLiTschi), provides the native talking cat and includes the **Go** runtime. [catsay release](https://github.com/LiTLiTschi/catsay/releases/tag/v2.0.0) · [Go project](https://go.dev/)
- **e2fsprogs** creates the ext4 home disk template. [e2fsprogs project](https://e2fsprogs.sourceforge.net/)
- **Next.js**, **React**, and **Tailwind CSS** provide the web app and its styles. [Next.js](https://nextjs.org/) · [React](https://react.dev/) · [Tailwind CSS](https://tailwindcss.com/)

The site build includes the upstream license and copyright notices at `/third-party.txt`. [unkernel release notices](https://github.com/pithings/unkernel/releases/download/v0.2.0-261124-c08e977/THIRD-PARTY.md) · [catsay and Go notices](data/linux/share/catsay-NOTICES)
