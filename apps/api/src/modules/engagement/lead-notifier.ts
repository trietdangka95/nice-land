export interface LeadNotification {
  recipient: string;
  siteName: string;
  postTitle: string;
  leadName: string;
  leadPhone: string;
  leadEmail?: string;
  message?: string;
}

export interface LeadNotifier {
  notify(notification: LeadNotification): Promise<void>;
}

export class ResendLeadNotifier implements LeadNotifier {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async notify(notification: LeadNotification) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [notification.recipient],
        subject: `Lead mới cho ${notification.postTitle}`,
        text: [
          `Website: ${notification.siteName}`,
          `Tin đăng: ${notification.postTitle}`,
          `Khách hàng: ${notification.leadName}`,
          `Điện thoại: ${notification.leadPhone}`,
          notification.leadEmail
            ? `Email: ${notification.leadEmail}`
            : undefined,
          notification.message
            ? `Nội dung: ${notification.message}`
            : undefined,
        ]
          .filter(Boolean)
          .join("\n"),
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend returned ${response.status}`);
    }
  }
}
