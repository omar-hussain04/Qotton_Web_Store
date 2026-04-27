"use client";

import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "@/lib/products";
import type { Product } from "@/types";
import { Plus, Edit, Trash2, Search, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, id: string | null, name: string | null}>({ isOpen: false, id: null, name: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    const { id, name } = deleteModalState;
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الحذف");
    } finally {
      setIsDeleting(false);
      setDeleteModalState({ isOpen: false, id: null, name: null });
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text mb-2">إدارة المنتجات</h1>
          <p className="text-muted">عرض، إضافة وتعديل منتجات المتجر</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="بحث باسم المنتج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-text focus:outline-none focus:border-accent"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
          </div>
          <Link href="/admin/products/new">
            <Button className="shrink-0 gap-2">
              <Plus className="h-4 w-4" />
              إضافة منتج
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="bg-background text-muted border-b border-border">
                  <th className="px-6 py-4 font-medium">المنتج</th>
                  <th className="px-6 py-4 font-medium">السعر (د.أ)</th>
                  <th className="px-6 py-4 font-medium">التصنيف</th>
                  <th className="px-6 py-4 font-medium">الألوان/المقاسات</th>
                  <th className="px-6 py-4 font-medium text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-background/50 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-4">
                      {product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded object-cover border border-border bg-background" />
                      ) : (
                        <div className="w-12 h-12 rounded border border-border bg-background/50 flex items-center justify-center text-muted">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-text">{product.name}</div>
                        <div className="text-xs text-muted font-mono">{product.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-accent font-mono">{product.price.toFixed(2)}</div>
                      {product.originalPrice && (
                        <div className="text-xs text-muted line-through font-mono">{product.originalPrice.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-background px-2 py-1 rounded text-xs border border-border text-muted">
                        {product.category === 'tshirt' ? 'تيشرت' : 
                         product.category === 'hoodie' ? 'هودي' : 
                         product.category === 'cap' ? 'كاب' : 
                         product.category === 'totebag' ? 'توت باج' : 
                         product.category === 'wallet' ? 'محفظة صغيرة' : product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted text-xs">
                      <div>{product.colors.length} ألوان</div>
                      <div>{product.sizes.length} مقاسات</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/products/${product.id}`}>
                          <button className="p-2 bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 hover:border-accent/40 rounded-lg transition-all" title="تعديل">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => product.id && setDeleteModalState({ isOpen: true, id: product.id, name: product.name })}
                          className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 rounded-lg transition-all" 
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted font-medium">
                      لا يوجد منتجات متاحة. قم بإضافة منتجك الأول!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="حذف المنتج"
        message={`هل أنت متأكد من حذف المنتج "${deleteModalState.name}" بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء وسيتم إزالته من المتجر.`}
        confirmText="حذف المنتج"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, id: null, name: null })}
        isLoading={isDeleting}
      />
    </div>
  );
}
