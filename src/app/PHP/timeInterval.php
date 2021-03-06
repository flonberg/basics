<?php
/*********  save to    'http://blackboard-dev.partners.org/dev/FJL/AngProd/';  */
header("Access-Control-Allow-Origin: *");	
require_once "sql_libFL.php";                    
require_once "libFuncs.php";                    
$fp = fopen("./log/timeInterval.txt", "w+");
$cp = fopen("./log/CSVtimeInterval.csv", "w");

$nowDT = new DateTime();
$now = $nowDT->format("m-d-Y H:i:s");
fwrite($fp, "\r\n ". $now);
fwrite($cp, "\r\n $now ,");
$dp = fopen("./log/DBGtimeInterval.txt", "w+");
$nowDT = new DateTime();
$now = $nowDT->format("m-d-Y H:i:s");
fwrite($fp, "\r\n ". $now);
//fwrite($fp, "\r\n ". $_GET['selStr']);
$selStr = $_GET['selStr'];
$getStruct = print_r($_GET, true); fwrite($fp, "\r\n $getStruct"); 

if (isset($_GET['param']) ){
  if (strcmp($_GET['param'], 'last30') == 0   )                                     // default is to go back 30 days in getting data from ProtomTimine table
    $back30Days = date('yy-m-d', strtotime('-30 days'));
  if (strcmp($_GET['param'], 'last20') == 0   )
    $backDays = date('yy-m-d', strtotime('-20 days'));  
//$selStr .= " AND StartDateTime > CONVERT(VARCHAR, '$backDays', 103) ";
//$startPhrase .= " AND StartDateTime > CONVERT(VARCHAR, '$backDays', 103) ";

fwrite($fp, "\r\n $selStr");

}
//$selStr = "SELECT StartDateTime, EndDateTime, ProcedureCode, PatientID FROM ProtomTiming";

$dB = new getDBData($selStr, $handle);
fwrite($fp, "\r\n dB is \r\n");
ob_start(); var_dump($dB); $data = ob_get_clean(); fwrite($fp, $data);
$i = 0;
$k = 0;
$totalWritten = 0;
$row = array();
$total = array();        
$timeVproc = array();                                                           // used to compute Average for PatID Activities
$numActivities = array();                                                           // used to compute Average for PatID Activities
while ($assoc = $dB->getAssoc())
{ 
 // fwrite($fp, "\r\n activityiID is ". $assoc['ActivityID'] ." patientID is ". $assoc['PatientID']." starteDateTime is ".$assoc['StartDateTime']->format('Y-m-d') );
    $duration = $assoc['StartDateTime']->diff($assoc['EndDateTime']);               // the DURATION
    $ssss = print_r($assoc, true);                              // DO NOT REMOVE -- the next line does NOT work without this???
    $row['Rdata'][$i][0] =strtotime($assoc['StartDateTime']->date) * 1000;            // StartDateTime --  HighCharts uses milliSec since Epoch
    $row['Rdata'][$i][1] = $duration->i;      
    $row['Rdata'][$i++][2] = $assoc['ProcedureCode'];                                // add ProcedureCode
    $backNHours = goBackHrs($assoc['StartDateTime']->date, 15 );                    //  correct the time, time in Platform is11 hours later
    $timeIndex =  strval(strtotime($backNHours));                                           
                             // 

    if(preg_match('/(^[0-9]{3}-[0-9]{2}-[0-9]{2}$)/i', trim($assoc['PatientID'])))    // match 'nnn-nn-nn' to select patients
    {
      fwrite($fp, "\r\n $timeIndex --- ". $assoc['ProcedureCode'] ." --888- ". substr($assoc['StartDateTime']->date,0,11))." --- ". $assoc['PatientID'];
      $timeVproc[$timeIndex] =  $assoc['ProcedureCode'];  
      if (!isset( $row['Patients'][$assoc['PatientID']]  )){                      // if datum for this patients NOT exist
        

        $row['Patients'][$assoc['PatientID']][0] = array(strtotime($backNHours) * 1000, $duration->i, $assoc['ProcedureCode']);    // create it    

        $total[$assoc['PatientID']] = $duration->i;
        $numActivities[$assoc['PatientID']] = 1;
      }
      else                                                            // if it DOES 
      {     
          $tmp =  array(strtotime($backNHours) * 1000, $duration->i, $assoc['ProcedureCode']);    // make  the datum 
          array_push($row['Patients'][$assoc['PatientID']], $tmp);                    // push the datum into the array. 
          $total[$assoc['PatientID']] += $duration->i;    
          $numActivities[$assoc['PatientID']]++;

          }  
      $row['categoriesByKey'][$assoc['PatientID']] = $assoc['PatientID'];                                   // for use as X-axis labels                
      $k++;
    }
}
fwrite($dp, "\r\n Time of Procedure in Epoch msec, Duratino of the Procedure in minutes, DICOm ID \r\n:w");
$dbg = print_r($row['Patients'], true); fwrite($dp, $dbg);
/////////  calculate the Average forEach Patient \\\\\\\\\\\\\\\\\\\
$row['averageByKey'] = array();
$row['average'] = array();
foreach ($total as $key => $val ){
  fwrite($fp, "\r\n total is  ". $val);
  array_push($row['average'], round($val/$numActivities[$key],1));
 $row['averageByKey'][$key]= round($val/$numActivities[$key],1);                        // make category array by key to avoid duplication
}

/////////////  copy category to simple array  \\\\\\\\
$row['categoriesForAv'] = array();
foreach ($row['categoriesByKey'] as $key => $val)
  array_push( $row['categoriesForAv'], $val);

/////////  calculate the Standard Deviation     \\\\\\\\\\\\
$i = 0; $aveKey = 0;
$row['error'] = array();
foreach ($row['Patients'] as $key=>$val ){
  fwrite($fp, "\r\n 80  key is $key ");

  $tst = 0; $i = 0;
  foreach ($val as $kkey=>$vval){
    $tst += pow(($vval[1] - $row['average'][$aveKey]), 2);
    $i++;
    fwrite($fp, "\r\n kkey is $kkey vval is". $vval[1]." average is ". $row['average'][$aveKey]." tst is ". $tst);
  }
  $sigma = sqrt($tst/$i);
  fwrite($fp, "\r\n sigma is $sigma");
  $row['sigma'][$key] = round($sigma,1);
  $errorUp =    $row['average'][$aveKey] +  $row['sigma'][$key];
  $errorDown =  $row['average'][$aveKey] -  $row['sigma'][$key];
  fwrite($fp, "\r\n 74 key is $key average is ". $row['average'][$aveKey]." errorUp is $errorUp  errorDown is $errorDown");
  $tmp2 =  array($errorUp , $errorDown);
  array_push($row['error'],$tmp2);
  $aveKey++;
}
if ($debug2 == 1){
  fwrite($fp, "\r\n $tring");
  fflush($fp);
  }
$row['PCode'] = $timeVproc;  
$st = print_r($row['Patients'], true);  fwrite($fp, "\r\n  69 \r\n ". $st);  
$st = print_r($row['average'], true);  fwrite($fp, "\r\n  69 \r\n ". $st);  
$row['total'] = $k;
//fwrite($cp, "\r\n Total ". $row['total']);
//$row['totWritten'] = writeCSV($cp, $row['Patients']);

echo json_encode($row);
exit();
/*
 
function writeCSV($cp, $dB){
  $procedures = array("121726"=>"Treatment", "121724"=>"VSim", "121733"=>"QA");
  if (strpos($_GET['procedureCode'], '726') > 0 )
    $proc = "Treatment";
  if (strpos($_GET['procedureCode'], '724') > 0 )
    $proc = "VSim";
  if (strpos($_GET['procedureCode'], '733') > 0 )
    $proc = "QA";
  $startPhrase = "\r\n Duration of  ".$proc ."  \r\n From ". $_GET['param']; 
  fwrite($cp, $startPhrase);
  $totWritten = 0;
  foreach ($dB as $key=>$val){
    fwrite($cp, "\r\n $key,");               // the patientID
    foreach ($val as $kkey => $vval){             // the Activities
  //    fwrite($cp, $kkey );
      foreach ($vval as $key3 => $val3){
     if ($key3 == '1')
      {
        fwrite($cp,  $val3 .",");
        $totWritten++;}
      }
    }
  }
  return $totWritten;
}
*/

function makeLast30(){
  $today = date('y-m-d');
  $d2 = date('y-m-d', strtotime('-30 days'));
}
/**
 * create the bins
 */
function makeHistBins($binSize)
{
  global $fp;
  $max = 10;
  for ($i = 0; $i < $max; $i++){
  //  $bins[$i]['Low']= 0 + $i * $binSize;
  //  $bins[$i]['High'] = ($i +1) * $binSize;
    
    $bins['count'][$i] = 0;
    $bins['name'][$i] = " ". $i * $binSize ." to ". ($i + 1 ) * $binSize;
  }
  $ss = print_r($bins, true); fwrite($fp, $ss);
  return $bins;
}
