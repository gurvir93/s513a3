let socket = io();

let chatMessage = $('#chatmsg');
let chatForm = $('#chatform');
let msgWindow = $('#messages');

let userMsgCon = document.getElementById('messages');
let msgContainer = document.getElementById('msgcontainer');


// Reference: http://stackoverflow.com/questions/24772491/auto-scroll-to-bottom-div
function scrollToBottom() {
	$(document).ready(function(){
    	$('#msgcontainer').animate({
        	scrollTop: $('#msgcontainer')[0].scrollHeight});
	});
};

function msgOutput(msgObj) {
	let userMsg = document.createElement("li");
	let userName = document.createElement("span");

	if(msgObj.userID == getCookie("id")) {
		userName.style.fontWeight = "bold";
	}
	userName.style.color = "#" + msgObj.colour;
	userMsgCon.appendChild(userMsg).appendChild(userName).textContent = msgObj.time + " " + msgObj.username + ": " + msgObj.msg;
};

function newSession(array) {
	msgWindow.empty();
	for (let i in array) {
			msgOutput(array[i]);
	}
	scrollToBottom();
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

function cookieHandler(user, currUserIdCount, usernameCount) {
	let cookie = document.cookie;
	
	if (cookie == '') {
		let currUsername = "User" + usernameCount;

		document.cookie = "id=" + currUserIdCount;
		document.cookie = "username=" + currUsername;

		console.log("Cookie created with ID: " + currUserIdCount);

		user = {
   			id: currUserIdCount,
    		name: currUsername,
    		colour: "000000",
    		status: "o"
		};
		
		socket.emit('user id used', user);		
	} else {
		console.log("Cookie value: " + document.cookie);
	}
};

chatForm.submit(function(){
	if(chatMessage.val() != '') {
		socket.emit('chat message', {id: getCookie("id"), name: getCookie("username"), msg: chatMessage.val()});
		chatMessage.val(''); 
	}
	return false;
});

socket.on('refresh session', function(data){
	newSession(data);
});

socket.on('chat message', function(data){
	console.log("Message object: " + JSON.stringify(data));
	msgOutput(data);
	scrollToBottom();
});

socket.on('cookies', function(data){
	cookieHandler(data.userObj, data.userCount, data.usernameCount);
});

socket.on('name change', function(data){
	if(data.id == getCookie("id")) {
			document.cookie = "username=" + data.nickname;
	}
});