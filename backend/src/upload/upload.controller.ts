import { 
  Controller, 
  Post, 
  UseInterceptors, 
  UploadedFile, 
  UseGuards,
  BadRequestException,
  Request
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from './upload.service';
import { UsersService } from '../users/users.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private uploadService: UploadService,
    private usersService: UsersService,
  ) {}

  @Post('profile-image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename: (req, file, callback) => {
          const uploadService = new UploadService();
          const filename = uploadService.generateFileName(file.originalname);
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        const uploadService = new UploadService();
        const validation = uploadService.validateImageFile(file);
        if (validation.isValid) {
          callback(null, true);
        } else {
          callback(new BadRequestException(validation.error), false);
        }
      },
    }),
  )
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('ファイルが選択されていません');
    }

    try {
      const userId = req.user.userId;
      
      // 現在のユーザー情報を取得して古い画像を削除
      const currentUser = await this.usersService.findById(userId);
      if (currentUser?.profileImage) {
        this.uploadService.deleteOldProfileImage(currentUser.profileImage);
      }

      // 新しい画像URLを生成
      const imageUrl = this.uploadService.getProfileImageUrl(file.filename);
      
      // ユーザーのプロフィール画像を更新
      await this.usersService.updateProfileImage(userId, imageUrl);

      return {
        message: 'プロフィール画像がアップロードされました',
        imageUrl,
        filename: file.filename,
      };
    } catch (error) {
      // エラーが発生した場合、アップロードされたファイルを削除
      this.uploadService.deleteFile(file.filename);
      throw new BadRequestException('プロフィール画像の更新に失敗しました');
    }
  }
}