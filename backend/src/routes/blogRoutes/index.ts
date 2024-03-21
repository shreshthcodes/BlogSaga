import { Hono } from "hono";
// import { verify, decode } from "hono/jwt";
import authMiddleware from "../../middleware/authMiddleware";
import { blogPostSchema,blogPutSchema } from "@shreshthcodes/blog_common/dist";
const app = new Hono<{
  Bindings: {
    JWT_SECRET: string;
  };
  Variables: {
    prisma: any;
    userId:string;
  };
}>();

app.get("/get/all",async(c) => {
  try{
    const prisma = c.get('prisma');
    const posts:any[]= await prisma.post.findMany();
    c.status(200);
    return c.json({success:true,data:posts})
  }catch(e){
    c.status(500);
    console.log(e);
    return c.json({sucess:false,message:e});
  }
});
app.get("/:id", async(c) => {
  const id= c.req.param('id');
  console.log(id);
  try{
    const prisma=c.get('prisma');
    const blog = await prisma.post.findFirst({
      where:{
        id:id,
      }
    })
    if(!blog){
      c.status(404);
      return c.json({success:true,message:`Blog with id ${id} does not exist`})
    }
    c.status(200);
    return c.json({success:true,data:blog});
  }catch(error){
    c.status(500);
    return c.json({success:false,error:error});
  }
});

app.post("/",authMiddleware,async (c) => {
  const body= await c.req.json();
  const {success} = blogPostSchema.safeParse(body)
  if(!success){
    c.status(400);
    return c.json({success:false,message:"Input format invalid"})
  }
  const id = c.get('userId');
  const prisma = c.get("prisma");
  try {
    const post = await prisma.post.create({
      data: {
        title:body.title,
        content:body.content,
        authorId: id,
      },
    });
    c.status(200);
    return c.json({ success: true, message: `Post added for ${id}` });
  } catch (error) {
    c.status(500);
    return c.json({ success: false, message: `Post not added for ${id}` });
  }
});

app.put("/",authMiddleware,async(c) => {
  try{
  const userId = c.get('userId')
  const body= await c.req.json();
  const {success}=blogPutSchema.safeParse(body);
  if(!success){
    c.status(400);
    return c.json({success:false,message:'Input format incorrect'})
  }
  const prisma=c.get('prisma');
  
  const updatedPost = await prisma.post.update({
    where: {
      id: body.id,
      authorId: userId,
    },
    data: {
      title: body.title,
      content: body.content
    },
    select: {
      id: true,
      title: true,
      content: true,
    }
  })

    if(!updatedPost){
      c.status(304);
      return c.json({success:false,message:"Post does not exist"})
    }

    c.status(200);
    return c.json({success:true,message:"Post updated!",data:updatedPost})

  }catch(error){
    c.status(400);
    return c.json({success:false,message:"User not authorized to update",error:error})
  }
});

export default app;
