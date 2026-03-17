import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DataSchema, SchemaField, SchemaRelation } from '../models';

interface SchemaState {
  readonly schemas: readonly DataSchema[];
}

interface SchemaActions {
  addSchema: (schema: DataSchema) => void;
  updateSchema: (
    id: string,
    updates: Partial<Pick<DataSchema, 'tableName' | 'description' | 'fields' | 'relations'>>,
  ) => void;
  deleteSchema: (id: string) => void;
  addField: (schemaId: string, field: SchemaField) => void;
  updateField: (schemaId: string, fieldName: string, updates: Partial<SchemaField>) => void;
  removeField: (schemaId: string, fieldName: string) => void;
  updateTableName: (schemaId: string, newName: string) => void;
  addRelation: (schemaId: string, relation: SchemaRelation) => void;
  removeRelation: (
    schemaId: string,
    fromField: string,
    toTable: string,
  ) => void;
  setSchemas: (schemas: readonly DataSchema[]) => void;
}

type SchemaStore = SchemaState & SchemaActions;

const initialState: SchemaState = {
  schemas: [],
};

export const useSchemaStore = create<SchemaStore>()(
  persist(
    (set) => ({
      ...initialState,

      addSchema: (schema: DataSchema) =>
        set((state) => ({
          ...state,
          schemas: [...state.schemas, schema],
        })),

      updateSchema: (
        id: string,
        updates: Partial<Pick<DataSchema, 'tableName' | 'description' | 'fields' | 'relations'>>,
      ) =>
        set((state) => ({
          ...state,
          schemas: state.schemas.map((schema) =>
            schema.id === id
              ? { ...schema, ...updates, updatedAt: new Date().toISOString() }
              : schema,
          ),
        })),

      deleteSchema: (id: string) =>
        set((state) => ({
          ...state,
          schemas: state.schemas.filter((s) => s.id !== id),
        })),

      addField: (schemaId: string, field: SchemaField) =>
        set((state) => ({
          ...state,
          schemas: state.schemas.map((schema) =>
            schema.id === schemaId
              ? {
                  ...schema,
                  fields: [...schema.fields, field],
                  updatedAt: new Date().toISOString(),
                }
              : schema,
          ),
        })),

      updateField: (schemaId: string, fieldName: string, updates: Partial<SchemaField>) =>
        set((state) => ({
          ...state,
          schemas: state.schemas.map((schema) =>
            schema.id === schemaId
              ? {
                  ...schema,
                  fields: schema.fields.map((field) =>
                    field.name === fieldName ? { ...field, ...updates } : field,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : schema,
          ),
        })),

      removeField: (schemaId: string, fieldName: string) =>
        set((state) => ({
          ...state,
          schemas: state.schemas.map((schema) =>
            schema.id === schemaId
              ? {
                  ...schema,
                  fields: schema.fields.filter((f) => f.name !== fieldName),
                  updatedAt: new Date().toISOString(),
                }
              : schema,
          ),
        })),

      updateTableName: (schemaId: string, newName: string) =>
        set((state) => ({
          ...state,
          schemas: state.schemas.map((schema) =>
            schema.id === schemaId
              ? {
                  ...schema,
                  tableName: newName,
                  updatedAt: new Date().toISOString(),
                }
              : schema,
          ),
        })),

      addRelation: (schemaId: string, relation: SchemaRelation) =>
        set((state) => ({
          ...state,
          schemas: state.schemas.map((schema) =>
            schema.id === schemaId
              ? {
                  ...schema,
                  relations: [...schema.relations, relation],
                  updatedAt: new Date().toISOString(),
                }
              : schema,
          ),
        })),

      removeRelation: (
        schemaId: string,
        fromField: string,
        toTable: string,
      ) =>
        set((state) => ({
          ...state,
          schemas: state.schemas.map((schema) =>
            schema.id === schemaId
              ? {
                  ...schema,
                  relations: schema.relations.filter(
                    (r) =>
                      !(r.fromField === fromField && r.toTable === toTable),
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : schema,
          ),
        })),

      setSchemas: (schemas: readonly DataSchema[]) =>
        set(() => ({
          schemas,
        })),
    }),
    {
      name: 'paying-tool-schemas',
      partialize: (state) => ({
        schemas: state.schemas,
      }),
    },
  ),
);
