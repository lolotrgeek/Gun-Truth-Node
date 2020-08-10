const Gun = require('gun')
const gun = new Gun({ peers: ['http://localhost/gun'] })
// test valid value
gun.get('tests').put('valid!')

// test null value
gun.get('tests').put(null)

// test undefined value
gun.get('tests').put(undefined)



gun.get('test').on((data, key) => {
    console.log(data)
})