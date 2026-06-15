# Fuckyou Wiki

Next.js 기반의 파일 관리형 위키입니다. 글은 Markdown 파일, 이미지는 `public` 정적 파일로 관리해서 S3 없이 바로 배포할 수 있습니다.

## 실행

```bash
npm install
npm run dev
```

프로덕션 확인:

```bash
npm run build
npm run start
```

## 콘텐츠 추가

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
