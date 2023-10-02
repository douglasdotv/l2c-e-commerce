export interface EmbeddedData<T> {
  _embedded: {
    [key: string]: T[];
  };
}
