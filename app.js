const express = require('express')
const methodOverride = require('method-override')
const app = express()
const port = 5000
const prisma = require('./lib/prisma.js')
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.urlencoded({extended:true}))
app.set('views', path.join(__dirname, 'views'));
app.set('views', path.join(__dirname, 'views'));


//Define que as pastas a serem chamadas serão ".html"

app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')
//================================================
//         ROTAS DE USÚARIO
//================================================
app.get("/", (req,res)=> {
    res.render("pagPrincipal.html")
})
app.post("/usuarioLogin", async (req,res)=>{
    const {emailUser, senhaUser} = req.body
  
    if(emailUser && senhaUser ){
        try{
           const usuario = await prisma.usuario.findMany({
            where:{email: emailUser}
           }); 
            const produtos = await prisma.produto.findMany({
            where:{usuarioId: usuario.id},
              include: {
                fornecedor: true
            }
           })
          
             return  res.status(200).render("pagPrincipal.html",{
                 usuario,
                  produtos,
                  abaAtiva: "produtos"
             })
           } catch(erro){
            return res.status(404).json({
                mensagem: "Erro ao logar, tente novamente!"
            })}
    }
    else{
        return res.status(404).json({mensagem:
           "Preencha os campos corretamente!"})
    }
})
app.get("/redLogin", (req,res)=> {
    return res.redirect("formsLogin.html")
})
app.get("redSenha", (req,res )=>{
    return res.redirect("redefinirSenha.tml")
})
app.get("redCriaruser", (req, res)=>{
    return res.redirect("formsCadastro.html")
})

app.post('/usuario', async (req,res) =>{
    const {nomeUser, emailUser, senhaUser} = req.body
    if(nomeUser && emailUser && senhaUser){
         try{
       usuario = await prisma.usuario.create({
            data:{
                nome: nomeUser,
                email: emailUser,
                senha: senhaUser
            }
        })
         return res.status(200).render("pagPrincial.html", {usuario})
        
    }catch(erro){
       return res.status(504).json({
                 mensagem:"Erro, tente novamente"
        })
    }
    }else{
       return res.json({ 
            mensagem: "Erro, preencha os campos corretamente."
        } )
    }
   
})
app.get("/redEditar", (req,res) => {
    return res.redirect("editarPerfil.html")
})
app.put('/usuario/:id', async (req,res)=>{
    const novaInfo = req.body
    const idUser = req.params.id
    if(novaInfo){
        if(novaInfo == "nome"){
            try {  await prisma.usuario.update({
                   where : {id: idUser},
                    data:{nome: novaInfo}
            }
                 
                )
                return res.status(200).json({
                    mensagem: "Nome atualizado com sucesso"
                }
                   ) 
            }catch(erro){
               return res.status(404).json({
                    erro: "Erro ao atualizar nome"
                })
            }
        }
        else if(novaInfo == 'senha'){
             try{   await prisma.usuario.update(
                   { where:{id: idUser},
                    data:{senha: senhaUser}}
                )
                return res.status(200).json({
                    mensagem:  "Senha atualizada com sucesso"
                }
                  )

            }catch(erro){
                return res.status(404).json({
                    erro: "Erro ao atualizar senha"
                })
            }
        }
        else if(novaInfo == 'email'){
            const emailExist = prisma.usuario.findUnique({
                where:{emmail: emailUser}
            })
            if(emailExist ){
                return res.status(404).json({
                    mensagem:"Email indisponivel, tente novamente!"
                }
                    )
            }
            else if(!emailExist){
                try{
                     await prisma.usuario.update({
                     where:{id:idUser},
                    data:{email : emailUser}
                    })
                    return res.status(200).json({
                        mensagem:"Email atualizado com sucesso"
                    }
                        )
                } catch(erro){
                    return res.status(404).json("Erro ao atualizar email")
                }
            }
        }
    }else{
      return res.status(404).json(
           { mensagem: "Erro, preencha os campos corretamente."}
        )
    }
})

app.delete('/usuario/:id', async (req,res) =>{
    const idUser = req.params.id
    try{
     await prisma.usuario.delete(
        { where:{id: idUser}}
     ); return res.redirect("login.html")
    }catch{
        return res.status(404).json(
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
    try{
         const usuario = await prisma.usuario.findMany({
        where:{id: idUser},
        include:{
            fornecedor: true
        }
   })
    return res.render("pagProduto",
        {usuario}
    )
    }catch(erro){
        return res.status(404)
  }
});
app.post('/produtoCadastro', async (req,res) =>{
    const {nomeProd, precoProd, categoriaProd, quantProd, valProd, fornProd} = req.body
   
    try{
         if(nomeProd && categoriaProd && quantProd && valProd && fornProd){
       await prisma.produto.create({
           data:{
                nome: nomeProd,
                preco: precoProd,
                categoria: categoriaProd,
                quant: quantProd,
                val: valProd,
                fornecedor: { connect: { id: Number(fornProd) } }
            }
       }
         
        ); return res.status(200).json("Produto adicionado com sucesso")
    }
   
    }catch(erro){
       return  res.status(404).json("Erro ao cadastrar produto")
    }
       
    
})

app.put("/produto/:id", async (req,res) =>{
    const {id} = req.params.id
    const {nomeProd, precoProd, quantProd, valProd} = req.body
    if(nomeProd || precoProd ||categoriaProd || quantProd || valProd){
        if(nomeProd){
            try{
                await prisma.produto.update({
                    where:{id: id},
                    data:{nome: nomeProd}
                })
                return res.status(200).json("Nome do produto atualizado com sucesso")
            }catch(erro){
                return res.status(404).json("Erro ao atualizar nome do produto")
            }}
            else if(precoProd){
                try{
                    await prisma.produto.update({
                        where:{id: id},
                        data:{preco: precoProd}
                    })
                    return res.status(200).json("Preço do produto atualizado com sucesso")
                }catch(erro){
                    return res.status(404).json("Erro ao atualizar preço do produto")
                }}
              
                    else if(quantProd){
                        try{
                            await prisma.produto.update({
                                where:{id: id},
                                data:{quant: quantProd}
                            })
                            return res.status(200).json("Quantidade do produto atualizado com sucesso")
                        }catch(erro){
                            return res.status(404).json("Erro ao atualizar quantidade do produto")
                        }}else if(valProd){
                            try{
                                await prisma.produto.update({
                                    where:{id: id},
                                    data:{val: valProd}
                                })
                                return res.status(200).json("Validade do produto atualizado com sucesso")
                            }catch(erro){
                                return res.status(404).json("Erro ao atualizar validade do produto")
                            }
            }   
        }else{
            return res.status(404).json("Erro, Preencha a informação que deseja atualizar")
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
        return res.status(404).json("Erro ao excluir produto")
    }
})
// =====================================
// ROTAS FORNECEDOR
// =====================================
app.get("/redForn/:id",async (req,res) =>{
    const idUser = req.params.id
     
    const forn = await prisma.Produto.findMany(
        {where:{id:idUser},
        data: {
            fornecedorId
        }

        })
    return res.render("pagFornecedor.html", {
       forn
    })
})
app.post("/fornecedor/:id", async (req,res)=> { 
    const {nome,email,cnpj,tel} = req.body
    try{
        
       await prisma.fornecedor.create({
        data:{
            nome: nome,
            email: email,
            cnpj: cnpj,
            telefone: tel,
            usuario:{
                connect:{
                    id: Number(req.params.id)
                }
            }
        }
       })
    }catch(erro){
        return res.status(404).json({
            mensagem: "Erro ao adicionar!"
        })
    }
})
app.put("fornAtualizar/:id&idForn",async (req,res)=>{
   try{
      const id = req.params.id
    const idForn = req.params.idForn
     const fornecedor = await prisma.fornecedor.update({
        where: { id: idForn}
    })
     return res.status(204).render("")
   }catch(erro){
    return res.status(204).json({
        mensagem: "Erro ao atualizar usúario."
    })
   }
  
})

app.delete("deleteForn/:id", async (req,res)=>{
   try{

     const forn =await  prisma.fornecedor.delete({
        where:{
            id: Number(req.params.id)
        }
    }); return res.status(204).render("")
   }catch(erro){
    return res.status(404).json({
        mensagem: "Erro ao excluir fornecedor!"
    })
   }
   
})
app.listen(port, ()=>{
    console.log(`Servidor rodando: http://localhost:${port}`)
})