# Fuckyou Wiki

Next.js 기반 위키입니다. 기본 문서는 Markdown 파일에서 읽고, 관리자가 승인한 사용자 기여는 Firebase Firestore에 반영됩니다.

## 실행

```bash
npm install
npm run dev
```

Firebase Google 로그인과 Firestore를 쓰려면 Firebase 환경변수를 설정합니다.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_UIDS=관리자uid1,관리자uid2
npm run dev
```

프로덕션 확인:

```bash
npm run build
npm run start
```

## 콘텐츠 추가와 기여 승인

일반 사용자는 Google 로그인 후 `/contribute/new`에서 새 항목을 제안하거나, 각 문서 하단의 수정 제안 링크로 기존 문서 수정을 요청할 수 있습니다. 문서에는 Google 계정명이 아니라 마이페이지에서 설정한 계정 닉네임이 표시됩니다.

관리자는 `/login`에서 일반 사용자와 똑같이 Google 로그인한 뒤, 로그인 화면의 관리 페이지 버튼이나 `/admin/contributions` 링크로 제안을 검토합니다. `FIREBASE_ADMIN_UIDS`에 등록된 UID만 관리자 권한을 얻습니다. 승인하면 Firestore 문서로 반영되고, 거절하면 대기 목록에서 제외됩니다. 승인된 제안자의 닉네임은 문서 하단의 기여 영역에 표시됩니다.

## Markdown 초기 콘텐츠

새 항목은 `content/fuckyous/<slug>.md`로 추가합니다. 상세 규격은 `content/README.md`를 참고하세요.

이미지는 `public/images/fuckyous/<slug>/`에 넣고 문서에서 아래처럼 참조합니다.

```md
![설명](/images/fuckyous/<slug>/example.webp)
```

## 배포

Vercel, Netlify, Docker 기반 Node 호스팅에서 일반 Next.js 앱처럼 배포하면 됩니다.

배포 도메인이 정해지면 Open Graph 이미지 URL을 위해 환경변수를 설정하세요.

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

## 현재 포함된 페이지

- `/`: 홈
- `/wiki`: 검색/필터 가능한 전체 항목
- `/wiki/[slug]`: 항목 상세
- `/categories`: 카테고리 자동 집계
