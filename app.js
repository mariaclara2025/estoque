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
app.use('/static', express.static(path.join(__dirname, 'views', 'static')));
app.use((req, res, next) => {
    console.log(` Método: ${req.method} | URL: ${req.url}`);
    next();
});
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
                const produtos = await prisma.produto.findFirst({
            where:{usuarioId: usuario.id},
              include: {
                fornecedor: true }
           })
           console.log("return")
           console.log(usuario.id)
           if(produtos){
            console.log("Lista de produtos:",produtos)
           }else{
            console.log("Nehum produto cadastrado")
           }
           
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

app.get("/pagEditUser/:id",async (req,res)=>{
    const id =Number(req.params.id)
    console.log(id)
    const usuario = await prisma.usuario.findUnique({ where:{id: id}})
    console.log("acessando usuario", usuario.id) 
    console.log(usuario)  
    return res.render("editarperfil.html",{ usuario })

})
//update em usuario
app.put('/usuario/:id', async (req,res)=>{
console.log("Entrou na rota PUT")
    const{info, novaInfo}  = req.body
    const idUser = Number(req.params.id)
    console.log(idUser)
    console.log("Tipo do idUser:", typeof idUser);
    if(info){
        if(info == "nome"){
              console.log("Entrou em nome")
            try { const usuario = await prisma.usuario.update({
                   where : {id: idUser},
                    data:{nome: novaInfo}
            }); console.log("Fez busca no banco")
            console.log(usuario)
                return res.status(200).render("editarperfil.html",{
                    mensagem: "Nome atualizado com sucesso", usuario
                }) 
            }catch(erro){
               return res.status(404).render("editarperfil.html",{
                    mensagem: "Erro ao atualizar nome"
                })
            }
        }
        else if(info == "senha"){
            console.log("Entrou em senha")
             try{  
                console.log("entrou em try")
                const usuario =  await prisma.usuario.update(
                   {
                     where:{id: idUser},
                    data:{senha: novaInfo}});
                    
                    console.log(usuario)
                return res.status(200).render("editarperfil.html",{
                    mensagem:  "Senha atualizada com sucesso", usuario
                })

            }catch(erro){
                return res.status(404).render("editarperfil.html",{
                    erro: "Erro ao atualizar senha"
                })
            }
        }
        else if(info == "email"){
              console.log("Entrou em email")
            const emailExist = await prisma.usuario.findUnique({
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
                    const usuario =  await prisma.usuario.update({
                     where:{id:idUser},
                    data:{email : novaInfo}
                    })
                    return res.status(200).render("editarperfil.html",{
                        mensagem:"Email atualizado com sucesso", usuario
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
    const idUser = Number(req.params.id)
    const usuario = await prisma.usuario.findUnique({
        where:{id: idUser}
    })
    try{
        console.log("entrou em try")
     await prisma.usuario.delete(
        { where:{id: idUser}}
     );
     console.log("Redirecionando...")
     return res.render("formsLogin.html")
    }catch{
        return res.status(404).render("pagPrincipal.html",
            {
                mensagem: "Erro ao excluir usúario", usuario
            })
    }
})
//================================================
//         ROTAS DE PRODUTO
//================================================
app.get("/redProd/:id",async (req,res)=> {
    const idUser = Number(req.params.id)
    console.log("tipo do id ", typeof idUser)
    const produtos = await prisma.produto.findMany({
        where:{usuarioId : idUser}
    })
   const usuario = await prisma.usuario.findUnique({
        where:{id:idUser}
   }); console.log(usuario)
     const fornecedores = await prisma.fornecedor.findMany({
        where:{usuarioId: idUser}
   })

   console.log("ID do Usuário logado:", idUser);
    console.log("Fornecedores encontrados para este usuário:", fornecedores);
   return res.status(200).render("pagProduto.html",{
   usuario, produtos, fornecedores
   })
});
app.post('/produtoCadastro', async (req, res) => {
    const { nomeProd, precoProd, categoriaProd, quantProd, data_val, fornProd } = req.body
    const idUser = Number(req.body.usuarioId)

    try {
        console.log("Entrou no try do cadastro de produto")

        if (nomeProd && quantProd && fornProd) {
            
            await prisma.produto.create({
                data: {
                    nome: nomeProd,
                    preco: Number(precoProd) || 0,
                    quant: Number(quantProd),
                    val: data_val ? new Date(data_val) : null,
                    fornecedor: { connect: { id: Number(fornProd) } },
                    usuario: {connect:{id: idUser}}
                }
            })

            const usuario = await prisma.usuario.findUnique({
                where: { id: idUser },
                include: { fornecedor: true }
            })

            const produtos = await prisma.produto.findMany({
                where: { usuarioId: idUser },
                include: { fornecedor: true }
            })

            return res.status(200).render("pagProduto.html", {
                mensagemprod: "Produto adicionado com sucesso!",
                usuario,
                produtos
            })

        } else {
            const usuario = await prisma.usuario.findUnique({
                where: { id: idUser }
            })

            const produtos = await prisma.produto.findMany({
                where: { usuarioId: idUser },
                include: { fornecedor: true }
            })

            return res.status(400).render("pagProduto.html", {
                mensagemprod: "Erro ao cadastrar produto, preencha todos os campos obrigatórios.",
                usuario,
                produtos
            })
        }

    } catch (erro) {
        console.error("Erro no cadastro de produto:", erro)

        const usuario = await prisma.usuario.findUnique({
            where: { id: idUser }
        })

        const produtos = await prisma.produto.findMany({
            where: { usuarioId: idUser },
            include: { fornecedor: true }
        })

        return res.status(500).render("pagProduto.html", {
            mensagemprod: "Erro interno ao cadastrar produto.",
            usuario,
            produtos
        })
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
    const idUser = Number(req.params.id)
     try{
         const usuario = await prisma.usuario.findUnique({
        where: { id: idUser } });
        
        console.log("Usuario: ", usuario)
    const produto = await prisma.produto.findMany({
            where:{ usuarioId : idUser}
    })
    console.log("Produtos: ", produto)
     return res.render("pagFornecedor.html", {
      usuario,produto
    })
     }catch(erro){
        console.error("Erro ao redirecionar:", erro);
        return res.status(500).send("Erro ao redirecionar.");
     }
})

app.post("/fornecedor/:id", async (req, res) => {
    const { nome, cnpj, telefone, email } = req.body;
    const idUser = Number(req.params.id);
    
    const usuario = await prisma.usuario.findUnique({ // busca o usuario para enviar com a mensagem em caso de erro
            where: { id: idUser }
        });
   const fornecedor = await prisma.fornecedor.findMany({
        where:{usuarioId: idUser}
   })
    if(nome && cnpj && telefone && email){// verifica se todos os campos estão preenchidos
        console.log("Entrou no primeiro")
       const fornecedorExistente = await prisma.fornecedor.findFirst({
            where: {
                OR: [
                    { email: email },
                    { cnpj: cnpj }
                ]
            }
        });

        if (fornecedorExistente) { // se o email ja existir ele vai enviar a mensagem de erro e retorna o usuario com os produtos
            return res.status(404).render("pagFornecedor.html", {mensagem:"CNPJ ou Email inválido, Tente novamente", usuario, fornecedor})
        }else{// caso o email não exista
             try {
                await prisma.fornecedor.create({
                    data: {
                        nome,
                        email,
                        cnpj,
                        telefone,
                        usuario: {
                            connect: { id: idUser }
                        }
                    }
                });
                

             
                return res.status(200).render("pagFornecedor.html", {
                    mensagem: "Fornecedor adicionado com sucesso.",
                    usuario,
                    fornecedor
                });
    } catch (erro) {
        console.error("Erro no cadastro de fornecedor:", erro);
             return res.status(500).render("pagFornecedor.html", {
            mensagem: "Não foi possível cadastrar fornecedor, tente novamente!",
            usuario,
            fornecedor
        });
    }
        }
    }else{
          console.log("Entrou no catch")
        return res.status(404).render("pagFornecedor.html",{
            mensagem:"Preencha todos os campos.", usuario,fornecedor
        })
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