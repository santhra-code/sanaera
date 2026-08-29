import { db } from "@/lib/db";

export class OrderError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const ORDER_STATUS_SEQUENCE = [
  "PLACED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

/**
 * Determines whether moving from `currentStatus` to `newStatus` is a legal
 * transition. Enforces the order lifecycle defined in the project spec:
 * PLACED -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED,
 * with CANCELLED allowed as an early exit (before SHIPPED).
 */
export function isValidStatusTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  // Terminal states cannot transition to anything else.
  if (currentStatus === "DELIVERED" || currentStatus === "CANCELLED") {
    return false;
  }

  if (newStatus === "CANCELLED") {
    // Cancellation is only allowed before the order has shipped.
    return currentStatus === "PLACED" || currentStatus === "CONFIRMED" || currentStatus === "PROCESSING";
  }

  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(
    currentStatus as (typeof ORDER_STATUS_SEQUENCE)[number]
  );
  const newIndex = ORDER_STATUS_SEQUENCE.indexOf(
    newStatus as (typeof ORDER_STATUS_SEQUENCE)[number]
  );

  // Must move exactly one step forward in the sequence.
  return newIndex === currentIndex + 1;
}

/**
 * Updates an order's status after validating the transition is legal.
 */
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  const order = await db.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw new OrderError("Order not found.", 404);
  }

  if (!isValidStatusTransition(order.status, newStatus)) {
    throw new OrderError(
      `Cannot change order status from ${order.status} to ${newStatus}.`,
      400
    );
  }

  return db.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
}

/**
 * Returns all orders, across all customers, most recent first.
 * Admin-only — callers must enforce authorization before calling this.
 */
export async function getAllOrders() {
  return db.order.findMany({
    include: { items: true, user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export type ShippingDetails = {
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
};

/**
 * Creates an order from the user's current cart.
 * - Re-validates stock against live data (not the cart's cached state).
 * - Snapshots product name and price onto each OrderItem.
 * - Decrements product stock.
 * - Clears the cart.
 * All of this happens in a single transaction: it either all succeeds,
 * or none of it takes effect.
 */
export async function createOrderFromCart(
  userId: string,
  shipping: ShippingDetails
) {
  const cart = await db.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) {
    throw new OrderError("Your cart is empty.", 400);
  }

  // Re-validate every item against live product data before committing to anything.
  for (const item of cart.items) {
    if (!item.product.isActive) {
      throw new OrderError(
        `"${item.product.name}" is no longer available.`,
        400
      );
    }
    if (item.quantity > item.product.stock) {
      throw new OrderError(
        `Only ${item.product.stock} of "${item.product.name}" are available.`,
        400
      );
    }
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  const order = await db.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        status: "PLACED",
        totalAmount,
        ...shipping,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            priceAtOrder: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Decrement stock for each purchased product.
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Empty the cart now that its contents have become an order.
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return order;
}

/**
 * Returns all orders for a given user, most recent first.
 */
export async function getUserOrders(userId: string) {
  return db.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Returns a single order, but only if it belongs to the given user
 * (unless isAdmin is true, in which case any order can be viewed).
 */
export async function getOrderById(
  orderId: string,
  userId: string,
  isAdmin: boolean
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw new OrderError("Order not found.", 404);
  }

  if (!isAdmin && order.userId !== userId) {
    throw new OrderError("Order not found.", 404);
  }

  return order;
}