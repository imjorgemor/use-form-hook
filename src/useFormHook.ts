import { useEffect, useRef, useState } from "react";
import { createFormControl, isEmptyObject } from "./createFormControl";
import { FieldValues, FormState, UseFormProps, UseFormReturn } from './typesV1';

export function useFormHook<
  TFieldValues extends FieldValues = FieldValues,
>(props: UseFormProps<TFieldValues> = {}): UseFormReturn<TFieldValues> {
  const formControlRef = useRef<UseFormReturn<TFieldValues>>();
  const [, setWatchedValues] = useState<Partial<TFieldValues>>({});
  const [formState, setFormState] = useState<FormState<TFieldValues>>({
    defaultValues: props.defaultValues,
    errors: props.errors || {},
    //state subject
    dirtyFields: {},
    isDirty: false,
    isSubmitSuccessful: false,
    isSubmitted: false,
    isSubmitting: false,
    isValid: !isEmptyObject(props.errors),
    isValidating: false,
    submitCount: 0,
    touchedFields: {},
    validatingFields: {},
    disabled: props.disabled || false,
  })

  if (!formControlRef.current) {
    formControlRef.current = {
      ...createFormControl(props),
      formState
    };
  }

  const control = formControlRef.current.control;

  useEffect(() => {
    return control._subjects.valuesSubject.subscribe({
      next: (value) => {
        if (value) {
          setWatchedValues(prev => ({ ...prev, ...value }));
        }
      }
    });
  }, [control]);


  //read changes in the formState.errors when formState updates errors
  useEffect(() => {
    return control._subjects.stateSubject.subscribe({
      next: (value) => {
        const currentState: FormState<TFieldValues> = formControlRef.current!.formState;
        const nextState: FormState<TFieldValues> = { ...currentState, ...value };
        let shouldUpdate = false;

        for (const key in value) {
          if (key === 'isSubmitting') {
            shouldUpdate = true;
            break;
          }

          if (key === 'errors') {
            shouldUpdate = true;
            break;
          }

          const currentValue = currentState[key as keyof typeof currentState]
          const nextValue = nextState[key as keyof typeof currentState]
          if (currentValue !== nextValue) {
            shouldUpdate = true;
            break;
          }
        }

        if (!shouldUpdate) {
          return; // skip re-render
        }

        setFormState((prev) => {
          const updated = { ...prev, ...value };
          // Also update the ref so if something reads from formControlRef later, it sees the new data:
          formControlRef.current!.formState = updated;
          return updated;
        });
      }

    })

  }, [control])

  useEffect(
    () => {
      if (formControlRef.current) {
        control._disableForm(props.disabled)
      }
    }, [formControlRef, props.disabled],
  );

  return formControlRef.current
}