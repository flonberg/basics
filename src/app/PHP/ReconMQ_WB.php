<?php

require_once 'H:\inetpub\lib\sqlsrvLibFL_dev.php';
require_once 'H:\inetpub\lib\ESB\_dev_\ESBRestProto.inc' ;
require_once 'H:\inetpub\lib\switchConnMQ.inc';
require_once('../ESBLocationClass.inc');
$mylocation = new Location();
require_once("H:\inetpub\lib\ESB\\".$mylocation->path."\\ESBRestSched.inc");
require_once("H:\inetpub\lib\ESB\\".$mylocation->path."\\ESButils.inc");
//require_once("H:\inetpub\lib\ESB\\".$mylocation->path."\\ESBPatientClass-prod.inc");
//require_once("H:\inetpub\lib\ESB\\".$mylocation->path."\\ESBPDRClass-prod.inc");
//require_once("H:\inetpub\lib\ESB\\".$mylocation->path."\\libMOSAIQjw.inc");
//require_once("H:\inetpub\lib\ESB\\".$mylocation->path."\\mcurl.inc");

	$debug = true;
	$handle = connectMSQ();                                    			// connect to MQ database                     
	$gp = fopen("../log/ReconMQ_WB_All.txt", "a+");					// create the log file
	$numDays = 6;									// number of days to go into future
//	$now = date('Y-m-d H:i:s'); fwrite($fp, "\r\n $now \r\n");		// open log file and write dateTime
	$now = new DateTime();  $nowString = $now->format('Y-m-d H:i:s');  fwrite($fp, "\r\n $nowString \r\n");	fwrite($gp, "\r\n $nowString \r\n");	// open log file and write dateTime
	$logMessage = "";
	$tDay = new DateTime();
	for ($i = 0; $i < $numDays; $i++){
		$dayAdvance = $i;							// number of day in future, 0 = today
		$MQdates['firstDay'] = $tDay->format('Y-m-d');				// make StartDate and EndDate for MQ query. 
		$tDay->modify('+1 day');
		$tDay = goToMonday($tDay);
		$MQdates['nextDay'] = $tDay->format('Y-m-d');
		echo "<br>"; print_r($MQdates);
		fwrite($gp, "\r\n ".  $MQdates['firstDay']  ."\r\n");
		$fp = fopen("../log/ReconMQ_WBlog".$MQdates['firstDay'].".txt", "w+");	// create the log file
		$row = getFromMQ($MQdates);						// get data from MQ
		$row = getFromWB($row,  $MQdates['firstDay']);					// get data from WB
    		$ds = print_r($row, true); fwrite($fp, $ds);				// write data to log file
		$logMessage = makeRescheduleRequest($row);						// Update the WB time and duration. 
		echo "<br> ;ogMessage <br>  $logMessage <br>"; 
	}
	echo __FILE__;
	echo date("c")." num days is ". $numDays ."<br> number of rec edited is ". $logMessage."<br> ";;
	makeLogEntry($logMessage, $numDays);
	exit();


function makeRescheduleRequest($row){
	global $fp, $gp;
	$reSched = new ESBRestReschedule(); 					// instaniate the class for ReScheculing
		/* Loop thru the dataStruct and create ESBReschedue Rest Request    */
	$i = 0;
	$logMessage = ""; 
	$numRecordsEdited = 0;								// save num rec edited to write to JW logs. 
	foreach ($row as $key=>$val ){						// loop thru the combined WB &  MQ data
		if (isset($val['WBStartUTCTime']) && isset($val['UTC_MQ_StartTime'])){		// if data has been returned for this PatID from WB AND MQ
			if ($val['Duration'] == $val['WBDuration'] && $val['UTC_MQ_StartTime'] == $val['UTC_MQ_StartTime']){ // if MQ === WB data
			       fwrite($fp, "\r\n ". $val['IDA'] ." WB = MQ \r\n");						// record confirmation in log
			       fwrite($gp, "\r\n ". $val['IDA'] ." for ".  $val['WBStartTimeLocal']." WB = MQ \r\n");	
			       continue;
			}
			$numRecordsEdited++;
			$logMessage .= "TimelotID ".$val['TimeslotID'] .",  SessionID = ".$val['SessionID'] ."  edited from ".$val['WBStartUTCTime'] ." to ".  $val['UTC_MQ_StartTime']." and Duration from ". $val['WBDuration']." to ". $val['Duration'] ." minutes" ;
			fwrite($fp, "\r\n \r\n". $key ."--".$val['PAT_NAME'] ." Orrig WB Time ". $val['WBStartTimeRaw']." MQ UTC time ". $val['UTC_MQ_StartTime']); // RECORD 'BEFORE' DATA
			fwrite($gp, "\r\n \r\n". $key ."--".$val['PAT_NAME'] ." Orrig WB Time ". $val['WBStartTimeRaw']." MQ UTC time ". $val['UTC_MQ_StartTime']); // RECORD 'BEFORE' DATA
			//record the ESBRestReschedule request. 
			fwrite($fp, "\r\n reSched->rescheduleRestRequest(".$val['SessionID'].",".$val['TimeslotID'].",".$val['UTC_MQ_StartTime']." ,".$val['RoomID'].",".$val['Duration'].")");	
			fwrite($gp, "\r\n reSched->rescheduleRestRequest(".$val['SessionID'].",".$val['TimeslotID'].",".$val['UTC_MQ_StartTime']." ,".$val['RoomID'].",".$val['Duration'].")");	
		        $result = $reSched->rescheduleRestRequest($val['SessionID'],$val['TimeslotID'], $val['UTC_MQ_StartTime'], $val['RoomID'], $val['Duration']);// do the reschedule
			fwrite($fp, "\r\n ". $val['IDA'] ." WB StartTime updated");
			fwrite($gp, "\r\n ". $val['IDA'] ." WB StartTime updated");
		        ob_start(); var_dump($result); $d = ob_get_clean(); fwrite($fp, "\r\n result: \r\n "); fwrite($fp, $d);		//record the returned result
			if ($numRecordsEdited == 1)
				break;
	      } 
	}
	if ($numRecordsEdited == 0)
		return "0";
	else
		return $logMessage; 
}
function makeLogEntry($message)
{
	global $numDays;
	$startDay = date('Y-m-d');
	$err = new ERROR();								// class containing 'logout' function  
	$intDates = makeMQdates($numDays);        	
	print_r($intDates);
	if  (strcmp($message, "0") == 0)
		$message = "All records syncronized from ". $startDay ." to  ". $intDates['nextDay'];
	$err->logout('poll', 'info' ,__FILE__, $message);     
}
/**
 * Make dates for a Single Day's data aquisition. Parameter $n determines how many days in future you go. 
 */
function makeMQdates($n){
	global $fp;
    $d = new DateTime();                                                         // create a date
    if ($n > 0 )  {                                  
	    $d->modify($n .' day');                                              // advance according to argument
	    $d = goToMonday($d);
    }
    $dates['firstDay'] =  $d->format('Y-m-d');	                                 // format the early date of interval
    $d->modify(' + 1  day');                                                     // advance 1 day
	    $d = goToMonday($d);
    $dates['nextDay'] =  $d->format('Y-m-d');	                                    // format the late date of the interval
    $ds = print_r($dates, true); fwrite($fp, $ds);
    return $dates;
}  
function goToMonday($d){
    if ($d->format('w') == '6')						    	// if it is a Saturday		
	    $d->modify('+2 days');					    	// go forward to Monday	
    if ($d->format('w') == '0')						    	// if it is a Sunday		
	    $d->modify('+1 days');					    	// go forward to Monday	
    return $d;

}
/**
 * Get Data from MQ
 */
function getFromMQ($mqDates){
   global $fp, $handle;
   	$selStr = "SELECT TOP(100)  Sch_Id, App_DtTm, IDA, PAT_NAME, Duration_time, LOCATION FROM vw_Schedule 
            WHERE App_DtTm > '".$mqDates['firstDay']."'  AND  App_DtTm < '".$mqDates['nextDay']."'                  
            AND IDA LIKE '[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'  AND LOCATION LIKE '%GBPTC' ORDER BY App_DtTm";    // nnn-nn-nn and GBPTC
	$dB = new getDBData($selStr, $handle);
	/*  Get the parameters for MQ and save them in dataStruct with Pat MRN as key  */
    while ($assoc = $dB->getAssoc()){
	$row[$assoc['IDA']] = $assoc;
	$row[$assoc['IDA']]['Duration'] = $assoc['Duration_time']/(60 * 100);				// confirmed with Anne
	$triggerOn = $assoc['App_DtTm']->format('Y-m-d H:i:s');						// create arg for strtotime
	$row[$assoc['IDA']]['UTC_MQ_StartTime'] = gmdate('Y-m-d\TH:i:s\Z',strtotime($triggerOn));	//get UTC of Mosaiq startTime. 
   	}
    return $row;	
    	
}
/**
 * Use ESBRestTimeslot->timeslotRestRequest to get all the timeslots for the given day. 
 * Match the Timeslot data to the MQ data by MRN, assuming only one Timeslot per Patient per Day.
 * In future, if > 1 timeslot is found matcher the earlier to the MQ earlier, mm the later one. 
 */
function getFromWB($row,  $firstDay){
	global $fp;
	$dates = makeWBdates($firstDay);
        $ds = print_r($dates, true); fwrite($fp, "\r\n WB dates \r\n"); fwrite($fp, $ds);
	$tslt = new ESBRestTimeslot();           
	$ts  = $tslt->timeslotRestRequest("","", $dates['start'], $dates['end']);		// get the timeSlots for the day
	$pattern = "/\d{3}-\d{2}-\d{2}/";                                               	// pattern for getting patientIDs
	foreach ($ts as $key=>$val){                                                    	// loop thru the items returned by SOAP request. 
		if (preg_match($pattern,$val['PatientID'],$dummy) )	                        // find Patient timeSlots
		{	
			$time = strtotime($val['StartDateTime'].' UTC');                        // get GMT time in local time. 
			$dateInLocal = date("Y-m-d\TH:i:s\Z", $time);                           // format the local time string in UTC
			$row[$val['PatientID']]['WBStartUTCTime'] = $val['StartDateTime'];     // store the Ensemble Start time
			$row[$val['PatientID']]['WBDuration'] = $val['Duration'];            // store the Ensemble Start time
			$row[$val['PatientID']]['WBStartTimeLocal'] = $dateInLocal;            // store the Ensemble Start time
			$row[$val['PatientID']]['WBPatID'] = $val['PatientID'];                // confirm the PatientID
			$row[$val['PatientID']]['SessionID'] = $val['SessionID'];                // confirm the PatientID
			$row[$val['PatientID']]['TimeslotID'] = $val['TimeslotID'];                // confirm the PatientID
			$row[$val['PatientID']]['RoomID'] = $val['RoomID'];                // confirm the PatientID
		}
	}
	return $row;
}
function makeWBdates($firstDay)
{
//	$today = date('Y-m-d');
//	$theDay = strtotime("+$n day", strtotime($today));
	$str2 = "T23:00:00.000Z";                                                       // make the time for the END of the interval
	$str3 = "T01:00:00.000Z";
//	$str1 = date('Y-m-d', $theDay);
	$str1 = $firstDay;
   	$ret['start']=  $str1.$str3;
    	$ret['end']=  $str1.$str2;
    return $ret;
}
