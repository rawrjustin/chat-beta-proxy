export class HardCurrencyProductView {
  rowId: number;
  productSku: string;
  amount: number;
  isActive: boolean;
  appleProductId: string;
  googleProductId: string;
  title: string;
  description: string;
  // iconUrl is stored as an s3 path like "currency/store_icons/hc_small"
  // we save the s3iconUrl to the database
  iconUrl: string;
  iconFile: File;

  constructor(row: number) {
    this.rowId = row;
  }
}
