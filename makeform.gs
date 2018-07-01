function gen(){
  //↓↓↓↓↓↓↓↓↓↓↓↓↓把原始表單的網址貼在引號中↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
  
  var stdFormUrl = 'https://docs.google.com/forms/d/1tuxItTbOBeECbL72PsWOgBiaF-XYn1ZVczinIqNpp20/edit';
  
  //↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
  
  
  var stdForm = FormApp.openByUrl(stdFormUrl);
  var stdFormFile = DriveApp.getFileById(stdForm.getId());
  
  
  
  //create teacher sheet
  var stdFormDir = DriveApp.getFolderById(stdFormFile.getParents().next().getId());
  var tempFile = DriveApp.getFileById(SpreadsheetApp.create("teachersheet").getId());
  var tsheetFile = tempFile.makeCopy("teachersheet", stdFormDir);
  DriveApp.removeFile(tempFile);
  var tsheetId = tsheetFile.getId();
  var tsheet = SpreadsheetApp.openById(tsheetId);
  //dump stdform res into teacher sheet
  stdForm.setDestination(FormApp.DestinationType.SPREADSHEET,tsheetId);
  
  //start to make form
  var stdformResponses = stdForm.getResponses();
  
  var actsheet = tsheet.appendRow(["Url"]);
  actsheet.setName("teaformUrlsheet");
  for (var i = 0; i < stdformResponses.length; i++) {
   var formResponse = stdformResponses[i];
   var teaformUrl = createForm(i+1,formResponse,tsheetId,stdForm.getId());
    
   actsheet.appendRow([teaformUrl]);
  }
        
}

function createForm(stdId,formResponse,tsheetId,stdFormId){
  
  //duplicate the stdForm, as a teaForm
  var stdformFile = DriveApp.getFileById(stdFormId);
  
  var teaformFile = stdformFile.makeCopy(stdId+"", stdformFile.getParents().next());
  
  
  var teaform = FormApp.openById(teaformFile.getId());
  teaform.setTitle("老師版問卷");
  teaform.setDestination(FormApp.DestinationType.SPREADSHEET, tsheetId);
  //for checkboxes
  var stdresItems = formResponse.getItemResponses();
  var teaformItems = teaform.getItems();
  //for noncheckboxes
  var noncheckboxTitles = [];
  var noncheckboxresStrs = [];
  
  
  var noncheckboxfieldInd = [];
  for(var i=0;i<stdresItems.length;i++){
    //responseItem不是item, 且包含item本身
    //responseItem.getItem()
    var resItem = stdresItems[i];
    switch(resItem.getItem().getType()){
      //A generic form item that contains properties common to all items, such as title and help text. Items can be accessed or created from a Form.
      //To operate on type-specific properties, use getType() to check the item's ItemType,
      //then cast the item to the appropriate class using a method like asCheckboxItem().
      //====>也就是說 對於一個 item 可以直接.getTitle()   如果要使用特別類型item才有的方法\屬性，要先.asXXItem()
      case FormApp.ItemType.CHECKBOX:
        
        /*
        var stdcheckboxItem = resItem.getItem().asCheckboxItem();
        var teacheckboxItemId = teaformItems[stdcheckboxItem.getIndex()].getId();
        //Logger.log(resItem.getItem().getId());
        //Logger.log(teacheckboxItemId);
        //Logger.log(stdcheckboxItem.getIndex());
        
        var stdcheckboxItemres = resItem.getResponse();//String[]
        
        
        for(var j = 0;j<stdcheckboxItemres.length;j++){
          prefillUrl = prefillUrl+"entry."+teacheckboxItemId+"="+stdcheckboxItemres[j]+"&";          
        }
       Logger.log(prefillUrl);        
      */
        break;
      //not checkbox, with response
      case FormApp.ItemType.CHECKBOX_GRID:
      case FormApp.ItemType.GRID:
      case FormApp.ItemType.DATE:
      case FormApp.ItemType.DATETIME:
      case FormApp.ItemType.DURATION:
      case FormApp.ItemType.MULTIPLE_CHOICE:
      case FormApp.ItemType.LIST:
      case FormApp.ItemType.PARAGRAPH_TEXT:
      case FormApp.ItemType.TEXT:
      case FormApp.ItemType.TIME:
        var noncheckboxTitle = resItem.getItem().getTitle();
        var resNotheckboxStr = resItem.getResponse();
        //Logger.log(noncheckboxTitle);
        //Logger.log(typeof(noncheckboxTitle)+"");
        
        if(noncheckboxTitle.indexOf("姓名")!=-1){
          teaform.setTitle("老師版問卷 - "+resNotheckboxStr);
        }
        if(noncheckboxTitle.match(/本次評核所花的時間/g)==null){
          noncheckboxfieldInd.push(resItem.getItem().getIndex());
          noncheckboxresStrs.push(noncheckboxTitle+": "+resNotheckboxStr.toString());
        }
        break;
      //not checkbox, without response
      default:
        //Logger.log("default");
    }
  }
  var pagebreaks = teaform.getItems(FormApp.ItemType.PAGE_BREAK);
  var pagebreakinds=[];
  for(var i=0;i<pagebreaks.length;i++)pagebreakinds.push(pagebreaks[i].asPageBreakItem().getIndex());
  //Logger.log(pagebreakinds);
  
  
  var secHeader = teaform.addSectionHeaderItem();
  secHeader.setTitle("學生基本資料");
  secHeader.setHelpText(noncheckboxresStrs.join("\n"));
  
  
  for(var i = 0;i<pagebreakinds.length;i++){
    secHeader.duplicate();
    teaform.moveItem(teaform.getItems().length-1, pagebreakinds[i]+i+1);
  }
  teaform.moveItem(teaform.getItems().length-1, 0);
  
  //Logger.log(noncheckboxfieldInd);
  return teaform.getPublishedUrl()+"?"+formResponse.toPrefilledUrl().split("?")[1];

}

