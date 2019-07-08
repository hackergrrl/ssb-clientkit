const ssbClient = require('ssb-client')
const secretStack = require('secret-stack')
const ssbConfig = require('ssb-config')
const debug = require('debug')('ssb-clientkit')

export class ClientKit {
  client : any

  connectOrStart () : Promise<any> {
    return new Promise((resolve, reject) => {
      connect()
        .then(ssb => { this.client = ssb; resolve() })
        .catch(err => reject(err))
    })
  }

  close () : Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.close((err : Error) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

function connect () {
  return new Promise((resolve, reject) => {
    ssbClient((err : Error, api : any) => {
      if (!err) {
        resolve(api)
        debug('Using pre-existing Scuttlebutt server instead of starting one')
      } else {
        reject(err)
      }
    })
  })
}

function start () {
  return new Promise((resolve, reject) => {
    debug('Initial connection attempt failed')
    debug('Starting Scuttlebutt server')

    const server = secretStack()

    server
      .use(require('ssb-db'))
      .use(require('ssb-onion'))
      .use(require('ssb-unix-socket'))
      .use(require('ssb-no-auth'))
      .use(require('ssb-plugins'))
      .use(require('ssb-master'))
      .use(require('ssb-gossip'))
      .use(require('ssb-replicate'))
      .use(require('ssb-friends'))
      .use(require('ssb-blobs'))
      .use(require('ssb-invite'))
      .use(require('ssb-local'))
      .use(require('ssb-logging'))
      .use(require('ssb-query'))
      .use(require('ssb-links'))
      .use(require('ssb-ws'))
      .use(require('ssb-ebt'))
      .use(require('ssb-ooo'))
      .use(require('ssb-backlinks'))
      .use(require('ssb-about'))

    server(ssbConfig)

    // TOOD: eventually give up + reject
    let retryTimes : number = 10
    const connectOrRetry = () => {
      retryTimes--
      if (retryTimes <= 0) return reject(new Error('failed to connect to started ssb server'))

      connect().then((ssb) => {
        debug('Retrying connection to own server')
        resolve(ssb)
      }).catch((e) => {
        debug(e)
        connectOrRetry()
      })
    }
  })
}

// const db = {
//   connect: function () {
//     return handle
//   },
//   get: function (method, ...opts) {
//     return new Promise((resolve, reject) => {
//       method(...opts, (err, val) => {
//         if (err) return reject(err)
//         resolve(val)
//       })
//     })
//   },
//   read: function (method, ...args) {
//     return new Promise((resolve, reject) => {
//       resolve(method(...args))
//     })
//   }
// }
