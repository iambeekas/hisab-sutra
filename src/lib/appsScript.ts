export interface AppsScriptLeadPayload {
  leadId: string;
  name: string;
  workEmail: string;
  company: string;
  country: string;
  serviceNeeded: string;
  monthlyVolume: string;
  message: string;
  consentAccepted: boolean;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrer: string;
  landingPage: string;
  companyWebsite: string;
}

export interface AppsScriptChatStartedPayload {
  conversationId: string;
  visitorName: string;
  visitorEmail: string;
  firstMessage: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  landingPage: string;
}

export interface AppsScriptMeetingPayload {
  requestId: string;
  visitorName: string;
  visitorEmail: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  topic: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

const DEFAULT_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzXUd6O1B3belvtFdjqcOuSh6CFqSu21ottxFUHGr4zTgtZ6Hap36l1wUo4Q90MCk8/exec';

function getWebhookUrl(): string {
  const envUrl = import.meta.env.VITE_APPS_SCRIPT_WEBHOOK_URL as string | undefined;
  return envUrl &&
    !envUrl.includes('YOUR_DEPLOYMENT_ID') &&
    envUrl.startsWith('https://script.google.com/')
    ? envUrl
    : DEFAULT_APPS_SCRIPT_URL;
}

async function postToAppsScript(body: Record<string, unknown>): Promise<void> {
  try {
    await fetch(getWebhookUrl(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.warn('Apps Script webhook failed:', err);
  }
}

export async function notifyLeadViaAppsScript(payload: AppsScriptLeadPayload): Promise<void> {
  await postToAppsScript({
    action: 'lead',
    ...payload,
  });
}

export async function notifyChatStartedViaAppsScript(
  payload: AppsScriptChatStartedPayload
): Promise<void> {
  await postToAppsScript({
    action: 'chat_started',
    ...payload,
  });
}

export async function notifyMeetingRequestedViaAppsScript(
  payload: AppsScriptMeetingPayload
): Promise<void> {
  await postToAppsScript({
    action: 'meeting_requested',
    ...payload,
  });
}
