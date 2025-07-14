# 残りタスク一覧

## 🔴 高優先度タスク

### 1. セキュリティ強化
- **JWT秘密鍵の環境変数化**
  - `backend/src/app.module.ts:26` - ハードコードされた秘密鍵を環境変数化
  - `backend/src/auth/jwt.strategy.ts:12` - 同上
  - `.env.example`ファイルの作成

- **データベースセキュリティ**
  - 本番用データベースパスワードの設定
  - PostgreSQLの設定強化

- **HTTPSの強制設定**
  - 本番環境でのHTTPS必須化
  - セキュリティヘッダーの追加

### 2. WebSocket実装（未完了機能）
- **リアルタイムチャット機能**
  - `frontend/src/app/services/message.service.ts:98,103` - WebSocket実装
  - リアルタイムメッセージ配信
  - オンラインステータス表示

### 3. エラーハンドリング強化
- **適切なエラー処理の実装**
  - `backend/src/upload/upload.service.ts:68` - ファイル削除エラー処理改善
  - フロントエンドでのエラーメッセージ表示改善

## 🟡 中優先度タスク

### 4. 未実装機能の完成
- **チャット機能の完成**
  - `frontend/src/app/components/chat/chat.ts:247` - 会話削除機能
  - `frontend/src/app/components/chat/chat.ts:253` - プロフィールモーダル機能

- **画像機能の完成**
  - `frontend/src/app/components/image-upload/image-upload.ts:135` - 画像削除API実装
  - バックエンドでの画像削除エンドポイント作成

### 5. コード品質改善
- **デバッグコードの削除**
  - `backend/src/users/users.service.ts:55` - console.log削除
  - `frontend/src/app/components/profile/profile.ts:79-80` - console.log削除
  - `frontend/src/app/components/image-upload/image-upload.ts:31,38,114` - console.log削除

- **TypeScript警告の修正**
  - `frontend/src/app/components/chat/chat.html:38,107` - 不要なオプショナルチェーン修正

### 6. テストカバレッジ向上
- **サービス層のテスト追加**
  - AuthService, MessageService, MatchService等のユニットテスト
  - 認証・認可のセキュリティテスト

- **コンポーネントテスト追加**
  - Chat, Matching, Profile等の主要コンポーネントテスト
  - E2Eテストの拡充

### 7. パフォーマンス最適化
- **非推奨パッケージの更新**
  - Globパッケージ（v9未満は非推奨）
  - rimrafパッケージ（v4未満は非推奨）
  - inflightモジュール（メモリリーク対策）

- **Bundle sizeの最適化**
  - 現在の500kB警告設定の見直し
  - コード分割の実装

## 🟢 低優先度タスク

### 8. ドキュメント整備
- **API仕様書の作成**
  - Swagger/OpenAPIの導入
  - エンドポイント仕様の文書化

- **デプロイメントガイド**
  - 環境構築手順の詳細化
  - Docker設定の最適化

### 9. 設定最適化
- **開発環境の改善**
  - ESLint設定の見直し（`any`型制限の有効化）
  - TypeScript設定の最適化

- **環境変数管理**
  - `.env.example`ファイルの作成
  - 環境別設定の整理

## 完了済みタスク ✅

- ✅ セッション期間を8時間に延長
- ✅ ページリロード時のログイン状態維持
- ✅ AuthInterceptorの循環依存解決
- ✅ JWTトークンの有効期限チェック機能
- ✅ ユーザー画像アップロード機能
- ✅ 文字エンコーディング問題の修正

## 次のスプリントで取り組むべき項目

1. **第1週**: セキュリティ強化（JWT秘密鍵、HTTPS設定）
2. **第2週**: WebSocket実装（リアルタイムチャット）
3. **第3週**: 未実装機能の完成（会話削除、画像削除API）
4. **第4週**: テストカバレッジ向上とコード品質改善

---

**注意**: セキュリティ関連の修正（特にJWT秘密鍵の環境変数化）は最優先で実施してください。