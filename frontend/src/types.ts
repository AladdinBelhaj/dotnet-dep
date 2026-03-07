export interface User {
    id: number;
    username: string;
    role: 'Admin' | 'Comptable' | string;
    token?: string;
}

export interface Supplier {
    id: number;
    name: string;
    contactInfo: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    name: string;
    reference: string;
    quantity: number;
    price: number;
    minStock: number;
    categoryId: number;
    category?: Category;
    supplierId: number;
    supplier?: Supplier;
}

export interface StockMovement {
    id: number;
    productId: number;
    product?: Product;
    quantity: number;
    type: 'Entry' | 'Exit';
    movementDate: string;
    userId: number;
    user?: User;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
