import { describe, expect, it } from "vitest";
import { validateResetPasswordInput } from "@/lib/reset-password-validation";

describe("validateResetPasswordInput", () => {
  it("rejects an empty token", () => {
    expect(
      validateResetPasswordInput({
        token: "",
        password: "NewPassword123!",
        confirmation: "NewPassword123!",
      }),
    ).toBe("Liên kết đặt lại mật khẩu không hợp lệ.");
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(
      validateResetPasswordInput({
        token: "valid-token-value",
        password: "short",
        confirmation: "short",
      }),
    ).toBe("Mật khẩu mới phải có ít nhất 8 ký tự.");
  });

  it("rejects a short confirmation", () => {
    expect(
      validateResetPasswordInput({
        token: "valid-token-value",
        password: "NewPassword123!",
        confirmation: "short",
      }),
    ).toBe("Mật khẩu xác nhận phải có ít nhất 8 ký tự.");
  });

  it("rejects mismatched confirmation", () => {
    expect(
      validateResetPasswordInput({
        token: "valid-token-value",
        password: "NewPassword123!",
        confirmation: "OtherPassword123!",
      }),
    ).toBe("Mật khẩu xác nhận chưa trùng khớp.");
  });

  it("accepts valid input", () => {
    expect(
      validateResetPasswordInput({
        token: "valid-token-value",
        password: "NewPassword123!",
        confirmation: "NewPassword123!",
      }),
    ).toBeNull();
  });
});
