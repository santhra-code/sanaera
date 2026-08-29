import { db } from "@/lib/db";

export class CartError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Returns the user's cart (with items and product details),
 * creating an empty one if it doesn't exist yet.
 */
export async function getOrCreateCart(userId: string) {
  let cart = await db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { id: "asc" },
        },
      },
    });
  }

  return cart;
}

/**
 * Adds a product to the user's cart, or increases the quantity
 * if it's already there. Enforces all cart business rules.
 */
export async function addItemToCart(
  userId: string,
  productId: string,
  quantity: number
) {
  if (quantity <= 0) {
    throw new CartError("Quantity must be a positive number.", 400);
  }

  const product = await db.product.findUnique({ where: { id: productId } });

  if (!product) {
    throw new CartError("Product not found.", 404);
  }

  if (!product.isActive) {
    throw new CartError("This product is no longer available.", 400);
  }

  const cart = await getOrCreateCart(userId);

  const existingItem = cart.items.find((item) => item.productId === productId);
  const newQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (newQuantity > product.stock) {
    throw new CartError(
      `Only ${product.stock} of this item are available.`,
      400
    );
  }

  if (existingItem) {
    await db.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });
  } else {
    await db.cartItem.create({
      data: { cartId: cart.id, productId, quantity: newQuantity },
    });
  }

  return getOrCreateCart(userId);
}

/**
 * Updates the quantity of an existing cart item.
 * Ensures the item actually belongs to this user's cart.
 */
export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  quantity: number
) {
  if (quantity <= 0) {
    throw new CartError("Quantity must be a positive number.", 400);
  }

  const item = await db.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true, product: true },
  });

  if (!item || item.cart.userId !== userId) {
    throw new CartError("Cart item not found.", 404);
  }

  if (quantity > item.product.stock) {
    throw new CartError(
      `Only ${item.product.stock} of this item are available.`,
      400
    );
  }

  await db.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });

  return getOrCreateCart(userId);
}

/**
 * Removes an item from the user's cart.
 * Ensures the item actually belongs to this user's cart.
 */
export async function removeCartItem(userId: string, itemId: string) {
  const item = await db.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== userId) {
    throw new CartError("Cart item not found.", 404);
  }

  await db.cartItem.delete({ where: { id: itemId } });

  return getOrCreateCart(userId);
}