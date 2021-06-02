<%@ page import="java.net.URLDecoder" %>
<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<!DOCTYPE html>
<%@ include file="/common/common.jsp"%>
<html>
<head>
	<title>Slip Viewer</title>
	<link rel="stylesheet" type="text/css" href="<c:url value='css/style.css' />" >
<%--	<link rel="stylesheet" type="text/css" href="<c:url value='css/colorpicker/spectrum.css' />" >--%>
	<link rel="stylesheet" type="text/css" href="<c:url value='css/menu/context-menu.css' />" >
	<%
		//Generate system id
		try
		{
			if(request.getParameterMap().size() > 0) {
				String strServerKey = g_profile.getString(request.getParameter("SVR_MODE"), "KEY", "");
				pageContext.setAttribute("SERVER_KEY", strServerKey);

				//Attach parameters to pageContext
				Map<String, String[]> mParams = request.getParameterMap();
				pageContext.setAttribute("mParams", mParams);

				String key = request.getParameter("KEY");
				key = URLDecoder.decode(key, "utf-8");

				pageContext.setAttribute("KEY_ORIGIN", key);
				//Detect whether multikey.
				boolean isMultiKey = false;
				if (!C.isBlank(key)) {
					if (key.indexOf(',') > -1) isMultiKey = true;
				}

				pageContext.setAttribute("KEY", key);
				pageContext.setAttribute("MULTI_KEY", isMultiKey);
				pageContext.setAttribute("FOLD", g_profile.getString("WAS_INFO", "FOLD", "T"));
				pageContext.setAttribute("MAXIMIZED", g_profile.getString("WAS_INFO", "MAXIMIZED", "F"));
				pageContext.setAttribute("USE_BOOKMARK_DRAW", g_profile.getString("WAS_INFO","USE_BOOKMARK_DRAW","F"));
				pageContext.setAttribute("USE_BOOKMARK", g_profile.getString("WAS_INFO","USE_BOOKMARK","F"));
				pageContext.setAttribute("IMG_DPI", g_profile.getString("WAS_INFO","IMG_DPI","200"));
			}
		}
		catch(Exception e) {
			logger.error("");
		}

/* 	String strScheme = request.getScheme().toUpperCase() + "_URL";
	String strLocalWasURL					= g_profile.getString("LOCAL_WAS",strScheme, "");
	pageContext.setAttribute("LOCAL_WAS_URL", strLocalWasURL); */

	%>
	<script>
		$(function(){
			var ViewerParams = {
				CORP_NO 				: "<c:out value="${sessionScope.CORP_NO}" />",
				USER_ID 				: "<c:out value="${sessionScope.USER_ID}" />",
				PART_NO 				: "<c:out value="${sessionScope.PART_NO}" />",
				AUTH 					: "<c:out value="${sessionScope.AUTH}" />",
				SERVER_KEY 				: "<c:out value="${SERVER_KEY}" />",
				LANG 					: "<c:out value="${mParams['LANG'][0]}" />",
				KEY_TYPE 				: "<c:out value="${mParams['KEY_TYPE'][0]}" />",
				KEY		 				: "<c:out value="${KEY}" />",
				KEY_TITLE		 		: "<c:out value="${KEY_TITLE}" />",
				VIEW_MODE 				: "<c:out value="${mParams['VIEW_MODE'][0]}" />",
				SVR_MODE				:  "<c:out value="${mParams['SVR_MODE'][0]}" />",
				MENU					:  "<c:out value="${mParams['MENU'][0]}" />",
				XPI_PORT_HTTP			: "<c:url value ="${mParams['XPI_PORT_HTTP'][0]}" />",
				XPI_PORT_HTTPS			: "<c:url value ="${mParams['XPI_PORT_HTTPS'][0]}" />",
				WORK_GROUP				: "<c:url value ="${mParams['WORK_GROUP'][0]}" />",
				MULTI_KEY				:  <c:out value="${MULTI_KEY}" />,
				PAGE					:	"VIEWER",
				FOLD					:  "<c:out value="${FOLD}" />",
				MAXIMIZED				:  "<c:out value="${MAXIMIZED}" />",
				CLICKED_SLIP_IRN		:  "<c:out value="${mParams['CLICKED_SLIP_IRN'][0]}" />",
				USE_BOOKMARK_DRAW		:  "<c:out value="${USE_BOOKMARK_DRAW}" />",
				USE_BOOKMARK			:  "<c:out value="${USE_BOOKMARK}" />",
				IMG_DPI					:  "<c:out value="${IMG_DPI}" />",
			}

			$.Viewer.init(ViewerParams);

		})
	</script>
</head>
<body>

<c:set var="ViewMode" value="${mParams['VIEW_MODE'][0]}" />
<c:set var="KeyType" value="${mParams['KEY_TYPE'][0]}" />
<c:set var="Key" value="${KEY}" />
<c:set var="isMultiKey" value="${MULTI_KEY}" />


<div class="wrapper viewer">
	<c:if test="${mParams.MENU[0] eq '1' and ViewMode ne 'SIMPLE'}">
		<div id="list_btnLeft" class="area_menu_btn">
			<div id="btn_open_menu" >
				<img src="<c:url value="/image/pc/actor/btn_menu.png" />" />
			</div>
				<%-- <c:if test="${ViewMode eq 'EDIT' or ViewMode eq 'AFTER'}"> --%>
			<div id="btn_add_slip"  cs_operation="1" >
				<img src="<c:url value="/image/pc/actor/btn_add_slip.png" />" />
			</div>
				<%-- </c:if>
                <c:if test="${KeyType eq 'JDOC_NO' and isMultiKey eq false }"> --%>
			<div id="btn_open_comment" onclick="javascript:$.Operation.execute($.Viewer, this);" command="OPEN_COMMENT" >
				<img src="<c:url value="/image/pc/actor/btn_open_comment.png" />" />
			</div>
			<div id="btn_open_history" onclick="javascript:$.Operation.execute($.Viewer, this);" command="OPEN_HISTORY"  >
				<img src="<c:url value="/image/pc/actor/btn_open_history.png" />" />
			</div>
				<%-- </c:if>
                <c:if test="${ViewMode eq 'EDIT' or ViewMode eq 'AFTER'}"> --%>
			<div id="btn_remove" >
				<img src="<c:url value="/image/pc/actor/btn_remove.png" />" 	/>
			</div>
				<%-- </c:if> --%>
			<div id="btn_print" onclick="javascript:$.Operation.execute($.Viewer, this);" cs_operation="1" command="PRINT_SLIP">
				<img src="<c:url value="/image/pc/actor/btn_print.png" />" />
			</div>
		</div>
	</c:if>
	<div id="areaViewer" class="area_viewer">
		<div class="area_viewer_title">
			<div class="area_title_left">
				<div class="title_icon"></div>
				<div class="viewer_title">
					<c:choose>
						<c:when test="${isMultiKey eq true }">
							<span class="title" data-i18n="TITLE"></span>
							<select class="key_select" onchange="javascript:$.Viewer.change_GroupKey(this);">
								<option value="">ALL</option>
								<c:forEach items="${fn:split(Key, ',') }" var="curKey">
									<option value="<c:out value="${curKey}"></c:out>">${curKey}</option>
								</c:forEach>

							</select>
						</c:when>
						<c:otherwise>
							<span class="title" data-i18n="TITLE"></span>
							<span>(<c:out value="${Key}"></c:out>)</span>
						</c:otherwise>
					</c:choose>

				</div>
			</div>
			<div class="area_title_right">
				<c:if test="${ViewMode eq 'EDIT' or ViewMode eq 'AFTER'}">
					<div class="area_attach_list" onclick="javascript:$.Viewer.toggleAttachList();">
						<img src="<c:url value="/image/pc/viewer/attach.png" />" />
					</div>
				</c:if>
				<div class="area_attach_list close" onclick="javascript:$.Viewer.close();">
					<img src="<c:url value="/image/pc/viewer/close.png" />" />
				</div>
			</div>
		</div>
		<div class="area_viewer_content">
			<div class="viewer_left" id="viewer_left">

				<div id="viewerContainer" class="viewer_container">
					<div id="drawPanel" class="draw_panel">
						<div class="title_container">
							<div id="panelTitle" class="panel_title">Title</div>
							<div id="panelClose" class="panel_close">
								<img src="<c:url value="/image/pc/viewer/btn_close.png" />" />
							</div>
						</div>
						<div id="tabTitle" class="tab_title_container"></div>
						<div id="panelColorPicker">
							<input id="colorPicker" class="panel_colorpicker"  />
						</div>
						<div id="options" class="options"></div>
					</div>
					<div class="viewer_info" id="viewerInfo">
						<div class="info_title"><span class="title" data-i18n="INFO_TITLE"></span></div>
						<div class="info" id="slip_info">
							<div id="info_progress" class="info_progress"></div>
							<div>
								<div class="info_content">
								</div>
							</div>
						</div>
					</div>
					<div class="viewer_main">
						<div id="slip_progress" class="slip_progress"></div>
						<div class="slip_wrapper">
							<div class="title">
								<div class="slip_title_left">
									<div class="icon-btn" onclick="javascript:$.Viewer.ZoomIn_Thumb();">
										<img src="<c:url value="/image/pc/actor/zoom_in.png" />" />
									</div>
									<div class="icon-btn" onclick="javascript:$.Viewer.ZoomOut_Thumb();">
										<img src="<c:url value="/image/pc/actor/zoom_out.png" />" />
									</div>
								</div>
								<div class="slip_title_right">
									<%-- <div class="area_key">
                                        (<span data-i18n="EVIDENCE_KEY"></span> : <span class="key" ><c:out value="${mParams['JDocNo'][0]}" /></span>)
                                    </div> --%>
								</div>
							</div>
							<div id="area_slip" class="area_slip">
								<div>
									<div id="slip_masonry" class="slip_masonry"></div>
								</div>
							</div>
							<div class="progress_slip_scroll">
								Loading...
							</div>
						</div>
					</div>
				</div>
			</div>
			<div id="dragBar_viewer" dragging="0" tag="drag"></div>
			<div class="viewer_right" id="viewer_right" >
				<div>
					<div id="original_progress" class="original_progress"></div>
					<div class="title">
						<div class="viewer_title_left">
							<div class="icon-btn" onclick="javascript:$.Viewer.Download_Original(this);" command="DOWN_ORIGINAL_SLIP">
								<img src="<c:url value="/image/pc/viewer/icon_down.png" />" />
							</div>
							<div class="icon-btn" id="zoomIn" <%-- onclick="javascript:$.Viewer.ZoomIn_Viewer();" --%>>
								<img src="<c:url value="/image/pc/viewer/zoom_in.png" />" />
							</div>
							<div class="icon-btn" id="zoomOut" <%--onclick="javascript:$.Viewer.ZoomOut_Viewer();"--%>>
								<img src="<c:url value="/image/pc/viewer/zoom_out.png" />" />
							</div>
						</div>
						<div id="bookmarkBtnList" class="viewer_title_right">

							<%-- <div class="area_key">
                                (<span data-i18n="EVIDENCE_KEY"></span> : <span class="key" ><c:out value="${mParams['JDocNo'][0]}" /></span>)
                            </div> --%>
						</div>
					</div>
					<div class="area_original">
						<div id="bookmarkProgress" class="bookmark_progress" ></div>
						<div id="originalImage" >
							<%--						<span class="helper"></span>--%>
						</div>
					</div>
				</div>
			</div>
<%--			<div id="dragBar_extra" dragging="0" tag="drag"></div>--%>
			<div id="viewer_right_extra" class="viewer_right_extra" visible="0">
				<div>
					<div id="attach_progress" class="attach_progress"></div>
					<div id="attach_list" class="attach_list">
						<div class="title"><span  data-i18n="ATTACH_TITLE"></span></div>
						<div class="content" id="area_attach">

						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>


<script src="<c:url value='js/localWAS/OfficeXPI.js' />"></script>
<script src="<c:url value='js/polyfill/Map.min.js' />"></script>
<script src="<c:url value='js/view/actor.js' />"></script>
<script src="<c:url value='js/view/viewer.js' />"></script>
<script src="<c:url value='js/effect/ripple.js' />"></script>
<script src="<c:url value='js/masonry/masonry.pkgd.min.js' />"></script>
<script src="<c:url value='js/masonry/imagesloaded.pkgd.min.js' />"></script>
<script src="<c:url value='js/menu/context-menu.js' />"></script>
<script src="<c:url value='js/operation.js' />"></script>
<script src="<c:url value='js/zoom/jquery.mousewheel.js' />"></script>
<script src="<c:url value='js/zoom/jquery.panzoom.js' />"></script>
<script src="<c:url value='js/zoom/rotate.js' />"></script>
<script src="<c:url value='/js/jquery.nicescroll.min.js' />"></script>
<%--<script src="<c:url value='js/bookmark/bookmark.js' />"></script>--%>
<%--<script src="<c:url value='js/bookmark/draw.js' />"></script>--%>
<%--<script src="<c:url value='js/bookmark/konva.min.js' />"></script>--%>
<%--<script src="<c:url value='js/colorpicker/spectrum.js' />"></script>--%>
</body>
</html>