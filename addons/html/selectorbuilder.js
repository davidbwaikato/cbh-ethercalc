//Init
if (!SocialCalc.SpreadsheetControl.SelectorBuilder) SocialCalc.SpreadsheetControl.SelectorBuilder = {}

SocialCalc.SpreadsheetControl.SelectorBuilder.ShowDialog = function () {

    var SCLocSS = SocialCalc.LocalizeSubstrings;

    var str, ele;

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var editor = spreadsheet.editor;

    var idp = spreadsheet.idPrefix + "selectorbuilder-";

    ele = document.getElementById(idp + "dialog");
    if (!ele) {

        editor.inputBox.element.disabled = true;

        str = "";

        str += '<textarea id="' + idp + 'textarea" style="width:680px;height:120px;margin:0px 10px 10px 10px; background-color: white; resize: both; overflow: auto;" wrap="off"></textarea>' +
            '<div id="' + idp + 'controls" style="width:680px;text-align:right;padding:6px 0px 4px 6px;font-size:small;"></div>';

        if (!SocialCalc.SpreadsheetControl.SelectorBuilder.ControlElements) {

            var controlhtml =
                SCLocSS(
                    '<label for="' + idp + 'output-textbox">%loc!Output!</label> '+
                    '<input type="text" id="' + idp + 'output-textbox" style="font-size:smaller;">&nbsp;' +

                    '<input type="checkbox" id="' + idp + 'update-selector-checkbox">'+
                    '<label for="' + idp + 'update-selector-checkbox">%loc!Update Selector!</label> '+

                    '<select id="' + idp + 'branches-combobox" value="0" style="font-size:smaller;">' +
                    '<option value="0">%loc!No branches!</option>' +
                    '<option value="1">%loc!1 branch!</option>' +
                    '<option value="2">%loc!2 branches!</option>' +
                    '<option value="3">%loc!3 branches!</option>' +
                    '</select>' +

                    '<select id="' + idp + 'selector-combobox" value="xpath" style="font-size:smaller;">' +
                    '<option value="xpath">%loc!XPATH!</option>' +
                    '<option value="css">%loc!CSS!</option>' +
                    '</select>' +
                    
                    '<input type="button" value="%loc!Combine!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.SelectorBuilder.Combine();">&nbsp;' +
                    
                    '<br>' +
                    '<input type="button" value="%loc!Cancel!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.SelectorBuilder.HideDialog();"></div>' +
                    '<input type="button" value="%loc!Clear!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.SelectorBuilder.Clear();">&nbsp;' +
                    '<input type="button" value="%loc!Add!" style="font-size:smaller;" onclick="SocialCalc.SpreadsheetControl.SelectorBuilder.AddSelector();">&nbsp;');

            var cediv = document.createElement("div");
            cediv.innerHTML = controlhtml;

            SocialCalc.SpreadsheetControl.SelectorBuilder.ControlElements = [];
            for (var i = 0; i < cediv.children.length; i++) {
                var child = cediv.children[i];
                SocialCalc.SpreadsheetControl.SelectorBuilder.ControlElements.push(child);
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
            SCLocSS("&nbsp;%loc!Selector Builder!") + '</td>' +
            '<td style="font-size:10px;cursor:default;color:#666;" onclick="SocialCalc.SpreadsheetControl.SelectorBuilder.HideDialog();">&nbsp;X&nbsp;</td></tr></table>' +
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

    //Set up controls
    var controlElement = document.getElementById(idp + "controls");
    for (var i = 0; i < SocialCalc.SpreadsheetControl.SelectorBuilder.ControlElements.length; i++) {
        controlElement.appendChild(SocialCalc.SpreadsheetControl.SelectorBuilder.ControlElements[i]);
    }

    // ele = document.getElementById(idp + "apply");
    // if (callback) {
    //     ele.onclick = function() {
    //         SocialCalc.SpreadsheetControl.SelectorBuilder.HideDialog();
    //         callback();
    //     }
    // }
    // else {
    //     controlElement.removeChild(ele);
    //     ele = document.getElementById(idp + "done");
    // }
    // if (!autoUpdated) {
    //     ele.focus();
    //     SocialCalc.CmdGotFocus(ele);
    // }
    //!!! need to do keyboard handling: if esc, hide?

}

SocialCalc.SpreadsheetControl.SelectorBuilder.HideDialog = function () {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "selectorbuilder-";
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

//SocialCalc.SpreadsheetControl.SelectorBuilder.Selectors = [];
SocialCalc.SpreadsheetControl.SelectorBuilder.SelectionSelector = {};

SocialCalc.SpreadsheetControl.SelectorBuilder.AddSelector = function() {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "selectorbuilder-";

    var textarea = document.getElementById(idp + "textarea");

    //var selector = SocialCalc.SpreadsheetControl.SelectorBuilder.SelectionSelector["xpath"];
    var selector = SocialCalc.SpreadsheetControl.SelectorBuilder.GetCurrentSelection();

    if (selector) {

        var value = textarea.value;
        if (value && !value.endsWith("\n")) value += "\n";
        value += selector + "\n";
        textarea.value = value;
        
    }

}

SocialCalc.SpreadsheetControl.SelectorBuilder.GetCurrentSelection = function() {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();

    var rootNode = document.getElementById(spreadsheet.idPrefix + "htmlmultiline-textarea").shadowRoot.firstChild;

    var selection = getSelection();

    var selectors = "";
    for (var i = 0; i < selection.rangeCount; i++) {

        var range = selection.getRangeAt(i);

        var node = range.commonAncestorContainer;
        var nodes = [];
        while (node) {
            if (node == rootNode) {
                break;
            }
            nodes.unshift(node);

            node = node.parentNode;
        }
        if (!node) {
            return "";
        }
        else {
            var selector = "";
            var possibilities = [];
            for (node of nodes) {
                //TODO Is XPath needed???
                selector += "/" + (node.nodeName == "#text" ? "text()" : node.nodeName.toLowerCase());
                var xpathResult = document.evaluate("." + selector, rootNode, null, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);

                var xpathNode;
                var count = 0;
                var start = 0;
                while (xpathNode = xpathResult.iterateNext()) {
                    count++;
                    if (xpathNode == node) {
                        start = count;
                    }
                }

                var end = start == 0 ? 0 : count - start + 1;
                var all = start == 0 || count != 1 ? 0 : 1;
                possibilities.push({
                    start: start,
                    end: end,
                    all: all
                });

                var predicate = "";
                if (start && end) {
                    predicate += "position()=" + start;
                    if (end) {
                        predicate += " or position()=last()";
                        if (end > 1) predicate += "-" + (end-1);
                    }
                }
                else if (!start && end) {
                    predicate += "last()";
                    if (end > 1) predicate += "-" + (end-1);
                }
                else predicate += start;
                // if (all) predicate += " or true()";
                selector += "[" + predicate + "]";
            }
            selectors += (selectors ? "\n" : "") + selector;
        }
    }

    if (selection.rangeCount) {
        return selectors;
    }

}



SocialCalc.SpreadsheetControl.SelectorBuilder.Parse = function(selector) {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "selectorbuilder-";


    var steps = selector.substring(1).toLowerCase().split("/");
    var result = [];
    for (var step of steps) {
        var name = "";
        var start = 0;
        var end = 0;
        var all = 0;

        var match = step.match(/^(.*)\[(.*)\]$/);
        if (match) {
            name = match[1];
            var predicates = match[2].split(" or ");
            for (var predicate of predicates) {
                if (predicate.startsWith("position()=")) {
                    if (predicate.startsWith("position()=last()")) {
                        if (predicate.length == 17) {
                            end = 1;
                        }
                        else {
                            end = predicate.substring(18) - 0 + 1;
                        }
                    }
                    else {
                        start = predicate.substring(11) - 0;
                    }
                }
                else if (predicates.length == 1) {
                    if (predicate.startsWith("last()")) {
                        if (predicate.length == 6) {
                            end = 1;
                        }
                        else {
                            end = predicate.substring(7) - 0 + 1;
                        }
                    }
                    else start = predicate - 0;
                }
            }
        }
        else {
            name = step;
            //TODO ?
            all = 1;
            start = 1;
            end = 1;
            // }
        }

        result.push({
            name: name,
            start: start,
            end: end,
            all: all
        });
    }

    return result;

}

SocialCalc.SpreadsheetControl.SelectorBuilder.Clear = function() {
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "selectorbuilder-";

    var textarea = document.getElementById(idp + "textarea");
    textarea.value = "";
}

SocialCalc.SpreadsheetControl.SelectorBuilder.Combine = function() {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "selectorbuilder-";

    var textarea = document.getElementById(idp + "textarea");
    var value = textarea.value;

    var selectorType = document.getElementById(idp + "selector-combobox").value;
    
    var parses = [];
    var minParseLength = 1000;
    for (var line of value.split("\n")) {
        if (line) {
            var parse = SocialCalc.SpreadsheetControl.SelectorBuilder.Parse(line);
            if (parse.length < minParseLength) {
                minParseLength = parse.length;
            }
            parses.push(parse)
        }
    }

    var outputTextbox = document.getElementById(idp + "output-textbox");

    if (parses.length != 0) {

        var intersections = [];
        
        for (var i = 0; i < minParseLength; i++) {

            var intersection = {
                name: "",
                start: -1,
                end: -1,
                all: 1,
            };

            for (var p in parses) {

                var nodeParse = parses[p][i];

                //Start
                if (intersection.start == nodeParse.start) {}
                else if (intersection.start == -1) intersection.start = nodeParse.start;
                else {
                    intersection.start = 0;
                    all = 0;
                }

                //End
                if (intersection.end == nodeParse.end) {}
                else if (intersection.end == -1) intersection.end = nodeParse.end;
                else {
                    intersection.end = 0;
                    all = 0;
                }

                //Name
                if (intersection.name == nodeParse.name) {}
                else if (intersection.name == "") intersection.name = nodeParse.name;
                else intersection.name = null;

            }

            if (intersection.name == null) break;

            intersections.push(intersection);

        }

        var branches = document.getElementById(idp + "branches-combobox").value-0;

        var result = SocialCalc.SpreadsheetControl.SelectorBuilder.Write(selectorType, intersections, branches);

        outputTextbox.value = result;

        var updateSelector = document.getElementById(idp + "update-selector-checkbox").checked;
        if (updateSelector) {
            var selectorTextbox = document.getElementById(spreadsheet.idPrefix + "htmlmultiline-selector-textbox");
            if (selectorTextbox) selectorTextbox.value = result;
            else return;
            var selectorCombobox = document.getElementById(spreadsheet.idPrefix + "htmlmultiline-selector-combobox");
            if (selectorCombobox.value != selectorType) selectorCombobox.value = selectorType;
            SocialCalc.SpreadsheetControl.HTMLMultiline.UpdatePreview();
        }

    }
    else outputTextbox.value = "";

}

SocialCalc.SpreadsheetControl.SelectorBuilder.Write = function(selectorType, selectorParse, branches) {

    var selector = "";

    switch (selectorType) {

        case "css":

            for (var step of selectorParse) {
                var name = step.name;
                var addition = (selector ? ">" : "") + name;
                if (step.any || (step.start == 1 && step.end == 1)) {
                    //No predicate
                }
                else {
                    if (step.start) addition += ":nth-child(" + step.start + ")";
                    else if (step.end) {
                        if (step.end == 1) addition += ":nth-last-child(" + (step.end - 1) + ")";
                        else addition += ":nth-last-child(" + (step.end - 1) + ")";
                    }
                    else if (branches > 0) {
                        branches--;
                    }
                    else break;
                }
                selector += addition;
            }

        break;

        case "xpath":

            for (var step of selectorParse) {
                var name = step.name;
                var addition = "/" + name;
                if (step.any || (step.start == 1 && step.end == 1)) {
                    //No predicate
                }
                else {
                    if (step.start) addition += "[" + step.start + "]";
                    else if (step.end) {
                        if (step.end == 1) addition += "[last()]";
                        else addition += "[last()-" + (step.end - 1) + "]";
                    }
                    else if (branches > 0) {
                        branches--;
                    }
                    else break;
                }
                selector += addition;
            }

        break;

    }

    return selector;

}