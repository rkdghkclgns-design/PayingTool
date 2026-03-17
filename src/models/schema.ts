export type SchemaFieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'json'
  | 'uuid'
  | 'enum';

export interface SchemaField {
  readonly name: string;
  readonly type: SchemaFieldType;
  readonly nullable: boolean;
  readonly isPrimaryKey: boolean;
  readonly isForeignKey: boolean;
  readonly foreignTable: string | null;
  readonly foreignField: string | null;
  readonly enumValues: readonly string[] | null;
  readonly description: string;
  readonly defaultValue: string | null;
}

export interface SchemaRelation {
  readonly fromTable: string;
  readonly fromField: string;
  readonly toTable: string;
  readonly toField: string;
  readonly type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface DataSchema {
  readonly id: string;
  readonly tableName: string;
  readonly description: string;
  readonly fields: readonly SchemaField[];
  readonly relations: readonly SchemaRelation[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
