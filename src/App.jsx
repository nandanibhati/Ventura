import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./components/ui/Feedback/Toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ThemeProvider from "./context/ThemeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
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
