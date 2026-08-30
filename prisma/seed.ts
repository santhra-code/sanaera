import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // --- Demo accounts ---
  // Passwords are hashed before storing — never store plain text passwords.
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const customerPasswordHash = await bcrypt.hash("Customer@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@sanaera.test" },
    update: {},
    create: {
      email: "admin@sanaera.test",
      passwordHash: adminPasswordHash,
      name: "SANAÉRA Admin",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@sanaera.test" },
    update: {},
    create: {
      email: "customer@sanaera.test",
      passwordHash: customerPasswordHash,
      name: "Demo Customer",
      role: "CUSTOMER",
    },
  });

  // A customer's cart is created once, at registration time in the real app.
  // We create it here too, so the demo customer already has an (empty) cart.
  await prisma.cart.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id },
  });

  // --- Categories ---
  const sarees = await prisma.category.upsert({
    where: { name: "Sarees" },
    update: {},
    create: { name: "Sarees" },
  });

  const kurtas = await prisma.category.upsert({
    where: { name: "Kurtas" },
    update: {},
    create: { name: "Kurtas" },
  });

  const festive = await prisma.category.upsert({
    where: { name: "Festive Wear" },
    update: {},
    create: { name: "Festive Wear" },
  });

  // --- Products ---
  // Dummy prices, dummy image URLs (placeholder service) — no real product data.
  const products = [
    {
      name: "Ajrakh Silk Saree",
      description:
        "Hand block-printed Ajrakh silk saree with traditional indigo and madder motifs.",
      price: 4999,
      imageUrl: "https://placehold.co/600x800?text=Ajrakh+Silk+Saree",
      stock: 12,
      categoryId: sarees.id,
    },
    {
      name: "Mirror Work Saree",
      description:
        "Georgette saree with intricate mirror embroidery, perfect for festive occasions.",
      price: 3499,
      imageUrl: "https://placehold.co/600x800?text=Mirror+Work+Saree",
      stock: 8,
      categoryId: sarees.id,
    },
    {
      name: "Handloom Cotton Saree",
      description: "Breathable handloom cotton saree with a woven border, ideal for daily wear.",
      price: 1899,
      imageUrl: "https://placehold.co/600x800?text=Handloom+Cotton+Saree",
      stock: 20,
      categoryId: sarees.id,
    },
    {
      name: "Embroidered Kurta",
      description: "Cotton kurta with thread embroidery detailing on the neckline and sleeves.",
      price: 1299,
      imageUrl: "https://placehold.co/600x800?text=Embroidered+Kurta",
      stock: 15,
      categoryId: kurtas.id,
    },
    {
      name: "Silk Anarkali",
      description: "Floor-length silk Anarkali suit with zari border, suited for celebrations.",
      price: 5999,
      imageUrl: "https://placehold.co/600x800?text=Silk+Anarkali",
      stock: 6,
      categoryId: festive.id,
    },
    {
      name: "Festive Dupatta",
      description: "Banarasi-style dupatta with gold zari weaving, pairs well with kurtas.",
      price: 999,
      imageUrl: "https://placehold.co/600x800?text=Festive+Dupatta",
      stock: 25,
      categoryId: festive.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {},
      create: product,
    });
  }

  console.log("Seed data created successfully.");
  console.log(`Admin login: admin@sanaera.test / Admin@123`);
  console.log(`Customer login: customer@sanaera.test / Customer@123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });