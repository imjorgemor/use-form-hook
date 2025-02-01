import React from 'react';
import { render, screen } from "@testing-library/react";
import userEvent from '@testing-library/user-event';

import { useFormHook } from "../useFormHook";

describe('trigger', () => {
    test('should display form errors when trigger is called', async () => {
        const user = userEvent.setup()
        const Component = () => {
            const {
                register,
                trigger,
                formState: { errors },
            } = useFormHook<{
                test: string;
            }>({
                resolver: { test: (value) => value ? false : 'value required' },
                defaultValues: { test: undefined }
            });

            return (
                <div>
                    <input {...register('test')} />
                    <button type={'button'} onClick={() => trigger()}>
                        trigger
                    </button>
                    {errors.test && <span>error</span>}
                </div>
            );
        };

        render(<Component />);

        await user.click(screen.getByRole('button', { name: 'trigger' }));

        expect(screen.getByText('error')).toBeDefined();
        //note: to trigger errors before mounted remember to provide default values, trigger is checked against formValues not schemas
    });
});  