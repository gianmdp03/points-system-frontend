import { Component } from '@angular/core';
import { Hero } from '../../components/hero/hero';
import { CarouselComponent } from '../../components/carousel/carousel';
import { UserInfo } from '../../components/user-info/user-info';
import { CompanyInfo } from '../../components/company-info/company-info';
import { CompanyPricing } from '../../components/company-pricing/company-pricing';
import { Faq } from '../../components/faq/faq';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
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


