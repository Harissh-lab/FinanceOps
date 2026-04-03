export function getPagination(page = 1, limit = 10): { skip: number; take: number; page: number; limit: number } {
  const safePage = Number.isNaN(page) || page < 1 ? 1 : page;
  const safeLimit = Number.isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100);

  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
    page: safePage,
    limit: safeLimit,
  };
}
