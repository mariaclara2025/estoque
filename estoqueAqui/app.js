const express = require('express')
const methodOverride = require('method-override')
const app = express
const port = 5000
app.use(express.json())

//================================================
//         ROTAS DE USÚARIO
//================================================
app.get('usuario', async (req,res)=>{
    try{
         const usuarios = await prisma.usuario.findMany()
         if(usuarios){
            return res.status(200).json(usuarios)
         }else{
            return  res.json({ 
              mensagem: 'Nenhum usúario cadastrado.'
             })
         }

    }cacth(erro){
        return res.status(504).json({ 
            mensagem: "Erro ao listar usuários!"
         })
    }
})
app.post('usuario', async (req,res) =>{
    const {nomeUser, emailUser, senhaUser} = req.body
    if(nomeUser && emailUser && senhaUser){
         try{
        await prisma.usuario.create({
            data:{
                nome: nomeUser,
                email: emailUser,
                senha: senhaUser
            }
        }) return res.status(200).json({
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
app.put('usuario/:id', async (req,res)=>{
    const novaInfo = req.body
    const idUser = req.params.id
    if(novaInfo){
        if(novaInfo == "nome"){
            try(
                await prisma.usuario.update(
                    where:{id: idUser},
                    data:{nome: novaInfo}
                )
                return res.status(200).json("Nome atualizado com sucesso")
            )catch(erro){
               return res.status(404).json({
                    erro: "Erro ao atualizar nome"
                })
            }
        }
        else if(novaInfo == 'senha'){
             try{   await prisma.usuario.update(
                    where:{id: idUser},
                    data:{senha: senhaUser}
                )
                return res.status(200).json("Senha atualizada com sucesso")

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
                return res.status(404).json({"Email indisponivel, tente novamente!"})
            }
            else if(!emailExist){
                try{
                    const usuario = await prisma.usuario.update({
                     where:{id:idUser},
                    data:{email : emailUser}
                    })
                    return res.status(200).json({"Email atualizado com sucesso"})
                }
            }
        }
    }else{
      return res.status(404).json(
            mensagem: "Erro, preencha os campos corretamente."
        )
    }
})

app.delete('usuario/:id', async (req,res) =>{
    const idUser = req.params.id
    try{
     await prisma.usuario.delete(
        { where:{id: idUser}}
     ) res.redirect("login.html")
    }catch{
        return res.status(404).json("Erro ao excluir usúario")
    }
})
//================================================
//         ROTAS DE PRODUTO
//================================================
app.post('/produto', async (req,res) =>{
    const {nomeProd, precoProd, categoriaProd, quantProd, valProd} = req.body
    if(nomeProd && categoriaProd && quantProd && valProd){
       await prisma.produto.create(
            data:{
                nome: nomeProd,
                preco: precoProd,
                categoria: categoriaProd,
                quant: quantProd,
                val: valProd
            }
        ) return res.status(200).json("Produto adicionado com sucesso")
    }catch(erro){
       return  res.status(404).json("Erro ao cadastrar produto")
    }
       
    
})
app.get('produto', async (req,res)=>{
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
app.listen(port, =>{
    console.log(`Servidor rodando: http://locallhost${port}`)
})