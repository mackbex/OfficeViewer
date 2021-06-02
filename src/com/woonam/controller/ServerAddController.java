package com.woonam.controller;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
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

@WebServlet(urlPatterns = {"/ServerAddCommand.do"})
public class ServerAddController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private Common m_C 					= null;
    private String m_RootPath 				= null;
    //	private boolean isInitCompleted 		= false;
    private GetModel m_GM					= null;
    private SetModel m_SM					= null;
    private AgentConnect m_AC			= null;
    private Logger logger = null;

    enum ENUM_COMMAND {
        GET_USER_LIST,
        GET_SLIPKIND_LIST,
        SEARCH_SLIP,
        UPLOAD_SLIP
    }

    public ServerAddController() {
        this.logger 				= LogManager.getLogger(ServerAddController.class);
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

        this.m_RootPath = m_C.getRootPath(getServletContext());
        Profile profile = new Profile(m_RootPath + File.separator + "conf" + File.separator + "conf.ini");

        //Check logger init result.
//		if(!m_C.setLogger(profile, this.m_RootPath))
//		{
//			RequestDispatcher rd = req.getRequestDispatcher("slip_error.jsp?ERR_MSG=FAILED_LOGGER_INIT");
//	  	 	rd.forward(req,resp);
//	  	 	return;
//		}

        PrintWriter out = resp.getWriter();

        Map mapParams = new HashMap<String, Object>(req.getParameterMap());
        String strClientIP = m_C.getClientIP(profile, req);
        String[] arClientIP = {strClientIP};
        mapParams.put("ClientIP", arClientIP);

        HttpSession session = req.getSession();
        String strCommand = m_C.getParamValue(mapParams, "Command", null);

        if (m_C.isBlank(strCommand)) {
            logger.error("Command is null");
            out.print(m_C.writeResultMsg("F", "COMMAND_IS_NULL"));
            return;
        }

        if (m_C.IsInjection(mapParams)) {
            logger.error("Injection detected.");
            out.print(m_C.writeResultMsg("F", "INJECTION_DETECTED"));
            return;
        }

        ServerAddController.ENUM_COMMAND EC = null;
        try {
            this.m_AC = new AgentConnect(profile);
            this.m_GM = new GetModel(m_AC, session);
            this.m_SM = new SetModel(m_AC, session);
            EC = ServerAddController.ENUM_COMMAND.valueOf(strCommand);

            switch (EC) {

                case UPLOAD_SLIP: {
                    String[] arrParam = {"CHECKED_LIST", "JDOC_NO"};
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

                    JsonArray arSlipList = m_GM.Get_SlipList(mapParams);

                    if(arSlipList == null || arSlipList.size() <= 0) {
                        out.print(m_C.writeResultMsg("F", "FAILED_LOAD_SLIPINFO"));
                        return;
                    }

                    JsonArray alAddSlip = new JsonArray();
                    JsonArray alCopySlip = new JsonArray();

                    for(int i = 0 ; i < arSlipList.size(); i ++) {
                        JsonObject objItem = arSlipList.get(i).getAsJsonObject();

                        if("0".equalsIgnoreCase(objItem.get("SDOC_STEP").getAsString()) || "1".equalsIgnoreCase(objItem.get("SDOC_STEP").getAsString())) {
                            alAddSlip.add(objItem);
                        }
                        else {
                            alCopySlip.add(objItem);
                        }
                    }

                    boolean res = true;
                    if(alAddSlip.size() > 0) {
                        res = m_SM.addSlip(alAddSlip, mapParams);
                    }

                    if(res) {
                        if(alCopySlip.size() > 0) {
                            res = m_SM.copySdocNo(alCopySlip, mapParams);
                        }
                    }


                    if(res) {
                        out.print(m_C.writeResultMsg("T", ""));
                    }
                    else {
                        out.print(m_C.writeResultMsg("F", "FAILED_ADD_SLIP"));
                    }


                    break;
                }
                case SEARCH_SLIP: {

                    String[] arrParam = {"FROM_DATE","TO_DATE","USER_ID","PART_NO","CORP_NO"};
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

                    JsonArray alRes = m_GM.searchSlip(mapParams);
                    out.print(alRes.toString());

                    break;
                }
                case GET_USER_LIST: {
                    String[] arrParam = {"KEYWORD"};
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

                    JsonArray alRes = m_GM.getUserList(mapParams);
                    out.print(alRes.toString());

                    break;
                }
                case GET_SLIPKIND_LIST: {

                    if(!m_C.chk_UserPermission(m_GM, session))
                    {
                        logger.error("Permission denied.");
                        out.print(m_C.writeResultMsg("F", "PERMISSION_DENIED"));
                        return;
                    }

                    JsonArray alRes = m_GM.getSlipKindList(mapParams);
                    out.print(alRes.toString());

                    break;
                }
                default: {
                    out.print(m_C.writeResultMsg("F", "COMMAND_IS_NULL"));
                    break;
                }
            }

        } catch (Exception e) {
            out.print(m_C.writeResultMsg("F", "SERVER_EXCEPTION"));
        }

        return;
    }
}
