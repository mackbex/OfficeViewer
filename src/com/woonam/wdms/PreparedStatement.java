package com.woonam.wdms;

import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.woonam.util.Common;
import com.woonam.util.Profile;

/**
 * Preparestatement for Agent.
 * @author Administrator
 *
 */
public class PreparedStatement {

	private enum DB {
		ORACLE,
		MSSQL
	}

	private String strQuery = null;
	private ArrayList<Object> listVal = new ArrayList<Object>();
	private int nQMCnt = 0;
	private Matcher matcher = null;
	private DB db = null;
	private Common m_C = new Common();

	/**
	 * Get query for prepareStatement.
	 * @param
	 */

	public PreparedStatement(/*String strQuery,*/ Profile profile) {
//		this.strQuery = strQuery;
		String db =  profile.getString("AGENT_INFO","DB","MSSQL");
		this.db = DB.valueOf(db.toUpperCase());

//		String regEx = "[?]";
//
//	    Pattern pat = Pattern.compile(regEx);
//	    matcher = pat.matcher(this.strQuery);
//
//	    while (matcher.find()) {
//	    	nQMCnt++;
//	    }
//
//	    matcher.reset();
	}

	/**
	 * Get query for prepareStatement.
	 * @param
	 */

	/*public PreparedStatement(String strQuery) {
		this.strQuery = strQuery;
		this.db = DB.valueOf("MSSQL");

		String regEx = "[?]";

		Pattern pat = Pattern.compile(regEx);
		matcher = pat.matcher(this.strQuery);

		while (matcher.find()) {
			nQMCnt++;
		}



		matcher.reset();
	}*/

	public void setQuery(String query) {
		this.strQuery = query;
		nQMCnt = 0;

		String regEx = "[?]";

		Pattern pat = Pattern.compile(regEx);
		matcher = pat.matcher(this.strQuery);

		while (matcher.find()) {
			nQMCnt++;
		}

		matcher.reset();
		listVal.clear();
	}

	
	/**
	 * Convert ? to actual value with index (the index is starting from 0)
	 * @param nIdx
	 * @param strValue
	 */
	public void setColumnName(int nIdx, String strValue) {
		listVal.add(nIdx, strValue);
	}
	public void setString(int nIdx, String strValue) {
		if(m_C.isBlank(strValue)) strValue = "";
		listVal.add(nIdx, "'" + strValue  + "'");
	}
	public void setFunction(int nIdx, String strValue) {
		listVal.add(nIdx,  strValue  );
	}

	public void setDBDate(int nIdx) {

		switch (this.db) {
			case ORACLE: {
				listVal.add(nIdx,"CURRENT_TIMESTAMP");
				return;
			}
			default: {
				listVal.add(nIdx,"getDate()");
			}
		}
	}
	public void setNull(int idx) {
	    listVal.add(idx, "NULL");
	}
	public void setInt(int nIdx, int nValue) {
		listVal.add(nIdx, nValue);
	}
	
	public void setProcArray(int nIdx, ArrayList<Object> arValue) {
		
		String strValue = null;
		
		for(int i = 0; i< arValue.size(); i++)
		{
			if(m_C.isBlank(strValue))
			{
				strValue =  "'" + (String) arValue.get(i);	
			}
			else
			{
				strValue = strValue + " , " + (String) arValue.get(i);
			}
			
			if(i >= arValue.size() -1)
			{
				strValue += "'";
			}
		}
		listVal.add(nIdx,strValue);
	}
	
	public void setArray(int nIdx, ArrayList<Object> arValue) {
		
		String strValue = null;
		
		for(int i = 0; i< arValue.size(); i++)
		{
			if(arValue.get(i) instanceof String)
			{
				if(m_C.isBlank(strValue))
				{
					strValue = "'" + (String) arValue.get(i) +"'";	
				}
				else
				{
					strValue = strValue + " , " + "'" + (String) arValue.get(i) +"'";
				}
				
			}
			else if(arValue.get(i) instanceof Integer)
			{
				if(m_C.isBlank(strValue))
				{
					strValue =  (String) arValue.get(i);	
				}
				else
				{
					strValue = strValue + " , " + (String) arValue.get(i);
				}
			}
		}
		listVal.add(nIdx,strValue);
	}
	
	
	/**
	 * Get result query. returns null if query parameter and value count is not matched.
	 * @return
	 * @throws QuestionMarkNotMatchedException 
	 */
	public String getQuery() throws QuestionMarkNotMatchedException {
		String strRes = null;
		//Validate question mark and added value counts.
		if(listVal.size() == nQMCnt)
		{
			strRes = strQuery;
			StringBuffer replacedString = new StringBuffer();

			int nIdx = 0;
			while (matcher.find()) {
				
				String strReplaced = null;
				
				if(listVal.get(nIdx) instanceof String)
				{
					strReplaced = (String)listVal.get(nIdx);
				}
				
				else if(listVal.get(nIdx) instanceof Integer)
				{
					strReplaced = (Integer)listVal.get(nIdx) + "";
				}
				
				strReplaced = Matcher.quoteReplacement(strReplaced);
				matcher.appendReplacement(replacedString, strReplaced);		
				nIdx++;
		    }

			matcher.appendTail(replacedString);
			
			strRes = replacedString.toString();
		}
		else
		{
			throw new QuestionMarkNotMatchedException("Expected mark is : "+nQMCnt+", but received parameter count is " + listVal.size());
		}
		
		return strRes;
	}
	public class QuestionMarkNotMatchedException extends Exception { 
	    public QuestionMarkNotMatchedException(String errorMessage) {
	        super(errorMessage);
	    }
	}
}
