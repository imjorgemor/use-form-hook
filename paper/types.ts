import { Control, FieldValues, FormState,  UseFormHandleSubmit, UseFormRegister } from "../src/typesV1";

export type FormStatePaper<TFieldValues extends FieldValues> = Pick<FormState<TFieldValues>, 'errors'>;

export type UseFormReturnPaper<TFieldValues extends FieldValues = FieldValues> = {
    control: {_subjects: { stateSubject: Control['_subjects']['stateSubject']}};
    formState: FormStatePaper<TFieldValues>;
    handleSubmit: UseFormHandleSubmit<TFieldValues>;
    register: UseFormRegister<TFieldValues>;
}