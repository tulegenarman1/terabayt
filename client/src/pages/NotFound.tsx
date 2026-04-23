import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground transition-colors duration-300">
      <Card className="w-full max-w-lg mx-4 shadow-2xl border border-border bg-card">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse blur-xl" />
              <AlertCircle className="relative h-16 w-16 text-red-500" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-foreground mb-2">404</h1>

          <h2 className="text-xl font-bold text-muted-foreground mb-4">
            Страница не найдена
          </h2>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            Извините, запрашиваемая вами страница не существует.
            <br />
            Возможно, она была перемещена или удалена.
          </p>

          <div
            id="not-found-button-group"
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              onClick={handleGoHome}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
            >
              <Home className="w-4 h-4 mr-2" />
              На главную
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
