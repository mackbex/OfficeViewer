"use strict";


$.Actor = {
		localeMsg : null,
		colorSet : null,
		params : null,
		slipRange : 30,
		attachRange : 100,
		thumbWidth : 160,
	//	startIdx : 0,
		slipTotalCnt : 0,
		attachTotalCnt : 0,
		objSlipItem: null,
		objAttachItem : null,
		contextMenu : null,
		currentKey : null,
		is_Maximized : false,
		IS_FOLD : true,
		original_scrollHeight : -1,
		isSlipLoading : false,
		isAttachLoading : false,
		USE_MAGNIFIER : false,
		isBookmarkLoaded : false,
		init : function(params) {
			 
			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");

			/**
			 * resize scroll window on resize browser
			 */
			
			$(window).on('resize', $.Common.windowCallback(function(){

				if($.Actor.is_Maximized) {
					$.Actor.is_Maximized = false;
					$.Actor.ZoomIn_Thumb();
				}
				// else {
				// 	$.Actor.ZoomOut_Thumb();
				// }
				else {
					setTimeout(function(){
						$("#area_slip").getNiceScroll().resize();
						$("#area_attach").getNiceScroll().resize();
						$("#key").getNiceScroll().resize();
						$(".attach_item_title").getNiceScroll().resize();
					}, 400);

				}
			}));
			
			//Set Actor default enviroments.
			$.Actor.params 		= params;
			$.Actor.is_Maximized = params.MAXIMIZED === "T" ? true : false;
			$.Actor.USE_MAGNIFIER = params.USE_MAGNIFIER === "T" ? true : false;
			$.Actor.IS_FOLD = params.FOLD === "T" ? true : false;
			//if(!$.Actor.params.MULTI_KEY) {
			$.Actor.currentKey = $.Actor.params.KEY;
			//}

			if($.Actor.params.USE_BOOKMARK) {
				if($.Common.GetBrowserVersion().ActingVersion > 9) {
					$.getMultiScripts([g_VIEW_BOOKMARK_URL, g_CANVAS_LIB])
					.fail(function(err) {
						$.Common.simpleToast("Failed to load Bookmark.");
					})
					.done(function(){
						$.Actor.isBookmarkLoaded = true;
					});
				}
			}
			
			$.Actor.initButtons();
			//Set globalization.
			$.Actor.localeMsg = $.Common.Localize($.Lang, "data-i18n", params.LANG,"Actor");
			//Set UI set
			$.Actor.setUIColor();
			
			//Get Actor menu list
			$.Actor.contextMenu = $.Menu.PC.Actor;
			
			$.Actor.Draw_MainContext();
			$.Actor.setBtnToolTip();
			
			var arObjAdd = $.Common.sortContextMenuItem($.Actor.localeMsg,  $.Actor.contextMenu['Add'], $.Actor.params.VIEW_MODE, $.Actor.currentKey);
			$.ContextMenu.getMenu($.Actor, $("#btn_add_slip"), $("#btn_add_slip"), arObjAdd, $.Actor.params, { spacing_top : true});				
		
			var arObjRemove = $.Common.sortContextMenuItem($.Actor.localeMsg,  $.Actor.contextMenu['Remove'], $.Actor.params.VIEW_MODE, $.Actor.currentKey);
			$.ContextMenu.getMenu($.Actor, $("#btn_remove"), $("#btn_remove"), arObjRemove, $.Actor.params, { spacing_top : true});			
			
			//Set drag event
			$.Actor.setBorderDrag();
			/*
			 * Detect LocalWAS
			 */	
			if(typeof OfficeXPI == "undefined")
			{
				
				//Load XPI Script
				$.getScript(g_XPI_URL, function() {

					var localWAS_URL =  null;
					if(location.protocol.indexOf("https") > -1) {
						localWAS_URL = "https://127.0.0.1:" +  $.Actor.params.XPI_PORT_HTTPS;
					}
					else {
						localWAS_URL = "http://127.0.0.1:" +  $.Actor.params.XPI_PORT_HTTP;
					}

					var XPIParams = {
							LOCAL_WAS_URL		: localWAS_URL,
							LANG 						: $.Actor.params.LANG,
							SERVER_KEY 			: $.Actor.params.SERVER_KEY,
					};
					
					/**
					 * Call LocalWAS
					 */
					$.when($.OfficeXPI.init(XPIParams, $.Lang)).then(function(a){

					}).fail(function(){
					//	$.Actor.attachDownloadLink();
			        	
					}).always(function(){
						$.Actor.initializeSlip();
					});

		        }).fail(function(){
		        	//$.Actor.attachDownloadLink();
		        });
			}


		},
		setBtnToolTip : function () {
			$("#btn_open_menu").attr("title", $.Actor.localeMsg.TOOLTIP_MENU);
			$("#btn_add_slip").attr("title", $.Actor.localeMsg.TOOLTIP_ADD_SLIP);
			$("#btn_open_comment").attr("title", $.Actor.localeMsg.TOOLTIP_COMMENT);
			$("#btn_open_history").attr("title", $.Actor.localeMsg.TOOLTIP_HISTORY);
			$("#btn_remove").attr("title", $.Actor.localeMsg.TOOLTIP_REMOVE);
			$("#btn_print").attr("title", $.Actor.localeMsg.TOOLTIP_PRINT);

		},
		Draw_MainContext :function() {
			var arObjMenu = $.Common.sortContextMenuItem($.Actor.localeMsg,  $.Actor.contextMenu['Menu'], $.Actor.params.VIEW_MODE, $.Actor.currentKey);
			$.ContextMenu.getMenu($.Actor, $("#btn_open_menu"), $("#btn_open_menu"), arObjMenu, $.Actor.params, { spacing_top : true});				
		
		},
		pageSubmit : function() {
		//	$.Common.postSubmit(g_RootURL + "/slip_actor.jsp", $.Actor.params, "post");

		//	var shouldLoadCnt = (Math.ceil($(".slip_item").size() / 10) * 10) + $.Actor.slipRange;

			$.Actor.reset();
			$.Actor.initializeSlip();
		// 	if(!$.Common.isBlank($.Actor.currentKey) && $.Actor.currentKey.indexOf(",") === -1 && $.Actor.params.MULTI_KEY) {
		//
		// 		$.Actor.initializeSlip();
		// //		$.Actor.getSlipList($.Actor.params,  $.Actor.slipRange, true);
		// 	//	$.Actor.getAttachList($.Actor.params, $.Actor.attachRange, true);
		//
		// 	}
		// 	else {
		//
		// 	//	$.Actor.getSlipList($.Actor.params, shouldLoadCnt, true);
		// 		$.Actor.getAttachList($.Actor.params, $.Actor.attachRange, true);
		// 		//$.Actor.initializeSlip();
		// 	}
		},
		
		change_GroupKey : function(option) {

		//	$.Actor.ZoomOut_Thumb();

			$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
			$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");

			$("#slip_masonry").empty();
		//	$.Actor.objSlipItem = null;
			$("#area_attach").empty();
		//	$.Actor.objAttachItem = null;

			$("#area_slip")[0].scrollTop = 0;
			$("#area_slip").getNiceScroll().resize();
			$("#area_attach").getNiceScroll().resize();
			$("#key").getNiceScroll().resize();
			$(".attach_item_title").getNiceScroll().resize();

			var key = null;
			if(typeof(option) === 'string' || option instanceof String) {
				key = option;
			}
			else {
				key = option.value;
			}

			if($.Common.isBlank(key) || key.indexOf(",") > -1){
				key = $.Actor.params.KEY;
				$(".key_select option").eq(0).prop("selected",true);
			}
			else {
				$(".key_select option[value=" + key + "]").prop('selected', true);
			}

			$.Actor.currentKey = key;

			$.Actor.Draw_MainContext();
			$.Common.Draw_LeftMenu($.Actor);

			$.Actor.displayThumb($.Actor);
			// $.Actor.addSlipItem($.Actor.objSlipItem, $("#slip_masonry"), key);
			$.Actor.addAttachItem($.Actor.objAttachItem, $("#area_attach"), key);

			var slipKeys = $.Actor.objSlipItem === null ? [] : Object.keys($.Actor.objSlipItem);
			var attachKeys = $.Actor.objAttachItem === null ? [] : Object.keys($.Actor.objAttachItem);
			var slipCnt = 0;
			var attachCnt = 0;
			if($.Common.isBlank(key) || key.indexOf(",") > -1){
				slipCnt = slipKeys.length;
				attachCnt = attachKeys.length;
			}
			else {
				var curSlip = slipKeys.filter(function(key) {
					return $.Actor.objSlipItem[key].JDOC_NO === $.Actor.currentKey;
				});
				slipCnt = curSlip.length;
				var curAttach = attachKeys.filter(function(key) {
					return $.Actor.objAttachItem[key].JDOC_NO === $.Actor.currentKey;
				});
				attachCnt = curAttach.length;
			}

			$("#slipCnt").html("("+slipCnt+")");
			$("#attachCnt").html("("+attachCnt+")");


			//if(!$.Common.isBlank($.Actor.currentKey) && $.Actor.currentKey.indexOf(",") <= -1) {
				$.Actor.getCommentCnt();
			//}

			$.Common.HideProgress("#attach_progress");

		},

		resize_Scroll : function() {
			//$(".slip_wrapper").css("height",$.Actor.original_scrollHeight);
			//$(".attach_wrapper").css({"top":$.Actor.original_scrollHeight, "height": $(".wrapper").outerHeight() - $.Actor.original_scrollHeight});
		
		},
		ZoomIn_Thumb : function() {

			if(!$.Actor.is_Maximized) {

				if($.Actor.USE_MAGNIFIER) {
					$.each($(".slip_item"), function(){
						var curObj 			= $.Actor.objSlipItem[$(this).attr("idx")];
						$.Actor.closeMagnifier($(this).find(".btn_magnifier"), $(this).find(".thumb_img"), curObj);
					});
				}
				$('#slip_masonry').masonry({
				   columnWidth: $(".area_slip").width() - 40
				});
				$(".slip_item").css("width", "100%");

				$('#slip_masonry').masonry('layout');

				setTimeout(function(){
					$("#area_slip").getNiceScroll().resize();
				}, 400);


				// var version = $.Common.GetBrowserVersion().ActingVersion;
				// if(version > 9) {

					if($.Actor.isBookmarkLoaded) {
						$.each($.Actor.objSlipItem, function (){
							$.Actor.reloadBookmark(this);
						});
					}
					// $.each($(".slip_item"), function(i){
					// 	var curObj 			= $.Actor.objSlipItem[$(this).attr("idx")];
					// 	var bookmarkItem = curObj["BOOKMARKS"];
					//
					// 	var elBookmark = $(this).find(".bookmark");
					//
					// 	var ctx = elBookmark[0].getContext("2d");
					//
					// 	ctx.clearRect (0, 0, ctx.canvas.width, ctx.canvas.height);
					//
					// 	elBookmark.attr({
					// 		"width": $(this).find(".area_thumb").width(),
					// 		"height": $(this).find(".area_thumb").height(),
					// 	});
					//
					//
					// 	$.Bookmark.Draw_BookmarkItem(elBookmark[0], bookmarkItem, curObj["SLIP_ROTATE"]);
					//
					// });
				// }

				$.Actor.is_Maximized = true;
			}

		},
		ZoomOut_Thumb : function() {
			if($.Actor.is_Maximized) {

				if($.Actor.USE_MAGNIFIER) {
					$.each($(".slip_item"), function(){
						var curObj 			= $.Actor.objSlipItem[$(this).attr("idx")];
						$.Actor.closeMagnifier($(this).find(".btn_magnifier"), $(this).find(".thumb_img"), curObj);
					});
				}
				$('#slip_masonry').masonry({
					columnWidth:  $.Actor.thumbWidth
				});

				$(".slip_item").css("width",  $.Actor.thumbWidth);

				$('#slip_masonry').masonry('layout');
				setTimeout(function(){
					$("#area_slip").getNiceScroll().resize();
				}, 400);
				$.Actor.is_Maximized = false;

				// var version = $.Common.GetBrowserVersion().ActingVersion;
				if($.Actor.isBookmarkLoaded) {
					$.each($.Actor.objSlipItem, function (){
						$.Actor.reloadBookmark(this);
					});
				}
				// if(version >= 9) {
				//
				// 	// $("[class=bookmark]").css({
				// 	// 	"width":$(".area_thumb").width(),
				// 	// 	"height":$(".area_thumb").height()
				// 	// });
				//
				// 	$.each($(".slip_item"), function(i){
				// 		var curObj 			= $.Actor.objSlipItem[$(this).attr("idx")];
				// 		var bookmarkItem = curObj["BOOKMARKS"];
				//
				// 		var elBookmark = $(this).find(".bookmark");
				//
				// 		var ctx = elBookmark[0].getContext("2d");
				//
				// 		ctx.clearRect (0, 0, ctx.canvas.width, ctx.canvas.height);
				//
				// 		elBookmark.attr({
				// 			"width": $(this).find(".area_thumb").width(),
				// 			"height": $(this).find(".area_thumb").height(),
				// 		});
				//
				//
				// 		$.Bookmark.Draw_BookmarkItem(elBookmark[0], bookmarkItem, curObj["SLIP_ROTATE"]);
				//
				// 	});
				// }
			}
		},

		addScrollEvent : function(element, callback) {

			var scrollTimeout = null;

			//Add scroll event for attach
			element.unbind('scroll').bind('scroll',function(e) {

				var area = $(this);
				clearTimeout(scrollTimeout);
				scrollTimeout = setTimeout(function(){

					if(area.scrollTop() + area.innerHeight() >= (area[0].scrollHeight - 5)) {

							callback();
					}

					clearTimeout(scrollTimeout);
				}, 100);

			});

		},
		//Load slip items
		initializeSlip : function()
		{

			$.when($.Actor.getSlipList($.Actor, $.Actor.params)).then(function(res){

				if(!res) {
					$.Common.HideProgress("#slip_progress");
					return;
				}

				if($.Actor.params.MULTI_KEY) {
					$.Actor.change_GroupKey($.Actor.currentKey);
				}
				else {
					$.Actor.displayThumb($.Actor);
				}


			}, function (reason) {
				$.Common.simpleToast("Failed to load thumbs.");
				$.Common.HideProgress("#slip_progress");
			});


			if("EACCT" !== $.Actor.params.VIEW_MODE.toUpperCase()) {
				// $.Actor.getAttachList($.Actor, $.Actor.params, $.Actor.attachRange);

				if(!$.Actor.params.MULTI_KEY) {
					$.Actor.getCommentCnt();
				}
			}
			
			$('#slip_masonry').masonry({
				  // options
				  itemSelector: '#slip_item',
				  columnWidth: $.Actor.thumbWidth,
				  horizontalOrder: true,
				  isFitWidth: true,
				  gutter: 20
				});


			// $.Actor.addScrollEvent($(".area_slip"), function(){
			// 	if(!$.Actor.isSlipLoading) {
			//
			// 	//	var start = $(".slip_item").size() === 0 ? 0 : $(".slip_item").size() + 1;
			//
			// 		$(".slip_wrapper").find('.progress_slip_scroll').show();
			// 		//$.Actor.getSlipList($.Actor.params,   $.Actor.slipRange);
			// 		$.Actor.displayThumb($.Actor);
			// 	}
			// });
			//
			// $.Actor.addScrollEvent($(".area_attach"), function(){
			// 	if(!$.Actor.isAttachLoading) {
			// 		$(".attach_wrapper").find('.progress_attach_scroll').show();
			// 		//$.Actor.getAttachList($.Actor, $.Actor.params, $.Actor.attachRange);
			//
			// 		$.Actor.addAttachItem($.Actor.objAttachItem, $("#area_attach"), $.Actor.currentKey);
			// 	}
			// });

			
			//Link checkbox event
			$("#slip_checkAll").change(function(){
			
				var checked = this.checked;
				 var chkItems = $("[id=slip_item]:visible").find("input[type='checkbox']");
				 $.each(chkItems,function(){
					 this.checked = checked;
				 });	 
				 //Set focused color
				 if(checked)
				 {
					 $("[id=slip_item]:visible").css("outline","2px solid #"+ $.Actor.colorSet.FOCUSED_SLIP);	
				 }
				 else
				{
					 $("[id=slip_item]:visible").css("outline","");	
				}
			});
			
			$("#attach_checkAll").change(function(){
				
				var checked = this.checked;
				 var chkItems = $("#area_attach").find("input[type='checkbox']");
				 $.each(chkItems,function(){
					 this.checked =checked;
				 });	 
				//Set focused color
				 if(checked)
				 {
					 $("[id=attach_item]").css("background-color","#"+ $.Actor.colorSet.FOCUSED_ATTACH);	
				 }
				 else
				{
					 $("[id=attach_item]").css("background-color","");	
				}
			});
			
			
		},
		getCommentCnt: function() {
			var objParams = {
					KEY : $.Actor.currentKey
			};
			
			$.when($.Common.RunCommand(g_RootURL + "CommentCommand.do", "GET_COMMENT_COUNT", objParams)).then(function(value){
				$.Common.attachBadge($("#btn_open_comment"), value.COMT_CNT, $.Actor.colorSet.BADGE);
			});
			
		},
		setBorderDrag : function() {
			$('#dragBar').mousedown(function(e){
				
				$("[id=contextWrapper]").hide();
			       $(this).attr("dragging","1");
			       var elSlip 		= $(".slip_wrapper");
			       var areaDragBar	= $(document.createElement('div'))
			       							.attr({
			       								id:"dragBarArea",
			       							})
			       							.css({
			       								position:"absolute",
			       								top:0,
			       								right:0,
			       								bottom:0,
			       								left:0,
			       								width:"100%",
			       								height:"100%",
			       							}).appendTo('.wrapper');
			       
			       var ghostBar 	= $(document.createElement('div'))
			       							.attr({
			       								id:'ghostBar',
			       							})
					                        .css({
					    	   					width: elSlip.outerWidth(),
			    	   							height:"2px",
			    	   							top: elSlip.outerHeight(),
			    	   							left: elSlip.offset().left,
			    	   							background:"rgba(0,0,0,0.4)",
			    	   							position:"absolute"
					                        }).appendTo(areaDragBar);
			       
			        $(document).mousemove(function(e){
			        	e.preventDefault();
			        	var minAreaY	= 0 + $(".attach_title").outerHeight() - ghostBar.outerHeight();
			        	var maxAreaY	= $(".actor_right").outerHeight() - $(".attach_title").outerHeight();
			        	
			        	if(e.clientY >= minAreaY && e.clientY <= maxAreaY)
			        	{
			        		ghostBar.css("top", e.clientY);
			        	}
			        	else
			        	{
			        		if(e.clientY < minAreaY) ghostBar.css("top", minAreaY);
			        		if(e.clientY > maxAreaY) ghostBar.css("top", maxAreaY);
			        	}
			       });
			    });

			   $(document).mouseup(function(e){

				  var isDragging = $("#dragBar").attr("dragging");
				  if("1" === isDragging)
			      {
					  //Apply dragged height.
					  var top = $('#ghostBar').offset().top;
					  var top_percentage = $.Common.round(top / $(".wrapper").outerHeight() * 100, 1);
					  
					  $(".slip_wrapper").css("height",top_percentage+"%");
					  $(".attach_wrapper").css({"top":top_percentage+"%"});//)$(".wrapper").outerHeight() - $('#ghostBar').offset().top);
					  
					  $("#area_slip").getNiceScroll().resize();
					  $("#area_attach").getNiceScroll().resize();
					  
			          $('#ghostBar').remove();
			          $("#dragBarArea").remove();
			          $(document).unbind('mousemove');
					  $("#dragBar").attr("dragging","0");
					  $("#dragBar").css("top",top_percentage+"%");
			       }
			    });
		},
		getAttachList : function(parent, params, loadCnt, isMultiKey)
		{

			var start = $(".attach_item").size() == 0 ? 0 : $(".attach_item").size() + 1;
			var per = loadCnt;

			// if(params.MULTI_KEY) {
			// 	start = null;
			// 	per = null;
			// 	$("#area_attach").unbind('scroll');
			// }

			var objListParams = {
					KEY : params.KEY,
					KEY_TYPE : params.KEY_TYPE,
					USER_ID : params.USER_ID,
					CORP_NO : params.CORP_NO,
					LANG : params.LANG,
			};
			
			$.when($.Common.RunCommand(g_ActorCommand, "GET_ATTACH_LIST", objListParams)).done(function(res) {

				var resCnt = Object.keys(res) == null ? 0 : Object.keys(res).length;
				if(res == null || resCnt <= 0) {
					$('.progress_attach_scroll').hide();
					$("#attachCnt").html("(0)");
					return;
				}

				if(parent.objAttachItem == null) {
					parent.objAttachItem = res;
				}
				else {

					Object.keys(res).forEach(function(dataKey) {
						parent.objAttachItem[dataKey] = res[dataKey];
					});
				}

				parent.addAttachItem(res, $("#area_attach"), $.Actor.currentKey);

				if(resCnt !== $.Actor.attachRange) {
					$("#area_attach").unbind('scroll');
				}
				$("#attachCnt").html("(" + resCnt + ")");
				if(isMultiKey) {
					$.Actor.change_GroupKey($.Actor.currentKey);
				}
			
			}).fail(function(res){
				$.Common.simpleToast("Failed to load attach.");

			}).always(function(){
				
				$.Common.HideProgress("#attach_progress");
				$('.progress_attach_scroll').hide();
			});
		},
		//Load thumb images
		getSlipList : function(parent, params)
		{
			// if(params.MULTI_KEY) {
			// 	$("#area_slip").unbind('scroll');
			// }

			var objListParams = {
				KEY :  params.KEY,
				KEY_TYPE : "EACCT" === parent.params.VIEW_MODE.toUpperCase() ? 'SDOC_NO' : params.KEY_TYPE,
				USER_ID : params.USER_ID,
				CORP_NO : params.CORP_NO,
				LANG : params.LANG
			};

			var deferred = $.Deferred();

			$.when($.Common.RunCommand(g_ActorCommand, "GET_SLIP_LIST", objListParams)).then(function(res) {

				var resCnt = Object.keys(res) == null ? 0 : Object.keys(res).length;
				if(res == null || resCnt <= 0) {
					deferred.resolve(false);
					$("#slipCnt").html("(0)");
				}
				else {
					if("F" === res.RESULT) {
						parent.objSlipItem = null;
						deferred.resolve(false);
					}
					else {
						parent.objSlipItem = res;
						deferred.resolve(true);
						$("#slipCnt").html("("+resCnt+")");
					}
				}

			},function(reason){
				deferred.reject(reason);
			});
			return deferred.promise();
		},
		// getSlipList : function(params, loadCnt, isMultiKey)
		// {
		//
		// 	var start = $(".slip_item").size() === 0 ? 0 : $(".slip_item").size() + 1;
		// 	var per = loadCnt;
		//
		// 	if($.Actor.params.MULTI_KEY) {
		// 		start = null;
		// 		per = null;
		// 		$("#area_slip").unbind('scroll');
		// 	}
		// 	var objListParams = {
		// 		KEY : params.KEY,
		// 		KEY_TYPE : params.KEY_TYPE,
		// 		USER_ID : params.USER_ID,
		// 		CORP_NO : params.CORP_NO,
		// 		LANG : params.LANG,
		// 		// START_IDX : start,
		// 		// PER : per
		// 	};
		//
		// 	$.Actor.isSlipLoading = true;
		//
		// 	$.when(
		// 		$.Common.RunCommand(g_ActorCommand, "GET_SLIP_LIST", objListParams)).done(function(res) {
		//
		// 			var resCnt = Object.keys(res) == null ? 0 : Object.keys(res).length;
		// 			if(res == null || resCnt <= 0) {
		// 				$('.progress_slip_scroll').hide();
		// 				return;
		// 			}
		//
		// 			if($.Actor.objSlipItem == null) {
		// 				$.Actor.objSlipItem = res;
		// 			}
		// 			else {
		// 				Object.keys(res).forEach(function(dataKey) {
		// 					$.Actor.objSlipItem[dataKey] = res[dataKey];
		// 				});
		// 			}
		//
		// 			$.Actor.addSlipItem(res, $("#slip_masonry"));
		//
		// 			if(resCnt !== $.Actor.slipRange) {
		// 				$("#area_slip").unbind('scroll');
		// 			}
		//
		//
		// 			if(isMultiKey) {
		// 				$.Actor.change_GroupKey($.Actor.currentKey);
		// 			}
		//
		// 	})
		// 	.fail(function(res1, res2){
		// 		alert("Failed to load thumbs.");
		// 	})
		// 		.always(function(){
		// 			$.Common.HideProgress("#slip_progress");
		// 	});
		// },
		
		addContextMenu : function(parent, elTarget, menuGroup, objData, viewMode, option) {
			//Set click event
			var fnClick = function(e) {
				
			}
			//Add icon
			var iconURL = g_RootURL+"image/common/option";
			
			var elBtn = $(document.createElement('div'));
			elBtn.unbind().bind("click",fnClick);
			elBtn.appendTo(elTarget);
			
			var elImg = $(document.createElement('img')).attr("src",iconURL + ".png");
			elImg.unbind('mouseenter mouseleave').hover(function(){
				$(this).css("opacity","0.7");
			},function(){
				$(this).css("opacity","1");
			});
			
			elImg.appendTo(elBtn);		
			
			var arObjMenu = $.Common.sortContextMenuItem(parent.localeMsg, menuGroup, viewMode, $.Actor.currentKey);
			$.ContextMenu.getMenu(parent, elTarget, elBtn, arObjMenu, objData, option);
		},
	
		addAttachItem : function(arObjAttach, elDest, specificKey)
		{
			if(arObjAttach == null) return;

			var nProcCnt = 0;
			$.each(arObjAttach,function(i){

				var elItem = $("#area_attach").find("[idx="+this.SDOC_NO+"]");

				if (elItem.length) {
					return true;
				}
				else {
					if(!$.Common.isBlank(specificKey) && specificKey.indexOf(",") == -1 && this.JDOC_NO != specificKey) return true;

					var elAttach = $.Actor.getAttachElement(this);

					var elTitleArea = elAttach.find(".area_btn");
					//Draw option icon
					$.Actor.addContextMenu($.Actor, elTitleArea, $.Actor.contextMenu["Attach"], this, $.Actor.params.VIEW_MODE, {bottom_align:true});

					elAttach.appendTo(elDest);
					$.Actor.setAttachMouseEvent(elAttach);

					nProcCnt ++ ;

					if($.Actor.attachRange <= nProcCnt) {
						return false;
					}
				}
			});

			$('.progress_attach_scroll').hide();

			if($.Actor.attachRange === nProcCnt) {
				setTimeout(function(){
					$.Actor.addScrollEvent($(".area_attach"), function(){
						if(!$.Actor.isAttachLoading) {
							$(".attach_wrapper").find('.progress_attach_scroll').show();
							$.Actor.addAttachItem($.Actor.objAttachItem, $("#area_attach"), $.Actor.currentKey);
						}
					});
				},10);
			}
			else {
				$("#area_attach").unbind('scroll');
			}

			$("[class=attach_item_title]").niceScroll({horizrailenabled: true, cursorcolor:"#"+$.Color.Common.NAVIGATION});

			// $("#area_attach").getNiceScroll().resize();
			
		},
		displayThumb : function(parent) {

			if(parent.objSlipItem == null){
				$.Common.HideProgress("#slip_progress");
				return;
			}

			var arThumbInfo = Object.keys(parent.objSlipItem);

			var arItems = {};
			if(!$.Common.isBlank(parent.currentKey) && parent.currentKey.indexOf(",") === -1 && parent.params.MULTI_KEY) {
				for(var i = 0; i < arThumbInfo.length; i++) {

					var item = parent.objSlipItem[arThumbInfo[i]];
					if(item.JDOC_NO !== parent.currentKey) {
						continue;
					}
					else {
						arItems[item.SLIP_IRN] = item;
					}
				}

				arThumbInfo = Object.keys(arItems);
			}
			else {
				arItems = parent.objSlipItem;
			}



		//	var visibleCnt = $(".slip_item").size();
		//	var start = parseInt(visibleCnt / elDest.slipRange) * 10 + elDest.slipRange;


			var targetItem = [];
			for(var i = 0; i < arThumbInfo.length; i++) {

				var item = arItems[arThumbInfo[i]];

				var elItem = null;

				if("SLIPDOC" === item.FOLDER.toUpperCase()) {
					elItem = $("#slip_masonry").find("[idx=" + item.SLIP_IRN + "]")
				} else {
					elItem = $("#slip_masonry").find("[group=" + item.SDOC_NO + "]")
				}

				if (elItem.length) {
				 	continue;
				}
				else {
					if(targetItem.length < parent.slipRange) {
						if("1" === item.SDOCNO_INDEX) {
							targetItem.push(item);
						}
						else {
							if(parent.IS_FOLD) {
								continue;
							}
							else {
								targetItem.push(item);
							}
						}
					}
					else {
						break;
					}

				}
			}

			if(targetItem == null || targetItem.length <= 0) {

				$.Common.HideProgress("#slip_progress");
				$('.progress_slip_scroll').hide();
				return;
			}
			else {
				$.Actor.addSlipItem(parent, targetItem);
			}

			if(parent.slipRange > targetItem.length) {
				$("#area_slip").unbind('scroll');
			}
			else {
				$.Actor.addScrollEvent($(".area_slip"), function(){
					if(!$.Actor.isSlipLoading) {

						//	var start = $(".slip_item").size() === 0 ? 0 : $(".slip_item").size() + 1;

						$(".slip_wrapper").find('.progress_slip_scroll').show();
						//$.Actor.getSlipList($.Actor.params,   $.Actor.slipRange);
						$.Actor.displayThumb(parent);
					}
				});
			}
		},

		addSlipItem : function(parent, item)
		{
			$.Actor.isSlipLoading = true;
			var arElThumb = [];

			$.each(item,function(i){

				//if(!$.Common.isBlank(specificKey) && specificKey.indexOf(",") === -1 && this.JDOC_NO !== specificKey) return true;

				var elThumb = parent.getThumbElement(this, parent);

				if(elThumb != null)
				{
					var elDestination = $("#slip_masonry").find("[group="+this.SDOC_NO+"]:last");

					if(elDestination.length) {
						elDestination.after(elThumb);
					}
					else {
						elThumb.appendTo($('#slip_masonry'));
					}

					$('#slip_masonry').masonry('appended', elThumb);
					elThumb.css("opacity","0");
					parent.setThumbMouseEvent(elThumb.find(".area_thumb"));

					arElThumb.push(elThumb);
				}
			});

			var loadedCnt = 0;

			$('#slip_masonry').imagesLoaded(function(){

				loadedCnt ++;
				$.Actor.isSlipLoading = false;
				$('.progress_slip_scroll').hide();

				//var elThumb = elDest.find("[class=slip_item]");
				//arElThumb.css("opacity","1");
				setTimeout(function(){

					if(parent.is_Maximized) {
						$('#slip_masonry').masonry({
							columnWidth: $(".area_slip").width() - 40
						});
						$(".slip_item").css("width", "100%");
					}
					else {
						$('#slip_masonry').masonry({
							columnWidth:  parent.thumbWidth
						});
						$(".slip_item").css("width",  parent.thumbWidth);
					}

					$('#slip_masonry').masonry('reloadItems');
					$('#slip_masonry').masonry('layout');
					setTimeout(function() {
						$("#area_slip").getNiceScroll().resize();
					},400);

					if(parent === $.Viewer) {

						var clickedIdx = 0;
						var clickedIrn = parent.params.CLICKED_SLIP_IRN;

						var visibleCnt = $(".slip_item").size();
						if(!$.Common.isBlank(clickedIrn)) {

							clickedIdx = Object.keys(parent.objSlipItem).indexOf(clickedIrn);
							if(clickedIdx >= visibleCnt) {
								$.Actor.displayThumb(parent);
							}
							else {
								var elTarget = $("#slip_masonry").find("[idx="+$.Viewer.params.CLICKED_SLIP_IRN+"]");
								if(elTarget.length) {
									$.Viewer.selectSlipFromThumb($.Viewer.params.CLICKED_SLIP_IRN);
									parent.params.CLICKED_SLIP_IRN = null;
								}
							}
						}
						else {
							if(visibleCnt < parent.slipRange) {
								$.Viewer.selectSlipFromThumb();
							}
						}
					}

				}, 100);



				$.Common.HideProgress("#slip_progress");


				var version = $.Common.GetBrowserVersion().ActingVersion;
				if(version < 9)
				{
					if(Selectivizr != null)
					{
						Selectivizr.init(); //Refresh selectivizr if brower is under IE8
					}
				}

				//Add thumb options
				$.each(arElThumb, function(){
					var idx = $(this).attr("idx");
					$(this).css("opacity","1");
					$(this).find('.area_effect').ripple({
						maxDiameter: "200%"
					});

					if("SLIPDOC" !== parent.objSlipItem[idx].FOLDER.toUpperCase()) {
						return true;
					}

					var elTitleArea = $(this).find(".area_title_btn");

					//Draw fold icon
					$.Actor.addFoldIcon(parent, elTitleArea, idx);

					if("1" !== parent.objSlipItem[idx].SDOCNO_INDEX)
					{
						//$.Actor.fold($.Actor, idx);
						var sdocNo = parent.objSlipItem[idx].SDOC_NO;

						var first = null;

						$.each(parent.objSlipItem, function(){
							if(this.SDOC_NO === sdocNo) {
								first = this;
								return false;
							}
						});

						if(first.IS_FOLD) {
							$(this).hide();
						}
						else {
							$(this).show();
						}
					}
					else {
						$(this).show();
						$.Actor.addContextMenu(parent, elTitleArea, parent.contextMenu["Thumb"], parent.objSlipItem[idx], parent.params.VIEW_MODE);

					}

					if(version > 9) {
						if (parent.isBookmarkLoaded) {

							var curObj = parent.objSlipItem[idx];
							var bookmarkItem = curObj["BOOKMARKS"];

							// if (bookmarkItem != null && bookmarkItem.length > 0) {

								var imgContainer = $(this).find(".area_thumb");


								var bookmarkContainer = $(document.createElement('div'));

								$(bookmarkContainer).attr({
									"class": "bookmark",
									"id": curObj["SLIP_IRN"],
									"parent": "actor"
								}).css({
									"width": imgContainer.width(),
									"height": imgContainer.height(),
								});

								$(bookmarkContainer).insertAfter($(this).find(".link"));
								curObj['IMG_DPI'] = parent.params.IMG_DPI;

								var img = $(this).find(".thumb_img");
								var bookmarkContext = Bookmark();
								bookmarkContext.init(bookmarkContainer, img, curObj, parent.params);
								bookmarkContext.drawItems(bookmarkItem, curObj["SLIP_ROTATE"], $.Actor);
								this.data("bookmarkContext", bookmarkContext);
							// }
						}
						else {
							$.Common.simpleToast(parent.localeMsg.FAILED_LOAD_DRAW_BOOKMARK_TOOL);
						}
					}
				});
			});
		},
		reloadBookmark:function(slipInfo) {
			var elImg = $("#slip_masonry").find("[idx='"+slipInfo.SLIP_IRN+"']");
			var bookmarkContext = elImg.data("bookmarkContext");

			bookmarkContext.resizeStage(elImg.width(), elImg.height());
			bookmarkContext.drawItems(slipInfo.BOOKMARKS, slipInfo.SLIP_ROTATE);
		},
		/**
		 * Set mouse events on target thumb.
		 */
		setThumbMouseEvent : function(elThumb) {
			
			var version = $.Common.GetBrowserVersion().ActingVersion;

			//Click event
			var evClick = function(e) {
				
				if(e.ctrlKey) {
					
				}
				else
				{
					//reset check status to false for multi selecting mode
					$("[id=slip_item]").css("outline","");
					$("[id=slip_item]").find("#chk").attr('checked', false);
					$("[id=attach_item]").css("background-color","");
					$("[id=attach_item]").find("#chk").attr('checked', false);
				}
				
				var cb = elThumb.closest("#slip_item").find("#chk")[0];
				//	cb.checked = true;
					cb.checked = !cb.checked;
					
					if(cb.checked) 
					{
						elThumb.closest("#slip_item").css("outline","2px solid #"+ $.Actor.colorSet.FOCUSED_SLIP);
						var version = $.Common.GetBrowserVersion().ActingVersion;
						if(version >= 9) {
							
						}
					}
					else
					{
						elThumb.closest("#slip_item").css("outline","");
					}
			}
			
			//Double click event
			var evDblClick = function() {
				var targetThumb = elThumb.closest("#slip_item");

				var objData = $.Actor.objSlipItem[targetThumb.attr("idx")];
				$.Operation.execute($.Actor, targetThumb, objData);
			}
			elThumb.hover(function(e){
				$(this).find(".area_info").stop().fadeIn(300,function(){ $(this).addClass("show"); });
			},
			function(e) {
				$(this).find(".area_info").stop().fadeOut(300, function(){ $(this).removeClass("show"); });
			});


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
			            evDblClick();  //perform double-click action
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
					elAttach.css("background-color","#"+ $.Actor.colorSet.FOCUSED_ATTACH);
				}
				else
				{
					elAttach.css("background-color","");
				}
				
			});
			
		},
		getAttachElement : function(objData)
		{
			var idx 		= objData.SDOC_NO;
			//Draw attach outline
			var elAttach = $(document.createElement('div'));
			elAttach.addClass("attach_item");
			elAttach.attr("idx",idx);
			elAttach.attr("id","attach_item");
			//elAttach.attr("command","VIEW_ORIGINAL_ATTACH");
			
			//Draw checkbox area
			var elTitleCheckbox = $(document.createElement('div'));
			elTitleCheckbox.addClass("area_cb");
			elTitleCheckbox.appendTo(elAttach);
			
			//Draw checkbox
			var elCheckbox =  $(document.createElement('label'));
			elCheckbox.addClass("cb_container");
			elCheckbox.addClass("attach_check");
			elCheckbox.append($(document.createElement('input')).attr({"id":"chk", "type":"checkbox"}));
			elCheckbox.append($(document.createElement('span')).addClass("checkbox"));
			elCheckbox.appendTo(elTitleCheckbox);

			//Draw attach Title area
			var elAttachTitleArea = $(document.createElement('div'));
			elAttachTitleArea.addClass("area_title");
			elAttachTitleArea.css("background-color","rgb("+objData.SDOC_COLOR+")");
			elAttachTitleArea.appendTo(elAttach);

			var titleName = objData.SDOC_NAME;
			//if("AFTER" == $.Actor.params.VIEW_MODE) {
				
			if("1" === objData.SDOC_AFTER) {
				titleName = "★) "+objData.SDOC_NAME;
			}
			//}
			
			//Draw thumb title
			var elAttachTitle = $(document.createElement('div'));
			elAttachTitle.addClass("attach_item_title");
			elAttachTitle.css("color","#"+$.Actor.colorSet.FONT_COLOR );
			if(objData.SDOC_URL === "1") {
				elAttach.attr("command","DOWN_ORIGINAL_ATTACH");
			}
			elAttachTitle.append($(document.createElement('span')).html(titleName).unbind("click").bind("click",function(e){e.stopPropagation(); $.Operation.execute($.Actor, elAttach, objData); }));
			elAttachTitle.appendTo(elAttachTitleArea);

			
			
			//Draw attach Type area
			var elAttachTypeArea = $(document.createElement('div'));
			elAttachTypeArea.addClass("area_type");
			elAttachTypeArea.css("right","66px");
			elAttachTypeArea.appendTo(elAttach);

			if(objData.SDOC_URL === "1") {
			//Draw attach Type
				elAttachTitleArea.css("right","150px");
			var elAttachType = $(document.createElement('div'));
			elAttachType.addClass("attach_item_type");
			elAttachType.html($.Actor.localeMsg.RELATED_DOC);
			elAttachType.css({
				"color":"#"+$.Actor.colorSet.ATTACH_TYPE_FONT,
				"background-color":"#"+$.Actor.colorSet.ATTACH_TYPE
			});
			elAttachType.appendTo(elAttachTypeArea);

			}

			//Draw attach Type area
			var elAttachBtnArea = $(document.createElement('div'));
			elAttachBtnArea.addClass("area_btn");
			elAttachBtnArea.attr("type", "ATTACH");
			elAttachBtnArea.appendTo(elAttach);

			if(objData.SDOC_URL !== "1") {

				var elDownBtn = $(document.createElement('div'));
				elDownBtn.addClass("down_attach");
				elDownBtn.attr("command", "DOWN_ORIGINAL_ATTACH")
				elDownBtn.append($(document.createElement('img')).attr("src", g_RootURL + "image/common/context/download_cs.png"));
				elDownBtn.unbind("click").bind("click", function (e) {
					e.stopPropagation();
					$.Operation.execute($.Actor, elDownBtn, objData);
				});
				elDownBtn.appendTo(elAttachBtnArea);
			}


			var elMoveBtn = $(document.createElement('div'));
			elMoveBtn.addClass("move_index");

			var elMoveUpBtn = $(document.createElement('div'));
			elMoveUpBtn.addClass("move_up");
			elMoveUpBtn.attr("command", "MOVE_UP_INDEX")
			elMoveUpBtn.append($(document.createElement('img')).attr("src", g_RootURL + "image/pc/actor/move_up.png"));
			elMoveUpBtn.unbind("click").bind("click", function (e) {

				e.stopPropagation();
				$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
				$.when($.Operation.execute($.Actor, elMoveUpBtn, objData)).then(function (flag) {
					if ("T" === flag) {

					// var attachList = Object.keys($.Actor.objAttachItem);
					// var targetSDocNo = attachList[attachList.indexOf(objData.SDOC_NO) - 1];
					//
					// $.Common.swapObject($.Actor.objAttachItem, objData.SDOC_NO, targetSDocNo);
						$.Actor.objAttachItem = null;
						$.Actor.getAttachList($.Actor, $.Actor.params, $.Actor.attachRange);

						$("#area_attach").empty();
						$.Actor.addAttachItem($.Actor.objAttachItem, $("#area_attach"), $.Actor.currentKey);
					} else {
						$.Common.simpleToast($.Actor.localeMsg.NO_TARGET_INDEX);
					}
				}, function(){
					$.Common.simpleToast($.Actor.localeMsg.NO_TARGET_INDEX);

				}).always(function(){
					$.Common.HideProgress("#attach_progress");
				});

			});
			elMoveUpBtn.appendTo(elMoveBtn);

			var elMoveDownBtn = $(document.createElement('div'));
			elMoveDownBtn.addClass("move_down");
			elMoveDownBtn.attr("command", "MOVE_DOWN_INDEX")
			elMoveDownBtn.append($(document.createElement('img')).attr("src", g_RootURL + "image/pc/actor/move_down.png"));
			elMoveDownBtn.unbind("click").bind("click", function (e) {

				e.stopPropagation();
				$.Common.ShowProgress("#attach_progress","Waiting..","000000","0.7");
				$.when($.Operation.execute($.Actor, elMoveDownBtn, objData)).then(function (flag) {
					if ("T" === flag) {

						$.Actor.objAttachItem = null;
						$.Actor.getAttachList($.Actor, $.Actor.params, $.Actor.attachRange);
						$("#area_attach").empty();
						$.Actor.addAttachItem($.Actor.objAttachItem, $("#area_attach"), $.Actor.currentKey);
					} else {
						$.Common.simpleToast($.Actor.localeMsg.NO_TARGET_INDEX);

					}
				}, function(){
					$.Common.simpleToast($.Actor.localeMsg.SERVER_EXCEPTION);
				}).always(function(){
					$.Common.HideProgress("#attach_progress");
				});
			});
			elMoveDownBtn.appendTo(elMoveBtn);

			elMoveBtn.appendTo(elAttachBtnArea);

//			var elAttachOption = $(document.createElement('div'));
//			elAttachOption.addClass("option");
//			elAttachOption.append($(document.createElement('img')).attr("src", g_RootURL+"image/common/option.png"));
//			elAttachOption.appendTo(elAttachBtnArea);
	
			return elAttach;
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
			elThumbTitle.append($(document.createElement('span')).html(objData.SDOC_NAME));
			elThumbTitle.appendTo(elThumbTitleArea);


			// if("1" === objData.SDOCNO_INDEX)
			// {
				var elThumbBtnArea = $(document.createElement('div'));
				elThumbBtnArea.addClass("area_title_btn");
				elThumbBtnArea.attr("type","SLIP");
				elThumbBtnArea.appendTo(elThumbTitleArea);
				objData.IS_FOLD = callerObjData.IS_FOLD;
			//	elThumb.attr("first","1");
			//	elThumb.attr("fold","1");
			// }
			// else
			// {
			// 	elThumb.css("display","none");
			// }

			if($.Actor.USE_MAGNIFIER && "SLIPDOC" === objData.FOLDER.toUpperCase()) {
			//Magnifier button
				var elMagnifier = $(document.createElement('div'));
				elMagnifier.addClass("btn_magnifier");
				elMagnifier.append($(document.createElement('img')).attr("src",g_RootURL+"image/common/context/magnifier.png"));
				elMagnifier.appendTo(elThumbBtnArea);
				elMagnifier.attr("title",$.Actor.localeMsg.TOOLTIP_MAGNIFIER);
			}
			
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
			}
			var vElImage = $(document.createElement('img'));
			vElImage.attr("src",sbImgURL);
			vElImage.attr("class","thumb_img");

			if($.Actor.USE_MAGNIFIER && "SLIPDOC" === objData.FOLDER.toUpperCase()) {
				var oriImgUrl = sbImgURL.toString();
				oriImgUrl = oriImgUrl.replaceAll("ImgType=thumb","");
				vElImage.attr("data-zoom-image",oriImgUrl);

				//Bind magnifier event
				elMagnifier.unbind("click").on("click", function(){
					$.Actor.toggleMagnifier($(this), vElImage, objData);
				});

				$(vElImageHref).append(vElImage);
			}
			else {
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
		closeMagnifier : function(elIcon, el, objData) {
			objData.MAGNIFIER_ON = false;

			var elMagnifier = el.data().ezPlus;
			if(elMagnifier !==  undefined) {
				el.data().ezPlus.zoomContainer.remove(); //remove specific .zoomContainer
				$.removeData(el, 'ezPlus');
			}
			elIcon.find("img").attr("src", g_RootURL+"image/common/context/magnifier.png");
		},
		openMagnifier : function(elIcon, el, objData) {
			objData.MAGNIFIER_ON = true;
			elIcon.find("img").attr("src", g_RootURL+"image/common/context/close.png");
			// if($.Common.GetBrowserVersion().ActingVersion <= 8) {
			// 	el.elevateZoom({
			// 		zoomType: "inner",
			// 		cursor: "crosshair"
			// 	});
			// }
			// else {
			var width = el[0].naturalWidth;
			var height = el[0].naturalHeight;


			el.ezPlus({
				zoomType: 'inner',
				cursor: 'crosshair',
				borderSize:1,
				scrollZoom: true,
				zoomLevel : 1,
				zoomWindowWidth : width,
				zoomWindowHeight : height,
			});
			// }
		},
		toggleMagnifier : function(elIcon, el, objData) {
			if($.Actor.USE_MAGNIFIER) {
				if(objData.MAGNIFIER_ON) {
					$.Actor.closeMagnifier(elIcon, el, objData);
				}
				else {
					$.Actor.openMagnifier(elIcon, el, objData);
				}
			}
		},
		addFoldIcon : function(target, elTarget, idx) {

			var objData = target.objSlipItem[idx];
			if("1" !== objData.SDOCNO_INDEX) return;
			//if(elTarget.closest("#slip_item").attr("first") != "1") return;
			
			if(/*"1" == objData.SDOCNO_INDEX &&*/ parseInt(objData.SDOCNO_CNT) > 1)
			{
				var elBtn = $(document.createElement('div'));
				elBtn.attr("id","btn_fold");
				elBtn.unbind().bind("click", function(){ $.Actor.fold(target, idx) });
				elBtn.appendTo(elTarget);

				var iconURL = null;
				if(objData.IS_FOLD) {
					iconURL = g_RootURL+"image/common/fold.png";
				}
				else {
					iconURL = g_RootURL+"image/common/unfold.png";
				}
//				if("0" == elTarget.closest("#slip_item").attr("fold")) {
//					 iconURL = g_RootURL+"image/common/fold.png";
//				}
				
				var elImg = $(document.createElement('img')).attr("src",iconURL);
				elImg.unbind('mouseenter mouseleave').hover(function(){
					$(this).css("opacity","0.7");
				},function(){
					$(this).css("opacity","1");
				});
				
				elImg.appendTo(elBtn);
			}
		},
		fold : function(target, id){

			var curItem = target.objSlipItem[id];

			if(curItem.IS_FOLD) {
				$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
				$.Actor.displayFoldThumb(target, id, curItem.SDOC_NO);
			}
			else {
				$.Actor.hideFoldThumb(target, id, curItem.SDOC_NO);
			}

			curItem.IS_FOLD = !curItem.IS_FOLD;

		},
		displayFoldThumb : function(parent, id, groupNo) {

			var arThumbInfo = Object.keys(parent.objSlipItem);

			var itemIdx = $("#slip_masonry").find("[idx=" + id + "]").index();

			$('[id=slip_item]:gt(' + (itemIdx - 1) + ')').hide();
			//$("#slip_masonry").masonry('remove',);//.hide();

			var visibleItems = $("[id=slip_item]:visible");
			//
			// var cntToDisplay = target.slipRange - (visibleItems.length % target.slipRange);

			// var limit = 0;
			var parentFold = true;
			var targetThumbs = [];

			for(var i = 0; i < arThumbInfo.length; i++) {
				var res = null;
				var item = parent.objSlipItem[arThumbInfo[i]];

				if(arThumbInfo.indexOf(item.SLIP_IRN) < arThumbInfo.indexOf(id)) {
					continue;
				}
				else {
					if(item.SDOC_NO === groupNo) {
						res = item;
					}
					else {
						if(item.SDOCNO_INDEX === "1") {
							parentFold = item.IS_FOLD;
							res = item;
						}
						else {
							if(parentFold) {
								continue;
							}
							else {
								res = item;
							}
						}
					}
				}

				/*if(++limit > cntToDisplay) {
					break;
				}*/
				// else
					{
					if(res !== null) {
						targetThumbs.push(res);
					}
				}
			}

			var filteredTargetThumbs = [];
			$.each(targetThumbs,function () {
					var elItem = null;
					if("SLIPDOC" === this.FOLDER.toUpperCase()) {
						elItem = $("#slip_masonry").find("[idx=" + this.SLIP_IRN + "]");
					}
					else {
						elItem = $("#slip_masonry").find("[group=" + this.SDOC_NO + "]");
					}

					if (elItem.length) {
						elItem.show();
					} else {
						if(this.SDOC_NO === groupNo) {
							filteredTargetThumbs.push(this);
						}
					}
			});


            $('#slip_masonry').masonry('layout');
            $("#area_slip").getNiceScroll().resize();

			if(filteredTargetThumbs.length > 0) {
				$.Actor.addSlipItem(parent, filteredTargetThumbs);
			}
			else {
				$.Common.HideProgress("#slip_progress");
			}

			$("#slip_masonry").find("[idx="+id+"]").find("#btn_fold").find("img").attr("src", g_RootURL+"image/common/unfold.png");

		},
		hideFoldThumb : function(parent, id, groupNo)
		{
            var arThumbInfo = Object.keys(parent.objSlipItem);

			var itemIdx = $("#slip_masonry").find("[idx=" + id + "]").index();
			$('[id=slip_item]:gt(' + (itemIdx) + ')').hide();
			//$('#slip_masonry').masonry('layout');

			/*$("#slip_masonry").find("[idx="+id+"]").show();*/
			$("#slip_masonry").find("[idx="+id+"]").find("#btn_fold").find("img").attr("src", g_RootURL+"image/common/fold.png");

            var visibleItems = $("[id=slip_item]:visible");


            // var cntToDisplay = target.slipRange - (visibleItems.length % target.slipRange);

			// var limit = 0;
			var parentFold = true;
			var targetThumbs = [];

			for(var i = 0; i < arThumbInfo.length; i++) {
				var res = null;
				var item = parent.objSlipItem[arThumbInfo[i]];

				if (arThumbInfo.indexOf(item.SLIP_IRN) < arThumbInfo.indexOf(id) || item.SDOC_NO === groupNo) {
					continue;
				} else {
					if(item.SDOCNO_INDEX === "1") {
						parentFold = item.IS_FOLD ? item.IS_FOLD : parent.IS_FOLD;
						res = item;
					}
					else {
						if(parentFold) {
							continue;
						}
						else {
							res = item;
						}
					}
				}

				/*if(++limit > cntToDisplay) {
					break;
				}*/
				// else
					{
					if(res !== null) {
						targetThumbs.push(res);
					}
				}
			}

			var filteredTargetThumbs = [];
			$.each(targetThumbs,function () {

				var elItem = null;
				if("SLIPDOC" === this.FOLDER.toUpperCase()) {
					elItem = $("#slip_masonry").find("[idx=" + this.SLIP_IRN + "]");
				}
				else {
					elItem = $("#slip_masonry").find("[group=" + this.SDOC_NO + "]");
				}

				if (elItem.length) {
					elItem.show();
				} else {
			//		if(this.SDOC_NO === groupNo) {
						filteredTargetThumbs.push(this);
			//		}
				}
			});

            $('#slip_masonry').masonry('layout');
            $("#area_slip").getNiceScroll().resize();

            if(filteredTargetThumbs.length > 0) {
				$.Common.ShowProgress("#slip_progress","Waiting..","000000","0.7");
				$.Actor.addSlipItem(parent, filteredTargetThumbs);
            }
		},
//		drawThumbOptionBtn: function(elThumb, objData, attrVal, imgURL, clickEvent) {
//			//Draw fold/unfold button
//			var elBtn = $(document.createElement('div'));
//				elBtn.attr(attrVal);
//				elBtn.unbind().bind("click",clickEvent);
//				elBtn.appendTo(elThumb);
//				
//				var elImg = $(document.createElement('img')).attr("src",imgURL + ".png");
//				elImg.unbind('mouseenter mouseleave').hover(function(){
//					$(this).css("opacity","0.7");
//				},function(){
//					$(this).css("opacity","1");
//				});
//				
//				elImg.appendTo(elBtn);
//			
//		},
// 		fold:function(target, key){
//
// 			var objData = target.objSlipItem[key];
// 			var elGroup = $("#area_slip [group="+objData.SDOC_NO+"]");
//
// 			if(elGroup.size() <= 1) {
// 				return;
// 			}
//
// 			var elThumb = $("[idx="+key+"]");
//
// 			var isFold = objData["IS_FOLD"];
// 			var foldIcon = null;
// 			if("1" === isFold)
// 			{
// 				foldIcon = g_RootURL+"image/common/fold.png";
// 				objData["IS_FOLD"] = "0";
// 			}
// 			else
// 			{
// 				foldIcon = g_RootURL+"image/common/unfold.png";
// 				objData["IS_FOLD"] = "1";
// 			}
// 			isFold = objData["IS_FOLD"];
//
// 			elThumb.find("#btn_fold").find("img").attr("src", foldIcon);
//
// 			$.each(elGroup, function(i) {
//
// 				// Pass first thumb
// 				if(i === 0) {
// 					return true;
// 				}
// 				else {
// 					if("1" === isFold) {
// 						$(this).css("display","none");
// 					}
// 					else
// 					{
// 						$(this).css("display","block");
// 					}
// 				}
//
// 			});
//
// 			//setTimeout(function(){
// 				$('#slip_masonry').masonry('layout');
// 				$("#area_slip").getNiceScroll().resize();
//
// 			//},200);
//
// 		},
		setUIColor : function()
		{
			var objColorActor =  $.extend($.Color.PC.Actor, $.Color.Common);
			if(objColorActor != null)
			{
				
				$(".actor_left").css("background","#"+objColorActor.NAVIGATION);
				$(".slip_title").css('border-top-color',"#"+objColorActor.NAVIGATION);

				$("#dragbar").css('background',"#"+objColorActor.NAVIGATION);
				$("#area_slip").niceScroll({horizrailenabled: false, cursorcolor:"#"+objColorActor.NAVIGATION});
				$("#area_attach").niceScroll({horizrailenabled: false, cursorcolor:"#"+objColorActor.NAVIGATION});
				$("#key").niceScroll({horizrailenabled: true, cursorcolor:"#"+objColorActor.NAVIGATION});
				$.Actor.colorSet = objColorActor;
				
			}
		},
		/*setXPILoadingEvent : function(element) {
			element.prop("onclick", null);
		},*/
		//왼쪽 버튼 메뉴 설정
		initButtons : function()
		{
			$.Common.Draw_LeftMenu($.Actor);
			
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
		Adjust_Size : function() {
			var top_percentage = 0;
			if($.Actor.original_scrollHeight == -1) {
				$.Actor.original_scrollHeight = $(".slip_wrapper").height();

				var titleHeight = $(".attach_title").outerHeight();
				var scrollHeight = $(".wrapper").outerHeight() - titleHeight;

				top_percentage = $.Common.round(scrollHeight / $(".wrapper").outerHeight() * 100, 1);

				
			//	$(".attach_wrapper").css({"top":scrollHeight, "height": titleHeight});
			}
			else
			{
				top_percentage = $.Common.round($.Actor.original_scrollHeight / $(".wrapper").outerHeight() * 100, 1);

				// $(".slip_wrapper").css("height",top_percentage+"%");
				// $(".attach_wrapper").css({"top":top_percentage+"%"});
			//	$(".attach_wrapper").css({"top":$.Actor.original_scrollHeight, "height": $(".wrapper").outerHeight() - $.Actor.original_scrollHeight});
				$.Actor.original_scrollHeight = -1;
			}

			$(".slip_wrapper").css("height", top_percentage+"%");
			$(".attach_wrapper").css({"top":top_percentage+"%"});
			$("#dragBar").css("top",top_percentage+"%");

			$("#area_slip").getNiceScroll().resize();
			$("#area_attach").getNiceScroll().resize();
		},
		maximize : function() {
			var titleHeight = $(".slip_title").outerHeight();
			$(".slip_wrapper").css("height", titleHeight);
			$(".attach_wrapper").css("height",$(".wrapper").outerHeight() - titleHeight);
        	
			$("#area_slip").getNiceScroll().resize();
			$("#area_attach").getNiceScroll().resize();
		},
		minimize : function() {
			var titleHeight = $(".attach_title").outerHeight();
			$(".slip_wrapper").css("height", $(".wrapper").outerHeight() - titleHeight);
			$(".attach_wrapper").css("height", titleHeight);
			
			$("#area_slip").getNiceScroll().resize();
			$("#area_attach").getNiceScroll().resize();
		},
		attachDownloadLink : function() {
			
				$(".actor_left > div").each(function(i) {
				
				$(this).unbind("click");
				$(this).on({
	        	    click: function() {
	        	    	var isCSOperation = $(this).attr("cs_operation");
	        	    	
	        	    	if("1" === isCSOperation)
        	    		{
        	    			$.Common.simpleConfirm($.Actor.localeMsg.Confirm,$.Actor.localeMsg.CONFIRM_DOWNLOAD, function(){
        	    				window.open("<c:url value='/down' />","_blank");
        	    			});
        	    		}
	        	    }
	        	});
			});
			
		},
		
		
		/*//Parse context menu.
		parseContextMenu : function(menuItem) {
			
			var arObjMenu = [];
			
			$.each(menuItem, function(){
				
				if($.Actor.params.VIEW_MODE.toUpperCase() == "VIEW")
				{
					if((this.MODE != null ) && this.MODE.toUpperCase() != "VIEW")
					{
						return true;
					}
				}
					
				if(!$.Common.isBlank(this.ID))
				{
					var menuID = this.ID;
					if(!$.Common.isBlank(this.ICON))
					{
						this["icon"] = g_RootURL + this.ICON;
					}
					this["title"] = $.Actor.localeMsg[menuID];
					this["click"] = function(){$.Operation.execute(menuID)}; //bind event
				}
				
				arObjMenu.push(this);
				
			});
			
			return arObjMenu;
		},*/
		
		/*//Get menu item
		openContextMenu : function(el, menuID, conetoption) {
		
			if($.Actor.contextMenu == null) return;
			
			var defOption = {leftClick : true};
			defOption = $.extend(defOption, option);
			
			var menuItem = $.Actor.contextMenu[menuID.toUpperCase()];
			
			var alMenuItem = $.Actor.parseContextMenu(menuItem);
			
			if(alMenuItem != null && alMenuItem.length > 0)
			{
				$.ContextMenu.create(el, alMenuItem, defOption);
			}
		},*/
		redrawThumb : function() {
			
			// var beforeGroup = null;
			//Redraw thumb buttons
			// $.each($("[id=slip_item]:visible"), function(){
			//
			// 	var key = $(this).attr("idx");
			//
			// 	var sdocNo = objData.SDOC_NO;
			//
			// 	if(beforeGroup === sdocNo)
			// 	{
			// 		return true;
			// 	}
				// else
				// {
				// 	beforeGroup = sdocNo;
				// 	var elThumbGroup = $("[group="+sdocNo+"]");
				// 	var elFirstThumb = elThumbGroup.eq(0);
				// 	var isFirst = $.Actor.objSlipItem[key] elFirstThumb.attr("first");
				// 	if(isFirst == "1") {
				// 		return true;
				// 	}
				// 	else
				// 	{
				// 		var elThumbBtnArea = $(document.createElement('div'));
				// 		elThumbBtnArea.addClass("area_title_btn");
				// 		elThumbBtnArea.attr("type","SLIP");
				// 		elThumbBtnArea.appendTo(elFirstThumb);
				//
				// 		elFirstThumb.attr("first","1");
				// 		elFirstThumb.attr("fold","1");
				//
				// 		//Draw fold icon
				// 		$.Actor.addFoldIcon($.Actor.arObjSlipItem, elThumbBtnArea, key);
				//
				// 		//Draw option icon
				// 		$.Actor.addContextMenu(elThumbBtnArea, $.Actor.contextMenu["Thumb"], objData, $.Actor.params.VIEW_MODE);
				// 	}
				// }
			// });
			
		},
	
		removeSlipElement : function(elTarget) {

			//var groupKey = $(this).attr("group");

			$.each(elTarget, function(){

				var groupKey = $(this).attr("group");
				var elGroup = $(".area_slip [group="+groupKey+"]");

				if(elGroup.length > 1) {
						var elNext = $(elGroup[1]);
						var idx = elNext.attr("idx");
						var objData = $.Actor.objSlipItem[idx];
						if(objData != null) {
						objData.SDOCNO_INDEX = "1";
						objData.IS_FOLD = "1";
						objData.SDOCNO_CNT = (parseInt(objData.SDOCNO_CNT) - 1) + "";

						// var elThumbBtnArea = $(document.createElement('div'));
						// elThumbBtnArea.addClass("area_title_btn");
						// elThumbBtnArea.attr("type","SLIP");
						// elThumbBtnArea.appendTo(elNext.find(".area_title"));

						var elThumbBtnArea = elNext.find(".area_title_btn");

						//Draw fold icon
						$.Actor.addFoldIcon($.Actor, elThumbBtnArea, idx);

						//Draw option icon
						$.Actor.addContextMenu($.Actor, elThumbBtnArea, $.Actor.contextMenu["Thumb"], objData, $.Actor.params.VIEW_MODE);
					}
				}


				$(this).closest("#slip_item").remove();
			})

			var resCnt = Object.keys($.Actor.objSlipItem) == null ? 0 : Object.keys($.Actor.objSlipItem).length;
			$("#slipCnt").html("("+resCnt+")");
			$('#slip_masonry').masonry('layout');
			
			//$.Actor.redrawThumb();
			
			$("#area_slip").getNiceScroll().resize();
		},
		removeAttachElement : function(elTarget) {
			
			$.each(elTarget,function(){
				$(this).closest("#attach_item").fadeOut(200, function() { $(this).remove(); });
			})

			var resCnt = Object.keys($.Actor.objAttachItem) == null ? 0 : Object.keys($.Actor.objAttachItem).length;
			$("#attachCnt").html("("+resCnt+")");
			
			$("#area_attach").getNiceScroll().resize();
		},

		Get_ImageURL : function(target, objData) {

			var sbImgURL = new StringBuffer();
			sbImgURL.append(objData.rootURL);
			sbImgURL.append("DownloadImage.do?");
			sbImgURL.append("ImgType=thumb");
			sbImgURL.append("&DocIRN="+objData.DOC_IRN);
			sbImgURL.append("&Idx="+objData.DOC_NO);
			sbImgURL.append("&degree="+objData.SLIP_ROTATE);
			sbImgURL.append("&UserID="+target.params.USER_ID);
			sbImgURL.append("&CorpNo="+target.params.CORP_NO);
			sbImgURL.append('?'+Math.random());

			return sbImgURL.toString();
		},

		Reload_Thumb : function(target, elThumb, objData, isFold) {

			if(isFold) {
				var groups = $("#slip_masonry").find("[group="+objData.SDOC_NO+"]");

				$.each(groups, function(){
					var slipIrn = $(this).attr("idx");

					target.objSlipItem[slipIrn].SLIP_ROTATE = objData.SLIP_ROTATE;
					var imageData = target.objSlipItem[slipIrn];

					var elImg =  $(this).find(".link > img");
					elImg.attr('src', $.Actor.Get_ImageURL(target, imageData));
				});
			}
			else {

				var elImg = elThumb.find(".link > img");
				elImg.attr('src', target.Get_ImageURL(target, objData));
			}

			setTimeout(function(){ $('#slip_masonry').masonry("layout"); }, 400);

			$("#area_slip").getNiceScroll().resize();
			$(".context_wrapper").hide();
			
			if(target === $.Viewer) {
				target.displayOriginal(objData);
			}
		},
		reset: function() {
			$("#slip_masonry").empty();
			$.Actor.objSlipItem = null;
			$("#area_attach").empty();
			$.Actor.objAttachItem = null;

			$("#area_slip")[0].scrollTop = 0;

			//$(".key_select option").eq(0).prop("selected",true);

			$("#slipCnt").html("("+0+")");
			$("#attachCnt").html("("+0+")");

			$("#area_slip").getNiceScroll().resize();
			$("#area_attach").getNiceScroll().resize();
			$("#key").getNiceScroll().resize();
			$(".attach_item_title").getNiceScroll().resize();


		}
	
}