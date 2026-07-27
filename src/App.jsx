import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./components/ui/Feedback/Toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ThemeProvider from "./context/ThemeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // The backend host's free tier spins the server down after idle periods, so the first
      // request after a lull can take 30-50s to get a response while it cold-starts — a single
      // near-instant retry isn't enough to ride that out, and every data-driven homepage section
      // would show "couldn't load" together until it happened to be re-fetched later. Retrying
      // several times with growing backoff covers the cold-start window without retrying forever
      // on a genuinely broken request.
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <AppRoutes />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
