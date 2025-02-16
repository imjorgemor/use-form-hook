import { FieldElement, FieldRefs, FieldValues, FormState, RegisterOptions, UseFormGetValues, UseFormProps, UseFormRegister, ChangeEventHandler, Observer, Subject, UseFormHandleSubmit, UseFormSetError, EmptyObject, CustomElement, UseFormClearErrors} from '../src/typesV1';
import { FormStatePaper, UseFormReturnPaper } from './types';

// utils
const cloneObject = <T>(obj: T): T => {
    return { ...obj };
};

export const isEmptyObject = (value: unknown): value is EmptyObject =>
    value ? !Object.keys(value).length : true;

// constants
export const VALIDATION_MODE = {
    onChange: 'onChange',
    onSubmit: 'onSubmit',
    all: 'all',
} as const;


export function createSubject<T>(): Subject<T> {
    let observers: Observer<T>[] = [];

    return {
        next(value: T) {
            observers.forEach((observer) => observer.next(value));
        },
        subscribe(observer: Observer<T>) {
            observers.push(observer);
            return () => {
                observers = observers.filter(observerItem => observerItem !== observer);
            };
        },
    };
}

// form control
export function controller<
    TFieldValues extends FieldValues = FieldValues
>(
    props: UseFormProps<TFieldValues> = {}
): Omit<UseFormReturnPaper<TFieldValues>, 'formState'> {
    // form state variables
    const _options = { mode: VALIDATION_MODE.onChange, ...props };
    const _fields: FieldRefs = {};
    const _defaultValues = _options.defaultValues ? cloneObject(_options.defaultValues) || {} : {};
    let _formValues: Partial<TFieldValues> = cloneObject(_defaultValues);
    const _formState: FormStatePaper<TFieldValues> = {
        //error state
        errors: _options.errors || {},
        // general state
        isValid: !props.resolver && !props.errors && props.defaultValues ? true : false,
    };
    const _state = {
        mount: false
    };

    // state management
    const stateSubject: Subject<Partial<FormState<TFieldValues>>> = createSubject<Partial<FormState<TFieldValues>>>();

    const _updateIsValid = async (updateState?: boolean) => {
        if (_options.resolver) {
            let tempErrorState: Partial<Record<keyof TFieldValues, string>> = {};
            for (const field of Object.keys(_formValues)) {
                const fieldError = await _executeSchema(field);
                if (fieldError) {
                    tempErrorState = { ...tempErrorState, [field]: fieldError };
                } else {
                    delete tempErrorState[field];
                }
            }
            const isValid = isEmptyObject(tempErrorState);
            if (isValid !== _formState.isValid) {
                _formState.isValid = isValid;
                if (updateState) {
                    stateSubject.next({ isValid });
                }
            }
        } else {
            if (!_formState.isValid) {
                _formState.isValid = true;
                stateSubject.next({ errors: {}, isValid: true, });
            }
        }
    };

    //error state management
    const setError: UseFormSetError<TFieldValues> = (name, error) => {
        if (_formState.errors[name] === error) {
            return;
        }
        _formState.errors[name] = error;
        _formState.isValid = false;
        // Notify subscribers
        stateSubject.next({ ..._formState, errors: _formState.errors, isValid: false });
    };

    const clearErrors: UseFormClearErrors<TFieldValues> = (name) => {
        if (!name) {
            _formState.errors = {};
        }
        if (typeof name === 'string') {
            delete _formState.errors[name];
        }
        if (name instanceof Array) {
            name.forEach(itemName => delete _formState.errors[itemName]);
        }
        stateSubject.next({ errors: _formState.errors });
    };

    // form value management
    const getValues: UseFormGetValues<TFieldValues> = () => {
        const values = { ..._formValues } as TFieldValues;
        return values;
    };

    //here manage all the html logic
    const setFieldValue = <
        TFieldName extends keyof TFieldValues,
        KFieldValue extends TFieldValues[TFieldName]
    >(
        name: TFieldName,
        value: KFieldValue
    ) => {
        _formValues[name] = value;
        const fieldReference = _fields[name];
        if (fieldReference) {
            if (value === null || value === undefined) {
                fieldReference.value = null;
            } else if (fieldReference.type === 'checkbox') {
                (fieldReference as CustomElement<TFieldValues>).checked = value ? value : false;
            } else if (fieldReference.type === 'file') {
                fieldReference.value = '';
            } else {
                fieldReference.value = value;
            }
        }
    };

    const onChange = async (event: ChangeEventHandler) => {
        if (!_state.mount) {
            _state.mount = true;
            if (!_options.resolver) {
                _formState.isValid = true;
                stateSubject.next({ isValid: true });
            }
        }
       
        const target = event.target;
        const value = event.target.value;
        const name = target.name as string;
        if (target.type === 'checkbox') {
            setFieldValue(name, target.checked);
        } else if (target.type === 'file') {
            setFieldValue(name, target.files);
        } else {
            setFieldValue(name, value);
        };

       

        //manage errors and formState
        if (_options.mode === VALIDATION_MODE.onSubmit || !_options.resolver?.[name]) {
            //manage watched inputs
            _updateIsValid(true);
            
            return;
        }

        const fieldError = await _executeSchema(name) || false;
        // fill formState error
        if (fieldError) {
            setError(name, fieldError);
            _updateIsValid(true);
        } else {
           
        }
        // remove error if previously there is an error but is already fixed
        if (_formState.errors[name] && !fieldError) {
            clearErrors(name);
            _updateIsValid(true);
        }
        _updateIsValid(true);
    };

    const _executeSchema = async (
        name: string
    ) => {
        let result: false | string = false;
        if (_options.resolver?.[name]) {
            const value = _formValues[name];
            result = _options.resolver[name](value, _formValues);
            return result;
        }
        return result;
    };

    const register: UseFormRegister<TFieldValues> = <
        TFieldName extends keyof TFieldValues
    >(
        name: TFieldName,
        options?: RegisterOptions
    ) => {

        return {
            name: name as TFieldName & string,
            onChange,
            onBlur: onChange,
            ref: (ref: FieldElement | null) => {
                if (ref) {
                    if (ref.type === 'file') {
                        return;
                    } else {
                        ref.value = _formValues[name] ?? '';
                        _fields[name as string] = ref;
                    }
                }
            },
            // Reflect typical HTML validation attributes
            required: options?.required,
            disabled: options?.disabled,
            min: options?.min,
            max: options?.max,
            minLength: options?.minLength,
            maxLength: options?.maxLength,
            pattern: options?.pattern ? options.pattern.source : undefined,
        };
    };


    // form submit managment
    const handleSubmit: UseFormHandleSubmit<Partial<TFieldValues>> =
        (callback) => async (event) => {
            let onValidError = undefined;
            if (event?.preventDefault && event.persist) {
                event.preventDefault();
                event.persist();
            }

            const fieldValues = cloneObject(_formValues);

            if (['all', 'onSubmit'].includes(_options.mode)) {
                if (_options.resolver) {
                    let tempErrorState: Partial<Record<keyof TFieldValues, string>> = {};
                    for (const field of Object.keys(_formValues)) {
                        const fieldError = await _executeSchema(field);
                        if (fieldError) {
                            tempErrorState = { ...tempErrorState, [field]: fieldError };
                        } else {
                            delete tempErrorState[field];
                        }
                    }
                    _formState.errors = tempErrorState;
                }
            }
            if (!isEmptyObject(_formState.errors)) {
                _formState.isValid = true;

                stateSubject.next({
                    errors: _formState.errors,
                    isValid: false
                });
                return;
            }

            _formState.isValid = true;
            // do success stuff
            stateSubject.next({
                errors: {},
                isValid: true
            });

            // execute success callback
            try {
                await callback(fieldValues, event);

            } catch (error) {
                onValidError = error;
            }
            if (onValidError) {
                throw onValidError;
            }
        };

    return {
        control: {
            _subjects: {
                stateSubject,
            },
        },
        getValues,
        handleSubmit,
        register,
    };
};