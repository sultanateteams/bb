import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Plus, Trash2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getProductTypes } from "@/services/product-types.service";
import {
  getProductBOMEnriched,
  createWLProduction,
  type ProductBOMEnrichedItem,
} from "@/services/wl-productions.service";
import { toast } from "sonner";

interface BOMRow extends ProductBOMEnrichedItem {
  calculatedQty: number;
  isEnough: boolean;
}

interface SendProduct {
  productTypeId: number | null;
  quantity: number;
  bomRows: BOMRow[];
  loadingBOM: boolean;
}

const emptyProduct = (): SendProduct => ({
  productTypeId: null,
  quantity: 0,
  bomRows: [],
  loadingBOM: false,
});

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WLSendModal({ open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [productsList, setProductsList] = useState<SendProduct[]>([emptyProduct()]);

  const { data: allProducts = [] } = useQuery({
    queryKey: ["product-types"],
    queryFn: getProductTypes,
  });

  const wlProducts = allProducts.filter((p) => p.type === "WL" && p.isActive);

  const addProduct = () => {
    setProductsList((prev) => [...prev, emptyProduct()]);
  };

  const removeProduct = (index: number) => {
    setProductsList((prev) => prev.filter((_, i) => i !== index));
  };

  const computeBOMRows = (bomItems: ProductBOMEnrichedItem[], qty: number): BOMRow[] =>
    bomItems.map((item) => {
      const calculated = item.qty_per_unit * qty;
      return {
        ...item,
        calculatedQty: calculated,
        isEnough: item.current_stock >= calculated,
      };
    });

  const handleProductSelect = async (index: number, productTypeId: number) => {
    setProductsList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], productTypeId, bomRows: [], loadingBOM: true };
      return next;
    });

    try {
      const bomItems = await getProductBOMEnriched(productTypeId);
      setProductsList((prev) => {
        const next = [...prev];
        const qty = next[index].quantity;
        next[index] = {
          ...next[index],
          bomRows: qty > 0 ? computeBOMRows(bomItems, qty) : bomItems.map((item) => ({ ...item, calculatedQty: 0, isEnough: true })),
          loadingBOM: false,
        };
        return next;
      });
    } catch {
      setProductsList((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], bomRows: [], loadingBOM: false };
        return next;
      });
    }
  };

  const handleQuantityChange = (index: number, qty: number) => {
    setProductsList((prev) => {
      const next = [...prev];
      const product = next[index];
      const bomItems = product.bomRows.map(({ calculatedQty: _, isEnough: __, ...rest }) => rest as ProductBOMEnrichedItem);
      next[index] = {
        ...product,
        quantity: qty,
        bomRows: qty > 0 ? computeBOMRows(bomItems, qty) : product.bomRows.map((r) => ({ ...r, calculatedQty: 0, isEnough: true })),
      };
      return next;
    });
  };

  const handleOverrideQty = (productIndex: number, bomIndex: number, newQty: number) => {
    setProductsList((prev) => {
      const next = [...prev];
      const rows = [...next[productIndex].bomRows];
      rows[bomIndex] = {
        ...rows[bomIndex],
        calculatedQty: newQty,
        isEnough: rows[bomIndex].current_stock >= newQty,
      };
      next[productIndex] = { ...next[productIndex], bomRows: rows };
      return next;
    });
  };

  const allEnough = productsList.every((p) => p.bomRows.every((r) => r.isEnough));
  const hasValidItems = productsList.some((p) => p.productTypeId && p.quantity > 0);

  const mutation = useMutation({
    mutationFn: createWLProduction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wl-productions"] });
      queryClient.invalidateQueries({ queryKey: ["raw-material-types"] });
      toast.success("Ishlab chiqarishga jo'natildi");
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err?.message || "Xatolik yuz berdi");
    },
  });

  const handleSave = () => {
    const items = productsList
      .filter((p) => p.productTypeId && p.quantity > 0)
      .map((p) => ({ product_type_id: p.productTypeId!, quantity: p.quantity }));

    if (items.length === 0) return;

    const today = new Date().toISOString().slice(0, 10);
    mutation.mutate({ sent_date: today, items });
  };

  useEffect(() => {
    if (!open) {
      setProductsList([emptyProduct()]);
    }
  }, [open]);

  const allBOMRows = productsList.flatMap((p) => p.bomRows);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ishlab chiqarishga jo'natish</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {productsList.map((product, index) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Mahsulot {index + 1}</h3>
                {productsList.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeProduct(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mahsulot</Label>
                  <Select
                    value={product.productTypeId?.toString() ?? ""}
                    onValueChange={(v) => handleProductSelect(index, parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {wlProducts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Miqdor (dona)</Label>
                  <Input
                    type="number"
                    value={product.quantity || ""}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                    placeholder="1000"
                  />
                </div>
              </div>

              {product.loadingBOM && (
                <p className="text-sm text-muted-foreground">BOM yuklanmoqda...</p>
              )}

              {!product.loadingBOM && product.bomRows.length > 0 && (
                <div>
                  <Label>Tarkib (BOM)</Label>
                  <div className="rounded-lg border overflow-hidden mt-2">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3">Xomashiyo</th>
                          <th className="text-right p-3">O'lchov</th>
                          <th className="text-right p-3">Hisoblangan</th>
                          <th className="text-right p-3">Kerakli</th>
                          <th className="text-center p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.bomRows.map((row, bi) => (
                          <tr key={bi} className="border-t">
                            <td className="p-3 font-medium">{row.raw_material_name}</td>
                            <td className="p-3 text-right text-muted-foreground">{row.unit}</td>
                            <td className="p-3 text-right tabular-nums">
                              {formatNumber(row.calculatedQty)}
                            </td>
                            <td className="p-3 text-right">
                              <Input
                                type="number"
                                value={row.calculatedQty}
                                onChange={(e) =>
                                  handleOverrideQty(index, bi, parseFloat(e.target.value) || 0)
                                }
                                className="w-28 h-8 text-right tabular-nums"
                              />
                            </td>
                            <td className="p-3 text-center">
                              {row.isEnough ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-red-500 mx-auto" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {index < productsList.length - 1 && <Separator />}
            </div>
          ))}

          <Button onClick={addProduct} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Yana mahsulot qo'shish
          </Button>

          {allBOMRows.length > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Ombor tekshiruvi</h4>
              {allBOMRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>{row.raw_material_name}:</span>
                  <span className={cn(row.isEnough ? "text-green-600" : "text-red-600")}>
                    Kerakli: {formatNumber(row.calculatedQty)} {row.unit} | Omborda:{" "}
                    {formatNumber(row.current_stock)} {row.unit}
                    {row.isEnough ? " ✅ yetarli" : " ❌ yetarlicha emas"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Bekor qilish
            </Button>
            <Button
              onClick={handleSave}
              disabled={!allEnough || !hasValidItems || mutation.isPending}
            >
              {mutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
