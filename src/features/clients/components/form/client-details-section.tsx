import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

export function ClientDetailsSection({ form, files, onFilesChange }) {
    return (
        <div className="flex flex-col space-y-4">
            <div className="mb-4">
                <FileUpload
                    maxFiles={1}
                    maxSize={10 * 1024 * 1024}
                    value={files}
                    onChange={onFilesChange}
                />
            </div>
            <FormField
                control={form.control}
                name="birthdate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Fecha de nacimiento</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-[240px] pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                    >
                                        {field.value ? (
                                            format(field.value, "PPP", { locale: es })
                                        ) : (
                                            <span>Selecciona una fecha</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={new Date(field.value)}
                                    onSelect={(date) => field.onChange(date?.toISOString())}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                    locale={es}
                                />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                            <Input placeholder="Dirección del empleado" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}
