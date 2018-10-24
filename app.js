const https = require('https')
const fs = require('fs')

const pictureUrl =
    'https://lh3.googleusercontent.com/tHmbbXLQu3uToWdYBsbnwvYgs-6sWhAWmL6gcWr6aEW8sdDMYIVS4eJxBBpyyDeiCwmfGFA3whXVeQ='

function findMax(coord, buildUrl, cb) {
    let url = buildUrl(coord)
    let request = https.get(url, response => {
        if (response.statusCode === 200) {
            findMax(++coord, buildUrl, cb)
        } else {
            cb(null, --coord)
        }
    })
    request.on('error', cb)
}

function findMaxCoordinates(cb) {
    let buildUrlZ = z => pictureUrl + 'x0-y0-z' + z
    let buildUrlX = x => pictureUrl + 'x' + x + '-y0-z' + z
    let buildUrlY = y => pictureUrl + 'x0-y' + y + '-z' + z

    findMax(0, buildUrlZ, (err, z) => {
        if (err) return cb(err)
        findMax(0, buildUrlX, (err, x) => {
            if (err) return cb(err)
            findMax(0, buildUrlY, (err, y) => {
                if (err) return cb(err)
                cb(null, { x, y, z })
            })
        })
    })
}

function download(fileName, fileUrl, cb) {
    https.get(fileUrl, response => {
        if (response.statusCode !== 200) {
            return cb(new Error('Invalid status code: ' + response.statusCode))
        }
        response
            .pipe(fs.createWriteStream(fileName))
            .on('error', cb)
            .on('finish', cb)
    })
}

findMaxCoordinates(async (err, coords) => {
    if (err) console.log(err)
    console.log('Downloading with coordinates: ' + JSON.stringify(coords))

    for (let x = 0; x <= coords.x; x++) {
        for (let y = 0; y <= coords.y; y++) {
            let fragmentId = 'x' + x + '-y' + y + '-z' + coords.z
            let url = pictureUrl + fragmentId
            let file = 'picture/' + fragmentId + '.jpeg'
            try {
                await new Promise((resolve, reject) => {
                    download(file, url, err => {
                        if (err) reject(err)
                        else resolve()
                    })
                })
                console.log('Downloaded ' + url + ' into ' + file)
            } catch (err) {
                console.error(err)
                process.exit(1)
            }
        }
    }
})
