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
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; line-height: 1.6;">
            <h2 style="color: #166534; margin-bottom: 24px;">Khôi phục mật khẩu quản trị</h2>
            <p>Chào <strong>${notification.displayName}</strong>,</p>
            <p>Hệ thống vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên nền tảng Nice Land.</p>
            <p>Vui lòng bấm vào nút bên dưới để thiết lập lại mật khẩu mới:</p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${notification.resetUrl}" style="background-color: #166534; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Thiết lập lại mật khẩu</a>
            </div>
            <p style="font-size: 14px; color: #52525b;">
              <em>⏳ Lưu ý: Liên kết bảo mật này sẽ hết hạn sau ${notification.expiresInMinutes} phút và chỉ có thể sử dụng một lần duy nhất.</em>
            </p>
            <p style="font-size: 14px; color: #52525b;">
              Nếu bạn không yêu cầu thay đổi mật khẩu, xin hãy bỏ qua email này. Tài khoản của bạn vẫn được bảo vệ an toàn.
            </p>
            <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 32px 0;" />
            <p style="font-size: 12px; color: #a1a1aa; text-align: center;">
              Đội ngũ Hỗ trợ Nice Land<br />
              Nếu nút bấm không hoạt động, bạn có thể copy đường dẫn sau vào trình duyệt:<br />
              <a href="${notification.resetUrl}" style="color: #166534; word-break: break-all;">${notification.resetUrl}</a>
            </p>
          </div>
        `,
        text: [
          `Chào ${notification.displayName},`,
          "",
          "Hệ thống vừa nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên nền tảng Nice Land.",
          `Vui lòng truy cập đường dẫn sau để thiết lập lại mật khẩu mới: ${notification.resetUrl}`,
          "",
          `⏳ Lưu ý: Liên kết bảo mật này sẽ hết hạn sau ${notification.expiresInMinutes} phút và chỉ có thể sử dụng một lần duy nhất.`,
          "Nếu bạn không yêu cầu thay đổi mật khẩu, xin hãy bỏ qua email này. Tài khoản của bạn vẫn được bảo vệ an toàn.",
          "",
          "Đội ngũ Hỗ trợ Nice Land"
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend returned ${response.status}`);
    }
  }
}
