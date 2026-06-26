# UPLP SWIM — 동아리 웹사이트

UPLP 수영 동아리 공식 웹사이트 프론트엔드입니다. [Next.js](https://nextjs.org)(App Router) + TypeScript + Tailwind CSS로 구성되어 있습니다.

백엔드는 별도 FastAPI 서버로 구축됩니다. API 명세는 Notion에서 관리합니다.

## 현재 진행 상황

- [x] Next.js 프로젝트 세팅 (TypeScript, Tailwind v4, ESLint, App Router)
- [x] 상단 네비게이션 바
- [x] 홈 / 동아리 소개 / 공지·일정 / 티케팅 기본 페이지
- [x] 수영 동아리 테마(블루 톤) 디자인 적용
- [x] API 명세서 정리 (Notion)
- [ ] FastAPI 백엔드 연동
- [ ] 로그인/회원가입 기능 구현
- [ ] 티케팅(정기수영 신청) 기능 구현
- [ ] 결제 연동 (미정, 추후 검토)

## 페이지 구조

```
src/app/
├── page.tsx          # 홈
├── about/page.tsx     # 동아리 소개
├── notice/page.tsx    # 공지사항 / 일정
└── ticket/page.tsx    # 티케팅
```

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사해서 `.env.local`을 만들고, 필요한 값을 채워주세요.

```bash
cp .env.example .env.local
```

| 변수명 | 설명 |
|---|---|
| `NEXT_PUBLIC_API_URL` | FastAPI 백엔드 서버 주소 (기본값: `http://localhost:8000`) |

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 기술 스택

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

## 배포

[Vercel](https://vercel.com/new)을 통한 배포를 권장합니다.
