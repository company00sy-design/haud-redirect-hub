# Redirect Hub

URL 리다이렉트 허브와 클릭 통계 대시보드를 제공하는 TypeScript Node.js Express 애플리케이션입니다.

## 기능

- **URL 리다이렉트**: `/go/:slug` 경로로 들어온 요청을 실제 상담 링크로 302 리다이렉트
- **클릭 추적**: 모든 리다이렉트 클릭을 데이터베이스에 기록
- **관리자 대시보드**: EJS 템플릿으로 구현된 클릭 통계 확인 페이지
- **SQLite 데이터베이스**: Prisma ORM을 사용한 데이터 관리

## 기술 스택

- **Backend**: TypeScript, Node.js, Express
- **Database**: SQLite with Prisma ORM
- **Template Engine**: EJS
- **Frontend**: Bootstrap 5, Chart.js
- **Development**: ts-node-dev for hot reload

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 데이터베이스 설정:
```bash
npm run db:push
npm run db:generate
```

3. 시드 데이터 생성:
```bash
npx ts-node prisma/seed.ts
```

4. 개발 서버 실행:
```bash
npm run dev
```

5. 프로덕션 빌드:
```bash
npm run build
npm start
```

## 사용법

### 리다이렉트 링크 생성
1. `http://localhost:3000/admin`에서 관리자 대시보드 접속
2. "Create New Link" 버튼 클릭
3. Slug와 Target URL 입력
4. 생성된 링크는 `http://localhost:3000/go/{slug}` 형태로 사용

### 통계 확인
- 대시보드에서 전체 링크 목록과 클릭 통계 확인
- 각 링크별 상세 통계 및 클릭 히스토리 확인
- 최근 24시간 클릭 수 및 인기 링크 순위 확인

## API 엔드포인트

- `GET /go/:slug` - 리다이렉트 실행 및 클릭 기록
- `GET /admin` - 관리자 대시보드
- `GET /admin/create` - 새 링크 생성 폼
- `POST /admin/create` - 새 링크 생성
- `GET /admin/link/:id` - 링크 상세 정보
- `POST /admin/toggle/:id` - 링크 활성화/비활성화
- `GET /health` - 헬스 체크

## 프로젝트 구조

```
src/
├── index.ts          # 메인 애플리케이션 파일
└── routes/
    ├── admin.ts       # 관리자 라우트
    └── redirect.ts    # 리다이렉트 라우트

views/
├── layout.ejs        # 공통 레이아웃
└── admin/
    ├── dashboard.ejs     # 대시보드
    ├── create-link.ejs   # 링크 생성 폼
    ├── link-details.ejs  # 링크 상세 정보
    └── error.ejs         # 에러 페이지

prisma/
├── schema.prisma     # 데이터베이스 스키마
└── seed.ts          # 시드 데이터
```

## 데이터베이스 스키마

### RedirectLink
- `id`: 기본 키
- `slug`: 고유한 URL 슬러그
- `targetUrl`: 리다이렉트할 실제 URL
- `title`: 링크 제목 (선택사항)
- `description`: 링크 설명 (선택사항)
- `isActive`: 링크 활성화 상태
- `createdAt`, `updatedAt`: 생성/수정 시간

### Click
- `id`: 기본 키
- `linkId`: 연결된 리다이렉트 링크 ID
- `userAgent`: 사용자 브라우저 정보
- `referer`: 참조 페이지 URL
- `ipAddress`: 사용자 IP 주소
- `clickedAt`: 클릭 시간
