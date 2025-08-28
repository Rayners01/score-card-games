interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Toggle({ checked, onChange, disabled = false, label }: ToggleProps) {
  return (
    <label
      className={`relative inline-flex items-center cursor-pointer select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      aria-disabled={disabled}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className={`w-11 h-6 rounded-full shadow-inner transition-colors duration-300 ease-in-out ${
          checked ? "bg-emerald-500" : "bg-gray-300"
        }`}
      />
      <span
        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
      {label && <span className="ml-3 text-gray-900 select-none">{label}</span>}
    </label>
  );
}
