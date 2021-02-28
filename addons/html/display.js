// ###############  HTML DISPLAY  ###############

var oldFormatValueForDisplay = SocialCalc.FormatValueForDisplay;
SocialCalc.FormatValueForDisplay = function(sheetobj, value, cr, linkstyle) {
    var cell = sheetobj.GetAssuredCell(cr);
    var rownum = SocialCalc.coordToCr(cr).row;
    //Check if it is HTML
    if (cell.valuetype.charAt(0) == 't') {
        var html = SocialCalc.SpreadsheetControl.GetHTMLContent(value);
        if (!html && cell.valuetype == "th") html = value;
        if (html) {
            //Sanitise and rename ids and classes
            value = SocialCalc.HtmlSanitizer.SanitizeHtml(html, "sc-renamed-cell-" + cr + "-");
            var height = sheetobj.rowattribs.height[rownum] || (sheetobj.attribs.rowheight ? sheetobj.attribs.rowheight["html"] : false) || 300;
            if (sheetobj.attribs.ignorerowheights) return '<div>' + value + '</div>';
            else return '<div class="tablerow-html-' + rownum + '" style="max-height:' + height + 'px;overflow:auto;">' + value + '</div>';
        }
        var json = SocialCalc.SpreadsheetControl.GetJSONContent(value);
        if (json) {
            value = SocialCalc.special_chars(json);
            var height = sheetobj.rowattribs.height[rownum] || (sheetobj.attribs.rowheight ? sheetobj.attribs.rowheight["json"] : false) || 300;
            if (sheetobj.attribs.ignorerowheights) return '<div>' + value + '</div>';
            else return '<div class="tablerow-json-' + rownum + '" style="max-height:' + height + 'px;overflow:auto;">' + value + '</div>';
        }
    }
    var value = oldFormatValueForDisplay(sheetobj, value, cr, linkstyle);
    var height = sheetobj.rowattribs.height[rownum] || (sheetobj.attribs.rowheight ? sheetobj.attribs.rowheight["wiki"] : false) || 300;
    if (sheetobj.attribs.ignorerowheights || !value.startsWith('<div class="wiki')) return value;
    else return value.substring(0, 16) + ' tablerow-wiki-' + rownum + '" style="max-height:' + height + 'px;overflow:auto;' + value.substring(16);
}



var oldRenderRow = SocialCalc.RenderRow;
SocialCalc.RenderRow = function(context, rownum, rowpane, linkstyle) {
    var result = oldRenderRow(context, rownum, rowpane, linkstyle);
    var sheetobj = context.sheetobj;
    if (!sheetobj.attribs.ignorerowheights) {
        for (var type of ["html", "json", "wiki"]) {
            var elements = result.getElementsByClassName("tablerow-" + type + "-" + rownum);
            var height = sheetobj.rowattribs.height[rownum] || (sheetobj.attribs.rowheight ? sheetobj.attribs.rowheight[type] : false) || 300;//|| sheetobj.attribs.defaultrowheight || SocialCalc.Constants.defaultAssumedRowHeight;
            for (var element of elements) {
                element.style.maxHeight = height + "px";
                element.style.overflow = "auto";
            }
        }
    }

    return result;
}