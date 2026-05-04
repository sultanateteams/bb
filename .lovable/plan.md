## OMBOR moduli to'liq qurish rejasi

Quyida nima o'zgaradi va nima qo'shiladi.

### 1. Mock data kengaytirish — `src/lib/mockData.ts`

- `Product` ga `status: "bo'sh" | "band"` maydon qo'shamiz (band qilingan = buyurtma uchun rezervlangan).
- `wlOps` da mavjud `status` dan foydalanamiz: `"Ishlab chiqarishdagi"` va `"Ishlab chiqarilgan"` (mavjud "Qabul kutilmoqda"/"Qabul qilindi" o'rniga, ENV bilan moslashtirilgan).
- Yangi global modullar (oddiy mutable arrays — backend bo'lmagani uchun runtime state):
  - `xomashiyoImportHistory: ImportRecord[]` — boshlang'ich 4-5 ta yozuv (ICH/WL aralash, turli sanalar).
- Helper: `formatNumber(n)` — 9500 → "9 500" (mavjud emas — `src/lib/utils.ts` ga qo'shamiz).

### 2. Yangi global store — `src/lib/omborStore.ts`

UI skeletida backend yo'q, lekin modallar haqiqiy ishlasa kerak (zaxira o'zgarishi, chiqim yozuvi, tarix). Bu uchun yengil Zustand-ga o'xshash store yaratamiz, lekin sof React orqali — `useSyncExternalStore` bilan oddiy event-emitter:

- `getProducts()`, `getRawMaterials()`, `getExpenses()`, `getWlOps()`, `getImportHistory()`
- `addTmStock(items)` — har bir item uchun: stock += qty, expense yozuvi qo'shadi (Chiqim sahifasi shu storedan o'qiydi).
- `receiveWlBatch(wlId, receivedQty, pricePerUnit)` — WL op statusini "Ishlab chiqarilgan" ga o'zgartiradi, mos product stockini oshiradi, chiqim yozadi.
- `importRaw({type, materialId, qty, price, note})` — agar mavjud bo'lsa qty qo'shadi va o'rtacha narx hisoblaydi, aks holda yangi qator (yo'q — faqat mavjudlarni yangilaydi UI skeletida), chiqim + import history qo'shadi.
- `subscribe(fn)` — komponentlar qayta render bo'lishi uchun.

Sahifalar (`Ombor`, `Chiqim`) `useSyncExternalStore` orqali store dan o'qiydi. Boshqa sahifalar (Kirim, ICH, WL, Catalogs) o'zgarishsiz qoladi — Chiqim sahifasini ham store ga ulaymiz, shunda real chiqim ko'rinadi.

### 3. Ombor sahifasi qayta yozilishi — `src/pages/Ombor.tsx`

Yangi tuzilma:

```text
PageHeader (Ombor — sarlavha, subtitle, [Eksport] tugma)
Tabs:
  ├── Tayyor mahsulot
  │   FilterBar: [Search] [Holati ▾] [Turi ▾]   → o'ng: [TM qo'shish] [WL import]
  │   Table: No | Nomi | Turi(badge) | Holati | Miqdori | Birlik | Min | Narx
  └── Xomashiyo
      FilterBar: [Search] [Turi ▾]   → o'ng: [Xomashiyo import] [Import tarixi]
      Table: No | Nomi | Turi(badge) | Miqdori | Birlik | Narx | Holat
```

Filter logikasi `useMemo` bilan, real-time qidiruv. "Import tarixi" tugmasi `/ombor/import-tarixi` ga `navigate` qiladi.

`PageHeader` ga `actions` prop allaqachon mavjud — undan foydalanamiz; `showAdd` ni o'chirib, modal trigger tugmalarni o'zimiz qo'yamiz.

### 4. Yangi komponentlar — `src/components/ombor/`

- `TmAddDialog.tsx` — Dialog + dinamik qatorlar (`useFieldArray`-siz, oddiy `useState<Row[]>`). Har qator: mahsulot Select (faqat TM products), miqdor, narx, jami (read-only). Pastda "Yana qo'shish", "Bekor qilish", "Saqlash". Validatsiya: zod schema (har qatorda productId tanlangan, qty>0, price>0). Saqlashda `addTmStock` chaqiriladi, `toast.success("N ta mahsulot omborga qo'shildi")`.

- `WlImportDialog.tsx` — Dialog. WL op Select (faqat status="Ishlab chiqarishdagi"). Tanlanganda kutilgan miqdor avto-to'ldiriladi (read-only). Maydonlar: qabul qilingan miqdor, narx, jami (auto), ortiqcha (auto, faqat >0 bo'lsa info bilan ko'rsatiladi). Saqlash → `receiveWlBatch`.

- `XomashiyoImportDialog.tsx` — Dialog. RadioGroup (ICH/WL), Xomashiyo Select (turi bo'yicha filter), miqdor, narx (catalog default bilan avto-to'ldirilib editable), jami (auto), izoh. Saqlash → `importRaw`.

- `OmborFilters.tsx` (ixtiyoriy yordamchi) — qaytalanadigan search + select filter blok.

Barcha modallar `Dialog`/`DialogContent` (max-w-2xl), formlar `react-hook-form` + `zod` bilan (`@hookform/resolvers` mavjudligini package.json da tekshirdim — kerak bo'lsa add qilamiz; aks holda oddiy useState validation bilan ketamiz).

### 5. Import tarixi sahifasi — `src/pages/OmborImportTarixi.tsx`

- Route: `/ombor/import-tarixi` (App.tsx ga qo'shamiz).
- PageHeader: "Xomashiyo Import Tarixi", subtitle, orqaga qaytish tugmasi (`<Button variant="ghost" onClick={() => navigate('/ombor')}>← Orqaga</Button>`) PageHeader actions slotida.
- FilterBar: Turi Select (ICH/WL/Hammasi) + sana oralig'i (`Popover` + `Calendar` ikkita: dan/gacha — shadcn `calendar` mavjud).
- Jadval ustunlar: No | Xomashiyo nomi | Turi (badge) | Miqdori | Birlik | Narxi | Jami summa | Izoh | Sana. Eng yangidan saralangan.
- Ma'lumot store dan `getImportHistory()`.

### 6. Chiqim sahifasi ulanish

`Chiqim.tsx` ni store dagi `getExpenses()` natijasi bilan birlashtirilgan ro'yxatdan foydalanadi (boshlang'ich mock + store da qo'shilganlar). Bu modallardagi xaridlar haqiqiy chiqimga ta'sir qilishini ko'rsatadi.

### 7. Dizayn / detallar

- Holati badge: "Bo'sh" = neytral muted, "Band" = warning tonali.
- "Kam" qator: qizil matn + `AlertCircle` ikon (mavjud uslub).
- Sonlar: `formatNumber` helper bilan thousands separator.
- Tugmalar: TM qo'shish & Xomashiyo import & Import → `bg-gradient-brand` (primary), boshqalari `variant="outline"`.
- Zod validatsiya xabarlari uzbekcha; xato inline `<p className="text-xs text-destructive">`.

### 8. Fayllar ro'yxati

Yangi:
- `src/lib/omborStore.ts`
- `src/components/ombor/TmAddDialog.tsx`
- `src/components/ombor/WlImportDialog.tsx`
- `src/components/ombor/XomashiyoImportDialog.tsx`
- `src/pages/OmborImportTarixi.tsx`

O'zgartiriladi:
- `src/lib/mockData.ts` (status maydon, import history seed, narx defaults)
- `src/lib/utils.ts` (formatNumber)
- `src/pages/Ombor.tsx` (filterlar, modallar, store)
- `src/pages/Chiqim.tsx` (store ulanishi)
- `src/App.tsx` (yangi route)

### 9. Texnik eslatmalar

- `react-hook-form` va `zod` allaqachon shadcn form bilan keladi (package.json da bor). Yo'q bo'lsa qo'shamiz.
- WL import dialog uchun `wlOps` da `expectedQty` aniq emas — `qty` maydonidan kutilgan miqdor sifatida foydalanamiz, yangi `receivedQty` modal ichida kiritiladi.
- Boshqa sahifalar (ICH, Buyurtma, Kirim, Catalogs, Partners) tegilmaydi.

Tasdiqlasangiz, shu bo'yicha implementatsiyani boshlayman.