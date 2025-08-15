import React from "react";
import { UseFormReturn } from "react-hook-form";

type Field = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
  enhancement?: string;
};

type Props = {
  form: UseFormReturn<any>;
  fields: Field[];
};

export default function FormRenderer({ form, fields }: Props) {
  const { register, formState: { errors } } = form;

  return (
    <div className="form-grid">
      {fields.map((f) => {
        const err = (errors as any)[f.name]?.message as string | undefined;
        return (
          <div className="field" key={f.name}>
            <label className="label">{f.label}{f.required && <span className="req"> *</span>}</label>
            <input
              className="input"
              {...register(f.name)}
              type={f.type}
              placeholder={f.placeholder}
              readOnly={f.readonly}
            />
            {f.enhancement === "autoFillCityState" && <div className="helper">Auto-fills city/state from PIN</div>}
            {err && <div className="error">{err}</div>}
          </div>
        );
      })}
    </div>
  );
}