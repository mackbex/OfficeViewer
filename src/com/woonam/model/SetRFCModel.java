package com.woonam.model;

import com.woonam.connect.AgentConnect;
import com.woonam.util.Common;
import com.woonam.util.Profile;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import javax.servlet.http.HttpSession;
import java.util.Map;


public class SetRFCModel {

    private AgentConnect m_AC 		= null;
    private Profile m_Profile				= null;
    private Common m_C				 	= null;
    private HttpSession session		= null;
    private Logger logger = null;

    public SetRFCModel(AgentConnect AC, HttpSession session)
    {
        this.logger 	= LogManager.getLogger(GetModel.class);
        this.m_AC 		= AC;
        this.m_Profile 	= AC.getProfile();
        this.m_C 		= new Common();
        this.session 	= session;
    }

    public SetRFCModel(AgentConnect AC)
    {
        this.logger 	= LogManager.getLogger(GetModel.class);
        this.m_AC 		= AC;
        this.m_Profile 	= AC.getProfile();
        this.m_C 		= new Common();
        this.session 	= null;
    }

    public boolean sendSlipDocCnt(String rfcName, Map<String, Object> mapParams)
    {
        String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
        boolean bRes 		= false;

        if (m_AC == null)	return false;
        String jdocNo		= m_C.getParamValue(mapParams, "KEY", null);
        String isExist		= m_C.getParamValue(mapParams, "IS_EXIST", null);
        String isTaxExist		= m_C.getParamValue(mapParams, "TAX_EXIST", null);


        StringBuffer sbRFC     =     new StringBuffer();

        sbRFC.append("<RFCCALL Table=\"IMG_SLIPDOC_T\">");
        sbRFC.append("<Rfc Name=\""+rfcName+"\" Ver=\"New\" isExportTable=\"TRUE\">");

        sbRFC.append("<Input Type=\"Parameter\" Name=\"\" >");
        sbRFC.append("<Row>");
            sbRFC.append("<Data Column=\"IV_KEY\" Value=\""+jdocNo+"\" />");
        sbRFC.append("<Data Column=\"IV_YN\" Value=\""+isExist+"\" />");
        sbRFC.append("<Data Column=\"IV_YN2\" Value=\""+isTaxExist+"\" />");
        sbRFC.append("</Row>");
        sbRFC.append("</Input>");

        sbRFC.append("</Rfc>");
        sbRFC.append("</RFCCALL>");



        try {


            String res = m_AC.SetSAPData(sbRFC.toString(), strFuncName);

            String resFlag		= res.substring(0,1);
            if("T".equalsIgnoreCase(resFlag)) {
                bRes = true;
            }
            else {
                bRes = false;
            }

        }
        catch (Exception e) {
            logger.error("sendSlipDocCnt : Failed to set data.", e);

            return false;
        }
        return bRes;
    }
}
