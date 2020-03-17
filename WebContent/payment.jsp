<%@ page language="java" contentType="text/html; charset=utf-8"    pageEncoding="utf-8"%>
<!DOCTYPE html>
<%@ include file="/common/common.jsp"%>
<html>
<head>
    <title>Payment</title>
    <link rel="stylesheet" type="text/css" href="<c:url value='css/grid/jsgrid-theme.css' />" >
    <link rel="stylesheet" type="text/css" href="<c:url value='css/grid/jsgrid.css' />" >
    <link rel="stylesheet" type="text/css" href="<c:url value='css/style.css' />"/>
    <link href="<c:url value='css/datepicker/datepicker.css' />" rel="stylesheet" type="text/css">

    <%
        //Generate system id
        String strSysID			=	null;
        String strCurTime			=	new java.text.SimpleDateFormat("yyyyMMddHHmmssSSS").format(new java.util.Date());
        strSysID						=	session.getId()+strCurTime;

        if(request.getParameterMap().size() > 0) {
            String strServerKey = g_profile.getString(request.getParameter("SVR_MODE"), "KEY", "");
            pageContext.setAttribute("SERVER_KEY", strServerKey);

            pageContext.setAttribute("PAYMENT_LIST_URL", g_profile.getString("INTERFACE", "PAYMENT_LIST_URL", ""));
            pageContext.setAttribute("PAYMENT_TYPE_URL", g_profile.getString("INTERFACE", "PAYMENT_TYPE_URL", ""));

            //Attach parameters to pageContext
            Map<String, String[]> mParams = request.getParameterMap();
            pageContext.setAttribute("mParams", mParams);
        }
    %>
    <script>
        $(function(){
            var params = {
                CORP_NO 				: "<c:out value="${sessionScope.CORP_NO}" />",
                USER_ID 				: "<c:out value="${sessionScope.USER_ID}" />",
                USER_NM 				: "<c:out value="${sessionScope.USER_NM}" />",
                PART_NO 				: "<c:out value="${sessionScope.PART_NO}" />",
                SERVER_KEY 			    : "<c:out value="${SERVER_KEY}" />",
                LANG 					: "<c:out value="${mParams['LANG'][0]}" />",
                KEY		 				: "<c:out value="${mParams['KEY'][0]}" />",
                VIEW_MODE			    : "<c:url value ="${mParams['VIEW_MODE'][0]}" />",
                SVR_MODE				: "<c:url value ="${mParams['SVR_MODE'][0]}" />",
                XPI_PORT                : "<c:url value="${mParams['XPI_PORT'][0]}" />",
                PAYMENT_LIST_URL             : "<c:url value="${PAYMENT_LIST_URL}" />",
                PAYMENT_TYPE_URL             : "<c:url value="${PAYMENT_TYPE_URL}" />",
            }
           $.Payment.init(params);
        })
    </script>
</head>
<body>
<div class="wrapper payment">
    <div class="area_payment_title">
<%--        <div class="title_icon">--%>
<%--            <img src="<c:url value='/image/pc/comment/title.png' />" />--%>
<%--        </div>--%>
        <div class="payment_title">
            <span class="title" data-i18n="TITLE"></span>
        </div>
    </div>

    <div class="area_search_option">
        <div class="option_box">
            <div class="option_title">
                <div class="title">
                    <span class="text_search_option" data-i18n="SEARCH_OPTION"></span>
                </div>
                <div class="btn_search" onclick="$.Payment.Search();">
                 <span data-i18n="SEARCH"></span>
                </div>
            </div>
            <div class="option_contents">
                <div class="option_contents_row">
                    <div class="option_contents_col">
                        <div class="item_title">
                             <div class="item_separator"></div>
                             <span class="title" data-i18n="ITEM_TITLE"></span>
                        </div>
                        <div class="item_content">
                            <input type="text" id="ipt_doc_title" name="ipt_doc_title" />
                        </div>
                    </div>
                    <div class="option_contents_col">
                        <div class="item_title">
                            <div class="item_separator"></div>
                            <span class="title" data-i18n="ITEM_FORM"></span>
                        </div>
                        <div class="item_content">
                            <select id="sel_form" class="sel_form">

                            </select>
<%--                            <input type="text"  id="ipt_form" name="ipt_form" />--%>
                        </div>
                    </div>
                </div>
                <div class="option_contents_row">
                    <div class="option_contents_col">
                         <div class="item_title">
                             <div class="item_separator"></div>
                             <span class="title" data-i18n="ITEM_DRAFTER"></span>
                        </div>
                        <div class="item_content">
                            <input type="text"  id="ipt_drafter" name="ipt_drafter" />
                        </div>
                    </div>
                    <div class="option_contents_col">
                        <div class="item_title">
                            <div class="item_separator"></div>
                            <span class="title" data-i18n="ITEM_DRAFT_DATE"></span>
                        </div>
                        <div class="item_content">
                            <input type='text' id="date" class="date_picker"
                                   data-multiple-dates-separator=" - "
                                   data-position="bottom left"
                                   placeholder="yyyy/mm/dd - yyyy/mm/dd"
                                    />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <div class="area_search_result">
        <div class="result_box">
            <div class="option_title">
                <div class="title">
                    <span class="text_search_option" data-i18n="SEARCH_RESULT"></span>
                </div>
                <div class="result">
                    <span data-i18n="TOTAL"></span>
                    <span id="result_cnt">0</span>
                    <span data-i18n="RESULT_UNIT"></span>
                </div>
            </div>
            <div class="area_search_result_list">
                <div id="payment_progress" class="payment_progress"></div>
                <div id="result_list"  class="result_list">
                </div>
            </div>
        </div>
    </div>
</div>


<script src="<c:url value='js/localWAS/OfficeXPI.js' />"></script>
<script src="<c:url value='js/view/payment.js' />"></script>
<script src="<c:url value='js/operation.js' />"></script>
<script src="<c:url value='js/datepicker/datepicker.min.js' />"></script>
<script src="<c:url value='js/grid/colResizable-1.6.min.js' />"></script>
<script src="<c:url value='js/grid/jsgrid.js' />"></script>
<!-- Include English language -->
<script src="<c:url value='js/datepicker/i18n/datepicker.ko.js' />"></script>
</body>
</html>