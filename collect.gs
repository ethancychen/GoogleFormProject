{\rtf1\ansi\ansicpg950\cocoartf1561\cocoasubrtf400
{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww10800\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 function myFunction() \{\
  var teachersheetFilename = "teachersheet";\
  var ss = SpreadsheetApp.openById(DriveApp.getFilesByName(teachersheetFilename).next().getId());\
  \
  var sheets = ss.getSheets();\
  \
  var combinedss = ss.insertSheet("combined");\
  \
  for(var i=0;i<sheets.length;i++)\{\
    if(sheets[i].getName()=='teaformUrlsheet')continue;\
    var formurl = sheets[i].getFormUrl();\
    \
    //sheet.getRange(row, column, numRows, numColumns)\
    var recordrownum = sheets[i].getLastRow()-1;// num of last row with content\
    var recordcolnum = sheets[i].getLastColumn();\
    var rangeToCopy = sheets[i].getRange(2, 1, recordrownum,recordcolnum);\
    var combinedssLastrownum = combinedss.getLastRow();\
    \
    combinedss.getRange(combinedssLastrownum+1,1,recordrownum,1).setValue(formurl);\
    rangeToCopy.copyTo(combinedss.getRange(combinedssLastrownum+1,2));\
    \
  \}\
  var rawAns = combinedss.getRange(1,2,combinedss.getLastRow(),combinedss.getLastColumn()-1).getValues();\
  var Ans = rawAns.map(function(x)\{return x.map(function(y)\{Logger.log(y.toString());return y.toString().replace(/\\( V \\)/g,'');\} )\});\
  combinedss.getRange(1,2,combinedss.getLastRow(),combinedss.getLastColumn()-1).setValues(Ans);\
  \
\}\
\
//var fileId = DriveApp.getFileById(id);\
//DriveApp.removeFile(fileId);\
}