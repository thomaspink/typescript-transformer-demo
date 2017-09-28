# StahlstadtJS Typescript transformer demo

## Prerequisite
1. Make sure [node.js](https://nodejs.org) is installed (version >= 8 as a lot of ESNEXT features have been used in our compiler/transformer)
2. Run `npm install` to install all dependencies and initally compile the tooling (eg. the transformer)

## Compiler
You can find the compiler code in the `tools` folder. As it is itself written in typescript we need to compile it to javascript before usage. 
But no worries, there is a npm script for that `npm run build-tools` and we will do it automatically before you run the build step (don't do that in a real project ;) )

## Building
To build the main typescript source run the npm script `npm run build`

## Have fun
For feedback, errors, problems, ... file me an [issue](https://github.com/thomaspink/typescript-transformer-demo/issues), 
a [pull request](https://github.com/thomaspink/typescript-transformer-demo/pulls) or contact me on twitter: [@thpnk](https://twitter.com/thpnk)