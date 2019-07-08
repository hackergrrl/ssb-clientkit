import { ClientKit } from '../index'
let test = require('tape')

test('can connect / start server', (t : any) => {
  t.plan(2)

  let kit = new ClientKit()
  kit.connectOrStart()
    .then(() => {
      t.ok(true)
      kit.close()
        .then(() => t.ok(true))
        .catch((err: Error) => t.error(err))
    })
    .catch((err : Error) => t.error(err))
})
