import React from 'react';
import { act, renderHook } from '@testing-library/react';

import { useFormHook } from '../useFormHook';

describe('handleSubmit', () => {
    test('should invoke the callback when validation pass', async () => {
        const { result } = renderHook(() => useFormHook());
        const callback = jest.fn();

        await act(async () => {
            await result.current.handleSubmit(callback)({
                preventDefault: () => { },
                persist: () => { },
            } as React.SyntheticEvent);
        });
        expect(callback).toHaveBeenCalled();
    });

    test('should not invoke callback when there are errors', async () => {
        const { result } = renderHook(() => useFormHook<{ test: string }>({
            resolver: { test: (value) => value ? false : 'This is required' },
            defaultValues: { test: undefined }
        }));

        result.current.register('test');

        const callback = jest.fn();

        await act(async () => {
            await result.current.handleSubmit(callback)({
                preventDefault: () => { },
                persist: () => { },
            } as React.SyntheticEvent);
        });
        expect(callback).not.toHaveBeenCalled();
    });
})