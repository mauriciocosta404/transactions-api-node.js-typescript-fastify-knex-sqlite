import {describe, expect, test, beforeAll, afterAll, it} from "vitest";
import { app } from "../app";
import request from "supertest";

describe("Transactions routes", ()=>{
    beforeAll(async () => {
        await app.ready()    
    });
    
    afterAll(async () => {
        app.close();
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
});
