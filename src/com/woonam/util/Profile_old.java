package com.woonam.util;


import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.util.HashMap;
import java.util.StringTokenizer;
import java.util.Vector;

public class Profile_old 
{
	private 	String[]	m_arrStrInput;			// ���� ����
//	private    String	 	m_strFileName;			// ���� �̸�
	
//    public static final String m_strWorkDir 		= System.getProperty ("user.dir").replace('\\','/');
//    public static final String m_strConf			= System.getProperty ("user.dir").replace('\\','/')  + "/System/DBAgent.ini";
//    public static final String m_strConf			= "conf/conf.ini";
 
    public Profile_old(String strFileName) {
    	 SetFile( strFileName );
    	
    }

 /*   private static class LazyHolder {
        private static final Profile INSTANCE = new Profile();
    }

    public static Profile getInstance() {
        return LazyHolder.INSTANCE;
    }*/
    
    public void init(String strFileName) 	
    {
       
    }
     
    public boolean SetFile( String strFileName)
    {
//    	m_strFileName = strFileName;
		//System.out.println(" SetFile :" + m_strFileName);
		byte[] lineBuffer;
		Vector vector = new Vector(20, 10);	// int initialCapacity, int capacityIncrement
		/*Logger logger = new Logger();
		logger.write("conf.ini path : "+strFileName);*/
		try 
		{
			
			//strFileName	= "E:/XtormAgent/System/ConnectXtorm.ini";
			FileInputStream inputStream = null;
			inputStream = new FileInputStream(strFileName);           
			//System.out.println( "inputStream : " + strFileName);      
			byte[] lineData;
			boolean bReadLine = true;
			while(bReadLine) 
			{
				lineBuffer = new byte[1024];                 
				lineData = readLine(inputStream, lineBuffer);
				if(lineData != null && lineData.length>0) 
				{
					String strLine = new String(lineData);
					//System.out.println( "strLine : " + strLine);
					strLine.trim();
					if(strLine.length() == 0)				// ���ο� ���ڰ� ������ ���� �������� �̵� 
					{ 
						bReadLine = false;  
						continue; 
					}
					if(!strLine.startsWith("'"))				// ' �� �ּ� 
						vector.addElement(strLine); 	//�ּ��� �ƴϸ� Vector�� ���� 
				} 
				else  // ���Ͼȿ� ���ڰ� ������ ���� ���� 
					bReadLine = false;
			}
			inputStream.close();
		} 
		catch(Exception e) 
		{
			System.out.println(strFileName + "�б� ����");
			/*logger.writeException("�б� ����", e);*/
			return false;
		}

		int vSize = vector.size();
		if (vSize > 1)
		{ 		
			m_arrStrInput = new String[vSize];
			for(int i=0 ; i<vSize ; i++) 
			{
				m_arrStrInput[i] = (String)vector.elementAt(i);
			}
			return true;
		}
		return false;
    }
    
    public static byte[] readLine(InputStream is, byte[] t_buf) throws IOException 
    {
    	byte[] ret;
    	
    	int c = is.read();
	    if (c == -1)  return null; //c=10;
	 	t_buf[0] = (byte)c;
    	
    	int i = 1, len=1;
    	try {
    	    for (; i < 1024 ; i++) {
    	        c = is.read();
    	        if (c == -1)  {
    	            c = 10; //EOF�� ���� ���ݱ��� ���� ���븸 ����. 
    	        }
    	        switch(c) {
    	            case 0 : c = ' '; // convert null to space.
    	                     t_buf[i] = (byte) c;
    	                     len++;
    	                     break;
    	            case 13 : break;
    	            case 10 :
    	                     ret = new byte[len];
    	                     System.arraycopy(t_buf, 0, ret, 0, len);
    	                     return ret;    	                     
    	            default :          
    	                     t_buf[i] = (byte) c;
    	                    len++;
    	                    break;
    	        }    	        
    	    }
    	    ret = new byte[len];
    	    System.arraycopy(t_buf, 0, ret, 0, len);
    	    return ret;  
	    } catch (IOException ee) {
	        return null;
	    }
    }
    
    //���� ��� �� ��������.
    public HashMap<String ,String> GetAllSectionValues(String strSection)
    {
    	HashMap<String, String> mapVals = new HashMap<String, String>();
    	String 	strLine			="";
    	int 		nSize 			= m_arrStrInput.length;
    	boolean bFoundLine 	= false;
        for(int nIndex = 0; nIndex < nSize ; nIndex++) 
        {
        	if(bFoundLine)
        	{
        		break;
        	}
        	strLine = m_arrStrInput[nIndex];
        	if (strLine.indexOf("[") == 0)
			{
        		int nLoc = strLine.indexOf("]"); // ���� ������ ��ġ ���ϱ�
				//if ( nLoc >=0 )			System.out.println(strLine.substring(1, nLoc).trim());
				if(nLoc >= 0 && strSection.equalsIgnoreCase(strLine.substring(1, nLoc).trim()))	// SECTION ã��  
				{
					bFoundLine = true;
					for( int i=nIndex+1; i< nSize; i++)
					{
						strLine = m_arrStrInput[i];
						//nLoc = strLine.indexOf("]");
						//if ( nLoc >= 0 )		break;
						nLoc = strLine.indexOf("[");
						if ( nLoc == 0 )		break;
						
						nLoc = strLine.indexOf("=");
						if(nLoc > -1)
						{
							String strKey 		= strLine.substring(0, nLoc).trim();   // KEY �� ���ϱ� 
							String strValue 	= strLine.substring(nLoc+1).trim();   // KEY �� ���ϱ� 
						
							if(!isBlank(strKey) && !isBlank(strValue))
							{
								mapVals.put(strKey, strValue);
							}
						}
							//System.out.print( strKey + "=");
						
						//	return strKeyValue; 
						
					}
				}
			}
        }
    	return mapVals;
    }
    
    public String get_profile_string(String strSection, String strKey) 		// KEY �� ���ϱ� 
    {
        String 	strLine			="";
        String 	strKeyValue = "";
		int 		nSize 			= m_arrStrInput.length;
        for(int nIndex = 0; nIndex < nSize ; nIndex++) 
        {
			strLine = m_arrStrInput[nIndex];
			//System.out.println(strLine);
			if (strLine.indexOf("[") == 0)
			{
				int nLoc = strLine.indexOf("]"); // ���� ������ ��ġ ���ϱ�
				//if ( nLoc >=0 )			System.out.println(strLine.substring(1, nLoc).trim());
				if(nLoc >= 0 && strSection.equalsIgnoreCase(strLine.substring(1, nLoc).trim()))	// SECTION ã��  
				{
					for( int i=nIndex+1; i< nSize; i++)
					{
						strLine = m_arrStrInput[i];
						//nLoc = strLine.indexOf("]");
						//if ( nLoc >= 0 )		break;
						nLoc = strLine.indexOf("[");
						if ( nLoc == 0 )		break;
						
						nLoc = strLine.indexOf("=");
						if(nLoc >= 0 && strKey.equalsIgnoreCase(strLine.substring(0, nLoc).trim()))	// SECTION ã��  
						{
							//System.out.print( strKey + "=");
							//System.out.println( strKeyValue );
							strKeyValue = strLine.substring(nLoc+1).trim();   // KEY �� ���ϱ� 
							strKeyValue.trim();	// ���� ����
							return strKeyValue; 
						}
					}
				}
			}
        }
		return strKeyValue;
    }
    																//"COMMON", "TRACEYN", "", args[0]
    public String GetString(String strSection, String strKey, String strDefault) 
    {
        String strValue = get_profile_string(strSection, strKey);
		//System.out.println("����  =  " + strSection + ",  Ű��  = " + strKey + ", ã�� �� = " + strValue );
       	if ( strValue.length() !=0 ) 	return strValue;
       	else								return strDefault;
    }
    
 
    
    public boolean WritePrivateDataString(String sec, String key, String data, String file) 
    {
        try {

            if(m_arrStrInput == null)				 //Section�� ���°�� 
            { 
                Vector v = new Vector();
                v.addElement("["+sec+"]");
                v.addElement(key+"="+data);
                saveToFile(file, true, v);
                return true;
            }
            else											//Section�� �ִ°�� 
            { 
                String str = "";
                int nSize = m_arrStrInput.length;
                for(int nIndex= 0; nIndex < nSize; nIndex++)		//key�� �ִ� ��� 
                {  
                    str = m_arrStrInput[nIndex];
                    if(str.startsWith(key+"=")) 
                    {
                        updateToFile(file, sec, key+"=", key+"="+data);
                        return true;
                    }
                }
                
                insertKey(file, sec, key, data); //key�� ���� ���
            }
        }
        catch(Exception e) {
            System.out.println("WritePrivateDataString ���� : "+file);
            return false;
        }
        return false;
    }
    
    private static void insertKey(String file, String sec, String key, String data) 
    {
        try {
            RandomAccessFile raf = new RandomAccessFile(file, "rw");
            long length = raf.length();
            while(raf.getFilePointer() < length) {
                String temp = raf.readLine();
                if(temp.startsWith("["+sec+"]")) break;
            }
            long offset = raf.getFilePointer();
            byte[] t = new byte[(int)(length - offset)];
            raf.read(t, 0, (int)(length - offset));
            raf.seek(offset);
            raf.write((key+"="+data+"\r\n").getBytes());
            raf.write(t);
        }
        catch(Exception e) {
            System.out.println("Error InsertKey");
        }
    }
    
    public static boolean saveToFile(String fileName, boolean append, Vector v) 
    {        
        File file = new File(fileName);
        if(!file.exists()) {
			append = false;
			int index = fileName.lastIndexOf("\\");
			File f = new File(fileName.substring(0, index));
			f.mkdirs();
		}
        
        try {
            FileOutputStream out = new FileOutputStream(fileName, append);
            for(int i = 0; i < v.size(); i++) {
                out.write(((String)v.elementAt(i)+"\r\n").getBytes());
            }
            out.flush();
            out.close();
        }
        catch(IOException e) {            
            System.out.println(fileName + "���ϻ��� ����");
            return false;
        }        
        return true;
    }
    
    public boolean updateToFile(String fileName, String section, String targetString, String replaceString) 
    {
        boolean bFindSection = false;
        for (int i = 0 ; i < m_arrStrInput.length ; i++) 
        {
            if(m_arrStrInput[i].equals("["+section+"]")) 
            	bFindSection = true;
            if (bFindSection && m_arrStrInput[i].startsWith(targetString)) 
            {
				m_arrStrInput[i] = replaceString;
                break;
            }
        }
        try 
        {
            FileOutputStream outputstream = new FileOutputStream(fileName, false);
            for(int i = 0; i < m_arrStrInput.length; i++) {
				outputstream.write((m_arrStrInput[i]+"\r\n").getBytes());
            }
			outputstream.flush();
			outputstream.close();
        }
        catch(IOException e) {
            System.out.println(fileName + "���ϻ��� ����");
            return false;
        }
        return true;
    
    }
    
    public static String ReturnValue(String szDbData, String szReadData) 
    {
        String szDbValue = "";
        String szRdValue = "" ;
	    String szTmp = "" ;
	    
	    StringTokenizer dbData = new StringTokenizer(szDbData,"^");	    
	    StringTokenizer rData = new StringTokenizer(szReadData,"^");
	    
	    for (int i=0;dbData.hasMoreTokens();i++) 
	    {
	        szDbValue = szDbValue + dbData.nextToken() ;
	    }
	    
	    for (int i=0;rData.hasMoreTokens();i++) 
	    {
	        szRdValue = szRdValue + rData.nextToken() ;
	    }
	    
	    szTmp = szDbValue  ;
	    
	    for ( int i = 0 ; i < szDbValue.length() ; i++)
	    {	        
	        String szDValue = szDbValue.substring(i, i+1) ;
	        //System.out.println(szDValue) ;
	        for ( int j = 0 ; j < szRdValue.length();j++) 
	        {
	            String szRValue = szRdValue.substring(j, j+1) ;
	            if (szDValue.equals(szRValue)){
	                szTmp = szTmp.replace(szRValue.charAt(0), ' ') ;	                
	            }
	        }	        
	    }
	    //System.out.println("RETURN VALUE" + szTmp) ;
	    return szDbValue ;
    }    
    
    /**
	 * Null üũ
	 * @param str
	 * @return
	 */
	public boolean isBlank(String str)
	{
		if(str == null || str.replaceAll("\\p{Z}", "").length()<=0)
		{
			return true;
		}
		return false;
	}
}