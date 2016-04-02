# Supertiny redux-like, react-like app library TRY IT! (http://vojtatranta.github.io/supertiny-app-lib/)[http://vojtatranta.github.io/supertiny-app-lib/]

I was terryfied by size of all Todo apps.

So I build tiny "framework" to understand how Redux and React work.

I came up with this **experimental** library, that has practically all the features that has React with Redux.

Everything in package that is just **6.4kB**!

## Features
* Server-side rendering
* Simple event-binding
* Single store reducers-driven
* React-like DOM creation

## Disclaimer
This is not production app, I just wanted to understand how React and Redux work and how difficult it is to implement them.

## Things this can't do
* Escaping strings (easy to add)
* Delegating events
* DOM diffing
* Updates without whole rerender

## Requirements
* Node.js@5.0 or higher (you can use Nave to run higher version of Node on your system)

## Installation
Download this repo and run:
```
$ npm i
$ npm run build
$ npm run prod

```

Then visit localhost:3333

## Known issues
You may get errors when compiling sass. That is because of your libsass on your machine was compiled by older version of node.

Run:
```
$ npm rebuild
```

To rebuild binaries for current version of node (should be 5.0)

## Thanks
I would like to thank authors of Redux. The simplicity of this library is incredible, I adore you all!

And of course I thank to React guys for changing the world of development.
