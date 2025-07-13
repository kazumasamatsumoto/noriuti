# Pachi Friend - パチスロ友達探しアプリ

## プロジェクト構成

```
noriuti/
├── frontend/          # Angular フロントエンド
├── backend/           # Nest.js バックエンド
├── docker-compose.yml # Docker設定
├── idea.md           # アプリアイデア詳細
├── task.md           # 検討事項・タスク
└── README.md         # このファイル
```

## 技術スタック

- **フロントエンド**: Angular + TypeScript + Angular Material
- **バックエンド**: Nest.js + TypeScript + PostgreSQL + Redis
- **インフラ**: Docker + Azure (本番環境)

## 開発環境セットアップ

```bash
# Docker環境起動
docker-compose up -d

# フロントエンド開発サーバー起動
cd frontend
npm start

# バックエンド開発サーバー起動
cd backend
npm run start:dev
```

## 開発フェーズ

### Phase 1: MVP
- [x] 環境構築
- [ ] ユーザー登録・ログイン
- [ ] プロフィール作成
- [ ] マッチング機能
- [ ] チャット機能

### Phase 2: 拡張機能
- [ ] グループ機能
- [ ] イベント機能
- [ ] 高度な検索・フィルタ

### Phase 3: 高度な機能
- [ ] PWA対応
- [ ] AI推薦機能
- [ ] 通知機能