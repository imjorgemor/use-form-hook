import React from "react";
import { useFormHook } from "../src/useFormHook"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className=
                "flex h-10 w-full rounded-md border border-input bg-slate-300 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }

const resolver = {
    username: (value: string) => {
        if (value === '' || value === undefined || value === null) {
            return 'name is required';
        }
        return false;
    },
    email: (value: string) => {
        if (value === '' || value === undefined || value === null) {
            return 'email is required';
        }
        return false;
    },
    // age: (value: string) => {
    //     if (value === '' || value === undefined || value === null) {
    //         return 'age is required';
    //     }
    //     return false;
    // },
    conditions: (value: boolean) => {
        if (value === false || value === undefined || value === null) {
            return 'you must accept conditions';
        }
        return false;
    },
    attachement: (value: FileList) => {
        if (!value || value?.length === 0) {
            return 'You must attach a file';
        }
        return false;
    },
    metadata: (value: string) => {
        if (value === '' || value === undefined || value === null) {
            return 'metadata is required';
        }
        return false;
    }
};

const FormWithValidation = () => {
    const { register, formState, ...rest } = useFormHook({
        mode: 'all',
        defaultValues: { username: undefined, email: undefined, conditions: false, attachement: undefined },
        resolver
    })
    const { errors } = formState;

    const onSubmit = (values: any) => {
        console.log('submited', values);
        //reset();
    };

    return (
        <main>
            <section className="px-4 py-4 max-w-[80%]">
                <form className="flex flex-col gap-2" onSubmit={rest.handleSubmit(onSubmit)}>
                    <div>
                        <Input
                            {...register('username')}
                            type="text"
                        />
                        {errors.username && <p>{errors.username}</p>}
                    </div>
                    <div>
                        <Input
                            {...register('email')}
                            type="email"
                        />
                        {errors.email && <p>{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="conditions" className="flex items-center gap-2">
                            <Input
                                {...register('conditions')}
                                type="checkbox"
                            />
                            <p className="flex-1">conditions</p>

                        </label>

                        {errors.conditions && <p>{errors.conditions}</p>}
                    </div>
                    <div>
                        <input
                            {...register('attachement')}
                            type="file"
                        />
                        {errors.attachement && <p>{errors.attachement}</p>}
                    </div>
                    <div>
                        <input type='submit' className="border-2 rounded-md py-2 px-8" />
                    </div>

                </form>
                <div>
                    isValid:{JSON.stringify(formState.isValid)}
                </div>
                <div>
                    <button className="border-2 rounded-md py-2 px-8" type="button" onClick={() => console.log('Current Values:', rest.getValues())}>log current values</button>
                </div>
                <div>
                    <button className="border-2 rounded-md py-2 px-8" type="button" onClick={() => rest.reset()}>reset form with valid values</button>
                </div>
                <div>
                    <button className="border-2 rounded-md py-2 px-8" type="button" onClick={() => rest.setError('username', 'name is required')}>set error</button>
                </div>
                <div>
                    <button className="border-2 rounded-md py-2 px-8" type="button" onClick={() => rest.trigger()}>trigger errors</button>
                </div>
            </section>
        </main>
    )
}

export { FormWithValidation as TestForm };
