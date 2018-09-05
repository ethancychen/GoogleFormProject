function reset() {
  //This script serve 2 purposes:
  //(1) An interface for setting preference
  //(2) Reseting the execution progress
  
  
  
  var scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.deleteAllProperties();
  
  //-----------User settings------------
  //1.被評核者表單連結
  var URL_STDFORM = 'https://docs.google.com/forms/d/13Bm1A2a5lU472VY-d_TCCv36Cq-RobkUfD23ZoEa17c/edit';
  
  
  //2.評核者設定
  //評核者姓名清單
  var TEACHER_LIST = ["teacher 1",
                      "teacher 2"
                      ];
  
  //評核者所填寫表單的標題前綴
  //例如設定為"aaa"，則評核者看到的標題為  "aaa"+學生姓名
  var TEACHER_FORM_PREFIX = "老師版問卷 - ";
  var STD_RES_PERSONAL_TITLE = "學生基本資料";
  
  
  //3.紀錄填寫連結和最終統計結果的試算表
  //試算表檔名
  var RESULT_SPREADSHEET_NAME = "teacherspreadsheet";
  //產生表單的連結的工作表名稱
  var URL_SHEET_NAME = "teaformUrlsheet";
  //統計所有作答的工作表名稱
  var ResultSheetName = "ResultSheet";
  //統計所有作答的工作表 標題列中被評核者與評核者的欄位名稱
  var STD_NAME_HEADER = "學生姓名";
  var TEACHER_NAME_HEADER = "老師姓名";
  //統計所有作答的工作表 標題列中計算各問題得分的欄位名稱前綴
  //例如設定為"score"，則第一題的欄位就會叫做"score1"、第二題"score2"
  var SCORE_HEADER_PREFIX = "score "; 
  
  //-----------User settings END------------
  

  
  
  //User settings
  scriptProperties.setProperty("URL_STDFORM", URL_STDFORM);
  scriptProperties.setProperty("TEACHER_LIST", TEACHER_LIST.toString());
  scriptProperties.setProperty("NUM_TEACHER", TEACHER_LIST.length);
  scriptProperties.setProperty("RESULT_SPREADSHEET_NAME", RESULT_SPREADSHEET_NAME);
  scriptProperties.setProperty("URL_SHEET_NAME", URL_SHEET_NAME);

  scriptProperties.setProperty("TEACHER_FORM_PREFIX", TEACHER_FORM_PREFIX);
  scriptProperties.setProperty("STD_RES_PERSONAL_TITLE", STD_RES_PERSONAL_TITLE);
  
  scriptProperties.setProperty("ResultSheetName",ResultSheetName);
  
  scriptProperties.setProperty("STD_NAME_HEADER", STD_NAME_HEADER);
  scriptProperties.setProperty("TEACHER_NAME_HEADER", TEACHER_NAME_HEADER);
  scriptProperties.setProperty("SCORE_HEADER_PREFIX", SCORE_HEADER_PREFIX);
  
  //Execution settings
  // The quota for Google script service execution
  // https://developers.google.com/apps-script/guides/services/quotas
  scriptProperties.setProperty("MAX_RUNNING_TIME",240000);
  scriptProperties.setProperty("WAITING_TIME",20000);
  scriptProperties.setProperty("WAITING_TIME_TMR",86400000-240000*10);
  

  //Progress tracking variables reset
  scriptProperties.setProperty("total_time_passed",0);
  //makeform.gs
  scriptProperties.setProperty("makeformfinish",false);
  scriptProperties.setProperty("RESULT_SPREADSHEET_ID","null");
  scriptProperties.setProperty("fincreatform",false);
  scriptProperties.setProperty("numcreatedform",0);
  scriptProperties.setProperty("fincreatres",false);
  scriptProperties.setProperty("makeformfinish",false);
  scriptProperties.setProperty("numcreatedresform",0);
  scriptProperties.setProperty("numcreatedresformres",0);
  //collect.gs
  scriptProperties.setProperty("collectfinish",false);
  scriptProperties.setProperty("MERGE_FORM_ID","null");
  scriptProperties.setProperty("finmergeform",false);
  scriptProperties.setProperty("curmergeteaform",0);
  scriptProperties.setProperty("curmergeteaformres",0);
  scriptProperties.setProperty("ResultSheetSet",false);
  scriptProperties.setProperty("ScoreCalDone",false);
  scriptProperties.setProperty("StdTeaNameSet",false);
  scriptProperties.setProperty("headeradjust",false);
  //Clear all triggers
  deleteTrigger();
  Logger.log(PropertiesService.getScriptProperties().getProperties());
}


function deleteTrigger() {
  
  // Loop over all triggers and delete them
  var allTriggers = ScriptApp.getProjectTriggers();
  //Logger.log(allTriggers[0].getTriggerSource());
  if(allTriggers==[])return;
  for (var i = 0; i < allTriggers.length; i++) {
    ScriptApp.deleteTrigger(allTriggers[i]);
  }
}
