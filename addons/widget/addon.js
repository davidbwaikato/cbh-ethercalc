/*

SocialCalc.SpreadsheetControl.DoWidget = function() {
    alert("Widget");
}

SocialCalc.SpreadsheetControl.formulabuttons["widget"] = {
    image: "insertformula.png",
    tooltip: "Functions", // tooltips are localized when set below
    command: SocialCalc.SpreadsheetControl.DoFunctionList
}

/*
    this.formulabuttons["widget"] = {
        image: "insertformula.png",
        tooltip: "Functions", // tooltips are localized when set below
        command: SocialCalc.SpreadsheetControl.DoFunctionList
    }
*/


/*
SocialCalc.SpreadsheetControl.DoWidget = function() {
    alert("Widget");
}

var oldProto = SocialCalc.SpreadsheetControl.prototype;

var OldSpreadsheetControl = SocialCalc.SpreadsheetControl;
SocialCalc.SpreadsheetControl = function(prefix) {
    var old = new OldSpreadsheetControl(prefix);
    for (var name in Object.getOwnPropertyNames(old)) {
        this[name] = old[name];
    }


};
SocialCalc.SpreadsheetControl.prototype = oldProto;
*/


/*
SocialCalc.OriginalSpreadsheetControl = SocialCalc.SpreadsheetControl;

SocialCalc.SpreadsheetControl = function(prefix) {

    return SocialCalc.OriginalSpreadsheetControl(prefix);


}

*/

/*
SocialCalc.SpreadsheetControl.DoWidget = function() {
    alert("Widget");
}

var oldProto = SocialCalc.SpreadsheetControl.prototype.InitializeSpreadsheetControl;
//SocialCalc.SpreadsheetControl.prototype.OldInitializeSpreadsheetControl =
//    SocialCalc.SpreadsheetControl.prototype.InitializeSpreadsheetControl;
SocialCalc.SpreadsheetControl.prototype.InitializeSpreadsheetControl = function(node, height, width, spacebelow) {

    //PRE-INIT

    // this.formulabuttons["widget"] = {
    //     image: "addons/widget/images/html-icon.png",
    //     skipImagePrefix: true,
    //     tooltip: "HTML", // tooltips are localized when set below
    //     command: SocialCalc.SpreadsheetControl.DoWidget
    // }



    // var tabName = "edit";
    // var extraHtml = '<img id="%id.button_widgetcommand" src="%img.undo.png" style="vertical-align:bottom;">';
    // for (var i = 0; i < this.tabs.length; i++) {
    //     var tab = this.tabs[i];
    //     if (tab.name == tabName) {
    //         if (tab.html.endsWith("</div>")) {
    //             tab.html = tab.html.substring(0, tab.html.length - 6) + extraHtml + "</div>";
    //         }
    //     }
    // }



    // this.tabs.push({
    //    name: "preferences",
    //    text: "Preferences",
    //    html: '<div></div>',
    //    oncreate: null,
    //    onclick: null,
    //    view: "preferences"
    // });

    // this.views["preferences"] = {
    //     name: "preferences",
    //     values: {},
    // }


    var returnValue = oldProto.bind(this)(node, height, width, spacebelow);

    //POST-INIT

    


    return returnValue;

}
*/