require('./fix');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const pkg = require('../package.json')
const appConfig = require('../project.dgz.json')

const url = `https://share.dagouzhi.com/#/pages/index/index?data=${encodeURIComponent(JSON.stringify(appConfig))}`
QRCode.toFile(path.join(__dirname, '../qrcode.png'), url, {
    margin: 1,
    width: 256,
    color: {
        dark: '#000000FF',
        light: '#FFFFFFFF'
    }
}, function (err) {
    if (err) throw err;
    console.log('QR code saved!');
});