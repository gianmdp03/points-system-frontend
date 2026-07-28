import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CompanyInfo } from "./components/company-info/company-info";
import { CompanyPricing } from './components/company-pricing/company-pricing';
import { Hero } from './components/hero/hero';
import { UserInfo } from './components/user-info/user-info';
import { CtaBanner } from './components/cta-banner/cta-banner';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CompanyInfo, CompanyPricing, Hero, Header, UserInfo, CtaBanner, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('points-system-frontend');
}
