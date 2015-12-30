var apiUrl = "http://62.210.236.193/ups/tracking.php";
//1ZE6281F6858695605

$(function() {
	//--------- INIT -----------
	var main = $("main");
	var loadingImg = $("#loading");
	var trackingNumberInput = $("#trackingNumber");

	var languageSelector = $("#language");
	var savedLanguage = "en_US"; //Initialized in case there's nothing in localstorage
	chrome.storage.local.get("lang", function(data) {
		if (data.lang != undefined){
			savedLanguage = data.lang;
		}
		languageSelector.val(savedLanguage);
	});

	var trackingNumber = "";
	chrome.storage.local.get("trackingNumber", function(data) {
		if (data.trackingNumber != undefined) {
			trackingNumber = data.trackingNumber;
			trackingNumberInput.val(trackingNumber);
		}
	});
	
	//--------- MAIN -----------
	setTimeout(function() {
		if (trackingNumberInput.val() != "") {
			retrieveContent();
		}
	}, 500);

	//--------- LISTENERS -----------
	languageSelector.on("change", function(){
		var selectedLanguage = languageSelector.find(":selected").val();
		chrome.storage.local.set({"lang" : selectedLanguage});
		retrieveContent();
	});

	trackingNumberInput.on("input", function(){
		retrieveContent();
	});

	function retrieveContent(mode) {
		$("#loading").show();
		trackingNumber = trackingNumberInput.val();
		$.ajax({
			url: apiUrl,
			data: {trackingNumber: trackingNumber, lang: languageSelector.find(":selected").val()},
		})
		.done(function(data){
			$("#loading").hide();
			console.log(data);
			clearContents();
			if (data.statusCode === 200) {
				chrome.storage.local.set({"trackingNumber": data.trackingNumber});
				trackingNumberInput.css({"border": "solid 1px green"});
				createSteps(data);
			}
			else {
				trackingNumberInput.css({"border": "solid 1px red"});
				handleError(data);
			}
		});
	};
});

function createSteps(request) {
	var main = $("#steps");
	for (var i = 1; i < request.content.length ; i++) {
		console.log(request.content[i]);
		var s = request.content[i];
		var div = $("<div style='border: solid 1px black; padding: 10px;'><div>");
		var rowOneContent = ""
		if (s.location !== "") {
			rowOneContent += "<b>" + s.location + "</b><br/>";
		}
		rowOneContent += "<u>" + s.date + " - " + s.time + "</u>";
		div.append($("<p>" + rowOneContent + "</p>"));
		div.append($("<p>" + s.activity + "</p>"));
		main.append(div);
	};
}

function handleError(request) {
	var errorDiv = $("#error");
	errorDiv.append($("<p style='color: red; text-align: center;'><b>" + request.statusCode + " ERROR</b><p><p>" + request.message + "</p>"));
}

function clearContents() {
	$("#error").text("");
	$("#steps").text("");
}