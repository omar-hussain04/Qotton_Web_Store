"use client";

import { useEffect, useState } from "react";
import { getProducts, updateProduct } from "@/lib/products";
import type { Product } from "@/types";
import { Search, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Local state for stock inputs
  const [stockEdits, setStockEdits] = useState<Record<string, Record<string, number>>>({});

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      
      // Initialize stock edits state
      const initialEdits: Record<string, Record<string, number>> = {};
      data.forEach(prod => {
        initialEdits[prod.id] = {};
        prod.colors.forEach(color => {
          initialEdits[prod.id][color.name] = color.stock || 0;
        });
      });
      setStockEdits(initialEdits);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStockChange = (productId: string, colorName: string, value: string) => {
    const num = parseInt(value) || 0;
    setStockEdits(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [colorName]: num
      }
    }));
  };

  const handleSaveStock = async (product: Product) => {
    setSavingId(product.id);
    try {
      const updatedColors = product.colors.map(color => ({
        ...color,
        stock: stockEdits[product.id]?.[color.name] ?? color.stock
      }));
      
      await updateProduct(product.id, { colors: updatedColors });
      
      // Update local product state
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, colors: updatedColors } : p
      ));
      
      alert("تم تحديث المخزون بنجاح!");
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حفظ المخزون.");
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.slug.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text mb-2">إدارة المخزون</h1>
          <p className="text-muted">تحديث كميات المنتجات المتوفرة لكل لون (Variant)</p>
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="بحث باسم المنتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text focus:outline-none focus:border-accent"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto text-right">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-background text-muted border-b border-border">
                  <th className="px-6 py-4 font-medium">المنتج</th>
                  <th className="px-6 py-4 font-medium min-w-[250px]">الألوان والكميات المتوفرة</th>
                  <th className="px-6 py-4 font-medium">حالة المنتج</th>
                  <th className="px-6 py-4 font-medium text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map(product => {
                  const totalStock = product.colors.reduce((sum, c) => sum + (stockEdits[product.id]?.[c.name] ?? c.stock ?? 0), 0);
                  
                  return (
                    <tr key={product.id} className="hover:bg-background/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-text">{product.name}</div>
                        <div className="text-xs text-muted font-mono mt-1">{product.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-3">
                          {product.colors.length === 0 ? (
                            <span className="text-muted text-xs">لا يوجد ألوان مضافة</span>
                          ) : (
                            product.colors.map(color => (
                              <div key={color.name} className="flex items-center gap-3">
                                <div className="flex items-center gap-2 w-24">
                                  <div className="w-4 h-4 border border-border rounded-full" style={{ backgroundColor: color.hex }}></div>
                                  <span className="text-xs text-text truncate" title={color.name}>{color.name}</span>
                                </div>
                                <input
                                  type="number"
                                  min="0"
                                  value={stockEdits[product.id]?.[color.name] ?? color.stock ?? 0}
                                  onChange={(e) => handleStockChange(product.id, color.name, e.target.value)}
                                  className="w-20 p-1 bg-background border border-border rounded text-center focus:border-accent font-mono text-sm"
                                  dir="ltr"
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit
                            ${totalStock === 0 ? 'bg-red-500/10 text-red-500' : 
                              totalStock <= 5 ? 'bg-orange-500/10 text-orange-500' : 
                              'bg-green-500/10 text-green-500'}`}>
                            {totalStock === 0 ? 'انتهت الكمية' : 
                             totalStock <= 5 ? 'اقترب على الانتهاء' : 'متوفر'}
                          </span>
                          <span className="text-xs text-muted font-mono pr-1">الإجمالي: {totalStock}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button 
                          onClick={() => handleSaveStock(product)} 
                          disabled={savingId === product.id}
                          className="gap-2 shrink-0 h-8 text-xs"
                        >
                          {savingId === product.id ? (
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                          حفظ التعديلات
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-muted font-medium">
                      لا توجد منتجات مطابقة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
