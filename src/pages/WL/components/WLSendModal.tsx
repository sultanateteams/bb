import { useState, useEffect } from "react";
import { products, rawMaterials, bom } from "@/lib/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Plus, Trash2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface BOMItem {
  materialId: number;
  name: string;
  unit: string;
  quantityPer1Unit: number;
  calculatedQuantity: number;
  stockQuantity: number;
  isEnough: boolean;
}

interface SendProduct {
  productId: number;
  quantity: number;
  bomItems: BOMItem[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WLSendModal({ open, onOpenChange }: Props) {
  const [productsList, setProductsList] = useState<SendProduct[]>([
    { productId: 0, quantity: 0, bomItems: [] },
  ]);

  const wlProducts = products.filter((p) => p.branch === "wl");

  const addProduct = () => {
    setProductsList([...productsList, { productId: 0, quantity: 0, bomItems: [] }]);
  };

  const removeProduct = (index: number) => {
    setProductsList(productsList.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof SendProduct, value: any) => {
    const newList = [...productsList];
    (newList[index] as any)[field] = value;
    if (field === "productId" || field === "quantity") {
      calculateBOM(newList[index]);
    }
    setProductsList(newList);
  };

  const calculateBOM = (product: SendProduct) => {
    if (!product.productId || !product.quantity) {
      product.bomItems = [];
      return;
    }
    const productBOM = bom[product.productId];
    if (!productBOM) {
      product.bomItems = [];
      return;
    }
    product.bomItems = productBOM.map((item) => {
      const material = rawMaterials.find((m) => m.id === item.materialId);
      const calculated = item.perUnit * product.quantity;
      const stock = material ? material.stock : 0;
      return {
        materialId: item.materialId,
        name: item.name,
        unit: item.unit,
        quantityPer1Unit: item.perUnit,
        calculatedQuantity: calculated,
        stockQuantity: stock,
        isEnough: stock >= calculated,
      };
    });
  };

  const allEnough = productsList.every((p) =>
    p.bomItems.every((item) => item.isEnough)
  );

  const handleSave = () => {
    // Mock save: in real, call API to deduct stock and add to archive
    console.log("Saving WL send:", productsList);
    onOpenChange(false);
    setProductsList([{ productId: 0, quantity: 0, bomItems: [] }]);
  };

  useEffect(() => {
    if (!open) {
      setProductsList([{ productId: 0, quantity: 0, bomItems: [] }]);
    }
  }, [open]);

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
                <h3 className="text-lg font-medium">
                  Mahsulot {index + 1}
                </h3>
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
                    value={product.productId.toString()}
                    onValueChange={(v) => updateProduct(index, "productId", parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tanlang" />
                    </SelectTrigger>
                    <SelectContent>
                      {wlProducts.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
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
                    onChange={(e) => updateProduct(index, "quantity", parseInt(e.target.value) || 0)}
                    placeholder="1000"
                  />
                </div>
              </div>

              {product.bomItems.length > 0 && (
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
                        {product.bomItems.map((item, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-3 font-medium">{item.name}</td>
                            <td className="p-3 text-right text-muted-foreground">
                              {item.unit}
                            </td>
                            <td className="p-3 text-right tabular-nums">
                              {formatNumber(item.calculatedQuantity)}
                            </td>
                            <td className="p-3 text-right">
                              <Input
                                type="number"
                                value={item.calculatedQuantity}
                                onChange={(e) => {
                                  const newQty = parseFloat(e.target.value) || 0;
                                  const newItems = [...product.bomItems];
                                  newItems[i].calculatedQuantity = newQty;
                                  newItems[i].isEnough = newItems[i].stockQuantity >= newQty;
                                  updateProduct(index, "bomItems", newItems);
                                }}
                                className="w-24 h-8 text-right tabular-nums"
                              />
                            </td>
                            <td className="p-3 text-center">
                              {item.isEnough ? (
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

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Ombor tekshiruvi</h4>
            {productsList.flatMap((p) => p.bomItems).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span>{item.name}:</span>
                <span className={cn(item.isEnough ? "text-green-600" : "text-red-600")}>
                  Kerakli: {formatNumber(item.calculatedQuantity)} {item.unit} | Omborda: {formatNumber(item.stockQuantity)} {item.unit}
                  {item.isEnough ? " ✅ yetarli" : " ❌ yetarlicha emas"}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSave} disabled={!allEnough}>
              Saqlash
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}