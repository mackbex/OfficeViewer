package com.woonam.template;

import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.File;

import javax.imageio.ImageIO;

import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.woonam.util.Common;
import com.woonam.util.Profile;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class Tax extends TemplateImpl{
	
	private String m_TempletePath = null; 
	private JsonObject obj_taxInfo = null;
	private JsonArray m_arImageInfo = new JsonArray();
	private int m_nCurPage 					= 0;
	private long m_nFileTotalSize 			= 0;
	private String m_workPath = null;
	private Profile m_Profile = null;
	private Common m_C = new Common();

	private BufferedImage imgHeader = null;
	private BufferedImage imgLine = null;
	private BufferedImage imgBottom = null;
	private Logger logger = null;

	public Tax(Profile profile) {
		this.m_Profile = profile;
		this.logger = LogManager.getLogger(Tax.class);
	}
	
	@Override
	public JsonObject run(JsonObject obj_data, String bgPath, String workPath) {
		
		JsonObject obj_res = null;
		if(m_C.isBlank(bgPath)) return null;
		
		this.obj_taxInfo = obj_data;
		this.m_TempletePath = bgPath;
		this.m_workPath = workPath;
	
		try {
			this.imgLine		 	= ImageIO.read(new File(m_C.Get_RootPathForJava() + File.separator + m_TempletePath + File.separator + "line.jpg"));
			this.imgBottom 	= ImageIO.read(new File(m_C.Get_RootPathForJava() + File.separator + m_TempletePath + File.separator + "bottom.jpg"));
			obj_res =  Draw();

			return obj_res;
		
		}
		catch(Exception e) {
			logger.error("Tax - Failed load background.", e);
			return null;
		}
		finally {
			if(imgLine != null) imgLine.flush();
			if(imgBottom != null) imgBottom.flush();
		}
	}

	//Draw Templete data
	private JsonObject Draw() throws Exception
	{
		JsonObject obj_res = new JsonObject();
		
		String typeCode = obj_taxInfo.get("TypeCode").getAsString();
		
		// taxFormType => 0 : default, 1: ������/����Ź ����
		int taxFormType = 0;
		if(typeCode.length() == 4) {
			typeCode = typeCode.substring(2, typeCode.length());
			if("03".indexOf(typeCode) > -1 || "05".indexOf(typeCode) > -1) {
				taxFormType = 1;
			} else {
				taxFormType = 0;
			}
		} else {
			taxFormType = 0;
		}
		
		String headerBG = m_C.Get_RootPathForJava() + File.separator + m_TempletePath + File.separator;
		
		switch(taxFormType) {
			case 0 : 
				headerBG += "0101_top.jpg";
				break;
			case 1 :
				headerBG += "0102_top.jpg";
				break;	
			default :
				headerBG += "0101_top.jpg";
				break;
		}
		
		this.imgHeader = ImageIO.read(new File(headerBG));
		 
		JsonArray ar_itemList = obj_taxInfo.get("ITEM_LIST") != null ? obj_taxInfo.get("ITEM_LIST").getAsJsonArray() : null;
		
		int imgLineHeight = 0;
		if(ar_itemList != null && ar_itemList.size() > 5) {
			imgLineHeight = ar_itemList.size() * imgLine.getHeight();
		}
		else {
			imgLineHeight = 5 * imgLine.getHeight();
		}
		int totalHeight = imgHeader.getHeight() + imgLineHeight + imgBottom.getHeight();
		
		TemplateTool tool = new TemplateTool(imgHeader, totalHeight);
		tool.setFontColor(new Color(0,0,0));
		
		//Draw header
		if(Draw_Header(tool)) {

			//Draw line
			int size = ar_itemList.size();
			if(size < 5) size = 5;
			for(int i = 0; i < size; i++ ) {
				
				JsonObject obj_item = null;
				try {
					obj_item	 = ar_itemList.get(i).getAsJsonObject();
				}
				catch(Exception e) {
					obj_item = null;
				}
				Draw_Line(tool, obj_item, i);
			}
			
			//Draw bottom
			Draw_Bottom(tool);
			
			//Save last page.
			savePage(tool);
			
			//m_objSlipInfo.put("ImageTotalSize", m_nFileTotalSize);
			//m_objSlipInfo.put("ImageInfo", m_arImageInfo);
			obj_res.addProperty("TOTAL_SIZE", m_nFileTotalSize / 1024);
			obj_res.add("IMG_INFO", m_arImageInfo);
			obj_res.addProperty("CONVERT_KEY", obj_taxInfo.get("ConvertKey").getAsString());
			obj_res.addProperty("SDOC_NAME", "���ݰ�꼭("+obj_taxInfo.get("Approve").getAsString()+")");
//			obj_res.addProperty("SDOC_KIND", "1121");
			return obj_res;
		}
		else {
			return null;
		}
	}	
	
	private boolean Draw_Bottom(TemplateTool tool) {
		try
		{
			int lineHeight = imgBottom.getHeight();
			int curHeight = tool.getBackgroundHeight() - lineHeight;
			tool.insertImage(imgBottom, 0, curHeight , imgBottom.getWidth(), lineHeight);
			
			tool.setFontStyle("����", tool.BOLD, 45);
			//PurPose => 01 : ����, 02 : û�� 
			String strResText = obj_taxInfo.get("PurPose").getAsString();
			if("01".equalsIgnoreCase(strResText))
			{
				strResText = "����";
			}
			else
			{
				strResText = "û��";
			}
			tool.DrawText(strResText, 2761, curHeight - 15, 2949, curHeight + imgBottom.getHeight() - 10, tool.CENTER);
			
			//�հ�ݾ�
			String strSPRC_AMT = obj_taxInfo.get("Total").getAsString();
			strSPRC_AMT = strSPRC_AMT.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
			tool.DrawText(strSPRC_AMT, 36, curHeight + 105, 442, curHeight + imgBottom.getHeight(), tool.RIGHT);
			
			//����
			String strCash = obj_taxInfo.get("Cash").getAsString();
			strCash = strCash.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
			tool.DrawText(strCash, 474, curHeight + 105, 877, curHeight + imgBottom.getHeight(), tool.RIGHT);
			
			//��ǥ
			String strCashCheck = obj_taxInfo.get("CashCheck").getAsString();
			strCashCheck = strCashCheck.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
			tool.DrawText(strCashCheck, 909, curHeight + 105, 1312, curHeight + imgBottom.getHeight(), tool.RIGHT);
			
			//����
			String strPostCheck = obj_taxInfo.get("PostCheck").getAsString();
			strPostCheck = strPostCheck.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
			tool.DrawText(strPostCheck, 1344, curHeight + 105, 1744, curHeight + imgBottom.getHeight(), tool.RIGHT);
			
			//�ܻ�̼���
			String strCredit = obj_taxInfo.get("Credit").getAsString();
			strCredit = strCredit.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
			tool.DrawText(strCredit, 1776, curHeight + 105, 2176, curHeight + imgBottom.getHeight(), tool.RIGHT);
			
		}
		catch(Exception e) {
			logger.error("Tax - Draw Line error", e);
			return false;
		}
		
		return true;
	}
	private boolean Draw_Line(TemplateTool tool, JsonObject objItem, int index) {
		try {
			int lineHeight = imgLine.getHeight();
			int curHeight = imgHeader.getHeight() + (lineHeight * index);
			tool.insertImage(imgLine, 0, curHeight , imgLine.getWidth(), lineHeight);
			//	{"IndexNo":"1","Date":"2019.09.","Name":"�������������� ��������","Info":"","MEINS":"","Cnt":"0","Money":"0","Invoice":"700000","Tax":"70000","Memo":""}
		
			//Pass null list
			if(objItem == null) return true;
			
			String date = objItem.get("Date") != null ? objItem.get("Date").getAsString() : "";
			
			if(!m_C.isBlank(date)) {
				//String[] arDate = date.split("\\.");
				//String month = arDate[0];
				//String day = arDate[1];
				String month = date.substring(4, 6);
				String day = date.substring(6, date.length());
				//��
				tool.DrawText(month, 36, curHeight, 173, curHeight + imgLine.getHeight(), tool.CENTER);
				//��
				tool.DrawText(day, 180, curHeight, 308, curHeight + imgLine.getHeight(), tool.CENTER);
			}
			
			//ǰ��
			String name = objItem.get("Name") != null ? objItem.get("Name").getAsString() : "";
			tool.DrawMultiLineText(name, 335, curHeight, 1481, curHeight + imgLine.getHeight(), 1115, 0, 2, tool.LEFT);
			//�԰�
			String info = objItem.get("Info") != null ? objItem.get("Info").getAsString() : "";
			tool.DrawText(info, 1488, curHeight, 1697, curHeight + imgLine.getHeight(), tool.CENTER);
			//����
			String cnt = objItem.get("Cnt") != null ? objItem.get("Cnt").getAsString() : "";
			tool.DrawText(cnt, 1704, curHeight, 1916, curHeight + imgLine.getHeight(), tool.CENTER);
			
			//�ܰ�
			String strUM_AMT = objItem.get("Money") != null ? objItem.get("Money").getAsString() : "";
			strUM_AMT = strUM_AMT.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
			tool.DrawText(strUM_AMT, 1923, curHeight, 2255, curHeight + imgLine.getHeight(), tool.RIGHT);
			//���ް���
			String stSPPRC_AMT = objItem.get("Invoice") != null ? objItem.get("Invoice").getAsString() : "";
			stSPPRC_AMT = stSPPRC_AMT.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
			tool.DrawText(stSPPRC_AMT, 2292, curHeight, 2681, curHeight + imgLine.getHeight(), tool.RIGHT);
			
//			if("TAX".equalsIgnoreCase(m_strTarget))
//			{
			//����
			String stVAT_AMT = objItem.get("Tax") != null ? objItem.get("Tax").getAsString() : "";
			stVAT_AMT = stVAT_AMT.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
			tool.DrawText(stVAT_AMT, 2718, curHeight, 3005, curHeight + imgLine.getHeight(), tool.RIGHT);
//			}
			//���
			String memo = objItem.get("Memo") != null ? objItem.get("Memo").getAsString() : "";
			tool.DrawText(memo, 3042, curHeight, 3230, curHeight + imgLine.getHeight(), tool.CENTER);
			
		}
		catch(Exception e) {
			logger.error("Tax - Draw Line error", e);
			return false;
		}
		
		return true;
	}
	
	private boolean Draw_Header(TemplateTool tool) {
	
		try 
		{			
			String typeCode = obj_taxInfo.get("TypeCode").getAsString();
			String strTypeNM = Set_TypeInfo(typeCode);
		
			// taxFormType => 0 : default, 1: ������/����Ź ����
			int taxFormType = 0;
			
			if(typeCode.length() == 4) {
				typeCode = typeCode.substring(2, typeCode.length());
				if("03".indexOf(typeCode) > -1 || "05".indexOf(typeCode) > -1) {
					taxFormType = 1;
				} else {
					taxFormType = 0;
				}
			} else {
				taxFormType = 0;
			}
			
			//���ι�ȣ	
			String strApprNo = obj_taxInfo.get("Approve").getAsString();
			tool.setFontStyle("����", tool.NORMAL, 50);
			tool.DrawText(strApprNo, 2085, 26, 3260, 166, tool.CENTER);

			//if("03".indexOf(typeCode) == -1 && "05".indexOf(typeCode) == -1)
			if(taxFormType == 0)
			{
				//fixed value topline.	
				tool.setFontStyle("����", tool.BOLD, 60);
				
				//Title
				tool.DrawText(strTypeNM, 36, 26, 1643, 166, tool.CENTER);
		
				tool.setFontStyle("����", tool.NORMAL, 45);
				
				//������ ����ڵ�Ϲ�ȣ
				String strSplrNo = obj_taxInfo.get("FromLicense").getAsString();
				strSplrNo = strSplrNo.replaceAll("(\\d{3})(\\d{2})(\\d{5})", "$1-$2-$3");
				tool.DrawText(strSplrNo, 408, 179, 1055, 340, tool.CENTER);
				//������ ��������ȣ
				//tool.DrawText(m_imageData.GetString("SPLR_SUBO_NO"),522, 96, 646, 140, tool.CENTER);
				//������ ��ȣ
				tool.DrawMultiLineText(obj_taxInfo.get("FromTitle").getAsString(), 411, 357, 1055, 515, 600, 0, 2, tool.CENTER);
				//������ ��ǥ�ڸ�
				tool.DrawMultiLineText(obj_taxInfo.get("FromCEO").getAsString(), 1368, 355, 1632, 515, 230, 0, 2, tool.CENTER);
				//������ �ּ�
				//tool.DrawMultiLineText((String)m_splrData..getOrDefault("COMPANY_ADDR",""),148, 200, 644, 238, 500, 0, 2, tool.CENTER);
				tool.DrawMultiLineText(obj_taxInfo.get("FromAddr").getAsString(), 418, 534, 1632, 694, 1180, 0, 3, tool.CENTER);
				//������ ����
				//tool.DrawMultiLineText((String)m_splrData.getOrDefault("CATEGORY_NM",""), 148, 248, 294, 290, 140, 0, 2, tool.CENTER);
				tool.DrawMultiLineText(obj_taxInfo.get("FromBiz").getAsString(), 411, 709, 788, 854, 330, 0, 3, tool.CENTER);
				//������ ����
				//tool.DrawMultiLineText((String)m_splrData.getOrDefault("JOBTYPE_NM",""), 414, 248, 644, 290, 130, 0, 2, tool.CENTER);
				tool.DrawMultiLineText(obj_taxInfo.get("FromEvent").getAsString(), 1065, 709, 1632, 854, 530, 0, 3, tool.CENTER);
				//������ �̸���
				tool.DrawMultiLineText(obj_taxInfo.get("FromEmail").getAsString(), 411, 873, 1632, 1075, 1180, 0, 2, tool.CENTER);
				
				//���޹޴��� ����ڵ�Ϲ�ȣ
				String strBuyNo = obj_taxInfo.get("ToLicense").getAsString();
				strBuyNo = strBuyNo.replaceAll("(\\d{3})(\\d{2})(\\d{5})", "$1-$2-$3");
				tool.DrawText(strBuyNo, 2013, 179, 2672, 340, tool.CENTER);
				//���޹޴��� ��������ȣ
				tool.DrawText(obj_taxInfo.get("ToTaxCode").getAsString(), 2988, 179, 3260, 340, tool.CENTER);
				//���޹޴��� ��ȣ
				tool.DrawMultiLineText(obj_taxInfo.get("ToTitle").getAsString(), 2016, 355, 2665, 515, 610, 0, 2, tool.CENTER);
				//���޹޴��� ��ǥ�ڸ�	
				tool.DrawMultiLineText(obj_taxInfo.get("ToCEO").getAsString(), 2991, 357, 3253, 515, 255, 0, 2, tool.CENTER);
				//���޹޴��� �ּ�
				//tool.DrawMultiLineText((String)m_buyerData.getOrDefault("COMPANY_ADDR",""), 784, 200, 1286, 238, 500, 0, 2, tool.CENTER);
				tool.DrawMultiLineText(obj_taxInfo.get("ToAddr").getAsString(), 2016, 532, 3253, 692, 1180, 0, 3, tool.CENTER);
				//���޹޴��� ����
				//tool.DrawMultiLineText((String)m_buyerData.getOrDefault("CATEGORY_NM",""), 784, 248, 934, 290, 140, 0, 2, tool.CENTER);
				tool.DrawMultiLineText(obj_taxInfo.get("ToBiz").getAsString(), 2016, 709, 2401, 854, 330, 0, 3, tool.CENTER);
				//���޹޴��� ����
				//tool.DrawMultiLineText((String)m_buyerData.getOrDefault("JOBTYPE_NM",""), 1050, 248, 1282, 290, 130, 0, 2, tool.CENTER);
				tool.DrawMultiLineText(obj_taxInfo.get("ToEvent").getAsString(), 2682, 709, 3258, 856, 520, 0, 3, tool.CENTER);	
				//���޹޴��� �̸���1
				tool.DrawMultiLineText(obj_taxInfo.get("ToEmail_1").getAsString(), 2016, 871, 3253, 956, 1180, 0, 2, tool.CENTER);
				//���޹޴��� �̸���2
				tool.DrawMultiLineText(obj_taxInfo.get("ToEmail_2").getAsString(), 2016, 973, 3253, 1073, 1180, 0, 2, tool.CENTER);
			
				//�ۼ�����
				String strWrittenDate = obj_taxInfo.get("Cabinet").getAsString();
				strWrittenDate = strWrittenDate.replaceAll("(\\d{4})(\\d{2})(\\d{2})", "$1-$2-$3");
				tool.DrawText(strWrittenDate, 36, 1199, 557, 1303, tool.CENTER);
				//���ް���
				String strSPPRC_AMT = obj_taxInfo.get("Provision").getAsString();
				strSPPRC_AMT = strSPPRC_AMT.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");	
				tool.DrawText(strSPPRC_AMT, 564, 1199, 1069, 1303, tool.RIGHT);
				//����
//				if("TAX".equalsIgnoreCase(m_strTarget))
//				{
					String strVAT_AMT = obj_taxInfo.get("Tax").getAsString();
					strVAT_AMT = strVAT_AMT.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
					tool.DrawText(strVAT_AMT, 1101, 1199, 1603, 1303, tool.RIGHT);
//				}
				//��������
				String strModText = obj_taxInfo.get("ModText").getAsString();
				tool.DrawText(strModText, 1640, 1207, 3255, 1301, tool.CENTER);
				//���
				//tool.DrawText(strNote, 780, 402, 1288, 444, tool.CENTER);
				String strNote = obj_taxInfo.get("Note") != null ? obj_taxInfo.get("Note").getAsString() : "";
				tool.DrawMultiLineText(strNote, 569, 1318, 3255, 1481, 2630, 0, 3, tool.CENTER);
			}
			else	
			{	// ����Ź
				//fixed value topline.	
				tool.setFontStyle("����", tool.BOLD, 60);
				
				//Title
				tool.DrawText(strTypeNM, 36, 26, 1643, 166, tool.CENTER);
				
				tool.setFontStyle("����", tool.NORMAL, 45);
		
				//������ ����ڵ�Ϲ�ȣ
				String strSplrNo = obj_taxInfo.get("FromLicense").getAsString();
				strSplrNo = strSplrNo.replaceAll("(\\d{3})(\\d{2})(\\d{5})", "$1-$2-$3");
				tool.DrawText(strSplrNo, 408, 179, 1055, 340, tool.CENTER);
				//������ ��������ȣ
				tool.DrawText(obj_taxInfo.get("FromTaxCode").getAsString(), 1363, 182, 1635, 343, tool.CENTER);
				//������ ��ȣ
				tool.DrawMultiLineText(obj_taxInfo.get("FromTitle").getAsString(), 411, 357, 1055, 515, 600, 0, 2, tool.CENTER);
				//������ ��ǥ�ڸ�
				tool.DrawMultiLineText(obj_taxInfo.get("FromCEO").getAsString(), 1368, 355, 1632, 515, 230, 0, 2, tool.CENTER);
				//������ �ּ�
				tool.DrawMultiLineText(obj_taxInfo.get("FromAddr").getAsString(), 418, 534, 1632, 694, 1180, 0, 3, tool.CENTER);
				//������ ����
				tool.DrawMultiLineText(obj_taxInfo.get("FromBiz").getAsString(), 411, 709, 788, 854, 330, 0, 3, tool.CENTER);
				//������ ����
				tool.DrawMultiLineText(obj_taxInfo.get("FromEvent").getAsString(), 1065, 709, 1632, 854, 530, 0, 3, tool.CENTER);
				//������ �̸���
				tool.DrawMultiLineText(obj_taxInfo.get("FromEmail").getAsString(), 411, 873, 1632, 1075, 1180, 0, 2, tool.CENTER);
				
				//���޹޴��� ����ڵ�Ϲ�ȣ
				String strBuyNo = obj_taxInfo.get("ToLicense").getAsString();
				strBuyNo = strBuyNo.replaceAll("(\\d{3})(\\d{2})(\\d{5})", "$1-$2-$3");
				tool.DrawText(strBuyNo, 2013, 179, 2672, 340, tool.CENTER);
				//���޹޴��� ��������ȣ
				tool.DrawText(obj_taxInfo.get("ToTaxCode").getAsString(), 2988, 179, 3260, 340, tool.CENTER);
				//���޹޴��� ��ȣ
				tool.DrawMultiLineText(obj_taxInfo.get("ToTitle").getAsString(), 2016, 355, 2665, 515, 610, 0, 2, tool.CENTER);
				//���޹޴��� ��ǥ�ڸ�
				tool.DrawMultiLineText(obj_taxInfo.get("ToCEO").getAsString(), 2991, 357, 3253, 515, 255, 0, 2, tool.CENTER);
				//���޹޴��� �ּ�
				tool.DrawMultiLineText(obj_taxInfo.get("ToAddr").getAsString(), 2016, 532, 3253, 692, 1180, 0, 3, tool.CENTER);
				//���޹޴��� ����
				tool.DrawMultiLineText(obj_taxInfo.get("ToBiz").getAsString(), 2016, 709, 2401, 854, 330, 0, 3, tool.CENTER);
				//���޹޴��� ����
				tool.DrawMultiLineText(obj_taxInfo.get("ToEvent").getAsString(), 2682, 709, 3258, 856, 520, 0, 3, tool.CENTER);	
				//���޹޴��� �̸���1
				tool.DrawMultiLineText(obj_taxInfo.get("ToEmail_1").getAsString(), 2016, 871, 3253, 956, 1180, 0, 2, tool.CENTER);
				//���޹޴��� �̸���2
				tool.DrawMultiLineText(obj_taxInfo.get("ToEmail_2").getAsString(), 2016, 973, 3253, 1073, 1180, 0, 2, tool.CENTER);
				
				//��Ź�� ����ڵ�Ϲ�ȣ
				String strFid = obj_taxInfo.get("TrLicense").getAsString();
				strFid = strFid.replaceAll("(\\d{3})(\\d{2})(\\d{5})", "$1-$2-$3");
				tool.DrawText(strFid, 2010, 1091, 2682, 1241, tool.CENTER);
				//��Ź�� ��������ȣ
				tool.DrawText(obj_taxInfo.get("TrTaxCode").getAsString(), 3000, 1091, 3253, 1243, tool.CENTER);
				//��Ź�� ��ȣ
				tool.DrawMultiLineText(obj_taxInfo.get("TrTitle").getAsString(), 2015, 1255, 2677, 1391, 600, 0, 2, tool.CENTER);
				//��Ź�� ��ǥ�ڸ�
				tool.DrawText(obj_taxInfo.get("TrCEO").getAsString(), 3000, 1255, 3253, 1391, tool.CENTER);
				//��Ź�� �ּ�
				tool.DrawMultiLineText(obj_taxInfo.get("TrAddr").getAsString(), 2015, 1408, 3253, 1545, 1190, 0, 3, tool.CENTER);
				//��Ź�� ����
				tool.DrawMultiLineText(obj_taxInfo.get("TrBiz").getAsString(), 2015, 1561, 2468, 1700, 400, 0, 3, tool.CENTER);
				//��Ź�� ����
				tool.DrawMultiLineText(obj_taxInfo.get("TrEvent").getAsString(), 2691, 1561, 3253, 1700, 500, 0, 3, tool.CENTER);
				
				//��Ź�� �̸���1
				//tool.DrawText(m_imageData.GetString("CNSG_EMAIL_ADDR"),784, 290, 1286, 316, tool.CENTER);
				
				//�ۼ�����
				//tool.DrawText(obj_taxInfo.get("Cabinet").getAsString().replaceAll("(\\d{4})(\\d{2})(\\d{2})", "$1-$2-$3"),146, 354, 644, 398, tool.CENTER);
				String strWrittenDate = obj_taxInfo.get("Cabinet").getAsString();
				strWrittenDate = strWrittenDate.replaceAll("(\\d{4})(\\d{2})(\\d{2})", "$1-$2-$3");
				tool.DrawText(strWrittenDate, 562, 1088, 1635, 1241, tool.CENTER);
				//���ް���
				String strSPPRC_AMT = obj_taxInfo.get("Provision").getAsString();
				strSPPRC_AMT = strSPPRC_AMT.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
				tool.DrawText(strSPPRC_AMT, 562, 1249, 1610, 1394, tool.RIGHT);
				//����
//				if("TAX".equalsIgnoreCase(m_strTarget))
//				{
					String strVAT_AMT = obj_taxInfo.get("Tax").getAsString();
					strVAT_AMT = strVAT_AMT.replaceAll("\\B(?=(\\d{3})+(?!\\d))", ",");
					tool.DrawText(strVAT_AMT, 562, 1401, 1610, 1549, tool.RIGHT);
//				}
				//���
				String strNote = obj_taxInfo.get("Note") != null ? obj_taxInfo.get("Note").getAsString() : "";
				tool.DrawMultiLineText(strNote, 567, 1560, 1632, 1698, 1000, 0, 2, tool.CENTER);
			}
			
		}
		catch(Exception e)
		{
			logger.error("Tax - Draw", e);
			//this.m_objSlipInfo = null;
			return false;
		}
		
		return true;
	}
	
	private String Set_TypeInfo(String typeCode)
	{
		String strTypeNM = "";
		String strfirstTitle = "";
		String strendTitle = "";
		
		if(typeCode.length() == 4) {
			String firstType = typeCode.substring(0, 2);
			String endType = typeCode.substring(2, typeCode.length());
			
			switch(firstType) {
				case "01" :
					strfirstTitle = "���ݰ�꼭";
					break;
				case "02" :
					strfirstTitle = "���ݰ�꼭(����)";
					break;
				case "03" :
					strfirstTitle = "��꼭";
					break;
				case "04" :
					strfirstTitle = "��꼭(����)";
					break;
				default : 
					strfirstTitle = "���ݰ�꼭";
					break;
			}
			
			switch(endType) {
				case "01" :
					strendTitle = "���� ";
					break;
				case "02" :
					strendTitle = "������ ";
					break;
				case "03" :
					strendTitle = "����Ź ";
					break;
				case "04" :
					strendTitle = "���� ";
					break;
				case "05" :
					strendTitle = "������ ����Ź ";
					break;
				default : 
					strendTitle = "���� ";
					break;
			}
			strTypeNM = strendTitle + strfirstTitle;
			
		} else if(typeCode.length() == 2) {
			switch(typeCode) {
				case "01" :
					strTypeNM = "���� ���ݰ�꼭";
					break;
				case "02" :
					strTypeNM = "���� ���ݰ�꼭(����)";
					break;
				case "03" :
					strTypeNM = "��꼭";
					break;
				case "04" :
					strTypeNM = "��꼭(����)";
					break;
				default : 
					strTypeNM = "���� ���ݰ�꼭";
					break;
			}
		} else {
			strTypeNM = "���� ���ݰ�꼭";
		}
		
		return strTypeNM;

	}
	
	
	private void savePage(TemplateTool tool) {
		//String strImagePath = m_strImageSavePath + File.separator +m_nCurPage+".jpg";
		
		File path = new File(m_workPath);
		if(!path.exists()) {
			path.mkdirs();
		}
		
		String docIRN = m_C.getIRN("");
		StringBuffer sbImgPath = new StringBuffer();
		sbImgPath.append(m_workPath);
		sbImgPath.append(File.separator);
		sbImgPath.append(docIRN);
		sbImgPath.append(".J2K");
		
		long lFileSize = tool.saveImageFile(sbImgPath.toString(), tool.IMAGE_JPG);
		m_nFileTotalSize += lFileSize;
		JsonObject objJsonItem = new JsonObject();
		//-IMPORTANT- save background image size to use on upload slip.
//		objJsonItem.put("Width", tool.getBackgroundWidth());
//		objJsonItem.put("Height", tool.getBackgroundHeight());
//		objJsonItem.put("Size", lFileSize);
//		objJsonItem.put("PageIndex", m_nCurPage);
//		objJsonItem.put("Path", strImagePath);
		objJsonItem.addProperty("WIDTH", tool.getBackgroundWidth());
		objJsonItem.addProperty("HEIGHT", tool.getBackgroundHeight());
		objJsonItem.addProperty("SIZE", lFileSize / 1024);
		objJsonItem.addProperty("INDEX", m_nCurPage);
		objJsonItem.addProperty("DOC_IRN", docIRN);
		objJsonItem.addProperty("PATH", sbImgPath.toString());
		objJsonItem.addProperty("NAME", "���ݰ�꼭");
		
		m_arImageInfo.add(objJsonItem);
	}
	
}
