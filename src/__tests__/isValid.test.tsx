import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useFormHook } from '../useFormHook';

describe('formState.isValid', ()=>{
    test('should form be invalid if there is no default values and no resolver as we expect at least the user introduces a value; after introducing the first value form is valid', async ()=>{
        const user = userEvent.setup();
        const App = () => {
            const {
                register,
                formState: { isValid },
            } = useFormHook();

            return (
                <form>
                    <input {...register('test')} />
                    <p>isValid:{JSON.stringify(isValid)}</p>
                </form>
            );
        };

        render(<App />);

        expect(screen.getByText('isValid:false')).toBeDefined();

        await user.type(screen.getByRole('textbox'), 'test');

        expect(screen.getByText('isValid:true')).toBeDefined();
    })

    test('should form be valid if there is  default values and no resolver as we already have the form filled with default values or external data', async ()=>{
        const App = () => {
            const {
                register,
                formState: { isValid },
            } = useFormHook({
                defaultValues: {
                    test: 'test value',
                },
            });

            return (
                <form>
                    <input {...register('test')} />
                    <p>isValid:{JSON.stringify(isValid)}</p>
                </form>
            );
        };

        render(<App />);

        expect(screen.getByText('isValid:true')).toBeDefined();
    })

    test('should form be invalid if there defaultValues are set to undfined and a resolver is provided', async ()=>{
        const user = userEvent.setup();

        const App = () => {
            const {
                register,
                formState: { isValid },
            } = useFormHook({
                defaultValues: {
                    test: undefined,
                },
                resolver: { test: (value) => value ? false : 'This is required' },
            });

            return (
                <form>
                    <input {...register('test')} />
                    <p>isValid:{JSON.stringify(isValid)}</p>
                </form>
            );
        };

        render(<App />);

        expect(screen.getByText('isValid:false')).toBeDefined();

        await user.type(screen.getByRole('textbox'), 'test');

        expect(screen.getByText('isValid:true')).toBeDefined();
    })
})