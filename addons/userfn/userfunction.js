//Example: _ADDONE(x)={x}+1

SocialCalc.Formula.UserDefinedFunctionList = [];

SocialCalc.Formula.UserDefinedFunction = function (fname, operand, foperand, sheet) {

    var udf = SocialCalc.Formula.UserDefinedFunctionList[fname];

    var result = 0;
    var resulttype = "e#VALUE!";


    var equalsPos = udf.indexOf(':=');
    var functionArgText = udf.substring(0, equalsPos).trim();
    var functionText = udf.substring(equalsPos + 2).trim();

    var openBracketPos = functionArgText.indexOf('(');
    var closeBracketPos = functionArgText.indexOf(')');
    var args = functionArgText.substring(openBracketPos + 1, closeBracketPos).split(/, */);

    //TODO Handle expansion
    var numArgs = foperand.length;
    for (var i = 0; i < numArgs; i++) {
        var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
        var t = value.type.charAt(0);
        var argParts = args[i].split(":");
        if (argParts.length > 2 || (argParts.length == 2 && t != argParts[1])) {
            SocialCalc.Formula.FunctionArgsError(fname, operand);
            return;
        }
        var argValue = value.value;
        var argText;
        if (t == "n") argText = "" + argValue;
        else argText = '"' + argValue.replace(/"/g, '""') + '"';
        functionText = functionText.replace(new RegExp("{" + argParts[0] + "}", "g"), argText);
    }

    var parseinfo = SocialCalc.Formula.ParseFormulaIntoTokens(functionText);

    //TODO ???
    var allowrangereturn = true;
    var resultValue = SocialCalc.Formula.evaluate_parsed_formula(parseinfo, sheet, allowrangereturn);

    result = resultValue.value;
    resulttype = resultValue.type;

    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}

SocialCalc.Formula.AddUserDefinedFunction = function (ftext) {
    var openBracketPos = ftext.indexOf('(');
    var fname = ftext.substring(0, openBracketPos).toUpperCase();
    SocialCalc.Formula.UserDefinedFunctionList[fname] = ftext;
    var fdescid = "";
    SocialCalc.Formula.FunctionList[fname] = [SocialCalc.Formula.UserDefinedFunction, -1, fdescid, "", ""];
}



var oldParseSheetSave = SocialCalc.ParseSheetSave;
SocialCalc.ParseSheetSave = function (savedsheet, sheetobj) {

    var lines = savedsheet.split(/\r\n|\n/);
    var parts = [];
    var line;
    var i;

    var ftexts = null;

    for (i = 0; i < lines.length; i++) {
        line = lines[i];
        parts = line.split(":");
        switch (parts[0]) {
            case "userfunctions":
                var encodedftexts = parts[1];
                ftexts = SocialCalc.decodeFromSave(encodedftexts).split("\n");
                lines[i] = "";
                break;
            default:
                break;
        }
        parts = null;
    }

    oldParseSheetSave(lines.join("\n"), sheetobj);


    sheetobj.sci.CmdExtensionCallbacks["userfunction"] = {
        func: function(cmdname, data, sheet, cmd, saveundo) {
            //TODO undo
            switch (cmd.NextToken()) {
                case "set":
                    var rest = cmd.RestOfString();
                    var ftext = SocialCalc.decodeFromSave(rest);
                    SocialCalc.Formula.AddUserDefinedFunction(ftext);
                    sheet.attribs.needsrecalc = "yes";
                    break;
                case "delete":
                    //TODO
                    break;
                case "deleteall":
                    //TODO Breaks currently, remove from SocialCalc.Formula.FunctionList
                    SocialCalc.Formula.UserDefinedFunctionList = [];
                    sheet.attribs.needsrecalc = "yes";
                    break;

            }
        },
        data: ""
    };

    if (ftexts) {
        for (var ftext of ftexts) {
            //SocialCalc.Formula.AddUserDefinedFunction(ftext);
            var cmd = "startcmdextension userfunction set " + SocialCalc.encodeForSave(ftext);
            var parsedCmd = new SocialCalc.Parse(cmd);
            SocialCalc.ExecuteSheetCommand(sheetobj, parsedCmd, true);
        }
    }

    //cmd:startcmdextension userfunction set _ADDONE(x)={x}+1

}


var oldCreateSheetSave = SocialCalc.CreateSheetSave;
SocialCalc.CreateSheetSave = function(sheetobj, range, canonicalize) {
    var result = oldCreateSheetSave(sheetobj, range, canonicalize);
    var udfs = "";
    for (var name in SocialCalc.Formula.UserDefinedFunctionList) {
        udfs += (udfs ? "\n" : "") + SocialCalc.Formula.UserDefinedFunctionList[name];
    }
    if (udfs) result += "userfunctions:" + SocialCalc.encodeForSave(udfs) + "\n";
    return result;
}

//SocialCalc.CurrentSpreadsheetControlObject.sheet.sci.CmdExtensionCallbacks