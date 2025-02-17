import { renderHook, act } from "@testing-library/react";

import { useFormHook } from "../useFormHook";

describe('unregister', () => {
    test('should unregister an registered item', async () => {
        const { result } = renderHook(() => useFormHook<{ input: string }>());

        result.current.register('input');

        await act(async () => {
            await result.current.unregister('input');
        });

        expect(result.current.getValues()).toEqual({});
    });
});
