<?php
/******  run on 242 .../htdocs/esb/FLwbe/REST/JW  to allow REST requests to platform   ***************:*/


require_once('./ESButils.inc');
require_once('H:\inetpub\lib\ESB\_dev_\ESBRestProto.inc');
//require_once('./ESBRestProto.inc');
require_once('H:\inetpub\lib\phpDB.inc');       
//require_once('./ESBRestSched.inc');
//$sess = new ESBRestSessions( );
//$sess->sessionRestRequest('13102854-13C9-11EB-BFBB-B0044ED74D5C','0440F754-13C9-11EB-BBBA-B0044ED74D5C' );
    $dates = makeDates();
echo "<br> 11 <br> "; 
    $fp = fopen("gts.txt", "w+");
	$tslt = new ESBRestTimeslot();                                                                          // instantiate class for getting multiple timeSlots. 
	$getATS = new ESBRestATimeslot();                                                                       // instantiate class for getting single timeslot. 
	$pattern = "/\d{3}-\d{2}-\d{2}/";                                                                       // pattenr for getting patientIDs


	echo "<br> 21 <br>"; 
	$dates = makeDates();

    if (isset($_GET['test'])){
        $dates['start'] =  "2020-12-18T23:00:00.000Z";
        $dates['end'] =  "2020-12-21T23:00:00.000Z";
	}

    print_r($dates);
    $ts  = $tslt->timeslotRestRequest("","", $dates['start'], $dates['end']);		// get the timeSlots
	//$loopIdx = 0;
	$actIDX = 0;                                                                                            // index for ActivityIDs
	foreach ($ts as $key=>$val){                                                                            // loop thru the items returned by SOAP request. 
		if (preg_match($pattern,$val['PatientID'],$dummy) && strcmp($val['SessionState'], 'ENDED') == 0)	// find Patient and ENDED timeSlots
		{	
  

        //  echo "<br> StartDateTimd is ". $val['StartDateTime']." PatientID is ". $val['PatientID'] ." SessionID is ". $val['SessionID'] ." timeslotID is ". $val['TimeslotID'];
			$patId = $val['PatientID'];
			/********** go thru to get the Radiations  *///////////////////////////////
                $timeSlot = $getATS->ATimeslotRestRequest( $val['TimeslotID'],$val['SessionID']);	        // get THE timeSlot
                $radI = 0;   
                if ($actIDX++ == 0){
                    $s = print_r($timeSlot, true);
                    fwrite($fp, "\r\n 35 \r\n". $s);
                }                                                                               // index for Radiations.. 
				$tsData[$patId]['PhaseID'] = $val['PhaseID'];                                               // $tsData is dataStruct for individ timeslot data. 
				foreach ($timeSlot['RadiationSet']['Radiations'] as $key=>$val){			                // loop thru the RadiationSet
					{
						foreach ($val as $kkey=>$vval)
							$tsData[$patId]['RadSet'][$radI][$kkey] = $val[$kkey];                          // save the Radiations 
						$radI++;
					}
                }
                $ct = 0; 
				foreach ($timeSlot['Session']['Operations'] as $key=>$val){				// 
				{     
					foreach ($val['Activities'] as $kkey=>$vval){
                        echo "<br> Description is ". $vval['Description']  ." procedureCode is ". $vval['ProcedureCode'];
                        if ($ct++ == 10000){    
                            echo "<pre>"; print_r($vval['OutputObjects']); echo "</pre>";
                        }
                        echo "<br> studyDatetime is ". $vval['OutputObjects']['StudytDateTIme'];
				//		if (strpos($vval['Description'], 'Treatment') > 0 || strpos($vval['Description'], 'VS') > 0)
						{
							$tsData['Activities'][$actIDX] = $vval['ActivityID'];		                    // record list of activities pass to ProtomTimingUpdate.php
							$tsData[$patId]['ActivityID'][$actIDX++] = $vval['ActivityID'];
							}
						}	
					}
				}
		}
	}
	$jData = json_encode($tsData['Activities']);
    echo "<br> $jData <br>"; 
    /***********  call ProtomTimingUpdata.php to get the Activities  */
		$ch = curl_init();
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
                $url = "https://whiteboard.partners.org/esb/_dev_/FLprotom/ProtomTimingUpdate.php?toEnter=".$jData;                        // set URL
                $ret = curl_setopt($ch, CURLOPT_URL, $url);
                 curl_setopt($ch,CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
                $ret = curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);                                     // return argument is a json string
                $output = curl_exec($ch);                                                               // do the cURL
		var_dump($output);
            //    $dataW = json_decode($output, true);                                                    // decode json string to array

function makeDates(){
    $str1 =  date("Y-m-d", strtotime( '-2 days' ) ); // 2018-07-18 07:02:43
    $str2 = "T23:00:00.000Z";
    $ret['start']=  "$str1"."$str2";
    $str1 =  date("Y-m-d", strtotime( '+1 days' ) ); // 2018-07-18 07:02:43
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
		echo "<br> 277 url is $url <br>";
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



