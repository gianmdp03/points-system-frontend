import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyInfo {}
