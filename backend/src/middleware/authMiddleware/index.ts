//JWT AUTHENTICATION MIDDLEWARE
import { verify } from "hono/jwt";
const authMiddleware = async (c: any, next: any) => {
  const jwt = c.req.header("x-authorization")?.split(" ")[1];
  try {
    if (!jwt) {
      c.status(403);
      return c.json({
        success: false,
        message: "Not Authorized please signin",
      });
    }
    const data = await verify(jwt, c.env.JWT_SECRET);
    if (!data.id) {
      c.status(404);
      return c.json({ success: false, message: "JWT token tampered" });
    }
    const prisma = c.get("prisma");
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: data.id,
        },
      });
      if (!user) {
        c.status(403);
        return c.json({ success: false, message: "User does not exist" });
      }
      c.set("userId", data.id); // important: now the user can directly be fetched from the context
      await next();
    } catch (error) {
      c.status(500);
      return c.json({ success: false, message: error });
    }
  } catch (error) {
    c.status(404);
    return c.json({ success: false, message: "JWT token tampered" });
  }
};

export default authMiddleware;
