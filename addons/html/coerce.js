//Init
if (!SocialCalc.SpreadsheetControl.Coerce) SocialCalc.SpreadsheetControl.Coerce = {};

SocialCalc.SpreadsheetControl.Coerce.ShowDialog = function () {

    var SCLocSS = SocialCalc.LocalizeSubstrings;

    var str, ele;

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;

    var idp = spreadsheet.idPrefix + "coerce-";

    if (!SocialCalc.SpreadsheetControl.CheckLoneDialog(idp + "dialog")) {
        return;
    }

    editor.inputBox.element.disabled = true;

    str = "";

    str += '<div id="' + idp + 'controls" style="width:380px;text-align:right;padding:6px 0px 4px 6px;font-size:small;"></div>';

    if (!SocialCalc.SpreadsheetControl.HTMLCoercionControlElements) {

        var controlhtml =
            SCLocSS(
                '<select id="' + idp + 'output-combobox" value="html" style="font-size:smaller;">' +
                '<option value="html">%loc!As HTML!</option>' +
                '<option value="html">%loc!As wrapped HTML!</option>' +
                '<option value="text">%loc!As text!</option>' +
                '<option value="natural">%loc!As natural!</option>' +
                '</select>' +

                '<input type="button" value="%loc!Set Cell Contents!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.Coerce.DoCoercion();">&nbsp;' +
                '<input type="button" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.Coerce.HideDialog();"></div>');

        var cediv = document.createElement("div");
        cediv.innerHTML = controlhtml;
        
        SocialCalc.SpreadsheetControl.Coerce.ControlElements = [];
        for (var i = 0; i < cediv.children.length; i++) {
            var child = cediv.children[i];
            SocialCalc.SpreadsheetControl.Coerce.ControlElements.push(child);
        }

    }

    var main = document.createElement("div");
    main.id = idp + "dialog";

    main.style.position = "absolute";

    var vp = SocialCalc.GetViewportInfo();
    var pos = SocialCalc.GetElementPositionWithScroll(spreadsheet.spreadsheetDiv);

    main.style.top = ((vp.height / 3) - pos.top) + "px";
    main.style.left = ((vp.width / 3) - pos.left) + "px";
    main.style.zIndex = 100;
    main.style.backgroundColor = "#FFF";
    main.style.border = "1px solid black";

    //TODO Make nice
    main.innerHTML = '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>' +
        '<td style="font-size:10px;cursor:default;width:380px;background-color:#999;color:#FFF;">' +
        SCLocSS("&nbsp;%loc!Coerce Selected Data!") + '</td>' +
        '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.Coerce.HideDialog();">&nbsp;X&nbsp;</td></tr></table>' +
        '<div style="background-color:#DDD;">' + str + '</div>';

    

    SocialCalc.DragRegister(main.firstChild.firstChild.firstChild.firstChild, true, true,
        {
            MouseDown: SocialCalc.DragFunctionStart,
            MouseMove: SocialCalc.DragFunctionPosition,
            MouseUp: SocialCalc.DragFunctionPosition,
            Disabled: null, positionobj: main
        },
        spreadsheet.spreadsheetDiv);

    spreadsheet.spreadsheetDiv.appendChild(main);

    //Set up controls
    var controlElement = document.getElementById(idp + "controls");
    for (var i = 0; i < SocialCalc.SpreadsheetControl.Coerce.ControlElements.length; i++) {
        controlElement.appendChild(SocialCalc.SpreadsheetControl.Coerce.ControlElements[i]);
    }

    ele = document.getElementById(idp + "output-combobox");
    ele.focus();
    SocialCalc.CmdGotFocus(ele);
    //!!! need to do keyboard handling: if esc, hide?

}



SocialCalc.SpreadsheetControl.Coerce.HideDialog = function() {
    SocialCalc.SpreadsheetControl.HideDialog("coerce");
}



SocialCalc.SpreadsheetControl.Coerce.DoCoercion = function() {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "coerce-";

    var coercion = document.getElementById(idp + "output-combobox").value;

    var editor = spreadsheet.editor;
    var wval = editor.workingvalues;

    var cmd = "";

    if (editor.range.hasrange) {
        wval.ecoord = SocialCalc.crToCoord(editor.range.left, editor.range.top);
        wval.ecol = editor.range.top;
        wval.erow = editor.range.left;
        wval.numcols = editor.range.right - editor.range.left + 1;
        wval.numrows = editor.range.bottom - editor.range.top + 1;
        
        for (var row = editor.range.top; row <= editor.range.bottom; row++) {
            for (var col = editor.range.left; col <= editor.range.right; col++) {
                var cr = SocialCalc.crToCoord(col, row);
                var c = SocialCalc.SpreadsheetControl.Coerce.DoCoercionForCell(coercion, cr);
                if (c) cmd += (cmd == "" ? "" : "\n") + c;
            }
        }
    }
    else {
        wval.ecoord = editor.ecell.coord;
        wval.erow = editor.ecell.row;
        wval.ecol = editor.ecell.col;
        cmd = (SocialCalc.SpreadsheetControl.Coerce.DoCoercionForCell(coercion, wval.ecoord) || "");
    }

    SocialCalc.SpreadsheetControl.Coerce.HideDialog();

    if (cmd != "") editor.EditorScheduleSheetCommands(cmd, true, false);

}

SocialCalc.SpreadsheetControl.Coerce.DoCoercionForCell = function(coercion, cr) {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    // var editor = spreadsheet.editor;
    var sheet = spreadsheet.sheet;

    cell = sheet.GetAssuredCell(cr);
    if (cell.readonly) return null;

    var value = cell.datavalue;//SocialCalc.GetCellContents(editor.context.sheetobj, cr);
    var valuetype = cell.valuetype;

    //TODO If formula?
    coercionResult = SocialCalc.SpreadsheetControl.Coerce.DoCoercionForValue(coercion, value, valuetype);
    value = coercionResult.value;
    var type = coercionResult.type;

    value = SocialCalc.encodeForSave(value);

    var cmdline;
    if (value == "") cmdline = "set "+cr+" empty";
    cmdline = "set "+cr+" "+type+" "+value;
    return cmdline;

}



SocialCalc.SpreadsheetControl.Coerce.DoCoercionForValue = function(coercion, value, valuetype) {

    var html, json;

    if ((html = SocialCalc.SpreadsheetControl.GetHTMLContent(value)) || valuetype == "th" ? value : null) {
        value = SocialCalc.HtmlSanitizer.SanitizeHtml(html);
    }
    else if (json = SocialCalc.SpreadsheetControl.GetJSONContent(value)) {
        value = json;
    }
    else if (value.startsWith("'")) {
        value = value.substring(1);
    }

    var type = "text t";

    switch (coercion) {
        case "text":
        case "natural":

            if (html) {
                var rootNode = document.createElement("div");
                rootNode.innerHTML = value;
                var xpathResult = document.evaluate("//text()", rootNode, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
                value = "";
                while (node = xpathResult.iterateNext()) {
                    if (node.data) {
                        var text = node.data.trim();
                        if (text.length > 0) {
                            value += (value == "" ? "" : " ") + text;
                        }
                    }
                }
            }

            if (coercion == "natural") {
                var parse = SocialCalc.Formula.ParseFormulaIntoTokens(value);
                if (parse.length == 1 && parse[0].type == 1) {
                    type = "value n";
                }
            }

        break;
        case "html":
        case "wrappedhtml":
        default:
            if (!html) {
                value = SocialCalc.special_chars(value);
            }
            if ("wrappedhtml") value = "<div>" + value + "</div>";
            value = SocialCalc.SpreadsheetControl.BeautifyHtml(value);
            value = ".html\n\n" + value + "\n\n.html";
            var type = "text th";
        break;
        
    }

    return {
        value: value,
        type: type
    };

}
