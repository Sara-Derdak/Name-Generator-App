"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const path = require("path");
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
const telemetry_1 = require("./telemetry");
const SUPPORTED_EXTENSIONS = ["css", "scss", "less"];
const SUPPORTED_EXTENSION_REGEX = /\.(css|scss|less)$/;
let reporter = null;
let defaultClient;
const clients = new Map();
let _sortedWorkspaceFolders;
function sortedWorkspaceFolders() {
    if (_sortedWorkspaceFolders === void 0) {
        _sortedWorkspaceFolders = vscode_1.workspace.workspaceFolders
            ? vscode_1.workspace.workspaceFolders
                .map((folder) => {
                let result = folder.uri.toString();
                if (result.charAt(result.length - 1) !== "/") {
                    result = result + "/";
                }
                return result;
            })
                .sort((a, b) => {
                return a.length - b.length;
            })
            : [];
    }
    return _sortedWorkspaceFolders;
}
vscode_1.workspace.onDidChangeWorkspaceFolders(() => (_sortedWorkspaceFolders = undefined));
function getOuterMostWorkspaceFolder(folder) {
    const sorted = sortedWorkspaceFolders();
    for (const element of sorted) {
        let uri = folder.uri.toString();
        if (uri.charAt(uri.length - 1) !== "/") {
            uri = uri + "/";
        }
        if (uri.startsWith(element)) {
            return vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.parse(element));
        }
    }
    return folder;
}
function activate(context) {
    reporter = (0, telemetry_1.initializeReporter)();
    context.subscriptions.push(reporter);
    reporter.sendTelemetryEvent("Activate Extension", { context: "client" });
    const module = context.asAbsolutePath(path.join("server", "out", "server.js"));
    const outputChannel = vscode_1.window.createOutputChannel("CSS Peek");
    const config = vscode_1.workspace.getConfiguration("cssPeek");
    const peekFromLanguages = config.get("peekFromLanguages");
    const peekToInclude = SUPPORTED_EXTENSIONS.map((l) => `**/*.${l}`);
    const peekToExclude = config.get("peekToExclude");
    function didOpenTextDocument(document) {
        try {
            if (!["file", "untitled"].includes(document.uri.scheme) ||
                (!peekFromLanguages.includes(document.languageId) &&
                    !SUPPORTED_EXTENSION_REGEX.test(document.fileName))) {
                return;
            }
            const documentSelector = [
                ...SUPPORTED_EXTENSIONS.map((language) => ({
                    scheme: "file",
                    language,
                })),
                ...SUPPORTED_EXTENSIONS.map((language) => ({
                    scheme: "untitled",
                    language,
                })),
                ...peekFromLanguages.map((language) => ({
                    scheme: "file",
                    language,
                })),
                ...peekFromLanguages.map((language) => ({
                    scheme: "untitled",
                    language,
                })),
            ];
            const uri = document.uri;
            const telemetryData = {
                context: "client",
                uriAuthority: uri.authority,
                uriFragment: uri.fragment,
                uriPath: uri.path,
                uriQuery: uri.query,
                uriScheme: uri.scheme,
                workspaceFolder: null,
            };
            // Untitled files go to a default client.
            if (uri.scheme === "untitled" && !defaultClient) {
                const debugOptions = { execArgv: ["--nolazy", "--inspect=6010"] };
                const serverOptions = {
                    run: { module, transport: node_1.TransportKind.ipc },
                    debug: {
                        module,
                        transport: node_1.TransportKind.ipc,
                        options: debugOptions,
                    },
                };
                const clientOptions = {
                    documentSelector,
                    synchronize: {
                        configurationSection: "cssPeek",
                    },
                    initializationOptions: {
                        stylesheets: [],
                        peekFromLanguages,
                    },
                    diagnosticCollectionName: "css-peek",
                    outputChannel,
                };
                defaultClient = new node_1.LanguageClient("css-peek", "CSS Peek", serverOptions, clientOptions);
                defaultClient.registerProposedFeatures();
                defaultClient.start();
                reporter.sendTelemetryEvent("Document Opened", telemetryData);
                return;
            }
            let folder = vscode_1.workspace.getWorkspaceFolder(uri);
            // Files outside a folder can't be handled. This might depend on the language.
            // Single file languages like JSON might handle files outside the workspace folders.
            if (!folder) {
                reporter.sendTelemetryEvent("Document Opened", telemetryData);
                return;
            }
            // If we have nested workspace folders we only start a server on the outer most workspace folder.
            folder = getOuterMostWorkspaceFolder(folder);
            telemetryData.workspaceFolder = folder;
            if (!clients.has(folder.uri.toString())) {
                vscode_1.workspace.findFiles(`{${(peekToInclude || []).join(",")}}`, `{${(peekToExclude || []).join(",")}}`).then((file_searches) => {
                    const potentialFiles = file_searches.filter((uri) => uri.scheme === "file");
                    const debugOptions = {
                        execArgv: ["--nolazy", `--inspect=${6011 + clients.size}`],
                    };
                    const serverOptions = {
                        run: { module, transport: node_1.TransportKind.ipc },
                        debug: {
                            module,
                            transport: node_1.TransportKind.ipc,
                            options: debugOptions,
                        },
                    };
                    const clientOptions = {
                        documentSelector,
                        diagnosticCollectionName: "css-peek",
                        synchronize: {
                            configurationSection: "cssPeek",
                        },
                        initializationOptions: {
                            stylesheets: potentialFiles.map((u) => ({
                                uri: u.toString(),
                                // TODO: don't rely on fsPath in a virtual workspace
                                // https://github.com/microsoft/vscode/wiki/Virtual-Workspaces
                                fsPath: u.fsPath,
                            })),
                            peekFromLanguages,
                        },
                        workspaceFolder: folder,
                        outputChannel,
                    };
                    const client = new node_1.LanguageClient("css-peek", "CSS Peek", serverOptions, clientOptions);
                    client.registerProposedFeatures();
                    client.start();
                    clients.set(folder.uri.toString(), client);
                });
            }
            reporter.sendTelemetryEvent("Document Opened", telemetryData);
        }
        catch (e) {
            reporter.sendTelemetryErrorEvent(e, {
                context: "client",
                method: "didOpenTextDocument",
            });
        }
    }
    vscode_1.workspace.onDidOpenTextDocument(didOpenTextDocument);
    vscode_1.workspace.textDocuments.forEach(didOpenTextDocument);
    vscode_1.workspace.onDidChangeWorkspaceFolders((event) => {
        for (const folder of event.removed) {
            const client = clients.get(folder.uri.toString());
            if (client) {
                reporter.sendTelemetryEvent("Workspace Folder Closed", {
                    context: "client",
                    folderName: folder.name,
                    uriAuthority: folder.uri.authority,
                    uriFragment: folder.uri.fragment,
                    uriPath: folder.uri.path,
                    uriQuery: folder.uri.query,
                    uriScheme: folder.uri.scheme,
                });
                clients.delete(folder.uri.toString());
                client.stop();
            }
        }
    });
}
exports.activate = activate;
function deactivate() {
    const promises = [];
    if (defaultClient) {
        promises.push(defaultClient.stop());
    }
    for (const client of clients.values()) {
        promises.push(client.stop());
    }
    reporter.sendTelemetryEvent("Deactivate Extension", { context: "client" }, { activeClients: promises.length });
    return Promise.all(promises).then(() => undefined);
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map