import z from "zod";

const signupInputSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8),
    name:z.optional(z.string()),
})
const signinInputSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8),
})

type signupInputType=z.infer<typeof signupInputSchema>
type signinInputType=z.infer<typeof signinInputSchema>

const blogPostSchema = z.object({
    title:z.string(),
    content:z.string(),
})
const blogPutSchema = z.object({
    title:z.string(),
    content:z.string(),
})
type blogPostType=z.infer<typeof blogPostSchema>
type blogPutType=z.infer<typeof blogPutSchema>

export {signinInputSchema,signupInputSchema,signinInputType,signupInputType,blogPostSchema,blogPutSchema,blogPostType,blogPutType}


