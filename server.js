var http        = require('http');
var fs          = require('fs');
var io          = require('socket.io');
var sanitizer   = require('sanitizer');

var config;
eval(fs.readFileSync('config.js','utf8'));

function readClientHTML() {
    return fs.readFileSync('client.html', 'utf8');
}

clientHTML = readClientHTML();

fs.watchFile('client.html', function(current, previous) {
    clientHTML = readClientHTML();
});


var server = http.createServer(function(req, res) {
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write(clientHTML);
    res.end();
});

server.listen(config.port);
console.log("Listening on port " + config.port);
