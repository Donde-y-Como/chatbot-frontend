import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Mail, MapPin, Clock, User, Briefcase } from "lucide-react";
import { Employee } from "../types";

interface EmployeeViewDialogProps {
  currentEmployee?: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeViewDialog({ currentEmployee, open, onOpenChange }: EmployeeViewDialogProps) {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getInitials = (name?: string): string => {
    if (!name) return "EM";
    return name
      .split(" ")
      .map(part => part?.[0] || '')
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatScheduleTime = (time: number): string => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const weekdays = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo"
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">Detalles del Empleado</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Información completa del empleado seleccionado.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 w-full pr-4">
          <div className="min-h-full flex flex-col p-2">
            {!currentEmployee ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No hay información disponible</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Employee Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                  <Avatar className="h-20 w-20" style={{ backgroundColor: currentEmployee.color || '#CBD5E1' }}>
                    <AvatarImage src={currentEmployee.photo || ""} alt={currentEmployee.name} />
                    <AvatarFallback className="text-lg">{getInitials(currentEmployee.name)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 text-center md:text-left">
                    <h2 className="text-xl font-semibold">{currentEmployee.name}</h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {currentEmployee.role || "Sin Rol"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Personal Information */}
                <div>
                  <div className="pb-3">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                      <User className="h-4 w-4 text-primary" />
                      Información Personal
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Nombre:</span>
                        <span className="text-sm font-medium">{currentEmployee.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Correo:</span>
                        <span className="text-sm font-medium">{currentEmployee.email || "-"}</span>
                      </div>
                      {currentEmployee.birthDate && (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Fecha de nacimiento:</span>
                          <span className="text-sm font-medium">{formatDate(currentEmployee.birthDate)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Fecha de creación:</span>
                        <span className="text-sm font-medium">{formatDate(currentEmployee.createdAt)}</span>
                      </div>
                    </div>
                    {currentEmployee.address && (
                      <div className="flex items-start gap-2 mt-3">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="text-sm text-muted-foreground">Dirección:</span>
                          <span className="text-sm font-medium ml-1">{currentEmployee.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Employment Details */}
                <div>
                  <div className="pb-3">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Detalles de Empleo
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Rol:</span>
                      <span className="text-sm font-medium">{currentEmployee.role || "-"}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Schedule */}
                <div>
                  <div className="pb-3">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                      <Clock className="h-4 w-4 text-primary" />
                      Horario de Trabajo
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {Object.keys(currentEmployee.schedule).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay información de horario disponible</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(currentEmployee.schedule).map(([day, timeRange]) => (
                          <div key={day} className="flex items-center justify-between py-1 border-b border-border/50 last:border-0">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium">{weekdays[day.toLowerCase() as keyof typeof weekdays] || day}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatScheduleTime(timeRange.startAt)} - {formatScheduleTime(timeRange.endAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}