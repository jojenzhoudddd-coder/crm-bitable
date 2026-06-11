/** 产品 */
export interface Product {
  id: string; // record_id
  name: string;
  code: string;
  category: string;
  subCategory: string;
  description: string;
  imageUrl: string;
  unit: string;
  price: number;
  minDiscount: number;
  status: string;
}

/** 套餐 */
export interface Package {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  status: string;
  items: PackageItem[];
}

/** 套餐明细 */
export interface PackageItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  discount: number;
}

/** 常用组合 */
export interface Favorite {
  id: string;
  name: string;
  items: FavoriteItem[];
  useCount: number;
}

/** 常用组合项 */
export interface FavoriteItem {
  productId: string;
  productName?: string;
  quantity: number;
  discount: number;
}
