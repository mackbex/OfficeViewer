package com.woonam.controller;

import com.google.gson.JsonArray;
import com.woonam.connect.AgentConnect;
import com.woonam.model.GetModel;
import com.woonam.model.SetModel;
import com.woonam.util.Common;
import com.woonam.util.Profile;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@WebServlet(urlPatterns = {"/BookmarkCommand.do"})
public class BookmarkController extends HttpServlet{

	private static final long serialVersionUID = 1L;
	private Common m_C 					= null;
	private String m_RootPath 			= null;
//	private boolean isInitCompleted 	= false;
	private GetModel m_GM				= null;
	private SetModel m_SM				= null;
	private AgentConnect m_AC			= null;
	private Logger logger 		= null;

	enum ENUM_COMMAND {
		ADD_BOOKMARK,
		REMOVE_BOOKMARK,
		MODIFY_BOOKMARK
	}

	public BookmarkController() {
		this.logger					= LogManager.getLogger(BookmarkController.class);
		this.m_C 					= new Common();
	}
	
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doPost(req, resp);
	}
	
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		
		req.setCharacterEncoding("utf-8");
		resp.setCharacterEncoding("utf-8");
		
		this.m_RootPath			= m_C.getRootPath(getServletContext());
		Profile profile				= new Profile(m_RootPath + File.separator +"conf" + File.separator + "conf.ini");
	//	this.isInitCompleted		= setLogger(profile);
		//Check logger init result.
//		if(!m_C.setLogger(profile, this.m_RootPath))
//		{
//			RequestDispatcher rd = req.getRequestDispatcher("slip_error.jsp?ERR_MSG=FAILED_LOGGER_INIT");
//	  	 	rd.forward(req,resp);
//	  	 	return;
//		}
		
		HttpSession session = req.getSession();
		PrintWriter out			= resp.getWriter();

		Map mapParams = new HashMap<String, Object>(req.getParameterMap());
		String strClientIP = m_C.getClientIP(profile, req);
		String[] arClientIP = {strClientIP};
		mapParams.put("ClientIP", arClientIP);
		
		
		String strCommand			= m_C.getParamValue(mapParams, "Command", null);
		
		if(m_C.isBlank(strCommand))
		{
    		logger.error("Command is null");
    		out.print(m_C.writeResultMsg("F", "COMMAND_IS_NULL"));
			return;
		}
    	
      	if(m_C.IsInjection(req.getParameterMap()))
	   	{
	 		logger.error("Injection detected.");
    		out.print(m_C.writeResultMsg("F", "INJECTION_DETECTED"));
			return;
	   	}
    	
		/*
		 * Logger.write("----------------------------------------", 5);
		 * Logger.write("ViewerCommand : Command - "+strCommand, 5);
		 */
		
		ENUM_COMMAND EC = null;
		try
		{	
			this.m_AC 	= new AgentConnect(profile);
			this.m_GM 	= new GetModel(m_AC, session);
			this.m_SM 	= new SetModel(m_AC, session);
			EC 	= ENUM_COMMAND.valueOf(strCommand);
			
			switch(EC)
			{
				case ADD_BOOKMARK : {

					if(!m_C.chk_UserPermission(m_GM, session))
					{
						logger.error("Permission denied.");
						out.print(m_C.writeResultMsg("F", "PERMISSION_DENIED"));
						return;
					}

					if(m_SM.addBookmark(mapParams)) {
						out.print(m_C.writeResultMsg("T", ""));
					}
					else {
						out.print(m_C.writeResultMsg("F", "FAILED_ADD_BOOKMARK"));
					}
				}
				break;
				case REMOVE_BOOKMARK : {

					String[] arrParam = {"MARK_IRN"};
					if(m_C.IsNullParam(arrParam, mapParams))
					{
						logger.error("Parameter of "+strCommand+" is NULL.");
						out.print(m_C.writeResultMsg("F", "PARAMETER_IS_NULL"));
						return;
					}

					if(!m_C.chk_UserPermission(m_GM, session))
					{
						logger.error("Permission denied.");
						out.print(m_C.writeResultMsg("F", "PERMISSION_DENIED"));
						return;
					}
//					out.print(m_C.writeResultMsg("F", "FAILED_REMOVE_BOOKMARK"));
					if(m_SM.removeBookmark(mapParams)) {
						out.print(m_C.writeResultMsg("T", ""));
					}
					else {
						out.print(m_C.writeResultMsg("F", "FAILED_REMOVE_BOOKMARK"));
					}
				}
				break;
				case MODIFY_BOOKMARK : {

					String[] arrParam = {"MARK_IRN", "FIELD"};
					if(m_C.IsNullParam(arrParam, mapParams))
					{
						logger.error("Parameter of "+strCommand+" is NULL.");
						out.print(m_C.writeResultMsg("F", "PARAMETER_IS_NULL"));
						return;
					}

					if(!m_C.chk_UserPermission(m_GM, session))
					{
						logger.error("Permission denied.");
						out.print(m_C.writeResultMsg("F", "PERMISSION_DENIED"));
						return;
					}
//					out.print(m_C.writeResultMsg("F", "FAILED_REMOVE_BOOKMARK"));
					if(m_SM.modifyBookmark(mapParams)) {
						out.print(m_C.writeResultMsg("T", ""));
					}
					else {
						out.print(m_C.writeResultMsg("F", "FAILED_REMOVE_BOOKMARK"));
					}
				}
				break;
				default: break;
			}
		}
		catch (Exception e) {
			out.print(m_C.writeResultMsg("F", "SERVER_EXCEPTION"));
		}
		
		return;
	}
}
