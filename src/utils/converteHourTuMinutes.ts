export default function converterHoursTuMinutes(time:string) {
   const [ hour, minutes] = time.split(':').map(Number);
   const timeInMinutes = (hour*60)+ minutes
   return timeInMinutes
}