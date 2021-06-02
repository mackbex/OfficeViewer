


$.Common = {
		progressInterval : null,
		simpleToastRunning : false,
		postSubmit : function(path, params, method, target) {
			    method = method || "post";

			    var form = document.createElement("form");
			    form.setAttribute("method", method);
			    form.setAttribute("action", path);
			    
			    if(!$.Common.isBlank(target))
			    {
			    	form.setAttribute("target", target);
			    }
			    for(var key in params) {
			        if(params.hasOwnProperty(key)) {
			            var hiddenField = document.createElement("input");
			            hiddenField.setAttribute("type", "hidden");
			            hiddenField.setAttribute("name", key);
			            hiddenField.setAttribute("value", params[key]);

			            form.appendChild(hiddenField);
			         }
			    }

			    document.body.appendChild(form);
			    form.submit();
			    form.remove();
		},
		swapObject : function(obj, fromKey, toKey) {

			var list = Object.keys(obj);

			var fromIdx = list.indexOf(fromKey);
			var toIdx = list.indexOf(toKey);

			list = list.move(fromIdx ,toIdx);

			var newObject = {};
			$.each(list, function(){
				var key = this;
					newObject[key] = JSON.parse(JSON.stringify(obj[key]));
			});

			return newObject;

		},
		stringToDate : function(str,divider) {

			if($.Common.isBlank(divider)) {
				str = str.insert(4,"-").insert(7,"-")
				return new Date(str);
			}
			else {
				return new Date(str.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2"+divider+"$1"+divider+"$3"));
			}

		},
		isEmptyObject : function( el ){
			return !$.trim(el.html())
		},
		getDateWithFormat : function(date, format) {
			var year 	= "" + date.getFullYear();
			var month 	= "" + (date.getMonth()+1);
			var day 	="" + date.getDate();

			if (month.length < 2)
				month = '0' + month;
			if (day.length < 2)
				day = '0' + day;

			return [year, month, day].join(format);

		},
		Draw_LeftMenu : function(objMember) {
			
			//show/hide add button
			if(!$.Common.isBlank(objMember.currentKey) && "JDOC_NO" == objMember.params.KEY_TYPE &&
					("EDIT" == objMember.params.VIEW_MODE || "AFTER" == objMember.params.VIEW_MODE))
			{
				if($(".key_select > option:selected").html() != "ALL") {
					if($("#btn_add_slip") != null) $("#btn_add_slip").show();
				}
				else {
					if($("#btn_add_slip") != null) $("#btn_add_slip").hide();
				}
			}
			else {
				if($("#btn_add_slip") != null) $("#btn_add_slip").hide();
			}
//			else
//			{
//				if($("#btn_add_slip") != null) $("#btn_add_slip").hide();
//			}
			
			// //show/hide comment button
			if(!$.Common.isBlank(objMember.currentKey)  && objMember.currentKey.indexOf(",") <= -1 && "JDOC_NO" == objMember.params.KEY_TYPE)
			{
				if($("#btn_open_comment") != null) $("#btn_open_comment").show();
			}
			else
			{
				if($("#btn_open_comment") != null) $("#btn_open_comment").hide();
			}
			
			//show/hide history button
			if(!$.Common.isBlank(objMember.currentKey)  && objMember.currentKey.indexOf(",") <= -1 && "JDOC_NO" == objMember.params.KEY_TYPE)
			{
				if($("#btn_open_history") != null) $("#btn_open_history").show();
			}
			else
			{
				if($("#btn_open_history") != null) $("#btn_open_history").hide();
			}
			
			//show/hide remove button
			if(!$.Common.isBlank(objMember.currentKey) && "JDOC_NO" == objMember.params.KEY_TYPE && 
					("EDIT" == objMember.params.VIEW_MODE || "AFTER" == objMember.params.VIEW_MODE || "EACCT" == objMember.params.VIEW_MODE ))
			{
				if($(".key_select > option:selected").html() != "ALL") {
					if($("#btn_remove") != null) $("#btn_remove").show();
				}
				else {
					if($("#btn_remove") != null) $("#btn_remove").hide();
				}
			}
			else {
				if($("#btn_remove") != null) $("#btn_remove").hide();
			}
//			else
//			{
//				if($("#btn_remove") != null) $("#btn_remove").hide();
//			}
			
//			elTarget.empty();
//			
//			var icon = null;
//			var elBtn = null;
//			
//			//Draw menu btn
//			icon = g_RootURL + "image/pc/actor/btn_menu.png";
//			elBtn = $.Common.Draw_Button(objMember, "btn_open_menu", null, null, icon);
//			elBtn.appendTo(elTarget);
//			
//			//Draw add btn
//			if(!$.Common.isBlank(objMember.currentKey) && "JDOC_NO" == objMember.params.KEY_TYPE && "EDIT" == objMember.params.VIEW_MODE)
//			{
//				icon = g_RootURL + "image/pc/actor/btn_add_slip.png";
//				elBtn = $.Common.Draw_Button(objMember, "btn_add_slip", "1", null, icon);
//				elBtn.appendTo(elTarget);
//			}
//			
//			//Draw comment btn
//			if(!$.Common.isBlank(objMember.currentKey) && "JDOC_NO" == objMember.params.KEY_TYPE)
//			{
//				icon = g_RootURL + "image/pc/actor/btn_open_comment.png";
//				elBtn = $.Common.Draw_Button(objMember, "btn_open_comment", null, "OPEN_COMMENT", icon);
//				elBtn.appendTo(elTarget);
//			}
//			
//			//Draw history btn
//			if(!$.Common.isBlank(objMember.currentKey) && "JDOC_NO" == objMember.params.KEY_TYPE)
//			{
//				icon = g_RootURL + "image/pc/actor/btn_open_history.png";
//				elBtn = $.Common.Draw_Button(objMember, "btn_open_history", null, "OPEN_HISTORY", icon);
//				elBtn.appendTo(elTarget);
//			}
//			
//			//Draw remove btn
//			if(!$.Common.isBlank(objMember.currentKey) && "JDOC_NO" == objMember.params.KEY_TYPE && "EDIT" == objMember.params.VIEW_MODE)
//			{
//				icon = g_RootURL + "image/pc/actor/btn_remove.png";
//				elBtn = $.Common.Draw_Button(objMember, "btn_remove", null, null, icon);
//				elBtn.appendTo(elTarget);
//			}
//			
//			//Draw print btn
//			icon = g_RootURL + "image/pc/actor/btn_print.png";
//			elBtn = $.Common.Draw_Button(objMember, "btn_print", "1", "PRINT_SLIP", icon);
//			elBtn.appendTo(elTarget);
			
		},
		Draw_Button : function(objMember, id, is_CS_Operation, command, iconURL) {
			var elBtn = $(document.createElement('div'));
			elBtn.attr("id",id);
			if(!$.Common.isBlank(is_CS_Operation) && "1" == is_CS_Operation)
			{
				elBtn.attr("cs_operation","1");
			}
			if(!$.Common.isBlank(command))
			{
				elBtn.attr("command",command);
				elBtn.on("click",  function(){
					$.Operation.execute(objMember, $(this));
				});
			}
				
			var elICon = $(document.createElement('img'));
			elICon.attr("src",iconURL);
			elICon.appendTo(elBtn);
			
			return elBtn;
		},
		isBlank: function(str) {
			if(str === parseInt(str, 10)) {
				return false;
			}

			var res = false;
			var blank_pattern = /^\s+|\s+$/g;
			if (str == null || str == "undefined" || str.replace(blank_pattern, "") == "") {
				res = true
			}
			return res;
		},
		determineMobile : function() {
			if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(navigator.userAgent)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4)))
			{
				return true;
			}
			else
			{
				return false;
			}
		},
		get_ObjectValue : function(key) {

			var obj_Key = key;
			
			if(key.indexOf(",") > -1) {
				obj_Key = [];
				$.each(key.split(","), function() {
					obj_Key.push(this);
				});
				
			}
			return obj_Key;
		},
		getFloatOpacity:function(val) {
			return parseFloat(val) / 255.0;
		},
		getRawOpacity:function(val) {
			return Math.abs(Math.round(val * 255.0));
		},
		getUUID:function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},
		getIRN:function (flag) {

			var uuid = $.Common.getUUID();
			var sbRes = new StringBuffer();
			var today = new Date();

			var yyyyMMdd = today.getFullYear() + ("0"+(today.getMonth()+1)).slice(-2) + ("0" + today.getDate()).slice(-2);
			var HHmmssSSS = ("0" + today.getHours()).slice(-2) + ("0" + today.getMinutes()).slice(-2) + ("0" + today.getSeconds()).slice(-2) + + ("0" + today.getMilliseconds()).slice(-3);

			if($.Common.isBlank(flag)) flag = "";
			sbRes.append(flag);
			sbRes.append(yyyyMMdd);
			sbRes.append(uuid.substring(uuid.length - 5, uuid.length));
			sbRes.append(HHmmssSSS);

			return sbRes.toString();

		},
		removeKey : function(arr, str) {
			var idx = arr.indexOf(str);
			if(idx > -1) {
				arr.splice(idx, 1);
			}

			return arr;
		},

// removeItem : function(arObjTarget, value, field) {
		// 	var i, cur;
		//
		// 	Object.keys(arObjTarget).forEach(function(key) {
		// 		cur = arObjTarget[key];
		// 		if(typeof(value) === 'string' || value instanceof String)
		// 		{
		// 			var curVal = cur[field];
		// 			if (curVal === value) {
		// 				delete arObjTarget[key];
		//
		// 			//	arObjTarget.splice(i, 1);
		// 			}
		//
		// 		}
		// 		else {
		// 			$.each(value, function(){
		//
		// 				var curVal = cur[field];
		// 				var targetVal = this;
		//
		// 				if (curVal === targetVal) {
		// 					delete arObjTarget[key];
		// 					//arObjTarget.splice(i, 1);
		// 				}
		// 			});
		// 		}
		// 	});
		//
		// 	for (i = Object.keys(arObjTarget).length - 1; i >= 0; i--) {
		//     //     cur = arObjTarget[i];
		//     //
		//     // 	if(typeof(value) === 'string' || value instanceof String)
		// 	// 	{
		//     // 		var curVal = cur[key];
		//     //
		// 	//         if (curVal == value) {
		// 	//         	arObjTarget.splice(i, 1);
		// 	//         }
		// 	// 	}
		//     // 	else
		//     // 	{
		// 	//         $.each(value, function(){
		// 	//
		// 	//         	var curVal = cur[key];
		// 	//         	var targetVal = this;
		// 	//
		// 	// 	        if (curVal == targetVal) {
		// 	// 	        	arObjTarget.splice(i, 1);
		// 	// 	        }
		// 	//         });
		//     // 	}
		//     }
		// },
//		/*parseContextMenu : function(menuItem, viewMode, localeMsg, objData) {
//			
//			var arObjMenu = [];
//			
//			$.each(menuItem, function(){
//				
//				if(viewMode.toUpperCase() == "VIEW")
//				{
//					if((this.MODE != null ) && this.MODE.toUpperCase() != "VIEW")
//					{
//						return true;
//					}
//				}
//					
//				if(!$.Common.isBlank(this.ID))
//				{
//					var menuID = this.ID;
//					if(!$.Common.isBlank(this.ICON))
//					{
//						this["icon"] = g_RootURL + this.ICON;
//					}
//					this["title"] = localeMsg[menuID];
//					this["click"] = function(){$.Actor.run(menuID, objData)}; //bind event
//				}
//				
//				arObjMenu.push(this);
//				
//			});
//			
//			return arObjMenu;
//		},
//		addContextMenu : function(elTarget, menuGroup, objData, viewMode, localeMsg) {
//			var fnClick = function(e) {
//				var alMenuItem = $.Common.parseContextMenu(menuGroup, viewMode, localeMsg, objData);
//				
//				if(alMenuItem != null && alMenuItem.length > 0)
//				{
//					$.ContextMenu.create(elTarget.closest("#slip_item"), alMenuItem, {isMatchTop:true});
//				}
//			}
//			
//			var iconURL = g_RootURL+"image/common/option";
//			
//			var elBtn = $(document.createElement('div'));
//			elBtn.unbind().bind("click",fnClick);
//			elBtn.appendTo(elTarget);
//			
//			var elImg = $(document.createElement('img')).attr("src",iconURL + ".png");
//			elImg.unbind('mouseenter mouseleave').hover(function(){
//				$(this).css("opacity","0.7");
//			},function(){
//				$(this).css("opacity","1");
//			});
//			
//			elImg.appendTo(elBtn);			
//		},*/
		RunCommand : function(strURL, strCommand, objParam)
		{
			var sbParams 			= new StringBuffer();
			
			var objRequestParams = {Command: strCommand}; //Array 
			
			$.each(objParam, function(key, value){
				objRequestParams[key] = value;
			});
			
			var deferred = $.Deferred();
			
			$.ajax({
				url:strURL,
	            type:'post',
	            data:objRequestParams,
	            traditional:true,
	            contentType: 'application/x-www-form-urlencoded; charset=UTF-8', 
		        dataType: 'json',
		    	success: function(data) {
		            deferred.resolve(data);
		        },
		        error: function(error) {
		            deferred.reject(error);
		        }
			});
			
			return deferred.promise();
		},
		windowCallback : function(func) {
			  var timer;
			  	return function(event){
			  		if(timer) clearTimeout(timer);
			  		timer = setTimeout(func,200,event);
			  	};
		},
		attachBadge : function(elTarget, value, bgColor) {
			var elBadge = $(document.createElement('div'));
			elBadge.html(value);
			elBadge.addClass("badge");
			elBadge.css("background-color","#"+bgColor);
			elBadge.appendTo(elTarget);
		},
		sortContextMenuItem : function(localeMsg, menuGroup, viewMode, currentKey) {
			
			//Add context menu
			var arObjMenu = [];
			
			$.each(menuGroup, function(){
				
				if(viewMode.toUpperCase() == "VIEW")
				{
					if((this.MODE != null ) && this.MODE.toUpperCase() != "VIEW")
					{
						return true;
					}
				}
				
				if((this.GROUP_DISABLE != null ) && this.GROUP_DISABLE.toUpperCase() == "1")
				{
					if($.Common.isBlank(currentKey) || currentKey.indexOf(",") > -1)
					{
						return true;
					}
				}
				
				if(!$.Common.isBlank(this.ID))
				{
					var objMenuItem = {};
					objMenuItem["MENU_ID"] 	= this.ID;
					objMenuItem["TITLE"] 		= localeMsg[this.ID];
					//If it has an icon..
					if(!$.Common.isBlank(this.ICON))
					{
						objMenuItem["ICON"] = this.ICON;
					}
					arObjMenu.push(objMenuItem);
				}
			});
			
			return arObjMenu;
		},
		simpleAlert : function(title, msg, duration, callback) {
			
			//Draw alert area
			var elWrapperAlert = $(document.createElement('div'));
			elWrapperAlert.addClass("wrapper_simple_alert");
			elWrapperAlert.prependTo("body");
			
			var elAlertArea = $(document.createElement('div'));
			elAlertArea.addClass("area_simple_alert");
			elAlertArea.appendTo(elWrapperAlert);
				
			//Draw x button
			var elClose = $(document.createElement('div'));
			elClose.addClass("close");
			elClose.appendTo(elAlertArea);
			elClose.on("click", function(){evClick();});
			
			if(!$.Common.isBlank(title))
			{
				var elTitle = $(document.createElement('div'));
				elTitle.html(title);
				elTitle.addClass("title");
				elTitle.appendTo(elAlertArea);
			}
			//Draw alert
			var elContent = $(document.createElement('div'));
			elContent.html(msg);
			elContent.addClass("content");
			elContent.appendTo(elAlertArea);
			
			var elAreaButton =  $(document.createElement('div'));
			elAreaButton.addClass("wrapper_btn");
			elAreaButton.appendTo(elAlertArea);
			
			var elButton = $(document.createElement('div'));
			elButton.addClass("btn");
			elButton.html("OK");
			elButton.on("click", function(){evClick();});
			elButton.appendTo(elAreaButton);
			
			//Click, close event.
			var evClick = function() {
				elWrapperAlert.remove();
				$(document).unbind("keyup");
				if(callback) {
					callback();
				}
			}
			
			$(document).bind("keyup",function(e){
				var code = (e.keyCode ? e.keyCode : e.which);
			    if (code == 13) 
		    	{
			    	evClick();
		    	}
			    if(code == 27)
		    	{
			    	elWrapperAlert.remove();
		    	}


			});


			elWrapperAlert.focus();
		},

	 	rgbToHex:function(r, g, b) {
			var red = r instanceof String ? parseInt(r) : r;
			var green = r instanceof String ? parseInt(g) : g;
			var blue = r instanceof String ? parseInt(b) : b;

			return "#" + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
		},

		simpleToast : function(msg, duration) {

			if($.Common.simpleToastRunning) return;

			$.Common.simpleToastRunning = true;
			$(".wrapper_simple_toast").remove();

			if(duration === null) {
				duration = 300;
			}

			var elWrapperToast = $(document.createElement('div'))
			.addClass("wrapper_simple_toast")
			.prependTo("body")
			.hide()
			.stop()
			.fadeIn(duration,function () {

				$(this).delay(2000).fadeOut(duration, function(){
					$(".wrapper_simple_toast").remove();
					$.Common.simpleToastRunning = false;
				});
			});


			var elAlertArea = $(document.createElement('div'));
			elAlertArea.addClass("toast_msg");
			elAlertArea.html(msg);
			elAlertArea.appendTo(elWrapperToast);
		},

		simpleConfirm : function(title, msg, callback) {
					
			//Draw alert area
			var elWrapperAlert = $(document.createElement('div'));
			elWrapperAlert.addClass("wrapper_simple_alert");
			elWrapperAlert.prependTo("body");
			
			var elAlertArea = $(document.createElement('div'));
			elAlertArea.addClass("area_simple_alert");
			elAlertArea.appendTo(elWrapperAlert);
				
			//Draw x button
			var elClose = $(document.createElement('div'));
			elClose.addClass("close");
			elClose.appendTo(elAlertArea);
			elClose.on("click", function(){evClick();});
			
			if(!$.Common.isBlank(title))
			{
				var elTitle = $(document.createElement('div'));
				elTitle.html(title);
				elTitle.addClass("title");
				elTitle.appendTo(elAlertArea);
			}
			//Draw alert
			var elContent = $(document.createElement('div'));
			elContent.html(msg);
			elContent.addClass("content");
			elContent.appendTo(elAlertArea);
			
			var elAreaButton =  $(document.createElement('div'));
			elAreaButton.addClass("wrapper_btn");
			elAreaButton.appendTo(elAlertArea);
			
			var elButton = $(document.createElement('div'));
			elButton.addClass("btn");
			elButton.html("OK");
			elButton.on("click", function(){
				elWrapperAlert.remove();
				callback();
				evClick();
			});
			elButton.appendTo(elAreaButton);
			
			var elButton = $(document.createElement('div'));
			elButton.attr("id","alert_cancel");
			elButton.addClass("btn");
			elButton.html("Cancel");
			elButton.on("click", function(){evClick()});
			elButton.appendTo(elAreaButton);
			
			//Click, close event.
			var evClick = function() {
				elWrapperAlert.remove();
				$(document).unbind("keyup");
			}
			
			$(document).on("keyup",function(e){
				var code = (e.keyCode ? e.keyCode : e.which);
			    if (code == 13) 
		    	{
			    	callback();
					evClick();
		    	}
			    if(code == 27)
		    	{
			    	elWrapperAlert.remove();
		    	}
			});
			
			elWrapperAlert.focus();
			
		},
		getColorObj : function(objColor, objTarget){
			
			if(objColor == null) return null;
			
			var colorCommon = objColor.Common;
			$.each(colorCommon, function(key, val){
				objTarget[key] = val;
			});
			
			return objTarget;
			
		},  
		getConfData : function(path, type)
		{
			var deferred = $.Deferred();
			//var objRes = null;
			$.ajax({
    			url				: path,
    	//		async			: false,
    			dataType	: type,
    			success: function(data) {
    		            deferred.resolve(data);
    		        },
		        error: function(error) {
		            deferred.reject(error);
		        }
    		});
			
			return deferred.promise();
		},
		getWidthPercent : function(element) {
			return $.Common.round(element.outerWidth() / element.parent().outerWidth() * 100, 1);
		},
		
		round : function(value, precision) {
		    var multiplier = Math.pow(10, precision || 0);
		    return Math.round(value * multiplier) / multiplier;
		},
		
		Localize : function(localMsg, str_i18n_attr, lang, dest)
		{
			if(localMsg != null)
			{
				
				var msgErr = localMsg[lang]["Error"] == null ? null : localMsg[lang]["Error"];
				var msgCommon = localMsg[lang]["Common"] == null ? null : localMsg[lang]["Common"];
				
				localMsg = localMsg[lang][dest];
				
				$.each(msgCommon, function(key, val) {
					localMsg[key] = val;
				});
				
				$.each(msgErr, function(key, val) {
					localMsg[key] = val;
				});
			
			
				$('['+str_i18n_attr+']').each(function(idx) {
					var tag 	= $(this);
					var val 	= tag.attr(str_i18n_attr);
					
				    if(tag.is('input'))
				    {
				    	if(tag.is(':checkbox'))
			    		{
				    		tag.attr('title',localMsg[val]);
			    		}
				    	else if(tag.is(':text'))
			    		{
				    		tag.attr('placeholder',localMsg[val]);
			    		}
				    }
				    else if(tag.is('span, div, li'))
				    {
				    	tag.html(localMsg[val]);
				    }
				    else if(tag.is('textarea'))
			    	{
				    	tag.attr('placeholder',localMsg[val]);
			    	}
				});
				}
			return localMsg;
		},
		GetBrowserVersion : function()
		{
		    //Set defaults
		    var value = {
		        IsIE: false,
		        TrueVersion: 0,
		        ActingVersion: 0,
		        CompatibilityMode: false
		    };
		
		    var trident = navigator.userAgent.match(/Trident\/(\d+)/);
		    if (trident) {
		        value.IsIE = true;
		        value.TrueVersion = parseInt(trident[1], 10) + 4;
		    }
		
		    var msie = navigator.userAgent.match(/MSIE (\d+)/);
		    if (msie) {
		        value.IsIE = true;
		        //Find the IE version number from the user agent string
		        value.ActingVersion = parseInt(msie[1]);
		    } else {
		        //Must be IE 11 in "edge" mode
		        value.ActingVersion = value.TrueVersion;
		    }
		
		    if (value.IsIE && value.TrueVersion > 0 && value.ActingVersion > 0) {
		        value.CompatibilityMode = value.TrueVersion != value.ActingVersion;
		    }
		    else
		    {
		    	value.ActingVersion = 11;
		    }
		    return value;
		},
		ShowProgress : function(strTagID, strMsg, strColor, nOpacity, effect,maxSize)
		{
			if(nOpacity == null)
			{
				nOpacity = 0.7;
			}

			if(null === effect || undefined === effect) {
				effect = 'bounce';
			}

			if(null === maxSize || undefined === maxSize) {
				maxSize = '';
			}
			
			if(this.m_vBrowserInfo == null || this.m_vBrowserInfo.ActingVersion > 9)
			{
				$(strTagID).css("display","block");
				$(strTagID).waitMe({
					effect : effect,
					text : strMsg,
					maxSize:maxSize,
					bg : 'rgba(255,255,255,'+nOpacity+')', 
					color : '#'+strColor,
					sizeW : '',
					sizeH : '', 
					source : ''
				});
			}
			else
			{
				$(strTagID).empty();
				$(strTagID).css({ 'display':'block'});
				
				$(strTagID).fadeTo('fast', nOpacity);
				
				var vElProgressText = $(document.createElement('div'));
				vElProgressText.css({
					"position":"absolute",
					"top":"45%",
					"left":"0",
					"right":"0",
					"margin":"auto",
					"text-align":"center",
					"color":"#"+strColor,
					"font-weight":"bold",
					"font-size":"11pt"
				});
				vElProgressText.text(strMsg);
				 
				
				
				var vElProgressAnimation =  $(document.createElement('div'));
				vElProgressAnimation.css({
					"position":"absolute",
					"top":"100%",
					"left":"0",
					"right":"0",
					"margin":"auto",
					"text-align":"center",
					"color":"#"+strColor,
					"font-weight":"bold",
					"font-size":"10pt"
				});
				vElProgressText.append(vElProgressAnimation);
			
				var nDotCnt = 1;
				
				$.Common.progressInterval = setInterval(function(){ 
					var strDot = new StringBuffer();
					for(var i = 0; i < nDotCnt; i++)
					{
						strDot.append("*");
					}
					
					vElProgressAnimation.text(strDot.toString());
					
					if(nDotCnt >= 4)
					{
						nDotCnt = 0;
					}
					nDotCnt += 1;
				}, 300);
				
				$(strTagID).append(vElProgressText);
				
			}
		},
		HideProgress : function(strTagID)
		{
			if($.Common.progressInterval != null)
			{
				clearInterval($.Common.progressInterval);
				$.Common.progressInterval = null;
			}
			
			if(this.m_vBrowserInfo == null || this.m_vBrowserInfo.ActingVersion > 9)
			{
				$(strTagID).waitMe("hide");
				$(strTagID).css({ 'display':'none'});
			}
			else
			{
				$(strTagID).css({ 'display':'none'});
			}
		},
		RemoveProgress : function(elTarget)
		{
			if($.type(elTarget) === "string") {
				elTarget = $(elTarget);
			}
			elTarget.find(".waitMe").remove();
			elTarget.removeClass("waitMe_container");
			elTarget.removeAttr("data-waitme_id");

		},
		getDisplayCenterPosition : function(nWidth, nHeight)
		{
			var nTop 	= ((screen.availHeight - nHeight)/2 - 40);
			var nLeft 	= (screen.availWidth - nWidth)/2;
			
			var sbRes = new StringBuffer();
			sbRes.append("top=");
			sbRes.append(nTop);
			sbRes.append(",left=");
			sbRes.append(nLeft);
			sbRes.append(",width=");
			sbRes.append(nWidth);
			sbRes.append(",height=");
			sbRes.append(nHeight);
			return sbRes.toString();
		}
}

