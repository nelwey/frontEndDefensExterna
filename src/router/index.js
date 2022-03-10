import Vue from 'vue'
import VueRouter from 'vue-router'
import IniciarSesionView from '../views/IniciarSesionView.vue'
import PanelAdministrativoView from '../views/PanelAdministrativoView.vue'
import PageNotFoundView from '../views/PageNotFoundView.vue'
import auth from '../middlewares/auth';
import log from '../middlewares/log';

Vue.use(VueRouter)

const routes = [{
    path: '/',
    name: 'IniciarSesionView',
    component: IniciarSesionView,
    meta: {
      middleware: log
    }
  },
  {
    path: '/panel',
    name: 'PanelAdministrativoView',
    component: PanelAdministrativoView,
    meta: {
      middleware: auth
    }
  },
  { path: "*", component: PageNotFoundView }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

// Creates a `nextMiddleware()` function which not only
// runs the default `next()` callback but also triggers
// the subsequent Middleware function.
function nextFactory(context, middleware, index) {
  const subsequentMiddleware = middleware[index];
  // If no subsequent Middleware exists,
  // the default `next()` callback is returned.
  if (!subsequentMiddleware) return context.next;

  return (...parameters) => {
    // Run the default Vue Router `next()` callback first.
    context.next(...parameters);
    // Then run the subsequent Middleware with a new
    // `nextMiddleware()` callback.
    const nextMiddleware = nextFactory(context, middleware, index + 1);
    subsequentMiddleware({
      ...context,
      next: nextMiddleware
    });
  };
}

router.beforeEach((to, from, next) => {
  if (to.meta.middleware) {
    const middleware = Array.isArray(to.meta.middleware) ?
      to.meta.middleware : [to.meta.middleware];

    const context = {
      from,
      next,
      router,
      to,
    };
    const nextMiddleware = nextFactory(context, middleware, 1);

    return middleware[0]({
      ...context,
      next: nextMiddleware
    });
  }

  return next();
});

export default router