import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CategoryPricingBlock } from "./CategoryPricingBlock";
import type { CategoryPricing, PriceCategory, PriceTier, ProductPricing } from "../types";

interface Props {
  pricing: ProductPricing;
  onChange: (pricing: ProductPricing) => void;
  onSave: () => void;
}

const categories: PriceCategory[] = ["retail", "dealer", "vip"];

const validateTiers = (tiers: PriceTier[]): boolean => {
  for (let i = 0; i < tiers.length; i++) {
    if (tiers[i].price <= 0) return false;
    if (tiers[i].fromQty <= 0) return false;
    if (tiers[i].toQty !== null && tiers[i].toQty < tiers[i].fromQty) return false;
    if (i < tiers.length - 1) {
      if (tiers[i].toQty === null) return false;
      if (tiers[i].toQty >= tiers[i + 1].fromQty) return false;
    }
  }
  return true;
};

export function ProductPricingTab({ pricing, onChange, onSave }: Props) {
  const isValid = useMemo(() => pricing.categories.every((category) => validateTiers(category.tiers)), [pricing]);

  const updateCategory = (category: PriceCategory, tiers: PriceTier[]) => {
    onChange({
      ...pricing,
      categories: pricing.categories.map((item) => (item.category === category ? { ...item, tiers } : item)),
    });
  };

  const addTier = (category: PriceCategory) => {
    onChange({
      ...pricing,
      categories: pricing.categories.map((item) => {
        if (item.category !== category) return item;
        const last = item.tiers[item.tiers.length - 1];
        const nextFrom = last ? (last.toQty === null ? last.fromQty + 1 : last.toQty + 1) : 1;
        return {
          ...item,
          tiers: [...item.tiers, { id: undefined, fromQty: nextFrom, toQty: null, price: 0 }],
        };
      }),
    });
  };

  const removeTier = (category: PriceCategory, index: number) => {
    onChange({
      ...pricing,
      categories: pricing.categories.map((item) =>
        item.category !== category ? item : { ...item, tiers: item.tiers.filter((_, tierIndex) => tierIndex !== index) },
      ),
    });
  };

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <CategoryPricingBlock
          key={category}
          pricing={pricing}
          category={category}
          onChange={updateCategory}
          onAddTier={addTier}
          onRemoveTier={removeTier}
        />
      ))}
      {!isValid && (
        <p className="text-sm text-destructive">
          Narx oralig'lari yaroqsiz: har bir oraliq oldingi oraliqdan keyin boshlanishi, narx 0 dan katta va oxirgi oraliq uchun "Gacha" bo'sh bo'lishi mumkin.
        </p>
      )}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={!isValid}>
          Saqlash
        </Button>
      </div>
    </div>
  );
}
