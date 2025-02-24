import { FileUpload } from "@/components/file-upload"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function EmployeeDataSection({ form, files, onFilesChange }) {
    return (
        <>
            <FileUpload
                maxFiles={1}
                maxSize={10 * 1024 * 1024}
                value={files}
                onChange={onFilesChange}
            />
            <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <FormControl>
                            <Input 
                            type="date" 
                            placeholder="Fecha de nacimiento del empleado" 
                            {...field} 
                            value={field.value?.split('T')[0] ?? ""}
                            />
                        </FormControl>
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
        </>
    )
}
