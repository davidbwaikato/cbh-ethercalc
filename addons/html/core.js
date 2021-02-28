// ###############    GENERAL     ###############

SocialCalc.SpreadsheetControl.BeautifyHtml = require("./lib/beautify-html.js").html_beautify;

SocialCalc.SpreadsheetControl.Zip = require('zipjs-browserify');
SocialCalc.SpreadsheetControl.Lda = require('lda-topic-model').default;

SocialCalc.SpreadsheetControl.HTMLRegex = /^'?\.html *\n(([^\n]*\n)*)\.html[\n ]*$/;
SocialCalc.SpreadsheetControl.JSONRegex = /^'?\.json *\n(([^\n]*\n)*)\.json[\n ]*$/;

SocialCalc.SpreadsheetControl.GetHTMLContent = function(text) {
    var match = text.match(SocialCalc.SpreadsheetControl.HTMLRegex);
    if (match) match = match[1];
    return match;
}

SocialCalc.SpreadsheetControl.GetJSONContent = function(text) {
    var match = text.match(SocialCalc.SpreadsheetControl.JSONRegex);
    if (match) match = match[1];
    return match;
}

SocialCalc.SpreadsheetControl.EnsureDialogElementFocus = function(element) {
    if (element.contentEditable != "true") {
        //https://stackoverflow.com/questions/6444968/check-if-object-is-a-textbox-javascript
        var tagName = element.tagName.toLowerCase();
        if (tagName !== 'textarea') {
            if (tagName !== 'input') return;
            var type = element.getAttribute('type').toLowerCase(),
            // if any of these input types is not supported by a browser, it will behave as input type text.
            inputTypes = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week']
            if (inputTypes.indexOf(type) < 0) return;
        }
    }
    element.addEventListener('focus', function(e) {
        SocialCalc.CmdGotFocus(e.target);
    });    
}



SocialCalc.SpreadsheetControl.CheckLoneDialog = function(id) {

    if (!SocialCalc.SpreadsheetControl.DialogIdentifierRegistry) {
        SocialCalc.SpreadsheetControl.DialogIdentifierRegistry = {}
    }
    
    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var multilinedialog = spreadsheet.idPrefix + "multilinedialog";
    SocialCalc.SpreadsheetControl.DialogIdentifierRegistry[multilinedialog] = true;

    if (id) SocialCalc.SpreadsheetControl.DialogIdentifierRegistry[id] = true;

    for (var k in SocialCalc.SpreadsheetControl.DialogIdentifierRegistry) {
        if (document.getElementById(k)) return false;
    }

    var temp = document.createElement("div");
    temp.id = multilinedialog;
    spreadsheet.spreadsheetDiv.appendChild(temp);

    return true;

}



SocialCalc.SpreadsheetControl.HideDialog = function(name) {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + name + "-";
    id = idp + "dialog";

    var editor = spreadsheet.editor;

    var ele = document.getElementById(id);

    if (ele) {
        ele.innerHTML = "";

        SocialCalc.DragUnregister(ele);

        SocialCalc.KeyboardFocus();

        if (ele.parentNode) {
            ele.parentNode.removeChild(ele);
        }
    }

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var multilinedialog = spreadsheet.idPrefix + "multilinedialog";
    var temp = document.getElementById(multilinedialog);
    if (temp && temp.parentNode) {
        temp.parentNode.removeChild(temp);
    }

    switch (editor.state) {
        case "start":
            editor.inputBox.DisplayCellContents(null);
            break;
        case "input":
        case "inputboxdirect":
            editor.inputBox.element.disabled = false;
            editor.inputBox.Focus();
            break;
    }


}