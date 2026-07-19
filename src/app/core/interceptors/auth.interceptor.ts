import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isApiRequest = request.url.startsWith('http://localhost:3000');

  if (!token || !isApiRequest) {
    return next(request);
  }

  const authenticatedRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest);
};
