import { Injectable , Inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WINDOW } from './window.provider';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
@ Injectable({
  providedIn: 'root'
})
export class GenService {
  urlBase: String;
  constructor(private http: HttpClient) { }

 /*********  get using selStr from GET param  */
 getWithSelString(arg, param?, procedureCode?){
  var url = this .urlBase + "timeInterval.php?&selStr=" + arg;
  if (param)
    url += "&param=" + param;
  if (procedureCode)
    url += "&procedureCode= " + procedureCode;
  console.log("genservice 17 getWithSelString URL is " + url);
  return this .http.get(url)
}
getSessions(arg){
  this .urlBase = 'https://whiteboard.partners.org/esb/FLwbe/REST/JW/';
  var url = this .urlBase + "getSessionsForTimeInterval.php?arg=" + arg;
  return this .http.get(url)
}

  setPlatform(){             // set the dB host for the localhost version
      const wlr = window.location.href;
      console.log("window.location.herf is " + window.location.href);
      if (window.location.href.indexOf('localhost') !== -1 || window.location.href.indexOf('blackboard') !== -1 ){
        this .urlBase = 'http://blackboard-dev.partners.org/dev/FJL/AngProd/';      // get data from BB  for localhost or BB
      }
      if ( window.location.href.indexOf('whiteboard') !== -1 )
      {                   // PROD.
        this .urlBase = 'https://whiteboard.partners.org/esb/FLwbe/AngProd/';      // get data from BB  for localhost or BB
        console.log(" dectected whiteboard so setting urlBase to " + this .urlBase);
      }
      console.log("gen 33  in setPlatForm urlBase is " + this .urlBase);
  }
}
