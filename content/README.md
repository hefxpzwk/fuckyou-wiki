# 콘텐츠 작성 규격

위키 항목은 `content/fuckyous/*.md` 파일 하나가 페이지 하나가 됩니다.

## 새 항목 만들기

1. `content/fuckyous/my-entry.md` 파일을 만듭니다.
2. 아래 frontmatter를 복사해서 채웁니다.
3. 이미지는 `public/images/fuckyous/my-entry/` 폴더에 넣습니다.
4. 문서 안에서는 `/images/fuckyous/my-entry/example.webp`처럼 절대 경로로 참조합니다.

```md
---
title: 항목 제목
summary: 목록과 검색 결과에 보일 한 줄 요약
category: 언어적 fuckyou
tags:
  - 비꼼
  - 회피
aliases:
  - 다른 이름
severity: medium
thumbnail: /images/fuckyous/my-entry/cover.webp
related:
  - related-entry-slug
createdAt: 2026-06-15
updatedAt: 2026-06-15
---

## 정의

## 특징

## 자주 나오는 상황

## 예시

## 대응 방법

## 관련해서 볼 것
```

## 필수 frontmatter

- `title`: 항목 제목
- `summary`: 카드와 메타 설명에 쓰는 요약
- `category`: 분류 페이지에서 자동 집계되는 값
- `tags`: 검색과 카드 뱃지에 쓰는 키워드
- `thumbnail`: 대표 이미지 경로. 없으면 기본 커버 이미지를 씁니다.

## 권장 카테고리

- 언어적 fuckyou
- 행동적 fuckyou
- 관계적 fuckyou
- 직장/조직 fuckyou
- 온라인/커뮤니티 fuckyou
- 가스라이팅/조작
- 수동공격
- 사과 같지 않은 사과
