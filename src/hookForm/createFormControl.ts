import { FieldElement, FieldRefs, FieldValues, FormState, RegisterOptions, UseFormGetValues, UseFormProps, UseFormRegister, UseFormReturn, ChangeEventHandler, Observer, Subject, UseFormHandleSubmit, UseFormSetValue, UseFormSetError, UseFormSetFocus, EmptyObject, UseFormClearErrors, UseFormResetField, DeepPartial, UseFormReset, UseFormGetFieldState, UseFormTrigger, CustomElement, Watch } from './typesV1';

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
export function createFormControl<
    TFieldValues extends FieldValues = FieldValues
>(
    props: UseFormProps<TFieldValues> = {}
): Omit<UseFormReturn<TFieldValues>, 'formState'> {
    // form state variables
    const _options = { mode: VALIDATION_MODE.onSubmit, ...props };
    const _fields: FieldRefs = {};
    const _defaultValues = _options.defaultValues ? cloneObject(_options.defaultValues) || {} : {};
    let _formValues: Partial<TFieldValues> = cloneObject(_defaultValues);
    const _formState: FormState<TFieldValues> = {
        //error state
        errors: _options.errors || {},
        //submit state
        isSubmitted: false,
        isSubmitting: false,
        isSubmitSuccessful: false,
        submitCount: 0,
        // general state
        isValid: false,
        isDirty: false,
        // rest formState
        isValidating: false,
        touchedFields: {},
        dirtyFields: {},
        validatingFields: {},
        disabled: _options.disabled || false,
    };
    const _state = {
        mount: false
    };

    const _namesWatched: Set<keyof TFieldValues> = new Set();

    // state management
    const stateSubject: Subject<Partial<FormState<TFieldValues>>> = createSubject<Partial<FormState<TFieldValues>>>();
    const valuesSubject: Subject<{
        name?: keyof TFieldValues;
        value?: TFieldValues[keyof TFieldValues];
    }> = createSubject();



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
        }
    };

    const _updateIsDirty = () => {
        if (!_formState.isDirty) {
            _formState.isDirty = true;
            stateSubject.next({ isDirty: true });
        }
    };

    const _updateTouchedAndDirty = (field: keyof TFieldValues) => {
        if (_formState.touchedFields[field] && _formState.dirtyFields[field]) {
            return;
        }
        _formState.dirtyFields[field] = true;
        _formState.touchedFields[field] = true;
    };

    const _disableForm = (disabled?: boolean) => {
        if (disabled) {
            _formState.disabled = disabled ?? false;
            stateSubject.next({ disabled });
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
        _updateIsDirty();
        stateSubject.next({ ..._formState, errors: _formState.errors, isValid: false });
    };

    const _setErrors = (errors: Partial<Record<keyof TFieldValues, string>>) => {
        _formState.errors = errors;
        stateSubject.next({
            errors: _formState.errors,
            isValid: false,
        });
    };

    // form value management
    const getValues: UseFormGetValues<TFieldValues> = () => {
        const values = { ..._formValues } as TFieldValues;
        return values;
    };

    const watch: Watch<TFieldValues> = <TFieldName extends keyof TFieldValues>(
        names: TFieldName | TFieldName[]
    ): TFieldName extends keyof TFieldValues
        ? TFieldValues[TFieldName]
        : Partial<Pick<TFieldValues, TFieldName>> => {
        if (Array.isArray(names)) {
            // Add all field names to the watched set
            names.forEach((name) => _namesWatched.add(name));

            // Create an object for the specified field names
            const values: Partial<Pick<TFieldValues, TFieldName>> = {} as Partial<Pick<TFieldValues, TFieldName>>;
            for (const name of names) {
                values[name] = _formValues[name];
            }
            return values as TFieldName extends keyof TFieldValues
                ? TFieldValues[TFieldName]
                : Partial<Pick<TFieldValues, TFieldName>>;
        }

        // Single field name case
        _namesWatched.add(names);
        return _formValues[names] as TFieldValues[TFieldName];
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

    const setValue: UseFormSetValue<TFieldValues> = (name, value) => {
        setFieldValue(name, value);
    };

    const onChange = async (event: ChangeEventHandler) => {
        if (!_state.mount) {
            _state.mount = true;
            if (!_options.resolver) {
                _formState.isValid = true;
                stateSubject.next({ isValid: true });
            }
        }
        if (!_formState.isDirty) {
            _formState.isDirty = true;
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

        _updateTouchedAndDirty(name);

        //manage errors and formState
        if (_options.mode === VALIDATION_MODE.onSubmit || !_options.resolver?.[name]) {
            //manage watched inputs
            if (_namesWatched.has(name)) {
                valuesSubject.next({ name, value });
            }
            return;
        }
        
        const fieldError = await _executeSchema(name) || false;
        // fill formState error
        if (fieldError) {
            setError(name, fieldError);
            _updateIsValid(true);
        } else {
            if (_namesWatched.has(name)) {
                valuesSubject.next({ name, value });
            }
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
            result = _options.resolver[name](value);
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
                        _updateIsValid(true);
                    }
                }
            },
            // Reflect typical HTML validation attributes
            required: options?.required,
            disabled: options?.disabled ?? _formState.disabled,
            min: options?.min,
            max: options?.max,
            minLength: options?.minLength,
            maxLength: options?.maxLength,
            pattern: options?.pattern ? options.pattern.source : undefined,
        };
    };

    const unregister = <TFieldName extends keyof TFieldValues>(name: TFieldName) => {
        const isValidBeforeUnregister = _formState.isValid;
        setFieldValue(name, null as TFieldValues[TFieldName]);
        delete _fields[name];
        delete _formValues[name];
        delete _formState.dirtyFields[name];
        delete _formState.touchedFields[name];
        delete _formState.errors[name];

        if (isValidBeforeUnregister) {
            return;
        }
        const isValidAfterUnRegister = isEmptyObject(_formState.errors) && isEmptyObject(props.resolver);
        stateSubject.next({ errors: _formState.errors, isValid: isValidAfterUnRegister });
    };

    const setFocus: UseFormSetFocus<TFieldValues> = (name) => {
        const fieldRef = _fields[name];
        if (fieldRef && typeof fieldRef.focus === "function") {
            fieldRef.focus();
        }
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

    const resetField: UseFormResetField<TFieldValues> = <
        TFieldName extends keyof TFieldValues,
        KFieldValue extends TFieldValues[TFieldName]
    >(
        name: TFieldName,
        options: Partial<{ defaultValue: KFieldValue }> = {},
    ) => {
        const ref = document.querySelector(`[name="${name as string}"]`) as FieldElement;
        // 1) Decide which default to use
        if (options.defaultValue !== undefined) {
            setFieldValue(name, options.defaultValue);
        } else {
            // fallback to the library's default
            const defaultVal = (_defaultValues as DeepPartial<TFieldValues>)[name];
            if (defaultVal === undefined) {
                setFieldValue(name, undefined as TFieldValues[TFieldName]);
            } else {
                setFieldValue(name, defaultVal as TFieldValues[TFieldName]);
            }
        }

        if (ref.type === 'file') {
            ref.value = '';
        } else {
            ref.value = _formValues[name] || '';
        }

        // 2) Clear potential errors
        if (_formState.errors[name]) {
            delete _formState.errors[name];
            //set form is not valid
            _formState.isValid = false;
            stateSubject.next({ isValid: false, errors: _formState.errors, });
        }
        if (props.resolver?.[name]) {
            _formState.isValid = false;
            stateSubject.next({ isValid: false });
        }
        // 3) Clear dirty/touched flags
        delete _formState.dirtyFields[name];
        delete _formState.touchedFields[name];
    };

    const getFieldState: UseFormGetFieldState<TFieldValues> = (
        name,
    ) => ({
        invalid: _formState.errors[name] ? true : false,
        isDirty: _formState.dirtyFields[name] ? true : false,
        error: _formState.errors[name] ?? undefined,
        //isValidating: !!get(_formState.validatingFields, name),
        isTouched: _formState.touchedFields[name] ? true : false,
    });

    const _reset: UseFormReset<TFieldValues> = (formValues) => {
        // 1) Decide which values to use
        const updatedValues = formValues ? cloneObject(formValues) : cloneObject(_defaultValues);
        // 2) Overwrite _formValues entirely with the new set of values
        _formValues = { ...updatedValues };
        // 3) Update DOM <input>.value if we have refs stored in _fields
        //    Convert null/undefined => empty string to avoid setting an invalid value in the DOM
        for (const fieldName of Object.keys(_formValues)) {
            const castedFieldName = fieldName as keyof TFieldValues;
            const ref = document.querySelector(`[name="${fieldName}"]`) as FieldElement;
            if (ref) {
                const fieldValue = _formValues[castedFieldName];
                if (fieldValue === undefined) {
                    setFieldValue(fieldName, undefined as TFieldValues[string]);
                } else {
                    setFieldValue(fieldName, fieldValue);
                }
                if (ref.type === 'file') {
                    ref.value = '';
                }
            }
        }
        // 4) Optionally, you might want to clear errors, dirtyFields, touchedFields, etc.
        //    as part of a form reset. That depends on your library logic.
        _formState.dirtyFields = {};
        _formState.errors = {};
        //submit state
        _formState.isSubmitted = false;
        _formState.isSubmitSuccessful = false;
        _formState.submitCount = 0;
        // general state
        _formState.isValid = props.resolver ? false : true; //updateIsValid
        _formState.isDirty = false;
        // rest formState
        _formState.touchedFields = {};
        stateSubject.next({ errors: _formState.errors, isValid: _formState.isValid, });
    };

    const trigger: UseFormTrigger<TFieldValues> = async (name?) => {
        if (!_options.resolver) {
            return;
        }

        if (typeof name === 'string') {
            const fieldError = await _executeSchema(name);
            if (fieldError) {
                setError(name, fieldError);
            }
        }

        if (name instanceof Array) {
            let isErrorInArray = false;
            for (const field of name) {
                const fieldError = await _executeSchema(field as string);
                if (fieldError) {
                    _formState.errors[field] = fieldError;
                    isErrorInArray = true;
                }
            }
            if (isErrorInArray) {
                stateSubject.next({ errors: _formState.errors });
            }
        }

        if (!name) {
            let isErrorInForm = false;
            const fieldsWithResolver = Object.keys(_formValues);
            for (const field of fieldsWithResolver) {
                const fieldError = await _executeSchema(field);
                if (fieldError) {
                    _formState.errors[field as keyof typeof _formState.errors] = fieldError;
                    isErrorInForm = true;
                }
            }
            if (isErrorInForm) {
                stateSubject.next({ errors: _formState.errors });
            }
        }
    };

    // form submit managment
    const handleSubmit: UseFormHandleSubmit<Partial<TFieldValues>> =
        (callback) => async (event) => {
            let onValidError = undefined;
            if (event?.preventDefault && event.persist) {
                event.preventDefault();
                event.persist();
            }

            _formState.isSubmitting = true;
            stateSubject.next({
                isSubmitting: true,
            });

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
                _formState.isSubmitted = true;
                _formState.isSubmitting = false;
                _formState.isSubmitSuccessful = false;
                _formState.submitCount = _formState.submitCount + 1;
                _formState.isValid = true;

                stateSubject.next({
                    isSubmitted: true,
                    isSubmitting: false,
                    isSubmitSuccessful: false,
                    submitCount: _formState.submitCount,
                    errors: _formState.errors,
                    isValid: false
                });
                return;
            }

            _formState.isSubmitted = true;
            _formState.isSubmitting = false;
            _formState.isSubmitSuccessful = true;
            _formState.submitCount = _formState.submitCount + 1;
            _formState.isValid = true;
            // do success stuff
            stateSubject.next({
                isSubmitted: true,
                isSubmitting: false,
                isSubmitSuccessful: true,
                submitCount: _formState.submitCount,
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
            _defaultValues,
            _disableForm,
            _executeSchema,
            _fields,
            _formState,
            _formValues,
            _onChange: onChange,
            _reset,
            _setErrors,
            _state,
            _updateIsDirty,
            _updateIsValid,
            _updateTouchedAndDirty,
            _subjects: {
                stateSubject,
                valuesSubject
            },
        },
        clearErrors,
        getFieldState,
        getValues,
        handleSubmit,
        register,
        reset: _reset,
        resetField,
        setError,
        setFocus,
        setValue,
        trigger,
        unregister,
        watch
    };
};