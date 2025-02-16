import React from "react";
import { useForm } from './useForm'

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
};

type FormValues = Partial<{
    username: string;
    email: string;
}>;

const PaperApp = () => {
    const { register, formState, ...rest } = useForm<FormValues>({
        mode: 'all',
        defaultValues: { username: '', email: '', },
        resolver
    })
    const { errors } = formState;

    const onSubmit = (values: FormValues) => {
        console.log('submited values:', values);
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
                        <input type='submit' className="border-2 rounded-md py-2 px-8" />
                    </div>

                </form>
                <div>
                    isValid:{JSON.stringify(formState.isValid)}
                </div>
                <div>
                    <button className="border-2 rounded-md py-2 px-8" type="button" onClick={() => console.log('Current Values:', rest.getValues())}>log current values</button>
                </div>
            </section>
        </main>
    )
}

export { PaperApp };
