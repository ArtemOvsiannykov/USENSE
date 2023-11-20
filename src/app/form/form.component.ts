import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit {
  isSufficientLength: boolean = false;
  passwordForm!: FormGroup;

  private isEasy: boolean = false;
  private isMedium: boolean = false;
  private isStrong: boolean = false;
  private password: string = '';
  private destroyed$: Subject<boolean> = new Subject();

  get isPasswordEasy(): boolean {
    return this.isEasy;
  }

  get isPasswordMedium(): boolean {
    return this.isMedium;
  }

  get isPasswordStrong(): boolean {
    return this.isStrong;
  }

  get isFieldEmpty(): boolean {
    return !this.password.length;
  }

  get isFieldRed(): boolean | undefined {
    return (
      this.passwordForm.get('password')?.touched || this.password?.length !== 0
    );
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.initSubscription();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private initForm(): void {
    this.passwordForm = this.fb.group({
      password: ['', Validators.required],
    });
  }

  private initSubscription(): void {
    this.passwordForm.valueChanges
      .pipe(
        takeUntil(this.destroyed$),
        tap((value) => {
          this.password = value.password.replace(/\s/g, '');
          this.resetValues();
          this.checkPasswordStrength(this.password);
        })
      )
      .subscribe();
  }

  private checkPasswordStrength(password: any): void {
    if (this.checkPasswordLength(password)) {
      this.isEasy = this.isPasswordEasyOrNot(password);

      if (!this.isEasy) {
        this.isStrong = this.isContainsLettersNumbersAndSymbols(password);
        this.isMedium = !this.isStrong;
      }
    }
  }

  private isContainsOnlyLetters(password: string): boolean {
    return /^[a-zA-Z]+$/.test(password);
  }
  private isContainsOnlyNumbers(password: string): boolean {
    return /^\d+$/.test(password);
  }

  private isContainsOnlySymbols(password: string): boolean {
    return /^[^\w\s]+$/.test(password);
  }

  private isContainsLettersNumbersAndSymbols(password: string): boolean {
    return (
      /[a-zA-Z]/.test(password) &&
      /\d/.test(password) &&
      /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)
    );
  }

  private checkPasswordLength(password: string): boolean {
    return (this.isSufficientLength = password.length >= 8);
  }
  private isPasswordEasyOrNot(password: string): boolean {
    return (
      this.isContainsOnlyNumbers(password) ||
      this.isContainsOnlyLetters(password) ||
      this.isContainsOnlySymbols(password)
    );
  }

  private resetValues(): void {
    this.isEasy = false;
    this.isMedium = false;
    this.isStrong = false;
  }
}
