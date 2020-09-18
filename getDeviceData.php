<?php
function sendCurl($url){
  $curl = curl_init();

  curl_setopt_array($curl, array(
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "GET",
    CURLOPT_HTTPHEADER => array(
      "Accept: application/json",
      "Accept-Encoding: gzip, deflate",
      "Authorization: Bearer 63798b60090e62e4514012c80eb435ccd758b76d",
      "Cache-Control: no-cache",
      "Connection: keep-alive",
      "Host: api.nrfcloud.com",
      "cache-control: no-cache"
    ),
  ));

  $response = curl_exec($curl);
  $err = curl_error($curl);

  curl_close($curl);

  if ($err) {
    $result = "cURL Error #:" . $err;
  } else {
    $result = json_decode($response);
  }
  return $result;
}

function getDevices(){
  $devices = sendCurl("https://api.nrfcloud.com/v1/devices?includeState=true&includeStateMeta=true&pageLimit=100&pageSort=desc");
  // print_r($devices);
  $deviceArray = array();
  foreach ($devices->items as  $device) {
    $deviceArray[$device->id] = getMessagesForDevice($device->id);
  }
  echo json_encode($deviceArray);
}


function getMessagesForDevice($deviceID){
  $curlURL = "https://api.nrfcloud.com/v1/messages?inclusiveStart=2018-06-18T19%3A19%3A45.902Z&exclusiveEnd=3000-06-20T19%3A19%3A45.902Z&deviceIdentifiers=".$deviceID."&pageLimit=100&pageSort=desc";
  $messages = sendCurl($curlURL);

  $device = array(
    'id' => $deviceID,
    'temp' => false,
    'air_pressure' => false,
    'humidity' => false
  );
  foreach($messages->items as $item){
    if($item->message->appId == 'TEMP' && $device['temp'] == false ){
      $device['temp'] = $item->message->data;
    }
    if($item->message->appId == 'AIR_PRESS' && $device['air_pressure'] == false ){
      $device['air_pressure'] = $item->message->data;
    }
    if($item->message->appId == 'HUMID' && $device['humidity'] == false ){
      $device['humidity'] = $item->message->data;
    }
  }
  return $device;
}

getDevices();
// getMessagesForDevice("nrf-352656101077413");
?>