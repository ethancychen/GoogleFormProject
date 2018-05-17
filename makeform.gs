{\rtf1\ansi\ansicpg950\cocoartf1561\cocoasubrtf400
{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww10800\viewh8400\viewkind0
\pard\tx566\tx1133\tx1700\tx2267\tx2834\tx3401\tx3968\tx4535\tx5102\tx5669\tx6236\tx6803\pardirnatural\partightenfactor0

\f0\fs24 \cf0 //ref\
// class form https://developers.google.com/apps-script/reference/forms/form\
//item types    https://developers.google.com/apps-script/reference/forms/item-type \
//item interface  https://developers.google.com/apps-script/reference/forms/item\
//check box item  https://developers.google.com/apps-script/reference/forms/checkbox-item  \
//class formresponse    https://developers.google.com/apps-script/reference/forms/form-response\
\
//for debugging\
  //Logger.log(str)\
  //could use ctrl+enter to see logs\
\
function gen()\{\
  var ss = SpreadsheetApp.create("teachersheet");\
  var ssId = ss.getId();\
  var teaformUrlsheet = ss.getActiveSheet().setName("teaformUrlsheet");;\
  \
  studentFormurl = 'https://docs.google.com/forms/d/1ldU6QPBmCG895YuRiZJ4AxmtBuE-x4rPuSvmIL5h6Ls/edit';\
  var studentForm = FormApp.openByUrl(studentFormurl);\
  var title = studentForm.getTitle();\
  var items = studentForm.getItems();\
  var formResponses = studentForm.getResponses();\
  \
  \
  for (var i = 0; i < formResponses.length; i++) \{\
   var formResponse = formResponses[i];\
   var teaform = createForm(title,items,formResponse,ssId);\
   teaformUrlsheet.appendRow([teaform.getPublishedUrl()]);\
  \}\
  \
  \
\}\
\
function createForm(formtitle,items,formResponse,ssId) \{  \
   //formResponse\
  var stdresponseitems = formResponse.getItemResponses();//[itemres,itemres...]\
  var stdtitles = [];\
  for(var i=0;i<stdresponseitems.length;i++)\{\
    stdtitles.push(stdresponseitems[i].getItem().getTitle());\
  \}\
  \
  //createform\
  var form = FormApp.create('0')  \
       .setTitle(formtitle);\
  \
  //\
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ssId);  \
  //item\
  for (var i = 0; i < items.length; i++) \{    \
    var item = items[i];\
    var type = item.getType();\
    \
    switch(type) \{\
    case FormApp.ItemType.PAGE_BREAK:\
        form.addPageBreakItem();\
        \
        break;\
    case FormApp.ItemType.ParagraphTextItem:\
        form.addParagraphTextItem().setTitle(item.asParagraphTextItem().getTitle());\
        \
        break;\
    case FormApp.ItemType.CHECKBOX:\
        var cloneitem = form.addCheckboxItem();\
        //item title\
        var title = item.asCheckboxItem().getTitle();\
        cloneitem.setTitle(title);\
        \
        //item choices\
        var choices =item.asCheckboxItem().getChoices();\
        //About getChoices error:\
        //item here is in item generic class(including checkboxitem), not specific checkboxitem class\
        // .getChoice method exist in multiple classes\
        //you usually want to call a method like Element.asParagraph() to cast the object back to a precise class\
        var choicesStrs = [];\
        for(var j=0;j<choices.length;j++)\{choicesStrs.push(choices[j].getValue())\}\
        \
        if(stdtitles.indexOf(title)!=-1)\{\
          var stdchoicesStrs = stdresponseitems[stdtitles.indexOf(title)].getResponse();\
          \
          for(var j=0;j<stdchoicesStrs.length;j++)\{\
            var choseind = choicesStrs.indexOf(stdchoicesStrs[j]);\
            choicesStrs[choseind]=choicesStrs[choseind] +" ( V )";\
          \}\
        \}\
        cloneitem.setChoiceValues(choicesStrs);\
        break;\
    default:\
        break;\
    \}\
   \}//for item \
  return form;\
    \
 \}  }