# UPLP SWIM — 충남대 수영동아리 우파루파

충남대학교 수영동아리 **우파루파(UPLP)** 공식 웹사이트 프론트엔드입니다.
[Next.js](https://nextjs.org)(App Router) + TypeScript + Tailwind CSS v4로 만들었습니다.

백엔드는 별도 FastAPI 서버(`uplp_back`)입니다.

> ⚠️ **이 저장소는 공개되어 있습니다.**
> 실제 키·비밀번호·회원 개인정보(실명·전화번호·카카오 id)를 코드나 문서에 적지 마세요.
> 전부 환경변수로만 주입합니다. API 상세 명세는 Notion(비공개)에서 관리합니다.

## 현재 진행 상황

- [x] Next.js 프로젝트 세팅 (TypeScript, Tailwind v4, ESLint, App Router)
- [x] 상단 네비게이션 바 / 로그인 상태 표시
- [x] 홈 / 동아리 소개 / 공지·일정 / 정기수영 페이지
- [x] 전역 물결 배경 + 유리(글래스) 디자인 시스템
- [x] FastAPI 백엔드 연동
- [x] 카카오 로그인 (전화번호·단과대·학과 온보딩 포함)
- [x] 관리자 권한 (서버에서 접근 제어)
- [x] 정기수영 신청 시스템 (선착순 · 예비번호 · 후순위 · 취소 시 자동 당김)
- [x] 레인대관 신청서 자동 생성
- [ ] 결제 연동 (미정, 추후 검토)

## 주요 기능

### 정기수영 신청

실제 티켓팅처럼 동작합니다.

- **오픈 예약** — 관리자가 신청 시작·마감 시각을 미리 잡아둡니다. 오픈 전에는 신청 버튼이 계속 보이되 비활성 상태이고, 버튼 안에서 남은 시간이 실시간으로 줄어듭니다.
- **훈련부 / 진도부** 두 개 부서를 각각 별도 정원으로 받습니다.
- **선착순 배정** — 정원을 넘은 신청자는 **예비번호**를 받습니다.
- **취소 시 자동 당김** — 앞사람이 취소하면 예비 1번이 즉시 올라옵니다. 순번은 저장하지 않고 조회할 때마다 계산하므로 정원을 바꿔도 자동으로 다시 정렬됩니다.
- **후순위 제도** — 후순위로 지정된 회원은 별도 대기열에 쌓이고, 관리자가 병합해야 본 명단 뒤에 붙습니다. 병합 후에도 일반 신청자가 항상 앞섭니다.
- **인원 조정** — 신청을 받는 중에도 정원을 바꿀 수 있습니다. 줄이면 초과 인원이 대기로 내려가고, 늘리면 대기자가 자동으로 올라옵니다.
- **명단 대시보드** — 모든 회원이 표 형태로 누가 들어갔는지 볼 수 있습니다(접기/펼치기).
- **관리자 도구** — 수정하기(오픈 전까지만) · 인원 조정 · 마감하기 · 후순위 병합 · 명단 다운로드 · 삭제하기(확인 팝업).

### 레인대관 신청서 자동 생성

정기수영이 마감되면 시설 제출용 신청서(원본 HWP 양식)를 `.docx`로 재현해 내려받습니다.

- 원본 양식의 좌표·글자 크기·행 높이·테두리 굵기를 실측해 **A4 3페이지를 1mm 이내로 재현**합니다.
- 자동으로 채워지는 값: 참석자 이름 / 전화번호 / 사용 희망 날짜 / 이용 인원
- 명단에는 **배정 인원만** 들어갑니다(예비·후순위 대기 제외).
- **신청 마감 후**에만, **관리자만** 받을 수 있습니다.
- 동아리 정보(단체명·서명인·연락처·이용시간)는 백엔드 환경변수로 관리합니다.

> 생성된 신청서에는 **회원 실명과 전화번호가 들어갑니다.**
> 저장소나 공유 드라이브에 올리지 말고, 제출 후에는 로컬에서 지워 주세요.

### 로그인 / 권한

- **카카오 로그인만** 지원합니다. 최초 로그인 시 전화번호(하이픈 없이)·단과대·학과를 한 번만 입력받고, 이후 로그인부터는 바로 들어옵니다.
- **개인정보를 최소한만 보관하기 위해 자체 회원가입은 두지 않았습니다.**
- 관리자는 정기수영을 열고 닫을 수 있습니다. 프론트에서 관리자 UI를 숨기는 동시에 서버에서도 다시 검사하므로, 개발자 도구로 우회해도 차단됩니다.

## 다루는 개인정보

| 항목 | 용도 |
|---|---|
| 카카오 닉네임 | 로그인 식별 · 화면 표시 |
| 전화번호 | 레인대관 신청서 제출 (시설 측 요구 항목) |
| 단과대 · 학과 | 동아리 회원 확인 |

원본 신청서 양식에 "개인 신상정보는 대관 신청한 날짜 일주일 후 파기됩니다"라고 명시되어 있습니다.
실제 파기 절차는 아직 자동화되어 있지 않으므로 운영 시 수동으로 챙겨야 합니다.

## 페이지 구조

```
src/app/
├── page.tsx                        # 홈 (히어로 + 소개 섹션)
├── about/page.tsx                  # 동아리 소개
├── notice/page.tsx                 # 공지사항 / 일정
├── ticket/page.tsx                 # 정기수영 신청 + 명단 대시보드 + 관리자 도구
├── login/page.tsx                  # 카카오 로그인
├── login/kakao/callback/page.tsx   # 카카오 인가 코드 → 토큰 교환
└── onboarding/phone/page.tsx       # 최초 1회 전화번호·단과대·학과 입력
```

주요 컴포넌트:

| 파일 | 역할 |
|---|---|
| `components/motion/LiquidHero.tsx` | 전역 배경 물결(WebGL 유체 시뮬레이션) |
| `components/GlassCard.tsx` | 콘텐츠를 감싸는 유리 카드 — 모든 페이지가 같은 값을 공유 |
| `components/Navbar.tsx` | 네비게이션 + 로그인 상태 |
| `components/WheelTimePicker.tsx` | 잭팟 방식 시각 선택기 |

## API

전체 명세(경로·요청·응답·권한)는 **Notion의 `API 명세서`** 에서 관리합니다.
로컬에서는 백엔드 `/docs`(Swagger UI)로도 확인할 수 있습니다.

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사해서 `.env.local`을 만들고 값을 채워주세요.
**`.env.local`은 커밋하지 않습니다.**

```bash
cp .env.example .env.local
```

| 변수명 | 설명 |
|---|---|
| `NEXT_PUBLIC_API_URL` | 백엔드 서버 주소 |

> `NEXT_PUBLIC_` 접두사가 붙은 값은 **브라우저 번들에 그대로 노출됩니다.**
> 비밀 값은 절대 이 접두사로 두지 마세요. 백엔드 환경변수로만 다룹니다.

백엔드에 필요한 환경변수는 `uplp_back/README.md`를 참고하세요.

> 카카오 개발자 콘솔에 **Redirect URI**를 등록해야 합니다 (배포 주소와 로컬 주소 각각 `/login/kakao/callback`).
> 동의 항목은 콘솔에서 관리하므로 코드에서 `scope`를 넘기지 않습니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 기술 스택

- Next.js 16 (App Router) / React 19 / TypeScript
- Tailwind CSS v4
- three.js + @react-three/fiber + drei (3D)
- motion (애니메이션)
- 백엔드: FastAPI + SQLAlchemy + PostgreSQL, JWT, python-docx

## 배포

- 프론트: Vercel — `main` 브랜치 푸시 시 자동 배포
- 백엔드: Render — 코드를 푸시한 뒤 대시보드에서 재배포해야 반영됩니다

배포 환경변수는 각 호스팅 대시보드에서만 관리합니다. 저장소에 커밋하지 않습니다.

## Third-Party Notices

The liquid water background (`src/components/motion/LiquidHero.tsx`) is based on
[WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation),
Copyright (c) 2017 Pavel Dobryakov, released under the MIT License.
The cursor distortion adaptation follows
[a public CodePen by Ksenia Kondrashova](https://codepen.io/ksenia-k/pen/jENEMjN) (MIT).

The background photograph "Life's a Bit Pink" is
Copyright (c) graham earnshaw, licensed under
[CC BY-NC-ND 2.0](https://creativecommons.org/licenses/by-nc-nd/2.0/).

Full license texts: [`THIRD-PARTY-NOTICES.txt`](THIRD-PARTY-NOTICES.txt).

© 2026 UPLP Swimming Club, Chungnam National University. All rights reserved.
