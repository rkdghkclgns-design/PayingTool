import { useState, useRef, useEffect, useCallback } from 'react';
import { Trash2, Plus } from 'lucide-react';
import type { DataSchema, SchemaField, SchemaFieldType } from '../../models';
import { useSchemaStore } from '../../stores/schema-store';
import Button from '../ui/Button';

interface SchemaTableEditorProps {
  readonly schema: DataSchema;
}

const FIELD_TYPE_OPTIONS: readonly { readonly value: SchemaFieldType; readonly label: string }[] = [
  { value: 'string', label: 'string' },
  { value: 'number', label: 'number' },
  { value: 'boolean', label: 'boolean' },
  { value: 'date', label: 'date' },
  { value: 'datetime', label: 'datetime' },
  { value: 'json', label: 'json' },
  { value: 'uuid', label: 'uuid' },
  { value: 'enum', label: 'enum' },
];

function createEmptyField(): SchemaField {
  return {
    name: '',
    type: 'string',
    nullable: true,
    isPrimaryKey: false,
    isForeignKey: false,
    foreignTable: null,
    foreignField: null,
    enumValues: null,
    description: '',
    defaultValue: null,
  };
}

interface EditableCellProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
}

function EditableCell({ value, onChange, placeholder = '', className = '' }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed !== value) {
      onChange(trimmed);
    } else {
      setInput(value);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') {
            setInput(value);
            setIsEditing(false);
          }
        }}
        className={`w-full px-2 py-1 text-xs border border-brand-400 dark:border-brand-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500 ${className}`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`block w-full px-2 py-1 text-xs cursor-text hover:bg-brand-50 dark:hover:bg-brand-950/50 rounded transition-colors min-h-[1.5em] ${className}`}
      title="클릭하여 편집"
    >
      {value || <span className="text-gray-400 dark:text-gray-500 italic">{placeholder}</span>}
    </span>
  );
}

interface EditableTableNameProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
}

function EditableTableName({ value, onChange }: EditableTableNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed.length > 0 && trimmed !== value) {
      onChange(trimmed);
    } else {
      setInput(value);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') {
            setInput(value);
            setIsEditing(false);
          }
        }}
        className="font-mono text-base font-bold px-2 py-1 border-b-2 border-brand-500 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none"
      />
    );
  }

  return (
    <h3
      onClick={() => setIsEditing(true)}
      className="font-mono text-base font-bold text-gray-900 dark:text-gray-100 cursor-text hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-2 py-1"
      title="클릭하여 테이블 이름 편집"
    >
      {value}
    </h3>
  );
}

export default function SchemaTableEditor({ schema }: SchemaTableEditorProps) {
  const updateField = useSchemaStore((s) => s.updateField);
  const addField = useSchemaStore((s) => s.addField);
  const removeField = useSchemaStore((s) => s.removeField);
  const updateTableName = useSchemaStore((s) => s.updateTableName);

  const [isAddingField, setIsAddingField] = useState(false);
  const [newField, setNewField] = useState<SchemaField>(createEmptyField);

  const handleTableNameChange = useCallback(
    (name: string) => {
      updateTableName(schema.id, name);
    },
    [schema.id, updateTableName],
  );

  const handleFieldUpdate = useCallback(
    (fieldName: string, updates: Partial<SchemaField>) => {
      updateField(schema.id, fieldName, updates);
    },
    [schema.id, updateField],
  );

  const handleFieldRemove = useCallback(
    (fieldName: string) => {
      removeField(schema.id, fieldName);
    },
    [schema.id, removeField],
  );

  const handleAddFieldSubmit = useCallback(() => {
    const trimmedName = newField.name.trim();
    if (trimmedName.length === 0) {
      return;
    }
    const fieldAlreadyExists = schema.fields.some((f) => f.name === trimmedName);
    if (fieldAlreadyExists) {
      return;
    }
    addField(schema.id, { ...newField, name: trimmedName });
    setNewField(createEmptyField());
    setIsAddingField(false);
  }, [schema.id, schema.fields, newField, addField]);

  const handleAddFieldCancel = useCallback(() => {
    setNewField(createEmptyField());
    setIsAddingField(false);
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Table Name Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <EditableTableName
          value={schema.tableName}
          onChange={handleTableNameChange}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {schema.fields.length}개 필드
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800/80">
              <th className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                필드명
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                자료형
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap text-center">
                PK
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap text-center">
                FK
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap text-center">
                Nullable
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                기본값
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">
                설명
              </th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap w-10">
                {/* delete column */}
              </th>
            </tr>
          </thead>
          <tbody>
            {schema.fields.map((field, index) => (
              <tr
                key={field.name}
                className={`
                  border-t border-gray-100 dark:border-gray-800
                  hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors
                  ${index % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''}
                `}
              >
                {/* 필드명 */}
                <td className="px-3 py-1.5">
                  <EditableCell
                    value={field.name}
                    onChange={(name) => handleFieldUpdate(field.name, { name })}
                    placeholder="필드명"
                    className="font-mono"
                  />
                </td>

                {/* 자료형 */}
                <td className="px-3 py-1.5">
                  <select
                    value={field.type}
                    onChange={(e) =>
                      handleFieldUpdate(field.name, {
                        type: e.target.value as SchemaFieldType,
                      })
                    }
                    className="w-full px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                  >
                    {FIELD_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* PK */}
                <td className="px-3 py-1.5 text-center">
                  <input
                    type="checkbox"
                    checked={field.isPrimaryKey}
                    onChange={(e) =>
                      handleFieldUpdate(field.name, {
                        isPrimaryKey: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500 cursor-pointer"
                  />
                </td>

                {/* FK */}
                <td className="px-3 py-1.5 text-center">
                  <input
                    type="checkbox"
                    checked={field.isForeignKey}
                    onChange={(e) =>
                      handleFieldUpdate(field.name, {
                        isForeignKey: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500 cursor-pointer"
                  />
                </td>

                {/* Nullable */}
                <td className="px-3 py-1.5 text-center">
                  <input
                    type="checkbox"
                    checked={field.nullable}
                    onChange={(e) =>
                      handleFieldUpdate(field.name, {
                        nullable: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500 cursor-pointer"
                  />
                </td>

                {/* 기본값 */}
                <td className="px-3 py-1.5">
                  <EditableCell
                    value={field.defaultValue ?? ''}
                    onChange={(val) =>
                      handleFieldUpdate(field.name, {
                        defaultValue: val.length > 0 ? val : null,
                      })
                    }
                    placeholder="-"
                    className="font-mono"
                  />
                </td>

                {/* 설명 */}
                <td className="px-3 py-1.5">
                  <EditableCell
                    value={field.description}
                    onChange={(desc) =>
                      handleFieldUpdate(field.name, { description: desc })
                    }
                    placeholder="설명 없음"
                  />
                </td>

                {/* 삭제 */}
                <td className="px-3 py-1.5 text-center">
                  <button
                    onClick={() => handleFieldRemove(field.name)}
                    className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                    title="필드 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}

            {/* Add new field row */}
            {isAddingField && (
              <tr className="border-t border-dashed border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-950/30">
                {/* 필드명 */}
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    value={newField.name}
                    onChange={(e) =>
                      setNewField({ ...newField, name: e.target.value })
                    }
                    placeholder="필드명"
                    className="w-full px-2 py-1 text-xs font-mono border border-brand-400 dark:border-brand-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddFieldSubmit();
                      if (e.key === 'Escape') handleAddFieldCancel();
                    }}
                  />
                </td>

                {/* 자료형 */}
                <td className="px-3 py-1.5">
                  <select
                    value={newField.type}
                    onChange={(e) =>
                      setNewField({
                        ...newField,
                        type: e.target.value as SchemaFieldType,
                      })
                    }
                    className="w-full px-2 py-1 text-xs rounded border border-brand-400 dark:border-brand-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                  >
                    {FIELD_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </td>

                {/* PK */}
                <td className="px-3 py-1.5 text-center">
                  <input
                    type="checkbox"
                    checked={newField.isPrimaryKey}
                    onChange={(e) =>
                      setNewField({ ...newField, isPrimaryKey: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500 cursor-pointer"
                  />
                </td>

                {/* FK */}
                <td className="px-3 py-1.5 text-center">
                  <input
                    type="checkbox"
                    checked={newField.isForeignKey}
                    onChange={(e) =>
                      setNewField({ ...newField, isForeignKey: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500 cursor-pointer"
                  />
                </td>

                {/* Nullable */}
                <td className="px-3 py-1.5 text-center">
                  <input
                    type="checkbox"
                    checked={newField.nullable}
                    onChange={(e) =>
                      setNewField({ ...newField, nullable: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-500 focus:ring-brand-500 cursor-pointer"
                  />
                </td>

                {/* 기본값 */}
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    value={newField.defaultValue ?? ''}
                    onChange={(e) =>
                      setNewField({
                        ...newField,
                        defaultValue: e.target.value.length > 0 ? e.target.value : null,
                      })
                    }
                    placeholder="-"
                    className="w-full px-2 py-1 text-xs font-mono border border-brand-400 dark:border-brand-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </td>

                {/* 설명 */}
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    value={newField.description}
                    onChange={(e) =>
                      setNewField({ ...newField, description: e.target.value })
                    }
                    placeholder="설명"
                    className="w-full px-2 py-1 text-xs border border-brand-400 dark:border-brand-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </td>

                {/* 액션 */}
                <td className="px-3 py-1.5 text-center">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleAddFieldSubmit}
                      disabled={newField.name.trim().length === 0}
                      className="p-1 rounded text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      title="추가"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Field Button */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        {isAddingField ? (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddFieldSubmit}
              disabled={newField.name.trim().length === 0}
            >
              필드 추가
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddFieldCancel}
            >
              취소
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddingField(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            필드 추가
          </Button>
        )}
      </div>
    </div>
  );
}
