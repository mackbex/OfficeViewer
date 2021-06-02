package com.woonam.controller;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.woonam.chiper.ARIAChiper;
import com.woonam.connect.AgentConnect;
import com.woonam.model.GetModel;
import com.woonam.util.Common;
import com.woonam.util.Profile;
import com.woonam.wdms.WdmFile;
import com.woonam.xvarm.XvarmFile;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

@WebServlet(urlPatterns = {"/DownloadAttach.do"})
public class DownloadAttachController extends HttpServlet {


	private static final long serialVersionUID = 1L;
	private Common m_C 					= null;
	private String m_RootPath 				= null;
	private String m_ConfPath				= null;
	private GetModel m_GM					= null;
	private AgentConnect m_AC			= null;
	private Logger logger = null;
	
	public DownloadAttachController() {
		this.logger					= LogManager.getLogger(DownloadAttachController.class);
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
		this.m_ConfPath 			= m_RootPath + File.separator +"conf" + File.separator + "conf.ini";
	
		
		HttpSession session		= req.getSession();
		Profile profile				= new Profile(m_ConfPath);

		Map mapParams = new HashMap<String, Object>(req.getParameterMap());
		String docIRN 			= req.getParameter("DOC_IRN");
		String strUserID 		= session.getAttribute("USER_ID") == null ? null : (String)session.getAttribute("USER_ID");
		String strCoCD 		= session.getAttribute("CORP_NO") == null ? null : (String)session.getAttribute("CORP_NO");

	   	if(m_C.IsInjection(req.getParameterMap()))
	   	{
	 		logger.error("Injection detected.");
	 		resp.getWriter().print(m_C.writeResultMsg("F", "INJECTION_DETECTED"));
			return;
	   	}
	   	
	   	String strTable = "IMG_ORGFILE_X";
	   	
	   	this.m_AC 	= new AgentConnect(profile);
		this.m_GM 	= new GetModel(m_AC, session);
		
		BufferedInputStream fin 		= 	null;
        BufferedOutputStream outs 	=	null;
		
		try
		{
		
			String fileName = m_GM.getAttachFileName(mapParams);
			
			if(m_C.isBlank(fileName)) {
				resp.getWriter().print(m_C.writeResultMsg("F", "FAILED_GET_FILENAME"));
				return;
			}
			
			String strEncodedFileName		= m_C.getEncodedFileName(req, fileName);
			String strEDMS						= profile.getString("AGENT_INFO", "EDMS", "");     	
		 	   
			byte[] FileByte	=	 null;
			
	    	if("XVARM".equals(strEDMS))
	    	{
	    		XvarmFile attach			=	new XvarmFile(profile);
	    		FileByte	=	attach.Download(docIRN, "0", strTable);
	    	}
	    	else
	    	{
	    		WdmFile attach			=	new WdmFile(profile);;
	    		FileByte	=	attach.Download(docIRN, "0", strTable);
	    	}
			
	    	ARIAChiper aria = new ARIAChiper(m_ConfPath);
			FileByte = aria.ARIA_Decode(FileByte);
	    	
			resp.reset();
			resp.setHeader("Content-Disposition","attachment; filename=\"" + strEncodedFileName + "\"");
			resp.setHeader("Content-Transfer-Encoding", "binary");
			resp.setContentLength(FileByte.length);
			resp.setContentType("application/octet-stream");
			resp.setHeader("Connection", "close");
			
		
        	
	    	byte b[] 		= new byte[FileByte.length];
	        fin 				= new BufferedInputStream(new ByteArrayInputStream(FileByte));
	        outs 				= new BufferedOutputStream(resp.getOutputStream());
	         
	        int read = 0;
	        while ((read = fin.read(b)) != -1)
	        {
	            outs.write(b,0,read);
	        }
		} 
		catch(Exception e)
		{
			logger.error("Download Attach", e);
			resp.setHeader("Content-Disposition","inline");
			resp.setContentType("text/html");
		}
		finally
    	{      
    		if(outs != null) 	try{outs.close();}catch(Exception e){ logger.error("Download Attach", e); }
    		if(fin != null) 		try{fin.close();}catch(Exception e){ logger.error("Download Attach", e); }
    	}
	}
}