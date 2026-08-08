# UPLP SWIM — 충남대 수영동아리 우파루파

충남대학교 수영동아리 **우파루파(UPLP)** 공식 웹사이트 프론트엔드입니다.
[Next.js](https://nextjs.org)(App Router) + TypeScript + Tailwind CSS v4로 만들었습니다.

백엔드는 별도 FastAPI 서버(`uplp_back`)이며, 아래 기능들은 프론트·백엔드가 함께 동작합니다.

- 프론트 배포: https://uplp-front.vercel.app
- 백엔드 배포: https://uplp-back.onrender.com (Render)

## 현재 진행 상황

- [x] Next.js 프로젝트 세팅 (TypeScript, Tailwind v4, ESLint, App Router)
- [x] 상단 네비게이션 바 / 로그인 상태 표시
- [x] 홈 / 동아리 소개 / 공지·일정 / 정기수영 페이지
- [x] 전역 물결 배경 + 유리(글래스) 디자인 시스템
- [x] FastAPI 백엔드 연동
- [x] **카카오 로그인** (전화번호·단과대·학과 온보딩 포함)
- [x] **관리자 권한** — 프론트에서 숨기고 서버에서 403으로 차단
- [x] **정기수영 신청 시스템** (선착순 · 예비번호 · 후순위 · 취소 시 자동 당김)
- [x] **레인대관 신청서 자동 생성** (스포렉스 제출용 docx)
- [ ] 결제 연동 (미정, 추후 검토)

## 주요 기능

### 정기수영 신청

실제 티켓팅처럼 동작합니다.

- **오픈 예약** — 관리자가 신청 시작·마감 시각을 미리 잡아둡니다. 오픈 전에는 신청 버튼이 계속 보이되 비활성 상태이고, 버튼 안에서 남은 시간이 실시간으로 줄어듭니다.
- **훈련부 / 진도부** 두 개 부서를 각각 별도 정원으로 받습니다.
- **선착순 배정** — 정원을 넘은 신청자는 **예비번호**를 받습니다.
- **취소 시 자동 당김** — 앞사람이 취소하면 예비 1번이 즉시 올라옵니다. 순번은 저장하지 않고 조회할 때마다 계산하므로 정원을 바꿔도 자동으로 다시 정렬됩니다.
- **후순위 제도** — 후순위로 지정된 회원은 별도 대기열에 쌓이고, 관리자가 "후순위 병합"을 눌러야 본 명단 뒤에 붙습니다. 병합 후에도 일반 신청자가 항상 앞섭니다.
- **인원 조정** — 신청을 받는 중에도 정원을 바꿀 수 있습니다. 줄이면 초과 인원이 대기로 내려가고, 늘리면 대기자가 자동으로 올라옵니다.
- **명단 대시보드** — 관리자뿐 아니라 모든 회원이 표 형태로 누가 들어갔는지 볼 수 있습니다(접기/펼치기).
- **관리자 도구** — 수정하기(오픈 전까지만) · 인원 조정 · 마감하기 · 후순위 병합 · 명단 다운로드 · 삭제하기(확인 팝업).

### 레인대관 신청서 자동 생성

스포렉스에 제출하는 **CNU SPOREX Swimming 레인대관 신청서**(원본 HWP 양식)를 `.docx`로 그대로 재현하고, 확정 명단을 채워서 내려받습니다.

- 원본 PDF의 좌표·글자 크기·행 높이·테두리 굵기를 실측해 **A4 3페이지 레이아웃을 1mm 이내로 재현**합니다.
- 자동으로 채워지는 값: 참석자 이름 / 전화번호 / 사용 희망 날짜 / 이용 인원
- 참석 확인란은 현장 서명용으로 비워둡니다.
- 명단에는 **배정 인원만** 들어갑니다(예비·후순위 대기 제외). 훈련부·진도부 구분 없이 한 표로 합칩니다.
- **신청 마감 후**에만, **관리자만** 내려받을 수 있습니다.
- 동아리 정보(단체명·서명인·연락처·이용시간)는 백엔드 환경변수로 관리하므로 임원이 바뀌어도 코드 수정이 필요 없습니다.

### 로그인 / 권한

- **카카오 로그인만** 지원합니다. 최초 로그인 시 전화번호(하이픈 없이)·단과대·학과를 한 번만 입력받고, 이후 로그인부터는 바로 들어옵니다.
- 개인정보를 최소한만 보관하기 위해 자체 회원가입은 두지 않았습니다.
- 관리자(`role: admin`)는 정기수영을 열고 닫을 수 있습니다. 프론트에서 관리자 UI를 숨기는 동시에, 서버에서도 `get_current_admin`으로 다시 검사해 개발자 도구로 우회해도 403이 납니다.

## 페이지 구조

```
src/app/
├── page.tsx                        # 홈 (히어로 + 소개 섹션)
├── about/page.tsx                  # 동아리 소개
├── notice/page.tsx                 # 공지사항 / 일정
├── ticket/page.tsx                 # 정기수영 신청 + 명단 대시보드 + 관리자 도구
├── login/page.tsx                  # 카카오 로그인 (+ 로컬 검증용 관리자 로그인)
├── login/kakao/callback/page.tsx   # 카카오 인가 코드 → 토큰 교환
└── onboarding/phone/page.tsx       # 최초 1회 전화번호·단과대·학과 입력
```

주요 컴포넌트:

| 파일 | 역할 |
|---|---|
| `components/motion/LiquidHero.tsx` | 전역 배경 물결(WebGL 유체 시뮬레이션) |
| `components/GlassCard.tsx` | 콘텐츠를 감싸는 유리 카드 — 모든 페이지가 같은 값을 공유 |
| `components/Navbar.tsx` | 네비게이션 + 로그인 상태(`~님 안녕하세요`) |
| `components/WheelTimePicker.tsx` | 잭팟 방식 시각 선택기 (오전/오후 · 시 · 분) |

## 백엔드 API

`uplp_back` 저장소의 FastAPI 서버입니다.

| 메서드 | 경로 | 설명 |
|---|---|---|
| POST | `/api/auth/kakao` | 카카오 인가 코드 → JWT 발급 |
| POST | `/api/auth/login` | 관리자 계정 로그인 (로컬 검증용) |
| GET / PATCH | `/api/users/me` | 내 정보 조회 / 전화번호·단과대·학과 저장 |
| PATCH | `/api/users/{id}/deprioritized` | 후순위 지정·해제 (관리자) |
| GET / POST | `/api/swim/sessions` | 정기수영 목록 / 개설 (관리자) |
| POST / DELETE | `/api/swim/sessions/{id}/apply` | 신청 / 취소 |
| PATCH | `/api/swim/sessions/{id}` | 수정 (오픈 전까지, 관리자) |
| PATCH | `/api/swim/sessions/{id}/capacity` | 정원 조정 (관리자) |
| POST | `/api/swim/sessions/{id}/merge` | 후순위 병합 (관리자) |
| POST | `/api/swim/sessions/{id}/close` | 마감 (관리자) |
| DELETE | `/api/swim/sessions/{id}` | 삭제 (관리자) |
| GET | `/api/swim/sessions/{id}/roster` | 명단 조회 (전체 공개) |
| GET | `/api/swim/sessions/{id}/roster.docx` | 레인대관 신청서 다운로드 (마감 후·관리자) |

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사해서 `.env.local`을 만들고 값을 채워주세요.

```bash
cp .env.example .env.local
```

| 변수명 | 설명 |
|---|---|
| `NEXT_PUBLIC_API_URL` | FastAPI 백엔드 주소 (로컬 `http://localhost:8000`, 배포 시 `https://uplp-back.onrender.com`) |

백엔드(`uplp_back`)에는 다음 값이 필요합니다.

| 변수명 | 설명 |
|---|---|
| `DATABASE_URL` | PostgreSQL 접속 주소 |
| `JWT_SECRET_KEY` | JWT 서명 키 |
| `KAKAO_REST_API_KEY` | 카카오 개발자 콘솔의 REST API 키 |
| `KAKAO_CLIENT_SECRET` | 콘솔에서 Client Secret을 켠 경우에만 |
| `ADMIN_KAKAO_IDS` | 관리자 권한을 줄 카카오 id 목록 (콤마 구분) |
| `CLUB_NAME` · `CLUB_SIGNER` · `CLUB_CONTACT` · `RENTAL_HOURS` | 레인대관 신청서에 들어가는 동아리 정보 |

> 카카오 개발자 콘솔에 **Redirect URI**를 등록해야 합니다.
> `https://uplp-front.vercel.app/login/kakao/callback` (로컬 테스트 시 `http://localhost:3000/...`도 함께)
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
- 백엔드: FastAPI + SQLAlchemy + PostgreSQL, JWT(python-jose), python-docx

## 배포

- 프론트: [Vercel](https://vercel.com/new) — `main` 브랜치 푸시 시 자동 배포
- 백엔드: Render — 코드를 푸시한 뒤 대시보드에서 재배포해야 반영됩니다

## Credits

전역 배경 사진(`public/pink_lake.jpg`)은
[&ldquo;Life's a Bit Pink&rdquo;](https://www.flickr.com/photos/globaledgephotography/45549155674/)
(© graham earnshaw, [CC BY-NC-ND 2.0](https://creativecommons.org/licenses/by-nc-nd/2.0/))입니다.
**저작자에게 별도 허락을 받아** Real-ESRGAN으로 해상도를 보정(1024×684 → 6144×4104)해 사용했습니다.
ND(변경 금지) 조건은 이 허락에 한해 해제된 것이며, 이 저장소를 포크·재사용하는 경우
동일한 허락 없이 업스케일본을 그대로 쓸 수 없습니다.

마우스 물결 효과(`src/components/motion/LiquidHero.tsx`)는
[WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation)
(© 2017 Pavel Dobryakov, MIT)을 기반으로 하며, 커서 왜곡 표현은
[Ksenia Kondrashova의 CodePen](https://codepen.io/ksenia-k/pen/jENEMjN)(MIT)을
참고해 재구현했습니다. 전체 라이선스 전문은 [`THIRD-PARTY-NOTICES.txt`](THIRD-PARTY-NOTICES.txt) 참고.
