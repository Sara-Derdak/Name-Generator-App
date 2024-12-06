"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDefinition = exports.findSymbols = exports.getLanguageService = exports.isLanguageServiceSupported = void 0;
const path = require("path");
const vscode_css_languageservice_1 = require("vscode-css-languageservice");
const logger_1 = require("./../logger");
const languageServices = {
    css: (0, vscode_css_languageservice_1.getCSSLanguageService)(),
    scss: (0, vscode_css_languageservice_1.getSCSSLanguageService)(),
    less: (0, vscode_css_languageservice_1.getLESSLanguageService)(),
};
function isLanguageServiceSupported(serviceId) {
    return !!languageServices[serviceId];
}
exports.isLanguageServiceSupported = isLanguageServiceSupported;
function getLanguageService(document) {
    let service = languageServices[document.languageId];
    if (!service) {
        logger_1.console.log("Document type is " + document.languageId + ", using css instead.");
        service = languageServices["css"];
    }
    return service;
}
exports.getLanguageService = getLanguageService;
function getSelection(selector) {
    switch (selector.attribute) {
        case "id":
            return "#" + selector.value;
        case "class":
            return "." + selector.value;
        default:
            return selector.value;
    }
}
function resolveSymbolName(symbols, i) {
    const name = symbols[i].name;
    if (name.startsWith("&")) {
        return resolveSymbolName(symbols, i - 1) + name.slice(1);
    }
    return name;
}
function findSymbols(selector, stylesheetMap) {
    const foundSymbols = [];
    // Construct RegExp of selector to test against the symbols
    let selection = getSelection(selector);
    const classOrIdSelector = selector.attribute === "class" || selector.attribute === "id";
    if (selection[0] === ".") {
        selection = "\\" + selection;
    }
    if (!classOrIdSelector) {
        // Tag selectors must have nothing, whitespace, or a combinator before it.
        selection = "(^|[\\s>+~])" + selection;
    }
    selection += "(\\[[^\\]]*\\]|:{1,2}[\\w-()]+|\\.[\\w-]+|#[\\w-]+)*\\s*";
    // This regular expression will be used to test the symbol
    const symbolRegexp = new RegExp(selection + "$", classOrIdSelector ? "" : "i");
    // This regular expression will be used to test if file should even be parsed
    // in the first place
    const fileRegexp = new RegExp(selection, classOrIdSelector ? "" : "i");
    // Test all the symbols against the RegExp
    Object.keys(stylesheetMap).forEach((uri) => {
        const styleSheet = stylesheetMap[uri];
        try {
            let symbols;
            if (styleSheet.symbols) {
                // use the cached value
                symbols = styleSheet.symbols;
            }
            else {
                // The document symbols haven't been extracted and cached yet.
                // Let's first do a dumb check to see if the document even has the text we need in the first place
                // if it doesn't, then we don't need to bother extrating and caching any symbols at all
                const text = styleSheet.document.getText();
                if (text.search(fileRegexp) === -1)
                    return;
                logger_1.console.log(`Parsing ${path.basename(uri)}`);
                // Looks like it does. Now, let's go ahead and actually get the symbols + cache the symbols for the future
                const languageService = getLanguageService(styleSheet.document);
                const stylesheet = languageService.parseStylesheet(styleSheet.document);
                symbols = styleSheet.symbols = languageService.findDocumentSymbols(styleSheet.document, stylesheet);
            }
            logger_1.console.log(`${path.basename(uri)} has ${symbols.length} symbols`);
            logger_1.console.log(`Searching through them all for /${selection}/`);
            symbols.forEach((symbol, i) => {
                const name = resolveSymbolName(symbols, i);
                // console.log(
                //   `  ${symbol.location.range.start.line}:${
                //     symbol.location.range.start.character
                //   } ${symbol.deprecated ? "[deprecated] " : " "}${
                //     symbol.containerName ? `[container:${symbol.containerName}] ` : " "
                //   } [${symbol.kind}] ${name}`
                // );
                if (name.search(symbolRegexp) !== -1) {
                    foundSymbols.push(symbol);
                }
                else if (!classOrIdSelector) {
                    // Special case for tag selectors - match "*" as the rightmost character
                    if (/\*\s*$/.test(name)) {
                        foundSymbols.push(symbol);
                    }
                }
            });
            logger_1.console.log(`Done`);
        }
        catch (e) {
            logger_1.console.log(e.stack);
        }
    });
    return foundSymbols;
}
exports.findSymbols = findSymbols;
function findDefinition(selector, stylesheetMap) {
    return findSymbols(selector, stylesheetMap).map(({ location }) => location);
}
exports.findDefinition = findDefinition;
//# sourceMappingURL=findDefinition.js.map