import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  cartOwner: string | null;
  addItem: (product: Product, quantity: number, color: string, size: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  setCartOwner: (uid: string | null) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      cartOwner: null,
      isOpen: false,
      setIsOpen: (isOpen) => set({ isOpen }),
      setCartOwner: (uid) => set({ cartOwner: uid }),
      addItem: (product, quantity, color, size) => {
        const id = `${product.id}-${color}-${size}`;
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === id);

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.id === id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [
              ...currentItems,
              {
                id,
                productId: product.id,
                quantity,
                selectedColor: color,
                selectedSize: size,
                product,
              },
            ],
            isOpen: true,
          });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [], cartOwner: null }),
      setItems: (items) => set({ items }),
    }),
    {
      name: "qotton-cart-storage",
      partialize: (state) => ({ items: state.items, cartOwner: state.cartOwner }),
    }
  )
);
