
# ICH Modulini To'liq Qayta Qurish

## 1. Data layer kengaytmalari

**`src/lib/mockData.ts`** — yangi tip va seed massivlar qo'shiladi (mavjudlari saqlanadi):

- `IchRawStock` — ICH omboridagi xomashiyo: `{ materialId, name, unit, stock, min }` (4-5 element: Sellyuloza 450 kg, Etiketka A4 1200 dona min 1500, Klej PVA 38 l min 50, Korobka kichik 95 dona min 200).
- `BomEntry` — `Record<productId, { materialId, name, unit, perUnit }[]>` BOM koeffisiyentlari (Salfetka 365, Tualet qog'ozi 12-li uchun spec'dagi qiymatlar; ICH bo'lmagan "Korobka kichik" yangi materialni `rawMaterials`'ga ham qo'shamiz id=7 ICH).
- `AstatkaItem` — `{ id, date, name, qty, unit, status: "Omborida"|"Makulaturaga chiqarilgan" }` (4 ta seed yozuv spec bo'yicha).
- `IncomeRow` interfeysi `incomes` uchun (Kirim store ulanishi uchun).

## 2. Store kengaytmasi

**`src/lib/omborStore.ts`**'ga qo'shiladi (mavjud logikaga tegmasdan):

- `state.ichRaw: IchRawStock[]`, `state.astatka: AstatkaItem[]`, `state.ichBatches`, `state.incomes` (mockData seed'idan ko'chiriladi).
- `transferRawToIch({ materialId, qty })` — asosiy `raw` stock'ni kamaytiradi, `ichRaw` stock'ni oshiradi. **Chiqim YARATMAYDI**.
- `produceIch({ items: [{productId, qty}], scrapItems: [{name, qty, unit}] })`:
  - Har bir mahsulot uchun BOM bo'yicha `ichRaw` stock'idan kerakli miqdorni ayiradi.
  - `products` (ICH) stock'ini oshiradi.
  - `ichBatches` ga yangi qator qo'shadi (Partiya P-XXX, sana, mahsulotlar matni, jami tannarx ICH narxlari asosida, scrap matni, operator).
  - Ortib qolgan miqdor uchun `astatka` ga avtomatik yozuv (status "Omborida").
- `discardToMakulatura({ ids: number[], price: number, note?: string })`:
  - Tanlangan astatka qatorlari status -> "Makulaturaga chiqarilgan".
  - `incomes` ga yangi yozuv: `source: "Makulatura"`, `note`, `amount: formatNumber(price)`, `method: "Naqd"`, sana = bugun.
- `useOmborStore` selector kengaytirilgan state'ni o'qiy oladi.
- `Kirim.tsx` reactive bo'lishi uchun store'dan `incomes`'ni o'qiydi (mavjud `Chiqim.tsx` patterniga o'xshash).

## 3. Yangi modal komponentlar

**`src/components/ich/ImportRawToIchDialog.tsx`**
- Sarlavha: "ICH Omboriga Xomashiyo O'tkazish"
- Info banner (muted bg, Info ikon): "Bu ichki ko'chirish — asosiy ombordan ICH omboriga o'tkaziladi. Chiqim yaratilmaydi."
- Select: faqat `branch === "ich"` xomashiyolar.
- Read-only field: "Asosiy omborda: {stock} {unit}" tanlanganda avtomatik.
- Number input "Miqdori" — `qty > asosiyStock` bo'lsa inline xato + Save disabled.
- Save: `transferRawToIch`, toast success, modal yopiladi.

**`src/components/ich/NewBatchDialog.tsx`**
- Sarlavha: "ICH — Tayyor Mahsulot Chiqarish", `max-w-2xl`.
- PART 1: Dinamik massiv `[{productId, qty}]`, "Yana mahsulot qo'shish" tugma, ICH mahsulotlarini Select'da.
- PART 2: Auto-jadval — har bir item BOM'i bo'yicha xomashiyolarni jamlaydi (bir xil materialId qatorlari yig'iladi). Ustunlar: Xomashiyo nomi, O'lchov, Kerakli miqdor (editable Input), ICH ombordagi qoldiq, Holat badge.
- Yetishmaslik bo'lsa: Save disabled + warning banner "Yetarlicha xomashiyo yo'q. ICH omborini to'ldiring."
- Save: `produceIch` chaqiriladi (scrap hozircha bo'sh, kelajakda kengaytiriladigan). Toast.

**`src/components/ich/MakulaturaDialog.tsx`**
- Bitta yoki ko'p qator uchun (props: `items: AstatkaItem[]`).
- Read-only ro'yxat: nom — miqdor.
- Inputs: "Makulatura narxi (so'm)" (number), "Izoh" (text optional).
- Save: `discardToMakulatura`, toast "Makulaturaga chiqarildi. Kirim yozuvi yaratildi."

## 4. `src/pages/ICH.tsx` qayta yoziladi

Tuzilma:

```text
PageHeader (Yangi partiya tugmasi olib tashlanadi — sectionga ko'chadi)
3 KPI stat-cards (Bu oy partiyalar, Ishlab chiqarilgan, Astatka — astatka soni dynamic)

[Card] ICH Xomashiyo Ombori
  header: title + "Ombordan xomashiyo import" tugma (primary)
  table: No | Nomi | Miqdori | O'lchov | Holat (Yetarli/Kam badge)

[Card] Ishlab chiqarish partiyalari
  header: title + "+ Yangi partiya" tugma
  existing table (ichBatches store'dan)

[Card] Astatka (Qoldiqlar)
  header: title + "Makulaturaga chiqarish (tanlangan)" tugma (selected.length<2 bo'lsa disabled)
  table: checkbox | No | Sana | Nomi | Miqdori | O'lchov | Holati | Amallar
  per-row "Makulaturaga chiqarish" outline tugma faqat status="Omborida" uchun
```

Local state: `selectedAstatka: number[]`, modal openers.

## 5. Texnik tafsilotlar

- Mavjud `BranchBadge`, `StatusBadge` (`@/components/Badges`) ishlatiladi.
- `Checkbox` `@/components/ui/checkbox` allaqachon mavjud.
- `formatNumber` / `parseNumber` `@/lib/utils`'dan.
- Boshqa sahifalar (WL, Ombor, Buyurtma, Chiqim) o'zgartirilmaydi. `Kirim.tsx` faqat store'dan `incomes`'ni reactive o'qish uchun yangilanadi (barcha ustun va layout saqlanadi).
- Routing o'zgarmaydi (`/ich`).

## O'zgartiriladigan/yaratiladigan fayllar

- **edit:** `src/lib/mockData.ts` (yangi tip + seedlar)
- **edit:** `src/lib/omborStore.ts` (ichRaw/astatka/batches/incomes state + 3 action)
- **edit:** `src/pages/ICH.tsx` (to'liq qayta yozish)
- **edit:** `src/pages/Kirim.tsx` (store'dan reactive o'qish)
- **new:** `src/components/ich/ImportRawToIchDialog.tsx`
- **new:** `src/components/ich/NewBatchDialog.tsx`
- **new:** `src/components/ich/MakulaturaDialog.tsx`
