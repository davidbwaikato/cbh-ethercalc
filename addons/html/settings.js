var oldSettingsControlInitializePanel = SocialCalc.SettingsControlInitializePanel;
SocialCalc.SettingsControlInitializePanel = function(panel) {

    var s = SocialCalc.GetSpreadsheetControlObject();
    var scc = SocialCalc.Constants;

    //Note sheetpanel name is not specified
    if (panel.name != "cell") {
        
        panel["rowheighthtml"] = {
            setting: "rowheighthtml",
            type: "PopupList",
            id: s.idPrefix+"rowheighthtml",
            initialdata: scc.SCFormatColwidth
        };
        panel["rowheightjson"] = {
            setting: "rowheightjson",
            type: "PopupList",
            id: s.idPrefix+"rowheightjson",
            initialdata: scc.SCFormatColwidth
        };
        panel["rowheightwiki"] = {
            setting: "rowheightwiki",
            type: "PopupList",
            id: s.idPrefix+"rowheightwiki",
            initialdata: scc.SCFormatColwidth
        };

    }

    oldSettingsControlInitializePanel(panel);
}



var oldInitializeSpreadsheetControl = SocialCalc.InitializeSpreadsheetControl;
SocialCalc.InitializeSpreadsheetControl = function(spreadsheet, node, height, width, spacebelow) {

    var newHtml = `
    <tr>
        <td %itemtitle.><br>%loc!Data Cell Row Height!:</td>
        <td %itembody.>
            <table cellspacing="0" cellpadding="0">
                <tr>
                    <td %bodypart.>
                        <div %parttitle.>%loc!HTML!</div> <span id="%id.rowheighthtml"></span>
                    </td>
                    <td %bodypart.>
                        <div %parttitle.>%loc!JSON!</div> <span id="%id.rowheightjson"></span>
                    </td>
                    <td %bodypart.>
                        <div %parttitle.>%loc!Wikitext!</div> <span id="%id.rowheightwiki"></span>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    `;

    var html = spreadsheet.views.settings.html;

    var splitPos = html.indexOf('</table><table id="%id.cellsettingstable"');

    html =  html.substring(0, splitPos) +
            newHtml +
            html.substring(splitPos);

    spreadsheet.views.settings.html = html;

    oldInitializeSpreadsheetControl(spreadsheet, node, height, width, spacebelow);
}



// var oldParseSheetSave = SocialCalc.ParseSheetSave;
// SocialCalc.ParseSheetSave = function (savedsheet, sheetobj) {

//     if (!sheet.attribs.rowheight) sheet.attribs.rowheight = {};

//     var lines = savedsheet.split(/\r\n|\n/);
//     var parts = [];
//     var line;
//     var i;

//     for (i = 0; i < lines.length; i++) {
//         line = lines[i];
//         parts = line.split(":");
//         switch (parts[0]) {
//             case "sheet":
//                 attribs=sheetobj.attribs;
//                 j=1;
//                 while (t=parts[j++]) {
//                     switch (t) {
//                         case "rowheighthtml":
//                             sheet.attribs.rowheight["html"] = parts[j++]-0;
//                         break;
//                         case "rowheightjson":
//                             sheet.attribs.rowheight["json"] = parts[j++]-0;
//                         break;
//                     }
//                 }
//             break;
//         }
//         parts = null;
//     }

//     oldParseSheetSave(lines.join("\n"), sheetobj);

//     // sheetobj.sci.CmdExtensionCallbacks["setrowheight"] = {
//     //     func: function(cmdname, data, sheet, cmd, saveundo) {
//     //         var type = cmd.NextToken();
//     //         var size = cmd.NextToken()-0;
//     //         if (!sheet.attribs.rowheight) sheet.attribs.rowheight = {}
//     //         sheet.attribs.rowheight[type] = size;
//     //         sheet.attribs.needsrecalc = "yes";
//     //     },
//     //     data: ""
//     // };

// }



var oldParseSheetSave = SocialCalc.ParseSheetSave;
SocialCalc.ParseSheetSave = function (savedsheet, sheetobj) {

    var lines = savedsheet.split(/\r\n|\n/);
    var parts = [];
    var line;
    var i;

    var cmds = [];

    for (i = 0; i < lines.length; i++) {
        line = lines[i];
        parts = line.split(":");
        switch (parts[0]) {
            case "rowheights":
                for (var p = 2; p < parts.length; p += 2) {
                    var type = parts[p-1];
                    var size = parts[p]-0;
                    var cmd = "startcmdextension setrowheight " + type + " " + size;
                    cmds.push(cmd);
                }
                lines[i] = "";
                break;
            default:
                break;
        }
        parts = null;
    }

    oldParseSheetSave(lines.join("\n"), sheetobj);


    sheetobj.sci.CmdExtensionCallbacks["setrowheight"] = {
        func: function(cmdname, data, sheet, cmd, saveundo) {
            var type = cmd.NextToken();
            var size = cmd.RestOfString()-0;
            if (!sheet.attribs.rowheight) sheet.attribs.rowheight = {};
            var oldSize = sheet.attribs.rowheight[type];
            if (size > 0) {
                sheet.attribs.rowheight[type] = size;
            }
            else {
                delete sheet.attribs.rowheight[type];
            }
            sheet.attribs.needsrecalc = "yes";
            if (saveundo) {
                sheet.changes.AddUndo("startcmdextension setrowheight " + type, oldSize ? " " + oldSize : "");
            }
        },
        data: ""
    };

    for (var cmd of cmds) {
        var parsedCmd = new SocialCalc.Parse(cmd);
        SocialCalc.ExecuteSheetCommand(sheetobj, parsedCmd, true);
    }

    //cmd:startcmdextension userfunction set _ADDONE(x)={x}+1

}


var oldCreateSheetSave = SocialCalc.CreateSheetSave;
SocialCalc.CreateSheetSave = function(sheetobj, range, canonicalize) {
    if (!sheetobj.attribs.rowheight) sheetobj.attribs.rowheight = {};
    var result = oldCreateSheetSave(sheetobj, range, canonicalize);
    var data = "";
    for (var type in sheetobj.attribs.rowheight) {
        data += ":" + type + ":" + sheetobj.attribs.rowheight[type];
    }
    if (data) result += "rowheights" + data + "\n";
    return result;
}



var oldDecodeSheetAttributes = SocialCalc.DecodeSheetAttributes;
SocialCalc.DecodeSheetAttributes = function(sheet, newattribs) {
    if (!sheet.attribs.rowheight) sheet.attribs.rowheight = {};

    cmdstr = oldDecodeSheetAttributes(sheet, newattribs);

    var attribs = sheet.attribs;
    var changed = cmdstr ? true : false;
    var cmdstr = cmdstr || "";

    var CheckChanges = function(attribname, oldval, cmdname) {
        var val;
        if (newattribs[attribname]) {
            if (newattribs[attribname].def) {
                val = "";
                }
            else {
                val = newattribs[attribname].val;
            }
            if (val != (oldval || "")) {
                DoCmd(cmdname+" "+val);
            }
        }
    }

    var DoCmd = function(str) {
        if (cmdstr) cmdstr += "\n";
        cmdstr += "startcmdextension setrowheight "+str;
        changed = true;
    }

    CheckChanges("rowheighthtml", attribs.rowheight["html"], "html");
    CheckChanges("rowheightjson", attribs.rowheight["json"], "json");
    CheckChanges("rowheightwiki", attribs.rowheight["wiki"], "wiki");

    if (changed) {
        return cmdstr;
    }
    else {
       return null;
    }

}



var oldEncodeSheetAttributes = SocialCalc.EncodeSheetAttributes;
SocialCalc.EncodeSheetAttributes = function(sheet) {
    if (!sheet.attribs.rowheight) sheet.attribs.rowheight = {};

    var result = oldEncodeSheetAttributes(sheet);

    var value;
    var attribs = sheet.attribs;

    var SetAttrib = function(name, v) {
        result[name].def = false;
        result[name].val = v || value;
    }

    result["rowheighthtml"] = {def: true, val: ""};
    if (attribs.rowheight["html"]) {
       SetAttrib("rowheighthtml", attribs.rowheight["html"]);
    }

    result["rowheightjson"] = {def: true, val: ""};
    if (attribs.rowheight["json"]) {
       SetAttrib("rowheightjson", attribs.rowheight["json"]);
    }

    result["rowheightwiki"] = {def: true, val: ""};
    if (attribs.rowheight["wiki"]) {
       SetAttrib("rowheightwiki", attribs.rowheight["wiki"]);
    }

    return result;

}