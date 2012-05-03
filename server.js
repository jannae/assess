var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    url = require('url'),
    path = require('path');
    
    app.listen(process.env.PORT || 8001);

function handler(req, res) {
    var fpath = req.url; 
    var contentType = 'text/html';
    var ua = req.headers['user-agent'];
    var url_parts = url.parse(req.url);
    var ext = path.extname(url_parts.pathname)
    
    if(/mobile/i.test(ua)) {
        fpath = '/mob.html';
    } else if (url_parts.pathname == '/test') {
        //fpath = '/mob/mob.html';
        fpath = '/mob.html';
    } else {
        fpath = '/cnv.html';
    }
    
    switch (ext) {
        case '.js':
            fpath = url_parts.href;
            contentType = 'text/javascript';
            break;
        case '.css':
            fpath = url_parts.href;
            contentType = 'text/css';
            break;
        case '.png':
            fpath = url_parts.href;
            contentType = 'image/png';
            break;
    }
    
    fs.readFile(__dirname + fpath, function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading '+__dirname + fpath);
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

var usernames = {};

io.sockets.on('connection', function(socket) {
    console.log('connected');
    
    socket.on('mobile', function(username, data) {
        try {       
            io.sockets.emit('mobileData', username, data);
        } catch (Err) {
            console.log('skipping: ' + Err);
            return; // continue
        }
    });
    
    socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		io.sockets.emit('end', socket.username);
		// echo globally that this client has left
		socket.broadcast.emit('end', socket.username);
	});
    
    // when the client emits 'adduser', this listens and executes
    socket.on('adduser', function(username, userdata, colors){
    	// we store the username in the socket session for this client
        socket.username = username;
        socket.userdata = userdata;
		// add the client's username to the global list
		usernames[username] = username;
		io.sockets.emit('updateusers', usernames);
        io.sockets.emit('useradded', username, userdata, colors);
        
        // echo to client they've connected
	//	socket.emit('update', username, userdata);
		// echo globally (all clients) that a person has connected
	//	socket.broadcast.emit('update', username, userdata);
		// update the list of users in app, client-side
	});
    /*
    socket.on('kill', function(username){
        delete usernames[username];
        io.sockets.emit('updateusers', usernames);
        io.sockets.emit('killed', username);
    });*/

	// when the user disconnects.. perform this

});