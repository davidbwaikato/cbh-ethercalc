//Init
if (!SocialCalc.SpreadsheetControl.Preview) SocialCalc.SpreadsheetControl.Preview = {}

SocialCalc.SpreadsheetControl.Preview.ShowDialog = function (sheet, coord, callback, autoUpdated) {

    var SCLocSS = SocialCalc.LocalizeSubstrings;

    var str, ele;

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;

    var idp = spreadsheet.idPrefix + "preview-";

    ele = document.getElementById(idp + "dialog");
    if (!ele) {

        editor.inputBox.element.disabled = true;

        str = "";

        str += '<div id="' + idp + 'display-pane" style="width:680px;height:120px;margin:0px 10px 10px 10px; background-color: white; resize: both; overflow: auto;"></div>' +
            '<div id="' + idp + 'controls" style="width:680px;text-align:right;padding:6px 0px 4px 6px;font-size:small;"></div>';

        if (!SocialCalc.SpreadsheetControl.Preview.ControlElements) {

            var controlhtml =
                SCLocSS(
                    '<input type="button" id="' + idp + 'apply" value="%loc!Apply!" style="font-size:smaller;">&nbsp;' +
                    '<input type="button" id="' + idp + 'done" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.Preview.HideDialog();"></div>');

            var cediv = document.createElement("div");
            cediv.innerHTML = controlhtml;

            SocialCalc.SpreadsheetControl.Preview.ControlElements = [];
            for (var i = 0; i < cediv.children.length; i++) {
                var child = cediv.children[i];
                SocialCalc.SpreadsheetControl.Preview.ControlElements.push(child);
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
            '<td style="font-size:10px;cursor:default;width:100%;background-color:#999;color:#FFF;">' +
            SCLocSS("&nbsp;%loc!Preview!") + '</td>' +
            '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.Preview.HideDialog();">&nbsp;X&nbsp;</td></tr></table>' +
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

    }

    //Show preview
    var displayPane = document.getElementById(idp + "display-pane");
    SocialCalc.SpreadsheetControl.Preview.PreviewSheet(displayPane, sheet, coord);

    //Set up controls
    var controlElement = document.getElementById(idp + "controls");
    for (var i = 0; i < SocialCalc.SpreadsheetControl.Preview.ControlElements.length; i++) {
        controlElement.appendChild(SocialCalc.SpreadsheetControl.Preview.ControlElements[i]);
    }

    ele = document.getElementById(idp + "apply");
    if (callback) {
        ele.onclick = function() {
            SocialCalc.SpreadsheetControl.Preview.HideDialog();
            callback();
        }
    }
    else {
        controlElement.removeChild(ele);
        ele = document.getElementById(idp + "done");
    }
    if (!autoUpdated) {
        ele.focus();
        SocialCalc.CmdGotFocus(ele);
    }
    //!!! need to do keyboard handling: if esc, hide?

}

SocialCalc.SpreadsheetControl.Preview.HideDialog = function () {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "preview-";
    var ele = document.getElementById(idp + "dialog");
    if (ele) {
        ele.innerHTML = "";

        SocialCalc.DragUnregister(ele);

        SocialCalc.KeyboardFocus();

        if (ele.parentNode) {
            ele.parentNode.removeChild(ele);
        }
    }

}


SocialCalc.SpreadsheetControl.Preview.PreviewSheet = function (displayPane, sheet, baseCoord) {

    sheet.attribs.ignorerowheights = true;

    SocialCalc.ExecuteSheetCommand(sheet, new SocialCalc.Parse("set sheet defaulttextvalueformat text-wiki"), false);

    displayPane.innerHTML = "";
    
    var cr = SocialCalc.coordToCr(baseCoord);

    var context = new SocialCalc.RenderContext(sheet);
    context.rowpanes = [{first: cr.row, last: sheet.attribs.lastrow}]
    context.colpanes = [{first: cr.col, last: sheet.attribs.lastcol}]
    context.showRCHeaders = true;
    context.showGrid = true;
    
    var displayTable = context.RenderSheet(null, null);

    //Remove sizing row added by - tbodyobj.appendChild(context.RenderSizingRow());
    var tbody = displayTable.children[1];
    tbody.removeChild(tbody.firstChild);

    displayPane.appendChild(displayTable);

}