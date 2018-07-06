const { Volume } = require('memfs')
const git = require('isomorphic-git')
const Koa = require('koa')
const bodyParser = require('koa-body')

const PORT = process.env.PORT || 3000

const app = new Koa()

app.use(bodyParser({ urlencoded: true }))

app.use(async (ctx) => {
  if (ctx.method !== 'POST' || ctx.method !== 'PUT') return

  const {
    token,
    username,
    url,
  } = ctx.request.body

  try {
    // create a new filesystem
    const fs = new Volume

    // create new local repo
    let repo = { fs, dir: '/repo', token, username, url, ref: 'master' }

    // get master
    await git.clone({
      ...repo,
      singleBranch: true,
    })

    // create a new deploy branch on top of it
    repo = { ...repo, ref: 'deploy' }
    await git.branch(repo)

    // push (this is a force push !)
    const push = await git.push(repo)

    // response (ok)
    ctx.status = 200
  } catch (e) {
    console.error(e)

    // response (ko)
    ctx.status = 500
    ctx.body = { errors: [{ code: 'deploy-error', payload: 'there is an error, please see server log' }] }
  }
})

const server = app.listen(PORT, () => {
  console.log(`Listening to ${PORT}`)
})

const interrupt = sigName => () => {
  console.info(`caught interrupt signal -${sigName}-`)

  console.info('closing HTTP socket...')
  server.close(() => {
    process.exit(0)
  })
}

['SIGUSR1', 'SIGINT', 'SIGTERM', 'SIGPIPE', 'SIGHUP', 'SIGBREAK', 'SIGWINCH'].forEach((sigName) => {
  process.on(sigName, interrupt(sigName))
})
