import { prisma } from "@nice-land/database";
import type {
  ContactRequestRepository,
  CreateContactRequestInput,
} from "./contact-request-repository.js";

export class PrismaContactRequestRepository
  implements ContactRequestRepository
{
  async create(input: CreateContactRequestInput) {
    return prisma.contactRequest.create({
      data: {
        siteId: input.siteId,
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        message: input.message || null,
        source: input.source,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });
  }
}
