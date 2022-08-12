<?php

header("Access-Control-Allow-Origin: *");
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//require_once 'H:\inetpub\lib\sqlsrvLibFLwBB.php';
//$handle = connectToDB(1);
require_once 'H:\inetpub\lib\sqlsrvLibFL2.php';
$connDB = new connDB();
$handle = $connDB->handleBB;
$IAU = new InsertAndUpdates();
$fp = fopen('./saveDatalog.txt', "w");
$nowStr = date("Y-m-d H:i:s"); fwrite($fp, "\r\n $nowStr \r\n");
$body = @file_get_contents('php://input');            // Get parameters from calling cURL POST;

                                   	// Write out the data to the log
$data = json_decode($body, true);
$s = print_r($data, true);     fwrite($fp, $s ."\r\n");                      	// Create pretty form of data
$res = array("result"=>"Success");
echo json_encode($res);
$instNames = Array('MGH','NWH','CDH','EH');


$insStr1 = "INSERT INTO QADashdbParams (userid, startDate, endDate, maxDays, startWF, endWF, sortBy, EnteredWhen";
$insStr2 = " values ('".$data['userid']."','".$data['startDate']."','".$data['endDate']."','".$data['maxDays']."',
'".$data['startWF']."','".$data['endWF']."','".$data['sortBy']."',  GETDATE()";
if (isset($data['instSpec'])){
        foreach($data['instSpec'] as $key=>$val){
                $insStr1 .= ", $val";
                $insStr2 .= ",'1'";
                }
        }
$insStr0 = $insStr1 .") " . $insStr2 .")";
fwrite($fp, "\r\n insStr0 is \r\n $insStr0 \r\n ");        

$insStr = "INSERT INTO QADashdbParams (userid, startDate, endDate, maxDays, startWF, endWF, sortBy, EnteredWhen )
        values ('".$data['userid']."','".$data['startDate']."','".$data['endDate']."','".$data['maxDays']."',
        '".$data['startWF']."','".$data['endWF']."','".$data['sortBy']."',  GETDATE())";
fwrite($fp, "\r\n $insStr \r\n ");        
$res = $IAU->safeSQL($insStr0, $handle);
$resA = array("result"=>"Success");
//echo json_encode($resA);
exit();
$selStr = "SELECT * FROM [imrt].[dbo].[QADashdbParams]";
$dB = new getDBData($selStr, $handle);

$assoc = $dB->getAssoc();
echo json_encode($assoc);

