import { createContext, useCallback, useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../api/cart";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const CART_QUERY_KEY = ["cart"];

const EMPTY_CART = { id: null, items: [], itemCount: 0, subtotal: 0, promotionDiscount: 0, discount: 0, coupon: null };

export function CartProvider({ children }) {
  const queryClient = useQueryClient();
  const { status } = useAuth();

  const {
    data: cart = EMPTY_CART,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: cartApi.get,
    enabled: status !== "loading",
    staleTime: 0,
  });

  const invalidate = useCallback(() => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY }), [queryClient]);

  const addItemMutation = useMutation({
    mutationFn: ({ productId, quantity = 1, variant }) => cartApi.addItem({ productId, quantity, variant }),
    onSuccess: (data) => queryClient.setQueryData(CART_QUERY_KEY, data),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => cartApi.updateItem(itemId, quantity),
    onSuccess: (data) => queryClient.setQueryData(CART_QUERY_KEY, data),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId) => cartApi.removeItem(itemId),
    onSuccess: (data) => queryClient.setQueryData(CART_QUERY_KEY, data),
  });

  const applyCouponMutation = useMutation({
    mutationFn: (code) => cartApi.applyCoupon(code),
    onSuccess: (data) => queryClient.setQueryData(CART_QUERY_KEY, data),
  });

  const removeCouponMutation = useMutation({
    mutationFn: () => cartApi.removeCoupon(),
    onSuccess: (data) => queryClient.setQueryData(CART_QUERY_KEY, data),
  });

  const value = useMemo(
    () => ({
      cart,
      isLoading,
      isError,
      error,
      itemCount: cart.itemCount,
      addItem: (payload) => addItemMutation.mutateAsync(payload),
      updateItem: (itemId, quantity) => updateItemMutation.mutateAsync({ itemId, quantity }),
      removeItem: (itemId) => removeItemMutation.mutateAsync(itemId),
      applyCoupon: (code) => applyCouponMutation.mutateAsync(code),
      removeCoupon: () => removeCouponMutation.mutateAsync(),
      refetchCart: invalidate,
      isMutating:
        addItemMutation.isPending ||
        updateItemMutation.isPending ||
        removeItemMutation.isPending ||
        applyCouponMutation.isPending ||
        removeCouponMutation.isPending,
      couponError: applyCouponMutation.error?.response?.data?.error?.message || null,
    }),
    [
      cart,
      isLoading,
      isError,
      error,
      invalidate,
      addItemMutation,
      updateItemMutation,
      removeItemMutation,
      applyCouponMutation,
      removeCouponMutation,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
