export interface IIndexResponse<T> {
  data: T[];
  count: number;
}

export type Pagination = {
  page: number;
  perPage: number;
  startIndex?: number;
  endIndex?: number;
  skip?: number;
};

export interface IPaginationHeader {
  'x-page': number;
  'x-total-count': number;
  'x-pages-count': number;
  'x-per-page': number;
  'x-next-page': number;
}
