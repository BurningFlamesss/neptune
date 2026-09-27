import { PrismaClient } from '../src/generated/prisma/client.js'

import { getDatabaseUrl } from '../src/database-url.js'

import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  const plans = await prisma.plan.createMany({
    data: [
      {
        name: "Ring",
        currency: "USD",
        price: 0,
        interval: "LIFETIME",
        basePFactor: 1,
        monthlyComputeQuotaCents: 600,
        monthlyMarketplaceCreditsCents: 0,
        rateLimitPerMinute: 10,
        maxConnectedApps: 10,
        storageLimitBytes: 10 * 1000 * 1000,
        displayFeaturesIncluded: [
          "Free Forever",
          "Community works",
          "Monetizable Datasets - 25% platform cutoff",
          "Participate in Bounty Programmes - 25% platform cutoff"
        ],
        displayFeaturesNotIncluded: [
          "No Syncing",
          "No Intelligence creations",
          "No API enabled apps",
          "No Frocus Access"
        ]
      },
      {
        name: "Lite Ring",
        currency: "USD",
        price: 300,
        basePFactor: 3,
        monthlyComputeQuotaCents: 900,
        monthlyMarketplaceCreditsCents: 100,
        rateLimitPerMinute: 30,
        maxConnectedApps: 20,
        storageLimitBytes: 100 * 1000 * 1000,
        displayFeaturesIncluded: [
          "Everything included in Ring",
          "HyperNeuron Lite",
          "Syncing Enabled",
          "5 Intelligence creations / month",
          "API enabled: 1 app",
          "Frocus Access",
          "Monetizable Datasets - 20% platform cutoff",
          "Participate in Bounty Programmes - 20% platform cutoff"
        ],
        displayFeaturesNotIncluded: []
      },
      {
        name: "Ring+",
        currency: "USD",
        price: 1900,
        basePFactor: 19,
        monthlyComputeQuotaCents: 2500,
        monthlyMarketplaceCreditsCents: 300,
        rateLimitPerMinute: 120,
        maxConnectedApps: 100,
        storageLimitBytes: 1 * 1000 * 1000 * 1000,
        displayFeaturesIncluded: [
          "SubDomain from your username (only-once)",
          "Everything included in Lite Ring",
          "HyperNeuron Pro",
          "Automated Sync with Scheduling",
          "Recall with sourcing and visual response",
          "60 Intelligence creations / month",
          "API enabled: 3 apps",
          "Premium Frocus Access",
          "Monetizable Datasets - 15% platform cutoff",
          "Participate in Bounty Programmes - 15% platform cutoff"
        ],
        displayFeaturesNotIncluded: [],
      },
      {
        name: "Magic Ring",
        currency: "USD",
        price: 3900,
        basePFactor: 39,
        monthlyComputeQuotaCents: 4500,
        monthlyMarketplaceCreditsCents: 1000,
        rateLimitPerMinute: 600,
        maxConnectedApps: null,
        storageLimitBytes: 15 * 1000 * 1000 * 1000,
        displayFeaturesIncluded: [
          "Everything included in Ring+",
          "Custom SubDomain",
          "HyperNeuron Unlimited",
          "Continuous Sync with Dependency",
          "Recall with frontier model access",
          "600 Intelligence creations / month",
          "Unlimited API enabled apps",
          "Premium Frocus Access",
          "Limited Support for Deployed Workers",
          "1 Boost for your pack / month",
          "Access to Ring Badge",
          "Access to beta features"
        ],
        displayFeaturesNotIncluded: [],
      },
      {
        name: "Lite Ring",
        currency: "USD",
        price: 2800,
        comparedAtPrice: 300 * 12,
        interval: "ANNUALLY",
        basePFactor: 3,
        monthlyComputeQuotaCents: 900,
        monthlyMarketplaceCreditsCents: 100,
        rateLimitPerMinute: 30,
        maxConnectedApps: 20,
        storageLimitBytes: 100 * 1000 * 1000,
        displayFeaturesIncluded: [
          "Everything included in Ring",
          "HyperNeuron Lite",
          "Syncing Enabled",
          "5 Intelligence creations / month",
          "API enabled: 1 app",
          "Frocus Access",
          "Monetizable Datasets - 20% platform cutoff",
          "Participate in Bounty Programmes - 20% platform cutoff"
        ],
        displayFeaturesNotIncluded: []
      },
      {
        name: "Ring+",
        currency: "USD",
        price: 17000,
        comparedAtPrice: 1900 * 12,
        interval: "ANNUALLY",
        basePFactor: 19,
        monthlyComputeQuotaCents: 2500,
        monthlyMarketplaceCreditsCents: 300,
        rateLimitPerMinute: 120,
        maxConnectedApps: 100,
        storageLimitBytes: 1 * 1000 * 1000 * 1000,
        displayFeaturesIncluded: [
          "SubDomain from your username (only-once)",
          "Everything included in Lite Ring",
          "HyperNeuron Pro",
          "Automated Sync with Scheduling",
          "Recall with sourcing and visual response",
          "60 Intelligence creations / month",
          "API enabled: 3 apps",
          "Premium Frocus Access",
          "Monetizable Datasets - 15% platform cutoff",
          "Participate in Bounty Programmes - 15% platform cutoff"
        ],
        displayFeaturesNotIncluded: [],
      },
      {
        name: "Magic Ring",
        currency: "USD",
        price: 30000,
        interval: "ANNUALLY",
        basePFactor: 39,
        monthlyComputeQuotaCents: 4500,
        monthlyMarketplaceCreditsCents: 1000,
        rateLimitPerMinute: 600,
        maxConnectedApps: null,
        storageLimitBytes: 15 * 1000 * 1000 * 1000,
        displayFeaturesIncluded: [
          "Everything included in Ring+",
          "Custom SubDomain",
          "HyperNeuron Unlimited",
          "Continuous Sync with Dependency",
          "Recall with frontier model access",
          "600 Intelligence creations / month",
          "Unlimited API enabled apps",
          "Premium Frocus Access",
          "Limited Support for Deployed Workers",
          "1 Boost for your pack / month",
          "Access to Ring Badge",
          "1 Request for custom profile",
          "Access to beta features"
        ],
        displayFeaturesNotIncluded: [],
      },
    ]
  })

  const coupons = await prisma.coupon.createMany({
    data: [
      {
        code: "VIP100",
        redeemptionType: "DIRECT_REDEEM",
        type: "PERCENTAGE_DISCOUNT",
        percentageDiscount: 100,
        maxUses: 1,
      },
      {
        code: "NEPTUNE20",
        redeemptionType: "CHECKOUT",
        type: "PERCENTAGE_DISCOUNT",
        percentageDiscount: 20,
        perUserLimit: 1,
      },
      {
        code: "RING2",
        redeemptionType: "CHECKOUT",
        type: "FIXED_DISCOUNT",
        fixedDiscount: 200,
        perUserLimit: 1,
      },
      {
        code: "REVIEW",
        redeemptionType: "DIRECT_REDEEM",
        type: "FIXED_DISCOUNT",
        fixedDiscount: 3900,
        perUserLimit: 1,
      },
    ]
  })

  console.log("Created ", plans.count, " plans", " and ", coupons.count, " coupons")
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
