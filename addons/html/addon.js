SocialCalc.Formula.XPathFunction = function (fname, operand, foperand, sheet) {

    //Check args
    if (foperand.length != 2) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var xpath = value.value;

    var value2 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t2 = value2.type.charAt(0);
    var text = value2.value;

    var result = 0;
    var resulttype = "e#VALUE!";

    //XPath, target
    if (t == "t" && t2 == "t") {

        if (text.match(/^\s*'?\.html\s*$/m)) {

            text = text.replace(/\s*'?\.html\s*/g, "");
            text = SocialCalc.HtmlSanitizer.SanitizeHtml(text);

            var rootNode = document.createElement("div");
            rootNode.innerHTML = text;

            //text = SocialCalc.special_chars(text);
            //text = ".html<br><br>" + text + "<br><br>.html";

            try {

                //TODO Specify type?
                var xpathResult = document.evaluate(xpath, rootNode, null, XPathResult.ANY_TYPE, null);

                switch (xpathResult.resultType) {

                    case XPathResult.NUMBER_TYPE:
                        result = xpathResult.numberValue;
                        resulttype = "n";
                        break;
                    case XPathResult.STRING_TYPE:
                        result = xpathResult.stringValue;
                        resulttype = "t";
                        break;
                    case XPathResult.BOOLEAN_TYPE:
                        result = xpathResult.booleanValue ? 1 : 0;
                        resulttype = "n";
                        break;
                    case XPathResult.UNORDERED_NODE_ITERATOR_TYPE:
                        var node, nodeText = "";
                        while (node = xpathResult.iterateNext()) {
                            nodeText += node.outerHTML + "\n";
                        }
                        result = ".html\n\n" + nodeText + "\n.html";
                        resulttype = "t";
                        break;

                }

            } catch (error) { }

        }

    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}

SocialCalc.Formula.CSSSelectorFunction = function (fname, operand, foperand, sheet) {

    //Check args
    if (foperand.length != 2) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var selector = value.value;

    var value2 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t2 = value2.type.charAt(0);
    var text = value2.value;

    var result = 0;
    var resulttype = "e#VALUE!";

    //XPath, target
    if (t == "t" && t2 == "t") {

        if (text.match(/^\s*'?\.html\s*$/m)) {

            text = text.replace(/\s*'?\.html\s*/g, "");
            text = SocialCalc.HtmlSanitizer.SanitizeHtml(text);

            var rootNode = document.createElement("div");
            rootNode.innerHTML = text;

            try {

                var nodeList = rootNode.querySelectorAll(selector);

                var nodeText = "";

                for (var i = 0; i < nodeList.length; i++) {
                    var node = nodeList[i];
                    nodeText += node.outerHTML + "\n";
                }

                result = ".html\n\n" + nodeText + "\n.html";
                resulttype = "t";


            } catch (error) { }

        }

    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}

SocialCalc.Formula.ElementAtFunction = function (fname, operand, foperand, sheet) {

    //Check args
    if (foperand.length != 2) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var index = value.value;

    var value2 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t2 = value2.type.charAt(0);
    var text = value2.value;

    var result = 0;
    var resulttype = "e#VALUE!";

    if (t == "n" && t2 == "t") {

        if (text.match(/^\s*'?\.html\s*$/m)) {

            text = text.replace(/\s*'?\.html\s*/g, "");
            text = SocialCalc.HtmlSanitizer.SanitizeHtml(text);

            var rootNode = document.createElement("div");
            rootNode.innerHTML = text;

            if (index >= 1 && index <= rootNode.children.length) {
                result = ".html\n\n" + rootNode.children[index - 1].outerHTML + "\n\n.html";
                resulttype = "t";
            }
            else {
                result = ".html\n\n.html";
                resulttype = "t";
            }

        }

    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}



SocialCalc.Formula.FunctionList["XPATH"] = [SocialCalc.Formula.XPathFunction, 2, "selector", "", "html"];
SocialCalc.Formula.FunctionList["CSSS"] = [SocialCalc.Formula.CSSSelectorFunction, 2, "selector", "", "html"];
SocialCalc.Formula.FunctionList["ELEMENTAT"] = [SocialCalc.Formula.ElementAtFunction, 2, "elementat", "", "html"];


//if (SocialCalc.Constants.function_classlist.indexOf("html") == -1) SocialCalc.Constants.function_classlist.push("html");
//SocialCalc.Constants.function_classlist.push("html");





// ###############  HTML WIDGET   ###############


var oldProto = SocialCalc.SpreadsheetControl.prototype.InitializeSpreadsheetControl;
SocialCalc.SpreadsheetControl.prototype.InitializeSpreadsheetControl = function (node, height, width, spacebelow) {

    //PRE-INIT

    this.formulabuttons["widget"] = {
        image: "addons/html/images/html-icon.png",
        skipImagePrefix: true,
        tooltip: "HTML", // tooltips are localized when set below
        command: SocialCalc.SpreadsheetControl.DoHTMLMultiline
    }

    var returnValue = oldProto.bind(this)(node, height, width, spacebelow);

    //POST-INIT




    return returnValue;

}

// ############### HTML MULTILINE ###############

SocialCalc.SpreadsheetControl.DoHTMLMultiline = function () {

    var SCLocSS = SocialCalc.LocalizeSubstrings;

    var str, ele, text;

    var scc = SocialCalc.Constants;
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;
    var wval = editor.workingvalues;

    var idp = spreadsheet.idPrefix + "multiline";

    var twidth = -1;

    ele = document.getElementById(idp + "dialog");
    if (ele) return; // already have one

    switch (editor.state) {

        case "start":
            
            if (editor.range.hasrange) {
                console.log(editor.range)
                wval.ecoord = SocialCalc.crToCoord(editor.range.left, editor.range.top);
                wval.ecol = editor.range.top;
                wval.erow = editor.range.left;
                wval.numcols = editor.range.right - editor.range.left + 1;
                wval.numrows = editor.range.bottom - editor.range.top + 1;
                
                // if (wval.numcols == 1 || wval.numrows == 1) {
                    var text = [];
                    for (var row = editor.range.top; row <= editor.range.bottom; row++) {
                        for (var col = editor.range.left; col <= editor.range.right; col++) {
                            var cr = SocialCalc.crToCoord(col, row);
                            text.push(SocialCalc.GetCellContents(editor.context.sheetobj, cr));
                        }
                    }
                /*}
                else {
                    //TODO Handle table
                }*/
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
                text = SocialCalc.GetCellContents(editor.context.sheetobj, wval.ecoord);
            }
            // editor.RangeRemove();
            break;

        case "input":
        case "inputboxdirect":
            text = editor.inputBox.GetText();
            break;
    }

    // CBH
    console.log("**** DoMultiline() text = " + text);
    var text = SocialCalc.SpreadsheetControl.GetTextForHTMLMultiline(text, false, true, twidth);

    editor.inputBox.element.disabled = true;

    str = "";


    str += '<div contenteditable="" id="' + idp + 'textarea" style="width:680px;height:120px;margin:0px 10px 10px 10px; background-color: white; resize: both; overflow: auto;">' + text + '</div>' +
        '<div style="width:680px;text-align:right;padding:6px 0px 4px 6px;font-size:small;">' +
        SCLocSS(
            '<input type="checkbox" id="html-multiline-richtext" onchange="SocialCalc.SpreadsheetControl.SwitchHTMLMultilineEditMode()">'+
            '<label for="html-multiline-richtext">%loc!Richtext!</label> '+

            // '<input type="checkbox" id="html-multiline-horizontal">'+
            // '<label for="html-multiline-horizontal">%loc!Horizontal!</label> '+

            '</select>' +
            '<select id="html-multiline-orientation-combobox" value="vertical" style="font-size:smaller;">' +
            '<option value="vertical">%loc!Vertical!</option>' +
            '<option value="horizontal">%loc!Horizontal!</option>' +
            '<option value="table">%loc!Table!</option>' +
            '</select>' +


            '<input type="text" id="html-multiline-position-textbox" title="%loc!Coordinates!" placeholder="' + wval.ecoord + '" style="font-size:smaller;width:30px;">&nbsp;' +
            '<select id="html-multiline-split-combobox" value="nosplit" style="font-size:smaller;">' +
            '<option value="split">Split</option>' +
            '<option value="nosplit">Do not split</option>' +
            '</select>' +
            '<select id="html-multiline-selector-combobox" value="raw" style="font-size:smaller;">' +
            '<option value="raw">%loc!Raw!</option>' +
            '<option value="xpath">%loc!XPATH!</option>' +
            '<option value="css">%loc!CSS!</option>' +
            '</select>' +
            '<input type="text" id="html-multiline-selector-textbox" title="%loc!Selector!" placeholder="%loc!Selector!" style="font-size:smaller;width:80px;">&nbsp;' +

            '<input type="button" value="%loc!Set Cell Contents!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoHTMLMultilinePaste();">&nbsp;' +
            '<input type="button" value="%loc!Clear!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.DoMultilineClear();">&nbsp;' +
            '<input type="button" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.HideMultiline();"></div>' +
            '</div>');


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

    //main.style.width = "400px"; // CBH

    //TODO Make nice
    main.innerHTML = '<table cellspacing="0" cellpadding="0" style="border-bottom:1px solid black;"><tr>' +
        '<td style="font-size:10px;cursor:default;width:680px;background-color:#999;color:#FFF;">' + // CBH
        SCLocSS("&nbsp;%loc!HTML Input Box!") + '</td>' +
        '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.HideMultiline();">&nbsp;X&nbsp;</td></tr></table>' +
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

    ele = document.getElementById(idp + "textarea");
    ele.style.fontFamily = "Courier New";
    ele.focus();
    SocialCalc.CmdGotFocus(ele);
    //!!! need to do keyboard handling: if esc, hide?

}



SocialCalc.SpreadsheetControl.GetTextForHTMLMultiline = function(textinput, richtext, initial, twidth) {

    var textresult = "";

    if (!(textinput instanceof Array)) textinput = [textinput];

    for (var t = 0; t < textinput.length; t++) {
        var text = textinput[t];

        if (!initial || text.match(/^\s*'?\.html\s*$/m)) {
            text = text.replace(/\s*'?\.html\s*/g, "");
            text = SocialCalc.HtmlSanitizer.SanitizeHtml(text);
    
            if (!richtext) {
                if (twidth >= 0) {
                    text = (t % twidth == 0 ? "<tr>" : "")
                        + "<td>" + text + "</td>"
                        + (t % twidth == twidth - 1 || t == textinput.length - 1 ? "</tr>" : "");
                }
                text = html_beautify(text);
                text = (t == 0 ? "" : "\n") + text;
                text = SocialCalc.special_chars(text);
                text = text.replace(/\n/g, "<br>");
                //TODO Should be start only
                text = text.replace(/ /g, "&nbsp;");
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

        // if (twidth >= 0) {
        //     if (t % twidth == 0) {
        //         textresult += "&lt;tr>";
        //     }
        //     textresult += "&lt;td>" + text + "&lt;/td>";
        //     if (t % twidth == twidth - 1 || t == textinput.length - 1) {
        //         textresult += "&lt;/tr>"
        //     }
        // }
        textresult += text;

    }

    if (twidth >= 0) {
        //TODO Indent textresult
        textresult = "&lt;table><br>" + textresult + "<br>&lt;/table>";
    }

    return textresult;

}

SocialCalc.SpreadsheetControl.SwitchHTMLMultilineEditMode = function() {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "multiline";
    var id = idp + "textarea";

    var checkbox = document.getElementById("html-multiline-richtext");
    var richtext = checkbox.checked;
    var currentlyRichtext = !richtext;

    var ele = document.getElementById(id);

    var text = currentlyRichtext ? ele.innerHTML : ele.innerText;

    ele.innerHTML = SocialCalc.SpreadsheetControl.GetTextForHTMLMultiline(text, richtext, false, -1);
    ele.style.fontFamily = richtext ? "" : "Courier New";

}

SocialCalc.SpreadsheetControl.DoHTMLMultilinePaste = function() {
    console.log("**** SpreadsheetControl.DoHTMLMultilinePaste()")
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;
    var wval = editor.workingvalues;

    var ele = document.getElementById(spreadsheet.idPrefix + "multilinetextarea");

    //var text = ele.value;

    var range = editor.range;
    console.log(range)

    // CBH
    var richtextcheckbox = document.getElementById("html-multiline-richtext");

    var text = richtextcheckbox.checked ? ele.innerHTML : ele.innerText;
    

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

    result = SocialCalc.SpreadsheetControl.ApplyHTMLSelector(text);
    
    var position = document.getElementById("html-multiline-position-textbox").value;
    var orientation = document.getElementById("html-multiline-orientation-combobox").value;

    SocialCalc.SpreadsheetControl.HideMultiline();

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

    //Mark as HTML and save
    if (typeof result == "string") {
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
    else {
        console.error("Strange selector result type!");
        console.error(result);
        return;
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

    //TODO Table
    numcols = orientation == "horizontal" ? result.length : 1;
    numrows = orientation == "horizontal" ? 1 : result.length;
    // Math.max(cr2.row - cr1.row + 1, cliprange.cr2.row - cliprange.cr1.row + 1);
    //TODO What is this
    if (cr1.col + numcols - 1 > attribs.lastcol) attribs.lastcol = cr1.col + numcols - 1;
    if (cr1.row + numrows - 1 > attribs.lastrow) attribs.lastrow = cr1.row + numrows - 1;

    var resultIndex = 0;
    for (row = cr1.row; row < cr1.row + numrows; row++) {
        for (col = cr1.col; col < cr1.col + numcols; col++) {
            cr = SocialCalc.crToCoord(col, row);
            cell = sheet.GetAssuredCell(cr);
            if (cell.readonly) continue;

            /*if (saveundo) changes.AddUndo("set " + cr + " all", sheet.CellToString(cell));

            cell.datavalue = result[resultIndex];
            cell.datatype = "t";
            cell.valuetype = "t";//TODO th?

            cell.formula = "";

            delete cell.parseinfo;
            delete cell.comment;
            delete cell.displaystring;*/

            var type = "text th";
            var value = (".html\n\n" + result[resultIndex] + "\n\n.html").replace(/\n/g, "\\n");
            cmdline = "set "+cr+" "+type+" "+value;
            editor.EditorScheduleSheetCommands(cmdline, true, false);

            if (typeof spreadsheet.ioEventTree !== 'undefined'
                    && typeof spreadsheet.ioParameterList !== 'undefined'
                    && typeof spreadsheet.ioEventTree[cr] !== 'undefined') {
                SocialCalc.EditedTriggerCell(spreadsheet.ioEventTree[cr], cr, editor, spreadsheet);  
            }
            resultIndex++;
        }
    }

}

SocialCalc.SpreadsheetControl.ApplyHTMLSelector = function(text) {

    var selectorType = document.getElementById("html-multiline-selector-combobox").value;
    var splitMode = document.getElementById("html-multiline-split-combobox").value;
    var selector = document.getElementById("html-multiline-selector-textbox").value;

    text = SocialCalc.HtmlSanitizer.SanitizeHtml(text);

    var rootNode = document.createElement("div");
    rootNode.innerHTML = text;

    var result = [];

    switch (selectorType) {

        case "xpath":

            try {

                //TODO Specify type?
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
                            result.push(node.outerHTML);
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

        case "raw":
        default:

            for (var i = 0; i < rootNode.children.length; i++) {
                result.push(rootNode.children[i].outerHTML);
            }
            break;

    }

    switch (splitMode) {

        case "split":
            break;

        case "nosplit":
        default:

            var resultText = "";
            for (var i = 0; i < result.length; i++) {
                resultText += (i == 0 ? "" : "\n") + result[i];
            }
            result = resultText;

            break;

    }

    return result;

}

