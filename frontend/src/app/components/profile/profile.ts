import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { ImageUpload } from '../image-upload/image-upload';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageUpload],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  profileForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  currentUser: any = null;

  availableSlots = [
    'バジリスク絆2',
    'ゴッドイーター ジ・アニメーション',
    '新鬼武者2',
    'アイムジャグラーEX',
    'マイジャグラーV',
    '沖ドキ!GOLD',
    'ハナハナホウオウ',
    '押忍!番長ZERO',
    'ディスクアップ2',
    'リング 終焉ノ刻',
    'スマスロ北斗の拳',
    '炎炎ノ消防隊',
    'ヴァルヴレイヴ',
    'モンハン月下雷鳴',
    'ゲゲゲの鬼太郎',
    'キン肉マン マッスルショット',
    '戦国乙女4'
  ];

  availableTimeSlots = [
    '朝（9:00-12:00）',
    '昼（12:00-15:00）',
    '夕方（15:00-18:00）',
    '夜（18:00-21:00）',
    '深夜（21:00-24:00）'
  ];

  selectedSlots: string[] = [];
  selectedTimeSlots: string[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      gender: ['', Validators.required],
      prefecture: ['', Validators.required],
      city: ['', Validators.required],
      bio: ['', [Validators.maxLength(500)]],
      budget: ['', Validators.required],
      frequency: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (user) => {
        console.log('Loaded user profile:', user);
        console.log('Profile image URL:', user.profileImage);
        this.currentUser = user;
        this.profileForm.patchValue({
          name: user.name,
          age: user.age,
          gender: user.gender,
          prefecture: user.prefecture,
          city: user.city,
          bio: user.bio,
          budget: user.budget,
          frequency: user.frequency
        });
        this.selectedSlots = user.favoriteSlots || [];
        this.selectedTimeSlots = user.timeSlots || [];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'プロフィールの読み込みに失敗しました';
        this.loading = false;
      }
    });
  }

  onImageUploaded(imageUrl: string) {
    this.successMessage = 'プロフィール画像が更新されました';
    if (this.currentUser) {
      this.currentUser.profileImage = imageUrl;
    }
    // 3秒後にメッセージを消去
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  onImageUploadError(error: string) {
    this.errorMessage = error;
    // 5秒後にエラーメッセージを消去
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000);
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const profileData = {
        ...this.profileForm.value,
        favoriteSlots: this.selectedSlots,
        timeSlots: this.selectedTimeSlots
      };

      this.userService.updateProfile(profileData).subscribe({
        next: (response) => {
          this.successMessage = 'プロフィールが正常に更新されました';
          this.loading = false;
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = 'プロフィールの更新に失敗しました';
          this.loading = false;
        }
      });
    }
  }

  onSlotChange(event: any) {
    const slot = event.target.value;
    if (event.target.checked) {
      if (!this.selectedSlots.includes(slot)) {
        this.selectedSlots.push(slot);
      }
    } else {
      this.selectedSlots = this.selectedSlots.filter(s => s !== slot);
    }
  }

  onTimeSlotChange(event: any) {
    const timeSlot = event.target.value;
    if (event.target.checked) {
      if (!this.selectedTimeSlots.includes(timeSlot)) {
        this.selectedTimeSlots.push(timeSlot);
      }
    } else {
      this.selectedTimeSlots = this.selectedTimeSlots.filter(t => t !== timeSlot);
    }
  }

  isSlotSelected(slot: string): boolean {
    return this.selectedSlots.includes(slot);
  }

  isTimeSlotSelected(timeSlot: string): boolean {
    return this.selectedTimeSlots.includes(timeSlot);
  }

  trackBySlot(index: number, slot: string): string {
    return slot;
  }
}
