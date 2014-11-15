var SOCITM_BASE_URL = "//socitm.govmetric.com";
var SOCITM_CDN_URL = "//df3afthv6z8r.cloudfront.net";
var SOCITM_VERSION = "4.9.1";

try {
    var socitm_beta = Array('70', '327', '378', '386', '503');
    var socitm_intro_url = (typeof window['socitm_custcode'] !== 'undefined' && socitm_beta.indexOf(window['socitm_custcode']) >= 0) ? '/js10/socitm-newintro.min.js' : '/js10/socitm-intro.js';

    var socitm_snippet = document.createElement('script');
    socitm_snippet.setAttribute('src', SOCITM_CDN_URL + socitm_intro_url + '?v=' + SOCITM_VERSION);
    document.getElementsByTagName("head")[0].appendChild(socitm_snippet);
} catch (e) { }