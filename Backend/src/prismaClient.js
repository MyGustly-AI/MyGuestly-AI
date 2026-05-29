import { PrismaClient } from '../src/generated/prisma'
import env from './config/env.js'

const globalForPrisma = globalThis

const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        errorFormat: env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
    })

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma