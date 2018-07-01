function collect() {

  var teachersheetFilename = "teachersheet";
  var ss = SpreadsheetApp.openById(DriveApp.getFilesByName(teachersheetFilename).next().getId());
  
  var sheets = ss.getSheets();
  
  var combinedss = ss.insertSheet("combined");
  
  var boolhadrecordScoreAndCol = false;
  for(var i=0;i<sheets.length;i++){
    if(sheets[i].getName()=='teaformUrlsheet')continue;
    if(!boolhadrecordScoreAndCol){
      var titles = sheets[i].getRange(1,1,1,sheets[i].getLastColumn()).getValues()[0];
      var levelOneColinSheet = getAllIndexes(titles,"Level 1");
      var tempform = FormApp.openByUrl(sheets[i].getFormUrl());
      var chcekboxoptNums = tempform.getItems(FormApp.ItemType.CHECKBOX).map(function(x){return x.asCheckboxItem().getChoices().length});
      boolhadrecordScoreAndCol=true;

    }
    var formname = FormApp.openByUrl(sheets[i].getFormUrl()).getTitle();
    
    //sheet.getRange(row, column, numRows, numColumns)
    var recordrownum = sheets[i].getLastRow()-1;// num of last row with content
    var recordcolnum = sheets[i].getLastColumn();
    if(recordrownum==0)continue;
    var rangeToCopy = sheets[i].getRange(2, 1, recordrownum,recordcolnum);
    var combinedssLastrownum = combinedss.getLastRow();
    
    combinedss.getRange(combinedssLastrownum+1,1,recordrownum,1).setValue(formname);
    rangeToCopy.copyTo(combinedss.getRange(combinedssLastrownum+1,2));
    
  }
  
  
  //------score caculation------
  
  var checkboxAns = combinedss.getRange(1,levelOneColinSheet[0]+2,combinedss.getLastRow(),levelOneColinSheet.length*5).getValues();
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
  combinedss.getRange(1,combinedss.getLastColumn()+1,combinedss.getLastRow(),scores[0].length).setValues(scores);
  
  
  //-------insert first row as header----
  combinedss.insertRowBefore(1);
  var scorestrs = [];
  for(var i= 0;i<scores[0].length;i++)scorestrs[i] = "score "+(i+1)+"";
  titles[titles.indexOf("姓名")] = "老師姓名";
  var headers = ["學生姓名"].concat(titles).concat(scorestrs);
  combinedss.getRange(1,1,1, combinedss.getLastColumn()).setValues([headers]);
  
  
  // adjust std name and teacher name
  var stdnames = combinedss.getRange(2, headers.indexOf("學生姓名")+1,combinedss.getLastRow()-1,1).getValues();
  var teanames = combinedss.getRange(2, headers.indexOf("老師姓名")+1,combinedss.getLastRow()-1,1).getValues();

  for(var i=0;i<stdnames.length;i++){
    if(stdnames[i][0].toString().indexOf("老師版問卷 - ")!=-1)stdnames[i][0] = stdnames[i][0].toString().replace(/老師版問卷 - /g,'');
    else{
      stdnames[i]=teanames[i];
      teanames[i] = ["null"];
    }
  }
  headers = combinedss.getRange(1,1,1,combinedss.getLastColumn()).getValues().map(function(x){return x})[0];
  combinedss.getRange(2, headers.indexOf("學生姓名")+1,combinedss.getLastRow()-1,1).setValues(stdnames);
  combinedss.getRange(2, headers.indexOf("老師姓名")+1,combinedss.getLastRow()-1,1).setValues(teanames);
  
  var vitalcol = ["老師姓名","學生姓名","職級","日期"].concat(scorestrs);
  
  // adjust col postion
  for(var i=0;i<vitalcol.length;i++){
    headers = combinedss.getRange(1,1,1,combinedss.getLastColumn()).getValues().map(function(x){return x})[0];
    try{
      combinedss.moveColumns(combinedss.getRange(1, headers.indexOf(vitalcol[i])+1,combinedss.getLastRow(),1), i+1);
    }
    catch(e){};
  }
  
}

//var fileId = DriveApp.getFileById(id);
//DriveApp.removeFile(fileId);

function getAllIndexes(arr, val) {
  var indexes = [];
  for(var i=0;i<arr.length;i++){
    if(arr[i]==val)indexes.push(i);
  }
  return indexes;
}

