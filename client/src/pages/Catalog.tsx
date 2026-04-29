import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, ChevronLeft, ChevronRight, MessageCircle, 
  Package, Laptop, Smartphone, Printer, Home as HomeIcon, 
  ArrowRight, ArrowLeft, Star, Sun, Moon, Monitor, Mouse, Keyboard, Tablet, Speaker, Tv, Camera, Cpu, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";

const LOGO_URL = "/logo.png";

const brandLogos: Record<string, string> = {};

// Animation variants
const viewVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: "easeIn" } }
};

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

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
  Tag
};

export default function Catalog() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { theme, toggleTheme } = useTheme();

  const queryParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    queryParams.get("category") || null
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    queryParams.get("brand") || null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("category", selectedCategory.toString());
    if (selectedBrand) params.set("brand", selectedBrand);
    
    const newSearch = params.toString();
    if (newSearch !== searchString) {
      navigate(`/catalog?${newSearch}`, { replace: true });
    }
  }, [selectedCategory, selectedBrand, navigate, searchString]);

  const { data: products = [], isLoading } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: brandsList = [] } = trpc.brands.list.useQuery();

  const currentCategoryName = useMemo(() => {
    if (!selectedCategory) return "";
    return categories.find(c => String(c.id) === String(selectedCategory))?.name || "";
  }, [categories, selectedCategory]);

  const brands = useMemo(() => {
    if (!selectedCategory) return [];
    const brandIds = new Set(
      products
        .filter((p) => String(p.categoryId) === String(selectedCategory))
        .map((p) => Number(p.brandId))
    );
    return brandsList.filter(b => brandIds.has(Number(b.id)));
  }, [products, brandsList, selectedCategory]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter((p) => String(p.categoryId) === String(selectedCategory));
    }
    
    if (selectedBrand) {
      const selectedBrandObj = brandsList.find(b => b.name === selectedBrand);
      if (selectedBrandObj) {
        filtered = filtered.filter((p) => Number(p.brandId) === Number(selectedBrandObj.id));
      }
    }
    
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [products, selectedCategory, selectedBrand, searchQuery, brandsList]);

  const resetAll = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
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
              onClick={() => navigate("/")}
              className="hidden md:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-400 transition-colors"
            >
              <HomeIcon className="w-4 h-4" />
              Главная
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

      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative pt-24 pb-16">
        <div className="container">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <button onClick={resetAll} className="hover:text-emerald-400 transition-colors">
                Каталог
              </button>
              {selectedCategory && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <button
                    onClick={() => {
                      setSelectedBrand(null);
                    }}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {currentCategoryName}
                  </button>
                </>
              )}
              {selectedBrand && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-emerald-400 font-medium">
                    {selectedBrand}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black">
              {!selectedCategory ? (
                <>Выберите <span className="text-emerald-400">категорию</span></>
              ) : !selectedBrand ? (
                <>Бренды <span className="text-emerald-400">{currentCategoryName}</span></>
              ) : (
                <>{selectedBrand} <span className="text-emerald-400">{currentCategoryName}</span></>
              )}
            </h1>
          </motion.div>

          {/* Search bar */}
          {(selectedCategory) && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Поиск по названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                />
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* View: Categories */}
            {!isLoading && !selectedCategory && !selectedBrand && (
              <motion.div
                key="categories"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {categories.map((cat) => {
                  const Icon = categoryIconsMap[cat.icon || "Package"] || Package;
                  const count = products.filter(p => String(p.categoryId) === String(cat.id)).length;
                  return (
                    <motion.button
                      key={cat.id}
                      variants={itemVariants}
                      onClick={() => setSelectedCategory(String(cat.id))}
                      className="group bg-card border border-border hover:border-emerald-500/50 rounded-2xl p-8 transition-all text-left relative overflow-hidden"
                    >
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <Icon className="w-32 h-32" />
                      </div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-foreground">{cat.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{cat.description}</p>
                        <div className="flex items-center text-emerald-400 text-sm font-semibold">
                          {count} товаров
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {/* View: Brands */}
            {!isLoading && selectedCategory && !selectedBrand && (
              <motion.div
                key="brands"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all font-bold text-sm border border-emerald-500/20"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Назад к категориям
                  </button>
                  <div className="flex-1 text-right">
                    <p className="text-muted-foreground text-sm">
                      Выберите бренд в категории {currentCategoryName}
                    </p>
                  </div>
                </div>

                <motion.div 
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                >
                  {brands.map((brand) => {
                    const brandProducts = products.filter((p) => String(p.brandId) === String(brand.id) && String(p.categoryId) === String(selectedCategory));
                    const count = brandProducts.length;
                    
                    return (
                      <motion.button
                        key={brand.id}
                        variants={itemVariants}
                        onClick={() => setSelectedBrand(brand.name)}
                        className="group bg-card border border-border hover:border-emerald-500/50 rounded-2xl p-6 md:p-8 transition-all flex flex-col items-center text-center relative overflow-hidden"
                      >
                        <div className="w-full aspect-square bg-white rounded-xl flex items-center justify-center mb-4 p-4 group-hover:scale-105 transition-transform overflow-hidden">
                          {brand.logo ? (
                            <img 
                              src={brand.logo} 
                              alt={brand.name} 
                              className="w-full h-full object-contain transition-all" 
                            />
                          ) : (
                            <Star className="w-10 h-10 text-muted" />
                          )}
                        </div>
                        <h3 className="font-bold text-lg mb-1 text-foreground">{brand.name}</h3>
                        <p className="text-muted-foreground text-sm">{count} товаров</p>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </motion.div>
            )}

            {/* View: Products (Directly after Brand) */}
            {!isLoading && selectedBrand && (
              <motion.div
                key="products"
                variants={viewVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setSelectedBrand(null)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all font-bold text-sm border border-emerald-500/20"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Назад к брендам
                  </button>
                  <div className="flex-1 text-right">
                    <p className="text-muted-foreground text-sm">
                      {filteredProducts.length} товаров в {selectedBrand}
                    </p>
                  </div>
                </div>

                <motion.div 
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onClick={() => navigate(`/product/${product.id}`)} />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, onClick }: { product: any; onClick: () => void }) {
  return (
    <motion.div
      layout
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        // Небольшая задержка перед переходом для визуального фидбека клика
        setTimeout(onClick, 50);
      }}
      className="group bg-card border border-border hover:border-emerald-500/50 rounded-2xl p-5 transition-all cursor-pointer relative"
    >
      <div className="aspect-[4/3] w-full bg-white rounded-xl mb-4 flex items-center justify-center overflow-hidden group-hover:scale-[1.05] transition-transform duration-300">
        {product.images?.[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <Laptop className="w-12 h-12 text-muted" />
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded-md">
            {product.brand}
          </span>
          {product.availability === "in_stock" ? (
            <span className="text-[10px] text-muted-foreground">В наличии</span>
          ) : (
            <span className="text-[10px] text-red-500">Под заказ</span>
          )}
        </div>
        <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-emerald-400 transition-colors text-foreground">
          {product.name}
        </h3>
        <div className="pt-2 flex items-center justify-between">
          <div className="flex flex-col">
            {product.discountPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {Number(product.price).toLocaleString()} ₸
              </span>
            )}
            <span className="text-xl font-black text-foreground">
              {Number(product.discountPrice || product.price).toLocaleString()} ₸
            </span>
          </div>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
            <ArrowRight className="w-5 h-5 text-black" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
