function collect() {

  var scriptProperties = PropertiesService.getScriptProperties();
  Logger.log(scriptProperties.getProperties());
  
  var startTime= (new Date()).getTime();
  scriptProperties.setProperty("startTime", startTime);
  
  var MAX_RUNNING_TIME = parseInt(scriptProperties.getProperty("MAX_RUNNING_TIME"));
  var NUM_TEACHER = parseInt(scriptProperties.getProperty("NUM_TEACHER"));
  
  if(scriptProperties.getProperty("collectfinish")=="true")return;
  var resultSpreadsheet = SpreadsheetApp.openById(scriptProperties.getProperty("RESULT_SPREADSHEET_ID"));
  var UrlSheet = resultSpreadsheet.getSheetByName(scriptProperties.getProperty("URL_SHEET_NAME"));
  
  var UrlSheetHeaders = UrlSheet.getRange(1,1,1,UrlSheet.getLastColumn()).getValues()[0];
  var teaformUrls = UrlSheet.getRange(2,UrlSheetHeaders.indexOf("EditUrl")+1,UrlSheet.getLastRow()-1,1).getValues().map(function(x){return x[0]});

  
  //--------dump the res in teaforms and stdform into a single tempform
  if(scriptProperties.getProperty("MERGE_FORM_ID")!="null"){
    var mergeform = FormApp.openById(scriptProperties.getProperty("MERGE_FORM_ID"));
  }
  else{
    var oneteaformfile = DriveApp.getFileById(FormApp.openByUrl(teaformUrls[0]).getId());
    var tempformfile = DriveApp.getFileById(oneteaformfile.getId()).makeCopy("mergeform", oneteaformfile.getParents().next());
    scriptProperties.setProperty("MERGE_FORM_ID", tempformfile.getId());
    var mergeform = FormApp.openById(tempformfile.getId());
    
  }
  
  //------insert form res: could take time
  if(scriptProperties.getProperty("finmergeform")!="true"){
    var curmergeteaform = parseInt(scriptProperties.getProperty("curmergeteaform"));
    var curmergeteaformres = parseInt(scriptProperties.getProperty("curmergeteaformres"));
    
    for(var i = curmergeteaform; i < teaformUrls.length; i++) {
      var oneteaformresponses = FormApp.openByUrl(teaformUrls[i]).getResponses();
      
      for(var j = curmergeteaformres;j<oneteaformresponses.length;j++){
        var onetempresponse = mergeform.createResponse();
        var oneteaformresponseItems = oneteaformresponses[j].getItemResponses();
        for(var k = 0;k<oneteaformresponseItems.length;k++){
          onetempresponse.withItemResponse(oneteaformresponseItems[k]);
        }
        onetempresponse.submit();
        if((new Date()).getTime()-startTime>MAX_RUNNING_TIME){
          setTrigger(["finmergeform","curmergeteaform","curmergeteaformres"],[false,i,j+1],"collect");
          return;
        }
      }
      curmergeteaformres=0;
    }
    mergeform.setDestination(FormApp.DestinationType.SPREADSHEET, resultSpreadsheet.getId());
    SpreadsheetApp.flush();
    setTrigger(["finmergeform"],[true],"collect");
    return;
  }
  

  //------start to make ResultSheet
  if(scriptProperties.getProperty("ResultSheetSet")!="true"){
    var sheets = resultSpreadsheet.getSheets();
    for(var i=0;i<sheets.length;i++){
      if(sheets[i].getFormUrl()!=null){
        var ResultSheet = sheets[i];
        SpreadsheetApp.flush();
        ResultSheet.setName(scriptProperties.getProperty("ResultSheetName"));
        mergeform.removeDestination();
        scriptProperties.setProperty("ResultSheetSet", true);
        break;
      }
    }
  }
  else{
    var ResultSheet = resultSpreadsheet.getSheetByName(scriptProperties.getProperty("ResultSheetName"));
  }
  
  
  if((new Date()).getTime()-startTime>MAX_RUNNING_TIME){
    setTrigger([],[],"collect");
    return;
  }
  
  var headers = ResultSheet.getRange(1,1, 1, ResultSheet.getLastColumn()).getValues()[0];
  
  //------score caculation

  //Logger.log((new Date()).getTime()-startTime);
  if(scriptProperties.getProperty("ScoreCalDone")!="true"){
    var levelOneColinSheet = getAllIndexes(headers,"Level 1");
    Logger.log("levelOneInd = "+levelOneColinSheet);
    var chcekboxoptNums = mergeform.getItems(FormApp.ItemType.CHECKBOX).map(function(x){return x.asCheckboxItem().getChoices().length});
    
    var checkboxAns = ResultSheet.getRange(2,levelOneColinSheet[0]+1,ResultSheet.getLastRow()-1,levelOneColinSheet.length*5).getValues();
    var scores = [];
    for(var row=0;row<checkboxAns.length;row++){
      var scoreforperson = [];
      for(var item=0;item<levelOneColinSheet.length;item++){      
        var scoreforitem = 0;
        for(var level=0;level<5;level++){
          
          var selectedOpt = checkboxAns[row][item*5+level].toString().split(",");
          
          if(selectedOpt.length==chcekboxoptNums[item*5+level]){
            scoreforitem=scoreforitem+1;
          } else {
            if(selectedOpt=="")scoreforitem+=0;
            else if(selectedOpt.length>=1 && selectedOpt!="")scoreforitem+=0.5;
            break;
          }
        }
        if(scoreforitem==0)scoreforitem="";
        scoreforperson.push(scoreforitem);
      }
      scores.push(scoreforperson);
    }
    ResultSheet.getRange(2,ResultSheet.getLastColumn()+1,ResultSheet.getLastRow()-1,scores[0].length).setValues(scores);
    scriptProperties.setProperty("ScoreCalDone", true);
  }
  
  if((new Date()).getTime()-startTime>MAX_RUNNING_TIME){
    setTrigger([],[],"collect");
    return;
  }
  
  //------collect tea std name
  
  if(scriptProperties.getProperty("StdTeaNameSet")!="true"){
    var resnames = ResultSheet.getRange(2, headers.indexOf("姓名")+1,ResultSheet.getLastRow()-1,1).getValues().map(function(x){return x[0]});
    var formtitles = [];
    for(var i=0;i<teaformUrls.length;i++){
      var oneformtitle = FormApp.openByUrl(teaformUrls[i]).getTitle();
      for(var j=0;j<FormApp.openByUrl(teaformUrls[i]).getResponses().length;j++)formtitles.push(oneformtitle);
    }
    
    for(var i = 0;i<resnames.length;i++){
      if(formtitles[i].search(scriptProperties.getProperty("TEACHER_FORM_PREFIX"))!=-1){
        formtitles[i] = formtitles[i].replace(scriptProperties.getProperty("TEACHER_FORM_PREFIX"),"");
      }
      else{
        formtitles[i] = resnames[i];
        resnames[i] = "null";
      }
    }
    ResultSheet.getRange(2, headers.indexOf("姓名")+1,ResultSheet.getLastRow()-1,1).setValues([].concat(formtitles.map(function(x){return [x]})));
    ResultSheet.insertColumnBefore(1);
    ResultSheet.getRange(2,1,ResultSheet.getLastRow()-1,1).setValues([].concat(resnames.map(function(x){return [x]})));
    scriptProperties.setProperty("StdTeaNameSet",true);
  }
  
  
  if((new Date()).getTime()-startTime>MAX_RUNNING_TIME){
    setTrigger([],[],WAITING_TIME,"collect");
    return;
  }
  //-----adjust header
  headers = ResultSheet.getRange(1,1,1,ResultSheet.getLastColumn()).getValues()[0];
  if(scriptProperties.getProperty("headeradjust")!=true){
    headers[headers.indexOf("姓名")]=scriptProperties.getProperty("STD_NAME_HEADER");
    headers[0] = scriptProperties.getProperty("TEACHER_NAME_HEADER");
    var scorestrs = [];
    var counter = 1;
    for(var i= 0;i<headers.length;i++){
      if(headers[i]==""){
        headers[i]=scriptProperties.getProperty("SCORE_HEADER_PREFIX")+counter;
        scorestrs.push(scriptProperties.getProperty("SCORE_HEADER_PREFIX")+counter);
        counter++;
      }
    } 
    ResultSheet.getRange(1,1,1,ResultSheet.getLastColumn()).setValues([headers]);
    
    headers = ResultSheet.getRange(1,1,1,ResultSheet.getLastColumn()).getValues()[0];
    //Logger.log(headers);
    var vitalcol = [scriptProperties.getProperty("TEACHER_NAME_HEADER"),scriptProperties.getProperty("STD_NAME_HEADER"),"職級","日期"].concat(scorestrs);
    for(var i=0;i<vitalcol.length;i++){
      try{
        ResultSheet.moveColumns(ResultSheet.getRange(1, headers.indexOf(vitalcol[i])+1,ResultSheet.getLastRow(),1), i+1);
        headers = ResultSheet.getRange(1,1,1,ResultSheet.getLastColumn()).getValues()[0];
      }
      catch(e){};
    }
  }
  
}

function getAllIndexes(arr, val) {
  var indexes = [];
  for(var i=0;i<arr.length;i++){
    if(arr[i]==val)indexes.push(i);
  }
  return indexes;
}

