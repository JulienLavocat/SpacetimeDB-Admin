import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { AppBarComponent } from '../app-bar/app-bar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [MatSidenavModule, MatListModule, RouterModule, AppBarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {}
