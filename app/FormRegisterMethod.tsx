import { useFormHook } from "../src/useFormHook"

export const FormRegisterMethod = () => {
    const { register, handleSubmit } = useFormHook({
        defaultValues: {
            firstName: "",
            lastName: "",
            category: "",
            checkbox: false,
            radio: "",
        },
    })

    return (
        <form onSubmit={handleSubmit(console.log)}>
            <input
                {...register("firstName", { required: true })}
                placeholder="First name"
            />

            <input
                {...register("lastName", { minLength: 2 })}
                placeholder="Last name"
            />

            <select {...register("category")}>
                <option value="">Select...</option>
                <option value="A">Category A</option>
                <option value="B">Category B</option>
            </select>

            <input {...register("checkbox")} type="checkbox" value="A" />

            <input {...register("radio")} type="radio" value="A" />
            <input {...register("radio")} type="radio" value="B" />
            <input {...register("radio")} type="radio" value="C" />

            <input type="submit" />
        </form>
    )
}