<?php
/*********  save to    'http://blackboard-dev.partners.org/dev/FJL/AngProd/';  */

require_once('./ESButils.inc');
require_once('H:\inetpub\lib\ESB\_dev_\ESBRestProto.inc');
require_once('H:\inetpub\lib\switchConnect.inc');                           // has routine to obtain handle for BB or 242
require_once('H:\inetpub\lib\phpDB.inc');  
require_once('./restLib.php');  

$dates = makeDates();

$tslt = new ESBRestTimeslot();    

$ts  = $tslt->timeslotRestRequest("","", $dates['start'], $dates['end']);		// get the timeSlots
foreach ( $ts as $key => $val){
    if (!isset($dist[$val['SessionState']]))
        $dist[$val['SessionState']] = 1;
    else
        $dist[$val['SessionState']]++;    
    }
 
    echo json_encode($dist);


exit();


function makeDates(){
    //    $str1 =  date("Y-m-d", strtotime( '-11 days' ) ); // 2018-07-18 07:02:43
        $str1 =  date("Y-m-d", strtotime( '-1 days' ) ); // 2018-07-18 07:02:43
        $str2 = "T23:00:00.000Z";
        $ret['start']=  "$str1"."$str2";
        $str1 =  date("Y-m-d", strtotime( '+5 days' ) ); // 2018-07-18 07:02:43
       // $str1 =  date("Y-m-d", strtotime( '-7 days' ) ); // 2018-07-18 07:02:43
        $ret['end']=  "$str1"."$str2";
        return $ret;
    }        
    