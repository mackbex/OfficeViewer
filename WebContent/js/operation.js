"use strict";
$.Operation  = {
		execute : function(target, el, objData, elTarget) {

			var deferred = $.Deferred();

			var command 	= null;
			
			if(typeof(el) === 'string' || el instanceof String)
			{
				command 	= el;
			}
			else
			{
				command 	= $(el).attr("command");
			}
			
			
			var csFlag =  false;
			if($.OfficeXPI != null) {
				csFlag = ($.OfficeXPI.isDetected ==  $.OfficeXPI.XPI_ENUM.DETECTED) ? true : false;
			}
			
			switch(command)
			{
			default :
				if(!$.Common.isBlank(objData.SLIP_IRN)) {
					$.Operation.openViewer(target, objData);
				}
				else {
					$.Operation.openAttach(target, objData);
				}

				break;
			case "ROTATE_CW" : 
				$.Operation.Rotate_Slip(target, objData, 90);
				break;
			case "ROTATE_180" : 
				$.Operation.Rotate_Slip(target, objData, 180);
				break;
			case "ROTATE_CCW" : 
				$.Operation.Rotate_Slip(target, objData, 270);
				break;
			case "OPEN_COMMENT" : 
				$.Operation.openComment(target);
				break;
			case "OPEN_HISTORY" : 
				$.Operation.openHistory(target);
				break;
			case "REMOVE_ALL" : 
				$.Operation.removeAll(target);
				break;
			case "REMOVE_SLIP" : 
				$.Operation.removeItem(target, objData);
				break;
			case "REMOVE_MENU_SLIP" : 
				$.Operation.removeMenuItem(target, objData, elTarget);
				break;
			case "REMOVE_MENU_ATTACH" : 
				$.Operation.removeMenuItem(target, objData, elTarget);
				break;
			case "ADD_SLIP" : 
				$.Operation.addSlip(target, objData);
				break;
			case "ADD_SCAN" :
				$.Operation.addScanner(target, objData);
				break;
			case "ADD_AFTER" : 
				$.Operation.addAfter(target, objData);
				break;
			case "ADD_ATTACH" : 
				$.Operation.addAttach(target, objData);
				break;
			case "VIEW_PROPERTY" : 
				$.Operation.viewProperty(target, objData);
				break;
			case "PRINT_SLIP" : 
				$.Operation.Print_Slip(target, objData);
				break;
			case "ADD_CAPTURE" : 
				$.Operation.addCapture(target, objData);
				break;
			case "ADD_URL" : 
				$.Operation.addURL(target, objData);
				break;
			case "ADD_XML" : 
				$.Operation.addTax(target, objData);
				break;
			case "MODIFY_AFTER" : 
				$.Operation.modifyAfter(target,objData);
				break;
			case "ADD_URL_LINK" : 
				$.Operation.addURL_Link(target, objData);
				break;
			case "ADD_SEARCH" : 
				$.Operation.Add_FromServer(target, objData);
				break;
			case "VIEW_ORIGINAL_SLIP" : 
				$.Operation.openViewer(target, objData);
				break;
			case "VIEW_ORIGINAL_ATTACH" : 
				$.Operation.openAttach(target, objData);
				break;
			case "DOWN_ORIGINAL_ATTACH" :
				$.Operation.downloadAttach(target, objData);
				break;
			case "MOVE_UP_INDEX" :
				deferred = $.Operation.moveUpIndex(target, objData);
				break;
			case "MOVE_DOWN_INDEX" :
				deferred = $.Operation.moveDownIndex(target, objData);
				break;
			case "DOWN_ORIGINAL_SLIP" : 
				$.Operation.downloadOriginal(target, objData);
				break;
			case "DOWNLOAD_CS" : 
				$.Operation.Open_DownloadPage();
				break;
			case "WRITE_COMMENT" :
				$.Operation.Write_Comment(target, objData);
				break;
			case "MODIFY_COMMENT" :
				deferred = $.Operation.Modify_Comment(target, objData);
				break;
			case "REMOVE_COMMENT" :
				$.Operation.Remove_Comment(target, objData);
				break;
			case "REMOVE_SLIP_API" :
				deferred = $.Operation.removeSlip(target, objData);
				break;
			case "GET_SLIPKIND_LIST" :
				deferred = $.Operation.getSlipKindList(target, objData);
				break;
			case "SCHEDULED_LIST" :
				$.Operation.Open_ScheduledLIst(target, objData);
				break;
			case "SERVER_ADD_SLIP" :
				$.Operation.Open_AddFromServer(target, objData);
				break;
			case "WEB_ADD_SLIP" :
				$.Operation.Open_AddSlipWeb(target, objData);
				break;
			case "SEARCH_SLIP" :
				deferred = $.Operation.searchSlip(target, objData);
				break;
			case "GET_USER_LIST" :
				deferred = $.Operation.getUserList(target, objData);
				break;
			}

			return deferred.promise();
		},
		//detect CS
		detectCS : function(target, command, showAlert) {
			
			var bRes = false;
			
			var csFlag = $.OfficeXPI.isDetected;
			
			switch(csFlag)
			{
			case  $.OfficeXPI.XPI_ENUM.IN_PROGRESS : 
				if(showAlert)	$.Common.simpleAlert(null, target.localeMsg.CHECKING_XPI, 0.3);
				break;
			case  $.OfficeXPI.XPI_ENUM.DETECTED :
				bRes = true;
				break;
			default : 
				if(showAlert) {
					$.Common.simpleConfirm(target.localeMsg.Confirm,target.localeMsg.CONFIRM_DOWNLOAD, function(){
						window.open(g_DOWN_URL,"_blank");
					});
				}
				break;
			}
			
			return bRes;
		},
		
		//Add slip
		addSlip : function(target, objData) {
			
			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}
			
			var sbParam 	= new StringBuffer();
		
			sbParam.append("/RUN");
			sbParam.append("/CMD'PTI'");
			sbParam.append(" /PROJ'"+objData.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+objData.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+objData.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+objData.CORP_NO+"'");
			sbParam.append(" /USER'"+objData.USER_ID+"'");
			sbParam.append(" /AUTORUN'PTI'");
			sbParam.append(" /KEYTYPE'"+objData.KEY_TYPE+"'");
			sbParam.append(" /KEY'"+target.currentKey+"'");
			sbParam.append(" /SLIP_TYPE''");
			//sbParam.append(" /AFTER'"+objData.SDOC_AFTER+"'");
			sbParam.append(" /MODE'"+objData.VIEW_MODE+"'");
			
			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
			
			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);

		},
		Open_ScheduledLIst : function(target, objData) {
			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}

			var sbParam 	= new StringBuffer();

			sbParam.append("/RUN");
			sbParam.append("/CMD'PTI'");
			sbParam.append(" /PROJ'"+objData.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+objData.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+objData.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+objData.CORP_NO+"'");
			sbParam.append(" /USER'"+objData.USER_ID+"'");
			sbParam.append(" /AUTORUN'PTI'");
			sbParam.append(" /KEYTYPE'"+objData.KEY_TYPE+"'");
			sbParam.append(" /KEY'"+target.currentKey+"'");
			sbParam.append(" /SLIP_TYPE''");
			sbParam.append(" /SDOC_KIND'1501'");
			sbParam.append(" /MODE'"+objData.VIEW_MODE+"'");

			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");

			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
		},
		addScanner : function(target, objData) {

			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}

			var sbParam 	= new StringBuffer();

			sbParam.append("/RUN");
			sbParam.append("/CMD'PTI'");
			sbParam.append(" /PROJ'"+objData.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+objData.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+objData.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+objData.CORP_NO+"'");
			sbParam.append(" /USER'"+objData.USER_ID+"'");
			sbParam.append(" /AUTORUN'SCAN'");
			sbParam.append(" /KEYTYPE'"+objData.KEY_TYPE+"'");
			sbParam.append(" /KEY'"+target.currentKey+"'");
			sbParam.append(" /SLIP_TYPE''");
			//sbParam.append(" /AFTER'"+objData.SDOC_AFTER+"'");
			sbParam.append(" /MODE'"+objData.VIEW_MODE+"'");

			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");

			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);

		},

		//Rotate Slip 
		Rotate_Slip : function(target,objData, degrees) {
				
			var curDegrees = parseInt(objData.SLIP_ROTATE);
			var calc = (degrees + curDegrees) % 360
			
			var value = objData.SLIP_IRN;
			var field = "SLIP_IRN";
			
			var elTarget = $(".slip_item[idx='"+value+"']");
		//	var idx = elTarget.idx();

			var objSlipData = target.objSlipItem[value];

			if("1" === objSlipData.SDOCNO_INDEX) {// .attr("first")) {
				if(objSlipData.IS_FOLD) {
					field = "SDOC_NO";
					value = objData.SDOC_NO;
				}
			}
			
			var params = {
					FIELD : field,
					VALUE: value,
					DEGREE : calc,
			};
			
			
			$.when($.Common.RunCommand(g_ActorCommand, "ROTATE_SLIP", params)).then(function(objRes){
				if("T" === objRes.RESULT.toUpperCase())
				{

					//$.each(objSlipData, function(){
					objSlipData.SLIP_ROTATE = calc+"";
					//});
					
					$.Actor.Reload_Thumb(target, elTarget, objSlipData, objSlipData.IS_FOLD);
				}
				else {
					$.Common.simpleAlert(null,target.localeMsg[objRes.MSG]);
				}
			});
		},
		//Add After
		addAfter : function(target, objData) {
			
			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}
			
			var sbParam 	= new StringBuffer();
		
			sbParam.append("/RUN");
			sbParam.append("/CMD'PTI'");
			sbParam.append(" /PROJ'"+objData.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+objData.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+objData.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+objData.CORP_NO+"'");
			sbParam.append(" /USER'"+objData.USER_ID+"'");
			sbParam.append(" /AUTORUN'FOLLOW'");
			sbParam.append(" /KEYTYPE'"+objData.KEY_TYPE+"'");
			sbParam.append(" /KEY'"+target.currentKey+"'");
			sbParam.append(" /SLIP_TYPE''");
			//sbParam.append(" /AFTER'"+objData.SDOC_AFTER+"'");
			sbParam.append(" /MODE'"+objData.VIEW_MODE+"'");
			
			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
			
			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
			
		},
		//Add After
		modifyAfter : function(target, objData) {
			
			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}
			
			var sbParam 	= new StringBuffer();
		
			sbParam.append("/RUN");
			sbParam.append("/CMD'PTI'");
			sbParam.append(" /PROJ'"+target.params.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+target.params.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+target.params.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+target.params.CORP_NO+"'");
			sbParam.append(" /USER'"+target.params.USER_ID+"'");
			sbParam.append(" /AUTORUN'FOLLOW_MOD'");
			sbParam.append(" /KEYTYPE'"+target.params.KEY_TYPE+"'");
			sbParam.append(" /KEY'"+target.currentKey+"'");
			sbParam.append(" /SLIP_TYPE''");
			sbParam.append(" /SDOC_NO'"+objData.SDOC_NO+"'");
			//sbParam.append(" /AFTER'"+objData.SDOC_AFTER+"'");
			sbParam.append(" /MODE'"+target.params.VIEW_MODE+"'");
			
			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
			
			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
			
		},
		Open_DownloadPage : function() {
			
			var nWidth 	= 1250;
			var nHeight 	= 700;
			var vPopupCenterPosition = $.Common.getDisplayCenterPosition(nWidth, nHeight);

			window.open(g_RootURL+"install/index.jsp", null, vPopupCenterPosition+', toolbar=0, directories=0, status=0, menubar=0, scrollbars=0, resizable=0');
			
		},
		//Add from Server
		Add_FromServer : function(target, objData) {
			
			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}
			
			
			var sbParam 	= new StringBuffer();
			
			sbParam.append("/RUN");
			sbParam.append("/CMD'DLG'");
			sbParam.append(" /PROJ'"+objData.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+objData.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+objData.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+objData.CORP_NO+"'");
			sbParam.append(" /USER'"+objData.USER_ID+"'");
			sbParam.append(" /AUTORUN'SEARCH'");
			sbParam.append(" /KEYTYPE'"+objData.KEY_TYPE+"'");
			sbParam.append(" /KEY'"+target.currentKey+"'");
			//sbParam.append(" /AFTER'"+objData.SDOC_AFTER+"'");
			sbParam.append(" /MODE'"+objData.VIEW_MODE+"'");
			
			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
			
			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
			
		},
		//Print Slip
		Print_Slip : function(target, objData) {
			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}

			objData = target.params;

			var sbParam 	= new StringBuffer();
			
			sbParam.append("/RUN");
			sbParam.append("/CMD'PRINT'");
			sbParam.append(" /PROJ'"+objData.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+objData.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+objData.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+objData.CORP_NO+"'");
			sbParam.append(" /USER'"+objData.USER_ID+"'");
			sbParam.append(" /KEYTYPE'"+objData.KEY_TYPE+"'");
			sbParam.append(" /KEY'"+target.currentKey+"'");
			
			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
			
			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
		},
		//Add Attach
		addAttach : function(target, objData) {
			
			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}
			
			var sbParam 	= new StringBuffer();
			
			sbParam.append("/RUN");
			sbParam.append("/CMD'FILE'");
			sbParam.append(" /PROJ'"+objData.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+objData.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+objData.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+objData.CORP_NO+"'");
			sbParam.append(" /USER'"+objData.USER_ID+"'");
			sbParam.append(" /AUTORUN'FILE'");
			sbParam.append(" /KEYTYPE'"+objData.KEY_TYPE+"'");
			sbParam.append(" /KEY'"+target.currentKey+"'");
			sbParam.append(" /SLIP_TYPE''");
			//sbParam.append(" /AFTER'"+objData.SDOC_AFTER+"'");
			sbParam.append(" /MODE'"+objData.VIEW_MODE+"'");
			
			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
			
			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
			
		},
		//View slip property
		viewProperty : function(target, objData) {
			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}
	
			var sbParam 	= new StringBuffer();
			
			sbParam.append("/RUN");
			sbParam.append("/CMD'DLG'");
			sbParam.append(" /PROJ'"+target.params.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+target.params.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+target.params.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+target.params.CORP_NO+"'");
			sbParam.append(" /USER'"+target.params.USER_ID+"'");
			sbParam.append(" /AUTORUN'PROPERTY'");
			sbParam.append(" /SDOC_NO'"+objData.SDOC_NO+"'");
			sbParam.append(" /FOLDER'SLIPDOC'");
			
			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
			
			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
		},
		
		//Add capture
		addCapture : function(target, objData) {
			
			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}
			
			var sbParam 	= new StringBuffer();
		
			sbParam.append("/RUN");
			sbParam.append("/CMD'PTI'");
			sbParam.append(" /PROJ'"+objData.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+objData.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+objData.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+objData.CORP_NO+"'");
			sbParam.append(" /USER'"+objData.USER_ID+"'");
			sbParam.append(" /AUTORUN'Capture'");
			sbParam.append(" /KEYTYPE'"+objData.KEY_TYPE+"'");
			sbParam.append(" /KEY'"+target.currentKey+"'");
			sbParam.append(" /SLIP_TYPE''");
			//sbParam.append(" /AFTER'"+objData.SDOC_AFTER+"'");
			sbParam.append(" /MODE'"+objData.VIEW_MODE+"'");
	
			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
			
			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
		},
		
		//Add tax
		addTax : function(target, objData) {
			
			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}
			
			var sbParam 	= new StringBuffer();
		
			sbParam.append("/RUN");
			sbParam.append("/CMD'PTI'");
			sbParam.append(" /PROJ'"+objData.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+objData.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+objData.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+objData.CORP_NO+"'");
			sbParam.append(" /USER'"+objData.USER_ID+"'");
			sbParam.append(" /AUTORUN'TAX'");
			sbParam.append(" /KEYTYPE'"+objData.KEY_TYPE+"'");
			sbParam.append(" /KEY'"+target.currentKey+"'");
			sbParam.append(" /SLIP_TYPE''");
			//sbParam.append(" /AFTER'"+objData.SDOC_AFTER+"'");
			sbParam.append(" /MODE'"+objData.VIEW_MODE+"'");
	
			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
			
			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
			
		},
		
		//Add url
		addURL : function(target, objData) {
			
			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}
			
			var sbParam 	= new StringBuffer();
		
			sbParam.append("/RUN");
			sbParam.append("/CMD'PTI'");
			sbParam.append(" /PROJ'"+objData.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+objData.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+objData.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+objData.CORP_NO+"'");
			sbParam.append(" /USER'"+objData.USER_ID+"'");
			sbParam.append(" /AUTORUN'URL'");
			sbParam.append(" /KEYTYPE'"+objData.KEY_TYPE+"'");
			sbParam.append(" /KEY'"+target.currentKey+"'");
			sbParam.append(" /SLIP_TYPE''");
			//sbParam.append(" /AFTER'"+objData.SDOC_AFTER+"'");
			sbParam.append(" /MODE'"+objData.VIEW_MODE+"'");
	
			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
			
			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
			
		},
		
		//Add url link
		addURL_Link : function(target, objData) {
			
			if(!$.Operation.detectCS(target, objData, true)) {
				return;
			}
			
			var sbParam 	= new StringBuffer();
		
			sbParam.append("/RUN");
			sbParam.append("/CMD'FILE'");
			sbParam.append(" /PROJ'"+objData.SERVER_KEY+"'");
			sbParam.append(" /SVR'"+objData.SVR_MODE+"'");
			sbParam.append(" /CALL'WAS'");
			sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
			sbParam.append(" /LANG'"+objData.LANG.toUpperCase()+"'");
			sbParam.append(" /CORP'"+objData.CORP_NO+"'");
			sbParam.append(" /USER'"+objData.USER_ID+"'");
			sbParam.append(" /AUTORUN'URL'");
			sbParam.append(" /KEYTYPE'"+objData.KEY_TYPE+"'");
			sbParam.append(" /KEY'"+target.currentKey+"'");
			sbParam.append(" /SLIP_TYPE''");
			//sbParam.append(" /AFTER'"+objData.SDOC_AFTER+"'");
			sbParam.append(" /MODE'"+objData.VIEW_MODE+"'");
	
			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
			
			$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
			
		},
		
		//View original slip 
		openViewer : function(target, objData) {
			
			if(!$.Operation.detectCS(target, objData, false)) {
				$.Operation.viewOriginal(target, objData);
			}
			else
			{
				var sbParam 	= new StringBuffer();
				
				sbParam.append("/RUN");
				sbParam.append("/CMD'VIEW'");
				sbParam.append(" /PROJ'"+target.params.SERVER_KEY+"'");
				sbParam.append(" /SVR'"+target.params.SVR_MODE+"'");
				sbParam.append(" /CALL'WAS'");
				sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
				sbParam.append(" /LANG'"+target.params.LANG.toUpperCase()+"'");
				sbParam.append(" /CORP'"+target.params.CORP_NO+"'");
				sbParam.append(" /USER'"+target.params.USER_ID+"'");
				sbParam.append(" /KEYTYPE'"+target.params.KEY_TYPE+"'");

				var curKey = target.currentKey;
				var passKey = "";

				if(target.params.MULTI_KEY) {
					if(target.currentKey.indexOf(",") !== -1) {
						passKey = target.params.KEY_ORIGIN;
					}
					else {
						var arKeys = target.params.KEY.split(",");
						var arKeyTitles = target.params.KEY_TITLE.split(",");
						var curKeyTitle = arKeyTitles[arKeys.indexOf(curKey)];
						passKey = target.currentKey + ";" + curKeyTitle;
					}
				}
				else {
					passKey = curKey;
				}

				passKey = encodeURIComponent(passKey);

				sbParam.append(" /KEY'"+passKey+"'");
				sbParam.append(" /MODE'"+target.params.VIEW_MODE+"'");
				sbParam.append(" /VIEW'MULTI'");
				sbParam.append(" /MENU'SHOW'");
				sbParam.append(" /INFO'SHOW'");
				sbParam.append(" /SELECTED'"+objData.SLIP_IRN+"'");
				
				$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
				$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
				
				$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
			}
		},
		//Open attachment by through CS
		openAttach : function(target, objData) {
			
			if(!$.Operation.detectCS(target, objData, false)) {
				$.Operation.downloadAttach(target, objData);
			}
			else
			{
				var sbParam 	= new StringBuffer();
				
				sbParam.append("/RUN");
				sbParam.append("/CMD'RUN_FILE'");
				sbParam.append(" /PROJ'"+target.params.SERVER_KEY+"'");
				sbParam.append(" /SVR'"+target.params.SVR_MODE+"'");
				sbParam.append(" /CALL'WAS'");
				sbParam.append(" /WORK'"+objData.WORK_GROUP+"'");
				sbParam.append(" /LANG'"+target.params.LANG.toUpperCase()+"'");
				sbParam.append(" /CORP'"+target.params.CORP_NO+"'");
				sbParam.append(" /USER'"+target.params.USER_ID+"'");
				sbParam.append(" /KEYTYPE'SDOC_NO'");
				sbParam.append(" /KEY'"+objData.SDOC_NO+"'");
		
				$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
				$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
				
				$.OfficeXPI.CallLocalWAS(sbParam.toString(), target.pageSubmit);
			}
		},
		Open_AddFromServer : function(target, objData) {
			var popupTitle = "Add Slip";
			var sbURL = new StringBuffer();
			sbURL.append(g_RootURL+"server_add.jsp?");
			sbURL.append("JDOC_NO="+target.params.KEY_ORIGIN);

			var nWidth 	= 1200;
			var nHeight 	= 800;
			var vPopupCenterPosition = $.Common.getDisplayCenterPosition(nWidth, nHeight);

			var elPopup = window.open(sbURL.toString(), popupTitle, vPopupCenterPosition+', toolbar=0, directories=0, status=0, menubar=0, scrollbars=0, resizable=0');

		},
		Open_AddSlipWeb : function(target, objData) {
			var popupTitle = "Add Slip";
			var sbURL = new StringBuffer();
			sbURL.append(g_RootURL+"slip_add.jsp?");
			sbURL.append("JDOC_NO="+target.params.KEY_ORIGIN);

			var nWidth 	= 600;
			var nHeight 	= 700;
			var vPopupCenterPosition = $.Common.getDisplayCenterPosition(nWidth, nHeight);

			var elPopup = window.open(sbURL.toString(), popupTitle, vPopupCenterPosition+', toolbar=0, directories=0, status=0, menubar=0, scrollbars=0, resizable=0');

		},
		downloadAttach : function(target, objData) {

			var isURL = objData.SDOC_URL;
			if("1" == isURL) {
				var sbURL = new StringBuffer();
				sbURL.append(objData.ORG_FILE.replaceAll("＆","&"));


				var nWidth 	= 1250;
				var nHeight 	= 700;
				var vPopupCenterPosition = $.Common.getDisplayCenterPosition(nWidth, nHeight);

				var elPopup = window.open(sbURL.toString(), "", vPopupCenterPosition+', toolbar=0, directories=0, status=0, menubar=0, scrollbars=yes');
				
			}
			else {
				var docIRN = objData.DOC_IRN;
				
				var sbURL = new StringBuffer();
				sbURL.append(this.rootURL);
				sbURL.append("DownloadAttach.do?");
				sbURL.append("&DOC_IRN="+docIRN);
				
				self.window.open(sbURL.toString(), '_self');	
			}
		},

		moveUpIndex : function(target, objData) {

			var params = {
				SDOC_NO : objData.SDOC_NO
			};


			var deferred = $.Deferred();
			$.when($.Common.RunCommand(g_ActorCommand, "MOVE_UP_INDEX", params)).then(function(objRes) {

				deferred.resolve(objRes.RESULT.toUpperCase());

			}, function (reason) {
				deferred.reject(reason)
			});

			return deferred.promise();
		},
		moveDownIndex : function(target, objData) {

			var params = {
				SDOC_NO : objData.SDOC_NO
			};


			var deferred = $.Deferred();
			$.when($.Common.RunCommand(g_ActorCommand, "MOVE_DOWN_INDEX", params)).then(function(objRes) {

				deferred.resolve(objRes.RESULT.toUpperCase());

			}, function (reason) {
				deferred.reject(reason)
			});

			return deferred.promise();
		},
		
		downloadOriginal : function(target, objData) {
			
			
			var isURL = objData.SDOC_URL;
			if("1" == isURL) {
				var sbURL = new StringBuffer();
				sbURL.append(objData.ORG_FILENM);
				
				var nWidth 	= 1250;
				var nHeight 	= 700;
				var vPopupCenterPosition = $.Common.getDisplayCenterPosition(nWidth, nHeight);

				var elPopup = window.open(sbURL.toString(), "", vPopupCenterPosition+', toolbar=0, directories=0, status=0, menubar=0, scrollbars=0, resizable=0');
				
			}
			else {
				var orgIRN = objData.ORG_FILE;
				
				if("0" == orgIRN) {
					$.Common.simpleAlert(null, target.localeMsg.NO_ORIGINAL_EXISTS);
				}
				else {
					var sbURL = new StringBuffer();
					sbURL.append(this.rootURL);
					sbURL.append("DownloadOriginal.do?");
					sbURL.append("&ORG_IRN="+orgIRN);
					
					self.window.open(sbURL.toString(), '_self');	
				}
			}
			
		},

		viewOriginal : function(target, objData) {
			
			var popupTitle = "Viewer";
			var sbURL = new StringBuffer();
			sbURL.append(g_RootURL+"slip_viewer.jsp");
			
			var nWidth 	= 1250;
			var nHeight 	= 700;
			var vPopupCenterPosition = $.Common.getDisplayCenterPosition(nWidth, nHeight);

			var elPopup = window.open(sbURL.toString(), popupTitle, vPopupCenterPosition+', toolbar=0, directories=0, status=0, menubar=0, scrollbars=0, resizable=0');
		
			//Post submit to popup
			var objParams = {};
			objParams["KEY"] 					= target.params.KEY;
			objParams["KEY_TITLE"] 				= encodeURIComponent(target.params.KEY_TITLE);
			objParams["KEY_TYPE"] 				= target.params.KEY_TYPE;
			objParams["LANG"] 					= target.params.LANG;
			objParams["VIEW_MODE"] 				= target.params.VIEW_MODE;
			objParams["SVR_MODE"]				= target.params.SVR_MODE;
			objParams["CLICKED_SLIP_IRN"]		= objData.SLIP_IRN;
			objParams["MENU"]					= target.params.MENU;
		//	objParams["XPI_PORT"]				= target.params.XPI_PORT;
			
			var elFirstGroupItem 			= $("[id=slip_item]");
			
			// $.each(elFirstGroupItem, function() {
			// 	if($(this).attr("group") == objData.SDOC_NO)
			// 	{
			// 		objParams["FOLD"]			= $(this).attr("fold");
			// 		return false;
			// 	}
			// });
			//
			// if($.Common.isBlank(objParams["FOLD"])) {
			// 	objParams["FOLD"]	 = "";
			// }
			
			$.Common.postSubmit(sbURL.toString(), objParams, "post", popupTitle);
			$(elPopup).unload(function(){
				target.pageSubmit();
			});
			
		},
	//Open comment
	openComment : function(target) {

		var popupTitle = "Comment";
		var sbURL = new StringBuffer();
		sbURL.append(g_RootURL);
		sbURL.append("slip_comment.jsp");
		sbURL.append("?KEY="+encodeURIComponent(target.currentKey));
		sbURL.append("&PAGE="+target.params.PAGE);
		sbURL.append("&LANG="+target.params.LANG);
		sbURL.append("&VIEW_MODE="+target.params.VIEW_MODE);

		var nWidth 	= 520;
		var nHeight 	= 600;
		var vPopupCenterPosition = $.Common.getDisplayCenterPosition(nWidth, nHeight);

		var elPopup = window.open(sbURL.toString(), popupTitle, vPopupCenterPosition+', toolbar=0, directories=0, status=0, menubar=0, scrollbars=0, resizable=0');

		// //Post submit to popup
		// var objParams = {};
		// objParams["KEY"] 					= target.currentKey;
		// objParams["LANG"] 				= target.params.LANG;
		// objParams["USER_ID"] 				= target.params.USER_ID;
		// objParams["CORP_NO"] 			= target.params.CORP_NO;
		// objParams["PAGE"]				= target.params.PAGE;
		// $.Common.postSubmit(sbURL.toString(), objParams, "post", popupTitle);
	},
	//Open history
	openHistory : function(target) {

		var popupTitle = "History";
		var sbURL = new StringBuffer();
		sbURL.append(g_RootURL+"slip_history.jsp?");
		sbURL.append("KEY="+target.currentKey);
		sbURL.append("&LANG="+target.params.LANG);


		var nWidth 	= 800;
		var nHeight 	= 500;
		var vPopupCenterPosition = $.Common.getDisplayCenterPosition(nWidth, nHeight);

		var elPopup = window.open(sbURL.toString(), popupTitle, vPopupCenterPosition+', toolbar=0, directories=0, status=0, menubar=0, scrollbars=0, resizable=0');

		//Post submit to popup
		// var objParams = {};
		// objParams["KEY"] 					= target.currentKey;
		// objParams["LANG"] 				= target.params.LANG;
		// objParams["USER_ID"] 				= target.params.USER_ID;
		// objParams["CORP_NO"] 			= target.params.CORP_NO;
		//
		// $.Common.postSubmit(sbURL.toString(), objParams, "post", popupTitle);
	},
		
		// Remove slip / addfile by I/F Key
		removeAll : function(target) {
			$.Common.simpleConfirm(null,target.localeMsg.CONFIRM_REMOVE_ALL, function(){

				if("EACCT" === target.params.VIEW_MODE) {

					var objCheckedSlip_SlipIrnData 		= [];
					var objCheckedSlip_SDocNoData 	= [];

					var elSlip 		= $("#area_slip").find("[id=chk]");

					//Get slip key
					$.each(elSlip, function(){
						var elSlip = $(this).closest(".slip_item");

						var idx = elSlip.attr("idx");
						var objItemData = target.objSlipItem[idx];
						var isFirst = objItemData.SDOCNO_INDEX;

						if("1" === isFirst) {
							var isFold = objItemData.IS_FOLD;
							if(isFold) {
								objCheckedSlip_SDocNoData.push(objItemData.SDOC_NO);
							}
							else {
								objCheckedSlip_SlipIrnData.push(objItemData.SLIP_IRN);
							}
						}
						else
						{
							objCheckedSlip_SlipIrnData.push(objItemData.SLIP_IRN);
						}
					});

					//Remove slip by SLIP_IRN
					if(objCheckedSlip_SlipIrnData.length > 0)
					{
						var objSlipParams = {
							FIELD : "SLIP_IRN",
							VALUE : objCheckedSlip_SlipIrnData,
							LANG : target.params.LANG,
							VIEW_MODE : target.params.VIEW_MODE
						};

						$.when($.Common.RunCommand(g_ActorCommand, "REMOVE_SELECTED_SLIP", objSlipParams)).then(function(objResSlip){

							if("T" === objResSlip.RESULT.toUpperCase())
							{
								target.reset();
							}
							else {
								$.Common.simpleAlert(null, objResSlip.MSG, null);
							}
						});
					}

					//Remove slip by SDOC_NO
					if(objCheckedSlip_SDocNoData.length > 0)
					{
						var objSlipParams = {
							FIELD : "SDOC_NO",
							VALUE : objCheckedSlip_SDocNoData,
							LANG : target.params.LANG,
							VIEW_MODE : target.params.VIEW_MODE
						};

						$.when($.Common.RunCommand(g_ActorCommand, "REMOVE_SELECTED_SLIP", objSlipParams)).then(function(objResSlip){

							if("T" === objResSlip.RESULT.toUpperCase())
							{
								target.reset();
							}
							else {
								$.Common.simpleAlert(null, objResSlip.MSG, null);
							}
						});
					}


				}
				else {
					var objRemoveParams = {
						VALUE : target.params.KEY,
						FIELD : target.params.KEY_TYPE,
						LANG : target.params.LANG,
						VIEW_MODE : target.params.VIEW_MODE
					};

					$.when($.Common.RunCommand(g_ActorCommand, "REMOVE_ALL", objRemoveParams)).then(function(objRes){
						if("T" == objRes.RESULT.toUpperCase())
						{
							target.reset();
						}
						else {
							$.Common.simpleAlert(null,target.localeMsg[objRes.MSG]);
						}
					});
				}

			});
		},
		Write_Comment : function(target, objData) {
			$.when($.Common.RunCommand(g_CommentCommand, "WRITE_COMMENT", objData)).then(function(objRes){
				if("T" === objRes.RESULT.toUpperCase())
				{
					target.refresh();
				}
				else
				{
					$.Common.simpleAlert(null, objRes.MSG, null);
				//	return;
				}
			});
		},
		Modify_Comment : function(target, objData) {

			var deferred = $.Deferred();
			$.when($.Common.RunCommand(g_CommentCommand, "MODIFY_COMMENT", objData)).then(function(objRes) {

					// if ("T" === ) {
				deferred.resolve(objRes.RESULT.toUpperCase());
					// }
					// else {
					// 	deferred.reject();
					// }

			}, function (reason) {
				deferred.reject(reason)
			});

			 return deferred.promise();
		},
		Remove_Comment : function(target, objData) {

			$.when($.Common.RunCommand(g_CommentCommand, "REMOVE_COMMENT", objData)).then(function(objRes){
				if("T" === objRes.RESULT.toUpperCase())
				{
					target.refresh();
				}
			});
		},

		//Remove menu item
		removeMenuItem : function(target, objData, elTarget) {
			
			var key = null;
			var command = null;
			var field = null;
			var type = elTarget.attr("type");
			
			if("SLIP" === type)
			{
				command 	= "REMOVE_SELECTED_SLIP";
				
			//	var elTarget = $(".slip_item[idx='"+objData.SLIP_IRN+"']");
			//	var idx = elTarget.idx();
				
				if(objData.IS_FOLD) {
					field 	= "SDOC_NO";
					key 	= objData.SDOC_NO;
				}
				else {
					field 	= "SLIP_IRN";
					key 	= objData.SLIP_IRN;
				}
			}
			else 
			{
				command 	= "REMOVE_SELECTED_ATTACH";
				key 			= objData.SDOC_NO;
				field 			= "SDOC_NO";
			}
			
			var objParams = {
					FIELD : field,
					VALUE : key,
					LANG : target.params.LANG,
					VIEW_MODE : target.params.VIEW_MODE,
					JDOC_NO : target.params.KEY
			};
			
			
			$.Common.simpleConfirm(null,target.localeMsg.CONFIRM_REMOVE_SELECTED_ITEM, function(){

				$.when($.Common.RunCommand(g_ActorCommand, command, objParams)).then(function(objRes){
					if("T" === objRes.RESULT.toUpperCase())
					{
						if("SLIP" === type)
						{
							if("SLIP_IRN" === field) {
								delete target.objSlipItem[key];
							}
							else {
								Object.keys(target.objSlipItem).forEach(function(dataKey) {
									var cur = target.objSlipItem[dataKey];
									var curVal = cur[field];
									if (curVal === key) {
										delete target.objSlipItem[dataKey];
									}
								});
							}
							//$.Common.removeItem(target.objSlipItem, key, field);
							target.removeSlipElement(elTarget.closest(".slip_item"));
						}
						else
						{
							delete target.objAttachItem[key];
							//$.Common.removeItem(target.objAttachItem, key, field);
							target.removeAttachElement(elTarget.closest(".attach_item"));
						}
					}
					else
					{
						var resMsg = objRes.MSG;
						if($.Common.isBlank(resMsg)) {
							resMsg = target.localeMsg.FAILED_REMOVE_ITEM;
						}
						else {
							resMsg = target.localeMsg[objRes.MSG];
						}
						$.Common.simpleAlert(null, resMsg);
					}
				});
			});
		},
		// Remove selected item
		removeSlip :  function(target, objData) {

			var params = {
				FIELD : objData.FIELD,
				VALUE : objData.VALUE,
				LANG : target.params.LANG,
				VIEW_MODE : target.params.VIEW_MODE
			};


			var deferred = $.Deferred();
			$.when($.Common.RunCommand(g_ActorCommand, "REMOVE_SELECTED_SLIP", params)).then(function(objRes) {

				deferred.resolve(objRes.RESULT.toUpperCase());

			}, function (reason) {
				deferred.reject(reason)
			});

			return deferred.promise();
		},

		updateCoCardAppr :  function(target, objData) {

			var params = {
				SDOC_NO : objData.sdocNo,
				APPR_CARD : objData.apprNo
			};

			var deferred = $.Deferred();
			$.when($.Common.RunCommand(g_CoCardCommand, "UPDATE_COCARD_APPR", params)).then(function(objRes) {

				deferred.resolve(objRes.RESULT);

			}, function (reason) {
				deferred.reject(reason)
			});

			return deferred.promise();
		},
		displaySlip : function(target, objData) {
			var deferred = $.Deferred();

			$.when($.Common.RunCommand(g_CoCardCommand, "GET_SLIP_LIST", objData)).then(function(objRes) {

				deferred.resolve(objRes);

			}, function (reason) {
				deferred.reject(reason)
			});

			return deferred.promise();
		},
		searchSlip : function (target, objData) {
			var deferred = $.Deferred();
			$.when($.Common.RunCommand(g_ServerAddCommand, "SEARCH_SLIP", objData)).then(function(objRes) {

				if(objRes.RESULT == null)
				{
					deferred.resolve(objRes);
				}
				else {
					deferred.reject(objRes.MSG);
				}

			}, function (reason) {
				deferred.reject(reason)
			});

			return deferred.promise();
		},
		getSlipKindList : function(target, objData) {

			var deferred = $.Deferred();
			$.when($.Common.RunCommand(g_ServerAddCommand, "GET_SLIPKIND_LIST", objData)).then(function(objRes) {

				if(objRes.RESULT == null)
				{
					deferred.resolve(objRes);
				}
				else {
					deferred.reject(objRes.MSG);
				}

			}, function (reason) {
				deferred.reject(reason)
			});

			return deferred.promise();
		},
		getUserList : function(target, objData) {

			var deferred = $.Deferred();
			$.when($.Common.RunCommand(g_ServerAddCommand, "GET_USER_LIST", objData)).then(function(objRes) {

				if(objRes.RESULT == null)
				{
					deferred.resolve(objRes);
				}
				else {
					deferred.reject(objRes.MSG);
				}

			}, function (reason) {
				deferred.reject(reason)
			});

			return deferred.promise();
		},
		removeItem : function(target, objData) {
			
			var objCheckedSlip_SlipIrnData 		= [];
			var objCheckedSlip_SDocNoData 	= [];
			var objCheckedAttachData 	= [];
	
			var elCheckedSlip 		= $("#area_slip").find("[id=chk]:checked");
			var elCheckedAttach 	= $("#area_attach").find("[id=chk]:checked");
		
			if(elCheckedSlip.length <= 0 && elCheckedAttach.length <= 0)
			{
				$.Common.simpleAlert(null, target.localeMsg.CHECK_ITEM);
				return;
			}
			
			//Get slip key 
			$.each(elCheckedSlip, function(){
				var elSlip = $(this).closest(".slip_item");

				var idx = elSlip.attr("idx");
				var objItemData = target.objSlipItem[idx];
				var isFirst = objItemData.SDOCNO_INDEX;
				
				if("1" === isFirst) {
					var isFold = objItemData.IS_FOLD;
					if(isFold) {
						objCheckedSlip_SDocNoData.push(objItemData.SDOC_NO);
					}
					else {
						objCheckedSlip_SlipIrnData.push(objItemData.SLIP_IRN);
					}
				}
				else
				{
					objCheckedSlip_SlipIrnData.push(objItemData.SLIP_IRN);
				}
			});
		
			//Get attach key
			$.each(elCheckedAttach, function(){
				var elAttach 			= $(this).closest(".attach_item");
				var idx 					= elAttach.attr("idx");
				var objItemData 		= target.objAttachItem[idx];
				
				objCheckedAttachData.push(objItemData.SDOC_NO);
			});
			
			$.Common.simpleConfirm(null,target.localeMsg.CONFIRM_REMOVE_SELECTED_ITEM, function(){
				
				//Remove slip by SLIP_IRN
				if(objCheckedSlip_SlipIrnData.length > 0)
				{
					var objSlipParams = {
							FIELD : "SLIP_IRN",
							VALUE : objCheckedSlip_SlipIrnData,
							LANG : target.params.LANG,
							VIEW_MODE : target.params.VIEW_MODE
					};
				
					$.when($.Common.RunCommand(g_ActorCommand, "REMOVE_SELECTED_SLIP", objSlipParams)).then(function(objResSlip){
						
						if("T" === objResSlip.RESULT.toUpperCase())
						{
							$.each(objCheckedSlip_SlipIrnData, function(){
								delete target.objSlipItem[this];
							});

							target.removeSlipElement($(elCheckedSlip).closest("#slip_item"));
						}
					});
				}
				
				//Remove slip by SDOC_NO
				if(objCheckedSlip_SDocNoData.length > 0)
				{
					var objSlipParams = {
							FIELD : "SDOC_NO",
							VALUE : objCheckedSlip_SDocNoData,
							LANG : target.params.LANG,
							VIEW_MODE : target.params.VIEW_MODE
					};
					
					$.when($.Common.RunCommand(g_ActorCommand, "REMOVE_SELECTED_SLIP", objSlipParams)).then(function(objResSlip){
						
						if("T" === objResSlip.RESULT.toUpperCase())
						{
								$.each(objCheckedSlip_SDocNoData, function(){
									var sdocNo = this;
									Object.keys(target.objSlipItem).forEach(function(dataKey) {
										var cur = target.objSlipItem[dataKey];
										var curVal = cur["SDOC_NO"];
										if (curVal === sdocNo) {
											delete target.objSlipItem[dataKey];
										}
									});
								});

								target.removeSlipElement($(elCheckedSlip).closest("#slip_item"));
						}
						else {
							$.Common.simpleAlert(null,target.localeMsg[objResSlip.MSG]);
						}
					});
				}
				
				//Remove attach
				if(objCheckedAttachData.length > 0)
				{
					var objAttachParams = {
							FIELD : "SDOC_NO",
							VALUE : objCheckedAttachData,
							LANG : target.params.LANG,
							VIEW_MODE : target.params.VIEW_MODE
					};
					
					$.when($.Common.RunCommand(g_ActorCommand, "REMOVE_SELECTED_ATTACH", objAttachParams)).then(function(objResAttach) {
						if("T" === objResAttach.RESULT.toUpperCase())
						{
							$.each(objCheckedAttachData, function(){
								delete target.objAttachItem[this];
							});
						//	target.objAttachItem[]
							//$.Common.removeItem(target.objAttachItem, objCheckedAttachData, "SDOC_NO");
							target.removeAttachElement(elCheckedAttach);
						}
						else {
							$.Common.simpleAlert(null,target.localeMsg[objResAttach.MSG]);
						}
					});
				}
			});
		},
}