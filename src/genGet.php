<?php
header("Access-Control-Allow-Origin: *");	

$fp = fopen("GET_REST.txt", "w+");
$handle = connectToDataBase();
getWithSelString($handle, $fp);
function getWithSelString($handle, $fp){
    if (!isset($_GET['selStr']))
        $_GET['selStr'] = "SELECT top(3) * from physicists";
    fwrite($fp, "selStr is ". $_GET['selStr']) ;   
    $res = sqlsrv_query($handle, $_GET['selStr']);
    $i = 0;
    while ($row = sqlsrv_fetch_array($res)){
        $ret[$i++] = $row;
    }
    echo json_encode($ret);
  }

/***** Connect to either the Blackboard or the 242 Database, and return handle.  */
function connectToDataBase(){
    global $debug, $fp;
    if ($debug) print_r($_SERVER['SCRIPT_NAME']);
    // 'Users'-> running locally in debugger, 'dev' -> BlackBoard. 
    if (strpos($_SERVER['SCRIPT_NAME'], 'Users') !== FALSE || strpos($_SERVER['SCRIPT_NAME'], 'dev') !== FALSE ){
      $offSet = 0;                                                // set for BlackBoard dataBase
    }else{
      $offSet = 4;                                                 // set for WhiteBoard dataBase
    }
   // if ($param >= 0)                                              // Set which data
    //  $offSet = $param;
    fwrite($fp, "\r\n offset is $offSet");
    //$offSet = 4;                                                // for forcing connection to 242
    $cIf = file_get_contents("./connectInfo.txt");                // Get connection params
    $cI =  explode("\n", $cIf);                         
    $serverName = $cI[$offSet + 0];                               // load the connection params
    $connectionInfo = array(
      "UID" => $cI[$offSet + 1],
      "PWD" => $cI[$offSet + 2],
      "Database" => $cI[$offSet + 3],
    );
   // $s = print_r($connectionInfo, true); fwrite($fp, $s);
    $handle = sqlsrv_connect( $serverName, $connectionInfo);
      if( $handle  ) {
       // if ($debug ) 
          fwrite($fp, "\r\n Connection established with $serverName.\r\n");
        }else{
          echo "Connection could not be established.<br />";
          $err =  print_r( sqlsrv_errors(), true);
          fwrite($fp, "\r\n error \r\n ". $err);
          die( print_r( sqlsrv_errors(), true));
      }
      return $handle;
  }