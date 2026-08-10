import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductListDTO, Role } from '../../../../core/models';

@Component({
  selector: 'app-tab-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tab-products.html'
})
export class TabProductsComponent {
  @Input() products: ProductListDTO[] = [];
  @Input({ required: true }) currentRole!: Role | null;

  @Output() addProduct = new EventEmitter<void>();
  @Output() editProduct = new EventEmitter<ProductListDTO>();
  @Output() deleteProduct = new EventEmitter<number>();

  readonly RoleEnum = Role;
}
