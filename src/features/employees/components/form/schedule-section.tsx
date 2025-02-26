import { AnimatePresence, motion } from "framer-motion"
import { Calendar, Clock, PlusCircle, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { minutesToTimeString, timeStringToMinutes } from "../../utils/mappers"

const diasSemana = {
    MONDAY: "Lunes",
    TUESDAY: "Martes",
    WEDNESDAY: "Miércoles",
    THURSDAY: "Jueves",
    FRIDAY: "Viernes",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
}

export function ScheduleSection({ form }) {
    const allDays = useMemo(() => Object.keys(diasSemana), [])

    const [activeDays, setActiveDays] = useState(() => {
        const schedule = form.getValues("schedule")
        return allDays.filter((day) => schedule[day]?.startAt !== undefined)
    })

    const availableDays = allDays.filter((day) => !activeDays.includes(day))

    const handleAddDay = (selectedDay) => {
        setActiveDays([...activeDays, selectedDay])
        form.setValue(`schedule.${selectedDay}`, { startAt: 480, endAt: 1020 })
    }

    const handleRemoveDay = (dayToRemove) => {
        setActiveDays(activeDays.filter((day) => day !== dayToRemove))
        form.setValue(`schedule.${dayToRemove}`, undefined)
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div>
                                <Select onValueChange={handleAddDay} disabled={availableDays.length === 0}>
                                    <SelectTrigger className="w-[180px]">
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Agregar día
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableDays.map((day) => (
                                            <SelectItem key={day} value={day}>
                                                {diasSemana[day]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            {availableDays.length === 0
                                ? "Todos los días han sido agregados"
                                : "Seleccione un día para agregar horario"}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="px-2">
                {activeDays.length === 0 ? (
                    <Alert>
                        <Calendar className="h-4 w-4" />
                        <AlertDescription>No hay días configurados. Agregue días para establecer horarios.</AlertDescription>
                    </Alert>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence>
                            {activeDays.map((day) => (
                                <motion.div
                                    key={day}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="secondary" className="text-sm">
                                                    {diasSemana[day]}
                                                </Badge>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveDay(day)}
                                                                className="text-destructive hover:text-destructive/90 -mr-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Eliminar horario</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name={`schedule.${day}.startAt`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4" />
                                                                Hora de inicio
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="time"
                                                                    value={minutesToTimeString(field.value)}
                                                                    onChange={(e) => {
                                                                        const minutes = timeStringToMinutes(e.target.value)
                                                                        form.setValue(`schedule.${day}.startAt`, minutes)
                                                                    }}
                                                                    className="[&::-webkit-calendar-picker-indicator]:hidden"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`schedule.${day}.endAt`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2">
                                                                <Clock className="w-4 h-4" />
                                                                Hora de fin
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="time"
                                                                    value={minutesToTimeString(field.value)}
                                                                    onChange={(e) => {
                                                                        const minutes = timeStringToMinutes(e.target.value)
                                                                        form.setValue(`schedule.${day}.endAt`, minutes)
                                                                    }}
                                                                    className="[&::-webkit-calendar-picker-indicator]:hidden"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
} 