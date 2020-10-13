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
    
    $deviceArray[$device->id] = getMessagesForDevice($device);

$deviceArray[$device->id]['properties']['connected'] = $device->state->reported->connected == true ? 'connected' : 'disconnected';
    // print_r(getGPSforDevice($device->id));
  }
  echo json_encode($deviceArray);
}

function getGPSforDevice($deviceID){
  $curlURL = "https://api.nrfcloud.com/v1/messages?inclusiveStart=2018-06-18T19%3A19%3A45.902Z&exclusiveEnd=3000-06-20T19%3A19%3A45.902Z&deviceIdentifiers=".$deviceID."&pageLimit=1&pageSort=desc&appId=GPS";
  $gps_message = sendCurl($curlURL);
  $gps = isset($gps_message->items[0]) && !empty($gps_message->items[0]) ? $gps_message->items[0]->message->data : null;
    // return $gps;
    // echo '<pre>';
    if($gps !== null ){
      
      $gps_array = explode(',', $gps);
      // var_dump($gps_array);

      $lat_degrees = floatval(substr($gps_array[2], (strpos($gps_array[2], '.') - 2)))/60 + floatval(substr($gps_array[2],0,(strpos($gps_array[2], '.') - 2)));
      $lat_multiplier = $gps_array[3] == 'N' ? 1 : -1;
      $lat = floatval($lat_degrees) * $lat_multiplier;
      // $lat_raw = floatval($gps_array[2]) * .01;
      $lat_readable = number_format($lat_degrees, 3, ".", "");

      $lng_degrees = floatval(substr($gps_array[4], (strpos($gps_array[4], '.') - 2)))/60 + floatval(substr($gps_array[4],0,(strpos($gps_array[4], '.') - 2)));
      $lng_multiplier = $gps_array[5] == 'E' ? 1 : -1;
      $lng = floatval($lng_degrees) * $lng_multiplier;

      // $lng_raw = floatval($gps_array[4]) * .01;
      $lng_readable = number_format($lng_degrees, 3, ".", "");
      // echo 'lng = ' . $lng;
      // echo 'lat = ' . $lat;
      $gps_readout = $lat_readable . '° ' . $gps_array[3] . ', ' . $lng_readable . '° ' . $gps_array[5];
      $coords = array(
        'lat' => $lat,
        'lng' => $lng,
        'readable' => $gps_readout
      );
      // var_dump($coords);
      return $coords;
    } else {
      $coords = array(
        'lat' => null,
        'lng' => null,
        'readable' => null
      );
    }

}


function getMessagesForDevice($device){
  $deviceID = $device->id;

  $name = isset($device->name) && !empty($device->name) ? $device->name : $device->id;

  $curlURL = "https://api.nrfcloud.com/v1/messages?inclusiveStart=2018-06-18T19%3A19%3A45.902Z&exclusiveEnd=3000-06-20T19%3A19%3A45.902Z&deviceIdentifiers=".$deviceID."&pageLimit=100&pageSort=desc";

  $messages = sendCurl($curlURL);

  $gps_data = getGPSforDevice($deviceID);
  $device = array(
    'position' => array($gps_data['lat'], $gps_data['lng']),
    'properties' => array(
      'coords' => $gps_data['readable'],
      'name' => $name,
      'data' => array(
        'Temperature' => false,
        'Humidity' => false,
      ),
      'timestamp' => array(
        'Temperature' => false,
        'Humidity' => false,
      )
    ),
    'id' => $deviceID,
    'gps' => $gps_data,
  );
  
  
  foreach($messages->items as $item){
    if($item->message->appId == 'TEMP' && $device['properties']['data']['temp'] == false ){
      $device['properties']['data']['Temperature'] = $item->message->data . '°';
      $device['properties']['timestamp']['Temperature'] = date('D M d Y G:i:s T', strtotime($item->receivedAt));
    }
    // if($item->message->appId == 'AIR_PRESS' && $device['properties']['data']['air_pressure'] == false ){
    //   $device['properties']['data']['air_pressure'] = $item->message->data;
    // }
    if($item->message->appId == 'HUMID' && $device['properties']['data']['humidity'] == false ){
      $device['properties']['data']['Humidity'] = $item->message->data . '%';
      $device['properties']['timestamp']['Humidity'] = date('D M d Y G:i:s T', strtotime($item->receivedAt));
    }
  }
  
  return $device;
}

getDevices();
// getMessagesForDevice("nrf-352656101077413");
?>