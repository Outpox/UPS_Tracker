$(function() {
	var timeIntervalSelect = $("#timeInterval");
	var languageSelect = $("#language");
	//var timeInterval = 

	chrome.storage.sync.get("timeInterval", function(data){
		if (data.updateInterval !== undefined) {
			timeIntervalSelect.val(data.updateInterval);
		}
	});

	chrome.storage.sync.get("language", function(data) {
		if (data.language !== undefined) {
			languageSelect.val(data.language);
		}
	});

	timeIntervalSelect.on("change", function(){
		chrome.runtime.sendMessage({action: "updateInterval", value: timeIntervalSelect.find(":selected").val()}, function(response) {
			if (response.message === "OK") {
				chrome.storage.sync.set({"timeInterval": timeIntervalSelect.find(":selected").val()});
			}
		});
	});

	languageSelect.on("change", function() {
		chrome.runtime.sendMessage({action: "changeLanguage", value: languageSelect.find(":selected").val()}, function(response) {
			if (response.message === "OK") {
				chrome.storage.sync.set({"language": languageSelect.find(":selected").val()});
			}
		});
	});
});