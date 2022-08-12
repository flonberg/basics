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
$res = array("result"=>"Success");
$selStr = "SELECT TOP(1) * FROM [imrt].[dbo].[QADashdbParams] WHERE userid = '".$_GET['userid']."' ORDER BY idx DESC";
$dB = new getDBData($selStr, $handle);

$assoc = $dB->getAssoc();
echo json_encode($assoc);

