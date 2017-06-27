/**
 * Created by root on 17-4-1.
 */
const gm = require('gm')

gm('1.png').resize(20).write('1r.png',function (err) {
    err && console.log(err)
})