import { HttpInterceptorFn } from '@angular/common/http';

function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let modifiedReq = req.clone({
    withCredentials: true,
  });

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
      modifiedReq = modifiedReq.clone({
        headers: modifiedReq.headers.set('X-XSRF-TOKEN', xsrfToken),
      });
    }
  }

  return next(modifiedReq);
};
