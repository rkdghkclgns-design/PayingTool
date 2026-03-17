import { useId } from 'react';

interface SelectOption {
  readonly value: string;
  readonly label: string;
}

interface SelectProps {
  readonly label?: string;
  readonly options: readonly SelectOption[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
}

export default function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  className = '',
}: SelectProps) {
  const id = useId();

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border border-gray-300
          bg-white text-gray-900
          dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          transition-colors cursor-pointer
          appearance-none bg-no-repeat bg-right
        `.trim()}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 0.75rem center',
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
