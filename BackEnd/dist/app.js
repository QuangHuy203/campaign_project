"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const authRoutes_1 = require("./routes/authRoutes");
const campaignRoutes_1 = require("./routes/campaignRoutes");
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
function createApp() {
    const app = (0, express_1.default)();
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        if (req.method === 'OPTIONS') {
            return res.status(204).send();
        }
        return next();
    });
    app.use(express_1.default.json({ limit: '1mb' }));
    app.get('/health', (_req, res) => res.status(200).json({ data: { ok: true } }));
    app.use('/auth', authRoutes_1.authRoutes);
    app.use('/campaigns', campaignRoutes_1.campaignRoutes);
    app.use(errorMiddleware_1.errorMiddleware);
    return app;
}
