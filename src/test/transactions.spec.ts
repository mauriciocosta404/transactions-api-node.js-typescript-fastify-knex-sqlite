import {describe, expect, test, beforeAll, afterAll} from "vitest";
import { app } from "../app";
import request from "supertest";

beforeAll(async()=>{
    await app.ready()    
});

afterAll(async()=>{
    app.close();
})

test('user should create new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
        "title":"new transaction",
        "amount":5000,
        "type": "credit"
      });


    expect(response.statusCode).toEqual(201);
})