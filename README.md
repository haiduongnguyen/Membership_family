# Relationship Memory MVP

MVP web-app de quan ly va ghi nho moi quan he ca nhan theo graph/tree.

## Stack
- Next.js 15 + React 18 + TypeScript
- TailwindCSS
- Supabase (Auth + Postgres + Storage)
- React Flow (graph)
- FullCalendar (calendar)

## Chuc nang MVP da co
- Dang nhap/Dang ky bang email + password
- Tao nhom `Gia dinh`
- Them thanh vien
- Them moi quan he giua cac thanh vien
- Hien thi graph theo tang the he (tu node goc)
- Click node de xem/sua thong tin ca nhan
- Them su kien sinh nhat/ky niem
- Xem su kien tren lich thang
- Upload anh dai dien va anh su kien

## Cai dat
1. Cai dependency:
```bash
npm install
```
2. Tao file `.env.local`:
```bash
cp .env.example .env.local
```
3. Dien thong tin Supabase trong `.env.local`.
4. Chay SQL trong `supabase/schema.sql` tren SQL editor cua Supabase.
5. Tao storage bucket `relationship-media` va bat Public.
6. Chay app:
```bash
npm run dev
```

## Cau truc
- `src/components/app-shell.tsx`: giao dien va luong chinh MVP
- `src/lib/models.ts`: kieu du lieu core
- `src/lib/supabase.ts`: Supabase client
- `supabase/schema.sql`: schema + RLS policies

## Huong mo rong tiep theo
- Replace prompt bang modal form (shadcn/ui)
- Relation path finder: "Toi -> Bo -> ..."
- Auto layout rieng cho family/company
- Event participants + bo loc nang cao
- Gallery theo group/person/event
