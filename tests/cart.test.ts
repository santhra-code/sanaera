import { describe, it, expect, beforeAll, afterAll } from "vitest";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { addItemToCart, CartError } from "@/lib/cart";

const TEST_EMAIL = "vitest-cart-user@example.com";
let testUserId: string;
let testCategoryId: string;
let inStockProductId: string;
let inactiveProductId: string;

describe("Cart business logic", () => {
  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await db.user.create({
      data: {
        email: TEST_EMAIL,
        passwordHash,
        name: "Vitest Cart User",
        role: "CUSTOMER",
        cart: { create: {} },
      },
    });
    testUserId = user.id;

    const category = await db.category.create({
      data: { name: "Vitest Test Category" },
    });
    testCategoryId = category.id;

    const inStockProduct = await db.product.create({
      data: {
        name: "Vitest In-Stock Product",
        description: "Used for cart tests",
        price: 500,
        imageUrl: "https://placehold.co/600x800",
        stock: 5,
        isActive: true,
        categoryId: testCategoryId,
      },
    });
    inStockProductId = inStockProduct.id;

    const inactiveProduct = await db.product.create({
      data: {
        name: "Vitest Inactive Product",
        description: "Used for cart tests",
        price: 500,
        imageUrl: "https://placehold.co/600x800",
        stock: 5,
        isActive: false,
        categoryId: testCategoryId,
      },
    });
    inactiveProductId = inactiveProduct.id;
  });

  afterAll(async () => {
    // Clean up in dependency order: items/orders before products/users.
    await db.cartItem.deleteMany({ where: { cart: { userId: testUserId } } });
    await db.cart.deleteMany({ where: { userId: testUserId } });
    await db.product.deleteMany({ where: { categoryId: testCategoryId } });
    await db.category.deleteMany({ where: { id: testCategoryId } });
    await db.user.deleteMany({ where: { id: testUserId } });
  });

  it("adds a product to the cart successfully", async () => {
    const cart = await addItemToCart(testUserId, inStockProductId, 2);

    const item = cart.items.find((i) => i.productId === inStockProductId);
    expect(item).toBeDefined();
    expect(item?.quantity).toBe(2);
  });

  it("increases quantity instead of duplicating when adding the same product again", async () => {
    const cart = await addItemToCart(testUserId, inStockProductId, 1);

    const matchingItems = cart.items.filter(
      (i) => i.productId === inStockProductId
    );
    expect(matchingItems).toHaveLength(1);
    expect(matchingItems[0].quantity).toBe(3); // 2 from before + 1 now
  });

  it("rejects adding more than the available stock", async () => {
    await expect(
      addItemToCart(testUserId, inStockProductId, 999)
    ).rejects.toThrow(CartError);
  });

  it("rejects adding an inactive product", async () => {
    await expect(
      addItemToCart(testUserId, inactiveProductId, 1)
    ).rejects.toThrow(CartError);
  });
});