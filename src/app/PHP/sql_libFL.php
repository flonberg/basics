
<?php
strpos($_SERVER['PHP_SELF'], "skeleton")!== FALSE ? $debug = TRUE : $debug = FALSE;   // Dev -> Mac
$fp = fopen("sql_LibLog.txt", "w+");
writeLogHeader();
$s = print_r( $_SERVER['PHP_SELF'] , true);  fwrite($fp, "server is " . $s);
fwrite($fp, "\r\n server is ".$_SERVER['PHP_SELF'] );
$handle = connectToDataBase();                    // negative number means don't use
/******   Get a single param from dataBase    */
function getSingle($selStr, $handle)
{
  $st = sqlsrv_query($handle, $selStr);
  if($st === FALSE){
    $err = print_r( sqlsrv_errors(), true);
    fwrite($fp, "\r\n err err for $selStr \r\n". $err);
  }
  if( sqlsrv_fetch( $st ) === false) {
    $err = print_r( sqlsrv_errors(), true);
    fwrite($fp, "\r\n sfetch err for $selStr  \r\n". $err);
    }
 return sqlsrv_get_field($st, 0);  
}
/**   Fetch an array according to selStr with key - keyColNmae[value]   */ 
function getAssoc($selStr, $keyColName, $handle){
  $r = sqlsrv_query($handle, $selStr);
    if($r === FALSE){
      $err = print_r( sqlsrv_errors(), true);
      fwrite($fp, "\r\n getAssoc err for $selStr  \r\n". $err);
    }
    $i = 0;
    while ($s = sqlsrv_fetch_array($r, SQLSRV_FETCH_ASSOC)){
      $row[$s[$keyColName]] = $s;
      break;
    }
  //  print_r($row);
    return $row;
}  

function doQueryAndLog2($p){
  global $handle;
  $fp = fopen("sql_LibLog2.txt", "a+");
  $dT = date("Y-d-m H:i:s");
  fwrite($fp, "\r\n ****". $dT ."****\r\n");
  ob_start(); var_dump($p); $data = ob_get_clean();  fwrite($fp, "\r\n function arg is  ". $data);

  if (isset($p['qp']))
    fwrite($p['qp'], "\r\n Version 2 queryString is \r\n " . $query);
 // $res1 = sqlsrv_query($p['handle'], $p['query']);
  $res1 = sqlsrv_query($handle, $p['query']);
  if($res1 === FALSE){
    $err = print_r( sqlsrv_errors(), true);
    fwrite($fp, "\r\n " . $err);
    }
	ob_start(); var_dump($res1); $data = ob_get_clean();  fwrite($fp, "\r\n update result is ". $data);
  $cleanStr = str_replace("'", "", $p['query']);
  $who = $p['userid'];
	$insStr = "INSERT INTO FJLlog (date, query, result, who) values (GETDATE(), '$cleanStr', '$data', '$who')";
 // $res = sqlsrv_query($p['handle'], $insStr);
  $res = sqlsrv_query($handle, $insStr);
 // if (isset($qp))
  {
    ob_start(); var_dump($res); $data = ob_get_clean();  
    fwrite($fp, "   \r\n  cleanStr $insStr \r\n");
    fwrite($fp, "\r\n insert into FJLlog result is ". $data);
    
  }
	$jres = array("result" => $data );
 // echo json_encode($jres);
  return $res1;
}
/**********  Write header in log file with current dateTime  */
function writeLogHeader(){
  global $fp;
  $nowDT = new DateTime();
  $now = $nowDT->format("m-d-Y H:i:s");
  fwrite($fp, $now);  
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
 // fwrite($fp, "\r\n offset is $offSet");
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
class getDBData
{
          protected $result;
          public function __construct($s, $handle)
          {
                $this->result = sqlsrv_query($handle, $s);
            if ($this->result === FALSE)
              //  $er = print_r(sqlsrv_errors(), true); fwrite($fp, "\r\n $er \r\n");
              ;
          }
          public function getResult()
          {
                  return $this->result;
          }
          public function getAssoc()
          {
              if (is_resource($this->result)){
                              $row = sqlsrv_fetch_array($this->result, SQLSRV_FETCH_ASSOC);
                              return $row;
              }
              else
                return false;
                  }
                  public function getRow()
                  {
                          $row = sqlsrv_fetch_array($this->result, SQLSRV_FETCH_ASSOC);
                          return $row;
                  }
          public function getNum()
          {
      $row_count = sqlsrv_num_rows($this->result);
                  return $row_count;
          }
  }
  function updateDB( array $params){      //  not used 
    echo "\r\n 108 \r\n";
    writeLogHeader();                               
    $handleBB = connectToDataBase(0);                     // connect to BB
    $handle242 = connectToDataBase(4);                    // connect to 242
    $selStr = "SELECT * FROM ".$params['tableName'];
    if (isset($params['greaterThanColName'])){
      $selStr .= " WHERE ". $params['greaterThanColName']." > '". $params['greaterThanColVal']."'";
    }
    echo "\r\n $selStr ";
    $res = sqlsrv_query($handle242, $selStr);
    var_dump($res);
    $res = sqlsrv_query($handle242, $selStr);
    while ($row = sqlsrv_fetch_array($res, SQLSRV_FETCH_ASSOC)){
        $insStr1 = "INSERT INTO ".$params['tableName'] ." (";
        $insStr2 = "values (";
        foreach ($row as $key => $val){ 
            if (strcmp($key, 'idx')== 0)
            continue;
            if ($val instanceof DateTime) {
                $vval =  $val->format('Y-m-d');

              }
            else
                $vval = $val;  
            $insStr1 .= $key.", ";
            $insStr2 .= "'".$vval."', ";  
        }
      $insStr1 = substr($insStr1, 0, -2);				// cut the last comma
      $insStr1 .= ") ";
      $insStr2 = substr($insStr2, 0, -2);				// cut the last comma
      $insStr2 .= ")"; 
      $insStr = $insStr1 . $insStr2;
      echo "\r\n $insStr  \r\n";
      $res2 = sqlsrv_query($handleBB, $insStr);
      var_dump($res);
    }
  }

 
