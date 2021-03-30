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

	$fp = fopen("../log/ReconMQ_WBlog.txt", "a+");
	$now = date('Y-m-d H:i:s'); fwrite($fp, "\r\n $now \r\n");
	$handle = connectMSQ();                                    // connect to MQ database                     
	$tslt = new ESBRestTimeslot();           
	$reSched = new ESBRestReschedule(); 	
	$row = getFromMQ();
print "HELLO<br>\n";
	exit();

/**
 * Make dates for a Single Day's data aquisition. Parameter $n determines how many days in future you go. 
 */
function makeMQdates($n){
	global $fp;
    $d = new DateTime();                                                            // create a date
    if ($n > 0 )                                    
        $d->modify($n .' day');                                                     // advance according to argument
    $dates['firstDay'] =  $d->format('Y-m-d');	                                    // format the early date of interval
    $d->modify($n + 1 .' day');                                                     // advance 1 day
    $dates['nextDay'] =  $d->format('Y-m-d');	                                    // format the late date of the interval
    $ds = print_r($dates, true); fwrite($fp, $ds);
    return $dates;
}  

function getFromMQ(){
   global $fp, $handle;
	$mqDates = makeMQdates(0);
   $selStr = "SELECT TOP(100)  Sch_Id, App_DtTm, IDA, PAT_NAME, Duration_time, LOCATION FROM vw_Schedule 
            WHERE App_DtTm > '".$mqDates['firstDay']."'  AND  App_DtTm < '".$mqDates['nextDay']."'                  
            AND IDA LIKE '[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'  AND LOCATION LIKE '%GBPTC' ORDER BY App_DtTm";    // nnn-nn-nn and GBPTC
	$dB = new getDBData($selStr, $handle);
	/*  Get the parameters for MQ and save them in dataStruct with Pat MRN as key  */
    while ($assoc = $dB->getAssoc()){
		$row[$assoc['IDA']] = $assoc;
		$row[$assoc['IDA']]['Duration'] = $assoc['Duration_time']/(60 * 100);		// this is the only conversion which yields expected results???
		$triggerOn = $assoc['App_DtTm']->format('Y-m-d H:i:s');						// create arg for strtotime
		$row[$assoc['IDA']]['UTC_MQ_StartTime'] = gmdate('Y-m-d\TH:i:s\Z',strtotime($triggerOn));	//get UTC of Mosaiq startTime. 
    }
    $ds = print_r($row, true); fwrite($fp, $ds);
}
