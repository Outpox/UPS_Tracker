var apiUrl = "http://62.210.236.193/ups/tracking.php";
var trackingNumber = "1ZE6281F6858695605";
var lang = "en_US"; //Default value
var stepCount = -1;
var interval = 5 * 60 * 1000;
//var interval = 5000;



console.log("Background started " + getDateTime());
var mainLoop = newInterval(interval);

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch(request.action) {
			case "updateInterval":
				mainLoop = updateInterval(mainLoop, request.value);
				sendResponse({message: "OK"});
				break;
			case "changeLanguage":
				lang = request.value;
				sendResponse({message: "OK"});
				break;
		}
	}
);

function update() {
	console.log("update() " + getDateTime());
	var url = apiUrl + "?trackingNumber=" + trackingNumber + "&lang=" + lang;
	callAjax(url, function(json) {
		var data = JSON.parse(json);
		console.log(data);
		if (data.stepsNumber != stepCount) {
			var s = data.content[1];
			var options = {};
			options.type = "basic";
			options.title = "New status !";
			options.message =  s.location + "\n" + s.date + " - " + s.time + "\n" + s.activity;
			options.iconUrl = "icon.png";
			chrome.notifications.create('', options);
			stepCount = data.stepsNumber;
		}
	})
}

function updateInterval(loop, interval) {
	console.log("Shipment checking interval changed to: " + loop/60000 + " min");
	clearInterval(loop);
	return newInterval(interval);
}

function newInterval(interval) {
	return setInterval(update, interval);
}

function getDateTime() {
	var date = new Date();
	var n = date.toDateString();
	var time = date.toLocaleTimeString();
	return n + " " + time;
}

function callAjax(url, callback) {
	var xmlhttp;
    // compatible with IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
    	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    		callback(xmlhttp.responseText);
    	}
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}