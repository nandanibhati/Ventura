import { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home/Home";
import Cart from "../pages/Cart/Cart";
import ProductDetails from "../pages/ProductDetails/ProductDetails";
import Products from "../pages/Products/Products";
import Login from "../pages/Login/Login";
import Signup from "../pages/Signup/Signup";
import ProtectedRoute from "./ProtectedRoute";
import { LoadingSpinner } from "../components/ui/Feedback";
import { lazyWithRetry } from "./lazyWithRetry";

// Not first-paint-critical — loaded on demand instead of bloating the initial bundle.
const ForgotPassword = lazyWithRetry(() => import("../pages/ForgotPassword/ForgotPassword"));
const ResetPassword = lazyWithRetry(() => import("../pages/ResetPassword/ResetPassword"));
const Account = lazyWithRetry(() => import("../pages/Account/Account"));
const Wishlist = lazyWithRetry(() => import("../pages/Wishlist/Wishlist"));
const Orders = lazyWithRetry(() => import("../pages/Orders/Orders"));
const SellerDashboard = lazyWithRetry(() => import("../pages/SellerDashboard/SellerDashboard"));
const AdminDashboard = lazyWithRetry(() => import("../pages/AdminDashboard/AdminDashboard"));
const Checkout = lazyWithRetry(() => import("../pages/Checkout/Checkout"));
const ReturnPolicy = lazyWithRetry(() => import("../pages/Policies/ReturnPolicy"));
const Dropshipping = lazyWithRetry(() => import("../pages/Dropshipping/Dropshipping"));
const Wholesale = lazyWithRetry(() => import("../pages/Wholesale/Wholesale"));
const Affiliate = lazyWithRetry(() => import("../pages/Affiliate/Affiliate"));

// React Router doesn't reset scroll position on navigation — without this, clicking a link while
// scrolled down on one page lands you at the same scroll offset on the next page (often showing
// the footer instead of the top). Skips the reset on pure hash changes (e.g. "#reviews").
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  // The browser's own scroll restoration races this component on back/forward navigation - it
  // tries to jump straight to whatever Y offset the page was at when you left it (e.g. the
  // footer, if that's where you were scrolled to), sometimes winning the race and leaving you
  // there instead of at the top. Turning it off makes this component the only thing in control.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);
  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/shop" element={<Products />} />
            <Route path="/returns" element={<ReturnPolicy />} />
            <Route path="/dropshipping" element={<Dropshipping />} />
            <Route path="/wholesale" element={<Wholesale />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute role={["seller", "dropshipper", "wholesaler", "admin"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
