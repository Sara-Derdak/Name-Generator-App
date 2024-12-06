"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeReporter = void 0;
const extension_telemetry_1 = require("@vscode/extension-telemetry");
const INSTRUMENTATION_KEY = "7868ce95-465b-4f61-a5f9-99a12abfb3ad";
function initializeReporter() {
    return new extension_telemetry_1.default(INSTRUMENTATION_KEY);
}
exports.initializeReporter = initializeReporter;
//# sourceMappingURL=telemetry.js.map