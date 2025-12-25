export type PaginationQuery = {
  page?: string | string[] | number;
  per_page?: string | string[] | number;
};

export type PaginationParams = {
  page: number;
  perPage: number;
  skip: number;
  take: number;
};

export type PaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
};

function toNumber(value: string | string[] | number | undefined) {
  if (Array.isArray(value)) {
    if (value.length === 0) return undefined;
    return toNumber(value[0]);
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const n = parseInt(value, 10);
    if (!Number.isNaN(n)) {
      return n;
    }
  }
  return undefined;
}

export function getPagination(query: PaginationQuery): PaginationParams {
  const pageRaw = toNumber(query.page);
  const perPageRaw = toNumber(query.per_page);
  const page = pageRaw && pageRaw > 0 ? pageRaw : 1;
  const perPage =
    perPageRaw && perPageRaw > 0 && perPageRaw <= 100 ? perPageRaw : 10;
  const skip = (page - 1) * perPage;
  const take = perPage;
  return { page, perPage, skip, take };
}

export function buildPaginationMeta(
  page: number,
  perPage: number,
  total: number
): PaginationMeta {
  const lastPage = total === 0 ? 1 : Math.ceil(total / perPage);
  return { page, perPage, total, lastPage };
}

