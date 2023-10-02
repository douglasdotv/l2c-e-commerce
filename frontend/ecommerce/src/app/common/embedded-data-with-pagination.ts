import { EmbeddedData } from './embedded-data';

export interface EmbeddedDataWithPagination<T> extends EmbeddedData<T> {
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}
