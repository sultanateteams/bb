import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ProductTable } from "./components/ProductTable";
import { ProductFilters } from "./components/ProductFilters";
import { AddProductModal } from "./components/AddProductModal";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { useToast } from "@/hooks/use-toast";
import { rawMaterials } from "@/lib/mockData";
import {
  getProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
} from "@/services/product-types.service";
import type {
  Product,
  ProductFilter,
  ProductPricing,
  WLProductBOM,
  TMProductInfo,
} from "./types";

const defaultPricing = (productId: string): ProductPricing => ({
  productId,
  categories: [
    { category: "retail", tiers: [{ fromQty: 1, toQty: 50, price: 0 }] },
    { category: "dealer", tiers: [{ fromQty: 1, toQty: 50, price: 0 }] },
    { category: "vip", tiers: [{ fromQty: 1, toQty: 50, price: 0 }] },
  ],
});

const defaultBOM = (): WLProductBOM => ({ items: [], serviceChargePerUnit: 0 });

export function MahsulotTurlari() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<ProductFilter>({ search: "", type: "ALL" });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productBOMs, setProductBOMs] = useState<Record<string, WLProductBOM | TMProductInfo>>({});
  const [productPricings, setProductPricings] = useState<Record<string, ProductPricing>>({});
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const list = await getProductTypes();
      setProducts(list);
      setProductPricings(
        list.reduce(
          (acc, p) => ({ ...acc, [p.id]: defaultPricing(p.id) }),
          {} as Record<string, ProductPricing>,
        ),
      );
      setProductBOMs(
        list.reduce(
          (acc, p) => ({ ...acc, [p.id]: defaultBOM() }),
          {} as Record<string, WLProductBOM | TMProductInfo>,
        ),
      );
    } catch {
      toast({ title: "Xatolik", description: "Mahsulotlar yuklanmadi", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => filter.type === "ALL" || p.type === filter.type)
      .filter((p) => p.name.toLowerCase().includes(filter.search.toLowerCase()));
  }, [filter, products]);

  const closeDetail = () => setSelectedProduct(null);

  const handleCreateProduct = async (product: Product) => {
    try {
      const created = await createProductType(product);
      setProducts((prev) => [created, ...prev]);
      setProductPricings((prev) => ({ ...prev, [created.id]: defaultPricing(created.id) }));
      setProductBOMs((prev) => ({ ...prev, [created.id]: defaultBOM() }));
      toast({ title: "Mahsulot qo'shildi", description: `${created.name} katalogga qo'shildi.` });
      setIsAddOpen(false);
    } catch (err: any) {
      const msg = err?.message || "Iltimos qayta urinib ko'ring.";
      toast({ title: "Mahsulot qo'shishda xatolik", description: msg, variant: "destructive" });
    }
  };

  const handleUpdateProduct = async (updated: Product) => {
    try {
      const saved = await updateProductType(updated.id, updated);
      setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      // refresh selected product in modal
      setSelectedProduct(saved);
      toast({ title: "Mahsulot saqlandi", description: `${saved.name} yangilandi.` });
    } catch (err: any) {
      const msg = err?.message || "Ma'lumotlar yangilanmadi.";
      toast({ title: "Saqlashda xatolik", description: msg, variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductType(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setProductBOMs((prev) => { const c = { ...prev }; delete c[productId]; return c; });
      setProductPricings((prev) => { const c = { ...prev }; delete c[productId]; return c; });
      toast({ title: "Mahsulot o'chirildi", description: "Tanlangan mahsulot katalogdan olib tashlandi." });
      closeDetail();
    } catch (err: any) {
      const msg = err?.message || "Mahsulotni o'chirish mumkin emas.";
      toast({ title: "O'chirishda xatolik", description: msg, variant: "destructive" });
    }
  };

  const handleSaveBOM = async (productId: string, bomData: WLProductBOM | TMProductInfo) => {
    setProductBOMs((prev) => ({ ...prev, [productId]: bomData }));
    toast({ title: "BOM saqlandi", description: "Mahsulot uchun BOM yangilandi." });
  };

  const handleSavePricing = async (productId: string, pricing: ProductPricing) => {
    setProductPricings((prev) => ({ ...prev, [productId]: pricing }));
    toast({ title: "Narxlar saqlandi", description: "Tiered pricing yangilandi." });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mahsulot turlari"
        subtitle="ICH, WL, TM mahsulotlar katalogi"
        showAdd
        addLabel="Mahsulot qo'shish"
        onAdd={() => setIsAddOpen(true)}
      />

      <ProductFilters filter={filter} onFilterChange={setFilter} onAdd={() => setIsAddOpen(true)} />

      <ProductTable
        products={filteredProducts}
        isLoading={isLoading}
        onOpenDetail={(product) => setSelectedProduct(product)}
      />

      <AddProductModal open={isAddOpen} onOpenChange={setIsAddOpen} onCreate={handleCreateProduct} />

      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && closeDetail()}
        onUpdate={handleUpdateProduct}
        onDelete={handleDeleteProduct}
        onSaveBOM={handleSaveBOM}
        onSavePricing={handleSavePricing}
        productBOM={selectedProduct ? (productBOMs[selectedProduct.id] ?? defaultBOM()) : defaultBOM()}
        productPricing={
          selectedProduct
            ? (productPricings[selectedProduct.id] ?? defaultPricing(selectedProduct.id))
            : defaultPricing("0")
        }
        rawMaterials={rawMaterials}
      />
    </div>
  );
}
