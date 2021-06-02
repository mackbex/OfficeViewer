<%@page import="javax.servlet.annotation.WebServlet"%>
<%@page import="com.google.gson.JsonObject"%>
<%@ page language="java" contentType="text/html; charset=utf-8"
    pageEncoding="utf-8"%>
<%@ include file="/common/common.jsp"%>
<%@ page import="com.woonam.connect.AgentConnect" %>
<%@ page import="com.woonam.model.GetModel" %>
<%@ page import="java.net.URLDecoder" %>
<%
	//Prepend session disappearing bugs on IE.
	response.setHeader("P3P","CP='CAO PSA CONi OTR OUR DEM ONL'");

	Map mParams = request.getParameterMap();

	String strKey 										= C.getParamValue(mParams, "KEY", "");
	
	String strKeyType 									= C.getParamValue(mParams, "KEY_TYPE", "JDOC_NO");
	
	String strServerMode 								= C.getParamValue(mParams, "SVR_MODE", "");
	strServerMode = strServerMode.toUpperCase();
	
	String strCallGroup 								= C.getParamValue(mParams, "CALL_GROUP", "");
	
	String strViewMode 									= C.getParamValue(mParams, "VIEW_MODE", "VIEW");
	strViewMode = strViewMode.toUpperCase();
	
	String strPage 										= C.getParamValue(mParams, "PAGE", "");

	String strLang 										= C.getParamValue(mParams, "LANG", "KO");
	strLang = strLang.toLowerCase();
	
	String strUserID 									= C.getParamValue(mParams, "USER_ID", "");
	
	String strCorpNo 									= C.getParamValue(mParams, "CORP_NO", "");
	
	String strWorkGroup 								= C.getParamValue(mParams, "WORK_GROUP", "");
	
	String strMenu		 								= C.getParamValue(mParams, "MENU", "0");
		
	String strUseMobile									= g_profile.getString("WAS_INFO", "MOBILE_USE", "F").toUpperCase();
	//String strMobileMode									= g_profile.getString("WAS_INFO", "MOBILE_MODE", "VIEW").toUpperCase();
	String localWAS_Port_HTTP							= g_profile.getString("LOCAL_WAS","HTTP", "");
	String localWAS_Port_HTTPS							= g_profile.getString("LOCAL_WAS","HTTPS", "");

	String command 										= request.getParameter("COMMAND");
	String isInterface 									= request.getParameter("INTERFACE");

	String token = C.getParamValue(mParams, "TOKEN", "");
	String relatedPartNo = C.getParamValue(mParams, "RELATED_PART_NO", "");
	String relatedPartNm = C.getParamValue(mParams, "RELATED_PART_NM", "");

//	if(C.isBlank(relatedPartNo))
//	{
//		RequestDispatcher rd = request.getRequestDispatcher("slip_error.jsp?ERR_MSG=EMPTY_PART_INFO");
//		rd.forward(request,response);
//		return;
//	}
//
//
//	if(C.isBlank(relatedPartNm))
//	{
//		RequestDispatcher rd = request.getRequestDispatcher("slip_error.jsp?ERR_MSG=EMPTY_PART_INFO");
//		rd.forward(request,response);
//		return;
//	}
//
//
//	if(C.isBlank(token))
//	{
//		RequestDispatcher rd = request.getRequestDispatcher("slip_error.jsp?ERR_MSG=EMPTY_TOKEN");
//		rd.forward(request,response);
//		return;
//	}


	if(C.isBlank(strKey))
  	{
		RequestDispatcher rd = request.getRequestDispatcher("slip_error.jsp?ERR_MSG=EMPTY_JDOCNO");
  	 	rd.forward(request,response);
  	 	return;
  	}
	
	//Verify UserInfo
	AgentConnect AC			= new AgentConnect(g_profile);
	GetModel GD				= new GetModel(AC, request.getSession());
	
	JsonObject objUserInfo = GD.getUserInfo(strUserID, strCorpNo, strLang);
	if(objUserInfo == null)
	{
		RequestDispatcher rd = request.getRequestDispatcher("slip_error.jsp?ERR_MSG=NO_USER_INFO");
  	 	rd.forward(request,response);
  	 	return;
	}
	
	String strResUserNM 		= null;
	String strResCorpNM		= null;
	try
	{
		String strResUserID 	= objUserInfo.get("USER_ID").getAsString();
		String strResCorpNo 	= objUserInfo.get("CORP_NO").getAsString();
		int auth				= objUserInfo.get("AUTH").getAsInt();

		if(!strUserID.equalsIgnoreCase(strResUserID) || !strCorpNo.equalsIgnoreCase(strResCorpNo))
		{
			RequestDispatcher rd = request.getRequestDispatcher("slip_error.jsp?ERR_MSG=NO_USER_INFO");
			rd.forward(request,response);
			return;
		}

		strResUserNM = objUserInfo.get("USER_NM").getAsString();
		strResCorpNM = objUserInfo.get("CORP_NM").getAsString();

//		if(auth > 0) {
//			strViewMode = "EDIT";
//		}

		session.setAttribute("CORP_NO", 	objUserInfo.get("CORP_NO").getAsString());
		session.setAttribute("CORP_NM", 	strResCorpNM);
		session.setAttribute("PART_NO", 	objUserInfo.get("PART_NO").getAsString());
		session.setAttribute("PART_NM", 	objUserInfo.get("PART_NM").getAsString());
		session.setAttribute("USER_ID", 		strUserID);
		session.setAttribute("USER_NM", 	strResUserNM);
		session.setAttribute("USER_LANG",	strLang.toLowerCase());
		session.setAttribute("VIEW_MODE",	strViewMode);
		session.setAttribute("AUTH",		objUserInfo.get("AUTH").getAsString());


	}
	catch(Exception e)
	{
		logger.error("Failed to get user info.", e);
		RequestDispatcher rd = request.getRequestDispatcher("slip_error.jsp?ERR_MSG=NO_USER_INFO");
  	 	rd.forward(request,response);
	}
%>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
</head>
<script>

$(function(){
	
	g_ViewMode = "<%=strViewMode %>";
	
	var objParams = {};
	objParams["KEY"] 					=encodeURIComponent("<%=strKey %>");
	objParams["KEY_TYPE"] 		= "<%=strKeyType %>";
	objParams["SVR_MODE"] 		= "<%=strServerMode %>";
	objParams["CALL_GROUP"] 		= "<%=strCallGroup %>";
	objParams["VIEW_MODE"] 		= "<%=strViewMode %>";
	objParams["PAGE"] 				= "<%=strPage %>";
	objParams["LANG"] 				= "<%=strLang %>";
	objParams["WORK_GROUP"] 	= "<%=strWorkGroup %>";
	objParams["USER_ID"] 			= "<%=strUserID %>";
	objParams["CORP_NO"] 			= "<%=strCorpNo %>";
	objParams["USER_NM"] 			= "<%=strResUserNM %>";
	objParams["CORP_NM"] 			= "<%=strResCorpNM %>";
	objParams["MENU"] 				= "<%=strMenu %>";
	objParams["XPI_PORT_HTTP"]			= "<%=localWAS_Port_HTTP%>";
	objParams["XPI_PORT_HTTPS"]			= "<%=localWAS_Port_HTTPS%>";

	var useMobile = "<%=strUseMobile%>";
	var targetURL = "<c:url value='/slip_actor.jsp' />";
	
	//If it's mobile mode
	if($.Common.determineMobile() && "T" === useMobile)
	{
		targetURL 					= "<c:url value='/slip_mobile.jsp' />";
	}
	
	if("1" === "<%=isInterface%>") {
		switch("<%=command%>") {
		case "VIEW_ORIGINAL_SLIP" : 
			targetURL = "<c:url value ='/slip_viewer.jsp' />";
		}
	}
	
	$.Common.postSubmit(targetURL, objParams, "post");
});
</script>
</html>