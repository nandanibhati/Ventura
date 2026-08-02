import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Home, LayoutGrid, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { wishlistApi } from "../../api/orders";
import { cn } from "../../lib/utils";

const TABS = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/shop", label: "Categories", icon: LayoutGrid },
  { to: "/wishlist", label: "Wishlist", icon: Heart, countKey: "wishlist" },
  { to: "/cart", label: "Cart", icon: ShoppingBag, countKey: "cart" },
  { to: "/account", label: "Account", icon: User },
];

/** App-style bottom navigation shown only on phones — desktop/tablet keep the header's own
 * nav links, so this exists purely to give small-screen visitors the persistent, thumb-reachable
 * navigation pattern they already expect from native shopping apps. */
export default function MobileTabBar() {
  const { itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const { data: wishlist = [] } = useQuery({ queryKey: ["wishlist"], queryFn: wishlistApi.list, enabled: isAuthenticated });

  const counts = { cart: itemCount, wishlist: wishlist.length };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-black/5 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-neutral-950/95">
      {TABS.map((tab) => {
        const count = tab.countKey ? counts[tab.countKey] : 0;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-0.5 px-1 pb-2.5 pt-2 text-[10px] font-medium transition-colors",
                isActive ? "text-gold-600 dark:text-gold-400" : "text-neutral-400 dark:text-neutral-500"
              )
            }
          >
            <span className="relative">
              <tab.icon className="h-5 w-5" strokeWidth={1.9} />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-600 px-0.5 text-[8.5px] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </span>
            {tab.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
