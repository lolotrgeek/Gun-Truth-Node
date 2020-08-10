; (function () {
    const cluster = require('cluster')
    const fs = require('fs')
    const Gun = require('gun')
    const _ = require('lodash')

    const config = {
        port: process.env.PORT || 8765,
        host: 'localhost'
    };

    if (cluster.isMaster) {
        return cluster.fork() && cluster.on('exit', function () { cluster.fork() })
    }

    const trimSoul = data => {
        if (!data || !data['_'] || typeof data['_'] !== 'object') return data
        delete data['_']
        return data
    }

    /**
     * checks for object or array, recurse until completely flattened
     * @param {*} value 
     */
    function getValue(value) {
        if (!value) return false
        else if (typeof value === 'object') {
            return _.flatMapDeep(value, item => getValue(item))
        }
        else return true
    }

    function isNull(value) {
        let tests = getValue(value)
        console.log(tests)
        let result = tests.some(value => value === false) // true if NULL found
        console.log('isNull: ', result)
        return result
    }

    // Incoming listener
    Gun.on('opt', function (context) {
        if (context.once) {
            return
        }
        // Pass to subsequent opt handlers
        this.to.next(context)
        console.log(context)
        // Check all incoming traffic
        context.on('in', function (msg) {
            var to = this.to
            // restrict null puts
            if (msg.put) {
                if (isNull(msg.put)) {
                    // console.log('invalid', msg.put)
                }
                else {
                    // console.log('valid', msg.put)
                    to.next(msg)
                }
            } else {
                to.next(msg)
            }
        })
    })

    if (process.env.HTTPS_KEY) {
        config.key = fs.readFileSync(process.env.HTTPS_KEY)
        config.cert = fs.readFileSync(process.env.HTTPS_CERT)
        config.server = require('https').createServer(config, Gun.serve(__dirname))
    } else {
        config.server = require('http').createServer(Gun.serve(__dirname))
    }

    console.log('GUN config ', config)
    const gun = Gun({
        web: config.server,
    })

    gun.on('out', { get: { '#': { '*': '' } } })

    config.server.listen(config.port, config.host)
    console.log('Truth peer started on port ' + config.port + ' with /gun')

}());