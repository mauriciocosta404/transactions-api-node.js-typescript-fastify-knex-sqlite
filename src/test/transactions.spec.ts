import {describe, expect, beforeAll, afterAll, it, beforeEach} from "vitest";
import { app } from "../app";
import request from "supertest";
import { execSync } from "node:child_process";

describe("Transactions routes", ()=>{
    beforeAll(async () => {
        await app.ready()    
    });
    
    afterAll(async () => {
        app.close();
    });

    beforeEach(async () => {
        execSync("npx knex migrate:rollback --all");
        execSync("npx knex migrate:latest");
    });

    it('it user should create new transaction', async () => {
        const response = await request(app.server).post('/transactions').send({
            "title":"new transaction",
            "amount":5000,
            "type": "credit"
          });
    
    
        expect(response.statusCode).toEqual(201);
    })

    it('should be able to list all transactions', async () => {
        const createTRansacrionsResponse = await request(app.server).post('/transactions').send({
            "title":"new transaction",
            "amount":5000,
            "type": "credit"
          });

          const cookies = createTRansacrionsResponse.get('Set-Cookie');

          const listTransactionsResponse = await request(app.server).get("/transactions").set('Cookie', cookies).expect(200);

          expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                "title":"new transaction",
                "amount":5000
            })
          ]);
        });

        it('should be able to get a specific transaction', async () => {
            const createTRansacrionsResponse = await request(app.server).post('/transactions').send({
                "title":"new transaction",
                "amount":5000,
                "type": "credit"
              });
    
              const cookies = createTRansacrionsResponse.get('Set-Cookie');
    
              const listTransactionsResponse = await request(app.server).get("/transactions").set('Cookie', cookies);
    
              const transactionId = listTransactionsResponse.body.transactions[0].id;

              const getTransactionsResponse = await request(app.server).get(`/transactions/${transactionId}`).set('Cookie', cookies);

              expect(getTransactionsResponse.body.title,"new transaction");
            });
});
