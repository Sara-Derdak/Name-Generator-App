"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const path_1 = require("path");
const fs_1 = require("fs");
const webviewContent_1 = require("./webviewContent");
const flexboxPatterns = require("./flexboxPatterns");
const supportedFiles = ['css', 'less', 'sass', 'scss'];
let decorationType;
function activate(context) {
    decorationType = vscode.window.createTextEditorDecorationType({
        after: {
            margin: '0 0.2rem 0 0',
            width: '.8125rem',
        },
        dark: {
            after: {
                contentIconPath: context.asAbsolutePath('/images/flexbox-icon-light.svg'),
            },
        },
        light: {
            after: {
                contentIconPath: context.asAbsolutePath('/images/flexbox-icon-dark.svg'),
            },
        },
    });
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        decorate(activeEditor);
    }
    const disposableCommand = vscode.commands.registerCommand('flexbox.cheatsheet', () => {
        const styleRoot = vscode.Uri.file((0, path_1.join)(context.extensionPath, 'style'));
        const imagesRoot = vscode.Uri.file((0, path_1.join)(context.extensionPath, 'images'));
        const scriptRoot = vscode.Uri.file((0, path_1.join)(context.extensionPath, 'js'));
        // Create and show a new webview
        const panel = vscode.window.createWebviewPanel('flexboxCheatsheet', 'CSS Flexbox Cheatsheet', vscode.ViewColumn.Beside, {
            localResourceRoots: [styleRoot, imagesRoot, scriptRoot],
            enableScripts: true,
        });
        const stylePath = panel.webview.asWebviewUri(styleRoot);
        const imagesPath = panel.webview.asWebviewUri(imagesRoot);
        const scriptPath = panel.webview.asWebviewUri(scriptRoot);
        const cspSource = panel.webview.cspSource;
        panel.webview.html = (0, webviewContent_1.getWebviewContent)(cspSource, scriptPath, stylePath, imagesPath);
    });
    const disposableVisibleTextEditors = vscode.window.onDidChangeVisibleTextEditors((event) => {
        let editor = vscode.window.activeTextEditor;
        if (editor && supportedFiles.includes(editor.document.languageId)) {
            decorate(editor);
        }
    });
    const disposableChangeDocument = vscode.workspace.onDidChangeTextDocument((event) => {
        const openEditor = vscode.window.visibleTextEditors.filter((editor) => editor.document.uri === event.document.uri)[0];
        if (openEditor &&
            supportedFiles.includes(openEditor.document.languageId)) {
            decorate(openEditor);
        }
    });
    const hoverProvider = {
        provideHover(doc, pos, token) {
            const range = getPropertyRangeAtPosition(doc, pos);
            if (range === undefined) {
                return;
            }
            const property = getPropertyAtRange(doc, range);
            const markdownString = buildMarkdownString(context, property);
            return new vscode.Hover(markdownString, range);
        },
    };
    const disposableHoverProvider = vscode.languages.registerHoverProvider(supportedFiles, hoverProvider);
    context.subscriptions.push(disposableCommand, disposableHoverProvider, disposableChangeDocument, disposableVisibleTextEditors);
}
exports.activate = activate;
function decorate(editor) {
    const sourceCode = editor.document.getText();
    let decorationsArray = [];
    const sourceCodeArr = sourceCode.split('\n');
    for (let line = 0; line < sourceCodeArr.length; line++) {
        const sourceCode = sourceCodeArr[line];
        let matches = matchAll(flexboxPatterns.displayFlexPattern, sourceCode);
        if (matches.length > 0) {
            matches.forEach((match) => {
                if (match.index !== undefined) {
                    const flexIndex = sourceCode.indexOf('flex', match.index);
                    let range = new vscode.Range(new vscode.Position(line, match.index), new vscode.Position(line, flexIndex));
                    let decoration = { range };
                    decorationsArray.push(decoration);
                }
            });
        }
    }
    editor.setDecorations(decorationType, decorationsArray);
}
function matchAll(pattern, text) {
    const out = [];
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text))) {
        out.push(match);
    }
    return out;
}
function buildMarkdownString(context, property) {
    let markdownString = [];
    const commandUri = vscode.Uri.parse('command:flexbox.cheatsheet');
    const flexboxCommand = new vscode.MarkdownString(`[Open CSS Flexbox Cheatsheet](${commandUri} "Open CSS Flexbox Cheatsheet")`);
    // To enable command URIs in Markdown content, you must set the `isTrusted` flag.
    // When creating trusted Markdown string, make sure to properly sanitize all the
    // input content so that only expected command URIs can be executed
    flexboxCommand.isTrusted = true;
    markdownString.push(flexboxCommand);
    const filePath = (0, path_1.join)(context.extensionPath, 'images', `${property}.svg`);
    const isFile = doesFileExist(filePath);
    if (isFile) {
        const onDiskPath = vscode.Uri.file(filePath);
        const propertyIllustration = new vscode.MarkdownString(`![${property}](${onDiskPath.toString()})`);
        markdownString.push(propertyIllustration);
    }
    return markdownString;
}
function getPropertyRangeAtPosition(doc, pos) {
    let propertyRange;
    for (const pattern of flexboxPatterns.allFlexboxPatterns) {
        const range = doc.getWordRangeAtPosition(pos, pattern);
        if (range) {
            propertyRange = range;
            break;
        }
    }
    return propertyRange;
}
function doesFileExist(filePath) {
    try {
        const stats = (0, fs_1.lstatSync)(filePath);
        return stats.isFile();
    }
    catch (_a) {
        return false;
    }
}
function getPropertyAtRange(doc, range) {
    let property = doc.getText(range);
    if (flexboxPatterns.flexGrowBiggerThanZero.test(property)) {
        return 'flex-grow-1';
    }
    else if (flexboxPatterns.flexShrinkBiggerThanZero.test(property)) {
        return 'flex-shrink-1';
    }
    else if (flexboxPatterns.order.test(property)) {
        return 'order';
    }
    return property
        .split(':')
        .map((elem) => elem.trim())
        .join('-')
        .replace(';', '');
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map