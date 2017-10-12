# webpack-virtual-module-rebuild

This repo shows how virtual modules are always rebuilt in webpack watch mode.

Some webpack setups use a file system decorator to create files in memory. This is the case
for Angular apps in AOT mode.

Webpack will rebuild all files that are not disk, even though they may be in the in-memory file
system and have not changed from the previous build.
If there is a file on disk with the same name, that file is not rebuilt.

A way to identify which files are being rebuild is to log `readFile` calls in the file system
decorator. 
CPU profiles on rebuilds show that modules read, parsed and built, during `NormalModule.build()`.

This is problematic in apps with a lot of virtual files because they will all be rebuilt on every
file change, slowing down rebuilds.

On Angular.io a rebuild with no virtual files takes ~500ms whereas a rebuild with a lot of
virtual files takes around ~2700ms. 
CPU profiles show that part of the time difference is due to all virtual files being rebuilt.

## Running the repro

To demonstrate this, this repro has a simple app that prints the default export of three modules:
- `./src/real-module.js` is only on disk
- `./src/virtual-module.js` is only in memory.
- `./src/virtual-module-with-dummy.js` is both on disk (without content) and in-memory.

There is a virtual file system in `./virtual-files-plugin.js` that logs `stat` and `readFile` calls
to files in `./src/`, and allows adding virtual files.

- `npm install`
- `npm run serve`
- `touch src/real-module.js`

Each time that the app is rebuilt, `./src/virtual-modules.js` is re-read (and rebuilt), but 
`./src/virtual-module-with-dummy.js` is not.

```
webpack: Compiling...
## readFile D:\sandbox\webpack-virtual-module-rebuild\src\real-module.js
## readFile D:\sandbox\webpack-virtual-module-rebuild\src\virtual-module.js
```

Exit the server (`CTRL+C`), delete `./src/virtual-module-with-dummy.js` and repeat the steps.
Now `./src/virtual-module-with-dummy.js` will also be re-read on every rebuild.

```
webpack: Compiling...
## readFile D:\sandbox\webpack-virtual-module-rebuild\src\real-module.js
## readFile D:\sandbox\webpack-virtual-module-rebuild\src\virtual-module.js
## readFile D:\sandbox\webpack-virtual-module-rebuild\src\virtual-module-with-dummy.js
```

