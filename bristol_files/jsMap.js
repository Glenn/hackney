dojo.require("esri.dijit.InfoWindow");
dojo.require("esri.dijit.Legend");
dojo.require("esri.dijit.Measurement");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.tasks.identify");
dojo.require("esri.tasks.PrintTask");
if (strDLRole != null && strDLRole != '') {
    dojo.require("esri.IdentityManager");
}
//if (strDLRole == 'tpeditor') {
    dojo.require("esri.toolbars.draw");
//}
var jsMap;
var addressMarker;
var drawnShapeLabel;
var HERUserPointMarker;
var LIUserPointMarker;
var jsLegend;
var legendServices = [];
var olService, bm0Service, bm1Service, bm2Service, bm3Service, bm4Service, bm5Service, bm6Service, bm7Service, bm8Service, bm9Service, currentServiceIndex;
var AssetMapService, HERMapService, LIMapService;
var AssetidentifyTask, AssetidentifyParams;
var HERidentifyTask, HERidentifyParams;
var LIidentifyTask, LIIdentifyParams;
var DLidentifyTask, DLIdentifyParams;
var LIGroupIDs = [];
var assetinfo_Results = [];
var HER_Results = [];
var localinfo_Results = [];
var intResults = 0;
var currentService = '';
var summaryTitle = '';
var summaryContent = '';
var contentTemplate = '';
var detailContent = '';
var intExtraInfoWinHeight = 40;
var intExtraInfoWinWidth = 5;
var clickedX = '';
var clickedY = '';
var titleStart = '<table width=100%><tr valign=top><td>';
var preZoomLinkPoint = '</td><td width=12 align=right><a title="Zoom to this location" href="#" onclick="';
var preZoomLinkOther = '</td><td width=12 align=right><a title="Zoom to the extent of this feature" href="#" onclick="';
var preDeepLink = '"><img style=margin-top:1px src=images/zoom.png /></a></td><td width=20 align=right><a title="Share a link to this location" href=';
var titleEnd = '><img style=margin-top:2px;margin-left:5px src=images/deeplink.png /></a></td></tr></table>';
var strDeepLink = '';
var strLayerLink = '';
var strTitle = '';
var lastLOD = '';
var blnZoom = false;
var recordDetails = '';
var recordWidth = 320;
var recordHeight = 240;
var strCCThreadID = '';
var intCCLayerID;
var intCCRLayerID;
var strSAThreadID;
var intSALayerID;
var intSARLayerID;
var idMgr;
var constMapServices = 3;
var intMapServicesLoaded = 0;
var drawingToolbar;
var selectedDrawingTool;
var blnIsSAUserEditor = false;
var textGraphicsLayer;
var measurement;

function addCopyright() {
    dojo.create("DIV", { id: "copyright1" }, dojo.byId("jsMapEl"), "first");
    dojo.style("copyright1", "zIndex", 20);
    dojo.style("copyright1", "fontSize", "8pt");
    dojo.style("copyright1", "textAlign", "left");
    dojo.style("copyright1", "background", "white");
    dojo.style("copyright1", "fontFamily", "Arial, Helvetica, sans-serif");
    dojo.style("copyright1", "opacity", "0.75");
    dojo.style("copyright1", "paddingTop", "2px");
    dojo.byId("copyright1").innerHTML = "&nbsp;Modern aerial imagery © Blom Pictometry &nbsp;1946 aerial imagery © English Heritage";
    dojo.style("copyright1", "position", "absolute");
    dojo.style("copyright1", "width", "208px");
    dojo.style("copyright1", "height", "30px");
    dojo.style("copyright1", "bottom", "30px");
    dojo.style("copyright1", "right", "0px");
    dojo.create("DIV", { id: "copyright2" }, dojo.byId("jsMapEl"), "first");
    dojo.style("copyright2", "zIndex", 20);
    dojo.style("copyright2", "fontSize", "8pt");
    dojo.style("copyright2", "textAlign", "left");
    dojo.style("copyright2", "background", "white");
    dojo.style("copyright2", "fontFamily", "Arial, Helvetica, sans-serif");
    dojo.style("copyright2", "opacity", "0.75");
    dojo.style("copyright2", "paddingTop", "0px");
    dojo.byId("copyright2").innerHTML = "&nbsp;OS data &copy; Crown copyright &amp; database &nbsp;rights 2014 Ordnance Survey 100023406";
    dojo.style("copyright2", "position", "absolute");
    dojo.style("copyright2", "width", "208px");
    dojo.style("copyright2", "height", "30px");
    dojo.style("copyright2", "bottom", "0px");
    dojo.style("copyright2", "right", "0px");
    dojo.create("DIV", { id: "behind_scalebar" }, dojo.byId("jsMapEl"), "first");
    dojo.style("behind_scalebar", "zIndex", 20);
    dojo.style("behind_scalebar", "background", "white");
    dojo.style("behind_scalebar", "opacity", "0.75");
    dojo.style("behind_scalebar", "paddingTop", "2px");
    dojo.style("behind_scalebar", "position", "absolute");
    dojo.style("behind_scalebar", "width", "160px");
    dojo.style("behind_scalebar", "height", "28px");
    dojo.style("behind_scalebar", "bottom", "22px");
    dojo.style("behind_scalebar", "left", "18px");
}
function mapServiceLoaded() {
    intMapServicesLoaded += 1;
    if (intMapServicesLoaded == constMapServices || strDLRegion == 'somerset') {
        tpMapOpts.setActiveTab('pnlLegend');
        if (strDLMapOpts == 'legend') {
            tpMapOpts.setActiveTab('pnlLegend');
        }
        else {
            tpMapOpts.setActiveTab('pnlLayers');
        }
        if (strDLRegion == 'somerset') {
            lnkHistoric.hide();
            jsMapLegendEl.hide();
            jsMapStaticLegendEl.show();
        }
        else {
            setTimeout("jsLegend = new esri.dijit.Legend({map: jsMap,layerInfos: legendServices}, 'jsMapLegendEl');jsLegend.startup();", 0);
        }
        var intDLX = getDLVal("x");
        var intDLY = getDLVal("y");
        if (intDLX - intDLX == 0 && intDLY - intDLY == 0) {
            setTimeout("var dlPoint = new esri.geometry.Point(strDLX - 0, strDLY - 0, new esri.SpatialReference({ wkid: 27700 }));handleMapClick(dlPoint)", 0);
        }
        if (strDLGroup != null) {
            var gridPanelListView = gpLI.getView();
            gridPanelListView.collapseAllGroups();
            gridPanelListView.toggleRowIndex(0);
        }
    }
}
function shapeDrawn(shapeGeom) {
    if (imbLabel.pressed) {
        imbLabel.toggle();
        selectedDrawingTool = esri.toolbars.Draw.EXTENT;
        drawingToolbar.deactivate();
        map.isDrawing = false;
        showTextDialogue(shapeGeom);
    }
    else {
        if (selectedDrawingTool == esri.toolbars.Draw.POINT) {
            imbPoint.toggle();
        }
        else {
            imbPoly.toggle();
        }
        selectedDrawingTool = esri.toolbars.Draw.EXTENT;
        drawingToolbar.deactivate();
        map.isDrawing = false;
        jsMap.graphics.remove(drawnShape);
        textGraphicsLayer.remove(drawnShapeLabel);
        switch (shapeGeom.type) {
            case "point":
                var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 8, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                break;
            case "extent":
                var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                break;
            case "polygon":
                var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]));
                break;
        }
        var gSvc = esri.tasks.GeometryService(strProtocol + '//maps.bristol.gov.uk/ArcGIS/rest/services/Utilities/Geometry/GeometryServer');
        var geomArray = new Array();
        geomArray.push(shapeGeom);
        gSvc.simplify(geomArray, function (newGeomArray) {
            drawnShape = new esri.Graphic(newGeomArray[0], symbol);
            jsMap.graphics.add(drawnShape);
            if (tpTables.activeTab != undefined) {
                var cbs = Ext.ComponentMgr.get(tpTables.activeTab.id.replace('tab_', 'cbs_'));
                if (cbs.value == 'the drawn feature') {
                    var btnFnd = Ext.ComponentMgr.get(tpTables.activeTab.id.replace('tab_', 'fnd_'));
                    var currentSearchLayer = '';
                    currentSearchService = tpTables.activeTab.id.split('_')[1];
                    currentSearchLayer = tpTables.activeTab.title;
                    btnFnd.btnEl.dom.click();
                }
            }
            //if (strDLRole == 'tpeditor') {
            //    tpAsset.setActiveTab('tabAssetContrib');
            if (tpAsset.activeTab.id == 'tabAssetContrib') {
                if (rbAssetContribNew.checked == false) {
            //        rgAssetContribTypes.setValue('rbAssetContribNew', true);
                }
                else {
                    updateAssetUserShape(shapeGeom);
                }
            }
            imbLabel.enable();
        },
        function () {
            alert('Sorry, there was a problem with the drawn shape');
        });
    }
}
function initJSMap() {
    var initialExtent = new esri.geometry.Extent({
        xmin: 350250,
        ymin: 166500,
        xmax: 366500,
        ymax: 183500,
        spatialReference: {
            wkid: 27700
        }
    });
    var lods = [
        { "level": 0, "resolution": 50.800101600203206, "scale": 192000 },
        { "level": 1, "resolution": 25.400050800101603, "scale": 96000 },
        { "level": 2, "resolution": 12.700025400050801, "scale": 48000 },
        { "level": 3, "resolution": 6.3500127000254007, "scale": 24000 },
        { "level": 4, "resolution": 3.1750063500127004, "scale": 12000 },
        { "level": 5, "resolution": 1.5875031750063502, "scale": 6000 },
        { "level": 6, "resolution": 0.79375158750317509, "scale": 3000 },
        { "level": 7, "resolution": 0.39687579375158755, "scale": 1500 },
        { "level": 8, "resolution": 0.19843789687579377, "scale": 750 }
    ];
    var infoWindow = new esri.dijit.InfoWindow({}, dojo.create("div"));
    infoWindow.startup();
    jsMap = new esri.Map("jsMapEl", {
        extent: initialExtent,
        fadeOnZoom: true,
        infoWindow: infoWindow,
        logo: false,
        slider: true,
        sliderStyle: 'large',
        showAttribution: false,
        lods: lods
    });
    esri.config.defaults.geometryService = new esri.tasks.GeometryService(strProtocol + '//maps.bristol.gov.uk/ArcGIS/rest/services/Utilities/Geometry/GeometryServer');
    measurement = new esri.dijit.Measurement({
        map: jsMap,
        defaultAreaUnit: esri.Units.SQUARE_KILOMETERS,
        defaultLengthUnit: esri.Units.METERS
    }, dojo.byId('measurementDiv'));
    measurement.startup();
    textGraphicsLayer = new esri.layers.GraphicsLayer({ id: 'User-defined text' });
    addressMarker = new esri.Graphic([]);
    HERUserPointMarker = new esri.Graphic([]);
    LIUserPointMarker = new esri.Graphic([]);
    //drawnShape = new esri.Graphic([]);
    //olService = new esri.layers.ArcGISDynamicMapServiceLayer(olServiceURL);
    //olService.setOpacity(0.2);
    bm0Service = new esri.layers.ArcGISTiledMapServiceLayer(bm0ServiceURL);
    bm1Service = new esri.layers.ArcGISImageServiceLayer(bm1ServiceURL);
    bm1Service.visible = false;
    bm2Service = new esri.layers.ArcGISTiledMapServiceLayer(bm2ServiceURL);
    bm2Service.visible = false;
    bm3Service = new esri.layers.ArcGISTiledMapServiceLayer(bm3ServiceURL);
    bm3Service.visible = false;
    bm4Service = new esri.layers.ArcGISTiledMapServiceLayer(bm4ServiceURL);
    bm4Service.visible = false;
    bm5Service = new esri.layers.ArcGISTiledMapServiceLayer(bm5ServiceURL);
    bm5Service.visible = false;
    bm6Service = new esri.layers.ArcGISTiledMapServiceLayer(bm6ServiceURL);
    bm6Service.visible = false;
    bm7Service = new esri.layers.ArcGISTiledMapServiceLayer(bm7ServiceURL);
    bm7Service.visible = false;
    bm8Service = new esri.layers.ArcGISTiledMapServiceLayer(bm8ServiceURL);
    bm8Service.visible = false;
    bm9Service = new esri.layers.ArcGISTiledMapServiceLayer(bm9ServiceURL);
    bm9Service.visible = false;
    bm10Service = new esri.layers.ArcGISTiledMapServiceLayer(bm10ServiceURL);
    bm10Service.visible = false;
    bm11Service = new esri.layers.ArcGISTiledMapServiceLayer(bm11ServiceURL);
    bm11Service.visible = false;
    currentServiceIndex = 0;
    AssetMapService = new esri.layers.ArcGISDynamicMapServiceLayer(AssetMapServiceURL);
    AssetMapService.id = 'assetinfo';
    AssetMapService.setImageFormat("png32");
    AssetMapService.setDisableClientCaching(true);
    if (strDLService != 'assetinfo') AssetMapService.visible = false;
    HERMapService = new esri.layers.ArcGISDynamicMapServiceLayer(HERMapServiceURL);
    HERMapService.id = 'HER';
    HERMapService.setImageFormat("png32");
    HERMapService.setDisableClientCaching(true);
    if (strDLService != 'HER') HERMapService.visible = false;
    LIMapService = new esri.layers.ArcGISDynamicMapServiceLayer(LIMapServiceURL);
    LIMapService.id = 'localinfo';
    LIMapService.setImageFormat("png32");
    LIMapService.setDisableClientCaching(true);
    if (strDLService != 'localinfo') LIMapService.visible = false;
    dojo.connect(jsMap, "onMouseMove", function (evt) {
        var mp = evt.mapPoint;
        window.status = Math.round(mp.x * 1000) / 1000 + ", " + Math.round(mp.y * 1000) / 1000;
        dojo.byId('divCoords').innerHTML = 'Easting: ' + Math.round(mp.x * 1000) / 1000 + '<br />Northing: ' + Math.round(mp.y * 1000) / 1000;
    });
    dojo.connect(jsMap, "onMouseOut", function (evt) {
        window.status = '';
    });
    dojo.connect(jsMap, 'onExtentChange', function (extent, delta, levelChange, lod) {
        if (levelChange | blnZoom) {
            if (lastLOD == '') {
                lastLOD = lod;
                blnZoom = true;
            }
            try {
                if (zoomX != '' && zoomY != '' && (lod.scale < lastLOD.scale | blnZoom)) {
                    if (zoomX > jsMap.extent.xmin && zoomX < jsMap.extent.xmax && zoomY > jsMap.extent.ymin && zoomY < jsMap.extent.ymax) {
                        var clickPoint = new esri.geometry.Point(zoomX, zoomY, new esri.SpatialReference({ wkid: 27700 }));
                        handleMapClick(clickPoint);
                    }
                }
                else if (clickedX != '' && clickedY != '') {
                    setTimeout('makeRoomForInfoWindow();', 0);
                }
            }
            catch (e) { };
            lastLOD = lod;
            blnZoom = false;
        }
    });
    legendServices.push({ layer: LIMapService, title: 'Local information' });
    legendServices.push({ layer: HERMapService, title: 'Historic information' });
    legendServices.push({ layer: AssetMapService, title: 'Asset information' });
    dojo.connect(jsMap, 'onLayersAddResult', function (results) {
        try {
            idMgr = esri.id.toJson();
            var idCred = idMgr.credentials[0];
            if (strDLRole == 'tpeditor' && typeof idCred != 'undefined') {
                var saUserID = idCred.userId;
                // Check TP user's organisation and group membership
                Ext.net.DirectMethods.getSAUserInfo(
                    saUserID,
                    {
                        url: 'default.aspx',
                        success: function (response) {
                            var saUserInfo = Ext.decode(response);
                            strUserOrg = saUserInfo.Organisation;
                            blnIsSAUserEditor = saUserInfo.IsEditor;
                            if (blnIsSAUserEditor) {
                                tpAsset.unhideTabStripItem('tabAssetContrib');
                            }
                        },
                        failure: function (error) {

                        }
                    }
                );
            }
        }
        catch (e) { };
        loadAssetLayers();
        loadHERLayers(true);
        loadLILayers();
    });
    if (strDLRole != null) {
        try {
            dojo.connect(esri.id, 'onDialogCreate', function () {
                try {
                    dojo.connect(this.dialog, 'onShow', function () {
                        try {
                            this.set('title', 'Sign in (or <a title="Open the Total Place admin page in a new window" target="tp_admin" href="' + AssetAdminURL + '">request/reset password</a>)');
                            dojo.attr(dijit.byId('dijit_form_ValidationTextBox_0').textbox, "value", strDLUserID);
                            if (strDLUserID != '') {
                                dojo.connect(dijit.byId('dijit_form_ValidationTextBox_0').textbox, 'onfocus', function () {
                                    if (strDLUserID != '') {
                                        dijit.byId('dijit_form_ValidationTextBox_1').textbox.focus();
                                        strDLUserID = '';
                                    }
                                });
                            }
                        }
                        catch (e) { }
                    });
                    dojo.connect(this.dialog, 'onCancel', function () {
                        try {
                            self.location.href = self.location.href.replace("&role=", "&cancelledrole=");
                        }
                        catch (e) { }
                    });
                }
                catch (e) { }
            });
        }
        catch (e) { }
    }
//    jsMap.addLayers([bm0Service, bm1Service, bm2Service, bm3Service, bm4Service, bm5Service, bm6Service, bm7Service, bm8Service, bm9Service, bm10Service, olService, LIMapService, HERMapService, AssetMapService, textGraphicsLayer]);
    jsMap.addLayers([bm0Service, bm1Service, bm2Service, bm3Service, bm4Service, bm5Service, bm6Service, bm7Service, bm8Service, bm9Service, bm10Service, bm11Service, LIMapService, HERMapService, AssetMapService, textGraphicsLayer]); addCopyright();
    var scalebar = new esri.dijit.Scalebar({
        map: jsMap,
        scalebarUnit: "metric",
        attachTo: "bottom-left"
    });
    drawingToolbar = new esri.toolbars.Draw(jsMap);
    if (strDLRole == 'tpeditor') {
        selectedDrawingTool = esri.toolbars.Draw.EXTENT;
    }
    dojo.connect(drawingToolbar, "onDrawEnd", shapeDrawn);
    if (strDLMapOpts != 'none' && strDLMapOpts != 'false') {
        pnlMapOpts.expand();
    }
    if (strDLMapBase != null && strDLMapBase != 'aerial') showFullLayerList();
    switch (strDLMapBase) {
        case 'grey':
            Radio1.setValue(true);
            break;
        case 'aerial':
            Radio2.setValue(true);
            break;
        case '1949':
            Radio3.setValue(true);
            break;
        case '1946':
            Radio4.setValue(true);
            break;
        case '1900s':
            Radio5.setValue(true);
            break;
        case '1880s':
            Radio6.setValue(true);
            break;
        case '1874':
            Radio7.setValue(true);
            break;
        case '1855':
            Radio8.setValue(true);
            break;
        case '1840s':
            Radio9.setValue(true);
            break;
        case '1828':
            Radio10.setValue(true);
            break;
        case '1750':
            Radio11.setValue(true);
            break;
        default:
    }
    initID();
    mapReady();
}

function pointToExtent(/*esri.Map*/jsMap, /*esri.geometry.Point (in map coords)*/point, /*Number*/toleranceInPixels) {
    //calculate map coords represented per pixel
    var pixelWidth = jsMap.extent.getWidth() / jsMap.width;
    //calculate map coords for tolerance in pixel
    var toleranceInMapCoords = toleranceInPixels * pixelWidth;
    //calculate & return computed extent
    return new esri.geometry.Extent(point.x - toleranceInMapCoords,
      point.y - toleranceInMapCoords,
      point.x + toleranceInMapCoords,
      point.y + toleranceInMapCoords,
      jsMap.spatialReference);
}

function identifyGraphics(evt) {
    var extentGeom = pointToExtent(jsMap, evt.mapPoint, 10);
    var filteredGraphics = dojo.filter(jsMap.graphics.graphics, function (graphic) {
        return extentGeom.contains(graphic.geometry);
    });

    var content = "";
    content = "<i>Total Features: " + filteredGraphics.length + "<\/i>";
    content += "<table border='0' style='width:100%;text-align: left;'><tr><th>Operative ID<\/th><\/tr>";

    //Build a table containing a row for each feature found
    dojo.forEach(filteredGraphics, function (row) {
        content += "<tr style='width:100%;text-align:left'><td>" +
              row.attributes['OperativeID'] + "<\/td><\/tr>";
    });
    content += "<\/table>";

    jsMap.infoWindow.setContent(content);
    jsMap.infoWindow.setTitle("Identify results");
    jsMap.infoWindow.show(evt.screenPoint, jsMap.getInfoWindowAnchor(evt.screenPoint));
}

function jsPrintLayoutOptions() {
    if (txtPrintTitle.getValue() != '') {
        this.titleText = txtPrintTitle.getValue();
    }
    else if (strDLRole != '') {
        this.titleText = 'Total Place map';
    }
    else {
        this.titleText = 'Bristol City Council map';
    }
    this.scalebarUnit = 'Meters';
    // Add a string buffer to the request to force the JS API to send it via the proxy script, using the POST method;
    var strBuffer = '';
    if (mmLayers.length > 0) {
        //Add helpful hint as to which (Mastermap) layers to remove from legend
        strBuffer = strBuffer + 'RemoveFromLegend(';
        for (mmLayer = 0; mmLayer < mmLayers.length; mmLayer += 1) {
            if (mmLayer > 0) {
                //Also need to check if this layer is currently visible...
                strBuffer = strBuffer + ',';
            }
            strBuffer = strBuffer + mmLayers[mmLayer];
        }
        strBuffer = strBuffer + ')';
    }
    strBuffer = strBuffer + '                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                ';
    this.copyrightText = strBuffer + 'Modern aerial imagery © Blom Pictometry; 1946 aerial imagery © English Heritage. OS data © Crown copyright & database rights 2014 Ordnance Survey 100023406';
}

function fixLayerVis(strFixMapService) {
    var newVisArray = [];
    if (eval('btn' + strFixMapService + 'Map').checked) {
        for (var i = 0, il = eval(strFixMapService + 'MapService').visibleLayers.length; i < il; i++) {
            newVisArray.push(eval(strFixMapService + 'MapService').visibleLayers[i]);
        }
        for (var i = 0, j = eval(strFixMapService + 'GroupIDs').length; i < j; i++) {
            newVisArray.push(eval(strFixMapService + 'GroupIDs')[i]);
        }
    }
    return newVisArray;
}

function executePrintTask() {
    //esri.config.defaults.io.proxyUrl = strProtocol + '//maps.bristol.gov.uk/pinpoint/printmap.ashx';
    esri.config.defaults.io.proxyUrl = 'printmap.ashx';
    esri.config.defaults.io.alwaysUseProxy = true;
    //var jsPrintTaskURL = strProtocol + '//gmslive.gis.bcc.lan:6080/arcgis/rest/services/test/ExportBCCWebMap/GPServer/Export%20Web%20Map';
    //var jsPrintTaskURL = strProtocol + '//gmslive.gis.bcc.lan:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task';
    var jsPrintTaskURL = strProtocol + '//maps.bristol.gov.uk/ArcGIS/rest/services/External/printmap/GPServer/Export%20Web%20Map';
    var jsPrintTask = new esri.tasks.PrintTask(jsPrintTaskURL);
    var jsPrintTemplate = new esri.tasks.PrintTemplate();
    //jsPrintTemplate.format = "PDF";
    jsPrintTemplate.format = cbbPrintFormat.getValue();
    //jsPrintTemplate.layout = "MAP_ONLY";
    //    jsPrintTemplate.exportOptions = {
    //        dpi: 192,
    //        height: 1200,
    //        width: 1200
    //    };
    //jsPrintTemplate.layout = "bcc_template";
    //jsPrintTemplate.layout = "A4 Landscape";
    jsPrintTemplate.layout = cbbPrintSize.getValue();
    if (cbxLegend.checked == false) jsPrintTemplate.layout = jsPrintTemplate.layout + ' Basic';
    jsPrintTemplate.exportOptions = {
        dpi: 192
    };
    jsPrintTemplate.layoutOptions = new jsPrintLayoutOptions();
    jsPrintTemplate.preserveScale = true;
    var jsPrintParams = new esri.tasks.PrintParameters();
    jsPrintParams.map = jsMap;
    jsPrintParams.template = jsPrintTemplate;
    jsPrintTask.execute(jsPrintParams, function (result) {
        lblPrint.update('<a target="_print" href="' + strProtocol + '//maps.bristol.gov.uk/pinpoint/printmap.ashx?' + result.url + '" onclick="javascript:resetWinFrmPrint();">View / save your document</a>');
        //window.open(result.url);
    }, function (error) {
        lblPrint.update('Sorry, the print request failed.');
    });
    esri.config.defaults.io.alwaysUseProxy = false;
}

function resetWinFrmPrint() {
    winFrmPrint.hide();
    btnPrint.show();
    lblPrint.hide();
    lblPrint.update('Preparing - please wait...');
}

function printJSMap() {
    var currentHERVisArray = HERMapService.visibleLayers;
    var currentLIVisArray = LIMapService.visibleLayers;
    // Force group layers on to overcome print legend rendering bug
    HERMapService.setVisibleLayers(fixLayerVis('HER'), true);
    LIMapService.setVisibleLayers(fixLayerVis('LI'), true);
    lblPrint.show();
    executePrintTask();
    HERMapService.setVisibleLayers(currentHERVisArray, true);
    LIMapService.setVisibleLayers(currentLIVisArray, true);
}

function resizeJSMap() {
    try {
        jsMap.resize();
        jsMap.reposition();
    }
    catch (e) {
    }
}

function changeBaseMapVis(bmIndex) {
    try {
        jsMap.getLayer(jsMap.layerIds[0]).hide();
        jsMap.getLayer(jsMap.layerIds[1]).hide();
        jsMap.getLayer(jsMap.layerIds[2]).hide();
        jsMap.getLayer(jsMap.layerIds[3]).hide();
        jsMap.getLayer(jsMap.layerIds[4]).hide();
        jsMap.getLayer(jsMap.layerIds[5]).hide();
        jsMap.getLayer(jsMap.layerIds[6]).hide();
        jsMap.getLayer(jsMap.layerIds[7]).hide();
        jsMap.getLayer(jsMap.layerIds[8]).hide();
        jsMap.getLayer(jsMap.layerIds[9]).hide();
        jsMap.getLayer(jsMap.layerIds[10]).hide();
        jsMap.getLayer(jsMap.layerIds[11]).hide();
        jsMap.getLayer(jsMap.layerIds[bmIndex]).show();
        if (bmIndex == 0) {
            olService.show();
        }
        else {
            olService.hide();
        }
    }
    catch (e) {
    }
}

function changeMapLayerVis(bmIndex) {
    try {
        if (jsMap.getLayer(jsMap.layerIds[bmIndex]).visible) {
            jsMap.getLayer(jsMap.layerIds[bmIndex]).hide();
            if (bmIndex == 0) olService.hide();
        }
        else {
            jsMap.getLayer(jsMap.layerIds[bmIndex]).show();
            if (bmIndex == 0) olService.show();
        }
    }
    catch (e) {
    }
}

function toggleMapGraphics() {
    if (btnGraphics.checked) {
        jsMap.graphics.show();
        textGraphicsLayer.show();
    }
    else {
        jsMap.graphics.hide();
        textGraphicsLayer.hide();
    }
}

function jsMap_Clicked(evt) {
    handleMapClick(evt.mapPoint);
}

function handleMapClick(mapPoint) {
    clickedX = mapPoint.x;
    clickedY = mapPoint.y;
    if (map.isDrawing == false && measurement.area.checked == false && measurement.distance.checked == false && measurement.location.checked == false) {
        if (currentRecord != null) jsMap.graphics.remove(currentRecord.feature);
        if (map.isHERCapturing) {
            markHERUserPoint(mapPoint.x, mapPoint.y);
            updateHERUserPoint(Math.round(mapPoint.x * 1000) / 1000, Math.round(mapPoint.y * 1000) / 1000);
        }
        else if (map.isLICapturing && (map.isCCReplying == false)) {
            markLIUserPoint(mapPoint.x, mapPoint.y);
            updateLIUserPoint(Math.round(mapPoint.x * 1000) / 1000, Math.round(mapPoint.y * 1000) / 1000);
        }
        else {
            AssetidentifyParams = new esri.tasks.IdentifyParameters();
            if (strDLMobile == "jsmobile") { AssetidentifyParams.tolerance = 10; } else { AssetidentifyParams.tolerance = 5; };
            AssetidentifyParams.returnGeometry = true;
            AssetidentifyParams.width = jsMap.width;
            AssetidentifyParams.height = jsMap.height;
            AssetidentifyParams.geometry = mapPoint;
            AssetidentifyParams.maxAllowableOffset = 2;
            AssetidentifyParams.mapExtent = jsMap.extent;
            if (btnAssetMap.checked) {
                AssetidentifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
                AssetidentifyParams.layerIds = AssetMapService.visibleLayers;
            }
            else {
                AssetidentifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
            }
            AssetidentifyTask = new esri.tasks.IdentifyTask(AssetMapServiceURL);
            dojo.connect(AssetidentifyTask, "onComplete", function (AssetidResults) {
                assetinfo_Results = AssetidResults;
                HERidentifyParams = new esri.tasks.IdentifyParameters();
                if (strDLMobile == "jsmobile") { HERidentifyParams.tolerance = 10; } else { HERidentifyParams.tolerance = 5; };
                HERidentifyParams.returnGeometry = true;
                HERidentifyParams.width = jsMap.width;
                HERidentifyParams.height = jsMap.height;
                HERidentifyParams.geometry = mapPoint;
                HERidentifyParams.mapExtent = jsMap.extent;
                HERidentifyParams.maxAllowableOffset = 2;
                if (btnHERMap.checked) {
                    HERidentifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
                    HERidentifyParams.layerIds = HERMapService.visibleLayers;
                }
                else {
                    HERidentifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
                }
                HERidentifyTask = new esri.tasks.IdentifyTask(HERMapServiceURL);
                dojo.connect(HERidentifyTask, "onComplete", function (HERidResults) {
                    HER_Results = HERidResults;
                    LIidentifyParams = new esri.tasks.IdentifyParameters();
                    if (strDLMobile == "jsmobile") { LIidentifyParams.tolerance = 10; } else { LIidentifyParams.tolerance = 5; };
                    LIidentifyParams.returnGeometry = true;
                    LIidentifyParams.width = jsMap.width;
                    LIidentifyParams.height = jsMap.height;
                    LIidentifyParams.geometry = mapPoint;
                    LIidentifyParams.maxAllowableOffset = 2;
                    LIidentifyParams.mapExtent = jsMap.extent;
                    if (btnLIMap.checked) {
                        LIidentifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
                        LIidentifyParams.layerIds = LIMapService.visibleLayers;
                    }
                    else {
                        LIidentifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
                    }
                    LIidentifyTask = new esri.tasks.IdentifyTask(LIMapServiceURL);
                    dojo.connect(LIidentifyTask, "onComplete", function (LIidResults) {
                        localinfo_Results = LIidResults;
                        addToMap(mapPoint);
                    });
                    LIidentifyTask.execute(LIidentifyParams);
                });
                HERidentifyTask.execute(HERidentifyParams);
            });
            AssetidentifyTask.execute(AssetidentifyParams);
        }
    }
}

function markHERUserPoint(x, y) {
    jsMap.graphics.remove(HERUserPointMarker);
    var HERUserPointMarkerSymbol = new esri.symbol.PictureMarkerSymbol('images/comment.png', 28, 28);
    HERUserPointMarker.symbol = HERUserPointMarkerSymbol;
    HERUserPointMarker.geometry = new esri.geometry.Point(x, y, new esri.SpatialReference({ wkid: 27700 }));
    jsMap.graphics.add(HERUserPointMarker);
}

function markLIUserPoint(x, y) {
    jsMap.graphics.remove(LIUserPointMarker);
    var LIUserPointMarkerSymbol = new esri.symbol.PictureMarkerSymbol('images/comment.png', 28, 28);
    LIUserPointMarker.symbol = LIUserPointMarkerSymbol;
    LIUserPointMarker.geometry = new esri.geometry.Point(x, y, new esri.SpatialReference({ wkid: 27700 }));
    jsMap.graphics.add(LIUserPointMarker);
}

function addToMap(point) {
    var content = "";
    intResults = assetinfo_Results.length - (0 - (HER_Results.length - (0 - localinfo_Results.length)));
    Results = { displayFieldName: null, features: [] };
    switch (intResults) {
        case 0:
            jsMap.infoWindow.hide();
            break;
        case 1:
            var currentResults = [];
            currentService = 'localinfo';
            if (assetinfo_Results.length == 1) {
                currentResults = assetinfo_Results;
                currentService = 'assetinfo';
            }
            else if (HER_Results.length == 1) {
                currentResults = HER_Results;
                currentService = 'HER';
            }
            else {
                currentResults = localinfo_Results;
            }
            strTitle = currentResults[0].layerName;
            if (strTitle == '') {
                // Ho hum, for some reason the JS API doesn't return raster layer names. This fix needs revisiting if and when other services include raster layers!
                Ext.each(dsLILayers.data.items, function (item, index) {
                    if (item.data.id == currentResults[0].layerId) strTitle = item.data.name;
                });
            }
            updateDetailContent(currentResults, 0);
            jsMap.infoWindow.show(jsMap.toScreen(point));
            break;
        default:
            summaryTitle = intResults + ' results';
            jsMap.infoWindow.setTitle(summaryTitle);
            summaryContent = '';
            if (assetinfo_Results.length > 0) { summaryContent = getSummaryContent(assetinfo_Results, 'assetinfo'); }
            if (HER_Results.length > 0) { summaryContent = summaryContent + getSummaryContent(HER_Results, 'HER'); }
            if (localinfo_Results.length > 0) { summaryContent = summaryContent + getSummaryContent(localinfo_Results, 'localinfo'); }
            jsMap.infoWindow.setContent(summaryContent);
            jsMap.infoWindow.show(jsMap.toScreen(point));
            if (strDLAddrX == '' && strDLAddrY == '') setTimeout('makeRoomForInfoWindow();', 0);
    }
    if (strDLLayer != null && intResults > 0 && strDLX != '' && strDLY != '' && strDLAddrX != '' && strDLAddrY != '' && strDLUPRN != null) {
            // Zoom to show address and layer item
            var distX = Math.abs(strDLAddrX - strDLX);
            var distY = Math.abs(strDLAddrY - strDLY);
            var midX = Math.min(strDLAddrX, strDLX) + (distX / 2);
            var midY = Math.min(strDLAddrY, strDLY) + (distY / 2);
            strDLUPRN = null;
            map.zoomTo(midX, midY, Math.max(distX, distY) * 1.33);
    }
    strDLAddrX = '';
    strDLAddrY = '';
}

function showDeepLinkOptions(deepLink) {
    jsMap.infoWindow.resize(300, 240);
    var strURLSplit = self.location.href.split("/");
    var fullLink = '';
    if (deepLink) {
        fullLink = strProtocol + '//' + strURLSplit[2] + '/' + strURLSplit[3] + '/' + strDeepLink;
    }
    else {
        fullLink = strProtocol + '//' + strURLSplit[2] + '/' + strURLSplit[3] + '/' + strLayerLink;
    }
    var strDLContent = '<h2>Share a link to this location</h2><br /><table>';
    strDLContent += '<tr><td colspan=2>Highlight current selection:&nbsp;';
    strDLContent += '<input type="radio" name="linktype" value="location" onclick="javascript:if(this.checked)showDeepLinkOptions(true);"';
    if (deepLink) strDLContent += ' checked=true';
    strDLContent += '>&nbsp;Yes</input>&nbsp;<input type="radio" name="linktype" value="layer" onclick="javascript:if(this.checked)showDeepLinkOptions(false);"';
    if (deepLink == false) strDLContent += ' checked=true';
    strDLContent += '>&nbsp;No</td></tr>';
    strDLContent += '<tr valign="top"><td><a target="_blank" href="' + fullLink + '">Link</a>:&nbsp;</td><td><input readonly style="width:205px" value="' + fullLink + '" /></td></tr>';
    strDLContent += '<tr valign="top"><td>Embed:&nbsp;</td><td><textarea style="width:205px;height:80px"><iframe width="100%" height="600" frameborder="0" src="' + fullLink + '"></iframe></textarea></td></tr></table>';
    strDLContent += '<br /><a href="#" onclick="javascript:jsMap.infoWindow.resize(recordWidth, recordHeight);jsMap.infoWindow.setContent(recordDetails);">&lt;&lt;&nbsp;Return&nbsp;to&nbsp;selected&nbsp;feature\'s&nbsp;details</a>';
    jsMap.infoWindow.setContent(strDLContent);
}

function makeRoomForInfoWindow() {
    var newMapCentrePoint;
    // Get current extent width and height
    var extentX = jsMap.extent.xmax - jsMap.extent.xmin;
    var extentY = jsMap.extent.ymax - jsMap.extent.ymin;
    // Get current map centre X and Y
    var centreX = jsMap.extent.xmin + extentX / 2;
    var centreY = jsMap.extent.ymin + extentY / 2;
    // Get X and Y distance of map click from map centre;
    var distX = clickedX - centreX;
    var distY = clickedY - centreY;
    if (zoomX != '') distX = zoomX - centreX;
    if (zoomY != '') distY = zoomY - centreY;
    // Use distX and distY to create "polarity fixers" for new centre point calculations
    var polarityX = 1;
    var polarityY = 1;
    if (distX != 0) polarityX = distX / Math.abs(distX);
    if (distY != 0) polarityY = distY / Math.abs(distY);
    // Get extent of click zone that requires recentering;
    var middleZoneFactor = 4;
    var middleX = extentX / middleZoneFactor;
    var middleY = extentY / middleZoneFactor;
    var workingMapCentrePoint = new esri.geometry.Point;
    if ((jsMap.infoWindow.width > ((jsMap.width / 2) - intExtraInfoWinWidth)) && (Math.abs(distX) < middleX)) {
        workingMapCentrePoint.x = centreX - (middleX - Math.abs(distX)) * (polarityX);
    }
    else {
        workingMapCentrePoint.x = centreX;
    }
    if ((jsMap.infoWindow.height > ((jsMap.height / 2) - intExtraInfoWinHeight)) && (Math.abs(distY) < middleY)) {
        workingMapCentrePoint.y = centreY - (middleY - Math.abs(distY)) * (polarityY);
    }
    else {
        workingMapCentrePoint.y = centreY;
    }
    var newMapCentrePoint = new esri.geometry.Point(workingMapCentrePoint.x, workingMapCentrePoint.y, new esri.SpatialReference({ wkid: 27700}));
    if (intResults > 0 && (newMapCentrePoint.x != centreX || newMapCentrePoint.y != centreY)) jsMap.centerAt(newMapCentrePoint);
}

function getSummaryContent(idResults, currentService) {
    var content = "<table border='0'>";
    var lastLayerName = '';
    zoomX = '';
    zoomY = '';
    try { jsMap.infoWindow.resize(300, 200); } catch (e) { };
    for (var i = 0, il = idResults.length; i < il; i++) {
        var idResult = idResults[i];
        var l = idResult.layerId;
        var attribute = idResult.displayFieldName;
        if (attribute == '') attribute = 'Value';
        var thisLayerName = idResult.layerName;
        if (thisLayerName == '') {
            // Ho hum, for some reason the JS API doesn't return raster layer names. This fix needs revisiting if and when other services include raster layers!
            Ext.each(dsLILayers.data.items, function (item, index) {
                if (item.data.id == idResult.layerId) thisLayerName = item.data.name;
            });
        }
        if (thisLayerName != lastLayerName) {
            content += '<tr><td><b>' + thisLayerName + '</b</td></tr>';
        }
        content += '<tr><td><a href="#" onclick="if(currentRecord != null) {jsMap.graphics.remove(currentRecord.feature);currentRecord=null;};currentService=\'' + currentService + '\';strTitle=\'' + thisLayerName + '\';updateDetailContent(' + currentService + '_Results, ' + i + '); return false;">' + attribute + ': ' + idResult.value + '</a> ';
        lastLayerName = thisLayerName;
    }
    content += "</tr></table>";
    return content;
}

function updateDetailContent(idResults, i) {
    var thisResultIndex = i;
    var detailContent;
    var winWidth;
    var winHeight;
    currentRecord = idResults[thisResultIndex];
    showFeature(currentRecord.feature);
    var strTitleWithLink = '';
    var zoomExtent = '';
    zoomX = '';
    zoomY = '';
    var preZoomLink = '';
    try {
        if (currentRecord.feature.geometry.type == 'point') {
            zoomX = currentRecord.feature.geometry.x;
            zoomY = currentRecord.feature.geometry.y;
            zoomExtent = 250;
            preZoomLink = preZoomLinkPoint;
        }
        else {
            zoomX = currentRecord.feature.geometry.getExtent().getCenter().x;
            zoomY = currentRecord.feature.geometry.getExtent().getCenter().y;
            zoomExtent = currentRecord.feature.geometry.getExtent().getHeight();
            if (currentRecord.feature.geometry.getExtent().getWidth() > zoomExtent) zoomExtent = currentRecord.feature.geometry.getExtent().getWidth();
            if (zoomExtent < 250) zoomExtent = 250;
            preZoomLink = preZoomLinkOther;
        }
    }
    catch (e) { }
    strZoomLink = 'map.zoomTo(' + zoomX + ', ' + zoomY + ', ' + zoomExtent + '); return false;';
    strDeepLink = '?service=' + currentService;
    if (document.title == "Parks Information") {
        strDeepLink = '?service=parks';
    }
    if (document.title == "Transport Information") {
        strDeepLink = '?service=transport';
    }
    if (strDLRegion != null && strDLRegion != '') strDeepLink += '&region=' + strDLRegion;
    if (strDLMobile == 'jsmobile') { strDeepLink += '&maptype=jsmobile' } else { strDeepLink += '&maptype=js' };
    var arrDLLayers = [];
    var thisLayerID = '';
    var thisLayerRow;
    var thisLayerName = '';
    for (var i = 0; i < AssetMapService.visibleLayers.length; i++) {
        thisLayerID = AssetMapService.visibleLayers[i];
        thisLayerRow = dsAssetLayers.getByDataId(thisLayerID);
        if (thisLayerRow) {
            thisLayerName = thisLayerRow.data.name;
            arrDLLayers.push(thisLayerName.replace(/\s/g, '+'));
        }
    }
    for (var i = 0; i < HERMapService.visibleLayers.length; i++) {
        thisLayerID = HERMapService.visibleLayers[i];
        thisLayerRow = dsHERLayers.getByDataId(thisLayerID);
        if (thisLayerRow) {
            thisLayerName = thisLayerRow.data.name;
            arrDLLayers.push(thisLayerName.replace(/\s/g, '+'));
        }
    }
    for (var i = 0; i < LIMapService.visibleLayers.length; i++) {
        thisLayerID = LIMapService.visibleLayers[i];
        thisLayerRow = dsLILayers.getByDataId(thisLayerID);
        if (thisLayerRow) {
            thisLayerName = thisLayerRow.data.name;
            arrDLLayers.push(thisLayerName.replace(/\s/g, '+'));
        }
    }
    if (strDLRole != '' && document.title != 'Parks Information') strDeepLink += '&role=' + strDLRole;
    strDeepLink += '&layer=' + arrDLLayers.join(';');
    switch (rgBaseMaps.getValue().id) {
        case 'Radio1':
            strDLMapBase = 'grey';
            break;
        case 'Radio2':
            strDLMapBase = 'aerial';
            break;
        case 'Radio3':
            strDLMapBase = '1949';
            break;
        case 'Radio4':
            strDLMapBase = '1946';
            break;
        case 'Radio5':
            strDLMapBase = '1900s';
            break;
        case 'Radio6':
            strDLMapBase = '1880s';
            break;
        case 'Radio7':
            strDLMapBase = '1874';
            break;
        case 'Radio8':
            strDLMapBase = '1855';
            break;
        case 'Radio9':
            strDLMapBase = '1840s';
            break;
        case 'Radio10':
            strDLMapBase = '1828';
            break;
        case 'Radio11':
            strDLMapBase = '1750';
            break;
        default:
            strDLMapBase = '';
    }
    if (strDLMapBase != '') strDeepLink += '&mapbase=' + strDLMapBase;
    if (pnlExplorer.collapsed) strDeepLink += '&sidebar=false';
    if (pnlMapOpts.collapsed) { strDeepLink += '&mapopts=none' } else if (pnlLegend.hidden == false) { strDeepLink += '&mapopts=legend' };
    var linkExtent = jsMap.extent.getHeight();
    if (jsMap.extent.getWidth() > linkExtent) linkExtent = jsMap.extent.getWidth();
    strDeepLink += '&extent=' + linkExtent;
    strLayerLink = strDeepLink;
    strDeepLink += '&x=' + clickedX + '&y=' + clickedY;
    strTitleWithLink = titleStart + strTitle + preZoomLink + strZoomLink + preDeepLink + '"#" onclick="javascript:showDeepLinkOptions(true);"' + titleEnd;
    jsMap.infoWindow.setTitle(strTitleWithLink);
    if (strDLPopUp == 'mini') {
        try { jsMap.infoWindow.resize(240, 120); } catch (e) { };
        detailContent = '<table><tr><td>' + currentRecord.feature.attributes[currentRecord.displayFieldName] + '</td></tr></table>';
        detailContent += '<a href="#" onclick="strDLPopUp = null; updateDetailContent(' + currentService + '_Results, ' + thisResultIndex + '); return false;">View details</a><br />';
        updateInfoWindowWithDetailContent(detailContent);
    }
    else {
        try { jsMap.infoWindow.resize(300, 200); } catch (e) { };
        var currentLayerName = currentRecord.layerName;
        if (currentLayerName == '') {
            // Ho hum, for some reason the JS API doesn't return raster layer names. This fix needs revisiting if and when other services include raster layers!
            Ext.each(dsLILayers.data.items, function (item, index) {
                if (item.data.id == currentRecord.layerId) currentLayerName = item.data.name;
            });
        }
        var templateURL = "/templates/" + currentLayerName.replace(/ /g, "_") + ".htm";
        var xhrArgs = {
            url: templateURL,
            handleAs: "text",
            load: function (data) {
                data = data.replace(/\n/g, "");
                data = data.replace(/\r/g, "");
                contentTemplate = data;
            },
            error: function (error) {
                contentTemplate = "${}";
            }
        }
        var deferred = dojo.xhrGet(xhrArgs);
        deferred.then(
            function (value) {
                try {
                    detailContent = esri.substitute(currentRecord.feature.attributes, contentTemplate);
                }
                catch (e) {
                    detailContent = "<tr><td>Sorry, no details are available for this record at the moment.</td></tr>"
                }
                detailContent = '<table style="width:95%" cols="2">' + detailContent + '</table>';
                updateInfoWindowWithDetailContent(detailContent);
                if (strDLAddrX == '' && strDLAddrY == '') setTimeout('makeRoomForInfoWindow();', 0);
            },
            function (error) {
                detailContent = esri.substitute(currentRecord.feature.attributes, "${*}");
                updateInfoWindowWithDetailContent(detailContent);
                if (strDLAddrX == '' && strDLAddrY == '') setTimeout('makeRoomForInfoWindow();', 0);
            }
        );
    }
    if (tpTables.activeTab != undefined) {
        var cbs = Ext.ComponentMgr.get(tpTables.activeTab.id.replace('tab_', 'cbs_'));
        if (cbs.value == 'the selected feature') {
            var btnFnd = Ext.ComponentMgr.get(tpTables.activeTab.id.replace('tab_', 'fnd_'));
            var currentSearchLayer = '';
            currentSearchService = tpTables.activeTab.id.split('_')[1];
            currentSearchLayer = tpTables.activeTab.title;
            if (currentSearchService != currentService || currentSearchLayer != currentRecord.layerName) btnFnd.btnEl.dom.click();
        }
    }
}

function updateInfoWindowWithDetailContent(newContent) {
    if (intResults > 1) {
        // Add a back button to the window content, to allow the user to return to the summary view
        jsMap.infoWindow.resize(jsMap.infoWindow.width, jsMap.infoWindow.height + 30);
        newContent += '<br /><div><a href="#" onclick="if(currentRecord != null){jsMap.graphics.remove(currentRecord.feature);currentRecord=null;};jsMap.infoWindow.resize(300, 200);jsMap.infoWindow.setTitle(summaryTitle);jsMap.infoWindow.setContent(summaryContent); return false;">&lt;&lt; Return to summary</a></div>';
    }
    recordDetails = newContent;
    recordWidth = jsMap.infoWindow.width;
    recordHeight = jsMap.infoWindow.height;
    jsMap.infoWindow.setContent(newContent);
}

function initID() {
    dojo.connect(jsMap, "onClick", jsMap_Clicked);
    dojo.connect(jsMap.infoWindow, "onHide", infoWinHidden);
}

function infoWinHidden() {
    jsMap.infoWindow.setContent(null);
    if (currentRecord != null) {
        jsMap.graphics.remove(currentRecord.feature);
        currentRecord = null;
        resetFrmSA();
        recordUser = '';
    }
    clickedX = '';
    clickedY = '';
    zoomX = '';
    zoomY = '';
}

function showFeature(feature) {
    if (feature.geometry.type == 'point' || feature.geometry.type == 'multipoint') {
        var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 6, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 255, 255]), 2), new dojo.Color([0, 255, 255]));
    }
    else if (feature.geometry.type == 'line' || feature.geometry.type == 'polyline') {
        var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 255, 255]), 2);
    }
    else {
        var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_NULL, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 255, 255]), 2), new dojo.Color([0, 255, 255]));
    }
    feature.symbol = symbol;
    jsMap.graphics.add(feature);
}

function showFullLayerList() {
    if (lnkHistoric.hidden == false) {
        Radio3.show();
        Radio4.show();
        Radio5.show();
        Radio6.show();
        Radio7.show();
        Radio8.show();
        Radio9.show();
        Radio10.show();
        Radio11.show();
        lnkHistoric.hide();
        pnlLayers.setHeight(348);
    }
}

function showTextDialogue(textGeom) {
    Ext.Msg.prompt('Enter label text', 'Please enter the text for your label:', function (btn, text) {
        if (btn == 'ok') {
            textGraphicsLayer.remove(drawnShapeLabel);
            if (textGeom != null) {
                if (textGeom.type == 'point') {
                    var fX = textGeom.x;
                    var fY = textGeom.y;
                    // 'Feature buffer'
                    var fb = 100;
                    var polyJson = { 'geometry': { 'rings': [[[fX - fb, fY - fb], [fX - fb, fY + fb], [fX + fb, fY + fb], [fX + fb, fY - fb], [fX - fb, fY - fb]]], 'spatialReference': { 'wkid': 27700}} };
                    drawnShapeLabel = new esri.Graphic(polyJson);
                    drawnShapeLabel = new esri.Graphic(drawnShapeLabel.geometry.getExtent().getCenter());
                }
                else {
                    drawnShapeLabel = new esri.Graphic(textGeom.getExtent().getCenter());
                }
                var labelSymbol = new esri.symbol.TextSymbol({
                    'type': 'esriTS',
                    'color': new dojo.Color([0, 0, 0]),
                    'font': {
                        'family': 'Arial',
                        'size': 14,
                        'weight': 'bold'
                    },
                    'xoffset': 0,
                    'yoffset': 0
                });
                labelSymbol.setAlign(esri.symbol.TextSymbol.ALIGN_START);
                labelSymbol.setText(text);
                drawnShapeLabel.setSymbol(labelSymbol);
                textGraphicsLayer.add(drawnShapeLabel);
            }
        }
    });
}
