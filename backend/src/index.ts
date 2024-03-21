import { Hono } from "hono";
import {PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import userRoutes from "./routes/userRoutes";
import blogRoutes from "./routes/blogRoutes";
import { cors } from "hono/cors";
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    prisma: any;
  };
}>();

/*Middleware to set prisma client in the global context object. 
  This is used to access the prisma client in the route handlers. 
  This is a workaround to access the prisma client in the route handlers. 
  This is a workaround to access the prisma client in the route handlers. 
  This is a workaround to access the prisma client in the route handlers.*/
  app.use('*', cors())
app.use("*", async (c, next) => {
  const prisma: any = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  c.set("prisma", prisma);
  await next();
});

app.get("/", async(c) => {
	
  return c.text('Hola papi!')
});
app.get("/test", async(c) => {
	const prisma = c.get("prisma");
	const users=await prisma.user.findMany();
  return c.json({data:users});
});

app.route('/api/v1/user', userRoutes);

app.route('/api/v1/blog', blogRoutes);

export default app;
