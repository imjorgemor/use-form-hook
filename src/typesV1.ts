import { VALIDATION_MODE } from "./createFormControl";

// errros utility types
export type Message = string;

export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

//field types
export type FieldValues = Record<any, any>;

export type FieldName<TFieldValues extends FieldValues> = keyof TFieldValues;

export type CustomElement<TFieldValues extends FieldValues> =
    Partial<HTMLElement> & {
        name: FieldName<TFieldValues>;
        type?: string;
        value?: any;
        disabled?: boolean;
        checked?: boolean;
        options?: HTMLOptionsCollection;
        files?: FileList | null;
        focus?: () => void;
    };

export type FieldElement<TFieldValues extends FieldValues = FieldValues> = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | CustomElement<TFieldValues>;

export type FieldRefs<TFieldValues extends FieldValues = FieldValues> = Partial<{
    [key in FieldName<TFieldValues>]: FieldElement;
}>;

export type DefaultValues<TFieldValues> = DeepPartial<TFieldValues>;

// resolver
export type Resolver<TFieldValues extends FieldValues> = Partial<
    Record<FieldName<TFieldValues>, (value: any, ctx?:any) => false | string>
>;

//useForm and formControl
export type UseFormProps<
    TFieldValues extends FieldValues = FieldValues,
> = Partial<{
    defaultValues: DefaultValues<TFieldValues>;
    mode: typeof VALIDATION_MODE[keyof typeof VALIDATION_MODE];
    resolver: Resolver<TFieldValues>;
    disabled: boolean;
    errors: Partial<Record<keyof TFieldValues, string>>;
}>;

export type Control<
    TFieldValues extends FieldValues = FieldValues,
> = {
    _defaultValues: DefaultValues<TFieldValues>;
    _disableForm: (disabled?: boolean) => void;
    _executeSchema: (name: string) => Promise<string | false>
    _fields: FieldRefs<TFieldValues>;
    _formState: FormState<TFieldValues>;
    _formValues: TFieldValues;
    _onChange: (event: ChangeEventHandler) => Promise<void>
    _reset: UseFormReset<TFieldValues>
    _setErrors: (errors: Partial<Record<keyof TFieldValues, string>>) => void
    _setFocus: UseFormSetFocus<TFieldValues>
    _updateIsDirty: () => void;
    _updateIsValid: (updateState?: boolean) => Promise<void>;
    _updateTouchedAndDirty: (field: keyof TFieldValues) => void
    _state: {
        mount: boolean
    }
    _subjects: {
        stateSubject: {
            next(value: Partial<FormState<TFieldValues>>): void;
            subscribe(observer: Observer<Partial<FormState<TFieldValues>>>): () => void;
        },
        valuesSubject: {
            next(value: Partial<TFieldValues>): void;
            subscribe(observer: Observer<Partial<TFieldValues>>): () => void;
        },
    };
}

export type UseFormReturn<TFieldValues extends FieldValues = FieldValues> = {
    control: Control;
    clearErrors: UseFormClearErrors<TFieldValues>
    formState: FormState<TFieldValues>;
    getFieldState: UseFormGetFieldState<TFieldValues>;
    getValues: UseFormGetValues<TFieldValues>;
    getTouchedFields: UseFormGetTouchedFields<TFieldValues>;
    handleSubmit: UseFormHandleSubmit<TFieldValues>;
    register: UseFormRegister<TFieldValues>;
    reset: UseFormReset<TFieldValues>;
    resetField: UseFormResetField<TFieldValues>;
    setError: UseFormSetError<TFieldValues>;
    setFocus: UseFormSetFocus<TFieldValues>;
    setValue: UseFormSetValue<TFieldValues>;
    trigger: UseFormTrigger<TFieldValues>;
    unregister: UseFormUnregister<TFieldValues>;
    watch: Watch<TFieldValues>
}

// methods
export type UseFormGetValues<TFieldValues extends FieldValues> = () => TFieldValues;

export type UseFormGetTouchedFields<TFieldValues extends FieldValues> = () => Partial<Record<keyof TFieldValues, boolean>>;

export type ChangeEventHandler = {
    target: any;
    type?: any;
};

export type UseFormRegisterReturn<TFieldName extends string> = {
    name: TFieldName;
    onChange: (event: ChangeEventHandler) => void;
    onBlur: (event: ChangeEventHandler) => void;
    ref: (element: FieldElement | null) => void;
    // If you want to reflect validation attributes on the input:
    required?: boolean;
    disabled?: boolean;
    min?: number | string;
    max?: number | string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;  // note that for HTML pattern, you'd typically convert a `RegExp` to a string
};

export type RegisterOptions = Partial<{
    required: boolean;
    disabled: boolean;
    min: number | string;
    max: number | string;
    minLength: number;
    maxLength: number;
    pattern: RegExp;
}>;

export type UseFormUnregister<TFieldValues extends FieldValues> = <
    TFieldName extends keyof TFieldValues
>(
    name: TFieldName,
) => void;

export type Watch<TFieldValues extends keyof FieldValues> =
    <TFieldName extends keyof TFieldValues
    >(
        names: TFieldName | TFieldName[]
    ) => TFieldName extends keyof TFieldValues ? TFieldValues[TFieldName] : Partial<Pick<TFieldValues, TFieldName>>

export type UseFormSetValue<TFieldValues extends FieldValues> = <TFieldName extends keyof TFieldValues, KFieldValue extends TFieldValues[TFieldName]
>(
    name: TFieldName,
    value: KFieldValue
) => void;

export type UseFormSetError<TFieldValues extends FieldValues> = <TFieldName extends keyof TFieldValues>(
    name: TFieldName,
    error: string,
) => void;

export type UseFormRegister<TFieldValues extends FieldValues> = <
    TFieldName extends keyof TFieldValues
>(
    name: TFieldName,
    options?: RegisterOptions
) => UseFormRegisterReturn<TFieldName & string>;

export type SubmitHandler<TFieldValues extends FieldValues> = (
    data: TFieldValues,
    event?: React.BaseSyntheticEvent,
) => unknown | Promise<unknown>;

export type UseFormHandleSubmit<
    TFieldValues extends FieldValues,
> = (onSubmit: SubmitHandler<Partial<TFieldValues>>) => (event?: React.BaseSyntheticEvent) => Promise<void>;

export type UseFormSetFocus<TFieldValues extends FieldValues> = <
    TFieldName extends keyof TFieldValues
>(
    name: TFieldName,
) => void;

export type UseFormClearErrors<TFieldValues extends FieldValues> = <
    TFieldName extends keyof TFieldValues
>(
    name?:
        | TFieldName
        | TFieldName[]
) => void;

export type UseFormResetField<TFieldValues extends FieldValues> = <
    TFieldName extends keyof TFieldValues, KFieldValue extends TFieldValues[TFieldName]
>(
    name: TFieldName,
    options?: Partial<{
        // keepDirty: boolean;
        // keepTouched: boolean;
        // keepError: boolean;
        defaultValue: KFieldValue;
    }>,
) => void;

export type UseFormReset<TFieldValues extends FieldValues> = (
    values?:
        | DefaultValues<TFieldValues>
        | TFieldValues,
    //keepStateOptions?: KeepStateOptions,
) => void;

export type UseFormGetFieldState<TFieldValues extends FieldValues> = <
    TFieldName extends keyof TFieldValues
>(
    name: TFieldName,
) => {
    isValid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    //isValidating: boolean;
    error?: string;
};

export type UseFormTrigger<TFieldValues extends FieldValues> = <
    TFieldName extends keyof TFieldValues
>(
    name?:
        | TFieldName
        | TFieldName[]
) => Promise<void>;

// form state
export type FormState<TFieldValues extends FieldValues> = {
    defaultValues?: DefaultValues<TFieldValues>;
    // error subject
    // Each field can have a string error message or be undefined (no error).
    errors: Partial<Record<keyof TFieldValues, string>>;
    // submit subject
    isSubmitted: boolean;
    isSubmitting: boolean,
    isSubmitSuccessful: boolean
    submitCount: number,
    // rest form state
    isDirty: boolean,
    isValidating: boolean,
    isValid: boolean,
    touchedFields: Partial<Record<keyof TFieldValues, boolean>>;
    dirtyFields: Partial<Record<keyof TFieldValues, boolean>>,
    validatingFields: Partial<Record<keyof TFieldValues, boolean>>,
    disabled: boolean
};

//utils
export type Observer<T> = { next: (value: T) => void };

export type Subject<T> = {
    next(value: T): void;
    subscribe(observer: Observer<T>): () => void;
}

export type EmptyObject = { [K in string | number]: never };

// useFormContext
export type FormProviderProps<
    TFieldValues extends FieldValues = FieldValues,
> = {
    children: React.ReactNode | React.ReactNode[];
} & UseFormReturn<TFieldValues>;