import { Component } from '@angular/core';
import { Hero } from '../../components/hero/hero';
import { CompanyInfo } from '../../components/company-info/company-info';
import { CompanyPricing } from '../../components/company-pricing/company-pricing';
import { UserInfo } from '../../components/user-info/user-info';
import { CtaBanner } from '../../components/cta-banner/cta-banner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    Hero,
    CompanyInfo,
    CompanyPricing,
    UserInfo,
    CtaBanner
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}

