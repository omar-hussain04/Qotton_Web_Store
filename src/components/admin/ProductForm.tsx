"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Product, ColorOption } from "@/types";
import { Plus, Trash2, Save, ArrowRight, Upload, Image as ImageIcon, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: Omit<Product, "id">) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_PRODUCT: Omit<Product, "id"> = {
  name: "",
  slug: "",
  price: 0,
  costPrice: 0,
  originalPrice: 0,
  images: [],
  colors: [],
  sizes: ["S", "M", "L", "XL"],
  description: "",
  category: "tshirt",
  tags: [],
  rating: 5,
  reviewsCount: 0,
  isNew: true,
  inStock: true,
};

const CATEGORIES = [
  { value: 'tshirt', label: 'تيشرت' },
  { value: 'hoodie', label: 'هودي' },
  { value: 'cap', label: 'كاب' },
  { value: 'totebag', label: 'توت باج' },
  { value: 'wallet', label: 'محفظة صغيرة' },
];

function CategoryDropdown({ currentCategory, onChange }: { currentCategory: string, onChange: (c: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = CATEGORIES.find(c => c.value === currentCategory)?.label || "اختر التصنيف";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 bg-background border border-border rounded-lg text-text focus:border-accent transition-colors text-right"
      >
        <span>{currentLabel}</span>
        <ChevronDown className={`w-4 h-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg shadow-xl bg-surface border border-border overflow-hidden right-0">
          <div className="py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  onChange(cat.value);
                  setIsOpen(false);
                }}
                className={`w-full text-right px-4 py-2 text-sm font-bold transition-colors hover:bg-background flex items-center justify-between ${cat.value === currentCategory ? "text-accent bg-background" : "text-text"}`}
              >
                {cat.label}
                {cat.value === currentCategory && <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<Product, "id">>(
    initialData ? { ...initialData } : DEFAULT_PRODUCT
  );

  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [colorInput, setColorInput] = useState<ColorOption>({ name: "", hex: "#000000", stock: 10 });
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : 
              type === "number" ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setFormData(prev => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
      setImageUrlInput("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset || "");

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!response.ok) throw new Error("فشل رفع الصورة");
        
        const data = await response.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("حدث خطأ أثناء رفع الصور");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleAddColor = () => {
    if (colorInput.name.trim() && colorInput.hex) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, { ...colorInput }] }));
      setColorInput({ name: "", hex: "#000000", stock: 10 });
    }
  };

  const handleRemoveColor = (index: number) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter((_, i) => i !== index) }));
  };

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
    await onSubmit({ ...formData, tags });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")} className="gap-2">
          <ArrowRight className="w-4 h-4" />
          العودة للمنتجات
        </Button>
        <Button type="submit" disabled={isLoading} className="gap-2 min-w-[120px]">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          حفظ المنتج
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-surface p-6 rounded-xl border border-border space-y-4">
            <h2 className="text-lg font-bold font-heading mb-4">المعلومات الأساسية</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">اسم المنتج</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-2 bg-background border border-border rounded-lg text-text focus:border-accent" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">الرابط اللطيف (Slug)</label>
                <input required name="slug" value={formData.slug} onChange={handleChange} dir="ltr" className="w-full p-2 bg-background border border-border rounded-lg text-text focus:border-accent text-left" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">التصنيف</label>
                <CategoryDropdown 
                  currentCategory={formData.category} 
                  onChange={(val) => setFormData(prev => ({ ...prev, category: val }))} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">الوصف</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full p-2 bg-background border border-border rounded-lg text-text focus:border-accent" />
            </div>
          </div>

          {/* Pricing & Status */}
          <div className="bg-surface p-6 rounded-xl border border-border space-y-4">
            <h2 className="text-lg font-bold font-heading mb-4">السعر والحالة</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">السعر الحالي (د.أ)</label>
                <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} dir="ltr" className="w-full p-2 bg-background border border-border rounded-lg text-text focus:border-accent text-left" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">سعر التكلفة (د.أ)</label>
                <input type="number" step="0.01" name="costPrice" value={formData.costPrice} onChange={handleChange} dir="ltr" className="w-full p-2 bg-background border border-border rounded-lg text-text focus:border-accent text-left" />
                <p className="text-[10px] text-muted italic">لا يظهر للعملاء، يستخدم لحساب صافي الأرباح</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted">السعر قبل الخصم (اختياري)</label>
                <input type="number" step="0.01" name="originalPrice" value={formData.originalPrice} onChange={handleChange} dir="ltr" className="w-full p-2 bg-background border border-border rounded-lg text-text focus:border-accent text-left" />
              </div>
            </div>

            <div className="flex gap-6 mt-4 pt-4 border-t border-border">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleChange} className="w-4 h-4 text-accent border-border rounded focus:ring-accent accent-accent" />
                <span className="text-text font-medium">متوفر في المخزون</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleChange} className="w-4 h-4 text-accent border-border rounded focus:ring-accent accent-accent" />
                <span className="text-text font-medium">منتج جديد</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-6">
          {/* Images */}
          <div className="bg-surface p-6 rounded-xl border border-border space-y-4">
            <h2 className="text-lg font-bold font-heading mb-4">الصور</h2>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="رابط صورة (URL)" 
                  value={imageUrlInput} 
                  onChange={e => setImageUrlInput(e.target.value)} 
                  dir="ltr" 
                  className="flex-1 p-2 bg-background border border-border rounded-lg text-text focus:border-accent text-left text-sm" 
                />
                <Button type="button" onClick={handleAddImage} variant="outline" className="px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-accent/50 transition-all ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-accent" />
                      <span className="text-sm font-medium text-muted">جاري الرفع...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-accent" />
                      <div className="text-right">
                        <p className="text-sm font-bold text-text">اضغط لرفع الصور من جهازك</p>
                        <p className="text-[10px] text-muted">يمكنك اختيار عدة صور معاً</p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-border aspect-square bg-background">
                  <img src={img} alt={`Product ${idx+1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            {formData.images.length === 0 && <div className="text-center text-sm text-muted py-4">لم يتم إضافة صور</div>}
          </div>

          {/* Variants */}
          <div className="bg-surface p-6 rounded-xl border border-border space-y-4">
            <h2 className="text-lg font-bold font-heading mb-4">الألوان والمقاسات</h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">المقاسات المتوفرة</label>
              <div className="flex flex-wrap gap-2">
                {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`w-10 h-10 rounded border text-sm font-mono flex items-center justify-center transition-colors ${
                      formData.sizes.includes(size) ? "bg-accent border-accent text-primary" : "bg-background border-border text-muted hover:border-accent/50"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border space-y-3">
              <label className="text-sm font-medium text-muted">الألوان المتوفرة</label>
              <div className="flex gap-2">
                <input type="text" placeholder="اسم اللون (أسود)" value={colorInput.name} onChange={e => setColorInput(p => ({...p, name: e.target.value}))} className="flex-1 p-2 bg-background border border-border rounded-lg text-text focus:border-accent text-sm" />
                <input type="color" value={colorInput.hex} onChange={e => setColorInput(p => ({...p, hex: e.target.value}))} className="w-10 h-10 p-1 bg-background border border-border rounded-lg cursor-pointer" />
                <Button type="button" onClick={handleAddColor} className="px-3"><Plus className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-2 mt-2">
                {formData.colors.map((color, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-background border border-border rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: color.hex }}></div>
                      <span>{color.name}</span>
                    </div>
                    <button type="button" onClick={() => handleRemoveColor(idx)} className="text-red-500 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-border space-y-4">
            <h2 className="text-lg font-bold font-heading mb-4">كلمات مفتاحية (Tags)</h2>
            <input type="text" placeholder="مثال: شتوي, هودي, قطن" value={tagsInput} onChange={e => setTagsInput(e.target.value)} className="w-full p-2 bg-background border border-border rounded-lg text-text focus:border-accent text-sm" />
            <p className="text-xs text-muted">افصل بين الكلمات بفاصلة (,)</p>
          </div>
        </div>
      </div>
    </form>
  );
}
