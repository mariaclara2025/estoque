const express = require('express')
const methodOverride = require('method-override')
const app = express
const port = 5000
const prisma = require('./lib/prisma.js')
app.use(express.json())
app.use(methodOverride('method'))
app.use(express.urlencoded({extended:true}))


//Define que as pastas a serem chamadas serão ".html"
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
//================================================
//         ROTAS DE USÚARIO
//================================================

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
app.post("/usuarioSenha", async (req,res)=>{
    const {emailUser, senhaUser, senhaConf} = req.body
    if(emailUser && senhaUser && senhaConf){
        if(senhaUser == senhaConf){
            try{
                const usuario = await prisma.usuario.findUnique({
                    where:{email: emailUser}
                })
                if(usuario){
                    await prisma.usuario.update({
                        where:{email: emailUser},
                        data:{senha: senhaUser}
                    })
                    return res.status(200).json("Senha atualizada com sucesso")
                }
            }catch(erro){
                return res.status(404).json("Erro ao atualizar senha, tente novamente!")
            }
            }else{
                return res.status(404).json({mensagem: "Erro, As informções não coincidem!" })
        }}else{
                return res.status(404).json({mensagem: "Preencha todos os campos."})
        } })
    
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
                erroExcluir: "Erro ao excluir usúario"
            })
    }
})
//================================================
//         ROTAS DE PRODUTO
//================================================
app.get("/redProd", (req,res)=> {
    return res.redirect("pagProduto")
})
app.post('/produto', async (req,res) =>{
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
                fornecedor: { connect: { id: Number(fornecedorId) } }
            }
       }
         
        ); return res.status(200).json("Produto adicionado com sucesso")
    }
   
    }catch(erro){
       return  res.status(404).json("Erro ao cadastrar produto")
    }
       
    
})
app.get('/produto', async (req,res)=>{
    try{
        const nomeProd = req.body;
    const produto = await prisma.produto.findMany({
        where: {nome: nomeProd}
    })
    if(produto.length > 0){
         return res.status(200).json(produto)
    }else{
        return res.status(200).json("Nenhum produto cadastrado!")
    }
    }catch(erro){
        return res.status(404).json("Erro ao carregar produto")
    }
  
})

app.put("/produto/:id", async (req,res) =>{
    const {id} = req.params.id
    const {nomeProd, precoProd, categoriaProd, quantProd, valProd} = req.body
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
                else if(categoriaProd){
                    try{
                        await prisma.produto.update({
                            where:{id: id},
                            data:{categoria: categoriaProd}
                        })
                        return res.status(200).json("Categoria do produto atualizado com sucesso")
                    }catch(erro){
                        return res.status(404).json("Erro ao atualizar categoria do produto")
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
app.get("/redForn", (req,res) =>{
    return res.redirect("pagFornecedor.html")
})
app.post("/fornecedor", (req,res)=> {

})
app.listen(port, ()=>{
    console.log(`Servidor rodando: http://locallhost ${port}`)
})