export interface CreateContactRequestInput {
  siteId: string | null;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  selectedPlan?: string;
  themePreference: "warm" | "cold";
  source: "LANDING_PAGE" | "TENANT_WEBSITE";
}

export interface CreatedContactRequest {
  id: string;
  createdAt: Date;
}

export interface ContactRequestRepository {
  create(input: CreateContactRequestInput): Promise<CreatedContactRequest>;
}
