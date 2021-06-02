var SearchUser = function() {
    var module = {

        localeMsg : null,
        colorSet : null,
        params : null,
        selectedRow : null,
        init : function (params) {
            this.params = params;
            module.localeMsg = $.Common.Localize($.Lang, "data-i18n", params.LANG,"ServerAdd");

            // if(this.params.USER_ID !== undefined) {
            //     this.selectedRow.USER_ID = this.params.USER_ID;
            // }

            $("#searchUserKeyword").attr('placeholder',$.ServerAdd.localeMsg["PLACEHOLDER_INPUT_USERINFO"]);
            //Set UI set
            module.setUIColor();

            module.drawGridView();
        },

        Search : function() {

            var keyword = $("#searchUserKeyword").val();
            if($.Common.isBlank(keyword)){
                $.Common.simpleToast(module.localeMsg.INPUT_SEARCH_KEYWORD);
            }
            else {
                $("#user_list").jsGrid("option", "data", []);
                $.Common.ShowProgress("#user_list_progress","Waiting..","000000","0.7");

                var params = {
                    KEYWORD : keyword
                };

                $.when($.Operation.execute(module, "GET_USER_LIST", params)).then(function(res) {
                    module.Push_SearchResultItem(res);
                })
                .fail(function(error){
                    $.Common.simpleToast(module.localeMsg.FAILED_SEARCH_USER, null);
                })
                .always(function(){
                    $.Common.HideProgress("#user_list_progress");
                });
            }
        },
        Push_SearchResultItem: function(res){

            var resCnt = Object.keys(res) == null ? 0 : Object.keys(res).length;
            if(res == null || resCnt <= 0) {
                return;
            }

            var arItems = [];

            Object.keys(res).forEach(function(dataKey) {
                var item = {
                    "userId":res[dataKey].USER_ID,
                    "userNm":res[dataKey].USER_NM+"("+res[dataKey].USER_ID+")",//.replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3'),
                    "partNo":res[dataKey].PART_NO,
                    "partNm":res[dataKey].PART_NM,
                    "corpNo":res[dataKey].CORP_NO,
                    "corpNm":res[dataKey].CORP_NM,
                }

                arItems.push(item);
            });

            $("#user_list").jsGrid("option", "data", arItems);
            $("#user_list").jsGrid("sort", { field: "userNm", order: "asc" });

        },

        Debug:function() {
          // console.log("debug");
        },
        Confirm : function(){
            if(module.selectedRow === null){
                $.Common.simpleToast(module.localeMsg.NO_SELECTED_USER);
            }
            else{
                $.Popup.confirmPopup();
            }
        },
        drawGridView : function() {
            $("#user_list").jsGrid({
                width: "100%",
                height: "20px",//$(".result_list").height(),
                filtering: false,
                inserting: false,
                editing: true,
                selecting: true,
                sorting: true,
                paging: true,
                pageSize: 15,
                loadIndication:false,
                pageButtonCount: 5,
                noDataContent: "-",
                controller: {
                    // updateItem: function(item) {
                    // 	// return $.ServerAdd.Update(item); //deferred.promise();
                    // }
                },
                rowClick : function(args) {
                    $("#user_list tr").removeClass("selected-row")
                    $selectedRow = $(args.event.target).closest("tr");
                    // add class to highlight row
                    $selectedRow.addClass("selected-row");

                    module.selectedRow = args;

                },
                rowDoubleClick: function(args) {

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
                fields: [
                    {name:"userId",             title:"", width:0, align:"center"},
                    {name:"userNm",             title:"", width:40, align:"center"},
                    {name:"partNo",             title:"", width:0, align:"center"},
                    {name:"partNm",             title:"", width:30, align:"center"},
                    {name:"corpNo",             title:"", width:0, align:"center"},
                    {name:"corpNm",             title:"", width:30, align:"center"}

                ]
            });
            $("#user_list").jsGrid("fieldOption", "userId", "visible", false);
            $("#user_list").jsGrid("fieldOption", "partNo", "visible", false);
            $("#user_list").jsGrid("fieldOption", "corpNo", "visible", false);
            module.localizeGrid();


        },
        localizeGrid : function(){
            $("#user_list").jsGrid("fieldOption", "userNm", 		"title", module.localeMsg.USER_ID);
            $("#user_list").jsGrid("fieldOption", "partNm",		"title", module.localeMsg.PART_NO);
            $("#user_list").jsGrid("fieldOption", "corpNm", 		"title", module.localeMsg.CORP_NO);
        },
        setUIColor : function()
        {
            var objColor =  $.extend($.Color.PC.ServerAdd, $.Color.Common);

            if(objColor != null)
            {
                $(".btn_search").css({"background":"#"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION_FONT});
                $(".btn_confirm").css({"background":"#"+objColor.NAVIGATION,  "color" : "#" + objColor.NAVIGATION_FONT});

                module.colorSet = objColor;
            }
        },
    }

    return module;
}