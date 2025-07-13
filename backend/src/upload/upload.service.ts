import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir = 'uploads';

  constructor() {
    // アップロードディレクトリを作成
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists() {
    const uploadPath = path.join(process.cwd(), this.uploadDir);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // プロフィール画像用のサブディレクトリ
    const profileDir = path.join(uploadPath, 'profiles');
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }
  }

  // ファイル名を生成
  generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const ext = extname(originalName);
    const baseName = path.basename(originalName, ext);
    return `${timestamp}-${baseName.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
  }

  // ファイルの検証
  validateImageFile(file: Express.Multer.File): { isValid: boolean; error?: string } {
    // ファイルサイズチェック (5MB制限)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'ファイルサイズが大きすぎます（最大5MB）' };
    }

    // ファイル形式チェック
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return { isValid: false, error: 'サポートされていないファイル形式です（JPEG, PNG, GIF, WebPのみ）' };
    }

    return { isValid: true };
  }

  // プロフィール画像のURLを生成
  getProfileImageUrl(filename: string): string {
    return `/uploads/profiles/${filename}`;
  }

  // ファイルを削除
  deleteFile(filename: string): boolean {
    try {
      const filePath = path.join(process.cwd(), this.uploadDir, 'profiles', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  // 古いプロフィール画像を削除
  deleteOldProfileImage(oldImageUrl: string): void {
    if (oldImageUrl && oldImageUrl.includes('/uploads/profiles/')) {
      const filename = path.basename(oldImageUrl);
      this.deleteFile(filename);
    }
  }
}