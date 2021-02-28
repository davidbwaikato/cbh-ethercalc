// ###############  HTML WIDGET   ###############


var oldProto = SocialCalc.SpreadsheetControl.prototype.InitializeSpreadsheetControl;
SocialCalc.SpreadsheetControl.prototype.InitializeSpreadsheetControl = function (node, height, width, spacebelow) {

    //PRE-INIT

    this.formulabuttons["html-widget"] = {
        image: "addons/html/images/html-icon.png",
        skipImagePrefix: true,
        tooltip: "HTML", // tooltips are localized when set below
        command: SocialCalc.SpreadsheetControl.HTMLMultiline.ShowDialog
    }

    this.formulabuttons["coerce-widget"] = {
        image: "addons/html/images/coerce-icon.png",
        skipImagePrefix: true,
        tooltip: "Coerce data types", // tooltips are localized when set below
        command: SocialCalc.SpreadsheetControl.Coerce.ShowDialog
    }



    var returnValue = oldProto.bind(this)(node, height, width, spacebelow);

    //POST-INIT




    return returnValue;

}
