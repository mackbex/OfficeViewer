<%@page import="java.util.HashMap"%>
<%@page language="java" contentType="text/html; charset=utf-8"    pageEncoding="utf-8"%>
<%@page import="com.woonam.util.Profile" %>
<%@page import=" org.apache.logging.log4j.*" %>
<%@page import="com.woonam.util.Common"%>
<%@page import="java.io.File" %>
<%@page import="java.util.Map"%>

<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>  
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>

<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta charset="utf-8">
<link rel="stylesheet" type="text/css" href="<c:url value='/css/progressBar.css' />">

<%
 	request.setCharacterEncoding("utf-8");

 	//Set content's cache
 	response.setHeader("Cache-Control", "no-cache");
 	response.setHeader("Pragma", "no-cache");
 	response.setDateHeader("Expires", 0);	

 	//Set session interval
 	session.setMaxInactiveInterval(60*60*24);

 	//Set global parameters
 	String g_strLang					= "ko";
 	
 	Common C 							= new Common(); 

 	//Initialize logger
	Logger logger 					= LogManager.getLogger("Woonam");
 	String strRootPath 				= C.getRootPath(application);
 	boolean isInitCompleted 		= false;
 	Profile g_profile				= null;
 	
 	if(!C.isBlank(strRootPath))
 	{	
 		g_profile = new Profile(strRootPath + File.separator + "conf" + File.separator + "conf.ini");
 		if(g_profile != null)
 		{
 			isInitCompleted = true;
 		}
 	}
 	
 	if(!isInitCompleted)
 	{
 		RequestDispatcher rd = request.getRequestDispatcher("slip_error.jsp?ERR_MSG=LOGEER_NOT_INIT");
   	 	rd.forward(request,response);
   	 	return;
 	}
 	
 	String downURL = g_profile.getString("WAS_INFO", "DOWNLOAD_URL", null);

 %>

<%!//Get first value of parameters.
	public String getParamVal(Map<String, String[]> mParams, String strKey, String strDefault)
	{
		String strRes = strDefault;
		if(mParams != null) 
		{
			String[] arItem = mParams.get(strKey);
			if(arItem != null && arItem.length > 0)
			{
				strRes  = arItem[0]; 
			}
		}
		
		return strRes;
	}

	//Get value array of parameters.
	public String[] getParamArr(Map<String, String[]> mParams, String strKey)
	{
		String[] strRes = null;
		if(mParams != null) 
		{
			String[] arItem = mParams.get(strKey);
			if(arItem != null && arItem.length > 0)
			{
				strRes  = arItem; 
			}
		}
		
		return strRes;
	}%>


<body>
<script src='<c:url value="/js/jquery-1.11.3.min.js" />'></script>
<script src="<c:url value='/js/polyfill.js' />"></script>
<script src="<c:url value='/js/common.js' />"></script>
<script src="<c:url value='/js/progress.js' />"></script>
<script src="<c:url value='/js/properties.js' />"></script>
<script>
"use strict";

var g_ActorCommand 			= "${pageContext.request.contextPath}/ActorCommand.do";
var g_CommentCommand		= "${pageContext.request.contextPath}/CommentCommand.do";
var g_RelatedCommand		= "${pageContext.request.contextPath}/RelatedCommand.do";
var g_HistoryCommand		= "${pageContext.request.contextPath}/HistoryCommand.do";
var g_CoCardCommand			= "${pageContext.request.contextPath}/CoCardCommand.do";
var g_ServerAddCommand		= "${pageContext.request.contextPath}/ServerAddCommand.do";
var g_BookmarkCommand		= "${pageContext.request.contextPath}/BookmarkCommand.do";
var g_RootURL				= "${pageContext.request.contextPath}/";
var g_XPI_URL				= "${pageContext.request.contextPath}/js/localWAS/OfficeXPI.js";
var g_DRAW_BOOKMARK_WEB		= "${pageContext.request.contextPath}/js/bookmark/draw.js";
var g_VIEW_BOOKMARK_URL		= "${pageContext.request.contextPath}/js/bookmark/bookmark.js";
var g_CANVAS_LIB			= "${pageContext.request.contextPath}/js/bookmark/konva.min.js";
var g_DOWN_URL				= g_RootURL+"<%=downURL%>";

$(function(){
	if($.Common.GetBrowserVersion().ActingVersion < 9)
	{
		$.getScript('<c:url value="/js/normalize/selectivizr.js" />', function(){});
		//document.write('<script src=><\/script>');
	}
	<%--else {--%>
	<%--	$.getScript('<c:url value="/js/bookmark/canvas.js" />', function(){});--%>
	<%--}--%>
});

</script>
</body>