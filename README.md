# Trưa Nay Ăn Gì — Hanoi Lunch Gacha

Web app gacha món ăn trưa ở Hà Nội. Chọn quận, quay banner, trưa nay ăn món đó, cấm đổi ý.

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:3000.

## Luật gacha

- 8 quận trung tâm (Hoàn Kiếm, Ba Đình, Hai Bà Trưng, Đống Đa, Cầu Giấy, Thanh Xuân, Hoàng Mai, Tây Hồ), mỗi quận 20 món kèm tên quán, địa chỉ, giá, đánh giá, giờ mở cửa (`src/data/dishes.json`).
- Tỉ lệ: N 50%, R 30%, SR 14%, SSR 5%, UR 1%. Nửa số lần ra SSR về món rate-up của banner.
- Pity kép: 100 pull không SSR thì pull 100 chắc chắn SSR; 300 pull không UR thì pull 300 chắc chắn UR. Logic roll ở `src/lib/gacha.ts`.

## CI/CD

- `.github/workflows/ci.yml`: typecheck + lint + build, và audit bảo mật. Chạy trên push/PR vào `main`.
- `.github/workflows/dependency-review.yml`: chặn PR thêm dependency dính CVE mức high trở lên.
- `.github/workflows/smoke.yml`: sau khi Vercel deploy xong, curl URL và kiểm tra trang render đúng.
- Branch `main` được bảo vệ: merge qua PR, yêu cầu check `verify` và `audit` xanh.
- Secret cần có: `VERCEL_BYPASS` (token Protection Bypass for Automation lấy từ Vercel Dashboard, cho smoke test vượt tường SSO).
