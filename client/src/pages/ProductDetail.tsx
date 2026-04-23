import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, MessageCircle, ShieldCheck, Truck, CreditCard,
  Package, Home as HomeIcon, ChevronRight, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";

const LOGO_URL = "/logo.jpeg";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: product, isLoading } = trpc.products.getById.useQuery(parseInt(id || "0"));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Загрузка...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <Package className="w-16 h-16 text-zinc-700 mb-4" />
        <p className="text-xl text-zinc-400 mb-6">Товар не найден</p>
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
    ? parseFloat(String(product.discountPrice))
    : parseFloat(String(product.price));
  const oldPrice = product.discountPrice ? parseFloat(String(product.price)) : null;
  const discountPercent = oldPrice
    ? Math.round((1 - finalPrice / oldPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-emerald-500/20">
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
              onClick={() => navigate("/catalog")}
              className="hidden md:inline-flex items-center text-sm text-zinc-300 hover:text-emerald-400 transition-colors"
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
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
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
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-emerald-400 font-medium truncate max-w-[200px]">
              {product.brand}
            </span>
          </div>

          <button
            onClick={() => navigate("/catalog")}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors mb-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад в каталог
          </button>

          {/* Product Layout */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden p-8 flex items-center justify-center min-h-[400px] md:min-h-[500px] relative">
                {discountPercent > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg z-10">
                    -{discountPercent}%
                  </div>
                )}
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="max-w-full max-h-[450px] object-contain"
                  />
                ) : (
                  <div className="text-zinc-700 flex flex-col items-center gap-3">
                    <Package className="w-20 h-20" />
                    <span className="text-sm">Нет изображения</span>
                  </div>
                )}
              </div>

              {/* Trust badges below image */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <TrustItem icon={ShieldCheck} title="Гарантия" subtitle="12 мес." />
                <TrustItem icon={Truck} title="Доставка" subtitle="по РК" />
                <TrustItem icon={CreditCard} title="Kaspi" subtitle="0-0-12" />
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

              <h1 className="text-3xl md:text-4xl font-black leading-tight">
                {product.name}
              </h1>

              {/* Price card */}
              <div className="bg-gradient-to-br from-zinc-950 to-black border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                <div className="relative">
                  {oldPrice && (
                    <p className="text-zinc-500 line-through text-lg mb-1">
                      {oldPrice.toLocaleString()} ₸
                    </p>
                  )}
                  <div className="flex items-end gap-3">
                    <p className="text-5xl font-black text-emerald-400 leading-none">
                      {finalPrice.toLocaleString()}
                    </p>
                    <p className="text-2xl font-bold text-emerald-400/70 mb-1">₸</p>
                  </div>
                  {oldPrice && (
                    <p className="text-sm text-zinc-400 mt-2">
                      Экономия{" "}
                      <span className="text-emerald-400 font-semibold">
                        {(oldPrice - finalPrice).toLocaleString()} ₸
                      </span>
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-1">Через Kaspi Red 0-0-12:</p>
                    <p className="text-lg font-bold text-white">
                      {Math.round(finalPrice / 12).toLocaleString()} ₸/мес.
                    </p>
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
                    Спросить в WhatsApp
                  </Button>
                </a>
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="font-bold text-lg mb-3">Описание</h3>
                  <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
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
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl shadow-black/50">
                <div className="divide-y divide-zinc-900">
                  {Object.entries(product.specs).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      cpu: "Процессор",
                      ram: "Оперативная память",
                      storage: "Память",
                      gpu: "Видеокарта",
                      display: "Экран",
                      os: "Операционная система",
                      type: "Тип",
                      color: "Цвет",
                      speed: "Скорость печати",
                      interface: "Интерфейс",
                      format: "Формат печати",
                    };
                    return (
                      <div
                        key={key}
                        className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-6 py-4 hover:bg-zinc-900/30 transition-colors group"
                      >
                        <p className="text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors">
                          {labels[key] || key}
                        </p>
                        <p className="sm:col-span-2 font-semibold text-white group-hover:text-emerald-400 transition-colors">
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
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden aspect-video">
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
    </div>
  );
}

function TrustItem({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-white truncate">{title}</p>
        <p className="text-xs text-zinc-500 truncate">{subtitle}</p>
      </div>
    </div>
  );
}
