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

let userCounter = 1;

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
		if (msgArray[i].userID == userID) {
			msgArray[i].colour = value;
		}
	}
};

function changeNickname(userID, value) {
	for (let i = 0; i < userArray.length; i++) {
		if (userArray[i].id == userID) {
			userArray[i].name = value;
			break;
		}
	}
	for (let i = 0; i < msgArray.length; i++) {
		if (msgArray[i].userID == userID) {
			msgArray[i].username = value;
		}
	}
};

io.on('connection', function(socket){
	// New user
	console.log("User Connected.");

	// Emit cookie check
	io.emit('cookies', {userObj: user, userCount: currUserIdCount, usernameCount: userCounter});
	userCounter++;

	io.emit('refresh session', {userA: userArray, msgA: msgArray});

	
	// Send message
    socket.on('chat message', function(data){    	
    	if (data.msg.startsWith("/nickcolor")) {
    		changeColour(data.id, data.msg.split(" ")[1]);
    		io.emit('refresh session', {userA: userArray, msgA: msgArray});
    	} 
    	else if (data.msg.startsWith("/nick")) {
    		let nick = data.msg.split(" ")[1];
    		changeNickname(data.id, nick);
    		io.emit('name change', {id: data.id, nickname: nick});
    		io.emit('refresh session', {userA: userArray, msgA: msgArray});
    	} 
    	else {
			let currColour = findColour(data.id);

			// Time stuff taken from: http://stackoverflow.com/questions/18229022/how-to-show-current-time-in-javascript-in-the-format-hhmmss
			let time = new Date();
			let currTime = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2);

			let msgObj = {
				userID: data.id,
				username: data.name,
				time: currTime,
				msg: data.msg,
				colour: currColour
			};
			msgArray.push(msgObj);

        	io.emit('chat message', msgObj);
    	}
    });

    socket.on('user id used', function(data) {
    	currUserIdCount++;
    	userArray.push(data);
    	console.log("User array: " + JSON.stringify(userArray));
    	io.emit('refresh session', {userA: userArray, msgA: msgArray});
    });

    socket.on('disconnect', function(data){
    	console.log("User Disconnected.");
    	io.emit("user disconnected", userArray);
    });

    socket.on('user disconnected', function(data) {
    	console.log("Disconnected ID: " + data);
    	for(let i = 0; i < userArray.length; i++) {
    		if (userArray[i].id === data) {
    			userArray[i].status = 'd';
    		}
    	}

    });
});

server.listen(3000, function(){
	console.log('listening on *:3000');
});