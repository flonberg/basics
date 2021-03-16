<?php
/*********  save to    ''https://whiteboard.partners.org/esb/FLwbe/REST/JW/'';  */
 /*   week/month/3 months/6 months/year/all/  */
require_once('./ESButils.inc');
require_once('H:\inetpub\lib\ESB\_dev_\ESBRestProto.inc');
require_once('H:\inetpub\lib\switchConnect.inc');                           // has routine to obtain handle for BB or 242
require_once('H:\inetpub\lib\phpDB.inc');  
require_once('./restLib.php');  

    $fp = setLog();
    $gp = fopen('./log/wSessions.txt', 'w+');

    $dates = makeDates($_GET['num'], $_GET['arg']);
    $dS = print_r($dates, true); fwrite( $gp, $dS);
$tslt = new ESBRestTimeslot();    
$ts  = $tslt->timeslotRestRequest("","", $dates['start'], $dates['end']);		// get the timeSlots
//$dS = print_r($ts, true); fwrite($gp, $dS);
foreach ( $ts as $key => $val){
    if (!isset($dist[$val['SessionState']]))
        $dist[$val['SessionState']] = 1;
    else
        $dist[$val['SessionState']]++;    
    }
    $dist['fromDate'] = $dates['startString'];
    echo json_encode($dist);
exit();


function makeDates($n, $arg){
    $today = new DateTime();
    $str1 =  $today->format("Y-m-d" );             
    $str2 = "T00:00:00.000Z";
    $str3 = "T23:00:00.000Z";
    $ret['end']=  "$str1"."$str3";
    if ($arg == 'all')    
         $today = new DateTime('2019-01-01');
    else
        $today->modify( '-' . $n .' '. $arg); 
    $str1 = $today->format('Y-m-d');
    $ret['start']=  "$str1"."$str2";
    $ret['startString'] = $str1;
    return ($ret);
}

    function makeDatesOLD($fp, $arg){
        $today = new DateTime();
        if ($_GET['arg'] == '1')                        // caller asked to tomorrow
            $today->modify('+ 1 day');                  // go to tomorrow
        $dow = $today->format('w');                     // check the dayOfWeek
        if ($dow == 6)                                  // if it is Sat
            $today->modify('+2 day');                   // advance 2 days
        if ($dow == 0)                                  // if it is Sunday    
            $today->modify('+1 day');                   // advance 1 day
        $dow = $today->format('w');    
        $str1 =  $today->format("Y-m-d" );             
            $str2 = "T00:00:00.000Z";
            $str3 = "T23:00:00.000Z";
            $ret['start']=  "$str1"."$str2";
            $ret['end']=  "$str1"."$str3";
            $str1 =  date("Y-m-d", strtotime( '+1 days' ) ); // 2018-07-18 07:02:43
           // $str1 =  date("Y-m-d", strtotime( '-7 days' ) ); // 2018-07-18 07:02:43
           // $ret['end']=  "$str1"."$str2";
            $str = print_r($ret, 'true');
            fwrite($fp, $str);
            return $ret;
        }        
    function advanceNextWeekDay(){                      // $arg is date
        $today->modify('+ 1 day');                      // go to tomorrow
        $dow = $today->format('w');                     // check the dayOfWeek
        if ($dow == 6)                                  // if it is Sat
            $today->modify('+2 day');                   // advance 2 days
        if ($dow == 0)                                  // if it is Sunday    
            $today->modify('+1 day');                   // advance 1 day
        return $today;  
    }
function setLog(){
    $fp = fopen('./log/getSessLog.txt', 'a+');
    $now = new DateTime();
    $nowString = $now->format('Y-m-d H:i:s');
    fwrite($fp, "\r\n ". $nowString);
    $str = print_r($_GET, 'true');
    fwrite($fp, $str);
    return $fp;
}
