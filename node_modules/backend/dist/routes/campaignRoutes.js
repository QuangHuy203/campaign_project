"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignRoutes = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const campaignController = __importStar(require("../controllers/campaignController"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
exports.campaignRoutes = (0, express_1.Router)();
// All campaign endpoints are scoped to the authenticated user (no public campaign access).
exports.campaignRoutes.use(authMiddleware_1.authMiddleware);
exports.campaignRoutes.get('/', (0, asyncHandler_1.asyncHandler)(campaignController.list));
exports.campaignRoutes.post('/', (0, asyncHandler_1.asyncHandler)(campaignController.create));
exports.campaignRoutes.get('/:id', (0, asyncHandler_1.asyncHandler)(campaignController.details));
exports.campaignRoutes.patch('/:id', (0, asyncHandler_1.asyncHandler)(campaignController.update));
exports.campaignRoutes.delete('/:id', (0, asyncHandler_1.asyncHandler)(campaignController.remove));
exports.campaignRoutes.post('/:id/schedule', (0, asyncHandler_1.asyncHandler)(campaignController.schedule));
exports.campaignRoutes.post('/:id/send', (0, asyncHandler_1.asyncHandler)(campaignController.send));
exports.campaignRoutes.get('/:id/stats', (0, asyncHandler_1.asyncHandler)(campaignController.stats));
