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
      $lat_multiplier = $gps_array[3] == 'N' ? 0.01 : -0.01;
      $lat = floatval($gps_array[2]) * $lat_multiplier;
      $lng_multiplier = $gps_array[5] == 'E' ? 0.01 : -0.01;
      $lng = floatval($gps_array[4]) * $lng_multiplier;

      $lat_raw = floatval($gps_array[2]) * .01;
      $lat_readable = number_format($lat_raw, 3, ".", "");

      $lng_raw = floatval($gps_array[4]) * .01;
      $lng_readable = number_format($lat_raw, 3, ".", "");
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
        'temp' => false,
        // 'air_pressure' => false,
        'humidity' => false
      )
    ),
    'id' => $deviceID,
    'gps' => $gps_data,
  );

  foreach($messages->items as $item){
    if($item->message->appId == 'TEMP' && $device['properties']['data']['temp'] == false ){
      $device['properties']['data']['temp'] = $item->message->data;
    }
    // if($item->message->appId == 'AIR_PRESS' && $device['properties']['data']['air_pressure'] == false ){
    //   $device['properties']['data']['air_pressure'] = $item->message->data;
    // }
    if($item->message->appId == 'HUMID' && $device['properties']['data']['humidity'] == false ){
      $device['properties']['data']['humidity'] = $item->message->data;
    }
    // if($item->message->appId == 'GPS' && $device['gps'] == false ){
    //   $device['properties']['coords'] = $item->message->data;
    // }
  }
  
  return $device;
}

getDevices();
// getMessagesForDevice("nrf-352656101077413");
?>