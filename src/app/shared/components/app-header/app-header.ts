import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-header.html',
  styleUrl: './app-header.css',
})
export class AppHeader {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = this.authService.getCurrentUser();

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
