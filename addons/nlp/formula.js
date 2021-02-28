const { Container } = require('@nlpjs/core');
const { SentimentAnalyzer } = require('@nlpjs/sentiment');
const { Language } = require('@nlpjs/language')

const lang = {

    // "ar": require('@nlpjs/lang-ar'),
    // "bn": require('@nlpjs/lang-bn'),
    // "ca": require('@nlpjs/lang-ca'),
    // "cs": require('@nlpjs/lang-cs'),
    // "da": require('@nlpjs/lang-da'),
    // "de": require('@nlpjs/lang-de'),
    // "el": require('@nlpjs/lang-el'),
    "en": require('@nlpjs/lang-en'),
    "es": require('@nlpjs/lang-es'),
    // "eu": require('@nlpjs/lang-eu'),

    // "fa": require('@nlpjs/lang-fa'),
    // "fi": require('@nlpjs/lang-fi'),
    "fr": require('@nlpjs/lang-fr'),
    // "ga": require('@nlpjs/lang-ga'),
    // "gl": require('@nlpjs/lang-fl'),
    // "hi": require('@nlpjs/lang-hi'),
    // "hu": require('@nlpjs/lang-hu'),
    // "hy": require('@nlpjs/lang-hy'),
    // "id": require('@nlpjs/lang-id'),
    // "it": require('@nlpjs/lang-it'),

    // "ja": require('@nlpjs/lang-ja'),
    // "ko": require('@nlpjs/lang-ko'),
    // "lt": require('@nlpjs/lang-lt'),
    // "ms": require('@nlpjs/lang-ms'),
    // "ne": require('@nlpjs/lang-ne'),
    // "nl": require('@nlpjs/lang-nl'),
    // "no": require('@nlpjs/lang-no'),
    // "pl": require('@nlpjs/lang-pl'),
    // "pt": require('@nlpjs/lang-pt'),
    // "ro": require('@nlpjs/lang-ro'),

    // "ru": require('@nlpjs/lang-ru'),
    // "sl": require('@nlpjs/lang-sl'),
    // "sr": require('@nlpjs/lang-sr'),
    // "sv": require('@nlpjs/lang-sv'),
    // "ta": require('@nlpjs/lang-ta'),
    // "th": require('@nlpjs/lang-th'),
    // "tl": require('@nlpjs/lang-tl'),
    // "tr": require('@nlpjs/lang-tr'),
    // "uk": require('@nlpjs/lang-uk'),
    // "zh": require('@nlpjs/lang-zh'),

}
//const langAll = require('@nlpjs/lang-all');
const LangEn = lang["en"]["LangEn"];
const { leven } = require('@nlpjs/similarity');

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

    if (t == "t" && t2 == "t" && t3 == "t") {


        (async () => {

            const container = new Container();
            container.use(LangEn);
            const sentiment = new SentimentAnalyzer({ container });

            const s = await sentiment.process({ locale: locale, text: text});
            const r = s.sentiment;
 
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
        result = leven(text1, text2);
        resulttype = "n";
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
            if (t != 0) result += " " + tokens[t];
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
            if (t != 0) result += " " + tokens[t];
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
            if (t != 0) result += " " + tokens[t];
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
SocialCalc.Formula.FunctionList["NLPLEVENSHTEIN"] = [SocialCalc.Formula.NLPLevenshteinFunction, 2, "nlplevenshtein", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPNORMALIZE"] = [SocialCalc.Formula.NLPNormalizeFunction, 2, "nlpnormalize", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPTOKENIZE"] = [SocialCalc.Formula.NLPTokenizeFunctions, 2, "nlptokenize", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPTOKENIZENORM"] = [SocialCalc.Formula.NLPTokenizeFunctions, 2, "nlptokenizenorm", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPISSTOPWORD"] = [SocialCalc.Formula.NLPIsStopwordFunction, 2, "nlpisstopword", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPSTOPWORDS"] = [SocialCalc.Formula.NLPStopwordsFunction, -1, "nlpstopwords", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPSTEM"] = [SocialCalc.Formula.NLPStemFunction, 2, "nlpstem", "", "nlp"];
SocialCalc.Formula.FunctionList["NLPGUESSLANGUAGE"] = [SocialCalc.Formula.NLPGuessLanguageFunction, -1, "nlpguesslanguage", "", "nlp"];



SocialCalc.Formula.NLPPreprocessFunction = function(fname, operand, foperand, sheet) {

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
    var Stemmer = SocialCalc.Formula.NLPGetClassLang("stemmer", locale);
    if (t == "t" && t2 == "t" && Tokenizer && Stemmer) {
        text = text.replace(/[#–—]/g, " ");
        if (locale == "en") {
            text = text.replace(/&/g, " and ");
        }
        var tokenizer = new Tokenizer();
        var stemmer = new Stemmer();
        var tokens = tokenizer.tokenize(text, true);
        // tokens = stemmer.stem(tokens);
        result = "";
        for (var t = 0; t < tokens.length; t++) {
            if (t != 0) result += ", " + tokens[t];
            else result += tokens[t];
        }
        resulttype = "t";
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);

}



SocialCalc.Formula.FunctionList["NLPPREPROCESS"] = [SocialCalc.Formula.NLPPreprocessFunction, 2, "", "", "nlp"];



SocialCalc.Formula.LDA1Function = function (fname, operand, foperand, sheet) {

    var result = 0;
    var resulttype = "e#VALUE!";

    var docs = [];
    var docWords = [];
    for (var i = 0; foperand.length > 0; i++) {
        var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
        var t = value.type.charAt(0);
        var text = value.value;
        if (t == "t") {
            docs.push({
                id: i,
                text: text
            });
            docWords.push({});
        }
        else {
            docs = null;
            break;
        }
    }
    
    if (docs) {

        //https://stackoverflow.com/a/47593316
        function mulberry32(a) {
            return function() {
              var t = a += 0x6D2B79F5;
              t = Math.imul(t ^ t >>> 15, t | 1);
              t ^= t + Math.imul(t ^ t >>> 7, t | 61);
              return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
        }

        var oldRandom = Math.random;
        Math.random = mulberry32(0);
        var lda = new SocialCalc.SpreadsheetControl.Lda(null, docs, null);
        Math.random = oldRandom;

        var topicWordsList = [];
        for (var topic of lda.getTopicWords()) {
            topicWordsList[topic.id] = topic.topicText;
        }
        result = ".json\n\n" + JSON.stringify(topicWordsList) + "\n\n.json\n";

        resulttype = "t";
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}



SocialCalc.Formula.LDA2Function = function (fname, operand, foperand, sheet) {

    var result = 0;
    var resulttype = "e#VALUE!";

    var docs = [];
    var docWords = [];
    for (var i = 0; foperand.length > 0; i++) {
        var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
        var t = value.type.charAt(0);
        var text = value.value;
        if (t == "t") {
            docs.push({
                id: i,
                text: text
            });
            docWords.push({});
        }
        else {
            docs = null;
            break;
        }
    }
    
    if (docs) {

        //https://stackoverflow.com/a/47593316
        function mulberry32(a) {
            return function() {
              var t = a += 0x6D2B79F5;
              t = Math.imul(t ^ t >>> 15, t | 1);
              t ^= t + Math.imul(t ^ t >>> 7, t | 61);
              return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
        }

        var oldRandom = Math.random;
        Math.random = mulberry32(0);
        var lda = new SocialCalc.SpreadsheetControl.Lda(null, docs, null);
        Math.random = oldRandom;

        var topicWordsList = [];
        for (var topic of lda.getTopicWords()) topicWordsList[topic.id] = topic.topicText;
        for (var topic of lda.getDocuments()) {
            var topicWords = topicWordsList[topic.topic].split(" ");
            for (var d in topic.documents) {
                for (var word of topicWords) {
                    docWords[topic.documents[d].id][word] = true;
                }
            }
        }
        for (var d in docWords) {
            var document = docWords[d];
            var s = "";
            for (var w in document) s += (s ? " " : "") + w;
            docWords[d] = s;
        }
        result = ".json\n\n" + JSON.stringify(docWords) + "\n\n.json\n";

        resulttype = "t";
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}

SocialCalc.Formula.LDA3Function = function (fname, operand, foperand, sheet) {

    var result = 0;
    var resulttype = "e#VALUE!";

    var docs = [];
    var docWords = [];
    for (var i = 0; foperand.length > 0; i++) {
        var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
        var t = value.type.charAt(0);
        var text = value.value;
        if (t == "t") {
            docs.push({
                id: i,
                text: text
            });
            docWords.push({});
        }
        else {
            docs = null;
            break;
        }
    }
    
    if (docs) {

        //https://stackoverflow.com/a/47593316
        function mulberry32(a) {
            return function() {
              var t = a += 0x6D2B79F5;
              t = Math.imul(t ^ t >>> 15, t | 1);
              t ^= t + Math.imul(t ^ t >>> 7, t | 61);
              return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
        }

        var oldRandom = Math.random;
        Math.random = mulberry32(0);
        var lda = new SocialCalc.SpreadsheetControl.Lda(null, docs, null);
        Math.random = oldRandom;

        var docScores = {};
        for (var topic of lda.getDocuments()) {
            docScores[topic.topic+1] = {};
            for (var d in topic.documents) {
                docScores[topic.topic+1][topic.documents[d].id+1] = topic.documents[d].score;
            }
        }
        result = ".json\n\n" + JSON.stringify(docScores) + "\n\n.json\n";

        resulttype = "t";
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}



SocialCalc.Formula.LDAFunction = function (fname, operand, foperand, sheet) {

    var result = 0;
    var resulttype = "e#VALUE!";

    var docs = [];
    var docWords = [];
    for (var i = 0; foperand.length > 0; i++) {
        var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
        var t = value.type.charAt(0);
        var text = value.value;
        if (t == "t") {
            docs.push({
                id: i,
                text: text
            });
            docWords.push({});
        }
        else {
            docs = null;
            break;
        }
    }
    
    if (docs) {

        //https://stackoverflow.com/a/47593316
        function mulberry32(a) {
            return function() {
              var t = a += 0x6D2B79F5;
              t = Math.imul(t ^ t >>> 15, t | 1);
              t ^= t + Math.imul(t ^ t >>> 7, t | 61);
              return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
        }

        var oldRandom = Math.random;
        Math.random = mulberry32(0);
        var lda = new SocialCalc.SpreadsheetControl.Lda(null, docs, null);
        Math.random = oldRandom;

        var topicWordsList = {};
        for (var topic of lda.getTopicWords()) {
            topicWordsList[topic.id+1] = topic.topicText;
        }

        var docScores = {};
        for (var topic of lda.getDocuments()) {
            docScores[topic.topic+1] = {};
            for (var d in topic.documents) {
                docScores[topic.topic+1][topic.documents[d].id+1] = topic.documents[d].score;
            }
        }

        var combinedResult = {
            scores: docScores,
            words: topicWordsList
        }

        result = ".json\n\n" + JSON.stringify(combinedResult) + "\n\n.json\n";

        resulttype = "t";
    }

    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}




// SocialCalc.Formula.FunctionList["LDA1"] = [SocialCalc.Formula.LDA1Function, -1, "lda", "", "nlp"];
// SocialCalc.Formula.FunctionList["LDA2"] = [SocialCalc.Formula.LDA2Function, -1, "lda", "", "nlp"];
// SocialCalc.Formula.FunctionList["LDA3"] = [SocialCalc.Formula.LDA3Function, -1, "lda", "", "nlp"];
SocialCalc.Formula.FunctionList["LDA"] = [SocialCalc.Formula.LDAFunction, -1, "lda", "", "nlp"];



SocialCalc.Formula.JSONGetFunction = function (fname, operand, foperand, sheet) {

    var value = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var t = value.type.charAt(0);
    var text = value.value;

    var value2 = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
    var defaultValue = value2.value;

    var result = 0;
    var resulttype = "e#VALUE!";

    if (t == "t") {

        try {
            var json = SocialCalc.SpreadsheetControl.GetJSONContent(text);
            if (json) {

                obj = JSON.parse(json);

                for (var i = 0; foperand.length > 0; i++) {
                    var argValue = SocialCalc.Formula.OperandValueAndType(sheet, foperand);
                    var arg = argValue.value;
                    obj = obj[arg];
                }

            }

        } catch (error) {
            console.error(error)
            obj = defaultValue;
        }
        if (obj == undefined) {
            obj = defaultValue;
        }

        if (typeof obj == "object") {
            result = ".json\n\n" + JSON.stringify(obj) + "\n\n.json\n";
            resulttype = "t";
        }
        else if (typeof obj == "number") {
            result = obj;
            resulttype = "n";
        }
        else {
            result = obj+"";
            resulttype = "t";
        }

    }    


    SocialCalc.Formula.PushOperand(operand, resulttype, result);
}


SocialCalc.Formula.FunctionList["JSONGET"] = [SocialCalc.Formula.JSONGetFunction, -1, "", "", "nlp"];