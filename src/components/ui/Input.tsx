import { type InputHTMLAttributes, useId } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  readonly label?: string;
  readonly error?: string;
  readonly className?: string;
  readonly onChange: (value: string) => void;
  readonly value: string;
}

export default function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  className = '',
  ...rest
}: InputProps) {
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
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border
          bg-white text-gray-900 placeholder-gray-400
          dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          transition-colors
          ${
            error
              ? 'border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-700'
          }
        `.trim()}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
