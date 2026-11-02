export interface ListCustomersResponse {
  items: {
    id: string;
    name: string;
    document: string;
    email: string;
    phone: string;
  }[];
  page: number;
  pageSize: number;
  total: number;
}
