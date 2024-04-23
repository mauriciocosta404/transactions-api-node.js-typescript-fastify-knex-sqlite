import { FastifyInstance } from "fastify";
import { knex } from "../database";
import {z} from "zod";
import {randomUUID} from "node:crypto"; 
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function transactionsRoutes(app: FastifyInstance){
    app.get('/' ,{ preHandler:[checkSessionIdExists]}, async (request, reply) => {
        const sessionId = request.cookies.sessionId;

        const transactions = await knex('transactions').select().where('session_id', sessionId);

        return {transactions}
    })

    app.get('/summary', {preHandler: [checkSessionIdExists]} , async (request, reply) => {
        const sessionId = request.cookies.sessionId;

        const summary = await knex('transactions').sum('amount', {as : 'amount'}).where('session_id', sessionId).first();

        return {summary};
    })

    app.get('/:id', {preHandler: [checkSessionIdExists]} , async (request) => {
        const sessionId = request.cookies.sessionId;

        const getTransactionParamsSchema = z.object({
            id: z.string().uuid(),
        });

        const {id} = getTransactionParamsSchema.parse(request.params);

        const transaction = await knex('transactions').where('id',id).andWhere('session_id', sessionId).first();

        return {transaction}
    })
    
    app.post('/', async (request, reply) => {
       
        const createTransactionsBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit','debit']),
        }); 

       const {title, amount, type} = createTransactionsBodySchema.parse(request.body);

       let sessionId = request.cookies.sessionId;
       
       if(!sessionId){
            sessionId = randomUUID();

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 dias
            });
       }
    
        await knex('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount: amount*-1,
            session_id: sessionId,
        });

       return reply.status(201).send("created");
    });
}