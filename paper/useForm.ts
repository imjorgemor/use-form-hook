import { useEffect, useRef, useState } from "react";
import { controller as createFormControl } from "./controller";
import { FieldValues,  Subject, UseFormProps } from '../src/typesV1';
import { FormStatePaper, UseFormReturnPaper } from './types';

type Props<T> = {
    subject: Subject<T>;
    next: (value: T) => void;
}

function useSubscribe<T>(props: Props<T>) {
    const _props = useRef(props);
    const { subject } = _props.current;

    useEffect(() => {
        const unsubscribe = subject.subscribe({
            next: _props.current.next
        },);
        return unsubscribe;
    }, [_props]);
}

export function useForm<
    TFieldValues extends FieldValues = FieldValues,
>(props: UseFormProps<TFieldValues> = {}): UseFormReturnPaper<TFieldValues> {
    const formControlRef = useRef<UseFormReturnPaper<TFieldValues>>();
    const [formState, setFormState] = useState<FormStatePaper<TFieldValues>>({
        errors: props.errors || {},
        //state subject
        isValid: !props.resolver && !props.errors && props.defaultValues ?true : false,
    })

    if (!formControlRef.current) {
        formControlRef.current = {
            ...createFormControl(props),
            formState
        };
    }

    const control = formControlRef.current.control;

    //read changes in the formState.errors when formState updates errors
    useSubscribe({
        subject: control._subjects.stateSubject,
        next: (value: Partial<Record<keyof TFieldValues, string>>) => {
            const currentState: FormStatePaper<TFieldValues> = formControlRef.current!.formState;
            const nextState: FormStatePaper<TFieldValues> = { ...currentState, ...value };
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

    return formControlRef.current
}