# 🤖 AI Sozlama Qo'llanmasi — Universal Setup

> **Maqsad:** Qaysi AI dan foydalansangiz ham, `AI_GUIDELINES.md` avtomatik o'qilib, qoidalarga amal qilishi.
> Har bir AI turli xil ishlaydi — quyida hammasi uchun yechim.

---

## 1. Cline (VS Code Extension) ✅ ALLAQACHON SOZLANGAN

`/.clinerules` fayli mavjud. Cline **har bir sessiyada avtomatik** o'qiydi.

**Hech narsa qilish shart emas.** Cline ochilganda:
1. `.clinerules` ni o'qiydi
2. Undagi ko'rsatmaga ko'ra `AI_GUIDELINES.md` ni o'qiydi
3. Keyin vazifangizni bajarishga kirishadi

---

## 2. Cursor AI (cursor.com)

### Variant A: `.cursorrules` (avtomatik)

Loyiha ildizida `.cursorrules` fayl yarating:

```bash
# Terminal orqali
cp .clinerules .cursorrules
```

Cursor **har bir chatda avtomatik** `.cursorrules` faylini context sifatida oladi.

### Variant B: Cursor Settings

1. Cursor → Settings → Rules → User Rules
2. Qo'shing:
```
@ Reading AI_GUIDELINES.md first is MANDATORY
```
3. Yoki Rules → Project Rules ga `AI_GUIDELINES.md` ni qo'shing

---

## 3. GitHub Copilot / Copilot Chat

### VS Code da:

1. Settings → `github.copilot.chat.codeGeneration.instructions`
2. `[]` ichiga qo'shing:
```json
[
  {
    "file": ".github/copilot-instructions.md"
  }
]
```
3. `.github/copilot-instructions.md` fayl yarating:

```bash
mkdir -p .github
cp AI_GUIDELINES.md .github/copilot-instructions.md
```

### GitHub Copilot Chat da qo'lda:

Copilot chatga har safar yozing:
```
@ Read AI_GUIDELINES.md first before answering.
```

---

## 4. Windsurf (codeium.com)

Loyiha ildizida `.windsurfrules` fayl yarating:

```bash
cp .clinerules .windsurfrules
```

Windsurf bu faylni avtomatik o'qiydi.

---

## 5. ChatGPT, Claude, Gemini (Web/Mobile)

Bular loyiha fayllariga kira olmaydi. Shuning uchun:

### Har bir vazifa boshida COPY-PASTE qiling:

```
Project: uz-gas-trade
Rules: Read AI_GUIDELINES.md and follow all rules strictly.
Specifically:
1. 4-Layer API Architecture — NEVER break layer isolation
2. TanStack Query for server state, Zustand for client state
3. Tailwind CSS variables only, lucide-react icons
4. kebab-case file naming
5. Run Pre-Task Verification before coding
```

Yoki tezroq variant — qisqa buyruq:

```
Read AI_GUIDELINES.md from project root and follow ALL rules.
```

---

## 6. Universal Yechim: Prompt Template

Har qanday AI ga vazifa berishdan oldin shu templateni ishlating:

```
📋 PROJECT CONTEXT: uz-gas-trade (React + TypeScript + Vite)
📖 RULES: Read AI_GUIDELINES.md and .clinerules — ALL rules are MANDATORY.
✅ CHECK: Run Pre-Task Verification checklist (Section 5.1) before coding.
🚫 STRIKE: Breaking 4-layer architecture = rejection.

TASK: [vazifangizni yozing]
```

---

## Xulosa: Eng Yaxshi Amaliyot

| AI Tool | Avtomatik? | Sozlash |
|---------|-----------|---------|
| **Cline** | ✅ **Ha** | `.clinerules` tayyor |
| **Cursor** | ✅ **Ha** | `.cursorrules` yarating |
| **Windsurf** | ✅ **Ha** | `.windsurfrules` yarating |
| **GitHub Copilot** | ✅ **Ha** | `.github/copilot-instructions.md` yarating |
| **ChatGPT/Claude** | ❌ **Yo'q** | Har safar promptga qo'shing |
| **Any AI via API** | ❌ **Yo'q** | System prompt ga qo'shing |

---

## ⚡ Tezkor sozlash (barchasi uchun)

Agar hamma AI larni birdaniga sozlamoqchi bo'lsangiz, terminalda:

```bash
# Cline uchun (allaqachon bor)
# Cursor uchun
cp .clinerules .cursorrules

# Windsurf uchun
cp .clinerules .windsurfrules

# GitHub Copilot uchun
mkdir -p .github
cp AI_GUIDELINES.md .github/copilot-instructions.md
```

Shundan keyin Cline, Cursor, Windsurf, GitHub Copilot — hammasi avtomatik o'qiydi.