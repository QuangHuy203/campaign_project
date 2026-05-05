import {
  attachRecipientsToCampaign,
  getCampaignRecipientStats,
  markCampaignRecipientsSent,
} from '../../repos/campaignRecipientRepo';
import {
  deleteDraftCampaign,
  findCampaignByIdForUser,
  hasSchedulingConflict,
  insertCampaign,
  listCampaignsByUser,
  markCampaignSent,
  scheduleCampaign,
  updateDraftCampaign,
} from '../../repos/campaignRepo';
import { findRecipientsByEmails } from '../../repos/recipientRepo';
import {
  createCampaign,
  deleteCampaignDraft,
  getCampaignDetails,
  getCampaignStats,
  listCampaigns,
  scheduleCampaignAt,
  sendCampaign,
  updateCampaignDraft as updateCampaignDraftService,
} from '../../services/campaignService';

jest.mock('../../db/knex', () => ({
  db: {
    transaction: jest.fn(),
  },
}));
jest.mock('../../repos/campaignRepo');
jest.mock('../../repos/campaignRecipientRepo');
jest.mock('../../repos/recipientRepo');

const { db } = jest.requireMock('../../db/knex') as { db: { transaction: jest.Mock } };
const mockedListCampaignsByUser = listCampaignsByUser as jest.MockedFunction<typeof listCampaignsByUser>;
const mockedInsertCampaign = insertCampaign as jest.MockedFunction<typeof insertCampaign>;
const mockedFindCampaignByIdForUser = findCampaignByIdForUser as jest.MockedFunction<typeof findCampaignByIdForUser>;
const mockedUpdateDraftCampaign = updateDraftCampaign as jest.MockedFunction<typeof updateDraftCampaign>;
const mockedDeleteDraftCampaign = deleteDraftCampaign as jest.MockedFunction<typeof deleteDraftCampaign>;
const mockedHasSchedulingConflict = hasSchedulingConflict as jest.MockedFunction<typeof hasSchedulingConflict>;
const mockedScheduleCampaign = scheduleCampaign as jest.MockedFunction<typeof scheduleCampaign>;
const mockedMarkCampaignSent = markCampaignSent as jest.MockedFunction<typeof markCampaignSent>;
const mockedAttachRecipientsToCampaign = attachRecipientsToCampaign as jest.MockedFunction<typeof attachRecipientsToCampaign>;
const mockedGetCampaignRecipientStats = getCampaignRecipientStats as jest.MockedFunction<typeof getCampaignRecipientStats>;
const mockedMarkCampaignRecipientsSent = markCampaignRecipientsSent as jest.MockedFunction<typeof markCampaignRecipientsSent>;
const mockedFindRecipientsByEmails = findRecipientsByEmails as jest.MockedFunction<typeof findRecipientsByEmails>;

describe('campaignService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    db.transaction.mockImplementation(async (cb: (trx: unknown) => unknown) => cb({ trx: true }));
  });

  test('listCampaigns delegates to repo', async () => {
    mockedListCampaignsByUser.mockResolvedValue([{ id: 1 }] as never);
    const rows = await listCampaigns(10);
    expect(rows).toEqual([{ id: 1 }]);
    expect(mockedListCampaignsByUser).toHaveBeenCalled();
  });

  test('createCampaign throws VALIDATION_ERROR when some recipients are missing', async () => {
    mockedFindRecipientsByEmails.mockResolvedValue([{ id: 1, email: 'a@example.com' }] as never);

    await expect(
      createCampaign({
        userId: 10,
        name: 'C',
        subject: 'S',
        body: 'B',
        recipients: [
          { email: 'a@example.com', name: 'A' },
          { email: 'missing@example.com', name: 'Missing' },
        ],
      }),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Some recipients do not exist in the system',
    });
  });

  test('createCampaign inserts campaign and attaches recipients when all exist', async () => {
    mockedFindRecipientsByEmails.mockResolvedValue([
      { id: 1, email: 'a@example.com' },
      { id: 2, email: 'b@example.com' },
    ] as never);
    mockedInsertCampaign.mockResolvedValue({ id: 55 } as never);
    mockedAttachRecipientsToCampaign.mockResolvedValue(undefined as never);

    const campaign = await createCampaign({
      userId: 10,
      name: 'C',
      subject: 'S',
      body: 'B',
      recipients: [
        { email: 'a@example.com', name: 'A' },
        { email: 'b@example.com', name: 'B' },
      ],
    });

    expect(campaign).toEqual({ id: 55 });
    expect(mockedInsertCampaign).toHaveBeenCalled();
    expect(mockedAttachRecipientsToCampaign).toHaveBeenCalledWith(expect.anything(), {
      campaignId: 55,
      recipientIds: [1, 2],
    });
  });

  test('getCampaignDetails throws NOT_FOUND when campaign does not exist', async () => {
    mockedFindCampaignByIdForUser.mockResolvedValue(null);
    await expect(getCampaignDetails({ userId: 1, campaignId: 99 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Campaign not found',
    });
  });

  test('getCampaignDetails returns campaign and computed rates', async () => {
    mockedFindCampaignByIdForUser.mockResolvedValue({ id: 99 } as never);
    mockedGetCampaignRecipientStats.mockResolvedValue({ total: 4, sent: 2, failed: 1, opened: 1 });
    const result = await getCampaignDetails({ userId: 1, campaignId: 99 });
    expect(result.stats.open_rate).toBe(0.5);
    expect(result.stats.send_rate).toBe(0.5);
  });

  test('updateCampaignDraft maps missing and non-draft states', async () => {
    mockedUpdateDraftCampaign.mockResolvedValue(null);
    mockedFindCampaignByIdForUser.mockResolvedValueOnce(null);
    await expect(
      updateCampaignDraftService({ userId: 1, campaignId: 1, patch: { subject: 'x' } }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });

    mockedUpdateDraftCampaign.mockResolvedValue(null);
    mockedFindCampaignByIdForUser.mockResolvedValueOnce({ id: 1 } as never);
    await expect(
      updateCampaignDraftService({ userId: 1, campaignId: 1, patch: { subject: 'x' } }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  test('deleteCampaignDraft maps missing and non-draft states', async () => {
    mockedDeleteDraftCampaign.mockResolvedValue(0);
    mockedFindCampaignByIdForUser.mockResolvedValueOnce(null);
    await expect(deleteCampaignDraft({ userId: 1, campaignId: 1 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });

    mockedDeleteDraftCampaign.mockResolvedValue(0);
    mockedFindCampaignByIdForUser.mockResolvedValueOnce({ id: 1 } as never);
    await expect(deleteCampaignDraft({ userId: 1, campaignId: 1 })).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  test('scheduleCampaignAt validates datetime, future timestamp and conflict', async () => {
    await expect(
      scheduleCampaignAt({ userId: 1, campaignId: 1, scheduledAt: new Date('invalid-date') }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });

    await expect(
      scheduleCampaignAt({ userId: 1, campaignId: 1, scheduledAt: new Date(Date.now() - 1000) }),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });

    mockedHasSchedulingConflict.mockResolvedValue(true);
    await expect(
      scheduleCampaignAt({ userId: 1, campaignId: 1, scheduledAt: new Date(Date.now() + 1000 * 60) }),
    ).rejects.toMatchObject({ code: 'CONFLICT', message: 'Another campaign is already scheduled at this time' });
  });

  test('scheduleCampaignAt maps not found and sent-state conflict', async () => {
    mockedHasSchedulingConflict.mockResolvedValue(false);
    mockedScheduleCampaign.mockResolvedValue(null);
    mockedFindCampaignByIdForUser.mockResolvedValueOnce(null);
    await expect(
      scheduleCampaignAt({ userId: 1, campaignId: 1, scheduledAt: new Date(Date.now() + 1000 * 60) }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });

    mockedHasSchedulingConflict.mockResolvedValue(false);
    mockedScheduleCampaign.mockResolvedValue(null);
    mockedFindCampaignByIdForUser.mockResolvedValueOnce({ id: 1 } as never);
    await expect(
      scheduleCampaignAt({ userId: 1, campaignId: 1, scheduledAt: new Date(Date.now() + 1000 * 60) }),
    ).rejects.toMatchObject({ code: 'CONFLICT', message: 'Cannot schedule a sent campaign' });
  });

  test('sendCampaign throws when missing/sent and returns updated campaign when successful', async () => {
    mockedFindCampaignByIdForUser.mockResolvedValueOnce(null);
    await expect(sendCampaign({ userId: 1, campaignId: 1 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });

    mockedFindCampaignByIdForUser.mockResolvedValueOnce({ status: 'sent' } as never);
    await expect(sendCampaign({ userId: 1, campaignId: 1 })).rejects.toMatchObject({
      code: 'CONFLICT',
      message: 'Campaign is already sent',
    });

    mockedFindCampaignByIdForUser.mockResolvedValueOnce({ status: 'draft' } as never);
    mockedMarkCampaignRecipientsSent.mockResolvedValue(2);
    mockedMarkCampaignSent.mockResolvedValue({ id: 1, status: 'sent' } as never);
    const result = await sendCampaign({ userId: 1, campaignId: 1 });
    expect(result).toEqual({ id: 1, status: 'sent' });
  });

  test('getCampaignStats returns computed rates and throws when campaign missing', async () => {
    mockedFindCampaignByIdForUser.mockResolvedValueOnce(null);
    await expect(getCampaignStats({ userId: 1, campaignId: 1 })).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });

    mockedFindCampaignByIdForUser.mockResolvedValueOnce({ id: 1 } as never);
    mockedGetCampaignRecipientStats.mockResolvedValue({ total: 5, sent: 4, failed: 1, opened: 2 });
    const stats = await getCampaignStats({ userId: 1, campaignId: 1 });
    expect(stats.open_rate).toBe(0.5);
    expect(stats.send_rate).toBe(0.8);
  });
});
