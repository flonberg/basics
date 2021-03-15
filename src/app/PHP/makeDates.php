<?php

$tst = makeDates(2, 'week');
print_r($tst);

function makeDates($n, $arg){
    $today = new DateTime();
    $str1 =  $today->format("Y-m-d" );             
    $str2 = "T00:00:00.000Z";
    $str3 = "T23:00:00.000Z";
    $ret['end']=  "$str1"."$str3";
        $today->modify( '-' . $n .' '. $arg); 
    $str1 = $today->format('Y-m-d');
    $ret['start']=  "$str1"."$str2";
    $ret['startString'] = $str1;
    return ($ret);
}

function goBack5Days($n){
    $day = new DateTime();
    for ($i = 0; $i < $n; $i++){
        do {
            $day->modify('-1 day');
            $dow = $day->format("w");
            echo "\r\n $dow";
        }
            while ($dow === '0' || $dow == '6');
    }
    $str1 =  $day->format("Y-m-d" );   
    echo "\r\n fo gack ";
    return $str1;
}