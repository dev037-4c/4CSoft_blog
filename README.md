# Blog 디렉토리 배포 및 Apache 설정 가이드

이 문서는 `/data/lx2/blog` 경로에 Blog 정적 페이지를 배포하고  
Apache Rewrite 설정을 적용하는 전체 작업 절차를 정리한 README입니다.

---

## 1. 기존 Blog 디렉토리 삭제

서버에 남아 있는 이전 Blog 파일을 모두 삭제합니다.

sudo rm -rf /data/lx2/blog

---

## 2. 로컬 → 서버 파일 업로드 (SCP)

### 서버 1 — 180.210.83.154

scp -i ~/Downloads/4csoft.pem -r /Volumes/4csoft/git/work/blog/*
lx2-manual@180.210.83.154:/data/lx2/blog/

### 서버 2 — 180.210.82.190

scp -i ~/Downloads/4csoft.pem -r /Volumes/4csoft/git/work/blog/*
lx2-manual@180.210.82.190:/data/lx2/blog/

---

## 3. 서버 접속 후 디렉토리 생성 및 권한 설정

### 서버 접속

ssh -i ~/Downloads/4csoft.pem ubuntu@[서버IP]

### 디렉토리 생성

sudo mkdir -p /data/lx2/blog

### 디렉토리 권한 변경

sudo chown -R lx2-manual:lx2-manual /data/lx2/blog

### SSH 종료

exit

---

## 4. Apache Rewrite 설정 (.htaccess)

Blog 경로 아래 SPA(단일 페이지 애플리케이션) 라우팅을 위한  
`.htaccess` 파일 설정은 다음과 같습니다.

RewriteEngine On
RewriteBase /blog/

RewriteRule ^index.html$ - [L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /blog/index.html [L]

---

## 5. Apache 재시작 (CentOS / Ubuntu 환경에 따라 선택)

### CentOS (service 명령)

sudo service httpd restart


### Ubuntu (systemctl 명령)

sudo systemctl restart apache2

---

## 완료  
위 절차를 수행하면 `/blog` 정적 파일 배포 및 Apache SPA 라우팅 설정이 정상 적용됩니다.
