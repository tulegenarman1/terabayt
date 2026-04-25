import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Trash2, Pencil, LogOut, Package, Tag, 
  ShieldCheck, Star, Search, X, Image as ImageIcon,
  ChevronDown, ChevronUp, Sun, Moon, Download,
  Laptop, Smartphone, Printer, Monitor, Mouse, Keyboard, Tablet, Speaker, Tv, Camera, Cpu
} from "lucide-react";

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
  Tag // fallback
};

const iconOptions = [
  { name: "Ноутбук", value: "Laptop", icon: Laptop },
  { name: "Телефон", value: "Smartphone", icon: Smartphone },
  { name: "Принтер", value: "Printer", icon: Printer },
  { name: "Монитор", value: "Monitor", icon: Monitor },
  { name: "Мышь", value: "Mouse", icon: Mouse },
  { name: "Клавиатура", value: "Keyboard", icon: Keyboard },
  { name: "Планшет", value: "Tablet", icon: Tablet },
  { name: "Колонки", value: "Speaker", icon: Speaker },
  { name: "Телевизор", value: "Tv", icon: Tv },
  { name: "Камера", value: "Camera", icon: Camera },
  { name: "Процессор/ПК", value: "Cpu", icon: Cpu },
];
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import ImageEditor from "@/components/ImageEditor";

const LOGO_URL = "/logo.jpeg";
type Tab = "products" | "categories" | "brands";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState<Tab>("products");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("admin_authenticated");
    if (!isAuthenticated) navigate("/admin/login");
  }, [navigate]);

  const { data: products = [], refetch: refetchProducts, error: productsError } = trpc.products.list.useQuery();
  const { data: categories = [], refetch: refetchCategories, error: categoriesError } = trpc.categories.list.useQuery();
  const { data: brands = [], refetch: refetchBrands, error: brandsError } = trpc.brands.list.useQuery();

  useEffect(() => {
     if (productsError?.message.includes("10001") || categoriesError?.message.includes("10001") || brandsError?.message.includes("10001")) {
       localStorage.removeItem("admin_authenticated");
       navigate("/admin/login");
     }
   }, [productsError, categoriesError, brandsError, navigate]);

   const deleteProductMutation = trpc.products.delete.useMutation();
   const deleteCategoryMutation = trpc.categories.delete.useMutation();
   const deleteBrandMutation = trpc.brands.delete.useMutation();
   const toggleFeaturedMutation = trpc.products.toggleFeatured.useMutation();

   const handleDeleteProduct = async (id: number) => {
     if (!confirm("Удалить товар?")) return;
    try {
      await deleteProductMutation.mutateAsync(id);
      toast.success("Товар удалён");
      refetchProducts();
    } catch {
      toast.error("Ошибка при удалении");
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = async (id: any) => {
    if (!confirm("Удалить категорию?")) return;
    try {
      await deleteCategoryMutation.mutateAsync(String(id));
      toast.success("Категория удалена");
      refetchCategories();
    } catch {
      toast.error("Ошибка при удалении");
    }
  };

  const handleEditBrand = (brand: any) => {
    setEditingBrand(brand);
    setShowForm(true);
  };

  const handleDeleteBrand = async (id: number) => {
    if (!confirm("Удалить бренд?")) return;
    try {
      await deleteBrandMutation.mutateAsync(id);
      toast.success("Бренд удалён");
      refetchBrands();
    } catch {
      toast.error("Ошибка при удалении");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_login_time");
    navigate("/");
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredCount = products.filter((p) => p.featured).length;
  const inStockCount = products.filter((p) => p.availability === "in_stock").length;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Terabayt.kz"
              className="w-10 h-10 rounded-lg object-cover ring-2 ring-emerald-500/50"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">
                  Terabayt<span className="text-emerald-400">.kz</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-medium">Админ</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">Панель управления</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
              title={theme === "dark" ? "Светлая тема" : "Темная тема"}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-emerald-600" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors px-4 py-2 border border-border hover:border-destructive/50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выход</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Всего товаров" value={products.length} icon={Package} />
          <StatCard label="В наличии" value={inStockCount} icon={ShieldCheck} accent />
          <StatCard label="Избранных" value={featuredCount} icon={Star} />
          <StatCard label="Категорий" value={categories.length} icon={Tag} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-card border border-border rounded-xl p-1 w-fit">
          <button
            onClick={() => { setTab("products"); setShowForm(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "products"
                ? "bg-emerald-500 text-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="w-4 h-4 inline mr-2" />
            Товары
          </button>
          <button
            onClick={() => { setTab("categories"); setShowForm(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "categories"
                ? "bg-emerald-500 text-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            Категории
          </button>
          <button
            onClick={() => { setTab("brands"); setShowForm(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "brands"
                ? "bg-emerald-500 text-black"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className="w-4 h-4 inline mr-2" />
            Бренды
          </button>
        </div>

        {/* Products Tab */}
        {tab === "products" && (
          <div>
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Поиск по названию или бренду..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:border-emerald-500"
                />
              </div>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(!showForm);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                {showForm ? "Закрыть форму" : "Добавить товар"}
              </Button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-card border border-emerald-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">
                        {editingProduct ? "Редактирование товара" : "Новый товар"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setEditingProduct(null);
                        }}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <ProductForm
                      editingProduct={editingProduct}
                      onClose={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                      }}
                      onSuccess={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                        refetchProducts();
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Products Table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Товар</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Бренд</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Цена</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Статус</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Хит</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate max-w-xs">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{product.brand}</td>
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="text-emerald-400 font-semibold">
                              {parseFloat(String(product.discountPrice || product.price)).toLocaleString()} ₸
                            </p>
                            {product.discountPrice && (
                              <p className="text-xs text-muted-foreground line-through">
                                {parseFloat(String(product.price)).toLocaleString()} ₸
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              product.availability === "in_stock"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/10 text-red-400 border border-red-500/30"
                            }`}
                          >
                            {product.availability === "in_stock" ? "В наличии" : "Нет"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={product.featured || false}
                              disabled={toggleFeaturedMutation.isPending}
                              onChange={(e) => {
                                toggleFeaturedMutation.mutate(
                                  { id: product.id, isFeatured: e.target.checked },
                                  {
                                    onSuccess: () => refetchProducts(),
                                    onError: () => toast.error("Ошибка при обновлении"),
                                  }
                                );
                              }}
                              className="sr-only peer"
                            />
                            <div className="relative w-10 h-5 bg-muted rounded-full peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                          </label>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={() => handleEditProduct(product)}
                              size="sm"
                              variant="outline"
                              className="border-border bg-transparent text-muted-foreground hover:border-emerald-500 hover:text-emerald-400 gap-1.5"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Редактировать</span>
                            </Button>
                            <Button
                              onClick={() => handleDeleteProduct(product.id)}
                              size="sm"
                              variant="outline"
                              className="border-border bg-transparent text-muted-foreground hover:border-red-500 hover:text-red-400 gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Удалить</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                          {searchQuery ? "Товары не найдены" : "Нет товаров"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {tab === "categories" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">Управление категориями товаров</p>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setShowForm(!showForm);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                {showForm ? "Закрыть форму" : "Добавить категорию"}
              </Button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-card border border-emerald-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">
                        {editingCategory ? "Редактирование категории" : "Новая категория"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setEditingCategory(null);
                        }}
                        className="text-muted-foreground hover:text-foreground p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <CategoryForm
                      editingCategory={editingCategory}
                      onClose={() => {
                        setShowForm(false);
                        setEditingCategory(null);
                      }}
                      onSuccess={() => {
                        setShowForm(false);
                        setEditingCategory(null);
                        refetchCategories();
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const IconComp = categoryIconsMap[category.icon || "Tag"] || Tag;
                return (
                  <div
                    key={category.id}
                    className="bg-card border border-border hover:border-emerald-500/30 rounded-xl p-5 transition-all group"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <IconComp className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate">{category.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{category.description || "—"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditCategory(category)}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-border bg-transparent text-muted-foreground hover:border-emerald-500 hover:text-emerald-400 gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Изменить
                      </Button>
                      <Button
                        onClick={() => handleDeleteCategory(category.id)}
                        size="sm"
                        variant="outline"
                        className="flex-1 border-border bg-transparent text-muted-foreground hover:border-red-500 hover:text-red-400 gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Удалить
                      </Button>
                    </div>
                  </div>
                );
              })}
              {categories.length === 0 && (
                <div className="col-span-full bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                  Нет категорий
                </div>
              )}
            </div>
          </div>
        )}

        {/* Brands Tab */}
        {tab === "brands" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">Управление брендами товаров</p>
              <Button
                onClick={() => {
                  setEditingBrand(null);
                  setShowForm(!showForm);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                {showForm ? "Закрыть форму" : "Добавить бренд"}
              </Button>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-card border border-emerald-500/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-6">
                      {editingBrand ? "Редактирование бренда" : "Новый бренд"}
                    </h3>
                    <BrandForm
                      editingBrand={editingBrand}
                      onClose={() => {
                        setShowForm(false);
                        setEditingBrand(null);
                      }}
                      onSuccess={() => {
                        setShowForm(false);
                        setEditingBrand(null);
                        refetchBrands();
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="bg-card border border-border hover:border-emerald-500/30 rounded-xl p-5 transition-all group flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-xl bg-white flex items-center justify-center mb-4 overflow-hidden p-2">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Star className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-bold text-foreground mb-4">{brand.name}</h3>
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={() => handleEditBrand(brand)}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border bg-transparent text-muted-foreground hover:border-emerald-500 hover:text-emerald-400"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteBrand(brand.id)}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border bg-transparent text-muted-foreground hover:border-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {brands.length === 0 && (
                <div className="col-span-full bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                  Нет брендов
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: any; accent?: boolean }) {
  return (
    <div className={`bg-card border ${accent ? "border-emerald-500/30" : "border-border"} rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? "bg-emerald-500/20" : "bg-muted"}`}>
          <Icon className={`w-5 h-5 ${accent ? "text-emerald-400" : "text-muted-foreground"}`} />
        </div>
      </div>
      <div className="text-3xl font-black text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

const inputClass = "bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20";

function SpecInput({ label, name, value, onChange, options }: { 
  label: string; 
  name: string; 
  value?: string; 
  onChange: (name: string, value: string) => void; 
  options: string[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  
  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes((value || "").toLowerCase())
  );

  return (
    <div className="relative">
      <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <Input
          value={value || ""}
          onChange={(e) => {
            onChange(name, e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`${inputClass} pr-10`}
          placeholder={`Выберите или введите ${label.toLowerCase()}...`}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-emerald-400 transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && filteredOptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute z-[100] w-full mt-1 bg-card border border-border rounded-md shadow-2xl max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-border"
            >
              {filteredOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(name, opt);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors border-b border-border/50 last:border-0"
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {isOpen && (
        <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

async function uploadImage(file: File): Promise<string> {
  console.log("uploadImage started for file:", file.name, file.size, file.type);
  const formData = new FormData();
  formData.append("image", file);
  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    console.log("uploadImage response status:", res.status);
    if (!res.ok) {
      const errorData = await res.json();
      console.error("uploadImage error response:", errorData);
      throw new Error(errorData.error || "Ошибка при загрузке изображения");
    }
    const data = await res.json();
    console.log("uploadImage success, url:", data.url);
    return data.url;
  } catch (error) {
    console.error("uploadImage fetch/processing error:", error);
    throw error;
  }
}

function ProductForm({
  editingProduct,
  onClose,
  onSuccess,
}: {
  editingProduct?: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    categoryId: editingProduct?.categoryId || "",
    brandId: editingProduct?.brandId || 0,
    name: editingProduct?.name || "",
    brand: editingProduct?.brand || "",
    model: editingProduct?.model || "",
    price: editingProduct?.price || "",
    discountPrice: editingProduct?.discountPrice || "",
    kaspiLink: editingProduct?.kaspiLink || "",
    availability: (editingProduct?.availability || "in_stock") as "in_stock" | "out_of_stock" | "coming_soon",
    featured: editingProduct?.featured || false,
    specs: editingProduct?.specs || {},
  });
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: brands = [] } = trpc.brands.list.useQuery();
  const scrapeKaspiMutation = trpc.admin.scrapeKaspiImage.useMutation();

  const getSelectedCategory = () => categories.find(c => c.id === formData.categoryId);

  const handleKaspiLinkChange = (url: string) => {
    setFormData(prev => ({ ...prev, kaspiLink: url }));
  };

  const handleFetchKaspiImage = async () => {
    const url = formData.kaspiLink;
    if (!url || !url.includes("kaspi.kz")) {
      toast.error("Сначала вставьте корректную ссылку на Kaspi.kz");
      return;
    }

    try {
      const res = await scrapeKaspiMutation.mutateAsync({ url });
      if (res.imageUrl) {
        setImageToEdit(res.imageUrl);
        toast.success("Фото получено из Kaspi");
      }
    } catch (err: any) {
      toast.error(err.message || "Не удалось получить фото");
    }
  };

  const handleSpecChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [name]: value }
    }));
  };

  // Автовыбор первой категории если не выбрана
  useEffect(() => {
    if (!formData.categoryId && categories.length > 0) {
      setFormData((prev) => ({ ...prev, categoryId: categories[0].id }));
    }
    if (!formData.brandId && brands.length > 0) {
      setFormData((prev) => ({ ...prev, brandId: brands[0].id, brand: brands[0].name }));
    }
  }, [categories, brands, formData.categoryId, formData.brandId]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(editingProduct?.images?.[0] || "");
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageToEdit(reader.result as string);
      reader.readAsDataURL(file);
    }
    // Очищаем input, чтобы можно было выбрать тот же файл повторно
    e.target.value = "";
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "product_image.webp", { type: "image/webp" });
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setImageToEdit(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error("Сначала выберите категорию");
      return;
    }
    if (!formData.brandId) {
      toast.error("Сначала создайте бренд");
      return;
    }
    try {
      setIsUploading(true);
      let imageUrl = imagePreview;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (editingProduct) {
        await updateMutation.mutateAsync({
          id: editingProduct.id,
          data: {
            categoryId: String(formData.categoryId),
            brandId: formData.brandId,
            name: formData.name,
            brand: formData.brand,
            model: formData.model,
            price: formData.price.toString(),
            discountPrice: formData.discountPrice ? formData.discountPrice.toString() : undefined,
            specs: formData.specs,
            kaspiLink: formData.kaspiLink,
            availability: formData.availability,
            featured: formData.featured,
            images: imageUrl ? [imageUrl] : editingProduct.images || [],
          },
        });
        toast.success("Товар обновлён");
      } else {
        await createMutation.mutateAsync({
          ...formData,
          categoryId: String(formData.categoryId),
          price: formData.price.toString(),
          discountPrice: formData.discountPrice ? formData.discountPrice.toString() : undefined,
          images: imageUrl ? [imageUrl] : [],
          specs: formData.specs,
        });
        toast.success("Товар добавлен");
      }
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при сохранении");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Название</label>
          <Input
            placeholder="ASUS ROG Strix G15..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Бренд</label>
          <select
            value={formData.brandId || ""}
            onChange={(e) => {
              const val = e.target.value;
              const selectedBrand = brands.find(b => String(b.id) === String(val));
              setFormData({ 
                ...formData, 
                brandId: val ? (isNaN(Number(val)) ? val : Number(val)) : 0,
                brand: selectedBrand?.name || ""
              });
            }}
            className="w-full h-9 bg-background border border-border rounded-md px-3 text-foreground text-sm focus:border-emerald-500 focus:outline-none"
            required
          >
            <option value="" disabled>
              {brands.length === 0 ? "Сначала создайте бренд" : "Выберите бренд"}
            </option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Модель</label>
          <Input
            placeholder="Pavilion, Envy, ROG..."
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Цена (₸)</label>
          <Input
            placeholder="450000"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Цена со скидкой (опц.)</label>
          <Input
            placeholder="399000"
            value={formData.discountPrice}
            onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Ссылка Kaspi.kz</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="https://kaspi.kz/shop/p/..."
                value={formData.kaspiLink}
                onChange={(e) => handleKaspiLinkChange(e.target.value)}
                className={`${inputClass} pr-10`}
              />
              {scrapeKaspiMutation.isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={handleFetchKaspiImage}
              disabled={scrapeKaspiMutation.isLoading || !formData.kaspiLink}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 h-9"
              title="Загрузить первое фото товара с Kaspi"
            >
              <Download className="w-4 h-4 mr-1" />
              Фото
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground italic mt-1">Вставьте ссылку и нажмите «Фото», чтобы подтянуть изображение</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Категория</label>
          <select
            value={formData.categoryId || ""}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full h-9 bg-background border border-border rounded-md px-3 text-foreground text-sm focus:border-emerald-500 focus:outline-none"
            required
          >
            <option value="" disabled>
              {categories.length === 0 ? "Сначала создайте категорию" : "Выберите категорию"}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Наличие</label>
          <select
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
            className="w-full h-9 bg-background border border-border rounded-md px-3 text-foreground text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="in_stock">В наличии</option>
            <option value="out_of_stock">Нет в наличии</option>
            <option value="coming_soon">Скоро</option>
          </select>
        </div>
      </div>

      {/* Dynamic Specs Section */}
      <div className="space-y-4 border-t border-border pt-5">
        <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Характеристики</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {getSelectedCategory()?.slug.includes("laptop") || getSelectedCategory()?.name.toLowerCase().includes("ноутбук") ? (
            <>
              <SpecInput
                label="Процессор"
                name="cpu"
                value={formData.specs.cpu}
                onChange={handleSpecChange}
                options={[
                  "Intel Core i3-1215U", "Intel Core i3-1315U", "Intel Core i5-1235U", "Intel Core i5-12450H", "Intel Core i5-1335U", 
                  "Intel Core i5-13420H", "Intel Core i5-13500H", "Intel Core i5-12500H", "Intel Core i7-1255U", "Intel Core i7-12650H", 
                  "Intel Core i7-1355U", "Intel Core i7-13620H", "Intel Core i7-13700H", "Intel Core i7-14700H", "Intel Core i9-13900H", 
                  "Intel Core i9-13980HX", "Intel Core i9-14900HX", "Intel Core Ultra 5 125H", "Intel Core Ultra 7 155H",
                  "AMD Ryzen 3 5300U", "AMD Ryzen 3 7320U", "AMD Ryzen 5 5500U", "AMD Ryzen 5 5600H", "AMD Ryzen 5 7520U", 
                  "AMD Ryzen 5 7535HS", "AMD Ryzen 7 5700U", "AMD Ryzen 7 5800H", "AMD Ryzen 7 7730U", "AMD Ryzen 7 7735HS", 
                  "AMD Ryzen 7 7840HS", "AMD Ryzen 9 7940HS", "AMD Ryzen 9 8945HS",
                  "Apple M1", "Apple M1 Pro", "Apple M1 Max", "Apple M2", "Apple M2 Pro", "Apple M2 Max", "Apple M3", "Apple M3 Pro", "Apple M3 Max"
                ]}
              />
              <SpecInput
                label="Оперативная память"
                name="ram"
                value={formData.specs.ram}
                onChange={handleSpecChange}
                options={[
                  "4 ГБ DDR4", "8 ГБ DDR4", "16 ГБ DDR4", "32 ГБ DDR4",
                  "8 ГБ LPDDR5", "16 ГБ LPDDR5", "32 ГБ LPDDR5x",
                  "8 ГБ DDR5", "16 ГБ DDR5", "32 ГБ DDR5", "64 ГБ DDR5",
                  "8 ГБ Unified Memory", "16 ГБ Unified Memory", "24 ГБ Unified Memory", "36 ГБ Unified Memory"
                ]}
              />
              <SpecInput
                label="Накопитель"
                name="storage"
                value={formData.specs.storage}
                onChange={handleSpecChange}
                options={["128 ГБ SSD", "256 ГБ SSD", "512 ГБ SSD", "1 ТБ SSD", "2 ТБ SSD", "4 ТБ SSD"]}
              />
              <SpecInput
                label="Видеокарта"
                name="gpu"
                value={formData.specs.gpu}
                onChange={handleSpecChange}
                options={[
                  "Встроенная (Intel UHD/Iris Xe)", "Встроенная (AMD Radeon)", "Apple GPU (7-core)", "Apple GPU (8-core)", "Apple GPU (10-core)",
                  "NVIDIA GeForce GTX 1650", "NVIDIA GeForce RTX 2050", "NVIDIA GeForce RTX 3050",
                  "NVIDIA GeForce RTX 3050 Ti", "NVIDIA GeForce RTX 3060", "NVIDIA GeForce RTX 4050",
                  "NVIDIA GeForce RTX 4060", "NVIDIA GeForce RTX 4070", "NVIDIA GeForce RTX 4080", "NVIDIA GeForce RTX 4090"
                ]}
              />
              <SpecInput
                label="Экран"
                name="display"
                value={formData.specs.display}
                onChange={handleSpecChange}
                options={[
                  "13.3\" IPS Retina", "13.6\" Liquid Retina", "14\" IPS FHD+", "14\" OLED 2.8K", "14.2\" Liquid Retina XDR",
                  "15.6\" IPS FHD 60Hz", "15.6\" IPS FHD 144Hz", "15.6\" OLED FHD", "16\" IPS 2.5K 165Hz", "16\" OLED 3.2K", "16.2\" Liquid Retina XDR",
                  "17.3\" IPS FHD 144Hz", "17.3\" IPS 2K 240Hz"
                ]}
              />
              <SpecInput
                label="ОС"
                name="os"
                value={formData.specs.os}
                onChange={handleSpecChange}
                options={["Windows 11 Home", "Windows 11 Pro", "macOS Sonoma", "Без ОС (FreeDOS)", "Ubuntu Linux"]}
              />
              <SpecInput
                label="Аккумулятор"
                name="battery"
                value={formData.specs.battery}
                onChange={handleSpecChange}
                options={["45 Вт·ч", "50 Вт·ч", "60 Вт·ч", "70 Вт·ч", "80 Вт·ч", "90+ Вт·ч"]}
              />
              <SpecInput
                label="Вес"
                name="weight"
                value={formData.specs.weight}
                onChange={handleSpecChange}
                options={["1.2 кг", "1.4 кг", "1.6 кг", "1.8 кг", "2.1 кг", "2.4 кг"]}
              />
            </>
          ) : getSelectedCategory()?.slug.includes("phone") || getSelectedCategory()?.name.toLowerCase().includes("телефон") || getSelectedCategory()?.name.toLowerCase().includes("смартфон") ? (
            <>
              <SpecInput
                label="Процессор"
                name="cpu"
                value={formData.specs.cpu}
                onChange={handleSpecChange}
                options={[
                  "Apple A15 Bionic", "Apple A16 Bionic", "Apple A17 Pro", "Apple A18", "Apple A18 Pro",
                  "Snapdragon 8 Gen 2", "Snapdragon 8 Gen 3", "Snapdragon 8s Gen 3", "Snapdragon 7+ Gen 3", "Snapdragon 6 Gen 1",
                  "Exynos 2200", "Exynos 2400", "Dimensity 9200+", "Dimensity 9300", "Google Tensor G3"
                ]}
              />
              <SpecInput
                label="Оперативная память"
                name="ram"
                value={formData.specs.ram}
                onChange={handleSpecChange}
                options={["4 ГБ", "6 ГБ", "8 ГБ", "12 ГБ", "16 ГБ", "24 ГБ"]}
              />
              <SpecInput
                label="Встроенная память"
                name="storage"
                value={formData.specs.storage}
                onChange={handleSpecChange}
                options={["64 ГБ", "128 ГБ", "256 ГБ", "512 ГБ", "1 ТБ"]}
              />
              <SpecInput
                label="Экран"
                name="display"
                value={formData.specs.display}
                onChange={handleSpecChange}
                options={[
                  "6.1\" Super Retina XDR", "6.7\" Super Retina XDR", "6.1\" OLED 120Hz", "6.7\" AMOLED 120Hz",
                  "6.8\" Dynamic AMOLED 2X", "6.36\" OLED", "6.78\" AMOLED 144Hz"
                ]}
              />
              <SpecInput
                label="ОС"
                name="os"
                value={formData.specs.os}
                onChange={handleSpecChange}
                options={["iOS 17", "iOS 18", "Android 13", "Android 14", "Android 15"]}
              />
              <SpecInput
                label="Цвет"
                name="color"
                value={formData.specs.color}
                onChange={handleSpecChange}
                options={[
                  "Space Black", "Silver", "Gold", "Deep Purple", "Titanium Gray", "Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium",
                  "Phantom Black", "Cream", "Green", "Lavender", "Sky Blue", "Graphite"
                ]}
              />
              <SpecInput
                label="Камера"
                name="camera"
                value={formData.specs.camera}
                onChange={handleSpecChange}
                options={["12 Мп", "48 Мп", "50 Мп", "108 Мп", "200 Мп", "Тройная 50+50+50 Мп", "Тройная 48+12+12 Мп"]}
              />
              <SpecInput
                label="Аккумулятор"
                name="battery"
                value={formData.specs.battery}
                onChange={handleSpecChange}
                options={["3000 мАч", "4000 мАч", "4500 мАч", "5000 мАч", "5500 мАч", "6000 мАч"]}
              />
              <SpecInput
                label="SIM-карты"
                name="sim"
                value={formData.specs.sim}
                onChange={handleSpecChange}
                options={["1 SIM", "2 SIM", "SIM + eSIM", "Dual eSIM"]}
              />
              <SpecInput
                label="NFC"
                name="nfc"
                value={formData.specs.nfc}
                onChange={handleSpecChange}
                options={["Есть", "Нет"]}
              />
            </>
          ) : getSelectedCategory()?.slug.includes("printer") || getSelectedCategory()?.name.toLowerCase().includes("принтер") ? (
            <>
              <SpecInput
                label="Тип принтера"
                name="type"
                value={formData.specs.type}
                onChange={handleSpecChange}
                options={["Лазерный", "Струйный", "МФУ (Лазерный)", "МФУ (Струйный)", "Термопринтер", "Фотопринтер"]}
              />
              <SpecInput
                label="Цветность"
                name="color"
                value={formData.specs.color}
                onChange={handleSpecChange}
                options={["Черно-белый (Монохромный)", "Цветной"]}
              />
              <SpecInput
                label="Скорость печати"
                name="speed"
                value={formData.specs.speed}
                onChange={handleSpecChange}
                options={["До 18 стр/мин", "20-25 стр/мин", "30-35 стр/мин", "40+ стр/мин"]}
              />
              <SpecInput
                label="Разрешение сканера"
                name="scanner"
                value={formData.specs.scanner}
                onChange={handleSpecChange}
                options={["Нет сканера", "600x600 dpi", "1200x1200 dpi", "2400x2400 dpi"]}
              />
              <SpecInput
                label="Интерфейс"
                name="interface"
                value={formData.specs.interface}
                onChange={handleSpecChange}
                options={["USB 2.0", "Wi-Fi + USB", "Ethernet + Wi-Fi + USB", "Bluetooth + Wi-Fi", "USB + Bluetooth"]}
              />
              <SpecInput
                label="Формат печати"
                name="format"
                value={formData.specs.format}
                onChange={handleSpecChange}
                options={["A4", "A3", "A4, A5, B5", "10x15 см", "A6"]}
              />
            </>
          ) : (
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground mb-2 italic text-center">Используйте общее описание или добавьте характеристики вручную.</p>
            </div>
          )}

          <div className="col-span-2 flex justify-center pb-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const key = prompt("Название характеристики (например, 'Материал' или 'Вес'):");
                if (key) {
                  setFormData({
                    ...formData,
                    specs: { ...formData.specs, [key]: "" }
                  });
                }
              }}
              className="border-border bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 border-dashed"
            >
              <Plus className="w-3.5 h-3.5 mr-2" />
              Добавить свою характеристику
            </Button>
          </div>
          
          {/* Custom specs that might have been added */}
          {Object.entries(formData.specs).map(([key, value]) => {
            const standardKeys = ["cpu", "ram", "storage", "gpu", "display", "os", "type", "color", "speed", "interface", "camera", "battery", "sim", "nfc", "format"];
            if (standardKeys.includes(key)) return null;
            return (
              <div key={key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider flex justify-between">
                  {key}
                  <button 
                    type="button" 
                    onClick={() => {
                      const newSpecs = { ...formData.specs };
                      delete newSpecs[key];
                      setFormData({ ...formData, specs: newSpecs });
                    }}
                    className="text-red-500 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </label>
                <Input
                  value={value as string}
                  onChange={(e) => handleSpecChange(key, e.target.value)}
                  className={inputClass}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider flex justify-between">
          Фото товара
          <span className="text-[10px] lowercase font-normal italic">Рекомендуемый размер: 800x600 px</span>
        </label>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 file:cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP до 2 МБ. Обрезка 4:3.</p>
          </div>
          {imagePreview && (
            <div className="w-32 h-24 relative rounded-lg border border-border overflow-visible bg-white">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-contain" 
              />
            </div>
          )}
        </div>
      </div>
      {imageToEdit && (
        <ImageEditor
          image={imageToEdit}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToEdit(null)}
          aspect={800 / 600}
        />
      )}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending || isUploading}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20"
        >
          {createMutation.isPending || updateMutation.isPending || isUploading
            ? "Сохранение..."
            : editingProduct
            ? "Обновить товар"
            : "Добавить товар"}
        </Button>
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          className="border-border bg-transparent text-foreground hover:bg-accent"
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}

function CategoryForm({
  editingCategory,
  onClose,
  onSuccess,
}: {
  editingCategory?: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({ 
    name: editingCategory?.name || "", 
    slug: editingCategory?.slug || "", 
    description: editingCategory?.description || "", 
    icon: editingCategory?.icon || "Tag" 
  });
  const createMutation = trpc.categories.create.useMutation();
  const updateMutation = trpc.categories.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({
          id: String(editingCategory.id),
          data: formData
        });
        toast.success("Категория обновлена");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Категория добавлена");
      }
      onSuccess();
    } catch {
      toast.error("Ошибка при сохранении");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Название</label>
        <Input
          placeholder="Игровые ноутбуки"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Slug (для URL)</label>
        <Input
          placeholder="gaming-laptops"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Иконка категории</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {iconOptions.map((opt) => {
            const IconComp = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData({ ...formData, icon: opt.value })}
                className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                  formData.icon === opt.value
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10"
                    : "bg-background border-border text-muted-foreground hover:border-emerald-500/50"
                }`}
                title={opt.name}
              >
                <IconComp className="w-5 h-5" />
                <span className="text-[9px] uppercase font-bold truncate w-full">{opt.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Описание</label>
        <textarea
          placeholder="Описание категории..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none text-sm"
          rows={3}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20"
        >
          {createMutation.isPending || updateMutation.isPending 
            ? "Сохранение..." 
            : editingCategory 
            ? "Обновить категорию" 
            : "Добавить категорию"}
        </Button>
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          className="border-border bg-transparent text-foreground hover:bg-accent"
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}

function BrandForm({
  editingBrand,
  onClose,
  onSuccess,
}: {
  editingBrand?: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: editingBrand?.name || "",
    description: editingBrand?.description || "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>(editingBrand?.logo || "");
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = trpc.brands.create.useMutation();
  const updateMutation = trpc.brands.update.useMutation();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImageToEdit(reader.result as string);
      reader.readAsDataURL(file);
    }
    // Очищаем input, чтобы можно было выбрать тот же файл повторно
    e.target.value = "";
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "brand_logo.jpg", { type: "image/jpeg" });
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
      setImageToEdit(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      let logoUrl = logoPreview;
      if (logoFile) {
        logoUrl = await uploadImage(logoFile);
      }

      if (editingBrand) {
        await updateMutation.mutateAsync({
          id: editingBrand.id,
          data: { ...formData, logo: logoUrl },
        });
        toast.success("Бренд обновлён");
      } else {
        await createMutation.mutateAsync({ ...formData, logo: logoUrl });
        toast.success("Бренд добавлен");
      }
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка при сохранении");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Название бренда</label>
        <Input
          placeholder="Apple, Samsung, ASUS..."
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Логотип бренда</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 file:cursor-pointer"
          />
          {logoPreview && (
            <img src={logoPreview} alt="Preview" className="w-12 h-12 object-contain rounded-lg border border-border p-1" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP до 2 МБ</p>
      </div>
      {imageToEdit && (
        <ImageEditor
          image={imageToEdit}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToEdit(null)}
          aspect={1}
        />
      )}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending || isUploading}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20"
        >
          {createMutation.isPending || updateMutation.isPending || isUploading ? "Сохранение..." : editingBrand ? "Обновить бренд" : "Добавить бренд"}
        </Button>
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          className="border-border bg-transparent text-foreground hover:bg-accent"
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
