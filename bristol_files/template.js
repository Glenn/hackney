function asAudio(value, key, data) {
    var strAudio = '';
    // Replace conditions with proper image checking logic!
    if (value != null && value != 'Null' && value != '' && value != ' ' && value != '?' && value != '#' && value != 'NA' && value != 'N/A' && value != 'Not applicable' && value != 'Does not apply' && value != 'Unspecified' && value != 'As above') {
        var strAudioLink = '<tr valign="top"><td colspan="2"><a href="' + value + '" target="_blank">Open audio file in new window</a></td></tr>';
        strAudio = '<tr valign="top"><td colspan="2"><audio controls="controls" height="50px" width="300px"><source src="' + value + '" type="audio/mpeg" /><embed height="50px" width="300px" src="' + value + '" /></audio></td></tr>' + strAudioLink;
    }
    return strAudio;
}
function asConditional(value, key, data) {
    var strConditional = '';
    // Split alias and key
    var keySplit = key.split("; ");
    if (keySplit[1] == data[keySplit[2]]) {
        strConditional = '<tr valign="top"><td colspan="2">' + keySplit[0].replace('http', 'http:') + '</td></tr>';
    }
    return strConditional;
}
function asCCReplies(value, key, data) {
    strCCThreadID = value;
    var deferred = dojo.Deferred();
    var CCRQuery = new esri.tasks.Query();
    CCRQuery.outFields = ["*"];
    CCRQuery.where = "THREAD = '" + strCCThreadID + "'";
    // CC reply layer ID stored during layer loading
    var CCRQueryTask = new esri.tasks.QueryTask(LIMapServiceURL + '/' + intCCRLayerID);
    CCRQueryTask.execute(CCRQuery, function (CCRQueryResults) {
        var strCCR = '';
        for (var i = 0, il = CCRQueryResults.features.length; i < il; i++) {
            strCCR += '<hr /><table>';
            strVisitor = '' + CCRQueryResults.features[i].attributes['VISITOR'];
            var strCreated = new Date(CCRQueryResults.features[i].attributes['CREATED']);
            strCCR += '<tr><td width="67">Posted:&nbsp;</td><td>' + strCreated + '</td><tr>';
            if (strVisitor != '' && strVisitor != 'null') strVisitor += '<tr><td colspan="2">By:&nbsp;' + strVisitor + '</td><tr>';
            var strImage = '';
            var strImageLink = '';
            strImageURL = '' + CCRQueryResults.features[i].attributes['IMAGES'];
            if (strImageURL != '' && strImageURL != 'null') {
                strImageLink = '<tr valign="top"><td colspan="2"><a href="' + strImageURL + '" target="_blank">View full-size image</a></td></tr>';
                strImage = '<tr valign="top"><td colspan="2"><img class="idImage" src="' + strImageURL + '" /></td></tr>' + strImageLink;
            }
            strCCR += strImage;
            strCCR += '<tr valign="top"><td>Reply:&nbsp;</td><td>' + CCRQueryResults.features[i].attributes['NOTES'] + '</td></tr></table>';
        }
        syncFrmCC(data['Title'], data['Type']);
        strCCR += '<hr /><a href="#" onclick="pnlLI.expand();tpLI.setActiveTab(\'tabLIContrib\');syncFrmCC(\'' + data['Title'] + '\', \'' + data['Type'] + '\');">Add a reply</a>';
        var divCCReplies = dojo.byId('ccReplies');
        divCCReplies.innerHTML = strCCR;
    });
    return '<tr><td colspan="2"><div id="ccReplies" /></td></tr>';
}
function asEmail(value, key, data) {
    try {
        // Split alias and key
        var keySplit = key.split("; ");
        if (keySplit[0] != key) {
            key = keySplit[1];
            value = data[key];
            key = keySplit[0];
        }
    }
    catch (e) { }
    var strEmail = '';
    // Replace conditions with proper email checking logic!
    if (value != null && value != 'Null' && value != '' && value != ' ' && value != '?' && value != '#' && value != 'NA' && value != 'N/A' && value != 'Not applicable' && value != 'Does not apply' && value != 'Unspecified' && value != 'As above') {
        strEmail = '<tr valign="top"><td width="50">' + key.replace(/\s/g, '&nbsp;') + ':&nbsp;</td><td><a href="mailto:' + value + '">' + value + '</a></td></tr>';
    }
    return strEmail;
}
function asHeading(value, key, data) {
    try {
        var keySplit = key.split("; ");
        var separator = ", ";
        var keyIndex = 0;
        var strKeyVal = '';
        if (keySplit.length > 1) {
            value = '';
            // Check for list separator
            if (keySplit[1].charAt(0) == '"') {
                separator = keySplit[1].replace(/\"/g, '');
                keyIndex = 2;
            }
            while (keyIndex < keySplit.length) {
                key = keySplit[keyIndex];
                strKeyVal = data[key];
                if (strKeyVal != null && strKeyVal != 'Null' && strKeyVal != '' && strKeyVal != ' ' && strKeyVal != '?' && strKeyVal != '#' && strKeyVal != 'NA' && strKeyVal != 'N/A' && strKeyVal != 'Not applicable' && strKeyVal != 'Does not apply' && strKeyVal != 'Unspecified' && strKeyVal != 'As above') {
                    if (value != '') value += separator;
                    value += strKeyVal;
                }
                keyIndex += 1;
            }
        }
    }
    catch (e) { }
    var strHeading = '';
    if (value != null && value != 'Null' && value != '' && value != ' ' && value != '?' && value != '#' && value != 'NA' && value != 'N/A' && value != 'Not applicable' && value != 'Does not apply' && value != 'Unspecified' && value != 'As above') {
        strHeading = '<tr valign="top"><td colspan="2"><b>' + value + '</b></td></tr>';
    }
    return strHeading;
}
function asHTML(value, key, data) {
    if (value != null && value != 'Null' && value != '') return '<tr><td colspan="2"><div style="width:' + (jsMap.infoWindow.width - 34) + 'px;overflow:auto">' + value + '</div></td></tr>';
}
function asImage(value, key, data) {
    var strImage = '';
    // Replace conditions with proper image checking logic!
    if (value != null && value != 'Null' && value != '' && value != ' ' && value != '?' && value != '#' && value != 'NA' && value != 'N/A' && value != 'Not applicable' && value != 'Does not apply' && value != 'Unspecified' && value != 'As above') {
        var strImageLink = '<tr valign="top"><td colspan="2"><a href="' + value + '" target="_blank">View full-size image</a></td></tr>';
        strImage = '<tr valign="top"><td colspan="2"><img class="idImage" src="' + value + '" /></td></tr>' + strImageLink;
    }
    return strImage;
}
function asLink(value, key, data) {
    try {
        var keySplit = key.split("; ");
        var urlStart = '';
        var urlEnd = '';
        var linkText = "View";
        if (keySplit[0] != key) {
            if (keySplit.length > 2) {
                urlStart = strProtocol + "//" + keySplit[1];
                key = keySplit[2];
                if (keySplit.length > 3) urlEnd = keySplit[3];
            }
            else {
                key = keySplit[1];
            }
            value = urlStart + data[key] + urlEnd;
            key = keySplit[0].split(" | ");
            if (key[0] != keySplit[0]) {
                linkText = key[1];
            }
            key = key[0];
        }
    }
    catch (e) { }
    var strLink = '';
    // Replace conditions with proper URL checking logic!
    if (value != null && value != 'Null' && value != '' && value != ' ' && value != '?' && value != '#' && value != 'NA' && value != 'N/A' && value != 'Not applicable' && value != 'Does not apply' && value != 'Unspecified' && value != 'As above') {
        strLink = '<tr valign="top"><td width="50">' + key.replace(/\s/g, '&nbsp;') + ':&nbsp;</td><td><a href="' + value + '" target="_blank">' + linkText + '</a></td></tr>';
    }
    return strLink;
}
function asList(value, key, data) {
    try {
        var keySplit = key.split("; ");
        var separator = '; ';
        if (keySplit[0] != key) {
            // Check for list separator
            if (keySplit[0].charAt(0) == '"') {
                separator = keySplit[0].replace(/\"/g, '');
                key = keySplit[1];
                value = data[key];
            }
            else if (keySplit[1].charAt(0) == '"') {
                separator = keySplit[1].replace(/\"/g, '');
                key = keySplit[2];
                value = data[key];
                key = keySplit[0];
            }
        }
        else {
            key = keySplit[0];
            value = data[key];
        }
        separator = separator.replace(/\s/g, '\\s');
        separator = separator.replace(/\./g, '\\.');
        separator = new RegExp(separator, 'g');
    }
    catch (e) { }
    var strList = '';
    if (value != null && value != 'Null' && value != '' && value != ' ' && value != '?' && value != '#' && value != 'NA' && value != 'N/A' && value != 'Not applicable' && value != 'Does not apply' && value != 'Unspecified' && value != 'As above') {
        if (value.search(separator) != -1) {
            strList = '<tr valign="top"><td width="50">' + key.replace(/\s/g, '&nbsp;') + ':&nbsp;</td><td><table><tr valign="top"><td>&bull;&nbsp;</td><td>' + value.replace(separator, '</td></tr><tr valign="top"><td>&bull;&nbsp;</td><td>') + '</td></tr></table></td></tr>';
        }
        else {
            strList = '<tr valign="top"><td width="50">' + key.replace(/\s/g, '&nbsp;') + ':&nbsp;</td><td>' + value + '</td></tr>';
        }
    }
    return strList;
}
function asSAContactInfo(value, key, data) {
    var strFiller = '<span style="width:20x" />';
    var strSAContactInfo = '<table style="padding:0px;margin:-2px;border:0px;width:95%"><tr><td width="50">Created&nbsp;by:&nbsp;</td><td>' + strFiller + '<a href="mailto:' + value + '">' + value + '</a></td></tr>';
    Ext.net.DirectMethods.getSAContactInfo(
        value,
        {
            url: 'default.aspx',
            success: function (response) {
                var saContactInfo = Ext.decode(response);
                var strFirstName = saContactInfo.FirstName;
                var strLastName = saContactInfo.LastName;
                if (strFirstName != '' || strLastName != '') {
                    strSAContactInfo = strSAContactInfo + '<tr><td>Name:&nbsp;</td><td>' + strFiller + strFirstName + ' ' + strLastName + '</td></tr>';
                }
                var strTelNo = saContactInfo.TelNo;
                if (strTelNo != '') {
                    strSAContactInfo = strSAContactInfo + '<tr><td>Telephone:&nbsp;</td><td>' + strFiller + strTelNo + '</td></tr>';
                }
                var strOrganisation = saContactInfo.Organisation;
                if (strOrganisation != '') {
                    strSAContactInfo = strSAContactInfo + '<tr><td>Organisation:&nbsp;</td><td>' + strFiller + strOrganisation + '</td></tr>';
                }
                var divSAContactInfo = dojo.byId('saContactInfo');
                divSAContactInfo.innerHTML = strSAContactInfo + '</table>';
            },
            failure: function (error) {
                var divSAContactInfo = dojo.byId('saContactInfo');
                divSAContactInfo.innerHTML = strSAContactInfo + '</table>';
            }
        }
    );
    return '<tr><td colspan="2"><div id="saContactInfo" /></td></tr>';
}
function asSARelate(value, key, data) {
    if (blnIsSAUserEditor) {
        syncFrmSARelate(data['Property reference']);
        var strSAR = '<hr /><a href="#" onclick="pnlAsset.expand();tpAsset.setActiveTab(\'tabAssetContrib\');syncFrmSARelate(\'' + data['Property reference'] + '\');">Add a related aspiration</a>';
        return '<tr><td colspan="2">' + strSAR + '</td></tr>';
    }
}
function asSAReplies(value, key, data) {
    strSAParentID = value;
    var deferred = dojo.Deferred();
    var SARQuery = new esri.tasks.Query();
    SARQuery.outFields = ["*"];
    SARQuery.where = "PARENT_KEY = " + strSAParentID + ' ORDER BY CREATED_DATE';
    // SA reply layer ID stored during layer loading
    var SARQueryTask = new esri.tasks.QueryTask(AssetMapServiceURL + '/' + intSARLayerID);
    SARQueryTask.execute(SARQuery, function (SARQueryResults) {
        var strSAR = '';
        for (var i = 0, il = SARQueryResults.features.length; i < il; i++) {
            strSAR += '<hr /><table style="padding:0px;margin:-2px">';
            strSubmitter = SARQueryResults.features[i].attributes['CONTACT_USER_ID'];
            var strCreated = new Date(SARQueryResults.features[i].attributes['CREATED_DATE']);
            strSAR += '<tr><td width="67">Submitted:&nbsp;</td><td>' + strCreated + '</td><tr>';
            if (strSubmitter != '') strSAR += '<tr><td>By:&nbsp;</td><td>' + strSubmitter + '</td><tr>';
            strSAR += '<tr valign="top"><td>Reply:&nbsp;</td><td>' + SARQueryResults.features[i].attributes['ASPIRATION_COMMENT'] + '</td></tr></table>';
        }
        if (blnIsSAUserEditor) {
            syncFrmSAReply(data['MI_PRINX'], data['Property reference'], data['Type of aspiration'], data['Type of location']);
            strSAR += '<hr /><a href="#" onclick="pnlAsset.expand();tpAsset.setActiveTab(\'tabAssetContrib\');syncFrmSAReply(\'' + data['MI_PRINX'] + '\', \'' + data['Property reference'] + '\', \'' + data['Type of aspiration'] + '\', \'' + data['Type of location'] + '\');">Add a reply</a>';
        }
        var divSAReplies = dojo.byId('saReplies');
        divSAReplies.innerHTML = strSAR;
    });
    return '<tr><td colspan="2"><div id="saReplies" /></td></tr>';
}
function asSAStatus(value, key, data) {
    var strSAS = '';
    var isRecordEditor = false;
    recordUser = data['Posted by'];
    if (recordUser != '' && blnIsSAUserEditor && typeof idMgr.credentials[0] != 'undefined') {
        var currentUser = idMgr.credentials[0].userId;
        if (recordUser == currentUser) {
            isRecordEditor = true;
        }
    }
    if (isRecordEditor) {
        strSAS = '<tr><td width="50">Status:&nbsp;</td><td><select id="saStatus" name="saStatus" onChange="updateSAStatus(\'' + data['MI_PRINX'] + '\', saStatus.options[saStatus.selectedIndex].value);"><option value="Current">Current</option><option value="Closed">Closed</option></select></td></tr>';
        strSAS = strSAS.replace(value + '"', value + '" selected="true"');
    }
    else {
        strSAS = '<tr><td width="50">Status:&nbsp;</td><td>' + value + '</td></tr>';
    }
    return strSAS;
}
function asText(value, key, data) {
    var strAlias = key;
    try {
        var keySplit = key.split("; ");
        var separator = ", ";
        var keyIndex = 0;
        var strKeyVal = '';
        strAlias = keySplit[0];
        if (keySplit.length > 1) {
            value = '';
            // Check for list separator
            var keyIndex = 1;
            if (keySplit[1].charAt(0) == '"') {
                separator = keySplit[1].replace(/\"/g, '');
                keyIndex = 2;
            }
            while (keyIndex < keySplit.length) {
                key = keySplit[keyIndex];
                strKeyVal = data[key];
                if (strKeyVal != null && strKeyVal != 'Null' && strKeyVal != '' && strKeyVal != ' ' && strKeyVal != '?' && strKeyVal != '#' && strKeyVal != 'NA' && strKeyVal != 'N/A' && strKeyVal != 'Not applicable' && strKeyVal != 'Does not apply' && strKeyVal != 'Unspecified' && strKeyVal != 'As above') {
                    if (value != '') value += separator;
                    value += strKeyVal;
                }
                keyIndex += 1;
            }
        }
    }
    catch (e) { }
    var strText = '';
    if (value != null && value != 'Null' && value != '' && value != ' ' && value != '?' && value != '#' && value != 'NA' && value != 'N/A' && value != 'Not applicable' && value != 'Does not apply' && value != 'Unspecified' && value != 'As above') {
        if (strAlias.length > 0) {
            strText = '<tr valign="top"><td width="50">' + strAlias.replace(/\s/g, '&nbsp;') + ':&nbsp;</td><td>' + value + '</td></tr>';
        }
        else {
            strText = '<tr valign="top"><td colspan="2">' + value + '</td></tr>';
        }
    }
    return strText;
}
function asSize(value, key, data) {
    try {
	var maxWidth = jsMap.width / 4 * 3;
	if (maxWidth > 480) maxWidth = 480;
	var maxHeight = jsMap.height / 4 * 3;
	if (maxHeight > 400) maxHeight = 400;
	var keySplit = key.split("; ");
	var widthPos = 0;
        if (keySplit.length > 2) {
            key = keySplit[0];
            value = data[key];
            widthPos = 1;
        }
	else {
	    value = '1';
	}
        var newWidth = parseInt(keySplit[widthPos]);
        if (newWidth > maxWidth) newWidth = maxWidth;
        var newHeight = parseInt(keySplit[widthPos + 1]);
        if (newHeight > maxHeight) newHeight = maxHeight;
        if (value != null && value != 'Null' && value != '' && value != ' ' && value != '?' && value != '#' && value != 'NA' && value != 'N/A' && value != 'Not applicable' && value != 'Does not apply' && value != 'Unspecified' && value != 'As above') {
            jsMap.infoWindow.resize(newWidth, newHeight);
        }
    }
    catch (e) {
    }
}
