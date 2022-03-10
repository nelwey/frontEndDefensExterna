export default function log({ next, router }) {
  if (localStorage.getItem('token')) {
    return router.push({ name: 'PanelAdministrativoView' });
  }

  return next();
}