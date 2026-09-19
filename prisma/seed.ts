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
      intelligenceStorage: "1 GB",
      sync: "1 is automated, all other are Manual",
      recall: "Basic",
      versioning: "Basic",
      sharing: "Basic",
      features: ["1 Intelligence creations / month"]
    },
      {
      name: "Ring+",
      currency: "USD",
      price: 1200,
      intelligenceStorage: "25 GB",
      sync: "Automated with Scheduling",
      recall: "with sourcing & visual response",
      versioning: "with branching",
      sharing: "with granular level control + HyperNeuron",
      features: ["60 Intelligence creations / month", "API enabled: 3 apps", "Sync with Frocus <Simplex>"]
    },
      {
      name: "Magic Ring",
      currency: "USD",
      price: 2900,
      intelligenceStorage: "150 GB",
      sync: "Continuously with Scheduling, Dependency",
      recall: "with sourcing, visual response & frontier model access",
      versioning: "with branching + fork + merge",
      sharing: "with granular level control + HyperNeuron Unlimited",
      features: ["600 Intelligence creations / month", "Unlimited API enabled apps", "Sync with Frocus <Duplex>", "1 Boost for your post", "Access to Ring Badge", "Access to beta features"]
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
        fixedDiscount: 2900,
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
