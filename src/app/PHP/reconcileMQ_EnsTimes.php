<?php
/******  run on 242 .../htdocs/esb/FLwbe/REST/JW  to allow REST requests to platform   ***************:*/

require_once 'H:\inetpub\lib\sqlsrvLibFL_dev.php';
require_once 'H:\inetpub\lib\ESB\_dev_\ESButils.inc' ;
require_once 'H:\inetpub\lib\ESB\_dev_\ESBRestProto.inc' ;
//require_once 'H:\inetpub\lib\ESB\_dev_\ESBRestSched.inc' ;
require_once 'H:\inetpub\lib\switchConnMQ.inc';

    $handle = connectMSQ();                                                         // for connecting to Mosaiq dataBase
	$mqDates = makeMQdates(0);                                                      // make the dates for MQ query

    $selStr = "SELECT TOP(100)  Sch_Id, App_DtTm, IDA, PAT_NAME, Duration_time, LOCATION FROM vw_Schedule 
            WHERE App_DtTm > '".$mqDates['firstDay']."'  AND  App_DtTm < '".$mqDates['nextDay']."'                  
            AND IDA LIKE '[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'  AND LOCATION LIKE '%GBPTC' ORDER BY App_DtTm";    // nnn-nn-nn and GBPTC
	$dB = new getDBData($selStr, $handle);
    while ($assoc = $dB->getAssoc()){
		$row[$assoc['IDA']] = $assoc;
		$row[$assoc['IDA']]['Duration'] = $assoc['Duration_time']/(60 * 100);		// this is the only conversion which yields expected results???
		$triggerOn = '04/01/2013 03:08 PM';
		$triggerOn = $assoc['App_DtTm']->format('Y-m-d H:i:s');
		$row[$assoc['IDA']]['UTC_StartTime'] = gmdate('Y-m-d H:i:s',strtotime($triggerOn));
    }

    $dates = makeDates();                                                           // make dates for Ensemble timeslorRestRequest
    $fp = fopen("gts.txt", "w+");
	$dates = makeDates();
    $tslt = new ESBRestTimeslot();                                                  // instantiate class for getting multiple timeSlots. 
	$reSched = new ESBRestReschedule(); 
	// $reSched->rescheduleRestRequest($sessionid,$timeslotid,$newdate,$roomid,$duration)

	$pattern = "/\d{3}-\d{2}-\d{2}/";                                               // pattern for getting patientIDs
	$ts  = $tslt->timeslotRestRequest("","", $dates['start'], $dates['end']);		// get the timeSlots
	foreach ($ts as $key=>$val){                                                    // loop thru the items returned by SOAP request. 
		if (preg_match($pattern,$val['PatientID'],$dummy))	                        // find Patient timeSlots
		{	
			$time = strtotime($val['StartDateTime'].' UTC');                        // get GMT time in local time. 
			$dateInLocal = date("Y-m-d\TH:i:s\Z", $time);                              // format the local time string in UTC
			$row[$val['PatientID']]['EnsStartTimeLocal'] = $dateInLocal;                 // store the Ensemble Start time
			$row[$val['PatientID']]['EnsStartTimeRaw'] = $val['StartDateTime'];                 // store the Ensemble Start time
			$row[$val['PatientID']]['EnsPatID'] = $val['PatientID'];                // confirm the PatientID
			$row[$val['PatientID']]['SessionID'] = $val['SessionID'];               
			$row[$val['PatientID']]['TimeslotID'] = $val['TimeslotID'];              
			$row[$val['PatientID']]['RoomID'] = $val['RoomID'];                		 
		}
	}
    echo "<pre>"; print_r($row); echo "</pre>";
    exit();

/**
 * Make dates for a Single Day's data aquisition. Parameter $n determines how many days in future you go. 
 */
function makeMQdates($n){
    $d = new DateTime();                                                            // create a date
    if ($n > 0 )                                    
        $d->modify($n .' day');                                                     // advance according to argument
    $dates['firstDay'] =  $d->format('Y-m-d');	                                    // format the early date of interval
    $d->modify($n + 1 .' day');                                                     // advance 1 day
    $dates['nextDay'] =  $d->format('Y-m-d');	                                    // format the late date of the interval
    return $dates;
}    

/**
 * Make dates for the timeSlotRestRequest to get 1 day's timeSlots: from day at 1:00AM to day at 23:00
 */
function makeDates(){
    $str1 =  date("Y-m-d");                                                         // make the e.g. 2021-03-18 part of the date string 
    $str2 = "T23:00:00.000Z";                                                       // make the time for the END of the interval
    $str3 = "T01:00:00.000Z";
    $ret['start']=  "$str1"."$str3";
   // $str1 =  date("Y-m-d", strtotime( '-7 days' ) ); // 2018-07-18 07:02:43
    $ret['end']=  "$str1"."$str2";
    return $ret;
}        


class ESBRestFL
{

	public $method;
	public $postfields;
	public $header;
	public $json_string;
	public $protoLabel = "TxScheduling";
	// public $urlroot = "websvcdev.partners.org/resthub/ens-mghion/mgh/rest";
	// public $urlroot = "https://dev-webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest";
	// public $urlroot = "sycorax.partners.org/";
	public $urlroot = "dev-webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST2/mgh/rest";
	public $debug = 0;
	public $metal;
	public $logical;
	public $fp;

	public function __construct()
	{	

		$this->fp = fopen("log.txt", "w");
		$now = date("Y-m-d H:i:s");
		fwrite($fp, "\r\n $now \r\n");
		$this->locate();
		$this->method = "POST";
		$this->username = file_get_contents("C:\AppData\ws_uid.txt");
		$this->passwd = file_get_contents("C:\AppData\ws_pwd.txt");
		$this->urlroot = $this->setURL(0);
		$this->debug =1; 
	}
        public function locate()
        {
		$req = $_SERVER['REQUEST_URI'];
		print_r($req);
		// $req = __DIR__;
		if($this->debug){ print "REST: inLOCATE<br>\n"; var_dump($req); echo "<br> GET <br>"; print_r($_GET);}

                if(strpos($req,"/_dev_/"  ) !== false || strcmp($_GET['d'], '_dev_') == 0 )
		{
			if($this->debug) print "REST: inDEV<br>\n";
                        $this->logical = "dev-webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest";
                        $this->metal = "dev-webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest";
                        // $this->metal = "websvcdev.partners.org/resthub/ens-mghion/mgh/rest";
                }
                else if(strpos($req,"/_qa_/") !== false || strcmp($_GET['d'], '_qa_') == 0)
                {
                        $this->logical = "stage-webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest";
                        $this->metal = "stage-webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest";
                }
                else if(strpos($req,"/_prod_/") !== false || strcmp($_GET['d'], '_prod_') == 0)
                {
                        $this->logical = "webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest";
                        $this->metal = "webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest";
                }
                else
                {
                        $this->logical = "webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest";
                        $this->metal = "webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest";
                        //$this->logical = "dev-webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST2/mgh/rest";
                        //$this->metal = "dev-webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST2/mgh/rest";
                        // $this->metal = "websvcdev.partners.org/resthub/ens-mghion/mgh/rest";
                }
		if ($this->debug) echo  "<br> 63 ". $this->logical ." <br>"; 
        }

	public function setURL($flag)
	{
		if($flag)
		{
			$url = "https://".$this->metal;
		}
		else
		{
			// $url = "https://".$this->username.":".$this->passwd."@".$this->urlroot;
			$url = "https://".$this->logical;
		}
		$this->urlroot = $url;
		fwrite($this->fp, "\r\n url is " .  $url);						// fjl3
		return $url;
	}
	public function getMethod()
	{
		$this->method = "GET";
	}
	public function curlRest($url,$data)
	{
		$this->debug = FALSE;
		if($this->debug)
		{
			echo "URL:106 $url<br>\n";
			print "post data: ";
			print_r($data);
			print "<br><br>\n";
		}

		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $this->method);	$cred = sprintf("%s:%s", $this->username, $this->passwd);
		curl_setopt($ch, CURLOPT_USERPWD, $cred);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_VERBOSE, true);
		if($this->debug)
		{
			curl_setopt($ch, CURLOPT_HEADERFUNCTION,
				function($curl,$header_line)
				{
					echo "RESPONSE_HEADER: 88888  ".$header_line;
					return strlen($header_line);
				}
			);
		}
		curl_setopt($ch, CURLINFO_HEADER_OUT, true);

		if(strpos($this->method,"POST") !== false || strpos($this->method,"PUT") !== false)
		{
			if($this->debug)
			{
				print "<br>Method: ".$this->method."<BR>\n";
			}
			$this->json_string = json_encode($data);
			$this->restHeaders();
			curl_setopt($ch, CURLOPT_POSTFIELDS,$this->json_string);
			curl_setopt($ch, CURLOPT_HTTPHEADER, $this->header);
		}
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		$cred = sprintf("%s:%s", $this->username, $this->passwd);
		curl_setopt($ch, CURLOPT_USERPWD, $cred);


		$result = curl_exec($ch);
		if($this->debug)
		{
			$info = curl_getinfo($ch);
			print "<br>REQUEST HEADER\n";
			print_r($info['request_header']);
		}

		return $result;
	}


}

class ESBRestReschedule extends ESBRestFL
{
	public function rescheduleRestRequest($sessionid,$timeslotid,$newdate,$roomid,$duration)
	{
		$err = new ERROR();

		$url = $this->urlroot."/sessions/".$sessionid."/timeslots/".$timeslotid."/reschedule";


		$data = array(
			'roomId'=>$roomid,
			'startDateTime'=>$newdate,
			'duration'=>$duration
		);

		try
		{
			$result = $this->curlRest($url,$data);
		}
		catch(Exception $e)
		{
			$err->message("could not complete reschedule session request: ".$e->getMessage(),201);
		}

		return $result;
		
	}
}
class ESBRestStaff extends ESBRestFL
{
	public function staffRestRequest()
	{
		$err = new ERROR();

		$url = $this->urlroot."/staff";
		// print "<br>ROOM: $url<br>\n";
		$this->getMethod();

		$data = array(
		);

		try
		{
			$result = $this->curlRest($url,$data);
		}
		catch(Exception $e)
		{
			$err->message("could not complete REST staff request: ".$e->getMessage(),201);
		}


		$staff = json_decode($result,true);
		if ($this->debug == 1)
			echo "<pre>"; print_r($staff); echo "</pre>";

		return $staff;
	}

}


class ESBRestTimeslot extends ESBRestFL												// JW code
{
	public function timeslotRestRequest($patientid,$rooms,$startdate,$enddate)
	{
		$err = new ERROR();
		$url = $this->urlroot."/timeslots?start_date=".$startdate."&end_date=".$enddate."&patient_id=".$patientid."&rooms=".$rooms;
	//	echo "<br> 277 url is $url <br>";
		$this->getMethod();
		$data = array();
		try
		{
			$result = $this->curlRest($url,$data);
		}
		catch(Exception $e)
		{
			$err->message("could not complete REST timeslot request: ".$e->getMessage(),201);
		}
		$timeslot = json_decode($result,true);
		return $timeslot;
	}
}



class ESBRestSessions extends ESBRestFL
{
	public function sessionRestRequest($timeslotid,$sessionid)
	{
		$err = new ERROR();
		$url = $this->urlroot."/sessions/".$sessionid."/timeslots/".$timeslotid;
	//	echo "<br><br> 3333 <br> $url <br>"; 
//		$url = "https://webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest/timeslots?start_date=2020-12-03T00%3A00%3A00Z&end_date=2020-12-05T00%3A0";
		echo "<br> <br> $url <br><br>"; 
		$this->getMethod();
		$data = array();
		try
		{
			$result = $this->curlRest($url,$data);
		}
		catch(Exception $e)
		{
			$err->messsage("could not complete REST session request: ".$e->getMessage(),201);
		}
		$session = json_decode($result,true);

		if ($this->debug == 1)
			echo "<pre>"; print_r($session); echo "</pre>";
		return $session;
	}
}
class ESBRestATimeslot extends ESBRestFL
{
	public function ATimeslotRestRequest($timeslotid,$sessionid)
	{
		$err = new ERROR();
		
		$url = $this->urlroot."/sessions/".$sessionid."/timeslots/".$timeslotid;
//		echo "<br><br> 3333 <br> $url <br>"; 
//		$url = "https://webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest/timeslots?start_date=2020-12-03T00%3A00%3A00Z&end_date=2020-12-05T00%3A0";
		echo "<br> <br> $url <br><br>"; 
		$this->getMethod();
		$data = array();
		try
		{
			$result = $this->curlRest($url,$data);
		}
		catch(Exception $e)
		{
			$err->messsage("could not complete REST session request: ".$e->getMessage(),201);
		}
		$session = json_decode($result,true);

	//	if ($this->debug == 1)
	//		echo "<pre>"; print_r($session); echo "</pre>";
		return $session;
	}
}
/*
class ESBRestTimeslots extends ESBRestFL
{
	public function timeslotsRestRequest($startDateTime,$endDateTime)
	{
		$err = new ERROR();
		$url = $this->urlroot."/timeslots/?start_date".$sessionid."/timeslots/".$timeslotid;
		$url = "webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest/timeslots?start_date=2020-12-03T00%3A00%3A00Z&end_date=2020-12-05T00%3A0";
//		$url = "webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest/timeslots?start_date=2020-12-03&end_date=2020-12-05";
//		$url = "webapi.partners.org/Infrastructure/MGH/ManageRADONC/REST/mgh/rest/timeslots?start_date=2020-12-03T00%3A00%3A00Z&end_date=2020-12-05T00%3A00%3A00Z HTTP/1.1";
		
		echo "<br> 888 <br> $url <br><br>"; 
		$this->getMethod();
		$data = array();
		try
		{
			$result = $this->curlRest($url,$data);
			//$result = $this->curlRest($url,$data);
		}
		catch(Exception $e)
		{
			$err->messsage("could not complete REST session request: ".$e->getMessage(),201);
		}
		$session = json_decode($result,true);

//		if ($this->debug == 1)
		echo "<br> 214 <br>"; 
			echo "<pre>"; print_r($session); echo "</pre>";
		return $session;
	}
}
*/



