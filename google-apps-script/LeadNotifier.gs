/**
 * Hisab Sutra — Notifications Web App (Google Apps Script, Free Account)
 * Handles:
 *   1. action = "lead"              -> Admin Email + Telegram + Client Confirmation Email
 *   2. action = "chat_started"      -> Admin Email + Telegram (only when a new chat starts)
 *   3. action = "meeting_requested" -> Admin Email + Telegram + Client Confirmation Email
 *
 * Script Properties required (Project Settings -> Script Properties):
 *   - TELEGRAM_BOT_TOKEN : Bot token from @BotFather
 *   - TELEGRAM_CHAT_ID   : Your Telegram user or group chat ID
 *   - ADMIN_EMAIL        : Email address where you receive alerts (e.g. iambikashacca@gmail.com)
 *   - REPLY_TO_EMAIL     : Optional business reply-to email shown on client confirmation emails
 */

var ALLOWED_COUNTRIES = ['UK', 'Europe', 'Gulf', 'Other'];
var ALLOWED_SERVICES = ['Accounting', 'Bookkeeping', 'Data Entry', 'Full Finance Pod', 'Other'];
var ALLOWED_VOLUMES = [
  'Under 100 transactions',
  '100 - 500 transactions',
  '500 - 2,000 transactions',
  '2,000+ transactions',
];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'Missing request body' });
    }

    var raw = e.postData.contents;
    if (raw.length > 15000) {
      return jsonResponse({ ok: false, error: 'Payload too large' });
    }

    var data = JSON.parse(raw);

    // Silent honeypot check across all actions
    if (data.companyWebsite && String(data.companyWebsite).trim().length > 0) {
      return jsonResponse({ ok: true, ignored: true });
    }

    var action = cleanText(data.action || 'lead', 40);

    if (action === 'lead') {
      return handleLead(data);
    }
    if (action === 'chat_started') {
      return handleChatStarted(data);
    }
    if (action === 'meeting_requested') {
      return handleMeetingRequested(data);
    }

    return jsonResponse({ ok: false, error: 'Unknown action' });
  } catch (err) {
    return jsonResponse({ ok: false, error: 'Server processing error' });
  }
}

function handleLead(data) {
  var name = cleanText(data.name, 120);
  var workEmail = cleanText(data.workEmail, 160).toLowerCase();
  var company = cleanText(data.company, 160);
  var country = cleanText(data.country, 40);
  var serviceNeeded = cleanText(data.serviceNeeded, 60);
  var monthlyVolume = cleanText(data.monthlyVolume, 80);
  var message = cleanText(data.message, 2000);
  var leadId = cleanText(data.leadId, 128);
  var utmSource = cleanText(data.utmSource, 120);
  var utmMedium = cleanText(data.utmMedium, 120);
  var utmCampaign = cleanText(data.utmCampaign, 120);
  var referrer = cleanText(data.referrer, 500);
  var landingPage = cleanText(data.landingPage, 300);
  var consentAccepted = data.consentAccepted === true;

  if (name.length < 2) return jsonResponse({ ok: false, error: 'Invalid name' });
  if (!isValidEmail(workEmail)) return jsonResponse({ ok: false, error: 'Invalid email' });
  if (company.length < 1) return jsonResponse({ ok: false, error: 'Invalid company' });
  if (ALLOWED_COUNTRIES.indexOf(country) === -1) return jsonResponse({ ok: false, error: 'Invalid country' });
  if (ALLOWED_SERVICES.indexOf(serviceNeeded) === -1) return jsonResponse({ ok: false, error: 'Invalid service' });
  if (ALLOWED_VOLUMES.indexOf(monthlyVolume) === -1) return jsonResponse({ ok: false, error: 'Invalid volume' });
  if (!consentAccepted) return jsonResponse({ ok: false, error: 'Consent required' });

  if (isRateLimited('lead_' + workEmail)) {
    return jsonResponse({ ok: false, error: 'Rate limit exceeded' });
  }

  var props = PropertiesService.getScriptProperties();
  var adminEmail = props.getProperty('ADMIN_EMAIL');
  var replyToEmail = props.getProperty('REPLY_TO_EMAIL') || adminEmail || '';
  var campaignSummary = [utmSource, utmMedium, utmCampaign].filter(Boolean).join(' / ') || 'Direct / Organic';

  if (adminEmail) {
    MailApp.sendEmail({
      to: adminEmail,
      replyTo: workEmail,
      subject: '[Hisab Sutra Lead] ' + company + ' — ' + serviceNeeded + ' (' + country + ')',
      body: [
        'New quote request received on Hisab Sutra:',
        '',
        'Lead ID: ' + (leadId || 'N/A'),
        'Name: ' + name,
        'Work Email: ' + workEmail,
        'Company: ' + company,
        'Region: ' + country,
        'Service Needed: ' + serviceNeeded,
        'Monthly Volume: ' + monthlyVolume,
        'Campaign Source: ' + campaignSummary,
        'Referrer: ' + (referrer || 'Direct'),
        'Landing Page: ' + (landingPage || '/'),
        '',
        'Message:',
        message || '(No additional message provided)',
      ].join('\n'),
    });
  }

  sendTelegram([
    '<b>New Lead — Hisab Sutra</b>',
    '<b>Name:</b> ' + escapeHtml(name),
    '<b>Email:</b> ' + escapeHtml(workEmail),
    '<b>Company:</b> ' + escapeHtml(company),
    '<b>Region:</b> ' + escapeHtml(country),
    '<b>Service:</b> ' + escapeHtml(serviceNeeded),
    '<b>Volume:</b> ' + escapeHtml(monthlyVolume),
    '<b>Campaign:</b> ' + escapeHtml(campaignSummary),
    '<b>Referrer:</b> ' + escapeHtml(referrer || 'Direct'),
    '<b>Message:</b> ' + escapeHtml(message || 'None'),
  ]);

  var clientMailOptions = {
    to: workEmail,
    subject: 'We received your inquiry — Hisab Sutra',
    body: [
      'Hello ' + name + ',',
      '',
      'Thank you for contacting Hisab Sutra regarding ' + serviceNeeded + ' for ' + company + '.',
      '',
      'Summary of your request:',
      '- Region: ' + country,
      '- Estimated Volume: ' + monthlyVolume,
      '- Reference ID: ' + (leadId || 'Submitted'),
      '',
      'An ACCA-qualified engagement lead from our Kathmandu team will review your details and reply within one business day.',
      '',
      'If you wish to share supporting documents or sample statements securely, please reply directly to this email.',
      '',
      'Warm regards,',
      'Hisab Sutra',
      'Formula for Next Generational Books',
    ].join('\n'),
  };
  if (replyToEmail) clientMailOptions.replyTo = replyToEmail;
  MailApp.sendEmail(clientMailOptions);

  return jsonResponse({ ok: true });
}

function handleChatStarted(data) {
  var visitorName = cleanText(data.visitorName, 100);
  var visitorEmail = cleanText(data.visitorEmail, 160).toLowerCase();
  var conversationId = cleanText(data.conversationId, 128);
  var firstMessage = cleanText(data.firstMessage, 1500);
  var utmSource = cleanText(data.utmSource, 120);
  var utmMedium = cleanText(data.utmMedium, 120);
  var utmCampaign = cleanText(data.utmCampaign, 120);
  var landingPage = cleanText(data.landingPage, 300);

  if (visitorName.length < 2) return jsonResponse({ ok: false, error: 'Invalid name' });
  if (!isValidEmail(visitorEmail)) return jsonResponse({ ok: false, error: 'Invalid email' });

  if (isRateLimited('chat_' + visitorEmail)) {
    return jsonResponse({ ok: false, error: 'Rate limit exceeded' });
  }

  var props = PropertiesService.getScriptProperties();
  var adminEmail = props.getProperty('ADMIN_EMAIL');
  var campaignSummary = [utmSource, utmMedium, utmCampaign].filter(Boolean).join(' / ') || 'Direct / Organic';

  if (adminEmail) {
    MailApp.sendEmail({
      to: adminEmail,
      replyTo: visitorEmail,
      subject: '[Hisab Sutra Live Chat] New chat started by ' + visitorName,
      body: [
        'A visitor started a live chat on Hisab Sutra:',
        '',
        'Visitor: ' + visitorName + ' (' + visitorEmail + ')',
        'Conversation ID: ' + (conversationId || 'N/A'),
        'Campaign Source: ' + campaignSummary,
        'Landing Page: ' + (landingPage || '/'),
        '',
        'Opening Message:',
        firstMessage || '(Visitor opened chat without an opening message yet)',
        '',
        'Open your /admin Live Chat inbox to reply in real time.',
      ].join('\n'),
    });
  }

  sendTelegram([
    '<b>New Live Chat — Hisab Sutra</b>',
    '<b>Visitor:</b> ' + escapeHtml(visitorName),
    '<b>Email:</b> ' + escapeHtml(visitorEmail),
    '<b>Campaign:</b> ' + escapeHtml(campaignSummary),
    '<b>Message:</b> ' + escapeHtml(firstMessage || '(Chat started)'),
  ]);

  return jsonResponse({ ok: true });
}

function handleMeetingRequested(data) {
  var visitorName = cleanText(data.visitorName, 100);
  var visitorEmail = cleanText(data.visitorEmail, 160).toLowerCase();
  var preferredDate = cleanText(data.preferredDate, 40);
  var preferredTime = cleanText(data.preferredTime, 40);
  var timezone = cleanText(data.timezone, 80);
  var topic = cleanText(data.topic, 500);
  var requestId = cleanText(data.requestId, 128);
  var utmSource = cleanText(data.utmSource, 120);
  var utmMedium = cleanText(data.utmMedium, 120);
  var utmCampaign = cleanText(data.utmCampaign, 120);

  if (visitorName.length < 2) return jsonResponse({ ok: false, error: 'Invalid name' });
  if (!isValidEmail(visitorEmail)) return jsonResponse({ ok: false, error: 'Invalid email' });
  if (preferredDate.length < 4 || preferredTime.length < 2 || timezone.length < 2) {
    return jsonResponse({ ok: false, error: 'Missing date, time, or timezone' });
  }

  if (isRateLimited('meeting_' + visitorEmail)) {
    return jsonResponse({ ok: false, error: 'Rate limit exceeded' });
  }

  var props = PropertiesService.getScriptProperties();
  var adminEmail = props.getProperty('ADMIN_EMAIL');
  var replyToEmail = props.getProperty('REPLY_TO_EMAIL') || adminEmail || '';
  var campaignSummary = [utmSource, utmMedium, utmCampaign].filter(Boolean).join(' / ') || 'Direct / Organic';

  if (adminEmail) {
    MailApp.sendEmail({
      to: adminEmail,
      replyTo: visitorEmail,
      subject: '[Hisab Sutra Meeting Request] ' + visitorName + ' — ' + preferredDate + ' ' + preferredTime,
      body: [
        'A visitor requested a meeting from live chat:',
        '',
        'Request ID: ' + (requestId || 'N/A'),
        'Name: ' + visitorName,
        'Email: ' + visitorEmail,
        'Preferred Date: ' + preferredDate,
        'Preferred Time: ' + preferredTime,
        'Timezone: ' + timezone,
        'Campaign Source: ' + campaignSummary,
        '',
        'Topic / Notes:',
        topic || 'Discovery call',
      ].join('\n'),
    });
  }

  sendTelegram([
    '<b>Meeting Request — Hisab Sutra</b>',
    '<b>Visitor:</b> ' + escapeHtml(visitorName) + ' (' + escapeHtml(visitorEmail) + ')',
    '<b>Date:</b> ' + escapeHtml(preferredDate),
    '<b>Time:</b> ' + escapeHtml(preferredTime) + ' (' + escapeHtml(timezone) + ')',
    '<b>Campaign:</b> ' + escapeHtml(campaignSummary),
    '<b>Topic:</b> ' + escapeHtml(topic || 'Discovery call'),
  ]);

  var clientMail = {
    to: visitorEmail,
    subject: 'Meeting request received — Hisab Sutra',
    body: [
      'Hello ' + visitorName + ',',
      '',
      'We received your request to schedule a call with Hisab Sutra.',
      '',
      'Requested Slot:',
      '- Date: ' + preferredDate,
      '- Time: ' + preferredTime + ' (' + timezone + ')',
      '- Topic: ' + (topic || 'Discovery call'),
      '',
      'We will confirm the calendar invite shortly via email.',
      '',
      'Warm regards,',
      'Hisab Sutra',
    ].join('\n'),
  };
  if (replyToEmail) clientMail.replyTo = replyToEmail;
  MailApp.sendEmail(clientMail);

  return jsonResponse({ ok: true });
}

function sendTelegram(lines) {
  var props = PropertiesService.getScriptProperties();
  var telegramToken = (props.getProperty('TELEGRAM_BOT_TOKEN') || '').trim();
  var telegramChatId = (props.getProperty('TELEGRAM_CHAT_ID') || '').trim();

  if (!telegramToken || !telegramChatId) return;

  UrlFetchApp.fetch('https://api.telegram.org/bot' + telegramToken + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      chat_id: telegramChatId,
      text: lines.join('\n'),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanText(value, maxLen) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[\r\n]+/g, ' ').trim().slice(0, maxLen);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isRateLimited(scopeKey) {
  var cache = CacheService.getScriptCache();
  var globalKey = 'hs_global_count';
  var globalCount = Number(cache.get(globalKey) || '0');
  if (globalCount >= 30) return true;
  cache.put(globalKey, String(globalCount + 1), 600);

  var hash = Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, scopeKey)
  ).slice(0, 32);
  var key = 'hs_rl_' + hash;
  var count = Number(cache.get(key) || '0');
  if (count >= 4) return true;
  cache.put(key, String(count + 1), 3600);

  return false;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function testTelegram() {
  var props = PropertiesService.getScriptProperties();
  var token = (props.getProperty('TELEGRAM_BOT_TOKEN') || '').trim();
  var chatId = (props.getProperty('TELEGRAM_CHAT_ID') || '').trim();

  if (!token || !chatId) {
    Logger.log('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in Script Properties.');
    return;
  }

  var response = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      chat_id: chatId,
      text: 'Hello from Hisab Sutra! Telegram alerts are working.',
    }),
  });

  Logger.log('Telegram reply: ' + response.getContentText());
}
