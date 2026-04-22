import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, ChevronLeft, ChevronRight, MessageCircle, 
  Package, Laptop, Smartphone, Printer, Home as HomeIcon,
  ArrowRight, Star
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";

const LOGO_URL = "/logo.jpeg";

const brandLogos: Record<string, string> = {};

const categoryIcons: Record<string, any> = {
  "Ноутбуки": Laptop,
  "Смартфоны": Smartphone,
  "Принтеры": Printer,
};

export default function Catalog() {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading } = trpc.products.list.useQuery();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: brandsList = [] } = trpc.brands.list.useQuery();

  const currentCategoryName = useMemo(() => {
    return categories.find(c => c.id === selectedCategory)?.name || "";
  }, [categories, selectedCategory]);

  const brands = useMemo(() => {
    if (!selectedCategory) return [];
    const brandIds = new Set(
      products
        .filter((p) => p.categoryId === selectedCategory)
        .map((p) => p.brandId)
    );
    return brandsList.filter(b => brandIds.has(b.id));
  }, [products, brandsList, selectedCategory]);

  const models = useMemo(() => {
    if (!selectedBrand || !selectedCategory) return [];
    const selectedBrandObj = brandsList.find(b => b.name === selectedBrand);
    if (!selectedBrandObj) return [];
    
    const modelSet = new Set(
      products
        .filter((p) => p.categoryId === selectedCategory && p.brandId === selectedBrandObj.id)
        .map((p) => p.model)
    );
    return Array.from(modelSet).sort();
  }, [products, selectedBrand, selectedCategory, brandsList]);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory) filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    
    if (selectedBrand) {
      const selectedBrandObj = brandsList.find(b => b.name === selectedBrand);
      if (selectedBrandObj) {
        filtered = filtered.filter((p) => p.brandId === selectedBrandObj.id);
      }
    }
    
    if (selectedModel) filtered = filtered.filter((p) => p.model === selectedModel);
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [products, selectedCategory, selectedBrand, selectedModel, searchQuery, brandsList]);

  const resetAll = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedModel(null);
    setSearchQuery("");
  };

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
              onClick={() => navigate("/")}
              className="hidden md:inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-emerald-400 transition-colors"
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
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
              <button onClick={resetAll} className="hover:text-emerald-400 transition-colors">
                Каталог
              </button>
              {selectedCategory && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <button
                    onClick={() => {
                      setSelectedBrand(null);
                      setSelectedModel(null);
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
                  <button
                    onClick={() => {
                      setSelectedModel(null);
                    }}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {selectedBrand}
                  </button>
                </>
              )}
              {selectedModel && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-emerald-400 font-medium">
                    {selectedModel}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black">
              {!selectedCategory ? (
                <>Выберите <span className="text-emerald-400">категорию</span></>
              ) : !selectedBrand ? (
                <>Бренды <span className="text-emerald-400">{currentCategoryName}</span></>
              ) : !selectedModel ? (
                <>Выберите модель <span className="text-emerald-400">{selectedBrand}</span></>
              ) : (
                <>{selectedModel}</>
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Поиск по названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
                />
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* View: Categories */}
            {!isLoading && !selectedCategory && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {categories.map((cat) => {
                  const Icon = categoryIcons[cat.name] || Package;
                  const count = products.filter(p => p.categoryId === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="group bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-8 transition-all text-left relative overflow-hidden"
                    >
                      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                        <Icon className="w-32 h-32" />
                      </div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{cat.name}</h3>
                        <p className="text-zinc-500 text-sm mb-4">{cat.description}</p>
                        <div className="flex items-center text-emerald-400 text-sm font-semibold">
                          {count} товаров
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* View: Brands */}
            {!isLoading && selectedCategory && !selectedBrand && (
              <motion.div
                key="brands"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              >
                {brands.map((brand) => {
                  const brandProducts = products.filter((p) => p.brandId === brand.id && p.categoryId === selectedCategory);
                  const count = brandProducts.length;
                  
                  return (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrand(brand.name)}
                      className="group bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-6 md:p-8 transition-all flex flex-col items-center text-center relative overflow-hidden"
                    >
                      <div className="w-full aspect-square bg-zinc-900/50 rounded-xl flex items-center justify-center mb-4 p-4 group-hover:scale-105 transition-transform overflow-hidden">
                        {brand.logo ? (
                          <img 
                            src={brand.logo} 
                            alt={brand.name} 
                            className="w-full h-full object-contain transition-all" 
                          />
                        ) : (
                          <Star className="w-10 h-10 text-zinc-700" />
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-1">{brand.name}</h3>
                      <p className="text-zinc-500 text-sm">{count} моделей</p>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* View: Models */}
            {!isLoading && selectedBrand && !selectedModel && (
              <motion.div
                key="models"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              >
                {models.map((modelName) => {
                  const selectedBrandObj = brandsList.find(b => b.name === selectedBrand);
                  const modelProducts = products.filter(
                    (p) => p.brandId === selectedBrandObj?.id && p.model === modelName && p.categoryId === selectedCategory
                  );
                  const representativeImage = modelProducts.find(p => p.images?.[0])?.images?.[0];
                  
                  return (
                    <button
                      key={modelName}
                      onClick={() => setSelectedModel(modelName)}
                      className="group bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-6 md:p-8 transition-all flex flex-col items-center text-center relative overflow-hidden"
                    >
                      <div className="w-full aspect-square bg-zinc-900/50 rounded-xl flex items-center justify-center mb-4 p-4 group-hover:scale-105 transition-transform overflow-hidden">
                        {representativeImage ? (
                          <img 
                            src={representativeImage} 
                            alt={modelName} 
                            className="w-full h-full object-contain transition-all" 
                          />
                        ) : (
                          <Package className="w-10 h-10 text-zinc-700" />
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-1">{modelName}</h3>
                      <p className="text-emerald-400 text-sm font-semibold">Смотреть детали</p>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* View: Final Products (if multiple for one model) or Single Product List */}
            {!isLoading && selectedModel && (
              <motion.div
                key="products"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onClick={() => navigate(`/product/${product.id}`)} />
                ))}
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className="group bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="aspect-[4/3] bg-zinc-900/50 rounded-xl mb-4 flex items-center justify-center p-6 group-hover:scale-[1.02] transition-transform">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain" />
        ) : (
          <Laptop className="w-12 h-12 text-zinc-800" />
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded-md">
            {product.brand}
          </span>
          {product.availability === "in_stock" ? (
            <span className="text-[10px] text-zinc-500">В наличии</span>
          ) : (
            <span className="text-[10px] text-red-500">Под заказ</span>
          )}
        </div>
        <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-emerald-400 transition-colors">
          {product.name}
        </h3>
        <div className="pt-2 flex items-center justify-between">
          <div className="flex flex-col">
            {product.discountPrice && (
              <span className="text-xs text-zinc-500 line-through">
                {Number(product.discountPrice).toLocaleString()} ₸
              </span>
            )}
            <span className="text-xl font-black text-white">
              {Number(product.price).toLocaleString()} ₸
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
