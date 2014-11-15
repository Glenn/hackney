dojo.require("esri.tasks.identify");
var strLastAddrSearchType = '';
var zoomX = '';
var zoomY = '';
var strUserOrg = '';
var layerTabInfos = new Array();
var spatialQueryResults;
var currentRecord = null;
var recordUser = '';
var HERGroupIDs = [];
var mmLayers = [];
var drawnShape;

function mapReady() {
    if (strDLUPRNs != null) {
        if (strDLPostCode != null) {
            locatePostCode();
        }
        else {
            locateAddresses();
        }
    }
    else {
        if (strDLUPRN != null) {
            locateAddress(strDLUPRN);
        }
        if (strDLX != '' && strDLY != '') {
            map.zoomTo(strDLX, strDLY, strDLLevel);
        }
    }
    strDLLevel = 250;
    esri.config.defaults.io.proxyUrl = 'printmap.ashx';
}

function zoomToStreetWithUPRN(strStreetSearchUPRN) {
    Ext.net.DirectMethod.request({
        url: '../csw_av/Service.svc/REST/locateStreetbyUPRN/' + strStreetSearchUPRN,
        cleanRequest: true,
        method: 'GET',
        json: true,
        success: function (streetData) {
            //Zoom to extent of street (start and end points)
            var streetExtentX = streetData.END_EASTING - streetData.START_EASTING;
            var streetExtentY = streetData.END_NORTHING - streetData.START_NORTHING;
            var streetCentreX = streetData.END_EASTING - (streetExtentX / 2);
            var streetCentreY = streetData.END_NORTHING - (streetExtentY / 2);
            var bestExtent;
            if (Math.abs(streetExtentX) > Math.abs(streetExtentY)) { bestExtent =  Math.abs(streetExtentX) } else { bestExtent =  Math.abs(streetExtentY) };
            if (bestExtent < 250) bestExtent = 250;
            if (streetCentreX > 0 && streetCentreY > 0) map.zoomTo(streetCentreX, streetCentreY, bestExtent);
        },
        failure: function (error) {
        }
    });
}

function textualAddressSearch(strSearch) {
    lblAddressStatus.setText('<div align="right">Searching...</div>', false);
    lblAddressStatus.setText(lblAddressStatus.getText() + strAddressBlurb, false);
    strSearch = strSearch.replace(/[^a-zA-Z 0-9]+/g, '');
    Ext.net.DirectMethod.request({
        //url: '../csw_test/addressSearch.asmx/textualAddressSearch?searchText=' + strSearch,
        url: '../csw_av/Service.svc/REST/ADDRESSSEARCH/TEXTUAL/' + cbAddrSearchType.value + '/' + strSearch,
        cleanRequest: true,
        method: 'GET',
        json: true,
        success: function (addressData) {
            if (cbAddrSearchType.value == 'llpg') {
                gpAddresses.getColumnModel().setHidden(3, true);
                gpAddresses.getColumnModel().setHidden(4, true);
                pnlExplorer.setWidth(350); pnlWrapper.syncSize(); lblAddressStatus.setWidth(350);
                strLastAddrSearchType = 'llpg';
            }
            else {
                gpAddresses.getColumnModel().setHidden(3, false);
                gpAddresses.getColumnModel().setHidden(4, false);
                pnlExplorer.setWidth(430); pnlWrapper.syncSize(); lblAddressStatus.setWidth(430);
                strLastAddrSearchType = 'wlpg';
            }
            //dsAddresses.loadData(Ext.util.JSON.decode(addressData));
            dsAddresses.loadData(addressData);
            var intResults = dsAddresses.getTotalCount();
            if (intResults == 0) {
                lblAddressStatus.setText('<div align="right">No matching addresses</div>', false);
            }
            else if (intResults == 1) {
                lblAddressStatus.setText('<div align="right">' + intResults + ' matching address</div>', false);
                //reAddress.expandRow(0);
                rsmAddresses.selectRow(0);
            }
            else {
                lblAddressStatus.setText('<div align="right">' + intResults + ' matching addresses</div>', false);
            }
            lblAddressStatus.setText(lblAddressStatus.getText() + strAddressBlurb, false);
            sbAddressStatus.syncSize();
        },
        failure: function (error) {
            dsAddresses.removeAll();
            lblAddressStatus.setText('<div align="right">' + 'No matching addresses</div>', false);
            lblAddressStatus.setText(lblAddressStatus.getText() + strAddressBlurb, false);
            sbAddressStatus.syncSize();
        }
    });
}
function expandAddressResult(thisRE, record, thisBodyEl, thisRowIndex) {
    rsmAddresses.selectRow(thisRowIndex);
    lblUPRN.setText(record.data.UPRN);
    locateAddress(record.data.UPRN);
}
function locatePostCode() {
    Ext.net.DirectMethod.request({
        //url: '../csw_test/addressSearch.asmx/locateUPRNs?uprns='+record.data.UPRN,
        url: '../csw_av/Service.svc/REST/POSTCODESEARCH/TEXTUAL/' + strDLPostCode,
        cleanRequest: true,
        method: 'GET',
        json: true,
        success: function (pcLoc) {
            locateAddresses(pcLoc.Data)
        },
        failure: function (error) {
        }
    });
}
function locateAddresses(postcodeLocation) {
    Ext.net.DirectMethod.request({
        //url: '../csw_test/addressSearch.asmx/locateUPRNs?uprns='+record.data.UPRN,
        url: '../csw_av/Service.svc/REST/locateUPRNs/' + strDLUPRNs,
        cleanRequest: true,
        method: 'GET',
        json: true,
        success: function (addressLocations) {
            var addrMinX = '';
            var addrMaxX = '';
            var addrMinY = '';
            var addrMaxY = '';
            //var addrLabel = 0;
            if (postcodeLocation != null) {
                addrMinX = addrMaxX = postcodeLocation[0].EASTING;
                addrMinY = addrMaxY = postcodeLocation[0].NORTHING;
                //map.markAnotherAddress(postcodeLocation[0].EASTING, postcodeLocation[0].NORTHING, addrLabel);
                map.markAnotherAddress(postcodeLocation[0].EASTING, postcodeLocation[0].NORTHING, '0');
                //var addrLabel = 1;
            }
            Ext.each(addressLocations.Data, function (addressLoc) {
                //map.markAnotherAddress(addressLoc.X, addressLoc.Y, addrLabel);
                //addrLabel += 1;
                map.markAnotherAddress(addressLoc.X, addressLoc.Y, addressLoc.Anno);
                if (addrMinX == '' || addressLoc.X < addrMinX) addrMinX = addressLoc.X;
                if (addrMaxX == '' || addressLoc.X > addrMaxX) addrMaxX = addressLoc.X;
                if (addrMinY == '' || addressLoc.Y < addrMinY) addrMinY = addressLoc.Y;
                if (addrMaxY == '' || addressLoc.Y > addrMaxY) addrMaxY = addressLoc.Y;
            });
            if (addrMinX != '' && addrMaxX != '' && addrMinY != '' && addrMaxY != '') {
                //Zoom to extent rectangle
                var addrWidth = addrMaxX - addrMinX;
                var addrHeight = addrMaxY - addrMinY;
                var addrGreater = addrHeight;
                if (addrWidth - addrHeight > 0) addrGreater = addrWidth;
                if (addrGreater < 250) addrGreater = 250;
                var addrCentX = addrMaxX - (addrWidth / 2);
                var addrCentY = addrMaxY - (addrHeight / 2);
                map.zoomTo(addrCentX, addrCentY, addrGreater);
            }
        },
        failure: function (error) {
        }
    });
}
function locateAddress(uprn) {
    Ext.net.DirectMethod.request({
        //url: '../csw_test/addressSearch.asmx/locateUPRN?uprn='+record.data.UPRN,
        url: '../csw_av/Service.svc/REST/locateUPRN/' + cbAddrSearchType.value + '/' + uprn,
        cleanRequest: true,
        method: 'GET',
        json: true,
        success: function (addressLocation) {
            var addrLoc = addressLocation;
            var addressPoint = new Ext.data.JsonStore({
                root: 'Data',
                fields: [{ x: 'X', y: 'Y'}],
                listeners: { load: addressLocated }
            });
            addressPoint.loadData(addrLoc);
        },
        failure: function (error) {
        }
    });
}
function addressLocated(addressLocation) {
    addressLocation.each(function (addressXY) {
        strDLAddrX = addressXY.json.X;
        strDLAddrY = addressXY.json.Y;
        if (strDLLayer != null && strDLUPRN != null && strDLX - strDLX == 0 && strDLY - strDLY == 0) {

        }
        else {
            map.zoomTo(strDLAddrX, strDLAddrY, strDLLevel);
        }
        map.markAddress(strDLAddrX, strDLAddrY);
    });
}

function frmHERCancel() {
    resetFrmHERContrib();
}

function frmHERSubmit() {
    var frmHERURL = 'herasset.aspx';
    fpHER.getForm().submit({
        url: frmHERURL,
        waitMsg: 'Uploading - please wait...',
        success: function (form, action) {
            Ext.Msg.show({
                buttons: Ext.Msg.OK,
                fn: function () { winFrmHER.hide(); resetFrmHERContrib(); },
                msg: action.result.msg,
                title: 'Thank you for your contribution'
            });
        },
        failure: function (form, action) {
            switch (action.failureType) {
                case Ext.form.Action.CLIENT_INVALID:
                    Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                    break;
                case Ext.form.Action.CONNECT_FAILURE:
                    Ext.Msg.alert('Failure', 'Ajax communication failed');
                    break;
                case Ext.form.Action.SERVER_INVALID:
                    Ext.Msg.alert('Invalid submission received', action.result.msg);
            }
        }
    });
}

function frmAssetCancel() {
    resetFrmSA();
    recordUser = '';
}

function frmSASubmit() {
    var assetToken = '';
    try { assetToken = idMgr.credentials[0].token; } catch (e) { };
    var featToSend;
    var olWkt;
    var currentRecordFeature = null;
    if (currentRecord != null) currentRecordFeature = currentRecord.feature;
    if (rbAssetContribNew.checked) {
        featToSend = drawnShape;
    }
    else {
        featToSend = currentRecordFeature;
    }
    // Convert point (or extent?) feature to mini-polygon
    if (featToSend.geometry.type == 'point') {
        var fX = featToSend.geometry.x;
        var fY = featToSend.geometry.y;
        // 'Feature buffer'
        var fb = 10;
        var polyJson = {"geometry":{"rings":[[[fX-fb,fY-fb],[fX-fb,fY+fb],[fX+fb,fY+fb],[fX+fb,fY-fb],[fX-fb,fY-fb]]],"spatialReference":{"wkid":27700}}};
        featToSend = new esri.Graphic(polyJson);
    };
    if (featToSend == currentRecordFeature) {
        olWkt = '';
    }
    else {
        var featGeo = featureToGeo(featToSend, 'Polygon');
        var strGeo = Ext.util.JSON.encode(featGeo);
        var olGeoReader = new OpenLayers.Format.GeoJSON;
        var olGeo = olGeoReader.read(strGeo);
        var olWktWriter = new OpenLayers.Format.WKT;
        olWkt = olWktWriter.write(olGeo);
    }
    Ext.net.DirectMethods.submitSAComment(
        strDLRegion,
        assetToken,
        recordUser,
        idMgr.credentials[0].userId,
        txtSAParentKey.getValue(),
        txtSAPropertyRef.getValue(),
        cbbSAAspirationType.getValue(),
        cbbSALocationType.getValue(),
        txtSAComment.getValue(),
        olWkt,
        {
            url: 'default.aspx',
            success: function (result, action) {
                var saResult = Ext.decode(result);
                if (saResult.success) {
                    resetFrmSA();
                    if (rbAssetContribNew.checked) {
                        Ext.Msg.confirm('Thank you for your comment', saResult.msg + '<br />Would you like to plot another new feature?', function (buttonClicked) {
                            if (buttonClicked != 'yes') {
                                rgAssetContribTypes.reset();
                            }
                        });
                    }
                    else {
                        Ext.Msg.alert('Thank you for your comment', saResult.msg);
                    }
                }
                else {
                    Ext.Msg.alert('Problem with submitted data', saResult.msg);
                }
                recordUser = '';
            },
            failure: function (errorMessage) {
                Ext.Msg.show({
                    title: 'Error sending data',
                    msg: errorMessage,
                    width: 512,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.INFO
                });
                recordUser = '';
            }
        }
    );
}

function frmLICancel() {
    resetFrmCC();
}

function frmCCSubmit() {
    if (map.isCCReplying) {
        hdnCCThreadID.setValue(strCCThreadID);
        txtCCTitleAdv.enable();
        rgCCTypeAdv.enable();
    }
    else {
        hdnCCThreadID.setValue('');
    }
    var frmCCURL = 'cccomment.aspx';
    fpCC.getForm().submit({
        url: frmCCURL,
        waitMsg: 'Uploading - please wait...',
        success: function (form, action) {
            try {
                winFrmCCAdvanced.hide();
                resetFrmCC();
                Ext.Msg.getDialog().on('beforehide', function () {
                    jsMap.setExtent(jsMap.extent);
                    jsMap.infoWindow.hide();
                }, this, {
                    single: true
                });
                Ext.Msg.alert('Thank you for your contribution.', action.result.msg);
            }
            catch (e) {
                Ext.Msg.alert('Your contribution has not been received', 'Sorry, an error occurred when handling the form you submitted.');
            }
        },
        failure: function (form, action) {
            switch (action.failureType) {
                case Ext.form.Action.CLIENT_INVALID:
                    Ext.Msg.alert('Failure', 'Form fields may not be submitted with invalid values');
                    break;
                case Ext.form.Action.CONNECT_FAILURE:
                    Ext.Msg.alert('Failure', 'Ajax communication failed');
                    break;
                case Ext.form.Action.SERVER_INVALID:
                    Ext.Msg.alert('Invalid submission received', action.result.msg);
            }
        }
    });
}

function toggleExplorer() {
    if (pnlExplorer.collapsed) {
        pnlExplorer.expand();
        return false;
    }
    else {
        pnlExplorer.collapse();
        return true;
    }
}

function updateHERUserPoint(pointX, pointY) {
    lblHERUserPointAdvice.hide();
    imgHERContribStep1.setImageUrl('images/complete.png');
    lblHERUserPointInfo.setText('Point selected (' + pointX + ', ' + pointY+ ').');
    lblHERUserPointInfo.show();
    txtHERUserPointX.setValue('' + pointX);
    txtHERUserPointY.setValue('' + pointY);
    pnlHERUserComment.show();
}

function updateLIUserPoint(pointX, pointY) {
    lblLIUserPointAdvice.hide();
    imgLIContribStep1.setImageUrl('images/complete.png');
    lblLIUserPointInfo.setText('Point selected (' + pointX + ', ' + pointY + ').');
    lblLIUserPointInfo.show();
    txtLIUserPointX.setValue('' + pointX);
    txtLIUserPointY.setValue('' + pointY);
    pnlLIUserComment.show();
    if (rbContribComment.checked) {
        pnlLIUserComment.setTitle('Step 3: submit your comment');
        lblFrmLIComment.setText('Simple comment form');
        txtCCComment.setFieldLabel('Comment');
        txtCCCommentAdv.setFieldLabel('Comment');
        txtCCTitle.enable();
        rgCCType.enable();
    }
    else {
        pnlLIUserComment.setTitle('Step 3: submit your reply');
        lblFrmLIComment.setText('Simple reply form');
        txtCCComment.setFieldLabel('Reply');
        txtCCCommentAdv.setFieldLabel('Reply');
        txtCCTitle.disable();
        rgCCType.disable();
    }
}

function updateAssetUserShape(assetUserShape) {
    lblAssetUserShapeAdvice.hide();
    imgAssetContribStep1.setImageUrl('images/complete.png');
    lblAssetUserShapeInfo.setText('Location selected');
    lblAssetUserShapeInfo.show();
    pnlAssetUserComment.show();
}

function resetFrmHERComment() {
    pnlHERUserComment.hide();
    txtFrmHERComment.setValue('');
    map.removeHERUserPoint();
    lblHERUserPointInfo.hide();
    lblHERUserPointInfo.setText('');
    txtHERUserPointX.setValue('');
    txtHERUserPointY.setValue('');
    imgHERContribStep1.setImageUrl('images/nextstep.png');
    lblHERUserPointAdvice.show();
    // Match contact details in advanced and basic forms
    if (txtHERUserName.getValue() == '') {
        txtHERUserName.setValue(txtFrmHERCommentUserName.getValue());
    }
    if (txtHERUserContactInfo.getValue() == '') {
        txtHERUserContactInfo.setValue(txtFrmHERCommentUserInfo.getValue());
    }
}

function resetFrmHERContrib() {
    txtHERAssetName.setValue('');
    cbbHERAssetType.setValue('');
    txtHERAssetDesc.setValue('');
    txtHERAssetRisk.setValue('');
    flAssetImage.reset();
    fpHER.show();
    // Match contact details in advanced and basic forms
    if (txtFrmHERCommentUserName.getValue() == '') {
        txtFrmHERCommentUserName.setValue(txtHERUserName.getValue());
    }
    if (txtFrmHERCommentUserInfo.getValue() == '') {
        txtFrmHERCommentUserInfo.setValue(txtHERUserContactInfo.getValue());
    }
    resetFrmHERComment();
}

function showFrmHERAdvanced() {
    pnlExplorer.setWidth(pnlWrapper.getWidth());
    pnlWrapper.syncSize();
    setTimeout('winFrmHER.show()', 250);
    // Match contact details in advanced and basic forms
    if (txtHERUserName.getValue() == '') {
        txtHERUserName.setValue(txtFrmHERCommentUserName.getValue());
    }
    if (txtHERUserContactInfo.getValue() == '') {
        txtHERUserContactInfo.setValue(txtFrmHERCommentUserInfo.getValue());
    }
}

function showFrmCCAdvanced() {
    winFrmCCAdvanced.show();
    if (rbContribComment.checked) {
        txtCCTitleAdv.enable();
        rgCCTypeAdv.enable();
        winFrmCCAdvanced.setTitle('Cherish or change - new comment');
    }
    else {
        txtCCTitleAdv.disable();
        rgCCTypeAdv.disable();
        winFrmCCAdvanced.setTitle('Cherish or change - reply to a previous comment');
    }
    syncFrmCCAdvanced();
}

function syncFrmCCAdvanced() {
    txtCCTitleAdv.setValue(txtCCTitle.getValue());
    txtCCCommentAdv.setValue(txtCCComment.getValue());
    rbCCTypeAdvCherish.setValue(rbCCTypeCherish.getValue());
    rbCCTypeAdvChange.setValue(rbCCTypeChange.getValue());
}

function resetFrmCC() {
    txtCCTitle.setValue('');
    txtCCTitleAdv.setValue('');
    rgCCType.setValue('');
    rgCCTypeAdv.setValue('');
    txtCCComment.setValue('');
    txtCCCommentAdv.setValue('');
    flCCImage.reset();
    // Match contact details in advanced and basic forms
    if (txtCCName.getValue() == '') {
        txtCCName.setValue(txtCCName.getValue());
    }
    if (txtCCEmail.getValue() == '') {
        txtCCEmail.setValue(txtCCEmail.getValue());
    }
    pnlLIUserComment.hide();
    map.removeLIUserPoint();
    lblLIUserPointInfo.hide();
    lblLIUserPointInfo.setText('');
    txtLIUserPointX.setValue('');
    txtLIUserPointY.setValue('');
    imgLIContribStep1.setImageUrl('images/nextstep.png');
    lblLIUserPointAdvice.show();
}

function syncFrmCC(strTitle, strType) {
    if (typeof rbContribReply != 'undefined') {
        rbContribReply.setValue(true);
    }
    if (map.isLICapturing && map.isCCReplying) {
        resetFrmCC();
        updateLIUserPoint(zoomX, zoomY);
        txtCCTitle.setValue(strTitle);
        if (strType == 'Cherish - a place that you love') {
            rbCCTypeCherish.setValue(true);
        }
        else {
            rbCCTypeChange.setValue(true);
        }
    }
}

function resetFrmSA() {
    txtSAPropertyRef.setValue('');
    txtSAPropertyRef.hide();
    txtSAParentKey.setValue('');
    txtSAAspirationType.setValue('');
    txtSALocationType.setValue('');
    cbbSAAspirationType.setValue('');
    cbbSALocationType.setValue('');
    txtSAAspirationType.hide();
    txtSALocationType.hide();
    cbbSAAspirationType.show();
    cbbSALocationType.show();
    txtSAComment.setValue('');
    pnlAssetUserComment.hide();
    //map.removeDrawnShape();
    lblAssetUserShapeInfo.hide();
    lblAssetUserShapeInfo.setText('');
    imgAssetContribStep1.setImageUrl('images/nextstep.png');
    lblAssetUserShapeAdvice.show();
}

function syncFrmSAReply(strParentKey, strPropertyRef, strAspirationType, strLocationType) {
    if (tpAsset.activeTab.id == 'tabAssetContrib') {
        rbAssetContribExisting.setValue(true);
        resetFrmSA();
        txtSAPropertyRef.show();
        // Select appropriate comment type
        updateAssetUserShape(currentRecord.feature);
        txtSAParentKey.setValue(strParentKey);
        txtSAPropertyRef.setValue(strPropertyRef.replace('Null', ''));
        txtSAAspirationType.setValue(strAspirationType);
        txtSALocationType.setValue(strLocationType);
        //Switch aspiration and location field types to avoid sync problems with deprecated options
        cbbSAAspirationType.hide();
        cbbSALocationType.hide();
        txtSAAspirationType.show();
        txtSALocationType.show();
    }
}

function syncFrmSARelate(strPropertyRef) {
    if (tpAsset.activeTab.id == 'tabAssetContrib') {
        rbAssetContribExisting.setValue(true);
        resetFrmSA();
        txtSAPropertyRef.show();
        // Select appropriate comment type
        updateAssetUserShape(currentRecord.feature);
        txtSAPropertyRef.setValue(strPropertyRef.replace('Null', ''));
    }
}

function updateSAStatus(strRecID, strNewStatus) {
    var assetToken = '';
    try { assetToken = idMgr.credentials[0].token; } catch (e) { };
    Ext.net.DirectMethods.updateSACommentStatus(
        strDLRegion,
        assetToken,
        strRecID,
        strNewStatus,
        {
            url: 'default.aspx',
            success: function (result, action) {
                var saResult = Ext.decode(result);
                if (saResult.success) {

                }
                else {
                    Ext.Msg.alert('Problem with submitted data', saResult.msg);
                }
            },
            failure: function (errorMessage) {
                Ext.Msg.show({
                    title: 'Error sending data',
                    msg: errorMessage,
                    width: 512,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.INFO
                });
            }
        }
    );
}

function loadAssetLayers() {
    if (gpAssetLayers.hidden == false) {
        var maskLoad = new Ext.LoadMask('gpAssetLayers', {
            removeMask: true,
            msg: "Loading..."
        });
        maskLoad.show();
    }
    var assetToken = '';
    try{assetToken = idMgr.credentials[0].token;} catch(e) {};
    Ext.net.DirectMethod.request({
        url: AssetMapServiceURL + '?f=json&token=' + assetToken,
        cleanRequest: true,
        method: 'GET',
        json: true,
        success: function (layerInfo) {
            dsAssetLayers.loadData(layerInfo);
            var grpName;
            //var toRemove = new Array();
            var intRemoved = 0;
            var referenceLayers = [];
            Ext.each(dsAssetLayers.data.items, function (item, index) {
                try {
                    if (item.data.name == 'Strategic aspirations') {
                        intSALayerID = index;
                        item.set('showTable', true);
                        openLayerTab('assetinfo', AssetMapServiceURL, item);
                    }
                    if (item.data.name == 'Strategic aspirations replies') {
                        intSARLayerID = index;
                    }
                    //if (item.data.name == 'Reference' || item.data.name == 'Visible') toRemove.push(index);
                    if (item.data.subLayerIds != null && item.data.name != 'Visible') {
                        grpName = item.data.name;
                    }
                    if (grpName == 'Reference') {
                        referenceLayers.push(index);
                    }
                    if (themeLayers.indexOf(item.data.name.toLowerCase()) != -1) {
                        item.set('layerVis', true);
                        AssetThemeLayerIDs.push(item.data.id);
                        btnAssetMap.setValue(true);
                    }
                    item.set('displayName', '<a style="color:black" target="_blank" href="metadata/?layer=' + item.data.name.replace(/\s/g, '+') + '">' + item.data.name + '</a>');
                    if (item.data.minScale != '0') item.set('displayName', item.data.displayName + ' <i>(zoom in to view)</i>');
                    else if (item.data.maxScale != '0') item.set('displayName', item.data.displayName + ' <i>(zoom out to view)</i>');
                }
                catch (e) {

                }
            });
            Ext.each(referenceLayers, function (item, index) {
                dsAssetLayers.removeAt(item - intRemoved);
                intRemoved = intRemoved + 1;
            });
            if (typeof jsMap != 'undefined') {
                mapServiceLoaded();
                for (var i = 0, j = AssetThemeLayerIDs.length; i < j; i++) { map.changeLayerVis('assetinfo', AssetThemeLayerIDs[i], true); };
            }
            maskLoad.hide();
        },
        failure: function (error) {
            if (typeof jsMap != 'undefined') {
                mapServiceLoaded();
            }
            maskLoad.hide();
        }
    });
}

function dsAssetCellClick(thisGrid, thisRowIndex, thisColIndex, e) {
    var record = thisGrid.getStore().getAt(thisRowIndex);
    var fieldName = thisGrid.getColumnModel().getDataIndex(thisColIndex);
    if (fieldName == 'layerVis') {
        var layerID = record.data.id;
        if (record.get(fieldName) == true) {
            map.changeLayerVis('assetinfo', layerID, false);
            record.set(fieldName, false);
        }
        else {
            map.changeLayerVis('assetinfo', layerID, true);
            record.set(fieldName, true);
        }
        map.updateLegend();
//        if (record.data.summaryField == '') {
//            var strToken = '';
//            try { strToken = idMgr.credentials[0].token; } catch (e) { };
//            var strQueryURL = AssetMapServiceURL + '/' + record.data.id + '/query?token=' + strToken + '&where=1%3D0&returnGeometry=false&outFields=*&f=json';
//            Ext.net.DirectMethod.request({
//                url: strQueryURL,
//                cleanRequest: true,
//                method: 'GET',
//                json: true,
//                success: function (layerInfo) {
//                    record.set('summaryField', layerInfo.fieldAliases[layerInfo.displayFieldName]);
//                },
//                failure: function (error) {

//                }
//            });
//        }
    }
    if (fieldName == 'showTable') {
        var layerID = record.data.id;
        if (record.get(fieldName) == true) {
            closeLayerTab('assetinfo', layerID);
            record.set(fieldName, false);
        }
        else {
            openLayerTab('assetinfo', AssetMapServiceURL, record);
            record.set(fieldName, true);
        }
    }
}

function loadHERLayers(forceGroupVis) {
    if (gpHERLayers.hidden == false) {
        var maskLoad = new Ext.LoadMask('gpHERLayers', {
            removeMask: true,
            msg: "Loading..."
        });
        maskLoad.show();
    }
    Ext.net.DirectMethod.request({
        url: HERMapServiceURL + '?f=json',
        cleanRequest: true,
        method: 'GET',
        json: true,
        success: function (layerInfo) {
            dsHERLayers.loadData(layerInfo);
            var grpName;
            var intRemoved = 0;
            var referenceLayers = [];
            Ext.each(dsHERLayers.data.items, function (item, index) {
                try {
                    //if (item.data.subLayerIds != null) {
                    if (item.data.subLayerIds != null && item.data.name != 'Visible') {
                        grpName = item.data.name;
                        HERGroupIDs.push(index);
                    }
                    else {
                        item.set('groupName', grpName);
                        if (grpName == 'Reference') {
                            referenceLayers.push(index);
                        }
                    }
                    if (themeLayers.indexOf(item.data.name.toLowerCase()) != -1) {
                        item.set('layerVis', true);
                        HERThemeLayerIDs.push(item.data.id);
                        if (typeof jsMap != 'undefined') {
                            btnHERMap.setValue(true);
                        }
                    }
                    item.set('sortInfo', item.data.groupName + ', ' + item.data.name);
                    item.set('displayName', '<a style="color:black" target="_blank" href="metadata/?layer=' + item.data.name.replace(/\s/g, '+') + '">' + item.data.name + '</a>');
                    if (item.data.minScale != '0') item.set('displayName', item.data.displayName + ' <i>(zoom in to view)</i>');
                    else if (item.data.maxScale != '0') item.set('displayName', item.data.displayName + ' <i>(zoom out to view)</i>');
                }
                catch (e) {

                }
            });
            Ext.each(HERGroupIDs, function (item, index) {
                dsHERLayers.removeAt(item - intRemoved);
                intRemoved = intRemoved + 1;
            });
            Ext.each(referenceLayers, function (item, index) {
                dsHERLayers.removeAt(item - intRemoved);
                intRemoved = intRemoved + 1;
            });
            dsHERLayers.applyGrouping('groupName');
            if (typeof jsMap != 'undefined') {
                mapServiceLoaded();
            }
            if (forceGroupVis) {
                Ext.each(HERGroupIDs, function (item, index) {
                    map.changeLayerVis('HER', item, false);
                });
                for (var i = 0, j = HERThemeLayerIDs.length; i < j; i++) { map.changeLayerVis('HER', HERThemeLayerIDs[i], true); };
            }
            maskLoad.hide();
        },
        failure: function (error) {
            if (typeof jsMap != 'undefined') {
                mapServiceLoaded();
            }
            maskLoad.hide();
        }
    });
}

function dsHERCellClick(thisGrid, thisRowIndex, thisColIndex, e) {
    var record = thisGrid.getStore().getAt(thisRowIndex);
    var fieldName = thisGrid.getColumnModel().getDataIndex(thisColIndex);
    if (fieldName == 'layerVis') {
        var layerID = record.data.id;
        if (record.get(fieldName) == true) {
            map.changeLayerVis('HER', layerID, false);
            record.set(fieldName, false);
        }
        else {
            map.changeLayerVis('HER', layerID, true);
            record.set(fieldName, true);
        }
        map.updateLegend();
    }
    if (fieldName == 'showTable') {
        var layerID = record.data.id;
        if (record.get(fieldName) == true) {
            closeLayerTab('HER', layerID);
            record.set(fieldName, false);
        }
        else {
            openLayerTab('HER', HERMapServiceURL, record);
            record.set(fieldName, true);
        }
    }
}

function closeLayerTab(serviceRef, layerID) {
    var tabID = 'tab_' + serviceRef + '_' + layerID
    var tab = Ext.get(tabID);
    var visTabIDs = new Array();
    if (tab != null) {
        tab.hide();
        tpTables.hideTabStripItem(tabID);
        Ext.each(tpTables.items.items, function (tpItem) {
            if (tpItem.tabEl.style.cssText.toLowerCase() != 'display: none' && tpItem.tabEl.style.cssText.toLowerCase() != 'display: none;') visTabIDs.push(tpItem.id);
        });
    }
//    var lblExp = Ext.get('exp_' + serviceRef + '_' + layerID);
//    lblExp.setVisible(false);
//    var btnCsv = Ext.get('csv_' + serviceRef + '_' + layerID);
//    btnCsv.setVisible(false);
//    var btnXls = Ext.get('xls_' + serviceRef + '_' + layerID);
//    btnXls.setVisible(false);
//    var btnXml = Ext.get('xml_' + serviceRef + '_' + layerID);
//    btnXml.setVisible(false);
    if (visTabIDs.length > 0) {
        if (tpTables.activeTab.id == tabID) tpTables.setActiveTab(visTabIDs[0]);
    }
    else {
        pnlTables.collapse();
    }
}

function openLayerTab(serviceRef, mapServiceURL, gridRecord) {
    var layerListInfo = gridRecord.data;
    var tabID = 'tab_' + serviceRef + '_' + layerListInfo.id;
    var tab = Ext.get(tabID);
    if (tab == null) {
        var strToken = '';
        if (serviceRef == "assetinfo") {
            try { strToken = idMgr.credentials[0].token; } catch (e) { };
        }
        var strQuery = '?token=' + strToken + '&f=json';
        Ext.net.DirectMethod.request({
            url: mapServiceURL + '/' + layerListInfo.id + strQuery,
            cleanRequest: true,
            method: 'GET',
            json: true,
            success: function (layerInfo) {
                if (layerInfo.type == 'Raster Layer') {
                    alert('Sorry, searches cannot be performed on raster layers.');
                    gridRecord.set('showTable', false);
                }
                else {
                    var colArray = new Array();
                    var fieldArray = new Array();
                    var dateAttFields = new Array();
                    var searchableFields = new Array();
                    var shapeCol = 'SHAPE';
                    searchableFields.push(['[any text field]', 'any text field']);
                    var intIndex = 0;
                    // Add primary display field first (I hope we can assume it's a text field!)
                    var displayFieldName = layerInfo.displayField;
                    var displayFieldAlias = '';
                    // Re-use this trick in pop-up window?
                    Ext.each(layerInfo.fields, function (item, index) {
                        if (item.name == displayFieldName) {
                            displayFieldAlias = item.alias;
                        }
                    });
                    var col = new Ext.grid.Column({
                        dataIndex: displayFieldAlias.replace(/[\s\']+/g, '_').replace(/[()]+/g, ''),
                        header: displayFieldAlias,
                        id: displayFieldName,
                        xtype: 'auto'
                    });
                    colArray.push(col);
                    fieldArray.push({
                        name: displayFieldAlias.replace(/[\s\']+/g, '_').replace(/[()]+/g, ''),
                        mapping: displayFieldName,
                        type: 'auto'
                    });
                    searchableFields.push([displayFieldName, displayFieldAlias]);
                    Ext.each(layerInfo.fields, function (item, index) {
                        var isHidden = false;
                        var strXType = 'gridcolumn';
                        var strType = 'auto';
                        var valueRenderer = null;
                        if (item.name != displayFieldName) {
                            if (item.type == 'esriFieldTypeOID') {
                                isHidden = true;
                                intIndex = index;
                                var layerTabInfo = {
                                    tabID: tabID,
                                    serviceRef: serviceRef,
                                    serviceURL: mapServiceURL,
                                    layerID: layerListInfo.id,
                                    layerName: layerListInfo.name,
                                    layerOIDName: item.name,
                                    layerOIDAlias: item.alias.replace(/[\s\']+/g, '_')
                                };
                                layerTabInfos.push(layerTabInfo);
                            }
                            else if (item.type == 'esriFieldTypeGeometry') {
                                shapeCol = item.name;
                                isHidden = true;
                            }
                            else if (item.type == 'esriFieldTypeDate') {
                                strXType = 'datecolumn';
                                strType = 'date';
                                dateAttFields.push(item.alias);
                                valueRenderer = function (v) {
                                    // Let's hope we don't have any actual data about this day!
                                    if (v != 'Tue Apr 5 23:13:20 UTC+0100 29720 B.C.') return Ext.util.Format.date(v, 'D j M Y');
                                    return ' ';
                                };
                            }
                            else {
                                // Compile list of searchable fields to populate search type drop-down
                                if (item.name != 'SHAPE.LEN' && item.name != 'SHAPE.AREA') searchableFields.push([item.name, item.alias]);
                            }
                            var col = new Ext.grid.Column({
                                dataIndex: item.alias.replace(/[\s\']+/g, '_').replace(/[()]+/g, ''),
                                header: item.alias,
                                hidden: isHidden,
                                id: item.name,
                                menuDisabled: true,
                                renderer: valueRenderer,
                                xtype: strXType
                            });
                            colArray.push(col);
                            fieldArray.push({
                                name: item.alias.replace(/[\s\']+/g, '_').replace(/[()]+/g, ''),
                                mapping: item.name,
                                type: strType
                            });
                        }
                    });
                    var col = new Ext.grid.Column({
                        dataIndex: 'EASTING',
                        header: 'EASTING',
                        hidden: true,
                        id: 'EASTING'
                    });
                    colArray.push(col);
                    fieldArray.push('EASTING');
                    col = new Ext.grid.Column({
                        dataIndex: 'NORTHING',
                        header: 'NORTHING',
                        hidden: true,
                        id: 'NORTHING'
                    });
                    colArray.push(col);
                    fieldArray.push('NORTHING');
                    col = new Ext.grid.Column({
                        dataIndex: 'MAP_LINK',
                        header: 'MAP_LINK',
                        hidden: true,
                        id: 'MAP_LINK'
                    });
                    colArray.push(col);
                    fieldArray.push('MAP_LINK');
                    var drFeature = Ext.data.Record.create(fieldArray);
                    var sortingInfo = '';
                    var strSearchValue = '';
                    var strSearchfield = '[any text field]';
                    if (strUserOrg != '' && (layerListInfo.name == 'Strategic aspirations')) {
                        strSearchValue = 'Current';
                        strSearchfield = 'STATUS';
                    }
                    var dsFeatures = new Ext.data.ArrayStore({
                        fields: drFeature,
                        idIndex: intIndex,
                        sortInfo: sortingInfo
                    });
                    var thisLayerID = layerListInfo.id;
                    var selModel = new Ext.grid.RowSelectionModel({
                        singleSelect: true,
                        listeners: {
                            rowselect: function (selectionModel, rowIndex, r) {
                                map.changeLayerVis(serviceRef, thisLayerID, true);
                                gridRecord.set('layerVis', true);
                                var zoomExtent = '';
                                // This will only work with the JavaScript map
                                try {
                                    jsMap.infoWindow.hide();
                                }
                                catch (e) {
                                }
                                zoomX = r.data.EASTING;
                                zoomY = r.data.NORTHING;
                                // Retrieve extent from MAP_LINK
                                var arrMapLink = r.data.MAP_LINK.split('&');
                                for (var idx = 0; idx < arrMapLink.length; idx++) {
                                    var par = arrMapLink[idx].split("=");
                                    if (par[0] == 'extent') {
                                        zoomExtent = par[1];
                                    }
                                }
                                if (isNaN(zoomExtent)) zoomExtent = 250;
                                if (zoomX != '' && zoomY != '') {
                                    map.zoomTo(zoomX, zoomY, zoomExtent);
                                }
                            }
                        }
                    });
                    var spatialOptions = new Array(['the whole layer'], ['the current map view']);
                    if (typeof jsMap != 'undefined') {
                        spatialOptions.push(['the selected feature']);
                        spatialOptions.push(['the drawn feature']);
                    }
                    var grid = new Ext.grid.GridPanel({
                        autoExpandColumn: displayFieldName,
                        autoExpandMin: 150,
                        autoExpandMax: 450,
                        bbar: new Ext.Toolbar({
                            height: 24,
                            items: [
                                {
                                    xtype: 'label',
                                    html: '&nbsp;',
                                    id: 'nmr_' + serviceRef + '_' + layerListInfo.id
                                },
                                { xtype: 'tbfill' },
                                {
                                    xtype: 'label',
                                    hidden: true,
                                    html: 'Export:&nbsp;',
                                    id: 'exp_' + serviceRef + '_' + layerListInfo.id
                                },
                                {
                                    text: 'CSV',
                                    hidden: true,
                                    icon: 'images/csv.png',
                                    listeners: {
                                        click: function () {
                                            requestExport('csv');
                                        }
                                    },
                                    id: 'csv_' + serviceRef + '_' + layerListInfo.id
                                },
                                {
                                    text: 'Excel',
                                    hidden: true,
                                    icon: 'images/xls.png',
                                    listeners: {
                                        click: function () {
                                            requestExport('xls');
                                        }
                                    },
                                    id: 'xls_' + serviceRef + '_' + layerListInfo.id
                                },
                                {
                                    text: 'XML',
                                    hidden: true,
                                    icon: 'images/xml.png',
                                    listeners: {
                                        click: function () {
                                            requestExport('xml');
                                        }
                                    },
                                    id: 'xml_' + serviceRef + '_' + layerListInfo.id
                                }
                            ]
                        }),
                        colModel: new Ext.grid.ColumnModel({
                            columns: colArray
                        }),
                        iconCls: 'icon-grid',
                        id: 'gp_' + serviceRef + '_' + layerListInfo.id,
                        sm: selModel,
                        store: dsFeatures,
                        tbar: new Ext.Toolbar({
                            items: [
                                {
                                    xtype: 'label',
                                    html: 'Search'
                                },
                                {
                                    xtype: 'label',
                                    hidden: eval(typeof jsMap == 'undefined'),
                                    html: '&nbsp;'
                                },
                                {
                                    xtype: 'combo',
                                    id: 'cbs_' + serviceRef + '_' + layerListInfo.id,
                                    forceSelection: true,
                                    hidden: eval(typeof jsMap == 'undefined'),
                                    typeAhead: true,
                                    triggerAction: 'all',
                                    mode: 'local',
                                    store: new Ext.data.ArrayStore({
                                        fields: [
                                            'type'
                                        ],
                                        data: spatialOptions
                                    }),
                                    valueField: 'type',
                                    displayField: 'type',
                                    value: 'the whole layer',
                                    width: 150
                                },
                                {
                                    xtype: 'label',
                                    html: '&nbsp;for&nbsp;records&nbsp;where&nbsp;'
                                },
                                {
                                    xtype: 'combo',
                                    id: 'cbt_' + serviceRef + '_' + layerListInfo.id,
                                    forceSelection: true,
                                    typeAhead: true,
                                    triggerAction: 'all',
                                    mode: 'local',
                                    store: new Ext.data.ArrayStore({
                                        fields: [
                                            'name',
                                            'alias'
                                        ],
                                        data: searchableFields
                                    }),
                                    valueField: 'name',
                                    displayField: 'alias',
                                    value: strSearchfield,
                                    width: 150
                                },
                                {
                                    xtype: 'label',
                                    html: '&nbsp;contains:&nbsp;'
                                },
                                {
                                    xtype: 'textfield',
                                    id: 'txt_' + serviceRef + '_' + layerListInfo.id,
                                    listeners: {
                                        specialkey: function (field, e) {
                                            if (e.getKey() == e.ENTER) {
                                                searchLayer(serviceRef, mapServiceURL, layerListInfo.id, layerListInfo.name, dsFeatures, drFeature, searchableFields, dateAttFields, shapeCol);
                                            }
                                        }
                                    },
                                    selectOnFocus: true,
                                    value: strSearchValue,
                                    width: 100
                                },
                                {
                                    xtype: 'label',
                                    html: '&nbsp;'
                                },
                                {
                                    text: 'Search',
                                    icon: 'images/find.png',
                                    id: 'fnd_' + serviceRef + '_' + layerListInfo.id,
                                    listeners: {
                                        click: function () {
                                            searchLayer(serviceRef, mapServiceURL, layerListInfo.id, layerListInfo.name, dsFeatures, drFeature, searchableFields, dateAttFields, shapeCol);
                                        }
                                    }
                                }
                            ]
                        })
                    });
                    var tab = new Ext.Panel({
                        id: 'tab_' + serviceRef + '_' + layerListInfo.id,
                        layout: 'fit',
                        title: layerListInfo.name,
                        //closable: false
                        closable: true,
                        listeners: {
                            beforeclose: function () {
                                closeLayerTab(serviceRef, layerListInfo.id);
                                gridRecord.set('showTable', false);
                                return false;
                            }
                        }
                    });
                    tab.add(grid);
                    tpTables.add(tab);
                    tpTables.setActiveTab(tab);
                    pnlTables.expand();
                    pnlTables.setHeight(pnlTables.setHeight);
                    if (strSearchValue != '') {
                        searchLayer(serviceRef, mapServiceURL, layerListInfo.id, layerListInfo.name, dsFeatures, drFeature, searchableFields, dateAttFields, shapeCol);
                    }
                }
            },
            failure: function (error) {
            }
        });
    }
    else {
        tab.show();
        activeTxtSearch = Ext.get('txt_' + serviceRef + '_' + layerListInfo.id);
        tpTables.unhideTabStripItem(tabID);
        tpTables.setActiveTab(tabID);
        pnlTables.expand();
        pnlTables.setHeight(pnlTables.setHeight);
        setTimeout('activeTxtSearch.focus();activeTxtSearch.setValue(activeTxtSearch.getValue());', 1000);
    }
}

function searchLayer(searchServiceRef, searchServiceURL, searchLayerID, searchLayerName, layerDS, layerDR, searchFields, layerDates, shapeColName) {
    layerDS.removeAll();
    var searchTypeBox = Ext.ComponentMgr.get('cbt_' + searchServiceRef + "_" + searchLayerID);
    var searchTypeVal = searchTypeBox.value;
    var searchBox = Ext.get('txt_' + searchServiceRef + "_" + searchLayerID);
    var searchText = searchBox.getValue();
    searchText = searchText.replace(/\*/g, '%').replace(/\?/g, '_').replace(/[^a-zA-Z0-9 &\-\/%_]+/g, '').replace(/^\s+|\s+$/g, "");
    var searchParameters = new esri.tasks.IdentifyParameters();
    searchParameters.layerIds = [searchLayerID];
    searchParameters.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
    searchParameters.mapExtent = new esri.geometry.Extent({ xmin: -100000, ymin: -100000, xmax: 2047483.647, ymax: 2047483.647, spatialReference: { wkid: 27700} });
    searchParameters.maxAllowableOffset = 2;
    searchParameters.returnGeometry = true;
    // The tolerance is in whole screen pixels
    searchParameters.tolerance = 0;
    searchParameters.geometry = searchParameters.mapExtent;
    var cbs = Ext.ComponentMgr.get(tpTables.activeTab.id.replace('tab_', 'cbs_'));
    var lblNmr = Ext.ComponentMgr.get('nmr_' + searchServiceRef + '_' + searchLayerID);
    var lblExp = Ext.ComponentMgr.get('exp_' + searchServiceRef + '_' + searchLayerID);
    var btnCsv = Ext.ComponentMgr.get('csv_' + searchServiceRef + '_' + searchLayerID);
    var btnXls = Ext.ComponentMgr.get('xls_' + searchServiceRef + '_' + searchLayerID);
    //var btnXml = Ext.ComponentMgr.get('xml_' + searchServiceRef + '_' + searchLayerID);
    var strLabelSuffix = '';
    if (currentRecord != null && cbs.value == 'the selected feature') {
        if (currentService != searchServiceRef || currentRecord.layerName != searchLayerName) {
            var geom = currentRecord.feature.geometry;
            if (geom.type == 'point') {
                //Tolerance cheat - construct a 1 metre square around point
                searchParameters.geometry = new esri.geometry.Extent({ xmin: geom.x - 0.5, ymin: geom.y - 0.5, xmax: geom.x - -0.5, ymax: geom.y - -0.5, spatialReference: { wkid: 27700} });
            }
            else {
                searchParameters.geometry = currentRecord.feature.geometry;
            }
            if (searchText == '') searchText = '[!"£$%SPATIAL_ONLY!"£$%]';
            strLabelSuffix = '&nbsp;within&nbsp;selection&nbsp;(' + currentRecord.layerName + '; ' + currentRecord.displayFieldName + ': ' + currentRecord.value + ').';
        }
        else {
            strLabelSuffix = '&nbsp;within&nbsp;the&nbsp;whole&nbsp;layer&nbsp;(select a feature from another layer).';
        }
    }
    else if (cbs.value == 'the selected feature') {
        strLabelSuffix = '&nbsp;within&nbsp;the&nbsp;whole&nbsp;layer&nbsp;(select a feature from another layer).';
    }
    else if (drawnShape != null && cbs.value == 'the drawn feature') {
        var geom = drawnShape.geometry;
        if (geom.type == 'point') {
            //Tolerance cheat - construct a 1 metre square around point
            searchParameters.geometry = new esri.geometry.Extent({ xmin: geom.x - 0.5, ymin: geom.y - 0.5, xmax: geom.x - -0.5, ymax: geom.y - -0.5, spatialReference: { wkid: 27700} });
        }
        else {
            searchParameters.geometry = drawnShape.geometry;
        }
        if (searchText == '') searchText = '[!"£$%SPATIAL_ONLY!"£$%]';
        strLabelSuffix = '&nbsp;within&nbsp;the&nbsp;drawn&nbsp;feature.';
    }
    else if (cbs.value == 'the drawn feature') {
        strLabelSuffix = '&nbsp;within&nbsp;the&nbsp;whole&nbsp;layer&nbsp;(use the drawing tools to plot a feature).';
    }
    else if (cbs.value == 'the current map view') {
        searchParameters.geometry = jsMap.extent;
        strLabelSuffix = '&nbsp;within&nbsp;selected&nbsp;map&nbsp;view.';
    }
    else {
        strLabelSuffix = '&nbsp;within&nbsp;the&nbsp;whole&nbsp;layer.';
    }
    if (strLabelSuffix.length > 100) strLabelSuffix = strLabelSuffix.substring(0, 100) + '...';
    if (searchText != '' && searchText != '[!"£$%SPATIAL_ONLY!"£$%]') {
        var strFilter = '';
        searchParameters.layerDefinitions = new Array();
        if (searchTypeVal == '[any text field]') {
            searchTypeVal = '';
            for (var i = 1; i < searchFields.length; i++) {
                searchTypeVal += searchFields[i][0];
                if (i + 1 != searchFields.length) searchTypeVal += '||\' \'||';
                if (strFilter != '') {
                    strFilter += ' OR ';
                }
                strFilter += '(UPPER(' + searchFields[i][0] + ') LIKE \'%' + searchText.toUpperCase() + '%\')';
            }
        }
        if (strFilter == '') {
            strFilter = '(UPPER(' + searchTypeVal + ') LIKE \'%' + searchText.toUpperCase() + '%\')';
        }
        searchParameters.layerDefinitions[searchLayerID] = strFilter;
    }
    else if (cbs.value == 'the whole layer' || searchParameters.geometry == searchParameters.mapExtent) {
        if (typeof jsMap == 'undefined') {
            lblNmr.update('<span style="color:red">Please enter some search text.</span>');
        }
        else {
            lblNmr.update('<span style="color:red">Please enter some search text and/or specify a search area.</span>');
        }
        lblExp.setVisible(false);
        btnCsv.setVisible(false);
        btnXls.setVisible(false);
        //btnXml.setVisible(false);
        return false;
    }
    var strToken = '';
    if (searchServiceRef == "assetinfo") {
        try { strToken = idMgr.credentials[0].token; } catch (e) { };
    }
    lblNmr.update('Searching...');
    var searchTask = new esri.tasks.IdentifyTask(searchServiceURL + '?token=' + strToken);
    searchTask.execute(searchParameters, function showSearchResults(response) {
        var maxResults = 1500;
        for (i = 0; i < response.length; i++) {
            var item = response[i].feature;
            var index = i;
            if (index < maxResults) {
                var newRecord = new layerDR();
                var intAttIndex = 0;
                for (var key in item.attributes) {
                    var attValue = item.attributes[key];
                    if (layerDates.indexOf(key) != -1) {
                        var attDate = new Date();
                        if (attValue == 'Null') {
                            attDate = new Date(-999999999999999);
                        }
                        else {
                            var attParts = attValue.split(' ');
                            var dateParts = attParts[0].split('/');
                            if (attParts.length > 1) {
                                attValue = attParts[0] + 'T' + attParts[1];
                                attDate = Date.parseDate(attValue, "d/m/Y\\TH:i:s", false);
                            }
                            else {
                                attDate = Date.parseDate(attParts[0], "d/m/Y", false);
                            }
                        }
                        newRecord.set(key.replace(/[\s\']+/g, '_').replace(/[()]+/g, ''), attDate);
                    }
                    else {
                        if (attValue == 'Null') {
                            newRecord.set(key.replace(/[\s\']+/g, '_').replace(/[()]+/g, ''), ' ');
                        }
                        else {
                            newRecord.set(key.replace(/[\s\']+/g, '_').replace(/[()]+/g, ''), attValue);
                        }
                    }
                    intAttIndex += 1;
                }
                var featGeom;
                var feat;
                var itemX;
                var itemY;
                var itemExtent = 250;
                // Establish the feature's centre point
                var itemX = item.geometry.x;
                var itemY = item.geometry.y;
                if (isNaN(parseFloat(itemX)) || isNaN(parseFloat(itemY))) {
                    var geomType = '';
                    var spatialRef = new esri.SpatialReference({ wkid: 27700 });
                    if (Boolean(item.geometry.points)) {
                        geomType = "points";
                        featGeom = item.geometry.points;
                        feat = new esri.geometry.Multipoint({
                            "points": featGeom,
                            "spatialReference": spatialRef
                        });
                    }
                    else if (Boolean(item.geometry.paths)) {
                        geomType = "paths";
                        featGeom = item.geometry.paths;
                        feat = new esri.geometry.Polyline({
                            "paths": featGeom,
                            "spatialReference": spatialRef
                        });
                    }
                    else if (Boolean(item.geometry.rings)) {
                        geomType = "rings";
                        featGeom = item.geometry.rings;
                        feat = new esri.geometry.Polygon({
                            "rings": featGeom,
                            "spatialReference": spatialRef
                        });
                    }
                    else {
                        // It's a mystery!
                    }
                    try {
                        var featExtent = feat.getExtent();
                        var featExtentCentre = featExtent.getCenter();
                        var featExtentHeight = featExtent.getHeight();
                        var featExtentWidth = featExtent.getWidth();
                        itemX = featExtentCentre.x;
                        itemY = featExtentCentre.y;
                        if (featExtentHeight > itemExtent) itemExtent = featExtentHeight;
                        if (featExtentWidth > itemExtent) itemExtent = featExtentWidth;
                    }
                    catch (e) {

                    }
                }
                newRecord.set('EASTING', itemX);
                newRecord.set('NORTHING', itemY);
                var svcRef = searchServiceRef;
                //var appRoot = 'maps.bristol.gov.uk/pinpoint';
                var appRoot = 'maps.bcc.lan/pinpointplus';
                if (document.title == "Transport Information") {
                    svcRef = 'transport';
                    //appRoot = 'maps.bcc.lan/pinpointplus';
                }
                var strMapLink = strProtocol + '//' + appRoot + '/?maptype=js&service=' + svcRef + '&layer=' + searchLayerName.replace(/\s/g, '+') + '&x=' + itemX + '&y=' + itemY + '&extent=' + itemExtent
                if (strDLRole != '') strMapLink = strMapLink + '&role=' + strDLRole
                if (strDLRegion != '') strMapLink = strMapLink + '&region=' + strDLRegion
                newRecord.set('MAP_LINK', strMapLink);
                layerDS.add(newRecord);
            }
            else {
                // The search returned over maxResults, so only the first maxResults will be shown
            }
        }
        if (response.length > 0) {
            if (response.length >= maxResults) {
                lblNmr.update('&nbsp;First ' + maxResults + ' matching records' + strLabelSuffix);
            }
            else {
                lblNmr.update('&nbsp;' + response.length + ' matching records' + strLabelSuffix);
            }
            lblExp.setVisible(strUserOrg != '' || document.title == 'Pinpoint Plus' || document.title == 'Transport Information');
            btnCsv.setVisible(strUserOrg != '' || document.title == 'Pinpoint Plus' || document.title == 'Transport Information');
            btnXls.setVisible(strUserOrg != '' || document.title == 'Pinpoint Plus' || document.title == 'Transport Information');
            //btnXml.setVisible(strUserOrg != '');
        }
        else {
            lblNmr.update('&nbsp;No matching records' + strLabelSuffix);
            lblExp.setVisible(false);
            btnCsv.setVisible(false);
            btnXls.setVisible(false);
            //btnXml.setVisible(false);
        }
        if (layerDS.sortInfo != '') {
            layerDS.sort(layerDS.sortInfo.field, layerDS.sortInfo.direction);
        }
        else if (searchLayerName == 'Strategic aspirations') {
            layerDS.sort('Last_updated', 'DESC');
        }
    }, function showSearchErrors(response) {

    }); 
}

function requestExportAll(svcURL, lyrID, formatType) {
    Ext.net.DirectMethods.exportAllData(svcURL, lyrID, formatType, {
        url: 'default.aspx',
        isUpload: true,
        formProxyArg: 'frmMain',
        success: function (result, action) {

        },
        failure: function (errorMessage) {
            Ext.Msg.show({
                title: 'Error exporting file',
                msg: errorMessage,
                width: 512,
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.INFO
            });
        }
    });
};

function requestExport(exportType) {
    var gridTab = tpTables.activeTab.items;
    var gridToExport = gridTab.items[0];
    var gridStoreData = gridToExport.store.data.items;
    var dataArray = new Array();
    Ext.each(gridStoreData, function (item, index, array) {
        dataArray.push(item.data);
    });
    var jsonData = Ext.encode(dataArray);
    Ext.net.DirectMethods.exportGridData(jsonData, exportType, {
        url: 'default.aspx',
        isUpload: true,
        formProxyArg: 'frmMain',
        success: function (result, action) {

        },
        failure: function (errorMessage) {
            Ext.Msg.show({
                title: 'Error exporting file',
                msg: errorMessage,
                width: 512,
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.INFO
            });
        }
    });
};

function loadLILayers() {
    if (gpLI.hidden == false) {
        var maskLoad = new Ext.LoadMask('gpLI', {
            removeMask: true,
            msg: "Loading..."
        });
        maskLoad.show();
    }
    Ext.net.DirectMethod.request({
        url: LIMapServiceURL + '?f=json',
        cleanRequest: true,
        method: 'GET',
        json: true,
        success: function (layerInfo) {
            dsLILayers.loadData(layerInfo);
            var grpName;
            // Using -2 as -1 is used by the API
            var ioID = -2;
            var ioLayer = false;
            var intRemoved = 0;
            var referenceLayers = [];
            Ext.each(dsLILayers.data.items, function (item, index) {
                try {
                    if (item.data.name == 'Cherish or change') {
                        intCCLayerID = index;
                    }
                    if (item.data.name == 'Cherish or change replies') {
                        intCCRLayerID = index;
                    }
                    //if (item.data.subLayerIds != null) {
                    //Establish 'Staff-only content' group layer's ID
                    if (item.data.name == 'Staff-only content') {
                        ioID = item.data.id;
                    }
                    if (item.data.name == 'Ordnance Survey' || item.data.name.split(" ")[0] == 'Mastermap') {
                        if (item.data.name == 'Ordnance Survey') {
                            mmLayers.push(item.json.parentLayerId);
                        }
                        mmLayers.push(index);
                    }
                    if (item.data.subLayerIds != null && item.data.name != 'Visible') {
                        grpName = item.data.name;
                        LIGroupIDs.push(index);
                        if (item.json.parentLayerId == ioID) {
                            ioLayer = true;
                        }
                        else {
                            ioLayer = false;
                        }
                    }
                    else {
                        item.set('groupName', grpName);
                        if (grpName == 'Reference') {
                            referenceLayers.push(index);
                        }
                    }
                    if (themeLayers.indexOf(item.data.name.toLowerCase()) != -1) {
                        item.set('layerVis', true);
                        LIThemeLayerIDs.push(item.data.id);
                    }
                    item.set('sortInfo', item.data.groupName + ', ' + item.data.name);
                    item.set('displayName', '<a style="color:black" target="_blank" href="metadata/?layer=' + item.data.name.replace(/\s/g, '+') + '">' + item.data.name + '</a>');
                    if (ioLayer) item.set('displayName', '<b>' + item.data.displayName + '</b>');
                    if (item.data.minScale != '0') item.set('displayName', item.data.displayName + ' <i>(zoom in to view)</i>');
                    else if (item.data.maxScale != '0') item.set('displayName', item.data.displayName + ' <i>(zoom out to view)</i>');
                }
                catch (e) {

                }
            });
            Ext.each(LIGroupIDs, function (item, index) {
                dsLILayers.removeAt(item - intRemoved);
                intRemoved = intRemoved + 1;
            });
            Ext.each(referenceLayers, function (item, index) {
                dsLILayers.removeAt(item - intRemoved);
                intRemoved = intRemoved + 1;
            });
            dsLILayers.applyGrouping('groupName');
            if (typeof jsMap != 'undefined') {
                mapServiceLoaded();
            }
            for (var i = 0, j = LIThemeLayerIDs.length; i < j; i++) { map.changeLayerVis('localinfo', LIThemeLayerIDs[i], true); };
            maskLoad.hide();
        },
        failure: function (error) {
            if (typeof jsMap != 'undefined') {
                mapServiceLoaded();
            }
            maskLoad.hide();
        }
    });
}

function dsLICellClick(thisGrid, thisRowIndex, thisColIndex, e) {
    var record = thisGrid.getStore().getAt(thisRowIndex);
    var fieldName = thisGrid.getColumnModel().getDataIndex(thisColIndex);
    if (fieldName == 'layerVis') {
        var layerID = record.data.id;
        if (record.get(fieldName) == true) {
            map.changeLayerVis('localinfo', layerID, false);
            record.set(fieldName, false);
        }
        else {
            map.changeLayerVis('localinfo', layerID, true);
            record.set(fieldName, true);
        }
        map.updateLegend();
    }
    if (fieldName == 'showTable') {
        var layerID = record.data.id;
        if (record.get(fieldName) == true) {
            closeLayerTab('localinfo', layerID);
            record.set(fieldName, false);
        }
        else {
            openLayerTab('localinfo', LIMapServiceURL, record);
            record.set(fieldName, true);
        }
    }
}
