import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Zap, Award, Phone, MapPin, Instagram, 
  ChevronLeft, ChevronRight, Truck, Headphones,
  Wallet, CheckCircle2, MessageCircle, ArrowRight,
  Plus, Minus, Star, Laptop, X, Sparkles, ChevronDown, Sun, Moon,
  Smartphone, Printer, Monitor, Mouse, Keyboard, Tablet, Speaker, Tv, Camera, Cpu, Tag, Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";

const LOGO_URL = "/logo.png";

// Icon mapping for display
const categoryIconsMap: Record<string, any> = {
  Laptop,
  Smartphone,
  Printer,
  Monitor,
  Mouse,
  Keyboard,
  Tablet,
  Speaker,
  Tv,
  Camera,
  Cpu,
  Tag,
  Package
};

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const FAQ = [
  {
    q: "Есть ли рассрочка?",
    a: "Да, вы можете приобрести любой товар в рассрочку 0-0-12 и 0-0-24 через Kaspi Red, Kaspi Bank и Halyk Bank без переплат."
  },
  {
    q: "Какая гарантия на технику?",
    a: "На всю электронику, смартфоны и компьютерную технику предоставляется официальная гарантия сроком на 12 месяцев."
  },
  {
    q: "Как работает доставка?",
    a: "По Алматы доставка осуществляется день в день. По Казахстану отправляем курьерскими службами, срок доставки 2-5 рабочих дней."
  },
  {
    q: "Предоставляете ли вы услуги по настройке техники?",
    a: "Да, при покупке компьютера или ноутбука мы бесплатно установим Windows, драйверы и базовый пакет программ (Office, антивирус) в подарок."
  }
];

function StatCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-card border border-border p-8 rounded-3xl hover:border-emerald-500/30 transition-all group">
      <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7 text-emerald-400" />
      </div>
      <h3 className="text-xl font-bold mb-4 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"hits" | "new" | "sale">("hits");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: allProducts = [] } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();

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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-emerald-500/20">
        <div className="container flex items-center justify-between py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={LOGO_URL} alt="Terabayt.kz" className="w-10 h-10 rounded-lg object-cover ring-2 ring-emerald-500/50" />
            <span className="text-xl font-bold tracking-tight">Terabayt<span className="text-emerald-400">.kz</span></span>
          </motion.div>

          <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
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
            <DropdownMenu>
              <DropdownMenuTrigger className="text-xs md:text-sm text-muted-foreground hover:text-emerald-400 transition-colors font-bold flex items-center gap-1 outline-none">
                Адреса <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                <DropdownMenuItem className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer">
                  <a 
                    href="https://2gis.kz/almaty/geo/9430047375008939/76.857766,43.206241" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col gap-1 w-full"
                  >
                    <span className="font-bold">Алматы</span>
                    <span className="text-xs text-muted-foreground">ул. Сауранбаева, 5</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer">
                  <a 
                    href="https://2gis.kz/shymkent/geo/70030076623874100/69.828292,42.418307" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col gap-1 w-full"
                  >
                    <span className="font-bold">Шымкент (Аксу)</span>
                    <span className="text-xs text-muted-foreground">ул. Абылай Хана, 58А</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={() => navigate("/catalog")}
              className="text-sm md:text-base text-muted-foreground hover:text-emerald-400 transition-colors"
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
            Terabayt.kz — интернет-магазин <br />
            <span className="text-emerald-400">электроники</span> в Казахстане
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Поможем выбрать идеальное устройство под ваши задачи и бюджет.
            Рассрочка 0-0-12 и 0-0-24 через Kaspi. Доставка по всему Казахстану.
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
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-14 px-8 text-lg rounded-2xl gap-2 shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              Открыть каталог
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
              <p className="text-muted-foreground text-lg">
                Лучшие предложения, проверенные временем и нашими клиентами
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex p-1.5 bg-muted/50 backdrop-blur-md rounded-2xl border border-border"
            >
              {[
                { id: "hits", label: "Хит" },
                { id: "new", label: "Новинки" },
                { id: "sale", label: "Скидки" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === tab.id
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
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
                  className="group bg-card border border-border hover:border-emerald-500/50 rounded-3xl p-6 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="aspect-[4/3] bg-white rounded-2xl mb-6 flex items-center justify-center overflow-hidden group-hover:scale-[1.05] transition-transform duration-300">
                    {product.images?.[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Laptop className="w-16 h-16 text-muted" />
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-lg">
                        {product.brand}
                      </span>
                      {product.availability === "in_stock" ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
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
                          <span className="text-sm text-muted-foreground line-through">
                            {Number(product.price).toLocaleString()} ₸
                          </span>
                        )}
                        <span className="text-2xl font-black text-foreground">
                          {Number(product.discountPrice || product.price).toLocaleString()} ₸
                        </span>
                      </div>
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-colors">
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
              className="border-border text-foreground hover:bg-accent rounded-2xl px-12 h-14 font-bold"
            >
              Смотреть весь каталог
            </Button>
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="py-24 relative overflow-hidden">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-foreground">
              Почему выбирают <span className="text-emerald-400">нас</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Мы создаем лучший сервис для покупки электроники в Казахстане, 
              сочетая качество товара с профессиональной поддержкой.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard 
              icon={Zap}
              title="Быстрая доставка"
              description="Доставка по Алматы в день заказа. По всему Казахстану в кратчайшие сроки надежными курьерскими службами."
            />
            <StatCard 
              icon={Award}
              title="Гарантия качества"
              description="Официальная гарантия 12 месяцев на всю технику. Мы работаем только с проверенными брендами и поставщиками."
            />
            <StatCard 
              icon={Headphones}
              title="Поддержка 24/7"
              description="Наши консультанты всегда готовы помочь с выбором или настройкой вашей новой техники через WhatsApp или по телефону."
            />
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 relative bg-accent/5 border-y border-border">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-foreground">
              Частые <span className="text-emerald-400">вопросы</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Всё, что вам нужно знать о покупке и сервисе
            </p>
          </motion.div>

          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="bg-card border border-border hover:border-emerald-500/30 rounded-2xl p-6 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground group-hover:text-emerald-400 transition-colors">
                    {item.q}
                  </h3>
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors shrink-0 ml-4">
                    {openFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </div>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.p
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      className="text-muted-foreground text-sm leading-relaxed overflow-hidden"
                    >
                      {item.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO SECTION */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-5xl font-black text-foreground">
              О магазине <span className="text-emerald-400">Terabayt.kz</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
              Мы верим, что качественная техника должна быть доступной. В Terabayt.kz мы не просто продаем электронику — мы помогаем вам найти надежного помощника для работы, творчества и развлечений. Наша команда обеспечивает профессиональную поддержку, официальную гарантию и быструю доставку в любую точку Казахстана, чтобы вы могли наслаждаться покупкой без лишних забот.
            </p>
            <p className="text-muted-foreground text-sm italic mt-4">
              Премиальный выбор ноутбуков, смартфонов и принтеров с профессиональным сервисом в Казахстане.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacts" className="py-20 border-t border-border bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <img src={LOGO_URL} alt="Terabayt.kz" className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20" />
                <span className="text-2xl font-bold tracking-tight text-foreground">Terabayt<span className="text-emerald-400">.kz</span></span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Ваш надежный партнер в мире премиальной техники. 
                Премиальный выбор ноутбуков, смартфонов и принтеров с профессиональным сервисом в Казахстане.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-bold text-foreground uppercase tracking-wider">Контакты</h4>
              <ul className="space-y-4">
                <li>
                  <a 
                    href="https://2gis.kz/almaty/geo/9430047375008939/76.857766,43.206241" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition-colors">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium group-hover:text-emerald-400 transition-colors">г. Алматы, ул. Сауранбаева, 5</p>
                      <p className="text-xs text-muted-foreground">Открыть в 2GIS</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://2gis.kz/shymkent/geo/70030076623874100/69.828292,42.418307" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition-colors">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-foreground font-medium group-hover:text-emerald-400 transition-colors">г. Шымкент (Аксу), ул. Абылай Хана, 58А</p>
                      <p className="text-xs text-muted-foreground">Открыть в 2GIS</p>
                    </div>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://wa.me/77072002225" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition-colors">
                      <Phone className="w-5 h-5 text-emerald-400" />
                    </div>
                    <p className="text-foreground font-medium group-hover:text-emerald-400 transition-colors">+7 707 200 22 25</p>
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-bold text-foreground uppercase tracking-wider">Соцсети</h4>
              <div className="flex flex-col gap-4">
                <a 
                  href="https://www.instagram.com/terabayt.kz_aksu?igsh=MThhMHVxMTdwdjkzNg==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center hover:bg-emerald-500/10 hover:text-emerald-400 transition-all group">
                    <Instagram className="w-6 h-6 text-muted-foreground group-hover:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium group-hover:text-emerald-400 transition-colors">terabayt.kz_aksu</p>
                    <p className="text-xs text-muted-foreground">Instagram</p>
                  </div>
                </a>
                <a 
                  href="https://www.tiktok.com/@terabayt.kz?_r=1&_t=ZS-95lFxgBWvtY" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-300 group">
                    <TikTokIcon className="w-7 h-7 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium group-hover:text-emerald-400 transition-colors">terabayt.kz</p>
                    <p className="text-xs text-muted-foreground">TikTok</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">© 2026 Terabayt.kz. Все права защищены.</p>
            <div className="flex gap-6">
              <button onClick={() => navigate("/catalog")} className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors">Каталог</button>
              <a href="https://wa.me/77072002225" className="text-sm text-muted-foreground hover:text-emerald-400 transition-colors">Помощь</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
