import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { wishlistApi } from "../../api/orders";
import { resolveProductImageUrl } from "../../lib/api";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/ui/Cards/ProductCard";
import { LoadingSpinner, EmptyState, ErrorState } from "../../components/ui/Feedback";
import { useToast } from "../../components/ui/Feedback/useToast";
import { Breadcrumb } from "../../components/ui/Navigation";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

export default function Wishlist() {
  useDocumentTitle("Wishlist");
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const handleAdd = async (productId) => {
    try {
      await addItem({ productId, quantity: 1 });
      toast({
        title: "Added to bag",
        variant: "success",
        action: { label: "View Bag", onClick: () => navigate("/cart") },
      });
    } catch (err) {
      toast({ title: err.response?.data?.error?.message || "Couldn't add to bag", variant: "error" });
    }
  };

  const { data: items = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.list,
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => wishlistApi.remove(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="mb-6">
          <Breadcrumb items={[{ label: "Wishlist" }]} />
        </div>
        <h1 className="mb-8 text-3xl font-medium text-[var(--text-primary)]" style={{ fontFamily: "var(--font-display)" }}>
          Your Wishlist
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" label="Loading your wishlist..." />
          </div>
        ) : isError ? (
          <ErrorState description="We couldn't load your wishlist." onRetry={refetch} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save products you love here so you can find them again easily."
          />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {items.map(({ product }) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  brand: product.brand?.name,
                  category: product.category?.name,
                  price: Number(product.price),
                  oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
                  rating: product.ratingAvg,
                  reviews: product.ratingCount,
                  isNew: product.isNew,
                  isTrending: product.isTrending,
                  isBestSeller: product.isBestSeller,
                  badge: product.badge,
                  stock: product.stock,
                  lowStockThreshold: product.lowStockThreshold,
                  animationOverride: product.animationOverride,
                }}
                image={resolveProductImageUrl(product.images?.[0]?.url)}
                wished
                onWishlistToggle={() => removeMutation.mutate(product.id)}
                onAdd={() => handleAdd(product.id)}
              />
            ))}
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div className="mt-10 text-center">
            <Link to="/shop" className="text-sm font-medium text-gold-600 hover:underline dark:text-gold-400">
              Continue shopping →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
