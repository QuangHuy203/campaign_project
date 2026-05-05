"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.create = create;
exports.details = details;
exports.update = update;
exports.remove = remove;
exports.schedule = schedule;
exports.send = send;
exports.stats = stats;
const campaignValidators_1 = require("../validators/campaignValidators");
const campaignService_1 = require("../services/campaignService");
function requireUserId(req) {
    if (!req.user)
        throw new Error('authMiddleware must run before controller');
    return req.user.id;
}
async function list(req, res) {
    const userId = requireUserId(req);
    const campaigns = await (0, campaignService_1.listCampaigns)(userId);
    return res.status(200).json({ data: campaigns });
}
/** Create a new draft campaign for the signed-in user (drafts are the only editable state). */
async function create(req, res) {
    const userId = requireUserId(req);
    const body = campaignValidators_1.createCampaignSchema.parse(req.body);
    const campaign = await (0, campaignService_1.createCampaign)({ userId, ...body });
    return res.status(201).json({ data: campaign });
}
async function details(req, res) {
    const userId = requireUserId(req);
    const { id } = campaignValidators_1.idParamSchema.parse(req.params);
    const result = await (0, campaignService_1.getCampaignDetails)({ userId, campaignId: id });
    return res.status(200).json({ data: result });
}
async function update(req, res) {
    const userId = requireUserId(req);
    const { id } = campaignValidators_1.idParamSchema.parse(req.params);
    const patch = campaignValidators_1.updateCampaignSchema.parse(req.body);
    const campaign = await (0, campaignService_1.updateCampaignDraft)({ userId, campaignId: id, patch });
    return res.status(200).json({ data: campaign });
}
async function remove(req, res) {
    const userId = requireUserId(req);
    const { id } = campaignValidators_1.idParamSchema.parse(req.params);
    await (0, campaignService_1.deleteCampaignDraft)({ userId, campaignId: id });
    return res.status(204).send();
}
async function schedule(req, res) {
    const userId = requireUserId(req);
    const { id } = campaignValidators_1.idParamSchema.parse(req.params);
    const body = campaignValidators_1.scheduleCampaignSchema.parse(req.body);
    const scheduledAt = new Date(body.scheduled_at);
    const campaign = await (0, campaignService_1.scheduleCampaignAt)({ userId, campaignId: id, scheduledAt });
    return res.status(200).json({ data: campaign });
}
/** “Send now” is an explicit user action; the service enforces one-way transition to protect reporting integrity. */
async function send(req, res) {
    const userId = requireUserId(req);
    const { id } = campaignValidators_1.idParamSchema.parse(req.params);
    const campaign = await (0, campaignService_1.sendCampaign)({ userId, campaignId: id });
    return res.status(200).json({ data: campaign });
}
async function stats(req, res) {
    const userId = requireUserId(req);
    const { id } = campaignValidators_1.idParamSchema.parse(req.params);
    const result = await (0, campaignService_1.getCampaignStats)({ userId, campaignId: id });
    return res.status(200).json({ data: result });
}
