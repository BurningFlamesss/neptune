import type { BillingInterval, Currency } from "#/generated/prisma/enums";
import type { JsonValue } from "#/generated/prisma/internal/prismaNamespace";

export type GetUserPlan = {
        id: string;
        name: string;
        price: number;
        comparedAtPrice: number | null;
        interval: BillingInterval;
        currency: Currency;
        isActive: boolean;
        sortOrder: number;
        intelligenceStorage: string | null;
        sync: string | null;
        recall: string | null;
        versioning: string | null;
        sharing: string | null;
        features: JsonValue | null;
        notIncludedFeatures: JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    } | null;