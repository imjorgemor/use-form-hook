

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useFormHook } from '../useFormHook';

describe('formState.isDirty', ()=>{
    test('should Set to true after the user modifies any of the inputs', async ()=>{
        const user = userEvent.setup();
        const App = () => {
            const {
                register,
                formState,
            } = useFormHook({
                defaultValues: {
                    test: undefined,
                },
                resolver: { test: (value) => value === 'foo' ? 'invalid value' : false },
                mode:'onChange'
            });
            const {isDirty, errors} = formState;

            return (
                <form>
                    <input {...register('test')} />
                    <p>isDirty:{JSON.stringify(isDirty)}</p>
                    {errors.test && <p>{errors.test}</p>}
                </form>
            );
        };

        render(<App />);

        expect(screen.getByText('isDirty:false')).toBeDefined();

        await user.type(screen.getByRole('textbox'), 'foo');

       expect(screen.getByText('isDirty:true')).toBeDefined();
       //note remember state fields only updates after form update when error and mode is onChange (onSubmit mode does not update form on errors)
    })
})