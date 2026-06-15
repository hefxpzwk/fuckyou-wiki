# 이미지 관리 규칙

이 프로젝트는 S3 같은 외부 저장소 없이 Next.js의 `public` 정적 파일로 이미지를 제공합니다.

## 권장 위치

```txt
public/images/
  wiki-cover.png
  fuckyous/
    gaslighting/
      cover.webp
      flow.webp
    passive-aggressive/
      cover.webp
```

## 문서에서 쓰는 방법

```md
![이미지 설명](/images/fuckyous/gaslighting/flow.webp)
```

## 권장 형식

- 대표 이미지: `cover.webp`
- 본문 이미지: `example-1.webp`, `diagram.webp`, `flow.webp`
- 긴 쪽 기준 1600px 이하 권장
- 파일명은 영문 소문자와 하이픈 사용

이미지가 아직 없으면 frontmatter의 `thumbnail`을 `/images/wiki-cover.png`로 두면 됩니다.
