//  require("dotenv").config()
//  import'dotenv/config';
// const { PrismaClient } = require("@prisma/client")
// const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3")
// // import'dotenv/config';
// // import { PrismaClient } from "@prisma/client";
// // import {PrismaBetterSqlite3} from '@prisma/adapter-better-sqlite3';
// const adapter = new PrismaClient({
//     url: process.env.DATABASE_URL
// })
// const prisma = new PrismaBetterSqlite3({
//     adapter
// })

// module.exports = prisma
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const Database = require('better-sqlite3')

// Conecta ao arquivo do banco SQLite
const sqlite = new Database('prisma/dev.db')

// Instancia o adaptador com a classe correta (PrismaBetterSqlite3)
const adapter = new PrismaBetterSqlite3({
    url:process.env.DATABASE_URL ?? "file:./prisma/dev.db"
})
const prisma = new PrismaClient({ adapter })

module.exports = prisma