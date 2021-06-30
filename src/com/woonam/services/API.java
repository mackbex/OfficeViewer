package com.woonam.services;

import java.io.File;
import java.net.URLDecoder;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.woonam.model.GetRFCModel;
import org.apache.commons.io.FileUtils;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.woonam.connect.AgentConnect;
import com.woonam.model.GetModel;
import com.woonam.model.SetModel;
import com.woonam.template.CoCard;
import com.woonam.template.Order;
import com.woonam.template.Order_Eng;
import com.woonam.template.Report;
import com.woonam.template.Tax;
import com.woonam.template.TemplateImpl;
import com.woonam.template.UploadSlip;
import com.woonam.util.Common;
import com.woonam.util.Profile;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

public class API {

	private Common m_C				 	= null;
	private String m_confPath			= null;
	private AgentConnect m_AC 		= null;
	private GetModel m_GM				= null;
	private SetModel m_SM				= null;
	private Logger logger = null;


	enum ENUM_COMMAND{
		SET_CHANGE_KEY,
		SET_DELETE_KEY,
		SET_CHANGE_STEP,
		COPY_SLIP,
		GET_COUNT,
		GET_SLIP_LIST,
		SET_CARD_KEY,
		UPLOAD_TAX,
		UPLOAD_CARD,
		UPLOAD_TEMPLATE,
		DELETE_BY_KIND,
		UPLOAD_AFTER,
		REMOVE_AFTER,
		REMOVE_AFTER_ALL,
		GET_SEARCH_LIST
	}

	API() {
		this.logger = LogManager.getLogger(API.class);
		this.m_C 				= new Common();
		this.m_confPath		= m_C.Get_RootPathForJava()+"/conf/conf.ini";
	}

	//Run command
	public JsonObject Run_WebService(Map params) {

		//JsonObject obj_Params = null;

		if(params == null) {
			logger.error("Web Service : False. Null parameter.");
			return ResultMsg("F","ERR_NULL_PARAM");
		}

		Profile profile					= new Profile(m_confPath);
		StringBuffer sbWorkPath 	= new StringBuffer();

		//	obj_Params = Parse_Params(params);

		ENUM_COMMAND EC = null;

		try
		{
			String command = m_C.getParamValue(params, "COMMAND", null);
			StringBuffer sbParams = new StringBuffer();
			Iterator it = params.entrySet().iterator();
			while (it.hasNext()) {
				Map.Entry pair = (Map.Entry)it.next();
				sbParams.append(pair.getKey().toString() + " = ");
				sbParams.append("\n");

				if(pair.getValue() instanceof String[]) {

					String val[] = (String[]) pair.getValue() ;

					for(int i = 0; i < val.length; i++ ) {
						sbParams.append(val[i]);
						sbParams.append(" ");
					}
				}

				sbParams.append("\n");
				//    it.remove(); // avoids a ConcurrentModificationException
			}


//			String command = (obj_Params.get("COMMAND") == null || obj_Params.get("COMMAND").isJsonNull())
//					? null : obj_Params.get("COMMAND").getAsString();

			logger.info("----------------------------------------"
					+ "\nWebService : Command - "+command);

			logger.info("----------------------------------------"
					+ "\nWebService : Params - "+sbParams.toString());
			//Check command
			if(m_C.isBlank(command))
			{
				logger.error("WebService : Command is null");
				return ResultMsg("F", "ERR_NULL_COMMAND");
			}

			//Check injection
			if(m_C.IsInjection(command) )
			{
				logger.error("WebService : Injection detected.");
				return ResultMsg("F", "ERR_INJECTION_DETECTED");
			}

			this.m_AC				= new AgentConnect(profile);
			this.m_GM				= new GetModel(m_AC);
			this.m_SM				= new SetModel(m_AC);

			try {
				EC 	= ENUM_COMMAND.valueOf(command);
			}
			catch(Exception e) {
				return ResultMsg("F", "ERR_UNKNOWN_COMMAND");
			}
			switch(EC) {
				default : {
					return ResultMsg("F", "ERR_UNKNOWN_COMMAND");
				}
				case SET_CHANGE_KEY : {
					String[] verifyList = {"FROM","TO","USER_ID","CORP_NO"};

					//Parameter validation.
					if(!VerifyParams(verifyList, params)) {
						return ResultMsg("F","ERR_INVALIED_PARAM");
					}


					String userID 	= m_C.getParamValue(params, "USER_ID", null);
					String coCD 	= m_C.getParamValue(params, "CORP_NO", null);
					String lang 		= m_C.getParamValue(params, "LANG", "ko");

					//Verify user info
					JsonObject obj_userInfo = m_GM.getUserInfo(userID, coCD, lang);

					if(obj_userInfo == null || obj_userInfo.isJsonNull()) {
						logger.info("WebService : No user exists. "
								+ "USER_ID : " + userID
								+ " CORP_NO : " + coCD
								+ " LANG : " + lang);
						return ResultMsg("F","ERR_INVALIED_PARAM");
					}

					JsonObject resMsg = null;
					int resCnt = m_SM.Change_JDocNo(params);

					switch(resCnt) {
						case -1 : {
							resMsg = ResultMsg("F", "FAILED_CONNECT_AGENT");
						}
						default : {
							resMsg = ResultMsg("T", resCnt+"");
						}
					}

					return resMsg;

				}
				case DELETE_BY_KIND : {
					String[] verifyList = {"USER_ID","KEY","CORP_NO","KIND"};

					//Parameter validation.
					if(!VerifyParams(verifyList, params)) {
						return ResultMsg("F","ERR_INVALIED_PARAM");
					}

					boolean bRes = m_SM.Remove_byKind(params);

					JsonObject obj_res = null;
					if(bRes) {
						obj_res = ResultMsg("T", "");
					}
					else {
						obj_res = ResultMsg("F", "");
					}

					return obj_res;
				}
				case SET_DELETE_KEY : {

					String[] verifyList = {"USER_ID","KEY","CORP_NO"};

					//Parameter validation.
					if(!VerifyParams(verifyList, params)) {
						return ResultMsg("F","ERR_INVALIED_PARAM");
					}

					HashMap mapVals = new HashMap<String, String[]>();
					mapVals.put("VALUE", params.get("KEY"));
					mapVals.put("USER_ID", params.get("USER_ID"));
					mapVals.put("CORP_NO", params.get("CORP_NO"));
					mapVals.put("FIELD", params.get("FIELD"));

					boolean bRes = m_SM.removeAll(mapVals);

					JsonObject obj_res = null;
					if(bRes) {
						obj_res = ResultMsg("T", "");
					}
					else {
						obj_res = ResultMsg("F", "");
					}

					return obj_res;
				}
				case SET_CHANGE_STEP : {
					String[] verifyList = {"USER_ID","KEY","CORP_NO","STEP"};

					//Parameter validation.
					if(!VerifyParams(verifyList, params)) {
						return ResultMsg("F","ERR_INVALIED_PARAM");
					}

					boolean bRes = m_SM.Change_Step(params);

					JsonObject obj_res = null;
					if(bRes) {
						obj_res = ResultMsg("T", "");
					}
					else {
						obj_res = ResultMsg("F", "");
					}

					return obj_res;
				}

				case COPY_SLIP : {
					String[] verifyList = {"FLAG", "FROM", "TO", "CORP_NO", "USER_ID"};

					//Parameter validation.
					if(!VerifyParams(verifyList, params)) {
						return ResultMsg("F","ERR_INVALIED_PARAM");
					}

					int resCnt = m_SM.Copy_SlipDoc(params);

					JsonObject obj_res = null;
					if(resCnt > 0) {
						obj_res = ResultMsg("T", resCnt+"");
					}
					else {
						obj_res = ResultMsg("F", resCnt+"");
					}

					return obj_res;
				}
				case GET_SEARCH_LIST: {
					String[] verifyList = {"FROM","TO","USER_ID","CORP_NO"};
					//Parameter validation.
					if(!VerifyParams(verifyList, params)) {
						return ResultMsg("F","ERR_INVALIED_PARAM");
					}


					JsonArray alRes = m_GM.searchSlip(params);
					return ResultMsg("T",alRes.toString());
				}
				case GET_SLIP_LIST : {
					String[] verifyList = {"KEY","USER_ID","CORP_NO"};

					//Parameter validation.
					if(!VerifyParams(verifyList, params)) {
						return ResultMsg("F","ERR_INVALIED_PARAM");
					}

					JsonArray arObj_Res = m_GM.getSlipListAPI(params);

					return ResultMsg("T",arObj_Res.toString());
				}
				case GET_COUNT : {
					String[] verifyList = {"KEY"};

					//Parameter validation.
					if(!VerifyParams(verifyList, params)) {
						return ResultMsg("F","ERR_INVALIED_PARAM");
					}

					JsonArray obj_cnt = m_GM.Get_SlipCnt(params);

					return ResultMsg("T",obj_cnt.toString());
				}
				case REMOVE_AFTER: {
					String[] verifyList = new String[] { "USER_ID", "KEY", "CORP_NO" };
					if (!VerifyParams(verifyList, params))
						return ResultMsg("F", "ERR_INVALIED_PARAM");
					HashMap<String, Object> mapVals = new HashMap<>();
					mapVals.put("VALUE", params.get("KEY"));
					mapVals.put("USER_ID", params.get("USER_ID"));
					mapVals.put("CORP_NO", params.get("CORP_NO"));
					boolean bRes = this.m_SM.removeAfter(mapVals);
					JsonObject objRes = null;
					if (bRes) {
						objRes = ResultMsg("T", "");
					} else {
						objRes = ResultMsg("F", "");
					}
					return objRes;
				}
				case REMOVE_AFTER_ALL: {
					String[] verifyList = new String[] { "USER_ID", "KEY", "CORP_NO" };
					if (!VerifyParams(verifyList, params))
						return ResultMsg("F", "ERR_INVALIED_PARAM");
					HashMap<String, Object> mapVals = new HashMap<>();
					mapVals.put("VALUE", params.get("KEY"));
					mapVals.put("USER_ID", params.get("USER_ID"));
					mapVals.put("CORP_NO", params.get("CORP_NO"));
					boolean bRes = this.m_SM.removeAfterAll(mapVals);
					JsonObject objRes = null;
					if (bRes) {
						objRes = ResultMsg("T", "");
					} else {
						objRes = ResultMsg("F", "");
					}
					return objRes;
				}
				case UPLOAD_AFTER : {
					String[] verifyList = new String[] { "KEY", "USER_ID", "CORP_NO" };

					if (!VerifyParams(verifyList, params)) return ResultMsg("F", "ERR_INVALIED_PARAM");

					String afterImgPath = this.m_C.Get_RootPathForJava() + File.separator + profile.getString("TEMPLATE", "AFTER_BG", "") + File.separator + "00.jpg";

					JsonObject objImgInfo = new JsonObject();
					objImgInfo.addProperty("PATH", afterImgPath);
					objImgInfo.addProperty("DOC_IRN", this.m_C.getIRN(""));
					objImgInfo.addProperty("WIDTH", 2480);
					objImgInfo.addProperty("HEIGHT", 3508);
					objImgInfo.addProperty("SIZE", 318);
					objImgInfo.addProperty("NAME", "AFTER");

					JsonArray arObjImgInfo = new JsonArray();
					arObjImgInfo.add(objImgInfo);

					JsonObject objSlipInfo = new JsonObject();
					objSlipInfo.addProperty("SDOC_KIND", "9000");
					objSlipInfo.addProperty("CONVERT_KEY", this.m_C.getParamValue(params, "KEY", ""));
					objSlipInfo.addProperty("SDOC_NAME", "후첨");
					objSlipInfo.addProperty("COPY_REPLACE", false);
					objSlipInfo.addProperty("IS_FOLLOW", true);

					objSlipInfo.add("IMG_INFO", arObjImgInfo);
					UploadSlip upload = new UploadSlip(profile);
					JsonObject res = upload.run(objSlipInfo, params, sbWorkPath.toString());
					JsonObject objRes = new JsonObject();
					objRes.addProperty("RESULT", res.get("result").getAsString());
					objRes.addProperty("MSG", res.get("msg").getAsString());
					return objRes;
				}

				case UPLOAD_TAX : {
					String[] verifyList = {"APPR_NO", "KEY", "USER_ID", "CORP_NO"};

					if(!VerifyParams(verifyList, params)) {
						return ResultMsg("F","ERR_INVALIED_PARAM");
					}

					GetRFCModel grm = new GetRFCModel(m_AC);
					JsonObject obj_taxInfo = grm.getTaxItem(params);

//					JsonObject obj_taxInfo = m_GM.Get_taxConverList(params);

					if(obj_taxInfo == null || obj_taxInfo.size() <= 0) {
						return ResultMsg("F", "NO_TAX_LIST");
					}

					JsonObject obj_res = null;
					String resStat = "";

					int res_total = 0;
//				for(int i=0; i<arObj_Res.size(); i++) {
//					JsonObject resItem = arObj_Res.get(i).getAsJsonObject();
					String convertKey = obj_taxInfo.get("ConvertKey").getAsString();
					resStat = m_GM.getPTIStatus(convertKey);

					if(m_C.isBlank(resStat)){
						if(!m_SM.insertPTIStatus(convertKey, "03")) {
							return ResultMsg("F", "FAILED_INSERT_STATUS");
						}

						resStat = "00";
					}
//				resStat = "00";
					switch (resStat) {
						case "00":



							Tax taxForm = new Tax(profile);

							// Set work path
							sbWorkPath.append(m_C.Get_RootPathForJava() + profile.getString("WAS_INFO", "TEMP_DIR",  "temp"));
							sbWorkPath.append(File.separator);
							sbWorkPath.append(m_C.getIRN(""));
							sbWorkPath.append(m_C.getParamValue(params, "USER_ID", "system"));
							sbWorkPath.append(m_C.getToday("yyyyMMddHHmmssSSS"));

//							obj_taxInfo.add("ITEM_LIST", ar_taxItemList);

							JsonObject obj_resImage 	= taxForm.run(obj_taxInfo, profile.getString("TEMPLATE", "TAX_BG", ""), sbWorkPath.toString());
							if(obj_resImage == null || obj_resImage.size() <= 0) {
								return ResultMsg("F", "FAILED_CREATE_TAX");
							}
							obj_resImage.addProperty("SDOC_KIND", "1003");

//							String convertKey = obj_resImage.get("CONVERT_KEY").getAsString();
							UploadSlip upload = new UploadSlip(profile);
							JsonObject res = upload.run(obj_resImage, params, sbWorkPath.toString());

							if("T".equalsIgnoreCase(res.get("result").getAsString())) {
								if(m_SM.Update_taxStatus(convertKey, "10")) {

									String[] from = {convertKey};

									HashMap mapVals = new HashMap<String, String[]>();
									mapVals.put("FROM", from);
									mapVals.put("TO", params.get("KEY"));
									mapVals.put("USER_ID", params.get("USER_ID"));
									mapVals.put("CORP_NO", params.get("CORP_NO"));

									int resCnt = m_SM.Copy_SlipDoc(mapVals);
									res_total += resCnt;
								}
							} else {
								return res;
							}

							break;
						case "01":
							obj_res = ResultMsg("T", "CONVERTING_IMAGE");
							return obj_res;
//					break;

						case "10":
							HashMap mapVals = new HashMap<String, String[]>();
							mapVals.put("FROM", params.get("APPR_NO"));
							mapVals.put("TO", params.get("KEY"));
							mapVals.put("USER_ID", params.get("USER_ID"));
							mapVals.put("CORP_NO", params.get("CORP_NO"));
							int resCnt = m_SM.Copy_SlipDoc(mapVals);
							res_total += resCnt;
							break;
						case "20":
							obj_res = ResultMsg("F","ERR_IMAGE_CONVERT");
							return obj_res;
//					break;
					}

					if(res_total > 0) {
						obj_res = ResultMsg("T", res_total+"");
					}
					else {
						obj_res = ResultMsg("F", res_total+"");
					}

					return obj_res;
				}

				case UPLOAD_TEMPLATE : {
					String[] verifyList = {"TYPE", "APPR_NO", "KEY", "USER_ID", "CORP_NO"};

					if(!VerifyParams(verifyList, params)) {
						return ResultMsg("F","ERR_INVALIED_PARAM");
					}

					String strApprNo	= m_C.getParamValue(params, "APPR_NO","");
					String apprNo[] = { URLDecoder.decode(strApprNo, profile.getString("AGENT_INFO", "CHARSET", ""))};
					params.put("APPR_NO", apprNo);

					JsonArray ar_reportInfo = m_GM.Get_reportConverList(params);

					if(ar_reportInfo == null || ar_reportInfo.size() <= 0) {
						return ResultMsg("F", "NO_REPORT_LIST");
					}

					JsonObject obj_res = null;
					String resStat = "";

					int res_total = 0;
					int res_succ = 0;
					int res_fail = 0;
					res_total = ar_reportInfo.size();
					for(int i=0; i<ar_reportInfo.size(); i++) {
						JsonObject resItem = ar_reportInfo.get(i).getAsJsonObject();
						resStat = resItem.get("PTI_STATUS").getAsString();
						//				resStat = "00";

						String convertKey = resItem.get("ConvertKey").getAsString();

						switch (resStat) {
							case "00":
								Report report = new Report(profile);
								sbWorkPath.setLength(0);
								sbWorkPath.append(m_C.Get_RootPathForJava() + profile.getString("WAS_INFO", "TEMP_DIR",  "temp"));
								sbWorkPath.append(m_C.getIRN(""));
								sbWorkPath.append(m_C.getParamValue(params, "USER_ID", "system"));
								sbWorkPath.append(m_C.getToday("yyyyMMddHHmmssSSS"));

								JsonObject obj_resImage = report.run(resItem,  sbWorkPath.toString());
								UploadSlip upload = new UploadSlip(profile);
								JsonObject res = upload.run(obj_resImage, params, sbWorkPath.toString());



								if("T".equalsIgnoreCase(res.get("result").getAsString())) {
									if(m_SM.Update_reportStatus(convertKey, "10")) {

										String[] from = {convertKey};

										HashMap mapVals = new HashMap<String, String[]>();
										mapVals.put("FROM", from);
										mapVals.put("TO", params.get("KEY"));
										mapVals.put("USER_ID", params.get("USER_ID"));
										mapVals.put("CORP_NO", params.get("CORP_NO"));

										int resCnt = m_SM.Copy_SlipDoc(mapVals);
										//	res_total += resCnt;
										res_succ += 1;
									}
									else {
										res_fail += 1;
									}
								} else {
									res_fail += 1;
									//	return res;
								}

								break;
							case "01":
								//	obj_res = ResultMsg("T", "CONVERTING_IMAGE");
								break;
							case "10":

								//String convertKey = resItem.get("CONVERT_KEY").getAsString();

								String[] from = {convertKey};

								HashMap mapVals = new HashMap<String, String[]>();
								mapVals.put("FROM", from);
								//HashMap mapVals = new HashMap<String, String[]>();
								//.put("FROM", params.get("APPR_NO"));
								mapVals.put("TO", params.get("KEY"));
								mapVals.put("USER_ID", params.get("USER_ID"));
								mapVals.put("CORP_NO", params.get("CORP_NO"));

								int resCnt = m_SM.Copy_SlipDoc(mapVals);
								//res_total += resCnt;
								res_succ += 1;
								break;
							case "20":
								obj_res = ResultMsg("F", "Covert Error");

								res_fail += 1;
								//return obj_res;
						}

						StringBuffer sbMsg = new StringBuffer();
						sbMsg.append("TOTAL=");
						sbMsg.append(res_total);
						sbMsg.append(";");
						sbMsg.append("SUCCESS=");
						sbMsg.append(res_succ);
						sbMsg.append(";");
						sbMsg.append("FAILED=");
						sbMsg.append(res_fail);


						if(res_total > 0) {
							obj_res = ResultMsg("T", sbMsg.toString());
						}
						else {
							obj_res = ResultMsg("F", sbMsg.toString());
						}
					}
					return obj_res;
				}
				case UPLOAD_CARD : {
					String[] verifyList = {"APPR_NO", "KEY", "USER_ID", "CORP_NO"};

					if(!VerifyParams(verifyList, params)) {
						return ResultMsg("F","ERR_INVALIED_PARAM");
					}

					GetRFCModel grm = new GetRFCModel(m_AC);
					JsonObject obj_cardInfo = grm.getCocardData(params);

					if(obj_cardInfo == null || obj_cardInfo.size() <= 0) {
						return ResultMsg("F", "NO_CARD_LIST");
					}

					JsonObject obj_res = null;
					String resStat = "";

					int res_total = 0;

					String convertKey = obj_cardInfo.get("ConvertKey").getAsString();
					resStat = m_GM.getPTIStatus(convertKey);

					if(m_C.isBlank(resStat)){
						if(!m_SM.insertPTIStatus(convertKey,"02")) {
							return ResultMsg("F", "FAILED_INSERT_STATUS");
						}

						resStat = "00";
					}
//
					switch (resStat) {
						case "00":
							CoCard cardForm 				= new CoCard(profile);

							// Set work path
							sbWorkPath.append(m_C.Get_RootPathForJava() + profile.getString("WAS_INFO", "TEMP_DIR",  "temp"));
							sbWorkPath.append(File.separator);
							sbWorkPath.append(m_C.getIRN(""));
							sbWorkPath.append(m_C.getParamValue(params, "USER_ID", "system"));
							sbWorkPath.append(m_C.getToday("yyyyMMddHHmmssSSS"));

							JsonObject obj_resImage 	= cardForm.run(obj_cardInfo, profile.getString("TEMPLATE", "CARD_BG", ""), sbWorkPath.toString());

//							String convertKey = obj_resImage.get("CONVERT_KEY").getAsString();
							UploadSlip upload = new UploadSlip(profile);
							obj_resImage.addProperty("SDOC_KIND", "1007");
							JsonObject res = upload.run(obj_resImage, params, sbWorkPath.toString());

							if("T".equalsIgnoreCase(res.get("result").getAsString())) {
								if(m_SM.Update_cardStatus(convertKey, "10")) {

									String[] from = {convertKey};

									HashMap mapVals = new HashMap<String, String[]>();
									mapVals.put("FROM", from);
									mapVals.put("TO", params.get("KEY"));
									mapVals.put("USER_ID", params.get("USER_ID"));
									mapVals.put("CORP_NO", params.get("CORP_NO"));

									int resCnt = m_SM.Copy_SlipDoc(mapVals);
									res_total += resCnt;
								}
							} else {
								return res;
							}

							break;
						case "01":
							obj_res = ResultMsg("T", "CONVERTING_IMAGE");
							return obj_res;
//					break;

						case "10":
							//Already exists.
							HashMap mapVals = new HashMap<String, String[]>();
							mapVals.put("FROM", params.get("APPR_NO"));
							mapVals.put("TO", params.get("KEY"));
							mapVals.put("USER_ID", params.get("USER_ID"));
							mapVals.put("CORP_NO", params.get("CORP_NO"));

							int resCnt = m_SM.Copy_SlipDoc(mapVals);
							res_total += resCnt;
							break;

						case "20":
//					resMsg = ResultMsg("F", "Covert Error");
							obj_res = ResultMsg("F","ERR_IMAGE_CONVERT");
							return obj_res;
//					break;
					}

//				JsonObject obj_res = null;
					if(res_total > 0) {
						obj_res = ResultMsg("T", res_total+"");
					}
					else {
						obj_res = ResultMsg("F", res_total+"");
					}

					return obj_res;
				}
			}

		}
		catch(Exception e) {
			logger.error("Web Service", e);
			if(!m_C.isBlank(sbWorkPath.toString())) {
				try {
					FileUtils.deleteDirectory(new File(sbWorkPath.toString()));
				}
				catch(Exception e2) {
					logger.error("Remove dicectory exception.", e2);
				}
			}
			return ResultMsg("F","ERR_EXCEPTION_OCCURED");
		}

	}

	/**
	 * Return with message
	 * @param flag
	 * @param msg
	 * @return
	 */
	private JsonObject ResultMsg(String flag, String msg) {
		JsonObject res = new JsonObject();
		res.addProperty("RESULT", flag);
		res.addProperty("MSG", msg);
		return res;
	}

	/**
	 * Return with message
	 * @param msg
	 * @return
	 */
	private JsonObject ResultMsg (String msg) {
		JsonObject res = new JsonObject();
		res.addProperty("MSG", msg);
		return res;
	}

	/**
	 * Parse parameters
	 * @param params
	 * @return
	 */
	private JsonObject Parse_Params(Map params) {

		Gson gson = new Gson();

		return (new JsonParser()).parse(gson.toJson(params)).getAsJsonObject();
	}
	/**
	 * Verify params
	 * @param
	 * @param
	 * @param
	 * @return
	 */

	private boolean VerifyParams(String[] verifyList, Map<String, String[]> params)
	{
		boolean bRes = true;

		if(m_C.IsNullParam(verifyList, params))
		{
			StringBuffer sbParams = new StringBuffer();
			for (String key: params.keySet()) {
				sbParams.append("key : "+key + ", params : " + Arrays.toString(params.get(key))+" ");
			}
			logger.error("WebService : Parameter is null.\n" + sbParams.toString());
			bRes = false;
		}

		return bRes;
	}
}
