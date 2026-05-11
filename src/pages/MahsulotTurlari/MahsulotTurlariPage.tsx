import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ProductTable } from "./components/ProductTable";
import { ProductFilters } from "./components/ProductFilters";
import { AddProductModal } from "./components/AddProductModal";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { useToast } from "@/hooks/use-toast";
import type { RawMaterial } from "@/lib/mockData";
import { getRawMaterialTypes } from "@/services/raw-material-types.service";
import {
  getProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
} from "@/services/product-types.service";
import {
  getProductBOM,
  syncProductBOM,
  getWLServiceFee,
  upsertWLServiceFee,
  getPriceTiers,
  syncPriceTiers,
} from "@/services/product-bom.service";
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
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [filter, setFilter] = useState<ProductFilter>({ search: "", type: "ALL" });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productBOMs, setProductBOMs] = useState<Record<string, WLProductBOM | TMProductInfo>>({});
  const [productPricings, setProductPricings] = useState<Record<string, ProductPricing>>({});
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const [list, rawList] = await Promise.all([getProductTypes(), getRawMaterialTypes()]);
      setProducts(list);
      // API RawMaterial (type: "ICH"/"WL") → mockData shape (branch: "ich"/"wl", id: number)
      setRawMaterials(
        rawList.map((r) => ({
          id: Number(r.id),
          name: r.name,
          branch: r.type.toLowerCase() as "ich" | "wl",
          unit: r.unit,
          stock: 0,
          min: r.minStock,
          price: String(r.defaultPrice),
        })),
      );
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

  const loadBOM = async (product: Product) => {
    try {
      const productTypeId = Number(product.id);
      const [bomItems, feeData, tierItems] = await Promise.all([
        getProductBOM(productTypeId),
        product.type === "WL" ? getWLServiceFee(productTypeId) : Promise.resolve(null),
        getPriceTiers(productTypeId),
      ]);

      const items = bomItems.map((b) => ({
        id: String(b.id),
        rawMaterialId: String(b.raw_material_type_id),
        rawMaterialName:
          rawMaterials.find((r) => r.id === b.raw_material_type_id)?.name ?? String(b.raw_material_type_id),
        unit: rawMaterials.find((r) => r.id === b.raw_material_type_id)?.unit ?? "",
        quantityPer1Unit: b.qty_per_unit,
      }));
      const bom: WLProductBOM = { items, serviceChargePerUnit: feeData?.fee_per_unit ?? 0 };
      setProductBOMs((prev) => ({ ...prev, [product.id]: bom }));

      if (tierItems.length > 0) {
        const categories: { category: "retail" | "dealer" | "vip"; tiers: { id?: string; fromQty: number; toQty: number | null; price: number }[] }[] = [
          { category: "retail", tiers: [] },
          { category: "dealer", tiers: [] },
          { category: "vip", tiers: [] },
        ];
        for (const t of tierItems) {
          const cat = categories.find((c) => c.category === t.shop_category);
          if (cat) cat.tiers.push({ id: String(t.id), fromQty: t.qty_from, toQty: t.qty_to ?? null, price: t.unit_price });
        }
        setProductPricings((prev) => ({ ...prev, [product.id]: { productId: product.id, categories } }));
      }
    } catch {
      // silently keep defaults
    }
  };

  const handleSaveBOM = async (productId: string, bomData: WLProductBOM | TMProductInfo) => {
    try {
      const productTypeId = Number(productId);
      const bom = bomData as WLProductBOM;
      await syncProductBOM({
        product_type_id: productTypeId,
        items: bom.items.map((item) => ({
          raw_material_type_id: Number(item.rawMaterialId),
          qty_per_unit: item.quantityPer1Unit,
        })),
      });
      if (selectedProduct?.type === "WL") {
        await upsertWLServiceFee(productTypeId, bom.serviceChargePerUnit ?? 0);
      }
      setProductBOMs((prev) => ({ ...prev, [productId]: bomData }));
      toast({ title: "BOM saqlandi", description: "Mahsulot uchun BOM yangilandi." });
    } catch {
      toast({ title: "Xatolik", description: "BOM saqlanmadi", variant: "destructive" });
    }
  };

  const handleSavePricing = async (productId: string, pricing: ProductPricing) => {
    try {
      const tiers = pricing.categories.flatMap((cat) =>
        cat.tiers.map((tier) => ({
          shop_category: cat.category,
          qty_from: tier.fromQty,
          qty_to: tier.toQty ?? null,
          unit_price: tier.price,
        })),
      );
      await syncPriceTiers({ product_type_id: Number(productId), tiers });
      setProductPricings((prev) => ({ ...prev, [productId]: pricing }));
      toast({ title: "Narxlar saqlandi", description: "Tiered pricing yangilandi." });
    } catch {
      toast({ title: "Xatolik", description: "Narxlar saqlanmadi", variant: "destructive" });
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
        onOpenDetail={(product) => { setSelectedProduct(product); loadBOM(product); }}
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
