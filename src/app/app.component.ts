import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet/>',
})
export class AppComponent implements OnInit {
  private api = inject(ApiService);

  ngOnInit(): void {
    this.api.ping().subscribe();
  }
}
