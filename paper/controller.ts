import { FieldValues, FormState, UseFormProps, ChangeEventHandler, Observer, Subject, UseFormHandleSubmit, UseFormSetError, EmptyObject, UseFormClearErrors } from '../src/typesV1';
import { FormStatePaper, UseFormReturnPaper } from './types';


export const isEmptyObject = (value: unknown): value is EmptyObject =>
    value ? !Object.keys(value).length : true;


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
    const _defaultValues = props.defaultValues ?? {};
    let _formValues: Partial<TFieldValues> = _defaultValues;
    const _formState: FormStatePaper<TFieldValues> = {
        //error state
        errors: {},
    };
    // state management
    const stateSubject: Subject<Partial<FormState<TFieldValues>>> = createSubject<Partial<FormState<TFieldValues>>>();

    //methods
    const _executeSchema = async (
        name: string
    ) => {
        let result: false | string = false;
        if (props.resolver?.[name]) {
            const value = _formValues[name];
            result = props.resolver[name](value, _formValues);
            return result;
        }
        return result;
    };

    //error state management
    const setError: UseFormSetError<TFieldValues> = (name, error) => {
        _formState.errors[name] = error;
        // Notify subscribers
        stateSubject.next({ errors: _formState.errors});
    };

    const clearErrors: UseFormClearErrors<TFieldValues> = (name) => {
        delete _formState.errors[name];
         // Notify subscribers
        stateSubject.next({ errors: _formState.errors });
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
    };

    const register: any = <
        TFieldName extends keyof TFieldValues
    >(
        name: TFieldName,
    ) => {
        return {
            name: name as TFieldName & string,
            onChange: async (event: ChangeEventHandler) => {
                const target = event.target;
                const value = event.target.value;
                const name = target.name as string;
                setFieldValue(name, value);
        
                const fieldError = await _executeSchema(name) || false;
                // fill formState error
                if (fieldError) {
                    setError(name, fieldError);
                }
                // remove error if previously there is an error but is already fixed
                if (_formState.errors[name] && !fieldError) {
                    clearErrors(name);  
                }
            },
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

            const fieldValues = _formValues;

            // execute success callback
            try {
                await callback(fieldValues, event);

            } catch (error) {
                onValidError = error;
                throw onValidError;
            }
        };

    return {
        control: {
            _subjects: {
                stateSubject,
            },
        },
        handleSubmit,
        register,
    };
};