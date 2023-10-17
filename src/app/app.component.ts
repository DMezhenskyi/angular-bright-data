import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { map, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface AmazonDeal {
  title: string;
  link: string;
  img: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressBarModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  #http = inject(HttpClient);
  items$ = this.#http.get<{ products: AmazonDeal[] }>(`http://localhost:3000/scrapeDeals`).pipe(
    map(data => data.products)
  );
}
