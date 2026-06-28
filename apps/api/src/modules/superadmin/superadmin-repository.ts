import type {
  AuditLogItem,
  RenewalResolutionInput,
  SubscriptionPlan,
  SubscriptionPlanInput,
  SuperAdminContact,
  SuperAdminRenewalRequest,
  SuperAdminSite,
  SuperAdminSiteCreate,
  SuperAdminSiteListQuery,
  SuperAdminSiteUpdate,
  SystemSetting,
  SystemSettingInput,
} from "@nice-land/contracts";

export interface SuperAdminRepository {
  listSites(input: SuperAdminSiteListQuery): Promise<{ items: SuperAdminSite[]; total: number }>;
  findSite(id: string): Promise<SuperAdminSite | null>;
  createSite(input: SuperAdminSiteCreate, actorId: string): Promise<SuperAdminSite>;
  updateSite(id: string, input: SuperAdminSiteUpdate, actorId: string): Promise<SuperAdminSite | null>;
  setSiteActive(id: string, isActive: boolean, actorId: string): Promise<boolean>;
  resetAdminPassword(id: string, actorId: string): Promise<string | null>;
  setAdminActive(id: string, isActive: boolean, actorId: string): Promise<boolean>;
  listPlans(): Promise<SubscriptionPlan[]>;
  createPlan(input: SubscriptionPlanInput, actorId: string): Promise<SubscriptionPlan>;
  updatePlan(id: string, input: SubscriptionPlanInput, actorId: string): Promise<SubscriptionPlan | null>;
  deletePlan(id: string, actorId: string): Promise<boolean>;
  listRenewals(): Promise<SuperAdminRenewalRequest[]>;
  resolveRenewal(id: string, input: RenewalResolutionInput, actorId: string): Promise<SuperAdminRenewalRequest | null>;
  listContacts(): Promise<SuperAdminContact[]>;
  updateContactStatus(id: string, status: "NEW" | "IN_PROGRESS" | "DONE" | "REJECTED", actorId: string): Promise<boolean>;
  listAuditLogs(): Promise<AuditLogItem[]>;
  getSystemSetting(): Promise<SystemSetting>;
  updateSystemSetting(input: SystemSettingInput, actorId: string): Promise<SystemSetting>;
}

export class SuperAdminConflictError extends Error {
  statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = "SuperAdminConflictError";
  }
}
