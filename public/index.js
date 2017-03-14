let socket = io();

let chatMessage = $('#chatmsg');
let chatForm = $('#chatform');
let msgWindow = $('#messages');

let userMsgCon = document.getElementById('messages');

function msgOutput(msgObj) {
	let userMsg = document.createElement("li");
	let userName = document.createElement("span");

	userName.style.color = "#" + msgObj.colour;
	userMsgCon.appendChild(userMsg).appendChild(userName).textContent = msgObj.msg;
};

function newSession(array) {
	msgWindow.empty();
	for (let i in array) {
			msgOutput(array[i]);
	}
};

// Taken from https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function cookieHandler(user, currUserIdCount) {
	let cookie = document.cookie;
	
	if (cookie == '') {
		document.cookie = "id=" + currUserIdCount;
		console.log("Cookie created with ID: " + currUserIdCount);
		user.id = currUserIdCount;
		user.status = "o";
		user.colour = "000000"
		
		socket.emit('user id used', user);		
	} else {
		let userID = getCookie("id");
		console.log("Cookie value: " + document.cookie);
		console.log("User ID: " + userID);
	}
};

chatForm.submit(function(){
	if(chatMessage.val() != '') {
		socket.emit('chat message', {id: getCookie("id"), msg: chatMessage.val()});
		chatMessage.val(''); 
	}
	return false;
});

socket.on('new user', function(data){
	newSession(data);
});

socket.on('chat message', function(data){
	msgOutput(data);
});

socket.on('cookies', function(data){
	cookieHandler(data.userObj, data.userCount);
});