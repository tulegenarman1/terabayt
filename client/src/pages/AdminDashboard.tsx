import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, Trash2, Pencil, LogOut, Package, Tag, 
  ShieldCheck, Star, Search, X, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ImageEditor from "@/components/ImageEditor";

const LOGO_URL = "/logo.jpeg";
type Tab = "products" | "categories" | "brands";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("products");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
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

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Удалить категорию?")) return;
    try {
      await deleteCategoryMutation.mutateAsync(id);
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl border-b border-emerald-500/20 sticky top-0 z-50">
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
              <p className="text-xs text-zinc-500 hidden sm:block">Панель управления</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-red-400 transition-colors px-4 py-2 border border-zinc-800 hover:border-red-500/50 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Выход</span>
          </button>
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
        <div className="flex gap-2 mb-6 bg-zinc-950 border border-zinc-800 rounded-xl p-1 w-fit">
          <button
            onClick={() => { setTab("products"); setShowForm(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "products"
                ? "bg-emerald-500 text-black"
                : "text-zinc-400 hover:text-white"
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
                : "text-zinc-400 hover:text-white"
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
                : "text-zinc-400 hover:text-white"
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Поиск по названию или бренду..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500"
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
                  <div className="bg-zinc-950 border border-emerald-500/30 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold">
                        {editingProduct ? "Редактирование товара" : "Новый товар"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setEditingProduct(null);
                        }}
                        className="text-zinc-500 hover:text-white p-1"
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
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-900/50 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Товар</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Бренд</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Цена</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">Статус</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">Хит</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {product.images?.[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-zinc-700" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate max-w-xs">{product.name}</p>
                              <p className="text-xs text-zinc-500">{product.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-300">{product.brand}</td>
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className="text-emerald-400 font-semibold">
                              {parseFloat(String(product.discountPrice || product.price)).toLocaleString()} ₸
                            </p>
                            {product.discountPrice && (
                              <p className="text-xs text-zinc-600 line-through">
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
                            <div className="relative w-10 h-5 bg-zinc-800 rounded-full peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                          </label>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={() => handleEditProduct(product)}
                              size="sm"
                              variant="outline"
                              className="border-zinc-800 bg-transparent text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 gap-1.5"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Редактировать</span>
                            </Button>
                            <Button
                              onClick={() => handleDeleteProduct(product.id)}
                              size="sm"
                              variant="outline"
                              className="border-zinc-800 bg-transparent text-zinc-300 hover:border-red-500 hover:text-red-400 gap-1.5"
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
                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
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
              <p className="text-zinc-400">Управление категориями товаров</p>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                {showForm ? "Закрыть" : "Добавить категорию"}
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
                  <div className="bg-zinc-950 border border-emerald-500/30 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-6">Новая категория</h3>
                    <CategoryForm
                      onClose={() => setShowForm(false)}
                      onSuccess={() => {
                        setShowForm(false);
                        refetchCategories();
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-zinc-950 border border-zinc-800 hover:border-emerald-500/30 rounded-xl p-5 transition-all group"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{category.name}</h3>
                      <p className="text-xs text-zinc-500 truncate">{category.description || "—"}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteCategory(category.id)}
                    size="sm"
                    variant="outline"
                    className="w-full border-zinc-800 bg-transparent text-zinc-400 hover:border-red-500 hover:text-red-400 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Удалить
                  </Button>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="col-span-full bg-zinc-950 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
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
              <p className="text-zinc-400">Управление брендами товаров</p>
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
                  <div className="bg-zinc-950 border border-emerald-500/30 rounded-2xl p-6">
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
                  className="bg-zinc-950 border border-zinc-800 hover:border-emerald-500/30 rounded-xl p-5 transition-all group flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-xl bg-zinc-900 flex items-center justify-center mb-4 overflow-hidden p-2">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <Star className="w-8 h-8 text-zinc-700" />
                    )}
                  </div>
                  <h3 className="font-bold text-white mb-4">{brand.name}</h3>
                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={() => handleEditBrand(brand)}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-zinc-800 bg-transparent text-zinc-400 hover:border-emerald-500 hover:text-emerald-400"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteBrand(brand.id)}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-zinc-800 bg-transparent text-zinc-400 hover:border-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {brands.length === 0 && (
                <div className="col-span-full bg-zinc-950 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
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
    <div className={`bg-zinc-950 border ${accent ? "border-emerald-500/30" : "border-zinc-800"} rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? "bg-emerald-500/20" : "bg-zinc-900"}`}>
          <Icon className={`w-5 h-5 ${accent ? "text-emerald-400" : "text-zinc-400"}`} />
        </div>
      </div>
      <div className="text-3xl font-black">{value}</div>
      <div className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

const inputClass = "bg-black border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20";

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
    categoryId: editingProduct?.categoryId || 0,
    brandId: editingProduct?.brandId || 0,
    name: editingProduct?.name || "",
    brand: editingProduct?.brand || "",
    model: editingProduct?.model || "",
    price: editingProduct?.price || "",
    discountPrice: editingProduct?.discountPrice || "",
    description: editingProduct?.description || "",
    kaspiLink: editingProduct?.kaspiLink || "",
    availability: (editingProduct?.availability || "in_stock") as "in_stock" | "out_of_stock" | "coming_soon",
    featured: editingProduct?.featured || false,
  });
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: brands = [] } = trpc.brands.list.useQuery();

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
    const file = new File([croppedBlob], "product_image.jpg", { type: "image/jpeg" });
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
            categoryId: formData.categoryId,
            brandId: formData.brandId,
            name: formData.name,
            brand: formData.brand,
            model: formData.model,
            price: formData.price.toString(),
            discountPrice: formData.discountPrice ? formData.discountPrice.toString() : undefined,
            description: formData.description,
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
          price: formData.price.toString(),
          discountPrice: formData.discountPrice ? formData.discountPrice.toString() : undefined,
          images: imageUrl ? [imageUrl] : [],
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
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Название</label>
          <Input
            placeholder="ASUS ROG Strix G15..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Бренд</label>
          <select
            value={formData.brandId || ""}
            onChange={(e) => {
              const selectedBrand = brands.find(b => b.id === parseInt(e.target.value));
              setFormData({ 
                ...formData, 
                brandId: parseInt(e.target.value) || 0,
                brand: selectedBrand?.name || ""
              });
            }}
            className="w-full h-9 bg-black border border-zinc-800 rounded-md px-3 text-white text-sm focus:border-emerald-500 focus:outline-none"
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
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Модель</label>
          <Input
            placeholder="Pavilion, Envy, ROG..."
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Цена (₸)</label>
          <Input
            placeholder="450000"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Цена со скидкой (опц.)</label>
          <Input
            placeholder="399000"
            value={formData.discountPrice}
            onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Ссылка Kaspi.kz</label>
          <Input
            placeholder="https://l.kaspi.kz/..."
            value={formData.kaspiLink}
            onChange={(e) => setFormData({ ...formData, kaspiLink: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Категория</label>
          <select
            value={formData.categoryId || ""}
            onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) || 0 })}
            className="w-full h-9 bg-black border border-zinc-800 rounded-md px-3 text-white text-sm focus:border-emerald-500 focus:outline-none"
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
          <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Наличие</label>
          <select
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
            className="w-full h-9 bg-black border border-zinc-800 rounded-md px-3 text-white text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="in_stock">В наличии</option>
            <option value="out_of_stock">Нет в наличии</option>
            <option value="coming_soon">Скоро</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Описание</label>
        <textarea
          placeholder="Краткое описание товара..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-black border border-zinc-800 rounded-md px-3 py-2 text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none text-sm"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Фото товара</label>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 file:cursor-pointer"
            />
            <p className="text-xs text-zinc-500 mt-2">JPG, PNG, WebP до 2 МБ</p>
          </div>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-zinc-800" />
          )}
        </div>
      </div>
      {imageToEdit && (
        <ImageEditor
          image={imageToEdit}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToEdit(null)}
          aspect={4/3}
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
          className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900"
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}

function CategoryForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({ name: "", slug: "", description: "" });
  const createMutation = trpc.categories.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      toast.success("Категория добавлена");
      onSuccess();
    } catch {
      toast.error("Ошибка при добавлении");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Название</label>
        <Input
          placeholder="Игровые ноутбуки"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Slug (для URL)</label>
        <Input
          placeholder="gaming-laptops"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Описание</label>
        <textarea
          placeholder="Описание категории..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-black border border-zinc-800 rounded-md px-3 py-2 text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none text-sm"
          rows={3}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20"
        >
          {createMutation.isPending ? "Сохранение..." : "Добавить категорию"}
        </Button>
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900"
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
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Название бренда</label>
        <Input
          placeholder="Apple, Samsung, ASUS..."
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider">Логотип бренда</label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 file:cursor-pointer"
          />
          {logoPreview && (
            <img src={logoPreview} alt="Preview" className="w-12 h-12 object-contain rounded-lg border border-zinc-800 p-1" />
          )}
        </div>
        <p className="text-xs text-zinc-500 mt-2">JPG, PNG, WebP до 2 МБ</p>
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
          className="border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900"
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}
