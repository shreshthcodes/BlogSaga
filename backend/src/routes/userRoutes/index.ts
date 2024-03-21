import { Hono } from "hono";
import { sign } from "hono/jwt";
import { signinInputSchema,signupInputSchema} from "@shreshthcodes/blog_common/dist";
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    prisma: any;
  };
}>();

app.get("/users", async (c) => {
  return c.text("User route!");
});

// SIGNUP ROUTE
app.post("/signup", async (c) => {
  const body = await c.req.json();
  const { success } = signupInputSchema.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({ success: false, message: "Input format incorrect" });
  }
  //   const prisma = new PrismaClient({
  //     datasourceUrl: c.env.DATABASE_URL,
  //   }).$extends(withAccelerate());
  const prisma = c.get("prisma");
  try {
    const check = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (check) {
      c.status(201);
      return c.json({
        success: false,
        error: "User with the given email already exists",
      });
    } else {
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
          name: body.name || null,
        },
      });
      const token = await sign(
        {
          id: user.id,
          email: user.email,
        },
        c.env.JWT_SECRET
      );
      c.status(200);
      c.header("X-Authorization", `Bearer ${token}`);
      return c.json({
        success: true,
        data: {
          user: user,
          jwt: token,
        },
      });
    }
  } catch (err) {
    c.status(500);
    return c.json({ success: false, error: err });
  }
});

//SIGNIN ROUTE
app.post("/signin", async (c) => {
  const body = await c.req.json();
  const { success } = signinInputSchema.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({ success: false, message: "Input format incorrect" });
  }
  try {
    const prisma = c.get("prisma");
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    if (!user) {
      c.status(404);
      return c.json({
        success: false,
        message: "User with given email does not exist",
      });
    } else {
      if (user.password == body.password) {
        const token = await sign(
          {
            id: user.id,
            email: user.email,
          },
          c.env.JWT_SECRET
        );
        c.status(200);
        c.header("X-Authorization", `Bearer ${token}`);
        return c.json({
          success: true,
          data: {
            user: user,
            jwt: token,
          },
        });
      } else {
        c.status(403);
        return c.json({ success: false, error: "Invalid Credentials" });
      }
    }
  } catch (err) {
    c.status(500);
    return c.json({ success: false, error: err });
  }
});
export default app;
