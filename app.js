const express = require('express')
const methodOverride = require('method-override')
const app = express
const port = 5000
const prisma = require('./lib/prisma.js')
app.use(express.json())
app.use(methodOverride('method'))
//================================================
//         ROTAS DE USÚARIO
//================================================
app.get('/usuario', async (req,res)=>{
    try{
         const usuarios = await prisma.usuario.findMany()
         if(usuarios){
            return res.status(200).json(usuarios)
         }else{
            return  res.json({ 
              mensagem: 'Nenhum usúario cadastrado.'
             })
         }

    }catch(erro){
        return res.status(504).json({ 
            mensagem: "Erro ao listar usuários!"
         })
    }
})
app.post("/usuarioLogin", async (req,res)=>{
    const {emailUser, senhaUser} = req.body
    if(emailUser && senhaUser){
        try{
           const usuario = await prisma.usuario.findUnique({
            where:{email: emailUser}
           }) return  res.status(200).json(usuario)
        }catch(erro){
            return res.status(404).json({
                mensagem: "Erro ao logar, tente novamente!"
            })}
    }
    else{
        return res.status(404).json({'Erro': "Preencha os campos corretamente!"})
    }
})
app.post('/usuario', async (req,res) =>{
    const {nomeUser, emailUser, senhaUser} = req.body
    if(nomeUser && emailUser && senhaUser){
         try{
        await prisma.usuario.create({
            data:{
                nome: nomeUser,
                email: emailUser,
                senha: senhaUser
            }
        })
         return res.status(200).json({
            mensagem:"Usúario cadastrado com sucesso"
         })
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
                return res.status(200).json("Nome atualizado com sucesso") 
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
                return res.status(200).json(
                    "Senha atualizada com sucesso")

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
                return res.status(404).json("Email indisponivel, tente novamente!")
            }
            else if(!emailExist){
                try{
                     await prisma.usuario.update({
                     where:{id:idUser},
                    data:{email : emailUser}
                    })
                    return res.status(200).json("Email atualizado com sucesso")
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
        return res.status(404).json("Erro ao excluir usúario")
    }
})
//================================================
//         ROTAS DE PRODUTO
//================================================
app.post('/produto', async (req,res) =>{
    const {nomeProd, precoProd, categoriaProd, quantProd, valProd} = req.body
    try{
         if(nomeProd && categoriaProd && quantProd && valProd){
       await prisma.produto.create({
           data:{
                nome: nomeProd,
                preco: precoProd,
                categoria: categoriaProd,
                quant: quantProd,
                val: valProd
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
    const produtos = await prisma.produto.findMany()
    if(produtos.length > 0){
         return res.status(200).json(produtos)
    }else{
        return res.status(200).json("Nenhum produto cadastrado!")
    }
    }catch(erro){
        return res.status(404).json("Erro ao carregar produtos")
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
app.listen(port, ()=>{
    console.log(`Servidor rodando: http://locallhost ${port}`)
})