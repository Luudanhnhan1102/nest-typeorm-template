import { ExecutionContext, applyDecorators, createParamDecorator } from '@nestjs/common';
import { Pagination } from '../shared';
import { ApiQuery } from '@nestjs/swagger';
import { PaginationMetadataStyle } from 'src/interceptors/pagination.interceptor';

const createPagination = (page: number, perPage: number): Pagination => {
  page = +page || 1;
  perPage = +perPage || 20;

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const skip = (page - 1) * perPage;

  return {
    page,
    perPage,
    startIndex,
    endIndex,
    skip,
  };
};

export const PaginationDecorator = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return createPagination(request.query.page, request.query.perPage);
});

export const PaginationQuery = () => {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number',
      type: Number,
    }),
    ApiQuery({
      name: 'perPage',
      required: false,
      description: 'Items per page',
      type: Number,
    }),
    ApiQuery({
      name: 'paginationMetadataStyle',
      required: false,
      description: 'Items per page',
      type: String,
      enum: PaginationMetadataStyle,
    }),
  );
};
