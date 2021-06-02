$.WebAdd = {
		localeMsg : null,
		colorSet : null,
		params : null,
		// searchOption : {},
		viewer : null,
		isBookmarkLoaded :false,
		init : function(params) {
		//	$.Common.ShowProgress("#cocard_progress","Waiting..","000000","0.7");

			this.params 			= params;

			//Set globalization.
			$.WebAdd.localeMsg = $.Common.Localize($.Lang, "data-i18n", params.LANG,"WebAdd");

			$("#searchUserKeyword").attr('placeholder',$.WebAdd.localeMsg["PLACEHOLDER_INPUT_USERINFO"]);
			//Set UI set
			$.WebAdd.setUIColor();

			$.WebAdd.initInputDateProc();


			$.WebAdd.drawGridView();
			$.WebAdd.viewer = $.WebAdd.setImageViewer();
			// if(!$.Common.isBlank($.WebAdd.params.APPR_NO)) {
			// 	$("#ipt_apprNo").val($.WebAdd.params.APPR_NO);
			// 	$.WebAdd.Search();
			// }


			$("#ipt_corp").val(this.params.CORP_NO+" | " +this.params.CORP_NM);
			$("#ipt_part").val(this.params.PART_NO+" | " +this.params.PART_NM);
			$("#ipt_user").val(this.params.USER_ID+" | " +this.params.USER_NM);


			//Get slipKindList
			$.WebAdd.initSlipKindUI();

			//Load Bookmark
			$.WebAdd.initBookmarkModule();

		},
		initBookmarkModule : function(){

			if($.WebAdd.params.USE_BOOKMARK) {
				if($.Common.GetBrowserVersion().ActingVersion > 9) {
					$.getMultiScripts([g_VIEW_BOOKMARK_URL, g_CANVAS_LIB, g_DRAW_BOOKMARK_WEB])
						.fail(function (err) {
							$.Common.simpleToast("Failed to load Bookmark.");
						})
						.done(function () {
							$.WebAdd.isBookmarkLoaded = true;
						});
				}
			}
		},
		initSlipKindUI : function(){
			$("#slipKindKeyword").bind("focus",function(){
				$(this).select();
				$("#slipKindList").show();
			});

			$("#slipKindKeyword").bind("blur",function(){
				setTimeout(function(){
					$("#slipKindList").hide();
					},200);
			});
			$("<a href='#'>-All-</a>")
				.on("click",function(){
					$('#currentKind').val("");
					$('#slipKindKeyword').val("-All-");
				})
				.appendTo("#slipKindList")
			$('#slipKindKeyword').val("-All-");

			$.when($.Operation.execute($.WebAdd, "GET_SLIPKIND_LIST", $.WebAdd.params)).then(function(res) {
				$.WebAdd.addSlipKind(res);
			})
			.fail(function(error){
				$.Common.simpleAlert(null, $.WebAdd.localeMsg.FAILED_LOAD_SLIPKIND, null);
			})
			.always(function(){
				// $.Common.RemoveProgress(".area_original");
			});


		},
		initInputDateProc : function(){

			//Set datepicker
			var date = new Date();
			var fromDate = new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());


			$('#fromDate').datepicker({
				language:"ko",
				autoClose:true,
			}).data('datepicker').selectDate([fromDate]);

			$('#toDate').datepicker({
				language:"ko",
				autoClose:true,
			}).data('datepicker').selectDate([new Date()]);


			$("#fromDate, #toDate").inputFilter(function(value) {
				return /^[0-9/\-]*$/.test(value);    // Allow digits only, using a RegExp
			});

			$("#fromDate, #toDate").on("click", function(){
				$(this).select()
			});

			$("#fromDate, #toDate").on("keypress", function(){
				var val = $(this).val();
				if(val.length === 4 || val.length === 7) {
					$(this).val(val+"/");
				}
			});

			$("#fromDate").on("keyup", function(e){

				if (e.keyCode === 13) {
					var val = $(this).val();
					var date = new Date(val);
					if(val.length !== 10 || isNaN(date.getTime())) {
						$.Common.simpleToast($.WebAdd.localeMsg.INPUT_VALID_DATE);
					}
					else {

						var fromDate = $.Common.stringToDate($(this).val(), "/");

						$('#fromDate').data('datepicker').selectDate(fromDate);

						$("#toDate").select();
					}
				}
			});

			$("#toDate").on("keyup", function(e){

				if (e.keyCode === 13) {
					var val = $(this).val();
					var date = new Date(val);
					if(val.length !== 10 || isNaN(date.getTime())) {
						$.Common.simpleToast($.WebAdd.localeMsg.INPUT_VALID_DATE);
					}
					else {

						var toDate = $.Common.stringToDate($(this).val(), "/");
						$('#toDate').data('datepicker').selectDate(toDate);
						$.WebAdd.Search();
					}
				}
			});

		},
		addSlipKind : function (kindList) {

			$.each(kindList, function(){

				var slipItem = this;
				$("<a href='#' class='slipKindItem'>"+slipItem.KIND_NM+"</a>")
				.on("click", function(){
					$('#currentKind').val(slipItem.KIND_NO);
					$('#slipKindKeyword').val(slipItem.KIND_NM);
				})
				.appendTo("#slipKindList");


			});
		},
		slipKindFilter:function(){
			var input, filter, ul, li, a, i;
			input = document.getElementById("slipKindKeyword");
			filter = input.value.toUpperCase();
			div = document.getElementById("slipKindList");
			a = div.getElementsByTagName("a");
			for (i = 0; i < a.length; i++) {
				txtValue = a[i].textContent || a[i].innerText;
				if (txtValue.toUpperCase().indexOf(filter) > -1) {
					a[i].style.display = "";
				} else {
					a[i].style.display = "none";
				}
			}
		},
		PopupSearchUser : function() {
			$("#AREA_LAYER_POPUP").load(g_RootURL +"popupSearchUser.jsp", {LANG: $.WebAdd.params.LANG}, function(response, status, xhr) {
				$.Popup.showPopup("#POPUP_SEARCH_USER", "", true, "",function(){

					if(searchUser.selectedRow != null) {
						$("#ipt_corp").val(searchUser.selectedRow.item.corpNo+" | " +searchUser.selectedRow.item.corpNm);
						$("#ipt_part").val(searchUser.selectedRow.item.partNo+" | " +searchUser.selectedRow.item.partNm);
						$("#ipt_user").val(searchUser.selectedRow.item.userId+" | " +searchUser.selectedRow.item.userNm);
					}

				});
				$("#user_list").jsGrid("option", "data", []);
				searchUser.Debug();
			});
		},
		Search : function (isDefaultSearch) {

			$.WebAdd.resetViewer();

			$.WebAdd.changeCheckStatus(false);
			var params = $.WebAdd.getSearchParams();
			if(params !== null) {
//
				$("#result_list").jsGrid("option", "data", []);
//
				$.Common.ShowProgress("#result_progress","Waiting..","000000","0.7");
//
				$.when($.Operation.execute($.WebAdd, "SEARCH_SLIP", params)).then(function(res) {
					$.WebAdd.Push_SearchResultItem(res);
				})
				.fail(function(error){
					$.Common.simpleAlert(null, $.WebAdd.localeMsg.FAILED_SEARCH, null);
				})
				.always(function(){
					$.Common.HideProgress("#result_progress");
				});
			}
		},
		getSearchParams : function(){

			var params = {};
			var fromDate = $('#fromDate').val();
			var date = new Date(fromDate);
			if(!$.Common.isBlank(fromDate) && !isNaN(date.getTime())) {
				// var tempDate = fromDate.replace(/\//g, '');
				params['FROM_DATE'] = fromDate;//tempDate.substring(0,4) + "-" + tempDate.substring(4,6) + "-" + tempDate.substring(6,8)
			}
			else {
				$.Common.simpleAlert(null,this.localeMsg.INPUT_VALID_DATE);
				return null;
			}


			var toDate = $('#toDate').val();
			date = new Date(toDate);
			if(!$.Common.isBlank(toDate) && !isNaN(date.getTime())) {
				// var tempDate = toDate.replace(/\//g, '');
				params['TO_DATE'] = toDate;//tempDate.substring(0,4) + "-" + tempDate.substring(4,6) + "-" + tempDate.substring(6,8)
			}
			else {
				$.Common.simpleAlert(null,this.localeMsg.INPUT_VALID_DATE);
				return null;
			}

			var user = $("#ipt_user").val();
			if(!$.Common.isBlank(user)) {
				params['USER_ID'] = user.split("|")[0].trim();
			}
			else {
				$.Common.simpleAlert(null,this.localeMsg.NO_USER_INFO);
				return null;
			}

			var part = $("#ipt_part").val();
			if(!$.Common.isBlank(part)) {
				params['PART_NO'] = part.split("|")[0].trim();
			}
			else {
				$.Common.simpleAlert(null,this.localeMsg.NO_USER_INFO);
				return null;
			}

			var corp = $("#ipt_corp").val();
			if(!$.Common.isBlank(corp)) {
				params['CORP_NO'] = corp.split("|")[0].trim();
			}
			else {
				$.Common.simpleAlert(null,this.localeMsg.NO_USER_INFO);
				return null;
			}

			var used = "";
			// $("#used input:checked").each(function(){
			// 	if($(this).attr('name')==="0") {
			// 		if($.Common.isBlank(used)) {
			// 			used += "(0";
			// 		}
			// 		else {
			// 			used += ",0";
			// 		}
			// 	}
			// 	else {
			// 		if($.Common.isBlank(used)) {
			// 			used += "(2,3,4,5,6,7,8";
			// 		}
			// 		else {
			// 			used += ",2,3,4,5,6,7,8";
			// 		}
			// 	}
			// });
			// if(!$.Common.isBlank(used)) {
			// 	used += ")";
			// }
			$("#used input:checked").each(function(){

				if($.Common.isBlank(used)) {
					used += "("+$(this).attr('name');
				}
				else {
					used += ","+$(this).attr('name');
				}
			});
			if(!$.Common.isBlank(used)) {
				used += ")";
			}
			else {
				used = "(0,1,2,3,4,5,6,7,8)";
			}
			params['USED'] = used;


			var secu = "";
			$("#secu input:checked").each(function(){
				if($.Common.isBlank(secu)) {
					secu += $(this).attr('name');
				}
				else {
					secu += ","+$(this).attr('name');
				}
			});
			params["SECU"] = secu;

			params["KIND"] = $("#currentKind").val();
			params["KEYWORD"] = $("#ipt_sdocName").val();

			var folder = "";

			if($("#cb_slip").prop("checked") &&  $("#cb_addfile").prop("checked")){
				folder = "";
			}
			else {
				if($("#cb_slip").prop("checked")) {
					folder = "SLIPDOC";
				}
				else if($("#cb_addfile").prop("checked")) {
					folder = "ADDFILE";
				}
				else {
					folder = "";
				}
			}
			params["FOLDER"] = folder;


			return params;
		},
		Push_SearchResultItem: function(res){

			var resCnt = Object.keys(res) == null ? 0 : Object.keys(res).length;
			if(res == null || resCnt <= 0) {
				return;
			}

			var arItems = [];

			Object.keys(res).forEach(function(dataKey) {



				var item = {

					"folder" : res[dataKey].FOLDER,
					"used" : res[dataKey].SDOC_STEP === "0" || res[dataKey].SDOC_STEP === "1" ? $.WebAdd.localeMsg.UNUSED : $.WebAdd.localeMsg.USED,
					"sdocNo" : res[dataKey].SDOC_NO,
					"cabinet" : res[dataKey].CABINET,//.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3'),
					"cnt" : res[dataKey].SLIP_CNT,
					"sdocNm" : res[dataKey].SDOC_NAME,
					"kindNm" : res[dataKey].SDOC_KINDNM,
					"category" : res[dataKey].FOLDER  == "SLIPDOC" ? $.WebAdd.localeMsg.CATEGORY_SLIP : $.WebAdd.localeMsg.CATEGORY_ADDFILE,
					"isChecked":false
				}

				// CABINET: "2021-03-23"
				// CORP_NM: "(주)우남소프트"
				// CORP_NO: "1000"
				// FOLDER: "SLIPDOC"
				// JDOC_INDEX: "10"
				// JDOC_NO: ""
				// ORG_FILE: "0"
				// ORG_IRN: "0"
				// PART_NM: "IT 기획팀"
				// PART_NO: "101020"
				// REG_TIME: "2021-03-23 09:16:36.073"
				// REG_USER: "jbh"
				// REG_USERNM: "정봉환"
				// SDOC_AFTER: "0"
				// SDOC_FLAG: "1"
				// SDOC_KIND: "1600"
				// SDOC_KINDNM: "공문"
				// SDOC_NAME: "23123"
				// SDOC_NO: "S202103233AE96091700122"
				// SDOC_SECU: "1"
				// SDOC_STEP: "1"
				// SDOC_SYSTEM: "0"
				// SDOC_URL: "0"
				// SLIP_CNT: "2"

				arItems.push(item);
			});

			$("#result_list").jsGrid("option", "data", arItems);
			$("#result_list").jsGrid("sort", { field: "cabinet", order: "desc" });

		},
		// updateRow: function(e){
		//
		// 	var idx = $("#result_list").find(".selected-row").index() - 1;
		// 	if(idx < 0) {
		// 		$.Common.simpleAlert(null, $.WebAdd.localeMsg.ALERT_CHECK_SLIP, 0.3);
		// 	}
		// 	else {
		//
		// 		var isEditing = $("#result_list").find(".jsgrid-edit-row").length;
		//
		// 		if(isEditing) {
		// 			$("#result_list").jsGrid("updateItem");
		// 		}
		// 		else {
		// 			$.Common.simpleAlert(null, $.WebAdd.localeMsg.ALERT_CHECK_SLIP, 0.3);
		// 		}
		// 	}
		// },
		getImageData : function(item) {

			var params = {
				KEY : item.sdocNo,
				KEY_TYPE:"SDOC_NO"

			};

			$.Common.ShowProgress(".original_progress","Waiting..","000000","0");
//

			$.when($.Common.RunCommand(g_ActorCommand, "GET_SLIP_LIST", params)).then(function(res) {

				var resCnt = Object.keys(res) == null ? 0 : Object.keys(res).length;
				if(res == null || resCnt <= 0) {
					$.Common.simpleAlert(null, $.WebAdd.localeMsg.FAILED_SEARCH, null);
				}
				else {
					$.WebAdd.setSlipPager(res);

					var version = $.Common.GetBrowserVersion().ActingVersion;

					if(version > 9 && $.WebAdd.isBookmarkLoaded) {
						$.WebAdd.displayCanvasOriginal(res[Object.keys(res)[0]]);
					}
					else {
						$.WebAdd.displayImage(res[Object.keys(res)[0]]);
					}

					// $("#slipPager option:first").trigger('change');
					// var version = $.Common.GetBrowserVersion().ActingVersion;
					//
					// if(version > 9 && $.WebAdd.isBookmarkLoaded) {
					// 	$.WebAdd.displayCanvasOriginal(res, Object.keys(res)[0]);
					// }
					// else {
					// 	$.WebAdd.displayImage(res, Object.keys(res)[0]);
					// }
				}
			})
			.fail(function(error){
				$.Common.simpleToast(null, $.WebAdd.localeMsg.FAILED_SEARCH, null);
				$.Common.RemoveProgress(".original_progress");
			})
			.always(function(){

			});
		},
		displayCanvasOriginal : function(objData) {

			$.Common.ShowProgress(".original_progress","Waiting..","000000","0");
			objData['IMG_DPI'] = $.WebAdd.params.IMG_DPI;
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
			sbImgURL.append("&UserID="+$.WebAdd.params.USER_ID);
			sbImgURL.append("&CorpNo="+$.WebAdd.params.CORP_NO);

			elImage.src = sbImgURL.toString();

			bookmarkContext.init(canvas, $(elImage), objData, $.WebAdd.params);
			$.when(bookmarkContext.drawTargetImage(".original_progress")).then(function(){
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

				if("T" === $.WebAdd.params.USE_BOOKMARK_DRAW) {
					if($.WebAdd.drawContext === null) {
						$.WebAdd.drawContext = Draw();
						var i18nMsgProps = $.Common.Localize($.Lang, "data-i18n", $.WebAdd.params.LANG,"Draw");
						$.WebAdd.drawContext.init(bookmarkContext, i18nMsgProps, "#colorPicker");
					}
					else {
						$.WebAdd.drawContext.reset(bookmarkContext);
					}
				}
			});


			// $.Bookmark.Draw_BookmarkItem(bookmark[0], bookmarkItem, objData["SLIP_ROTATE"]);
			// }

		},
		setSlipPager:function(obj) {
			$("#slipPager").remove();
			if(Object.keys(obj).length > 1) {
				var areaSelectBox = $(document.createElement('div'))
					.addClass("area_slip_page")
					.attr("id","slipPager")
					.prependTo(".slip_title_right");

				var elSelect = $(document.createElement('select'))
					.unbind().bind('change', function(){

						var version = $.Common.GetBrowserVersion().ActingVersion;

						if(version > 9 && $.WebAdd.isBookmarkLoaded) {
							$.WebAdd.displayCanvasOriginal(obj[this.value]);
						}
						else {
							$.WebAdd.displayImage(obj[this.value]);
						}

						// $.WebAdd.displayImage(obj, this.value);
					})
					.appendTo(areaSelectBox);


				var i = 1;
				Object.keys(obj).forEach(function(dataKey) {
					//objItem[dataKey] = obj[dataKey];
					elSelect.append($('<option>', {
						value: dataKey,
						text : "Page " + i
					}));

					i++;
				});
			}
		},

		displayImage : function(obj) {

			var elTarget = $("#originalImage");
			elTarget.empty();
			// var objItem = {};


			// Object.keys(obj).forEach(function(dataKey) {
			// 	objItem[dataKey] = obj[dataKey];
			// });

			var sbImgURL = new StringBuffer();
			sbImgURL.append(this.rootURL);
			sbImgURL.append("DownloadImage.do?");
			sbImgURL.append("&DocIRN="+obj.DOC_IRN);
			sbImgURL.append("&Idx="+obj.DOC_NO);
			sbImgURL.append("&degree="+obj.SLIP_ROTATE);
			sbImgURL.append("&UserID="+$.WebAdd.params.USER_ID);
			sbImgURL.append("&CorpNo="+$.WebAdd.params.CORP_NO);

			var elCenterVerticalHelper = $(document.createElement('span'));
			elCenterVerticalHelper.addClass("helper");
			elCenterVerticalHelper.appendTo(elTarget);

			var elImage = $(document.createElement('img'));
			elImage.attr({
				"src":sbImgURL.toString(),
				"key":obj.SDOC_NO
			});
			elImage.appendTo(elTarget);
			elImage.load(function() {
				$.Common.HideProgress(".original_progress");
				// var version = $.Common.GetBrowserVersion().ActingVersion;
				// if(version >= 9) {
				//
				// 	var bookmarkItem = obj[key]["BOOKMARKS"];
				// 	if(bookmarkItem != null && bookmarkItem.length > 0) {
				// 		var bookmark = $(document.createElement('canvas'));
				// 		bookmark.attr({
				// 			"width": elImage.width(),
				// 			"height": elImage.height(),
				// 			"id": "bookmark",
				// 			"class": "bookmark"
				// 		});
				// 		bookmark.appendTo(elTarget);
				//
				// 		$.Bookmark.Draw_BookmarkItem(bookmark[0], bookmarkItem, obj[key]["SLIP_ROTATE"]);
				// 	}
				// }
			});

		},
		resetViewer : function() {
			if ($.WebAdd.viewer != null) {
				$.WebAdd.viewer.panzoom("reset", false);
			}

			$("#originalImage").empty();
			$("#slipPager").remove();
		},
		changeCheckStatus : function(isChecked) {

			$("[attr=slipdoc]").prop("checked",isChecked);
			$("#chkAll").prop("checked",isChecked);

			$.each($("#result_list").jsGrid("option", "data"), function(){
				this.isChecked = isChecked;
			});

		},
		localizeGrid : function() {
			$("#result_list").jsGrid("fieldOption", "kindNm", 		"title", this.localeMsg.SDOC_KIND);
			$("#result_list").jsGrid("fieldOption", "cabinet", 		"title", this.localeMsg.REG_TIME);
			$("#result_list").jsGrid("fieldOption", "sdocNm",		"title", this.localeMsg.SDOC_NAME);
			$("#result_list").jsGrid("fieldOption", "cnt", 		"title", this.localeMsg.SLIP_CNT);
			$("#result_list").jsGrid("fieldOption", "category", 		"title", this.localeMsg.CATEGORY);
		//	$("#result_list").jsGrid("fieldOption", "select", 		"title", this.localeMsg.SELECT_ROW);


		},
		reset : function() {
			$("#ipt_title").val("");
			$("#ipt_content").val("");
		},
		setUIColor : function()
		{
			var objColor =  $.extend($.Color.PC.WebAdd, $.Color.Common);

			if(objColor != null)
			{
				$(".area_sa_title").css({"background":"#"+objColor.NAVIGATION, "color" : "#" + objColor.NAVIGATION_FONT});
				$(".sa").css({"background":"#"+objColor.BACKGROUND});
				$(".item_separator").css({"background":"#"+objColor.ITEM_SEPARATOR_COLOR});
				$(".btn_search").css({"background":"#"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION_FONT});
				$(".btn_user_search").css({"background":"#"+objColor.USER_SEARCH_BTN,  "color" : "#" + objColor.NAVIGATION_FONT});
				$(".btn_remove").css({"background":"#"+objColor.REMOVE,  "color" : "#" + objColor.NAVIGATION_FONT});
				$(".btn_apply").css({"background":"#"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION_FONT});
				$(".bar").css({"background":"#"+objColor.BAR});
				$(".area_image_viewer .image_viewer").css({"border-bottom":"2px solid #"+objColor.NAVIGATION});
				$(".btn_register").css({"background":"#"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION_FONT});



				$.WebAdd.colorSet = objColor;
			}
		},
		register : function(){

			var items = $.grep($("#result_list").jsGrid("option", "data"), function(obj){
				return obj.isChecked === true;
			});

			if(items.length <= 0) {
				$.Common.simpleToast($.WebAdd.localeMsg.SELECT_SLIP);
				return;
			}

			$.Common.simpleConfirm(null,$.WebAdd.localeMsg.CONFIRM_REGISTER_CHECKED, function() {

				var params = {
					CHECKED_LIST : JSON.stringify(items),//$.map(items,function(obj) { return obj.sdocNo})
					JDOC_NO : $.WebAdd.params.JDOC_NO
				//	VALUE :  $.map(items,function(obj) { return obj.sdocNo})
				}

				$.when($.Common.RunCommand(g_WebAddCommand, "UPLOAD_SLIP", params)).then(function (objRes) {
					if("T" === objRes.RESULT) {
						$.Common.simpleAlert(null, $.WebAdd.localeMsg.ADD_SLIP_SUCCESS,null,function() {
							window.close();
							window.opener.$.Actor.pageSubmit();
						});
					}
					else {
						$.Common.simpleAlert(null, $.WebAdd.localeMsg[objRes.MSG]);
					}

				});
			});

		},
		setImageViewer : function() {

			var panzoom = $("#originalImage").panzoom({
				minScale: 0.7,
				maxScale: 5,
				$zoomIn:$("#zoomIn"),
				$zoomOut:$("#zoomOut"),
				animate:true
			});

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
		},

		drawGridView : function() {

			var apprNoField = function(config) {
				jsGrid.TextField.call(this,config);
			};

			// apprNoField.prototype = new jsGrid.TextField({
			//
			// 		// editTemplate: function(value) {
			// 		// 	if(!this.editing)
			// 		// 		return this.itemTemplate.apply(this, arguments);
			// 		//
			// 		// 	var $result = this.editControl = this._createTextBox();
			// 		// 	var grid = this._grid;
			// 		//
			// 		// 	$result.attr({"maxLength":8});
			// 		// 	$result.bind('input paste', function(){
			// 		// 		this.value = this.value.replace(/[^0-9]/g, '');
			// 		// 	});
			// 		// 	$result.on("keyup", function(e) {
			// 		// 		if(e.which === 13) {
			// 		// 			grid.updateItem();
			// 		// 		}
			// 		// 		else if(e.which === 27) {
			// 		// 			grid.cancelEdit();
			// 		// 		}
			// 		// 	});
			// 		//
			// 		// 	$result.val(value);
			// 		// 	return $result;
			// 		// }
			// 	}
			// );
			//
			// jsGrid.fields.apprNoField = apprNoField;

			$("#result_list").jsGrid({
				width: "100%",
				height: "20px",//$(".result_list").height(),
				filtering: false,
				inserting: false,
				editing: true,
				selecting: true,
				sorting: true,
				paging: false,
				pageSize: 15,
				loadIndication:false,
				pageButtonCount: 5,
				noDataContent: "-",
				controller: {
					// updateItem: function(item) {
					// 	// return $.WebAdd.Update(item); //deferred.promise();
					// }
				},

				rowClick : function(args) {

					var curKey = $("#originalImage > img").attr("key");
					if(args.item.sdocNo !== curKey) {
						if (args.item.folder === "SLIPDOC") {
							$.WebAdd.resetViewer();
							$.WebAdd.getImageData(args.item);
						}
						else {
							$("<img class='attach' src='"+g_RootURL+ "image/common/attach.png' />")
								.appendTo($("#originalImage"));


							var elCenterVerticalHelper = $(document.createElement('span'));
							elCenterVerticalHelper.addClass("helper");
							elCenterVerticalHelper.appendTo($("#originalImage"));
						}
					}

					// remove class for all rows
					$("#result_list tr").removeClass("selected-row")
					$selectedRow = $(args.event.target).closest("tr");
					// add class to highlight row
					$selectedRow.addClass("selected-row");

					// $("#result_list").jsGrid("cancelEdit");


					return;
				},
				rowDoubleClick: function(args) {
					var elRow = $(args.event.target).closest("tr");
					var chkValue = elRow.find("input[type=checkbox]").is(":checked");
					elRow.find("input[type=checkbox]").prop("checked", !chkValue);
					// this.editItem(elRow);

					// var elEditRow = elRow.prev();
					// var text = elEditRow.find("input[type=text]");
					// elEditRow.find("input[type=checkbox]").prop("checked",!chkValue);

					$("#chkAll").prop("checked", false);
					// text.focus();
					// text.select();
				},
				onPageChanged : function(args){
					$.WebAdd.changeCheckStatus(false);
				},
				onRefreshed: function (args) {
					//sync column width on page load
					$.each(args.grid._headerGrid[0].rows[0].cells, function (i, obj) {
						$(args.grid._bodyGrid[0].rows[0].cells[i]).css("width", $(obj).css("width"));
					});

					//sync column width on column resize
					$("table").colResizable({
						onResize: function () {
							$.each(args.grid._headerGrid[0].rows[0].cells, function (i, obj) {
								$(args.grid._bodyGrid[0].rows[0].cells[i]).css("width", $(obj).css("width"));
							});
						}
					});
				},

				onItemUpdated: function(args) {

				},
				onItemUpdating: function(args) {

				},

				fields: [
					{name:"sdocNo",            title:"", width:0, align:"left"},
					//	{name:"docIrn",            title:"", width:0, align:"left"},
					{
						name:"isChecked",
						headerTemplate: function() {

							return $(document.createElement('div'))
								.addClass("cb_chk_all")
								.prepend(
									$(document.createElement('label'))
										.addClass("cb_container")
										.prepend([
											$(document.createElement('input'))
												.attr({
													"type" : "checkbox",
													"id":"chkAll"
												})
												.on("change", function () {
													$.WebAdd.changeCheckStatus($(this).is(":checked"));
												}),
											$(document.createElement("span"))
												.addClass("checkbox")
										])
								)
						},
						itemTemplate: function(_, item) {
							return	$(document.createElement('div'))
								.addClass("cb_chk_all")
								.prepend(
									$(document.createElement('label'))
										.addClass("cb_container")
										.prepend([
											$(document.createElement('input'))
												.attr({
													"type": "checkbox",
													"sodcNo" : item.sdocNo,
													"attr":"slipdoc"
												})
												.prop("checked", item.isChecked)
												.on("change", function () {
													item.isChecked = $(this).is(":checked");
													//	$.CoCard.changeCheckStatus($(this).is(":checked"));
												}),
											$(document.createElement("span"))
												.addClass("checkbox")

										])

								)
						},
						align: "center",
						width: 40,
						sorting: false
					},
					{ name: "folder", 		   title:"", width:0,  align: "center", visible: false },
					{ name: "used", 		   title:"", width:40,  align: "center"},
					{ name: "category", 		   title:"", width:60,  align: "center" , css : "text-overflow"},
					{ name: "sdocNm", 		   title:"", width:100,  align: "center" , css : "text-overflow"},
					{name:"kindNm",             title:"", width:70, align:"center", css : "text-overflow"},
					{ name: "cnt", 		  title:"", width: "auto", align: "center" },
					{name:"cabinet",             title:"", width:70, align:"center"},

				]
			});

			$("#result_list").jsGrid("fieldOption", "sdocNo", "visible", false);
			//	$("#result_list").jsGrid("fieldOption", "docIrn", "visible", false);

			$.WebAdd.localizeGrid();
		},
}