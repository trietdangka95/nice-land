export interface PasswordResetNotification {
  recipient: string;
  displayName: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface PasswordResetNotifier {
  notify(notification: PasswordResetNotification): Promise<void>;
}

export class ResendPasswordResetNotifier implements PasswordResetNotifier {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}

  async notify(notification: PasswordResetNotification) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: [notification.recipient],
        subject: "Đặt lại mật khẩu Nice Land",
        text: [
          `Xin chào ${notification.displayName},`,
          "",
          "Bạn vừa yêu cầu đặt lại mật khẩu quản trị.",
          `Mở liên kết sau để tạo mật khẩu mới: ${notification.resetUrl}`,
          "",
          `Liên kết có hiệu lực trong ${notification.expiresInMinutes} phút và chỉ sử dụng được một lần.`,
          "Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.",
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend returned ${response.status}`);
    }
  }
}
