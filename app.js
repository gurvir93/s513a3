let express = require('express');
//let bodyParser = require('body-parser')
let path = require('path');

let app = express();
let server = require('http').createServer(app);
let socket = require('socket.io');
socket.listen(server)
server.listen(process.env.PORT || 3000);

let io = socket();
io.attach(server);

let user = {
    id: "",
    name: "",
    colour: "",
    status: ""
};

let msgObj = {
	userId: "",
	time: "",
	msg: "",
	colour: ""
};

let msgArray = [];
let userArray = [];
let currUserIdCount = 0;

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

function findColour(userID) {
	for (let i = 0; i < userArray.length; i++) {
		if (userArray[i].id == userID) {
			return userArray[i].colour;
		}
	}
	return "000000";
};

function changeColour(userID, value) {
	for (let i = 0; i < userArray.length; i++) {
		if (userArray[i].id == userID) {
			userArray[i].colour = value;
			break;
		}
	}
	for (let i = 0; i < msgArray.length; i++) {

	}
};

function changeNickname(userID, value) {
	for (let i = 0; i < userArray.length; i++) {
		if (userArray[i].id == userID) {
			userArray[i].name = value;
			break;
		}
	}
};

io.on('connection', function(socket){
	io.emit('new user', msgArray);
	io.emit('cookies', {userObj: user, userCount: currUserIdCount});

	// Send message
    socket.on('chat message', function(data){    	
    	if (data.msg.startsWith("/nickcolor")) {
    		changeColour(data.id, data.msg.split(" ")[1])
    	} else if (data.msg.startsWith("/nick")) {
    		changeNickname(data.id, data.msg.split(" ")[1]);
    	} else {
			let currColour = findColour(data.id);
			msgArray.push({msg: data.msg, colour: currColour});
        	io.emit('chat message', {msg: data.msg, colour: currColour});
    	}

    	
    });

    socket.on('user id used', function(data) {
    	currUserIdCount++;
    	userArray.push(data);
    	console.log("User array: " + JSON.stringify(userArray));
    });
});

server.listen(3000, function(){
	console.log('listening on *:3000');
});