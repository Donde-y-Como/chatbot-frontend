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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Mail, MapPin, Clock, User } from "lucide-react";
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
      <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] p-0 overflow-hidden rounded-2xl shadow-xl">
        <div className="flex flex-col h-full max-h-[90vh]">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-2xl font-bold">Detalles del Empleado</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Información completa del empleado seleccionado.
            </DialogDescription>
          </DialogHeader>
          <Separator className="my-4" />

          <ScrollArea className="flex-1 overflow-y-auto px-6 pb-6">
            {!currentEmployee ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No hay información disponible</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <Avatar className="h-28 w-28" style={{ backgroundColor: currentEmployee.color || '#CBD5E1' }}>
                    <AvatarImage src={currentEmployee.photo || ""} alt={currentEmployee.name} />
                    <AvatarFallback className="text-lg">{getInitials(currentEmployee.name)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2 text-center md:text-left">
                    <h2 className="text-2xl font-semibold">{currentEmployee.name}</h2>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2">
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        {currentEmployee.role || "Sin Rol"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <Card className="border-muted">
                  <CardContent className="p-6 grid gap-4">
                    <h3 className="text-lg font-semibold">Información Personal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Nombre:</span>
                        <span className="text-sm font-medium">{currentEmployee.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Correo:</span>
                        <span className="text-sm font-medium">{currentEmployee.email || "-"}</span>
                      </div>
                      {currentEmployee.birthDate && (
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Fecha de nacimiento:</span>
                          <span className="text-sm font-medium">{formatDate(currentEmployee.birthDate)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Fecha de creación:</span>
                        <span className="text-sm font-medium">{formatDate(currentEmployee.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {currentEmployee.address && (
                  <Card className="border-muted">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-2">Dirección</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <span className="text-sm font-medium">{currentEmployee.address}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-muted">
                  <CardContent className="p-6 grid gap-4">
                    <h3 className="text-lg font-semibold">Detalles de Empleo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                      <div>
                        <span className="text-sm text-muted-foreground block">Rol</span>
                        <span className="text-sm font-medium">{currentEmployee.role || "-"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-muted">
                  <CardContent className="p-6 grid gap-4">
                    <h3 className="text-lg font-semibold">Horario</h3>
                    {Object.keys(currentEmployee.schedule).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay información de horario disponible</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {Object.entries(currentEmployee.schedule).map(([day, timeRange]) => (
                          <div key={day} className="flex items-center justify-between border-b pb-2 last:border-0">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{weekdays[day.toLowerCase() as keyof typeof weekdays] || day}</span>
                            </div>
                            <div className="text-sm">
                              {formatScheduleTime(timeRange.startAt)} - {formatScheduleTime(timeRange.endAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}