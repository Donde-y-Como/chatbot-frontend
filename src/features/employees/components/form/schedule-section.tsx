import { AnimatePresence, motion } from "framer-motion"
import { Calendar, Clock, PlusCircle, Trash2 } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
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

    // Watch for schedule changes and update active days accordingly
    const scheduleValue = form.watch("schedule")
    
    // Update activeDays when schedule changes (e.g., when pre-filled with user schedule)
    useEffect(() => {
        if (scheduleValue) {
            const newActiveDays = allDays.filter((day) => scheduleValue[day]?.startAt !== undefined)
            if (JSON.stringify(newActiveDays) !== JSON.stringify(activeDays)) {
                setActiveDays(newActiveDays)
            }
        }
    }, [scheduleValue, allDays, activeDays])

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
        <div className="flex flex-col flex-1">
            {/* Schedule Configuration Section */}
            <div className="flex-1">
                <div className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="flex items-center gap-2 text-base font-semibold">
                                <Clock className="h-4 w-4 text-primary" />
                                Horario de Trabajo
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Configure los días y horarios de trabajo del empleado
                            </p>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Select onValueChange={handleAddDay} disabled={availableDays.length === 0}>
                                            <SelectTrigger className="w-[140px] h-8">
                                                <PlusCircle className="w-3.5 h-3.5 mr-2" />
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
                </div>
                <div className="space-y-3">

                    {activeDays.length === 0 ? (
                        <Alert className="py-3">
                            <Calendar className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                No hay días configurados. Agregue días para establecer horarios de trabajo.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <AnimatePresence>
                                {activeDays.map((day) => (
                                    <motion.div
                                        key={day}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="border border-border/50">
                                            <CardHeader className="pb-2 pt-3">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
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
                                                                    className="text-destructive hover:text-destructive/90 -mr-2 h-6 w-6 p-0"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Eliminar horario</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3 pb-3">
                                                <FormField
                                                    control={form.control}
                                                    name={`schedule.${day}.startAt`}
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-1">
                                                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                                                                <Clock className="w-3 h-3" />
                                                                Inicio
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="time"
                                                                    value={minutesToTimeString(field.value)}
                                                                    onChange={(e) => {
                                                                        const minutes = timeStringToMinutes(e.target.value)
                                                                        form.setValue(`schedule.${day}.startAt`, minutes)
                                                                    }}
                                                                    className="h-8 text-xs [&::-webkit-calendar-picker-indicator]:hidden"
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
                                                        <FormItem className="space-y-1">
                                                            <FormLabel className="text-xs font-medium flex items-center gap-1.5">
                                                                <Clock className="w-3 h-3" />
                                                                Fin
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="time"
                                                                    value={minutesToTimeString(field.value)}
                                                                    onChange={(e) => {
                                                                        const minutes = timeStringToMinutes(e.target.value)
                                                                        form.setValue(`schedule.${day}.endAt`, minutes)
                                                                    }}
                                                                    className="h-8 text-xs [&::-webkit-calendar-picker-indicator]:hidden"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}