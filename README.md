# Bash Portfolio

A portfolio that boots its own Linux terminal in the browser.

## Run locally

Use Node.js 24 and a browser with WebAssembly JSPI support.

```sh
npm ci
npm run dev
```

Open [the local portfolio](http://localhost:3000) and type `about` for experience and links to LinkedIn and GitHub. The shell runs as `skywalker212` on the Linux guest `akash.is`.

The homepage connects xterm.js to the guest's PTY. Guest setup, shell startup, and portfolio programs live in [data/linux](data/linux). Each session starts with a fresh filesystem and guest networking disabled.

The site uses [unkernel v0.2.0-261124-c08e977](https://github.com/pithings/unkernel/tree/v0.2.0-261124-c08e977) with its bundled BusyBox system. [Release notices](https://github.com/pithings/unkernel/releases/download/v0.2.0-261124-c08e977/THIRD-PARTY.md)
