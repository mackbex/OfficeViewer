package com.woonam.model;

import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;

import javax.servlet.http.HttpSession;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.woonam.connect.AgentConnect;
import com.woonam.constants.Queries;
import com.woonam.util.Common;
import com.woonam.util.Profile;
import com.woonam.wdms.PreparedStatement;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class SetModel {
	private AgentConnect m_AC 		= null;
	private Profile m_Profile				= null;
	private Common m_C				 	= null;
	private HttpSession session		= null;
	private Logger logger = null;
//	private PreparedStatement pStmt = null;
	
	public SetModel(AgentConnect AC, HttpSession session)
	{
		this.logger 	= LogManager.getLogger(SetModel.class);
		this.m_AC 		= AC;
		this.m_Profile 	= AC.getProfile();
		this.m_C 		= new Common();
		this.session 	= session;
//		this.pStmt		= new PreparedStatement(m_Profile);
	}
	
	public SetModel(AgentConnect AC)
	{
		this.logger 	= LogManager.getLogger(SetModel.class);
		this.m_AC 		= AC;
		this.m_Profile 	= AC.getProfile();
		this.m_C 		= new Common();
		this.session 	= null;
//		this.pStmt		= new PreparedStatement(m_Profile);
	}
	
	public boolean Update_cardStatus(String convertKey, String status) {
		boolean res = false;
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null)	return false;
			
    	try
    	{

			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.UPDATE_CARD_STATUS);
    		pStmt.setString(0, convertKey); 
        	pStmt.setString(1, status);
        	
    		String resQuery 	= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= resQuery.substring(0,1);
			int nResCnt			=  m_C.getResCnt(resQuery);
			if(nResCnt > 0) res = true;
			
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
//			bRes = false;
		}
    	
    	return res;
	}
	
	public boolean Update_reportStatus(String convertKey, String status) {
		boolean res = false;
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null)	return false;
			
    	try
    	{

			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.UPDATE_REPORT_STATUS);
    		pStmt.setString(0, convertKey); 
        	pStmt.setString(1, status);
        	
    		String resQuery 	= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= resQuery.substring(0,1);
			int nResCnt			=  m_C.getResCnt(resQuery);
			if(nResCnt > 0) res = true;
			
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
//			bRes = false;
		}
    	
    	return res;
	}

	public boolean addSlip(JsonArray alSlip, Map mapParams) {
		boolean res = false;
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null)	return false;

		try
		{
			String jdocNo = this.m_C.getParamValue(mapParams, "JDOC_NO", "");
			String corpNo		= m_C.getParamValue(session, "CORP_NO", null);
			String partNo		= m_C.getParamValue(session, "PART_NO", null);
			String userID		= m_C.getParamValue(session, "USER_ID", null);

			StringBuffer sbSdocNo = new StringBuffer();

			for(int i = 0; i < alSlip.size(); i++) {
				sbSdocNo.append(alSlip.get(i).getAsJsonObject().get("SDOC_NO").getAsString());

				if(i < alSlip.size() - 1) {
					sbSdocNo.append(",");
				}
			}


			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.UPDATE_JDOC);
			pStmt.setString(0, sbSdocNo.toString());
			pStmt.setString(1, jdocNo);
			pStmt.setString(2, corpNo);
			pStmt.setString(3, userID);

			String resQuery 	= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
			String resFlag		= resQuery.substring(0,1);
			int nResCnt			=  m_C.getResCnt(resQuery);
			if(nResCnt > 0) res = true;

		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
//			bRes = false;
		}

		return res;
	}

	public boolean copySdocNo(JsonArray alSlip, Map mapParams) {
		boolean res = true;
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null)	return false;

		try
		{

			String jdocNo = this.m_C.getParamValue(mapParams, "JDOC_NO", "");
			String corpNo		= m_C.getParamValue(session, "CORP_NO", null);
			String partNo		= m_C.getParamValue(session, "PART_NO", null);
			String userID		= m_C.getParamValue(session, "USER_ID", null);

			for(int i = 0; i < alSlip.size(); i++) {

				String originalSdocNo = alSlip.get(i).getAsJsonObject().get("SDOC_NO").getAsString();

				PreparedStatement pStmt = new PreparedStatement(m_Profile);
				pStmt.setQuery(Queries.COPY_SDOC_NO);
				pStmt.setString(0, originalSdocNo);
				pStmt.setString(1, m_C.getIRN("S"));
				pStmt.setString(2, "0");
				pStmt.setString(3, corpNo);
				pStmt.setString(4, userID);
				pStmt.setString(5, jdocNo);

				String resQuery 	= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
				String resFlag		= resQuery.substring(0,1);
				int nResCnt			=  m_C.getResCnt(resQuery);
				if(nResCnt <= 0) res = false;
				break;
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
//			bRes = false;
		}

		return res;
	}


	public boolean Update_urlStatus(String convertKey, String status, String msg) {
		boolean res = false;
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null)	return false;

		try
		{

			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.UPDATE_URL_STATUS);
			pStmt.setString(0, convertKey);
			pStmt.setString(1, status);
			pStmt.setString(2, msg);

			String resQuery 	= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
			String resFlag		= resQuery.substring(0,1);
			int nResCnt			=  m_C.getResCnt(resQuery);
			if(nResCnt > 0) res = true;

		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
//			bRes = false;
		}

		return res;
	}

	public boolean Update_taxStatus(String convertKey, String status) {
		boolean res = false;
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null)	return false;
			
    	try
    	{

			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.UPDATE_TAX_STATUS);
    		pStmt.setString(0, convertKey); 
        	pStmt.setString(1, status);
        	
    		String resQuery 	= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= resQuery.substring(0,1);
			int nResCnt			=  m_C.getResCnt(resQuery);
			if(nResCnt > 0) res = true;
			
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
//			bRes = false;
		}
    	
    	return res;
	}
	
	public boolean Update_orderStatus(String convertKey, String status) {
		boolean res = false;
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null)	return false;
			
    	try
    	{

			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.UPDATE_ORDER_STATUS);
    		pStmt.setString(0, convertKey); 
        	pStmt.setString(1, status);
        	
    		String resQuery 	= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= resQuery.substring(0,1);
			int nResCnt			=  m_C.getResCnt(resQuery);
			if(nResCnt > 0) res = true;
			
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
//			bRes = false;
		}
    	
    	return res;
	}
	
	public boolean Add_History(String sdocNo, String historyCode, String corpNo, String userId) {
		
		boolean res = false;
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null)	return false;
		
    	try
    	{

			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.HISTORY_ADD);
    		pStmt.setString(0, sdocNo);
        	pStmt.setString(1, "");
        	pStmt.setString(2, "");
        	pStmt.setString(3, historyCode);
        	pStmt.setString(4, corpNo);
        	pStmt.setString(5, userId); 
    	
    		String resQuery 	= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= resQuery.substring(0,1);
			int nResCnt			=  m_C.getResCnt(resQuery);
			if(nResCnt > 0) res = true;
			
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
//			bRes = false;
		}
    	
    	return res;
		
	}
	
public boolean Copy_Replace(String jdocNo, String sdocNo, String corpNo, String userId) {
		
		boolean res = false;
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null)	return false;
		
    	try
    	{

			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.COPY_REPLACE);
    		pStmt.setString(0, jdocNo);
        	pStmt.setString(1, sdocNo);
        	pStmt.setString(2, corpNo);
        	pStmt.setString(3, userId); 
    	
    		String resQuery 	= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= resQuery.substring(0,1);
			int nResCnt			=  m_C.getResCnt(resQuery);
			if(nResCnt > 0) res = true;
			
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
//			bRes = false;
		}
    	
    	return res;
		
	}
	
	public boolean Insert_SlipDocFromTemplate(String sdocNo, String corpNo, String partNo, String userID, String sdocKind, String sdocName, int slipCnt, String jdocNo, boolean isFollow, String unique) {
		boolean res = false;
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null)	return false;
		
    	try
    	{

			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.INSERT_SLIPDOC);
    		pStmt.setString(0, sdocNo); // SDOC_NO
        	pStmt.setString(1, corpNo); //CORP_NO
        	pStmt.setString(2, partNo); //PART_NO
        	pStmt.setString(3, userID+""); //REG_USER
        	pStmt.setString(4, m_C.getToday("yyyyMM")); //SDOC_MONTH
        	pStmt.setString(5, sdocKind); //SDOC_KIND
        	pStmt.setString(6, sdocName); //SDOC_NAME
        	pStmt.setString(7, slipCnt+""); //SLIP_CNT
        	pStmt.setString(8, jdocNo); //JDOC_NO
			pStmt.setString(9, isFollow ? "1" : "0");
			pStmt.setString(10, unique);

    		String resQuery 	= m_AC.SetData(pStmt.getQuery(), strFuncName);
    		String resFlag		= resQuery.substring(0,1);
			int nResCnt			=  m_C.getResCnt(resQuery);
			if(nResCnt > 0) res = true;
			
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
//			bRes = false;
		}
    	
    	return res;
	}

	public boolean addDocURL(Map mapParams, GetModel GM) {
		String strFuncName = (new Object() {}).getClass().getEnclosingMethod().getName();
		boolean bRes = true;
		if (this.m_AC == null)
			return false;
		try {
			String[] docInfo 	= this.m_C.getParamValue(mapParams, "DOC_INFO");
			String jdocNo 		= this.m_C.getParamValue(mapParams, "JDOC_NO", "");
			String corpNo		= m_C.getParamValue(session, "CORP_NO", null);
			String partNo		= m_C.getParamValue(session, "PART_NO", null);
			String userID		= m_C.getParamValue(session, "USER_ID", null);

			StringBuffer sbQuery = new StringBuffer();

//			int jdocIndex = Integer.parseInt(GM.getNextIndex(jdocNo));

//				m_

			for(int i = 0; i < docInfo.length; i ++) {

				sbQuery.setLength(0);

				JsonObject objDocInfo = (new JsonParser()).parse(docInfo[i]).getAsJsonObject();

				String sdocNo = m_C.getIRN("S");

				PreparedStatement pStmt = new PreparedStatement(m_Profile);
				pStmt.setQuery(Queries.INSERT_ADDFILE);
				pStmt.setString(0, sdocNo); // SDOC_NO
				pStmt.setString(1, corpNo); //CORP_NO
				pStmt.setString(2, partNo); //PART_NO
				pStmt.setString(3, userID+""); //REG_USER
				pStmt.setString(4, m_C.getToday("yyyyMM")); //SDOC_MONTH
				pStmt.setString(5, m_Profile.getString("INTERFACE", "RELATED_DOC_SDOCKIND", "")); //SDOC_KIND
				pStmt.setString(6, URLDecoder.decode(objDocInfo.get("TITLE").getAsString(),m_Profile.getString("AGENT_INFO", "CHARSET", ""))); //SDOC_NAME
				pStmt.setString(7, "1"); //SLIP_CNT
				pStmt.setString(8, jdocNo); //JDOC_NO
				pStmt.setString(9, GM.getNextIndex(jdocNo)); //JDOC_INDEX
				pStmt.setString(10, "0");
				pStmt.setString(11, objDocInfo.get("URL").getAsString());

				sbQuery.append(pStmt.getQuery());
				sbQuery.append(";=");

				PreparedStatement orgStmt = new PreparedStatement(m_Profile);
				orgStmt.setQuery(Queries.INSERT_ORGFILE);
				orgStmt.setString(0, m_C.getIRN("")); // ORG_IRN
				orgStmt.setString(1, "ORG"); // FOLDER
				orgStmt.setString(2, sdocNo); // SDOC_NO
				orgStmt.setString(3, m_C.getIRN("")); // DOC_IRN
				orgStmt.setString(4, objDocInfo.get("URL").getAsString()); // ORG_FILE
				orgStmt.setString(5, "1"); // ORG_URL
				orgStmt.setString(6, "0"); // FILE_SIZE
				orgStmt.setString(7, "10"); // ORG_FLAG
				orgStmt.setString(8, ""); // FILE_HASH


				sbQuery.append(orgStmt.getQuery());
//				if(i < docInfo.length -1) {
//					sbQuery.append(";=");
//				}

				String res = this.m_AC.SetData(sbQuery.toString(), strFuncName);
//				String resFlag = res.substring(0, 1);
				int nResCnt = this.m_C.getResCnt(res);
				if (nResCnt <= 0) {
					bRes = false;
					break;
				}
			}

//			String res = this.m_AC.SetData(sbQuery.toString(), strFuncName);
//			String resFlag = res.substring(0, 1);
//			int nResCnt = this.m_C.getResCnt(res);
//			if (nResCnt > 0)
//				bRes = true;
		} catch (Exception e) {
			this.logger.error(strFuncName, e);
			bRes = false;
		}
		return bRes;

	}

	public boolean removeAfter(Map mapParams) {
		String strFuncName = (new Object() {}).getClass().getEnclosingMethod().getName();
		boolean bRes = false;
		if (this.m_AC == null)
			return bRes;
		try {
			String key = this.m_C.getParamValue(mapParams, "VALUE", "");
			String corpNo = this.m_C.getParamValue(mapParams, "CORP_NO", "");
			String userID = this.m_C.getParamValue(mapParams, "USER_ID", "");
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.REMOVE_AFTER);
			pStmt.setString(0, key);
			pStmt.setString(1, corpNo);
			pStmt.setString(2, userID);
			String res = this.m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
			String resFlag = res.substring(0, 1);
			int nResCnt = this.m_C.getResCnt(res);
			if (nResCnt > 0)
				bRes = true;
		} catch (Exception e) {
			this.logger.error(strFuncName, e);
			bRes = false;
		}
		return bRes;
	}

	public boolean moveIndex(Map mapParams, String direction) {
		String strFuncName = (new Object() {}).getClass().getEnclosingMethod().getName();
		boolean bRes = false;
		if (this.m_AC == null)
			return bRes;
		try {
			String sdocNo = this.m_C.getParamValue(mapParams, "SDOC_NO", "");
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.MOVE_INDEX);
			pStmt.setString(0, sdocNo);
			pStmt.setString(1, direction);

			m_AC.GetProcedure(pStmt.getQuery(), strFuncName);
			String res = null;
			while(m_AC.next()) {
				res = m_AC.GetString("RESULT");
			}

			if("T".equalsIgnoreCase(res)) {
				bRes = true;
			}

		} catch (Exception e) {
			this.logger.error(strFuncName, e);
			bRes = false;
		}
		return bRes;
	}

	public boolean removeAfterAll(Map mapParams) {
		String strFuncName = (new Object() {

		}).getClass().getEnclosingMethod().getName();
		boolean bRes = false;
		if (this.m_AC == null)
			return bRes;
		try {
			String key = this.m_C.getParamValue(mapParams, "VALUE", "");
			String corpNo = this.m_C.getParamValue(mapParams, "CORP_NO", "");
			String userID = this.m_C.getParamValue(mapParams, "USER_ID", "");
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.REMOVE_AFTER_ALL);
			pStmt.setString(0, key);
			pStmt.setString(1, corpNo);
			pStmt.setString(2, userID);
			String res = this.m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
			String resFlag = res.substring(0, 1);
			int nResCnt = this.m_C.getResCnt(res);
			if (nResCnt > 0)
				bRes = true;
		} catch (Exception e) {
			this.logger.error(strFuncName, e);
			bRes = false;
		}
		return bRes;
	}
	
	public boolean Insert_SlipFromTemplate(JsonObject obj_data, String sdocNo, int slipNo)
	{
		boolean res = false;
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null)	return false;
		
		int width 		= obj_data.get("WIDTH").getAsInt();
		int height 		= obj_data.get("HEIGHT").getAsInt();
		int size 			= obj_data.get("SIZE").getAsInt();
		String path 		= obj_data.get("PATH").getAsString();
		String docIRN 	= obj_data.get("DOC_IRN").getAsString();
		String name 	= obj_data.get("NAME").getAsString();
		
		width = m_C.pixel2pt(width, Integer.parseInt(m_Profile.getString("WAS_INFO", "IMG_DPI", "200")));
		height = m_C.pixel2pt(height, Integer.parseInt(m_Profile.getString("WAS_INFO", "IMG_DPI", "200")));
		
    	try
    	{

			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.INSERT_SLIP);
    		pStmt.setString(0, m_C.getIRN("")); // SLIP_IRN
        	pStmt.setString(1, docIRN); //DOC_IRN
        	pStmt.setString(2, sdocNo); //SDOC_NO
        	pStmt.setString(3, slipNo+""); //SLIP_NO
        	pStmt.setString(4, size+""); //FILE_SIZE
        	pStmt.setString(5, name); //SLIP_TITLE
        	pStmt.setString(6, "1"); //SLIP_STEP
        	pStmt.setString(7, "1"); //SLIP_FLAG
        	pStmt.setString(8, "0,0,"+width+","+height); //SLIP_RECT
        	pStmt.setString(9, "0"); //SLIP_ROTATE
    	
    		String resQuery 	= m_AC.SetData(pStmt.getQuery(), strFuncName);
    		String resFlag		= resQuery.substring(0,1);
			int nResCnt			=  m_C.getResCnt(resQuery);
			if(nResCnt > 0) res = true;
			
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
//			bRes = false;
		}
    	
    	return res;
	}
	
	public int Change_JDocNo(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		int nResCnt	 = -1;
		if (m_AC == null)	return nResCnt;
		
	//	String strLang				= m_C.getParamValue(mapParams, "LANG", "ko");
		String from		= m_C.getParamValue(mapParams, "FROM", null);
		String to			= m_C.getParamValue(mapParams, "TO", null);
		String userID 	= m_C.getParamValue(mapParams, "USER_ID", null);
		String coCD 	= m_C.getParamValue(mapParams, "CORP_NO", null);
		
    	try
    	{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.CHANGE_KEY);
    		pStmt.setString(0, from);
        	pStmt.setString(1, to);
        	pStmt.setString(2, coCD);
        	pStmt.setString(3, userID);
    	
    		String res 			= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= res.substring(0,1);
			nResCnt			=  m_C.getResCnt(res);
			
//			if(nResCnt > 0)
//			{
//				bRes = true;
//			}
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
//			bRes = false;
		}
    	
    	return nResCnt;
	}
	
	public boolean removeComment(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		boolean bRes = false;
		if (m_AC == null)	return bRes;
		
	//	String strLang				= m_C.getParamValue(mapParams, "LANG", "ko");
		String jdocNo		= m_C.getParamValue(mapParams, "KEY", null);
		String comtIRN		= m_C.getParamValue(mapParams, "COMT_IRN", null);
		String corpNo		= m_C.getParamValue(session, "CORP_NO", null);
		String partNo		= m_C.getParamValue(session, "PART_NO", null);
		String userID		= m_C.getParamValue(session, "USER_ID", null);
		
    	try
    	{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.REMOVE_COMMENT);
    		pStmt.setString(0, jdocNo);
    		pStmt.setString(1, comtIRN);
    		pStmt.setString(2, corpNo);
    		pStmt.setString(3, userID);
    	
    		String res 			= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= res.substring(0,1);
			int nResCnt			=  m_C.getResCnt(res);
			
			if(nResCnt > 0)
			{
				bRes = true;
			}
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
			bRes = false;
		}
    	
    	return bRes;
	}
	
	public boolean modifyComment(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		boolean bRes = false;
		if (m_AC == null)	return bRes;
		
	//	String strLang				= m_C.getParamValue(mapParams, "LANG", "ko");
		String jdocNo		= m_C.getParamValue(mapParams, "KEY", null);
		String title			= m_C.getParamValue(mapParams, "TITLE", null);
		String content		= m_C.getParamValue(mapParams, "CONTENT", null);
		String comtIRN		= m_C.getParamValue(mapParams, "COMT_IRN", null);
		String userID		= m_C.getParamValue(session, "USER_ID", null);
		
    	try
    	{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.MODIFY_COMMENT);
    		pStmt.setString(0, title);
    		pStmt.setString(1, content);
    		pStmt.setString(2, comtIRN);
    		pStmt.setString(3, jdocNo);
    		pStmt.setString(4, userID);
    		pStmt.setDBDate(5);
    	
    		String res 			= m_AC.SetData(pStmt.getQuery(), strFuncName);
    		String resFlag		= res.substring(0,1);
			int nResCnt			=  m_C.getResCnt(res);
			
			if(nResCnt > 0)
			{
				bRes = true;
			}
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
			bRes = false;
		}
    	
    	return bRes;
	}


	public boolean updateCoCardAppr(Map<String, Object> mapParams) {
		boolean res = false;
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		if (m_AC == null)	return false;

		try
		{
			String sdocNo		= m_C.getParamValue(mapParams, "SDOC_NO", "");
			String apprNo		= m_C.getParamValue(mapParams, "APPR_CARD", "");



			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.UPDATE_COCARD_APPR);
			pStmt.setString(0, apprNo);
			pStmt.setString(1, sdocNo);

			String resQuery 	= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
			String resFlag		= resQuery.substring(0,1);
			int nResCnt			=  m_C.getResCnt(resQuery);
			if(nResCnt > 0) res = true;

		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
			res = false;
		}

		return res;
	}
	
	public boolean Remove_byKind(Map<String, Object> mapParams) {
		
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		boolean bRes = false;
		if (m_AC == null)	return bRes;

		String key		= m_C.getParamValue(mapParams, "KEY", "");
		String isSystem		= m_C.getParamValue(mapParams, "IS_SYSTEM", "0");
		String kind		= m_C.getParamValue(mapParams, "KIND", "");
		String except[]		= m_C.getParamValue(mapParams, "EXCEPT");
		
		try
    	{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.REMOVE_BY_KIND);
    		pStmt.setString(0, key);
    		pStmt.setString(1, isSystem);
    		pStmt.setString(2, kind);
    		if(except == null || except.length <= 0) {
    			pStmt.setNull(3);
    		}
    		else {
    			pStmt.setProcArray(3, new ArrayList<Object>(Arrays.asList(except)));
    		}
    		
    		String res 			= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= res.substring(0,1);
			int nResCnt			=  m_C.getResCnt(res);
			
			if(nResCnt > 0)
			{
				bRes = true;
			}
    	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
			bRes = false;
		}
    	
    	return bRes;
	
	}

	public boolean removeReceipt(Map<String, Object> mapParams) {

		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		boolean bRes = false;
		if (m_AC == null)	return bRes;

		String key			= m_C.getParamValue(mapParams, "KEY", "");
		String kind			= m_C.getParamValue(mapParams, "SDOC_KIND", "");
		String receiptKey	= m_C.getParamValue(mapParams, "RECEIPT_KEY", "");
		String userID 	= m_C.getParamValue(mapParams, "USER_ID", null);
		String coCD 	= m_C.getParamValue(mapParams, "CORP_NO", null);

		try
		{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.REMOVE_RECEIPT);
			pStmt.setString(0, key);
			pStmt.setString(1, receiptKey);
			pStmt.setString(2, kind);
			pStmt.setString(3, coCD);
			pStmt.setString(4, userID);



			String res 			= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
			String resFlag		= res.substring(0,1);
			int nResCnt			=  m_C.getResCnt(res);

			if(nResCnt > 0)
			{
				bRes = true;
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
			bRes = false;
		}

		return bRes;

	}
	
	public boolean removeAll(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		boolean bRes = false;
		if (m_AC == null)	return bRes;

		try
    	{
			String strLang		= m_C.getParamValue(mapParams, "LANG", "ko");
			String key		= m_C.getParamValue(mapParams, "VALUE", "");
			String keyType		= m_C.getParamValue(mapParams, "FIELD", "JDOC_NO");
			String corpNo		= m_C.getParamValue(mapParams, "CORP_NO", "");
			String userID		= m_C.getParamValue(mapParams, "USER_ID", "");


			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.REMOVE_ALL);
    		pStmt.setString(0, key);
    		pStmt.setString(1, corpNo);
    		pStmt.setString(2, userID);
    		
    		String res 			= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= res.substring(0,1);
			int nResCnt			=  m_C.getResCnt(res);
			
			if(nResCnt > 0)
			{
				bRes = true;
			}
    	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
			bRes = false;
		}
    	
    	return bRes;
	}
	
	public boolean Change_Step(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		boolean bRes = false;
		if (m_AC == null)	return bRes;

		String strLang		= m_C.getParamValue(mapParams, "LANG", "ko");
		String key		= m_C.getParamValue(mapParams, "KEY", "");
		String step		= m_C.getParamValue(mapParams, "STEP", "");
		String corpNo		= m_C.getParamValue(mapParams, "CORP_NO", null);
		String userID		= m_C.getParamValue(mapParams, "USER_ID", null);
		
		try
    	{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.CHANGE_STEP);
    		pStmt.setString(0, key);
    		pStmt.setString(1, step);
    		
    		String res 			= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= res.substring(0,1);
			int nResCnt			=  m_C.getResCnt(res);
			
			if(nResCnt > 0)
			{
				bRes = true;
			}
    	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
			bRes = false;
		}
    	
    	return bRes;
	}
	

	public boolean Unmapping_Card(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		boolean nRes = false;
		if (m_AC == null)	return false;

		String[] key			= m_C.getParamValue(mapParams, "KEY");
		String[] appr_no		= m_C.getParamValue(mapParams, "APPR_NO");
		String user_id		= m_C.getParamValue(mapParams, "USER_ID", "");
		String corp_no		= m_C.getParamValue(mapParams, "CORP_NO", "");

		try
		{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.UNMAPPING_CARD);

			pStmt.setArray(0, new ArrayList<Object>(Arrays.asList(key)));
			pStmt.setArray(1, new ArrayList<Object>(Arrays.asList(appr_no)));
			pStmt.setString(2, corp_no);
			pStmt.setString(3, user_id);

			String res 			= m_AC.SetData(pStmt.getQuery(), strFuncName);
			String resFlag		= res.substring(0,1);
			int nResCnt			=  m_C.getResCnt(res);

			if(nResCnt > 0)
			{
				nRes = true;
			}
		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
			nRes = false;
		}

		return nRes;
	}
	public boolean Rotate_Slip(Map<String, Object> mapParams) {
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		boolean bRes = false;
		if (m_AC == null)	return bRes;

		String degree		= m_C.getParamValue(mapParams, "DEGREE", "");
		String field			= m_C.getParamValue(mapParams, "FIELD", "");
		String value			= m_C.getParamValue(mapParams, "VALUE", "");
		String corpNo		= m_C.getParamValue(session, "CORP_NO", null);
		String userID		= m_C.getParamValue(session, "USER_ID", null);
		
		try
    	{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.ROTATE_SLIP);
    		pStmt.setString(0, field);
    		pStmt.setString(1, value);
    		pStmt.setString(2, degree);
    		
    		
    		String res 			= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= res.substring(0,1);
			int nResCnt			=  m_C.getResCnt(res);
			
			if(nResCnt > 0)
			{
				bRes = true;
			}
    	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
			bRes = false;
		}
    	
    	return bRes;
	}
	
	public int removeSlip(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		int nRes = 0;
		if (m_AC == null)	return nRes;

		String strLang		= m_C.getParamValue(mapParams, "LANG", "ko");
		String field			= m_C.getParamValue(mapParams, "FIELD", "");
		String[] value		= m_C.getParamValue(mapParams, "VALUE");
		String corpNo		= m_C.getParamValue(session, "CORP_NO", null);
		String userID		= m_C.getParamValue(session, "USER_ID", null);
		
		try
    	{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.REMOVE_SLIP);
    		pStmt.setProcArray(0, new ArrayList<Object>(Arrays.asList(value)));
    		pStmt.setString(1, field);
    		pStmt.setString(2, corpNo);
    		pStmt.setString(3, userID);
    		
    		String res 			= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= res.substring(0,1);
			int nResCnt			=  m_C.getResCnt(res);
			
			//if(nResCnt > 0)
			{
				nRes = nResCnt;
			}
    	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
			nRes = -1;
		}
    	
    	return nRes;
	}
	
	public int removeAttach(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		int nRes = -1;
		if (m_AC == null)	return nRes;

		String strLang		= m_C.getParamValue(mapParams, "LANG", "ko");
		String field			= m_C.getParamValue(mapParams, "FIELD", "");
		String[] value		= m_C.getParamValue(mapParams, "VALUE");
		String corpNo		= m_C.getParamValue(session, "CORP_NO", null);
		String userID		= m_C.getParamValue(session, "USER_ID", null);
		
		try
    	{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.REMOVE_ATTACH);
    		pStmt.setProcArray(0, new ArrayList<Object>(Arrays.asList(value)));
    		pStmt.setString(1, field);
    		pStmt.setString(2, corpNo);
    		pStmt.setString(3, userID);
    		
    		String res 			= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= res.substring(0,1);
			int nResCnt			=  m_C.getResCnt(res);
			
			//if(nResCnt > 0)
			{
				nRes = nResCnt;
			}
    	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
			nRes = -1;
		}
    	
    	return nRes;
	}
	
	public boolean writeComment(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		boolean bRes = false;
		if (m_AC == null)	return bRes;
		
	//	String strLang				= m_C.getParamValue(mapParams, "LANG", "ko");
		String jdocNo		= m_C.getParamValue(mapParams, "KEY", null);
		String title			= m_C.getParamValue(mapParams, "TITLE", null);
		String content		= m_C.getParamValue(mapParams, "CONTENT", null);
		String corpNo		= m_C.getParamValue(session, "CORP_NO", null);
		String partNo		= m_C.getParamValue(session, "PART_NO", null);
		String userID		= m_C.getParamValue(session, "USER_ID", null);
		
    	try
    	{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.WRITE_COMMENT);
    		pStmt.setString(0, m_C.getIRN("C"));
    		pStmt.setString(1, jdocNo);
    		pStmt.setString(2, corpNo);
    		pStmt.setString(3, partNo);
    		pStmt.setString(4, userID);
    		pStmt.setString(5, title);
    		pStmt.setString(6, content);
    		pStmt.setString(7, "1");
			pStmt.setDBDate(8);
			pStmt.setDBDate(9);
    	
    		String res 			= m_AC.SetData(pStmt.getQuery(), strFuncName);
    		String resFlag		= res.substring(0,1);
			int nResCnt			=  m_C.getResCnt(res);
			
			if(nResCnt > 0)
			{
				bRes = true;
			}
	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
			bRes = false;
		}
    	
    	return bRes;
	}
	
	public int Copy_SlipDoc(Map<String, Object> mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		int nResCnt	 = -1;
		if (m_AC == null)	return nResCnt;
		
		String from			= m_C.getParamValue(mapParams, "FROM", "");
		String to				= m_C.getParamValue(mapParams, "TO", "");
		String userID 		= m_C.getParamValue(mapParams, "USER_ID", null);
		String corpNo		= m_C.getParamValue(mapParams, "CORP_NO", null);
		String flag		= m_C.getParamValue(mapParams, "FLAG", null);

		try
    	{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.COPY_SLIP);
    		pStmt.setString(0, from);
        	pStmt.setString(1, to);
        	pStmt.setString(2, corpNo);
			pStmt.setString(3, userID);
			pStmt.setString(4, flag);
    	
    		String res 			= m_AC.SetProcedure(pStmt.getQuery(), strFuncName);
    		String resFlag		= res.substring(0,1);
			nResCnt			=  m_C.getResCnt(res);

	   	}
    	catch(Exception e)
		{
			logger.error(strFuncName, e);
		}
    	
    	return nResCnt;
	}


	public boolean addBookmark(Map mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		boolean res	 = false;
		if (m_AC == null)	return false;

		try
		{
			String corpNo		= m_C.getParamValue(session, "CORP_NO", null);
			String partNo		= m_C.getParamValue(session, "PART_NO", null);
			String userID		= m_C.getParamValue(session, "USER_ID", null);

			String comment 		= this.m_C.getParamValue(mapParams, "MARK_COMMENT", "");
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.ADD_BOOKMARK);

			pStmt.setString(0, this.m_C.getParamValue(mapParams, "MARK_IRN", ""));
			pStmt.setString(1, this.m_C.getParamValue(mapParams, "DEVICE", ""));
			pStmt.setString(2, this.m_C.getParamValue(mapParams, "SDOC_NO", ""));
			pStmt.setString(3, this.m_C.getParamValue(mapParams, "SLIP_IRN", ""));
			pStmt.setString(4, this.m_C.getParamValue(mapParams, "MARK_TYPE", ""));
			pStmt.setString(5, ""); //MARK_STYLE
			pStmt.setString(6, this.m_C.getParamValue(mapParams, "MARK_RECT", ""));
			pStmt.setString(7, this.m_C.getParamValue(mapParams, "MARK_LINEWIDTH", ""));
			pStmt.setString(8, this.m_C.getParamValue(mapParams, "MARK_LINECOLOR", ""));
			pStmt.setString(9, this.m_C.getParamValue(mapParams, "MARK_BACKCOLOR", ""));
			pStmt.setString(10, this.m_C.getParamValue(mapParams, "MARK_ALPHA", ""));
			pStmt.setString(11, URLDecoder.decode(comment, m_Profile.getString("AGENT_INFO","CHARSET","UTF-8")));
			pStmt.setString(12, this.m_C.getParamValue(mapParams, "MARK_TEXTCOLOR", ""));
			pStmt.setString(13, this.m_C.getParamValue(mapParams, "MARK_FONTNAME", ""));
			pStmt.setString(14, this.m_C.getParamValue(mapParams, "MARK_FONTSIZE", ""));
			pStmt.setString(15, this.m_C.getParamValue(mapParams, "MARK_BACKGROUND", ""));
			pStmt.setString(16, "");
			pStmt.setString(17, "");
			pStmt.setString(18, corpNo);
			pStmt.setString(19, userID);

			String queryRes 	= m_AC.SetData(pStmt.getQuery(), strFuncName);
			String resFlag		= queryRes.substring(0,1);
			res					= m_C.getResCnt(queryRes) > 0;

		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}

		return res;
	}

	public boolean removeBookmark(Map mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		boolean res	 = false;
		if (m_AC == null)	return false;

		try
		{
			String corpNo		= m_C.getParamValue(session, "CORP_NO", null);
			String partNo		= m_C.getParamValue(session, "PART_NO", null);
			String userID		= m_C.getParamValue(session, "USER_ID", null);

//			String comment 		= this.m_C.getParamValue(mapParams, "MARK_COMMENT", "");
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.REMOVE_BOOKMARK);

			pStmt.setString(0, this.m_C.getParamValue(mapParams, "MARK_IRN", ""));
			pStmt.setString(1, corpNo);
			pStmt.setString(2, userID);

			String queryRes 	= m_AC.SetData(pStmt.getQuery(), strFuncName);
			String resFlag		= queryRes.substring(0,1);
			res					= m_C.getResCnt(queryRes) > 0;

		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}

		return res;
	}

	public boolean modifyBookmark(Map mapParams)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		boolean res	 = false;
		if (m_AC == null)	return false;

		try
		{
			String corpNo		= m_C.getParamValue(session, "CORP_NO", null);
			String partNo		= m_C.getParamValue(session, "PART_NO", null);
			String userID		= m_C.getParamValue(session, "USER_ID", null);

//			String comment 		= this.m_C.getParamValue(mapParams, "MARK_COMMENT", "");
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.MODIFY_BOOKMARK);

			pStmt.setString(0, this.m_C.getParamValue(mapParams, "MARK_IRN", ""));
			pStmt.setString(1, this.m_C.getParamValue(mapParams, "FIELD", ""));
			pStmt.setString(2, this.m_C.getParamValue(mapParams, "VALUE", ""));
			pStmt.setString(3, corpNo);
			pStmt.setString(4, userID);

			String queryRes 	= m_AC.SetData(pStmt.getQuery(), strFuncName);
			String resFlag		= queryRes.substring(0,1);
			res					= m_C.getResCnt(queryRes) > 0;

		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}

		return res;
	}

	public int addBookmarkCard(JsonObject userInfo, JsonObject slipInfo)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		int nResCnt	 = -1;
		if (m_AC == null)	return nResCnt;

		try
		{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.ADD_BOOKMARK_FOR_CARD);

			String position = m_Profile.getString("INTERFACE","CARD_BOOKMARK_POSITION","785,4023,2821,4571");


			pStmt.setString(0, m_C.getIRN(""));
			pStmt.setString(1, slipInfo.get("SDOC_NO").getAsString());
			pStmt.setString(2, slipInfo.get("SLIP_IRN").getAsString());
			pStmt.setString(3, position);
			pStmt.setString(4, userInfo.get("USER_NM").getAsString());
			pStmt.setString(5, userInfo.get("CORP_NO").getAsString());
			pStmt.setString(6, userInfo.get("USER_ID").getAsString());

			String res 			= m_AC.SetData(pStmt.getQuery(), strFuncName);
			String resFlag		= res.substring(0,1);
			nResCnt			=  m_C.getResCnt(res);

		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}

		return nResCnt;
	}

	public int addBookmarkCash(JsonObject userInfo, JsonObject slipInfo)
	{
		String strFuncName 	= new Object(){}.getClass().getEnclosingMethod().getName();
		int nResCnt	 = -1;
		if (m_AC == null)	return nResCnt;

		try
		{
			PreparedStatement pStmt = new PreparedStatement(m_Profile);
			pStmt.setQuery(Queries.ADD_BOOKMARK_FOR_CASH);

			String position = m_Profile.getString("INTERFACE","CASH_BOOKMARK_POSITION","163,1573,828,1793");


			pStmt.setString(0, m_C.getIRN(""));
			pStmt.setString(1, slipInfo.get("SDOC_NO").getAsString());
			pStmt.setString(2, slipInfo.get("SLIP_IRN").getAsString());
			pStmt.setString(3, position);
			pStmt.setString(4, userInfo.get("USER_NM").getAsString());
			pStmt.setString(5, userInfo.get("CORP_NO").getAsString());
			pStmt.setString(6, userInfo.get("USER_ID").getAsString());

			String res 			= m_AC.SetData(pStmt.getQuery(), strFuncName);
			String resFlag		= res.substring(0,1);
			nResCnt			=  m_C.getResCnt(res);

		}
		catch(Exception e)
		{
			logger.error(strFuncName, e);
		}

		return nResCnt;
	}
}
