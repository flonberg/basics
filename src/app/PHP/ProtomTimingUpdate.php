<?php
/*******  This script is called by getTimeSlots.php which supplies it with a list of ActivityIDs  *********/
/************   copy to 242 ...htdocs/esb/_dev_/FLprotom/ProtomTimingUpdate.php  run on 242 to get SOAP request to platform to work  ************/
require_once('H:\inetpub\lib\phpDB.inc');
require_once('H:\inetpub\lib\switchConnect.inc');                           // has routine to obtain handle for BB or 242
//require_once('lib\ESB\ESBQRClass.inc');
//require_once(dirname(__FILE__).'/ESBQRClass.inc');
require_once(dirname(__FILE__).'/ESBQRClass-FL.inc');
	$debug = 1;
    $handle = connectToDB(1);                                               // uses local connectToDB to switch between BB (1) and 242 (0)
	$eQR = new ESBQR();									                    // create the class from John's library code. 
	$eQR->setWSDL("_prod");									                // set prod WSDL to get actual data.
	$c = 0; 
	$lastAID = 0;
	$fp = fopen("PTlog.txt", "a+");                                         // Open logging file. 
	$now = date("y-m-d H:i:s");
    fwrite($fp, "\r\n \r\n $now \r\n");
    $arr = json_decode($_GET['toEnter']);                                   
    $get = print_r($arr, true); fwrite($fp, $get);
    if (!isset($arr)){
        echo "<br> no input list";
        exit();
    }
    $resCount = 0;
    foreach ($arr as $key => $val){
        fwrite($fp, "\r\n ActivityID  is $val ");
        $dataArray = array('ActivityID'=> $val);
        $st = print_r($dataArray, true); fwrite($fp, $st);
        $res = $eQR->retrieveActivitySoapRequest($dataArray);				// get SOAP data
        if (!$res)
            fwrite($fp, "\r\n nothing returned from SOAP");    
        if ($reCount++ > 0)
            { $st = print_r($res, true); fwrite($fp, $st);}
        writeTimingToDataBase($handle, $res);						        // write to table. 
    }
    exit();

	
function writeTimingToDataBase($handle, $res){
		global $fp;
	if (strlen( $res['Outcome']['EndDateTime']) < 2 )					// if there is no EndDateTime
		return;											
//	fwrite($fp, "\r\n endedActivity is ". $res['ActivityID']."  procedureCode is   ". $res['ProcedureCode'] ." StartDateTime is ". $res['Outcome']['StartDateTime']);
	$keys = array('ActivityID', 'ProcedureCode', 'PatientID', 'StartDateTime', 'EndDateTime','CancellationDateTime',
		'ActivityState', 'EquipmentName','EquipmentConceptID','OutcomeResult','SessionID','TimeslotID','PhaseID','Result');	// keys for INSERT statment
	$toDB['ActivityID'] = $res['ActivityID'];						// build array from SOAP data
	$toDB['ProcedureCode'] = $res['ProcedureCode'];
	$toDB['PatientID'] = $res['PatientID'];
	$toDB['StartDateTime'] = $res['Outcome']['StartDateTime'];
	$toDB['EndDateTime'] = $res['Outcome']['EndDateTime'];
	$toDB['CancelationDateTime'] = isset($res['CancellationInformation']['CancellationDateTime']) ? $res['CancellationInformation']['CancellationDateTime']: '';
//                               $param = isset($_GET['param']) ? $_GET['param'] : 'default';
	$toDB['ActivityState'] = $res['ActivityState'];
	$toDB['EquipmentName'] = isset($res['Equipment']['Equipment']['Name']) ? $res['Equipment']['Equipment']['Name']: '';
	$toDB['EquipmentConceptID'] = isset($res['Equipment']['Equipment']['ConceptID']) ? $res['Equipment']['Equipment']['ConceptID']: '';
	$toDB['SessionID'] = $res['SessionID'];
	$toDB['TimeslotID'] = $res['TimeslotID'];
	$toDB['PhaseID'] = $res['PhaseID'];
	$toDB['Result'] = $res['Outcome']['Result'];
	$insStr1 = "INSERT INTO ProtomTiming (addWhen, ";						// First part of INSERT string
	$insStr2 = " values (GETDATE(), ";									// Second part of INSERT string
	foreach ($keys as $key=>$val){
		$insStr1 .= "$val, ";								// add Column Name
		$insStr2 .= " '". $toDB[$val]."',";						// add Column Value
	}
	$insStr1 = substr($insStr1, 0, -2);							// remove trailing comma
	$insStr2 = substr($insStr2, 0, -1);							// remove trailing comma
	$insStr = $insStr1 .") " . $insStr2 . ")";						// Assemble INSERT string
	fwrite($fp, "\r\n $insStr  \r\n");
    $res = sqlsrv_query($handle, $insStr);
	var_dump($res);
	if ($res)
        fwrite($fp, "\r\n \r\n record written ".  $insStr);
    if( $res === false ) {
        if( ($errors = sqlsrv_errors() ) != null) {
            foreach( $errors as $error ) {
                fwrite($fp,  "\r\n SQLSTATE: ".$error[ 'SQLSTATE']."\r\n");
                fwrite($fp, "code: ".$error[ 'code']."\r\n");
                fwrite($fp, "message: ".$error[ 'message']."\r\n");
                }
            }
        }    
	}
function connectToDBLocal($mode)
{
	if ($mode == 0){									// connect to 242
		$dS['UID'] = file_get_contents('C:\AppData\wb_uid.txt');
		$dS['PWD'] = file_get_contents('C:\AppData\wb_pwd.txt');
		$dS['Database'] = 'imrt';
		$name = 'phsqlwev242';
	}
	if ($mode == 1){									// connect to BB
		$dS['UID'] = file_get_contents('C:\AppData\bb_uid.txt');
		$dS['PWD'] = file_get_contents('C:\AppData\bb_pwd.txt');
		$dS['Database'] = 'imrt';
		$name = ' blackboard-dev';
	}
   	$handle = sqlsrv_connect($name, $dS);	
	return($handle);
}
