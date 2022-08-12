import { Injectable , Inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WINDOW } from './window.provider';
import {Observable}  from 'rxjs'
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { WFData } from './WfData'
import * as saveAs from 'file-saver';

interface WFargInt {
  startDate: string;
  endDate: string;
  sortBy: string;
  maxDays: number;
  center?: string;
  startWF: string;
  endWF: string;
}

@ Injectable({
  providedIn: 'root'
})
export class GenService {
  urlBase: String;
  WFargs:{}
  constructor(private http: HttpClient) { }

 /*********  get using selStr from GET param  */
 getWithSelString(arg, param?, procedureCode?){
  var url = this .urlBase + "timeInterval.php?&selStr=" + arg;
  let test = 1;
  if (param)
    url += "&param=" + param;
  if (procedureCode)
    url += "&procedureCode= " + procedureCode;
  console.log("genservice 17 getWithSelString URL is " + url);
  return this .http.get(url)
}
getSessions(num, arg){
  this .urlBase = 'https://whiteboard.partners.org/esb/FLwbe/REST/JW/';
  var url = this .urlBase + "getSessionsForTimeInterval.php?num=" + num + "&arg=" + arg;
  return this .http.get(url)
}

  setPlatform(){             // set the dB host for the localhost version
      const wlr = window.location.href;
      console.log("window.location.herf is " + window.location.href);
      if (window.location.href.indexOf('localhost') !== -1 || window.location.href.indexOf('blackboard') !== -1 ){
        this .urlBase = 'https://whiteboard.partners.org/esb/FLwbe/AngProd/';      // get data from BB  for localhost or BB
      }
      if ( window.location.href.indexOf('whiteboard') !== -1 )
      {                   // PROD.
        this .urlBase = 'https://whiteboard.partners.org/esb/FLwbe/AngProd/';      // get data from BB  for localhost or BB
        console.log(" dectected whiteboard so setting urlBase to " + this .urlBase);
      }
      console.log("gen 33  in setPlatForm urlBase is " + this .urlBase);
  }
  getWFdata(): Observable<WFData>{
    //   this .WFargs = {'startDate':'2022-07-01','endDate':'2022-07-02','sortBy':'Modality','maxDays':'8','center':'AllCox',
    //   'startWF':'ScanDate', 'endWF':'Contours and Prescription'};
    console.log("46 genSvce %o", this.WFargs)  
    let url = "https://whiteboard.partners.org/esb/FLwbe/QAdashBd/getData.php";			// proxy for ION
         return this .http.post<WFData>(url, JSON.stringify(this .WFargs))
       }  
   getParams(userid): Observable<WFargInt> {
        let url = "http://blackboard-dev.partners.org/dev/FJL/QAdashBd/getQAparams.php?userid=" + userid;			// proxy for ION
        return this .http.get<WFargInt>(url)
    
      }     
  saveWFparams(args?): Observable<WFData>{
    console.log("46 genSvce %o", this.WFargs)  
    let url = "http://blackboard-dev.partners.org/dev/FJL/QAdashBd/saveQAparams.php";	
          return this .http.post<WFData>(url, JSON.stringify(this .WFargs))
        }      
  dArray: any  = Array     
  saveCSV(data){
    console.log("75 data is %o", data)
    let dArray = Array();                                                   // array for the lines of the CSV file
    let i = 0;                                                              // line index
    dArray[i] = Array();                                                    // create the array for the line
    dArray[i][0] = "Duration [min] \r\n"
    dArray[++i] = Array();
 //   dArray[i][0] = "Plans from " + this .startDateString;
//    if (this .endDateString)
    //  dArray[i][0] += " to " + this .endDateString + "\r\n";
    i++;
    for (let key of Object.keys(data)){                                     // step through the patient lines
        dArray[i] = Array();                                                  // create the array for the line
        dArray[i][0] = key                                      // store the PatientID in the first col
        let k = 1;                                                            // index of data lines
        for (let entry of data[key]){
          if (entry['data']){
          console.log("91 %o", entry)
          dArray[i][k] = Array();
          dArray[i][k][0] = entry['name']
          dArray[i][k].push(entry['data'])
          dArray[i][k][8] = "\r\n"
          k++
          }
         // dArray[i][k] = "\r\n"       
        }
   //     dArray[i][k++] = "\r\n"                                               // line feed to end the line
        i++;                                                                  // go to the next line
      }
      console.log("384 patDate %o", dArray[2])
      let tBlob = new Blob(dArray)
      saveAs(tBlob, 'duration.csv')    
  }      
}
