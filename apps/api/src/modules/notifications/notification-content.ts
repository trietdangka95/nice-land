import type { RequestStatus } from "@nice-land/contracts";

export function buildLeadCreatedNotification(input: {
  siteName: string;
  postTitle: string;
  leadName: string;
  leadId: string;
}) {
  return {
    title: "Lead mới từ website",
    body: `${input.leadName} vừa quan tâm tin "${input.postTitle}" trên ${input.siteName}.`,
    link: `/admin/leads?highlight=${encodeURIComponent(input.leadId)}`,
    payload: {
      leadName: input.leadName,
      postTitle: input.postTitle,
    },
  };
}

export function buildContactRequestCreatedNotification(input: {
  contactName: string;
  source: "LANDING_PAGE" | "TENANT_WEBSITE";
  themePreference: "warm" | "cold";
  contactRequestId: string;
}) {
  return {
    title:
      input.source === "LANDING_PAGE"
        ? "Liên hệ mới từ landing page"
        : "Liên hệ mới từ website tenant",
    body: `${input.contactName} vừa gửi yêu cầu tư vấn (${input.themePreference} theme).`,
    link: `/superadmin/contacts?highlightContact=${encodeURIComponent(input.contactRequestId)}`,
    payload: {
      contactName: input.contactName,
      source: input.source,
      themePreference: input.themePreference,
    },
  };
}

export function buildRenewalRequestCreatedNotification(renewalRequestId: string) {
  return {
    title: "Yêu cầu gia hạn mới",
    body: "Một website vừa gửi yêu cầu gia hạn gói dịch vụ.",
    link: `/superadmin/contacts?highlightRenewal=${encodeURIComponent(renewalRequestId)}`,
    payload: {},
  };
}

export function buildRenewalRequestUpdatedNotification(
  status: RequestStatus,
  renewalRequestId: string,
) {
  const statusLabel = {
    NEW: "mới",
    IN_PROGRESS: "đang xử lý",
    APPROVED: "đã được duyệt",
    REJECTED: "đã bị từ chối",
    DONE: "đã hoàn tất",
  } satisfies Record<RequestStatus, string>;

  return {
    title: "Cập nhật yêu cầu gia hạn",
    body: `Yêu cầu gia hạn của bạn ${statusLabel[status]}.`,
    link: `/admin/subscription?highlightRenewal=${encodeURIComponent(renewalRequestId)}`,
    payload: { status },
  };
}
