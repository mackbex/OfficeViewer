package com.woonam.connect;

import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.io.UnsupportedEncodingException;
import java.text.DecimalFormat;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jdom.Document;
import org.jdom.Element;
import org.jdom.input.SAXBuilder;

import com.google.gson.JsonObject;
import com.woonam.util.Common;
import com.woonam.util.Profile;

public class AgentConnect 
{
	private String strServerKey;
	private String strServerIp;
	private int 	nServerPort;
	private String strCharSet;
	
	private String[][] 	arrNodeList;
	private	int				arrNodeListLen 	= 0;
	private	int				CurLen				= 0;
	
	private Profile m_Profile	=	null; 
	private Common C = new Common();
	private Logger logger = null;

	public AgentConnect(Profile profile)
	{
		this.m_Profile	= profile;

		this.logger = LogManager.getLogger(AgentConnect.class);
		String strSvrMode		=	m_Profile.getString("AGENT_INFO", "SERVER", "");
		this.strServerKey 	= 	m_Profile.getString(strSvrMode, "KEY", "");
		this.strServerIp		=	m_Profile.getString(strSvrMode, "IP", "");
		this.nServerPort		=	Integer.parseInt(m_Profile.getString(strSvrMode, "PORT", ""));
		this.strCharSet		=	m_Profile.getString("AGENT_INFO", "CHARSET", "EUC-KR");
		
	}
	
	public Profile getProfile()
	{
		return m_Profile;
	}
	
	public boolean next()
	{	
		if(CurLen < arrNodeListLen)
		{
			CurLen++;
			return true;
		}
		else
		{
			Destroy();
			return false;
		}
	}

	private void Destroy()
	{
		arrNodeList			= null;
		arrNodeListLen 	= 0;
		CurLen				= 0;
	}
	
	public int size()
	{
		return arrNodeListLen;
	}
	
	public String[] Get_CurItem() {
		return arrNodeList[CurLen-1];
	}

	public JsonObject Get_itemObj(JsonObject target,int index) {

		if(target == null) target = new JsonObject();

		String[] ar_Item = arrNodeList[index];

		for(int i = 0; i < ar_Item.length; i++) {

			String strItem   =   ar_Item[i];
			int nParamIdx   =   strItem.indexOf("=");
			String key = null;
			String val = null;
			if(nParamIdx == -1) {
				key = strItem;
				val = "";
			}
			else {
				key   = strItem.substring(0, nParamIdx);
				val   = strItem.substring(nParamIdx+1);
			}

			target.addProperty(key, val);
		}

//		for(int i = 0; i < ar_Item.length; i++) {
//
//			String[] item = ar_Item[i].split("=");
//			String key = item[0];
//			String val = null; try { val = item[1]; }catch(Exception e) { val = "";}
//			target.addProperty(key, val);
//		}

		return target;
	}
	
	public int Get_CurIndex() {
		return CurLen - 1;
	}
	
	public String GetString(String strColumn)
	{
		String strRet 	= "";
		String strFlag 	= "E";
		try
		{
			for(int i = 0;i < arrNodeList[0].length;i++)
			{	
				if(arrNodeList[CurLen-1][i].substring(0,arrNodeList[CurLen-1][i].indexOf("=")).equalsIgnoreCase(strColumn))
				{
					strRet 	= arrNodeList[CurLen-1][i].substring(arrNodeList[CurLen-1][i].indexOf("=")+1, arrNodeList[CurLen-1][i].length());
					strFlag	= "F";	
				}
			}
			
			if(strFlag.equals("E"))
			{
				return "Can`t find column (" +  strColumn + ")";
			}
			else
			{
				byte[] b = strRet.getBytes();
				byte[] b1 = strRet.getBytes("ISO8859_1");
				byte[] b2 = strRet.getBytes("EUC_KR");
				byte[] b3 = strRet.getBytes("UTF-8");
				
				return strRet;
				
				//return m_WC.ConvertSpecialChar(strRet);
			}
		}
		catch(Exception e)
		{
			return null;
		}
	}

	public void GetProcedure(String strQuery, String strFuncName)
	{
		String strTemp = strServerKey + "                                                                                                                                                           ";
		strTemp = strTemp.substring(0,32);

		logger.info("------------------------------GetProcedure query--------------------------------\n- Func Name : "+strFuncName+"\n- Query : "+strQuery+"\n", 6);

		int Querylength   =   0;
		try {
			Querylength = strQuery.getBytes(strCharSet).length;
		} catch (UnsupportedEncodingException e) {
			logger.error("GetProcedure Exception", e);
		}//Cm.Getlength(strQuery);

		String flag = "NS";

		if(!"ORACLE".equalsIgnoreCase(m_Profile.getString("AGENT_INFO","DB","MSSQL"))) {
			flag = "S";
		}

		StringBuffer buff = new StringBuffer()
				.append( flag)
				.append( strTemp )
				.append((new DecimalFormat("000000000000")).format(Querylength))
				.append(strQuery);

		SocketConnect skc = new SocketConnect();
		String strResult = skc.request(strServerIp, nServerPort,  buff.toString(),strCharSet, strCharSet);

		logger.info("Result : "+strResult);

		AgentParser AG    	= new AgentParser(strResult);
		arrNodeList         =     AG.GetSelectList("//ListData/Row");
		arrNodeListLen      =   arrNodeList.length;
	}

	public String SetProcedure(String strQuery, String strFuncName)
	{
		String strRet       = "";
		char   retFlag;
		String strTemp    = strServerKey + "                                                                                                                                                           ";
		strTemp             = strTemp.substring(0,32);

		logger.info("------------------------------SetProcedure query--------------------------------\n- Func Name : "+strFuncName+"\n- Query : "+strQuery+"\n", 6);

		int Querylength   =   0;
		try {
			Querylength = strQuery.getBytes(strCharSet).length;
		} catch (UnsupportedEncodingException e) {
			logger.error("SetProcedure Exception", e);
		}//Cm.Getlength(strQuery);

		String flag = "NQ";

		if(!"ORACLE".equalsIgnoreCase(m_Profile.getString("AGENT_INFO","DB","MSSQL"))) {
			flag = "Q";
		}

		StringBuffer buff = new StringBuffer()
				.append( flag )
				.append( strTemp )
				.append((new DecimalFormat("000000000000")).format(Querylength))
				.append(strQuery);

		SocketConnect skc = new SocketConnect();
		String strResult = skc.request(strServerIp, nServerPort,  buff.toString(),"full", strCharSet);
		AgentParser AG = new AgentParser(strResult.substring(14,strResult.length()));
		logger.info("Result : "+strResult);
		retFlag = strResult.charAt(1);

		if(retFlag == 'T')
		{
			strRet = "T" + AG.getNodeList("//Return/Query/Message");
		}
		else
		{
			strRet = "F" + AG.getNodeList("//Return/Query/SQLException");
		}
		return strRet;
	}

	public void GetData(String strQuery, String strFuncName)
	{
		String strTemp = strServerKey + "                                                                                                                                                           ";
		strTemp = strTemp.substring(0,32);

		logger.info("------------------------------GetData query--------------------------------\n- Func Name : "+strFuncName+"\n- Query : "+strQuery+"\n", 6);
		
		int Querylength	=	0;
		try {
			Querylength = strQuery.getBytes(strCharSet).length;
		} catch (UnsupportedEncodingException e) {
			logger.error("GetData Exception", e);
		}//Cm.Getlength(strQuery);
		
		StringBuffer buff = new StringBuffer()
	    .append( "S" )
	    .append( strTemp )
	    .append((new DecimalFormat("000000000000")).format(Querylength))
	    .append(strQuery);
		
		SocketConnect skc = new SocketConnect();
    	String strResult = skc.request(strServerIp, nServerPort,  buff.toString(),"", strCharSet);
    	
//    	< (less-than sign) &lt; 
//    	> (greater-than sign) &gt; 
//    	& (ampersand) &amp; 
    	logger.info("Result : "+strResult);
    	strResult	=	strResult.replaceAll("&", "&amp;");

    	strResult	=	strResult.replaceAll("'", "&apos;");
    	strResult	=	strResult.replaceAll("\"", "&quot;");
    	AgentParser AG 	= new AgentParser(strResult);
		arrNodeList 			=  	AG.GetSelectList("//ListData/Row");
		arrNodeListLen			=	arrNodeList.length;
	}

	public String SetData(String strQuery, String strFuncName)
	{
		String strRet 		= "";
		char	retFlag;
		String strTemp 	= strServerKey + "                                                                                                                                                           ";
		strTemp 				= strTemp.substring(0,32);
					
		//int Querylength = Cm.Getlength(strQuery);
		logger.info("------------------------------SetData query--------------------------------\n- Func Name : "+strFuncName+"\n- Query : "+strQuery+"\n");
		
		int Querylength	=	0;
		try {
			Querylength = strQuery.getBytes(strCharSet).length;
		} catch (UnsupportedEncodingException e) {
			// TODO Auto-generated catch block
		logger.error("SetData Exception", e);
		}//Cm.Getlength(strQuery);
		
		StringBuffer buff = new StringBuffer()
	    .append( "Q" )
	    .append( strTemp )
	    .append((new DecimalFormat("000000000000")).format(Querylength))
	    .append(strQuery);
		
		SocketConnect skc = new SocketConnect();
    	String strResult = skc.request(strServerIp, nServerPort,  buff.toString(),"full", strCharSet);
    	AgentParser AG = new AgentParser(strResult.substring(14,strResult.length()));
    	
    	logger.info("Result : "+strResult);
    	retFlag = strResult.charAt(1);
    	
    	if(retFlag == 'T')
    	{
    		strRet = "T" + AG.getNodeList("//Return/Query/Message");
    	}
    	else
    	{
    		strRet = "F" + AG.getNodeList("//Return/Query/SQLException") + AG.getNodeList("//Return/Query/Message");
    	}
    	return strRet;
	}
	
	public String GetEvidenceKey()
	{
		String strTemp = strServerKey + "                                                                                                                                                           ";
		strTemp = strTemp.substring(0,32);
		
		int Querylength = 0;
		
		StringBuffer buff = new StringBuffer()
		.append("C")
		.append(strTemp)
		.append((new DecimalFormat("000000000000")).format(Querylength));

		SocketConnect skc = new SocketConnect();
    	String strResult = skc.request(strServerIp, nServerPort,  buff.toString(),"", strCharSet);
    	String strJdocNO	=	parse_jdocno(strResult);
		return strJdocNO;
	}
	
	 public boolean SendSapData(String strSapTag) 
	 { 
	      String strTemp = strServerKey + "                                                                                                                                                           "; 
	      strTemp = strTemp.substring(0,32); 
	       
	      int Querylength = 0;
	      try {
			Querylength = strSapTag.getBytes("EUC-KR").length;
		
	       
	      StringBuffer buff = new StringBuffer() 
	      .append("R") 
	      .append(strTemp) 
	      .append((new DecimalFormat("000000000000")).format(Querylength))
	      .append(strSapTag);
	 
	          SocketConnect skc = new SocketConnect(); 
	         String strResult = skc.request(strServerIp, nServerPort,  buff.toString(),"", strCharSet); 
	//     String strJdocNO     =     parse_jdocno(strResult); 

		} catch (UnsupportedEncodingException e) {
			logger.error("SendSapData Exception", e);
			return false;
		} 
	      return true; 
	 }
	
	private String parse_jdocno(String strTag)
	{
		String result		= null;
		InputStream input 	= null;
		Document doc 		= null;
		Element root		= null;

		try
		{
			input 						= new ByteArrayInputStream(strTag.getBytes());
			doc 						= new SAXBuilder().build(input);
			root						= doc.getRootElement();
			List<Element> rowList		= root.getChildren("Row");
		
			 for(Element element : rowList)
			 {
				 result = element.getChildText("slipdoc_no");
			 }
		}
		catch (Exception e)
		{
			logger.error("parse_jdocno Exception", e);
			return null;
		}
		return result;
	}

	public String SetSAPData(String sapTag, String funcName) {
		String strTemp = strServerKey + "                                                                                                                                                           ";
		strTemp = strTemp.substring(0, 32);

		logger.info("------------------------------SetSAPData query--------------------------------\n- Func Name : " + funcName + "\n- Query : " + sapTag + "\n", 6);

		int Querylength = 0;
		try {
			Querylength = sapTag.getBytes(strCharSet).length;
		} catch (UnsupportedEncodingException e) {
			logger.error("GetData Exception", e);
		}//Cm.Getlength(strQuery);

		StringBuffer buff = new StringBuffer()
				.append("R")
				.append(strTemp)
				.append((new DecimalFormat("000000000000")).format(Querylength))
				.append(sapTag);
		SocketConnect skc = new SocketConnect();
		String strResult = skc.request(strServerIp, nServerPort, buff.toString(), "full", strCharSet);

		logger.info("Result : " + strResult);

		return strResult;
	}

	public String GetSAPData(String sapTag, String funcName) {
		String strTemp = strServerKey + "                                                                                                                                                           ";
		strTemp = strTemp.substring(0, 32);

		logger.info("------------------------------GetSAPData query--------------------------------\n- Func Name : " + funcName + "\n- Query : " + sapTag + "\n", 6);

		int Querylength = 0;
		try {
			Querylength = sapTag.getBytes(strCharSet).length;
		} catch (UnsupportedEncodingException e) {
			logger.error("GetData Exception", e);
		}//Cm.Getlength(strQuery);

		StringBuffer buff = new StringBuffer()
				.append("R")
				.append(strTemp)
				.append((new DecimalFormat("000000000000")).format(Querylength))
				.append(sapTag);
		SocketConnect skc = new SocketConnect();
		String strResult = skc.request(strServerIp, nServerPort, buff.toString(), "full", strCharSet);

		logger.info("Result : " + strResult);

		return strResult.substring(14,strResult.length());
	}
}
