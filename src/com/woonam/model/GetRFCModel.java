package com.woonam.model;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.woonam.connect.AgentConnect;
import com.woonam.util.Common;
import com.woonam.util.Profile;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.json.XML;

import javax.servlet.http.HttpSession;
import java.util.Iterator;
import java.util.Map;


public class GetRFCModel {

    private AgentConnect m_AC 		= null;
    private Profile m_Profile				= null;
    private Common m_C				 	= null;
    private HttpSession session		= null;
    private Logger logger = null;

    public GetRFCModel(AgentConnect AC, HttpSession session)
    {
        this.logger 	= LogManager.getLogger(GetModel.class);
        this.m_AC 		= AC;
        this.m_Profile 	= AC.getProfile();
        this.m_C 		= new Common();
        this.session 	= session;
    }

    public GetRFCModel(AgentConnect AC)
    {
        this.logger 	= LogManager.getLogger(GetModel.class);
        this.m_AC 		= AC;
        this.m_Profile 	= AC.getProfile();
        this.m_C 		= new Common();
        this.session 	= null;
    }

    public JsonObject getCocardData(Map<String, Object> mapParams)
    {
        String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
        String strRes 		= null;

        if (m_AC == null)	return null;
        String userID		= m_C.getParamValue(mapParams, "USER_ID", null);
        String key          = m_C.getParamValue(mapParams, "APPR_NO", null);

//        String[] arKey = key.split("-");
//        if(arKey.length < 3) {
//            logger.error("Invalid key");
//            return null;
//        }
//        String bukrs		= arKey[0];
//        String belnr		= arKey[1];
//        String gjhar		= arKey[2];

        StringBuffer sbRFC     =     new StringBuffer();
        sbRFC.append("<RFCCALL Table=\"IMG_SLIPDOC_T\">");
        sbRFC.append("<Rfc Name=\"ZUNIEFI_U911\" Ver=\"New\" isExportTable=\"TRUE\">");
        sbRFC.append("<Input Type=\"Parameter\" Name=\"\" >");
        sbRFC.append("<Row>");
        sbRFC.append("<Data Column=\"I_CRD_SEQ\" Value=\""+key+"\" />");
        sbRFC.append("</Row>");
        sbRFC.append("</Input>");
        sbRFC.append("</Rfc>");
        sbRFC.append("</RFCCALL>");

        JsonObject objRes = new JsonObject();

        try
        {
            JsonParser parser = new JsonParser();
            JsonObject temp = parser.parse(XML.toJSONObject(m_AC.GetSAPData(sbRFC.toString(), strFuncName)).toString()).getAsJsonObject();

            JsonObject listData = temp.get("ListData").getAsJsonObject();
            JsonArray arRow = null;
            if (listData.get("Row").isJsonArray()) {
                arRow = temp.get("ListData").getAsJsonObject().get("Row").getAsJsonArray();
            } else {
                return null;
            }

            JsonObject objTarget = null;

            for(int i = 0; i < arRow.size(); i++) {
                JsonObject objItem = arRow.get(i).getAsJsonObject();
                String type = objItem.get("Type") == null ? null : objItem.get("Type").getAsString();

                if("TABLE".equalsIgnoreCase(type)) {
                    objTarget = objItem;
                    break;
                }
            }

            if(objTarget != null) {
                objTarget = objTarget.get("OT_DATA").getAsJsonObject();

//                objRes.addProperty("ConvertKey",m_C.getStringOrDefault(objTarget.get("CRD_SEQ"),""));
//                objRes.addProperty("CComp",m_C.getStringOrDefault(objTarget.get("CCOMP"),""));
                objRes.addProperty("CComp","");
                objRes.addProperty("MerchAddr1",m_C.getStringOrDefault(objTarget.get("MERCH_ADDR1"),""));
                objRes.addProperty("Tips",m_C.getStringOrDefault(objTarget.get("TIPS_TXT"),""));
//                objRes.addProperty("UsedDate",m_C.getStringOrDefault(objTarget.get("APPR_DATE"),"").replaceAll("-",""));
                objRes.addProperty("ApprNo",m_C.getStringOrDefault(objTarget.get("APPR_NO"),""));
                objRes.addProperty("Tax",m_C.getStringOrDefault(objTarget.get("TAX_TXT"),""));
                objRes.addProperty("ApprType",m_C.getStringOrDefault(objTarget.get("APPR_TYPE_TXT"),""));
                objRes.addProperty("MerchNM",m_C.getStringOrDefault(objTarget.get("MERCH_NAME"),""));
                objRes.addProperty("ApprDate",m_C.getStringOrDefault(objTarget.get("APPR_DATE_TXT"),""));
                objRes.addProperty("Amount",m_C.getStringOrDefault(objTarget.get("AMOUNT_TXT"),""));
                objRes.addProperty("CardNo",m_C.getStringOrDefault(objTarget.get("CARDNO"),""));
                objRes.addProperty("Total",m_C.getStringOrDefault(objTarget.get("TOTAL_TXT"),""));
                objRes.addProperty("MerchBizNo",m_C.getStringOrDefault(objTarget.get("MERCH_BIZ_NO"),""));
                objRes.addProperty("ConvertKey", key);
            }
        }
        catch (Exception e) {
            logger.error("getInterestItem : Failed to get data.", e);

            return null;
        }
        return objRes;


        }

    public JsonObject getTaxItem(Map<String, Object> mapParams)
    {
        String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
        String strRes 		= null;

        if (m_AC == null)	return null;
        String userID		= m_C.getParamValue(mapParams, "USER_ID", null);
        String key          = m_C.getParamValue(mapParams, "APPR_NO", null);


        StringBuffer sbRFC     =     new StringBuffer();

        sbRFC.append("<RFCCALL Table=\"IMG_SLIPDOC_T\">");
        sbRFC.append("<Rfc Name=\"ZUNIEFI_U910\" Ver=\"New\" isExportTable=\"TRUE\">");
        sbRFC.append("<Input Type=\"Parameter\" Name=\"\" >");
        sbRFC.append("<Row>");
        sbRFC.append("<Data Column=\"I_INV_SEQ\" Value=\""+key+"\" />");
        sbRFC.append("</Row>");
        sbRFC.append("</Input>");
        sbRFC.append("</Rfc>");
        sbRFC.append("</RFCCALL>");


        JsonObject objRes = new JsonObject();

        try {
            JsonParser parser = new JsonParser();
            JsonObject temp = parser.parse(XML.toJSONObject(m_AC.GetSAPData(sbRFC.toString(), strFuncName)).toString()).getAsJsonObject();

            JsonObject listData = temp.get("ListData").getAsJsonObject();
            JsonArray arRow = null;
            if(listData.get("Row").isJsonArray()) {
                arRow = temp.get("ListData").getAsJsonObject().get("Row").getAsJsonArray();
            }
            else {
                return null;
            }

            JsonObject objTarget = new JsonObject();
            JsonArray arTaxItem = new JsonArray();

            for(int i = 0; i < arRow.size(); i++) {
                JsonObject objItem = arRow.get(i).getAsJsonObject();
                String type = objItem.get("Type") == null ? null : objItem.get("Type").getAsString();

                if("TABLE".equalsIgnoreCase(type)) {
                    if (objItem.has("OT_HEAD")) {
                        objTarget = objItem.get("OT_HEAD").getAsJsonObject();
                    }
                    else if(objItem.has("OT_ITEM")) {
                        arTaxItem.add(objItem.get("OT_ITEM").getAsJsonObject());
                    }
                }
            }

            if(objTarget != null) {
                objRes.addProperty("TypeCode",m_C.getStringOrDefault(objTarget.get("TYPE_CODE"),""));
                objRes.addProperty("ConvertKey",m_C.getStringOrDefault(objTarget.get("INV_SEQ"),""));
                objRes.addProperty("Approve",m_C.getStringOrDefault(objTarget.get("ISSUE_ID"),""));
                objRes.addProperty("FromLicense",m_C.getStringOrDefault(objTarget.get("SU_ID"),""));
                objRes.addProperty("FromTaxCode",m_C.getStringOrDefault(objTarget.get("SU_MIN"),""));
                objRes.addProperty("FromTitle",m_C.getStringOrDefault(objTarget.get("SU_NAME"),""));
                objRes.addProperty("FromCEO",m_C.getStringOrDefault(objTarget.get("SU_REPRES"),""));
                objRes.addProperty("FromAddr",m_C.getStringOrDefault(objTarget.get("SU_ADDR"),""));
                objRes.addProperty("FromBiz",m_C.getStringOrDefault(objTarget.get("SU_BUSTYPE"),""));
                objRes.addProperty("FromEvent",m_C.getStringOrDefault(objTarget.get("SU_INDTYPE"),""));
                objRes.addProperty("FromEmail",m_C.getStringOrDefault(objTarget.get("SU_EMAIL"),""));
                objRes.addProperty("ToLicense",m_C.getStringOrDefault(objTarget.get("IP_ID"),""));
                objRes.addProperty("ToTaxCode",m_C.getStringOrDefault(objTarget.get("IP_MIN"),""));
                objRes.addProperty("ToTitle",m_C.getStringOrDefault(objTarget.get("IP_NAME"),""));
                objRes.addProperty("ToCEO",m_C.getStringOrDefault(objTarget.get("IP_REPRES"),""));
                objRes.addProperty("ToAddr",m_C.getStringOrDefault(objTarget.get("IP_ADDR"),""));
                objRes.addProperty("ToBiz",m_C.getStringOrDefault(objTarget.get("IP_BUSTYPE"),""));
                objRes.addProperty("ToEvent",m_C.getStringOrDefault(objTarget.get("IP_INDTYPE"),""));
                objRes.addProperty("ToEmail_1",m_C.getStringOrDefault(objTarget.get("IP_EMAIL1"),""));
                objRes.addProperty("ToEmail_2",m_C.getStringOrDefault(objTarget.get("IP_EMAIL2"),""));
                objRes.addProperty("TrLicense",m_C.getStringOrDefault(objTarget.get("BP_ID"),""));
                objRes.addProperty("TrTaxCode",m_C.getStringOrDefault(objTarget.get("BP_MIN"),""));
                objRes.addProperty("TrTitle",m_C.getStringOrDefault(objTarget.get("BP_NAME"),""));
                objRes.addProperty("TrCEO",m_C.getStringOrDefault(objTarget.get("BP_REPRES"),""));
                objRes.addProperty("TrAddr",m_C.getStringOrDefault(objTarget.get("BP_ADDR"),""));
                objRes.addProperty("TrBiz",m_C.getStringOrDefault(objTarget.get("BP_BUSTYPE"),""));
                objRes.addProperty("TrEvent",m_C.getStringOrDefault(objTarget.get("BP_INDTYPE"),""));

                objRes.addProperty("Cabinet",m_C.getStringOrDefault(objTarget.get("ISSUE_DATE"),""));
                objRes.addProperty("Provision",m_C.getStringOrDefault(objTarget.get("CHARGETOTAL_TXT"),""));
                objRes.addProperty("Tax",m_C.getStringOrDefault(objTarget.get("TAXTOTAL_TXT"),""));
                objRes.addProperty("Note","");
                objRes.addProperty("Total",m_C.getStringOrDefault(objTarget.get("GRANDTOTAL_TXT"),""));
                objRes.addProperty("ModText","");

                objRes.addProperty("PurPose", m_C.getStringOrDefault(objTarget.get("PURP_TXT"),""));


                JsonArray sortedTaxItem = new JsonArray();
                for(int i = 0; i <arTaxItem.size(); i ++) {
                    JsonObject objData = arTaxItem.get(i).getAsJsonObject();
                    JsonObject objTaxItem = new JsonObject();

                    objTaxItem.addProperty("Name", m_C.getStringOrDefault(objData.get("GOOD_NAME"), ""));
                    objTaxItem.addProperty("Cnt", m_C.getStringOrDefault(objData.get("GOOD_QUAN"), ""));
                    objTaxItem.addProperty("Money", m_C.getStringOrDefault(objData.get("GOOD_UNIAMOUNT"), ""));
                    objTaxItem.addProperty("Invoice", m_C.getStringOrDefault(objData.get("GOOD_INVAMOUNT_TXT"), ""));
                    objTaxItem.addProperty("Tax", m_C.getStringOrDefault(objData.get("GOOD_TAXAMOUNT_TXT"), ""));
                    objTaxItem.addProperty("Memo", m_C.getStringOrDefault(objData.get("GOOD_DESC"), ""));

                    String date = m_C.getStringOrDefault(objData.get("GOOD_DATE"), "");
                    objTaxItem.addProperty("Date", date.replaceAll("-", ""));
                    sortedTaxItem.add(objTaxItem);
                }

                objRes.add("ITEM_LIST",sortedTaxItem);

            }
        }
        catch (Exception e) {
            logger.error("getTaxItem : Failed to get data.", e);

            return null;
        }
        return objRes;
    }
}
