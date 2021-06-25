"use strict";
$.Viewer = {
		localeMsg : null,
		colorSet : null,
		params : null,
		slipRange : 10,
		thumbWidth : 140,
		startIdx : 0,
		slipTotalCnt : 0,
		objSlipItem: null,
		objAttachItem : null,
		contextMenu : null,
		attachCnt : 0,
		viewer : null,
		is_Maximized : false,
		currentKey : null,
		IS_FOLD : true,
		Cur_Slip : null,
		isBookmarkLoaded : false,
		drawContext : null,

		init : function(params) {
			
			this.params 			= params;
			this.currentKey 		= this.params.KEY;
			this.is_Maximized 	= params.MAXIMIZED === "T" ? true : false;
			this.IS_FOLD 		= params.FOLD === "T" ? true : false;


			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#info_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#original_progress","Waiting..","000000","0.7");

			if($.Viewer.params.USE_BOOKMARK) {
				if($.Common.GetBrowserVersion().ActingVersion > 9) {
					$.getMultiScripts([g_VIEW_BOOKMARK_URL, g_CANVAS_LIB, g_DRAW_BOOKMARK_WEB])
						.fail(function (err) {
							$.Common.simpleToast("Failed to load Bookmark.");
						})
						.done(function () {
							$.Viewer.isBookmarkLoaded = true;
						});
				}
			}

			$(window).on('resize', function() {
				// $.each($("[tag=drag]"), function(){
				// 	var elPrev = $(this).prev();
				// 	var left = elPrev.outerWidth() + parseInt(elPrev.offset().left) - $("#list_btnLeft").width();
				// 	$(this).css("left",left);
				// });
				
			});
			
			/**
			 * resize scroll window on resize browser
			 */
			$(window).on('resize', $.Common.windowCallback(function(){
				
				if($.Viewer.is_Maximized) {
					$.Viewer.is_Maximized = false;
					$.Viewer.ZoomIn_Thumb();
				}
				// else {
				// 	$.Actor.ZoomOut_Thumb();
				// }
				else {	
					$("#area_slip").getNiceScroll().resize();
					$("#area_attach").getNiceScroll().resize();	
				}
			
			}));

			//Set globalization.
			$.Viewer.localeMsg = $.Common.Localize($.Lang, "data-i18n", params.LANG,"Viewer");

			
			
			//Set UI set
			$.Viewer.setUIColor();
			
			$.Viewer.contextMenu = $.Menu.PC.Viewer;
		
			if("SIMPLE" != $.Viewer.params.VIEW_MODE.toUpperCase()){
				if("1" == $.Viewer.params.MENU)
				{
					$.Viewer.Init_MenuList();
				}
			}
			else {
				$(".viewer_left").hide();
				$("#dragBar_viewer").hide();
				$(".viewer_right_extra").hide();
				$(".viewer_right").css({
					left:"0",
					right:"0",
					top:"0",
					bottom:"0"
				});
				$(".area_attach_list").hide();
			}

			
			$.Viewer.initializeSlip();
			
			
			// if("SIMPLE" !== $.Viewer.params.VIEW_MODE.toUpperCase()){
			//
			// 	//Toggle attachlist area
			// 	$.Viewer.getAttachList($.Viewer.params);
			//
			//
			// }
			var version = $.Common.GetBrowserVersion().ActingVersion;
			if(version <= 9) {
				$.Viewer.viewer = $.Viewer.setImageViewer();
			}
			
		},

		initializeSlip : function() {

			var params = $.Viewer.params;

			var objListParams = {
				KEY : params.KEY,
				KEY_TYPE : params.KEY_TYPE,
				USER_ID : params.USER_ID,
				CORP_NO : params.CORP_NO,
				LANG : params.LANG
			};

			$.when($.Actor.getSlipList($.Viewer, objListParams)).then(function(res){

				if(!res) {
					$.Common.HideProgress("#slip_progress");
					return;
				}

				// if(!$.Common.isBlank($.Viewer.params.CLICKED_SLIP_IRN))
				// {
				// 	$.Viewer.slipRange = Object.keys($.Viewer.objSlipItem).length;
				// 	$("#area_slip").unbind('scroll');
				// }

				if($.Viewer.params.MULTI_KEY) {
					$.Viewer.change_GroupKey($.Viewer.currentKey);
				}
				else {
					$.Actor.displayThumb($.Viewer);
				}

			}, function (reason) {
				$.Common.simpleToast("Failed to load thumbs.");
				$.Common.HideProgress("#slip_progress");
			});

			// if("SIMPLE" !== $.Viewer.params.VIEW_MODE.toUpperCase()) {
			// 	$.Viewer.getAttachList($.Viewer.params);
			// }
		//	if(!$.Viewer.params.MULTI_KEY) {
				$.Viewer.getCommentCnt();
		//	}

			$('#slip_masonry').masonry({
				// options
				itemSelector: '#slip_item',
				columnWidth: $.Viewer.thumbWidth,
				horizontalOrder: true,
				isFitWidth: true,
				gutter: 20
			});


			// $.Actor.addScrollEvent($(".area_slip"), function(){
			// 	if(!$.Actor.isSlipLoading) {
			//
			// 		//	var start = $(".slip_item").size() === 0 ? 0 : $(".slip_item").size() + 1;
			//
			// 		$(".slip_wrapper").find('.progress_slip_scroll').show();
			// 		//$.Actor.getSlipList($.Actor.params,   $.Actor.slipRange);
			// 		$.Actor.displayThumb($.Viewer);
			// 	}
			// });


		},
		getCommentCnt: function() {
			var objParams = {
				KEY : $.Viewer.currentKey
			};

			$.when($.Common.RunCommand(g_RootURL + "CommentCommand.do", "GET_COMMENT_COUNT", objParams)).then(function(value){
				$.Common.attachBadge($("#btn_open_comment"), value.COMT_CNT, $.Viewer.colorSet.BADGE);
			});

		},
		ZoomIn_Thumb : function() {

			if(!$.Viewer.is_Maximized) {

				$('#slip_masonry').masonry({
				   columnWidth: $(".area_slip").width() - 40
				});
				$(".slip_item").css("width", "100%");

				$('#slip_masonry').masonry('layout');
				$("#area_slip").getNiceScroll().resize();

				$.Viewer.is_Maximized = true;
			}

		},
		ZoomOut_Thumb : function() {
			if($.Viewer.is_Maximized) {
				$('#slip_masonry').masonry({
					columnWidth:  $.Viewer.thumbWidth
					});
				$(".slip_item").css("width",  $.Viewer.thumbWidth);

				$('#slip_masonry').masonry('layout');
				$("#area_slip").getNiceScroll().resize();

				$.Viewer.is_Maximized = false;
			}
		},
		Init_MenuList : function() {
			
			//Set left menu position
			$("#areaViewer").addClass("menu_on");

			$.Viewer.initButtons();
			
			$.Viewer.contextMenu = $.Menu.PC.Actor;
        	
			$.Viewer.Draw_MainContext();
//        	var arObjMenu = $.Common.sortContextMenuItem($.Viewer.localeMsg,  $.Viewer.contextMenu['Menu'], $.Viewer.params.VIEW_MODE, $.Viewer.currentKey);
//			$.ContextMenu.getMenu($.Viewer, $("#btn_open_menu"), $("#btn_open_menu"), arObjMenu, $.Viewer.params, { spacing_top : true});				
//		
			var arObjAdd = $.Common.sortContextMenuItem($.Viewer.localeMsg,  $.Viewer.contextMenu['Add'], $.Viewer.params.VIEW_MODE, $.Viewer.currentKey);
			$.ContextMenu.getMenu($.Viewer, $("#btn_add_slip"), $("#btn_add_slip"), arObjAdd, $.Viewer.params, { spacing_top : true});				
		
			var arObjRemove = $.Common.sortContextMenuItem($.Viewer.localeMsg,  $.Viewer.contextMenu['Remove'], $.Viewer.params.VIEW_MODE, $.Viewer.currentKey);
			$.ContextMenu.getMenu($.Viewer, $("#btn_remove"), $("#btn_remove"), arObjRemove, $.Viewer.params, { spacing_top : true});	

			/*
			 * Detect LocalWAS
			 */	
			if(typeof OfficeXPI == "undefined")
			{
				
				//Load XPI Script
				$.getScript(g_XPI_URL, function() {

					var localWAS_URL =  null;
					if(location.protocol.indexOf("https") > -1) {
						localWAS_URL = "https://127.0.0.1:" +  $.Viewer.params.XPI_PORT_HTTPS;
					}
					else {
						localWAS_URL = "http://127.0.0.1:" +  $.Viewer.params.XPI_PORT_HTTP;
					}
					
					var XPIParams = {
							LOCAL_WAS_URL		: localWAS_URL,
							LANG 						: $.Viewer.params.LANG,
							SERVER_KEY 			: $.Viewer.params.SERVER_KEY,
					};
					
					/**
					 * Call LocalWAS
					 */
					$.when($.OfficeXPI.init(XPIParams, $.Lang)).then(function(a){
					
					}).fail(function(){
			        	
					});
		        }).fail(function(){
		        	
		        }).always(function(){
		        	
		        });
			}
		},
		Draw_MainContext :function() {
			var arObjMenu = $.Common.sortContextMenuItem($.Viewer.localeMsg,  $.Viewer.contextMenu['Menu'], $.Viewer.params.VIEW_MODE, $.Viewer.currentKey);
			$.ContextMenu.getMenu($.Viewer, $("#btn_open_menu"), $("#btn_open_menu"), arObjMenu, $.Viewer.params, { spacing_top : true});				
		
		},
		change_GroupKey : function(option) {


			var key = null;
			if(typeof(option) === 'string' || option instanceof String) {
				key = option;
			}
			else {
				key = option.value;
			}

			if( key.indexOf(",") !== -1 ) {
				key = "";
			}



			if($.Common.isBlank(key) ){
				key = $.Viewer.params.KEY;
				$(".key_select option").eq(0).prop("selected",true);
			}
			else {
				$(".key_select option[value=" + key + "]").prop('selected', true);
				$.Viewer.params.CLICKED_SLIP_IRN = null;
				$("#area_slip")[0].scrollTop = 0;
			}

			$("#slip_masonry").empty();
			//	$.Actor.objSlipItem = null;
			$("#area_attach").empty();
			$("#originalImage").empty();

			//	$.Actor.objAttachItem = null;

			$.Viewer.currentKey = key;
			
			$.Viewer.Draw_MainContext();
			$.Common.Draw_LeftMenu($.Viewer);

			$.Actor.displayThumb($.Viewer);
			
			var elAttachArea = $("#viewer_right_extra");
			var isShown = elAttachArea.attr("show");
			
			if($.Viewer.objAttachItem != null && "1" === isShown) {
				$.Viewer.addAttachItem($.Viewer.objAttachItem, $("#area_attach"), key);
			}

			if(!$.Common.isBlank($.Viewer.currentKey) && $.Viewer.currentKey.indexOf(",") <= -1) {
				$.Viewer.getCommentCnt();
			}
		},
		pageSubmit : function() {
			//	$.Common.postSubmit(g_RootURL + "/slip_actor.jsp", $.Actor.params, "post");
			$.Viewer.reset();


			$.Viewer.initializeSlip();
		},
		reset : function() {
			$(".slip_masonry").empty();
			$(".area_attach").empty();
			

		//	$(".key_select option").eq(0).prop("selected",true);
			
			$.Viewer.slipTotalCnt = 0;
			$.Viewer.attachTotalCnt = 0;
			$.Viewer.startIdx = 0;
			$.Viewer.params.CLICKED_SLIP_IRN = null;
		},
		initButtons : function()
		{
			$.Common.Draw_LeftMenu($.Viewer);
			
			$("#list_btnLeft > div").each(function(i) {
			//	$(this).unbind();
				$(this).on({
	        	    mouseenter: function () {
	        	    	var elImg 		= $(this).children('img');
	    				var imgURL 	= elImg.attr("src");
	    				var modifiedImgURL 	= imgURL.substring(0,imgURL.lastIndexOf(".")) + "_on.png";
	    				
	        	    	$(this).children('img').attr('src',  modifiedImgURL);
	        	    //	$(this).css( 'cursor', 'pointer' );
	        	    },
	        	    mouseleave: function () {
	        	    	var elImg 		= $(this).children('img');
	    				var imgURL 	= elImg.attr("src");
	    				var modifiedImgURL 	= imgURL.replaceAll("_on","");
	    				
	        	    	$(this).children('img').attr('src', modifiedImgURL);
	        	    	//$(this).css( 'cursor', 'default' );
	        	    },
	        	    /*click: function() {
	        	    	var isCSOperation = $(this).attr("cs_operation");

	        	    	if("1" === isCSOperation)
        	    		{
        	    			$.Common.simpleAlert("확인",$.Actor.localeMsg.CHECKING_XPI, 0.3);
        	    		}

	        	    }*/
	        	});
			});
		},

		getAttachList : function(params, isMultiKey)
		{
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");

			var objListParams = {
					KEY :  params.KEY,
					KEY_TYPE : params.KEY_TYPE,
					USER_ID : params.USER_ID,
					CORP_NO : params.CORP_NO,
					LANG : params.LANG,
			};

			$.when($.Common.RunCommand(g_ActorCommand, "GET_ATTACH_LIST", objListParams)).done(function(res) {

				$.Viewer.attachCnt = Object.keys(res).length;

				$.Viewer.objAttachItem = res;
				$.Viewer.addAttachItem(res, $("#area_attach"), $.Viewer.currentKey);

				// if($.Viewer.attachCnt > 0) {
				// 	$.Viewer.toggleAttachList();
				// }

				$("#area_attach").niceScroll({horizrailenabled: false, cursorcolor:"#"+$.Viewer.colorSet.NAVIGATION});


				if(isMultiKey) {
					// if($.Viewer.attachCnt > 0) {
					// 	//$.Viewer.showAttachList();
					// }
				}
				else {
					if($.Viewer.attachCnt > 0) {
						$.Viewer.showAttachList();
					}
				}

			}).fail(function(res){
	//			alert("Failed to load attach.");
			}).always(function(){

				$.Common.HideProgress("#attach_progress");

			});
		},
		addAttachItem : function(arObjAttach, elDest, specificKey) {
			
			elDest.empty();
			
			$.each(arObjAttach,function(i){
				
				if(!$.Common.isBlank(specificKey) && specificKey.indexOf(",") == -1 && this.JDOC_NO != specificKey) return true;
				
				var elAttach = $.Viewer.getAttachElement(this);
				elAttach.appendTo(elDest);
				$("[class=area_name]").niceScroll({horizrailenabled: true, cursorcolor:"#"+$.Viewer.colorSet.NAVIGATION});
				$.Viewer.setAttachMouseEvent(elAttach);
			});
		},
		//Draw attach item
		getAttachElement : function(objData) {
		
			//Draw attach outline
			var elAttach = $(document.createElement('div'));
			elAttach.addClass("attach_item");
			elAttach.attr("id","attach_item");
			elAttach.attr("idx",objData.SDOC_NO);
			elAttach.attr("command","VIEW_ORIGINAL_ATTACH");
			
			//Draw checkbox area
			var elTitleCheckbox = $(document.createElement('div'));
			elTitleCheckbox.addClass("viewer_area_cb");
			elTitleCheckbox.appendTo(elAttach);
			
			//Draw checkbox
			var elCheckbox =  $(document.createElement('label'));
			elCheckbox.addClass("cb_container");
			elCheckbox.addClass("attach_check");
			elCheckbox.append($(document.createElement('input')).attr({"id":"chk", "type":"checkbox"}));
			elCheckbox.append($(document.createElement('span')).addClass("checkbox"));
			elCheckbox.appendTo(elTitleCheckbox);
			
		
			
			var elInfoArea = $(document.createElement('div'));
			elInfoArea.addClass("area_info");
		//	elInfoArea.css("background-color","rgb("+objData.SDOC_COLOR+")");
			elInfoArea.appendTo(elAttach);
			
			var titleName = objData.SDOC_NAME;
		//	if("AFTER" == $.Viewer.params.VIEW_MODE) {
				
				if("1" == objData.SDOC_AFTER) {
					titleName = "★) "+objData.SDOC_NAME;
				}
		//	}
			
			var elAttachTitle = $(document.createElement('div'));
			elAttachTitle.addClass("area_name");
			elAttachTitle.css("color","#"+$.Viewer.colorSet.FONT_COLOR );
			elAttachTitle.append($(document.createElement('span')).html(titleName));
			elAttachTitle.appendTo(elInfoArea);
			
			//Draw attach Type
			var elAttachType = $(document.createElement('div'));
			elAttachType.html(objData.SDOC_KINDNM);
			elAttachType.addClass("area_attach_type");
			elAttachType.css({
				"color":"#"+$.Viewer.colorSet.ATTACH_TYPE_FONT
			});
			elAttachType.appendTo(elInfoArea);
			
			
			//Draw attach Type area
			var elAttachBtnArea = $(document.createElement('div'));
			elAttachBtnArea.addClass("area_attach_down");
			elAttachBtnArea.attr("command","VIEW_ORIGINAL_ATTACH")
			elAttachBtnArea.append($(document.createElement('img')).attr("src", g_RootURL+"image/common/context/download_cs.png"));
			elAttachBtnArea.unbind("click").bind("click",function(e){e.stopPropagation(); $.Operation.execute($.Viewer, elAttachBtnArea, objData)});
			elAttachBtnArea.appendTo(elAttach);

			return elAttach;
		},
		setUIColor : function()
		{
			var objColor =  $.extend($.Color.PC.Viewer, $.Color.Common);

			if(objColor != null)
			{
				$(".area_menu_btn").css("background","#"+objColor.NAVIGATION);
				$(".area_viewer_title").css({"background":"#"+objColor.NAVIGATION, "color" : "#" + objColor.NAVIGATION_FONT});
				// $(".info_title").css({"border-bottom":"2px solid #"+objColor.BORDER});
				$(".viewer_main").css({"border-top":"2px solid #"+objColor.BORDER, "border-bottom":"2px solid #" + objColor.BORDER});
				$("#area_slip").niceScroll({horizrailenabled: false, cursorcolor:"#"+objColor.NAVIGATION});
				$(".viewer_right .title").css({"border-top":"2px solid #"+objColor.BORDER});
				$(".viewer_right .area_original").css({"border-bottom":"2px solid #"+objColor.BORDER});

				$.Viewer.colorSet = objColor;
			}
		},
		removeSlipElement : function(elTarget) {
			
			$.each(elTarget,function(){
				$(this).closest("#slip_item").remove();
			})
			$('#slip_masonry').masonry('layout');
			
		//	$.Viewer.redrawThumb();
			
			$("#area_slip").getNiceScroll().resize();
		},
		removeAttachElement : function(elTarget) {
			
			$.each(elTarget,function(){
				$(this).closest("#attach_item").fadeOut(200, function() { $(this).remove(); });
			})
			
			$("#area_attach").getNiceScroll().resize();
		},

		getThumbElement : function(objData, callerObjData)
		{
			//Draw thumb outline
			var idx 		= objData.SLIP_IRN;
			var group 	= objData.SDOC_NO;

			var elThumb = $(document.createElement('div'));
			elThumb.addClass("slip_item");
			elThumb.attr("idx", idx);
			elThumb.attr("group", group);
			elThumb.css({
				"width" : callerObjData.thumbWidth
			});
			elThumb.attr("id","slip_item");

			if("1" === objData.SDOC_ONE)
			{
				elThumb.addClass("oneSlip");
			}

			//Draw thumb Title area
			var elThumbTitleArea = $(document.createElement('div'));
			elThumbTitleArea.addClass("area_title");
			//elThumbTitleArea.css("background-color","rgb("+objData.KIND_COLOR+")");
			elThumbTitleArea.appendTo(elThumb);

			if("1" === objData.SDOC_AFTER) {
				elThumbTitleArea.addClass("after");
			}

			//Draw checkbox area
			var elTitleCheckbox = $(document.createElement('div'));
			elTitleCheckbox.addClass("area_cb");
			elTitleCheckbox.appendTo(elThumbTitleArea);

			//Draw checkbox
			var elCheckbox =  $(document.createElement('label'));
			elCheckbox.addClass("cb_container");
			elCheckbox.addClass("slip_check");
			elCheckbox.append($(document.createElement('input')).attr({"id":"chk","type":"checkbox"}));
			elCheckbox.append($(document.createElement('span')).addClass("checkbox"));
			elCheckbox.appendTo(elTitleCheckbox);

			//Draw option btn area
			var elTypeColor = $(document.createElement('div'));
			elTypeColor.attr("id","type_color");
			elTypeColor.css("background-color","rgb("+objData.KIND_COLOR+")");
			elTypeColor.appendTo(elThumbTitleArea);


			//Draw thumb title
			var elThumbTitle = $(document.createElement('div'));
			elThumbTitle.addClass("thumb_title");
			elThumbTitle.append($(document.createElement('span')).html(objData.SDOC_KINDNM));
			elThumbTitle.appendTo(elThumbTitleArea);


			if("1" === objData.SDOCNO_INDEX && "SLIPDOC" === objData.FOLDER.toUpperCase())
			{
				var elThumbBtnArea = $(document.createElement('div'));
				elThumbBtnArea.addClass("area_title_btn");
				elThumbBtnArea.attr("type","SLIP");
				elThumbBtnArea.appendTo(elThumbTitleArea);
				objData.IS_FOLD = callerObjData.IS_FOLD;
				//	elThumb.attr("first","1");
				//	elThumb.attr("fold","1");
			}
			// else
			// {
			// 	elThumb.css("display","none");
			// }



			//Draw image area
			var elThumbImgArea = $(document.createElement('div'));
			elThumbImgArea.css("position","relative");
			elThumbImgArea.attr("class","area_thumb");
			elThumbImgArea.appendTo(elThumb);

			//Add link
			var vElImageHref = $(document.createElement('a'));
			vElImageHref.addClass("link");
			vElImageHref.appendTo(elThumbImgArea);

			//Add image
			var sbImgURL = new StringBuffer();

			if("SLIPDOC" === objData.FOLDER.toUpperCase()) {
				sbImgURL.append(this.rootURL);
				sbImgURL.append("DownloadImage.do?");
				sbImgURL.append("ImgType=thumb");
				sbImgURL.append("&DocIRN=" + objData.DOC_IRN);
				sbImgURL.append("&Idx=" + objData.DOC_NO);
				sbImgURL.append("&degree=" + objData.SLIP_ROTATE);
				sbImgURL.append("&UserID=" + callerObjData.params.USER_ID);
				sbImgURL.append("&CorpNo=" + callerObjData.params.CORP_NO);
				sbImgURL.append('?' + Math.random());


				var vElImage = $(document.createElement('img'));
				vElImage.attr("src",sbImgURL);
				vElImage.attr("class","thumb_img");

				$(vElImageHref).append(vElImage);
			}
			else {
				var ext =  objData.ORG_FILENM.substring(objData.ORG_FILENM.indexOf(".") + 1, objData.ORG_FILENM.length);

				switch (ext.toLowerCase()) {
					case "xlsx":
					case "xlsm":
					case "xls":
					case  "xltx":
					case "xltm":
					case "csv":
						sbImgURL.append(g_RootURL);
						sbImgURL.append("image/common/xls.png");
						break;
					case "ppt":
					case "pptm":
					case "pptx":
						sbImgURL.append(g_RootURL);
						sbImgURL.append("image/common/ppt.png");
						break;
					case "pdf":
						sbImgURL.append(g_RootURL);
						sbImgURL.append("image/common/pdf.png");
						break;
					case "doc":
					case "docx":
					case "docm":
						sbImgURL.append(g_RootURL);
						sbImgURL.append("image/common/word.png");
					case "txt":
						sbImgURL.append(g_RootURL);
						sbImgURL.append("image/common/txt.png");
						break;
					default :
						sbImgURL.append(g_RootURL);
						sbImgURL.append("image/common/attach.png");
						break;

				}



				var vElImage = $(document.createElement('img'));
				vElImage.attr("src",sbImgURL);
				vElImage.attr("class","thumb_img");

				var imgContainer = $(document.createElement('div'));
				imgContainer.append(vElImage);
				imgContainer.attr("class","attach_icon");

				$(vElImageHref).append(imgContainer);
			}


			var sbSlipInfo = new StringBuffer();
			sbSlipInfo.append(objData.SDOC_NAME);
			sbSlipInfo.append("<br/>"+objData.REG_USERNM);

			//Draw thumb Info area
			var elThumbInfoArea = $(document.createElement('div'));
			elThumbInfoArea.addClass("area_info");

			elThumbInfoArea.html(sbSlipInfo.toString());
			elThumbInfoArea.appendTo(elThumbImgArea);

			//Draw thumb effect area
			var elThumbEffectArea = $(document.createElement('div'));
			elThumbEffectArea.addClass("area_effect");
			elThumbEffectArea.appendTo(elThumbImgArea);

			//Add image

			return elThumb;
		},
		selectSlipFromThumb : function(idx) {

			if($.Common.isBlank(idx)) {
				var selectedSlip = $("#slip_item:first");
				if(selectedSlip != null)
				{
					selectedSlip.find(".area_thumb").trigger("click");
				}
				
				return;
			}
			else {
				var selectedItem 	= $.Viewer.objSlipItem[idx];
				if(selectedItem !== null)
				{
					var elTarget = null;
					if("1" === selectedItem.SDOCNO_INDEX) {
						elTarget = $("#slip_masonry").find("[idx="+selectedItem.SLIP_IRN+"]");
						if(elTarget.length) {
							var elThumb = elTarget.find(".area_thumb");
							elThumb.trigger("click");
						}
					}
					else {
						elTarget = $("#slip_masonry").find("[group="+selectedItem.SDOC_NO+"]:first");

						$.Actor.displayFoldThumb($.Viewer, elTarget.attr("idx"), selectedItem.SDOC_NO);

						if(elTarget.length) {
							elTarget.find(".area_thumb").trigger("click");
						}
					}

					setTimeout(function() {
						$("#area_slip")[0].scrollTop = elTarget.position().top;
					},400);
				}
				else
				{
					var selectedSlip = $("#slip_item:first");
					if(selectedSlip != null)
					{
						selectedSlip.find(".area_thumb").trigger("click");
					}
				}
			}

		},
		displaySlipInfo : function(objData){
			
			$(".info_content").empty();
			$(".info_content").append($.Viewer.getInfoElement($.Viewer.localeMsg.JDOC_NO, objData.JDOC_NO));
			$(".info_content").append($.Viewer.getInfoElement($.Viewer.localeMsg.REG_DATE, objData.CABINET));
			$(".info_content").append($.Viewer.getInfoElement($.Viewer.localeMsg.CORP_NO, objData.CORP_NM + "(" +objData.CORP_NO + ")"));
			$(".info_content").append($.Viewer.getInfoElement($.Viewer.localeMsg.PART_NO, objData.PART_NM + "(" +objData.PART_NO + ")"));
			$(".info_content").append($.Viewer.getInfoElement($.Viewer.localeMsg.REG_USER, objData.REG_USERNM + "(" +objData.REG_USER + ")"));

			$.Common.HideProgress("#info_progress");
		},
		
		getInfoElement : function(title, value) {
			
			var elInfoBlock = $(document.createElement('div'));
			elInfoBlock.addClass("content_block");
			var elTitle = $(document.createElement('div'));
			elTitle.addClass("content_title");
			elTitle.html(title);
			elTitle.appendTo(elInfoBlock);
			
			var elValue = $(document.createElement('div'));
			elValue.addClass("content_value");
			elValue.html(value);
			elValue.appendTo(elInfoBlock);
			
			return elInfoBlock;
		},
		displayCanvasOriginal : function(objData) {

			$.Common.ShowProgress("#original_progress","Waiting..","000000","0.7");
			objData['IMG_DPI'] = $.Viewer.params.IMG_DPI;
			var canvas = null;

			// if($.Viewer.isBookmarkLoaded) {
			var bookmarkContext = Bookmark();
			var bookmarkItem = objData["BOOKMARKS"];
			// if(bookmarkItem != null && bookmarkItem.length > 0) {

				//var zoomRatio = $.Viewer.viewer.panzoom('getScale',$.Viewer.viewer.panzoom('getMatrix'));

				$("#bookmark").remove();
				canvas = $(document.createElement('div'));
				canvas.attr({
					"id": "bookmark",
					"class": "bookmark",
					"parent" : "viewer"
				})

				canvas.appendTo($("#originalImage"));

				var elImage = new Image();

				var sbImgURL = new StringBuffer();
				sbImgURL.append(this.rootURL);
				sbImgURL.append("DownloadImage.do?");
				sbImgURL.append("&DocIRN="+objData.DOC_IRN);
				sbImgURL.append("&Idx="+objData.DOC_NO);
				sbImgURL.append("&degree="+objData.SLIP_ROTATE);
				sbImgURL.append("&UserID="+$.Viewer.params.USER_ID);
				sbImgURL.append("&CorpNo="+$.Viewer.params.CORP_NO);

				elImage.src = sbImgURL.toString();

				bookmarkContext.init(canvas, $(elImage), objData, $.Viewer.params, $.Actor);
				$.when(bookmarkContext.drawTargetImage("#original_progress")).then(function(){
					bookmarkContext.drawItems(bookmarkItem, objData["SLIP_ROTATE"]);
				}).always(function(){
					$("#zoomIn").on("click", function(e){
						e.preventDefault();
						bookmarkContext.zoomIn();
					})
					$("#zoomOut").on("click", function(e){
						e.preventDefault();
						bookmarkContext.zoomOut();
					})

					if("T" === $.Viewer.params.USE_BOOKMARK_DRAW) {
						if($.Viewer.drawContext === null) {
							$.Viewer.drawContext = Draw();
							var i18nMsgProps = $.Common.Localize($.Lang, "data-i18n", $.Viewer.params.LANG,"Draw");
							$.Viewer.drawContext.init(bookmarkContext, i18nMsgProps, "#colorPicker");
						}
						else {
							$.Viewer.drawContext.reset(bookmarkContext);
						}
					}
				});


				// $.Bookmark.Draw_BookmarkItem(bookmark[0], bookmarkItem, objData["SLIP_ROTATE"]);
			// }



		},
		displayOriginalAttach : function(){
			$("#originalImage").empty();
			$.Common.ShowProgress("#original_progress","Waiting..","000000","0.7");

			var sbImgURL = new StringBuffer();
			sbImgURL.append(g_RootURL);
			sbImgURL.append("image/common/attach.png");

			var elCenterVerticalHelper = $(document.createElement('span'));
			elCenterVerticalHelper.addClass("helper");
			elCenterVerticalHelper.appendTo($("#originalImage"));

			var elImage = $(document.createElement('img'));
			elImage.attr({
				"src":sbImgURL.toString()
			});
			elImage.appendTo($("#originalImage"));
			elImage.load(function() {
				$.Common.HideProgress("#original_progress");
			});


			$.Viewer.resetViewer();
		},
		/**
		 * Display original image
		 */
		displayOriginal : function(objData){

			$("#originalImage").empty();
			$.Common.ShowProgress("#original_progress","Waiting..","000000","0.7");

			var sbImgURL = new StringBuffer();
			sbImgURL.append(this.rootURL);
			sbImgURL.append("DownloadImage.do?");
			sbImgURL.append("&DocIRN="+objData.DOC_IRN);
			sbImgURL.append("&Idx="+objData.DOC_NO);
			sbImgURL.append("&degree="+objData.SLIP_ROTATE);
			sbImgURL.append("&UserID="+$.Viewer.params.USER_ID);
			sbImgURL.append("&CorpNo="+$.Viewer.params.CORP_NO);
			
			var elCenterVerticalHelper = $(document.createElement('span'));
			elCenterVerticalHelper.addClass("helper");
			elCenterVerticalHelper.appendTo($("#originalImage"));
			
			var elImage = $(document.createElement('img'));
			elImage.attr({
				"src":sbImgURL.toString()
			});
			elImage.appendTo($("#originalImage"));
			elImage.load(function() {
				$.Common.HideProgress("#original_progress");
			});

			
			$.Viewer.resetViewer();
		},
		Download_Original : function(element) {
			if($.Viewer.Cur_Slip != null) {
				$.Operation.execute($.Viewer, $(element).attr("command"), $.Viewer.Cur_Slip);
			}
			
		},

		
		resetViewer : function() {
			if($.Viewer.viewer != null)
			{
				$.Viewer.viewer.panzoom("reset", false);
			}

			if($.Viewer.is_Maximized) {
					$.Viewer.is_Maximized = false;
					$.Viewer.ZoomIn_Thumb();
				}
		},
		/**
		 * Set mouse events on target thumb.
		 */
		setThumbMouseEvent : function(elThumb) {

			$.Common.ShowProgress("#original_progress","Waiting..","000000","0.7");

			var version = $.Common.GetBrowserVersion().ActingVersion;

			var idx = elThumb.closest("#slip_item").attr("idx");
			var objSelelctedItem = $.Viewer.objSlipItem[idx];
			
		
			//Click event
			var evClick = function(e) {
				
				if(e.ctrlKey) {
					
				}
				else
				{
					$.Viewer.Cur_Slip = objSelelctedItem;

					//reset check status to false for multi selecting mode
					$("[id=slip_item]").css("outline","");
					$("[id=slip_item]").find("#chk").attr('checked', false);
					$("[id=attach_item]").css("background-color","");
					$("[id=attach_item]").find("#chk").attr('checked', false);
					
					
					//Get clicked slip info
					$.Viewer.displaySlipInfo(objSelelctedItem);

					//Show original image
					if("SLIPDOC" === objSelelctedItem.FOLDER.toUpperCase()) {

						if(version > 9 && $.Viewer.isBookmarkLoaded) {
							$.Viewer.displayCanvasOriginal(objSelelctedItem);
						} else {
							$.Viewer.displayOriginal(objSelelctedItem);
						}
					}
					else {
						$.Viewer.displayOriginalAttach(objSelelctedItem);
					}

				}
				var cb = elThumb.closest("#slip_item").find("#chk")[0];
				cb.checked = !cb.checked;
				
				if(cb.checked) 
				{
					elThumb.closest("#slip_item").css("outline","2px solid #"+ $.Viewer.colorSet.FOCUSED_SLIP);
				}
				else
				{
					elThumb.closest("#slip_item").css("outline","");
				}
			}
			
			//Double click event
			var evDblClick = function() {
			//	$.Actor.run(elThumb.closest("#slip_item"));
			}

			var DELAY = 400, clicks = 0, timer = null;
			elThumb.on("click", function(e){
				e.preventDefault();
				if(version < 9)
				{
					evClick(e);
				}
				else
				{
					clicks++;  //count clicks
			        if(clicks === 1) {
			            timer = setTimeout(function() {
			            	evClick(e);  //perform single-click action    
			                clicks = 0;             //after action performed, reset counter
			            }, DELAY);
			        } else {
			            clearTimeout(timer);    //prevent single-click action
			            evDblClick(e);  //perform double-click action
			            clicks = 0;             //after action performed, reset counter
			        }
				}
		    })
		    .on("dblclick", function(e){
		    	if(version < 9)
				{
		    		evDblClick();
				}
				else
				{
					e.preventDefault();  //cancel system double-click event
				}
		    });
		},
		setAttachMouseEvent : function(elAttach) {
			
			elAttach.unbind("").bind("click",function(e){
				
				if(e.ctrlKey) {
					
				}
				else
				{
					$("[id=slip_item]").css("outline","");
					$("[id=slip_item]").find("#chk").attr('checked', false);
					$("[id=attach_item]").css("background-color","");
					$("[id=attach_item]").find("#chk").attr('checked', false);
				}
				
				var cb = elAttach.find("#chk")[0];
				cb.checked = !cb.checked;
				
				if(cb.checked) 
				{
					elAttach.css("background-color","#"+ $.Viewer.colorSet.FOCUSED_ATTACH);
				}
				else
				{
					elAttach.css("background-color","");
				}
				
			});
			
		},
		close : function() {
			window.close();
		},
		showAttachList : function() {
			$(".viewer_right").addClass("attach_visible");
			$("#viewer_right_extra").addClass("attach_visible");
			// var widthLeft = $.Common.getWidthPercent($(".viewer_left"));
			// $(".viewer_right").css("width",100 - widthLeft + "%");
			// $("#viewer_right_extra").hide();
			$("#viewer_right_extra").attr("visible","1");
			// $.Viewer.toggleAttachList();
		},
		//Toggle attach list
		toggleAttachList : function() {


			var elAttachArea = $("#viewer_right_extra");
			var isVisible = elAttachArea.attr("visible");
			if("0" === isVisible)
			{
				$(".viewer_right").addClass("attach_visible");
				$("#viewer_right_extra").addClass("attach_visible");

//
// 				elAttachArea.show();
				elAttachArea.attr("visible","1");
//
				//Get attach list on first show
				if($.Viewer.objAttachItem == null) {
					$.Viewer.getAttachList($.Viewer.params);
				}
			}
			else
			{
				$(".viewer_right").removeClass("attach_visible");
				$("#viewer_right_extra").removeClass("attach_visible");
				elAttachArea.attr("visible","0");
			}
			
			$.Viewer.resetViewer();
			
		//	$.Viewer.setBorderPosition();
		},
		setImageViewer : function() {
			
			var panzoom = $("#originalImage").panzoom({
				minScale: 0.7,
				maxScale: 5,
				   $zoomIn:$("#zoomIn"),
				  $zoomOut:$("#zoomOut"), 
				animate:true,
				cursor:'inherit'
			})

			
			panzoom.parent().on('mousewheel.focal', function(e) {
				e.preventDefault();

	            var delta = e.delta || e.originalEvent.wheelDelta;
	            var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
	            panzoom.panzoom('zoom', zoomOut, {
					animate: false,
					focal: e,
					increment:0.1
				});

				// var obj = $('#originalImage');
				// var transformMatrix = obj.css("-webkit-transform") ||
				// 	obj.css("-moz-transform")    ||
				// 	obj.css("-ms-transform")     ||
				// 	obj.css("-o-transform")      ||
				// 	obj.css("transform");
				// var matrix = transformMatrix.replace(/[^0-9\-.,]/g, '').split(',');
				// var x = matrix[12] || matrix[4];//translate x
				// var y = matrix[13] || matrix[5];//translate y
				//
	            // $("#bookmark")[0].getContext("2d").transform(
				// 	matrix[0],
				// 	matrix[1],
				// 	matrix[2],
				// 	matrix[3],
				// 	matrix[4],
				// 	matrix[5]
				// );


			}); 
			
			 return panzoom;	
		 }
}