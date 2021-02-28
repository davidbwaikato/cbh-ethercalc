//### PASTING ###

if (!SocialCalc.SpreadsheetControl.HTMLMultiline) SocialCalc.SpreadsheetControl.HTMLMultiline = {}

//https://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser/6804718#6804718
//https://developer.mozilla.org/en-US/docs/Web/API/Element/paste_event

SocialCalc.SpreadsheetControl.HTMLMultiline.AddPasteHandler = function(element) {

    element.addEventListener('paste', function(e) {

        var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
        var idp = spreadsheet.idPrefix + "htmlmultiline-";

        var richtextCheckbox = document.getElementById(idp + "richtext");
        var richtext = richtextCheckbox ? richtextCheckbox.checked : false;

        var text = "";

        // Browsers that support the 'text/html' type in the Clipboard API (Chrome, Firefox 22+)
        if (e && e.clipboardData && e.clipboardData.types && e.clipboardData.getData) {

            // Check for 'text/html' in types list. See abligh's answer below for deatils on
            // why the DOMStringList bit is needed. We cannot fall back to 'text/plain' as
            // Safari/Edge don't advertise HTML data even if it is available
            types = e.clipboardData.types;

            var pasteHtmlCheckbox = document.getElementById(idp + "paste-html");
            var type = !pasteHtmlCheckbox ? null : (richtext || pasteHtmlCheckbox.checked) ? "text/html" : "text/plain";

            if (type && ((types instanceof DOMStringList) && types.contains(type))
                    || (types.indexOf && types.indexOf(type) !== -1)) {
        
                text = e.clipboardData.getData(type);
            }

        }
        else {
            text = (e.clipboardData || window.clipboardData).getData('text');
        }

        if (richtext && type != "text/html") text = SocialCalc.special_chars(text);

        SocialCalc.SpreadsheetControl.HTMLMultiline.InsertText(text, richtext);
        
        // Stop the data from actually being pasted
        e.stopPropagation();
        e.preventDefault();
        return false;

    });

}



SocialCalc.SpreadsheetControl.HTMLMultiline.InsertText = function(text, richtext) {

    if (!richtext && document.queryCommandSupported && document.queryCommandSupported('insertText')) {
        // This method is deprecated and has differing support
        document.execCommand('insertText', false, text);
    }
    else if (richtext && document.queryCommandSupported && document.queryCommandSupported('insertHTML')) {
        text = SocialCalc.HtmlSanitizer.SanitizeHtml(text);
        // This method is deprecated and has differing support
        document.execCommand('insertHTML', false, text);
    } else {
        // Range.insertNode does not support undo properly
        var selection = window.getSelection();
        if (!selection.rangeCount) return false;
        selection.deleteFromDocument();

        var range = selection.getRangeAt(0);

        if (!richtext) {
            range.insertNode(document.createTextNode(text));
        }
        else {
            var container = document.createElement("div");
            text = SocialCalc.HtmlSanitizer.SanitizeHtml(text);
            container.innerHTML = text;
            var fragment = document.createDocumentFragment();
            var node;
            while (node = container.firstChild) {
                fragment.appendChild(node);
            }
            range.insertNode(fragment);
        }
    }

}








SocialCalc.SpreadsheetControl.HTMLMultiline.AddDropHandler = function(element) {

    element.addEventListener('drop', function (e) {

        var dropped = false;
        var stringItem = null;

        if (e.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)
            for (var i = 0; i < e.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                if (e.dataTransfer.items[i].kind === 'file') {
                    var file = e.dataTransfer.items[i].getAsFile();
                    var nowDropped = SocialCalc.SpreadsheetControl.HTMLMultiline.DropFile(file);
                    if (!dropped) dropped = nowDropped;
                }
                else {
                    //Dropped string
                    var item = e.dataTransfer.items[i];
                    if (!stringItem
                            || SocialCalc.SpreadsheetControl.HTMLMultiline.ScoreStringItem(item)
                             > SocialCalc.SpreadsheetControl.HTMLMultiline.ScoreStringItem(stringItem)) {
                        stringItem = item;
                    }
                }
            }
            if (stringItem) {
                dropped = SocialCalc.SpreadsheetControl.HTMLMultiline.DropFile(stringItem, true);
            }
        } else {
            // Use DataTransfer interface to access the file(s)
            for (var i = 0; i < e.dataTransfer.files.length; i++) {
                var file = e.dataTransfer.files[i];
                dropped = SocialCalc.SpreadsheetControl.HTMLMultiline.DropFile(file);
            }
        }

        if (dropped) e.preventDefault();

    });

}



SocialCalc.SpreadsheetControl.HTMLMultiline.DropFile = function(file, isString) {

    var spreadsheet = SocialCalc.GetSpreadsheetControlObject();
    var idp = spreadsheet.idPrefix + "htmlmultiline-";
    var richtext = document.getElementById(idp + "richtext").checked;

    var type = file.type;
    var name = (file.name || "");

    var callback = null;
    var asData = false;

    if (type == "text/html") {
        callback = function(text) {
            text = SocialCalc.HtmlSanitizer.SanitizeHtml(text);
            text = SocialCalc.SpreadsheetControl.BeautifyHtml(text);
            SocialCalc.SpreadsheetControl.HTMLMultiline.InsertText(text, richtext);
        }
    }
    else if (type.startsWith("text")) {
        callback = function(text) {
            text = SocialCalc.special_chars(text);
            SocialCalc.SpreadsheetControl.HTMLMultiline.InsertText(text, richtext);
        }
    }
    else if (type.startsWith("image")) {
        callback = function(text) {
            text = '<img src="' + text + '">';
            SocialCalc.SpreadsheetControl.HTMLMultiline.InsertText(text, richtext);
        }
        asData = true;
    }
    else if (name.endsWith(".htz")) {
        callback = function(text) {
            SocialCalc.SpreadsheetControl.HTMLMultiline.InsertHTZ(text, richtext);
        }
        asData = true;
    }
    else return true;

    if (isString) {
        file.getAsString(callback);
        //TODO Could base64 be needed?
    }
    else {
        var reader = new FileReader();

        reader.onload = function() {
            var text = reader.result;
            callback(text);
        };

        reader.onerror = function() {
            console.err(reader.error);
        };

        if (asData) reader.readAsDataURL(file);
        else reader.readAsText(file);
    }

    return true;
    
}



SocialCalc.SpreadsheetControl.HTMLMultiline.ScoreStringItem = function(item) {
    var type = item.type;
    var score = 0;
    if (type.startsWith("image")) score = 100;
    if (type == "text/html") score = 90;
    else if (type == "text/plain") score = 80;
    else if (type.startsWith("text")) score = 70;

    return score;
}



SocialCalc.SpreadsheetControl.HTMLMultiline.LoadFiles = function(input) {
    for (var file of input.files) {
        SocialCalc.SpreadsheetControl.HTMLMultiline.DropFile(file);
    }
}



SocialCalc.SpreadsheetControl.HTMLMultiline.InsertHTZ = function(zipData, richtext) {
    
    var zip = SocialCalc.SpreadsheetControl.Zip;

    // use a BlobReader to read the zip from a Blob object
    zip.createReader(new zip.Data64URIReader(zipData), function(reader) {

        // get all entries from the zip
        reader.getEntries(function(entries) {

            for (var entry of entries) {
                if (entry.filename.endsWith(".html")) {
                    entry.getData(new zip.TextWriter(), function(text) {
                        // text contains the entry data as a String
                        text = SocialCalc.HtmlSanitizer.SanitizeHtml(text);
                        text = SocialCalc.SpreadsheetControl.BeautifyHtml(text);
                        SocialCalc.SpreadsheetControl.HTMLMultiline.InsertText(text, richtext);

                        // close the zip reader
                        reader.close(function() {
                            // onclose callback
                        });

                    }, function (current, total) {
                        // onprogress callback
                    });
                }
            }
        });
    }, function (error) {
        // onerror callback
    });

}

