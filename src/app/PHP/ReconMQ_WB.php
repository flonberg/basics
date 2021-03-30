<?php

require_once 'H:\inetpub\lib\sqlsrvLibFL_dev.php';
require_once 'H:\inetpub\lib\ESB\_dev_\ESBRestProto.inc' ;
require_once 'H:\inetpub\lib\switchConnMQ.inc';
require_once('../ESBLocationClass.inc');
$mylocation = new Location();
require_once("H:\inetpub\lib\ESB\\".$mylocation->path."\\ESBRestSchedFL.inc");
require_once("H:\inetpub\lib\ESB\\".$mylocation->path."\\ESBPatientClass-prod.inc");
require_once("H:\inetpub\lib\ESB\\".$mylocation->path."\\ESBPDRClass-prod.inc");
require_once("H:\inetpub\lib\ESB\\".$mylocation->path."\\libMOSAIQjw.inc");
require_once("H:\inetpub\lib\ESB\\".$mylocation->path."\\mcurl.inc");

	$fp = fopen("../log/ReconMQ_WBlog.txt", "w+");
	$now = date('Y-m-d H:i:s'); fwrite($fp, "\r\n $now \r\n");
	$dayAdvance = 1;							// number of day in future, 0 = today
	$handle = connectMSQ();                                    		// connect to MQ database                     
	$reSched = new ESBRestReschedule(); 	
	$row = getFromMQ($dayAdvance);						// get data from MQ
	$row = getFromWB($row, $dayAdvance);					// get data from WB
    	$ds = print_r($row, true); fwrite($fp, $ds);
print "HELLO<br>\n";
	exit();

/**
 * Make dates for a Single Day's data aquisition. Parameter $n determines how many days in future you go. 
 */
function makeMQdates($n){
	global $fp;
    $d = new DateTime();                                                            // create a date
    if ($n > 0 )  {                                  
	    $d->modify($n .' day');                                                 // advance according to argument
	    $d = goToMonday($d);
    }
    $dates['firstDay'] =  $d->format('Y-m-d');	                                    // format the early date of interval
    $d->modify(' + 1  day');                                                     // advance 1 day
    $dates['nextDay'] =  $d->format('Y-m-d');	                                    // format the late date of the interval
    $ds = print_r($dates, true); fwrite($fp, $ds);
    return $dates;
}  
function goToMonday($d){
    if ($d->format('w') == '6')						    // if it is a Saturday		
	    $d->modify('+2 days');					    // go forward to Monday	
    if ($d->format('w') == '0')						    // if it is a Sunday		
	    $d->modify('+1 days');					    // go forward to Monday	
    return $d;

}
/**
 * Get Data from MQ
 */
function getFromMQ($dayAdvance){
   global $fp, $handle;
	$mqDates = makeMQdates($dayAdvance);
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
 * Get from WB
 */
function getFromWB($row, $dayAdvance){
	global $fp;
	$dates = makeWBdates($dayAdvance);
        $ds = print_r($dates, true); fwrite($fp, "\r\n WB dates \r\n"); fwrite($fp, $ds);
	$tslt = new ESBRestTimeslot();           
	$ts  = $tslt->timeslotRestRequest("","", $dates['start'], $dates['end']);		// get the timeSlots for the day
	$pattern = "/\d{3}-\d{2}-\d{2}/";                                               	// pattern for getting patientIDs
	foreach ($ts as $key=>$val){                                                    	// loop thru the items returned by SOAP request. 
		if (preg_match($pattern,$val['PatientID'],$dummy))	                        // find Patient timeSlots
		{	
			$time = strtotime($val['StartDateTime'].' UTC');                        // get GMT time in local time. 
			$dateInLocal = date("Y-m-d\TH:i:s\Z", $time);                           // format the local time string in UTC
			$row[$val['PatientID']]['EnsStartTimeLocal'] = $dateInLocal;            // store the Ensemble Start time
			$row[$val['PatientID']]['EnsStartTimeRaw'] = $val['StartDateTime'];     // store the Ensemble Start time
			$row[$val['PatientID']]['EnsPatID'] = $val['PatientID'];                // confirm the PatientID
			$row[$val['PatientID']]['SessionID'] = $val['SessionID'];            	// Add Ensemble Param.    
			$row[$val['PatientID']]['TimeslotID'] = $val['TimeslotID'];             // mm 
			$row[$val['PatientID']]['RoomID'] = $val['RoomID'];     		 		// mm 
		}
	}

	return $row;
}
function makeWBdates($n)
{
	$today = date('Y-m-d');
	$theDay = strtotime("+$n day", strtotime($today));
	$str2 = "T23:00:00.000Z";                                                       // make the time for the END of the interval
	$str3 = "T01:00:00.000Z";
	$str1 = date('Y-m-d', $theDay);
   	$ret['start']=  $str1.$str3;
    	$ret['end']=  $str1.$str2;
    return $ret;
}
