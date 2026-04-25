import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, MessageCircle, ShieldCheck, Truck, CreditCard,
  Package, Home as HomeIcon, ChevronRight, Sparkles, Sun, Moon
} from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";

const LOGO_URL = "/logo.jpeg";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();

  const { data: product, isLoading } = trpc.products.getById.useQuery(id || "0");
  const { data: categories = [] } = trpc.categories.list.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
        <Package className="w-16 h-16 text-muted mb-4" />
        <p className="text-xl text-muted-foreground mb-6">Товар не найден</p>
        <Button
          onClick={() => navigate("/catalog")}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
        >
          Вернуться в каталог
        </Button>
      </div>
    );
  }

  const finalPrice = product.discountPrice
    ? Number(product.discountPrice)
    : Number(product.price);
  const oldPrice = product.discountPrice ? Number(product.price) : null;
  const discountPercent = oldPrice
    ? Math.round((1 - finalPrice / oldPrice) * 100)
    : 0;

  const category = categories.find(c => String(c.id) === String(product.categoryId));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground transition-colors duration-300"
    >
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-emerald-500/20">
        <div className="container flex items-center justify-between py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 group"
          >
            <img
              src={LOGO_URL}
              alt="Terabayt.kz"
              className="w-10 h-10 rounded-lg object-cover ring-2 ring-emerald-500/50 group-hover:ring-emerald-400 transition-all"
            />
            <span className="text-xl font-bold tracking-tight">
              Terabayt<span className="text-emerald-400">.kz</span>
            </span>
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
              title={theme === "dark" ? "Светлая тема" : "Темная тема"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-600" />
              )}
            </button>
            <button
              onClick={() => navigate("/catalog")}
              className="hidden md:inline-flex items-center text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
            >
              Каталог
            </button>
            <a
              href="https://wa.me/77072002225"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold px-3 md:px-4 py-2 rounded-lg transition-all shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative pt-24 pb-16">
        <div className="container">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <button
              onClick={() => navigate("/")}
              className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
            >
              <HomeIcon className="w-3.5 h-3.5" />
              Главная
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button
              onClick={() => navigate("/catalog")}
              className="hover:text-emerald-400 transition-colors"
            >
              Каталог
            </button>
            {category && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <button
                  onClick={() => navigate(`/catalog?category=${category.id}`)}
                  className="hover:text-emerald-400 transition-colors uppercase"
                >
                  {category.name}
                </button>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-emerald-400 font-medium truncate max-w-[200px]">
              {product.brand}
            </span>
          </div>

          <button
            onClick={() => navigate(`/catalog?category=${product.categoryId}&brand=${product.brand}`)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-emerald-400 transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад в каталог {category?.name} {product.brand}
          </button>

          {/* Product Layout */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-white border border-border rounded-2xl p-4 md:p-8 flex items-center justify-center min-h-[300px] md:min-h-[500px] relative">
                {discountPercent > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg z-10">
                    -{discountPercent}%
                  </div>
                )}
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center gap-3">
                    <Package className="w-20 h-20" />
                    <span className="text-sm">Нет изображения</span>
                  </div>
                )}
              </div>

              {/* Trust badges below image */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                <TrustItem icon={ShieldCheck} title="Гарантия" subtitle="12 мес." />
                <TrustItem icon={Truck} title="Доставка" subtitle="по РК" />
                <TrustItem icon={CreditCard} title="Рассрочка" subtitle="0-0-12" />
                <TrustItem icon={CreditCard} title="Рассрочка" subtitle="0-0-24" />
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Brand + status */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  {product.brand}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    product.availability === "in_stock"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/10 text-red-400 border border-red-500/30"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    product.availability === "in_stock" ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                  }`} />
                  {product.availability === "in_stock" ? "В наличии" : "Нет в наличии"}
                </span>
              </div>

              <h1 
                className="text-3xl md:text-4xl font-black leading-tight"
                dangerouslySetInnerHTML={{ __html: product.name }}
              />

              {/* Price card */}
              <div className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden shadow-xl shadow-black/5">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="relative">
                  {oldPrice && (
                    <p className="text-muted-foreground line-through text-lg mb-1">
                      {oldPrice.toLocaleString()} ₸
                    </p>
                  )}
                  <div className="flex items-end gap-3">
                    <p className="text-5xl font-black text-emerald-500 leading-none">
                      {finalPrice.toLocaleString()}
                    </p>
                    <p className="text-2xl font-bold text-emerald-500/70 mb-1">₸</p>
                  </div>
                  {oldPrice && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Экономия{" "}
                      <span className="text-emerald-500 font-semibold">
                        {(oldPrice - finalPrice).toLocaleString()} ₸
                      </span>
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Рассрочка 0-0-12</p>
                      <p className="text-lg font-black text-foreground">
                        {Math.round(finalPrice / 12).toLocaleString()} <span className="text-xs font-bold text-muted-foreground">₸/мес</span>
                      </p>
                    </div>
                    <div className="space-y-1 border-l border-border pl-4">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Рассрочка 0-0-24</p>
                      <p className="text-lg font-black text-emerald-500">
                        {Math.round(finalPrice / 24).toLocaleString()} <span className="text-xs font-bold text-emerald-500/70">₸/мес</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {product.kaspiLink && (
                  <a
                    href={product.kaspiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-6 text-base shadow-lg shadow-emerald-500/30">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Купить через Kaspi.kz
                    </Button>
                  </a>
                )}
                <a
                  href={`https://wa.me/77072002225?text=${encodeURIComponent(`Здравствуйте! Интересует ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full border-emerald-500/50 bg-transparent text-emerald-400 hover:bg-emerald-500/10 font-semibold py-6 text-base"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    { (String(product.categoryId) === "1" || product.name.toLowerCase().includes("ноутбук")) && product.availability === "in_stock"
                      ? "Купить в наличии" 
                      : "Спросить в WhatsApp" }
                  </Button>
                </a>
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-3">Описание</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-emerald-400 rounded-full" />
                Характеристики
              </h2>
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5">
                <div className="divide-y divide-border">
                  {product.specs && typeof product.specs === 'object' && Object.entries(product.specs)
                    .filter(([_, value]) => value && String(value).trim() !== "")
                    .sort(([a], [b]) => {
                      const order = ["display", "cpu", "gpu", "storage", "ram", "os", "camera", "battery", "weight", "sim", "nfc", "type", "speed", "scanner", "interface", "format", "color"];
                      const indexA = order.indexOf(a);
                      const indexB = order.indexOf(b);
                      if (indexA === -1 && indexB === -1) return 0;
                      if (indexA === -1) return 1;
                      if (indexB === -1) return -1;
                      return indexA - indexB;
                    })
                    .map(([key, value]) => {
                      const labels: Record<string, string> = {
                        cpu: "Процессор",
                        ram: "Оперативная память",
                        storage: "Встроенная память",
                        gpu: "Видеокарта",
                        display: "Экран",
                        os: "Операционная система",
                        camera: "Камера",
                        battery: "Аккумулятор",
                        weight: "Вес",
                        sim: "SIM-карты",
                        nfc: "NFC",
                        type: "Тип",
                        color: "Цвет",
                        speed: "Скорость печати",
                        scanner: "Сканер",
                        interface: "Интерфейс",
                        format: "Формат печати",
                      };
                      return (
                        <div
                          key={key}
                          className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group"
                        >
                          <p className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">
                            {labels[key] || key}
                          </p>
                          <p className="sm:col-span-2 font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                            {String(value)}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Video */}
          {product.videoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1 h-8 bg-emerald-400 rounded-full" />
                Видео обзор
              </h2>
              <div className="bg-card border border-border rounded-2xl overflow-hidden aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={product.videoUrl}
                  title="Product Video"
                  allowFullScreen
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TrustItem({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm">
      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
    </div>
  );
}
