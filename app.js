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
};

io.on('connection', function(socket){
	// New user
	io.emit('refresh session', msgArray);

	// Emit cookie check
	io.emit('cookies', {userObj: user, userCount: currUserIdCount});

	// Send message
    socket.on('chat message', function(data){    	
    	if (data.msg.startsWith("/nickcolor")) {
    		changeColour(data.id, data.msg.split(" ")[1]);
    		io.emit('refresh session', msgArray);
    	} else if (data.msg.startsWith("/nick")) {
    		changeNickname(data.id, data.msg.split(" ")[1]);
    	} else {
			let currColour = findColour(data.id);

			// Time stuff taken from: http://stackoverflow.com/questions/18229022/how-to-show-current-time-in-javascript-in-the-format-hhmmss
			let time = new Date();
			let currTime = ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2);

			console.log(currTime);
			let msgObj = {
				userID: data.id,
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
    });
});

server.listen(3000, function(){
	console.log('listening on *:3000');
});