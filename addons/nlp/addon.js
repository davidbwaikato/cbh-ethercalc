const { Container } = require('@nlpjs/core');
const { SentimentAnalyzer } = require('@nlpjs/sentiment');
const { Language } = require('@nlpjs/language')

const lang = {
    "en": require('@nlpjs/lang-en')
}
//const langAll = require('@nlpjs/lang-all');
const LangEn = lang["en"]["LangEn"];
const { leven } = require('@nlpjs/similarity');

//console.log(langAll);

console.log("NLP");

window.nlp = {}
window.nlp.sentiment = function(text) {
    (async () => {
        const container = new Container();
        container.use(LangEn);
        const sentiment = new SentimentAnalyzer({ container });
        const result = await sentiment.process({ locale: 'en', text: text});
        console.log(result.sentiment);
      })();
}

SocialCalc.Formula.NLPSEPARATORREGEX = /[ ,]+/g;

SocialCalc.Formula.NLPSentimentFunction = function (fname, operand, foperand, sheet) {

    var numargs = foperand.length;

    //Check args
    if (numargs < 2 || numargs > 3) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var locale = value.value;

    var value2 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t2 = value2.type.charAt(0);
    var text = value2.value;

    var value3 = numargs == 3 ? SocialCalc.Formula.OperandValueAndType(sheet, foperand) : {value: "vote", type: "t"};
    var t3 = value3.type.charAt(0);
    var option = value3.value;

    var result = 0;
    var resulttype = "e#VALUE!";
console.log("Type check")
    if (t == "t" && t2 == "t" && t3 == "t") {
console.log("Type ok");

        (async () => {

            const container = new Container();
            container.use(LangEn);
            const sentiment = new SentimentAnalyzer({ container });
            console.log("s1")
            const s = await sentiment.process({ locale: locale, text: text});
            const r = s.sentiment;
            console.log(s)
            //console.log(sentiment.process({ locale: locale, text: text}))
            console.log("s2")
            console.log(r)
            //ct { score: 0.5, numWords: 3, numHits: 1, average: 0.16666666666666666, type: "senticon", locale: "en", vote: "positive" }
            switch (option) {
                case "score":
                case "s":
                    result = r.score;
                    resulttype = "n";
                break;
                case "numWords":
                case "n":
                    result = r.numWords;
                    resulttype = "w";
                break;
                case "numHits":
                case "n":
                    result = r.numHits;
                    resulttype = "h";
                break;
                case "average":
                case "a":
                    result = r.average;
                    resulttype = "n";
                break;
                case "type":
                case "t":
                    result = r.type;
                    resulttype = "t";
                break;
                case "vote":
                case "v":
                    result = r.vote;
                    resulttype = "t";
                break;
                    
            }

            SocialCalc.Formula.PushOperand(operand, resulttype, result);

        })();
        
    }
    else SocialCalc.Formula.PushOperand(operand, resulttype, result);

}



async function poll(fn, fnCondition, ms) {
    let result = await fn();
    while (fnCondition(result)) {
        await new Promise(resolve => {
            console.log(`waiting ${ms} ms...`);
            setTimeout(resolve, ms);
        })(ms);
        result = await fn();
    }
    return result;
}



SocialCalc.Formula.NLPLevenshteinFunction = function(fname, operand, foperand, sheet) {

    var numargs = foperand.length;

    //Check args
    if (numargs != 2) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var text1 = value.value;

    var value2 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t2 = value2.type.charAt(0);
    var text2 = value2.value;

    var result = 0;
    var resulttype = "e#VALUE!";

    if (t == "t" && t2 == "t") {
        console.log(leven)
        result = leven(text1, text2);
        resulttype = "n";
        console.log(result)
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);

}



SocialCalc.Formula.NLPGetClassLang = function(rootClass, locale) {
    var localeModule = /*langAll;*/lang[locale];
    if (localeModule) {
        rootClass = rootClass.charAt(0).toUpperCase() + rootClass.slice(1);
        var langX = rootClass + locale.charAt(0).toUpperCase() + locale.slice(1);
        return localeModule[langX];
    }
    else return undefined;
}



SocialCalc.Formula.NLPNormalizeFunction = function(fname, operand, foperand, sheet) {

    var numargs = foperand.length;

    //Check args
    if (numargs != 2) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var locale = value.value;

    var value2 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t2 = value2.type.charAt(0);
    var text = value2.value;

    var result = 0;
    var resulttype = "e#VALUE!";

    var Normalizer = SocialCalc.Formula.NLPGetClassLang("normalizer", locale);
    if (t == "t" && t2 == "t" && Normalizer) {
        var normalizer = new Normalizer();
        var result = normalizer.normalize(text);
        resulttype = "t";
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);

}



SocialCalc.Formula.NLPTokenizeFunctions = function(fname, operand, foperand, sheet) {

    var numargs = foperand.length;

    //Check args
    if (numargs != 2) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var locale = value.value;

    var value2 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t2 = value2.type.charAt(0);
    var text = value2.value;

    var result = 0;
    var resulttype = "e#VALUE!";

    var Tokenizer = SocialCalc.Formula.NLPGetClassLang("tokenizer", locale);
    if (t == "t" && t2 == "t" && Tokenizer) {
        var tokenizer = new Tokenizer();
        var tokens = tokenizer.tokenize(text, fname.toUpperCase() == "NLPTOKENIZENORM");
        result = "";
        for (var t = 0; t < tokens.length; t++) {
            if (t != 0) result += ", " + tokens[t];
            else result += tokens[t];
        }
        resulttype = "t";
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);

}



SocialCalc.Formula.NLPIsStopwordFunction = function(fname, operand, foperand, sheet) {
    var numargs = foperand.length;

    //Check args
    if (numargs != 2) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var locale = value.value;

    var value2 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t2 = value2.type.charAt(0);
    var text = value2.value;

    var result = 0;
    var resulttype = "e#VALUE!";
    var Stopwords = SocialCalc.Formula.NLPGetClassLang("stopwords", locale);
    if (t == "t" && t2 == "t" && Stopwords) {
        var stopwords = new Stopwords();
        result = stopwords.isStopword(text) ? 1 : 0;
        resulttype = "n";
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);

}



SocialCalc.Formula.NLPStopwordsFunction = function(fname, operand, foperand, sheet) {

    var numargs = foperand.length;

    //Check args
    if (numargs < 2 || numargs > 3) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var locale = value.value;

    var value2 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t2 = value2.type.charAt(0);
    var text = value2.value;

    var t3 = "t";
    var stopwordsList;
    if (numargs == 3) {
        var value3 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
        t3 = value3.type.charAt(0);
        stopwordsList = value3.value;
    }

    var result = 0;
    var resulttype = "e#VALUE!";

    var Stopwords = SocialCalc.Formula.NLPGetClassLang("stopwords", locale);
    if (t == "t" && t2 == "t" && t3 == "t" && Stopwords) {
        var stopwords = new Stopwords();
        if (stopwordsList) {
            stopwords.dictionary = {};
            stopwords.build(stopwordsList.split(SocialCalc.Formula.NLPSEPARATORREGEX));
        }
        var tokens = stopwords.removeStopwords(text.split(SocialCalc.Formula.NLPSEPARATORREGEX));
        result = "";
        for (var t = 0; t < tokens.length; t++) {
            if (t != 0) result += ", " + tokens[t];
            else result += tokens[t];
        }
        resulttype = "t";
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);

}



SocialCalc.Formula.NLPStemFunction = function(fname, operand, foperand, sheet) {

    var numargs = foperand.length;

    //Check args
    if (numargs != 2) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var locale = value.value;

    var value2 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t2 = value2.type.charAt(0);
    var text = value2.value;

    var result = 0;
    var resulttype = "e#VALUE!";

    var Stemmer = SocialCalc.Formula.NLPGetClassLang("stemmer", locale);
    if (t == "t" && t2 == "t" && Stemmer) {
        var stemmer = new Stemmer();
        var tokens = stemmer.stem(text.split(SocialCalc.Formula.NLPSEPARATORREGEX));
        result = "";
        for (var t = 0; t < tokens.length; t++) {
            if (t != 0) result += ", " + tokens[t];
            else result += tokens[t];
        }
        resulttype = "t";
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);

}



SocialCalc.Formula.NLPGuessLanguageFunction = function(fname, operand, foperand, sheet) {

    var numargs = foperand.length;

    //Check args
    if (numargs < 2 || numargs > 3) {
        SocialCalc.Formula.FunctionArgsError(fname, operand);
        return;
    }

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var text = value.value;

    var value2 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t2 = value2.type.charAt(0);
    var format = value2.value;

    var t3 = "t";
    var allowList;
    if (numargs == 3) {
        var value3 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
        t3 = value3.type.charAt(0);
        allowList = value3.value;
    }

    var result = 0;
    var resulttype = "e#VALUE!";

    if (t == "t" && t2 == "t") {
        var language = new Language();
        console.log(Language)
        console.log(language)
        var guess;
        if (allowList) {
            guess = language.guessBest(text, allowList.split(SocialCalc.Formula.NLPSEPARATORREGEX));
        } else {
            guess = language.guessBest(text);
        }
        switch (format) {
            case "xx":
                result = guess.alpha2;
                resulttype = "t";
            break;
            case "xxx":
                result = guess.alpha3;
                resulttype = "t";
            break;
            case "lang":
                result = guess.language;
                resulttype = "t";
            break;
            case "score":
                result = guess.score;
                resulttype = "n";
            break;
        }
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);

}



SocialCalc.Formula.FunctionList["NLPSENTIMENT"] = [SocialCalc.Formula.NLPSentimentFunction, -1, "nlpsentiment", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPLEVENSHTEIN"] = [SocialCalc.Formula.NLPLevenshteinFunction, 2, "", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPNORMALIZE"] = [SocialCalc.Formula.NLPNormalizeFunction, 2, "", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPTOKENIZE"] = [SocialCalc.Formula.NLPTokenizeFunctions, 2, "", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPTOKENIZENORM"] = [SocialCalc.Formula.NLPTokenizeFunctions, 2, "", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPISSTOPWORD"] = [SocialCalc.Formula.NLPIsStopwordFunction, 2, "", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPSTOPWORDS"] = [SocialCalc.Formula.NLPStopwordsFunction, -1, "", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPSTEM"] = [SocialCalc.Formula.NLPStemFunction, 2, "", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPGUESSLANGUAGE"] = [SocialCalc.Formula.NLPGuessLanguageFunction, -1, "", "", "nlp"];

