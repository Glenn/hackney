var socitm_my_domains = "http://www.bristol.gov.uk/,http://maps.bristol.gov.uk/,http://e2eweb.bristol.gov.uk/,https://ctstatements.bristol-city.gov.uk/,https://ctstatements.bristol.gov.uk/,https://www.e-paycapita.com/bristol/,http://buy.bristol.gov.uk/,http://www.everyoneactive.com/,http://www.bristolpartnership.org/,http://www.bristol-cyps.org.uk/,http://www.1bigdatabase.org.uk/,http://jobs.bristol.gov.uk/,https://jobs.bristol.gov.uk/,http://www.homechoicebristol.co.uk/,http://www.librarieswest.org.uk/,http://www.bristol.public-i.tv/,http://www.traveline.org.uk/,http://wcm-uat.bcc.lan/,http://wcm-dev.bcc.lan/";
var socitm_custcode = "78";
var socitm_intro_file = "/ccm-ldn-theme/__ccm__/themes-prod/bristol/html/socitm_intro-v2.html";

// v3
// Added 26-01-2012 martin Glancy ref: Socitm Insight Website take up service (WTS) Implementation Guide May 2011 V 1.7 page 18 section 8.4 - Overriding WTS library loading
// If you wish to prevent the WTS loading its own version of jquery then this can be achieved by setting:
// var socitm_manual_jquery = true
// The Socitm WTS will now be forced to use the version of jquery that you have loaded. The default for this variable if omitted is false.
// NOTE - directory below must be /js2/ for this test to work (not documented)
var socitm_manual_jquery = true;
// end added

var _rsCL='<scr'+'ipt language="JavaScript" type="text/javascript" src="'+ ("https:" == document.location.protocol ? "https" : "http") +'://socitm.govmetric.com/js2/socitm_wrapper.aspx"><\/scr'+'ipt>';

document.write(_rsCL);
