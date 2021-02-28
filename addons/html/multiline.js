// ############### HTML MULTILINE ###############

//Init
if (!SocialCalc.SpreadsheetControl.HTMLMultiline) SocialCalc.SpreadsheetControl.HTMLMultiline = {}

SocialCalc.SpreadsheetControl.HTMLMultiline.ControlElements = null;

SocialCalc.SpreadsheetControl.HTMLMultiline.ShowDialog = function () {

    var SCLocSS = SocialCalc.LocalizeSubstrings;

    var str, ele, text;

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;
    var wval = editor.workingvalues;

    var idp = spreadsheet.idPrefix + "htmlmultiline-";

    var twidth = -1;

    if (!SocialCalc.SpreadsheetControl.CheckLoneDialog(idp + "dialog")) {
        return;
    }

    switch (editor.state) {

        case "start":
            
            if (editor.range.hasrange) {
                wval.ecoord = SocialCalc.crToCoord(editor.range.left, editor.range.top);
                wval.ecol = editor.range.top;
                wval.erow = editor.range.left;
                wval.numcols = editor.range.right - editor.range.left + 1;
                wval.numrows = editor.range.bottom - editor.range.top + 1;
                
                var text = [];
                for (var row = editor.range.top; row <= editor.range.bottom; row++) {
                    for (var col = editor.range.left; col <= editor.range.right; col++) {
                        var cr = SocialCalc.crToCoord(col, row);
                        text.push(editor.context.sheetobj.GetAssuredCell(cr).datavalue+"");
                    }
                }

                if (wval.numcols == 1 || wval.numrows == 1) {
                    twidth = -1;
                }
                else {
                    twidth = wval.numcols;
                }
                
            }
            else {
                wval.ecoord = editor.ecell.coord;
                wval.erow = editor.ecell.row;
                wval.ecol = editor.ecell.col;
                text = editor.context.sheetobj.GetAssuredCell(wval.ecoord).datavalue+"";
            }
            // editor.RangeRemove();
            break;

        case "input":
        case "inputboxdirect":
            text = editor.inputBox.GetText();
            break;
    }

    var text = SocialCalc.SpreadsheetControl.HTMLMultiline.GetText(text, false, true, twidth);

    editor.inputBox.element.disabled = true;

    str = "";

    var previewHTML = "";
    previewHTML = '<div id="' + spreadsheet.idPrefix + 'preview-display-pane" style="width:680px;height:120px;margin:0px 10px 10px 10px; background-color: white; resize: both; overflow: auto;"></div>';

    str += '<div id="' + idp + 'textarea"></div>' +
    '<div id="' + idp + 'controls1" style="width:680px;text-align:right;padding:6px 0px 4px 6px;font-size:small;"></div>' +
    previewHTML +
    '<div id="' + idp + 'controls2" style="width:680px;text-align:right;padding:6px 0px 4px 6px;font-size:small;"></div>' +
    '<hr>' +
    '<div id="' + idp + 'controls3" style="width:680px;text-align:right;padding:6px 0px 4px 6px;font-size:small;"></div>';  

    if (!SocialCalc.SpreadsheetControl.HTMLMultiline.ControlElements) {

        var controlhtml =
            SCLocSS(
                '<input type="checkbox" id="' + idp + 'richtext" checked="true" onchange="SocialCalc.SpreadsheetControl.HTMLMultiline.SwitchEditMode()">&nbsp;'+
                '<label for="' + idp + 'richtext">%loc!Richtext!</label> '+
                
                '<input type="checkbox" id="' + idp + 'paste-html">&nbsp;'+
                '<label for="' + idp + 'paste-html">%loc!Paste HTML!</label> '+

                '<label class=".custom-file-input" for="' + idp + `load" style="content: 'Select some files';display: inline-block;background: -webkit-linear-gradient(top, #f9f9f9, #e3e3e3);border: 1px solid #999;border-radius: 3px;padding: 2px 8px;outline: none;white-space: nowrap;-webkit-user-select: none;cursor: pointer;text-shadow: 1px 1px #fff;font-size:smaller;">%loc!Load...!</label>` +
                '<input type="file" id="' + idp + 'load" multiple="multiple" accept="text/*,image/*,*.htz" style="display:none" onchange="SocialCalc.SpreadsheetControl.HTMLMultiline.LoadFiles(this);"/>' +

                '<br>' +

                '<select id="' + idp + 'orientation-combobox" value="single" style="font-size:smaller;" onchange="SocialCalc.SpreadsheetControl.HTMLMultiline.UpdatePreview();">' +
                '<option value="single">%loc!Single Cell!</option>' +
                '<option value="vertical">%loc!Vertical!</option>' +
                '<option value="horizontal">%loc!Horizontal!</option>' +
                '<option value="table">%loc!Table!</option>' +
                '</select>' +

                '<input type="text" id="' + idp + 'position-textbox" title="%loc!Coordinates!" style="font-size:smaller;width:30px;" oninput="SocialCalc.SpreadsheetControl.HTMLMultiline.UpdatePreview();">&nbsp;' +

                '<select id="' + idp + 'selector-combobox" value="root" style="font-size:smaller;" onchange="SocialCalc.SpreadsheetControl.HTMLMultiline.HandleSelectorChange();">' +
                '<option value="root">%loc!Root Elements!</option>' +
                '<option value="xpath">%loc!XPATH!</option>' +
                '<option value="css">%loc!CSS!</option>' +
                '</select>' +

                '<input type="text" id="' + idp + 'selector-textbox" title="%loc!Selector!" placeholder="%loc!N/A!" style="font-size:smaller;width:80px;" oninput="SocialCalc.SpreadsheetControl.HTMLMultiline.UpdatePreview();">&nbsp;' +

                '<input type="button" value="%loc!Build Selector!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.SelectorBuilder.ShowDialog();">&nbsp;' +
                
                '<br>' +

                '<input type="button" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.HTMLMultiline.HideDialog();">&nbsp;' +
                '<input type="button" value="%loc!Clear!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.HTMLMultiline.DoClear();">&nbsp;' +
                '<input type="button" value="%loc!Set Cell Contents!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.HTMLMultiline.DoPaste();"></div>');
                
        //SocialCalc.SpreadsheetControl.HTMLMultiline.ControlElement
        var cediv = document.createElement("div");
        cediv.innerHTML = controlhtml;
        
        SocialCalc.SpreadsheetControl.HTMLMultiline.ControlElements = [];
        for (var i = 0; i < cediv.children.length; i++) {
            var child = cediv.children[i];
            SocialCalc.SpreadsheetControl.HTMLMultiline.ControlElements.push(child);
            SocialCalc.SpreadsheetControl.EnsureDialogElementFocus(child);
            if (child.id == idp + "position-textbox") {
                editor.StatusCallback[idp + "callback"] = function(element) {
                    return {
                        func: function(editor, command, newcell, params) {
                            if (command == "moveecell") {
                                element.value = newcell;
                                SocialCalc.SpreadsheetControl.HTMLMultiline.UpdatePreview();
                            }
                        }
                    }
                }(child);
            }
            else if (child.id == idp + "selector-textbox") {
                var selectorBox = child;
                $.widget( "custom.catcomplete", $.ui.autocomplete, {
                    _create: function() {
                        this._super();
                        this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
                    },
                    _renderMenu: function( ul, items ) {
                        var that = this,
                        currentCategory = "";
                        var rect = selectorBox.getBoundingClientRect();

                        //TODO Position at top if not enough space
                        //$( ".selector" ).autocomplete( "option", "position", { my : "left bottom", at: "left top" } );
                        var spaceBottom = (window.innerHeight - rect.bottom - 10);
                        // var spaceTop = (window.innerHeight - rect.top - 10);
                        // var maxHeight;
                        // if (spaceBottom > spaceTop - 100) {
                        //     maxHeight = spaceBottom;
                        //     // $(selectorBox).autocomplete( "option", "position", { my : "left top", at: "left bottom" } );

                        // }
                        // else {
                        //     maxHeight = spaceTop;
                        //     // $(selectorBox).autocomplete( "option", "position", { my : "left bottom", at: "left top" } );
                        // }
                        ul[0].style.maxHeight = spaceBottom + "px";
                        ul[0].style.overflowY = "auto";
                        ul[0].style.overflowX = "hidden";
                        $.each( items, function( index, item ) {
                            var li;
                            if ( item.category != currentCategory ) {
                                ul.append( "<li class='ui-autocomplete-category'><b>" + item.category + "</b></li>" );
                                currentCategory = item.category;
                            }
                            li = that._renderItemData( ul, item );
                            if ( item.category ) {
                                li.attr( "aria-label", item.category + " : " + item.label );
                            }
                        });
                    }
                });
                $(selectorBox).catcomplete({
                    select: function(event, ui) {
                        SocialCalc.SpreadsheetControl.HTMLMultiline.UpdatePreview();
                        return true;
                    },
                    source: function( request, response ) {
                        var matcher = new RegExp( $.ui.autocomplete.escapeRegex( request.term ), "i" );
                        response( $.grep( SocialCalc.SpreadsheetControl.HTMLMultiline.SelectedPredefinedSelectors, function( item ){
                            return matcher.test( item.label ) || matcher.test( item.category );
                        }) );
                    },
                    // position: {
                    //     collision: "flip"
                    // }
                });
            }
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
        SCLocSS("&nbsp;%loc!HTML Input Box!") + '</td>' +
        '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.HTMLMultiline.HideDialog();">&nbsp;X&nbsp;</td></tr></table>' +
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

    // Set up controls
    var controlID = 1;
    for (var i = 0; i < SocialCalc.SpreadsheetControl.HTMLMultiline.ControlElements.length; i++) {
        var controlElement = document.getElementById(idp + "controls" + controlID);
        var element = SocialCalc.SpreadsheetControl.HTMLMultiline.ControlElements[i];
        if (element.tagName == "BR") {
            controlID++;
            continue;
        }
        controlElement.appendChild(element);
    }
    var positionTextbox = document.getElementById(idp + "position-textbox");
    positionTextbox.value = "";
    positionTextbox.placeholder = wval.ecoord;

    // Set up text area
    ele = document.getElementById(idp + "textarea");
    var shadowRoot = ele.attachShadow({mode:"open"});
    shadowRoot.innerHTML = '<div contenteditable="true" style="width:680px;height:120px;margin:0px 10px 10px 10px; background-color: white; resize: both; overflow: auto;" oninput="SocialCalc.SpreadsheetControl.HTMLMultiline.UpdatePreview();">' + text + '</div>';
    ele = shadowRoot.firstChild;
    ele.style.fontFamily = "Courier New";
    SocialCalc.SpreadsheetControl.HTMLMultiline.AddPasteHandler(ele);
    SocialCalc.SpreadsheetControl.HTMLMultiline.AddDropHandler(ele);
    SocialCalc.SpreadsheetControl.EnsureDialogElementFocus(ele);
    ele.focus();
    //!!! need to do keyboard handling: if esc, hide?

    // Switch edit mode if richtext
    var richtextcheckbox = document.getElementById(idp + "richtext");
    if (richtextcheckbox.checked) {
        SocialCalc.SpreadsheetControl.HTMLMultiline.SwitchEditMode();
    }

    // Display preview
    SocialCalc.SpreadsheetControl.HTMLMultiline.UpdatePreview();

}



SocialCalc.SpreadsheetControl.HTMLMultiline.PreviewUpdateTimer = null;

SocialCalc.SpreadsheetControl.HTMLMultiline.UpdatePreview = function() {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var previewPaneID = spreadsheet.idPrefix + "preview-display-pane";
    clearTimeout(SocialCalc.SpreadsheetControl.HTMLMultiline.PreviewUpdateTimer);
    if (document.getElementById(previewPaneID)) {
        SocialCalc.SpreadsheetControl.HTMLMultiline.PreviewUpdateTimer =
            setTimeout(function() {
                if (document.getElementById(previewPaneID)) {
                    SocialCalc.SpreadsheetControl.HTMLMultiline.DoPaste(true, true);
                }
            }, 1000);
    }
}



SocialCalc.SpreadsheetControl.HTMLMultiline.HideDialog = function() {
    SocialCalc.SpreadsheetControl.Preview.HideDialog();
    SocialCalc.SpreadsheetControl.HideDialog("htmlmultiline");
}



SocialCalc.SpreadsheetControl.HTMLMultiline.DoClear = function() {
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "htmlmultiline-";
    document.getElementById(idp + "textarea").shadowRoot.firstChild.innerHTML = "";
    SocialCalc.SpreadsheetControl.HTMLMultiline.UpdatePreview();
}



SocialCalc.SpreadsheetControl.HTMLMultiline.ReplaceInitialCharacters = function(text, initialChar, replacement) {
    var c;
    var lines = text.split("\n");
    text = "";
    for (var l = 0; l < lines.length; l++) {
        var line = lines[l];
        var s = "";
        for (c = 0; c < line.length; c++) {
            if (line.charAt(c) == initialChar) s += replacement;
            else break;
        }
        text += (l == 0 ? "" : "\n") + s + line.substring(c);
    }
    return text;
}



SocialCalc.SpreadsheetControl.HTMLMultiline.GetText = function(textinput, richtext, initial, twidth) {

    var textresult = "";

    if (!(textinput instanceof Array)) textinput = [textinput];

    for (var t = 0; t < textinput.length; t++) {
        var text = textinput[t];

        var html = SocialCalc.SpreadsheetControl.GetHTMLContent(text);
        
        if (!initial || html) {

            if (html) text = html;

            if (richtext) {
                text = SocialCalc.SpreadsheetControl.HTMLMultiline.ReplaceInitialCharacters(text, '\xa0', ' ');
            }

            text = SocialCalc.HtmlSanitizer.SanitizeHtml(text);
    
            if (!richtext) {
                if (twidth >= 0) {
                    text = (t % twidth == 0 ? "<tr>" : "")
                        + "<td>" + text + "</td>"
                        + (t % twidth == twidth - 1 || t == textinput.length - 1 ? "</tr>" : "");
                }
                text = SocialCalc.SpreadsheetControl.BeautifyHtml(text);
                
                //text = text.replace(/ /g, "&nbsp;");
                text = SocialCalc.SpreadsheetControl.HTMLMultiline.ReplaceInitialCharacters(text, ' ', '\xa0');

                text = (t == 0 ? "" : "\n") + text;
                text = SocialCalc.special_chars(text);
                text = text.replace(/\n/g, "<br>");
            }
        }
        else {
            if (text.startsWith("'")) {
                text = text.substring(1);
            }
            if (twidth >= 0) {
                text = (t % twidth == 0 ? "<tr>" : "")
                    + "<td>" + text + "</td>"
                    + (t % twidth == twidth - 1 || t == textinput.length - 1 ? "</tr>" : "");
            }
            text = SocialCalc.special_chars(text);
        }

        textresult += text;

    }

    if (twidth >= 0) {
        textresult = "&lt;table><br>" + textresult + "<br>&lt;/table>";
    }

    return textresult;

}



SocialCalc.SpreadsheetControl.HTMLMultiline.SwitchEditMode = function() {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "htmlmultiline-";
    var id = idp + "textarea";

    var checkbox = document.getElementById(idp + "richtext");
    var richtext = checkbox.checked;
    var currentlyRichtext = !richtext;

    var ele = document.getElementById(id).shadowRoot.firstChild;

    var text = currentlyRichtext ? ele.innerHTML : ele.innerText;

    ele.innerHTML = SocialCalc.SpreadsheetControl.HTMLMultiline.GetText(text, richtext, false, -1);
    ele.style.fontFamily = richtext ? "" : "Courier New";

}



SocialCalc.SpreadsheetControl.HTMLMultiline.DoPaste = function(preview, autoUpdatedPreview) {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;
    var wval = editor.workingvalues;
    var idp = spreadsheet.idPrefix + "htmlmultiline-";

    var ele = document.getElementById(idp + "textarea").shadowRoot.firstChild;

    var richtextcheckbox = document.getElementById(idp + "richtext");
    var selectorType = document.getElementById(idp + "selector-combobox").value;
    var selector = document.getElementById(idp + "selector-textbox").value;
    var positionTextbox = document.getElementById(idp + "position-textbox");
    var position = (positionTextbox.value || positionTextbox.placeholder);
    var orientation = document.getElementById(idp + "orientation-combobox").value;

    var text = richtextcheckbox.checked ? ele.innerHTML : ele.innerText;

    var twidth = -1;
    
    //Editor
    switch (editor.state) {
        case "start":
            wval.partialexpr = "";
            wval.ecoord = editor.ecell.coord;
            wval.erow = editor.ecell.row;
            wval.ecol = editor.ecell.col;
            break;
        case "input":
        case "inputboxdirect":
            editor.inputBox.Blur();
            editor.inputBox.ShowInputBox(false);
            editor.state = "start";
            break;
    }

    //Turn nbsp back into normal spaces
    var lines = text.split("\n");
    var text = "";
    for (var l = 0; l < lines.length; l++) {
        var line = lines[l];
        var c;
        var s = "";
        for (c = 0; c < line.length; c++) {
            if (line.charAt(c) == '\xa0') s += " ";
            else break;
        }
        text += (l == 0 ? "" : "\n") + s + line.substring(c);
    }


    text = SocialCalc.HtmlSanitizer.SanitizeHtml(text);
    var rootNode = document.createElement("div");
    rootNode.innerHTML = text;

    switch (selectorType) {
        case "xpath":
        case "css":
            //Handle table items if selector on single root table
            if (rootNode.children.length == 1 && rootNode.children[0].tagName == "TABLE") {
                result = [];
                var table = rootNode.children[0];
                var numrows = table.rows.length;
                var numcols = 0;
                for (var t = 0; t < numrows; t++) {
                    var row = table.rows[t];
                    if (row.cells.length > numcols) numcols = row.cells.length;
                }
                for (var t = 0; t < numrows; t++) {
                    var row = table.rows[t];
                    for (var c = 0; c < numcols; c++) {
                        if (c < row.cells.length) {
                            var cell = row.cells[c];
                            var cellDiv = document.createElement("div");
                            while (cell.childNodes.length > 0) {
                                cellDiv.appendChild(cell.childNodes[0]);
                            }
                            result.push(SocialCalc.SpreadsheetControl.HTMLMultiline.ApplyHTMLSelector(cellDiv, selectorType, selector));
                        }
                        //TODO Currently empty table cell will still be shown in vertical/horizontal, is this best?
                        else result.push(null);
                    }
                }
                result = {
                    type: "table",
                    result: result,
                    twidth: numcols
                }
            }
            else {
                result = SocialCalc.SpreadsheetControl.HTMLMultiline.ApplyHTMLSelector(rootNode, selectorType, selector);
            }
            break;
        default:
            result = SocialCalc.SpreadsheetControl.HTMLMultiline.ApplyHTMLSelector(rootNode, selectorType, selector);
            break;
    }

    var coercedSelectorResult = SocialCalc.SpreadsheetControl.HTMLMultiline.CoerceSelectorResult(result);
    if (coercedSelectorResult) {
        result = coercedSelectorResult;
    }
    else if (typeof result == "object" && result.type == "table") {
        //It is a table
        twidth = result.twidth;
        result = result.result;
        for (var r = 0; r < result.length; r++) {
            result[r] = SocialCalc.SpreadsheetControl.HTMLMultiline.CoerceSelectorResult(result[r]);
            if (result[r] == null) continue;
            var resultText = "";
            for (var i = 0; i < result[r].length; i++) {
                resultText += (resultText == "" ? "" : "\n") + result[r][i];
            }
            result[r] = resultText;
        }
    }
    else {
        console.error("Unknown selector result type!");
        console.error(result);
        return;
    }


    var numcols = 0;
    var numrows = 0;
    var keepEmptyValues = true;

    
    switch (orientation) {
        case "single":
            var resultText = "";
            for (var i = 0; i < result.length; i++) {
                if (result[i] == null) continue;
                resultText += (resultText == "" ? "" : "\n") + result[i];
            }
            result = [resultText];
            
            numcols = 1;
            numrows = 1;
        break;
        case "vertical":
            numcols = 1;
            numrows = result.length;
            keepEmptyValues = false;
        break;
        case "horizontal":
            numcols = result.length;
            numrows = 1;
            keepEmptyValues = false;
        break;
        case "table":
            if (twidth > -1) {
                numcols = twidth;
                numrows = result.length/twidth;
            }
            else {
                //TODO What if not a table? Currently fails silently
                if (result.length == 1) {
                    var rootNode = document.createElement("div");
                    rootNode.innerHTML = text;
                    var el = rootNode.children[0];
                    if (el && el.tagName == "TABLE") {
                        var result = [];
                        numrows = el.rows.length;
                        for (var t = 0; t < numrows; t++) {
                            var row = el.rows[t];
                            if (row.cells.length > numcols) numcols = row.cells.length;
                        }
                        for (var t = 0; t < numrows; t++) {
                            var row = el.rows[t];
                            for (var c = 0; c < numcols; c++) {
                                if (c < row.cells.length) {
                                    result.push(row.cells[c].innerHTML);
                                }
                                else result.push(null);
                            }
                        }
                    }
                }
            }
        break;
    }


    
    var sheet = spreadsheet.sheet;

    var saveundo = true;
    var changes = sheet.changes;

    var cr1 = /[A-Z]+[1-9][0-9]*/.test(position)
        ? SocialCalc.coordToCr(position)
        : SocialCalc.coordToCr(wval.ecoord);
    var attribs = sheet.attribs;

    sheet.renderneeded = true;
    sheet.changedrendervalues = true;
    if (saveundo) changes.AddUndo("changedrendervalues"); // to take care of undone pasted spans

    if (cr1.col + numcols - 1 > attribs.lastcol) attribs.lastcol = cr1.col + numcols - 1;
    if (cr1.row + numrows - 1 > attribs.lastrow) attribs.lastrow = cr1.row + numrows - 1;

    var cmds = "";

    var previewSheet;
    if (preview) previewSheet = new SocialCalc.Sheet();

    var resultIndex = 0;
    for (row = cr1.row; row < cr1.row + numrows; row++) {
        for (col = cr1.col; col < cr1.col + numcols; col++) {

            var value = result[resultIndex];
            resultIndex++;

            if (value == null) value = "";
            // if (value == null) {
            //     if (keepEmptyValues) value = "";
            //     else continue;
            // }
            
            value = ".html\n\n" + value + "\n\n.html";
            value = SocialCalc.encodeForSave(value);
            var type = "text th";

            var cr = SocialCalc.crToCoord(col, row);
            var cmd = "set "+cr+" "+type+" "+value;
            
            if (preview) {
                var parsedCmd = new SocialCalc.Parse(cmd);
                SocialCalc.ExecuteSheetCommand(previewSheet, parsedCmd, false);
            }
            else {
                cell = sheet.GetAssuredCell(cr);
                if (cell.readonly) continue;

                cmds += (cmds == "" ? "" : "\n") + cmd;
            }
        }
    }

    if (preview) {
        var coord = SocialCalc.crToCoord(cr1.col, cr1.row);
        // var callback = function() {
        //     SocialCalc.SpreadsheetControl.HTMLMultiline.DoPaste();
        // };
        // SocialCalc.SpreadsheetControl.Preview.ShowDialog(previewSheet, coord, callback, autoUpdatedPreview);
        var displayPane = document.getElementById(spreadsheet.idPrefix + "preview-display-pane");
        if  (displayPane) SocialCalc.SpreadsheetControl.Preview.PreviewSheet(displayPane, previewSheet, coord);
    }
    else {
        SocialCalc.SpreadsheetControl.HTMLMultiline.HideDialog();
        editor.EditorScheduleSheetCommands(cmds, true, false);
    }

}



SocialCalc.SpreadsheetControl.HTMLMultiline.ApplyHTMLSelector = function(rootNode, selectorType, selector) {

    var result = [];

    switch (selectorType) {

        case "xpath":

            //Select root nodes if empty
            if (selector == "") selector = "/node()";

            try {

                var xpathResult = document.evaluate(selector, rootNode, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

                switch (xpathResult.resultType) {

                    case XPathResult.NUMBER_TYPE:
                        result = xpathResult.numberValue;
                        break;
                    case XPathResult.STRING_TYPE:
                        result = xpathResult.stringValue;
                        break;
                    case XPathResult.BOOLEAN_TYPE:
                        result = xpathResult.booleanValue;
                        break;
                    case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
                        var node;
                        while (node = xpathResult.iterateNext()) {
                            if (node.outerHTML) result.push(node.outerHTML);
                            else {
                                //Exclude whitespace nodes unless nbsp
                                if (node.nodeValue.indexOf("\u00A0") > -1 || node.nodeValue.trim().length > 0) {
                                    result.push(node.nodeValue);
                                }
                            }
                        }
                        break;

                }

            } catch (error) {
                result = error;
            }

            break;

        case "css":

            try {

                var nodeList = rootNode.querySelectorAll(selector);

                for (var i = 0; i < nodeList.length; i++) {
                    var node = nodeList[i];
                    result.push(node.outerHTML);
                }

            } catch (error) {
                result = error;
            }

            break;

        case "root":
        default:
            for (var i = 0; i < rootNode.childNodes.length; i++) {
                var node = rootNode.childNodes[i];
                if (node.outerHTML) result.push(node.outerHTML);
                else {
                    //Exclude whitespace nodes unless nbsp
                    if (node.nodeValue.indexOf("\u00A0") > -1 || node.nodeValue.trim().length > 0) {
                        result.push(node.nodeValue);
                    }
                }
                
            }
            break;

    }

    return result;

}



SocialCalc.SpreadsheetControl.HTMLMultiline.CoerceSelectorResult = function(result) {

    if (result == null) {
        //Do nothing
    } if (typeof result == "string") {
        result = [result];
    }
    else if (typeof result == "number") {
        //TODO Consider
        result = [result + ""];
    }
    else if (typeof result == "boolean") {
        //TODO Consider
        result = [result + ""];
    }
    else if (result instanceof Error) {
        result = ["<!-- " + result.name + ": " + result.message + " -->"];
    }
    else if (result instanceof Array) {
        //Do nothing
    }
    else return null;

    return result;

}



SocialCalc.SpreadsheetControl.HTMLMultiline.HandleSelectorChange = function() {
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "htmlmultiline-";

    var selectorType = document.getElementById(idp + "selector-combobox").value;
    var placeholder;
    var data;
    switch (selectorType) {
        case "xpath":
            placeholder = "//div/p[@id='t']";
            data = SocialCalc.SpreadsheetControl.HTMLMultiline.XPathPredefinedSelectors;
        break;
        case "css":
            placeholder = "div > p#t";
            data = SocialCalc.SpreadsheetControl.HTMLMultiline.CSSPredefinedSelectors;
        break;
        case "root":
            placeholder = "N/A";
            data = [];
        break;
        default:
            placeholder = "Selector";
            data = [];
        break;
    }
    document.getElementById(idp + "selector-textbox").placeholder = placeholder;
    SocialCalc.SpreadsheetControl.HTMLMultiline.UpdatePreview();

    SocialCalc.SpreadsheetControl.HTMLMultiline.SelectedPredefinedSelectors = data;
}

SocialCalc.SpreadsheetControl.HTMLMultiline.SelectedPredefinedSelectors = [];

SocialCalc.SpreadsheetControl.HTMLMultiline.XPathPredefinedSelectors = [
    { category: "Twitter", label: "Tweets",         value: "//article" },
    { category: "Twitter", label: "Tweet Text",     value: "//article/div/div/div/div[2]/div[2]/div[2]/div[1]/div" },
    { category: "Twitter", label: "Username",       value: "//article/div/div/div/div[2]/div[2]/div[1]/div/div/div[1]/div[1]/a/div/div[1]/div[1]/span/span/text()" },
    { category: "Twitter", label: "Handle",         value: "//article/div/div/div/div[2]/div[2]/div[1]/div/div/div[1]/div[1]/a/div/div[2]/div/span/text()" },
    { category: "Twitter", label: "Profile Image",  value: "//article/div/div/div/div[2]/div[1]/div/div/a/div[1]/div[2]/div/img" },
    { category: "Twitter", label: "Replies",        value: "//article/div/div/div/div[2]/div[2]/div[2]/div[3]/div[1]/div/div/div[2]/span/span/text()" },
    { category: "Twitter", label: "Retweets",       value: "//article/div/div/div/div[2]/div[2]/div[2]/div[3]/div[2]/div/div/div[2]/span/span/text()" },
    { category: "Twitter", label: "Likes",          value: "//article/div/div/div/div[2]/div[2]/div[2]/div[3]/div[3]/div/div/div[2]/span/span/text()" },
    { category: "Twitter", label: "Hashtags",       value: "//article/div/div/div/div[2]/div[2]/div[2]/div[1]/div/span/a/text()" },
    { category: "Twitter", label: "Mentions",       value: "//article/div/div/div/div[2]/div[2]/div[2]/div[1]/div/div/span/a/text()" },

    { category: "Wikipedia", label: "Text", value: "//p" },
    { category: "Wikipedia", label: "Links", value: "//p/a" },
    { category: "Wikipedia", label: "URLs", value: "//p/a/@href" },
    { category: "Wikipedia", label: "Page Title", value: "//h1/text()" },
    { category: "Wikipedia", label: "Images", value: "//img[@class='thumbimage']" },
];

SocialCalc.SpreadsheetControl.HTMLMultiline.CSSPredefinedSelectors = [

];