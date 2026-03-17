import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, UserSegment, RetentionStage } from '../models';

interface ProductState {
  readonly products: readonly Product[];
  readonly selectedSegment: UserSegment;
}

interface ProductActions {
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setSelectedSegment: (segment: UserSegment) => void;
  getProductsBySegment: (segment: UserSegment) => readonly Product[];
  getProductsByRetentionStage: (stage: RetentionStage) => readonly Product[];
}

type ProductStore = ProductState & ProductActions;

const initialState: ProductState = {
  products: [],
  selectedSegment: 'minnow',
};

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addProduct: (product: Product) =>
        set((state) => ({
          ...state,
          products: [...state.products, product],
        })),

      updateProduct: (id: string, updates: Partial<Product>) =>
        set((state) => ({
          ...state,
          products: state.products.map((product) =>
            product.id === id
              ? { ...product, ...updates, updatedAt: new Date().toISOString() }
              : product,
          ),
        })),

      deleteProduct: (id: string) =>
        set((state) => ({
          ...state,
          products: state.products.filter((p) => p.id !== id),
        })),

      setSelectedSegment: (segment: UserSegment) =>
        set((state) => ({
          ...state,
          selectedSegment: segment,
        })),

      getProductsBySegment: (segment: UserSegment): readonly Product[] => {
        const { products } = get();
        return products.filter((p) =>
          p.targetSegments.includes(segment),
        );
      },

      getProductsByRetentionStage: (
        stage: RetentionStage,
      ): readonly Product[] => {
        const { products } = get();
        return products.filter((p) => p.targetRetentionStage === stage);
      },
    }),
    {
      name: 'paying-tool-products',
      partialize: (state) => ({
        products: state.products,
        selectedSegment: state.selectedSegment,
      }),
    },
  ),
);
