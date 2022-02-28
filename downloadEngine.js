const fs = require('fs');
const request = require('request')
//const request_progress = require('request-progress')
const generator = require('./generator')
module.exports = {
    downloadEngine: (url, callback) => 
    {
        request.head(url, function(err, res, body){
            if(err)
            {
                return console.log(err)
            }
            let data = generator.gen(6)
            request(url).pipe(fs.createWriteStream(`${data}.png`)).on('close', function(){
                callback(data)
            });
        });
    }
};