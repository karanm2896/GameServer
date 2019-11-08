var io = require('socket.io')(process.env.PORT || 80);

io.on('connection', function (socket) {
    console.log('-------Connection made-------');
	
	
});