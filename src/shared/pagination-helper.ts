import { IPaginationHeader, Pagination } from './types';

export const getPaginationHeaders = (
  pagination: Pagination | null,
  totalCount: number,
): IPaginationHeader | null => {
  if (!pagination) {
    return null;
  }

  const page = +pagination.page;
  const perPage = +pagination.perPage;
  const pagesCount = Math.ceil(totalCount / perPage);
  return {
    'x-page': page,
    'x-total-count': totalCount,
    'x-pages-count': pagesCount,
    'x-per-page': perPage,
    'x-next-page': page === pagesCount ? page : page + 1,
  };
};
