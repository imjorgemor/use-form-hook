import { createFormControl } from "../createFormControl";

describe('createFormControl', () => {
    test('should initialize form, set initial values and update state to valid', async () => {
        const { register, control } = createFormControl({
            defaultValues: {
                defaultValue: 'defaultValue',
            },
        });

        register('defaultValue', {});

        control._updateIsValid()

        expect(control._formState.isValid).toBeTruthy();
    });
});