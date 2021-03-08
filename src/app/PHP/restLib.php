<?php
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