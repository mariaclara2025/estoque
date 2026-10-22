const express = require('express')
const methodOverride = require('method-override')
const app = express()
const port = 5000
const path = require('path');
const prisma = require('./lib/prisma.js')
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.urlencoded({extended:true}))


//Define que as pastas a serem chamadas serão ".html"
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile)
app.set('views engine', 'html')
app.use('static', express.static('static'));

//================================================
//         ROTAS DE USÚARIO
//================================================
app.get("/", (req, res) => {
    res.render("formsLogin.html");
});


app.post("/usuarioLogin", async (req,res)=>{
    const {emailUser, senhaUser} = req.body
    console.log(emailUser, senhaUser)
    console.log("testando")
    if(emailUser && senhaUser ){
        console.log("Rodou a condicional")
        try{
            //read em usuarios
           const usuario = await prisma.usuario.findFirst({
            where:{email: emailUser}
           });
           if(senhaUser == usuario.senha){
            //read em produtos
                const produtos = await prisma.produto.findMany({
            where:{usuarioId: usuario.id},
              include: {
                fornecedor: true }
           })
           console.log("return")
             return  res.status(200).render("pagPrincipal.html",{
                 usuario,
                  produtos
             })
         
           }else{
            return res.status(404).render("formsLogin.html",
                {mensagem : "Email ou senha incorreto!"}
            )
           }
        
           } catch(erro){
            return res.status(404).render("formsLogin.html",{
                mensagem: "Erro ao logar, tente novamente!"
            })}
    }
    else{
        console.log("Rodou a segunda")
        return res.status(404).render("formsLogin.html", {
            mensagem: "Preencha os campos corretamente!"
        });
        }
}) 
app.get("/redCriaruser", (req, res)=>{
    return res.render("formsCadastro.html")
})

app.post('/usuario', async (req, res) => {
    //create em usuarios
    const { nomeUser, emailUser, senhaUser } = req.body;
    console.log("Primeira condicional")
    if (nomeUser && emailUser && senhaUser) {
          console.log("Primeira condicional rodou")
        const emailExist = await prisma.usuario.findUnique({
                where:{email: emailUser}
            })
            if(!emailExist){
                 
                try {
            const usuario = await prisma.usuario.create({
                data: {
                    nome: nomeUser,
                    email: emailUser,
                    senha: senhaUser
                }
            });

            return res.status(201).render("pagPrincipal.html", {
                usuario,
                produtos:[]
            });

        } catch (erro) {
        
            return res.status(400).render("formsCadastro.html", {
                mensagem: "Erro tente novamente!"
            });
            }
        
        }else{
            return res.render("formsCadastro.html",
                {
                    mensagem: "Email Indisponivel,tente novamente!"
                })
        }
    } else {
        return res.status(400).render("formsCadastro.html", { 
            mensagem: "Erro, preencha todos os campos corretamente."
        });
    }}
)

app.get("/pagEditUser/:id", (req,res)=>{
    const usuario = prisma.usuario.findMany({ where:{id: Number(req.params.id)}})
       return res.render("editarperfil.html",{usuario})

})
//update em usuario
app.put('/usuario/:id', async (req,res)=>{
    const Info = req.body
    const novaInfo = req.body
    const idUser = req.params.id
    if(Info){
        if(info == "nome"){
            try {  await prisma.usuario.update({
                   where : {id: idUser},
                    data:{nome: novaInfo}
            }
                 
                )
                return res.status(200).render("editarperfil.html",{
                    mensagem: "Nome atualizado com sucesso"
                }
                   ) 
            }catch(erro){
               return res.status(404).render("editarperfil.html",{
                    erro: "Erro ao atualizar nome"
                })
            }
        }
        else if(Info == 'senha'){
             try{   await prisma.usuario.update(
                   { where:{id: idUser},
                    data:{senha: novaInfo}}
                )
                return res.status(200).render("editarperfil.html",{
                    mensagem:  "Senha atualizada com sucesso"
                }
                  )

            }catch(erro){
                return res.status(404).render("editarperfil.html",{
                    erro: "Erro ao atualizar senha"
                })
            }
        }
        else if(Info == 'email'){
            const emailExist = prisma.usuario.findUnique({
                where:{email: novaInfo}
            })
            if(emailExist ){
                return res.status(404).render("editarperfil.html",{
                    mensagem:"Email indisponivel, tente novamente!"
                }
                    )
            }
            else if(!emailExist){
                try{
                     await prisma.usuario.update({
                     where:{id:idUser},
                    data:{email : novaInfo}
                    })
                    return res.status(200).render("editarperfil.html",{
                        mensagem:"Email atualizado com sucesso"
                    }
                        )
                } catch(erro){
                    return res.status(404).render("editarperfil.html",{mensagem:"Erro ao atualizar email"})
                }
            }
        }
    }else{
      return res.status(404).render("editarperfil.html",
           { mensagem: "Erro, preencha os campos corretamente."}
        )
    }
})
// delete em usuario
app.delete('/usuario/:id', async (req,res) =>{
    const idUser = req.params.id
    try{
     await prisma.usuario.delete(
        { where:{id: idUser}}
     ); return res.render("formsLogin.html")
    }catch{
        return res.status(404).render("pagPrincipal.html",
            {
                mensagem: "Erro ao excluir usúario"
            })
    }
})
//================================================
//         ROTAS DE PRODUTO
//================================================
app.get("/redProd/:id",async (req,res)=> {
    const idUser = req.params.id
    const usuario = prisma.usuario.findMany({
        where:{id: idUser},
        include:{
            fornecedor: true
        }
    })
    const produtos = prisma.Produto.findMany({
        where:{usuarioId:idUser}
    })
   return res.status(200).render("pagProduto.html",{
   usuario, produtos
   })
});
app.post('/produtoCadastro', async (req,res) =>{
    const {nomeProd, precoProd, categoriaProd, quantProd, valProd, fornProd} = req.body
   const idUser = req.body.usuarioId
    try{
         if(nomeProd && categoriaProd && quantProd && valProd && fornProd){
       await prisma.Produto.create({
           where:{usuarioId: idUser},
        data:{
                nome: nomeProd,
                preco: precoProd,
                categoria: categoriaProd,
                quant: quantProd,
                val: valProd,
                fornecedor: { connect: { id: Number(fornProd) } }
            }
       }
         
        ); 
    }
    return res.status(200).render("pagProduto.html", {mensagemprod:"Produto adicionado com sucesso"})
    }catch(erro){
       return  res.status(404).render("pagProduto.html", {mensagemprod:"Erro ao cadastrar produto"})
    }
       
    
})

app.put("/produto/:id", async (req,res) =>{
    const {id} = req.params.id
    const {nomeProd, precoProd, quantProd, valProd} = req.body
    if(nomeProd || precoProd ||categoriaProd || quantProd || valProd){
        if(nomeProd){
            try{
                if(nomeProd){
                    
                }
                await prisma.produto.update({
                    where:{usuarioId: id},
                    data:{nome: nomeProd}
                })
                return res.status(200).render("pagProduto.html", {mensagemPut:"Nome do produto atualizado com sucesso"})
            }catch(erro){
                return res.status(404).render("pagProduto.html", {mensagemPut:"Erro ao atualizar nome do produto"})
            }}

            else if(precoProd){
                try{
                    await prisma.produto.update({
                       where:{usuarioId: id},
                        data:{preco: precoProd}
                    })
                    return res.status(200).render("pagProduto.html", {mensagemPut:"Preço do produto atualizado com sucesso"})
                }catch(erro){
                    return res.status(404).render("pagProduto.html", {mensagemPut:"Erro ao atualizar preço do produto"})
                }}
              
                    else if(quantProd){
                        try{
                            await prisma.produto.update({
                               where:{usuarioId: id},
                                data:{quant: quantProd}
                            })
                            return res.status(200).render("pagProduto.html", {mensagemPut:"Quantidade do produto atualizado com sucesso"})
                        }catch(erro){
                            return res.status(404).render("pagProduto.html", {mensagemPut:"Erro ao atualizar quantidade do produto"})
                        }}else if(valProd){
                            try{
                                await prisma.produto.update({
                                   where:{usuarioId: id},
                                    data:{val: valProd}
                                })
                                return res.status(200).render("pagProduto.html", {mensagemPut:"Validade do produto atualizado com sucesso"})
                            }catch(erro){
                                return res.status(404).render("pagProduto.html", {mensagemPut:"Erro ao atualizar validade do produto"})
                            }
            }   
        }else{
            return res.status(404).render("pagProduto.html", {mensagemPut:"Erro, Preencha a informação que deseja atualizar"})
        }
    }
)
app.delete('/produto/:id', async (req,res) =>{
    const {id} = req.params.id
    try{
        await prisma.produto.delete({
            where:{id: id}
        })
        return res.status(200).json("Produto excluido com sucesso")
    }
    catch(erro){
        return res.status(404).render("pagFornecedor",{mensagem:"Erro ao excluir produto" })
    }
})
// =====================================
// ROTAS FORNECEDOR
// =====================================
app.get("/redForn/:id",async (req,res) =>{
    const idUser = req.params.id
     try{
         const usuario = await prisma.usuario.findUnique({
        where: { id: Number(idUser) }
    });
     return res.render("pagFornecedor.html", {
      usuario
    })
     }catch(erro){
        return console.log("Erro ao redirecionar.")
     }
})
app.get("editForn",async (req,res)=>{
    return res.render()
})
app.post("/fornecedor", async (req, res) => {
    const { nome, cnpj, telefone, usuarioId } = req.body;
    try{
  const fornecedor =  await prisma.fornecedor.create({
        data: {
            nome,
            cnpj,
            telefone,
            
            usuario: {
                connect: { id: Number(usuarioId) }
            }
        }
    });
    }catch(erro){
        return res.render("pagFornecedor.html",
            { mensagem: "Não foi possivel cadastrar fornecedor, tente novamente!"}
        )
    }
 

   
});
app.put("/fornAtualizar/:id",async (req,res)=>{
  const{info, infoNova} = req.body
  const idforn = req.body.fornid;
    try{
      const id = req.params.id
      if(info){
            if(info == "nome"){
                    const fornecedor = await prisma.fornecedor.update({
                    where: { usuarioId: id, id: idforn},
                data:{nome: infoNova}});
                    return res.status(204).render("pagFornecedor.html",{
                    mensagemPut: "nome atualizado com sucesso."})
            }if(info=="cnpj"){
                    const fornecedor = await prisma.fornecedor.update({
                    where: { usuarioId: id, id: idforn},
                data:{cnpj: infoNova}});
                    return res.status(204).render("pagFornecedor.html",{
                    mensagemPut: "CNPJ atualizado com sucesso."})
            }if(info == "email"){
                    const fornecedor = await prisma.fornecedor.update({
                    where: { usuarioId: id, id: idforn},
                data:{email: infoNova}});
                    return res.status(204).render("pagFornecedor.html",{
                    mensagemPut: "Email atualizado com sucesso."})
            }
      }else{
        return res.status(404).render("pagFornecedor.html",{
            mensagemPut: "Preencha os campos corretamente."
        })
      }
         
    }catch(erro){
    return res.status(204).render("pagFornecedor.html",{
        mensagemPut: "Erro ao atualizar usúario."
    })
        
    }});
 
app.delete("/deleteForn/:id", async (req,res)=>{
   const fornid = req.body
    try{

     const forn =await  prisma.fornecedor.delete({
        where:{
            id: Number(fornid),
            usuarioId: Number(req.params.id)
        }
    }); return res.status(204).render("pagFornecedor", {
        mensagemDel : "Fornecedor excluido com sucesso!"
    })
   }catch(erro){
    return res.status(404).json({
        mensagemDel: "Erro ao excluir fornecedor!"
    })
   }
   
})
app.listen(port, ()=>{
    console.log(`Servidor rodando: http://localhost:${port}`)
})