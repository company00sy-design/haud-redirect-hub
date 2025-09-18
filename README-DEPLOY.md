# 🚀 클라우드 배포 가이드

## Railway 배포 (추천)

### 1. GitHub 저장소 생성
1. GitHub에서 새 저장소 생성
2. 로컬 프로젝트를 GitHub에 푸시:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/haud-redirect-hub.git
git push -u origin main
```

### 2. Railway 배포
1. https://railway.app 접속
2. GitHub 계정으로 로그인
3. "New Project" → "Deploy from GitHub repo" 선택
4. `haud-redirect-hub` 저장소 선택
5. 자동으로 배포 시작

### 3. 환경변수 설정
Railway 대시보드에서:
- `NODE_ENV`: `production`
- `PORT`: `3001`
- `DATABASE_URL`: `file:./prod.db`

### 4. 도메인 확인
- Railway에서 자동 생성된 도메인 확인
- 예: `https://haud-redirect-hub-production.up.railway.app`

## Render 배포 (대안)

### 1. Render 계정 생성
1. https://render.com 접속
2. GitHub 계정으로 로그인

### 2. 새 웹 서비스 생성
1. "New" → "Web Service" 선택
2. GitHub 저장소 연결
3. 설정:
   - **Build Command**: `npm install && npm run deploy`
   - **Start Command**: `npm start`
   - **Node Version**: `18`

### 3. 환경변수 설정
- `NODE_ENV`: `production`
- `PORT`: `3001`
- `DATABASE_URL`: `file:./prod.db`

## 배포 후 확인사항

### 1. 서비스 상태 확인
- 배포된 URL 접속: `https://your-domain.com/admin`
- 헬스체크: `https://your-domain.com/health`

### 2. 링크 업데이트
배포 완료 후 모든 블로그 링크를 새 도메인으로 변경:
- `https://your-domain.com/go/kakao?source=HAUD`
- `https://your-domain.com/go/call?source=HAUD`

### 3. 각 블로그별 링크 배포
**HAUD**: https://blog.naver.com/haudsystem
- 카카오톡: `https://your-domain.com/go/kakao?source=HAUD`
- 전화: `https://your-domain.com/go/call?source=HAUD`

**HanPro**: https://blog.naver.com/gaguyong
- 카카오톡: `https://your-domain.com/go/kakao?source=HanPro`
- 전화: `https://your-domain.com/go/call?source=HanPro`

**Baek**: https://blog.naver.com/ds5izi2
- 카카오톡: `https://your-domain.com/go/kakao?source=Baek`
- 전화: `https://your-domain.com/go/call?source=Baek`

**Kang**: https://blog.naver.com/mance0712
- 카카오톡: `https://your-domain.com/go/kakao?source=Kang`
- 전화: `https://your-domain.com/go/call?source=Kang`

**DanPro**: https://blog.naver.com/gagumaster86
- 카카오톡: `https://your-domain.com/go/kakao?source=DanPro`
- 전화: `https://your-domain.com/go/call?source=DanPro`

**LaHom**: https://blog.naver.com/lahom_official
- 카카오톡: `https://your-domain.com/go/kakao?source=LaHom`
- 전화: `https://your-domain.com/go/call?source=LaHom`

## 24시간 운영 보장

### ✅ Railway 장점
- 24시간 자동 운영
- 자동 재시작
- 무료 크레딧 제공
- SSL 인증서 자동
- 도메인 자동 생성

### ✅ 데이터 보존
- SQLite 파일이 서버에 저장
- 재배포 시에도 데이터 유지
- 자동 백업 (Pro 플랜)

### 📊 모니터링
- Railway/Render 대시보드에서 서버 상태 확인
- 로그 실시간 모니터링
- 에러 알림 설정 가능

이제 컴퓨터를 끄더라도 24시간 자동으로 링크 추적이 가능합니다!
