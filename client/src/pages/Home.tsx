import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Smartphone, Zap, Award, Phone, MapPin, Instagram, 
  ChevronLeft, ChevronRight, Shield, Truck, Headphones,
  Wallet, CheckCircle2, MessageCircle, ArrowRight,
  Plus, Minus, Star, Laptop, Printer, X, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";

const LOGO_URL = "/logo.jpeg";

const FAQ = [
  {
    q: "Есть ли рассрочка?",
    a: "Да, вы можете приобрести любой товар в рассрочку 0-0-12 через Kaspi Red, Kaspi Bank и Halyk Bank без переплат."
  },
  {
    q: "Какая гарантия на технику?",
    a: "На все ноутбуки, смартфоны и принтеры предоставляется официальная гарантия сроком на 12 месяцев."
  },
  {
    q: "Как работает доставка?",
    a: "По Алматы доставка осуществляется день в день. По Казахстану отправляем курьерскими службами, срок доставки 2-5 рабочих дней."
  },
  {
    q: "Помогаете ли вы с настройкой?",
    a: "Да, при покупке ноутбука мы бесплатно установим Windows, драйверы и базовый пакет программ (Office, антивирус) в подарок."
  }
];

export default function Home() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"hits" | "new" | "sale">("hits");

  const { data: allProducts = [] } = trpc.products.list.useQuery();

  const filteredRecommendations = useMemo(() => {
    if (activeTab === "hits") {
      return allProducts.filter(p => p.featured).slice(0, 6);
    }
    if (activeTab === "new") {
      return [...allProducts].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 6);
    }
    if (activeTab === "sale") {
      return allProducts.filter(p => p.discountPrice).slice(0, 6);
    }
    return [];
  }, [allProducts, activeTab]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-emerald-500/20">
        <div className="container flex items-center justify-between py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <img src={LOGO_URL} alt="Terabayt.kz" className="w-10 h-10 rounded-lg object-cover ring-2 ring-emerald-500/50" />
            <span className="text-xl font-bold tracking-tight">Terabayt<span className="text-emerald-400">.kz</span></span>
          </motion.div>

          <div className="flex items-center gap-2 md:gap-6">
            <button
              onClick={() => navigate("/catalog")}
              className="text-sm md:text-base text-zinc-300 hover:text-emerald-400 transition-colors"
            >
              Каталог
            </button>
            <a
              href="https://wa.me/77072984386"
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/30 blur-3xl rounded-full" />
              <img 
                src={LOGO_URL} 
                alt="Terabayt.kz" 
                className="relative w-40 h-40 md:w-56 md:h-56 rounded-3xl object-cover ring-4 ring-emerald-500/40 shadow-2xl shadow-emerald-500/30"
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight"
          >
            Техника <span className="text-emerald-400">премиум</span> класса
            <br />
            <span className="text-2xl md:text-4xl text-zinc-400 font-bold">с гарантией и лучшим сервисом</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto"
          >
            Поможем выбрать идеальное устройство под ваши задачи и бюджет.
            Рассрочка 0-0-12 через Kaspi. Доставка по всему Казахстану.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={() => navigate("/catalog")}
              size="lg"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-14 px-8 text-lg rounded-2xl gap-2 shadow-xl shadow-emerald-500/20"
            >
              Перейти в каталог
              <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                Наши <span className="text-emerald-400">рекомендации</span>
              </h2>
              <p className="text-zinc-500 text-lg">
                Лучшие предложения, проверенные временем и нашими клиентами
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex p-1.5 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-800"
            >
              {[
                { id: "hits", label: "Хит", icon: Award },
                { id: "new", label: "Новинки", icon: Sparkles },
                { id: "sale", label: "Скидки", icon: Zap },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-black" : "text-emerald-400"}`} />
                  {tab.label}
                </button>
              ))}
            </motion.div>
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredRecommendations.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="group bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-6 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-zinc-900/50 rounded-2xl mb-6 flex items-center justify-center p-8 group-hover:scale-[1.02] transition-transform overflow-hidden">
                    {product.images?.[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="max-w-full max-h-full object-contain" 
                      />
                    ) : (
                      <Laptop className="w-16 h-16 text-zinc-800" />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-lg">
                        {product.brand}
                      </span>
                      {product.availability === "in_stock" ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          В наличии
                        </div>
                      ) : (
                        <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Под заказ</span>
                      )}
                    </div>

                    <h3 className="font-bold text-xl leading-tight line-clamp-2 group-hover:text-emerald-400 transition-colors">
                      {product.name}
                    </h3>

                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        {product.discountPrice && (
                          <span className="text-sm text-zinc-500 line-through">
                            {Number(product.discountPrice).toLocaleString()} ₸
                          </span>
                        )}
                        <span className="text-2xl font-black text-white">
                          {Number(product.price).toLocaleString()} ₸
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-emerald-500/20">
                        <ArrowRight className="w-6 h-6 text-black" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Button
              onClick={() => navigate("/catalog")}
              variant="outline"
              size="lg"
              className="border-zinc-800 text-white hover:bg-white/5 rounded-2xl px-12 h-14 font-bold"
            >
              Смотреть весь каталог
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 relative bg-zinc-950/50 border-y border-zinc-900">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-4">Вопросы и <span className="text-emerald-400">ответы</span></h2>
            <p className="text-zinc-500 text-lg">Часто задаваемые вопросы о нашей работе</p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-black border border-zinc-800 rounded-2xl p-6 md:p-8"
              >
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3 text-emerald-400">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-sm font-black">?</div>
                  {item.q}
                </h3>
                <p className="text-zinc-400 leading-relaxed pl-11">
                  {item.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-zinc-900 bg-black">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Terabayt.kz" className="w-10 h-10 rounded-lg object-cover" />
              <span className="text-xl font-bold tracking-tight">Terabayt<span className="text-emerald-400">.kz</span></span>
            </div>
            <div className="flex gap-6 text-zinc-500 text-sm">
              <p>© 2026 Terabayt.kz. Все права защищены.</p>
              <a href="https://wa.me/77072984386" className="hover:text-emerald-400 transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
