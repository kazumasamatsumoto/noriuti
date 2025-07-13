import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ];

  budgetOptions = [
    '5,000円以下', '5,000-10,000円', '10,000-20,000円', 
    '20,000-30,000円', '30,000円以上'
  ];

  frequencyOptions = [
    '週1回', '週2-3回', '週4-5回', '毎日', '月数回'
  ];

  timeSlotOptions = [
    '平日昼間', '平日夜', '土日祝昼間', '土日祝夜', '深夜'
  ];

  popularSlots = [
    'パチスロ北斗の拳', 'パチスロ戦国乙女', 'パチスロ沖ドキ!',
    'パチスロバジリスク絆', 'パチスロゴッドイーター', 'パチスロ押忍!番長',
    'パチスロ魔法少女まどか☆マギカ', 'パチスロエウレカセブン',
    'パチスロ政宗', 'パチスロハナハナ'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      gender: ['', [Validators.required]],
      prefecture: ['', [Validators.required]],
      city: ['', [Validators.required]],
      bio: [''],
      favoriteSlots: [[]],
      budget: [''],
      frequency: [''],
      timeSlots: [[]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSlotToggle(slot: string) {
    const currentSlots = this.registerForm.get('favoriteSlots')?.value || [];
    const index = currentSlots.indexOf(slot);
    
    if (index > -1) {
      currentSlots.splice(index, 1);
    } else {
      currentSlots.push(slot);
    }
    
    this.registerForm.patchValue({ favoriteSlots: currentSlots });
  }

  onTimeSlotToggle(timeSlot: string) {
    const currentTimeSlots = this.registerForm.get('timeSlots')?.value || [];
    const index = currentTimeSlots.indexOf(timeSlot);
    
    if (index > -1) {
      currentTimeSlots.splice(index, 1);
    } else {
      currentTimeSlots.push(timeSlot);
    }
    
    this.registerForm.patchValue({ timeSlots: currentTimeSlots });
  }

  isSlotSelected(slot: string): boolean {
    const selectedSlots = this.registerForm.get('favoriteSlots')?.value || [];
    return selectedSlots.includes(slot);
  }

  isTimeSlotSelected(timeSlot: string): boolean {
    const selectedTimeSlots = this.registerForm.get('timeSlots')?.value || [];
    return selectedTimeSlots.includes(timeSlot);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const formValue = this.registerForm.value;
      const registerData = {
        email: formValue.email,
        password: formValue.password,
        name: formValue.name,
        age: parseInt(formValue.age),
        gender: formValue.gender,
        prefecture: formValue.prefecture,
        city: formValue.city,
        bio: formValue.bio,
        favoriteSlots: formValue.favoriteSlots,
        playStyle: {
          budget: formValue.budget,
          frequency: formValue.frequency,
          timeSlot: formValue.timeSlots
        }
      };

      this.authService.register(registerData).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || '登録に失敗しました';
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName}は必須です`;
      if (field.errors['email']) return '有効なメールアドレスを入力してください';
      if (field.errors['minlength']) return `${fieldName}は${field.errors['minlength'].requiredLength}文字以上で入力してください`;
      if (field.errors['min']) return `${fieldName}は${field.errors['min'].min}以上で入力してください`;
      if (field.errors['max']) return `${fieldName}は${field.errors['max'].max}以下で入力してください`;
    }
    
    if (this.registerForm.errors?.['passwordMismatch'] && fieldName === 'confirmPassword' && field?.touched) {
      return 'パスワードが一致しません';
    }
    
    return '';
  }
}
