<?php

$hp = fopen("TxtLibFunc.txt", "w+");

$tst = 1;
function goBackHrs($inp, $n){
    global $hp;
    fwrite($hp, "\r\n 888888888 \r\n");
    fwrite($hp, serialize($inp));
    $tmp = new DateTime($inp);
    fwrite($hp, "\r\n 10 \r\n");
    fwrite($hp, serialize($tmp));
    $tmp->modify('-'.$n.' hours');


    $ret = $tmp->format('Y-m-d H:i:s');
    fwrite($hp, "\r\n 20 \r\n");
    fwrite($hp, serialize($ret));
    fwrite($hp, "\r\n ********** \r\n");
    return $ret;

}

