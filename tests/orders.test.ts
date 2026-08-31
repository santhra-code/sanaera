import { describe, it, expect, beforeAll, afterAll } from "vitest";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  createOrderFromCart,
  isValidStatusTransition,
  OrderError,
} from "@/lib/orders";

const TEST_EMAIL = "vitest-orders-user@example.com";
let testUserId: string;
let testCategoryId: string;
let testProductId: string;

const SHIPPING = {
  shippingName: "Vitest Tester",
  shippingAddress: "123 Test Street",
  shippingCity: "Chennai",
  shippingState: "Tamil Nadu",
  shippingPincode: "600001",
};

describe("Order creation", () => {
  beforeAll(async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await db.user.create({
      data: {
        email: TEST_EMAIL,
        passwordHash,
        name: "Vitest Orders User",
        role: "CUSTOMER",
        cart: { create: {} },
      },
    });
    testUserId = user.id;

    const category = await db.category.create({
      data: { name: "Vitest Orders Category" },
    });
    testCategoryId = category.id;

    const product = await db.product.create({
      data: {
        name: "Vitest Order Test Product",
        description: "Used for order tests",
        price: 1000,
        imageUrl: "https://placehold.co/600x800",
        stock: 3,
        isActive: true,
        categoryId: testCategoryId,
      },
    });
    testProductId = product.id;
  });

  afterAll(async () => {
    await db.orderItem.deleteMany({ where: { order: { userId: testUserId } } });
    await db.order.deleteMany({ where: { userId: testUserId } });
    await db.cartItem.deleteMany({ where: { cart: { userId: testUserId } } });
    await db.cart.deleteMany({ where: { userId: testUserId } });
    await db.product.deleteMany({ where: { categoryId: testCategoryId } });
    await db.category.deleteMany({ where: { id: testCategoryId } });
    await db.user.deleteMany({ where: { id: testUserId } });
  });

  it("rejects checkout when the cart is empty", async () => {
    await expect(
      createOrderFromCart(testUserId, SHIPPING)
    ).rejects.toThrow(OrderError);
  });

  it("creates an order from a non-empty cart, snapshotting price and decrementing stock", async () => {
    // Put an item in the cart directly.
    const cart = await db.cart.findUnique({ where: { userId: testUserId } });
    await db.cartItem.create({
      data: { cartId: cart!.id, productId: testProductId, quantity: 2 },
    });

    const order = await createOrderFromCart(testUserId, SHIPPING);

    expect(order.status).toBe("PLACED");
    expect(Number(order.totalAmount)).toBe(2000); // 2 x price(1000)
    expect(order.items).toHaveLength(1);
    expect(order.items[0].priceAtOrder.toString()).toBe("1000");
    expect(order.items[0].productName).toBe("Vitest Order Test Product");

    const updatedProduct = await db.product.findUnique({
      where: { id: testProductId },
    });
    expect(updatedProduct?.stock).toBe(1); // 3 - 2

    const clearedCart = await db.cart.findUnique({
      where: { userId: testUserId },
      include: { items: true },
    });
    expect(clearedCart?.items).toHaveLength(0);
  });
});

describe("Order status transitions", () => {
  it("allows moving forward one step in the lifecycle", () => {
    expect(isValidStatusTransition("PLACED", "CONFIRMED")).toBe(true);
    expect(isValidStatusTransition("CONFIRMED", "PROCESSING")).toBe(true);
  });

  it("rejects skipping steps in the lifecycle", () => {
    expect(isValidStatusTransition("PLACED", "DELIVERED")).toBe(false);
    expect(isValidStatusTransition("PLACED", "SHIPPED")).toBe(false);
  });

  it("allows cancellation before shipping, but not after", () => {
    expect(isValidStatusTransition("PLACED", "CANCELLED")).toBe(true);
    expect(isValidStatusTransition("SHIPPED", "CANCELLED")).toBe(false);
  });

  it("rejects any transition out of a terminal state", () => {
    expect(isValidStatusTransition("DELIVERED", "CONFIRMED")).toBe(false);
    expect(isValidStatusTransition("CANCELLED", "PLACED")).toBe(false);
  });
});