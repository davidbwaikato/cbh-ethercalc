SocialCalc.Formula.LiteralNotationRegex = /^\/(.*)\/([a-z]*)$/;

SocialCalc.Formula.IsRegexFormatFunction = function(fname, operand, foperand, sheet) {

    if (foperand.length != 1) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var v = value.value;

    result = 0;
    if (t == "t") {
        if (SocialCalc.Formula.LiteralNotationRegex.test(v)) result = 1;
    }

    SocialCalc.Formula.PushOperand(operand, "nl", result);
}

SocialCalc.Formula.IsValidRegexFunction = function(fname, operand, foperand, sheet) {

    if (foperand.length != 1) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var v = value.value;
    
    result = 0;
    if (t == "t") {
        if (v.startsWith('/')) {
            var matches = v.match(SocialCalc.Formula.LiteralNotationRegex);
            if (matches != null) {
                try {
                    new RegExp(matches[1], matches[2]);
                    result = 1;
                } catch (error) {}
            }
        }
        else {
            try {
                new RegExp(v);
                result = 1;
            } catch (error) {}
        }
    }
    
    SocialCalc.Formula.PushOperand(operand, "nl", result);
}

SocialCalc.Formula.RegexFunction = function(fname, operand, foperand, sheet) {

    var numargs = foperand.length;

    if (numargs < 1 || numargs > 2) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandAsText(sheet, foperand);
    if (value.type.charAt(0) == "e") {
        SocialCalc.Formula.PushOperand(operand, value.type, result);
        return;
    }

    var value2 = numargs == 2 ? SocialCalc.Formula.OperandAsText(sheet, foperand) : {value: "", type: "t"};
    if (value2.type.charAt(0) == "e") {
        SocialCalc.Formula.PushOperand(operand, value2.type, result);
        return;
    }

    var result;
    var resulttype;
    try {
        new RegExp(value.value, value2.value);
        result = "/" + value.value.replace("/", "\\/") + "/" + value2.value;
        resulttype = "t";
    } catch (error) {
        resulttype = "e#VALUE!";
        result = "Invalid regex";
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}

SocialCalc.Formula.OccursFunction = function(fname, operand, foperand, sheet) {

    var numargs = foperand.length;

    if (numargs < 1 || numargs > 2) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var regex = SocialCalc.Formula.OperandAsText(sheet, foperand);
    if (regex.type.charAt(0) == "e") {
        SocialCalc.Formula.PushOperand(operand, regex.type, result);
        return;
    }

    var text = SocialCalc.Formula.OperandAsText(sheet, foperand);
    if (text.type.charAt(0) == "e") {
        SocialCalc.Formula.PushOperand(operand, text.type, result);
        return;
    }

    var result = 0;
    var resulttype = "n";
    try {
        var matches = regex.value.match(SocialCalc.Formula.LiteralNotationRegex);
        if (matches != null) {
            var regexp = new RegExp(matches[1], matches[2]);
            result = (text.value.match(regexp) || []).length;
            resulttype = "n";
        }
    } catch (error) {
        resulttype = "e#VALUE!";
        result = "Invalid regex";
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}



SocialCalc.Formula.MatchFunction = function(fname, operand, foperand, sheet) {

    var regex = SocialCalc.Formula.OperandAsText(sheet, foperand);
    if (regex.type.charAt(0) == "e") {
        SocialCalc.Formula.PushOperand(operand, regex.type, result);
        return;
    }

    var text = SocialCalc.Formula.OperandAsText(sheet, foperand);
    if (text.type.charAt(0) == "e") {
        SocialCalc.Formula.PushOperand(operand, text.type, result);
        return;
    }

    //TODO Check type?
    var index = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    if (index.type.charAt(0) == "e") {
        SocialCalc.Formula.PushOperand(operand, index.type, result);
        return;
    }

    var resulttype = "e#VALUE!";
    var result = "Invalid regex";

    try {
        var matches = regex.value.match(SocialCalc.Formula.LiteralNotationRegex);
        if (matches != null) {
            var regexp = new RegExp(matches[1], matches[2]);
            var match = text.value.match(regexp);
            if (match[index.value]) {
                result = match[index.value];
                resulttype = "t";
            }
        }
    } catch (error) {}

    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}



SocialCalc.Formula.FunctionList["ISREGEXFORMAT"] = [SocialCalc.Formula.IsRegexFormatFunction, 1, "v", "", "test"];
SocialCalc.Formula.FunctionList["ISVALIDREGEX"] = [SocialCalc.Formula.IsValidRegexFunction, 1, "v", "", "test"];

SocialCalc.Formula.FunctionList["REGEX"] = [SocialCalc.Formula.RegexFunction, -1, "regex", "", "text"];

SocialCalc.Formula.FunctionList["OCCURS"] = [SocialCalc.Formula.OccursFunction, 2, "occurs", "", "text"];

SocialCalc.Formula.FunctionList["MATCH"] = [SocialCalc.Formula.MatchFunction, 3, "", "", "text"];