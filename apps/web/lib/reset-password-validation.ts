export function validateResetPasswordInput(input: {
  token: string;
  password: string;
  confirmation: string;
}) {
  if (!input.token.trim()) {
    return "Liên kết đặt lại mật khẩu không hợp lệ.";
  }

  if (input.password.length < 8) {
    return "Mật khẩu mới phải có ít nhất 8 ký tự.";
  }

  if (input.confirmation.length < 8) {
    return "Mật khẩu xác nhận phải có ít nhất 8 ký tự.";
  }

  if (input.password !== input.confirmation) {
    return "Mật khẩu xác nhận chưa trùng khớp.";
  }

  return null;
}
