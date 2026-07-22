// AA2000 Connect — External Quotation App Webhook Service
// Integration-ready handler for external quoting applications (Supply Only / Supply & Install)

export type QuotationEventType = 'QUOTE_SENT' | 'QUOTE_VIEWED' | 'QUOTE_NEGOTIATING' | 'QUOTE_ACCEPTED' | 'QUOTE_DECLINED';

export interface QuotationWebhookPayload {
  quotationId: string;
  eventType: QuotationEventType;
  dealId?: string;
  companyName?: string;
  contactEmail?: string;
  quotationScope?: 'supply_only' | 'supply_install' | 'all';
  amount?: number;
  assignedTo?: string;
  declineReason?: string;
  timestamp?: string;
}

export interface WebhookConfig {
  endpointUrl: string;
  apiKey: string;
  webhookSecret: string;
  enabled: boolean;
  autoQualifyHighScore: boolean;
  autoMoveOnQuoteSent: boolean;
  autoMoveOnHotSignal: boolean;
  autoWinOnQuoteAccepted: boolean;
}

export const DEFAULT_WEBHOOK_CONFIG: WebhookConfig = {
  endpointUrl: 'https://aa2000-crm-api.connect.ph/v1/webhooks/quotation-events',
  apiKey: 'aa2000_live_sec_99481928471928374',
  webhookSecret: 'whsec_aa2000_quotation_app_prod_key',
  enabled: true,
  autoQualifyHighScore: true,
  autoMoveOnQuoteSent: true,
  autoMoveOnHotSignal: true,
  autoWinOnQuoteAccepted: true,
};

export function getSampleCurlSnippet(config: WebhookConfig = DEFAULT_WEBHOOK_CONFIG): string {
  return `curl -X POST "${config.endpointUrl}" \\
  -H "Authorization: Bearer ${config.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "quotationId": "QT-2026-0891",
    "eventType": "QUOTE_SENT",
    "companyName": "MegaPlaza Corp",
    "contactEmail": "michael.tan@megaplaza.com",
    "quotationScope": "supply_install",
    "amount": 450000,
    "assignedTo": "Project Engineering Rep"
  }'`;
}

export function getSampleJsSnippet(config: WebhookConfig = DEFAULT_WEBHOOK_CONFIG): string {
  return `// Execute in your custom Quotation App when a quote is dispatched
async function notifyCRMQuotationSent(quoteData) {
  const response = await fetch("${config.endpointUrl}", {
    method: "POST",
    headers: {
      "Authorization": "Bearer ${config.apiKey}",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      quotationId: quoteData.id,
      eventType: "QUOTE_SENT",
      companyName: quoteData.clientCompany,
      contactEmail: quoteData.clientEmail,
      quotationScope: quoteData.scope, // 'supply_only' or 'supply_install'
      amount: quoteData.totalPriceAmount,
      assignedTo: quoteData.salesRepName || (quoteData.scope === 'supply_only' ? 'Hardware Sales Rep' : 'Project Engineering Rep')
    })
  });
  return response.json();
}`;
}
