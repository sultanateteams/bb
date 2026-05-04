import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ProductTable } from "./components/ProductTable";
import { ProductFilters } from "./components/ProductFilters";
import { AddProductModal } from "./components/AddProductModal";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { useToast } from "@/hooks/use-toast";
import { products as productSeed, rawMaterials } from "@/lib/mockData";
import type {
  Product,
  ProductFilter,
  ProductPricing,
  ProductType,
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

const mapSeedProducts = (): Product[] =>
  productSeed.map((item) => ({
    id: item.id.toString(),
    name: item.name,
    type: item.branch.toUpperCase() as ProductType,
    unit: item.unit as Product["unit"],
    minStock: item.min,
    description: "",
    createdAt: new Date().toISOString().slice(0, 10),
  }));

export function MahsulotTurlari() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<ProductFilter>({ search: "", type: "ALL" });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productBOMs, setProductBOMs] = useState<Record<string, WLProductBOM | TMProductInfo>>({});
  const [productPricings, setProductPricings] = useState<Record<string, ProductPricing>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const mapped = mapSeedProducts();
    setProducts(mapped);
    setProductPricings(
      mapped.reduce((acc, product) => ({ ...acc, [product.id]: defaultPricing(product.id) }), {} as Record<string, ProductPricing>),
    );
    setProductBOMs(
      mapped.reduce((acc, product) => ({ ...acc, [product.id]: defaultBOM() }), {} as Record<string, WLProductBOM | TMProductInfo>),
    );
    setIsLoading(false);
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => filter.type === "ALL" || product.type === filter.type)
      .filter((product) => product.name.toLowerCase().includes(filter.search.toLowerCase()));
  }, [filter, products]);

  const closeDetail = () => setSelectedProduct(null);

  const handleCreateProduct = async (product: Product) => {
    try {
      setProducts((prev) => [product, ...prev]);
      setProductPricings((prev) => ({ ...prev, [product.id]: defaultPricing(product.id) }));
      setProductBOMs((prev) => ({ ...prev, [product.id]: defaultBOM() }));
      toast({ title: "Mahsulot qo'shildi", description: `${product.name} katalogga qo'shildi.`, variant: "default" });
      setIsAddOpen(false);
    } catch (error) {
      toast({ title: "Mahsulot qo'shishda xatolik", description: "Iltimos qayta urinib ko'ring.", variant: "destructive" });
    }
  };

  const handleUpdateProduct = async (updated: Product) => {
    try {
      setProducts((prev) => prev.map((product) => (product.id === updated.id ? updated : product)));
      toast({ title: "Mahsulot saqlandi", description: `${updated.name} yangilandi.`, variant: "default" });
    } catch (error) {
      toast({ title: "Saqlashda xatolik", description: "Ma'lumotlar yangilanmadi.", variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setProductBOMs((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
      setProductPricings((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
      toast({ title: "Mahsulot o'chirildi", description: "Tanlangan mahsulot ombordan olib tashlandi.", variant: "default" });
      closeDetail();
    } catch (error) {
      toast({ title: "O'chirishda xatolik", description: "Mahsulotni o'chirish mumkin emas.", variant: "destructive" });
    }
  };

  const handleSaveBOM = async (productId: string, bomData: WLProductBOM | TMProductInfo) => {
    try {
      setProductBOMs((prev) => ({ ...prev, [productId]: bomData }));
      toast({ title: "BOM saqlandi", description: "Mahsulot uchun BOM yangilandi.", variant: "default" });
    } catch (error) {
      toast({ title: "Xatolik", description: "BOM ma'lumotlari saqlanmadi.", variant: "destructive" });
    }
  };

  const handleSavePricing = async (productId: string, pricing: ProductPricing) => {
    try {
      setProductPricings((prev) => ({ ...prev, [productId]: pricing }));
      toast({ title: "Narxlar saqlandi", description: "Tiered pricing yangilandi.", variant: "default" });
    } catch (error) {
      toast({ title: "Xatolik", description: "Narxlar saqlanmadi.", variant: "destructive" });
    }
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
        productPricing={selectedProduct ? (productPricings[selectedProduct.id] ?? defaultPricing(selectedProduct.id)) : defaultPricing("0")}
        rawMaterials={rawMaterials}
      />
    </div>
  );
}
