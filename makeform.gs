function makeform(){

  //return if all make form are done
  var scriptProperties = PropertiesService.getScriptProperties();
  Logger.log(scriptProperties.getProperties());
  var startTime= (new Date()).getTime();
  scriptProperties.setProperty("startTime", startTime.toString());
  
  var MAX_RUNNING_TIME = parseInt(scriptProperties.getProperty("MAX_RUNNING_TIME"));
  
  
  var stdFormUrl = scriptProperties.getProperty("URL_STDFORM");
  var stdForm = FormApp.openByUrl(stdFormUrl);
  var stdFormFile = DriveApp.getFileById(stdForm.getId());
  var stdFormDir = DriveApp.getFolderById(stdFormFile.getParents().next().getId());
  var stdformResponses = stdForm.getResponses();
  
  //create teacher spreadsheet if not exist
  if(scriptProperties.getProperty("RESULT_SPREADSHEET_ID")!="null"){
    var resultSpreadsheet = SpreadsheetApp.openById(scriptProperties.getProperty("RESULT_SPREADSHEET_ID"));
    var UrlSheet = resultSpreadsheet.getSheetByName(scriptProperties.getProperty("URL_SHEET_NAME"));
    //Logger.log("there is teacher sheet");
  }
  else{
    var tempFile = DriveApp.getFileById(SpreadsheetApp.create(scriptProperties.getProperty("RESULT_SPREADSHEET_NAME")).getId());
    var resultSpreadsheet = tempFile.makeCopy(scriptProperties.getProperty("RESULT_SPREADSHEET_NAME"), stdFormDir);
    DriveApp.removeFile(tempFile);
    scriptProperties.setProperty("RESULT_SPREADSHEET_ID", resultSpreadsheet.getId());
    var resultSpreadsheet = SpreadsheetApp.openById(resultSpreadsheet.getId());
    var UrlSheet = resultSpreadsheet.getActiveSheet();
    UrlSheet.setName(scriptProperties.getProperty("URL_SHEET_NAME"));
    UrlSheet.appendRow(["EditUrl"].concat((scriptProperties.getProperty("TEACHER_LIST")).split(",")));
  }
  
  //create new forms if not fincreateform
  if(scriptProperties.getProperty("fincreatform")!="true"){
    var curcreatedform = parseInt(scriptProperties.getProperty("numcreatedform"));
    
    for (var i = curcreatedform; i < stdformResponses.length; i++) {
      var formResponse = stdformResponses[i];
      var teaformUrl = createForm(i+1,formResponse,stdForm.getId());
      
      UrlSheet.appendRow([teaformUrl]);
      if((new Date()).getTime()-startTime>MAX_RUNNING_TIME){
        setTrigger(["fincreatform","numcreatedform"],[false,i+1],"makeform");
        return;
      }
    }
    scriptProperties.setProperty("fincreatform", true);
  }
  
  //insert fake res into teaforms
  var teaformUrls = UrlSheet.getRange(2,1,UrlSheet.getLastRow()-1,1).getValues();
  teaformUrls = [].concat.apply([], teaformUrls);
  
  //Logger.log(teaformUrls);
  if(scriptProperties.getProperty("fincreatres")!="true"){
    var numcreatedresform = parseInt(scriptProperties.getProperty("numcreatedresform"));
    var numcreatedresformres = parseInt(scriptProperties.getProperty("numcreatedresformres"));
    var teacherList = scriptProperties.getProperty("TEACHER_LIST").split(",");
    for(var i = numcreatedresform; i < stdformResponses.length; i++) {
      for(var j = numcreatedresformres;j<parseInt(scriptProperties.getProperty("NUM_TEACHER"));j++){
        
        var resUrl = createRes(teaformUrls[i],stdformResponses[i],teacherList[j]);
        UrlSheet.getRange(i+2, j+2).setValue(resUrl);
        Logger.log("form i = "+i+", response j ="+j+" "+((new Date()).getTime()-startTime));
        if((new Date()).getTime()-startTime>MAX_RUNNING_TIME){
          setTrigger(["fincreatres","numcreatedresform","numcreatedresformres"],[false,i,j+1],"makeform");
          return;
        }
      }
      numcreatedresformres=0;
    }
  } 
  
  scriptProperties.setProperty("fincreatres", true);
  scriptProperties.setProperty("makeformfinish", true);
  UrlSheet.appendRow([stdFormUrl]);
  scriptProperties.setProperty("total_time_passed",0);
}

function setTrigger(propertykeys,propertyvalues,FUN){
  SpreadsheetApp.flush();
  var scriptProperties = PropertiesService.getScriptProperties();
  
  for(var i = 0;i<propertykeys.length;i++)scriptProperties.setProperty(propertykeys[i], propertyvalues[i]);
  
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++) {
    ScriptApp.deleteTrigger(allTriggers[i]);
  }
  var total_time_passed = parseInt(scriptProperties.getProperty("total_time_passed"))+((new Date()).getTime()-parseInt(scriptProperties.getProperty("startTime")));
  //Logger.log(total_time_passed);
  
  if(total_time_passed>3400000){
    scriptProperties.setProperty("total_time_passed",0);
    ScriptApp.newTrigger(FUN).timeBased().after(parseInt(scriptProperties.getProperty("WAITING_TIME_TMR"))).create();
  }
  else{
    scriptProperties.setProperty("total_time_passed",total_time_passed);
    ScriptApp.newTrigger(FUN).timeBased().after(parseInt(scriptProperties.getProperty("WAITING_TIME"))).create();
  }
  
  
}


function createForm(stdId,formResponse,stdFormId){
  //duplicate the stdForm, as a teaForm
  var stdformFile = DriveApp.getFileById(stdFormId);
  
  var teaformFile = stdformFile.makeCopy(stdId+"", stdformFile.getParents().next());
  var teaform = FormApp.openById(teaformFile.getId());
  
  var stdresItems = formResponse.getItemResponses();
  // (1)change the form title to 老師版問卷+stdname
  // (2)record the demographic data
  
  var noncheckboxresStrs = [];
  for(var i = 0 ; i < stdresItems.length ; i ++){
    if(stdresItems[i].getItem().getType()!=FormApp.ItemType.CHECKBOX){
      var stdResItemTitle = stdresItems[i].getItem().getTitle();
      var stdResItemRes = stdresItems[i].getResponse().toString();
      if(stdResItemTitle == "姓名"){
        //var stdname = stdResItemRes;
        teaform.setTitle(PropertiesService.getScriptProperties().getProperty("TEACHER_FORM_PREFIX")+stdResItemRes);
       }

      if(stdResItemTitle.match(/本次評核所花的時間/g)==null){
         noncheckboxresStrs.push(stdResItemTitle+":  "+stdResItemRes);
      }
    }
  }

  
  var pagebreaks = teaform.getItems(FormApp.ItemType.PAGE_BREAK);
  var pagebreakinds=[];
  for(var i=0;i<pagebreaks.length;i++)pagebreakinds.push(pagebreaks[i].asPageBreakItem().getIndex());
  
  var secHeader = teaform.addSectionHeaderItem();
  secHeader.setTitle(PropertiesService.getScriptProperties().getProperty("STD_RES_PERSONAL_TITLE"));
  secHeader.setHelpText(noncheckboxresStrs.join("\n"));
  
  for(var i = 0;i<pagebreakinds.length;i++){
    secHeader.duplicate();
    teaform.moveItem(teaform.getItems().length-1, pagebreakinds[i]+i+1);
  }
  teaform.moveItem(teaform.getItems().length-1, 0);
  
  return teaform.getEditUrl();
}


function createRes(teaformUrl,stdformResponse,teachername){
  //-------second create fake reponses(only with checkbox ans) for each teacher
  var newtearesponse ="";
  var stdresItems = stdformResponse.getItemResponses();
  var teaform = FormApp.openByUrl(teaformUrl);
  
  newtearesponse = teaform.createResponse();
    
  for(var i = 0 ; i < stdresItems.length ; i ++){
    if(stdresItems[i].getItem().getType()==FormApp.ItemType.CHECKBOX)newtearesponse.withItemResponse(stdresItems[i]);
    
    //自動填入的內容
    if(stdresItems[i].getItem().getTitle()=="姓名"){
      newtearesponse.withItemResponse(stdresItems[i].getItem().asTextItem().createResponse(teachername));
    }
    else if(stdresItems[i].getItem().getTitle()=="日期"||stdresItems[i].getItem().getTitle()=="所屬醫院"||stdresItems[i].getItem().getTitle()=="職級"){
      newtearesponse.withItemResponse(stdresItems[i]);
    } 
  }
    
  newtearesponse = newtearesponse.submit();
  return newtearesponse.getEditResponseUrl();
}
