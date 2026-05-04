import { Button } from "@/components/ui/button";
import { ProductPricing, PriceCategory, PriceTier } from "../types";
import { PriceTierRow } from "./PriceTierRow";

interface Props {
  pricing: ProductPricing;
  category: PriceCategory;
  onChange: (category: PriceCategory, tiers: PriceTier[]) => void;
  onAddTier: (category: PriceCategory) => void;
  onRemoveTier: (category: PriceCategory, index: number) => void;
}

const labels: Record<PriceCategory, string> = {
  retail: "Do'kon (Retail)",
  dealer: "Diler",
  vip: "VIP / Exclusive",
};

export function CategoryPricingBlock({ pricing, category, onChange, onAddTier, onRemoveTier }: Props) {
  const categoryData = pricing.categories.find((item) => item.category === category);
  if (!categoryData) return null;

  return (
    <div className="rounded-xl border bg-muted/50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold">{labels[category]}</h3>
        <Button size="sm" variant="outline" onClick={() => onAddTier(category)}>
          + Oraliq qo'shish
        </Button>
      </div>
      <div className="space-y-2">
        {categoryData.tiers.map((tier, index) => (
          <PriceTierRow
            key={`${category}-${tier.id ?? index}`}
            tier={tier}
            isLast={index === categoryData.tiers.length - 1}
            onChange={(updated) =>
              onChange(
                category,
                categoryData.tiers.map((row, rowIndex) => (rowIndex === index ? updated : row)),
              )
            }
            onRemove={() => onRemoveTier(category, index)}
          />
        ))}
      </div>
    </div>
  );
}
