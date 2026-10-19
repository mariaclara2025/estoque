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

const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const Database = require('better-sqlite3')

// Conecta ao arquivo do banco SQLite
const sqlite = new Database('prisma/dev.db')

// Instancia o adaptador com a classe correta (PrismaBetterSqlite3)
const adapter = new PrismaBetterSqlite3(sqlite)
const prisma = new PrismaClient({ adapter })

module.exports = prisma