<%@ page language="java" contentType="text/html; charset=utf-8"    pageEncoding="utf-8"%>
<!DOCTYPE html>
<%@ include file="/common/common.jsp"%>
<%@page import="java.util.Map"%>
<%@ page import="java.net.URLDecoder" %>
<html>
<head>
	<title>Slip Actor</title>
	<link rel="stylesheet" type="text/css" href="<c:url value='css/style.css' />" >
	<link rel="stylesheet" type="text/css" href="<c:url value='css/menu/context-menu.css' />" >
<%
		//Attach parameters to pageContext
	Map<String, String[]> mParams = request.getParameterMap();
	try {
		if (request.getParameterMap().size() > 0) {
			pageContext.setAttribute("mParams", mParams);


			String strServerKey = g_profile.getString(request.getParameter("SVR_MODE"), "KEY", "");
			pageContext.setAttribute("SERVER_KEY", strServerKey);

			String key = request.getParameter("KEY");
			key = URLDecoder.decode(key, "utf-8");

			pageContext.setAttribute("KEY_ORIGIN", key);

			//Detect whether multikey.
			boolean isMultiKey = false;
			if (!C.isBlank(key)) {
				if (key.indexOf(',') > -1) isMultiKey = true;
			}

			pageContext.setAttribute("MULTI_KEY", isMultiKey);

			StringBuffer keyValue = new StringBuffer();
			StringBuffer keyTitle = new StringBuffer();

			String[] arKeyList = key.split(",");

			for (int i = 0; i < arKeyList.length; i++) {
				String[] arKeyVal = arKeyList[i].split(";");

				keyValue.append(arKeyVal[0]);
				try {
					keyTitle.append(URLDecoder.decode(arKeyVal[1], "utf-8"));
				} catch (Exception e) {
					keyTitle.append("");
				}

				if (i < arKeyList.length - 1) {
					keyValue.append(",");
					keyTitle.append(",");
				}
			}

			pageContext.setAttribute("KEY", keyValue.toString());
			pageContext.setAttribute("KEY_TITLE", keyTitle.toString());
			pageContext.setAttribute("FOLD", g_profile.getString("WAS_INFO", "FOLD", "T"));
			pageContext.setAttribute("MAXIMIZED", g_profile.getString("WAS_INFO", "MAXIMIZED", "F"));
			pageContext.setAttribute("USE_MAGNIFIER", g_profile.getString("WAS_INFO", "USE_MAGNIFIER", "F"));
			pageContext.setAttribute("USE_BOOKMARK", g_profile.getString("WAS_INFO","USE_BOOKMARK","F"));
			pageContext.setAttribute("IMG_DPI", g_profile.getString("WAS_INFO","IMG_DPI","200"));
		}
	}
	catch(Exception e) {
		logger.error("");
	}
%>


	<script>

		$(function(){

			var ActorParams = {

				CORP_NO 				: "<c:out value="${sessionScope.CORP_NO}" />",
				USER_ID 				: "<c:out value="${sessionScope.USER_ID}" />",
				PART_NO 				: "<c:out value="${sessionScope.PART_NO}" />",
				AUTH 					: "<c:out value="${sessionScope.AUTH}" />",
				SERVER_KEY 				: "<c:out value="${SERVER_KEY}" />",
				LANG 					: "<c:out value="${mParams['LANG'][0]}" />",
				KEY 					: "<c:out value="${KEY}" />",
				KEY_TITLE		 		: "<c:out value="${KEY_TITLE}" />",
				KEY_ORIGIN		 		: "<c:out value="${KEY_ORIGIN}" />",
				KEY_TYPE		 		: "<c:out value="${mParams['KEY_TYPE'][0]}" />",
				VIEW_MODE				: "<c:url value ="${mParams['VIEW_MODE'][0]}" />",
				SVR_MODE				: "<c:url value ="${mParams['SVR_MODE'][0]}" />",
				MENU					: "<c:url value ="${mParams['MENU'][0]}" />",
				XPI_PORT_HTTP			: "<c:url value ="${mParams['XPI_PORT_HTTP'][0]}" />",
				XPI_PORT_HTTPS			: "<c:url value ="${mParams['XPI_PORT_HTTPS'][0]}" />",
				WORK_GROUP				: "<c:url value ="${mParams['WORK_GROUP'][0]}" />",
				MULTI_KEY				: <c:out value="${MULTI_KEY}" />,
				PAGE					:"ACTOR",
				FOLD					:  "<c:out value="${FOLD}" />",
				MAXIMIZED				:  "<c:out value="${MAXIMIZED}" />",
				USE_MAGNIFIER			:  "<c:out value="${USE_MAGNIFIER}" />",
				USE_BOOKMARK			:  "<c:out value="${USE_BOOKMARK}" />",
				TOKEN					: "<c:out value="${sessionScope.TOKEN}" />",
				IMG_DPI					:  "<c:out value="${IMG_DPI}" />",

			}



			$.Actor.init(ActorParams);

		})
	</script>
</head>

<c:set var="ViewMode" value="${mParams['VIEW_MODE'][0]}" />
<c:set var="KeyType" value="${mParams['KEY_TYPE'][0]}" />
<c:set var="Key" value="${KEY}" />
<c:set var="KeyTitle" value="${KEY_TITLE}" />
<c:set var="isMultiKey" value="${MULTI_KEY}" />


<body class="actor_body">
<div id="area_progress" class="area_progress"></div>
<div class="wrapper">
	<div class="actor_left" id="list_btnLeft">
		<div id="btn_open_menu" >
			<img src="<c:url value="/image/pc/actor/btn_menu.png" />" />
		</div>
		<c:if test="${ViewMode eq 'EDIT' or ViewMode eq 'AFTER'}">
			<div id="btn_add_slip"  cs_operation="1" >
				<img src="<c:url value="/image/pc/actor/btn_add_slip.png" />" />
			</div>
		</c:if>
		<c:if test="${ViewMode eq 'EDIT' or ViewMode eq 'AFTER'}">
			<c:if test="${KeyType eq 'JDOC_NO' }">
				<div id="btn_open_comment" onclick="javascript:$.Operation.execute($.Actor, this);" command="OPEN_COMMENT" >
					<img src="<c:url value="/image/pc/actor/btn_open_comment.png" />" />
				</div>
				<div id="btn_open_history" onclick="javascript:$.Operation.execute($.Actor, this);" command="OPEN_HISTORY"  >
					<img src="<c:url value="/image/pc/actor/btn_open_history.png" />" />
				</div>
			</c:if>
		</c:if>
		<c:if test="${ViewMode eq 'EDIT' or ViewMode eq 'AFTER' or ViewMode eq 'EACCT'}">
			<div id="btn_remove" >
				<img src="<c:url value="/image/pc/actor/btn_remove.png" />" 	/>
			</div>
		</c:if>
		<div id="btn_print" onclick="javascript:$.Operation.execute($.Actor, this);" cs_operation="1" command="PRINT_SLIP">
			<img src="<c:url value="/image/pc/actor/btn_print.png" />" />
		</div>
	</div>
	<div class="actor_right">
		<div class="slip_wrapper" style="height:100% !important;">
			<div class="slip_title">
				<div class="slip_title_left">
					<div class="cb_slip_all">
						<label class="cb_container">
							<input type="checkbox" id="slip_checkAll">
							<span class="checkbox"></span>
						</label>
					</div>
					<div class="area_title">
							<span class="evidence" data-i18n="E-EVIDENCE">
								</span>
						<span id="slipCnt"></span>
					</div>
					<div class="area_key">

						<c:choose>
							<c:when test="${isMultiKey eq true }">
								<div class="key_title">
<%--									-&nbsp;<span data-i18n="EVIDENCE_KEY"></span> :--%>
								</div>
								<div class="area_key_select">
									<select class="key_select" onchange="javascript:$.Actor.change_GroupKey(this);">
										<option value="">ALL</option>
										<c:set var="keyVal" value="${fn:split(Key, ',')}" />
										<c:set var="keyTitle" value="${fn:split(KeyTitle, ',')}" />
										<c:set var="keySize" value="${fn:length(keyVal)}" />

										<c:forEach var="i" begin="0" end="${keySize - 1}">
											<option value="<c:out value="${keyVal[i]}"></c:out>">${keyTitle[i]}</option>
										</c:forEach>
									</select>
								</div>
							</c:when>
							<c:otherwise>
								<%--										<div class="key_title">--%>
								<%--											-&nbsp;<span data-i18n="EVIDENCE_KEY"></span> :--%>
								<%--										</div>--%>
								<%--										<div class="key" id="key" title="${KeyTitle}" >--%>
								<%--											<c:out value="${KeyTitle}"></c:out>--%>
								<%--										</div>--%>
							</c:otherwise>
						</c:choose>
						<%--							<c:choose>--%>
						<%--								<c:when test="${isMultiKey eq true }">--%>
						<%--								<div class="area_key_select">--%>
						<%--									<select class="key_select" onchange="javascript:$.Actor.change_GroupKey(this);">--%>
						<%--										<option value="">ALL</option>--%>
						<%--										<c:forEach items="${fn:split(Key, ',') }" var="curKey">--%>
						<%--										<option value="<c:out value="${curKey}"></c:out>">${curKey}</option>--%>
						<%--										</c:forEach>--%>
						<%--									</select>--%>
						<%--									</div>--%>
						<%--								</c:when>--%>
						<%--								<c:otherwise>--%>
						<%--									<div class="key" id="key" title="${Key}" >--%>
						<%--										<c:out value="${Key}"></c:out>--%>
						<%--									</div>--%>
						<%--								</c:otherwise>--%>
						<%--							</c:choose>--%>

					</div>
				</div>
				<div class="slip_title_right">
					<div class="icon-btn" onclick="javascript:$.Actor.ZoomIn_Thumb();">
						<img src="<c:url value="/image/pc/actor/zoom_in.png" />" />
					</div>
					<div class="icon-btn" onclick="javascript:$.Actor.ZoomOut_Thumb();">
						<img src="<c:url value="/image/pc/actor/zoom_out.png" />" />
					</div>
				</div>
			</div>
			<div id="area_slip" class="area_slip">
				<div>
					<div id="slip_progress" class="slip_progress"></div>
					<div id="slip_masonry" class="slip_masonry"></div>
				</div>
			</div>
			<div class="progress_slip_scroll">
				Loading...
			</div>
		</div>
		<div id="dragBar" dragging="0"></div>
		<div class="attach_wrapper" style="display:none !important;">
			<div class="attach_title">
				<div class="attach_title_left">
					<div class="cb_attach_all">
						<label class="cb_container">
							<input type="checkbox" id="attach_checkAll">
							<span class="checkbox"></span>
						</label>
					</div>
					<div class="area_title">
						<span class="evidence" data-i18n="ATTACH"></span>
						<span id="attachCnt"></span>
					</div>
				</div>
				<div class="attach_title_right">
					<div class="area_maximize" onclick="javascript:$.Actor.Adjust_Size()" >
						<img src="<c:url value="/image/common/height-adjust.png" />" />
					</div>
					<%-- <div class="area_maximize" onclick="javascript:$.Actor.maximize()" >
                        <img src="<c:url value="/image/common/maximize.png" />" />
                    </div>
                    <div class="area_minimize" onclick="javascript:$.Actor.minimize()" >
                        <img src="<c:url value="/image/common/minimize.png" />" />
                    </div> --%>
				</div>
			</div>
			<div id="attach_progress" class="attach_progress"></div>
			<div id="area_attach" class="area_attach"></div>
			<div class="progress_attach_scroll">
				Loading...
			</div>
		</div>
	</div>
</div>

<script src="<c:url value='js/localWAS/OfficeXPI.js' />"></script>
<script src="<c:url value='js/polyfill/Map.min.js' />"></script>
<script src="<c:url value='js/view/actor.js' />"></script>
<%--<script src="<c:url value='js/bookmark/bookmark.js' />"></script>--%>
<%--<script src="<c:url value='js/bookmark/konva.min.js' />"></script>--%>
<script src="<c:url value='js/effect/ripple.js' />"></script>
<script src="<c:url value='js/masonry/masonry.pkgd.min.js' />"></script>
<script src="<c:url value='js/masonry/imagesloaded.pkgd.min.js' />"></script>
<script src="<c:url value='js/menu/context-menu.js' />"></script>
<script src="<c:url value='js/operation.js' />"></script>
<script src="<c:url value='js/jquery.nicescroll.min.js' />"></script>
<script src="<c:url value='js/zoom/jquery.ez-plus.js' />"></script>
</body>
