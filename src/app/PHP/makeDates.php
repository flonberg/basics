<?php

$tst = makeDates(1);
print_r($tst);

function makeDates($arg){
    $today = new DateTime();
    $str1 =  $today->format("Y-m-d" );             
    $str2 = "T00:00:00.000Z";
    $str3 = "T23:00:00.000Z";
    $ret['end']=  "$str1"."$str3";
    if ($arg == 1)
        $str1 = goBack5Days();
    $ret['start']=  "$str1"."$str2";
    return ($ret);
}

function goBack5Days(){
    $day = new DateTime();
    for ($i = 0; $i < 5; $i++){
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