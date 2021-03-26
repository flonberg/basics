<?php
    $dates = makeMQdates(0);
    print_r($dates);


/**
 * Make dates for a Single Day's data aquisition. Parameter $n determines how many days in future you go. 
 */
function makeMQdates($n){
    $d = new DateTime();                            // dreate a date
    if ($n > 0 )                                    
        $d->modify($n .' day');                     // advance according to argument
    $dates['firstDay'] =  $d->format('Y-m-d');	    // format the early date of interval
    $d->modify($n + 1 .' day');                     // advance 1 day
    $dates['nextDay'] =  $d->format('Y-m-d');	    // format the late date of the interval
    return $dates;
}    