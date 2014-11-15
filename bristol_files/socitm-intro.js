var socitm = socitm || {};

socitm.conf = {
    disabled: false,
    debug: false,
    force: false,
    supersetid: '1',
    ratio: 5,
    lang: 'en-GB',
    cookies: {
        include: 'socitm_include_me',
        exclude: 'socitm_exclude_me'
    }
};

socitm.base = {
    init: function () {
        //Grab all of the config settings that the subscriber has specified.
        if (typeof window['socitm_custcode'] != 'undefined') socitm.conf.code = window['socitm_custcode'];
        if (typeof window['socitm_intro_file'] != 'undefined') socitm.conf.intro = window['socitm_intro_file'];
        if (typeof window['socitm_my_domains'] != 'undefined') socitm.conf.domains = window['socitm_my_domains'];
        if (typeof window['socitm_language_opt'] != 'undefined') socitm.conf.lang = window['socitm_language_opt'];

        socitm.conf.force = location.search.toLowerCase().indexOf("socitmforcepop") > -1; //Has the popup been forced?
        socitm.conf.debug = location.search.toLowerCase().indexOf('socitmdebug') > -1; //Should we output debug info?

        //Check that we can call back to the SOCITM proxy.
        if (window.XMLHttpRequest) {
            if (socitm.utils.areCookiesEnabled() || socitm.conf.force) {
                if (socitm.utils.getCookie(socitm.conf.cookies.exclude) == "" || socitm.conf.force) {
                    //Grab the organisations config.
                    var json_loaded = socitm.utils.getJSON(SOCITM_BASE_URL + '/jsconfig/socitm_proxy.aspx?ref=' + socitm.conf.code);

                    var config_interval = setInterval(function () {
                        //Check that the config has been loaded.
                        if (socitm.conf.loaded == true) {
                            clearInterval(config_interval); //Clear the interval.

                            //Check to see if the survey has been disabled (e.g. IP exclusion)
                            if (!socitm.conf.disabled) {
                                //Check to see if we should show the popup.
                                socitm.base.check();
                            }
                        }
                    }, 500);

                    //Record the hit attempt.
                    socitm.utils.getJSON(SOCITM_BASE_URL + '/hitcounter.aspx?code=' + socitm.conf.code);
                }
            }
        } else if (socitm.conf.debug) {
            console.log('Your browser isn\'t capable of calling back to our service and so the survey has been disabled');
        }
    },
    check: function () {
        var counter = socitm.utils.getCookie(socitm.conf.cookies.include);
        socitm.utils.setCookie(socitm.conf.cookies.include, ++counter, 365);

        if (counter == socitm.conf.ratio || socitm.conf.force) {
            socitm.base.prompt();
        }
    },
    prompt: function () {
        var lang_pack = socitm.base.translations(socitm.conf.lang);

        var css = socitm.utils.addElement('LINK', { rel: 'stylesheet', href: SOCITM_CDN_URL + '/css/intro.css?v=' + SOCITM_VERSION }, 'HEAD');
        var container = socitm.utils.addElement('DIV', { id: 'socitm_lozenge_container' }, 'BODY');
        var lozenge = socitm.utils.addElement('DIV', { id: 'socitm_lozenge' });
        var lozenge_content = socitm.utils.addElement('DIV', { id: 'socitm_lozenge_content' });

        var intro = socitm.utils.addElement('DIV', { id: 'socitm_lozenge_intro' });
        intro.innerHTML = lang_pack.intro;

        var btn_area = socitm.utils.addElement('DIV', { id: 'socitm_buttons' });

        for (var i = 0; i < lang_pack.buttons.length; i++) {
            var button = lang_pack.buttons[i];

            var my_btn = socitm.utils.addElement('DIV', { "class": button.css });
            var my_btn_area = socitm.utils.addElement('DIV', { "class": 'socitm_button_area' });
            var my_btn_link = socitm.utils.addElement('A', { "href": button.href, "data-participate": button.participate, "data-lang": button.language, "target": "_blank" });

            my_btn_link.innerHTML = button.label;
            my_btn_area.appendChild(my_btn_link);
            my_btn.appendChild(my_btn_area);
            btn_area.appendChild(my_btn);

            var callback =

            socitm.utils.addClick(my_btn_link, function (e) {
                e.preventDefault ? e.preventDefault() : e.returnValue = false;
                var target = e.currentTarget ? e.currentTarget : e.srcElement;

                socitm.base.participate((target.getAttribute('data-participate').toString() == 'true'), target.getAttribute('data-lang'));
            });
        }

        btn_area.appendChild(socitm.utils.addElement('DIV', { "class": 'socitm_platform' }));

        lozenge_content.appendChild(intro);
        lozenge_content.appendChild(btn_area);
        lozenge.appendChild(lozenge_content);

        var platform = socitm.utils.addElement('DIV', { "class": 'socitm_platform' });
        lozenge.appendChild(platform);

        container.appendChild(lozenge);

        setTimeout(function () { socitm.utils.slide('up', lozenge); }, 300);

        //Record the pop attempt.
        socitm.utils.getJSON(SOCITM_BASE_URL + '/popcounter.aspx?code=' + socitm.conf.code + '&lang_code=' + socitm.conf.lang);
    },
    participate: function (takePart, language) {
        if (socitm.conf.debug) {
            console.log('Participate?', takePart);
            console.log('Language?', language);
        }

        if (takePart) {
            socitm.conf.lang = language;
            socitm.utils.addElement('SCRIPT', { type: 'text/javascript', src: SOCITM_CDN_URL + '/js10/socitm-survey.js?v=' + SOCITM_VERSION }, 'BODY');
        } else {
            socitm.utils.setCookie(socitm.conf.cookies.exclude, 'true', 365);
        }
        var container = document.getElementById('socitm_lozenge_container');
        container.parentNode.removeChild(container);
    },
    translations: function (lang) {
        switch (lang.toLowerCase()) {
            case 'cy-gb': {
                return {
                    intro: 'A fyddech gystal â llenwi arolwg byr am y safle hwn.',
                    buttons: [
                        { label: 'Rwyf am helpu', participate: true, language: lang, css: 'socitm_button socitm_btn_y', href: SOCITM_BASE_URL + '/survey.aspx?code=' + socitm.conf.code + '&lang_code=' + lang },
                        { label: 'Na, dim diolch', participate: false, language: lang, css: 'socitm_button socitm_btn_n', href: '#' }
                    ]
                };
            } break;
            case 'xh-za': {
                return {
                    intro: 'Please complete a short survey about this site.<br />A fyddech gystal â llenwi arolwg byr am y safle hwn.',
                    buttons: [
                        { label: 'Yes, I can help', participate: true, language: 'en-GB', css: 'socitm_button socitm_btn_y', href: SOCITM_BASE_URL + '/survey.aspx?code=' + socitm.conf.code + '&lang_code=' + 'en-GB' },
                        { label: 'No, not this time', participate: false, language: 'en-GB', css: 'socitm_button socitm_btn_n', href: '#' },
                        { label: 'Rwyf am helpu', participate: true, language: 'cy-GB', css: 'socitm_button socitm_btn_y', href: SOCITM_BASE_URL + '/survey.aspx?code=' + socitm.conf.code + '&lang_code=' + 'cy-GB' },
                        { label: 'Na, dim diolch', participate: false, language: 'cy-GB', css: 'socitm_button socitm_btn_n', href: '#' }
                    ]
                };
            } break;
            default: {
                return {
                    intro: 'Please complete a short survey about this site.',
                    buttons: [
                        { label: 'Yes, I can help', participate: true, language: lang, css: 'socitm_button socitm_btn_y', href: SOCITM_BASE_URL + '/survey.aspx?code=' + socitm.conf.code + '&lang_code=' + lang },
                        { label: 'No, not this time', participate: false, language: lang, css: 'socitm_button socitm_btn_n', href: '#' }
                    ]
                };
            } break;
        }
    }
};

socitm.utils = {
    getCookie: function (key) {
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(key + socitm.conf.supersetid + "=");
            if (c_start != -1) {
                c_start = c_start + key.length + socitm.conf.supersetid.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) c_end = document.cookie.length;
                return unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    },
    addElement: function (type, attribs, dest) {
        var elem = document.createElement(type);
        for (var prop in attribs) {
            if (attribs.hasOwnProperty(prop)) {
                if (prop != 'class') {
                    elem.setAttribute(prop, attribs[prop]);
                } else {
                    elem.setAttribute('class', attribs[prop]) ||
                    elem.setAttribute('className', attribs[prop]);
                }
            }
        }
        if (dest != null)
            document.getElementsByTagName(dest)[0].appendChild(elem);

        return elem;
    },
    addClick: function (obj, handler) {
        obj.clickhandler = handler;

        if (obj.addEventListener) {
            obj.addEventListener("click", function (e) { obj['clickhandler'](e); }, true);
        } else if (obj.attachEvent) {
            obj.attachEvent("onclick", function (e) { obj['clickhandler'](e); });
        } else {
            var originalHandler = obj["onclick"];
            if (originalHandler) {
                obj["onclick"] = function (e) { originalHandler(e); obj['clickhandler'](e); };
            } else {
                obj["onclick"] = obj['clickhandler'];
            }
        }

        return false;
    },
    slide: function (direction, elem) {
        var instanceheight = parseInt(elem.clientHeight);
        var time = 500, interval = 50, increment = 0, position = 0;

        var init = (new Date()).getTime();

        if (direction == 'up') {
            position = 0 - instanceheight;
            var increment = instanceheight / (time / interval);
        } else {
            var increment = (instanceheight / (time / interval)) * -1;
        }

        var timer = setInterval(function () {
            var instance = (new Date()).getTime() - init; //animating time
            if (instance <= time) { //0 -> time seconds
                position += increment;
                elem.style.bottom = position + 'px';
            } else {
                elem.style.bottom = '0px';
                clearInterval(timer);
            }
        }, interval);
    },
    setCookie: function (key, value, expire) {
        var expirydate = new Date();
        expirydate.setDate(expirydate.getDate() + expire);
        document.cookie = key + socitm.conf.supersetid + "=" + escape(value) + ((expire == null) ? "" : ";expires=" + expirydate.toGMTString()) + ";path=/";
    },
    getJSON: function (url) {
        var s = document.createElement('SCRIPT');
        s.src = url;
        document.getElementsByTagName('HEAD')[0].appendChild(s);

        return true;
    },
    getContent: function (url) {
        var xmlHttp = null;

        if (!url.indexOf('http') == 0) url = location.protocol + '//' + location.hostname + ((url.indexOf('/') == 0) ? url : '/' + url);

        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlHttp = new XMLHttpRequest();
        }
        else {// code for IE6, IE5
            xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
        }

        xmlHttp.open("GET", url, false);
        xmlHttp.send(null);

        return xmlHttp.responseText;
    },
    areCookiesEnabled: function () {
        this.setCookie("socitm_test_cookies", "123", 365);
        var cookieValue = this.getCookie("socitm_test_cookies");
        if (cookieValue == "123") {
            this.setCookie("socitm_test_cookies", "123", -365); //Delete the cookie.
            return true;
        } else {
            return false;
        }
    },
    getHeight: function () {
        var myHeight = 0;
        if (typeof (window.innerWidth) == 'number') { //Non-IE
            myHeight = window.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) { //IE 6+ in 'standards compliant mode'
            myHeight = document.documentElement.clientHeight;
        } else if (document.body && document.body.clientHeight) { //IE 4 compatible
            myHeight = document.body.clientHeight;
        }
        return myHeight;
    },
    getWidth: function () {
        var myWidth = 0;
        if (typeof (window.innerWidth) == 'number') { //Non-IE
            myWidth = window.innerWidth;
        } else if (document.documentElement && document.documentElement.clientWidth) { //IE 6+ in 'standards compliant mode'
            myWidth = document.documentElement.clientWidth;
        } else if (document.body && document.body.clientWidth) { //IE 4 compatible
            myWidth = document.body.clientWidth;
        }
        return myWidth;
    },
    parseConfig: function (json) {
        if (json) {
            for (var jProp in json) {
                for (var cProp in socitm.conf) {
                    if (jProp == cProp && json[jProp] != null && json[jProp].toString().length > 0) {
                        if (socitm.conf.debug) console.log('Updating the configuration for `' + cProp + '` from `' + socitm.conf[cProp] + '` to `' + json[jProp] + '`');
                        socitm.conf[cProp] = json[jProp];
                    }
                }
            }
        }
        socitm.conf.loaded = true;
    },
    trim: function (str) {
        return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    }
};

setTimeout(function () { socitm.base.init(); }, 250);