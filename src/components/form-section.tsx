interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6 border-b border-paper-edge last:border-b-0">
      {(title || description) && (
        <div>
          {title && <h3 className="font-medium text-[15px] text-ink mb-1">{title}</h3>}
          {description && (
            <p className="text-sm text-ink-mute leading-relaxed">{description}</p>
          )}
        </div>
      )}
      <div className={title || description ? "lg:col-span-2" : "lg:col-span-3"}>
        <div className="space-y-5">{children}</div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function Field({ label, hint, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">
        {label}
        {required && <span className="text-amber-600 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-mute mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}
