import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-image-upload',
  imports: [CommonModule],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.scss'
})
export class ImageUpload {
  @Input() currentImageUrl: string | null = null;
  @Input() uploadText: string = '画像をアップロード';
  @Input() maxSizeMB: number = 5;
  @Output() imageUploaded = new EventEmitter<string>();
  @Output() uploadError = new EventEmitter<string>();

  private readonly API_URL = 'http://localhost:3000';
  
  uploading = false;
  previewUrl: string | null = null;
  dragOver = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.previewUrl = this.currentImageUrl;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.uploadError.emit('サポートされていないファイル形式です（JPEG, PNG, GIF, WebPのみ）');
      return;
    }

    // ファイルサイズチェック
    const maxSizeBytes = this.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.uploadError.emit(`ファイルサイズが大きすぎます（最大${this.maxSizeMB}MB）`);
      return;
    }

    // プレビュー表示
    this.generatePreview(file);

    // アップロード実行
    this.uploadFile(file);
  }

  private generatePreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  private uploadFile(file: File): void {
    if (!this.authService.isAuthenticated()) {
      this.uploadError.emit('ログインが必要です');
      return;
    }

    this.uploading = true;

    const formData = new FormData();
    formData.append('image', file);

    this.http.post<{imageUrl: string, message: string}>(`${this.API_URL}/upload/profile-image`, formData)
      .subscribe({
        next: (response) => {
          this.uploading = false;
          this.imageUploaded.emit(response.imageUrl);
        },
        error: (error) => {
          this.uploading = false;
          this.previewUrl = this.currentImageUrl; // プレビューを元に戻す
          const errorMessage = error.error?.message || 'アップロードに失敗しました';
          this.uploadError.emit(errorMessage);
        }
      });
  }

  removeImage(): void {
    this.previewUrl = null;
    this.currentImageUrl = null;
    // TODO: バックエンドの画像削除API実装後に削除リクエストを送信
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('imageFileInput') as HTMLInputElement;
    fileInput?.click();
  }
}