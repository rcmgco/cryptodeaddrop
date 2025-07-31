import { ThemeProvider } from '@/contexts/ThemeContext'
import { Web3Provider } from '@/contexts/Web3Context'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <ThemeProvider>
      <Web3Provider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <Toaster />
            <Sonner />
          </div>
        </BrowserRouter>
      </Web3Provider>
    </ThemeProvider>
  </TooltipProvider>
);

export default App;
