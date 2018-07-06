# k-deploy

This repository is used to rebase `master` from a given repository to `deploy`.
So CI trigger a deployment.

This server use a memory FS, so the I/O are quick.
This server use `isomorphic-git` so you don't need to have git installed.

A docker image is avalaible to the name `alakarte/k-deploy`

## API

`POST /` - Deploy
```js
{
    token,
    username,
    url, // repo url
}
```
