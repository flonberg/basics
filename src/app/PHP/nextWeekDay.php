<?php

makeDates();

///$next = advanceToNextWeekDay($today);
//echo "\r\n tomorrow is ". $next->format('Y-m-d');    

function advanceToNextWeekDay($inp){
    $i = 0;                                         // safety counter
    do {
        $inp->modify('+1 day');                    // advance 1 day
        $dow = $inp->format('w');                  // get dayOfWeek 
        if ($i++ > 3)                               // saftey
            break;
    }
        while ($dow == 0 || $dow == 6);             // if it is a Sat or Sun repead
    return $inp;    
}

function makeDates(){
    //    $str1 =  date("Y-m-d", strtotime( '-11 days' ) ); // 2018-07-18 07:02:43
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
        $str2 = "T01:00:00.000Z";                       // 1 AM
        $str3 = "T23:00:00.000Z";                       // 11 PM
        $ret['start']=  "$str1"."$str2";
        $ret['end']=  "$str1"."$str3";
       // $str1 =  date("Y-m-d", strtotime( '-7 days' ) ); // 2018-07-18 07:02:43
       // $ret['end']=  "$str1"."$str2";
        print_r($ret);
        return $ret;
    }        
    
