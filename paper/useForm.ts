import { useEffect, useRef, useState } from "react";
import { controller as createFormControl } from "./controller";
import { FieldValues,  UseFormProps } from '../src/typesV1';
import { FormStatePaper, UseFormReturnPaper } from './types';

export function useForm<
    TFieldValues extends FieldValues = FieldValues,
>(props: UseFormProps<TFieldValues> = {}): UseFormReturnPaper<TFieldValues> {
    const [formState, setFormState] = useState<FormStatePaper<TFieldValues>>({
        errors: props.errors || {},
    })
    const formControlRef = useRef<UseFormReturnPaper<TFieldValues>>();
    if (!formControlRef.current) {
        formControlRef.current = {
            ...createFormControl(props),
            formState
        };
    }
    const control = formControlRef.current.control;


    //read changes in the formState.errors when formState updates errors
    useEffect(() => {
        const unsubscribe = control._subjects.stateSubject.subscribe({
            next: (value) => {
                setFormState((prev) => {
                    const updated = { ...prev, ...value };
                    // Also update the ref so if something reads from formControlRef later, it sees the new data:
                    formControlRef.current!.formState = updated;
                    return updated;
                });
            }
        });

        return unsubscribe;
    });
    
    return formControlRef.current;
}