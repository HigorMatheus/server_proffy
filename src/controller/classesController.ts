import { Request, Response} from 'express'
import DB from '../database/database'
import converterHoursTuMinutes from '../utils/converteHourTuMinutes'


interface ScheduleItem{
    week_day: Number, 
    from: string,
    to: string,
}
export const classesController = {
    async index(request:Request,response: Response){
        const filteres = request.query

        const subject = filteres.subject as string
        const week_day = filteres.week_day as string
        const time = filteres.time as string
        if (!filteres.week_day || !filteres.subject || !filteres.time) {
            return response.status(400).json({
                error:'Missing filteres to search classes'
            })
        }

        const timeInMinutes = converterHoursTuMinutes(time)
        
        const classes = await DB('classes')
            .whereExists(function(){
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])
            })
            .where('classes.subject', '=', subject)
            .join('users','classes.user_id', '=', 'users.id')
            .select(['classes.*','users.*'])
        return response.json(classes)
    },

    async create(request:Request,response: Response){
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = request.body
    
        const trx = DB.transaction()
        try {
          
    
            const insertUsersIds = await  (await trx)('users').insert({
                name,
                avatar,
                whatsapp,
                bio
            })
                const user_id = insertUsersIds[0];
            const insertClassesIds= await (await trx)('classes').insert({
                subject,
                cost,
                user_id
            })
    
            const class_id = insertClassesIds[0];
    
            const classSchedule = schedule.map(( scheduleitem:ScheduleItem)=>{
                return {
                week_day: scheduleitem.week_day,
                from: converterHoursTuMinutes(scheduleitem.from),
                to: converterHoursTuMinutes(scheduleitem.to),
                class_id
                }
            })
    
            await (await trx)('class_schedule').insert(classSchedule)
        
            await (await trx).commit()
            return response.status(201).send()
        } catch (error) {
            await (await trx).rollback()
            return response.status(400).json({
                mensage:"erro ao criar a class"
            })
        }
    }
}