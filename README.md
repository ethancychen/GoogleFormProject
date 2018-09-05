# GoogleFormProject

Using Google App Script

The reset.gs does:
Preference setting and progress reset.

The makeform.gs does:  
1.Given a form( say form "Ori" ), create multiple form based on the responses in "Ori". 
2.Creat "fake" reponses to the forms created.
3.Summarize the URLs for the forms into a Spreadsheet.

THe collect.gs does:  
1.Collect all the forms'(including "Ori") responses and cacluate the scores based on some criteria
2.Put them into a new single worksheet in the spreadsheet.

All these scripts support interrupt-resuming. That is, the excuting would stop when elpased time near the quota for the single execution quota announced by Google. After a couple of seconds the service would carry on the execution from the progress that it drop out last time.
