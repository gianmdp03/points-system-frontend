import { Component } from '@angular/core';
import { Hero } from '../../components/hero/hero';
import { CarouselComponent } from '../../components/carousel/carousel';
import { UserInfo } from '../../components/user-info/user-info';
import { CompanyInfo } from '../../components/company-info/company-info';
import { CompanyPricing } from '../../components/company-pricing/company-pricing';
import { Faq } from '../../components/faq/faq';
import { CompanyQuickActionsComponent } from '../../components/company-quick-actions/company-quick-actions';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CompanyQuickActionsComponent,
    Hero,
    CarouselComponent,
    UserInfo,
    CompanyInfo,
    CompanyPricing,
    Faq
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}
