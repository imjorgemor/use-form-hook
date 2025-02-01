import React from 'react';
import { render, renderHook } from '@testing-library/react';

import { useFormHook } from '../useFormHook';

describe('getValues', () => {
    test('should return defaultValues before inputs mounted', () => {
        let values;

        const Component = () => {
            const { getValues } = useFormHook({
                defaultValues: {
                    test: 'test',
                },
            });

            values = getValues();

            return null;
        };

        const { rerender } = render(<Component />);

        expect(values).toEqual({
            test: 'test',
        });

        rerender(<Component />);

        expect(values).toEqual({ test: 'test' });
    });

    test('should get all field values', () => {
        const values = {
            test: 'test',
            test1: 'test1',
            test2: 'test2',
        };
        const { result } = renderHook(() =>
            useFormHook<{ test: string; test1: string; test2: string }>({
                defaultValues: values,
            }),
        );
        result.current.register('test');
        result.current.register('test1');
        result.current.register('test2');

        result.current.setValue('test', 'test');
        result.current.setValue('test1', 'test1');
        result.current.setValue('test2', 'test2');

        expect(result.current.getValues()).toEqual({ "test": "test", "test1": "test1", "test2": "test2" });
    });
});