# Bash Portfolio

A Next.js portfolio with a terminal backed by Linux running in the browser.

## Run locally

Use Node.js 24 and a browser with WebAssembly JSPI support.

```sh
npm ci
npm run dev
```

Open [the local portfolio](http://localhost:3000) and type `help`. Commands such as `projects`, `skills`, and `whoami` run from shell scripts in `data/commands`. Linux handles files and directories in a fresh guest on each page load.

The site uses [unkernel v0.2.0-261124-c08e977](https://github.com/pithings/unkernel/tree/v0.2.0-261124-c08e977) with its bundled BusyBox system. [Release notices](https://github.com/pithings/unkernel/releases/download/v0.2.0-261124-c08e977/THIRD-PARTY.md)
