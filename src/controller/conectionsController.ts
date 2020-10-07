import {Request, Response} from 'express'
import DB from '../database/database';

export const conectionController={
    async index(request:Request,response: Response){
        const totalConnections = await DB('connections').count('* as total')

        const {total} = totalConnections[0]
        return response.json({total})
    },
    async create(request:Request,response: Response){
        const { user_id }= request.body;
        await DB('connections').insert({
            user_id
        })

        return response.status(201).send()
    }
}