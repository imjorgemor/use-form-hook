import { useEffect, useRef, useState } from "react";
import { createFormControl } from "./createFormControl";
import { FieldValues, FormState, Subject, UseFormProps, UseFormReturn } from './typesV1';

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

export function useFormHook<
    TFieldValues extends FieldValues = FieldValues,
>(props: UseFormProps<TFieldValues> = {}): UseFormReturn<TFieldValues> {
    const formControlRef = useRef<UseFormReturn<TFieldValues>>();
    const [watchedValues, setWatchedValues] = useState<Partial<TFieldValues>>({});
    const [formState, setFormState] = useState<FormState<TFieldValues>>({
        defaultValues: props.defaultValues,
        errors: props.errors || {},
        //state subject
        dirtyFields: {},
        isDirty: false,
        isSubmitSuccessful: false,
        isSubmitted: false,
        isSubmitting: false,
        isValid: !props.resolver && !props.errors && props.defaultValues ?true : false,
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

    useSubscribe({
        subject: control._subjects.valuesSubject,
        next: ({ name, value }) => {
            if (value !== watchedValues[name]) {
                setWatchedValues(prev => ({...prev, [name]: value}))
            }
        }
    })

    //read changes in the formState.errors when formState updates errors
    useSubscribe({
        subject: control._subjects.stateSubject,
        next: (value: Partial<Record<keyof TFieldValues, string>>) => {
            console.log(value)
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

    useEffect(
        () => {
            if (formControlRef.current) {
                control._disableForm(props.disabled)
            }
        }, [formControlRef, props.disabled],
    );

    return formControlRef.current
}