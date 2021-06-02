<%--
  Created by IntelliJ IDEA.
  User: woonam
  Date: 2021-03-19
  Time: 오후 2:48
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%
    pageContext.setAttribute("LANG", request.getParameter("LANG") == null ? "ko" : request.getParameter("LANG"));
%>

<div id="POPUP_SEARCH_USER" role="dialog" class="popup">
    <div class="popup_bg"></div>
    <div id="POPUP_SEARCH_USER_BODY" class="popup_body">
        <div class="area_title">
            <div class="title">
                <span  data-i18n="SEARCH_USER"></span>
            </div>
            <div class="close btn_popup_close">
                <img src="<c:url value='/image/common/x.png' />" >
            </div>
        </div>
        <div class="area_search_keyword">
            <div class="area_input">
                <input type="text" class="et_keyword" name="searchUserKeyword" id="searchUserKeyword"/>
            </div>
            <div class="area_btn">
                <div class="btn_search" onclick="searchUser.Search();">
                    <span data-i18n="SEARCH"></span>
                </div>
            </div>
        </div>
        <div class="content">
            <div id="user_list_progress"></div>
            <div id="user_list" class="user_list">

            </div>
        </div>
        <div class="area_confirm">
            <div class="btn_confirm" onclick="searchUser.Confirm();">
                <span data-i18n="CONFIRM"></span>
            </div>
        </div>
    </div>
</div>


<script src="<c:url value='js/popup/searchUser.js' />"></script>
<script type="text/javascript">
    var searchUser = SearchUser();
    var params = {
        LANG : "<c:out value="${LANG}" />",
    }
    searchUser.init(params);
</Script>