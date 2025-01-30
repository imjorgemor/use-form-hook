import { createFormControl } from "../createFormControl";

describe('createFormControl', () => {
    test('should initialize form and set is valid true', async () => {
        const { register, control } = createFormControl({
            defaultValues: {
                playaction: 'playaction',
            },
        });

        register('playaction', {});

        control._updateIsValid()

        expect(control._formState.isValid).toBeTruthy();
    });
});