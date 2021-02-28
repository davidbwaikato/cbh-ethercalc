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

        var html = SocialCalc.SpreadsheetControl.GetHTMLContent(text);
        if (!html && value2.type == "th") html = text;
        
        if (html) {
            text = SocialCalc.HtmlSanitizer.SanitizeHtml(html);

            var rootNode = document.createElement("div");
            rootNode.innerHTML = text;


            try {

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
                            if (node.outerHTML) nodeText += node.outerHTML + "\n";
                            else nodeText += node.data + "\n";
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

        var html = SocialCalc.SpreadsheetControl.GetHTMLContent(text);
        if (!html && value2.type == "th") html = text;

        if (html) {
            text = SocialCalc.HtmlSanitizer.SanitizeHtml(html);

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

        var html = SocialCalc.SpreadsheetControl.GetHTMLContent(text);
        if (!html && value2.type == "th") html = text;
        
        if (html) {
            text = SocialCalc.HtmlSanitizer.SanitizeHtml(html);

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


SocialCalc.Formula.CoerceFunction = function (fname, operand, foperand, sheet) {

    //Check args
    if (foperand.length != 2) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var coercion = value.value;
    
    var value2 = SocialCalc.Formula.OperandAsText(sheet, foperand);
    var text = value2.value;

    var result = 0;
    var resulttype = "e#VALUE!";

    if (t == "t") {
        
        var coercionResult = SocialCalc.SpreadsheetControl.Coerce.DoCoercionForValue(coercion, text, value2.type);

        result = coercionResult.value;
        resulttype = coercionResult.type;

    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}

SocialCalc.Formula.FunctionList["COERCE"] = [SocialCalc.Formula.CoerceFunction, 2, "coerce", "", "html"];
