<?php

$hp = fopen("TxtLibFunc.txt", "w+");
function goBackHrs($inp, $n){
    global $hp;
    $tmp = new DateTime($inp);
    $tmp->modify('-'.$n.' hours');
    $ret = $tmp->format('Y-m-d H:i:s');
    return $ret;
}

