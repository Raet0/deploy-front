import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener el usuario del localStorage
  const authUserJson = localStorage.getItem('auth_user');
  const token = authUserJson ? JSON.parse(authUserJson).token : null;

  if (token) {
    // Clonamos la petición y le añadimos el encabezado Authorization
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};