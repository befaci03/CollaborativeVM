"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectConfig = void 0;
var jsonc_parser_1 = require("jsonc-parser");
var fs = require("fs");
var ProjectConfig = /** @class */ (function () {
    function ProjectConfig() {
    }
    ProjectConfig.prototype.loadConfig = function (fp) {
        var CONFIG = (0, jsonc_parser_1.parse)(fs.readFileSync(fp, { encoding: 'utf-8' }));
        return CONFIG;
    };
    return ProjectConfig;
}());
exports.ProjectConfig = ProjectConfig;
