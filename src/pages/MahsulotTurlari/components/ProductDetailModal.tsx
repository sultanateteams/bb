import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ProductInfoTab } from "./ProductInfoTab";
import { ProductBOMTab } from "./ProductBOMTab";
import { ProductPricingTab } from "./ProductPricingTab";
import type { RawMaterial } from "@/lib/mockData";
import type { Product, ProductPricing, TMProductInfo, WLProductBOM, ModalTab } from "../types";

interface Props {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (product: Product) => Promise<void> | void;
  onDelete: (productId: string) => Promise<void> | void;
  onSaveBOM: (productId: string, data: WLProductBOM | TMProductInfo) => Promise<void> | void;
  onSavePricing: (productId: string, pricing: ProductPricing) => Promise<void> | void;
  productBOM: WLProductBOM | TMProductInfo;
  productPricing: ProductPricing;
  rawMaterials: RawMaterial[];
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onSaveBOM,
  onSavePricing,
  productBOM,
  productPricing,
  rawMaterials,
}: Props) {
  const [activeTab, setActiveTab] = useState<ModalTab>("info");
  const [productInfo, setProductInfo] = useState<Product | null>(product);
  const [bomState, setBomState] = useState<WLProductBOM | TMProductInfo>(productBOM);
  const [pricingState, setPricingState] = useState<ProductPricing>(productPricing);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setProductInfo(product);
      setBomState(productBOM);
      setPricingState(productPricing);
      setActiveTab("info");
    }
  }, [product, productBOM, productPricing]);

  if (!product || !productInfo) return null;

  const isTM = productInfo.type === "TM";

  const handleInfoSave = async () => {
    await onUpdate(productInfo);
  };

  const handleDelete = async () => {
    await onDelete(productInfo.id);
    setDeleteOpen(false);
  };

  const handleBOMSave = async () => {
    await onSaveBOM(productInfo.id, bomState);
  };

  const handlePricingSave = async () => {
    await onSavePricing(productInfo.id, pricingState);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{productInfo.name} — Batafsil</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Asosiy ma'lumotlar</TabsTrigger>
            <TabsTrigger value="bom">{isTM ? "Ichki ma'lumot" : "Tarkib (BOM)"}</TabsTrigger>
            <TabsTrigger value="pricing">Narx ro'yxati</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <ProductInfoTab product={productInfo} onChange={setProductInfo} />
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                O'chirish
              </Button>
              <Button onClick={handleInfoSave}>Saqlash</Button>
            </div>
          </TabsContent>

          <TabsContent value="bom">
            <ProductBOMTab
              productType={productInfo.type}
              bomData={bomState}
              rawMaterials={rawMaterials}
              onChange={setBomState}
              onSave={handleBOMSave}
            />
          </TabsContent>

          <TabsContent value="pricing">
            <ProductPricingTab pricing={pricingState} onChange={setPricingState} onSave={handlePricingSave} />
          </TabsContent>
        </Tabs>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mahsulotni o'chirish</AlertDialogTitle>
              <AlertDialogDescription>
                Siz ushbu mahsulotni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>O'chirish</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}
