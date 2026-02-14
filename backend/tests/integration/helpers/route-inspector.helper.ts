type RouterLayer = {
  route?: {
    path?: string;
    methods?: Record<string, boolean>;
    stack?: Array<{ handle: unknown }>;
  };
};

const findRouteLayer = (router: { stack?: RouterLayer[] }, method: string, path: string) => {
  const normalizedMethod = method.toLowerCase();

  const layer = router.stack?.find(
    (item) =>
      item.route &&
      item.route.path === path &&
      Boolean(item.route.methods?.[normalizedMethod])
  );

  if (!layer || !layer.route) {
    throw new Error(`Route not found: ${method.toUpperCase()} ${path}`);
  }

  return layer.route;
};

export { findRouteLayer };
