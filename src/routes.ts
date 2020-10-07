import {Router, Request, Response} from 'express'
import { classesController } from './controller/classesController'
import { conectionController } from './controller/conectionsController'


const routes = Router()


routes.get('/classes', classesController.index)
routes.post('/classes', classesController.create)

routes.get('/connections', conectionController.index)
routes.post('/connections', conectionController.create)

export default routes