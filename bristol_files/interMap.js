function interMap() {
    this.toggleTip = toggleTip;
    this.zoomTo = zoomTo;
    this.markAddress = markAddress;
    this.markAnotherAddress = markAnotherAddress;
    this.isDrawing = isDrawing;
    this.isHERCapturing = isHERCapturing;
    this.isLICapturing = isLICapturing;
    this.isCCReplying = isCCReplying;
    this.removeDrawnShape = removeDrawnShape;
    this.removeHERUserPoint = removeHERUserPoint;
    this.removeLIUserPoint = removeLIUserPoint;
    this.changeLayerVis = changeLayerVis;
    this.updateLegend = updateLegend;
    this.printMap = printMap;
}
function toggleTip() {
    alert('This is where the tip-toggling code should be');
}
function zoomTo(x, y, extent) {
    blnZoom = true;
    var newPoint = new esri.geometry.Point(x, y, new esri.SpatialReference({ wkid: 27700 }));
    extent = extent / 2;
    var newExtent = new esri.geometry.Extent(x - extent, y - extent, x - -extent, y - -extent, new esri.SpatialReference({ wkid: 27700 }));
    jsMap.setExtent(newExtent, true);
}
function markAddress(x, y) {
    jsMap.graphics.remove(addressMarker);
    var addressMarkerSymbol = new esri.symbol.PictureMarkerSymbol('images/marker.png', 32, 32);
    addressMarker.symbol = addressMarkerSymbol;
    addressMarker.geometry = new esri.geometry.Point(x, y, new esri.SpatialReference({ wkid: 27700 }));
    jsMap.graphics.add(addressMarker);
}
function markAnotherAddress(x, y, label) {
    var anotherAddressMarker = new esri.Graphic([]);
    var addressMarkerSymbol;
    if (label == '0') {
        addressMarkerSymbol = new esri.symbol.PictureMarkerSymbol('images/marker.png', 32, 32);
        anotherAddressMarker.setAttributes({ "OperativeID": 12345 });
    }
    else {
        addressMarkerSymbol = new esri.symbol.PictureMarkerSymbol('images/marker2.png', 32, 32);
    }
    anotherAddressMarker.symbol = addressMarkerSymbol;
    anotherAddressMarker.geometry = new esri.geometry.Point(x, y, new esri.SpatialReference({ wkid: 27700 }));
    jsMap.graphics.add(anotherAddressMarker);
    dojo.connect(jsMap.graphics, "onDblClick", identifyGraphics);
    var anotherAddressLabel = new esri.Graphic([]);
    anotherAddressLabel.geometry = new esri.geometry.Point(x, y, new esri.SpatialReference({ wkid: 27700 }));
    var labelSymbol = new esri.symbol.TextSymbol({
        'type': 'esriTS',
        'color': new dojo.Color([0, 0, 0]),
        'font': {
            'family': 'Arial',
            'size': 18,
            'weight': 'bold'
        },
        'xoffset': -3,
        'yoffset': -3
    });
    labelSymbol.setAlign(esri.symbol.TextSymbol.ALIGN_END);
    labelSymbol.setText(label);
    anotherAddressLabel.setSymbol(labelSymbol);
    textGraphicsLayer.add(anotherAddressLabel);
}
function removeDrawnShape() {
    imbLabel.disable();
    jsMap.graphics.remove(drawnShape);
    drawnShape = null;
    textGraphicsLayer.remove(drawnShapeLabel);
    drawnShapeLabel = null;
}
function removeHERUserPoint() {
    jsMap.graphics.remove(HERUserPointMarker);
}
function removeLIUserPoint() {
    jsMap.graphics.remove(LIUserPointMarker);
}
function changeLayerVis(serviceID, layerID, newVis) {
    var mapService = jsMap.getLayer(serviceID);
    var currentVisArray = mapService.visibleLayers;
    var newVisArray = [];
    for (var i = 0, il = currentVisArray.length; i < il; i++) {
        if (currentVisArray[i] != layerID) {
            newVisArray.push(currentVisArray[i]);
        }
        else {
        }
    }
    if (newVis) {
        newVisArray.push(layerID);
    }
    mapService.setVisibleLayers(newVisArray);
}
function updateLegend() {
    jsLegend.refresh();
}
function printMap() {
    printJSMap();
}
var isDrawing = false;
var isHERCapturing = false;
var isLICapturing = false;
var isCCReplying = false;
