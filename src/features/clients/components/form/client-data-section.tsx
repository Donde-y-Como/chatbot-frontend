import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { TagApiService } from "../../TagApiService";
import { CreateClientForm, PlatformIdentity, PlatformName, Tag } from "../../types";

const createTagSchema = z.object({
  name: z.string().min(1, { message: "El nombre de la etiqueta es obligatorio" }),
});

type CreateTagForm = z.infer<typeof createTagSchema>;

export function ClientDataSection({ form, tags = [] }: { form: UseFormReturn<CreateClientForm>, tags: Tag[] }) {
  const { control, getValues, setValue, watch } = form;
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const queryClient = useQueryClient();

  const tagForm = useForm<CreateTagForm>({
    resolver: zodResolver(createTagSchema),
    defaultValues: { name: "" },
  });

  const createTagMutation = useMutation({
    mutationKey: ["create-tag"],
    mutationFn: async (values: CreateTagForm) => {
      await TagApiService.create(values);
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["tags"] });
      setIsAddingTag(false);
      tagForm.reset();
      toast.success("Etiqueta creada correctamente");
    },
  });

  const platformIdentities: PlatformIdentity[] = watch("platformIdentities") || [];

  const addWhatsAppIdentity = () => {
    if (!whatsappNumber || !getValues("name")) return;

    const currentIdentities = getValues("platformIdentities") || [];
    const alreadyExists = currentIdentities.some(
      (identity: PlatformIdentity) =>
        identity.platformId === whatsappNumber &&
        identity.platformName === PlatformName.Whatsapp
    );
    if (alreadyExists) return;

    setValue("platformIdentities", [
      ...currentIdentities,
      {
        platformId: whatsappNumber,
        platformName: PlatformName.Whatsapp,
        profileName: getValues("name"),
      },
    ]);
    setWhatsappNumber("");
  };

  const removePlatformIdentity = (index: number) => {
    const currentIdentities = getValues("platformIdentities") || [];
    setValue(
      "platformIdentities",
      currentIdentities.filter((_: PlatformIdentity, i: number) => i !== index)
    );
  };

  // Handle tag creation form submission
  const onCreateTag = tagForm.handleSubmit((data) => {
    createTagMutation.mutate(data);
  });

  return (
    <div className="space-y-6">
      {/* Client Name Field */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre completo</FormLabel>
            <FormControl>
              <Input placeholder="Nombre del cliente" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Tags Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <FormLabel>Etiquetas</FormLabel>
          <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsAddingTag(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Nueva etiqueta</span>
            </Button>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Crear nueva etiqueta</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreateTag} className="space-y-4">
                <FormField
                  control={tagForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la etiqueta</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingrese el nombre de la etiqueta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createTagMutation.isPending}>
                    {createTagMutation.isPending ? "Creando..." : "Crear etiqueta"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {tags.length === 0 ? (
                <p className="text-sm text-muted-foreground col-span-full">
                  No hay etiquetas disponibles
                </p>
              ) : (
                tags.map((tag: Tag) => (
                  <FormField
                    key={tag.id}
                    control={control}
                    name="tagIds"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-3">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(tag.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value || []), tag.id]);
                              } else {
                                field.onChange(
                                  field.value?.filter((value: string) => value !== tag.id)
                                );
                              }
                            }}
                            id={`tag-${tag.id}`}
                          />
                        </FormControl>
                        <FormLabel
                          htmlFor={`tag-${tag.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {tag.name}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* WhatsApp Section */}
      <div className="space-y-3">
        <FormLabel>WhatsApp</FormLabel>
        <div className="flex space-x-2">
          <Input
            type="tel"
            placeholder="Número de WhatsApp"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="flex-grow"
          />
        </div>
        {platformIdentities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {platformIdentities.map((identity: PlatformIdentity, index: number) => {
              if (identity.platformName === PlatformName.Whatsapp) {
                return (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2 p-2">
                    <span>WhatsApp: {identity.platformId}</span>
                    <button
                      type="button"
                      className="focus:outline-none text-gray-500 hover:text-gray-700"
                      onClick={() => removePlatformIdentity(index)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Badge>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
