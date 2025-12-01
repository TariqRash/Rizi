'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, CardContent, CardHeader, Stack, TextField } from '@mui/material';
import { FlowField } from './roleFlows';

export type FormState = Record<string, string>;

export const defaultFormValues = (fields: FlowField[]) =>
  fields.reduce<FormState>((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});

type FlowFormProps = {
  useCaseId: string;
  formId: string;
  title: string;
  fields: FlowField[];
  output: string;
  submitLabel?: string;
  initialValues?: FormState;
  onSubmit: (useCaseId: string, payload: FormState, output: string) => void;
  onReset?: () => void;
};

export function FlowForm({
  useCaseId,
  formId,
  title,
  fields,
  output,
  submitLabel,
  initialValues,
  onSubmit,
  onReset,
}: FlowFormProps) {
  const baseValues = useMemo(() => defaultFormValues(fields), [fields]);
  const [state, setState] = useState<FormState>(() => initialValues ?? baseValues);

  useEffect(() => {
    setState(initialValues ?? baseValues);
  }, [initialValues, baseValues]);

  const handleChange = (field: FlowField) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setState((prev) => ({ ...prev, [field.name]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(useCaseId, state, output);
  };

  const handleReset = () => {
    setState(baseValues);
    onReset?.();
  };

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardHeader title={title} subheader={output} />
      <CardContent>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          {fields.map((field) => (
            <TextField
              key={`${formId}-${field.name}`}
              required={field.required}
              select={field.type === 'select'}
              type={field.type === 'email' ? 'email' : 'text'}
              name={field.name}
              label={field.label}
              value={state[field.name] ?? ''}
              onChange={handleChange(field)}
              placeholder={field.placeholder}
              fullWidth
              SelectProps={{ native: true }}
              multiline={field.type === 'textarea'}
              minRows={field.type === 'textarea' ? 3 : undefined}
            >
              {field.type === 'select' && <option value="">Select option</option>}
              {field.type === 'select' &&
                field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </TextField>
          ))}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {onReset && (
              <Button variant="outlined" type="button" onClick={handleReset}>
                Reset
              </Button>
            )}
            <Button type="submit" variant="contained">
              {submitLabel ?? 'Save & track'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

