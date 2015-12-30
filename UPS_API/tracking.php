<?php
include "simple_html_dom.php";
header('Content-type: application/json; charset=utf-8');
header('Cache-Control: no-cache');
header('Access-Control-Allow-Origin: *');

$trackingNumber = $_GET["trackingNumber"];
//1ZE6281F6858695605

$lang = $_GET["lang"];
empty($lang) ? $lang = "en_US" : $_GET["lang"];
//fr_FR, it_IT, es_ES, de_DE, etc...

$request = new stdClass();
$request->stepsNumber = -1;
$request->trackingNumber = $trackingNumber;
$request->lang = $lang;

if (!empty($trackingNumber)) {
	$baseUrl = "http://wwwapps.ups.com/WebTracking/processRequest?HTMLVersion=5.0&Requester=NES&AgreeToTermsAndConditions=yes&loc=". $lang ."&tracknum=" . $trackingNumber;
	$html = file_get_html($baseUrl);
	$request->errorCount = count($html->find(".error")) - 2;
	$progress = array();
	if ($request->errorCount <= 0) {
		foreach ($html->find('table.dataTable tbody tr') as $tr) {
			$request->stepsNumber++;
			$line = new stdClass();
			foreach ($tr->find('th, td') as $key=>$td) {
				$content = trim($td->plaintext);
				switch ($key) {
					case 0:
						$line->location = $content;
						break;
					case 1:
						$line->date = $content;
						break;
					case 2:
						$line->time = $content;
						break;
					case 3:
						$line->activity = $content;
						break;
					default:
						$line->error = $content;
						break;
				}
			}
			array_push($progress, $line);
		}
		$request->statusCode = 200;
		$request->message = "OK";
		$request->content = $progress;
	}
	else {
		$request->statusCode = 501;
		$request->message = "Unhandled error, usually a wrong tracking number.";
		$request->content = array();
	}
}
else {
	$request->statusCode = 400;
	$request->message = "Tracking number required !";
	$request->content = array();
}
echo json_encode($request);